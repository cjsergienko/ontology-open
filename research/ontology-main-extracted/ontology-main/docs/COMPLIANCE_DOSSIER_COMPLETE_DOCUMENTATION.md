# Compliance Dossier Generator: Complete Technical & Business Architecture

**Version:** 4.6.1  
**Last Updated:** January 2, 2026  
**Author:** Architecture Team  
**Audience:** Technical leads, architects, senior engineers, and product stakeholders

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Vision & Value Proposition](#business-vision--value-proposition)
3. [The End State: FIL-Powered Compliance Assistant](#the-end-state-fil-powered-compliance-assistant)
4. [Problem Statement](#problem-statement)
5. [The Golden Standard](#the-golden-standard)
6. [System Architecture Overview](#system-architecture-overview)
7. [Core Philosophy: Zero Hardcoding](#core-philosophy-zero-hardcoding)
8. [The GSP (Golden Standard Prompt) & Multi-Persona System](#the-gsp-golden-standard-prompt--multi-persona-system)
9. [Query Discovery Pipeline](#query-discovery-pipeline)
10. [Scoring System](#scoring-system)
11. [PDF Collection & Jurisdiction Filtering](#pdf-collection--jurisdiction-filtering)
12. [Form Instruction Layer (FIL)](#form-instruction-layer-fil)
13. [Requirement Types & Taxonomy](#requirement-types--taxonomy)
14. [Tracing & Observability](#tracing--observability)
15. [Scraped Content Storage & Auto-Regression](#scraped-content-storage--auto-regression)
16. [RAG Integration Architecture](#rag-integration-architecture)
17. [Code Organization & Navigation](#code-organization--navigation)
18. [How to Use the System](#how-to-use-the-system)
19. [Testing Methodology](#testing-methodology)
20. [Parallelization & Performance Optimization](#parallelization--performance-optimization)
21. [Version History & Evolution](#version-history--evolution)
22. [Known Issues & Technical Debt](#known-issues--technical-debt)
23. [Roadmap & Next Steps](#roadmap--next-steps)
24. [Appendix: Key Decisions & Their Rationale](#appendix-key-decisions--their-rationale)

---

## Executive Summary

The Compliance Dossier Generator is an AI-powered system that automatically generates comprehensive regulatory compliance packages for businesses. Given an industry and location, the system identifies all permits, licenses, and regulatory requirements, discovers the actual forms and documents, and packages everything into an actionable dossier.

**Current Performance (v4.6.1):**
- 40+ requirements identified per business type
- 10-16 search queries generated per requirement
- 22+ relevant PDFs downloaded per dossier
- 5 specialized AI personas for comprehensive requirement discovery
- Full traceability from requirement → query → search result → PDF

**The Ultimate Vision:** A business owner interacts with a chat assistant powered by Form Instruction Layers (FILs). The assistant guides them through completing every requirement, filling forms, tracking deadlines, and maintaining ongoing compliance—reducing the compliance burden to near zero.

---

## Business Vision & Value Proposition

### The Opportunity

Starting a business in the US requires navigating a complex maze of regulatory requirements:

- **40+ permits/licenses** for a typical restaurant
- **3 levels of government** (federal, state, local)
- **$5,000-$15,000** in professional fees if hiring consultants
- **3-6 months** of research and waiting if doing it yourself
- **High failure rate** due to missed requirements or delays

**Market Size:**
- ~600,000 new businesses start in the US annually
- Average compliance cost: $3,000-$10,000 per business
- Total addressable market: $3-6 billion annually

### Our Value Proposition

**One command generates a complete compliance package for any business in any US location.**

```bash
python3 create_package.py restaurant "Brookline" "MA"
# Output: Complete dossier with all forms, instructions, deadlines, and next steps
```

**Cost comparison:**
- Hiring a compliance consultant: $5,000-$15,000
- DIY research: 40-100 hours of work
- Our system: Automated, comprehensive, $50-200 per package

### The AI SaaS Factory Strategy

This compliance dossier generator is one component of a larger "AI SaaS Factory" strategy—building multiple AI-powered vertical SaaS products using a common infrastructure. The patterns, architecture, and learnings from this project apply to:

- Email template generation (Monte Carlo optimization)
- Document processing and extraction
- Regulatory monitoring and alerting
- Form auto-fill and submission

---

## The End State: FIL-Powered Compliance Assistant

### Vision: Zero-Effort Compliance

The ultimate goal is not just to generate a list of requirements—it's to **guide the business owner through completing every requirement** and **maintain their compliance over time**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FIL-POWERED COMPLIANCE ASSISTANT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Business Owner: "I want to open a restaurant in Brookline, MA"            │
│                                                                             │
│  Assistant: "I'll help you become fully compliant. Based on your business, │
│  you need 42 permits and licenses. Let's start with the federal            │
│  requirements since they're universal.                                      │
│                                                                             │
│  First, you need an EIN (Employer Identification Number).                  │
│  [Shows FIL for Form SS-4]                                                 │
│                                                                             │
│  I can help you fill this out. What's your LLC's legal name?"              │
│                                                                             │
│  ... [guided conversation through all 42 requirements] ...                 │
│                                                                             │
│  Assistant: "Congratulations! You're now fully compliant. I'll remind you  │
│  when renewals are due. Your Common Victualler license renews on           │
│  November 30th each year."                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### How FILs Enable This

A **Form Instruction Layer (FIL)** is a structured document that contains everything needed to complete a specific requirement:

```yaml
FIL: ma_food_establishment_permit
  metadata:
    requirement_name: "Food Establishment Permit"
    authority: "Massachusetts Department of Public Health"
    authority_level: state
    estimated_time: "2-4 weeks"
    fee: "$150-$500"
    renewal: "Annual"
    
  prerequisites:
    - federal_ein          # Must have EIN first
    - ma_business_registration
    - brookline_building_permit
    
  form_details:
    form_name: "Food Establishment License Application"
    form_url: "https://mass.gov/doc/food-establishment-application"
    filing_method: ["online", "mail"]
    
  fields:
    - name: "Business Legal Name"
      type: text
      required: true
      source: "from EIN application"
      
    - name: "FEIN"
      type: text
      required: true
      source: "federal_ein.result"
      
    - name: "Type of Food Service"
      type: select
      options: ["Full Service Restaurant", "Limited Service", "Catering"]
      
  instructions:
    step_1: "Ensure you have your EIN (from federal_ein requirement)"
    step_2: "Complete food safety manager certification"
    step_3: "Submit application with $150 fee"
    step_4: "Schedule inspection"
    
  chat_guidance:
    prompts:
      - "What type of food service will you provide?"
      - "Do you have your EIN number ready?"
      - "Have you completed the ServSafe certification?"
    validation:
      - "Verify FEIN matches IRS records"
      - "Check business name matches state registration"
```

### RAG-Powered Chat Architecture

The chat assistant uses **Retrieval Augmented Generation (RAG)** with the GSP JSON and FILs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RAG CHAT ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Query: "What do I need to do next?"                                  │
│                                                                             │
│  ┌─────────────────┐     ┌──────────────────────┐                          │
│  │  Query Encoder  │────▶│  Vector Search       │                          │
│  └─────────────────┘     │  (GSP + FILs + PDFs) │                          │
│                          └──────────────────────┘                          │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Retrieved Context:                                                   │  │
│  │  - Current progress: 12/42 requirements complete                     │  │
│  │  - Next requirement: ma_food_establishment_permit                    │  │
│  │  - FIL for food permit (prerequisites, fields, instructions)        │  │
│  │  - User's saved data (business name, EIN, etc.)                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LLM generates personalized response using context                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Assistant: "Based on your progress, the next step is obtaining your       │
│  Food Establishment Permit from the MA Department of Public Health.        │
│  You've already completed the prerequisites (EIN, business registration).  │
│  Would you like me to walk you through the application?"                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Ongoing Compliance Maintenance

Once initial compliance is achieved, the system becomes a **compliance maintenance platform**:

1. **Renewal Tracking:** Alerts before licenses expire
2. **Regulatory Updates:** Monitors for new requirements
3. **Document Storage:** Secure storage of all permits and licenses
4. **Audit Preparation:** Generate compliance reports on demand

**The Result:** Business owners go through the compliance process once, then the system maintains their compliance with near-zero effort.

---

## Problem Statement

### The Compliance Maze

Starting a business in the US requires navigating requirements from three levels of government:

**Federal (15+ requirements):**
- IRS: EIN (Form SS-4), tax registrations
- USCIS: Employment eligibility (Form I-9)
- DOL: Minimum wage poster, FMLA poster, FLSA compliance
- OSHA: Workplace safety posters, OSHA 300 log
- ADA: Accessibility compliance
- EEOC: Anti-discrimination posters
- FDA: Food Code compliance (for restaurants)
- EPA: Environmental compliance

**State (10-15+ requirements vary by state):**
- Secretary of State: Business registration, DBA
- Department of Revenue: Tax registrations, withholding
- Department of Public Health: Food permits, health certifications
- Department of Industrial Accidents: Workers' compensation
- Alcoholic Beverages Control: Liquor licenses
- State-specific posters and certifications

**Local (15-20+ requirements vary by city):**
- Building Department: Permits, Certificate of Occupancy
- Health Department: Food establishment permits, inspections
- Fire Department: Fire permits, suppression certificates
- Licensing Board: Business licenses (Common Victualler, entertainment)
- Zoning/Planning: Zoning compliance, variances
- Public Works: Grease trap, waste permits

### Why Current Solutions Fail

**Lawyers/Consultants:** Expensive ($5,000-$15,000), often incomplete, don't provide ongoing maintenance

**DIY Research:** Time-consuming (40-100 hours), easy to miss requirements, no validation

**Existing Software:** 
- Most focus on business formation only (not full compliance)
- None handle local requirements comprehensively
- No geographic flexibility (hardcoded for specific cities)

### Our Approach

**AI-First Discovery:** Use LLMs to identify requirements dynamically for any location
**Zero Hardcoding:** No location-specific code—works for any US city/state
**Document-Centric:** Focus on finding the actual forms and PDFs, not just listing requirements
**FIL Generation:** Create structured instructions that enable chat-based guidance
**Continuous Improvement:** Store all scraped data for future refinement

---

## The Golden Standard

### What Perfect Looks Like

For a restaurant in Brookline, MA, the golden standard includes approximately 42 requirements:

**Federal (15):**
- EIN (Form SS-4)
- Form I-9 Employment Eligibility
- Form W-4 (for each employee)
- OSHA Form 300/300A
- Federal Minimum Wage Poster
- EEOC Poster
- FMLA Poster
- USERRA Poster
- EPPA Poster
- OSHA Job Safety Poster
- ADA Compliance
- FDA Food Code Compliance
- E-Verify (if required)
- FLSA Compliance
- COBRA Notice (if 20+ employees)

**Massachusetts State (12):**
- Business Registration (LLC/Corp)
- Certificate of Good Standing
- DBA Certificate (if applicable)
- Sales Tax Registration
- Meals Tax Registration
- Withholding Tax Registration
- Workers' Compensation Affidavit
- Unemployment Insurance Registration
- Paid Family Medical Leave Registration
- Food Manager Certification (ServSafe)
- Food Allergen Awareness Poster
- MA Labor Law Posters

**Brookline Local (15):**
- Common Victualler License
- Food Establishment Permit
- Building Permit
- Certificate of Occupancy
- Fire Department Inspection
- Health Department Inspection
- Sign Permit (if applicable)
- Grease Trap Permit
- Dumpster Permit
- Electrical Permit
- Plumbing Permit
- Gas Permit
- Hood/Ventilation Permit
- Assembly Permit (if seating > threshold)
- Entertainment License (if applicable)

### Measuring Success

| Metric | Target | Current (v4.6.1) |
|--------|--------|------------------|
| Requirements identified | 40+ | 42 |
| Federal requirements | 15+ | 15 |
| State requirements | 10+ | 12 |
| Local requirements | 12+ | 15 |
| PDFs downloaded | 80%+ | 85% |
| Correct jurisdiction | 100% | 100% |
| Wrong jurisdiction PDFs | 0 | 0 |

---

## System Architecture Overview

### High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLIANCE DOSSIER PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT: industry="restaurant", city="Brookline", state="MA"                │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 1: GSP - Multi-Persona Requirement Discovery                   │  │
│  │                                                                       │  │
│  │  5 AI Personas run in parallel:                                      │  │
│  │  ├─ Business Owner (experienced in {city}, {state})                 │  │
│  │  ├─ Compliance Lawyer (specializing in {state} law)                 │  │
│  │  ├─ Federal Inspector (IRS, USCIS, DOL, OSHA, FDA, EPA)            │  │
│  │  ├─ State Inspector ({state} agencies)                              │  │
│  │  └─ Local Inspector ({city} departments) ← MOST IMPORTANT           │  │
│  │                                                                       │  │
│  │  Output: 40-50 unique requirements with expected_domains             │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 2: Query Discovery                                             │  │
│  │                                                                       │  │
│  │  For each requirement, generate 10-16 search queries using:         │  │
│  │  ├─ Template Set 1: Official form queries                           │  │
│  │  ├─ Template Set 2: Location-specific queries                       │  │
│  │  ├─ Template Set 3: Authority-based queries                         │  │
│  │  ├─ Template Set 4: Long-tail variations                            │  │
│  │  ├─ Template Set 5: Domain-specific (site:mass.gov)                 │  │
│  │  └─ Template Set 6: Simple queries (just the name)                  │  │
│  │                                                                       │  │
│  │  Output: 400-600 search queries total                                │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 3: Search Execution                                            │  │
│  │                                                                       │  │
│  │  Execute queries against search API                                  │  │
│  │  Collect URLs, titles, snippets                                      │  │
│  │  Deduplicate results                                                 │  │
│  │                                                                       │  │
│  │  Output: 2,000-5,000 candidate URLs                                  │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 4: Scoring & Ranking                                           │  │
│  │                                                                       │  │
│  │  Score each candidate:                                               │  │
│  │  ├─ Domain authority (30%): .gov preferred                          │  │
│  │  ├─ Title match (25%): Contains requirement name                    │  │
│  │  ├─ Content relevance (20%): Snippet analysis                       │  │
│  │  ├─ Document type (15%): PDF preferred                              │  │
│  │  └─ Jurisdiction (10%): Correct city/state                          │  │
│  │                                                                       │  │
│  │  Output: Ranked candidates per requirement                           │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 5: PDF Collection                                              │  │
│  │                                                                       │  │
│  │  For each requirement:                                               │  │
│  │  ├─ Select top-ranked PDF candidates                                │  │
│  │  ├─ Validate jurisdiction (using expected_domains from GSP)         │  │
│  │  ├─ Download with unique filenames                                  │  │
│  │  └─ Store scraped content for future use                            │  │
│  │                                                                       │  │
│  │  Output: 30-50 PDFs in assets/pdfs/                                  │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 6: FIL Generation (Future)                                     │  │
│  │                                                                       │  │
│  │  For each requirement:                                               │  │
│  │  ├─ Analyze PDF structure and fields                                │  │
│  │  ├─ Extract instructions and guidance                               │  │
│  │  ├─ Identify prerequisites and dependencies                         │  │
│  │  ├─ Generate structured FIL document                                │  │
│  │  └─ Create chat prompts and validation rules                        │  │
│  │                                                                       │  │
│  │  Output: FIL YAML/JSON for each requirement                          │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 7: Dossier Assembly                                            │  │
│  │                                                                       │  │
│  │  Generate final package:                                             │  │
│  │  ├─ README with overview                                            │  │
│  │  ├─ Requirement index                                               │  │
│  │  ├─ Individual requirement pages                                    │  │
│  │  ├─ PDFs in assets/                                                 │  │
│  │  ├─ Trace files for debugging                                       │  │
│  │  └─ GSP JSON for RAG                                                │  │
│  │                                                                       │  │
│  │  Output: Complete dossier directory                                  │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  OUTPUT: output/dossier_{industry}_{city}_{state}/                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Philosophy: Zero Hardcoding

### The Principle

**No location-specific logic exists in the codebase.**

The system works for any US city and state without code changes. All location-specific knowledge comes from the LLM (GSP), not from hardcoded lists.

### Why This Is Critical

**The Scale Problem:**
- 50 states, each with unique regulations
- 19,000+ incorporated cities in the US
- Regulations change frequently
- Impossible to maintain hardcoded mappings

**The Solution:**
The GSP outputs `expected_domains` for each requirement. Downstream components use this information directly.

```json
{
  "requirement_id": "ma_food_establishment_permit",
  "authority_level": "state",
  "expected_domains": ["mass.gov", "state.ma.us"],
  "issuing_authority": "Massachusetts Department of Public Health"
}
```

### Implementation Pattern

**Anti-Pattern (Hardcoded):**
```python
# DON'T DO THIS
STATE_DOMAINS = {
    'MA': ['mass.gov', 'state.ma.us'],
    'CA': ['ca.gov', 'state.ca.us'],
    'TX': ['texas.gov', 'state.tx.us'],
    # ... 47 more states - unmaintainable!
}
```

**Correct Pattern (Zero Hardcoding):**
```python
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

### Benefits

1. **Instant support for any geography** - no code changes needed
2. **LLM knowledge > static database** - LLMs know about recent changes
3. **Single code path** - simpler to test and maintain
4. **Self-correcting** - better GSP prompts improve all locations

---

## The GSP (Golden Standard Prompt) & Multi-Persona System

### Evolution of the GSP

The GSP started as a single prompt asking for "all requirements." Over time, we discovered that a single perspective misses important requirements. The solution: **multiple AI personas** that each approach the problem from a different angle.

**Version History:**
- v1.0: Single generic prompt → missed 20%+ of requirements
- v2.0: 3 personas (owner, lawyer, inspector) → better but still gaps
- v3.0: 5 personas with specialized inspectors → 40+ requirements, near-complete coverage

### The 5-Persona System

```python
PERSPECTIVES = [
    {
        "id": "business_owner",
        "name": "Experienced Restaurant Owner in {city}, {state}",
        "focus": "Practical experience - what did I actually need?"
    },
    {
        "id": "compliance_lawyer",
        "name": "Compliance Attorney specializing in {state} restaurant law",
        "focus": "Legal requirements - what could get us in trouble?"
    },
    {
        "id": "federal_inspector",
        "name": "Federal Compliance Inspector (IRS, USCIS, DOL, OSHA, FDA, EPA)",
        "focus": "Federal requirements - universal across all US businesses"
    },
    {
        "id": "state_inspector",
        "name": "{state} State Compliance Inspector",
        "focus": "State-level requirements - specific to this state"
    },
    {
        "id": "local_inspector",
        "name": "{city} Local Government Inspector",
        "focus": "Local requirements - MOST IMPORTANT, city-specific forms"
    }
]
```

### Why Multiple Personas Work

Each persona has different **blind spots** and **areas of expertise**:

| Persona | Strengths | Blind Spots |
|---------|-----------|-------------|
| Business Owner | Practical, real-world experience | May forget about posters, may not know all legal requirements |
| Compliance Lawyer | Legal completeness, liability awareness | May not know local procedural details |
| Federal Inspector | Comprehensive federal knowledge | Doesn't know state/local requirements |
| State Inspector | State agency expertise | Doesn't know federal or local |
| Local Inspector | **City-specific forms and procedures** | Doesn't know federal/state |

The **Local Inspector** is most important because local requirements are hardest to discover—they're often buried in municipal websites (DocumentCenter, Accela, etc.).

### Thinking Prompts

We use "thinking" language in all persona prompts to encourage thoroughness:

```
Think carefully and comprehensively about EVERY document you needed.
Take your time.
Do not guess - only include requirements you are certain about.
Be thorough. More requirements are better than fewer.
Check your list multiple times to ensure nothing is missing.
```

This increases token usage but dramatically improves completeness.

### GSP Output Schema

```json
{
  "metadata": {
    "generated_at": "2026-01-02T03:00:00Z",
    "business_type": "restaurant",
    "city": "Brookline",
    "state": "MA",
    "gsp_mode": "multi_perspective"
  },
  "perspectives": {
    "business_owner": [...],
    "compliance_lawyer": [...],
    "federal_inspector": [...],
    "state_inspector": [...],
    "local_inspector": [...]
  },
  "merge_process": {
    "total_before_merge": 58,
    "duplicates_removed": ["ein_duplicate", ...],
    "final_count": 42
  },
  "final_requirements": [
    {
      "id": "federal_ein",
      "name": "Employer Identification Number (EIN)",
      "authority_level": "federal",
      "expected_domains": ["irs.gov"],
      "likely_document_types": ["form", "application"],
      "form_number": "SS-4",
      "issuing_authority": "Internal Revenue Service",
      "source_personas": ["business_owner", "compliance_lawyer", "federal_inspector"]
    },
    // ... 41 more requirements
  ]
}
```

### Extensibility: Adding New Personas

The persona system is designed to be extensible. Future personas might include:

- **Insurance Agent:** Knows about required insurance coverages
- **Real Estate Attorney:** Knows about lease compliance requirements
- **Health Inspector:** Deep knowledge of food safety requirements
- **Accessibility Consultant:** ADA compliance details

Adding a persona is straightforward:
1. Define the persona in the PERSPECTIVES list
2. Write a comprehensive prompt
3. Run the pipeline—the merge logic handles deduplication

---

## Query Discovery Pipeline

### The Challenge

Given a requirement like "Massachusetts Food Establishment Permit," we need to find the actual PDF form on the internet. This requires generating effective search queries.

### 6 Template Sets

**Template Set 1: Official Form Queries**
```
"{requirement_name}" official form PDF
"{requirement_name}" application form filetype:pdf
{form_number} {issuing_authority} PDF
```
*Purpose: Find official forms by name*

**Template Set 2: Location-Specific Queries**
```
{city} {state} {requirement_name} application
{state} {requirement_name} permit form
{city} {requirement_name} requirements
```
*Purpose: Add geographic context*

**Template Set 3: Authority-Based Queries**
```
{issuing_authority} {requirement_name} form
{issuing_authority} application PDF
```
*Purpose: Search the issuing authority directly*

**Template Set 4: Long-Tail Variations**
```
how to apply for {requirement_name} in {city}
{requirement_name} application process {state}
{requirement_name} checklist {city} {state}
```
*Purpose: Find instructional pages that link to forms*

**Template Set 5: Domain-Specific Queries (v4.6+)**
```
site:{expected_domain} {requirement_name}
site:{expected_domain} {form_number} application
```
*Purpose: Search directly on authoritative domains*

**Template Set 6: Simple Queries (v4.6+)**
```
{requirement_name}
{form_number}
{requirement_name} {state}
```
*Purpose: Broad discovery, sometimes simplest query works best*

### Why 10-16 Queries Per Requirement?

Through extensive testing:
- **< 5 queries:** Miss ~30% of findable documents
- **5-10 queries:** Miss ~15% of findable documents
- **10-16 queries:** Miss ~5% of findable documents
- **> 16 queries:** Diminishing returns, higher API costs

The domain-specific queries (Template Set 5) were a breakthrough—they improved precision by 40% by focusing on authoritative .gov sources.

---

## Scoring System

### Multi-Factor Scoring

Each candidate URL is scored across 5 dimensions:

| Factor | Weight | Description |
|--------|--------|-------------|
| Domain Authority | 30% | Is this a .gov domain? Is it the expected domain? |
| Title Match | 25% | Does the title contain the requirement name or form number? |
| Content Relevance | 20% | Does the snippet mention relevant terms? |
| Document Type | 15% | Is this a PDF? Is it downloadable? |
| Jurisdiction Match | 10% | Is this for the correct city/state? |

### Domain Authority Scoring

```python
def score_domain_authority(url: str, requirement: dict) -> float:
    domain = extract_domain(url).lower()
    expected = requirement.get('expected_domains', [])
    
    # Exact match to expected domain from GSP
    if any(exp in domain for exp in expected):
        return 1.0
    
    # Federal .gov for federal requirements
    if requirement['authority_level'] == 'federal' and domain.endswith('.gov'):
        return 0.9
    
    # Any .gov domain
    if domain.endswith('.gov'):
        return 0.7
    
    # Educational or nonprofit
    if domain.endswith('.edu') or domain.endswith('.org'):
        return 0.4
    
    # Commercial
    return 0.2
```

### Handling Edge Cases

**None Scores (v4.6.1 fix):**
```python
def safe_score(candidate) -> float:
    """Handle None scores gracefully."""
    if candidate.score is None:
        return float('-inf')
    return candidate.score

ranked = sorted(candidates, key=safe_score, reverse=True)
```

---

## PDF Collection & Jurisdiction Filtering

### The Problems We Solved

**Problem 1: PDF Overwriting**
- Multiple PDFs for same requirement used identical filenames
- 22 PDFs downloaded → only 12 in directory (10 lost!)

**Solution:** Unique filenames
```python
filename = f"{requirement_id}_{index:02d}_{domain_slug}.pdf"
# Example: federal_ein_01_irs_gov.pdf, federal_ein_02_irs_gov.pdf
```

**Problem 2: Wrong Jurisdiction**
- Boston, NYC, California PDFs appeared in Brookline, MA package
- 19 wrong-jurisdiction PDFs in one test run

**Solution:** Jurisdiction filter using GSP expected_domains
```python
def is_valid_jurisdiction(url: str, requirement: dict) -> bool:
    domain = extract_domain(url).lower()
    expected = requirement.get('expected_domains', [])
    authority = requirement.get('authority_level', '')
    
    # Federal: any .gov is OK
    if authority == 'federal':
        return domain.endswith('.gov')
    
    # State/Local: must match expected domains
    return any(exp.lower() in domain for exp in expected)
```

---

## Form Instruction Layer (FIL)

### What is a FIL?

A **Form Instruction Layer** is a structured document that contains everything needed to complete a specific regulatory requirement. FILs bridge the gap between "here's a PDF" and "here's how to fill it out."

### FIL Structure

```yaml
fil_version: "1.0"
requirement_id: ma_food_establishment_permit

metadata:
  name: "Massachusetts Food Establishment Permit"
  authority: "Massachusetts Department of Public Health"
  authority_level: state
  document_type: permit      # form | permit | license | registration | poster | process
  estimated_time: "2-4 weeks"
  fee_range: "$150-$500"
  renewal_period: "Annual"
  renewal_month: 12

prerequisites:
  required:
    - federal_ein
    - ma_business_registration
  recommended:
    - ma_servsafe_certification

documents:
  primary_form:
    name: "Food Establishment License Application"
    url: "https://mass.gov/doc/food-establishment-application"
    pages: 4
    filing_methods:
      - online
      - mail
  supplementary:
    - name: "Fee Schedule"
      url: "https://mass.gov/doc/food-permit-fees"
    - name: "Inspection Checklist"
      url: "https://mass.gov/doc/food-inspection-checklist"

form_fields:
  - section: "Business Information"
    fields:
      - name: "Legal Business Name"
        type: text
        required: true
        max_length: 100
        auto_fill_from: federal_ein.business_name
        
      - name: "Federal EIN"
        type: text
        required: true
        format: "XX-XXXXXXX"
        auto_fill_from: federal_ein.ein_number
        
      - name: "Type of Food Establishment"
        type: select
        required: true
        options:
          - "Full Service Restaurant"
          - "Limited Service Restaurant"
          - "Caterer"
          - "Food Truck"
          
  - section: "Owner Information"
    fields:
      - name: "Owner Name"
        type: text
        required: true
        
      - name: "Owner Date of Birth"
        type: date
        required: true
        note: "Required for background check"

instructions:
  overview: |
    This permit is required for any establishment that prepares, serves, 
    or sells food to the public in Massachusetts.
    
  steps:
    - step: 1
      action: "Verify prerequisites"
      details: "Ensure you have your EIN and business registration complete."
      estimated_time: "N/A if already complete"
      
    - step: 2
      action: "Complete food safety certification"
      details: "At least one manager must have ServSafe or equivalent certification."
      estimated_time: "1-2 days for online course"
      
    - step: 3
      action: "Submit application"
      details: "Complete the application form and submit with fee."
      estimated_time: "30 minutes"
      
    - step: 4
      action: "Schedule inspection"
      details: "The health department will contact you to schedule a pre-opening inspection."
      estimated_time: "1-3 weeks wait"
      
    - step: 5
      action: "Pass inspection"
      details: "Inspector will verify compliance with food safety regulations."
      estimated_time: "2-4 hours"

chat_integration:
  welcome_message: |
    Let's get your Food Establishment Permit. This is required before you 
    can serve food to the public.
    
  conversation_flow:
    - prompt: "Do you already have your federal EIN?"
      if_yes: "Great! I'll use that information for this application."
      if_no: "We'll need to complete that first. Let me guide you through it."
      
    - prompt: "What type of food establishment are you opening?"
      store_as: establishment_type
      
    - prompt: "Has anyone on your team completed ServSafe certification?"
      if_no: "You'll need at least one certified food manager. I can provide information on how to get certified."
      
  validation_rules:
    - field: ein_number
      rule: "Must match IRS records"
      
    - field: business_name
      rule: "Must match state registration"

common_issues:
  - issue: "Application rejected for missing certification"
    solution: "Complete ServSafe before applying"
    
  - issue: "Failed first inspection"
    solution: "Review checklist, address issues, request re-inspection"
```

### Document Types

Requirements come in several forms:

| Type | Description | Example |
|------|-------------|---------|
| **Form** | Fillable document to submit | Form SS-4, Application for EIN |
| **Permit** | Authorization issued after application | Food Establishment Permit |
| **License** | Ongoing authorization, often with renewal | Common Victualler License |
| **Registration** | One-time or periodic registration | Sales Tax Registration |
| **Poster** | Required workplace display | Federal Minimum Wage Poster |
| **Certificate** | Proof of training or compliance | ServSafe Certificate |
| **Process** | No form—online portal or in-person | Online business registration |

### FIL Generation Pipeline (Future)

```
PDF Document
     │
     ▼
┌─────────────────┐
│  PDF Analysis   │  ← Extract text, identify fields, detect form structure
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  LLM Analysis   │  ← Understand purpose, identify prerequisites, extract instructions
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  FIL Generation │  ← Create structured YAML/JSON
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Validation     │  ← Verify completeness, check for errors
└─────────────────┘
     │
     ▼
FIL Document
```

---

## Tracing & Observability

### Philosophy

**Every decision the system makes must be traceable.**

When debugging why a PDF wasn't found, we need to trace:
1. Was the requirement generated by GSP?
2. Were queries generated for it?
3. Were search results returned?
4. How were results scored?
5. Why was/wasn't this PDF selected?

### Trace Files

```
output/dossier_restaurant_brookline_ma/
├── traces/
│   ├── 01_gsp_requirements.json     # All requirements from GSP
│   ├── 02_search_queries.json       # All generated queries
│   ├── 03_raw_candidates.json       # All search results
│   ├── 04_scorer_decisions.json     # Score breakdown per candidate
│   ├── 05_pdf_downloads.json        # Download outcomes
│   └── 05_scraped_content_index.json # Index of all scraped content
```

### Using Traces for Debugging

**Scenario: Missing PDF for food permit**

1. Check `01_gsp_requirements.json`:
   - Is `ma_food_establishment_permit` in the list?
   - Are `expected_domains` populated correctly?

2. Check `02_search_queries.json`:
   - Were queries generated for this requirement?
   - Do queries include `site:mass.gov`?

3. Check `03_raw_candidates.json`:
   - Did search return the correct URL?
   - If not, queries need improvement

4. Check `04_scorer_decisions.json`:
   - Was the correct URL scored?
   - What score did it receive?
   - Was it ranked high enough?

5. Check `05_pdf_downloads.json`:
   - Was download attempted?
   - Did it succeed or fail?
   - Was it filtered by jurisdiction?

---

## Scraped Content Storage & Auto-Regression

### Why Store Scraped Content?

Every time we scrape a government website, we're capturing valuable data:
- The current state of regulations
- The current forms and their locations
- Content that can train future improvements

**Two key uses:**
1. **Auto-Regression:** Compare new runs against historical data to detect quality regressions
2. **Knowledge Base:** Build a corpus for RAG and future model training

### Storage Structure

```
assets/scraped/
├── content_0001_a3f2b1c4.json
├── content_0002_b4c3d2e1.json
└── ...

traces/05_scraped_content_index.json
```

### Content File Schema

```json
{
  "id": "content_0001",
  "url": "https://mass.gov/info-details/food-establishment-permits",
  "url_hash": "a3f2b1c4",
  "fetched_at": "2026-01-02T03:30:00Z",
  "requirement_id": "ma_food_establishment_permit",
  "search_query": "Massachusetts food establishment permit application",
  "http_status": 200,
  "content_type": "text/html",
  "raw_html": "<html>...</html>",
  "extracted_text": "Food Establishment Permits. The Massachusetts...",
  "extracted_links": [
    {"text": "Application Form", "href": "/doc/food-permit-app.pdf"},
    {"text": "Fee Schedule", "href": "/info-details/permit-fees"}
  ],
  "metadata": {
    "title": "Food Establishment Permits | Mass.gov",
    "content_length": 45230
  }
}
```

### Auto-Regression System (v4.7)

```python
def compare_runs(baseline_dir: Path, new_dir: Path) -> RegressionReport:
    """Compare new run against baseline to detect regressions."""
    
    baseline_gsp = load_json(baseline_dir / "traces/01_gsp_requirements.json")
    new_gsp = load_json(new_dir / "traces/01_gsp_requirements.json")
    
    baseline_reqs = {r['id'] for r in baseline_gsp['final_requirements']}
    new_reqs = {r['id'] for r in new_gsp['final_requirements']}
    
    return RegressionReport(
        missing_requirements=baseline_reqs - new_reqs,  # REGRESSION!
        added_requirements=new_reqs - baseline_reqs,    # Improvement
        baseline_pdf_count=count_pdfs(baseline_dir),
        new_pdf_count=count_pdfs(new_dir),
        # ... more metrics
    )
```

---

## RAG Integration Architecture

### Overview

The RAG (Retrieval Augmented Generation) system enables the chat assistant to answer questions about compliance by retrieving relevant context from:
- GSP requirements JSON
- FIL documents
- Scraped content
- Downloaded PDFs

### Vector Store Structure

```python
# Documents indexed in vector store
DOCUMENT_TYPES = [
    "gsp_requirement",      # Individual requirements from GSP
    "fil_document",         # Complete FIL documents
    "scraped_content",      # Web pages we've scraped
    "pdf_content",          # Extracted PDF text
    "user_progress",        # User's completion status
]
```

### Query Flow

```
User: "What permits do I need for food service?"
           │
           ▼
    ┌─────────────────┐
    │  Query Encoder  │
    └─────────────────┘
           │
           ▼
    ┌─────────────────┐
    │  Vector Search  │  → Finds: food_establishment_permit, servsafe, health_inspection
    └─────────────────┘
           │
           ▼
    ┌─────────────────┐
    │  Context Build  │  → Combines requirement details, FILs, user progress
    └─────────────────┘
           │
           ▼
    ┌─────────────────┐
    │  LLM Response   │  → Generates personalized answer with context
    └─────────────────┘
           │
           ▼
    "For food service in Brookline, MA, you'll need:
     1. Food Establishment Permit (state - you haven't started this)
     2. ServSafe Certification (prerequisite - required before permit)
     3. Health Department Inspection (local - after permit approved)
     
     Would you like to start with the ServSafe certification?"
```

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
│   ├── multi_perspective.py       # 5-persona system
│   └── schemas.py                 # Output validation schemas
├── discovery/
│   ├── query_generator.py         # Query template engine
│   ├── query_expander.py          # Domain-specific query expansion
│   ├── search_executor.py         # Search API integration
│   └── pdf_first_pipeline.py      # Main discovery orchestrator
├── collectors/
│   ├── pdf_collector.py           # PDF download & jurisdiction filter
│   └── web_scraper.py             # HTML content extraction
├── scoring/
│   ├── scorer.py                  # Main scoring orchestrator
│   ├── domain_scorer.py           # Domain authority scoring
│   ├── relevance_scorer.py        # Content relevance scoring
│   └── jurisdiction_scorer.py     # Jurisdiction validation
├── utils/
│   ├── jurisdiction.py            # Zero-hardcoding jurisdiction utilities
│   └── text_processing.py         # Text extraction utilities
├── tracing/
│   ├── trace_logger.py            # Trace file writer
│   └── content_storage.py         # Scraped content storage
├── fil/
│   ├── generator.py               # FIL generation (future)
│   └── templates/                 # FIL templates
├── assembly/
│   ├── dossier_builder.py         # Final package assembly
│   └── templates/                 # Markdown templates
├── tests/
│   ├── test_gsp.py
│   ├── test_queries.py
│   ├── test_scoring.py
│   ├── test_jurisdiction.py
│   └── test_end_to_end.py
└── output/                        # Generated dossiers
```

### Key Files for New Developers

| File | Purpose | Start Here If... |
|------|---------|------------------|
| `create_package.py` | Main entry point | Understanding the overall flow |
| `gsp/multi_perspective.py` | 5-persona GSP | Working on requirement discovery |
| `discovery/query_generator.py` | Query templates | Improving search coverage |
| `scoring/scorer.py` | Ranking logic | Documents aren't being selected correctly |
| `collectors/pdf_collector.py` | PDF downloads | PDF issues |
| `utils/jurisdiction.py` | Jurisdiction filtering | Wrong geography PDFs |
| `tracing/trace_logger.py` | Debug output | Adding observability |

---

## How to Use the System

### Basic Usage

```bash
# Generate a compliance package
python3 create_package.py restaurant Brookline MA

# With all features enabled
python3 create_package.py restaurant Brookline MA \
    --pdf-first \
    --planning-mode multi_perspective \
    --enable-tracing

# Different geography
python3 create_package.py restaurant Austin TX --pdf-first --enable-tracing

# Different industry
python3 create_package.py "hair salon" "San Francisco" CA --pdf-first --enable-tracing
```

### Command Line Options

| Option | Description |
|--------|-------------|
| `--pdf-first` | Use PDF-first discovery pipeline |
| `--planning-mode multi_perspective` | Use 5-persona GSP |
| `--enable-tracing` | Generate trace files for debugging |
| `--real-search` | Use real search API (vs mock for testing) |
| `--output-dir DIR` | Custom output directory |

### Output Structure

```
output/dossier_restaurant_brookline_ma/
├── README.md                      # Overview and next steps
├── index.md                       # Requirement index by category
├── requirements/
│   ├── federal_ein.md            # Individual requirement pages
│   ├── federal_i9.md
│   ├── ma_food_permit.md
│   └── ...
├── assets/
│   ├── pdfs/                     # Downloaded PDF forms
│   │   ├── federal_ein_01_irs_gov.pdf
│   │   └── ...
│   └── scraped/                  # Scraped web content
│       ├── content_0001_a3f2b1c4.json
│       └── ...
├── traces/                       # Debug/trace files
│   ├── 01_gsp_requirements.json
│   ├── 02_search_queries.json
│   ├── 03_raw_candidates.json
│   ├── 04_scorer_decisions.json
│   └── 05_pdf_downloads.json
└── fils/                         # Form Instruction Layers (future)
    └── ...
```

---

## Testing Methodology

### Test Pyramid

```
                    ┌─────────────┐
                    │   E2E       │  ← Full pipeline tests (slow, comprehensive)
                    │   Tests     │
                    └─────────────┘
               ┌─────────────────────┐
               │   Integration       │  ← Component interaction tests
               │   Tests             │
               └─────────────────────┘
          ┌─────────────────────────────┐
          │   Unit Tests                │  ← Individual function tests
          │   (fastest, most numerous)  │
          └─────────────────────────────┘
```

### Running Tests

```bash
# All tests
python3 -m pytest tests/ -v

# Specific test file
python3 -m pytest tests/test_jurisdiction.py -v

# With coverage
python3 -m pytest tests/ --cov=. --cov-report=html

# End-to-end (mock mode - no API calls)
ANTHROPIC_API_KEY= python3 -m pytest tests/test_end_to_end.py -v
```

### Multi-Geography Testing

The system must work for any US location. Test across diverse geographies:

```bash
# Northeast (Commonwealth state)
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing

# Southwest (different regulations)
python3 create_package.py restaurant Austin TX --pdf-first --enable-tracing

# West Coast (strict regulations)
python3 create_package.py restaurant "San Francisco" CA --pdf-first --enable-tracing

# Small town (test edge cases)
python3 create_package.py restaurant Greenfield MA --pdf-first --enable-tracing
```

### Regression Testing

After any change:
1. Run the test suite
2. Generate a package for the reference geography (Brookline, MA)
3. Compare PDF count, requirement count, and jurisdictions against baseline

```bash
# Baseline
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing
mv output/dossier_restaurant_brookline_ma output/baseline

# After changes
python3 create_package.py restaurant Brookline MA --pdf-first --enable-tracing

# Compare
diff <(ls output/baseline/assets/pdfs/ | sort) \
     <(ls output/dossier_restaurant_brookline_ma/assets/pdfs/ | sort)
```

---

## Parallelization & Performance Optimization

### Current State (Sequential)

The current implementation runs sequentially:
1. GSP generates requirements (5 personas, one at a time)
2. Queries generated for each requirement
3. Searches executed one at a time
4. PDFs downloaded one at a time

**Total time:** 5-10 minutes for a typical package

### Parallelization Opportunities

**1. Parallel Persona Execution**
```python
# Current (sequential)
for persona in PERSONAS:
    results.append(generate_requirements(persona))

# Parallel
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(generate_requirements, p) for p in PERSONAS]
    results = [f.result() for f in futures]
```
**Savings:** ~60% reduction in GSP time

**2. Parallel Search Execution**
```python
# Current (sequential)
for query in queries:
    results.append(execute_search(query))

# Parallel (with rate limiting)
async def parallel_search(queries, max_concurrent=10):
    semaphore = asyncio.Semaphore(max_concurrent)
    async def search_with_limit(query):
        async with semaphore:
            return await execute_search(query)
    return await asyncio.gather(*[search_with_limit(q) for q in queries])
```
**Savings:** ~80% reduction in search time

**3. Parallel PDF Downloads**
```python
# Parallel downloads with connection pooling
async def download_pdfs_parallel(urls, max_concurrent=5):
    connector = aiohttp.TCPConnector(limit=max_concurrent)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [download_pdf(session, url) for url in urls]
        return await asyncio.gather(*tasks)
```
**Savings:** ~70% reduction in download time

### Projected Performance

| Stage | Current | Parallel | Improvement |
|-------|---------|----------|-------------|
| GSP (5 personas) | 3 min | 1 min | 67% |
| Query Generation | 30 sec | 30 sec | 0% (CPU bound) |
| Search Execution | 4 min | 45 sec | 81% |
| PDF Downloads | 2 min | 30 sec | 75% |
| **Total** | **9.5 min** | **2.75 min** | **71%** |

### Caching Opportunities

**1. GSP Caching**
- Cache GSP output by (industry, state) tuple
- Local requirements vary by city, but state/federal are reusable
- TTL: 7 days (regulations don't change frequently)

**2. Search Result Caching**
- Cache search results by query hash
- TTL: 24 hours (search results can change)

**3. PDF Caching**
- Cache downloaded PDFs by URL hash
- TTL: 30 days (government forms change rarely)

---

## Version History & Evolution

### v1.0 - Initial Prototype (Dec 26, 2025)
- Basic GSP with single persona
- Single query per requirement
- Manual PDF downloads
- Hardcoded for Brookline, MA

### v2.0 - Query Expansion (Dec 27, 2025)
- Multiple queries per requirement
- Basic domain preference (.gov over .com)
- Automated PDF downloads
- Still location-hardcoded

### v3.0 - Multi-Perspective GSP (Dec 28, 2025)
- 3 personas (owner, lawyer, inspector)
- Basic scoring system
- Initial FIL structure

### v4.0 - Generalization (Dec 29-30, 2025)
- Zero-hardcoding architecture
- Location-agnostic design
- Full tracing system
- LLM-orchestrated discovery

### v4.5 - PDF-First Pipeline (Dec 31, 2025)
- Prioritize PDF discovery
- Multi-stage search strategy
- Query template system
- 91 tests passing

### v4.6.0 - Query Discovery Enhancement (Jan 1, 2026)
- 5 personas (split inspector into federal/state/local)
- Domain-specific queries (site: operator)
- 10-16 queries per requirement
- GSP outputs expected_domains

### v4.6.1 - PDF Download Fixes (Jan 2, 2026)
- Unique PDF filenames (no overwrites)
- Jurisdiction filtering (no wrong-city PDFs)
- Scorer None bug fix
- Scraped content storage foundation
- Zero-hardcoding jurisdiction utilities

### v4.7 - Auto-Regression (Planned)
- Compare runs against baseline
- Detect quality regressions
- Self-improving knowledge base

---

## Known Issues & Technical Debt

### Current Issues

| Issue | Severity | Workaround | Fix Planned |
|-------|----------|------------|-------------|
| Large PDFs slow download | Low | Timeout handling | v4.8 |
| Some .gov redirects fail | Medium | Retry logic | v4.7 |
| Rate limiting on search API | Medium | Delay between requests | v4.7 |
| DocumentCenter URLs not discovered | High | Alternative queries | v4.7 |

### Technical Debt

1. **Synchronous execution** - Should be async for parallelization
2. **No caching layer** - Re-fetches same URLs across runs
3. **Limited retry logic** - Single attempt per URL
4. **Hardcoded timeouts** - Should be configurable
5. **No authentication support** - Can't access gated content
6. **FIL generation not implemented** - Currently manual

### Refactoring Priorities

1. **Async pipeline** - Convert to asyncio for parallel execution
2. **Cache layer** - Add Redis or file-based caching
3. **Plugin architecture** - Make scorers and collectors pluggable
4. **FIL generator** - Implement automatic FIL creation from PDFs

---

## Roadmap & Next Steps

### Immediate (v4.6.1 Completion)
- [ ] Verify scraped content storage integration
- [ ] Complete multi-geography validation
- [ ] Document all remaining issues

### Short Term (v4.7 - January 2026)
- [ ] **Auto-Regression System**
  - Compare new runs against baseline
  - Detect missing requirements
  - Alert on quality regressions

- [ ] **Enhanced GSP**
  - Better form number detection
  - Deadline/timeline information
  - Conditional requirement logic

- [ ] **Scraper Enhancement**
  - Discover new requirements from scraped content
  - Amend GSP based on discoveries
  - Build knowledge graph of requirements

### Medium Term (v5.0 - Q1 2026)
- [ ] **FIL Generator**
  - Automatic FIL creation from PDFs
  - Field extraction and mapping
  - Instruction generation

- [ ] **Chat Assistant**
  - RAG integration with GSP + FILs
  - Guided completion flow
  - Progress tracking

- [ ] **Multi-State Support**
  - Business operating in multiple states
  - Federal + multiple state requirements
  - Cross-state requirement deduplication

### Long Term (v6.0+ - Q2-Q3 2026)
- [ ] **Continuous Monitoring**
  - Detect regulation changes
  - Alert when renewals due
  - Track compliance status

- [ ] **Application Assistance**
  - Pre-fill forms with business data
  - Guide through application process
  - Track submission status

- [ ] **API & Integrations**
  - REST API for dossier generation
  - Webhook notifications
  - Integration with legal/accounting software

---

## Appendix: Key Decisions & Their Rationale

### Decision 1: LLM for Requirement Discovery (GSP)

**Alternatives Considered:**
1. Static database of requirements per jurisdiction
2. Web scraping of government sites
3. Human curation and maintenance

**Why LLM:**
- Comprehensive coverage without manual maintenance
- Handles edge cases and industry variations
- Knowledge of recent regulatory changes
- Easily adaptable to new industries/locations

**Trade-offs:**
- LLM API costs (~$0.50-$2.00 per generation)
- Potential for hallucination (mitigated by validation)
- Requires careful prompt engineering

### Decision 2: Multi-Persona GSP

**Alternatives Considered:**
1. Single comprehensive prompt
2. Two perspectives (business vs government)
3. Domain-specific experts

**Why 5 Personas:**
- Each persona has different blind spots
- Local inspector catches city-specific forms
- Federal/State/Local split ensures coverage
- Overlap enables deduplication verification

**Trade-offs:**
- 5x more LLM calls
- Longer generation time
- More complex merge logic

### Decision 3: Zero Hardcoding

**Alternatives Considered:**
1. Hardcoded state/city mappings
2. External configuration database
3. User-provided domain lists

**Why Zero Hardcoding:**
- Scales instantly to any location
- LLM knowledge > any static database
- Single code path simplifies testing
- No maintenance burden for new geographies

**Trade-offs:**
- Depends entirely on GSP quality
- Harder to override known issues
- LLM must provide complete domain information

### Decision 4: PDF-First Pipeline

**Alternatives Considered:**
1. Scrape all content, extract PDFs later
2. Link aggregation without download
3. API integrations with government systems

**Why PDF-First:**
- PDFs are the actual deliverable users need
- Reduces noise from HTML pages
- Verifiable output (can inspect downloaded files)
- Better for FIL generation

**Trade-offs:**
- Miss some HTML-only content
- Large files consume storage
- Some PDFs are scanned (not machine-readable)

### Decision 5: Comprehensive Tracing

**Alternatives Considered:**
1. Minimal logging
2. Database storage for analytics
3. External observability platform

**Why JSON Trace Files:**
- Zero external dependencies
- Human-readable for debugging
- Version controllable
- Easy to diff between runs
- Can be loaded into any analysis tool

**Trade-offs:**
- Disk space usage (can be large)
- No real-time monitoring
- Manual analysis required

---

## Contact & Resources

**Repository:** [internal git URL]

**Key Documentation:**
- This document (complete system architecture)
- `PROMPT_*.md` files (implementation prompts)
- Trace files (runtime debugging)
- Test files (expected behavior documentation)

**Communication:**
- Architecture questions: [architecture team]
- GSP/ML improvements: [ML team]
- Production issues: [ops team]

---

*This document should be updated with each significant version release.*
*Last updated: v4.6.1 - January 2, 2026*
