# Hiring Ontology v1.0 - Documentation & Usage Guide

**Version:** 1.0
**Created:** 2026-02-04
**Status:** Production Ready
**Platform:** TalentArchitect

---

## Executive Summary

This ontology provides a comprehensive semantic framework for the complete hiring workflow:

1. **JD Generation** - Transform natural language role descriptions into structured requirements
2. **JD Optimization** - Analyze and improve job descriptions for better candidate attraction
3. **Interview Generation** - Create role-specific, CV-informed interview questions
4. **Candidate Matching** - Match candidates against structured requirements

The ontology is built on a three-layer architecture aligned with O*NET-SOC occupational classification.

---

## Part 1: Architecture Overview

### 1.1 Three-Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    THREE-LAYER ONTOLOGY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: OCCUPATION TAXONOMY                                    │
│  ├── Based on O*NET-SOC (923 occupations)                       │
│  ├── Extended for modern tech/gig roles                         │
│  ├── Organized into semantic neighborhoods                      │
│  └── Domain → Function → Specialization hierarchy               │
│                                                                  │
│  LAYER 2: COMPETENCY GRAPH                                       │
│  ├── Skills (hard + soft)                                       │
│  ├── Tools/Technologies                                         │
│  ├── Knowledge Areas                                            │
│  ├── Certifications/Credentials                                 │
│  └── Relationships: requires, substitutes, complements          │
│                                                                  │
│  LAYER 3: REQUIREMENT SEMANTICS                                  │
│  ├── Proficiency levels (1-5, O*NET calibrated)                │
│  ├── Experience duration mappings                               │
│  ├── Equivalence rules (experience ≈ education)                │
│  ├── Essential vs Preferred vs Bonus classification            │
│  └── Contextual modifiers (industry, scale, remote)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Semantic Neighborhoods

The ontology is partitioned into coherent clusters of related occupations and skills:

| Neighborhood | O*NET Range | Example Roles | Specialist Agent |
|--------------|-------------|---------------|------------------|
| Software Engineering | 15-1250 to 15-1299 | Backend Dev, DevOps, ML Engineer | software_specialist |
| Data & Analytics | 15-2000s | Data Analyst, Data Scientist | data_specialist |
| Design & Creative | 27-1000s | UX Designer, Product Designer | design_specialist |
| Product Management | 11-9199, 13-1082 | Product Manager, Scrum Master | product_specialist |
| Marketing & Growth | 11-2020, 13-1160 | Growth Marketer, SEO Specialist | marketing_specialist |
| Finance & Operations | 13-2000s | Financial Analyst, Controller | finance_specialist |
| HR & Recruiting | 13-1071, 13-1151 | Recruiter, HR Generalist | hr_specialist |
| Sales & Customer Success | 41-3000s | Account Executive, CSM | sales_specialist |

### 1.3 Proficiency Scale (O*NET Aligned)

| Level | Label | Description | Experience Equivalent |
|-------|-------|-------------|----------------------|
| 1 | Novice | Basic awareness, requires supervision | 0-1 years |
| 2 | Beginner | Can perform basic tasks independently | 1-2 years |
| 3 | Intermediate | Competent, handles typical scenarios | 2-4 years |
| 4 | Advanced | Expert in most scenarios, can mentor | 4-7 years |
| 5 | Expert | Mastery, drives innovation | 7+ years |

---

## Part 2: Category Definitions

### 2.1 Category 1: Role Identity

**Question:** What role is being hired for?

| Dimension | Type | Purpose |
|-----------|------|---------|
| occupation_code | single | O*NET-SOC classification code |
| role_family | single | Functional area (engineering, data, design, etc.) |
| role_level | single | Seniority (entry, mid, senior, staff, director) |
| role_specialization | single | Specific focus (backend, frontend, ML, etc.) |

**Example Classification:**

```yaml
# Input: "We need a senior data engineer to build our analytics platform"

role_identity:
  occupation_code: "15-1252.00"  # Software Developers
  role_family: data
  role_level: senior
  role_specialization: data_engineering
```

### 2.2 Category 2: Employment Context

**Question:** What are the employment terms and conditions?

| Dimension | Type | Purpose |
|-----------|------|---------|
| employment_type | single | Full-time, contract, freelance |
| work_arrangement | single | Remote, hybrid, onsite |
| contract_duration | single | Permanent, fixed-term, project |
| team_structure | single | Individual, small team, cross-functional |

### 2.3 Category 3: Technical Requirements

**Question:** What technical skills and tools are required?

| Dimension | Type | Purpose |
|-----------|------|---------|
| programming_languages | multi | Required languages with proficiency |
| frameworks_libraries | multi | Required frameworks/libraries |
| tools_platforms | multi | Required tools and platforms |
| technical_domains | multi | Domain expertise areas |
| certifications | multi | Required/preferred certifications |

**Example:**

```yaml
technical_requirements:
  programming_languages:
    - name: python
      proficiency: 4
      category: essential
    - name: sql
      proficiency: 4
      category: essential

  frameworks_libraries:
    - name: dbt
      proficiency: 3
      category: preferred
    - name: airflow
      proficiency: 3
      category: preferred

  tools_platforms:
    - name: snowflake
      category: essential
    - name: aws
      category: preferred
```

### 2.4 Category 4: Professional Competencies

**Question:** What professional and soft skills are needed?

| Dimension | Type | Purpose |
|-----------|------|---------|
| leadership_scope | single | IC to executive leadership |
| communication_skills | multi | Written, verbal, stakeholder |
| collaboration_style | single | How role collaborates |
| problem_solving_level | single | Complexity of problems to solve |
| domain_expertise | multi | Business/industry domain knowledge |

### 2.5 Category 5: Experience Requirements

**Question:** What experience is required?

| Dimension | Type | Purpose |
|-----------|------|---------|
| years_experience | range | Total relevant years |
| experience_domains | multi | Specific domain experience |
| education_level | single | Degree requirements |
| industry_experience | multi | Industry-specific experience |
| achievement_indicators | multi | Expected achievements |

### 2.6 Category 6: Compensation & Benefits

**Question:** What is the compensation structure?

| Dimension | Type | Purpose |
|-----------|------|---------|
| salary_range | range | Base salary min/max |
| equity_offered | single | Options, RSU, none |
| bonus_structure | single | Discretionary, performance, commission |
| benefits_package | multi | Health, PTO, remote stipend, etc. |

### 2.7 Category 7: Company Context

**Question:** What is the hiring company's context?

| Dimension | Type | Purpose |
|-----------|------|---------|
| company_stage | single | Pre-seed to public |
| company_size | single | Headcount range |
| industry_vertical | single | Primary industry |
| engineering_culture | single | Startup, product-driven, enterprise |
| growth_trajectory | single | Hypergrowth to stable |

### 2.8 Category 8: Interview & Assessment

**Question:** How will candidates be evaluated?

| Dimension | Type | Purpose |
|-----------|------|---------|
| interview_rounds | multi | Screen, technical, behavioral, etc. |
| assessment_types | multi | Live coding, system design, case study |
| evaluation_criteria | multi | Derived from requirements |
| question_categories | multi | Types of questions to generate |
| scoring_rubrics | structured | 1-5 scoring definitions |

---

## Part 3: Structured Requirement Object (SRO)

The SRO is the core data model that flows through all products.

### 3.1 Complete SRO Example

```yaml
structured_requirement_object:
  id: "sro_abc123"

  metadata:
    title: "Senior Data Engineer"
    company_context: "Series B fintech startup"
    created_at: "2026-02-04"
    version: 1
    status: "active"

  ontology_mapping:
    occupation_code: "15-1252.00"
    neighborhood: "data_analytics"
    role_family: "data"
    role_level: "senior"
    role_specialization: "data_engineering"

  requirements:
    essential:
      - skill:
          name: "sql"
          proficiency: 4
          context: "complex queries, optimization, data modeling"
      - skill:
          name: "python"
          proficiency: 4
          context: "data pipelines, ETL development"
      - skill:
          name: "snowflake"
          proficiency: 3
          context: "data warehouse management"
      - experience:
          domain: "data_engineering"
          min_years: 4

    preferred:
      - skill:
          name: "dbt"
          proficiency: 3
          context: "data transformation, testing"
      - skill:
          name: "airflow"
          proficiency: 3
          context: "workflow orchestration"
      - certification:
          name: "aws_solutions_architect"

    bonus:
      - skill:
          name: "spark"
          proficiency: 2
      - experience:
          domain: "fintech"
          min_years: 1

  context:
    employment_type: "full_time"
    work_arrangement: "remote"
    compensation:
      salary_range: [150000, 200000]
      equity: "options"
      bonus: "performance_based"
    team_size: 5
    reports_to: "VP Engineering"

  generated_content:
    job_description: |
      # Senior Data Engineer

      ## About the Role
      We're looking for a Senior Data Engineer to build the
      analytics foundation for our growing fintech platform...

      ## What You'll Do
      - Design and build data pipelines from multiple sources
      - Manage and optimize our Snowflake data warehouse
      - Implement data quality monitoring and testing
      - Partner with analytics team on BI requirements

      ## Requirements
      - 4+ years of data engineering experience
      - Expert SQL (complex queries, optimization)
      - Strong Python for data pipelines
      - Experience with cloud data warehouses

      ## Nice to Have
      - dbt experience
      - Airflow or similar orchestration
      - Fintech industry experience

    interview_questions:
      - category: technical_verification
        question: "Walk me through how you'd optimize a slow-running query that joins 5 large tables"
        assesses: [sql, problem_solving]
        rubric:
          1: "Cannot explain basic optimization techniques"
          3: "Explains indexes, joins, basic optimization"
          5: "Deep expertise in query plans, partitioning, advanced optimization"

      - category: experience_probing
        question: "Describe the most complex data pipeline you've built. What were the key design decisions?"
        assesses: [data_engineering, architecture]
        rubric:
          1: "Simple ETL, no complexity handling"
          3: "Moderate complexity, handles errors and scale"
          5: "Production-grade, handles edge cases, monitoring, recovery"
```

---

## Part 4: Candidate Profile Object (CPO)

The CPO represents a structured candidate profile.

### 4.1 CPO Example

```yaml
candidate_profile_object:
  id: "cpo_xyz789"

  personal:
    name: "Sarah Chen"
    email: "sarah@example.com"
    location: "San Francisco, CA"

  ontology_mapping:
    primary_occupation: "15-1252.00"
    neighborhoods: ["data_analytics", "software_engineering"]

  skills:
    - name: "sql"
      proficiency: 5
      years_experience: 6
      context: "Complex analytics, data modeling, optimization"
    - name: "python"
      proficiency: 4
      years_experience: 5
      context: "Data pipelines, pandas, airflow"
    - name: "snowflake"
      proficiency: 4
      years_experience: 3
    - name: "dbt"
      proficiency: 4
      years_experience: 2
    - name: "airflow"
      proficiency: 3
      years_experience: 2

  experience:
    - company: "TechCorp"
      title: "Senior Data Engineer"
      dates: ["2022-01", "present"]
      duration_months: 25
      skills_used: [sql, python, snowflake, dbt, airflow]
      achievements:
        - "Built real-time analytics pipeline processing 10M events/day"
        - "Reduced data warehouse costs by 40%"

    - company: "StartupXYZ"
      title: "Data Engineer"
      dates: ["2019-06", "2021-12"]
      duration_months: 31
      skills_used: [sql, python, redshift, luigi]

  education:
    - institution: "UC Berkeley"
      degree: "BS"
      field: "Computer Science"
      graduation_date: "2019-05"

  summary:
    total_years_experience: 5
    primary_domain: "data_engineering"
    career_trajectory: "ascending"

  matching:
    sro_id: "sro_abc123"
    match_score: 0.92
    essential_coverage: 1.0
    preferred_coverage: 0.85
    gaps:
      - "No explicit fintech experience"
    strengths:
      - "Exceeds SQL proficiency requirement"
      - "Strong dbt experience"
      - "Demonstrated scale (10M events/day)"
```

---

## Part 5: Interview Question Generation

### 5.1 Question Categories

| Category | Purpose | Question Type |
|----------|---------|---------------|
| Technical Verification | Verify claimed skills | Direct assessment |
| Experience Probing | Deep dive into past work | STAR behavioral |
| Gap Assessment | Probe areas of weakness | Situational |
| Differentiating | Separate top candidates | Varies |
| Culture/Values | Assess team fit | Behavioral |

### 5.2 CV-Informed Question Generation

When candidate CVs are available, questions are customized:

```
┌─────────────────────────────────────────────────────────────────┐
│             CV-INFORMED QUESTION GENERATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUTS:                                                         │
│  ├── SRO (Structured Requirements)                              │
│  └── Top Candidate CPOs                                         │
│                                                                  │
│  ANALYSIS:                                                       │
│  ├── COMMON STRENGTHS: Skills all top candidates have          │
│  │   → Quick verification questions                            │
│  │                                                              │
│  ├── DIFFERENTIATING FACTORS: Where candidates vary            │
│  │   → Deep-dive questions to separate candidates              │
│  │                                                              │
│  └── INDIVIDUAL GAPS: Per-candidate weaknesses                 │
│      → Targeted probing questions                              │
│                                                                  │
│  OUTPUT: Personalized Interview Pack                            │
│  ├── Baseline questions (ask all)                              │
│  ├── Differentiating questions                                 │
│  └── Candidate-specific probes                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Question Quality Metrics

Each generated question is scored on:

| Metric | Weight | Description |
|--------|--------|-------------|
| Job Relevance | 40% | Maps to SRO requirements |
| Discrimination Power | 30% | Will produce varied scores |
| Bias Resistance | 20% | Fair and defensible |
| Behavioral Anchoring | 10% | Clear rubric definitions |

---

## Part 6: Agent Architecture

### 6.1 Agent Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CPO AGENT                             │    │
│  │              (Chief People Officer)                      │    │
│  │                                                          │    │
│  │  Responsibilities:                                       │    │
│  │  • Analyze employer's stated need                       │    │
│  │  • Identify relevant neighborhoods                      │    │
│  │  • Dispatch to specialist agents                        │    │
│  │  • Identify gaps and ambiguities                        │    │
│  │  • Generate clarifying questions                        │    │
│  │  • Synthesize final structured output                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │   Software    │ │     Data      │ │    Design     │  ...    │
│  │  Specialist   │ │  Specialist   │ │  Specialist   │         │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤         │
│  │ • Languages   │ │ • Data stack  │ │ • Tools       │         │
│  │ • Frameworks  │ │ • ML vs BI    │ │ • Methods     │         │
│  │ • Patterns    │ │ • Scale reqs  │ │ • Portfolios  │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Agent Workflow

1. **Input Analysis**: CPO Agent receives natural language job description
2. **Neighborhood Detection**: Identifies which semantic neighborhoods are relevant
3. **Specialist Dispatch**: Routes to appropriate specialist agent(s)
4. **Requirement Extraction**: Specialists extract domain-specific requirements
5. **Gap Identification**: CPO Agent identifies missing information
6. **Clarifying Questions**: Generates questions for ambiguities
7. **SRO Assembly**: Synthesizes final structured requirement object

---

## Part 7: Equivalence Rules

### 7.1 Experience-Education Equivalencies

| Rule | Context |
|------|---------|
| 4 years experience ≈ Bachelor's degree | Technical roles |
| 2 years industry experience ≈ 1 year at target scale | Scaling roles |
| AWS certification ≈ 2 years AWS production experience | Cloud roles |
| Open source contributions ≈ Side projects ≈ Bootcamp portfolio | Demonstrable work |

### 7.2 Skill Substitution Rules

| Primary Skill | Acceptable Substitutes | Context |
|---------------|----------------------|---------|
| Python | R, Julia | Data science |
| React | Vue, Angular, Svelte | Frontend |
| AWS | GCP, Azure | Cloud |
| PostgreSQL | MySQL | Relational DB |
| Kubernetes | Docker Swarm, Nomad | Orchestration |

---

## Part 8: Usage Examples

### 8.1 JD Generation Flow

```
INPUT (Natural Language):
"We need a senior backend engineer who can work on our
payment processing system. Must know Python and have
experience with high-scale systems. We're a Series B
fintech company, fully remote."

↓ CPO Agent Analysis ↓

NEIGHBORHOOD: software_engineering
ROLE FAMILY: engineering
ROLE LEVEL: senior
SPECIALIZATION: backend

↓ Software Specialist ↓

INFERRED REQUIREMENTS:
Essential:
- Python (4+)
- Distributed systems (4+)
- Payment processing experience
- High-scale systems (millions TPS)

Preferred:
- Financial services compliance
- PCI-DSS knowledge

↓ Gap Detection ↓

CLARIFYING QUESTIONS:
1. What's your current tech stack? (frameworks, databases)
2. What scale are we talking about? (TPS, data volume)
3. Do you need someone to design or execute?
4. What's the team structure?

↓ Final SRO ↓

[Structured Requirement Object with all dimensions filled]
```

### 8.2 Interview Generation Flow

```
INPUT:
- SRO for Senior Data Engineer
- 3 Top Candidate CPOs

↓ Analysis ↓

COMMON STRENGTHS (all candidates):
- SQL proficiency (4+)
- Python for pipelines
→ Quick verification, don't dwell

DIFFERENTIATING FACTORS:
- dbt experience: 2 have it, 1 doesn't
- Fintech experience: 1 has it, 2 don't
→ Ask about data transformation approaches
→ Ask about financial data handling

INDIVIDUAL GAPS:
- Candidate A: No Airflow experience
- Candidate B: 3 years (req is 4)
- Candidate C: No warehouse experience
→ Generate targeted probes

↓ Interview Pack ↓

BASELINE QUESTIONS (all candidates):
1. SQL optimization question
2. Pipeline architecture question

DIFFERENTIATING QUESTIONS:
3. dbt/transformation approach question

CANDIDATE-SPECIFIC:
- A: "How would you approach learning Airflow?"
- B: "Describe complex work beyond your years"
- C: "How would you approach warehouse design?"
```

---

## Part 9: Validation & Quality

### 9.1 SRO Validation Rules

| Rule | Description |
|------|-------------|
| Essential Skills ≤ 10 | Avoid wish-list JDs |
| Proficiency Consistency | Level-appropriate proficiency expectations |
| Experience Alignment | Years match role level expectations |
| Compensation Market Rate | Salary within market range for role |
| Requirement Realism | Skills combinations that exist together |

### 9.2 Quality Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| MECE Score | >9.0 | Mutually exclusive, collectively exhaustive |
| Orthogonality | >8.5 | Dimensions are independent |
| Inferability | >9.0 | Values determinable from content |
| Coverage | >9.5 | All hiring scenarios supported |

---

## Part 10: Integration Points

### 10.1 Product Ladder Integration

```
JD Generator (Step 1)
├── Uses: Occupation taxonomy, skill competency graph
├── Produces: SRO with generated JD text
└── Feeds: JD Optimizer

JD Optimizer (Step 2)
├── Uses: SRO, JD Corpus (crawled JDs)
├── Produces: Optimized SRO, analytics
└── Feeds: Interview Generator, Candidate Matcher

Interview Generator (Step 3)
├── Uses: SRO, optional CPOs
├── Produces: Interview questions, rubrics
└── Feeds: Candidate evaluation

Candidate Matcher (Step 4)
├── Uses: SRO, CPOs
├── Produces: Match scores, gap analysis
└── Feeds: Interview preparation
```

### 10.2 External Integrations

| System | Integration Type | Data Flow |
|--------|-----------------|-----------|
| O*NET | Reference data | Occupation codes, skill definitions |
| ATS (Greenhouse, Lever) | Bidirectional | JDs out, applicants in |
| LinkedIn | Export | Post optimized JDs |
| Salary databases | Reference | Compensation benchmarking |

---

## Appendix A: Dimension Quick Reference

| ID | Dimension | Category | Type |
|----|-----------|----------|------|
| 1 | occupation_code | Role Identity | single |
| 2 | role_family | Role Identity | single |
| 3 | role_level | Role Identity | single |
| 4 | role_specialization | Role Identity | single |
| 5 | employment_type | Employment Context | single |
| 6 | work_arrangement | Employment Context | single |
| 7 | contract_duration | Employment Context | single |
| 8 | team_structure | Employment Context | single |
| 9 | programming_languages | Technical Requirements | multi |
| 10 | frameworks_libraries | Technical Requirements | multi |
| 11 | tools_platforms | Technical Requirements | multi |
| 12 | technical_domains | Technical Requirements | multi |
| 13 | certifications | Technical Requirements | multi |
| 14 | leadership_scope | Professional Competencies | single |
| 15 | communication_skills | Professional Competencies | multi |
| 16 | collaboration_style | Professional Competencies | single |
| 17 | problem_solving_level | Professional Competencies | single |
| 18 | domain_expertise | Professional Competencies | multi |
| 19 | years_experience | Experience Requirements | range |
| 20 | experience_domains | Experience Requirements | multi |
| 21 | education_level | Experience Requirements | single |
| 22 | industry_experience | Experience Requirements | multi |
| 23 | achievement_indicators | Experience Requirements | multi |
| 24 | salary_range | Compensation & Benefits | range |
| 25 | equity_offered | Compensation & Benefits | single |
| 26 | bonus_structure | Compensation & Benefits | single |
| 27 | benefits_package | Compensation & Benefits | multi |
| 28 | company_stage | Company Context | single |
| 29 | company_size | Company Context | single |
| 30 | industry_vertical | Company Context | single |
| 31 | engineering_culture | Company Context | single |
| 32 | growth_trajectory | Company Context | single |
| 33 | interview_rounds | Interview & Assessment | multi |
| 34 | assessment_types | Interview & Assessment | multi |
| 35 | evaluation_criteria | Interview & Assessment | multi |
| 36 | question_categories | Interview & Assessment | multi |
| 37 | scoring_rubrics | Interview & Assessment | structured |

---

## Appendix B: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-04 | Initial release |

---

## Appendix C: Related Documents

- `hiring_ontology_v1.0.yaml` - Full YAML specification
- `AI_TALENT_MATCHING_PLATFORM_V2.md` - Platform strategy document
- `GTM_PRICING_ANALYSIS.md` - GTM and pricing analysis
- `INTERVIEW_PLATFORM_ANALYSIS.md` - Interview generator competitive analysis
