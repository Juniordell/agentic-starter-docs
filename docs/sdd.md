# Spec-Driven Development (SDD)

SDD is the methodology baked into this template. It solves the most common failure mode in LLM-assisted development: building the wrong thing confidently and fast.

---

## The problem SDD solves

When you open Claude Code and say "build me a RAG pipeline for customer reviews," the agent will build something. It might be architecturally wrong, miss edge cases, or solve a slightly different problem than the one you had in mind.

The cost of discovering this at the end is high. The cost of discovering it at the spec stage is near zero.

SDD forces clarity before any code exists. The spec becomes the contract — and the agent builds against the contract, not against its interpretation of a vague prompt.

---

## Why it works with LLMs

LLMs are non-deterministic — the same prompt produces different output each time. But the **quality of the output** can be made consistent when you:

1. **Constrain the decision space** — a precise spec narrows what the model can produce
2. **Verify outputs against specs** — tests derived from acceptance criteria catch deviations
3. **Gate progression** — no phase advances without meeting its quality threshold

The result: non-deterministic generation × deterministic verification = consistent outcomes.

---

## The 5 phases

### Phase 1 — `/brainstorm` (Opus)

**Purpose:** Build a mental model before writing any spec.

What happens:
- Claude reads `CLAUDE.md` and `tasks/lessons.md` for project context
- The `codebase-explorer` subagent understands current project state
- Claude asks 5-6 discovery questions about what will be built
- 2-3 approaches are proposed with confidence scores (e.g. `[0.92]`)
- Best approach is recommended with justification

Output: `spec/01-brainstorm.md`

**Exit gate:** You can describe the full system end-to-end in 3 sentences. If you cannot, the mental model is not clear enough yet.

Why Opus: this phase requires the deepest reasoning — understanding tradeoffs, proposing architectures, asking the right questions. Opus is worth the cost here.

---

### Phase 2 — `/define` (Opus)

**Purpose:** Extract precise requirements before any design.

What happens:
- Requirements extracted with MoSCoW priorities (Must/Should/Could/Won't)
- Acceptance tests written in Given/When/Then format
- Pydantic input/output models defined for each feature
- Clarity Score calculated

**Clarity Score — 5 dimensions, 3 points each, target ≥ 12/15:**

| Dimension | 0 | 1 | 2 | 3 |
|-----------|---|---|---|---|
| Problem | Absent | Vague | Clear | Precise + impact |
| Users | Absent | Generic | Defined | With context |
| Goals | Absent | Vague | Measurable | With criteria |
| Success | Absent | Subjective | Measurable | With baseline |
| Scope | Absent | Ambiguous | Clear | Explicit limits |

Output: `spec/02-define.md`

**Exit gate:** Clarity Score >= 12/15. If below threshold, iterate with the user before advancing.

Why the score matters: a score of 8/15 means the spec has 4 dimensions where the agent will fill gaps with assumptions. Each assumption is a potential deviation from what you actually wanted.

---

### Phase 3 — `/design` (Opus)

**Purpose:** Define architecture and file manifest before any implementation.

What happens:
- Complete file manifest produced (one responsibility per file)
- Architecture diagram drawn (ASCII)
- Each file assigned to a responsible agent
- Technical decisions documented with justification

Output: `spec/03-design.md`

**Exit gate:** File manifest is complete and reviewed. No ambiguity about what gets built and where.

The manifest is the contract for Phase 4. The implementer subagent reads it and produces exactly those files — nothing more.

---

### Phase 4 — `/build` (Sonnet)

**Purpose:** Implement the design using TDD with isolated subagents.

The key innovation here is **context isolation**. Claude Code defaults to implementation-first when doing TDD in a single context window — the implementation bleeds into the test logic. Two separate subagents break this cycle:

**`test-writer`** — writes tests only. Reads the spec to understand WHAT is expected, never HOW it will be implemented. Produces failing tests (Red state).

**`implementer`** — reads the failing tests and writes the minimum code to make them pass (Green state). Never sees the test-writer's reasoning.

The cycle per file:
```
1. test-writer invoked  → tests written
2. uv run pytest        → confirm FAIL (Red)
3. implementer invoked  → production code written
4. uv run pytest        → confirm PASS (Green)
5. refactor             → uv run pytest again
```

Output: `spec/04-build.md` with files created, test results, coverage report.

**Exit gate:** pytest 100% green. Coverage >= 80%. No pending manifest files.

Why Sonnet: Phase 4 is execution, not reasoning. Sonnet handles it at lower cost. Opus is reserved for the phases where deep reasoning matters.

---

### Phase 5 — `/ship` (Sonnet)

**Purpose:** Verify, document, and archive institutional memory.

What happens:
- Full test suite run
- Infrastructure verified (if applicable)
- End-to-end flow tested manually
- README updated with what was built
- 3-5 learnings archived in `tasks/lessons.md`

Output: `spec/05-ship.md`

**Exit gate:** All checks green. `tasks/lessons.md` updated. README reflects current state.

---

## The `tasks/lessons.md` self-improvement loop

Every time you correct the agent, it appends an entry:

```markdown
## 2026-04-18 — SQL routing
- **Mistake:** Agent called semantic_search for a revenue question
- **Root cause:** "revenue" keyword missing from execute_sql docstring
- **Rule:** Always include "revenue" in execute_sql routing keywords
- **Skill updated:** langchain
```

Claude reads this file at the start of every session. The agent that opens your project tomorrow already knows what went wrong today.

---

## SDD vs. vibe coding

| | Vibe coding | SDD |
|--|------------|-----|
| How it starts | "Build me X" | /brainstorm |
| Requirements | Inferred from prompt | Explicit with acceptance tests |
| Architecture | Agent decides | You approve manifest |
| Tests | Written after (if at all) | Written before code |
| Mistakes | Discovered at runtime | Caught at the gate |
| Session continuity | Starts from scratch | Inherits all previous corrections |

---

## Clarity Score reference

**Score 6/15 (bad):**
> "Build something to analyze customer feedback"

- Problem: vague (1/3), Users: absent (0/3), Goals: none (0/3), Success: absent (0/3), Scope: unbounded (1/3)

**Score 14/15 (good):**
> "Build a query interface for 50K customer reviews in Qdrant. Users are internal analysts. Goal: reduce time-to-insight from 2 hours to 5 minutes. Success: 80%+ questions answered correctly without hallucination. Out of scope: real-time ingestion, authentication."

- Problem: 3/3, Users: 3/3, Goals: 3/3, Success: 2/3, Scope: 3/3
