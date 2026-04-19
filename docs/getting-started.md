# Getting Started

This guide takes you from zero to a running project in under 10 minutes.

---

## Prerequisites

**Required:**
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) — the Python package manager this template uses

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

- [Claude Code](https://claude.ai/code) — the AI coding agent this template is built for

**Optional (only with `--with-vector-db`):**
- Docker

---

## Installation

### 1. Clone the template

```bash
git clone https://github.com/Juniordell/agentic-starter my-project
cd my-project
```

### 2. Run bootstrap

Bootstrap initializes your project: replaces placeholders, installs dependencies, generates `uv.lock`, and creates the first git commit.

**Minimal setup — Python + SDD + Guardrails + Observability:**
```bash
python bootstrap.py --name "My Project" --author "Your Name"
```

**With vector database (Qdrant + Postgres) — recommended for data-heavy projects:**
```bash
python bootstrap.py --name "My Project" --author "Your Name" --with-vector-db
```

**All bootstrap flags:**

| Flag | Description |
|------|-------------|
| `--name` | Project name — required |
| `--author` | Your name — fills `__author__` in the package |
| `--description` | One-line description — optional, defaults to a generic string |
| `--with-vector-db` | Adds Qdrant + Postgres + dual-store skills + docker-compose |
| `--skip-git` | Skip git init — useful if you already have a repo |

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values. The only required variable for the minimal setup is nothing — Claude Code handles authentication via CLI or VS Code extension automatically.

If you're using the Anthropic API directly (rare for most users):
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Start infrastructure (vector-db only)

```bash
docker compose up -d
# ✓ postgres:16 running on :5432
# ✓ qdrant:v1.13 running on :6333
```

### 5. Verify everything works

```bash
uv run pytest tests/ --tb=short
# All tests should pass
```

### 6. Open Claude Code

```bash
claude
```

### 7. Start your first feature

```
/brainstorm
```

This starts Phase 1 of SDD. Claude will ask discovery questions, propose approaches, and produce `spec/01-brainstorm.md`.

---

## What bootstrap does

Bootstrap is not just a rename script. It:

1. **Copies optional module files** from `.templates/` into the project — only the modules you requested
2. **Renames** `src/project_name/` to `src/your_module_name/`
3. **Replaces all placeholders** (`{{PROJECT_NAME}}`, `{{AUTHOR}}`, etc.) across every file
4. **Creates `.env`** from `.env.example`
5. **Runs `uv sync --dev`** and generates `uv.lock` — commit this file for reproducible builds
6. **Runs base tests** to confirm everything is working before the first commit
7. **Creates the first git commit** with `feat: initial setup — Your Project`

Bootstrap never deletes files from `.templates/` — re-running is always safe.

---

## Project structure after bootstrap

```
my-project/
├── .claude/
│   ├── CLAUDE.md              ← your project context (auto-filled by bootstrap)
│   ├── settings.json          ← hooks: ruff on edit, pytest on stop
│   ├── skills/                ← domain knowledge, loaded on demand
│   └── agents/                ← codebase-explorer, test-writer, implementer
├── spec/                      ← SDD phase templates (fill as you build)
├── tasks/lessons.md           ← Claude updates this after every correction
├── src/your_module/
│   ├── models.py              ← Pydantic data contracts
│   ├── config.py              ← centralized settings
│   ├── observability/         ← AgentTracer
│   └── guardrails/            ← validators + retry
├── evals/                     ← behavioral tests for agent intelligence
├── tests/                     ← unit tests
├── .github/workflows/ci.yml   ← CI: lint + types + tests + coverage
├── pyproject.toml
└── uv.lock                    ← commit this
```

---

## MCP configuration (optional)

If you're using `--with-vector-db` and want Claude Code to query Postgres and Qdrant directly via MCP:

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

Edit `.claude/settings.local.json` with your connection strings. This file is gitignored — never commit it.

---

## GitHub Actions setup

The CI workflow (`.github/workflows/ci.yml`) runs automatically on every push and pull request.

If your evals use the real API, add your key to GitHub secrets:

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add `ANTHROPIC_API_KEY`

CI only runs `@pytest.mark.fast` evals by default. Real LLM evals (`@pytest.mark.llm`) are meant to be run locally before release.

---

## Next steps

- Read [architecture.md](./architecture.md) to understand how all pieces fit together
- Read [sdd.md](./sdd.md) to understand the 5-phase methodology
- Read [guardrails.md](./guardrails.md) to write your own semantic validators
