# JD (Job Description) Generation Requirements

**Version:** 1.0
**Source:** hiring-ontology repository
**Date:** 2026-02-04

---

## Overview

Job Description (JD) generation is the foundational product in the TalentArchitect platform's product ladder. It transforms natural language role descriptions into structured job requirements using an AI-powered ontology based on O*NET-SOC classification.

**Purpose:**
- Convert employer's natural language needs into structured, complete job descriptions
- Ensure consistency and quality through ontology-powered requirement structuring
- Generate JDs that attract the right candidates by including essential, preferred, and bonus requirements
- Support bidirectional flow: natural language to structure AND structure to JD text

---

## Core Data Structure: Structured Requirement Object (SRO)

The SRO is the central data model that flows through all products (JD Generator, Optimizer, Interview Generator, Candidate Matcher).

### SRO Schema

```yaml
structured_requirement_object:
  id:
    type: string
    format: "sro_{uuid}"

  metadata:
    title: string                    # Job title
    company_context: string          # Company description
    created_at: datetime
    updated_at: datetime
    version: integer
    status: enum[draft, active, filled, archived]
    source: enum[generated, imported, manual]

  ontology_mapping:
    occupation_code: string          # O*NET-SOC code (e.g., "15-1252.00")
    neighborhood: string             # Semantic neighborhood (e.g., "software_engineering")
    role_family: string              # Functional area (engineering, data, design, etc.)
    role_level: string               # Seniority (entry, mid, senior, staff, director, executive)
    role_specialization: string      # Specific focus (backend, frontend, ML, etc.)

  requirements:
    essential:                       # Must-have requirements (weight: 1.0)
      type: array
      items:
        skill:
          name: string
          proficiency: integer[1-5]
          context: string            # How skill is used
        experience:
          domain: string
          min_years: integer
        education:
          level: string
          field: string              # Optional

    preferred:                       # Important but not required (weight: 0.6)
      type: array
      items: same_as_essential

    bonus:                           # Nice to have (weight: 0.3)
      type: array
      items: same_as_essential

  context:
    employment_type: string          # full_time, part_time, contract, freelance
    work_arrangement: string         # remote, hybrid, onsite, flexible
    location: string
    compensation:
      salary_range: [min, max]
      equity: string                 # none, options, rsu, profit_sharing
      bonus: string                  # none, discretionary, performance_based, commission
    team_size: integer
    reports_to: string

  generated_content:
    job_description: string          # Full JD text output
    interview_questions: array       # Generated from SRO
    scoring_rubrics: object          # Evaluation criteria

  analytics:                         # Populated by JD Optimizer
    posted_to: array[string]
    applications_received: integer
    qualified_applicants: integer
    interviews_conducted: integer
    offers_extended: integer
    hire_made: boolean
    hire_date: datetime
    success_rating: integer[1-5]
```

---

## Required Fields/Sections for Job Descriptions

### Category 1: Role Identity (Required)

| Dimension | Type | Description |
|-----------|------|-------------|
| `occupation_code` | single | O*NET-SOC classification code |
| `role_family` | single | Functional area (engineering, data, design, product, marketing, sales, operations, people) |
| `role_level` | single | Seniority level (intern, entry, mid, senior, staff, director, executive) |
| `role_specialization` | single | Specific focus within role family |

### Category 2: Employment Context (Required)

| Dimension | Type | Description |
|-----------|------|-------------|
| `employment_type` | single | full_time, part_time, contract, freelance, temp_to_perm |
| `work_arrangement` | single | remote, hybrid, onsite, flexible |
| `contract_duration` | single | permanent, fixed_term, project_based, open_ended_contract |
| `team_structure` | single | individual, small_team, medium_team, large_team, cross_functional |

### Category 3: Technical Requirements (Context-dependent)

| Dimension | Type | Description |
|-----------|------|-------------|
| `programming_languages` | multi | Languages with proficiency levels (1-5) |
| `frameworks_libraries` | multi | Required frameworks/libraries |
| `tools_platforms` | multi | Required tools and platforms |
| `technical_domains` | multi | Domain expertise areas |
| `certifications` | multi | Required/preferred certifications |

### Category 4: Professional Competencies

| Dimension | Type | Description |
|-----------|------|-------------|
| `leadership_scope` | single | IC to executive leadership |
| `communication_skills` | multi | written, verbal, stakeholder management, client-facing |
| `collaboration_style` | single | autonomous, pair_based, squad_embedded, platform_serving, consulting |
| `problem_solving_level` | single | execution, tactical, analytical, strategic, transformational |
| `domain_expertise` | multi | Business/industry domain knowledge |

### Category 5: Experience Requirements

| Dimension | Type | Description |
|-----------|------|-------------|
| `years_experience` | range | Total relevant years required |
| `experience_domains` | multi | Specific domain experience |
| `education_level` | single | not_required, high_school, some_college, bachelors, masters, doctorate, equivalent_experience |
| `industry_experience` | multi | Industry-specific experience |
| `achievement_indicators` | multi | shipped_products, scaled_systems, led_teams, open_source, publications, startup_founding |

### Category 6: Compensation & Benefits

| Dimension | Type | Description |
|-----------|------|-------------|
| `salary_range` | range | Base salary min/max (USD, annual) |
| `equity_offered` | single | none, options, rsu, profit_sharing |
| `bonus_structure` | single | none, discretionary, performance_based, commission, signing |
| `benefits_package` | multi | health_insurance, dental_vision, retirement_401k, unlimited_pto, parental_leave, etc. |

### Category 7: Company Context

| Dimension | Type | Description |
|-----------|------|-------------|
| `company_stage` | single | pre_seed, seed, series_a, series_b, series_c_plus, growth, public, enterprise |
| `company_size` | single | tiny (1-10), small (11-50), medium (51-200), large (201-1000), enterprise (1000+) |
| `industry_vertical` | single | technology_saas, fintech, healthtech, edtech, ecommerce, etc. |
| `engineering_culture` | single | startup_scrappy, product_driven, engineering_driven, research_oriented, enterprise_process |
| `growth_trajectory` | single | hypergrowth, fast_growing, steady_growth, stable, turnaround |

---

## Validation Rules

### SRO Validation Rules

| Rule | Description |
|------|-------------|
| Essential Skills <= 10 | Avoid wish-list JDs; maximum 10 essential skills |
| Proficiency Consistency | Level-appropriate proficiency expectations |
| Experience Alignment | Years must match role level expectations |
| Compensation Market Rate | Salary within market range for role |
| Requirement Realism | Skills combinations that exist together |

### Experience-Level Validation

| Level | Years | Typical Essential Skills | Typical Preferred Skills |
|-------|-------|--------------------------|--------------------------|
| entry_level | 0-2 | 3-5 | 2-3 |
| mid_level | 2-5 | 5-8 | 3-5 |
| senior | 5-8 | 6-10 | 4-6 |
| staff | 8-12 | 8-12 | 5-8 |
| director_plus | 10+ | Leadership required | Organizational impact |

### Requirement Type Weights & Thresholds

| Type | Weight | Matching Threshold |
|------|--------|-------------------|
| essential | 1.0 | Candidate must meet 80%+ |
| preferred | 0.6 | Candidate should meet 50%+ |
| bonus | 0.3 | No minimum required |

---

## Proficiency Scale (O*NET Aligned)

| Level | Label | Description | Experience Equivalent |
|-------|-------|-------------|----------------------|
| 1 | Novice | Basic awareness, requires supervision | 0-1 years |
| 2 | Beginner | Can perform basic tasks independently | 1-2 years |
| 3 | Intermediate | Competent, handles typical scenarios | 2-4 years |
| 4 | Advanced | Expert in most scenarios, can mentor others | 4-7 years |
| 5 | Expert | Mastery, drives innovation, industry recognition | 7+ years |

---

## Equivalence Rules

### Experience-Education Equivalencies

| Rule | Context |
|------|---------|
| 4 years experience ≈ Bachelor's degree | Technical roles |
| 2 years industry experience ≈ 1 year at target scale | Scaling roles |
| AWS certification ≈ 2 years AWS production experience | Cloud roles |
| Open source contributions ≈ Side projects ≈ Bootcamp portfolio | Demonstrable work |

### Skill Substitution Rules

| Primary Skill | Acceptable Substitutes | Context |
|---------------|----------------------|---------|
| Python | R, Julia | Data science |
| React | Vue, Angular, Svelte | Frontend |
| AWS | GCP, Azure | Cloud |
| PostgreSQL | MySQL | Relational DB |
| Kubernetes | Docker Swarm, Nomad | Orchestration |
| PyTorch | TensorFlow, JAX | ML frameworks |

---

## Relationships to Other Ontology Entities

### Occupation Taxonomy (Layer 1)

The JD maps to semantic neighborhoods for specialist agent routing:

| Neighborhood | O*NET Range | Specialist Agent |
|--------------|-------------|------------------|
| Software Engineering | 15-1250 to 15-1299 | software_specialist |
| Data & Analytics | 15-2000s | data_specialist |
| Design & Creative | 27-1000s | design_specialist |
| Product Management | 11-9199, 13-1082 | product_specialist |
| Marketing & Growth | 11-2020, 13-1160 | marketing_specialist |
| Finance & Operations | 13-2000s | finance_specialist |
| HR & Recruiting | 13-1071, 13-1151 | hr_specialist |
| Sales & Customer Success | 41-3000s | sales_specialist |

### Competency Graph (Layer 2)

Skills have relationships that inform JD generation:

- **requires**: Skill A requires Skill B as prerequisite (e.g., React requires JavaScript)
- **substitutes**: Skill A can substitute for Skill B (e.g., Vue substitutes for React)
- **complements**: Skill A commonly used with Skill B (e.g., Python complements SQL)
- **specializes**: Skill A is a specialization of Skill B (e.g., PyTorch specializes ML)

### Interview Generation (Layer 3)

SRO requirements map directly to interview questions:

- Essential requirements → Technical verification questions
- Preferred requirements → Depth probing questions
- Experience gaps → Gap assessment questions
- Role level → Interview round structure

---

## JD Generation Flow

```
INPUT (Natural Language):
"We need a senior backend engineer who can work on our
payment processing system. Must know Python and have
experience with high-scale systems."

    ↓ CPO Agent Analysis ↓

NEIGHBORHOOD: software_engineering
ROLE FAMILY: engineering
ROLE LEVEL: senior
SPECIALIZATION: backend

    ↓ Software Specialist ↓

INFERRED REQUIREMENTS:
Essential:
- Python (proficiency 4+)
- Distributed systems (proficiency 4+)
- Payment processing experience
- High-scale systems

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

    ↓ JD Text Generation ↓

[Complete job description formatted for posting]
```

---

## Example: Complete SRO

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
```

---

## Quality Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| MECE Score | >9.0 | Mutually exclusive, collectively exhaustive dimensions |
| Orthogonality | >8.5 | Dimensions are independent axes |
| Inferability | >9.0 | Values determinable from JD content |
| Coverage | >9.5 | All hiring scenarios supported |

---

## Related Files

| File | Description |
|------|-------------|
| `/ontology/hiring_ontology_v1.0.yaml` | Full ontology specification with all dimensions |
| `/ontology/hiring_ontology_v1.0.md` | Documentation and usage guide |
| `/ontology/hiring_skills_taxonomy_v1.0.yaml` | Detailed skills taxonomy with relationships |
| `/ontology/hiring_interview_taxonomy_v1.0.yaml` | Interview question generation taxonomy |
| `/AI_TALENT_MATCHING_PLATFORM_V2.md` | Platform strategy and product ladder |

---

## Design Principles

1. **MECE**: Mutually Exclusive, Collectively Exhaustive within each dimension
2. **ORTHOGONALITY**: Dimensions are independent axes measuring different aspects
3. **INFERABILITY**: Values determinable from JD/CV content analysis
4. **BIDIRECTIONAL**: Supports both JD→structure and structure→JD generation
5. **O*NET_ALIGNED**: Compatible with O*NET-SOC occupational classification
