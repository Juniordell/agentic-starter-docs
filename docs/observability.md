# Observability

Observability answers the question you can't answer otherwise: what exactly did the agent do?

Without it, when an agent produces a wrong answer you have no idea if it used the wrong tool, skipped a tool entirely, looped too many times, or just got unlucky. With it, every invocation produces a structured record you can read, log, and alert on.

---

## `AgentTracer` — the core primitive

`AgentTracer` is a context manager that wraps every agent invocation.

```python
from src.project_name.observability.tracer import AgentTracer

with AgentTracer(question="What is total revenue?") as tracer:
    result = agent.invoke({"messages": [("user", question)]})
    tracer.set_output(answer=result_text, confidence=0.95)

trace = tracer.trace
```

After the `with` block exits:
- `trace.latency_ms` is set automatically
- `trace.hallucinated` is evaluated automatically
- The trace is logged via `logger.info()`

---

## The `AgentTrace` data model

```python
@dataclass
class AgentTrace:
    question: str           # the original question
    steps: list[AgentStep]  # each ReAct cycle recorded
    tools_called: list[str] # tool names in order of invocation
    final_answer: str       # the agent's final response
    confidence: float       # from structured output
    total_steps: int        # number of ReAct cycles
    latency_ms: float       # total wall time
    hallucinated: bool      # True if answered without calling any tool
    error: str | None       # exception message if invocation failed
```

---

## Recording tool calls

When you build custom tools, record them manually inside the tool function:

```python
# In your agent setup
tracer = current_tracer  # pass tracer through context or global

@tool
def execute_sql(keyword: str) -> str:
    """..."""
    start = time.monotonic()
    result = run_query(keyword)
    latency = (time.monotonic() - start) * 1000

    tracer.record_tool_call(
        tool_name="execute_sql",
        tool_input={"keyword": keyword},
        tool_output=str(result),
        latency_ms=latency
    )
    return str(result)
```

Each call adds an `AgentStep` to `trace.steps` and appends the tool name to `trace.tools_called`.

---

## Hallucination detection

Hallucination is detected automatically when `set_output()` is called:

```python
def set_output(self, answer: str, confidence: float | None = None) -> None:
    self.trace.final_answer = answer
    self.trace.confidence = confidence

    # If the agent produced an answer but called no tools → hallucination
    if not self.trace.tools_called and answer:
        self.trace.mark_hallucinated()
```

`mark_hallucinated()` sets `trace.hallucinated = True` and logs a warning with the question and step count. This is a heuristic — it catches the most common hallucination pattern (answering from memory) but does not catch all hallucinations.

The `SourceValidator` in the guardrails layer uses `trace.tools_called` to make the same check and trigger a retry.

---

## Reading traces

### In development

Traces are logged via Python's standard logging module:

```python
# In config.py
logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
```

Set `LOG_LEVEL=DEBUG` in `.env` to see all trace output including backoff delays.

A typical successful trace looks like:

```
2026-04-18 14:23:01 | INFO | tracer | Agent trace complete
  question=What is total revenue?
  tools_called=['execute_sql']
  total_steps=2
  latency_ms=1240.5
  confidence=0.95
  hallucinated=False
```

A hallucinated trace:

```
2026-04-18 14:23:15 | WARNING | tracer | Hallucination detected
  question=What is total revenue?
  tools_called=[]
  total_steps=0
```

### Using `trace.to_dict()`

For custom logging, metrics, or storage:

```python
output, trace = validated_invoke(agent=agent, question=question)

# Structured dict — easy to send to any logging backend
trace_data = trace.to_dict()
# {
#   "question": "What is total revenue?",
#   "tools_called": ["execute_sql"],
#   "total_steps": 2,
#   "latency_ms": 1240.5,
#   "confidence": 0.95,
#   "hallucinated": False,
#   "error": None
# }
```

---

## What to monitor over time

Once you have multiple traces, track these metrics to understand agent quality:

| Metric | How to compute | Why it matters |
|--------|---------------|----------------|
| Hallucination rate | `hallucinated == True` / total invocations | Rising rate = prompt drift or data quality issue |
| Average confidence | mean of `confidence` | Falling average = model becoming less certain |
| Average steps | mean of `total_steps` | Rising steps = routing inefficiency |
| Average latency | mean of `latency_ms` | Rising latency = more retries or longer loops |
| Guardrail fire rate | retries > 0 / total invocations | Rising rate = systematic validation failures |
| Tool distribution | frequency of each tool | Uneven distribution = routing imbalance |

---

## Error handling

If an exception occurs inside the `with AgentTracer()` block, `trace.error` is set and the exception propagates normally:

```python
try:
    with AgentTracer(question=question) as tracer:
        result = agent.invoke(...)  # raises ConnectionError
except ConnectionError:
    print(tracer.trace.error)  # "Connection refused"
    print(tracer.trace.latency_ms)  # time until failure
```

The trace is still logged with `error` set — useful for understanding when and why infrastructure failures happen relative to agent activity.

---

## Testing observability

Tests for the observability module live in `tests/test_observability.py`. They verify:

- `AgentTracer` sets `latency_ms` correctly
- `record_tool_call()` accumulates steps
- `set_output()` triggers hallucination detection when tools are empty
- Exceptions are captured in `trace.error`

Run them with:

```bash
uv run pytest tests/test_observability.py -v
```

---

## Common mistakes

**Mistake:** Logging raw prompts in production.
**Fix:** Log `question`, `tools_called`, and `confidence` — not the full prompt text. Prompts may contain PII or sensitive business data.

**Mistake:** Using `print()` for trace output.
**Fix:** Use `logger.info()` / `logger.warning()`. Structured logging integrates with any log aggregation system. Print statements disappear in production.

**Mistake:** Not checking `trace.hallucinated` after invocation.
**Fix:** Always check — or use `validated_invoke()` which checks automatically via `SourceValidator`.

**Mistake:** Ignoring high `total_steps` values.
**Fix:** Steps > 5 for a simple question indicates routing confusion. Check the tool docstrings and update the `langchain` skill.
