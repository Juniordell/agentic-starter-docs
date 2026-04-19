export type CodeBlock = { lang: string; content: string };

export type DocSection = {
  heading?: string;
  body?: string;
  code?: CodeBlock;
  table?: { headers: string[]; rows: string[][] };
  callout?: { type: "info" | "warning" | "tip"; text: string };
};

export type DocContent = {
  title: string;
  description?: string;
  sections: DocSection[];
};

const content: Record<string, DocContent> = {
  introduction: {
    title: "Introduction",
    description: "The Claude Code template built for precision — not just structure.",
    sections: [
      {
        body: `**agentic-starter** is an open-source GitHub template for AI-powered projects with Claude Code, focused on reducing hallucination and optimizing token usage through structured outputs, guardrails, observability, and SDD methodology.`,
      },
      {
        body: `Most AI templates give you folders and boilerplate. This one gives you a system that actively fights hallucination, tracks every agent decision, and enforces quality before any code ships.`,
      },
      {
        heading: "The two problems this solves",
        body: `**Hallucination** — the model answers without querying real data.\n**Token waste** — the model receives context it doesn't need.\n\nEvery design decision in this template targets one of these two problems.`,
      },
      {
        heading: "How it works",
        code: {
          lang: "text",
          content: `Your question
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
Structured output (Pydantic) returned`,
        },
      },
      {
        callout: {
          type: "tip",
          text: "If the agent answers without querying a source, the guardrail catches it and retries automatically — up to 3 times with exponential backoff.",
        },
      },
      {
        heading: "What's included",
        table: {
          headers: ["Module", "What it does"],
          rows: [
            ["`CLAUDE.md`", "Agent context, rules, architecture — kept under 100 lines"],
            ["`.claude/skills/`", "Domain knowledge loaded on demand, not always consuming context"],
            ["`.claude/agents/`", "Isolated subagents for TDD — test-writer and implementer never share context"],
            ["`src/guardrails/`", "Semantic validators + retry loop with exponential backoff"],
            ["`src/observability/`", "Per-invocation traces: tools called, steps, latency, hallucination flag"],
            ["`evals/`", "Behavioral tests — verify routing decisions and hallucination resistance"],
            ["`spec/`", "SDD 5-phase templates with clarity gates"],
            ["`tasks/lessons.md`", "Self-improving loop — Claude updates this after every correction"],
            ["`.github/workflows/ci.yml`", "Blocks broken commits — ruff + mypy + pytest + coverage gate"],
          ],
        },
      },
      {
        heading: "Quick start",
        code: {
          lang: "bash",
          content: `git clone https://github.com/Juniordell/agentic-starter my-project
cd my-project
python bootstrap.py --name "My Project" --author "Your Name"`,
        },
      },
    ],
  },

  "getting-started": {
    title: "Getting Started",
    description: "From zero to a running project in under 10 minutes.",
    sections: [
      {
        heading: "Prerequisites",
        body: `**Required:**\n- Python 3.11+\n- [uv](https://docs.astral.sh/uv/) — the Python package manager this template uses\n- [Claude Code](https://claude.ai/code) — the AI coding agent this template is built for\n\n**Optional (only with \`--with-vector-db\`):**\n- Docker`,
      },
      {
        heading: "Install uv",
        code: { lang: "bash", content: `curl -LsSf https://astral.sh/uv/install.sh | sh` },
      },
      {
        heading: "1. Clone the template",
        code: {
          lang: "bash",
          content: `git clone https://github.com/Juniordell/agentic-starter my-project\ncd my-project`,
        },
      },
      {
        heading: "2. Run bootstrap",
        body: "Bootstrap initializes your project: replaces placeholders, installs dependencies, generates `uv.lock`, and creates the first git commit.",
        code: {
          lang: "bash",
          content: `# Minimal — Python + SDD + Guardrails + Observability
python bootstrap.py --name "My Project" --author "Your Name"

# With vector database (Qdrant + Postgres) — recommended for data-heavy projects
python bootstrap.py --name "My Project" --author "Your Name" --with-vector-db`,
        },
      },
      {
        heading: "Bootstrap flags",
        table: {
          headers: ["Flag", "Description"],
          rows: [
            ["`--name`", "Project name — required"],
            ["`--author`", "Your name — fills `__author__` in the package"],
            ["`--description`", "One-line description — optional"],
            ["`--with-vector-db`", "Adds Qdrant + Postgres + dual-store skills + docker-compose"],
            ["`--skip-git`", "Skip git init — useful if you already have a repo"],
          ],
        },
      },
      {
        heading: "3. Configure environment",
        code: { lang: "bash", content: `cp .env.example .env\n# Fill in ANTHROPIC_API_KEY if using the API directly` },
      },
      {
        heading: "4. Verify everything works",
        code: { lang: "bash", content: `uv run pytest tests/ --tb=short\n# All tests should pass` },
      },
      {
        heading: "5. Open Claude Code and start building",
        code: { lang: "bash", content: `claude\n# Then in Claude Code:\n/brainstorm` },
      },
      {
        callout: {
          type: "info",
          text: "/brainstorm starts Phase 1 of SDD. Claude will ask discovery questions, propose approaches, and produce spec/01-brainstorm.md.",
        },
      },
      {
        heading: "Project structure after bootstrap",
        code: {
          lang: "text",
          content: `my-project/
├── .claude/
│   ├── CLAUDE.md              ← your project context (auto-filled by bootstrap)
│   ├── settings.json          ← hooks: ruff on edit, pytest on stop
│   ├── skills/                ← domain knowledge, loaded on demand
│   └── agents/                ← codebase-explorer, test-writer, implementer
├── spec/                      ← SDD phase templates
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
└── uv.lock                    ← commit this`,
        },
      },
      {
        heading: "Optional modules",
        table: {
          headers: ["Flag", "Status", "Adds"],
          rows: [
            ["`--with-vector-db`", "✅ Stable", "Qdrant + Postgres + dual-store skills + docker-compose"],
            ["`--with-frontend`", "🚧 v0.2", "Next.js + API route + TypeScript"],
            ["`--with-multi-agent`", "🚧 v0.2", "CrewAI + LangFuse observability"],
          ],
        },
      },
    ],
  },

  architecture: {
    title: "Architecture",
    description: "How all pieces of agentic-starter fit together and why each decision was made.",
    sections: [
      {
        heading: "The core problem",
        body: `LLM systems fail in two predictable ways:\n\n**Hallucination** — the model answers confidently without querying real data. It fills gaps with plausible-sounding invention.\n\n**Token waste** — the model receives context it doesn't need. Every irrelevant token dilutes attention and increases cost.\n\nEvery architectural decision in this template targets one of these two problems explicitly.`,
      },
      {
        heading: "System overview",
        code: {
          lang: "text",
          content: `User question
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
                    └─ All retries exhausted → GuardrailError raised`,
        },
      },
      {
        heading: "Layer 1 — Context management (.claude/)",
        body: `**\`CLAUDE.md\`** — always-on context. Kept under 100 lines intentionally. Contains: project description, architecture, mandatory rules, SDD phases, available skills and agents. Bloated CLAUDE.md causes the model to ignore rules buried deep.\n\n**\`skills/\`** — on-demand context. Each skill is a folder with a \`SKILL.md\` that Claude loads only when relevant. A pydantic skill doesn't consume context during a SQL task.\n\n**\`agents/\`** — specialized subagents with isolated context windows: \`codebase-explorer\`, \`test-writer\`, \`implementer\`.\n\n**\`settings.json\`** — deterministic hooks. \`PostToolUse\` runs ruff after every file edit, \`Stop\` runs pytest when Claude finishes a task.`,
      },
      {
        heading: "Layer 2 — Data contracts (models.py)",
        body: "Pydantic models are the contract layer between every component. No raw dicts circulate between layers.",
        code: {
          lang: "python",
          content: `class QueryOutput(BaseModel):
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    sources: list[str] = Field(default_factory=list)`,
        },
      },
      {
        heading: "Layer 3 — Guardrails",
        table: {
          headers: ["Validator", "What it checks"],
          rows: [
            ["`ConfidenceValidator`", "Rejects responses with confidence below threshold (default: 0.7)"],
            ["`SourceValidator`", "Rejects responses where no tool was called — model answered from memory"],
            ["`ToolRoutingValidator`", "Rejects responses where the wrong tool was used for the question type"],
          ],
        },
      },
      {
        heading: "Layer 4 — Observability",
        code: {
          lang: "python",
          content: `with AgentTracer(question=question) as tracer:
    result = agent.invoke({"messages": [("user", question)]})
    tracer.set_output(result)

trace = tracer.trace
# trace.tools_called    → ["execute_sql"]
# trace.total_steps     → 2
# trace.latency_ms      → 1240.5
# trace.hallucinated    → False`,
        },
      },
      {
        heading: "Token optimization",
        table: {
          headers: ["Mechanism", "Tokens saved"],
          rows: [
            ["Skills load on-demand", "A 150-line skill not loaded = ~150 tokens saved per turn"],
            ["CLAUDE.md ≤ 100 lines", "vs. common 500+ line configs = ~400 tokens saved per turn"],
            ["Subagent isolation", "Each subagent starts with clean context = no history accumulation"],
            ["Compaction instructions", "Preserves signal, discards noise during auto-compression"],
          ],
        },
      },
      {
        heading: "Hallucination reduction",
        table: {
          headers: ["Mechanism", "Hallucination type caught"],
          rows: [
            ["`SourceValidator`", "Model answered without querying any data source"],
            ["`ConfidenceValidator`", "Model expressed uncertainty in its output"],
            ["`ToolRoutingValidator`", "Model used the wrong tool for the question type"],
            ["`AgentTracer.hallucinated`", "Model produced answer with zero tool calls"],
            ["Retry loop", "Transient failures that would otherwise produce bad responses"],
            ["Pydantic structured outputs", "Model invented a field value outside allowed constraints"],
          ],
        },
      },
    ],
  },

  sdd: {
    title: "SDD Methodology",
    description: "Spec-Driven Development — the 5-phase methodology baked into agentic-starter.",
    sections: [
      {
        heading: "The problem SDD solves",
        body: `When you open Claude Code and say "build me a RAG pipeline for customer reviews," the agent will build something. It might be architecturally wrong, miss edge cases, or solve a slightly different problem than the one you had in mind.\n\nThe cost of discovering this at the end is high. The cost of discovering it at the spec stage is near zero.\n\nSDD forces clarity before any code exists. The spec becomes the contract — and the agent builds against the contract, not against its interpretation of a vague prompt.`,
      },
      {
        heading: "The 5 phases",
        code: {
          lang: "text",
          content: `/brainstorm   Discover the problem space                    → Opus
/define       Extract requirements, Clarity Score ≥ 12/15  → Opus
/design       Architecture and file manifest                → Opus
/build        TDD via isolated subagents                    → Sonnet
/ship         Verify, archive lessons                       → Sonnet`,
        },
      },
      {
        callout: { type: "tip", text: "Opus for thinking. Sonnet for building. The right model for each phase." },
      },
      {
        heading: "Phase 1 — /brainstorm (Opus)",
        body: `**Purpose:** Build a mental model before writing any spec.\n\n- Claude reads \`CLAUDE.md\` and \`tasks/lessons.md\` for project context\n- The \`codebase-explorer\` subagent understands current project state\n- Claude asks 5-6 discovery questions about what will be built\n- 2-3 approaches are proposed with confidence scores (e.g. \`[0.92]\`)\n\n**Output:** \`spec/01-brainstorm.md\`\n\n**Exit gate:** You can describe the full system end-to-end in 3 sentences.`,
      },
      {
        heading: "Phase 2 — /define (Opus)",
        body: `**Purpose:** Extract precise requirements before any design.\n\n- Requirements extracted with MoSCoW priorities\n- Acceptance tests written in Given/When/Then format\n- Pydantic input/output models defined for each feature\n- Clarity Score calculated\n\n**Exit gate:** Clarity Score ≥ 12/15`,
      },
      {
        heading: "Clarity Score — 5 dimensions, 3 points each",
        table: {
          headers: ["Dimension", "0", "1", "2", "3"],
          rows: [
            ["Problem", "Absent", "Vague", "Clear", "Precise + impact"],
            ["Users", "Absent", "Generic", "Defined", "With context"],
            ["Goals", "Absent", "Vague", "Measurable", "With criteria"],
            ["Success", "Absent", "Subjective", "Measurable", "With baseline"],
            ["Scope", "Absent", "Ambiguous", "Clear", "Explicit limits"],
          ],
        },
      },
      {
        heading: "Phase 3 — /design (Opus)",
        body: `**Purpose:** Define architecture and file manifest before any implementation.\n\n- Complete file manifest produced (one responsibility per file)\n- Architecture diagram drawn (ASCII)\n- Each file assigned to a responsible agent\n- Technical decisions documented with justification\n\n**Output:** \`spec/03-design.md\`\n\n**Exit gate:** File manifest is complete and reviewed.`,
      },
      {
        heading: "Phase 4 — /build (Sonnet)",
        body: `**Purpose:** Implement the design using TDD with isolated subagents.\n\n**\`test-writer\`** — writes tests only. Reads the spec to understand WHAT is expected, never HOW it will be implemented. Produces failing tests (Red state).\n\n**\`implementer\`** — reads the failing tests and writes the minimum code to make them pass (Green state). Never sees the test-writer's reasoning.`,
        code: {
          lang: "text",
          content: `1. test-writer invoked  → tests written
2. uv run pytest        → confirm FAIL (Red)
3. implementer invoked  → production code written
4. uv run pytest        → confirm PASS (Green)
5. refactor             → uv run pytest again`,
        },
      },
      {
        heading: "Phase 5 — /ship (Sonnet)",
        body: `**Purpose:** Verify, document, and archive institutional memory.\n\n- Full test suite run\n- README updated with what was built\n- 3-5 learnings archived in \`tasks/lessons.md\`\n\n**Exit gate:** All checks green. \`tasks/lessons.md\` updated.`,
      },
      {
        heading: "The tasks/lessons.md self-improvement loop",
        body: "Every time you correct the agent, it appends an entry. Claude reads this file at the start of every session — the agent that opens your project tomorrow already knows what went wrong today.",
        code: {
          lang: "markdown",
          content: `## 2026-04-18 — SQL routing
- **Mistake:** Agent called semantic_search for a revenue question
- **Root cause:** "revenue" keyword missing from execute_sql docstring
- **Rule:** Always include "revenue" in execute_sql routing keywords
- **Skill updated:** langchain`,
        },
      },
      {
        heading: "SDD vs. vibe coding",
        table: {
          headers: ["", "Vibe coding", "SDD"],
          rows: [
            ["How it starts", '"Build me X"', "/brainstorm"],
            ["Requirements", "Inferred from prompt", "Explicit with acceptance tests"],
            ["Architecture", "Agent decides", "You approve manifest"],
            ["Tests", "Written after (if at all)", "Written before code"],
            ["Mistakes", "Discovered at runtime", "Caught at the gate"],
            ["Session continuity", "Starts from scratch", "Inherits all previous corrections"],
          ],
        },
      },
    ],
  },

  guardrails: {
    title: "Guardrails",
    description: "The layer between the agent's output and your users.",
    sections: [
      {
        heading: "The problem guardrails solve",
        body: `Pydantic validates that \`confidence\` is a float between 0 and 1. It cannot validate whether the agent actually queried a database before claiming to know the answer.\n\nSchema validation = correct structure.\nSemantic validation = correct meaning.\n\nBoth are required. Neither alone is sufficient.`,
      },
      {
        heading: "The three validation levels",
        body: `**Level 1 — Schema (Pydantic):** Catches wrong types, values out of range, missing required fields.\n\n**Level 2 — Semantic (Guardrails layer):** Catches model answered without querying data, wrong tool used, expressed uncertainty.\n\n**Level 3 — Behavioral (Evals):** Catches systematic routing failures across multiple questions.`,
      },
      {
        heading: "The entry point: validated_invoke()",
        callout: { type: "warning", text: "Never call agent.invoke() directly. Always use validated_invoke()." },
      },
      {
        code: {
          lang: "python",
          content: `from src.project_name.guardrails.retry import validated_invoke

output, trace = validated_invoke(
    agent=agent,
    question="What is total revenue this month?",
)
# Default validators: ConfidenceValidator(0.7) + SourceValidator()
# Returns: (QueryOutput, AgentTrace)`,
        },
      },
      {
        heading: "ConfidenceValidator",
        body: "Rejects responses where the model expressed low confidence. Fires when `output.confidence < min_confidence`.",
        code: {
          lang: "python",
          content: `from src.project_name.guardrails.validators import ConfidenceValidator

validator = ConfidenceValidator(min_confidence=0.7, question=question)`,
        },
      },
      {
        heading: "SourceValidator",
        body: "Rejects responses where the agent produced an answer without calling any tool. Fires when `trace.tools_called == []` and `output.answer != \"\"`.",
        code: {
          lang: "python",
          content: `from src.project_name.guardrails.validators import SourceValidator

validator = SourceValidator(question=question)`,
        },
      },
      {
        heading: "ToolRoutingValidator",
        body: "Rejects responses where the agent used the wrong tool for the question type.",
        code: {
          lang: "python",
          content: `from src.project_name.guardrails.validators import ToolRoutingValidator

validator = ToolRoutingValidator(
    question="What is total revenue?",
    expected_tool="execute_sql",
    trigger_keywords=["revenue", "total", "count", "average"]
)`,
        },
      },
      {
        heading: "Writing a custom validator",
        code: {
          lang: "python",
          content: `from src.project_name.guardrails.validators import SemanticValidator

class FreshDataValidator(SemanticValidator):
    def __init__(self, max_age_hours: int = 24, **kwargs) -> None:
        super().__init__(**kwargs)
        self.max_age_hours = max_age_hours

    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        for source in output.sources:
            if "stale" in source or "cached" in source:
                self.failure_reason = f"Stale data source: {source}"
                return False
        return True`,
        },
      },
      {
        heading: "Handling GuardrailError",
        code: {
          lang: "python",
          content: `from src.project_name.guardrails.retry import validated_invoke, GuardrailError

try:
    output, trace = validated_invoke(agent=agent, question=question)
except GuardrailError as e:
    print(f"Failed after {e.attempts} attempts: {e.reason}")`,
        },
      },
      {
        heading: "Configuring retry behavior",
        code: {
          lang: "python",
          content: `output, trace = validated_invoke(
    agent=agent,
    question=question,
    max_retries=5,       # default: 3
    backoff_base=2.0,    # default: 1.5 → delays: 2s, 4s, 8s, 16s, 32s
)`,
        },
      },
      {
        heading: "Common mistakes",
        body: `**Calling \`agent.invoke()\` directly** → always use \`validated_invoke()\`.\n\n**Validators too strict** → causes false retries. Test against real agent outputs.\n\n**Swallowing \`GuardrailError\` silently** → always log it. It means the agent failed multiple times.\n\n**Validating inside the agent loop** → validate the final output only.`,
      },
    ],
  },

  observability: {
    title: "Observability",
    description: "Answers the question you can't answer otherwise: what exactly did the agent do?",
    sections: [
      {
        body: "Without observability, when an agent produces a wrong answer you have no idea if it used the wrong tool, skipped a tool entirely, looped too many times, or just got unlucky. With it, every invocation produces a structured record you can read, log, and alert on.",
      },
      {
        heading: "AgentTracer — the core primitive",
        code: {
          lang: "python",
          content: `from src.project_name.observability.tracer import AgentTracer

with AgentTracer(question="What is total revenue?") as tracer:
    result = agent.invoke({"messages": [("user", question)]})
    tracer.set_output(answer=result_text, confidence=0.95)

trace = tracer.trace
# trace.latency_ms    → set automatically
# trace.hallucinated  → evaluated automatically`,
        },
      },
      {
        heading: "The AgentTrace data model",
        code: {
          lang: "python",
          content: `@dataclass
class AgentTrace:
    question: str           # the original question
    steps: list[AgentStep]  # each ReAct cycle recorded
    tools_called: list[str] # tool names in order of invocation
    final_answer: str       # the agent's final response
    confidence: float       # from structured output
    total_steps: int        # number of ReAct cycles
    latency_ms: float       # total wall time
    hallucinated: bool      # True if answered without calling any tool
    error: str | None       # exception message if invocation failed`,
        },
      },
      {
        heading: "Recording tool calls",
        code: {
          lang: "python",
          content: `tracer.record_tool_call(
    tool_name="execute_sql",
    tool_input={"keyword": "revenue"},
    tool_output=str(result),
    latency_ms=latency
)`,
        },
      },
      {
        heading: "Hallucination detection",
        body: "Detected automatically when `set_output()` is called. If the agent produced an answer but called no tools → `trace.hallucinated = True` and a warning is logged.",
        code: {
          lang: "python",
          content: `def set_output(self, answer: str, confidence: float | None = None) -> None:
    self.trace.final_answer = answer
    self.trace.confidence = confidence
    # If agent answered without querying any tool → hallucination
    if not self.trace.tools_called and answer:
        self.trace.mark_hallucinated()`,
        },
      },
      {
        heading: "Reading traces in development",
        body: "Traces are logged via Python's standard logging module. Set `LOG_LEVEL=DEBUG` in `.env` to see all trace output.",
        code: {
          lang: "text",
          content: `# Successful trace
2026-04-18 14:23:01 | INFO  | tracer | Agent trace complete
  question=What is total revenue?
  tools_called=['execute_sql']
  total_steps=2
  latency_ms=1240.5
  confidence=0.95
  hallucinated=False

# Hallucinated trace
2026-04-18 14:23:15 | WARNING | tracer | Hallucination detected
  question=What is total revenue?
  tools_called=[]
  total_steps=0`,
        },
      },
      {
        heading: "What to monitor over time",
        table: {
          headers: ["Metric", "How to compute", "Why it matters"],
          rows: [
            ["Hallucination rate", "`hallucinated == True` / total", "Rising rate = prompt drift or data quality issue"],
            ["Average confidence", "mean of `confidence`", "Falling average = model becoming less certain"],
            ["Average steps", "mean of `total_steps`", "Rising steps = routing inefficiency"],
            ["Average latency", "mean of `latency_ms`", "Rising latency = more retries or longer loops"],
            ["Guardrail fire rate", "retries > 0 / total", "Rising rate = systematic validation failures"],
          ],
        },
      },
      {
        heading: "Common mistakes",
        body: `**Logging raw prompts in production** → log \`question\`, \`tools_called\`, \`confidence\` instead. Prompts may contain PII.\n\n**Using print() for traces** → use \`logger.info()\` / \`logger.warning()\`. Structured logging integrates with any log aggregation system.\n\n**Ignoring high \`total_steps\` values** → steps > 5 for a simple question indicates routing confusion. Check the tool docstrings.`,
      },
    ],
  },

  evals: {
    title: "Evals",
    description: "Unit tests verify your code is correct. Evals verify your agent is intelligent.",
    sections: [
      {
        body: `**Unit tests** live in \`tests/\` and run on every CI build. Fast, cheap, deterministic — test code behavior.\n\n**Evals** live in \`evals/\` and run selectively. Some use mocks (fast, CI-safe), some call the real LLM API (slow, costs tokens, only run before release).`,
      },
      {
        heading: "Test markers",
        code: {
          lang: "python",
          content: `@pytest.mark.fast   # mocked — runs in CI, zero cost
@pytest.mark.llm    # real API — run locally before release
@pytest.mark.slow   # takes > 5 seconds`,
        },
      },
      {
        heading: "Running evals",
        code: {
          lang: "bash",
          content: `uv run pytest tests/ --tb=short          # unit tests
uv run pytest evals/ -m fast             # fast behavioral evals (mocked, CI-safe)
uv run pytest evals/ -m llm              # real LLM evals (run before release)
uv run pytest evals/ -v                  # all evals`,
        },
      },
      {
        heading: "The ground truth dataset",
        code: {
          lang: "json",
          content: `{
  "version": "1.0",
  "cases": [
    {
      "id": "sql-routing-01",
      "question": "What is the total revenue this month?",
      "expected_tool": "execute_sql",
      "must_not_use_tool": "semantic_search",
      "tags": ["routing", "sql", "numeric"]
    },
    {
      "id": "hallucination-01",
      "question": "What is the revenue of a customer named XYZ_NONEXISTENT?",
      "expected_behavior": "acknowledge_no_data",
      "must_not_hallucinate": true,
      "tags": ["hallucination", "edge-case"]
    }
  ]
}`,
        },
      },
      {
        heading: "Fast eval (mocked)",
        code: {
          lang: "python",
          content: `@pytest.mark.fast
def test_numeric_question_routes_to_sql(self, mock_agent_sql):
    """Revenue questions must use execute_sql, never semantic_search."""
    case = CASES["sql-routing-01"]
    trace = mock_agent_sql.last_trace

    assert case["expected_tool"] in trace.tools_called
    assert case.get("must_not_use_tool") not in trace.tools_called`,
        },
      },
      {
        heading: "LLM eval (real API)",
        code: {
          lang: "python",
          content: `@pytest.mark.llm
@pytest.mark.slow
def test_agent_routes_revenue_to_sql(self, real_agent):
    """
    REAL LLM TEST: Agent must call execute_sql for revenue questions.
    If this fails, the tool docstrings need improvement.
    """
    output, trace = validated_invoke(
        agent=real_agent,
        question=CASES["sql-routing-01"]["question"],
        max_retries=2,
    )

    assert "execute_sql" in trace.tools_called, (
        "Agent did not use SQL for a revenue question. "
        "Check the execute_sql docstring routing keywords."
    )
    assert trace.hallucinated is False`,
        },
      },
      {
        heading: "What makes a good eval case",
        body: `**Good:** Tests a specific routing decision with a clear assertion and a diagnostic failure message.\n\n**Good:** Tests edge cases — questions where the right tool is not obvious, questions about non-existent data, questions that combine multiple data sources.\n\n**Bad:** \`assert output.answer\` — this passes even if the answer is hallucinated.\n\n**Bad:** Tests only the happy path.`,
      },
      {
        heading: "Evals vs. guardrails",
        body: `**Guardrails** catch bad responses at runtime — the safety net in production.\n\n**Evals** catch systematic problems before production — the quality gate before release.\n\nA validator catches a specific instance of a routing error. An eval catches when your prompts have drifted and routing errors are happening consistently. You need both.`,
      },
    ],
  },
};

export function getDocContent(slug: string): DocContent | null {
  return content[slug] ?? null;
}
