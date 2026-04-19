# Architecture

This document explains how all pieces of agentic-starter fit together and why each decision was made.

---

## The core problem

LLM systems fail in two predictable ways:

**Hallucination** — the model answers confidently without querying real data. It fills gaps with plausible-sounding invention.

**Token waste** — the model receives context it doesn't need. Every irrelevant token dilutes attention and increases cost.

Every architectural decision in this template targets one of these two problems explicitly.

---

## System overview

```
User question
      │
      ▼
  validated_invoke()          ← entry point — never call agent.invoke() directly
      │
      ▼
  AgentTracer (context)       ← starts recording
      │
      ▼
  agent.invoke()              ← LangChain ReAct loop
      │
      ├─ Thought: which tool?
      ├─ Action: tool called   → tracer.record_tool_call()
      ├─ Observation: result
      └─ (loop until answer)
      │
      ▼
  Semantic validators         ← ConfidenceValidator, SourceValidator, ToolRoutingValidator
      │
      ├─ Pass → return (QueryOutput, AgentTrace)
      └─ Fail → retry with backoff (up to max_retries)
                    │
                    └─ All retries exhausted → GuardrailError raised
```

---

## Layer by layer

### Layer 1 — Context management (`.claude/`)

The `.claude/` directory is what makes Claude Code understand your project without you re-explaining it every session.

**`CLAUDE.md`** — always-on context. Kept under 100 lines intentionally. Contains: project description, architecture, mandatory rules, SDD phases, available skills and agents. Bloated CLAUDE.md causes the model to ignore rules buried deep — every line must earn its place.

**`skills/`** — on-demand context. Each skill is a folder with a `SKILL.md` that Claude loads only when relevant. A `pydantic` skill doesn't consume context during a SQL task. This is the primary mechanism for token optimization.

**`agents/`** — specialized subagents with isolated context windows. Three core agents: `codebase-explorer` (understands project state), `test-writer` (writes tests only, no implementation context), `implementer` (implements only, no test rationale context). Isolation prevents the most common TDD failure mode: the model writing tests that pass because it knows the implementation.

**`settings.json`** — deterministic hooks. Two hooks run outside the agent's advisory loop: `PostToolUse` runs ruff after every file edit, `Stop` runs pytest when Claude finishes a task. These are guarantees, not suggestions.

---

### Layer 2 — Data contracts (`src/.../models.py`)

Pydantic models are the contract layer between every component. No raw dicts circulate between layers.

```python
class QueryOutput(BaseModel):
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    sources: list[str] = Field(default_factory=list)
```

`confidence` and `sources` are not cosmetic fields — they are inputs to the guardrail layer. If the model returns `confidence=0.3` or `sources=[]`, the validator catches it before the response reaches the user.

---

### Layer 3 — Guardrails (`src/.../guardrails/`)

Two files, one purpose: reject bad responses before they reach the user.

**`validators.py`** — semantic validators that go beyond schema checking:

| Validator | What it checks |
|-----------|---------------|
| `ConfidenceValidator` | Rejects responses with confidence below threshold (default: 0.7) |
| `SourceValidator` | Rejects responses where no tool was called — model answered from memory |
| `ToolRoutingValidator` | Rejects responses where the wrong tool was used for the question type |

**`retry.py`** — `validated_invoke()` wraps agent calls with the full validation loop:

```python
result = validated_invoke(
    agent=agent,
    question=question,
    validators=[ConfidenceValidator(0.7), SourceValidator()],
    max_retries=3,
)
```

On validation failure, it retries with exponential backoff (1.5s → 2.25s → 3.375s). After max retries, raises `GuardrailError` with the reason.

**Rule:** Never call `agent.invoke()` directly. Always use `validated_invoke()`.

---

### Layer 4 — Observability (`src/.../observability/`)

`AgentTracer` is a context manager that wraps every agent invocation and produces a structured trace.

```python
with AgentTracer(question=question) as tracer:
    result = agent.invoke({"messages": [("user", question)]})
    tracer.set_output(result)

trace = tracer.trace
# trace.tools_called    → ["execute_sql"]
# trace.total_steps     → 2
# trace.latency_ms      → 1240.5
# trace.hallucinated    → False
```

**Hallucination detection:** if the agent produced an answer but called no tools, `hallucinated` is set to `True` automatically and a warning is logged. This catches the most common hallucination pattern before the guardrail layer even runs.

---

### Layer 5 — Behavioral evals (`evals/`)

Unit tests verify code is correct. Evals verify the agent is intelligent.

```
evals/
├── datasets/
│   └── agent_behavior.json   ← ground truth: expected tools, routing, confidence
└── test_agent_behavior.py    ← tests that consume the dataset
```

Two test markers separate CI-safe tests from real API calls:

- `@pytest.mark.fast` — uses mocks, runs in CI, costs no tokens
- `@pytest.mark.llm` — calls real API, run locally before release

The separation matters: running real LLM tests on every PR is expensive and slow. But running them before every release catches prompt regressions that mocks can't detect.

---

### Layer 6 — SDD methodology (`spec/` + `.claude/skills/`)

Spec-Driven Development prevents the most common failure mode in LLM-assisted development: building the wrong thing confidently.

Five phases with explicit gates:

1. `/brainstorm` — mental model before any spec (gate: describe end-to-end in 3 sentences)
2. `/define` — requirements with Clarity Score ≥ 12/15 (gate: score threshold)
3. `/design` — file manifest reviewed (gate: manifest complete)
4. `/build` — TDD via isolated subagents (gate: 100% tests passing)
5. `/ship` — verify + archive lessons (gate: all checks green)

No phase produces code. Phases 1-3 produce specs. Phase 4 produces code guided by the spec. Phase 5 produces verified code and institutional memory.

---

## Token optimization — how it works in practice

| Mechanism | Tokens saved |
|-----------|-------------|
| Skills load on-demand | A 150-line skill not loaded = ~150 tokens saved per turn |
| CLAUDE.md ≤ 100 lines | vs. common 500+ line configs = ~400 tokens saved per turn |
| Subagent isolation | Each subagent starts with clean context = no history accumulation |
| Compaction instructions | Preserves signal, discards noise during auto-compression |
| Short docstrings with keywords | Faster routing decision = fewer ReAct cycles |

The cumulative effect is significant in long sessions. A project with 20 skills loaded all the time vs. 3 loaded on-demand is a 17-skill difference in context per turn.

---

## Hallucination reduction — how it works in practice

| Mechanism | Hallucination type caught |
|-----------|--------------------------|
| `SourceValidator` | Model answered without querying any data source |
| `ConfidenceValidator` | Model expressed uncertainty in its output |
| `ToolRoutingValidator` | Model used the wrong tool for the question type |
| `AgentTracer.hallucinated` | Model produced answer with zero tool calls |
| Retry loop | Transient failures that would otherwise produce bad responses |
| Pydantic structured outputs | Model invented a field value outside allowed constraints |

No single mechanism catches everything. The defense is layered — each mechanism catches a different failure mode.

---

## The `.templates/` directory

Optional modules live in `.templates/` and are never deleted. Bootstrap copies them into the project when the corresponding flag is used.

This means:
- Re-running bootstrap is always safe
- The template repo always contains the full implementation of every module
- Contributors can work on `--with-frontend` without it affecting users who don't use it

---

## What this is not

- **Not an agent framework** — it uses LangChain/LangGraph, not a replacement
- **Not a CLI tool** — it's a GitHub template you clone once per project
- **Not opinionated about your domain** — guardrails, observability and SDD work for any data or text problem
- **Not complete** — `--with-frontend` and `--with-multi-agent` are v0.2
