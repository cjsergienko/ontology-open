# Ontology-to-Agents Email Generation System

## Project Summary and Continuation Guide

**Created:** February 3, 2026
**Purpose:** Complete context for continuing development in Claude Code
**Status:** Architecture finalized, ready for implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What We Built](#2-what-we-built)
3. [Architecture Evolution](#3-architecture-evolution)
4. [Final System Architecture](#4-final-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Implementation Details](#6-implementation-details)
7. [Latency and Performance](#7-latency-and-performance)
8. [Prompt Optimization Strategy](#8-prompt-optimization-strategy)
9. [Files and Artifacts](#9-files-and-artifacts)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Next Steps](#11-next-steps)
12. [Open Questions](#12-open-questions)
13. [Advanced Patterns: MoE/MoA Inspiration](#13-advanced-patterns-moemoa-inspiration) ⭐ NEW
14. [Future Enhancement: Ontology-Injected MoE LLM](#14-future-enhancement-ontology-injected-moe-llm) ⭐ NEW

---

## 1. Executive Summary

### The Goal

Build a system that:
- Takes an **ontology** (starting with email taxonomy v1.3)
- **Spins up a set of specialized agents** from that ontology
- Generates **fully-validated MJML emails** from simple user prompts
- Uses **RAG injection** from an ontology-annotated corpus (800K emails)
- Works **fast** (~10-20 seconds), **predictably** (orchestrator TODO list), and with **feedback loops**
- Can **self-improve** via DSPy/Monte Carlo prompt optimization

### Example Flow

```
INPUT:  "Create a welcome email for my spa business"
OUTPUT: Fully validated MJML email
TIME:   ~15 seconds
```

### Why This Matters

- 800K classified emails become one-shot learning examples
- Ontology ensures consistency and coverage
- Agents are specialized experts (not one monolithic prompt)
- System improves over time via automated optimization

---

## 2. What We Built

### Email Taxonomy v1.3

We created a production-ready email taxonomy ontology:

| Metric | v1.2 | v1.3 | Improvement |
|--------|------|------|-------------|
| Overall Score | 8.1/10 | **9.0/10** | +0.9 |
| MECE | 8.5 | 9.3 | +0.8 |
| Orthogonality | 8.0 | 8.5 | +0.5 |
| Inferability | 7.5 | 9.0 | +1.5 |
| Coverage | 9.0 | 9.6 | +0.6 |
| Generation Utility | 8.5 | 9.2 | +0.7 |

### v1.3 Statistics

```yaml
total_dimensions: 34
total_values: 4,707
categories: 8
multi_value_dimensions: 5
cooccurrence_patterns: 53
constraint_rules: 20
validation_rules: 4
decision_trees: 2
```

### The 8 Categories

1. **Email Identity** - email_type, sub_type, trigger_type
2. **Audience Targeting** - demographics, psychographics, lifecycle
3. **Content Strategy** - themes, messaging, value propositions
4. **Design & Layout** - structure, visual style, components
5. **Engagement Mechanics** - CTAs, urgency, social proof
6. **Personalization** - depth, data sources, dynamic content
7. **Compliance & Trust** - legal requirements, trust signals
8. **Performance Optimization** - testing, deliverability

### Improvements Made in v1.3

1. **Added 20 constraint rules** (was 4) - prevent invalid dimension combinations
2. **Expanded cooccurrence patterns** from 6 to 53 - typical value combinations per email_type
3. **Restructured audience_life_stage** as L1/L2 hierarchy - fixed MECE violation
4. **Made audience_psychographic multi-value** (max 2) - reflects real-world overlap
5. **Added decision trees** for email_type and tone_of_voice classification
6. **Added counter-signals** to 28 commonly confused email types
7. **Added observable patterns** for send_frequency, trigger_type, audience_age_group

### Real-World Evaluation

Tested v1.3 against 10 NEW Gmail promotional emails:

| Email | Type | Confidence |
|-------|------|------------|
| SiriusXM | Personalized subscription | HIGH |
| Zoom | Flash sale (40% off) | HIGH |
| Microsoft Advertising | Activation/onboarding | HIGH |
| Praveen Ghanta | Thought leadership newsletter | HIGH |
| Amazon Prime | First Reads loyalty | HIGH |
| Base44 | Competition announcement | MEDIUM |
| TrueBlue Dining | Loyalty cross-sell | HIGH |
| Bridgerton Experience | Waitlist notification | HIGH |
| fnp.ae | Valentine's promotion | HIGH |
| Mahoney's Garden | Educational content | HIGH |

**Result:** 87.6% HIGH confidence classifications (vs 78.8% in v1.2)

---

## 3. Architecture Evolution

### Initial Question

User has 800K emails and wants to:
1. Store them with section-level classification
2. Extract ontology-based queries for one-shot learning
3. Match user intent → ontology → email generation

### Options Considered

#### Option A: PostgreSQL + pgvector (My Initial Recommendation)

```
Emails → PostgreSQL (structured) + pgvector (semantic search)
Ontology → In-memory / cached
Retrieval → SQL queries + vector similarity
```

**Pros:** Fast queries, familiar, scalable
**Cons:** Ontology not native, requires query translation

#### Option B: PageIndex (User's Counter-Proposal)

```
Ontology → PageIndex (native hierarchical structure)
Emails → PageIndex or separate store
Agents → Feed PageIndex directly
```

**Pros:** Ontology-native, agent-friendly
**Cons:** Less suited for large-scale email corpus queries

#### Option C: 34 Dimension-Expert Agents (User's Idea)

```
34 agents, each expert in one dimension
Orchestrator routes user query to all 34
Combine outputs into single email
```

**Pros:** Deep specialization, modular
**Cons:** 34 LLM calls per email, coherence risk, cost

### Resolution

**Hybrid approach:**
- **PageIndex** for ontology (feeding agents)
- **PostgreSQL** for email corpus (one-shot retrieval)
- **4-5 Clustered agents** (not 34) for balance of expertise and coherence

---

## 4. Final System Architecture

### The Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                              │
│            "Create a welcome email for my spa business"         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. STRATEGY AGENT (The "What")                                 │
│     ─────────────────────────────────────────────────────────   │
│     Knows: Cialdini principles, urgency tactics, scoring rubric │
│     Input: User prompt                                          │
│     Output: Strategic TODO list                                 │
│                                                                 │
│     Example output:                                             │
│       ☐ Apply reciprocity (welcome gift/discount)               │
│       ☐ Build trust (testimonials, credentials)                 │
│       ☐ Create anticipation (what to expect)                    │
│       ☐ Target: new customer onboarding                         │
│       ☐ Success metric: open rate > 40%                         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. ONTOLOGY ROUTER AGENT (The "How to Classify")               │
│     ─────────────────────────────────────────────────────────   │
│     Knows: Full ontology via PageIndex                          │
│     Input: TODO list from Strategy Agent                        │
│     Output: Dimension assignments per cluster                   │
│                                                                 │
│     Example output:                                             │
│       Content Cluster: email_type=welcome_series,               │
│                        content_theme=brand_introduction,        │
│                        cta_style=soft_engagement                │
│       Audience Cluster: lifecycle_stage=new_subscriber,         │
│                         industry_vertical=wellness_spa          │
│       Style Cluster: tone=warm_professional,                    │
│                      personalization=name_based                 │
│       Tactical Cluster: send_timing=immediate_trigger,          │
│                         sequence_position=first                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. CLUSTER GENERATOR AGENTS (The "Create")          [PARALLEL] │
│     ─────────────────────────────────────────────────────────   │
│     Each receives: dimension assignments + one-shot example     │
│     Each outputs: MJML section(s)                               │
│                                                                 │
│     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│     │   CONTENT    │ │   AUDIENCE   │ │    STYLE     │         │
│     │   CLUSTER    │ │   CLUSTER    │ │   CLUSTER    │         │
│     │              │ │              │ │              │         │
│     │ • Hero       │ │ • Personal-  │ │ • Tone       │         │
│     │ • Body       │ │   ization    │ │ • Voice      │         │
│     │ • CTA        │ │ • Segments   │ │ • Branding   │         │
│     │ • Sections   │ │ • Lifecycle  │ │ • Colors     │         │
│     └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                 │
│     ┌──────────────┐ ┌──────────────┐                          │
│     │   TACTICAL   │ │   DESIGN     │                          │
│     │   CLUSTER    │ │   CLUSTER    │                          │
│     │              │ │              │                          │
│     │ • Urgency    │ │ • Layout     │                          │
│     │ • Triggers   │ │ • Components │                          │
│     │ • Timing     │ │ • Mobile     │                          │
│     └──────────────┘ └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. VERIFY AGENT (The "Quality Gate")                           │
│     ─────────────────────────────────────────────────────────   │
│     Input: Combined MJML + original TODO + scoring rubric       │
│     Output: Validated MJML OR rejection with feedback           │
│                                                                 │
│     Checks:                                                     │
│       ✓ MJML syntax valid                                       │
│       ✓ All TODO items from Strategy Agent addressed            │
│       ✓ Cialdini principles correctly applied                   │
│       ✓ Ontology constraint rules respected                     │
│       ✓ Brand guidelines met                                    │
│       ✓ Mobile responsiveness                                   │
│                                                                 │
│     If FAIL → feedback loop to Router Agent for regeneration    │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         OUTPUT                                  │
│                   Validated MJML Email                          │
└─────────────────────────────────────────────────────────────────┘
```

### Feedback Loop

```
Verify Agent: "TODO item 'trust signals' not found in output"
        ↓
Router Agent: Re-routes to Content Cluster with specific instruction
        ↓
Content Agent: Adds testimonial/credentials section
        ↓
Verify Agent: ✓ All checks pass → Output MJML
```

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    PageIndex    │     │   PostgreSQL    │     │   skills.md     │
│    (Ontology)   │     │  (800K emails)  │     │    (Prompts)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │   ontology context    │   one-shot examples   │   agent instructions
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ↓
                    ┌─────────────────────┐
                    │   LangGraph Agent   │
                    │      Pipeline       │
                    └─────────────────────┘
```

---

## 5. Technology Stack

### Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Orchestration** | LangGraph | Stateful workflow, parallel branches, conditional edges |
| **API Layer** | FastAPI | REST endpoint exposure |
| **LLM** | Claude (Anthropic SDK) | Agent intelligence |
| **Ontology Store** | PageIndex | Hierarchical ontology navigation |
| **Email Corpus** | PostgreSQL + pgvector | 800K emails with vector embeddings |
| **Prompt Optimization** | DSPy | Automated prompt improvement |
| **Validation** | MJML validator | Email syntax checking |

### Why Each Choice

**LangGraph over alternatives:**
- Native support for parallel branches (cluster agents run simultaneously)
- Conditional edges (verify → retry loop)
- State management (TODO list passes through pipeline)
- Better than CrewAI for this specific pattern

**PageIndex for ontology:**
- Hierarchical structure matches our 8 categories → 34 dimensions → 4,707 values
- Agent-friendly retrieval
- Semantic search within ontology

**PostgreSQL for emails:**
- Fast filtering: "find emails where email_type=welcome AND industry=spa"
- pgvector for semantic similarity
- Scales to 800K+ emails
- Section-level classification as JSONB

**DSPy for optimization:**
- Programmatic prompt optimization
- Uses our evaluation corpus as training data
- Integrates with LangGraph
- Better than manual prompt engineering at scale

---

## 6. Implementation Details

### REST API Design

```
POST /api/v1/generate-email
Content-Type: application/json

Request:
{
    "prompt": "Create a welcome email for my spa business",
    "options": {
        "style": "modern",           // optional overrides
        "max_length": "medium",
        "include_images": true
    }
}

Response:
{
    "mjml": "<mjml>...</mjml>",
    "html": "<html>...</html>",      // pre-rendered
    "metadata": {
        "dimensions_used": {...},
        "one_shot_source": "email_id_12345",
        "generation_time_ms": 14500,
        "strategy_todo": [...],
        "confidence_score": 0.92
    }
}
```

### LangGraph Implementation Sketch

```python
from langgraph.graph import StateGraph, END
from fastapi import FastAPI
from pydantic import BaseModel
from anthropic import Anthropic

# State passed through pipeline
class EmailState(BaseModel):
    user_prompt: str
    todo_list: list[str] = []
    dimension_assignments: dict = {}
    generated_sections: dict = {}
    mjml_output: str = ""
    is_valid: bool = False
    retry_count: int = 0
    max_retries: int = 2

# Initialize clients
anthropic = Anthropic()
app = FastAPI()

# Agent functions
async def strategy_agent(state: EmailState) -> EmailState:
    """Generate strategic TODO based on Cialdini principles"""
    response = anthropic.messages.create(
        model="claude-sonnet-4-5-20250929",
        system=load_skill("strategy_agent.md"),
        messages=[{"role": "user", "content": state.user_prompt}]
    )
    state.todo_list = parse_todo_list(response.content)
    return state

async def router_agent(state: EmailState) -> EmailState:
    """Map TODO items to ontology dimensions"""
    ontology_context = pageindex.query(state.todo_list)
    response = anthropic.messages.create(
        model="claude-sonnet-4-5-20250929",
        system=load_skill("router_agent.md"),
        messages=[{
            "role": "user",
            "content": f"TODO: {state.todo_list}\nOntology: {ontology_context}"
        }]
    )
    state.dimension_assignments = parse_assignments(response.content)
    return state

async def content_cluster_agent(state: EmailState) -> EmailState:
    """Generate content sections"""
    one_shot = postgres.get_similar_email(state.dimension_assignments["content"])
    response = anthropic.messages.create(
        model="claude-sonnet-4-5-20250929",
        system=load_skill("content_cluster.md"),
        messages=[{
            "role": "user",
            "content": f"Dimensions: {state.dimension_assignments['content']}\nExample: {one_shot}"
        }]
    )
    state.generated_sections["content"] = response.content
    return state

# Similar functions for audience_cluster, style_cluster, tactical_cluster, design_cluster

async def verify_agent(state: EmailState) -> EmailState:
    """Validate combined MJML against TODO and constraints"""
    combined_mjml = combine_sections(state.generated_sections)
    response = anthropic.messages.create(
        model="claude-sonnet-4-5-20250929",
        system=load_skill("verify_agent.md"),
        messages=[{
            "role": "user",
            "content": f"MJML: {combined_mjml}\nTODO: {state.todo_list}"
        }]
    )
    validation = parse_validation(response.content)
    state.is_valid = validation.passed
    state.mjml_output = combined_mjml if validation.passed else ""
    return state

# Build the graph
workflow = StateGraph(EmailState)

# Add nodes
workflow.add_node("strategy", strategy_agent)
workflow.add_node("router", router_agent)
workflow.add_node("content_cluster", content_cluster_agent)
workflow.add_node("audience_cluster", audience_cluster_agent)
workflow.add_node("style_cluster", style_cluster_agent)
workflow.add_node("tactical_cluster", tactical_cluster_agent)
workflow.add_node("design_cluster", design_cluster_agent)
workflow.add_node("verify", verify_agent)

# Add edges
workflow.set_entry_point("strategy")
workflow.add_edge("strategy", "router")

# Parallel edges from router to all clusters
workflow.add_edge("router", "content_cluster")
workflow.add_edge("router", "audience_cluster")
workflow.add_edge("router", "style_cluster")
workflow.add_edge("router", "tactical_cluster")
workflow.add_edge("router", "design_cluster")

# All clusters converge to verify
workflow.add_edge("content_cluster", "verify")
workflow.add_edge("audience_cluster", "verify")
workflow.add_edge("style_cluster", "verify")
workflow.add_edge("tactical_cluster", "verify")
workflow.add_edge("design_cluster", "verify")

# Conditional retry loop
def should_retry(state: EmailState) -> str:
    if state.is_valid:
        return "end"
    elif state.retry_count < state.max_retries:
        state.retry_count += 1
        return "router"
    else:
        return "end"  # Return best effort

workflow.add_conditional_edges("verify", should_retry, {"end": END, "router": "router"})

# Compile
email_pipeline = workflow.compile()

# FastAPI endpoint
@app.post("/api/v1/generate-email")
async def generate_email(prompt: str):
    result = await email_pipeline.ainvoke({"user_prompt": prompt})
    return {
        "mjml": result["mjml_output"],
        "metadata": {
            "todo": result["todo_list"],
            "dimensions": result["dimension_assignments"],
            "retries": result["retry_count"]
        }
    }
```

### Database Schema

```sql
-- Email corpus with section-level classification
CREATE TABLE emails (
    id UUID PRIMARY KEY,
    raw_html TEXT,
    raw_mjml TEXT,
    subject TEXT,
    sender TEXT,
    received_at TIMESTAMP,

    -- Full email classification (34 dimensions)
    classification JSONB,

    -- Section-level classifications
    sections JSONB,  -- [{type: "hero", classification: {...}}, ...]

    -- Vector embedding for semantic search
    embedding vector(1536),

    -- Metadata
    classification_confidence FLOAT,
    classification_version VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_emails_classification ON emails USING GIN (classification);
CREATE INDEX idx_emails_embedding ON emails USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_emails_type ON emails ((classification->>'email_type'));

-- Example query: Find welcome emails for spa industry
SELECT * FROM emails
WHERE classification->>'email_type' = 'welcome_series'
  AND classification->>'industry_vertical' = 'wellness_spa'
ORDER BY embedding <-> query_embedding
LIMIT 5;
```

### skills.md File Structure

```
/skills/
├── strategy_agent.md        # Cialdini principles, scoring rubric
├── router_agent.md          # Ontology navigation, dimension mapping
├── content_cluster.md       # Hero, body, CTA generation
├── audience_cluster.md      # Personalization, segmentation
├── style_cluster.md         # Tone, voice, branding
├── tactical_cluster.md      # Urgency, triggers, timing
├── design_cluster.md        # Layout, components, mobile
├── verify_agent.md          # Validation, scoring, feedback
└── shared/
    ├── mjml_reference.md    # MJML syntax guide
    ├── cialdini_principles.md
    └── brand_guidelines.md
```

---

## 7. Latency and Performance

### Per-Step Latency Estimates

| Pipeline Step | LLM Calls | Estimated Latency |
|---------------|-----------|-------------------|
| Strategy Agent | 1 | ~2s |
| Router Agent (+ PageIndex) | 1 | ~3s |
| Cluster Agents (parallel) | 5 | ~5s (slowest wins) |
| Verify Agent | 1 | ~3s |
| **TOTAL (happy path)** | **8** | **~13-15 seconds** |
| With 1 retry | +3 | ~18-22 seconds |

### Optimization Strategies

1. **Use Claude Haiku for Strategy/Router** - 40% faster, sufficient for these tasks
2. **Use Sonnet for Cluster generators** - quality matters for content
3. **Cache PageIndex queries** - ontology doesn't change often
4. **Pre-warm PostgreSQL connections** - connection pooling
5. **Parallelize cluster agents aggressively** - all 5 run simultaneously

### Target Performance

| Metric | Target | Notes |
|--------|--------|-------|
| P50 latency | 12s | Happy path, no retries |
| P95 latency | 25s | With 1-2 retries |
| P99 latency | 40s | Edge cases |
| Throughput | 200/min | With horizontal scaling |

---

## 8. Prompt Optimization Strategy

### Phase 1: Hand-Crafted (Weeks 1-4)

- Write initial skills.md files based on ontology
- Manual iteration based on output quality
- Build evaluation corpus (100 diverse prompts)

### Phase 2: DSPy Integration (Weeks 5-6)

```python
import dspy

class StrategySignature(dspy.Signature):
    """Generate email strategy based on Cialdini principles"""
    user_prompt: str = dspy.InputField(desc="User's email generation request")
    todo_list: list[str] = dspy.OutputField(desc="Strategic action items")

class RouterSignature(dspy.Signature):
    """Map strategy to ontology dimensions"""
    todo_list: list[str] = dspy.InputField()
    ontology_context: str = dspy.InputField()
    dimension_assignments: dict = dspy.OutputField()

# Create modules
strategy_module = dspy.ChainOfThought(StrategySignature)
router_module = dspy.ChainOfThought(RouterSignature)

# Define evaluation metric
def email_quality_metric(example, prediction):
    # Score based on:
    # - All TODO items addressed
    # - MJML validity
    # - Cialdini principles present
    # - Ontology constraints respected
    return score

# Optimize
optimizer = dspy.BootstrapFewShot(
    metric=email_quality_metric,
    max_bootstrapped_demos=4
)

optimized_strategy = optimizer.compile(
    strategy_module,
    trainset=evaluation_corpus
)
```

### Phase 3: Custom Monte Carlo (Ongoing)

```python
async def optimize_skill(skill_name: str, base_prompt: str):
    """Monte Carlo optimization for specific skills"""

    # Generate variations
    variations = []
    for _ in range(20):
        variant = mutate_prompt(base_prompt, mutation_strategies=[
            "add_example",
            "clarify_constraint",
            "adjust_tone",
            "add_cialdini_detail"
        ])
        variations.append(variant)

    # Evaluate each variation
    results = []
    for variant in variations:
        scores = []
        for test_case in evaluation_set:
            output = await run_agent_with_prompt(variant, test_case)
            score = evaluate_output(output, ground_truth[test_case])
            scores.append(score)
        results.append((variant, np.mean(scores), np.std(scores)))

    # Select best (highest mean, lowest variance)
    best = max(results, key=lambda x: x[1] - 0.5 * x[2])
    return best[0]
```

### Phase 4: Human-in-the-Loop

- Collect user feedback on generated emails
- Flag low-rated outputs for review
- Feed corrections back into training set
- Periodic manual review of edge cases

---

## 9. Files and Artifacts

### Created in This Project

| File | Location | Description |
|------|----------|-------------|
| `email_taxonomy_v1.3.yaml` | `/taxonomy/` | Production ontology (378KB, 11,163 lines) |
| `evaluation_ontology_v1.3.md` | `/taxonomy/` | Real-world evaluation report |
| `TAXONOMY_IMPROVEMENT_TODO.md` | `/taxonomy/` | 36 improvement tasks (completed) |
| `PROJECT_SUMMARY_ONTOLOGY_TO_AGENTS.md` | `/taxonomy/` | This file |

### Key Ontology Sections

The v1.3 ontology contains:

```yaml
# Structure
metadata:
  version: "1.3"
  total_dimensions: 34
  total_values: 4707

categories:
  email_identity:
    dimensions: [email_type, sub_type, trigger_type, ...]
  audience_targeting:
    dimensions: [age_group, life_stage, psychographic, ...]
  # ... 6 more categories

dimensions:
  email_type:
    values: [promotional, transactional, newsletter, ...]
    decision_tree: {...}
    counter_signals: {...}
  # ... 33 more dimensions

cooccurrence_patterns:
  flash_sale: {urgency: high, cta: prominent, ...}
  # ... 52 more patterns

constraint_rules:
  - if: {email_type: transactional}
    then: {promotional_content: minimal}
  # ... 19 more rules
```

### Files to Create (Next Phase)

```
/email-agent-system/
├── pyproject.toml
├── README.md
├── docker-compose.yml
├── .env.example
│
├── src/
│   ├── api/
│   │   ├── main.py              # FastAPI app
│   │   ├── routes/
│   │   │   └── generate.py      # /generate-email endpoint
│   │   └── models/
│   │       └── requests.py      # Pydantic models
│   │
│   ├── agents/
│   │   ├── pipeline.py          # LangGraph workflow
│   │   ├── strategy.py          # Strategy agent
│   │   ├── router.py            # Ontology router
│   │   ├── clusters/
│   │   │   ├── content.py
│   │   │   ├── audience.py
│   │   │   ├── style.py
│   │   │   ├── tactical.py
│   │   │   └── design.py
│   │   └── verify.py            # Verification agent
│   │
│   ├── skills/
│   │   ├── strategy_agent.md
│   │   ├── router_agent.md
│   │   ├── content_cluster.md
│   │   ├── audience_cluster.md
│   │   ├── style_cluster.md
│   │   ├── tactical_cluster.md
│   │   ├── design_cluster.md
│   │   └── verify_agent.md
│   │
│   ├── data/
│   │   ├── ontology.py          # PageIndex integration
│   │   ├── corpus.py            # PostgreSQL queries
│   │   └── embeddings.py        # Vector operations
│   │
│   └── optimization/
│       ├── dspy_modules.py
│       └── monte_carlo.py
│
├── tests/
│   ├── test_agents.py
│   ├── test_pipeline.py
│   └── evaluation/
│       └── corpus.json          # 100 test cases
│
└── scripts/
    ├── classify_corpus.py       # Classify 800K emails
    ├── optimize_skills.py       # Run DSPy optimization
    └── evaluate.py              # Run evaluation suite
```

---

## 10. Implementation Roadmap

### Week 1: Foundation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Project setup, dependencies | `pyproject.toml`, Docker |
| 2 | FastAPI skeleton | Basic `/health`, `/generate` endpoints |
| 3 | LangGraph workflow (no LLM) | State machine working |
| 4 | Anthropic SDK integration | Single agent working |
| 5 | All agents connected (mock) | Full pipeline with stubs |

### Week 2: Data Layer

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | PostgreSQL schema | Tables, indexes |
| 2 | Sample data loading | 1000 classified emails |
| 3 | One-shot retrieval | Similarity search working |
| 4 | PageIndex setup | Ontology loaded |
| 5 | Router integration | Ontology queries working |

### Week 3: Agent Quality

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Write all skills.md files | 8 agent prompts |
| 3 | MJML validation | Verify agent working |
| 4 | Retry loop | Feedback mechanism |
| 5 | End-to-end testing | 10 test cases passing |

### Week 4: Polish & Deploy

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Error handling | Graceful failures |
| 2 | Logging, monitoring | Observability |
| 3 | Performance tuning | <20s latency |
| 4 | Docker, deployment | Running on cloud |
| 5 | Documentation | API docs, README |

### Weeks 5-6: Optimization

| Task | Deliverable |
|------|-------------|
| Build evaluation corpus | 100 diverse test cases |
| Integrate DSPy | Automated optimization |
| Run optimization | Improved skills.md |
| A/B testing | Measure improvement |

---

## 11. Next Steps

### Immediate (Start of New Chat)

1. **Set up project structure** in Claude Code
   ```bash
   mkdir email-agent-system
   cd email-agent-system
   # Initialize with pyproject.toml, etc.
   ```

2. **Create first skills.md file** - Start with `strategy_agent.md`
   - Include Cialdini principles
   - Define TODO list output format
   - Add scoring rubric

3. **Build minimal LangGraph pipeline** - Strategy → Verify only
   - Get single agent working end-to-end
   - Add agents incrementally

### Short-term (Week 1)

- [ ] Project scaffold with all directories
- [ ] FastAPI app with `/generate-email` endpoint
- [ ] LangGraph workflow with all nodes (mock implementations)
- [ ] Single working agent (Strategy) producing real output
- [ ] Basic tests

### Medium-term (Weeks 2-4)

- [ ] PostgreSQL with sample classified emails
- [ ] PageIndex with full ontology
- [ ] All 8 skills.md files written
- [ ] Full pipeline generating valid MJML
- [ ] Retry/feedback loop working
- [ ] Deployed to cloud

### Long-term (Weeks 5+)

- [ ] DSPy optimization integrated
- [ ] 800K email corpus classified and loaded
- [ ] Monte Carlo prompt improvement
- [ ] Production monitoring
- [ ] User feedback loop

---

## 12. Open Questions

### Technical Decisions Needed

1. **PageIndex implementation** - Which specific library/approach?
   - Options: LlamaIndex, custom, langchain retrievers

2. **Embedding model** - For email corpus vectorization
   - Options: OpenAI ada-002, Cohere, local model

3. **Hosting** - Where to deploy
   - Options: Railway, Render, AWS ECS, GCP Cloud Run

4. **Cost optimization** - Balance quality vs. cost
   - Which agents can use Haiku vs. need Sonnet?

### Product Decisions Needed

1. **Email section granularity** - How fine-grained should section classification be?
   - Options: 5 sections, 10 sections, fully dynamic

2. **User controls** - What can users override?
   - Tone, length, specific dimensions, one-shot example selection?

3. **Output format** - MJML only, or also HTML/plain text?

4. **Batch generation** - Support generating multiple variants?

### Research Questions

1. **Optimal cluster grouping** - Are 5 clusters right, or should we adjust?

2. **Retry strategy** - How many retries? Which agent to re-run?

3. **One-shot selection** - Nearest neighbor, or more sophisticated?

---

## 13. Advanced Patterns: MoE/MoA Inspiration

> **PRIORITY:** These patterns enhance the MVP but are NOT required for initial implementation.
> **WHEN TO IMPLEMENT:** After basic pipeline works (Week 4+).

### 13.1 The Connection to Mixture-of-Experts

Our ontology-to-agents system is conceptually similar to Mixture-of-Experts (MoE) architectures like DeepSeek and Mixtral:

| Aspect | Neural MoE (DeepSeek) | Our Ontology System |
|--------|----------------------|---------------------|
| **Experts** | FFN layers with learned weights | Cluster agents with skills.md |
| **Router** | Learned gating network | Ontology Router Agent |
| **Activation** | Top-K experts per token | Relevant clusters per request |
| **Specialization** | Emergent (learned from data) | **Designed (from ontology)** |

**Key Insight:** In MoE, specialization is EMERGENT (discovered through training). In our system, specialization is DESIGNED (encoded in ontology). This gives us interpretability advantages.

### 13.2 Patterns to Borrow from MoE

#### Pattern 1: Sparse Activation (Top-K Routing)

**MoE Pattern:** Don't activate all experts—only top K most relevant.

**Application to Our System:**

```python
class MoEInspiredRouter:
    """Router that borrows sparse activation from MoE"""

    def route(self, strategy_todo: list[str], top_k: int = 3) -> RoutingDecision:
        # Score relevance of each cluster to the TODO items
        scores = {}
        for cluster in ["content", "audience", "style", "tactical", "design"]:
            scores[cluster] = self._compute_affinity(strategy_todo, cluster)

        # Top-K selection (sparse activation)
        sorted_clusters = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        active_clusters = [c for c, s in sorted_clusters[:top_k]]

        return RoutingDecision(
            active_clusters=active_clusters,  # Only 3 of 5 activate
            weights=self._softmax([scores[c] for c in active_clusters])
        )
```

**Benefit:** Faster execution (3 agents vs 5), lower cost, less noise in output.

**When to implement:** Week 5+ after basic pipeline works.

#### Pattern 2: Shared Expert Isolation (DeepSeek Innovation)

**MoE Pattern:** Some experts are ALWAYS activated to handle common knowledge, reducing redundancy in other experts.

**Application to Our System:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  SHARED AGENT (always active)                                       │
│  ───────────────────────────────────────────────────────────────    │
│  Handles:                                                           │
│  - Brand voice guidelines                                           │
│  - MJML best practices & syntax                                     │
│  - Common email patterns (header, footer, legal)                    │
│  - Compliance requirements (CAN-SPAM, GDPR)                         │
│  - Mobile responsiveness rules                                      │
└─────────────────────────────────────────────────────────────────────┘
                              +
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Content  │  │ Audience │  │  Style   │  │ Tactical │   ← ROUTED
│ Cluster  │  │ Cluster  │  │ Cluster  │  │ Cluster  │     (sparse)
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Implementation:**

```python
async def generate_email(state: EmailState) -> EmailState:
    # Shared agent ALWAYS runs
    shared_context = await shared_agent(state)

    # Only relevant cluster agents run (sparse activation)
    active_clusters = router.get_active_clusters(state.todo_list, top_k=3)

    cluster_outputs = await asyncio.gather(*[
        cluster_agents[c](state, shared_context)
        for c in active_clusters
    ])

    return combine_outputs(shared_context, cluster_outputs)
```

**Benefit:** Common knowledge computed once, routed experts focus on distinctive aspects.

**When to implement:** Week 6+ as optimization.

#### Pattern 3: Load Balancing

**MoE Pattern:** Prevent routing collapse where all tokens go to few experts. Use auxiliary loss.

**Application (in DSPy optimization):**

```python
def email_quality_metric(example, prediction, cluster_history):
    base_score = evaluate_email_quality(prediction)

    # Penalize if same clusters always dominate
    balance_penalty = calculate_cluster_imbalance(cluster_history)

    # Encourage diversity in cluster activation
    return base_score - 0.1 * balance_penalty

# Track cluster usage over time
cluster_activation_history = defaultdict(int)

def update_history(active_clusters):
    for cluster in active_clusters:
        cluster_activation_history[cluster] += 1
```

**Benefit:** Ensures all cluster agents get used and trained, prevents over-reliance on one cluster.

**When to implement:** Week 7+ during DSPy optimization phase.

#### Pattern 4: Orthogonality (Expert Distinctiveness)

**MoE Pattern:** Encourage experts to process distinct types of inputs, reducing overlap.

**Application:**

```python
def evaluate_cluster_distinctiveness(cluster_outputs: dict) -> float:
    """Penalize if cluster outputs are too similar (redundant)"""
    from itertools import combinations

    similarities = []
    for c1, c2 in combinations(cluster_outputs.keys(), 2):
        sim = cosine_similarity(
            embed(cluster_outputs[c1]),
            embed(cluster_outputs[c2])
        )
        similarities.append(sim)

    # High similarity = clusters are redundant = bad
    distinctiveness = 1.0 - mean(similarities)
    return distinctiveness  # Higher is better
```

**Benefit:** Ensures clusters produce genuinely different content, not redundant output.

**When to implement:** Week 7+ as quality metric.

#### Pattern 5: Soft Routing (Weighted Combination)

**MoE Pattern:** Output = weighted sum of expert outputs, not hard concatenation.

**Current approach (hard routing):**
```python
final_mjml = content_output + audience_output + style_output  # Concatenation
```

**MoE-inspired approach (soft routing):**
```python
weights = router.get_cluster_weights(todo_list)  # e.g., [0.4, 0.3, 0.2, 0.1]

final_mjml = weighted_combine(
    outputs=[content_output, audience_output, style_output, tactical_output],
    weights=weights,
    combination_strategy="section_priority"  # Higher weight = sections appear first
)
```

**Benefit:** More nuanced control over how cluster outputs contribute to final email.

**When to implement:** Week 6+ as refinement.

### 13.3 Mixture of Agents (MoA) Pattern

Recent research (Together AI, 2024) shows LLMs improve when seeing outputs from other models.

**MoA Architecture:**
```
Layer 1: Multiple PROPOSER agents generate responses in parallel
Layer 2: AGGREGATOR agent synthesizes the best answer
```

**Our System Already Has This:**
- **Proposers** = Cluster agents (Content, Audience, Style, Tactical)
- **Aggregator** = Verify Agent (synthesizes and validates)

**Enhancement opportunity:** Make Verify Agent more sophisticated at synthesis, not just validation.

### 13.4 Summary: MoE/MoA Patterns Priority

| Pattern | MVP Required? | Benefit | Implement When |
|---------|--------------|---------|----------------|
| Basic parallel clusters | ✅ YES | Core architecture | Week 1-2 |
| Verify as aggregator | ✅ YES | Quality gate | Week 3 |
| Sparse activation (Top-K) | ❌ No | 40% faster, cheaper | Week 5+ |
| Shared expert isolation | ❌ No | Reduced redundancy | Week 6+ |
| Load balancing | ❌ No | Better DSPy training | Week 7+ |
| Orthogonality metrics | ❌ No | Quality improvement | Week 7+ |
| Soft routing | ❌ No | Nuanced output | Week 6+ |

---

## 14. Future Enhancement: Ontology-Injected MoE LLM

> **PRIORITY:** This is a FUTURE ENHANCEMENT, not MVP.
> **WHEN TO IMPLEMENT:** After MVP works well (Week 8+).
> **POTENTIAL:** Novel research contribution, potentially publishable.

### 14.1 The Vision: Two-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TWO-LEVEL ONTOLOGY INJECTION                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  LEVEL 2: Agent Orchestration (LangGraph) ← MVP               │ │
│  │                                                               │ │
│  │  Strategy Agent → Router Agent → Cluster Agents → Verify     │ │
│  │                                                               │ │
│  │  Ontology guides: agent structure, skills.md content         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ↓                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  LEVEL 1: Ontology-Injected MoE LLM ← FUTURE                 │ │
│  │                                                               │ │
│  │  Base Model + [Content LoRA, Audience LoRA, Style LoRA, ...]│ │
│  │                                                               │ │
│  │  Ontology guides: expert training data, specialization      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this is powerful:**
- Level 1 (MoE): Token-level expertise baked into model weights
- Level 2 (Agents): Task-level orchestration with verification
- Both levels derived from SAME ontology

### 14.2 Open Source Frameworks for LoRA-MoE

These frameworks allow injecting LoRA-based experts into LLMs:

| Framework | GitHub | Key Feature |
|-----------|--------|-------------|
| **MoE-LoRA** | [maidacundo/MoE-LoRA](https://github.com/maidacundo/MoE-LoRA) | Transform dense LLM → MoE with LoRA experts |
| **MixLoRA** | [TUDB-Labs/MixLoRA](https://github.com/TUDB-Labs/MixLoRA) | Multiple routing strategies (top-k, top-p, switch) |
| **X-LoRA** | [EricLBuehler/xlora](https://github.com/EricLBuehler/xlora) | Mixture of LoRA Experts with learned scaling |
| **MoLE** | [adithya-s-k/MoLE](https://github.com/adithya-s-k/MoLE) | Task-specific LoRA adapters with classifier |
| **AdaMoLE** | [zefang-liu/AdaMoLE](https://github.com/zefang-liu/AdaMoLE) | Dynamic thresholding for expert selection |

### 14.3 The Novel Approach: Ontology-Guided Expert Training

**Key insight:** You can't TELL a LoRA expert what to specialize in, but you can TRAIN it on domain-specific data so it naturally specializes.

**Process:**

```
STEP 1: Use ontology to curate training data per cluster
─────────────────────────────────────────────────────────

┌──────────────┐
│   Ontology   │
│   Cluster    │
└──────┬───────┘
       │
       ↓
┌──────────────┐     ┌──────────────┐
│  Filter 800K │────→│ Training Set │
│   emails by  │     │  for Expert  │
│   cluster    │     │              │
└──────────────┘     └──────────────┘

Content Cluster → 50K emails strong in content strategy
Audience Cluster → 40K emails strong in personalization
Style Cluster → 35K emails strong in tone/voice
Tactical Cluster → 45K emails strong in urgency/scarcity


STEP 2: Train separate LoRA experts on each dataset
───────────────────────────────────────────────────

┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ LoRA    │  │ LoRA    │  │ LoRA    │  │ LoRA    │
│ Expert  │  │ Expert  │  │ Expert  │  │ Expert  │
│ Content │  │Audience │  │ Style   │  │Tactical │
│ (8M)    │  │ (8M)    │  │ (8M)    │  │ (8M)    │
└─────────┘  └─────────┘  └─────────┘  └─────────┘


STEP 3: Combine into MoE with learned router
────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    MoE-LoRA Model                           │
│  Input → Router → [Content, Audience, Style, Tactical]     │
│  Total new params: ~35M (0.5% of 7B base)                  │
└─────────────────────────────────────────────────────────────┘
```

### 14.4 Implementation Sketch

```python
# Phase 1: Ontology-Guided Data Curation
from email_taxonomy import OntologyV1_3

ontology = OntologyV1_3.load("email_taxonomy_v1.3.yaml")
email_corpus = load_emails("800k_emails.db")

training_sets = {}
for cluster_name, cluster_dimensions in ontology.clusters.items():
    # Filter emails that are strong examples of this cluster
    training_sets[cluster_name] = email_corpus.filter(
        lambda email: email.is_strong_example_of(cluster_dimensions),
        min_confidence=0.8,
        max_samples=50000
    )

# Phase 2: Train LoRA Experts
from moe_lora import LoRAExpert

experts = {}
for cluster_name, training_data in training_sets.items():
    expert = LoRAExpert(
        base_model="mistralai/Mistral-7B-v0.1",
        rank=8,
        alpha=16
    )
    expert.train(
        data=training_data,
        task="email_generation",
        epochs=3
    )
    experts[cluster_name] = expert

# Phase 3: Combine into MoE
from moe_lora import MoEModel

moe_model = MoEModel(
    base_model="mistral-7b",
    experts=list(experts.values()),
    routing_strategy="top-k",
    k=2  # Activate 2 of 4 experts per token
)

# Phase 4: Fine-tune router
moe_model.train_router(
    data=email_corpus.sample(10000),
    epochs=1
)

# Phase 5: Use as LLM backend for agents
llm = moe_model.as_langchain_llm()
strategy_agent = Agent(llm=llm, system_prompt=load_skill("strategy.md"))
```

### 14.5 Resource Requirements

| Phase | Compute | Time | Notes |
|-------|---------|------|-------|
| Data curation | CPU | 2-4 hours | Filter 800K emails |
| Train 4 LoRA experts | 1x A100 (80GB) | 8-12 hours each | Can parallelize |
| Combine into MoE | CPU | 1 hour | Merge weights |
| Train router | 1x A100 | 2-4 hours | Brief fine-tune |
| **Total** | **~$100-200 cloud** | **2-3 days** | One-time cost |

### 14.6 Why This Is Novel

| Feature | Existing MoE | Our Approach |
|---------|--------------|--------------|
| Expert specialization | Emergent (random) | **Designed (ontology-guided)** |
| Training data selection | Mixed/random | **Curated per cluster** |
| Interpretability | Low (why did expert 7 activate?) | **High (Audience expert activated)** |
| Domain knowledge | None | **Ontology encodes expertise** |

**Potential publication:**
- *"OntoMoE: Ontology-Guided Mixture-of-Experts Fine-Tuning for Domain Specialization"*
- *"From Taxonomy to Experts: Structured Knowledge Injection into MoE Language Models"*

### 14.7 Implementation Priority

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION SEQUENCE                          │
│                                                                     │
│  WEEKS 1-4: MVP (Agent Level)                                      │
│  ─────────────────────────────                                     │
│  ✓ LangGraph pipeline                                              │
│  ✓ skills.md for each agent                                        │
│  ✓ Standard Claude/Mistral as LLM                                  │
│  ✓ Working email generation                                        │
│                                                                     │
│  WEEKS 5-6: Optimization                                           │
│  ────────────────────────────                                      │
│  ✓ DSPy prompt optimization                                        │
│  ✓ Sparse activation (Top-K routing)                               │
│  ✓ Evaluation corpus and metrics                                   │
│                                                                     │
│  WEEKS 7-8: MoE Enhancement (OPTIONAL)                             │
│  ────────────────────────────────────                              │
│  ○ Curate cluster-specific training data                           │
│  ○ Train LoRA experts per cluster                                  │
│  ○ Combine into custom MoE model                                   │
│  ○ A/B test: Standard LLM vs. Ontology-MoE                        │
│                                                                     │
│  RESULT: Ontology injected at BOTH levels                          │
│  - Level 2 (agents): skills.md derived from ontology              │
│  - Level 1 (model): LoRA experts trained on ontology-curated data │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.8 Decision Point

**After Week 6, evaluate whether to pursue MoE enhancement:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| MVP quality | < 8/10 | Focus on prompt optimization first |
| MVP quality | ≥ 8/10 | Consider MoE enhancement |
| Latency | > 20s | MoE might help (smaller model, faster) |
| Cost per email | > $0.10 | MoE helps (local inference) |

**Key question:** Is the juice worth the squeeze? MoE adds complexity but could provide:
- 50% latency reduction (local inference vs. API)
- 90% cost reduction (no API fees)
- Novel research contribution

---

## Appendix: Quick Reference

### Key Commands for Claude Code

```bash
# Start new project
cd ~/projects
mkdir email-agent-system && cd email-agent-system
python -m venv venv && source venv/bin/activate

# Install dependencies
pip install langgraph fastapi anthropic psycopg2-binary pgvector dspy-ai

# Run development server
uvicorn src.api.main:app --reload

# Run tests
pytest tests/ -v

# Run optimization
python scripts/optimize_skills.py
```

### Key Files to Reference

- **Ontology:** `email_taxonomy_v1.3.yaml` (378KB)
- **Evaluation:** `evaluation_ontology_v1.3.md`
- **This summary:** `PROJECT_SUMMARY_ONTOLOGY_TO_AGENTS.md`

### Contact / Context

- **User:** borya (shaxno@gmail.com)
- **Project:** AlpacaRelay email generation system
- **Goal:** Ontology-driven email generation with agent pipeline
- **Tool:** Transition from Claude Cowork to Claude Code for implementation

---

*This document provides complete context for continuing development. All architecture decisions have been made and aligned. Ready for implementation in Claude Code.*
