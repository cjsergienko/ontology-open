# Compliance Dossier Generator: Technical Architecture & Philosophy

**Version:** 4.6.1  
**Last Updated:** January 2, 2026  
**Author:** Architecture Team  
**Audience:** Technical leads, architects, and senior engineers joining the project

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement & Vision](#problem-statement--vision)
3. [The Golden Standard: What Success Looks Like](#the-golden-standard-what-success-looks-like)
4. [Architecture Overview](#architecture-overview)
5. [Core Philosophy: Zero Hardcoding](#core-philosophy-zero-hardcoding)
6. [The GSP (Golden Standard Prompt)](#the-gsp-golden-standard-prompt)
7. [Query Discovery Pipeline](#query-discovery-pipeline)
8. [Scoring System](#scoring-system)
9. [PDF Collection & Jurisdiction Filtering](#pdf-collection--jurisdiction-filtering)
10. [Tracing & Observability](#tracing--observability)
11. [Code Organization & Navigation](#code-organization--navigation)
12. [How to Use the System](#how-to-use-the-system)
13. [Testing Methodology](#testing-methodology)
14. [Version History & Evolution](#version-history--evolution)
15. [Known Issues & Technical Debt](#known-issues--technical-debt)
16. [Next Steps & Roadmap](#next-steps--roadmap)
17. [Appendix: Key Decisions & Their Rationale](#appendix-key-decisions--their-rationale)

---

## Executive Summary

The Compliance Dossier Generator is an AI-powered system that automatically generates comprehensive regulatory compliance packages for businesses. Given an industry (e.g., "restaurant") and location (e.g., "Brookline, MA"), the system:

1. **Identifies** all federal, state, and local permits, licenses, and regulatory requirements
2. **Discovers** the actual PDF forms, applications, and official documents needed
3. **Scores** and ranks discovered documents by relevance and authority
4. **Packages** everything into a ready-to-use dossier with clear next steps

The system is designed to be **geography-agnostic**—it works for any US city/state combination without code changes. This is achieved through a "zero hardcoding" philosophy where all location-specific knowledge is derived dynamically by an LLM (the GSP).

**Current Performance (v4.6.1):**
- 40+ requirements identified per business type
- 10-16 search queries generated per requirement
- 22+ relevant PDFs downloaded per dossier
- Full traceability from requirement → query → search result → PDF

---

## Problem Statement & Vision

### The Problem

Starting a business in the US requires navigating a maze of regulatory requirements across three levels of government:

- **Federal:** IRS (EIN), USCIS (I-9), OSHA, ADA, EPA, etc.
- **State:** Business registration, professional licenses, tax registrations, workers' comp
- **Local:** Zoning, health permits, fire safety, signage, specific municipal requirements

A restaurant in Brookline, MA faces different requirements than one in Austin, TX or San Francisco, CA. Currently, entrepreneurs must:
1. Research requirements manually (hours of work)
2. Find the correct forms on various government websites
3. Hope they didn't miss anything critical

### The Vision

**One command generates a complete compliance package for any business in any US location.**

```bash
python3 create_package.py restaurant "Brookline" "MA"
# Output: A complete dossier with all forms, instructions, and next steps
```

### Why This Matters

This is a foundational component of a larger "AI SaaS Factory" strategy. The compliance dossier generator:
1. Solves a real pain point for entrepreneurs
2. Demonstrates sophisticated AI orchestration patterns
3. Creates valuable training data for future improvements
4. Can be productized as a standalone service

---

## The Golden Standard: What Success Looks Like

We define success through a "Golden Standard Prompt" (GSP) that establishes what a perfect compliance package should contain. The GSP was developed through extensive research and iteration.

### Golden Standard Criteria

**Completeness:** Every legally required permit/license is identified
- Federal requirements (universal across US)
- State-specific requirements (varies by state)
- Local/municipal requirements (varies by city)
- Industry-specific requirements (varies by business type)

**Accuracy:** Requirements are correctly categorized
- Authority level (federal/state/local)
- Requirement type (permit, license, registration, certificate, poster)
- Mandatory vs. conditional
- One-time vs. recurring

**Actionability:** Each requirement includes
- Official document/form (PDF when available)
- Issuing authority with contact information
- Application process and timeline
- Fees and renewal requirements
- Prerequisites and dependencies

**Source Quality:** Documents come from authoritative sources
- Primary: .gov domains (irs.gov, mass.gov, brooklinema.gov)
- Secondary: Official municipal websites
- Tertiary: Authoritative third-party sources (only when primary unavailable)

### Measuring Against the Standard

We evaluate each run against these metrics:

| Metric | Target | How Measured |
|--------|--------|--------------|
| Requirements identified | 40+ | Count in GSP output |
| Federal requirements | 15+ | Filter by authority_level |
| State requirements | 10+ | Filter by authority_level |
| Local requirements | 10+ | Filter by authority_level |
| PDFs downloaded | 80%+ of requirements | PDF count / requirement count |
| Correct jurisdiction | 100% | No PDFs from wrong cities/states |
| Query execution | 100% | Queries executed / queries generated |

---

## Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLIANCE DOSSIER GENERATOR                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INPUT: industry="restaurant", city="Brookline", state="MA"                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 1: GSP (Golden Standard Prompt)                                │   │
│  │                                                                       │   │
│  │  • LLM generates comprehensive requirements list                     │   │
│  │  • Outputs: requirement_id, name, authority_level, expected_domains  │   │
│  │  • Zero hardcoding - all knowledge derived dynamically               │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 2: Query Discovery                                             │   │
│  │                                                                       │   │
│  │  • 6 template sets generate 10-16 queries per requirement           │   │
│  │  • Domain-specific queries (site:mass.gov, site:irs.gov)            │   │
│  │  • Long-tail keyword variations                                      │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 3: Search Execution                                            │   │
│  │                                                                       │   │
│  │  • Execute queries against search API                                │   │
│  │  • Collect URLs, snippets, metadata                                  │   │
│  │  • Deduplicate results                                               │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 4: Scoring & Ranking                                           │   │
│  │                                                                       │   │
│  │  • Score each result against GSP requirements                        │   │
│  │  • Domain authority scoring (.gov preferred)                         │   │
│  │  • Content relevance scoring                                         │   │
│  │  • Jurisdiction validation                                           │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 5: PDF Collection                                              │   │
│  │                                                                       │   │
│  │  • Download top-ranked PDFs per requirement                          │   │
│  │  • Jurisdiction filtering (block wrong cities/states)                │   │
│  │  • Unique filenames prevent overwrites                               │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ STAGE 6: Dossier Assembly                                            │   │
│  │                                                                       │   │
│  │  • Generate requirement markdown files                               │   │
│  │  • Create index and navigation                                       │   │
│  │  • Package PDFs in assets/                                           │   │
│  │  • Write trace files for debugging                                   │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  OUTPUT: output/dossier_{industry}_{city}_{state}/                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GSP       │────▶│   Query     │────▶│   Search    │
│   (LLM)     │     │   Generator │     │   Executor  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              Tracing / Observability                │
│  (01_gsp.json, 02_queries.json, 03_results.json)   │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Scorer    │────▶│   PDF       │────▶│   Dossier   │
│             │     │   Collector │     │   Assembler │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              Tracing / Observability                │
│  (04_scoring.json, 05_pdfs.json, 06_assembly.json) │
└─────────────────────────────────────────────────────┘
```

---

## Core Philosophy: Zero Hardcoding

### The Principle

**No location-specific logic should exist in the codebase.**

The system must work for any US city and state without code changes. All location-specific knowledge comes from the LLM (GSP), not from hardcoded lists, dictionaries, or conditional logic.

### Why This Matters

1. **Scalability:** 50 states × thousands of cities = impossible to hardcode
2. **Maintainability:** Regulations change; we can't update code for every change
3. **Accuracy:** LLMs have broader knowledge than any static database
4. **Simplicity:** One code path for all geographies

### Implementation

**Before (Hardcoded - BAD):**
```python
# DON'T DO THIS
STATE_DOMAINS = {
    'MA': ['mass.gov', 'state.ma.us'],
    'CA': ['ca.gov', 'state.ca.us'],
    'TX': ['texas.gov', 'state.tx.us'],
    # ... 47 more states
}

def get_state_domain(state):
    return STATE_DOMAINS.get(state, [f"{state.lower()}.gov"])
```

**After (Zero Hardcoding - GOOD):**
```python
# GSP output includes expected_domains per requirement
# The LLM tells us which domains to use

def is_valid_jurisdiction(url: str, requirement: dict) -> bool:
    """Use GSP-provided expected_domains for validation."""
    domain = extract_domain(url)
    expected = requirement.get('expected_domains', [])
    authority = requirement.get('authority_level', '')
    
    # Federal: any .gov is valid
    if authority == 'federal' and domain.endswith('.gov'):
        return True
    
    # State/Local: check against GSP-provided domains
    return any(exp in domain for exp in expected)
```

### The GSP Contract

The GSP must provide sufficient information for downstream components to operate without hardcoding:

```json
{
  "requirement_id": "ma_food_establishment_permit",
  "name": "Massachusetts Food Establishment Permit",
  "authority_level": "state",
  "expected_domains": ["mass.gov", "state.ma.us"],
  "likely_document_types": ["application", "permit", "form"],
  "form_number": "FEP-1",
  "issuing_authority": "Massachusetts Department of Public Health"
}
```

With this output, the system can:
- Generate domain-specific queries (`site:mass.gov food establishment permit`)
- Validate jurisdiction (is this PDF from mass.gov?)
- Score document relevance (does title mention "FEP-1"?)

---

## The GSP (Golden Standard Prompt)

### Purpose

The GSP is the "brain" of the system. It takes (industry, city, state) and outputs a comprehensive, structured list of all regulatory requirements.

### GSP Output Schema

```json
{
  "metadata": {
    "industry": "restaurant",
    "city": "Brookline",
    "state": "MA",
    "generated_at": "2026-01-02T03:00:00Z"
  },
  "requirements": [
    {
      "requirement_id": "federal_ein",
      "name": "Employer Identification Number (EIN)",
      "description": "Federal tax ID required for all businesses with employees",
      "authority_level": "federal",
      "requirement_type": "registration",
      "mandatory": true,
      "recurring": false,
      "expected_domains": ["irs.gov"],
      "likely_document_types": ["form", "application", "instructions"],
      "form_number": "SS-4",
      "issuing_authority": "Internal Revenue Service",
      "estimated_timeline": "Immediate (online) or 4 weeks (mail)",
      "estimated_fee": "Free",
      "prerequisites": [],
      "notes": "Can apply online at irs.gov for immediate issuance"
    },
    // ... 40+ more requirements
  ]
}
```

### Key Fields Explained

| Field | Purpose | Used By |
|-------|---------|---------|
| `requirement_id` | Unique identifier, used for filenames | All components |
| `authority_level` | federal/state/local - affects jurisdiction filtering | Scorer, PDF Collector |
| `expected_domains` | Which .gov domains to search/trust | Query Generator, Jurisdiction Filter |
| `likely_document_types` | What kind of document to look for | Query Generator |
| `form_number` | Specific form identifier if known | Query Generator, Scorer |
| `issuing_authority` | Who issues this permit | Dossier Assembly |

### GSP Evolution

The GSP has evolved significantly:

| Version | Changes |
|---------|---------|
| v1.0 | Basic requirement list, no domains |
| v2.0 | Added authority_level |
| v3.0 | Added expected_domains (critical for zero-hardcoding) |
| v4.0 | Added likely_document_types, form_number |
| v4.6 | Enhanced domain specificity, multiple domains per requirement |

### GSP Prompt Engineering

The GSP prompt is carefully engineered to elicit comprehensive, structured output:

```
You are a regulatory compliance expert. Generate a comprehensive list of all 
permits, licenses, registrations, and regulatory requirements for a {industry} 
business in {city}, {state}.

For each requirement, provide:
- A unique requirement_id (snake_case, prefixed with authority level)
- The official name
- Authority level (federal, state, or local)
- Expected government domains where forms can be found
- Specific form numbers if known
- The issuing authority

Be comprehensive. Include:
- All federal requirements (IRS, USCIS, OSHA, ADA, EPA, etc.)
- All state requirements (business registration, professional licenses, tax)
- All local requirements (zoning, health, fire, signage, specific municipal)
- Industry-specific requirements (food service, alcohol, health inspections)

Output as JSON matching this schema: {schema}
```

---

## Query Discovery Pipeline

### The Challenge

Given a requirement like "Massachusetts Food Establishment Permit," we need to find the actual PDF form. This requires generating effective search queries.

### Query Template Strategy

We use 6 template sets to maximize coverage:

**Template Set 1: Official Form Queries**
```
"{requirement_name}" official form PDF
"{requirement_name}" application form filetype:pdf
{form_number} {issuing_authority} PDF
```

**Template Set 2: Location-Specific Queries**
```
{city} {state} {requirement_name} application
{state} {requirement_name} permit form
{city} {requirement_name} requirements
```

**Template Set 3: Authority-Based Queries**
```
{issuing_authority} {requirement_name} form
{issuing_authority} application PDF
```

**Template Set 4: Long-Tail Variations**
```
how to apply for {requirement_name} in {city}
{requirement_name} application process {state}
{requirement_name} checklist {city} {state}
```

**Template Set 5: Domain-Specific Queries (v4.6+)**
```
site:{expected_domain} {requirement_name}
site:{expected_domain} {form_number} application
site:{expected_domain} {requirement_type} form
```

**Template Set 6: Simple Queries (v4.6+)**
```
{requirement_name}
{form_number}
{requirement_name} {state}
```

### Query Generation Code

```python
def generate_queries(requirement: dict, city: str, state: str) -> List[str]:
    """Generate search queries for a requirement."""
    queries = []
    
    name = requirement['name']
    form_num = requirement.get('form_number', '')
    authority = requirement.get('issuing_authority', '')
    domains = requirement.get('expected_domains', [])
    
    # Template Set 1: Official form queries
    queries.append(f'"{name}" official form PDF')
    queries.append(f'"{name}" application form filetype:pdf')
    if form_num:
        queries.append(f'{form_num} {authority} PDF')
    
    # Template Set 2: Location-specific
    queries.append(f'{city} {state} {name} application')
    queries.append(f'{state} {name} permit form')
    
    # Template Set 5: Domain-specific (v4.6+)
    for domain in domains[:2]:  # Top 2 domains
        queries.append(f'site:{domain} {name}')
        if form_num:
            queries.append(f'site:{domain} {form_num}')
    
    # Template Set 6: Simple queries
    queries.append(name)
    if form_num:
        queries.append(form_num)
    
    return queries[:16]  # Cap at 16 queries per requirement
```

### Why 10-16 Queries?

Through experimentation, we found:
- **< 5 queries:** Miss too many relevant results
- **5-10 queries:** Good coverage for common requirements
- **10-16 queries:** Excellent coverage, catches edge cases
- **> 16 queries:** Diminishing returns, increases API costs

The domain-specific queries (Template Set 5) were a breakthrough—they dramatically improved precision by focusing on authoritative sources.

---

## Scoring System

### Purpose

Given search results, rank them by likelihood of being the correct official document.

### Scoring Factors

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Domain Authority | 30% | .gov domains are authoritative |
| Title Match | 25% | Title contains requirement name/form number |
| Content Relevance | 20% | Snippet mentions key terms |
| Document Type | 15% | PDF preferred over HTML |
| Jurisdiction Match | 10% | Correct city/state |

### Domain Authority Scoring

```python
def score_domain_authority(url: str, requirement: dict) -> float:
    """Score domain authority (0.0 to 1.0)."""
    domain = extract_domain(url).lower()
    expected = requirement.get('expected_domains', [])
    authority = requirement.get('authority_level', '')
    
    # Exact match to expected domain
    if any(exp in domain for exp in expected):
        return 1.0
    
    # Federal .gov for federal requirements
    if authority == 'federal' and domain.endswith('.gov'):
        return 0.9
    
    # Any .gov domain
    if domain.endswith('.gov'):
        return 0.7
    
    # .edu or .org (sometimes authoritative)
    if domain.endswith('.edu') or domain.endswith('.org'):
        return 0.4
    
    # Commercial domains
    return 0.2
```

### Title Match Scoring

```python
def score_title_match(title: str, requirement: dict) -> float:
    """Score title relevance (0.0 to 1.0)."""
    title_lower = title.lower()
    name_lower = requirement['name'].lower()
    form_num = requirement.get('form_number', '').lower()
    
    score = 0.0
    
    # Exact name match
    if name_lower in title_lower:
        score += 0.5
    
    # Form number match (high signal)
    if form_num and form_num in title_lower:
        score += 0.4
    
    # Partial keyword match
    keywords = name_lower.split()
    matches = sum(1 for kw in keywords if kw in title_lower)
    score += 0.1 * (matches / len(keywords))
    
    return min(score, 1.0)
```

### Handling None Scores

A critical bug fix in v4.6.1—scores can be None if scoring fails:

```python
def safe_score(candidate) -> float:
    """Safe score extraction, handles None."""
    if candidate.score is None:
        return float('-inf')
    return candidate.score

# Usage
ranked = sorted(candidates, key=safe_score, reverse=True)
```

---

## PDF Collection & Jurisdiction Filtering

### The Problem We Solved

In v4.6.0, we discovered two critical issues:

1. **PDF Overwriting:** Multiple PDFs for the same requirement used the same filename
   - 22 PDFs downloaded → only 12 in directory (10 lost!)
   
2. **Wrong Jurisdiction:** PDFs from Boston, NYC, California appeared in Brookline, MA package
   - 19 wrong-jurisdiction PDFs downloaded

### Solution: Unique Filenames

```python
def create_unique_pdf_filename(
    requirement_id: str,
    index: int,
    url: str
) -> str:
    """Create unique filename for PDF."""
    domain = extract_domain(url)
    domain_slug = domain.replace(".", "_").replace("-", "_")[:30]
    return f"{requirement_id}_{index:02d}_{domain_slug}.pdf"

# Examples:
# federal_ein_01_irs_gov.pdf
# federal_ein_02_irs_gov.pdf
# ma_food_permit_01_mass_gov.pdf
```

### Solution: Jurisdiction Filtering

```python
def is_valid_jurisdiction(
    url: str,
    requirement: dict,
    target_city: str,
    target_state: str
) -> bool:
    """
    Validate URL jurisdiction using GSP-provided expected_domains.
    Zero hardcoding - all knowledge comes from GSP.
    """
    domain = extract_domain(url).lower()
    expected = requirement.get('expected_domains', [])
    authority = requirement.get('authority_level', '')
    
    # Federal requirements: any .gov is valid
    if authority == 'federal':
        return domain.endswith('.gov')
    
    # State/Local: must match expected domains from GSP
    if expected:
        return any(exp.lower() in domain for exp in expected)
    
    # Fallback: check if city name in domain
    city_clean = target_city.lower().replace(" ", "").replace("-", "")
    if city_clean in domain:
        return True
    
    # Fallback: check state patterns
    state_lower = target_state.lower()
    if f"{state_lower}.gov" in domain or f"state.{state_lower}" in domain:
        return True
    
    return False
```

### Why Zero Hardcoding for Jurisdiction?

We initially had hardcoded state domain patterns:

```python
# OLD APPROACH - DON'T DO THIS
STATE_DOMAINS = {
    'MA': ['mass.gov', 'state.ma.us'],
    'CA': ['ca.gov', 'state.ca.us'],
    # ...
}
```

Problems:
1. Incomplete (50 states, each with multiple domain patterns)
2. Doesn't handle cities (brooklinema.gov vs boston.gov)
3. Requires code changes when domains change

New approach: GSP provides `expected_domains` for each requirement. The jurisdiction filter uses this directly.

---

## Tracing & Observability

### Philosophy

**Every decision the system makes must be traceable.**

When a PDF is downloaded (or not downloaded), we should be able to trace:
1. Which requirement triggered the search
2. What queries were generated
3. What search results came back
4. How each result was scored
5. Why this PDF was selected

### Trace Files

```
output/dossier_restaurant_brookline_ma/
├── traces/
│   ├── 01_gsp_output.json           # Full GSP output
│   ├── 02_query_discovery.json      # All generated queries
│   ├── 03_search_results.json       # Raw search results
│   ├── 04_scoring_details.json      # Score breakdown per result
│   ├── 05_pdf_downloads.json        # Download decisions & outcomes
│   └── 05_scraped_content_index.json # Index of scraped content (v4.6.1+)
```

### Trace File Schemas

**02_query_discovery.json:**
```json
{
  "generated_at": "2026-01-02T03:00:00Z",
  "total_requirements": 42,
  "total_queries": 504,
  "queries_per_requirement": 12,
  "by_requirement": {
    "federal_ein": {
      "queries": [
        "\"Employer Identification Number\" official form PDF",
        "site:irs.gov EIN application",
        "SS-4 form IRS"
      ]
    }
  }
}
```

**04_scoring_details.json:**
```json
{
  "requirement_id": "federal_ein",
  "candidates": [
    {
      "url": "https://irs.gov/pub/irs-pdf/fss4.pdf",
      "title": "Form SS-4: Application for Employer Identification Number",
      "scores": {
        "domain_authority": 1.0,
        "title_match": 0.9,
        "content_relevance": 0.8,
        "document_type": 1.0,
        "jurisdiction": 1.0
      },
      "total_score": 0.94,
      "selected": true
    }
  ]
}
```

### Using Traces for Debugging

When something goes wrong:

1. **Missing requirement?** Check `01_gsp_output.json`—was it generated?
2. **No search results?** Check `02_query_discovery.json`—were queries generated?
3. **Wrong PDF selected?** Check `04_scoring_details.json`—how did scoring rank candidates?
4. **PDF not downloaded?** Check `05_pdf_downloads.json`—was it filtered by jurisdiction?

---

## Code Organization & Navigation

### Directory Structure

```
compliance_dossier/
├── create_package.py              # Main entry point
├── config/
│   ├── settings.py                # Global configuration
│   └── prompts/                   # GSP and other prompts
├── gsp/
│   ├── generator.py               # GSP LLM integration
│   └── schemas.py                 # Output validation schemas
├── discovery/
│   ├── query_generator.py         # Query template engine
│   ├── search_executor.py         # Search API integration
│   └── pdf_first_pipeline.py      # Main discovery orchestrator
├── collectors/
│   ├── pdf_collector.py           # PDF download & jurisdiction filter
│   └── web_scraper.py             # HTML content extraction
├── scoring/
│   ├── scorer.py                  # Main scoring logic
│   ├── domain_scorer.py           # Domain authority scoring
│   └── relevance_scorer.py        # Content relevance scoring
├── utils/
│   ├── jurisdiction.py            # Jurisdiction utilities (v4.6.1+)
│   └── text_processing.py         # Text extraction utilities
├── tracing/
│   ├── trace_logger.py            # Trace file writer
│   └── content_storage.py         # Scraped content storage (v4.6.1+)
├── assembly/
│   ├── dossier_builder.py         # Final package assembly
│   └── templates/                 # Markdown templates
├── tests/
│   ├── test_gsp.py
│   ├── test_queries.py
│   ├── test_scoring.py
│   └── test_jurisdiction.py
└── output/                        # Generated dossiers
```

### Key Files to Understand

| File | Purpose | When to Modify |
|------|---------|----------------|
| `create_package.py` | CLI entry point, orchestrates pipeline | Adding new CLI options |
| `gsp/generator.py` | GSP prompt and LLM integration | Improving requirement discovery |
| `discovery/query_generator.py` | Query template logic | Adding new query patterns |
| `collectors/pdf_collector.py` | PDF download logic | Fixing download issues |
| `utils/jurisdiction.py` | Jurisdiction validation | Fixing jurisdiction bugs |
| `scoring/scorer.py` | Candidate ranking | Improving selection accuracy |
| `tracing/trace_logger.py` | Observability | Adding new trace data |

### Reading the Code

**Start here:**
1. `create_package.py` - Follow the main flow
2. `discovery/pdf_first_pipeline.py` - Core orchestration
3. `gsp/generator.py` - Understand GSP output

**For debugging:**
1. `tracing/trace_logger.py` - What's being logged
2. `scoring/scorer.py` - How selection works
3. `collectors/pdf_collector.py` - Download and filtering

---

## How to Use the System

### Basic Usage

```bash
# Generate a compliance package
python3 create_package.py restaurant Brookline MA

# With tracing enabled
python3 create_package.py restaurant Brookline MA --enable-tracing

# PDF-first mode (aggressive PDF discovery)
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing

# Different industry
python3 create_package.py "hair salon" Austin TX --pdf-first --enable-tracing
```

### Output Structure

```
output/dossier_restaurant_brookline_ma/
├── README.md                      # Overview and next steps
├── index.md                       # Requirement index
├── requirements/
│   ├── federal_ein.md
│   ├── federal_i9.md
│   ├── ma_food_permit.md
│   └── ...
├── assets/
│   ├── pdfs/
│   │   ├── federal_ein_01_irs_gov.pdf
│   │   ├── federal_i9_01_uscis_gov.pdf
│   │   └── ...
│   └── scraped/                   # v4.6.1+
│       ├── content_0001_a3f2b1c4.json
│       └── ...
└── traces/
    ├── 01_gsp_output.json
    ├── 02_query_discovery.json
    └── ...
```

### Verifying Results

```bash
# Count PDFs downloaded
ls output/dossier_restaurant_brookline_ma/assets/pdfs/ | wc -l

# Check for wrong jurisdictions
ls output/dossier_restaurant_brookline_ma/assets/pdfs/ | grep -E "boston|nyc|california"
# Should be empty!

# Review GSP output
cat output/dossier_restaurant_brookline_ma/traces/01_gsp_output.json | python3 -m json.tool | head -100

# Check query coverage
cat output/dossier_restaurant_brookline_ma/traces/02_query_discovery.json | python3 -m json.tool | grep "total_queries"
```

---

## Testing Methodology

### Unit Tests

```bash
# Run all tests
python3 -m pytest tests/ -v

# Run specific test file
python3 -m pytest tests/test_jurisdiction.py -v

# Run with coverage
python3 -m pytest tests/ --cov=. --cov-report=html
```

### Integration Tests

```bash
# Full pipeline test - Brookline MA
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing

# Verify outputs
ls -la output/dossier_restaurant_brookline_ma/assets/pdfs/ | wc -l  # Should be 20+
ls output/dossier_restaurant_brookline_ma/traces/  # Should have all trace files
```

### Multi-Geography Tests

The system must work for any US location. Test with diverse geographies:

```bash
# Massachusetts (Northeast, Commonwealth)
python3 create_package.py restaurant Brookline MA --pdf-first

# Texas (Southwest, different regulations)
python3 create_package.py restaurant Austin TX --pdf-first

# California (West Coast, strict regulations)
python3 create_package.py restaurant "San Francisco" CA --pdf-first

# Small town (different from major city)
python3 create_package.py restaurant "Greenfield" MA --pdf-first
```

### Regression Testing

After any change, verify:

1. **No fewer PDFs downloaded** than previous version
2. **No wrong-jurisdiction PDFs** introduced
3. **All trace files generated** correctly
4. **No scorer crashes** (especially None handling)

```bash
# Before changes
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing
mv output/dossier_restaurant_brookline_ma output/baseline

# After changes
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing

# Compare
diff <(ls output/baseline/assets/pdfs/) <(ls output/dossier_restaurant_brookline_ma/assets/pdfs/)
```

### Automated Regression (v4.7 - Planned)

The scraped content storage (v4.6.1) enables future automated regression:

```python
# Planned v4.7 auto-regression
def compare_runs(baseline_dir, new_dir):
    """Compare two runs for regression."""
    baseline_index = load_json(baseline_dir / "traces/05_scraped_content_index.json")
    new_index = load_json(new_dir / "traces/05_scraped_content_index.json")
    
    # Compare coverage
    baseline_reqs = set(baseline_index['by_requirement'].keys())
    new_reqs = set(new_index['by_requirement'].keys())
    
    missing = baseline_reqs - new_reqs
    added = new_reqs - baseline_reqs
    
    return {
        'missing_requirements': missing,
        'added_requirements': added,
        'baseline_pdfs': baseline_index['total_pages_scraped'],
        'new_pdfs': new_index['total_pages_scraped']
    }
```

---

## Version History & Evolution

### v1.0 - Initial Prototype
- Basic GSP with simple requirement list
- Single query per requirement
- No scoring, first result wins
- Manual PDF downloads

### v2.0 - Query Expansion
- Multiple queries per requirement
- Basic domain preference (.gov over .com)
- Automated PDF downloads

### v3.0 - Scoring Introduction
- Multi-factor scoring system
- Domain authority scoring
- Title and content matching

### v4.0 - Tracing & Observability
- Full trace file output
- Query-to-PDF traceability
- Debug-friendly JSON output

### v4.5 - PDF-First Pipeline
- Prioritize PDF discovery
- Multiple PDFs per requirement
- Enhanced query templates

### v4.6.0 - Query Discovery Enhancement
- GSP outputs expected_domains
- Domain-specific queries (site: operator)
- 10-16 queries per requirement
- 80% → 100% query execution

### v4.6.1 - PDF Download Fixes (Current)
- Unique PDF filenames (no overwrites)
- Jurisdiction filtering (no wrong cities)
- Scorer None bug fix
- Scraped content storage foundation

### v4.7 - Auto-Regression (Planned)
- Compare runs against baseline
- Detect quality regressions automatically
- Self-improving knowledge base

---

## Known Issues & Technical Debt

### Current Issues

| Issue | Severity | Workaround | Fix Planned |
|-------|----------|------------|-------------|
| Large PDFs slow download | Low | Timeout handling | v4.8 |
| Some .gov redirects fail | Medium | Retry logic | v4.7 |
| Rate limiting on search API | Medium | Delay between requests | v4.7 |

### Technical Debt

1. **Hardcoded timeouts:** Should be configurable
2. **No caching:** Re-fetches same URLs across runs
3. **Synchronous downloads:** Could parallelize
4. **Limited retry logic:** Single attempt per URL
5. **No authentication support:** Can't access gated content

### Refactoring Opportunities

1. **Extract search abstraction:** Currently coupled to specific search API
2. **Plugin architecture for scorers:** Make scoring factors configurable
3. **Async pipeline:** Use asyncio for parallel fetching
4. **Cache layer:** Redis or file-based cache for URLs

---

## Next Steps & Roadmap

### Immediate (v4.6.1 Completion)

- [ ] Verify scraped content storage integration
- [ ] Run multi-geography tests
- [ ] Document any remaining issues

### Short Term (v4.7)

- [ ] **Auto-Regression System**
  - Compare new runs against baseline
  - Detect missing requirements
  - Alert on quality regressions
  
- [ ] **Enhanced GSP**
  - More specific form numbers
  - Better deadline/timeline information
  - Conditional requirement logic

- [ ] **Scorer Improvements**
  - Learn from scraped content
  - Adjust weights based on success rate
  - Handle edge cases better

### Medium Term (v5.0)

- [ ] **Multi-State Support**
  - Business operating in multiple states
  - Federal + multiple state requirements
  
- [ ] **Timeline Generation**
  - Order requirements by dependency
  - Estimate total compliance timeline
  
- [ ] **Cost Estimation**
  - Aggregate all fees
  - Estimate professional service costs

### Long Term (v6.0+)

- [ ] **Continuous Monitoring**
  - Detect regulation changes
  - Alert when renewals due
  
- [ ] **Application Assistance**
  - Pre-fill forms with business data
  - Guide through application process

---

## Appendix: Key Decisions & Their Rationale

### Decision 1: LLM for Requirement Discovery (GSP)

**Alternatives Considered:**
1. Static database of requirements
2. Web scraping of government sites
3. Human curation

**Why LLM:**
- Comprehensive coverage without maintenance
- Handles edge cases and variations
- Can reason about industry-specific requirements
- Easily adaptable to new industries

**Trade-offs:**
- LLM costs per generation
- Potential for hallucination (mitigated by validation)
- Requires good prompt engineering

### Decision 2: Multiple Query Templates

**Alternatives Considered:**
1. Single query per requirement
2. LLM-generated queries
3. User-provided queries

**Why Templates:**
- Consistent, reproducible queries
- Easy to debug and improve
- Low latency (no LLM call)
- Proven patterns from SEO research

**Trade-offs:**
- May miss creative query variations
- Requires manual template updates

### Decision 3: Zero Hardcoding

**Alternatives Considered:**
1. Hardcoded state/city mappings
2. Database of domain patterns
3. External configuration files

**Why Zero Hardcoding:**
- Scales to any location
- No maintenance burden
- LLM knowledge > any static database
- Single code path for all geographies

**Trade-offs:**
- Depends on GSP quality
- Harder to override for known issues
- LLM must provide complete information

### Decision 4: PDF-First Pipeline

**Alternatives Considered:**
1. Scrape all content, extract PDFs later
2. Link aggregation without download
3. API integrations with government systems

**Why PDF-First:**
- PDFs are the actual deliverable
- Reduces noise from HTML pages
- Users need the actual forms
- Verifiable output

**Trade-offs:**
- Miss some HTML-only content
- Large PDF files consume storage
- Some PDFs are scanned (not searchable)

### Decision 5: Comprehensive Tracing

**Alternatives Considered:**
1. Minimal logging
2. Database storage
3. External observability system

**Why JSON Trace Files:**
- Zero external dependencies
- Human-readable debugging
- Version controllable
- Easy to diff between runs

**Trade-offs:**
- Disk space usage
- No real-time monitoring
- Manual analysis required

---

## Contact & Resources

**Primary Repository:** [internal git URL]

**Documentation:**
- This document (system architecture)
- `PROMPT_*.md` files (implementation prompts)
- Trace files (runtime debugging)

**Key Contacts:**
- Architecture questions: [architecture team]
- GSP improvements: [ML team]
- Production issues: [ops team]

---

*This document should be updated with each significant version release. Last updated: v4.6.1*
