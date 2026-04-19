# Evals

Unit tests verify your code is correct. Evals verify your agent is intelligent.

This is not a subtle distinction. A unit test checks that `ConfidenceValidator` returns `False` when `confidence=0.5`. An eval checks that the agent routes a revenue question to `execute_sql` and not to `semantic_search`. One tests code. The other tests reasoning.

---

## Why evals exist separately from unit tests

**Unit tests** live in `tests/` and run on every CI build. They are fast, cheap, deterministic, and test code behavior.

**Evals** live in `evals/` and run selectively. Some use mocks (fast, CI-safe), some call the real LLM API (slow, costs tokens, only run before release).

Mixing them creates two problems:
1. Running real LLM tests on every PR is expensive and slows CI
2. Mocked tests cannot detect when a prompt change causes real routing regressions

The separation lets you have both: fast CI and meaningful pre-release validation.

---

## Test markers

Two markers control when tests run:

```python
@pytest.mark.fast   # mocked — runs in CI, zero cost
@pytest.mark.llm    # real API — run locally before release
@pytest.mark.slow   # takes > 5 seconds
```

**In CI** (`.github/workflows/ci.yml`): only `fast` tests run.

**Before release**: run everything:
```bash
uv run pytest evals/ -v
```

**In CI only**:
```bash
uv run pytest evals/ -m "not llm" --tb=short
```

---

## The ground truth dataset

`evals/datasets/agent_behavior.json` is the source of truth for expected agent behavior:

```json
{
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
}
```

Each case has an `id`, a `question`, and assertions about expected behavior. When you add a new tool or change a routing docstring, add corresponding cases to the dataset.

---

## Fast evals (mocked)

Fast evals test routing logic and guardrail behavior using mocks. They verify the system's decision-making without calling the real LLM:

```python
@pytest.mark.fast
def test_numeric_question_routes_to_sql(self, mock_agent_sql):
    """Revenue questions must use execute_sql, never semantic_search."""
    case = CASES["sql-routing-01"]
    trace = mock_agent_sql.last_trace

    assert case["expected_tool"] in trace.tools_called
    assert case.get("must_not_use_tool") not in trace.tools_called
```

The mock agent returns a pre-configured trace with specific `tools_called`. This tests that your validators and routing logic handle the trace correctly — not that the LLM makes the right decision.

---

## LLM evals (real API)

LLM evals call the real agent and verify actual reasoning:

```python
@pytest.mark.llm
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
    assert trace.hallucinated is False
```

The failure message is intentional — it tells you exactly what to fix. If this test fails after a docstring change, the message points you to the right place.

---

## Adding eval cases

### 1. Add to the dataset

```json
{
  "id": "hybrid-routing-02",
  "question": "What is the average order value of customers who complained about shipping?",
  "expected_tools": ["semantic_search", "execute_sql"],
  "expected_store": "both",
  "tags": ["routing", "hybrid"]
}
```

### 2. Add a fast test (required)

```python
@pytest.mark.fast
def test_hybrid_question_uses_both_stores(self, mock_agent_hybrid):
    """Hybrid questions must use both semantic_search and execute_sql."""
    case = CASES["hybrid-routing-02"]
    trace = mock_agent_hybrid.last_trace

    for expected_tool in case["expected_tools"]:
        assert expected_tool in trace.tools_called, (
            f"Expected '{expected_tool}' for hybrid question. "
            f"Tools called: {trace.tools_called}"
        )
```

### 3. Add an LLM test (when the case is about real reasoning)

```python
@pytest.mark.llm
@pytest.mark.slow
def test_hybrid_routing_real(self, real_agent):
    """REAL LLM TEST: Hybrid questions use both tools."""
    output, trace = validated_invoke(
        agent=real_agent,
        question=CASES["hybrid-routing-02"]["question"],
    )
    assert "semantic_search" in trace.tools_called
    assert "execute_sql" in trace.tools_called
```

### 4. Add the fixture

```python
@pytest.fixture
def mock_agent_hybrid():
    """Mock agent that simulates calling both tools."""
    from src.project_name.observability.tracer import AgentTrace

    agent = MagicMock()
    trace = AgentTrace(question=CASES["hybrid-routing-02"]["question"])
    trace.tools_called = ["semantic_search", "execute_sql"]
    agent.last_trace = trace
    agent.invoke.return_value = {
        "messages": [MagicMock(content="Average order value: $347.82")]
    }
    return agent
```

---

## What makes a good eval case

**Good:** Tests a specific routing decision with a clear assertion and a diagnostic failure message.

```python
assert "execute_sql" in trace.tools_called, (
    "Agent did not use SQL for a revenue question. "
    "Check the execute_sql docstring routing keywords."
)
```

**Bad:** Tests general quality without a specific assertion.

```python
assert output.answer  # this passes even if the answer is hallucinated
```

**Good:** Tests edge cases that are likely to break.

- Questions where the right tool is not obvious
- Questions about data that doesn't exist (hallucination resistance)
- Questions that combine multiple data sources

**Bad:** Tests the happy path only.

- "What is revenue?" → uses execute_sql → passes (trivially)

---

## Running evals before release

Before tagging a release or merging a significant change to prompts or skills:

```bash
# Run all evals including real LLM calls
uv run pytest evals/ -v --tb=short

# Expected output:
# tests/test_agent_behavior.py::TestRoutingDecisions::test_numeric_question_routes_to_sql PASSED
# tests/test_agent_behavior.py::TestRoutingDecisions::test_semantic_question_routes_to_qdrant PASSED
# tests/test_agent_behavior.py::TestAgentIntelligence::test_agent_routes_revenue_to_sql PASSED
# tests/test_agent_behavior.py::TestAgentIntelligence::test_agent_confidence_above_threshold PASSED
```

If an LLM eval fails after a prompt or docstring change, the failure message tells you exactly what to fix. Fix it, run again, and only release when all evals pass.

---

## Evals vs. guardrails

These are complementary, not redundant.

**Guardrails** catch bad responses at runtime — they are the safety net in production.

**Evals** catch systematic problems before production — they are the quality gate before release.

A validator catches a specific instance of a routing error. An eval catches when your prompts have drifted and routing errors are happening consistently. You need both.
