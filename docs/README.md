# agentic-starter

**The Claude Code template built for precision — not just structure.**

Most AI templates give you folders and boilerplate. This one gives you a system that actively fights hallucination, tracks every agent decision, and enforces quality before any code ships.

```bash
git clone https://github.com/Juniordell/agentic-starter my-project
cd my-project
python bootstrap.py --name "My Project" --author "Your Name"
```

---

## The two problems this solves

**Hallucination** — the model answers without querying real data.
**Token waste** — the model receives context it doesn't need.

Every design decision in this template targets one of these two problems.

---

## How it works

```
Your question
     ↓
Agent (ReAct loop)
     ↓
Tool called → data retrieved
     ↓
Guardrail validates output
  → confidence < 0.7? retry
  → no source cited? retry
  → wrong tool used? retry
     ↓
AgentTracer records: tools called, steps, latency, hallucination flag
     ↓
Structured output (Pydantic) returned
```

If the agent answers without querying a source, the guardrail catches it and retries automatically — up to 3 times with exponential backoff.

---

## What's included

| Module | What it does |
|--------|-------------|
| `CLAUDE.md` | Agent context, rules, architecture — kept under 100 lines |
| `.claude/skills/` | Domain knowledge loaded on demand, not always consuming context |
| `.claude/agents/` | Isolated subagents for TDD — test-writer and implementer never share context |
| `src/guardrails/` | Semantic validators + retry loop with exponential backoff |
| `src/observability/` | Per-invocation traces: tools called, steps, latency, hallucination flag |
| `evals/` | Behavioral tests — verify routing decisions and hallucination resistance |
| `spec/` | SDD 5-phase templates with clarity gates |
| `tasks/lessons.md` | Self-improving loop — Claude updates this after every correction |
| `.github/workflows/ci.yml` | Blocks broken commits — ruff + mypy + pytest + coverage gate |

---

## Optional modules

```bash
# Add vector database (Qdrant + Postgres)
python bootstrap.py --name "My Project" --author "Your Name" --with-vector-db

# Coming in v0.2
# --with-frontend    Next.js + API route
# --with-multi-agent CrewAI + LangFuse
```

---

## The methodology: SDD in 5 phases

Every feature follows 5 phases. No phase can be skipped.

```
/brainstorm   Discover the problem space                    → Opus
/define       Extract requirements, Clarity Score ≥ 12/15  → Opus
/design       Architecture and file manifest                → Opus
/build        TDD via isolated subagents                    → Sonnet
/ship         Verify, archive lessons                       → Sonnet
```

Opus for thinking. Sonnet for building. The right model for each phase.

---

## Running tests

```bash
uv run pytest tests/ --tb=short          # unit tests
uv run pytest evals/ -m fast             # behavioral evals (mocked, CI-safe)
uv run pytest evals/ -m llm              # real LLM evals (run before release)
```

---

## Requirements

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- [Claude Code](https://claude.ai/code)
- Docker — only with `--with-vector-db`

---

## Documentation

Full documentation lives in [`/docs`](./docs):

| File | Contents |
|------|----------|
| [getting-started.md](./docs/getting-started.md) | Installation, first run, bootstrap flags |
| [architecture.md](./docs/architecture.md) | How all pieces fit together |
| [sdd.md](./docs/sdd.md) | SDD methodology — the 5 phases in depth |
| [guardrails.md](./docs/guardrails.md) | How guardrails work, writing custom validators |
| [observability.md](./docs/observability.md) | AgentTracer, reading traces, debugging |
| [evals.md](./docs/evals.md) | Behavioral evals — writing and running them |

---

## License

MIT — use it, fork it, build on it.

---

*Built by [Nelson Dell](https://linkedin.com/in/nelson-dell) · [github.com/Juniordell/agentic-starter](https://github.com/Juniordell/agentic-starter)*
