# TalentArchitect: AI-Powered Hiring Intelligence Platform

## Executive Summary

A product ladder approach to building an AI-powered talent marketplace, starting with a **standalone JD Generator SaaS** and expanding through interview tools to a full candidate matching platform.

**The Wedge Strategy**: Rather than building a two-sided marketplace from scratch (high risk, long time to revenue), we start with a single-sided SaaS tool that solves an immediate pain point—writing effective job descriptions. This acquires demand-side customers, validates the ontology, and generates revenue from Week 6.

**Core Innovation**: A structured work ontology (built on O*NET) that powers the entire product ladder. The same ontology that helps generate perfect job descriptions will later power interview question generation, candidate matching, and a full talent marketplace.

**Product Ladder**:
1. **JD Generator** ($19/mo) — Write better job descriptions with AI
2. **JD Optimizer** ($29/mo) — Track which JDs work, learn from outcomes
3. **Interview Generator** ($49/mo) — Generate structured interviews from JDs
4. **Candidate Marketplace** (Success fees) — Match candidates to your perfected requirements

**Revenue Model**: SaaS subscriptions ($19-99/mo) scaling to marketplace success fees (15-20%).

**Target**: $50K MRR from JD tools alone, scaling to $150K+ MRR with marketplace.

---

## Part 1: The Wedge Product Strategy

### 1.1 Why Start with JD Generator (Not Marketplace)

Two-sided marketplaces are notoriously difficult to bootstrap:
- Chicken-and-egg: Employers won't come without candidates, candidates won't come without jobs
- Long time to revenue: Must build both sides before any transaction
- High GTM complexity: "Use our new platform" is a hard sell
- Validation risk: Don't know if matching works until everything is built

**The wedge product approach solves all of this:**

| Challenge | Marketplace-First | Wedge Product |
|-----------|-------------------|---------------|
| Revenue timing | Months/years | Week 6 |
| Customer acquisition | Need both sides | One-sided, simpler |
| Validation | Late | Early and continuous |
| Pivot cost | 20+ weeks wasted | 6 weeks max |
| GTM message | "Use our new platform" | "Better JDs for $19/mo" |

### 1.2 The Product Ladder

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCT EVOLUTION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 4: CANDIDATE MARKETPLACE (Month 9+)                       │
│  "Here's WHO you should interview"                              │
│  ├── Full matching engine against vetted candidates            │
│  ├── Pipeline, collaboration, trial engagements                │
│  ├── Payments, contracts, engagement management                │
│  └── Revenue: Success fees (15-20%) + Subscriptions            │
│                              ▲                                   │
│                              │ Natural upsell: "Want candidates │
│                              │ who match this perfect JD?"      │
│                              │                                   │
│  STEP 3: INTERVIEW GENERATOR (Month 6-9)                        │
│  "Here's HOW to interview for this role"                        │
│  ├── JD → Structured interview questions                        │
│  ├── Skill-specific probes based on ontology                   │
│  ├── Scoring rubrics calibrated to requirements                │
│  ├── Interview scorecards for team alignment                   │
│  └── Revenue: $49/mo (Pro tier)                                │
│                              ▲                                   │
│                              │ Natural upsell: "You wrote the   │
│                              │ JD, now interview for it"        │
│                              │                                   │
│  STEP 2: JD OPTIMIZER (Month 3-6)                               │
│  "Which JDs work best for you"                                  │
│  ├── Outcome tracking: "Did this JD → hire?"                   │
│  ├── JD scoring against ontology completeness                  │
│  ├── "What worked" recommendations (internal RAG)              │
│  ├── Team sharing and collaboration                            │
│  └── Revenue: $29/mo (Starter+)                                │
│                              ▲                                   │
│                              │ Natural upsell: "Track which     │
│                              │ of your JDs actually work"       │
│                              │                                   │
│  STEP 1: JD GENERATOR — MVP (Month 1-3)                         │
│  "Write better job descriptions with AI"                        │
│  ├── Ontology-powered requirement structuring                  │
│  ├── CPO Agent + Domain Specialist architecture                │
│  ├── Clarifying questions → perfect JDs                        │
│  ├── Export to LinkedIn, Indeed, ATS                           │
│  ├── Template library                                           │
│  └── Revenue: $19/mo subscription                              │
│                                                                  │
│  ════════════════════════════════════════════════════════════   │
│                     ONTOLOGY FOUNDATION                          │
│        (Same asset powers entire product ladder)                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Why This Sequence Works

**Each step validates the next:**
- JD Generator validates the ontology works for structuring requirements
- JD Optimizer validates employers want to improve hiring outcomes
- Interview Generator validates employers trust our understanding of roles
- Marketplace is natural: "You trusted us with JD + interview, now trust us with candidates"

**Each step builds on the last:**
- JD templates become interview templates
- Outcome tracking data improves matching algorithms
- Employer relationships become marketplace demand
- Every JD is a structured requirement ready for matching

**Revenue compounds:**
- Step 1: $19/mo × users
- Step 2: $29/mo × users (upgrade)
- Step 3: $49/mo × users (upgrade)
- Step 4: Success fees on top of subscriptions

**Dog-fooding: Building What We Need:**
A critical strategic benefit: when we launch the marketplace (Step 4), we will need our own JD creation, analytics, and interview systems to operate it. By building these as standalone products first:
- We battle-test the tools with real customers before we depend on them
- We discover edge cases and improve quality through production usage
- The marketplace launches with mature, proven tooling—not v1 experiments
- Our internal operations use the same tools we sell (alignment of incentives)

This isn't just "building products then adding marketplace"—it's **building the infrastructure the marketplace requires**, while generating revenue and learning along the way.

### 1.4 The JD Corpus: Competitive Moat via Web Crawling

The ontology and agents need real-world data to be effective. We build a **JD Corpus**—a continuously updated database of millions of job descriptions crawled from the web, structured against our ontology.

#### Why the JD Corpus is Critical

```
┌─────────────────────────────────────────────────────────────────┐
│                    JD CORPUS FLYWHEEL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CRAWL                                                           │
│  ├── LinkedIn, Indeed, Glassdoor, company career pages          │
│  ├── HN "Who's Hiring", AngelList, remote job boards            │
│  ├── ~100K new JDs/month ingested                               │
│  └── Continuous, automated pipeline                             │
│                              │                                   │
│                              ▼                                   │
│  STRUCTURE                                                       │
│  ├── Apply Recruiting Agent to each JD                          │
│  ├── Map to O*NET occupation codes                              │
│  ├── Extract skills, requirements, context                      │
│  ├── Normalize to ontology terms                                │
│  └── Store as Structured Requirement Objects (SROs)             │
│                              │                                   │
│                              ▼                                   │
│  ANALYZE                                                         │
│  ├── Skill frequency by role/industry/location                  │
│  ├── Salary ranges by requirement combination                   │
│  ├── Trending skills (quarter over quarter)                     │
│  ├── Requirement patterns that correlate with outcomes          │
│  └── Industry-specific variations                               │
│                              │                                   │
│                              ▼                                   │
│  POWER PRODUCTS                                                  │
│                                                                  │
│  JD Generator (Step 1):                                         │
│  ├── RAG: "Similar JDs for Data Engineer include..."           │
│  ├── One-shot learning: Best examples for each role            │
│  ├── Suggestions: "87% of Data Engineer JDs require SQL"       │
│  └── Validation: "This requirement is unusual for this role"   │
│                                                                  │
│  JD Optimizer (Step 2):                                         │
│  ├── Benchmarking: "Your JD vs. market average"                │
│  ├── Completeness: "Missing common requirement: X"             │
│  └── Competitiveness: "Salary below market for these reqs"     │
│                                                                  │
│  Interview Generator (Step 3):                                  │
│  ├── Question patterns that map to common requirements         │
│  └── Calibration: What proficiency levels mean in practice     │
│                                                                  │
│  Marketplace (Step 4):                                          │
│  ├── Proactive matching: Crawled JDs → match to candidates     │
│  ├── Market intelligence: What roles are hot right now         │
│  └── Candidate guidance: "Roles matching your skills"          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Corpus Statistics (Target Year 1)

| Metric | Target |
|--------|--------|
| Total JDs ingested | 2M+ |
| Unique companies | 100K+ |
| Roles covered | 500+ O*NET occupations |
| Update frequency | Daily |
| Structured (SRO) coverage | 90%+ |

#### Competitive Moat

The JD Corpus creates multiple defensible advantages:

1. **Data network effect**: More JDs → better suggestions → more users → more feedback → better ontology
2. **RAG quality**: Real examples beat synthetic generation
3. **Market intelligence**: We know what skills are trending before anyone else
4. **Proactive matching**: Same crawler powers marketplace outreach
5. **Hard to replicate**: Competitors would need years to build equivalent corpus

#### Dual-Use Infrastructure

The crawler infrastructure built for the corpus serves double duty:

| Phase | Corpus Use | Marketplace Use |
|-------|------------|-----------------|
| Step 1-3 | Train ontology, power RAG | — |
| Step 4+ | Continue training | Proactive matching outreach |

By the time we launch marketplace, we have:
- Mature crawling infrastructure
- Millions of structured JDs
- Patterns for what works
- Direct pipeline to employer leads (companies actively hiring)

---

## Part 2: Product Architecture

### 2.1 The Ontology Foundation

The entire product ladder is powered by a structured work ontology—a semantic representation of jobs, skills, requirements, and their relationships.

#### Three-Layer Ontology Structure

```
Layer 1: OCCUPATION TAXONOMY
├── Based on O*NET-SOC codes (923 occupations)
├── Extended with gig/consulting-specific roles
└── Semantic hierarchy: Domain → Function → Specialization

Layer 2: COMPETENCY GRAPH
├── Skills (hard + soft)
├── Tools/Technologies
├── Knowledge Areas
├── Certifications/Credentials
└── Relationships: requires, substitutes, prerequisites, complements

Layer 3: REQUIREMENT SEMANTICS
├── Proficiency levels (1-5 scale, calibrated to O*NET)
├── Experience duration mappings
├── Equivalence rules (4yr experience ≈ Bachelor's)
├── Essential vs. Preferred vs. Bonus classification
└── Contextual modifiers (industry, company size, remote)
```

#### Ontology Neighborhoods

The ontology is partitioned into **semantic neighborhoods**—coherent clusters of related occupations and skills. Each neighborhood has specialized knowledge that powers generation and matching.

| Neighborhood | O*NET Domains | Example Roles |
|--------------|---------------|---------------|
| Software Engineering | 15-1250, 15-1299 | Backend Dev, DevOps, ML Engineer |
| Data & Analytics | 15-2000s | Data Analyst, BI Developer, Data Scientist |
| Design & Creative | 27-1000s | UX Designer, Graphic Designer, Product Designer |
| Marketing & Growth | 11-2020, 13-1160 | Growth Marketer, SEO Specialist, Content Strategist |
| Finance & Accounting | 13-2000s | Bookkeeper, Financial Analyst, Controller |
| Operations & PM | 11-9199, 13-1082 | Project Manager, Operations Manager, Scrum Master |
| Legal & Compliance | 23-0000s | Paralegal, Compliance Analyst, Contract Specialist |
| HR & Recruiting | 13-1071, 13-1151 | Recruiter, HR Generalist, Compensation Analyst |

### 2.2 The Agent Architecture

The system uses a hierarchy of AI agents that leverage the ontology:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TALENT ARCHITECT AGENTS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CPO AGENT                             │    │
│  │              (Chief People Officer)                      │    │
│  │                                                          │    │
│  │  Responsibilities:                                       │    │
│  │  • Analyze employer's stated need                       │    │
│  │  • Identify relevant ontology neighborhoods             │    │
│  │  • Dispatch to specialist agents                        │    │
│  │  • Synthesize specialist outputs                        │    │
│  │  • Identify gaps and ambiguities                        │    │
│  │  • Generate clarifying questions                        │    │
│  │  • Produce final structured output (JD, Interview, etc) │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │   Software    │ │     Data      │ │    Design     │  ...    │
│  │  Specialist   │ │  Specialist   │ │  Specialist   │         │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤         │
│  │ Domain expert │ │ Domain expert │ │ Domain expert │         │
│  │ for:          │ │ for:          │ │ for:          │         │
│  │ • Languages   │ │ • Tools       │ │ • Tools       │         │
│  │ • Frameworks  │ │ • Pipelines   │ │ • Methods     │         │
│  │ • Patterns    │ │ • ML vs BI    │ │ • Portfolios  │         │
│  │ • Seniority   │ │ • Scale reqs  │ │ • Styles      │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
│  OUTPUTS BY PRODUCT:                                            │
│  • JD Generator: Structured job description                    │
│  • Interview Generator: Questions + rubrics                    │
│  • Candidate Matcher: Match scores + explanations              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Structured Requirement Object (SRO)

The core data model that flows through all products:

```yaml
structured_requirement_object:
  id: "sro_abc123"
  
  metadata:
    title: "Senior Data Engineer"
    company_context: "Series B fintech startup"
    created_at: "2026-02-15"
    version: 3
    status: "active"  # draft, active, filled, archived
  
  ontology_mapping:
    primary_occupation: "15-1252.00"  # Software Developers
    secondary_occupations: ["15-2051.00"]  # Data Scientists
    neighborhood: "data_analytics"
  
  requirements:
    essential:
      - skill: "sql"
        proficiency: 4
        context: "complex queries, optimization"
      - skill: "python"
        proficiency: 4
        context: "data pipelines"
      - experience:
          domain: "data_engineering"
          min_years: 4
    
    preferred:
      - skill: "dbt"
        proficiency: 3
      - skill: "airflow"
        proficiency: 3
      - credential: "cloud_certification"
        options: ["AWS", "GCP", "Azure"]
    
    bonus:
      - skill: "spark"
        proficiency: 2
      - experience:
          domain: "fintech"
          min_years: 1
  
  context:
    employment_type: "full_time"  # or contract, hourly
    location: "remote"
    compensation:
      salary_range: [150000, 200000]
      # or hourly_range: [75, 120]
    team_size: 5
    reports_to: "VP Engineering"
  
  generated_content:
    job_description: "..."  # Full JD text
    interview_questions: [...]  # Step 3
    scoring_rubric: {...}  # Step 3
  
  outcomes:  # Step 2
    posted_to: ["linkedin", "indeed"]
    applications_received: 47
    interviews_conducted: 8
    hire_made: true
    hire_date: "2026-04-01"
    success_rating: 4  # 1-5, self-reported
```

---

## Part 3: Step 1 — JD Generator (MVP)

### 3.1 Product Overview

The JD Generator is a standalone SaaS tool that helps hiring managers write better job descriptions using AI powered by the work ontology.

**Value Proposition**: "Stop writing job descriptions from scratch. Our AI understands what makes roles successful and creates JDs that attract the right candidates."

**Target Users**:
- Hiring managers at startups (no dedicated recruiter)
- Small HR teams (1-5 people)
- Recruiting agencies
- Freelance recruiters

### 3.2 User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JD GENERATOR USER FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: INITIAL INPUT                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ "What role are you hiring for?"                          │    │
│  │                                                          │    │
│  │ [I need a data engineer to help build our analytics     │    │
│  │  infrastructure. We have customer data in Salesforce    │    │
│  │  and HubSpot and want dashboards for the sales team.]   │    │
│  │                                                          │    │
│  │                                      [Continue →]        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 2: AI ANALYSIS (Behind the scenes)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ CPO Agent:                                               │    │
│  │ • Identifies neighborhood: Data & Analytics             │    │
│  │ • Maps to O*NET: 15-1252 (Data Engineer)               │    │
│  │ • Dispatches to Data Specialist                         │    │
│  │                                                          │    │
│  │ Data Specialist infers:                                  │    │
│  │ • Role: Data Engineer with BI focus                     │    │
│  │ • Skills: SQL, Python, ETL, BI tools                    │    │
│  │ • Context: CRM integration (Salesforce, HubSpot)        │    │
│  │ • Level: Mid to Senior (dashboards + infrastructure)    │    │
│  │                                                          │    │
│  │ Gaps identified: Stack details, data volume, timeline   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 3: CLARIFYING QUESTIONS                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ To create the perfect JD, I need a few more details:    │    │
│  │                                                          │    │
│  │ 1. Do you have a data warehouse, or will they set one up?│   │
│  │    ○ We have one (Snowflake/BigQuery/Redshift/Other)    │    │
│  │    ○ Need to set one up                                 │    │
│  │    ○ Not sure yet                                        │    │
│  │                                                          │    │
│  │ 2. What BI tools does your team use (or prefer)?        │    │
│  │    □ Tableau  □ Looker  □ Power BI  □ Metabase         │    │
│  │    □ None yet - they'll help choose                     │    │
│  │                                                          │    │
│  │ 3. Is this remote, hybrid, or on-site?                  │    │
│  │    ○ Remote  ○ Hybrid  ○ On-site                        │    │
│  │                                                          │    │
│  │ 4. What's your budget range?                            │    │
│  │    ○ $120-150K  ○ $150-180K  ○ $180-220K  ○ Flexible   │    │
│  │                                                          │    │
│  │                                      [Generate JD →]     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 4: GENERATED JD                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ┌─────────────────────────────────────────────────┐     │    │
│  │ │ SENIOR DATA ENGINEER                             │     │    │
│  │ │ [Remote] | [$150,000 - $180,000]                │     │    │
│  │ │                                                  │     │    │
│  │ │ ABOUT THE ROLE                                   │     │    │
│  │ │ We're looking for a Senior Data Engineer to     │     │    │
│  │ │ build the analytics foundation for our growing  │     │    │
│  │ │ sales team. You'll own the data pipeline from   │     │    │
│  │ │ our CRM systems (Salesforce, HubSpot) through   │     │    │
│  │ │ to executive dashboards...                      │     │    │
│  │ │                                                  │     │    │
│  │ │ WHAT YOU'LL DO                                   │     │    │
│  │ │ • Design and build data pipelines from CRM...  │     │    │
│  │ │ • Set up and maintain our Snowflake warehouse  │     │    │
│  │ │ • Create dashboards in Looker for sales team   │     │    │
│  │ │ • Establish data quality monitoring...          │     │    │
│  │ │                                                  │     │    │
│  │ │ REQUIREMENTS                                     │     │    │
│  │ │ • 4+ years of data engineering experience      │     │    │
│  │ │ • Expert SQL (complex queries, optimization)   │     │    │
│  │ │ • Strong Python for data pipelines             │     │    │
│  │ │ • Experience with cloud data warehouses        │     │    │
│  │ │ • Familiarity with BI tools                    │     │    │
│  │ │                                                  │     │    │
│  │ │ NICE TO HAVE                                     │     │    │
│  │ │ • dbt experience                                │     │    │
│  │ │ • Salesforce/HubSpot API experience            │     │    │
│  │ │ • Airflow or similar orchestration             │     │    │
│  │ │                                                  │     │    │
│  │ │ ABOUT US                                         │     │    │
│  │ │ [Company context placeholder]                   │     │    │
│  │ └─────────────────────────────────────────────────┘     │    │
│  │                                                          │    │
│  │ [✏️ Edit] [🔄 Regenerate] [📋 Copy] [📥 Download]       │    │
│  │ [💼 Post to LinkedIn] [💾 Save as Template]             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 5: EDIT & REFINE                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ User can:                                                │    │
│  │ • Edit any section inline                               │    │
│  │ • "Regenerate this section" with additional context     │    │
│  │ • Adjust tone: More formal / More casual                │    │
│  │ • Add company-specific details                          │    │
│  │ • Expand/collapse sections                              │    │
│  │                                                          │    │
│  │ AI assists:                                              │    │
│  │ • "This requirement might be too narrow..."             │    │
│  │ • "Consider adding [skill] based on similar roles"      │    │
│  │ • "Salary seems low for this experience level"          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 6: EXPORT & SAVE                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Export Options:                                          │    │
│  │ • Copy to clipboard (formatted)                         │    │
│  │ • Download as .docx                                      │    │
│  │ • Download as .pdf                                       │    │
│  │                                                          │    │
│  │ Save to Library:                                         │    │
│  │ • Template name: "Senior Data Engineer - BI Focus"      │    │
│  │ • Tags: data, analytics, remote                         │    │
│  │ • [Save Template]                                        │    │
│  │                                                          │    │
│  │ Future (Step 2): Track outcome                          │    │
│  │ • "Did this JD result in a hire?"                       │    │
│  │ • Link to interview questions (Step 3)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Key Features

**Core (MVP)**:
- AI-powered JD generation from natural language input
- Clarifying questions to capture missing requirements
- Ontology-backed skill and requirement suggestions
- Multiple tone options (formal, conversational, startup-y)
- Template library (save and reuse JDs)
- Export to clipboard, .docx, .pdf

**Enhanced (Month 2-3)**:
- JD scoring (completeness, clarity, bias detection)
- Competitive salary suggestions by role/location
- "Similar JDs that worked" suggestions
- Team sharing (multiple users on same account)

### 3.4 Pricing

| Tier | Price | Distribution | JDs/Month | Key Features |
|------|-------|--------------|-----------|--------------|
| **Free** | $0 | Trial | 2 | Basic generation, copy export |
| **Starter** | $20/mo | 80% of paid | 5 | All exports, JD scoring, suggestions |
| **Pro** | $100/mo | 15% of paid | 25 | 3 teammates, 1 workspace, ATS integration, CV-informed features |
| **Team** | $200/mo | 5% of paid | Unlimited | 10 teammates, multi-workspace, analytics, priority support |

**Unit Economics**:
```
Blended ARPU: (80% × $20) + (15% × $100) + (5% × $200) = $41/month
Target: $1M ARR = 2,032 paying customers
CAC Target: $100-150 (blended)
LTV (18mo): $738
LTV:CAC Ratio: 4.9x ✓
```

### 3.5 Technical Implementation (Weeks 1-6)

#### Week 1-2: Foundation

| Task | Description | Deliverable | Effort |
|------|-------------|-------------|--------|
| Ontology Schema | YAML schema for occupations, skills, relationships | `ontology/schema.yaml` | 2 days |
| O*NET Import | Parse and import occupation + skill data | `scripts/onet_import.py` | 2 days |
| Skill Graph | Substitution, prerequisite, complement edges | `ontology/skill_graph.yaml` | 2 days |
| SRO Model | Structured Requirement Object data model | `models/sro.py` | 1 day |
| Database Setup | Postgres + initial schema | `db/migrations/` | 1 day |
| API Scaffold | FastAPI project structure | `api/` | 1 day |

#### Week 3-4: Agent System

| Task | Description | Deliverable | Effort |
|------|-------------|-------------|--------|
| CPO Agent | Main orchestrator agent | `agents/cpo.py` | 3 days |
| Specialist Agents | Domain-specific agents (start with 3) | `agents/specialists/` | 3 days |
| Clarification Engine | Generate and process clarifying questions | `agents/clarification.py` | 2 days |
| JD Generator | Combine agent outputs into JD | `agents/jd_generator.py` | 2 days |
| Prompt Engineering | Tune prompts for quality output | `prompts/` | 2 days |

#### Week 5-6: Product

| Task | Description | Deliverable | Effort |
|------|-------------|-------------|--------|
| Landing Page | Marketing + sign-up | `frontend/landing/` | 2 days |
| JD Creation Flow | Multi-step wizard UI | `frontend/create/` | 3 days |
| JD Editor | Inline editing, regeneration | `frontend/editor/` | 2 days |
| Template Library | Save, browse, clone templates | `frontend/templates/` | 2 days |
| Export System | Copy, .docx, .pdf generation | `api/export.py` | 1 day |
| Stripe Integration | Subscription billing | `billing/stripe.py` | 2 days |
| Auth | Sign-up, login, sessions | `auth/` | 1 day |

**Exit Criteria (Week 6)**:
- [ ] User can describe a role → get a quality JD
- [ ] Clarifying questions improve output
- [ ] JDs can be edited, exported, saved
- [ ] Stripe billing working
- [ ] Ready to launch

### 3.6 Go-to-Market Strategy

#### 3.6.1 SEO Template Pages Strategy

The ontology enables programmatic SEO at scale. We generate landing pages for every job title × level × industry combination.

```
PAGE ARCHITECTURE
─────────────────────────────────────────────────────────────────

1. TEMPLATE PAGES (high volume, broad intent)
   URL: /templates/[job-title]-job-description
   
   Examples:
   • /templates/software-engineer-job-description
   • /templates/data-analyst-job-description
   • /templates/product-manager-job-description
   
   Content per page:
   ┌─────────────────────────────────────────────────────────┐
   │ Software Engineer Job Description Template              │
   │                                                         │
   │ [Sample JD - readable, SEO-optimized]                  │
   │                                                         │
   │ Key sections explained:                                 │
   │ • What to include in responsibilities                   │
   │ • Required vs preferred skills                          │
   │ • Salary benchmarks for this role                       │
   │                                                         │
   │ [Generate Your Customized Version →]  ← CTA to product │
   └─────────────────────────────────────────────────────────┘
   
   Volume: 200+ pages covering top job titles
   Search volume: 50K-100K monthly searches across all pages

2. INDUSTRY-SPECIFIC PAGES (segmented, higher intent)
   URL: /templates/[industry]/[job-title]-job-description
   
   Examples:
   • /templates/healthcare/nurse-manager-job-description
   • /templates/fintech/compliance-officer-job-description
   • /templates/saas/customer-success-manager-job-description
   
   Volume: 500+ pages (25 industries × 20 roles)

3. FUNCTIONALITY PAGES (highest intent)
   URL: /tools/ai-job-description-generator
   URL: /tools/jd-builder
   URL: /guides/how-to-write-job-description
   
   Content: Embedded tool preview with "Try it now" CTA
   Volume: 20-50 pages

4. COMPARISON PAGES (competitor traffic capture)
   URL: /compare/talentarchitect-vs-textio
   URL: /alternatives/textio-alternative
   
   Volume: 10-20 pages

TOTAL SEO CONTENT PLAN: 700-800 pages

ESTIMATED TRAFFIC (Month 12):
• Template pages:      10,000 visitors/month
• Industry pages:       5,000 visitors/month
• Functionality pages:  3,000 visitors/month
• Comparison pages:     1,000 visitors/month
─────────────────────────────────────────────────────────────────
TOTAL:                 19,000 organic visitors/month
At 1.5% conversion:    285 new customers/month from SEO
```

#### 3.6.2 Outbound Strategy: "Let Me Rewrite Your JD"

Value-first outreach that demonstrates the product instead of pitching it.

**Target Identification Pipeline**:
```
1. Scrape jobs from LinkedIn/Indeed/Glassdoor (last 7 days)
2. Filter: Company size 10-500 employees (sweet spot)
3. Identify company domain
4. Find hiring manager/recruiter via LinkedIn Sales Navigator
5. Find email via Hunter.io/Apollo
6. Run their JD through our system → generate improved version
7. Send personalized outreach with the rewritten JD
```

**Outreach Sequence**:

```
EMAIL 1 (Day 0): Value Delivery
─────────────────────────────────────────────────────────────────
Subject: I rewrote your [Job Title] job description

Hi [Name],

I noticed your [Job Title] posting on [Platform].

I ran it through our AI analysis and rewrote it to:
✓ Clarify must-have vs nice-to-have skills
✓ Remove language that discourages qualified candidates  
✓ Add specifics that attract the right experience level

Here's your optimized version: [Link to personalized page]

[Screenshot showing before/after or score improvement]

No strings attached—use it if you like it.

If you want to generate more JDs like this: [Link to product]

Best,
[Name]
─────────────────────────────────────────────────────────────────

EMAIL 2 (Day 3): Follow-up
─────────────────────────────────────────────────────────────────
Subject: Re: Your [Job Title] posting

Quick follow-up—did you get a chance to look at the 
rewritten JD?

We've seen companies get 30% more qualified applicants 
with clearer job descriptions.

If you're still hiring for this role, the optimized 
version might help: [Link]
─────────────────────────────────────────────────────────────────

EMAIL 3 (Day 7): Interview Questions Angle (Cross-sell Step 3)
─────────────────────────────────────────────────────────────────
Subject: Interview questions for your [Job Title] role

Hi [Name],

Since you're hiring a [Job Title], I generated a 
structured interview guide based on the requirements:

• Technical assessment questions
• Behavioral questions (STAR format)  
• Scoring rubrics for consistency

Grab it here: [Link]

This way you interview for what you actually need.
─────────────────────────────────────────────────────────────────
```

**Expected Performance**:
| Metric | Traditional Cold | Value-First Outreach |
|--------|------------------|----------------------|
| Open rate | 20-30% | 40-50% |
| Response rate | 1-3% | 10-15% |
| Signup rate | 10% of responses | 20-30% of responses |
| Net conversion | 0.1-0.3% | 2-4% |

**SDR Economics**:
```
1 SDR capacity: 100 personalized emails/day
Response rate: 15% → 15 responses/day
Signup rate: 20% → 3 signups/day
Monthly: 60-70 signups per SDR
Cost: $5K/mo (SDR salary) ÷ 65 signups = $77 CAC ✓
```

#### 3.6.3 Paid Acquisition (Bridge While SEO Ramps)

```
GOOGLE ADS STRATEGY
─────────────────────────────────────────────────────────────────
High-intent keywords:
• "job description generator"     - $3-5 CPC
• "ai job description writer"     - $2-4 CPC  
• "job description template"      - $2-3 CPC

Budget: $5K/month
Expected CPC: $3.50
Clicks: 1,429/month
Conversion rate: 3%
Signups: 43/month
CAC: $116 ✓ (within $100-150 target)

Scale up if CAC remains under $150.
─────────────────────────────────────────────────────────────────
```

#### 3.6.4 Launch Sequence

| Week | Activity | Target |
|------|----------|--------|
| 7 | Soft launch to beta list | 50 users, feedback |
| 8 | Product Hunt launch | 500 signups, PR boost |
| 9-10 | Outbound begins (1 SDR) | 100 signups |
| 11-12 | Paid ads + content ramp | 150 signups |
| 13+ | SEO starts ranking | Compound growth |

#### 3.6.5 Content Marketing & Virality

**Weekly content cadence**:
- 2 LinkedIn posts on JD optimization tips
- 1 "Bad JD of the Week" teardown (viral potential)
- 1 blog post (SEO)

**Viral loops**:
- "Powered by TalentArchitect" on exported JDs
- Shareable JD scores ("Your JD scored 73/100")
- Referral program: "Give $5, Get $5" credit

**Estimated viral coefficient**: 0.1 (10% of customers refer someone)

---

## Part 4: Step 2 — JD Optimizer (Months 3-6)

### 4.1 Product Overview

Step 2 transforms the JD Generator from a creation tool into a **learning system**. The key insight: we can evaluate if a JD "works" by analyzing the CVs/resumes it attracts—comparing them against what the JD actually needs using our ontology-based matching engine.

**Value Proposition**: "Connect your ATS. We'll automatically analyze every applicant and show you exactly which candidates match your requirements—and where your JD is attracting the wrong people."

**The Feedback Loop**:
```
JD Created → Posted to ATS → Applicants Apply → 
ATS Syncs CVs Automatically → Matching Engine Evaluates → 
Reviewer AI Analyzes Mismatches → Recommendations Generated → 
Next JD is Better
```

**Why ATS Integration is Core**:
1. **Automatic data flow** — CVs sync as people apply, zero manual effort
2. **Complete picture** — Every applicant analyzed, not just a sample
3. **Real-time insights** — Dashboard updates as applications come in
4. **Already linked** — CVs are already associated with jobs in ATS
5. **Foundation for marketplace** — Same integration pipes candidates later

### 4.2 The ATS Integration Layer

ATS integration is the primary path for CV ingestion. We pull applicant CVs/resumes (not just pipeline statistics) to power the matching evaluation.

#### Supported ATS Platforms

| ATS | Market Share | API | CV Access | Priority |
|-----|--------------|-----|-----------|----------|
| **Greenhouse** | ~25% of tech | Harvest API | ✅ Full resume access | P0 |
| **Lever** | ~15% of tech | REST API | ✅ Full resume access | P0 |
| **Ashby** | Growing startups | REST API | ✅ Full resume access | P1 |
| **Workday** | Enterprise | SOAP/REST | ⚠️ Complex permissions | P2 |
| **BambooHR** | SMB | REST API | ✅ Resume access | P1 |

#### What We Pull from ATS

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATS INTEGRATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CONNECT (One-time OAuth setup)                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ "Connect your ATS to automatically analyze applicants"  │    │
│  │                                                          │    │
│  │ [🌿 Connect Greenhouse]  [🏢 Connect Lever]             │    │
│  │ [📊 Connect Ashby]       [📝 Manual Upload (fallback)]  │    │
│  │                                                          │    │
│  │ Permissions requested:                                   │    │
│  │ • Read job postings (to link to our JDs)                │    │
│  │ • Read candidate applications                           │    │
│  │ • Read/download resumes and CVs ← KEY                   │    │
│  │ • Read application source (LinkedIn, Indeed, etc.)      │    │
│  │                                                          │    │
│  │ We do NOT request:                                       │    │
│  │ • Write access (we don't modify your ATS)               │    │
│  │ • Interview notes or scorecards                         │    │
│  │ • Compensation data                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  SYNC (Continuous, automatic)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ For each job in ATS linked to our JD:                   │    │
│  │                                                          │    │
│  │ On new application (webhook):                           │    │
│  │ ├── Download CV/resume file (PDF, DOCX)                │    │
│  │ ├── Capture application metadata:                       │    │
│  │ │   • Application date/time                            │    │
│  │ │   • Source (LinkedIn, Indeed, referral, direct)      │    │
│  │ │   • Current stage (for later correlation)            │    │
│  │ ├── Parse CV → Candidate Profile Object (CPO)          │    │
│  │ ├── Match against JD → Score + breakdown               │    │
│  │ └── Update JD Health dashboard in real-time            │    │
│  │                                                          │    │
│  │ Polling fallback (if webhooks unavailable):             │    │
│  │ • Check for new applications every 15 minutes          │    │
│  │ • Process any new CVs found                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  LINK (JD ↔ ATS Job matching)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Auto-matching:                                           │    │
│  │ • Fuzzy match on title + description text               │    │
│  │ • Timestamp correlation (created within 24hr)           │    │
│  │ • Confidence score displayed                            │    │
│  │                                                          │    │
│  │ "We found 'Senior Data Engineer' in Greenhouse.         │    │
│  │  Is this the JD you created?"                           │    │
│  │ [Yes, link them] [No, different role] [Link manually]   │    │
│  │                                                          │    │
│  │ Future: Post JD directly to ATS → auto-linked           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Real-Time Dashboard Updates

```
┌─────────────────────────────────────────────────────────────────┐
│  JD: Senior Data Engineer            🔗 Linked to Greenhouse    │
│  Posted: 3 days ago                  Last sync: 2 min ago      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LIVE APPLICANT ANALYSIS                          47 applicants │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │  ✅ Strong Match (80-100)    ████████░░░░░░░  12 (26%)   │    │
│  │  ⚠️ Partial Match (50-79)   ██████████████░  19 (40%)   │    │
│  │  ❌ Non-Match (<50)          ████████████████  16 (34%)   │    │
│  │                                                          │    │
│  │  On-Target Rate: 26%  (Industry avg: 30%)               │    │
│  │  ⚠️ Below average — see recommendations                 │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  LATEST APPLICANTS                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🕐 2 min ago   Chen W.        87% ✅  Data Engineer     │    │
│  │ 🕐 15 min ago  Sarah K.       94% ✅  Data Engineer     │    │
│  │ 🕐 1 hr ago    Mike T.        52% ⚠️  Data Analyst      │    │
│  │ 🕐 2 hr ago    James L.       61% ⚠️  ML Engineer       │    │
│  │ 🕐 3 hr ago    Priya S.       31% ❌  Business Analyst  │    │
│  │                                                          │    │
│  │ [View All 47] [Export Matches] [View Report]            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  🔔 INSIGHT: 40% of non-matches are Data Analysts.             │
│     Your JD may be using "analytics" language that attracts    │
│     the wrong role. [See Recommendations →]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Manual Upload (Fallback)

For users without ATS or with unsupported systems:

```
┌─────────────────────────────────────────────────────────────────┐
│  MANUAL CV UPLOAD                                    [Fallback] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Don't use an ATS? You can still analyze your applicants.      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │     📁 Drag & drop CVs here                             │    │
│  │        or click to browse                               │    │
│  │                                                          │    │
│  │     Supports: PDF, DOCX, DOC                            │    │
│  │     Bulk upload: up to 100 files at once                │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Or forward application emails to:                             │
│  📧 jobs+abc123@talentarchitect.ai                             │
│     (We'll extract CVs from attachments automatically)         │
│                                                                  │
│  💡 Tip: Connect your ATS for automatic, real-time analysis   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 The Matching Evaluation System

This is the core innovation—using the ontology-based matching engine to evaluate JD effectiveness by analyzing the CVs that flow in from the ATS.

#### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                  CV-BASED JD EVALUATION SYSTEM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: JD STRUCTURED AS SRO                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Senior Data Engineer                                     │    │
│  │                                                          │    │
│  │ Essential:                                               │    │
│  │ • SQL (proficiency 4+)                                  │    │
│  │ • Python for data pipelines (proficiency 4+)           │    │
│  │ • 4+ years data engineering                            │    │
│  │                                                          │    │
│  │ Preferred:                                               │    │
│  │ • dbt experience                                        │    │
│  │ • Cloud warehouse (Snowflake/BigQuery)                 │    │
│  │                                                          │    │
│  │ Context: Building analytics for sales team             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 2: CVs COME IN                                            │
│  (uploaded by user, via ATS sync, or scraped from job board)   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ CV 1: Sarah K.                                          │    │
│  │ Data Engineer, 5yr exp, SQL expert, Python, Snowflake  │    │
│  │                                                          │    │
│  │ CV 2: Mike T.                                           │    │
│  │ Data Analyst, 2yr exp, SQL, Excel, Tableau             │    │
│  │                                                          │    │
│  │ CV 3: Priya S.                                          │    │
│  │ Business Analyst, 4yr exp, SQL basics, requirements    │    │
│  │                                                          │    │
│  │ CV 4: James L.                                          │    │
│  │ ML Engineer, PhD, 6yr exp, Python, TensorFlow, research│    │
│  │                                                          │    │
│  │ CV 5: Chen W.                                           │    │
│  │ Data Engineer, 3yr exp, SQL, Python, Airflow, dbt      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 3: MATCHING ENGINE EVALUATES EACH CV                      │
│  (Same engine that powers marketplace in Step 4)               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │ CV 1 (Sarah): 94% match ✅ ON-TARGET                    │    │
│  │ ├── SQL: 5/5 (exceeds 4 required) ✓                    │    │
│  │ ├── Python: 4/5 (meets requirement) ✓                  │    │
│  │ ├── Experience: 5yr (exceeds 4yr) ✓                    │    │
│  │ └── Snowflake: bonus match ✓                           │    │
│  │                                                          │    │
│  │ CV 2 (Mike): 52% match ⚠️ OFF-TARGET                    │    │
│  │ ├── SQL: 3/5 (below 4 required) ✗                      │    │
│  │ ├── Python: 0/5 (missing) ✗                            │    │
│  │ ├── Experience: 2yr (below 4yr) ✗                      │    │
│  │ └── Role family: Analyst not Engineer ✗                │    │
│  │                                                          │    │
│  │ CV 3 (Priya): 31% match ❌ OFF-TARGET                   │    │
│  │ ├── SQL: 2/5 (well below required) ✗                   │    │
│  │ ├── Python: 0/5 (missing) ✗                            │    │
│  │ ├── Role family: Business Analyst ✗                    │    │
│  │ └── Engineering skills: none detected ✗                │    │
│  │                                                          │    │
│  │ CV 4 (James): 61% match ⚠️ OVERQUALIFIED/MISALIGNED    │    │
│  │ ├── Python: 5/5 (exceeds) ✓                            │    │
│  │ ├── SQL: 3/5 (research-focused, not production) ~      │    │
│  │ ├── Experience: 6yr ✓                                  │    │
│  │ └── Intent mismatch: wants research, JD is applied ✗   │    │
│  │                                                          │    │
│  │ CV 5 (Chen): 87% match ✅ ON-TARGET                     │    │
│  │ ├── SQL: 4/5 (meets requirement) ✓                     │    │
│  │ ├── Python: 4/5 (meets requirement) ✓                  │    │
│  │ ├── Experience: 3yr (slightly below, close) ~          │    │
│  │ └── dbt + Airflow: strong preferred match ✓            │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 4: AGGREGATE METRICS                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │ ON-TARGET RATE: 40% (2 of 5 candidates)                │    │
│  │ Industry benchmark: 25-35%                              │    │
│  │ Your historical average: 32%                            │    │
│  │ This JD: 40% ✅ Above average                          │    │
│  │                                                          │    │
│  │ MISMATCH BREAKDOWN:                                      │    │
│  │ • Wrong role family: 2 candidates (Analyst, BA)        │    │
│  │ • Underqualified: 1 candidate (experience gap)         │    │
│  │ • Intent mismatch: 1 candidate (researcher)            │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### CV Ingestion Methods

| Method | Description | Effort | Step 2 | Step 4 |
|--------|-------------|--------|--------|--------|
| **Manual Upload** | User uploads CVs/resumes | Low | ✅ | — |
| **ATS Sync** | Pull from Greenhouse/Lever | Medium | ✅ | ✅ |
| **Email Parsing** | Forward application emails | Low | ✅ | — |
| **Job Board Scrape** | Scrape applications (if posted through us) | Medium | ✅ | — |
| **Candidate Intake** | Candidates apply directly | — | — | ✅ |

**For Step 2 MVP**: Manual upload + email forwarding. ATS sync as upgrade.

### 4.3 The Reviewer AI: Mismatch Analysis

The Reviewer AI analyzes off-target candidates to understand *why* they applied and *what in the JD attracted them incorrectly*.

```
┌─────────────────────────────────────────────────────────────────┐
│                     REVIEWER AI ANALYSIS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT: Off-target CV + JD + Match breakdown                   │
│                                                                  │
│  ANALYSIS PROCESS:                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ For CV 2 (Mike - Data Analyst, 52% match):             │    │
│  │                                                          │    │
│  │ 1. ROLE CONFUSION DETECTION                             │    │
│  │    • CV role: Data Analyst (O*NET: 15-2051)            │    │
│  │    • JD role: Data Engineer (O*NET: 15-1252)           │    │
│  │    • Ontology distance: Adjacent but distinct          │    │
│  │    • Common confusion: Yes, titles often misused       │    │
│  │                                                          │    │
│  │ 2. ATTRACTION SIGNALS (why did they apply?)            │    │
│  │    • JD mentioned "dashboards" → Analyst keyword       │    │
│  │    • JD mentioned "analytics" → Analyst keyword        │    │
│  │    • JD title "Data Engineer" but body reads Analyst   │    │
│  │                                                          │    │
│  │ 3. MISSING SIGNALS (what would have filtered them?)    │    │
│  │    • No mention of "pipeline scale" or "ETL"           │    │
│  │    • No mention of "production systems"                │    │
│  │    • Experience requirement buried in paragraph        │    │
│  │                                                          │    │
│  │ 4. RECOMMENDATION                                       │    │
│  │    • Lead with "Data Engineer" not "Data" role         │    │
│  │    • Add "building ETL pipelines" to first paragraph  │    │
│  │    • Specify "production data systems at scale"        │    │
│  │    • Move "4+ years" to requirements, not prose        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ For CV 4 (James - ML Engineer, 61% match):             │    │
│  │                                                          │    │
│  │ 1. ROLE CONFUSION DETECTION                             │    │
│  │    • CV role: ML Engineer/Researcher (15-2051.01)      │    │
│  │    • JD role: Data Engineer (15-1252)                  │    │
│  │    • Ontology distance: Related but different focus    │    │
│  │                                                          │    │
│  │ 2. ATTRACTION SIGNALS                                   │    │
│  │    • JD mentioned "predictive analytics" → ML keyword  │    │
│  │    • JD mentioned "cutting-edge" → Research signal     │    │
│  │    • High Python requirement → ML Engineer match       │    │
│  │                                                          │    │
│  │ 3. MISSING SIGNALS                                      │    │
│  │    • No mention of "applied" vs "research"             │    │
│  │    • "Predictive" without context implies ML research  │    │
│  │                                                          │    │
│  │ 4. RECOMMENDATION                                       │    │
│  │    • Change "predictive analytics" → "sales forecasts" │    │
│  │    • Remove "cutting-edge" or add "production-focused" │    │
│  │    • Add "This is an engineering role, not research"   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Reviewer AI = Future Vetting Agent

The same analytical capability powers candidate vetting in the marketplace:

| Step 2 Use | Step 4 Use |
|------------|------------|
| "Why did this person apply?" | "Is this person qualified?" |
| "What signals attracted them?" | "What are their strengths?" |
| "Where's the mismatch?" | "What are the gaps?" |
| Improve JD clarity | Match explanation for employer |

**We're building the vetting system while generating revenue from JD optimization.**

### 4.4 The JD Health Report

Aggregated analysis across all CVs received for a JD:

```markdown
# JD Health Report: Senior Data Engineer - BI Focus

## Summary Metrics

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Total Applications | 47 | — | — |
| On-Target Rate | 40% | 30% avg | ✅ Above average |
| High-Quality Matches (>80%) | 8 | — | — |
| Clear Mismatches (<40%) | 12 | — | — |

**Overall JD Health Score: 76/100** (Good)

---

## What's Working ✅

### 1. Title Clarity
"Senior Data Engineer" correctly attracted 85% engineering profiles (vs 60% 
when using just "Data" in title). Keep the explicit engineering framing.

### 2. Skills Specificity
Listing "SQL, Python, cloud data warehouses" filtered effectively. 
On-target candidates had 4.2/5 average skill match vs 2.1/5 for off-target.

### 3. Remote Positioning
"Remote (US)" increased application volume 2.1x vs your on-site postings,
with no decrease in on-target rate.

---

## What's Attracting Wrong Candidates ⚠️

### 1. "Analytics" Keyword Confusion
**Problem**: 26% of off-target applicants were Data Analysts
**Cause**: JD uses "analytics" 4 times, "engineering" only 1 time
**Evidence**: Analysts applied within 48hrs of posting (keyword match)

**Recommendation**: 
- Replace "analytics infrastructure" → "data pipeline infrastructure"
- Add "This is an engineering role building systems, not analyzing data"

**Projected impact**: -30% Analyst applications, same Engineer applications

### 2. "Cutting-Edge" Attracting Researchers
**Problem**: 3 PhD/research candidates applied (61% match, intent mismatch)
**Cause**: "cutting-edge ML" and "innovative" signal research environment
**Evidence**: These candidates asked about "research time" in screening

**Recommendation**:
- Replace "cutting-edge ML" → "production ML models"
- Add "applied, not research" or remove ML mention entirely

**Projected impact**: Fewer overqualified/misaligned applications

### 3. Experience Requirement Buried
**Problem**: 19% of applicants had <3 years experience
**Cause**: "4+ years" appears in paragraph 3, not in requirements list
**Evidence**: Junior applicants had avg 2.1yr experience

**Recommendation**:
- Move "4+ years data engineering experience" to top of Requirements
- Add to first paragraph: "This is a senior role for experienced engineers"

**Projected impact**: -25% underqualified applications

---

## Mismatch Pattern Analysis

| Mismatch Type | Count | % of Off-Target | Top Cause |
|---------------|-------|-----------------|-----------|
| Wrong role family | 12 | 43% | "Analytics" keyword |
| Underqualified | 8 | 29% | Experience buried |
| Overqualified/Misaligned | 4 | 14% | "Cutting-edge" signal |
| Geography mismatch | 4 | 14% | Unclear timezone needs |

---

## Recommended JD Revisions

### High Priority
1. [ ] Replace "analytics" with "data engineering" (3 locations)
2. [ ] Move experience requirement to Requirements section
3. [ ] Add role clarification: "engineering role, not analyst"

### Medium Priority  
4. [ ] Replace "cutting-edge" with "production-grade"
5. [ ] Add timezone requirement if needed
6. [ ] Specify scale: "pipelines processing X records/day"

### After Next Round
7. [ ] Track if Analyst applications decrease
8. [ ] Monitor if on-target rate improves to 50%+

---

## Comparison to Your Other JDs

| JD | On-Target Rate | Applications | Health Score |
|----|----------------|--------------|--------------|
| **This JD** | 40% | 47 | 76 |
| Backend Engineer (Jan) | 45% | 62 | 82 |
| Data Analyst (Dec) | 52% | 38 | 85 |
| DevOps Engineer (Nov) | 28% | 29 | 61 |

This JD is performing above your DevOps posting but below your Backend 
Engineer posting. The Backend JD had clearer role differentiation.

---

*Report generated from 47 CVs received Feb 1-15, 2026*
*Confidence: High (>30 CVs analyzed)*
```

### 4.5 The Monte Carlo Learning Loop

Each JD evaluation improves future JD generation for this company:

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPANY-SPECIFIC LEARNING LOOP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OBSERVATION: JD "Senior Data Engineer"                         │
│  ├── Used "analytics" 4x → 26% wrong-role applications         │
│  ├── "Cutting-edge" → attracted researchers                    │
│  └── Experience buried → 19% underqualified                    │
│                              │                                   │
│                              ▼                                   │
│  PATTERN STORED (Company: Acme Corp)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ pattern_id: acme_data_eng_001                           │    │
│  │ role_family: data_engineering                            │    │
│  │                                                          │    │
│  │ learned_signals:                                         │    │
│  │   - term: "analytics"                                   │    │
│  │     effect: attracts_analysts                           │    │
│  │     confidence: 0.73                                    │    │
│  │     recommendation: avoid_or_clarify                    │    │
│  │                                                          │    │
│  │   - term: "cutting-edge"                                │    │
│  │     effect: attracts_researchers                        │    │
│  │     confidence: 0.61                                    │    │
│  │     recommendation: replace_with_production             │    │
│  │                                                          │    │
│  │   - pattern: experience_in_prose                        │    │
│  │     effect: missed_by_juniors                           │    │
│  │     confidence: 0.82                                    │    │
│  │     recommendation: move_to_requirements                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  NEXT JD GENERATION (Data Engineer #2)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ User: "I need another data engineer for the ML team"    │    │
│  │                                                          │    │
│  │ System applies learned patterns:                         │    │
│  │                                                          │    │
│  │ ⚠️ "You used 'analytics' before and got wrong-role     │    │
│  │    applicants. Want me to use 'data engineering' instead?"│   │
│  │                                                          │    │
│  │ ⚠️ "Last time 'cutting-edge' attracted researchers.    │    │
│  │    For ML team, should I specify 'applied ML' or       │    │
│  │    'production ML systems'?"                            │    │
│  │                                                          │    │
│  │ ✓ Experience requirement placed in Requirements section │    │
│  │   (auto-applied based on previous learning)             │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  CONTINUOUS IMPROVEMENT                                          │
│  ├── More JDs → More CVs → More patterns learned               │
│  ├── Confidence increases with observations                    │
│  ├── Company-specific model gets more accurate                 │
│  └── Eventually: "JDs from Acme Corp have 55% on-target rate" │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Data Ingestion Strategy

ATS integration is the primary path; manual upload is the fallback for non-ATS users.

| Method | Data Quality | Effort | Priority | When |
|--------|--------------|--------|----------|------|
| **ATS Integration** (Greenhouse/Lever) | Complete, automatic, real-time | Zero ongoing | **Primary** | Week 13-14 |
| **Email Forwarding** | Good, some manual effort | Low | Fallback | Week 15 |
| **Manual Upload** | Partial, batch | Medium | Fallback | Week 13 |
| **ATS Outcomes** (optional) | Adds hire/reject data | Low (additive) | Enhancement | Week 18+ |

**Go-to-Market Implication**: 
- Lead with "Connect your Greenhouse/Lever" — this is the magic
- Manual upload exists but isn't the main pitch
- 40%+ of target customers (tech startups) use Greenhouse or Lever

### 4.7 Why This Is The Marketplace Foundation

The Step 2 system IS the Step 4 matching engine—and the ATS integration is reused too:

```
┌─────────────────────────────────────────────────────────────────┐
│           SAME ENGINE, SAME INTEGRATIONS, DIFFERENT USE         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 2: JD OPTIMIZER                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ATS Integration: Pull CVs for jobs                      │    │
│  │ Input: JD (structured) + CVs (from ATS)                 │    │
│  │ Process: Match CVs against JD requirements              │    │
│  │ Output: "These CVs match, these don't, here's why"      │    │
│  │ Value: Improve JD to attract better candidates          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                    SAME MATCHING ENGINE                          │
│                    SAME REVIEWER AI                              │
│                    SAME ONTOLOGY                                 │
│                    SAME ATS INTEGRATION                          │
│                              │                                   │
│                              ▼                                   │
│  STEP 4: CANDIDATE MARKETPLACE                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ATS Integration: Push matches TO employer's ATS         │    │
│  │ Input: JD (structured) + Candidate Pool (vetted)        │    │
│  │ Process: Match candidates against JD requirements       │    │
│  │ Output: "These candidates match, ranked, here's why"    │    │
│  │ Value: Find the right person for the job                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  INFRASTRUCTURE REUSE:                                          │
│  • ATS OAuth already set up from Step 2                        │
│  • Can push hired candidates back to ATS                       │
│  • Employer already trusts us with their ATS access            │
│  • Matching engine battle-tested on their actual applicants    │
│                                                                  │
│  UPSELL PATH:                                                   │
│  "You've been analyzing applicants with us. Want us to find    │
│   candidates who actually match—before you even post the job?" │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.8 Pricing

Step 2 features are bundled with Step 1 in unified tiers:

| Tier | Price | Step 1 Features | Step 2 Features |
|------|-------|-----------------|-----------------|
| **Starter** | $20/mo | 5 JDs/month | Manual upload only (20 CVs) |
| **Pro** | $100/mo | 25 JDs, 3 teammates | ATS integration, 500 CVs, full reports |
| **Team** | $200/mo | Unlimited JDs, 10 teammates | Multi-ATS, 2,000 CVs, Monte Carlo learning, analytics |

**Upgrade trigger**: "You created 3 JDs this month. Want to see which candidates match? Connect your ATS."

**Value Prop**: "Connect your ATS, see insights in minutes, improve every JD."

### 4.9 Technical Implementation (Weeks 13-18)

#### Week 13-14: ATS Integration (Core)

| Task | Description | Effort |
|------|-------------|--------|
| Greenhouse OAuth | OAuth 2.0 flow, token management | 2 days |
| Greenhouse Harvest API | Fetch jobs, candidates, resumes | 3 days |
| Lever OAuth | OAuth 2.0 flow, token management | 1 day |
| Lever API Integration | Fetch opportunities, candidates, resumes | 2 days |
| Webhook Handlers | Real-time new application notifications | 2 days |
| JD ↔ Job Linking | Fuzzy matching, user confirmation UI | 2 days |

#### Week 15-16: Matching Engine

| Task | Description | Effort |
|------|-------------|--------|
| CV Parser | Extract structured profile from resume (PDF, DOCX) | 3 days |
| CV → CPO Mapping | Convert parsed CV to Candidate Profile Object | 2 days |
| Matching Engine v2 | JD (SRO) ↔ CV (CPO) matching with scores | 4 days |
| Match Explainer | "Why this CV does/doesn't match" breakdown | 2 days |
| Real-time Dashboard | Live applicant analysis as CVs sync | 3 days |

#### Week 17-18: Analytics & Learning

| Task | Description | Effort |
|------|-------------|--------|
| Reviewer AI | Analyze off-target patterns, generate insights | 4 days |
| JD Health Report | Aggregate analysis, markdown generation | 3 days |
| Pattern Storage | Company-specific learned patterns | 2 days |
| Learning Integration | Apply patterns to JD generation | 2 days |
| Manual Upload UI | Fallback: drag-drop, bulk upload | 2 days |
| Email Forwarding | Fallback: parse forwarded application emails | 2 days |

**Week 18 Exit Criteria**:
- [ ] Greenhouse and Lever integrations live, syncing CVs automatically
- [ ] Real-time dashboard shows applicant analysis as they apply
- [ ] Match scores and explanations generated for each CV
- [ ] Reviewer AI identifies patterns in off-target applications
- [ ] JD Health Reports generated with actionable recommendations
- [ ] Company patterns stored and applied to new JD generation
- [ ] Manual upload fallback working for non-ATS users

### 4.10 Competitive Analysis: JD Optimization Market

#### 4.10.1 Market Landscape Overview

The JD optimization market sits at the intersection of HR tech and AI writing tools. Current players focus on **three approaches**:

```
JD OPTIMIZATION MARKET SEGMENTS
─────────────────────────────────────────────────────────────────

1. PREDICTIVE JD SCORING (Textio, Datapeople)
   └── "Based on historical data, this JD SHOULD perform well"
   └── Training: Millions of past job postings + outcomes
   └── Output: Predicted fill time, diversity score, engagement
   └── Limitation: No feedback loop from YOUR actual applicants

2. BIAS & READABILITY ANALYSIS (Ongig, Applied)
   └── "This JD contains biased/complex language"
   └── Training: Linguistic patterns known to deter applicants
   └── Output: Bias flags, readability scores, suggestions
   └── Limitation: Doesn't know if changes actually improve results

3. TEMPLATE STANDARDIZATION (JDXpert, ATS built-ins)
   └── "Here's a compliant, on-brand JD template"
   └── Training: Company templates, compliance rules
   └── Output: Standardized format, locked sections
   └── Limitation: No optimization, just consistency

4. OUR APPROACH: MEASURED PERFORMANCE (TalentArchitect)
   └── "Here's who ACTUALLY applied and why they don't match"
   └── Training: Your JD + Your actual applicants via ATS
   └── Output: Match analysis, mismatch diagnosis, specific fixes
   └── Advantage: Real feedback, not predictions
```

**The Critical Gap**: Every competitor PREDICTS how a JD will perform. **None of them MEASURE actual performance by analyzing the CVs that come in.**

#### 4.10.2 Competitor Deep Dive

##### Textio — The Market Leader

| Attribute | Details |
|-----------|---------|
| **Founded** | 2014, Seattle |
| **Funding** | $42M+ raised |
| **Pricing** | ~$15,000-50,000+/year (enterprise pricing) |
| **Target** | Fortune 500, large enterprises |
| **Customers** | Johnson & Johnson, Nvidia, American Express |

**What Textio Does**:
- AI-powered "augmented writing" for JDs and performance reviews
- Real-time language suggestions as you write
- "Textio Score" predicting how JD will perform
- Bias detection (gender, age, ability)
- ATS integrations (Greenhouse, Lever, Workday)

**Textio's Data Advantage**: 
Trained on "millions of hiring outcomes" — they know which language patterns historically correlate with faster fills and more diverse applicants.

**Textio's Critical Limitation**:
```
TEXTIO'S APPROACH:
─────────────────────────────────────────────────────────────────
JD Text → Historical Pattern Matching → Predicted Performance
         ↓
"Based on 10M similar JDs, this language fills 15% faster"

WHAT'S MISSING:
─────────────────────────────────────────────────────────────────
❌ No analysis of YOUR actual applicants
❌ No feedback on whether predictions were accurate
❌ No diagnosis of WHY wrong candidates applied
❌ No company-specific learning from your outcomes
```

**Why Enterprises Still Buy Textio**:
1. Compliance and standardization at scale
2. DEI initiatives (quantifiable bias metrics)
3. Brand consistency across global teams
4. Integration with existing enterprise stack

**Our Positioning vs Textio**:
> "Textio predicts. We measure. Their score says 'this JD should work.' Our score says 'this JD DID work—or didn't—and here's exactly why, based on the 47 CVs that came through your ATS.'"

| Capability | Textio | TalentArchitect |
|------------|--------|-----------------|
| JD scoring | ✅ Predictive (historical) | ✅ Measured (actual CVs) |
| Bias detection | ✅ Strong (13+ types) | ✅ Basic |
| ATS integration | ✅ Yes | ✅ Yes (deeper—we pull CVs) |
| **Applicant analysis** | ❌ | ✅ Core feature |
| **"Why wrong people applied"** | ❌ | ✅ Reviewer AI |
| **Company-specific learning** | ❌ Generic patterns | ✅ Your data only |
| Pricing | $15K-50K+/year | $100-200/month |

##### Datapeople (formerly TapRecruit)

| Attribute | Details |
|-----------|---------|
| **Founded** | 2015, New York |
| **Funding** | $24M raised (First Round, Uncork) |
| **Pricing** | ~$5,000-15,000+/year |
| **Target** | Mid-market, scaling companies |
| **Customers** | Twitch, Allianz, Rockwell Automation |

**What Datapeople Does**:
- JD writing with "Smart Editor"
- AI suggestions powered by "100M+ jobs"
- Compliance automation (pay transparency, EEO)
- Template management and approval workflows
- Recruiting analytics dashboards

**Datapeople's Positioning**:
"Analytics for people who love hiring people" — they emphasize data-driven JD decisions.

**Datapeople's Limitation**:
Same as Textio: they analyze the JD text against historical patterns, NOT against actual applicants.

```
DATAPEOPLE VS US:
─────────────────────────────────────────────────────────────────
Datapeople says: "This JD is well-structured based on 100M jobs"
We say:          "This JD attracted 40% wrong-fit applicants,
                  here's why, and here's how to fix it"
```

| Capability | Datapeople | TalentArchitect |
|------------|------------|-----------------|
| JD templates | ✅ Strong | ✅ Basic |
| Compliance automation | ✅ Strong | ⚠️ Limited |
| Analytics dashboards | ✅ Recruiting metrics | ✅ JD performance |
| **CV-to-JD matching** | ❌ | ✅ Core |
| **Mismatch diagnosis** | ❌ | ✅ Core |
| **Feedback loop** | ❌ | ✅ Monte Carlo |
| Pricing | $5K-15K/year | $1.2K-2.4K/year |

##### Ongig

| Attribute | Details |
|-----------|---------|
| **Founded** | 2011, Oakland |
| **Pricing** | Tiered: Lite → Professional → Enterprise |
| **Target** | Companies focused on DEI |
| **Focus** | Bias detection, career site builder |

**What Ongig Does**:
- Text Analyzer: 13+ bias types (gender, age, disability, neurodiversity)
- Readability scoring and simplification
- Career site builder
- SEO optimization for job posts

**Ongig's Limitation**:
Focused purely on the JD text analysis. No integration with actual hiring outcomes.

##### Applied

| Attribute | Details |
|-----------|---------|
| **Founded** | 2016, London |
| **Pricing** | Custom |
| **Target** | Companies prioritizing unbiased hiring |
| **Focus** | Blind recruiting, skills assessments |

**What Applied Does**:
- Full ATS with debiasing at every step
- Skills-based assessments instead of CV screening
- JD analysis tool for inclusive language
- Blind shortlisting (removes names, photos)

**Applied's Approach**:
They're solving a different problem—eliminating bias from the entire funnel, not optimizing JD performance.

##### ATS Built-in Features

| ATS | JD Feature | Limitation |
|-----|-----------|------------|
| **Greenhouse** | AI JD generation | Generic, template-based |
| **Lever** | JD templates | No optimization feedback |
| **Ashby** | AI writing assist | No applicant analysis |
| **Workday** | Compliance checks | Enterprise complexity |

**Why ATS Features Are Insufficient**:
ATSs are focused on pipeline management, not JD optimization. Their JD features are add-ons, not core capabilities.

#### 4.10.3 The Fundamental Market Gap

```
WHAT EVERY COMPETITOR DOES:
─────────────────────────────────────────────────────────────────
                    ┌─────────────────────┐
                    │   Your JD Text      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Historical Data    │
                    │  (millions of JDs)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Predicted Score:    │
                    │ "This JD should     │
                    │ fill in 23 days"    │
                    └─────────────────────┘

         ❌ NO CONNECTION TO YOUR ACTUAL RESULTS

WHAT WE DO:
─────────────────────────────────────────────────────────────────
                    ┌─────────────────────┐
                    │   Your JD (SRO)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Your ATS Applicants │
                    │ (actual CVs)        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Measured Analysis:  │
                    │ "47 applied, 12     │
                    │ match, 35 don't.    │
                    │ Here's why..."      │
                    └─────────────────────┘

         ✅ FEEDBACK LOOP FROM YOUR ACTUAL HIRING
```

**Why This Matters**:

1. **Predictions are generic**: Textio's "this JD will perform well" is based on aggregate patterns. Your company, your role, your market might be different.

2. **No accountability**: If a predicted "high-scoring" JD attracts wrong candidates, there's no mechanism to learn from that failure.

3. **Missing the "why"**: Competitors can say "your JD has issues" but can't say "specifically, the word 'analytics' is attracting Data Analysts when you want Data Engineers."

4. **No company-specific learning**: Every time you use Textio, you get the same generic advice. With us, your system gets smarter because it learns from YOUR outcomes.

#### 4.10.4 Competitive Positioning Matrix

| Dimension | Textio | Datapeople | Ongig | Applied | **Us** |
|-----------|--------|------------|-------|---------|--------|
| **Primary value** | Predictive scoring | Standardization | Bias detection | Blind recruiting | Measured performance |
| **Data source** | Historical JDs | Historical JDs | Linguistic rules | Skills data | Your actual CVs |
| **Feedback loop** | ❌ None | ❌ None | ❌ None | ⚠️ Assessment scores | ✅ CV matching |
| **ATS integration** | ✅ Post JD | ✅ Post JD | ✅ Post JD | ✅ Full ATS | ✅ Pull CVs |
| **Company learning** | ❌ Generic | ❌ Generic | ❌ Generic | ⚠️ Limited | ✅ Monte Carlo |
| **Target customer** | Enterprise | Mid-market | DEI-focused | Debiasing-focused | SMB/Growth |
| **Pricing** | $15K-50K+/yr | $5K-15K/yr | $5K+/yr | Custom | $1.2K-2.4K/yr |

#### 4.10.5 Our Differentiated Positioning

**Core Message**:
> "We're the only platform that tells you WHY your JD is attracting the wrong candidates—by analyzing actual applicants from your ATS, not historical patterns from other companies."

**Against Textio**:
> "Textio costs $35K/year to tell you what MIGHT happen. We cost $1,200/year to tell you what ACTUALLY happened—and how to fix it."

**Against Datapeople**:
> "Datapeople standardizes your JDs. We optimize them. There's a difference between 'compliant' and 'effective.'"

**Against ATS Built-ins**:
> "Your ATS stores applicant data. We analyze it. You'll finally know why you're getting 100 applications but only 5 qualified candidates."

#### 4.10.6 Competitive Moat

Why can't competitors easily copy us?

1. **Technical depth**: CV parsing + ontology-based matching + Reviewer AI is a complex stack
2. **Data flywheel**: More customers → more patterns → better recommendations → more customers
3. **Integration depth**: We don't just post JDs—we pull CVs. That's a different (harder) integration
4. **Positioning**: We're the "measured results" player in a market of "predictors"

#### 4.10.7 Collaborative Opportunities

We're not competing with everyone—some are potential partners:

| Player | Relationship | Opportunity |
|--------|--------------|-------------|
| **Textio** | Complement | They do bias/DEI, we do performance. Users could use both. |
| **ATSs** | Platform | We extend their value. Potential marketplace listings. |
| **Recruiting agencies** | Channel | They need JD optimization for their clients. |
| **HR consultants** | Channel | They advise on hiring—we give them data. |

---

### 4.11 Our Positioning

> "Connect your Greenhouse or Lever. We automatically analyze every applicant against your requirements. See which candidates match—and exactly where your JD is attracting the wrong people."

**The Magic Moment**: User connects ATS → within minutes, sees their existing job with applicant analysis → "Oh wow, 40% of my applicants are Data Analysts but I wanted Data Engineers. My JD says 'analytics' too much."

### 4.12 Go-to-Market Strategy

#### 4.12.1 SEO Landing Pages: "Optimize Your JD"

A new landing page type focused on JD optimization with immediate value demonstration.

```
PAGE STRUCTURE: /optimize/[job-title]-job-description
─────────────────────────────────────────────────────────────────

Example: /optimize/senior-software-engineer-job-description

┌─────────────────────────────────────────────────────────────────┐
│  Optimize Your Senior Software Engineer Job Description         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Paste your job description here...                        │ │
│  │                                                           │ │
│  │ [Your JD text]                                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [🔍 Analyze My JD - Free]                                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  SAMPLE ANALYSIS (shown after submit):                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ JD Score: 67/100                                          │ │
│  │                                                           │ │
│  │ ⚠️ Issues Found:                                          │ │
│  │ • Unclear seniority (3 vs 5+ years?)                     │ │
│  │ • 12 required skills (too many—discourages applicants)   │ │
│  │ • Missing: Team size, tech stack specifics               │ │
│  │                                                           │ │
│  │ 📊 Likely Candidates You'll Attract:                      │ │
│  │ ┌─────────────────────────────────────────────────────┐  │ │
│  │ │  45% ████████████░░░░░░  Mid-level (you want senior)│  │ │
│  │ │  30% ████████░░░░░░░░░░  Backend-focused            │  │ │
│  │ │  25% ██████░░░░░░░░░░░░  Strong matches ✓          │  │ │
│  │ └─────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │ [🔓 Unlock Full Report + How to Fix] ← Signup gate       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  "Connect your ATS to see who ACTUALLY applied and whether     │
│   they match your requirements"                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

KEY INSIGHT: Show the PROBLEM free (score 67/100). 
Gate the SOLUTION (how to fix, who you'll attract).

PAGE VOLUME: 200+ pages covering top job titles
Target keywords:
• "optimize job description"
• "improve job posting"
• "job description analyzer"
• "[role] job description tips"
```

#### 4.12.2 Outbound Strategy: "Your JD Scores 62/100"

More compelling than Step 1 outbound because it surfaces a SPECIFIC, quantified problem.

```
EMAIL TEMPLATE: Problem-First Outreach
─────────────────────────────────────────────────────────────────
Subject: Your [Job Title] JD scored 62/100

Hi [Name],

I analyzed your [Job Title] posting on [LinkedIn/Indeed] and 
ran it through our JD optimizer.

Score: 62/100

Main issues:
❌ Too many "required" skills (signals unrealistic expectations)
❌ Vague experience requirements (attracts wrong seniority)
❌ Missing info about team/projects (candidates can't self-select)

Based on the language, you're likely attracting:
• 40% unqualified applicants
• 35% adjacent roles (not quite right)  
• 25% strong matches

Full analysis + specific fixes: [Link]

Getting lots of unqualified applicants? This might be why.

Best,
[Name]
─────────────────────────────────────────────────────────────────

FOLLOW-UP (Day 4):
─────────────────────────────────────────────────────────────────
Subject: Re: Your [Job Title] posting

Quick thought—if you connect your ATS (Greenhouse/Lever), 
we can show you exactly which applicants matched your 
requirements vs. which didn't, and why.

Takes 2 minutes: [Link]

You'll see insights like:
"70% of applicants have Python but only 30% have the 
 cloud experience you need."

Worth a look if you're still hiring.
─────────────────────────────────────────────────────────────────
```

**Why this converts better than Step 1 outbound**:
- Quantified problem (62/100 score)
- Specific issues, not generic pitch
- Predicts their pain ("getting unqualified applicants?")
- Clear value in connecting ATS

**Expected metrics**:
| Metric | Step 1 Outbound | Step 2 Outbound |
|--------|-----------------|-----------------|
| Open rate | 40-50% | 50-60% |
| Response rate | 10-15% | 15-20% |
| Reason | Helpful rewrite | Quantified problem they feel |

#### 4.12.3 Upsell from Step 1 Users

In-product upgrade prompts for existing JD Generator users:

```
TRIGGER: After user creates their 2nd JD
─────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│  💡 See Who Actually Applies                                    │
│                                                                 │
│  You've created 2 JDs. Want to know if they're working?        │
│                                                                 │
│  Connect your ATS and we'll automatically analyze every        │
│  applicant against your requirements.                          │
│                                                                 │
│  You'll see:                                                   │
│  • Match scores for each candidate                             │
│  • Which skills candidates have vs. need                       │
│  • Where your JD might be attracting wrong people              │
│                                                                 │
│  [Connect Greenhouse] [Connect Lever] [Maybe Later]            │
└─────────────────────────────────────────────────────────────────┘

TRIGGER: When user exports JD
─────────────────────────────────────────────────────────────────
"Posting this to LinkedIn? Connect your ATS to track how 
 well it performs. We'll analyze every applicant automatically."
 
 [Connect ATS →]
─────────────────────────────────────────────────────────────────
```

**Expected upgrade rate**: 15-20% of Starter users → Pro within 60 days

#### 4.12.4 Partnership Strategy: ATS Marketplaces

Greenhouse and Lever have partner app marketplaces. Getting listed provides:
- Credibility ("Greenhouse Partner")
- Distribution (their customers find us)
- Integration trust (pre-vetted)

**Application timeline**: Month 6 (after integration stable)
**Requirements**: 
- Working OAuth integration
- 10+ active customers using integration
- Support documentation

**Expected impact**: 50-100 customers/month from marketplace visibility

#### 4.12.5 Content Marketing

**Weekly cadence**:
- "JD Teardown Tuesday" - Analyze a real JD (anonymized), show what works/doesn't
- "Applicant Pool Analysis" - Aggregate insights from our data
- LinkedIn posts on "why you're getting wrong applicants"

**Lead magnet**: "The JD Scoring Checklist" (PDF download, email capture)

---

## Part 5: Step 3 — Interview Generator (Months 6-9)

### 5.1 Market Landscape: Why This Matters

The interview technology space is split into **two distinct markets**:

| Market | Buyer | Focus | Key Players |
|--------|-------|-------|-------------|
| **Candidate-Side** | Job seekers | Practice, coaching, "cheating" | Final Round AI, Parakeet, Interview Coder |
| **Employer-Side** | HR, Recruiters, Hiring Managers | Efficiency, quality, compliance | HireVue, BrightHire, Metaview |

**We are playing in the Employer-Side market**, but with a fundamentally different approach.

#### 5.1.1 Employer-Side Competitive Landscape

| Platform | Primary Value Prop | Target | Pricing | Critical Gap |
|----------|-------------------|--------|---------|--------------|
| **HireVue** | Enterprise video interviews + AI assessments | Fortune 500 | ~$35K+/year | Questions are template-based, no JD alignment |
| **BrightHire** | Interview intelligence (recording, AI notes) | Growth tech | ~$15-30K/year | Doesn't GENERATE questions, just RECORDS them |
| **Metaview** | AI note-taking during interviews | Tech companies | ~$10-20K/year | Passive—doesn't help DESIGN the interview |
| **Spark Hire** | One-way async video interviews | SMB | ~$2-5K/year | Template questions, no customization |
| **Pillar** | Structured interview guides | Tech companies | Custom | Getting closer, but still template-based |

**The Gap No One Fills**: No platform connects the JD to interview questions with semantic understanding. They either:
- Generate generic questions from templates (HireVue, Spark Hire), OR
- Just record/transcribe what interviewers already ask (BrightHire, Metaview)

#### 5.1.2 Market Size

| Segment | 2024 Value | 2034 Projection | CAGR |
|---------|------------|-----------------|------|
| Recruitment Software (total) | $2.4B | $3.7B | 4.9% |
| ATS Market | $2.7B | $5.7B | 8.3% |
| Interview Intelligence (our segment) | ~$200M | ~$800M | ~15% |

**Our serviceable market**: Companies using ATS (Greenhouse/Lever primarily) who want to improve interview quality → ~50K companies, ~$500M opportunity.

### 5.2 The Science of Interview Questions

#### 5.2.1 What Research Says

**Structured interviews are 2x more effective** at predicting job performance than unstructured interviews (Journal of Applied Psychology).

| Method | Predictive Validity | Source |
|--------|---------------------|--------|
| Unstructured interviews | 0.24 correlation with job performance | Meta-analyses |
| Structured interviews | 0.51-0.70 correlation with job performance | Multiple studies |

**Best question types by predictive validity** (Hartwell 2019 research):

| Question Type | Description | Validity |
|---------------|-------------|----------|
| **Past Behavioral** | "Tell me about a time when..." | High |
| **Situational** | "What would you do if..." | High |
| **Background** | "Describe your experience with..." | Medium-High |
| **Job Knowledge** | "How would you approach..." | Medium |

#### 5.2.2 Google's Structured Interview Approach (re:Work)

Google identified four key elements that drive predictive validity:

1. **Vetted, high-quality questions** relevant to the specific role
2. **Standardized rubrics** so reviewers share understanding of good/mediocre/poor
3. **Interviewer training and calibration** for consistency
4. **Job analysis** tying questions to actual job requirements

**Our Advantage**: We have the job analysis baked in (the JD → SRO structuring). No competitor does this.

### 5.3 Our Differentiated Approach: CV-Informed Interview Questions

#### 5.3.1 The Core Insight

**Current platforms**: Generate questions from JD only (or generic templates)

**Our approach**: Generate questions from JD + CVs of actual candidates

```
TRADITIONAL APPROACH:
JD Requirements → Generic Questions → Hope they differentiate candidates

OUR APPROACH:
JD Requirements (SRO) + Top Candidate CVs (CPO) → 
Ontology Alignment → 
Questions that:
  1. Confirm shared strengths (skills common among strong matches)
  2. Probe gaps (where CVs diverge from requirements)
  3. Separate candidates (target areas where top candidates differ)
```

#### 5.3.2 How CV-Informed Questions Work

```
┌─────────────────────────────────────────────────────────────────┐
│         CV-INFORMED INTERVIEW QUESTION GENERATION                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUTS:                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ JD (Structured as SRO):                                  │    │
│  │ • Essential: SQL (4+), Python (4+), 4+ years            │    │
│  │ • Preferred: dbt, Snowflake                             │    │
│  │ • Context: Building pipelines for sales analytics       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              +                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Top 3 Candidate CVs (from Step 2 matching):             │    │
│  │                                                          │    │
│  │ Sarah (94% match):                                       │    │
│  │ • SQL: 5/5, Python: 4/5, Snowflake: Yes, dbt: Yes       │    │
│  │ • Gap: No experience with sales data specifically       │    │
│  │                                                          │    │
│  │ Chen (87% match):                                        │    │
│  │ • SQL: 4/5, Python: 4/5, Airflow: Yes, dbt: Yes         │    │
│  │ • Gap: 3 years experience (role needs 4)                │    │
│  │                                                          │    │
│  │ Mike (78% match):                                        │    │
│  │ • SQL: 5/5, Python: 3/5, BigQuery: Yes                  │    │
│  │ • Gap: Python depth, no dbt                             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ANALYSIS: What should we ask?                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │ COMMON STRENGTHS (all top candidates have):              │    │
│  │ • SQL proficiency → Confirm with quick technical check  │    │
│  │ • Data pipeline experience → Standard behavioral Q      │    │
│  │                                                          │    │
│  │ DIFFERENTIATING FACTORS (varies among top candidates):   │    │
│  │ • dbt experience → Sarah/Chen have it, Mike doesn't    │    │
│  │   → Ask: "Describe how you've used dbt for testing"     │    │
│  │                                                          │    │
│  │ • Python depth → Mike is weaker                         │    │
│  │   → Ask: "Walk through a complex data transformation"   │    │
│  │                                                          │    │
│  │ GAPS TO PROBE (individual candidate gaps):               │    │
│  │ • Sarah: Sales data experience                          │    │
│  │   → Ask: "Have you worked with CRM/sales data?"         │    │
│  │                                                          │    │
│  │ • Chen: Experience depth (3yr vs 4yr)                   │    │
│  │   → Ask: "Describe the most complex pipeline you've     │    │
│  │     owned end-to-end"                                   │    │
│  │                                                          │    │
│  │ • Mike: Python depth                                    │    │
│  │   → Ask: "Show me how you'd handle error recovery"      │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  OUTPUT: Interview Question Pack                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │ BASELINE QUESTIONS (ask all candidates):                 │    │
│  │ 1. SQL: "Explain your approach to optimizing a query    │    │
│  │    that joins 3+ large tables" [Rubric: 1-5]            │    │
│  │                                                          │    │
│  │ 2. Pipeline: "Describe a data pipeline you built        │    │
│  │    end-to-end. What were the key decisions?" [1-5]      │    │
│  │                                                          │    │
│  │ DIFFERENTIATING QUESTIONS:                               │    │
│  │ 3. dbt: "How do you approach data quality testing       │    │
│  │    in your pipelines?" [0-5, 0=no experience]           │    │
│  │    → This will separate Sarah/Chen from Mike            │    │
│  │                                                          │    │
│  │ 4. Python depth: "Walk through how you'd build a        │    │
│  │    retry mechanism with exponential backoff" [1-5]      │    │
│  │    → This will reveal Mike's Python gap                 │    │
│  │                                                          │    │
│  │ CANDIDATE-SPECIFIC PROBES (interviewer notes):          │    │
│  │ For Sarah: "Your background is in e-commerce data.      │    │
│  │   How would you adapt to sales/CRM data?" [1-5]         │    │
│  │                                                          │    │
│  │ For Chen: "You have 3 years. Tell me about a time       │    │
│  │   you operated above your experience level" [1-5]       │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.3.3 Why This Is Better Than Competitors

| Traditional Approach | Our CV-Informed Approach |
|---------------------|--------------------------|
| Same questions for all roles | Questions tailored to THIS role's requirements |
| Generic competency questions | Questions that probe specific gaps in THIS candidate pool |
| No discrimination power | Questions designed to separate top candidates from each other |
| One-size-fits-all rubrics | Rubrics anchored to what "good" looks like for THIS role |
| Interviewer guesses what to ask | System tells interviewer exactly where to probe |

### 5.4 Question Quality Scoring

#### 5.4.1 The Question Quality Score

We can measure if our questions are actually good:

```
QUESTION QUALITY SCORE (0-100)

Components:
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  JOB RELEVANCE (40% weight)                                  │
│  Does this question assess skills in the SRO?               │
│  Score = overlap(skills_assessed, skills_required)          │
│                                                              │
│  DISCRIMINATION POWER (30% weight)                          │
│  Will this question produce varied scores across candidates?│
│  Score = expected_variance(scores) / max_variance           │
│                                                              │
│  BIAS RISK (20% weight, inverted)                           │
│  Could this question trigger affinity/confirmation bias?    │
│  Score = 1 - bias_risk_indicators                           │
│                                                              │
│  BEHAVIORAL ANCHORING (10% weight)                          │
│  Does the question have clear rubric anchors?               │
│  Score = 1.0 if rubric present, 0.5 otherwise               │
│                                                              │
│  COMPOSITE = weighted_average × 100                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 5.4.2 The Candidate Separation Metric

The killer metric for question effectiveness:

```
CANDIDATE SEPARATION POWER

For a question Q asked to candidates C1, C2, C3:

Good Question: Scores vary meaningfully
  C1: 5/5, C2: 3/5, C3: 2/5 → Variance = 2.33 ✓

Bad Question: Everyone scores the same
  C1: 4/5, C2: 4/5, C3: 4/5 → Variance = 0 ✗

Track over time:
• Which questions actually differentiate?
• Which questions correlate with hire decisions?
• Which questions predict performance? (if we get outcome data)
```

#### 5.4.3 Question Feedback Loop

Just as Step 2 learns which JDs work, Step 3 learns which questions work:

```
QUESTION FEEDBACK LOOP

Generate Questions → Conduct Interviews → Record Scores →

Track:
├── Which questions had high score variance? (discriminating)
├── Which questions correlated with hire decisions?
└── Which questions predicted hire OUTCOMES? (if available)

Update:
├── Upweight question templates that discriminate well
├── Downweight questions that don't add signal
└── Learn company-specific patterns:
    "At Acme Corp, 'dbt testing' question separates candidates well"
```

### 5.5 Competitive Differentiation Matrix

| Capability | HireVue | BrightHire | Metaview | Pillar | **Us** |
|------------|---------|------------|----------|--------|--------|
| Video interviews | ✅ | ✅ | — | ✅ | — |
| AI transcription | ✅ | ✅ | ✅ | ✅ | — |
| AI note-taking | ✅ | ✅ | ✅ | ✅ | — |
| Question generation | ⚠️ Generic | ❌ | ❌ | ⚠️ Template | ✅ JD-aligned |
| **JD → Question alignment** | ❌ | ❌ | ❌ | ⚠️ Manual | ✅ Automatic |
| **CV-informed questions** | ❌ | ❌ | ❌ | ❌ | ✅ Unique |
| **Ontology-based understanding** | ❌ | ❌ | ❌ | ❌ | ✅ Unique |
| **Question quality scoring** | ❌ | ❌ | ❌ | ❌ | ✅ Unique |
| **Candidate separation metrics** | ❌ | ❌ | ❌ | ❌ | ✅ Unique |
| Scoring rubrics | ✅ | ✅ | — | ✅ | ✅ |
| ATS integration | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Connected to JD Generator** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Connected to JD Optimizer** | ❌ | ❌ | ❌ | ❌ | ✅ |
| Price | $35K+ | $15-30K | $10-20K | Custom | $49-99/mo |

### 5.6 Product Value Proposition

**Positioning Statement**:
> "We're the only platform that generates interview questions from YOUR actual job description AND the CVs of YOUR actual candidates—so you ask questions that matter for THIS role and THIS candidate pool."

**The Problem We Solve**:
- Other tools help you *conduct* interviews
- We help you *ask the right questions*
- Questions designed specifically for your job requirements AND your actual candidates

**The Question Quality Score Marketing**:
> "Our questions score 85+ on Interview Quality. Generic template questions score 50. Which would you rather use?"

### 5.7 User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 INTERVIEW GENERATOR FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MODE SELECTION:                                                │
│  ○ JD-Only (Basic)  ● CV-Informed (Recommended)                │
│                                                                  │
│  Your JD: Senior Data Engineer - BI Focus                       │
│  Linked Applicants: 47 from Greenhouse                          │
│           [View JD] [View Top Matches]                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ GENERATED INTERVIEW STRUCTURE                            │    │
│  │ Question Quality Score: 87/100 ✓                        │    │
│  │                                                          │    │
│  │ ROUND 1: Technical Screen (45 min)                      │    │
│  │ Focus: SQL, Python fundamentals                         │    │
│  │                                                          │    │
│  │ Questions:                                               │    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │ 1. SQL Query Optimization                         │   │    │
│  │ │    "Describe how you'd optimize a slow query      │   │    │
│  │ │    joining three large tables..."                 │   │    │
│  │ │                                                   │   │    │
│  │ │    [Probes: Indexing, query plans, partitioning]  │   │    │
│  │ │    [Rubric: 1-5 scale with anchors]              │   │    │
│  │ │                                                   │   │    │
│  │ │    Quality: 92/100 | Separation: High            │   │    │
│  │ │    Why: Assesses essential SQL skill at level 4+ │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │ 2. dbt Testing (DIFFERENTIATING)                  │   │    │
│  │ │    "How do you approach data quality testing      │   │    │
│  │ │    in your pipelines?"                            │   │    │
│  │ │                                                   │   │    │
│  │ │    ⚡ CV INSIGHT: 2 of 3 top candidates have dbt  │   │    │
│  │ │    This question will separate them               │   │    │
│  │ │                                                   │   │    │
│  │ │    Quality: 88/100 | Separation: High            │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │ 3. Python Error Handling (GAP PROBE)              │   │    │
│  │ │    "Walk through building a retry mechanism       │   │    │
│  │ │    with exponential backoff..."                   │   │    │
│  │ │                                                   │   │    │
│  │ │    ⚡ CV INSIGHT: Mike (78% match) shows Python   │   │    │
│  │ │    as weaker skill - this probes that gap        │   │    │
│  │ │                                                   │   │    │
│  │ │    Quality: 85/100 | Separation: Medium          │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │ ROUND 2: System Design (60 min)                         │    │
│  │ [3 questions with quality scores...]                    │    │
│  │                                                          │    │
│  │ ROUND 3: Behavioral + Team Fit (45 min)                 │    │
│  │ [3 questions with quality scores...]                    │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CANDIDATE-SPECIFIC PROBES                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ For Sarah (94% match):                                   │    │
│  │ "Your background is e-commerce. How would you adapt      │    │
│  │  to sales/CRM data structures?"                          │    │
│  │                                                          │    │
│  │ For Chen (87% match):                                    │    │
│  │ "With 3 years experience, tell me about a time you      │    │
│  │  operated above your experience level"                   │    │
│  │                                                          │    │
│  │ For Mike (78% match):                                    │    │
│  │ "I see you're stronger in SQL than Python. Walk me      │    │
│  │  through a complex Python transformation you've built"   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [📋 Copy All] [📥 Download Pack] [📊 Create Scorecard]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.8 Interview Scorecard

```
┌─────────────────────────────────────────────────────────────────┐
│  INTERVIEW SCORECARD                                             │
│  Candidate: Sarah W.        Interviewer: ________________       │
│  Role: Senior Data Engineer - BI Focus                          │
│  Match Score from CV: 94%                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ESSENTIAL SKILLS (from JD)                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ SQL Proficiency                                          │    │
│  │ Required: 4/5  |  CV Estimate: 5/5                      │    │
│  │ Interview Score: ○ 1  ○ 2  ○ 3  ○ 4  ○ 5              │    │
│  │ Notes: _________________________________________        │    │
│  │                                                          │    │
│  │ Python for Data                                          │    │
│  │ Required: 4/5  |  CV Estimate: 4/5                      │    │
│  │ Interview Score: ○ 1  ○ 2  ○ 3  ○ 4  ○ 5              │    │
│  │ Notes: _________________________________________        │    │
│  │                                                          │    │
│  │ Data Warehouse Experience                                │    │
│  │ Required: 3/5  |  CV Estimate: 4/5                      │    │
│  │ Interview Score: ○ 1  ○ 2  ○ 3  ○ 4  ○ 5              │    │
│  │ Notes: _________________________________________        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  PREFERRED SKILLS                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ dbt Experience                                           │    │
│  │ CV Shows: Yes  |  Interview: ○ None ○ Basic ○ Int ○ Adv│    │
│  │                                                          │    │
│  │ Snowflake                                                │    │
│  │ CV Shows: Yes  |  Interview: ○ None ○ Basic ○ Int ○ Adv│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  GAP PROBE RESULTS (from CV analysis)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Sales/CRM Data Adaptation                                │    │
│  │ CV Gap: No sales data experience                        │    │
│  │ Interview Assessment: ○ Concern ○ Manageable ○ Non-issue│    │
│  │ Notes: _________________________________________        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CV vs INTERVIEW ALIGNMENT                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Did interview confirm CV assessment?                     │    │
│  │ ○ Yes, matched  ○ Better than CV  ○ Worse than CV      │    │
│  │                                                          │    │
│  │ Biggest surprise: ________________________________      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  OVERALL RECOMMENDATION                                          │
│  ○ Strong Hire  ○ Hire  ○ No Hire  ○ Strong No Hire           │
│                                                                  │
│  Summary: __________________________________________________   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.9 Technical Implementation

#### 5.9.1 Question Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│           INTERVIEW QUESTION GENERATION PIPELINE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: Load JD Structure (SRO)                                │
│  ├── Essential requirements + proficiency levels               │
│  ├── Preferred requirements                                    │
│  ├── Context (team, company, projects)                         │
│  └── O*NET occupation code + skill taxonomy                    │
│                              │                                   │
│                              ▼                                   │
│  STEP 2: Load Candidate Pool (Optional, from Step 2)           │
│  ├── Top-matched CVs (CPOs)                                    │
│  ├── Match scores and breakdowns                               │
│  └── Identified gaps per candidate                             │
│                              │                                   │
│                              ▼                                   │
│  STEP 3: Question Generation Agents                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Technical Question Agent:                                │    │
│  │ • Map each technical skill to question templates        │    │
│  │ • Adjust difficulty to proficiency level required       │    │
│  │ • Generate probing follow-ups                           │    │
│  │                                                          │    │
│  │ Behavioral Question Agent:                               │    │
│  │ • Map soft skills to STAR-format questions              │    │
│  │ • Contextualize to role and level                       │    │
│  │ • Include rubric anchors                                │    │
│  │                                                          │    │
│  │ Gap-Probing Agent (if CVs available):                   │    │
│  │ • Identify common gaps across candidates                │    │
│  │ • Generate questions that probe specific gaps           │    │
│  │ • Flag candidate-specific follow-ups                    │    │
│  │                                                          │    │
│  │ Differentiation Agent (if CVs available):               │    │
│  │ • Find skills where top candidates vary                 │    │
│  │ • Generate questions that separate candidates           │    │
│  │ • Calculate expected "separation power"                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  STEP 4: Question Quality Scoring                               │
│  ├── Job-relevance score (0-1)                                │
│  ├── Discrimination score (0-1)                               │
│  ├── Bias-risk score (0-1)                                    │
│  └── Total quality score = weighted average                    │
│                              │                                   │
│                              ▼                                   │
│  STEP 5: Interview Structure Assembly                           │
│  ├── Assign questions to rounds (Screen, Technical, Behav)    │
│  ├── Balance time allocation                                   │
│  ├── Generate printable scorecard                              │
│  └── Create interviewer guide with rubrics                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.9.2 Implementation Timeline

| Week | Deliverable | Effort |
|------|-------------|--------|
| **Week 19-20** | Basic Question Generation (JD-only mode) | |
| | Technical question templates by skill category | 3d |
| | Behavioral question templates by competency | 2d |
| | Rubric generation with anchors | 2d |
| | Basic scorecard generation | 2d |
| **Week 21-22** | CV-Informed Questions | |
| | Step 2 → Step 3 data flow (CVs to question generator) | 2d |
| | Gap-probing agent | 3d |
| | Differentiation agent | 3d |
| | Candidate-specific probe generation | 2d |
| **Week 23-24** | Quality Scoring & Learning | |
| | Question quality scoring model | 3d |
| | Candidate separation metrics | 2d |
| | Feedback collection UI | 2d |
| | Question effectiveness tracking | 3d |

**Week 24 Exit Criteria**:
- JD-only question generation working (basic mode)
- CV-informed question generation working (premium mode)
- Question quality scores displayed
- Printable scorecards with CV comparison
- Feedback loop collecting question effectiveness data

### 5.10 Pricing Integration

Interview Generator features are bundled into the unified pricing tiers:

| Tier | Price | Interview Features |
|------|-------|-------------------|
| **Starter** | $20/mo | 3 interview packs/month (JD-only mode) |
| **Pro** | $100/mo | Unlimited packs + CV-informed questions + quality scores |
| **Team** | $200/mo | Full suite + quality analytics + candidate separation metrics |

**Interview Pack = Full interview structure for one role**:
- Interview rounds structure (suggested timing)
- Questions with probes and rubrics
- Quality scores per question
- Printable scorecard
- CV-informed probes (Pro+)

**Upgrade trigger**: "You generated a JD. Want interview questions that actually test these requirements?"

### 5.11 The Bridge to Step 4 (Marketplace)

Interview Generator creates the perfect setup for candidate matching:

> "You've written the perfect JD. You've got perfect interview questions calibrated to your actual candidates. Now... wouldn't it be nice if we could show you MORE candidates who would score well on these interviews?"

**The data advantage for Step 4**:
- We know what questions separate candidates for this role
- We know what "good answers" look like (from rubrics)
- We can pre-score marketplace candidates against these questions
- "This candidate likely scores 4/5 on your dbt question"

**Upsell pitch**:
> "You've been interviewing candidates from your ATS. Your questions are calibrated. Want us to find candidates who match BEFORE you even post the job?"

### 5.12 Go-to-Market Strategy

#### 5.12.1 SEO Template Pages: Interview Questions

Massive untapped SEO opportunity. People actively search for interview questions by role.

```
SEARCH VOLUME OPPORTUNITY
─────────────────────────────────────────────────────────────────
• "software engineer interview questions"     - 12K/month
• "product manager interview questions"       - 8K/month
• "data analyst interview questions"          - 6K/month
• "behavioral interview questions"            - 22K/month
• "technical interview questions"             - 9K/month

Total addressable: 200K+ monthly searches for interview questions
─────────────────────────────────────────────────────────────────

PAGE TYPES:

1. ROLE-SPECIFIC QUESTION PAGES
   URL: /interview-questions/[job-title]
   
   Examples:
   • /interview-questions/software-engineer
   • /interview-questions/product-manager
   • /interview-questions/data-analyst
   
   Content per page:
   ┌─────────────────────────────────────────────────────────┐
   │ Software Engineer Interview Questions                   │
   │                                                         │
   │ 10 SAMPLE QUESTIONS (visible, high-quality)            │
   │                                                         │
   │ 1. Technical: "Design a rate limiter..."               │
   │ 2. Behavioral: "Tell me about a time you..."           │
   │ 3. System Design: "How would you build..."             │
   │ ... (7 more)                                            │
   │                                                         │
   │ WHAT MAKES THESE QUESTIONS EFFECTIVE:                   │
   │ • Structured scoring rubrics                            │
   │ • STAR format for behavioral                            │
   │ • Technical depth calibrated to level                   │
   │                                                         │
   │ ─────────────────────────────────────────────────────── │
   │                                                         │
   │ [Generate Questions From YOUR JD →]  ← CTA to product  │
   │                                                         │
   │ "These are generic. Upload your JD and we'll generate  │
   │  questions specific to YOUR role, YOUR requirements."   │
   └─────────────────────────────────────────────────────────┘
   
   Volume: 200+ pages

2. QUESTION TYPE PAGES
   URL: /interview-questions/behavioral
   URL: /interview-questions/technical/[skill]
   URL: /interview-questions/system-design
   
   Volume: 50+ pages

3. INTERVIEW GUIDE PAGES
   URL: /guides/how-to-interview-[job-title]
   URL: /guides/structured-interview-best-practices
   URL: /guides/behavioral-interview-star-method
   
   Volume: 30+ pages

TOTAL: 280+ pages targeting interview-related searches
```

#### 5.12.2 Outbound Strategy: Proactive Interview Questions

Provide immediate value to active job posters.

```
EMAIL TEMPLATE: Value-First Interview Questions
─────────────────────────────────────────────────────────────────
Subject: Interview questions for your [Job Title] role

Hi [Name],

I saw you're hiring a [Job Title] at [Company]. 

To help with interviews, I generated a structured question 
set based on your JD:

TECHNICAL (3 questions):
1. [Question targeting main skill from JD]
2. [Question targeting secondary skill]
3. [System design question relevant to role]

BEHAVIORAL (2 questions):
1. [STAR-format question on collaboration]
2. [Question on problem-solving]

Each has scoring rubrics so interviewers evaluate consistently.

Full interview pack (15 questions + scorecards): [Link]

Hope this helps you find the right person!

Best,
[Name]
─────────────────────────────────────────────────────────────────

WHY THIS WORKS:
• Immediately useful (not a pitch)
• Shows product capability without asking for anything
• Natural CTA to get the full pack
• Positions us as helpful, not salesy

FOLLOW-UP (Day 4):
─────────────────────────────────────────────────────────────────
Subject: Quick tip for your [Job Title] interviews

Hi [Name],

One thing I noticed about your [Job Title] posting—it lists
[Skill X] as important, but I didn't include questions for
it in the sample pack I sent.

Here's a targeted question for [Skill X]:
"[Question]"

With rubric:
• 5/5: [What great looks like]
• 3/5: [What acceptable looks like]
• 1/5: [What poor looks like]

Full pack with all 15 questions here: [Link]

Let me know if you'd like questions for other skills.
─────────────────────────────────────────────────────────────────
```

**Expected performance**:
| Metric | Estimate | Why |
|--------|----------|-----|
| Open rate | 55-65% | Specific subject line, clear value |
| Response rate | 15-25% | Actually useful content |
| Signup rate | 25-35% of responses | Natural product demonstration |
| Net conversion | 4-8% | Higher than JD outbound |

#### 5.12.3 Cross-Sell from Steps 1 & 2

In-product prompts for existing users:

```
TRIGGER: User exports a JD (Step 1)
─────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│  📋 Interview Questions for This Role                           │
│                                                                 │
│  You just created a JD for Senior Data Engineer.               │
│  Want interview questions that test these exact requirements?  │
│                                                                 │
│  We'll generate:                                               │
│  • Technical questions matching your skill requirements        │
│  • Behavioral questions for team fit                           │
│  • Scoring rubrics for consistent evaluation                   │
│                                                                 │
│  [Generate Interview Questions →]  [Maybe Later]               │
└─────────────────────────────────────────────────────────────────┘

TRIGGER: User views applicant matches (Step 2)
─────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Interview These Candidates?                                 │
│                                                                 │
│  You have 3 candidates with 85%+ match scores.                 │
│  Ready to interview them?                                       │
│                                                                 │
│  We'll generate CV-informed questions that:                    │
│  • Confirm their stated skills                                 │
│  • Probe specific gaps we identified                           │
│  • Separate the top candidates from each other                 │
│                                                                 │
│  [Generate Interview Pack →]  [View Candidates First]          │
└─────────────────────────────────────────────────────────────────┘
─────────────────────────────────────────────────────────────────
```

**Expected cross-sell rate**: 30-40% of Step 1/2 users try interview generation

#### 5.12.4 Content Marketing: "Interview Better" Series

**Weekly content**:
- "Question of the Week" - Breakdown of one great interview question
- "Interview Teardown" - Analyze good vs bad questions
- "Bias Watch" - Common interview biases and how to avoid them

**Lead magnets**:
- "50 Best Interview Questions by Role" (PDF, gated)
- "Interview Scorecard Template" (Google Sheet, email capture)
- "Structured Interview Checklist" (1-pager, social sharing)

**Thought leadership angle**:
> "Generic interview questions give you generic answers. Questions calibrated to YOUR JD and YOUR candidates give you hiring decisions."

#### 5.12.5 Competitive Positioning in GTM

When prospects ask "why not HireVue/BrightHire/Metaview?":

```
OBJECTION HANDLING SCRIPT
─────────────────────────────────────────────────────────────────

"Why not HireVue?" ($35K+/year)
→ "HireVue helps you CONDUCT interviews. We help you ask the 
   RIGHT QUESTIONS. They give you templates. We give you questions
   calibrated to your actual JD and actual candidate pool."

"Why not BrightHire/Metaview?" ($15-30K/year)
→ "They record and transcribe interviews. That's useful for 
   note-taking. But they don't help you DESIGN the interview.
   We generate questions that actually differentiate candidates
   for YOUR specific role."

"I just use ChatGPT for interview questions"
→ "ChatGPT gives generic questions. Our questions are:
   1. Tied to YOUR JD requirements (not templates)
   2. Informed by YOUR actual candidates (if you use ATS)
   3. Quality-scored so you know which questions work
   4. Include rubrics so interviewers are consistent
   
   Plus, you get the full hiring workflow: JD → Candidates → 
   Interview → Hire."

VALUE STATEMENT:
"For $100/month, you get what enterprise platforms charge 
$35K for—except ours is actually smarter because it connects 
your JD, your candidates, and your interview questions."
─────────────────────────────────────────────────────────────────
```

---

## Part 6: Step 4 — Candidate Marketplace (Months 9+)

### 6.1 The Natural Evolution

By the time we introduce matching, we have:
- Employers who trust our understanding of roles (they use our JDs)
- Employers who trust our evaluation framework (they use our interviews)
- Structured requirements ready for matching (SROs)
- Outcome data on what works (from Step 2)

**The pitch writes itself**: "You've been using our AI to write JDs and interviews. Want to see candidates who match?"

### 6.2 Candidate Vetting System

Now we build the supply side. Same ontology, same agent architecture, different direction:

```
VETTING AGENTS (Supply Side)
────────────────────────────────────
Same specialists that GENERATE requirements
now EVALUATE candidates against requirements

Candidate provides:
• Resume / LinkedIn
• Guided intake questions

Vetting Agent produces:
• Structured Candidate Profile (same ontology)
• Skill assessments with calibration
• Experience mapping
• Match-readiness score
```

### 6.3 Matching Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      MATCHING FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EMPLOYER VIEW (from their JD)                                  │
│                                                                  │
│  Your JD: Senior Data Engineer - BI Focus                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🎯 TOP MATCHES                                           │    │
│  │                                                          │    │
│  │ ┌─────────────────────────────────────────────────┐     │    │
│  │ │ SARAH K.                              94% Match │     │    │
│  │ │ Senior Data Engineer | $130/hr | Available Now │     │    │
│  │ │                                                  │     │    │
│  │ │ ✅ SQL: 5/5 (exceeds 4/5 required)              │     │    │
│  │ │ ✅ Python: 5/5 (exceeds 4/5 required)           │     │    │
│  │ │ ✅ Snowflake: 4/5 (matches your stack)          │     │    │
│  │ │ ✅ dbt: Advanced (preferred skill)              │     │    │
│  │ │ ✅ 6 years experience (exceeds 4 required)      │     │    │
│  │ │ ⭐ Bonus: Previous fintech experience           │     │    │
│  │ │                                                  │     │    │
│  │ │ [View Full Profile] [Start Trial] [Message]    │     │    │
│  │ └─────────────────────────────────────────────────┘     │    │
│  │                                                          │    │
│  │ ┌─────────────────────────────────────────────────┐     │    │
│  │ │ MARCUS T.                             87% Match │     │    │
│  │ │ ...                                              │     │    │
│  │ └─────────────────────────────────────────────────┘     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Engagement Model

**Trial Engagements** (de-risk the hire):
- 5-10 hour scoped task
- $500-1,500 paid upfront (escrow)
- Both parties rate each other
- 60%+ convert to full engagement

**Full Engagements**:
- Hourly (time-tracked, billed weekly)
- Project-based (milestones, escrow)
- Platform handles contracts, payments, compliance

### 6.5 Revenue Model Evolution

| Revenue Stream | Step 1-3 | Step 4 |
|----------------|----------|--------|
| Subscriptions | $19-99/mo | $49-149/mo |
| Success fees | — | 15-20% of engagement |
| Trial fees | — | 20% of trial value |

**Subscription tiers expand**:

| Tier | Price | JD Tools | Matching |
|------|-------|----------|----------|
| **Starter** | $29/mo | 25 JDs, scoring | 3 candidate unlocks |
| **Pro** | $49/mo | Unlimited, interviews | 15 unlocks, pipeline |
| **Business** | $149/mo | Team features | 50 unlocks, trials, reduced fees |
| **Enterprise** | Custom | Custom | Unlimited, ATS integration |

---

## Part 7: Business Model

### 7.1 Revenue Projections by Step

```
STEP 1: JD GENERATOR (Months 1-6)
──────────────────────────────────
Target: $30K MRR by Month 6

Free: 2,000 users (lead gen)
Starter ($19): 1,000 users → $19,000
Pro ($49): 200 users → $9,800
Team ($99): 20 users → $1,980
Total: $30,780 MRR


STEP 2: JD OPTIMIZER (Months 3-9)
──────────────────────────────────
Target: $50K MRR by Month 9

(Users upgrade + new users)
Starter ($29): 1,000 users → $29,000
Pro ($49): 350 users → $17,150
Team ($99): 50 users → $4,950
Total: $51,100 MRR


STEP 3: INTERVIEW GENERATOR (Months 6-12)
──────────────────────────────────────────
Target: $75K MRR by Month 12

Starter ($29): 1,200 users → $34,800
Pro ($49): 500 users → $24,500
Team ($99): 100 users → $9,900
Business ($149): 30 users → $4,470
Total: $73,670 MRR


STEP 4: MARKETPLACE (Months 9-18)
──────────────────────────────────
Target: $150K MRR by Month 18

Subscriptions: ~$80K
├── Pro ($49): 600 users → $29,400
├── Business ($149): 200 users → $29,800
├── Enterprise: 20 users → $20,000

Success Fees: ~$70K
├── 30 engagements/month × $40K avg × 16% = $64,000
├── Trials: ~$6,000

Total: $150,000 MRR
```

### 7.2 Unit Economics

**JD Generator (Step 1)**:

```
CAC (Customer Acquisition Cost):
├── Paid ads (Google, LinkedIn): ~$50/trial
├── Content/SEO: ~$20/trial
├── Trial → Paid conversion: 25%
└── Blended CAC: ~$150/paid customer

LTV (Lifetime Value):
├── Average revenue per user: $35/mo (blended)
├── Average lifetime: 12 months
├── Gross margin: 85%
└── LTV: $35 × 12 × 0.85 = $357

LTV:CAC Ratio: 2.4:1 ✓ (healthy for SaaS)
```

**Marketplace (Step 4)**:

```
Employer CAC:
├── Many convert from JD tool users: ~$0 marginal
├── New acquisition: ~$350/employer
└── Blended: ~$150/employer (50% from JD tool)

Employer LTV:
├── Subscription: $100/mo × 18 months = $1,800
├── Success fees: 2 hires/year × $6,400 = $12,800
└── LTV: $14,600

LTV:CAC Ratio: 97:1 ✓ (excellent - wedge strategy working)
```

### 7.3 The Flywheel Effect

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLYWHEEL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    MORE JDS CREATED                                              │
│          │                                                       │
│          ▼                                                       │
│    MORE OUTCOME DATA                                             │
│    (which JDs → hires)                                          │
│          │                                                       │
│          ▼                                                       │
│    BETTER SUGGESTIONS ───────────────┐                          │
│    (ontology improves)               │                          │
│          │                           │                          │
│          ▼                           ▼                          │
│    BETTER JDS ◄──────────────── BETTER MATCHING                 │
│          │                           │                          │
│          │                           │                          │
│          └───────────────────────────┘                          │
│                      │                                           │
│                      ▼                                           │
│              MORE SUCCESSFUL HIRES                               │
│                      │                                           │
│                      ▼                                           │
│              MORE USERS (word of mouth)                         │
│                      │                                           │
│                      ▼                                           │
│              MORE JDS CREATED...                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 8: Go-to-Market Strategy Summary

### 8.1 Unified Pricing Structure

| Tier | Price | Distribution | Features |
|------|-------|--------------|----------|
| **Free** | $0 | Trial | 2 JDs, basic features |
| **Starter** | $20/mo | 80% of paid | 5 JDs/month, 3 interview packs, manual CV upload |
| **Pro** | $100/mo | 15% of paid | 25 JDs, 3 teammates, 1 workspace, ATS integration, CV-informed features |
| **Team** | $200/mo | 5% of paid | Unlimited JDs, 10 teammates, multi-workspace, analytics, priority support |

**Unit Economics**:
```
Blended ARPU: (80% × $20) + (15% × $100) + (5% × $200) = $41/month

TARGET: $1M ARR
─────────────────────────────────────────────────────────────────
$1,000,000 ÷ 12 = $83,333 MRR needed
$83,333 ÷ $41 ARPU = 2,032 paying customers

Breakdown by tier:
• Starter (80%): 1,626 customers × $20 = $32,520/mo
• Pro (15%): 305 customers × $100 = $30,500/mo
• Team (5%): 102 customers × $200 = $20,400/mo
─────────────────────────────────────────────────────────────────

CAC Target: $100-150 (blended across channels)
LTV (18 months): $738
LTV:CAC Ratio: 4.9x ✓ (healthy: >3x is good)
Payback Period: $150 ÷ $41 = 3.7 months ✓
```

### 8.2 Multi-Channel GTM Architecture

```
GTM FUNNEL: THREE ENTRY POINTS
─────────────────────────────────────────────────────────────────

                    ┌─────────────────────┐
  SEO Templates ───▶│   JD Generator      │◀─── Outbound: "Rewrite your JD"
  700+ pages        │     (Step 1)        │     Value-first email
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
  SEO Optimizer ───▶│   JD Optimizer      │◀─── Outbound: "JD scored 62/100"
  200+ pages        │     (Step 2)        │     Problem-first email
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
  SEO Questions ───▶│ Interview Generator │◀─── Outbound: "Questions for your role"
  280+ pages        │     (Step 3)        │     Value-first email
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     Marketplace     │◀─── Upsell from Steps 1-3
                    │      (Step 4)       │     "Find matching candidates"
                    └─────────────────────┘

SURFACE AREA: 3x a single-product company
Users can discover through ANY of three products
```

### 8.3 SEO Strategy: Programmatic at Scale

```
TOTAL SEO CONTENT PLAN: 1,200+ pages
─────────────────────────────────────────────────────────────────

STEP 1 - JD TEMPLATES (700-800 pages)
├── /templates/[job-title]-job-description (200+ pages)
├── /templates/[industry]/[job-title] (500+ pages)
├── /tools/ai-job-description-generator (20-50 pages)
└── /compare/talentarchitect-vs-[competitor] (10-20 pages)

STEP 2 - JD OPTIMIZER (200+ pages)
├── /optimize/[job-title]-job-description (200+ pages)
│   └── Interactive: Paste JD → Get score → CTA to unlock fixes

STEP 3 - INTERVIEW QUESTIONS (280+ pages)
├── /interview-questions/[job-title] (200+ pages)
├── /interview-questions/[question-type] (50+ pages)
└── /guides/how-to-interview-[job-title] (30+ pages)

ESTIMATED TRAFFIC (Month 12):
• Step 1 pages: 15,000 visitors/month
• Step 2 pages: 5,000 visitors/month
• Step 3 pages: 10,000 visitors/month
─────────────────────────────────────────────────────────────────
TOTAL: ~30,000 organic visitors/month
At 1.5% conversion: 450 new customers/month from SEO
```

### 8.4 Outbound Strategy: Value-First

All outbound delivers value BEFORE asking for anything.

| Step | Outbound Hook | Why It Converts |
|------|---------------|-----------------|
| **Step 1** | "I rewrote your JD" | Demonstrates product value |
| **Step 2** | "Your JD scored 62/100" | Quantifies their problem |
| **Step 3** | "Interview questions for your role" | Immediately useful |

**Outbound Economics**:
```
Target: Active job posters (last 7 days)
Identification: Scrape LinkedIn/Indeed → Find company → Find poster

1 SDR capacity:
• 100 personalized emails/day
• 15% response rate → 15 responses/day
• 20% signup rate → 3 signups/day
• Monthly: 65-70 signups per SDR
• Cost: $5K/mo SDR ÷ 65 = $77 CAC ✓
```

**Traditional vs Value-First Outreach**:
| Metric | Traditional | Value-First |
|--------|-------------|-------------|
| Open rate | 20-30% | 40-60% |
| Response rate | 1-3% | 10-20% |
| Signup rate | 10% | 20-30% |
| Net conversion | 0.1-0.3% | 2-8% |

### 8.5 Paid Acquisition: Bridge While SEO Ramps

```
GOOGLE ADS (Months 1-6)
─────────────────────────────────────────────────────────────────
Keywords:
• "job description generator" - $3-5 CPC
• "ai job description writer" - $2-4 CPC
• "interview question generator" - $2-4 CPC

Budget: $5K/month
Expected CPC: $3.50
Clicks: 1,429/month
Conversion rate: 3%
Signups: 43/month
CAC: $116 ✓

Scale if CAC stays under $150.
Reduce as SEO traffic grows.
─────────────────────────────────────────────────────────────────
```

### 8.6 Channel Mix by Phase

| Phase | Months | Primary Channels | Budget Split |
|-------|--------|------------------|--------------|
| **Launch** | 1-3 | Outbound + Paid + ProductHunt | 70% outbound, 20% paid, 10% SEO setup |
| **Growth** | 4-6 | Outbound + Paid + SEO ramping | 50% outbound, 30% paid, 20% SEO |
| **Scale** | 7-12 | SEO dominant + Outbound | 30% outbound, 20% paid, 50% SEO |
| **Mature** | 12+ | SEO + Viral + Partnerships | 20% outbound, 10% paid, 70% SEO/viral |

### 8.7 Viral & Referral Mechanisms

```
VIRAL LOOPS
─────────────────────────────────────────────────────────────────
1. "Powered by TalentArchitect" on exported JDs
   → Every JD shared becomes an ad

2. Shareable JD Scores
   → "My JD scored 87/100" → Social proof + curiosity

3. Team Invites
   → Pro users invite teammates → Each invite is a warm lead

4. Referral Program
   → "Give $5, Get $5" for Starter users
   → "Give $20, Get $20" for Pro users

TARGET: 10% of customers acquired virally
= 200+ free acquisitions/year
─────────────────────────────────────────────────────────────────
```

### 8.8 Partnership Strategy

**ATS Marketplaces** (Apply Month 6):
- Greenhouse Partner Program
- Lever Integration Partner
- Ashby App Directory

**Benefits**:
- Credibility ("Greenhouse Partner")
- Distribution (their customers find us)
- Integration trust (pre-vetted)
- Expected: 50-100 customers/month from marketplace

### 8.9 Year 1 Financial Projections

```
CONSERVATIVE MODEL (5% monthly churn)
─────────────────────────────────────────────────────────────────
Month │ New Customers │ Churn │ Net Customers │ MRR
──────┼───────────────┼───────┼───────────────┼──────────
  1   │      50       │   0   │      50       │  $2,050
  2   │      75       │   3   │     122       │  $5,002
  3   │     100       │   6   │     216       │  $8,856
  4   │     125       │  11   │     330       │ $13,530
  5   │     150       │  17   │     463       │ $18,983
  6   │     175       │  23   │     615       │ $25,215
  7   │     200       │  31   │     784       │ $32,144
  8   │     225       │  39   │     970       │ $39,770
  9   │     250       │  49   │   1,171       │ $48,011
 10   │     275       │  59   │   1,387       │ $56,867
 11   │     300       │  69   │   1,618       │ $66,338
 12   │     325       │  81   │   1,862       │ $76,342
──────┴───────────────┴───────┴───────────────┴──────────
                                YEAR 1 EXIT: ~$916K ARR
─────────────────────────────────────────────────────────────────

SENSITIVITY ANALYSIS
─────────────────────────────────────────────────────────────────
Scenario     │ Conversion │ Churn │ Y1 ARR
─────────────┼────────────┼───────┼─────────
Conservative │    1.0%    │  6%   │  $750K
Base         │    1.5%    │  5%   │  $916K
Optimistic   │    2.0%    │  4%   │  $1.2M
─────────────┴────────────┴───────┴─────────

$1M ARR is achievable with base-case execution.
─────────────────────────────────────────────────────────────────
```

### 8.10 GTM Investment Required

| Category | Monthly | Year 1 Total |
|----------|---------|--------------|
| SDR/Outbound (1-2 people) | $8K | $96K |
| SEO Content Creation | $5K | $60K |
| Paid Acquisition | $5K | $60K |
| Tools (email, scraping, etc.) | $1K | $12K |
| **Total GTM Investment** | **$19K** | **$228K** |

**ROI**: $228K investment → $916K ARR = **4x return in Year 1**

### 8.11 Key Success Metrics

**North Star Metrics**:
| Metric | Target | Why |
|--------|--------|-----|
| MRR | $83K by Month 12 | Revenue health |
| Active JDs/month | 5K+ | Product usage |
| Conversion rate | 1.5%+ | Funnel efficiency |

**Channel Metrics**:
| Channel | Metric | Target |
|---------|--------|--------|
| SEO | Organic traffic | 30K/month by M12 |
| Outbound | Response rate | 15%+ |
| Paid | CAC | <$120 |

**Retention Metrics**:
| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Monthly churn | <5% | Improve onboarding, add features |
| Net Revenue Retention | >100% | Better upgrade paths |
| NPS | >40 | Product improvements |

---

## Part 9: Technical Implementation Timeline

### 9.1 Phase Overview

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION PHASES                                  │
├────────────┬────────────┬────────────┬────────────┬────────────┬─────────────┤
│   STEP 1   │   GTM 1    │   STEP 2   │   STEP 3   │  STEP 4a   │   STEP 4b   │
│JD Generator│  + Iterate │ JD Optimize│ Interviews │Supply Build│ Marketplace │
│  Wk 1-6    │   Wk 7-12  │  Wk 13-18  │  Wk 19-26  │  Wk 20-30  │   Wk 27-40  │
└────────────┴────────────┴────────────┴────────────┴────────────┴─────────────┘

PARALLEL WORKSTREAM: JD CORPUS CRAWLER
┌───────────────────────────────────────────────────────────────────────────────┐
│  Wk 3-6: MVP crawler │ Wk 7-18: Scale + Structure │ Wk 19+: Continuous      │
│  (10K JDs seed)      │ (500K+ JDs, full RAG)      │ (2M+ JDs, proactive)    │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Parallel: JD Corpus Crawler (Continuous)

The JD Corpus runs as a parallel workstream, providing training data and RAG capabilities to all products.

#### Phase 1: Seed Corpus (Weeks 3-6)

| Task | Description | Effort |
|------|-------------|--------|
| HN Crawler | Parse "Who's Hiring" threads (structured, easy) | 1 day |
| Indeed RSS | Ingest from public RSS feeds | 1 day |
| Basic Structuring | Apply Recruiting Agent to crawled JDs | 2 days |
| Vector Store | Embed and store for RAG retrieval | 1 day |
| Deduplication | Detect and merge duplicate postings | 1 day |

**Week 6 Target**: 10K structured JDs, basic RAG working

#### Phase 2: Scale Corpus (Weeks 7-18)

| Task | Description | Effort |
|------|-------------|--------|
| LinkedIn Crawler | Careful scraping with rate limits | 3 days |
| Glassdoor Crawler | Company pages + job posts | 2 days |
| Career Page Scraper | Template-based for target companies | 3 days |
| AngelList Integration | API integration for startup jobs | 2 days |
| Scheduling Pipeline | Airflow/cron for continuous ingestion | 2 days |
| Quality Scoring | Rate JD quality for RAG ranking | 2 days |
| Analytics Pipeline | Skill frequency, salary analysis | 3 days |

**Week 18 Target**: 500K+ structured JDs, full analytics

#### Phase 3: Production Corpus (Weeks 19+)

| Task | Description | Effort |
|------|-------------|--------|
| Scale to 2M+ | Expand sources, increase throughput | Ongoing |
| Real-time Updates | Near real-time ingestion for hot sources | 2 days |
| Proactive Matching Prep | Flag "matchable" JDs for Step 4 | 2 days |
| Trend Detection | Identify emerging skills/roles | 2 days |
| Employer Enrichment | Company data, hiring patterns | 3 days |

**Ongoing Target**: 100K new JDs/month, <24hr latency

#### Corpus Data Model

```yaml
crawled_jd:
  id: "cjd_abc123"
  source: "linkedin"
  source_url: "https://..."
  crawled_at: "2026-03-15T10:30:00Z"
  
  raw:
    title: "Senior Data Engineer"
    company: "Acme Corp"
    location: "Remote"
    description: "..."  # Original text
  
  structured:  # Output of Recruiting Agent
    sro_id: "sro_xyz789"  # Link to Structured Requirement Object
    occupation_code: "15-1252.00"
    neighborhood: "data_analytics"
    skills_extracted:
      - skill: "sql"
        proficiency_inferred: 4
        context: "complex queries"
      - skill: "python"
        proficiency_inferred: 4
    experience_years: 4
    salary_range: [150000, 180000]
    remote: true
  
  quality:
    completeness_score: 0.87
    clarity_score: 0.82
    rag_eligible: true  # Good enough for RAG examples
  
  analytics:
    similar_jds_count: 234
    skill_commonality: 0.91  # How typical are these requirements
    salary_percentile: 65  # vs similar roles
```

#### How Corpus Powers Each Product

| Product | Corpus Usage |
|---------|--------------|
| **JD Generator** | RAG examples ("Similar JDs include..."), skill suggestions, validation |
| **JD Optimizer** | Benchmarking ("vs. 50K similar JDs"), completeness gaps, salary analysis |
| **Interview Gen** | Question patterns from high-quality JDs, skill assessment anchors |
| **Marketplace** | Proactive matching (crawled JD → candidate match → outreach) |

### 9.3 Step 1: JD Generator (Weeks 1-6)

#### Week 1-2: Foundation

| Task | Description | Effort |
|------|-------------|--------|
| Ontology Schema | YAML schema for occupations, skills | 2 days |
| O*NET Import | Parse and import occupation data | 2 days |
| Skill Graph | Relationships between skills | 2 days |
| SRO Model | Structured Requirement Object | 1 day |
| Database + API | Postgres, FastAPI scaffold | 2 days |

#### Week 3-4: Agent System

| Task | Description | Effort |
|------|-------------|--------|
| CPO Agent | Main orchestrator | 3 days |
| Specialist Agents | Software, Data, Design (3 to start) | 3 days |
| Clarification Engine | Generate follow-up questions | 2 days |
| JD Generator | Combine outputs into JD | 2 days |
| Prompt Engineering | Quality tuning | 2 days |

#### Week 5-6: Product

| Task | Description | Effort |
|------|-------------|--------|
| Landing Page | Marketing + sign-up | 2 days |
| JD Creation Flow | Multi-step wizard | 3 days |
| JD Editor | Inline editing | 2 days |
| Template Library | Save, browse, clone | 2 days |
| Export | Copy, .docx, .pdf | 1 day |
| Billing | Stripe subscriptions | 2 days |
| Auth | Sign-up, login | 1 day |

**Week 6 Exit**: Launchable product ✓

### 9.4 Step 1 GTM + Iteration (Weeks 7-12)

| Task | Description | Effort |
|------|-------------|--------|
| Product Hunt Launch | Prepare and execute | 3 days |
| Content Pipeline | SEO templates, LinkedIn | Ongoing |
| Paid Ads | Google, LinkedIn setup | 2 days |
| User Feedback | Interviews, iterate | Ongoing |
| JD Scoring | Completeness, clarity | 3 days |
| Bug Fixes / Polish | Based on feedback | Ongoing |
| Analytics | PostHog setup, funnels | 2 days |

**Week 12 Target**: 500 paying users, $15K MRR

### 9.5 Step 2: JD Optimizer (Weeks 13-18)

| Task | Description | Effort |
|------|-------------|--------|
| Outcome Tracking | "Did this JD → hire?" | 3 days |
| Performance Dashboard | Analytics per JD/template | 4 days |
| Internal RAG | Learn from user's history | 5 days |
| Recommendations | "What worked" suggestions | 3 days |
| Team Features | Multi-user, sharing | 4 days |
| Pricing Update | New tiers, upgrade flows | 2 days |

**Week 18 Target**: 1,000 paying users, $35K MRR

### 9.6 Step 3: Interview Generator (Weeks 19-26)

| Task | Description | Effort |
|------|-------------|--------|
| Question Generator | JD → interview questions | 4 days |
| Specialist Probes | Domain-specific deep dives | 3 days |
| Scoring Rubrics | 1-5 scales with anchors | 3 days |
| Scorecard Builder | Generate per role | 3 days |
| Interview Packs | Bundle questions + rubrics | 2 days |
| Scorecard UI | Fill out during/after interview | 4 days |
| Export/Print | PDF scorecards | 2 days |

**Week 26 Target**: 1,500 paying users, $60K MRR

### 9.7 Step 4a: Supply Side Build (Weeks 20-30)

*Runs in parallel with Step 3*

| Task | Description | Effort |
|------|-------------|--------|
| Candidate Intake | Resume upload + questionnaire | 4 days |
| Vetting Agents | Same specialists, evaluation mode | 5 days |
| Candidate Profiles | Structured CPO model | 3 days |
| Matching Engine | SRO ↔ CPO matching | 5 days |
| Match Explainer | "Why this candidate matched" | 3 days |
| Candidate Outreach | LinkedIn, referral program | Ongoing |
| Community Building | Slack, content | Ongoing |

**Week 30 Target**: 500 vetted candidates in database

### 9.8 Step 4b: Marketplace (Weeks 27-40)

| Task | Description | Effort |
|------|-------------|--------|
| Candidate Discovery UI | Browse, filter, unlock | 4 days |
| Pipeline + Kanban | Track candidates per role | 4 days |
| Team Collaboration | Comments, ratings, @mentions | 3 days |
| Messaging | Employer ↔ candidate chat | 3 days |
| Trial Engagements | Scoped tasks, escrow | 5 days |
| Payments (Stripe Connect) | Multi-party payments | 4 days |
| Contracts | Template generation, e-sign | 3 days |
| Time Tracking | Hours logging, approval | 3 days |
| Subscription Tiers | Business, Enterprise | 2 days |
| Approval Workflows | Budget approvals | 3 days |

**Week 40 Target**: Marketplace live, path to $150K MRR

### 9.9 Milestone Summary

| Milestone | Week | Deliverable | Target |
|-----------|------|-------------|--------|
| M1: JD Generator Launch | 6 | MVP live + seed corpus | Launchable, 10K JDs |
| M2: Initial Traction | 12 | GTM running | $15K MRR, 500 users |
| M3: JD Optimizer | 18 | Outcome tracking + full corpus | $35K MRR, 500K JDs |
| M4: Interview Generator | 26 | Full interview pack | $60K MRR, 1.5K users |
| M5: Supply Ready | 30 | Candidate database | 500 vetted candidates |
| M6: Marketplace Beta | 34 | Matching + trials | First matches, 1M JDs |
| M7: Marketplace Live | 40 | Full platform | $100K MRR |
| M8: Scale | 52 | Growth + proactive matching | $150K+ MRR, 2M+ JDs |

**Corpus Milestones** (parallel track):
| Target | Week | JDs Structured | RAG Quality |
|--------|------|----------------|-------------|
| Seed | 6 | 10K | Basic |
| Scale | 18 | 500K | Full analytics |
| Production | 30 | 1M | Proactive ready |
| Mature | 52 | 2M+ | Market intelligence |

### 9.10 Technical Stack

```
BACKEND
├── Language: Python 3.11+
├── Framework: FastAPI
├── Database: PostgreSQL + pgvector
├── Queue: Redis + Celery
├── Search: Elasticsearch (later phases)
└── AI: Claude API (agents)

FRONTEND
├── Framework: Next.js 14
├── Styling: Tailwind CSS
├── Components: shadcn/ui
└── State: Zustand

INFRASTRUCTURE
├── Hosting: Vercel + Railway
├── Database: Supabase
├── Email: SendGrid
├── Payments: Stripe
├── Analytics: PostHog
└── Monitoring: Sentry

AI/ML
├── LLM: Claude API
├── Embeddings: OpenAI text-embedding-3-small
├── Vector Store: pgvector
└── Prompts: Version controlled in repo
```

### 9.11 Resource Requirements

| Phase | Weeks | Focus | Monthly Cost |
|-------|-------|-------|--------------|
| Step 1 | 1-6 | JD Generator | $15-20K |
| GTM 1 | 7-12 | Launch + iterate | $15-20K |
| Step 2 | 13-18 | Optimizer | $15-20K |
| Step 3 | 19-26 | Interviews | $20-25K |
| Step 4 | 27-40 | Marketplace | $25-35K |

**Bootstrap Path**: Solo technical founder can reach M2 ($15K MRR) in 3 months. Revenue covers costs from Month 4+.

---

## Part 10: Competitive Positioning

### 10.1 JD Generator Competitors

| Competitor | Weakness | Our Advantage |
|------------|----------|---------------|
| **ChatGPT/Claude direct** | Generic, no structure | Ontology-backed, role-specific |
| **Textio** | Expensive ($thousands/yr) | $19/mo, accessible |
| **JDXpert** | Enterprise-focused | Self-serve, modern UX |
| **Ongig** | Bias focus only | Full generation + optimization |

**Our moat**: The ontology. Generic LLMs don't understand that a "Data Engineer" at a startup vs. enterprise needs different skills. We do.

### 10.2 Interview Tool Competitors

| Competitor | Weakness | Our Advantage |
|------------|----------|---------------|
| **Karat** | Outsourced interviews | Self-serve tools |
| **HireVue** | Video analysis (creepy) | Question generation |
| **Greenhouse/Lever** | Basic question banks | Generated from YOUR JD |

**Our moat**: JD → Interview alignment. Generic question banks don't map to specific requirements.

### 10.3 Marketplace Competitors (Step 4)

| Competitor | Positioning | Our Advantage |
|------------|-------------|---------------|
| **Upwork** | Volume, any skill | Ontology matching, quality |
| **Toptal** | "Top 3%", expensive | Lower fees, transparent matching |
| **Mercor** | AI labs, RLHF focus | General consulting |
| **A.Team** | Curated teams | Individual matching |

**Our moat**: Employers already trust us (JD + interviews). Matching is natural next step, not cold start.

---

## Part 11: Risk Factors & Mitigations

| Risk | Mitigation |
|------|------------|
| JD Generator doesn't get traction | Pivot to interview-first or abandon by Week 12 (low sunk cost) |
| ChatGPT "good enough" | Differentiate on structure, outcomes, not just generation |
| Can't build supply (candidates) | Start supply building early (Week 20), multiple channels |
| Marketplace chicken-and-egg | Proactive matching + existing employer base |
| Mercor/Upwork copies features | Ontology depth is hard to replicate, data flywheel |
| Enterprise requires compliance | Build SOC2, SSO as needed for Enterprise tier |

---

## Appendix A: Ontology Sample

```yaml
# Sample occupation entry
occupation:
  id: "15-1252.00"
  title: "Software Developers"
  category: "Computer and Mathematical Occupations"
  neighborhood: "software_engineering"
  
  core_skills:
    - skill_id: "programming"
      typical_proficiency: 4
      importance: "essential"
    - skill_id: "systems_analysis"
      typical_proficiency: 3
      importance: "essential"
  
  common_tools:
    - "python"
    - "javascript"
    - "sql"
    - "git"
  
  experience_levels:
    junior: "0-2 years"
    mid: "2-5 years"
    senior: "5-8 years"
    staff: "8+ years"
  
  related_occupations:
    - "15-1299.09"  # ML Specialists
    - "15-1244.00"  # Network Architects
  
  typical_titles:
    - "Software Engineer"
    - "Backend Developer"
    - "Full Stack Developer"
    - "Application Developer"
```

---

## Appendix B: Sample JD Output

```markdown
# Senior Data Engineer

**Location**: Remote (US)
**Compensation**: $150,000 - $180,000 + equity

## About the Role

We're looking for a Senior Data Engineer to build the analytics foundation 
for our growing sales organization. You'll own the full data pipeline from 
our CRM systems through to executive dashboards, enabling data-driven 
decisions across the company.

## What You'll Do

- Design and build data pipelines from Salesforce and HubSpot to our 
  Snowflake data warehouse
- Create and maintain dashboards in Looker for sales leadership
- Establish data quality monitoring and alerting
- Document data models and maintain a data catalog
- Collaborate with Sales Ops to understand reporting needs
- Mentor junior team members on data engineering best practices

## Requirements

- 4+ years of data engineering experience
- Expert-level SQL (complex queries, performance optimization)
- Strong Python skills for data pipeline development
- Experience with cloud data warehouses (Snowflake preferred)
- Familiarity with BI tools (Looker, Tableau, or similar)
- Experience building pipelines from CRM systems

## Nice to Have

- dbt experience
- Airflow or similar orchestration tools
- Salesforce and/or HubSpot API experience
- Experience in B2B SaaS or fintech

## About Us

[Company description placeholder]

## Benefits

[Benefits placeholder]
```

---

*Document Version: 2.0*
*Strategy: Wedge Product (JD Generator → Marketplace)*
*Created: February 2026*
