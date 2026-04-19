# Guardrails

Guardrails are the layer between the agent's output and your users. They catch what Pydantic can't — not structural errors, but semantic ones.

---

## The problem guardrails solve

Pydantic validates that `confidence` is a float between 0 and 1. It cannot validate whether the agent actually queried a database before claiming to know the answer.

Schema validation = correct structure.
Semantic validation = correct meaning.

Both are required. Neither alone is sufficient.

---

## The three validation levels

### Level 1 — Schema (Pydantic)
Already in every model. Catches: wrong types, values out of range, missing required fields.

```python
class QueryOutput(BaseModel):
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)  # schema validation
    sources: list[str] = Field(default_factory=list)
```

### Level 2 — Semantic (Guardrails layer)
Catches: model answered without querying data, model used wrong tool, model expressed uncertainty.

### Level 3 — Behavioral (Evals)
Catches: model consistently makes wrong routing decisions across multiple questions. See [evals.md](./evals.md).

---

## The entry point: `validated_invoke()`

Never call `agent.invoke()` directly. Always use `validated_invoke()`:

```python
from src.project_name.guardrails.retry import validated_invoke

output, trace = validated_invoke(
    agent=agent,
    question="What is total revenue this month?",
)
```

What it does:
1. Calls `agent.invoke()` inside an `AgentTracer` context
2. Runs semantic validators on the output
3. If validation fails, retries with exponential backoff (1.5s → 2.25s → 3.375s)
4. After `max_retries` exhausted, raises `GuardrailError`
5. Returns `(QueryOutput, AgentTrace)` on success

Default validators applied automatically:
- `ConfidenceValidator(min_confidence=0.7)`
- `SourceValidator()`

---

## Built-in validators

### `ConfidenceValidator`

Rejects responses where the model expressed low confidence.

```python
from src.project_name.guardrails.validators import ConfidenceValidator

validator = ConfidenceValidator(min_confidence=0.7, question=question)
```

**Why it matters:** confidence below 0.7 correlates with higher hallucination rates. A model that isn't sure is more likely to fill gaps with invention.

**When it fires:** `output.confidence < min_confidence`

---

### `SourceValidator`

Rejects responses where the agent produced an answer without calling any tool.

```python
from src.project_name.guardrails.validators import SourceValidator

validator = SourceValidator(question=question)
```

**Why it matters:** if the agent answered a data question without querying any data source, it answered from memory — which is hallucination by definition.

**When it fires:** `trace.tools_called == []` and `output.answer != ""`

---

### `ToolRoutingValidator`

Rejects responses where the agent used the wrong tool for the question type.

```python
from src.project_name.guardrails.validators import ToolRoutingValidator

validator = ToolRoutingValidator(
    question="What is total revenue?",
    expected_tool="execute_sql",
    trigger_keywords=["revenue", "total", "count", "average"]
)
```

**Why it matters:** a revenue question answered via semantic search will produce a qualitative interpretation instead of an exact number. The answer looks reasonable but is wrong.

**When it fires:** question contains a trigger keyword AND expected tool is not in `trace.tools_called`

---

## Writing a custom validator

Extend `SemanticValidator`:

```python
from src.project_name.guardrails.validators import SemanticValidator
from src.project_name.models import QueryOutput
from src.project_name.observability.tracer import AgentTrace


class FreshDataValidator(SemanticValidator):
    """
    Rejects responses that cite data older than a given threshold.
    Use when your domain requires up-to-date information.
    """

    def __init__(self, max_age_hours: int = 24, **kwargs) -> None:
        super().__init__(**kwargs)
        self.max_age_hours = max_age_hours

    def validate(self, output: QueryOutput, trace: AgentTrace) -> bool:
        # Check if any source indicates stale data
        for source in output.sources:
            if "stale" in source or "cached" in source:
                self.failure_reason = (
                    f"Response cites potentially stale data source: {source}"
                )
                return False
        return True
```

Then pass it to `validated_invoke`:

```python
output, trace = validated_invoke(
    agent=agent,
    question=question,
    validators=[
        ConfidenceValidator(0.7, question=question),
        SourceValidator(question=question),
        FreshDataValidator(max_age_hours=24, question=question),
    ],
)
```

**Rules for custom validators:**
- Return `True` if valid, `False` if the guardrail should fire
- Always set `self.failure_reason` when returning `False` — it's logged and included in `GuardrailError`
- Do not raise exceptions inside `validate()` — return `False` instead
- Do not validate inside the agent loop — validate the final output only

---

## Handling `GuardrailError`

When all retries are exhausted, `GuardrailError` is raised:

```python
from src.project_name.guardrails.retry import validated_invoke, GuardrailError

try:
    output, trace = validated_invoke(agent=agent, question=question)
except GuardrailError as e:
    print(f"Failed after {e.attempts} attempts: {e.reason}")
    # Handle gracefully — return fallback response, log, alert, etc.
```

`GuardrailError` has two attributes:
- `e.reason` — the last failure reason from the validator that fired
- `e.attempts` — how many retries were attempted

---

## Configuring retry behavior

```python
output, trace = validated_invoke(
    agent=agent,
    question=question,
    max_retries=5,       # default: 3
    backoff_base=2.0,    # default: 1.5 — delays: 2s, 4s, 8s, 16s, 32s
)
```

**Choosing `max_retries`:**
- 3 is the default and works for most cases
- Increase to 5 for high-stakes questions where retrying is worth the latency
- Do not set above 5 — if the agent fails 5 times, it's a systematic problem, not a transient one

**Choosing `backoff_base`:**
- 1.5 is conservative — good for interactive use where latency matters
- 2.0 is standard — good for background processing
- Do not use 1.0 or below — that's not backoff, it's spam

---

## Guardrails in tests

Always test validators in isolation:

```python
def test_source_validator_blocks_toolless_answers():
    from src.project_name.guardrails.validators import SourceValidator
    from src.project_name.models import QueryOutput
    from src.project_name.observability.tracer import AgentTrace

    validator = SourceValidator(question="What is revenue?")
    output = QueryOutput(answer="Revenue is $100K", confidence=0.9)
    trace = AgentTrace(question="What is revenue?")
    # tools_called is empty — should fail

    assert validator.validate(output, trace) is False
    assert "without querying" in validator.failure_reason
```

Tests for validators live in `tests/test_guardrails.py`.

---

## Common mistakes

**Mistake:** Calling `agent.invoke()` directly and trusting the output.
**Fix:** Always use `validated_invoke()`.

**Mistake:** Writing validators that are too strict — they cause false retries and latency.
**Fix:** Test validators against real agent outputs before deploying. If a validator fires more than 10% of the time for valid questions, the threshold is wrong.

**Mistake:** Swallowing `GuardrailError` silently.
**Fix:** Always log it. A `GuardrailError` means the agent failed multiple times — this is signal worth capturing.

**Mistake:** Validating inside the agent loop (e.g., inside a tool).
**Fix:** Validate the final output only. Mid-loop validation causes confusing retry behavior.
