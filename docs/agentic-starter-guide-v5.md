# agentic-starter

> Open source GitHub template for AI-powered projects with Claude Code.
> Focused on **reducing hallucination and optimizing token usage** through
> structured outputs, guardrails, observability, and SDD methodology.

**Repository:** `github.com/Juniordell/agentic-starter`
**License:** MIT

---

## What this template provides

A production-ready foundation for AI projects where **precision matters**.
Every design decision targets the two hardest problems in LLM systems:
hallucination and token waste.

### Core (always included)
- `CLAUDE.md` — agent context, rules, architecture (≤ 100 lines)
- `.claude/skills/` — domain knowledge loaded on demand, not always-on
- `.claude/agents/` — specialized subagents for TDD isolation
- `.claude/settings.json` — hooks for automatic lint and test
- `spec/` — SDD 5-phase templates
- `tasks/lessons.md` — self-improvement loop between sessions
- `src/observability/` — agent trace, step logging, latency tracking
- `src/guardrails/` — semantic validation + automatic retry with backoff
- `evals/` — behavioral tests for agent intelligence, not just code
- `tests/` — pytest setup with fixtures
- `.github/workflows/ci.yml` — CI that blocks broken AI commits
- `bootstrap.py` — project initialization with optional flags
- `pyproject.toml` — uv-compatible, major-version pinned
- `uv.lock` — generated on bootstrap, reproducible installs
- `.env.example`, `.gitignore`, `README.md`, `CONTRIBUTING.md`

### Optional modules (via bootstrap flags)
| Flag | Status | Adds |
|------|--------|------|
| `--with-vector-db` | ✅ Stable | Qdrant + Postgres + dual-store skills + docker-compose |
| `--with-frontend` | 🚧 v0.2 | Next.js + API route + TypeScript |
| `--with-multi-agent` | 🚧 v0.2 | CrewAI + LangFuse observability |

---

## Design Philosophy

### Reducing hallucination
The model hallucinates when the decision space is too large.
This template reduces it through three mechanisms:

1. **Structured outputs everywhere** — Pydantic validates every agent response.
   If the model invents a field value, validation fails and retry triggers.
2. **Semantic guardrails** — beyond schema validation, the guardrail layer
   checks if the model actually queried a data source before claiming a result.
3. **Explicit tool routing** — docstrings define exactly when each tool should
   be called. Ambiguity in docstrings = routing errors = hallucination.

### Optimizing token usage
Every token costs. This template cuts waste through:

1. **Skills over CLAUDE.md** — domain knowledge loads only when relevant.
   A pydantic skill doesn't consume context during a SQL task.
2. **Short CLAUDE.md** — ≤ 100 lines. Bloated CLAUDE.md causes the model
   to ignore rules buried deep in context.
3. **Subagent isolation** — each subagent gets a clean, focused context window
   instead of inheriting the full conversation history.
4. **Compaction-aware CLAUDE.md** — includes a compact instruction so Claude
   preserves the right information when auto-compressing long sessions.

---

## Usage (end user)

```bash
# Clone the template
git clone https://github.com/Juniordell/agentic-starter my-project
cd my-project

# Minimal — Python + SDD + Guardrails + Observability
python bootstrap.py --name "My Project" --author "Your Name"

# With vector database (Qdrant + Postgres) — recommended
python bootstrap.py --name "My Project" --author "Your Name" --with-vector-db

# Then
cp .env.example .env   # fill in your API keys
uv run pytest          # all base tests should pass
claude                 # open Claude Code
/brainstorm            # start Phase 1 of SDD
```

---

## Repository Structure

```
agentic-starter/
│
├── .github/
│   └── workflows/
│       └── ci.yml                       ← blocks broken commits
│
├── .claude/
│   ├── CLAUDE.md
│   ├── settings.json
│   ├── settings.local.json.example
│   ├── skills/
│   │   ├── pydantic/SKILL.md
│   │   ├── langchain/SKILL.md
│   │   ├── python/SKILL.md
│   │   ├── tdd/SKILL.md
│   │   ├── observability/SKILL.md       ← new
│   │   ├── guardrails/SKILL.md          ← new
│   │   ├── brainstorm/SKILL.md
│   │   ├── define/SKILL.md
│   │   ├── design/SKILL.md
│   │   ├── build/SKILL.md
│   │   └── ship/SKILL.md
│   └── agents/
│       ├── codebase-explorer.md
│       ├── test-writer.md
│       └── implementer.md
│
├── .templates/                          ← optional module sources (never deleted)
│   ├── vector-db/
│   │   ├── skills/qdrant/SKILL.md
│   │   ├── skills/postgres/SKILL.md
│   │   ├── src/tools.py
│   │   ├── src/agent.py
│   │   ├── tests/test_tools.py
│   │   └── docker-compose.yml
│   ├── frontend/                        ← v0.2
│   └── multi-agent/                     ← v0.2
│
├── spec/
│   ├── 01-brainstorm.md
│   ├── 02-define.md
│   ├── 03-design.md
│   ├── 04-build.md
│   └── 05-ship.md
│
├── tasks/
│   └── lessons.md
│
├── src/
│   └── project_name/
│       ├── __init__.py
│       ├── models.py
│       ├── config.py
│       ├── observability/               ← new
│       │   ├── __init__.py
│       │   └── tracer.py
│       └── guardrails/                  ← new
│           ├── __init__.py
│           ├── validators.py
│           └── retry.py
│
├── evals/                               ← new
│   ├── __init__.py
│   ├── datasets/
│   │   └── agent_behavior.json
│   └── test_agent_behavior.py
│
├── tests/
│   ├── conftest.py
│   ├── test_models.py
│   ├── test_guardrails.py               ← new
│   └── test_observability.py            ← new
│
├── bootstrap.py
├── pyproject.toml
├── uv.lock                              ← generated by bootstrap
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## File: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v4
        with:
          version: "latest"

      - name: Set up Python
        run: uv python install 3.11

      - name: Install dependencies
        run: uv sync --dev

      - name: Lint (ruff)
        run: uv run ruff check src/ tests/ evals/

      - name: Type check (mypy)
        run: uv run mypy src/ --ignore-missing-imports

      - name: Run tests
        run: uv run pytest --tb=short -v --cov=src --cov-report=term-missing
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Coverage gate
        run: uv run pytest --cov=src --cov-fail-under=80
```

> **Setup:** Go to your GitHub repo → Settings → Secrets → Actions →
> Add `ANTHROPIC_API_KEY`. The CI will fail if coverage drops below 80%.

---

## File: `.claude/CLAUDE.md`

```markdown
# {{PROJECT_NAME}}

## Project
- **Description:** {{PROJECT_DESCRIPTION}}
- **Author:** {{AUTHOR}}
- **Stack:** {{STACK}}

## Architecture
{{ARCHITECTURE_SECTION}}

## Rules
1. **TDD first** — no production code without a failing test written first
2. **Pydantic everywhere** — every input/output has a typed model
3. **Spec before code** — follow the 5-phase SDD for every feature
4. **Docstrings on tools** — agent decides by docstring, not function name
5. **Never hallucinate data** — always query sources before answering
6. **Structured outputs** — return Pydantic-validated JSON, never free text
7. **Keep it simple** — smallest possible change; delete over add
8. **Always use guardrails** — wrap agent calls with `validated_invoke()`
9. **Always trace** — wrap agent calls with `AgentTracer` for observability

## Self-Improvement Loop
When corrected, immediately update `tasks/lessons.md` with a rule
that prevents the same mistake from happening again.

## SDD Phases
| Phase | Skill | Model | Gate |
|-------|-------|-------|------|
| 1 | /brainstorm | opus | Full mental model |
| 2 | /define | opus | Clarity Score ≥ 12/15 |
| 3 | /design | opus | File manifest approved |
| 4 | /build | sonnet | All tests passing |
| 5 | /ship | sonnet | Deploy verified + lessons archived |

## Skills (loaded on demand)
- `pydantic` → validation, Field constraints, structured outputs
- `langchain` → agents, @tool, ReAct pattern
- `python` → clean code, typing, async, logging
- `tdd` → Red-Green-Refactor, pytest, coverage
- `observability` → AgentTrace, step logging, latency
- `guardrails` → semantic validation, retry with backoff
- `brainstorm` → Phase 1 discovery
- `define` → Phase 2 requirements
- `design` → Phase 3 architecture
- `build` → Phase 4 TDD implementation
- `ship` → Phase 5 verification and lessons
{{EXTRA_SKILLS}}

## Subagents
- `codebase-explorer` → understand the project before any task
- `test-writer` → writes tests only (TDD isolation)
- `implementer` → implements code only (TDD isolation)

## Commands
```bash
{{COMMANDS}}
```

## Context compaction instructions
When summarizing this conversation:
- Preserve all architectural decisions and their rationale
- Keep all error messages and their solutions
- Preserve the list of modified files and their responsibilities
- Keep lessons learned from mistakes
- Summarize exploration attempts briefly — outcomes matter, not paths

## Lessons Learned
See `tasks/lessons.md` — updated automatically after every correction.
```

---

## File: `.claude/skills/observability/SKILL.md`

```markdown
---
name: observability
description: >
  AgentTrace model, step logging, latency tracking. Auto-activates when
  implementing agent calls, debugging agent behavior, or adding tracing
  to existing agent code.
---

# Observability

## Core principle
You cannot improve what you cannot measure.
Every agent invocation should produce a trace — what happened,
how long it took, which tools were called, and where it failed.

## AgentTrace — the data model
```python
from src.project_name.observability.tracer import AgentTracer

with AgentTracer(question="What is total revenue?") as tracer:
    result = agent.invoke({"messages": [("user", question)]})
    tracer.set_output(result)

# Access the trace
print(tracer.trace.tools_called)   # ["execute_sql"]
print(tracer.trace.total_steps)    # 2
print(tracer.trace.latency_ms)     # 1240.5
print(tracer.trace.hallucinated)   # False
```

## What to trace
- `tools_called` — which tools were invoked, in order
- `total_steps` — how many ReAct cycles the agent used
- `latency_ms` — total wall time for the invocation
- `hallucinated` — True if the agent answered without querying a source
- `confidence` — from the structured output

## What the trace enables
- Detect when the model routes to the wrong tool
- Spot runaway loops (total_steps > threshold)
- Measure latency regression between versions
- Identify which questions cause hallucination

## Negative knowledge
- Do NOT log raw prompts in production — they may contain PII
- Do NOT block the agent loop with synchronous trace writes
- Do NOT use print() for tracing — use structured logging
```

---

## File: `.claude/skills/guardrails/SKILL.md`

```markdown
---
name: guardrails
description: >
  Semantic validation, automatic retry with backoff, and hallucination
  detection. Auto-activates when implementing agent calls, adding
  validation to outputs, or handling agent errors.
---

# Guardrails

## Core principle
Schema validation (Pydantic) ensures correct structure.
Semantic validation ensures correct content.
Both are required. Neither alone is sufficient.

## Three validation levels
1. **Schema** (Pydantic) — field types, constraints, required fields
2. **Semantic** — did the model actually query a source before answering?
3. **Behavioral** — did the model take the right path to get here?

## Using validated_invoke
```python
from src.project_name.guardrails.retry import validated_invoke

# Instead of calling agent directly:
result = agent.invoke({"messages": [("user", question)]})

# Always use:
result = validated_invoke(
    agent=agent,
    question=question,
    max_retries=3
)
```

## Writing a semantic validator
```python
from src.project_name.guardrails.validators import SemanticValidator

class RevenueValidator(SemanticValidator):
    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        # Revenue questions must use SQL
        if "revenue" in self.question.lower():
            return "execute_sql" in trace.tools_called
        return True
```

## When guardrails trigger a retry
- `confidence < 0.7` — model is uncertain
- `sources == []` — model answered without citing a source
- Semantic rule violated — model used wrong tool for the question
- Exception during tool execution — transient failure

## Negative knowledge
- Do NOT retry infinitely — always set max_retries
- Do NOT swallow GuardrailError silently — log and surface it
- Do NOT write validators that are too strict — they cause false retries
- Do NOT validate inside the agent loop — validate the final output only
```

---

## File: `src/project_name/observability/__init__.py`

```python
from .tracer import AgentTracer, AgentTrace, AgentStep

__all__ = ["AgentTracer", "AgentTrace", "AgentStep"]
```

---

## File: `src/project_name/observability/tracer.py`

```python
"""
Agent observability — trace every invocation.

Tracks tools called, steps taken, latency, and hallucination signals.
Use AgentTracer as a context manager around every agent.invoke() call.
"""

import time
import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class AgentStep:
    """A single step in the agent's ReAct loop."""
    step_num: int
    thought: str | None = None
    tool_called: str | None = None
    tool_input: dict | None = None
    tool_output: str | None = None
    latency_ms: float = 0.0


@dataclass
class AgentTrace:
    """Complete trace of a single agent invocation."""
    question: str
    steps: list[AgentStep] = field(default_factory=list)
    tools_called: list[str] = field(default_factory=list)
    final_answer: str | None = None
    confidence: float | None = None
    total_steps: int = 0
    latency_ms: float = 0.0
    hallucinated: bool = False
    error: str | None = None

    def mark_hallucinated(self) -> None:
        """Flag this trace as hallucinated — answered without querying sources."""
        self.hallucinated = True
        logger.warning(
            "Hallucination detected",
            extra={
                "question": self.question,
                "tools_called": self.tools_called,
                "total_steps": self.total_steps,
            }
        )

    def to_dict(self) -> dict:
        return {
            "question": self.question,
            "tools_called": self.tools_called,
            "total_steps": self.total_steps,
            "latency_ms": round(self.latency_ms, 2),
            "confidence": self.confidence,
            "hallucinated": self.hallucinated,
            "error": self.error,
        }


class AgentTracer:
    """
    Context manager that wraps an agent invocation and produces a trace.

    Usage:
        with AgentTracer(question="What is revenue?") as tracer:
            result = agent.invoke({"messages": [("user", question)]})
            tracer.set_output(result, confidence=result.get("confidence"))

        trace = tracer.trace
        print(trace.tools_called)
        print(trace.latency_ms)
    """

    def __init__(self, question: str) -> None:
        self.question = question
        self.trace = AgentTrace(question=question)
        self._start_time: float = 0.0

    def __enter__(self) -> "AgentTracer":
        self._start_time = time.monotonic()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        elapsed = (time.monotonic() - self._start_time) * 1000
        self.trace.latency_ms = elapsed

        if exc_type is not None:
            self.trace.error = str(exc_val)
            logger.error(
                "Agent invocation failed",
                extra={"question": self.question, "error": str(exc_val)}
            )

        logger.info(
            "Agent trace complete",
            extra=self.trace.to_dict()
        )

    def record_tool_call(self, tool_name: str, tool_input: dict,
                         tool_output: str, latency_ms: float = 0.0) -> None:
        """Record a tool call during agent execution."""
        step = AgentStep(
            step_num=len(self.trace.steps) + 1,
            tool_called=tool_name,
            tool_input=tool_input,
            tool_output=tool_output,
            latency_ms=latency_ms,
        )
        self.trace.steps.append(step)
        self.trace.tools_called.append(tool_name)
        self.trace.total_steps += 1

    def set_output(self, answer: str, confidence: float | None = None) -> None:
        """Set the final answer and confidence from the agent output."""
        self.trace.final_answer = answer
        self.trace.confidence = confidence

        # Hallucination heuristic: answered but called no tools
        if not self.trace.tools_called and answer:
            self.trace.mark_hallucinated()
```

---

## File: `src/project_name/guardrails/__init__.py`

```python
from .validators import SemanticValidator, ConfidenceValidator, SourceValidator
from .retry import validated_invoke, GuardrailError

__all__ = [
    "SemanticValidator",
    "ConfidenceValidator",
    "SourceValidator",
    "validated_invoke",
    "GuardrailError",
]
```

---

## File: `src/project_name/guardrails/validators.py`

```python
"""
Semantic validators — go beyond schema to validate content correctness.

Schema validation (Pydantic) checks structure.
Semantic validation checks meaning and correctness.

Usage:
    validators = [
        ConfidenceValidator(min_confidence=0.7),
        SourceValidator(),
    ]
    for validator in validators:
        if not validator.validate(output, trace):
            raise GuardrailError(validator.failure_reason)
"""

import logging
from abc import ABC, abstractmethod
from src.project_name.models import QueryOutput
from src.project_name.observability.tracer import AgentTrace

logger = logging.getLogger(__name__)


class SemanticValidator(ABC):
    """Base class for semantic validators."""

    def __init__(self, question: str = "") -> None:
        self.question = question
        self.failure_reason: str = ""

    @abstractmethod
    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        """Return True if valid, False if guardrail triggered."""
        ...


class ConfidenceValidator(SemanticValidator):
    """
    Rejects responses where the model expressed low confidence.
    Low confidence = higher hallucination risk.
    """

    def __init__(self, min_confidence: float = 0.7, **kwargs) -> None:
        super().__init__(**kwargs)
        self.min_confidence = min_confidence

    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        if output.confidence < self.min_confidence:
            self.failure_reason = (
                f"Confidence {output.confidence:.2f} below threshold "
                f"{self.min_confidence:.2f}"
            )
            logger.warning("ConfidenceValidator failed", extra={
                "confidence": output.confidence,
                "threshold": self.min_confidence,
                "question": self.question,
            })
            return False
        return True


class SourceValidator(SemanticValidator):
    """
    Rejects responses that claim to have data but cite no sources.
    A model that answers without sources likely hallucinated the data.
    """

    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        # If the agent called no tools, it answered from memory = hallucination risk
        if not trace.tools_called and output.answer:
            self.failure_reason = (
                "Agent answered without querying any data source. "
                "Possible hallucination."
            )
            logger.warning("SourceValidator failed", extra={
                "tools_called": trace.tools_called,
                "question": self.question,
            })
            return False
        return True


class ToolRoutingValidator(SemanticValidator):
    """
    Validates that the agent used the expected tool for a given question type.
    Catches misrouting — e.g., using semantic search for a numeric question.

    Usage:
        validator = ToolRoutingValidator(
            question="What is total revenue?",
            expected_tool="execute_sql",
            trigger_keywords=["revenue", "total", "count", "average"]
        )
    """

    def __init__(self, expected_tool: str,
                 trigger_keywords: list[str], **kwargs) -> None:
        super().__init__(**kwargs)
        self.expected_tool = expected_tool
        self.trigger_keywords = trigger_keywords

    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        question_lower = self.question.lower()
        triggered = any(kw in question_lower for kw in self.trigger_keywords)

        if triggered and self.expected_tool not in trace.tools_called:
            self.failure_reason = (
                f"Question contains keywords {self.trigger_keywords} "
                f"but agent did not call '{self.expected_tool}'. "
                f"Tools called: {trace.tools_called}"
            )
            logger.warning("ToolRoutingValidator failed", extra={
                "expected_tool": self.expected_tool,
                "tools_called": trace.tools_called,
                "question": self.question,
            })
            return False
        return True
```

---

## File: `src/project_name/guardrails/retry.py`

```python
"""
validated_invoke — wraps agent calls with semantic validation and retry.

This is the main entry point for all agent invocations.
Never call agent.invoke() directly — always use validated_invoke().

Usage:
    result = validated_invoke(
        agent=agent,
        question="What is total revenue?",
        validators=[ConfidenceValidator(0.7), SourceValidator()],
        max_retries=3,
    )
"""

import time
import logging
from src.project_name.models import QueryOutput
from src.project_name.observability.tracer import AgentTracer, AgentTrace
from src.project_name.guardrails.validators import (
    SemanticValidator,
    ConfidenceValidator,
    SourceValidator,
)

logger = logging.getLogger(__name__)


class GuardrailError(Exception):
    """Raised when the agent fails all retries or violates a hard guardrail."""
    def __init__(self, reason: str, attempts: int = 0) -> None:
        self.reason = reason
        self.attempts = attempts
        super().__init__(f"GuardrailError after {attempts} attempts: {reason}")


def validated_invoke(
    agent,
    question: str,
    validators: list[SemanticValidator] | None = None,
    max_retries: int = 3,
    backoff_base: float = 1.5,
) -> tuple[QueryOutput, AgentTrace]:
    """
    Invoke an agent with semantic validation and automatic retry.

    Args:
        agent: LangChain/LangGraph agent with .invoke() method
        question: the user question
        validators: list of SemanticValidator instances (defaults to
                    ConfidenceValidator + SourceValidator)
        max_retries: maximum number of attempts before raising GuardrailError
        backoff_base: exponential backoff multiplier between retries

    Returns:
        (QueryOutput, AgentTrace) — validated output and its trace

    Raises:
        GuardrailError — if all retries are exhausted
    """

    if validators is None:
        validators = [
            ConfidenceValidator(min_confidence=0.7, question=question),
            SourceValidator(question=question),
        ]

    last_reason = "Unknown failure"

    for attempt in range(1, max_retries + 1):
        logger.info(f"Agent attempt {attempt}/{max_retries}", extra={
            "question": question, "attempt": attempt
        })

        with AgentTracer(question=question) as tracer:
            try:
                raw = agent.invoke({"messages": [("user", question)]})

                # Extract the last AI message content as the answer
                messages = raw.get("messages", [])
                answer = messages[-1].content if messages else ""

                # Build structured output — adjust fields to your domain
                output = QueryOutput(
                    answer=answer,
                    confidence=0.9,   # override with model-provided confidence
                    sources=tracer.trace.tools_called,
                )
                tracer.set_output(answer, confidence=output.confidence)

            except Exception as e:
                logger.error(f"Agent invocation error: {e}")
                last_reason = str(e)
                _sleep_backoff(attempt, backoff_base)
                continue

        # Run semantic validators
        all_valid = True
        for validator in validators:
            if not validator.validate(output, tracer.trace):
                last_reason = validator.failure_reason
                all_valid = False
                break

        if all_valid:
            logger.info("Agent response validated", extra={
                "attempt": attempt,
                "latency_ms": tracer.trace.latency_ms,
                "tools_called": tracer.trace.tools_called,
            })
            return output, tracer.trace

        logger.warning(
            f"Guardrail failed on attempt {attempt}: {last_reason}",
            extra={"question": question, "attempt": attempt}
        )
        _sleep_backoff(attempt, backoff_base)

    raise GuardrailError(reason=last_reason, attempts=max_retries)


def _sleep_backoff(attempt: int, base: float) -> None:
    """Exponential backoff between retries: 1.5s, 2.25s, 3.375s..."""
    delay = base ** attempt
    logger.debug(f"Backoff: sleeping {delay:.2f}s before retry")
    time.sleep(delay)
```

---

## File: `evals/__init__.py`

```python
"""
Behavioral evals for agent intelligence.

These tests verify HOW the agent reasons, not just WHAT it returns.
They are intentionally kept separate from unit tests because:
- They may call the real LLM API (use sparingly in CI)
- They test behavior, not implementation
- They should be run before releasing a new prompt or skill version

Run with:
    uv run pytest evals/ -v --tb=short
    uv run pytest evals/ -v -m "not llm"  # skip real LLM calls
"""
```

---

## File: `evals/datasets/agent_behavior.json`

```json
{
  "version": "1.0",
  "description": "Ground truth dataset for agent behavioral evals",
  "cases": [
    {
      "id": "sql-routing-01",
      "question": "What is the total revenue this month?",
      "expected_tool": "execute_sql",
      "must_not_use_tool": "semantic_search",
      "expected_store": "ledger",
      "tags": ["routing", "sql", "numeric"]
    },
    {
      "id": "semantic-routing-01",
      "question": "What are customers complaining about?",
      "expected_tool": "semantic_search",
      "must_not_use_tool": "execute_sql",
      "expected_store": "memory",
      "tags": ["routing", "semantic", "sentiment"]
    },
    {
      "id": "hybrid-routing-01",
      "question": "What is the average order value of dissatisfied customers?",
      "expected_tools": ["semantic_search", "execute_sql"],
      "expected_store": "both",
      "tags": ["routing", "hybrid"]
    },
    {
      "id": "hallucination-01",
      "question": "What is the revenue of a customer named XYZ_NONEXISTENT?",
      "expected_behavior": "acknowledge_no_data",
      "must_not_hallucinate": true,
      "tags": ["hallucination", "edge-case"]
    },
    {
      "id": "confidence-01",
      "question": "Is revenue trending up or down?",
      "min_confidence": 0.7,
      "tags": ["confidence", "trend"]
    }
  ]
}
```

---

## File: `evals/test_agent_behavior.py`

```python
"""
Behavioral evals for the agent.

These tests measure agent INTELLIGENCE, not code correctness.
They verify routing decisions, hallucination resistance, and confidence.

Marks:
    @pytest.mark.llm    — requires real LLM API call (slow, costs tokens)
    @pytest.mark.fast   — uses mocks, safe for CI

Run only fast evals in CI:
    uv run pytest evals/ -m "not llm"

Run all evals locally before releasing:
    uv run pytest evals/ -v
"""

import json
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Load ground truth dataset
DATASET_PATH = Path(__file__).parent / "datasets" / "agent_behavior.json"
with open(DATASET_PATH) as f:
    DATASET = json.load(f)

CASES = {case["id"]: case for case in DATASET["cases"]}


# ── Fast evals (mocked — safe for CI) ────────────────────────────────────────

class TestRoutingDecisions:
    """
    Verify the agent routes questions to the correct tool.
    These use mocked agents — they test the ROUTING LOGIC, not the LLM.
    """

    @pytest.mark.fast
    def test_numeric_question_routes_to_sql(self, mock_agent_sql):
        """Revenue questions must use execute_sql, never semantic_search."""
        case = CASES["sql-routing-01"]
        trace = mock_agent_sql.last_trace

        assert case["expected_tool"] in trace.tools_called, (
            f"Expected '{case['expected_tool']}' in tools_called, "
            f"got: {trace.tools_called}"
        )
        assert case.get("must_not_use_tool") not in trace.tools_called, (
            f"Agent should NOT call '{case['must_not_use_tool']}' "
            f"for numeric questions"
        )

    @pytest.mark.fast
    def test_semantic_question_routes_to_qdrant(self, mock_agent_semantic):
        """Sentiment questions must use semantic_search, never execute_sql."""
        case = CASES["semantic-routing-01"]
        trace = mock_agent_semantic.last_trace

        assert case["expected_tool"] in trace.tools_called, (
            f"Expected '{case['expected_tool']}' in tools_called, "
            f"got: {trace.tools_called}"
        )

    @pytest.mark.fast
    def test_agent_does_not_answer_without_tools(self, mock_agent_no_tools):
        """
        Agent must not answer questions that require data
        without calling any tool first.
        Answering without tools = hallucination risk.
        """
        from src.project_name.observability.tracer import AgentTrace
        trace = AgentTrace(question="What is revenue?")
        # No tools called — should be flagged
        trace.final_answer = "Revenue is $100,000"
        if trace.final_answer and not trace.tools_called:
            trace.mark_hallucinated()

        assert trace.hallucinated is True


class TestGuardrails:
    """Verify the guardrail layer blocks bad responses."""

    @pytest.mark.fast
    def test_low_confidence_triggers_retry(self):
        """Responses with confidence < 0.7 should not pass validation."""
        from src.project_name.guardrails.validators import ConfidenceValidator
        from src.project_name.models import QueryOutput
        from src.project_name.observability.tracer import AgentTrace

        validator = ConfidenceValidator(min_confidence=0.7, question="test?")
        output = QueryOutput(answer="Some answer", confidence=0.5)
        trace = AgentTrace(question="test?")
        trace.tools_called = ["execute_sql"]

        assert validator.validate(output, trace) is False
        assert "0.50" in validator.failure_reason

    @pytest.mark.fast
    def test_source_validator_blocks_toolless_answers(self):
        """Agent that answers without calling any tool should be rejected."""
        from src.project_name.guardrails.validators import SourceValidator
        from src.project_name.models import QueryOutput
        from src.project_name.observability.tracer import AgentTrace

        validator = SourceValidator(question="What is total revenue?")
        output = QueryOutput(answer="Revenue is $100K", confidence=0.9)
        trace = AgentTrace(question="What is total revenue?")
        # tools_called is empty — model answered from memory

        assert validator.validate(output, trace) is False

    @pytest.mark.fast
    def test_valid_response_passes_all_validators(self):
        """A well-formed response with sources should pass all validators."""
        from src.project_name.guardrails.validators import (
            ConfidenceValidator, SourceValidator
        )
        from src.project_name.models import QueryOutput
        from src.project_name.observability.tracer import AgentTrace

        output = QueryOutput(
            answer="Revenue is $127,430",
            confidence=0.95,
            sources=["execute_sql"]
        )
        trace = AgentTrace(question="What is revenue?")
        trace.tools_called = ["execute_sql"]

        q = "What is revenue?"
        assert ConfidenceValidator(min_confidence=0.7, question=q).validate(output, trace)
        assert SourceValidator(question=q).validate(output, trace)


# ── Slow evals (real LLM — run locally before release) ───────────────────────

class TestAgentIntelligence:
    """
    Real LLM behavioral tests. These cost tokens and take time.
    Run before every release, not in every CI build.
    """

    @pytest.mark.llm
    @pytest.mark.slow
    def test_agent_routes_revenue_to_sql(self, real_agent):
        """
        REAL LLM TEST: Agent must call execute_sql for revenue questions.
        If this fails, the tool docstrings need improvement.
        """
        from src.project_name.guardrails.retry import validated_invoke

        output, trace = validated_invoke(
            agent=real_agent,
            question=CASES["sql-routing-01"]["question"],
            max_retries=2,
        )

        assert "execute_sql" in trace.tools_called, (
            "Agent did not use SQL for a revenue question. "
            "Check the execute_sql docstring routing keywords."
        )
        assert trace.hallucinated is False

    @pytest.mark.llm
    @pytest.mark.slow
    def test_agent_confidence_above_threshold(self, real_agent):
        """REAL LLM TEST: Agent confidence must be ≥ 0.7 for factual questions."""
        from src.project_name.guardrails.retry import validated_invoke

        output, trace = validated_invoke(
            agent=real_agent,
            question=CASES["confidence-01"]["question"],
        )

        assert output.confidence >= CASES["confidence-01"]["min_confidence"], (
            f"Confidence {output.confidence} below threshold. "
            "The model is uncertain — improve context or data quality."
        )


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_agent_sql():
    """Mock agent that simulates calling execute_sql."""
    from src.project_name.observability.tracer import AgentTrace

    agent = MagicMock()
    trace = AgentTrace(question="What is total revenue?")
    trace.tools_called = ["execute_sql"]
    trace.total_steps = 2
    agent.last_trace = trace

    agent.invoke.return_value = {
        "messages": [MagicMock(content="Revenue is $127,430")]
    }
    return agent


@pytest.fixture
def mock_agent_semantic():
    """Mock agent that simulates calling semantic_search."""
    from src.project_name.observability.tracer import AgentTrace

    agent = MagicMock()
    trace = AgentTrace(question="What are customers complaining about?")
    trace.tools_called = ["semantic_search"]
    agent.last_trace = trace

    agent.invoke.return_value = {
        "messages": [MagicMock(content="Customers complain about delivery times.")]
    }
    return agent


@pytest.fixture
def mock_agent_no_tools():
    """Mock agent that answers without calling any tool."""
    agent = MagicMock()
    agent.invoke.return_value = {
        "messages": [MagicMock(content="Revenue is $100,000")]
    }
    return agent


@pytest.fixture
def real_agent():
    """Real agent — only used in @pytest.mark.llm tests."""
    # Import here to avoid loading at collection time
    from src.project_name.config import get_settings
    settings = get_settings()

    from langchain_anthropic import ChatAnthropic
    from langgraph.prebuilt import create_react_agent

    llm = ChatAnthropic(
        model=settings.model_name,
        anthropic_api_key=settings.anthropic_api_key
    )

    # Minimal agent for eval — add your tools here
    return create_react_agent(model=llm, tools=[], prompt="You are a helpful assistant.")
```

---

## File: `tests/test_guardrails.py`

```python
"""Unit tests for guardrails module."""

import pytest
from unittest.mock import MagicMock
from src.project_name.models import QueryOutput
from src.project_name.observability.tracer import AgentTrace
from src.project_name.guardrails.validators import (
    ConfidenceValidator,
    SourceValidator,
    ToolRoutingValidator,
)
from src.project_name.guardrails.retry import GuardrailError, validated_invoke


class TestConfidenceValidator:
    def test_passes_above_threshold(self):
        v = ConfidenceValidator(min_confidence=0.7, question="q?")
        output = QueryOutput(answer="A", confidence=0.9)
        trace = AgentTrace(question="q?")
        trace.tools_called = ["execute_sql"]
        assert v.validate(output, trace) is True

    def test_fails_below_threshold(self):
        v = ConfidenceValidator(min_confidence=0.7, question="q?")
        output = QueryOutput(answer="A", confidence=0.5)
        trace = AgentTrace(question="q?")
        trace.tools_called = ["execute_sql"]
        assert v.validate(output, trace) is False
        assert "0.50" in v.failure_reason

    def test_fails_at_exact_threshold(self):
        v = ConfidenceValidator(min_confidence=0.7, question="q?")
        output = QueryOutput(answer="A", confidence=0.7)
        trace = AgentTrace(question="q?")
        trace.tools_called = ["execute_sql"]
        # 0.7 is not below 0.7 — should pass
        assert v.validate(output, trace) is True


class TestSourceValidator:
    def test_passes_with_tools_called(self):
        v = SourceValidator(question="q?")
        output = QueryOutput(answer="A", confidence=0.9)
        trace = AgentTrace(question="q?")
        trace.tools_called = ["execute_sql"]
        assert v.validate(output, trace) is True

    def test_fails_without_tools(self):
        v = SourceValidator(question="q?")
        output = QueryOutput(answer="A", confidence=0.9)
        trace = AgentTrace(question="q?")
        # tools_called is empty
        assert v.validate(output, trace) is False

    def test_passes_with_empty_answer(self):
        """Empty answer with no tools is not a hallucination — it's a non-answer."""
        v = SourceValidator(question="q?")
        output = QueryOutput(answer="", confidence=0.0)
        trace = AgentTrace(question="q?")
        assert v.validate(output, trace) is True


class TestToolRoutingValidator:
    def test_passes_correct_tool(self):
        v = ToolRoutingValidator(
            question="What is total revenue?",
            expected_tool="execute_sql",
            trigger_keywords=["revenue", "total"]
        )
        output = QueryOutput(answer="A", confidence=0.9)
        trace = AgentTrace(question="What is total revenue?")
        trace.tools_called = ["execute_sql"]
        assert v.validate(output, trace) is True

    def test_fails_wrong_tool(self):
        v = ToolRoutingValidator(
            question="What is total revenue?",
            expected_tool="execute_sql",
            trigger_keywords=["revenue", "total"]
        )
        output = QueryOutput(answer="A", confidence=0.9)
        trace = AgentTrace(question="What is total revenue?")
        trace.tools_called = ["semantic_search"]  # wrong tool
        assert v.validate(output, trace) is False

    def test_passes_when_keyword_absent(self):
        """If keyword not in question, validator should not trigger."""
        v = ToolRoutingValidator(
            question="What are customer complaints?",
            expected_tool="execute_sql",
            trigger_keywords=["revenue", "total"]
        )
        output = QueryOutput(answer="A", confidence=0.9)
        trace = AgentTrace(question="What are customer complaints?")
        trace.tools_called = ["semantic_search"]
        assert v.validate(output, trace) is True


class TestValidatedInvoke:
    def test_returns_output_and_trace_on_success(self, mock_valid_agent):
        output, trace = validated_invoke(
            agent=mock_valid_agent,
            question="What is revenue?",
            max_retries=1,
        )
        assert output.answer == "Revenue is $127K"
        assert isinstance(trace, AgentTrace)

    def test_raises_guardrail_error_after_max_retries(self, mock_failing_agent):
        with pytest.raises(GuardrailError) as exc_info:
            validated_invoke(
                agent=mock_failing_agent,
                question="What is revenue?",
                max_retries=2,
                backoff_base=0.01,  # tiny backoff for fast tests
            )
        assert exc_info.value.attempts == 2


@pytest.fixture
def mock_valid_agent():
    """Agent that returns a high-confidence response with tools called."""
    agent = MagicMock()
    agent.invoke.return_value = {
        "messages": [MagicMock(content="Revenue is $127K")]
    }
    return agent


@pytest.fixture
def mock_failing_agent():
    """Agent that always returns low-confidence responses."""
    agent = MagicMock()
    agent.invoke.return_value = {
        "messages": [MagicMock(content="I'm not sure")]
    }
    return agent
```

---

## File: `tests/test_observability.py`

```python
"""Unit tests for observability module."""

import pytest
import time
from src.project_name.observability.tracer import AgentTracer, AgentTrace, AgentStep


class TestAgentTrace:
    def test_initial_state(self):
        trace = AgentTrace(question="test?")
        assert trace.tools_called == []
        assert trace.total_steps == 0
        assert trace.hallucinated is False
        assert trace.error is None

    def test_mark_hallucinated(self):
        trace = AgentTrace(question="test?")
        trace.mark_hallucinated()
        assert trace.hallucinated is True

    def test_to_dict(self):
        trace = AgentTrace(question="test?")
        trace.tools_called = ["execute_sql"]
        trace.total_steps = 2
        trace.confidence = 0.9

        d = trace.to_dict()
        assert d["question"] == "test?"
        assert d["tools_called"] == ["execute_sql"]
        assert d["total_steps"] == 2
        assert d["confidence"] == 0.9
        assert d["hallucinated"] is False


class TestAgentTracer:
    def test_context_manager_sets_latency(self):
        with AgentTracer(question="test?") as tracer:
            time.sleep(0.01)  # simulate work

        assert tracer.trace.latency_ms >= 10  # at least 10ms

    def test_records_tool_calls(self):
        with AgentTracer(question="test?") as tracer:
            tracer.record_tool_call(
                tool_name="execute_sql",
                tool_input={"keyword": "revenue"},
                tool_output="[{'revenue': 1000}]",
                latency_ms=150.0
            )

        assert "execute_sql" in tracer.trace.tools_called
        assert tracer.trace.total_steps == 1
        assert tracer.trace.steps[0].tool_called == "execute_sql"

    def test_detects_hallucination(self):
        """If agent answers without calling any tool, mark as hallucinated."""
        with AgentTracer(question="What is revenue?") as tracer:
            tracer.set_output("Revenue is $100K", confidence=0.9)
            # No tool calls recorded

        assert tracer.trace.hallucinated is True

    def test_no_hallucination_when_tool_called(self):
        with AgentTracer(question="What is revenue?") as tracer:
            tracer.record_tool_call("execute_sql", {}, "result", 100.0)
            tracer.set_output("Revenue is $127K", confidence=0.95)

        assert tracer.trace.hallucinated is False

    def test_captures_exception(self):
        with pytest.raises(ValueError):
            with AgentTracer(question="test?") as tracer:
                raise ValueError("something went wrong")

        assert tracer.trace.error == "something went wrong"
```

---

## File: `pyproject.toml`

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "{{project_name}}"
version = "0.1.0"
description = "{{PROJECT_DESCRIPTION}}"
requires-python = ">=3.11"

# Core — always installed
dependencies = [
    "pydantic>=2.7,<3.0",
    "pydantic-settings>=2.3,<3.0",
    "anthropic>=0.40,<1.0",
    "instructor>=1.4,<2.0",
    "langchain>=0.3,<0.4",
    "langchain-anthropic>=0.3,<0.4",
    "langgraph>=0.2,<0.3",
    "python-dotenv>=1.0,<2.0",
]

[project.optional-dependencies]
# Added with --with-vector-db
vector-db = [
    "llama-index>=0.11,<0.12",
    "llama-index-vector-stores-qdrant>=0.3,<0.4",
    "llama-index-embeddings-fastembed>=0.2,<0.3",
    "qdrant-client>=1.9,<2.0",
    "sqlalchemy>=2.0,<3.0",
    "psycopg2-binary>=2.9,<3.0",
]

# Dev tools — always in development
dev = [
    "pytest>=8.0,<9.0",
    "pytest-asyncio>=0.23,<0.24",
    "pytest-cov>=5.0,<6.0",
    "ruff>=0.4,<0.5",
    "mypy>=1.10,<2.0",
]

[tool.pytest.ini_options]
testpaths = ["tests", "evals"]
asyncio_mode = "auto"
addopts = "--tb=short -v"
markers = [
    "llm: requires real LLM API call (slow, costs tokens)",
    "fast: uses mocks, safe for CI",
    "slow: takes more than 5 seconds",
]

[tool.coverage.run]
source = ["src"]
omit = ["tests/*", "evals/*"]

[tool.coverage.report]
fail_under = 80

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]
```

---

## File: `bootstrap.py`

```python
#!/usr/bin/env python3
"""
bootstrap.py — Initialize a new project from agentic-starter.

Usage:
    python bootstrap.py --name "My Project" --author "Your Name"
    python bootstrap.py --name "My Project" --author "Your Name" --with-vector-db

The bootstrap COPIES files from .templates/ into the project.
It never deletes template source files — re-running is always safe.
After installation, generates uv.lock for reproducible builds.
"""

import argparse
import subprocess
import shutil
from pathlib import Path

# ── Placeholders ──────────────────────────────────────────────────────────────

TEXT_EXTENSIONS = {
    ".py", ".md", ".toml", ".yml", ".yaml",
    ".json", ".env", ".txt", ".sh", ".ts", ".tsx"
}

VECTOR_DB_MANIFEST = {
    ".templates/vector-db/skills/qdrant": ".claude/skills/qdrant",
    ".templates/vector-db/skills/postgres": ".claude/skills/postgres",
    ".templates/vector-db/src/tools.py": "src/{{module}}/tools.py",
    ".templates/vector-db/src/agent.py": "src/{{module}}/agent.py",
    ".templates/vector-db/tests/test_tools.py": "tests/test_tools.py",
    ".templates/vector-db/docker-compose.yml": "docker-compose.yml",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def replace_in_file(path: Path, replacements: dict[str, str]) -> None:
    try:
        content = path.read_text(encoding="utf-8")
        for old, new in replacements.items():
            content = content.replace(old, new)
        path.write_text(content, encoding="utf-8")
    except (UnicodeDecodeError, PermissionError):
        pass


def copy_template(src: str, dst: str, module: str) -> None:
    src_path = Path(src)
    dst_resolved = dst.replace("{{module}}", module)
    dst_path = Path(dst_resolved)

    if not src_path.exists():
        print(f"   ⚠ Template not found: {src_path}")
        return

    dst_path.parent.mkdir(parents=True, exist_ok=True)

    if src_path.is_dir():
        if dst_path.exists():
            shutil.rmtree(dst_path)
        shutil.copytree(src_path, dst_path)
    else:
        shutil.copy2(src_path, dst_path)

    print(f"   ✓ {src} → {dst_resolved}")


def run(cmd: list[str], cwd: Path | None = None) -> bool:
    """Run a command, return True on success."""
    try:
        subprocess.run(cmd, check=True, cwd=cwd)
        return True
    except FileNotFoundError:
        print(f"   ⚠ Command not found: {cmd[0]}")
        return False
    except subprocess.CalledProcessError as e:
        print(f"   ⚠ Failed: {' '.join(cmd)} (exit {e.returncode})")
        return False


def build_stack(args: argparse.Namespace) -> str:
    parts = ["Python · Claude Code · LangChain · Pydantic"]
    if args.with_vector_db:
        parts.append("Qdrant · Postgres")
    return " · ".join(parts)


def build_architecture(args: argparse.Namespace) -> str:
    if not args.with_vector_db:
        return "Single agent with Pydantic structured outputs and guardrails."
    return """### The Ledger (Postgres)
Exact, structured data. Use for: counts, sums, averages, JOINs.

### The Memory (Qdrant)
Semantic data. Use for: meaning search, sentiment, free text.

### Routing rule
- Exact number → Ledger (SQL)
- Meaning / text → Memory (Qdrant)
- Hybrid → both"""


def build_extra_skills(args: argparse.Namespace) -> str:
    if not args.with_vector_db:
        return ""
    return ("- `qdrant` → vector store, embeddings, RAG pipeline\n"
            "- `postgres` → SQL patterns, canonical queries, SQLAlchemy")


def build_commands(args: argparse.Namespace) -> str:
    cmds = []
    if args.with_vector_db:
        cmds.append("docker compose up -d          # Start Postgres + Qdrant")
    cmds.append("uv run pytest --tb=short      # Run unit tests")
    cmds.append("uv run pytest evals/ -m fast  # Run fast behavioral evals")
    return "\n".join(cmds)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Initialize a new project from agentic-starter",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python bootstrap.py --name "My Project" --author "Jane Doe"
  python bootstrap.py --name "My Project" --author "Jane Doe" --with-vector-db
        """
    )
    parser.add_argument("--name", required=True, help='Project name')
    parser.add_argument("--author", required=True, help='Your name')
    parser.add_argument("--description",
                        default="AI project built with Claude Code",
                        help="Short one-line description")
    parser.add_argument("--with-vector-db", action="store_true",
                        help="Add Qdrant + Postgres + docker-compose")
    parser.add_argument("--skip-git", action="store_true")
    args = parser.parse_args()

    project_slug = args.name.lower().replace(" ", "-")
    project_module = project_slug.replace("-", "_")

    print(f"\n🚀 Initializing: {args.name}")
    print(f"   author : {args.author}")
    print(f"   slug   : {project_slug}")
    if args.with_vector_db:
        print("   + vector-db (Qdrant + Postgres)")
    print()

    # 1. Copy optional module files
    if args.with_vector_db:
        print("📂 Copying vector-db module...")
        for src, dst in VECTOR_DB_MANIFEST.items():
            copy_template(src, dst, project_module)

    # 2. Rename src/project_name
    old_src = Path("src/project_name")
    new_src = Path(f"src/{project_module}")
    if old_src.exists() and not new_src.exists():
        old_src.rename(new_src)
        print(f"\n📁 Renamed: src/project_name → src/{project_module}")

    # 3. Replace placeholders
    print("\n📝 Replacing placeholders...")
    replacements = {
        "{{project_name}}": project_slug,
        "{{PROJECT_NAME}}": args.name,
        "{{PROJECT_DESCRIPTION}}": args.description,
        "{{AUTHOR}}": args.author,
        "{{STACK}}": build_stack(args),
        "{{ARCHITECTURE_SECTION}}": build_architecture(args),
        "{{EXTRA_SKILLS}}": build_extra_skills(args),
        "{{EXTRA_AGENTS}}": "",
        "{{COMMANDS}}": build_commands(args),
        "project_name": project_module,
    }
    for path in Path(".").rglob("*"):
        if path.is_file() and path.suffix in TEXT_EXTENSIONS:
            if ".git" not in str(path) and ".templates" not in str(path):
                replace_in_file(path, replacements)
    print("   ✓ Done")

    # 4. Create .env
    env_example = Path(".env.example")
    if env_example.exists() and not Path(".env").exists():
        Path(".env").write_text(env_example.read_text())
        print("\n🔑 .env created (fill in ANTHROPIC_API_KEY)")

    # 5. Create settings.local.json
    if args.with_vector_db:
        example = Path(".claude/settings.local.json.example")
        local = Path(".claude/settings.local.json")
        if example.exists() and not local.exists():
            local.write_text(
                example.read_text().replace("project_name", project_module)
            )
            print("   ✓ .claude/settings.local.json created")

    # 6. Install Python dependencies + generate uv.lock
    print("\n🐍 Installing dependencies and generating uv.lock...")
    sync_cmd = ["uv", "sync", "--dev"]
    if args.with_vector_db:
        sync_cmd += ["--extra", "vector-db"]

    if run(sync_cmd):
        print("   ✓ Dependencies installed")
        print("   ✓ uv.lock generated (commit this file)")
    else:
        print("   → Install uv: curl -LsSf https://astral.sh/uv/install.sh | sh")

    # 7. Run base tests to confirm everything works
    print("\n🧪 Running base tests...")
    if run(["uv", "run", "pytest", "tests/", "--tb=short", "-q"]):
        print("   ✓ All base tests passing")
    else:
        print("   ⚠ Some tests failed — check output above")

    # 8. Initialize git
    if not args.skip_git and not Path(".git").exists():
        print("\n🔧 Initializing git...")
        run(["git", "init"])
        run(["git", "add", "."])
        run(["git", "commit", "-m", f"feat: initial setup — {args.name}"])
        print("   ✓ First commit created (includes uv.lock)")

    # 9. Next steps
    steps = ["1. Fill in .env with your ANTHROPIC_API_KEY"]
    if args.with_vector_db:
        steps += ["2. docker compose up -d", "3. uv run pytest", "4. claude"]
    else:
        steps += ["2. uv run pytest", "3. claude"]
    steps.append(f"{len(steps) + 1}. /brainstorm  ← start Phase 1")

    print(f"""
✅ {args.name} is ready!

Next steps:
{chr(10).join(f'  {s}' for s in steps)}

GitHub Actions CI is configured — add ANTHROPIC_API_KEY to repo secrets.
Docs: github.com/Juniordell/agentic-starter
""")


if __name__ == "__main__":
    main()
```

---

## File: `CONTRIBUTING.md`

```markdown
# Contributing to agentic-starter

## Ways to contribute
- Add a Skill — improve agent domain knowledge
- Propose a new flag — new optional module
- Improve guardrails — new semantic validators
- Add evals — expand the behavioral test dataset
- Fix bugs in bootstrap.py or existing files

## How to add a new Skill
1. Create `.claude/skills/<n>/SKILL.md`
2. Add frontmatter with `name`, `description`, and optionally `model`
3. Include: core principle, code examples, negative knowledge section
4. Keep it under 150 lines
5. PR title: `skill: add <n> skill`

## How to add a new eval case
1. Add an entry to `evals/datasets/agent_behavior.json`
2. Add a corresponding test in `evals/test_agent_behavior.py`
3. Mark with `@pytest.mark.fast` (mocked) or `@pytest.mark.llm` (real API)
4. PR title: `eval: add <description> case`

## How to add a semantic validator
1. Create a class in `src/project_name/guardrails/validators.py`
2. Extend `SemanticValidator`, implement `validate()`
3. Add tests in `tests/test_guardrails.py`
4. PR title: `guardrail: add <name> validator`

## How to propose a new flag
1. Create `.templates/<module-name>/` with all module files
2. Add manifest in `bootstrap.py`
3. Add flag to argparse
4. Update `pyproject.toml` optional deps
5. Mark as `🚧 Coming soon` until tests complete
6. PR title: `feat: add --with-<n> flag`

## Testing locally
```bash
git clone https://github.com/Juniordell/agentic-starter test-run
cd test-run
python bootstrap.py --name "Test" --author "Test Author"
uv run pytest tests/ evals/ -m "not llm" --tb=short
# All tests should pass
```

## Pull Request checklist
- [ ] `uv run pytest tests/ evals/ -m "not llm"` passes
- [ ] `uv run ruff check src/` passes
- [ ] New skills have a "Negative knowledge" section
- [ ] New validators have tests in `test_guardrails.py`
- [ ] New eval cases have both a dataset entry and a test function
- [ ] `uv.lock` is committed if deps changed

## Commit style
`feat:`, `fix:`, `docs:`, `skill:`, `eval:`, `guardrail:`
```

---

## File: `README.md`

```markdown
# agentic-starter

> Open source Claude Code template focused on reducing hallucination
> and optimizing token usage through guardrails, observability, and SDD.

## Quick Start

```bash
git clone https://github.com/Juniordell/agentic-starter my-project
cd my-project

python bootstrap.py --name "My Project" --author "Your Name"
# or with vector DB:
python bootstrap.py --name "My Project" --author "Your Name" --with-vector-db
```

## What makes this different

Most Claude Code templates are about structure. This one is about **precision**.

| Problem | Solution |
|---------|----------|
| Model hallucinates data | Guardrails reject answers without sources |
| Model routes to wrong tool | Explicit docstring routing + ToolRoutingValidator |
| Can't measure agent quality | AgentTracer records every step and tool call |
| Tests don't cover agent intelligence | Evals test routing, hallucination, confidence |
| Context gets bloated | Skills load on-demand, CLAUDE.md ≤ 100 lines |
| Broken AI commits slip through | GitHub Actions CI blocks them |

## Optional Modules

| Flag | Status | Adds |
|------|--------|------|
| `--with-vector-db` | ✅ Stable | Qdrant + Postgres + dual-store skills |
| `--with-frontend` | 🚧 v0.2 | Next.js + API route |
| `--with-multi-agent` | 🚧 v0.2 | CrewAI + LangFuse |

## SDD — 5 Phases

```
/brainstorm → Phase 1: Discovery            (Opus)
/define     → Phase 2: Requirements         (Opus)   Clarity Score ≥ 12/15
/design     → Phase 3: Architecture         (Opus)
/build      → Phase 4: TDD via subagents    (Sonnet)
/ship       → Phase 5: Verify + archive     (Sonnet)
```

## Running tests

```bash
uv run pytest tests/ --tb=short          # unit tests
uv run pytest evals/ -m fast             # fast behavioral evals (mocked)
uv run pytest evals/ -m llm              # real LLM evals (costs tokens)
```

## Requirements
- Python 3.11+
- [uv](https://docs.astral.sh/uv/)
- [Claude Code](https://claude.ai/code)
- Docker (with `--with-vector-db`)

## License
MIT
```

---

## Creation Sequence

```
1.  Create GitHub repo (public, MIT, Python .gitignore, template ✓)
2.  git clone && cd agentic-starter

    # Folders
3.  mkdir -p .github/workflows
4.  mkdir -p .claude/skills/{pydantic,langchain,python,tdd,observability,guardrails}
5.  mkdir -p .claude/skills/{brainstorm,define,design,build,ship}
6.  mkdir -p .claude/agents
7.  mkdir -p .templates/vector-db/skills/qdrant
8.  mkdir -p .templates/vector-db/skills/postgres
9.  mkdir -p .templates/vector-db/src
10. mkdir -p .templates/vector-db/tests
11. mkdir -p .templates/frontend .templates/multi-agent
12. mkdir -p spec tasks
13. mkdir -p src/project_name/observability
14. mkdir -p src/project_name/guardrails
15. mkdir -p evals/datasets
16. mkdir -p tests

    # CI
17. Create .github/workflows/ci.yml

    # Claude config
18. Create .claude/CLAUDE.md
19. Create .claude/settings.json
20. Create .claude/settings.local.json.example

    # Core skills
21. Create .claude/skills/pydantic/SKILL.md
22. Create .claude/skills/langchain/SKILL.md
23. Create .claude/skills/python/SKILL.md
24. Create .claude/skills/tdd/SKILL.md
25. Create .claude/skills/observability/SKILL.md
26. Create .claude/skills/guardrails/SKILL.md
27. Create .claude/skills/brainstorm/SKILL.md
28. Create .claude/skills/define/SKILL.md
29. Create .claude/skills/design/SKILL.md
30. Create .claude/skills/build/SKILL.md
31. Create .claude/skills/ship/SKILL.md

    # Subagents
32. Create .claude/agents/codebase-explorer.md
33. Create .claude/agents/test-writer.md
34. Create .claude/agents/implementer.md

    # Vector-db template sources
35. Create .templates/vector-db/skills/qdrant/SKILL.md
36. Create .templates/vector-db/skills/postgres/SKILL.md
37. Create .templates/vector-db/src/tools.py
38. Create .templates/vector-db/src/agent.py
39. Create .templates/vector-db/tests/test_tools.py
40. Create .templates/vector-db/docker-compose.yml

    # SDD spec templates
41. Create spec/01-brainstorm.md through spec/05-ship.md

    # Tasks
42. Create tasks/lessons.md

    # Source
43. Create src/project_name/__init__.py
44. Create src/project_name/models.py
45. Create src/project_name/config.py
46. Create src/project_name/observability/__init__.py
47. Create src/project_name/observability/tracer.py
48. Create src/project_name/guardrails/__init__.py
49. Create src/project_name/guardrails/validators.py
50. Create src/project_name/guardrails/retry.py

    # Evals
51. Create evals/__init__.py
52. Create evals/datasets/agent_behavior.json
53. Create evals/test_agent_behavior.py

    # Tests
54. Create tests/conftest.py
55. Create tests/test_models.py
56. Create tests/test_guardrails.py
57. Create tests/test_observability.py

    # Config and docs
58. Create pyproject.toml
59. Create .env.example
60. Create bootstrap.py
61. Create CONTRIBUTING.md
62. Create README.md
63. Create .gitignore

    # Publish
64. git add . && git commit -m "feat: agentic-starter v0.1"
65. git push origin main
66. GitHub: Settings → Template repository ✓
67. GitHub: Settings → Secrets → Add ANTHROPIC_API_KEY
```

---

## Changes from v4 (what was added)

| Addition | Why |
|----------|-----|
| `src/observability/tracer.py` | Measure tools called, latency, hallucination per invocation |
| `src/guardrails/validators.py` | Semantic validation beyond Pydantic schema |
| `src/guardrails/retry.py` | Auto-retry with backoff when guardrail fails |
| `evals/` with dataset + tests | Test agent intelligence, not just code |
| `.github/workflows/ci.yml` | Block broken commits automatically |
| `uv.lock` generated in bootstrap | Reproducible installs across machines |
| `--author` flag in bootstrap | Personalized `__author__` per project |
| `observability` + `guardrails` skills | Claude knows when and how to use these modules |
| Context compaction instructions in CLAUDE.md | Preserve right info during auto-compression |
| `@pytest.mark.llm` / `fast` / `slow` markers | Separate real API tests from CI-safe tests |

---

*agentic-starter · github.com/Juniordell/agentic-starter · MIT License*
