# Form Intelligence Layer (FIL) Generation Pipeline
## Technical Specification v4.0

**Document Status:** FINAL  
**Author:** Architecture Team  
**Date:** January 2026  
**Target System:** Compliance Dossier Pipeline  

---

## Document Organization

| Part | Content | Pages |
|------|---------|-------|
| **Part I** | Core Concepts & Architecture | 1-3 |
| **Part II** | Data Structures | 4-6 |
| **Part III** | Extraction Algorithms | 7-10 |
| **Part IV** | Aggregation & Topic Grouping | 11-13 |
| **Part V** | FIL Generation | 14-16 |
| **Part VI** | Cohort FIL | 17-19 |
| **Part VII** | Asset Generation | 20-21 |
| **Part VIII** | Code Reuse & Integration | 22-24 |
| **Part IX** | Parameters & Configuration | 25-26 |
| **Part X** | Implementation Plan | 27-29 |
| **Appendix A** | Semantic Type Taxonomy | 30-32 |
| **Appendix B** | Trigger Condition Language | 33-34 |
| **Appendix C** | Error Codes | 35 |

---

# PART I: CORE CONCEPTS & ARCHITECTURE

## 1.1 The Fundamental Principle

**Data Defines Process**

The FIL system follows a simple but powerful principle:

```
DATA → PROCESS → ASSET
```

| Stage | What It Is | Example |
|-------|------------|---------|
| **DATA** | Raw information from L1, L2, L3 sources | "Line 1: Legal name of entity" |
| **PROCESS** | FIL - the semantic workflow definition | Topic: "Business Identity" with natural question |
| **ASSET** | Generated output for the user | Filled PDF, navigation cheat sheet, preparation guide |

The key insight: **We cast a wide net when extracting data, create a comprehensive process (FIL), and let the asset mapping naturally filter what's relevant.**

## 1.2 What is FIL?

The **Form Intelligence Layer (FIL)** is semantic middleware that transforms scattered information requirements into a conversational workflow.

```
WITHOUT FIL:                          WITH FIL:
─────────────────────────────────    ─────────────────────────────────
"Field 1: ___________"               "What is the legal name of your
"Field 2: ___________"                business? This is the name
"Field 3: ___________"                registered with the state."
"Field 4a: __________"                    ↓
"Field 4b: __________"               User answers ONCE
...49 fields...                           ↓
                                     Fills 49 fields automatically
```

## 1.3 RIE: The Fundamental Unit

**RIE = Requested Information Element**

An RIE is a single piece of information that the user needs to provide. Examples:

| RIE Name | Semantic Type | Example Value |
|----------|---------------|---------------|
| Legal name of entity | `business.legal_name` | "ABC Restaurant LLC" |
| Mailing address street | `address.mailing.street` | "123 Main St" |
| Seating capacity | `premise.seating.capacity` | 75 |
| Has outdoor patio | `premise.patio.exists` | true |

RIEs are:
- Extracted independently from each source (L1, L2, L3)
- Aggregated based on semantic similarity
- Grouped into Topics
- Topics become FIL questions

## 1.4 The Complete Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FIL GENERATION PIPELINE v4                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: RIE EXTRACTION (Wide Net)                                        │
│  ═══════════════════════════════════                                       │
│                                                                             │
│   L1 (GSP)              L2 (Candidates)           L3 (Document)            │
│   ┌─────────┐           ┌─────────┐              ┌─────────┐               │
│   │ Expected│           │ LLM     │              │ PDF     │               │
│   │ Data    │           │ Extract │              │ Fields  │               │
│   │ Points  │           │ from    │              │ + LLM   │               │
│   │         │           │ Content │              │ Extract │               │
│   │score=0.6│           │score=   │              │score=1.0│               │
│   │         │           │content_ │              │         │               │
│   │         │           │score    │              │         │               │
│   └────┬────┘           └────┬────┘              └────┬────┘               │
│        │                     │                        │                     │
│        └─────────────────────┼────────────────────────┘                     │
│                              │                                              │
│                              ▼                                              │
│                     ALL RIEs (Pool)                                         │
│                     ~~~~~~~~~~~~~~~~                                        │
│                     Superset of all requested information                   │
│                                                                             │
│                              │                                              │
│  PHASE 2: AGGREGATION ───────┼──────────────────────────────────────────   │
│  ═══════════════════════     │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  1. Generate embeddings for all RIE names                           │  │
│   │  2. Cluster semantically similar RIEs (threshold=0.85)              │  │
│   │  3. For each cluster: softmax(scores) → confidence                  │  │
│   │  4. Apply multi-source bonus: conf × (1 + 0.1×(sources-1))         │  │
│   │  5. Merge context from all contributing sources                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│                     Enriched RIEs                                           │
│                     ~~~~~~~~~~~~~                                           │
│                     Each with confidence score and combined context         │
│                                                                             │
│                              │                                              │
│  PHASE 3: TOPIC GROUPING ────┼──────────────────────────────────────────   │
│  ════════════════════════    │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Rule 1: Prefix grouping (4a, 4b, 4c → one topic)                   │  │
│   │  Rule 2: Checkbox grouping (9a-sole, 9a-corp → one topic)           │  │
│   │  Rule 3: Yes/No pair grouping                                       │  │
│   │  Rule 4: Domain template grouping (address.*, contact.*)            │  │
│   │  Rule 5: Semantic similarity grouping (remaining similar RIEs)      │  │
│   │  Rule 6: Singleton topics (everything else)                         │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│                     Topics                                                  │
│                     ~~~~~~                                                  │
│                     Each topic contains 1+ RIEs that can be asked together │
│                                                                             │
│                              │                                              │
│  PHASE 4: FIL GENERATION ────┼──────────────────────────────────────────   │
│  ════════════════════════    │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  1. Generate natural question for each topic                        │  │
│   │  2. Add triggers/conditions from RIE metadata                       │  │
│   │  3. Organize topics into information_domains                        │  │
│   │  4. Add conversation_guide and workflow                             │  │
│   │  5. Validate against FIL schema                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│                 ┌────────────────────────────┐                              │
│                 │     INDIVIDUAL FIL         │                              │
│                 │     ══════════════         │                              │
│                 │  Complete process          │                              │
│                 │  definition for ONE        │                              │
│                 │  requirement               │                              │
│                 └────────────────────────────┘                              │
│                              │                                              │
│           (repeat for all requirements)                                     │
│                              │                                              │
│  PHASE 5: COHORT FIL ────────┼──────────────────────────────────────────   │
│  ════════════════════        │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  1. Collect all Topics from all Individual FILs                     │  │
│   │  2. Cluster semantically similar Topics (threshold=0.85)            │  │
│   │  3. Create Cohort Topics with maps_to_requirements                  │  │
│   │  4. Generate unified questions                                      │  │
│   │  5. Assemble Cohort FIL                                             │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│                 ┌────────────────────────────┐                              │
│                 │      COHORT FIL            │                              │
│                 │      ══════════            │                              │
│                 │  Unified workflow          │                              │
│                 │  covering ALL              │                              │
│                 │  requirements              │                              │
│                 └────────────────────────────┘                              │
│                              │                                              │
│  PHASE 6: ASSET GENERATION ──┼──────────────────────────────────────────   │
│  ══════════════════════════  │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  FIL Topics → Map to Asset Type → Generate Output                   │  │
│   │                                                                     │  │
│   │  PDF Form:  Topic → PDF field mapping → Filled form                 │  │
│   │  Portal:    Topic → Navigation steps → Cheat sheet                  │  │
│   │  Process:   Topic → Preparation items → Checklist                   │  │
│   │                                                                     │  │
│   │  FILTERING HAPPENS HERE: Unmapped topics don't appear in asset      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.5 How This Generalizes Across Asset Types

| Asset Type | L1 | L2 | L3 | FIL Precision | Asset Output |
|------------|----|----|----| --------------|--------------|
| **PDF Form** | Expected data points | Instructions, context | Actual form fields | High (L3 ground truth) | Filled PDF (precise mapping) |
| **Portal** | Expected data points | Help pages, guides | ❌ None | Medium (no ground truth) | Navigation cheat sheet (best effort) |
| **Process** | Expected topics | Inspection guides | Maybe a checklist | Lower (preparing for unknowns) | Preparation guide (comprehensive) |
| **Certificate** | Expected requirements | Provider info | Maybe an application | Varies | Provider comparison, steps |
| **Poster** | Expected content | Regulations | ❌ None | Low | Download link, display instructions |

**Key insight:** The same pipeline works for all asset types. The difference is:
- L3 availability (PDFs have structured fields, portals don't)
- Confidence levels (more sources = higher confidence)
- Asset generation mapping (what's "mappable" varies by type)

## 1.6 Goals & Metrics

| Priority | Goal | Metric | Target |
|----------|------|--------|--------|
| **P0** | Coverage | RIEs mapped / Total RIEs | 100% |
| **P0** | Accuracy | Correct RIE→Topic groupings | ≥95% |
| **P1** | Efficiency (Individual) | Fields / Questions | ≥3.5x |
| **P1** | Efficiency (Cohort) | Fields / Questions | ≥10x |
| **P2** | Robustness | Success with missing L2/L3 | ≥90% |
| **P2** | Production Quality | FILs meeting quality threshold | ≥80% |

## 1.7 MVP Scope

| Feature | MVP (v1) | v1.5 | v2 |
|---------|----------|------|-----|
| Individual FIL generation | ✅ | | |
| Cohort FIL generation | ✅ | | |
| Form asset type | ✅ | | |
| Dossier assessment report | ✅ | | |
| Basic triggers | ✅ | | |
| Portal & Process checklists | | ✅ | |
| Trigger Discovery Agent | | ✅ | |
| Monte Carlo optimization (FIIS) | | | ✅ |
| Other asset types | | | ✅ |
| Form filling integration | | | ✅ |

---

# PART II: DATA STRUCTURES

## 2.1 RIE (Requested Information Element)

The RIE is the fundamental unit of information in the system.

```python
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from enum import Enum

class RIEType(Enum):
    """Data type of the RIE value"""
    STRING = "string"      # Single line text
    TEXT = "text"          # Multi-line text
    BOOLEAN = "boolean"    # Yes/No
    INTEGER = "integer"    # Whole number
    FLOAT = "float"        # Decimal number
    DATE = "date"          # Date value
    EMAIL = "email"        # Email address
    PHONE = "phone"        # Phone number
    CURRENCY = "currency"  # Money amount
    SELECT = "select"      # Single choice from options
    MULTISELECT = "multiselect"  # Multiple choices


@dataclass
class SourceInfo:
    """Tracks where an RIE was extracted from"""
    source_type: str                    # "l1", "l2", "l3"
    source_id: str                      # "gsp", "candidate_1", "primary_doc"
    source_score: float                 # 0.6 (L1), content_score (L2), 1.0 (L3)
    source_file_path: Optional[str] = None  # Path to original file
    source_url: Optional[str] = None    # URL if from web
    extraction_context: Optional[str] = None  # Surrounding text/instructions
    extraction_method: Optional[str] = None   # "pdf_field", "llm_extraction"


@dataclass
class PDFFieldInfo:
    """L3-specific: Information about actual PDF form field"""
    pdf_field_name: str                 # Technical field name: "topmostSubform[0].f1_01[0]"
    page: int                           # Page number (1-indexed)
    field_type: str                     # "text", "checkbox", "radio", "dropdown"
    bbox: Optional[List[float]] = None  # Bounding box [x1, y1, x2, y2]
    max_length: Optional[int] = None    # Character limit if any
    read_only: bool = False             # Is field editable?


@dataclass
class ValidationRule:
    """Validation constraints for the RIE value"""
    type: str                           # "pattern", "range", "length", "phone", "email"
    pattern: Optional[str] = None       # Regex pattern
    min_value: Optional[float] = None   # For numeric/date
    max_value: Optional[float] = None
    min_length: Optional[int] = None    # For string
    max_length: Optional[int] = None
    must_be_future: Optional[bool] = None  # For dates
    format: Optional[str] = None        # "US" for phone, "MM/DD/YYYY" for date


@dataclass
class Option:
    """For SELECT/MULTISELECT RIE types"""
    value: str                          # Internal value stored
    label: str                          # Display label shown to user


@dataclass
class Trigger:
    """Conditional logic attached to an RIE"""
    condition: str                      # Condition type: "if_true", "if_equals", "if_greater_than"
    target_value: Optional[Any] = None  # Value for comparison
    required_ries: Optional[List[str]] = None        # RIE IDs to require
    skip_ries: Optional[List[str]] = None            # RIE IDs to skip
    required_documents: Optional[List[str]] = None   # Documents to require
    required_topics: Optional[List[str]] = None      # Topics to activate
    message: Optional[str] = None                    # User-facing message
    fee_calculation: Optional[str] = None            # Fee rule identifier


@dataclass
class RIE:
    """
    Requested Information Element - the fundamental unit.
    
    Represents a single piece of information that may be requested
    from the user. Extracted from L1, L2, or L3 sources.
    """
    
    # === Identity ===
    id: str                             # Unique identifier
    name: str                           # Human-readable: "Legal name of entity"
    
    # === Classification ===
    semantic_type: Optional[str] = None # Hierarchical type: "business.legal_name"
    rie_type: RIEType = RIEType.STRING  # Data type
    
    # === Description ===
    description: Optional[str] = None   # Detailed description
    help_text: Optional[str] = None     # User guidance
    why_needed: Optional[str] = None    # Purpose explanation
    
    # === Requirements ===
    required: bool = True               # Is this RIE required?
    conditional_on: Optional[str] = None  # Condition expression
    
    # === Validation ===
    validation: Optional[ValidationRule] = None
    
    # === Options (for SELECT types) ===
    options: Optional[List[Option]] = None
    
    # === Extraction Aids ===
    extraction_hints: Optional[List[str]] = None  # Keywords: ["LLC", "Inc"]
    
    # === Triggers ===
    triggers: Optional[Dict[str, Trigger]] = None  # {"if_true": Trigger(...)}
    
    # === Source Tracking ===
    source: Optional[SourceInfo] = None
    
    # === L3-specific: PDF Field ===
    pdf_field: Optional[PDFFieldInfo] = None


@dataclass
class EnrichedRIE(RIE):
    """
    RIE after aggregation from multiple sources.
    
    Created during Phase 2 (Aggregation) when similar RIEs
    from different sources are combined.
    """
    
    # All sources that contributed
    contributing_sources: List[SourceInfo] = field(default_factory=list)
    
    # Canonical name (from highest-confidence source)
    canonical_name: Optional[str] = None
    
    # Combined context (merged from all sources)
    combined_context: Optional[str] = None
    
    # Aggregation metrics
    source_count: int = 1
    aggregated_confidence: float = 0.0    # Softmax result
    multi_source_bonus: float = 1.0       # 1.0 + 0.1×(sources-1)
    final_confidence: float = 0.0         # After bonus applied
    
    # Embedding (for further matching)
    embedding: Optional[List[float]] = None
```

## 2.2 Topic

Topics group related RIEs that can be asked together in a single question.

```python
@dataclass
class Topic:
    """
    A group of related RIEs that form a single conversational unit.
    
    Created during Phase 3 (Topic Grouping) by applying the 6 rules
    to cluster related EnrichedRIEs.
    """
    
    # === Identity ===
    id: str                             # Unique identifier
    name: str                           # Human-readable: "Business Address"
    
    # === Question ===
    natural_question: str               # The question to ask user
    help_text: Optional[str] = None     # Additional guidance
    why_needed: Optional[str] = None    # Explanation
    
    # === RIEs in this Topic ===
    ries: List[EnrichedRIE] = field(default_factory=list)
    
    # === Workflow Control ===
    conditional_on: Optional[str] = None  # Condition to show this topic
    order_hint: Optional[int] = None      # Suggested order
    
    # === Grouping Metadata ===
    grouping_rule: Optional[str] = None   # Which rule created this topic
    
    # === Efficiency ===
    rie_count: int = 0                    # Number of RIEs
    
    # === Confidence ===
    avg_confidence: float = 0.0           # Average confidence of RIEs
    
    # === For Cohort FIL ===
    requirement_id: Optional[str] = None  # Which requirement this came from
    domain_id: Optional[str] = None       # Which domain in that FIL


@dataclass
class InformationDomain:
    """
    A logical grouping of related Topics.
    
    Example: "Business Identity", "Contact Information", "Premise Details"
    """
    
    id: str                             # Unique identifier
    name: str                           # Human-readable name
    description: Optional[str] = None   # What this domain covers
    conversation_opener: Optional[str] = None  # How to introduce this section
    
    topics: List[Topic] = field(default_factory=list)
    
    # Ordering
    order: int = 0
```

## 2.3 FIL Document

The complete FIL structure for an Individual requirement.

```python
@dataclass
class FILDocument:
    """
    Complete Form Intelligence Layer document for one requirement.
    
    This is the output of Phase 4 (FIL Generation).
    """
    
    # === Metadata ===
    fil_version: str = "4.0"
    requirement_id: str = ""
    requirement_title: str = ""
    generated_at: str = ""              # ISO timestamp
    
    # === Asset Info ===
    asset_types: List[str] = field(default_factory=list)  # ["form", "checklist"]
    
    # === Overview ===
    overview: Optional[str] = None
    purpose: Optional[str] = None
    
    # === The Core Content ===
    information_domains: List[InformationDomain] = field(default_factory=list)
    
    # === Workflow ===
    workflow: Optional[Dict] = None     # Stages, order, dependencies
    conversation_guide: Optional[Dict] = None
    
    # === Form Fields (L3 mapping) ===
    form_fields: Optional[List[Dict]] = None  # PDF field → RIE mapping
    
    # === Prerequisites ===
    prerequisites: Optional[List[Dict]] = None
    supporting_documents: Optional[List[Dict]] = None
    
    # === Fees ===
    fees: Optional[Dict] = None
    
    # === Quality Metrics ===
    quality_score: float = 0.0
    efficiency: float = 0.0             # RIEs / Topics
    total_ries: int = 0
    total_topics: int = 0
    extraction_mode: str = "full"       # "full", "l1_l2_only", "l1_only"
    
    # === Provenance ===
    sources_used: List[str] = field(default_factory=list)  # ["l1", "l2", "l3"]
    warnings: List[str] = field(default_factory=list)
```

## 2.4 Cohort FIL

The unified FIL covering all requirements.

```python
@dataclass
class CohortTopic:
    """
    A Topic in the Cohort FIL that maps to multiple requirements.
    """
    
    id: str
    name: str
    natural_question: str
    help_text: Optional[str] = None
    
    # Maps to Individual FIL topics
    maps_to_requirements: List[Dict] = field(default_factory=list)
    # Each entry: {"requirement_id": "...", "topic_id": "...", "domain_id": "..."}
    
    # Merged RIEs from all sources
    ries: List[EnrichedRIE] = field(default_factory=list)
    
    # Efficiency metric
    requirement_count: int = 0          # How many requirements this fills


@dataclass
class CohortFIL:
    """
    Unified FIL covering ALL requirements in a dossier.
    
    Created during Phase 5 (Cohort FIL) by combining Individual FILs.
    """
    
    # === Metadata ===
    fil_version: str = "4.0"
    generated_at: str = ""
    
    # === Requirements Covered ===
    requirements: List[str] = field(default_factory=list)  # Requirement IDs
    total_requirements: int = 0
    
    # === Topics ===
    topics: List[CohortTopic] = field(default_factory=list)
    total_topics: int = 0
    
    # === Efficiency ===
    total_fields: int = 0               # Sum of all PDF fields
    total_ries: int = 0                 # Sum of all RIEs
    efficiency: float = 0.0             # total_fields / total_topics
    
    # === Coverage ===
    requirement_coverage: Dict[str, List[str]] = field(default_factory=dict)
    # Maps requirement_id → list of topic_ids that cover it
    
    # === Quality ===
    quality_score: float = 0.0
    warnings: List[str] = field(default_factory=list)
```

---

# PART III: EXTRACTION ALGORITHMS

## 3.1 Overview

Each source (L1, L2, L3) is processed independently to extract RIEs. This is the "wide net" approach.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RIE EXTRACTION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   INPUT                          PROCESS                  OUTPUT    │
│   ─────                          ───────                  ──────    │
│                                                                     │
│   GSP Output ──────────────► L1 Extractor ──────────► L1 RIEs      │
│   (requirement.json)                                   (score=0.6)  │
│                                                                     │
│   Downloaded Content ──────► L2 Extractor ──────────► L2 RIEs      │
│   (HTML, PDF text)           (LLM extraction)         (score=var)  │
│                                                                     │
│   PDF Document ────────────► L3 Extractor ──────────► L3 RIEs      │
│   (primary_doc.pdf)          (pypdf + LLM)            (score=1.0)  │
│                                                                     │
│                                     │                               │
│                                     ▼                               │
│                              ALL RIEs (Pool)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 3.2 L1 Extraction (from GSP)

**Input:** GSP output (requirement.json)

**Output:** List of RIEs with score=0.6

**Algorithm:**

```
L1 EXTRACTION ALGORITHM
═══════════════════════

CURRENT STATE:
  GSP outputs: requirement_id, title, description, jurisdiction
  GSP does NOT output: expected_data_points

REQUIRED CHANGE:
  Modify GSP prompt to output expected_data_points

MODIFIED GSP OUTPUT SCHEMA:
{
  "requirement_id": "federal_ss4",
  "title": "Application for Employer Identification Number",
  "description": "Form SS-4 is used to apply for an EIN...",
  "jurisdiction": {"level": "federal", "authority": "IRS"},
  "asset_types": ["form"],
  
  // NEW FIELD
  "expected_data_points": [
    {
      "name": "Legal name of business",
      "semantic_type": "business.legal_name",
      "required": true,
      "description": "The official registered name of the entity"
    },
    {
      "name": "Trade name (DBA)",
      "semantic_type": "business.dba",
      "required": false,
      "description": "Doing Business As name if different from legal name"
    },
    ...
  ]
}

EXTRACTION PROCESS:

def extract_l1_ries(gsp_output: dict) -> List[RIE]:
    """Extract RIEs from GSP output."""
    
    ries = []
    requirement_id = gsp_output["requirement_id"]
    
    for dp in gsp_output.get("expected_data_points", []):
        rie = RIE(
            id=f"l1_{requirement_id}_{sanitize(dp['name'])}",
            name=dp["name"],
            semantic_type=dp.get("semantic_type"),
            required=dp.get("required", True),
            description=dp.get("description"),
            source=SourceInfo(
                source_type="l1",
                source_id="gsp",
                source_score=0.6,
                source_file_path=f"requirements/{requirement_id}/gsp.json",
                extraction_method="gsp_expected_data_points"
            )
        )
        ries.append(rie)
    
    return ries

L1 SCORE RATIONALE:
  - Score = 0.6 (lower than L2/L3)
  - GSP is a "best guess" based on requirement type
  - No verification against actual document
  - Useful for: bootstrapping, portals (no L3), coverage check
```

## 3.3 L2 Extraction (from Downloaded Content)

**Input:** Downloaded documents (HTML, PDF text) from candidates

**Output:** List of RIEs with score=content_score per document

**Algorithm:**

```
L2 EXTRACTION ALGORITHM
═══════════════════════

INPUT FILES:
  - candidates.json (list of candidates with scores)
  - Downloaded content files (HTML, PDF)
  - Located in: requirements/{req_id}/downloads/

PROCESS:

def extract_l2_ries(requirement_id: str, downloads_dir: Path) -> List[RIE]:
    """Extract RIEs from all downloaded L2 content."""
    
    # Load candidate scores
    candidates = load_json(f"requirements/{requirement_id}/candidates.json")
    candidate_scores = {c["url"]: c["content_score"] for c in candidates}
    
    all_ries = []
    
    for file_path in downloads_dir.glob("*"):
        # Get content score for this file
        url = get_url_for_file(file_path)
        content_score = candidate_scores.get(url, 0.5)
        
        # Read content
        if file_path.suffix == ".html":
            content = read_html_as_text(file_path)
        elif file_path.suffix == ".pdf":
            content = extract_pdf_text(file_path)
        else:
            content = file_path.read_text()
        
        # LLM extraction
        ries = llm_extract_ries(content, content_score, file_path)
        all_ries.extend(ries)
    
    return all_ries

LLM EXTRACTION PROMPT:
═════════════════════

<system>
You are an expert at analyzing compliance documents and extracting
the information items that are requested from applicants.
</system>

<user>
Analyze the following document content and extract ALL information
items that an applicant would need to provide.

For each information item, provide:
1. name: What is being requested (e.g., "Legal name of business")
2. description: Any instructions or context provided
3. required: Whether it appears to be required (true/false/unclear)
4. semantic_type: Best guess at category (e.g., "business.legal_name")

Document content:
---
{content}
---

Respond in JSON format:
{
  "extracted_items": [
    {
      "name": "...",
      "description": "...",
      "required": true,
      "semantic_type": "..."
    }
  ]
}
</user>

CONVERT TO RIEs:

def llm_extract_ries(content: str, content_score: float, file_path: Path) -> List[RIE]:
    """Use LLM to extract RIEs from content."""
    
    # Call LLM
    response = llm_call(L2_EXTRACTION_PROMPT.format(content=content[:50000]))
    extracted = parse_json(response)
    
    ries = []
    for idx, item in enumerate(extracted.get("extracted_items", [])):
        rie = RIE(
            id=f"l2_{file_path.stem}_{idx}",
            name=item["name"],
            semantic_type=item.get("semantic_type"),
            required=item.get("required", True),
            description=item.get("description"),
            source=SourceInfo(
                source_type="l2",
                source_id=file_path.stem,
                source_score=content_score,
                source_file_path=str(file_path),
                extraction_context=item.get("description"),
                extraction_method="llm_extraction"
            )
        )
        ries.append(rie)
    
    return ries

L2 SCORE RATIONALE:
  - Score = content_score from candidate ranking (0.5 - 0.95 typical)
  - Higher score = more likely to be the authoritative source
  - Multiple L2 documents may contribute RIEs
  - Reinforcement: RIE in multiple L2 docs → higher confidence
```

## 3.4 L3 Extraction (from PDF Document)

**Input:** Primary PDF document (the form itself)

**Output:** List of RIEs with score=1.0

**Algorithm:**

```
L3 EXTRACTION ALGORITHM
═══════════════════════

INPUT:
  - Primary PDF document: requirements/{req_id}/document.pdf
  - This is the highest-scored, downloaded document

TWO EXTRACTION METHODS:
  1. PDF Field Extraction (structured fields)
  2. LLM Content Extraction (instructions, non-field content)

METHOD 1: PDF FIELD EXTRACTION (reuse from pdf_to_fil.py)
─────────────────────────────────────────────────────────

def extract_l3_pdf_fields(pdf_path: Path) -> List[RIE]:
    """Extract RIEs from PDF form fields."""
    
    # Reuse PDFAnalyzer from existing code
    analyzer = PDFAnalyzer(str(pdf_path))
    analysis = analyzer.analyze()
    
    ries = []
    for field in analysis.fields:
        # Get near-field context (text near the field)
        context = get_near_field_context(analysis, field)
        
        rie = RIE(
            id=f"l3_field_{field.field_id}",
            name=clean_field_name(field.field_name),
            rie_type=map_field_type(field.field_type),
            source=SourceInfo(
                source_type="l3",
                source_id="primary_doc",
                source_score=1.0,
                source_file_path=str(pdf_path),
                extraction_context=context,
                extraction_method="pdf_field"
            ),
            pdf_field=PDFFieldInfo(
                pdf_field_name=field.field_name,
                page=field.page,
                field_type=field.field_type,
                bbox=field.bbox
            )
        )
        ries.append(rie)
    
    return ries

METHOD 2: LLM CONTENT EXTRACTION
────────────────────────────────

def extract_l3_content(pdf_path: Path) -> List[RIE]:
    """Extract additional RIEs from PDF content (not fields)."""
    
    # Extract all text from PDF
    text = extract_pdf_text(pdf_path)
    
    # Use same LLM prompt as L2, but mark as L3
    response = llm_call(L2_EXTRACTION_PROMPT.format(content=text[:50000]))
    extracted = parse_json(response)
    
    ries = []
    for idx, item in enumerate(extracted.get("extracted_items", [])):
        rie = RIE(
            id=f"l3_content_{idx}",
            name=item["name"],
            semantic_type=item.get("semantic_type"),
            description=item.get("description"),
            source=SourceInfo(
                source_type="l3",
                source_id="primary_doc_content",
                source_score=1.0,  # Still L3, full confidence
                source_file_path=str(pdf_path),
                extraction_context=item.get("description"),
                extraction_method="llm_extraction"
            )
        )
        ries.append(rie)
    
    return ries

COMBINE BOTH METHODS:

def extract_l3_ries(pdf_path: Path) -> List[RIE]:
    """Complete L3 extraction."""
    
    # Method 1: Structured fields
    field_ries = extract_l3_pdf_fields(pdf_path)
    
    # Method 2: Content extraction
    content_ries = extract_l3_content(pdf_path)
    
    # Combine (field RIEs take precedence if overlap)
    return field_ries + content_ries

L3 SCORE RATIONALE:
  - Score = 1.0 (highest trust)
  - This IS the form the user will fill
  - PDF fields are ground truth
  - Content extraction catches instructions not in fields
```

## 3.5 Near-Field Context Extraction

For L3 PDF fields, we extract nearby text to understand the field better.

```python
def get_near_field_context(analysis: PDFAnalysis, field: PDFField) -> str:
    """
    Extract text near a PDF field for context.
    
    Looks for:
    - Text directly above the field (labels)
    - Text to the left of the field (inline labels)
    - Section headers above the field
    """
    
    page_text = analysis.page_texts[field.page]
    field_bbox = field.bbox  # [x1, y1, x2, y2]
    
    context_parts = []
    
    # Look for text above (within 50 pixels)
    above_text = find_text_in_region(
        page_text,
        x1=field_bbox[0] - 20,
        y1=field_bbox[1] - 50,
        x2=field_bbox[2] + 20,
        y2=field_bbox[1]
    )
    if above_text:
        context_parts.append(f"Label: {above_text}")
    
    # Look for text to the left (within 200 pixels)
    left_text = find_text_in_region(
        page_text,
        x1=field_bbox[0] - 200,
        y1=field_bbox[1] - 5,
        x2=field_bbox[0],
        y2=field_bbox[3] + 5
    )
    if left_text:
        context_parts.append(f"Inline: {left_text}")
    
    # Look for section header (search upward)
    section = find_section_header(analysis, field)
    if section:
        context_parts.append(f"Section: {section}")
    
    return " | ".join(context_parts)
```

## 3.6 Handling Missing Sources

| Scenario | L1 | L2 | L3 | Action |
|----------|----|----|----| ------|
| Full data | ✅ | ✅ | ✅ | Normal processing |
| No L3 (portal) | ✅ | ✅ | ❌ | L1+L2 only, lower confidence |
| No L2 (scraping failed) | ✅ | ❌ | ✅ | L1+L3 only, moderate confidence |
| Only L1 | ✅ | ❌ | ❌ | L1 only, lowest confidence |

```python
def extract_all_ries(requirement_path: Path) -> Tuple[List[RIE], str]:
    """
    Extract RIEs from all available sources.
    Returns (ries, extraction_mode).
    """
    
    l1_ries = extract_l1_ries(requirement_path / "gsp.json")
    
    l2_ries = []
    downloads_dir = requirement_path / "downloads"
    if downloads_dir.exists() and any(downloads_dir.iterdir()):
        l2_ries = extract_l2_ries(downloads_dir)
    
    l3_ries = []
    pdf_path = requirement_path / "document.pdf"
    if pdf_path.exists():
        l3_ries = extract_l3_ries(pdf_path)
    
    # Determine extraction mode
    if l3_ries:
        mode = "full" if l2_ries else "l1_l3_only"
    elif l2_ries:
        mode = "l1_l2_only"
    else:
        mode = "l1_only"
    
    return l1_ries + l2_ries + l3_ries, mode
```

---

# PART IV: AGGREGATION & TOPIC GROUPING

## 4.1 Aggregation Overview

After extraction, we have a pool of RIEs from multiple sources. Aggregation:
1. Clusters semantically similar RIEs
2. Computes confidence scores via softmax
3. Merges context from contributing sources
4. Produces EnrichedRIEs

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AGGREGATION                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Input: All RIEs from L1 + L2 + L3                                │
│                                                                     │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │  "Legal name of entity" (L3, score=1.0)                    │   │
│   │  "Business legal name" (L1, score=0.6)                     │   │
│   │  "Legal name of business" (L2-doc1, score=0.85)            │   │
│   │  "Entity name" (L2-doc2, score=0.78)                       │   │
│   │  "Trade name (DBA)" (L3, score=1.0)                        │   │
│   │  "Doing business as" (L1, score=0.6)                       │   │
│   │  ...                                                       │   │
│   └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   Step 1: Generate embeddings                                       │
│   ──────────────────────────                                       │
│   Each RIE name → embedding vector                                  │
│                              │                                      │
│                              ▼                                      │
│   Step 2: Cluster by similarity (threshold=0.85)                   │
│   ──────────────────────────────────────────────                   │
│   Cluster A: ["Legal name of entity", "Business legal name",       │
│               "Legal name of business", "Entity name"]             │
│   Cluster B: ["Trade name (DBA)", "Doing business as"]             │
│                              │                                      │
│                              ▼                                      │
│   Step 3: Softmax aggregation per cluster                          │
│   ───────────────────────────────────────                          │
│   Cluster A: softmax([1.0, 0.6, 0.85, 0.78]) → confidence          │
│                              │                                      │
│                              ▼                                      │
│   Step 4: Create EnrichedRIE                                       │
│   ──────────────────────────                                       │
│   - canonical_name from highest-score source                        │
│   - combined_context merged from all                                │
│   - final_confidence with multi-source bonus                        │
│                              │                                      │
│                              ▼                                      │
│   Output: List[EnrichedRIE]                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 4.2 Softmax Aggregation Formula

```python
import numpy as np

def softmax(scores: List[float]) -> List[float]:
    """Compute softmax weights for scores."""
    exp_scores = np.exp(scores)
    return (exp_scores / np.sum(exp_scores)).tolist()


def aggregate_cluster(ries: List[RIE]) -> EnrichedRIE:
    """
    Aggregate a cluster of similar RIEs into one EnrichedRIE.
    """
    
    # Get scores from each RIE
    scores = [rie.source.source_score for rie in ries]
    
    # Softmax weights
    weights = softmax(scores)
    
    # Weighted confidence
    aggregated_confidence = sum(w * s for w, s in zip(weights, scores))
    
    # Multi-source bonus
    source_count = len(ries)
    multi_source_bonus = 1.0 + 0.1 * (source_count - 1)
    
    # Final confidence (capped at 1.0)
    final_confidence = min(aggregated_confidence * multi_source_bonus, 1.0)
    
    # Select canonical name from highest-score source
    best_rie = max(ries, key=lambda r: r.source.source_score)
    canonical_name = best_rie.name
    
    # Merge context from all sources
    contexts = [r.source.extraction_context for r in ries if r.source.extraction_context]
    combined_context = " | ".join(contexts)
    
    # Keep PDF field info if present (from L3)
    pdf_field = None
    for rie in ries:
        if rie.pdf_field:
            pdf_field = rie.pdf_field
            break
    
    return EnrichedRIE(
        id=f"enriched_{best_rie.id}",
        name=canonical_name,
        semantic_type=best_rie.semantic_type,
        rie_type=best_rie.rie_type,
        required=any(r.required for r in ries),
        description=best_rie.description,
        pdf_field=pdf_field,
        
        contributing_sources=[r.source for r in ries],
        canonical_name=canonical_name,
        combined_context=combined_context,
        source_count=source_count,
        aggregated_confidence=aggregated_confidence,
        multi_source_bonus=multi_source_bonus,
        final_confidence=final_confidence
    )
```

## 4.3 Clustering Algorithm

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Use efficient embedding model
EMBEDDING_MODEL = SentenceTransformer('BAAI/bge-large-en-v1.5')
SIMILARITY_THRESHOLD = 0.85


def cluster_ries(ries: List[RIE]) -> List[List[RIE]]:
    """
    Cluster RIEs by semantic similarity.
    Returns list of clusters, each cluster is a list of similar RIEs.
    """
    
    if not ries:
        return []
    
    # Generate embeddings for all RIE names
    names = [rie.name for rie in ries]
    embeddings = EMBEDDING_MODEL.encode(names)
    
    # Greedy clustering
    clusters = []
    used = set()
    
    for i, rie in enumerate(ries):
        if i in used:
            continue
        
        # Start new cluster
        cluster = [rie]
        used.add(i)
        
        # Find all similar RIEs
        for j, other_rie in enumerate(ries):
            if j in used:
                continue
            
            similarity = cosine_similarity(
                [embeddings[i]], [embeddings[j]]
            )[0][0]
            
            if similarity >= SIMILARITY_THRESHOLD:
                cluster.append(other_rie)
                used.add(j)
        
        clusters.append(cluster)
    
    return clusters


def aggregate_ries(ries: List[RIE]) -> List[EnrichedRIE]:
    """
    Main aggregation function.
    Clusters similar RIEs and aggregates each cluster.
    """
    
    clusters = cluster_ries(ries)
    
    enriched = []
    for cluster in clusters:
        enriched_rie = aggregate_cluster(cluster)
        enriched.append(enriched_rie)
    
    return enriched
```

## 4.4 Topic Grouping Rules

After aggregation, we group EnrichedRIEs into Topics using 6 rules.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TOPIC GROUPING RULES                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  RULE 1: PREFIX GROUPING                                           │
│  ───────────────────────                                           │
│  Group RIEs with same numeric prefix                               │
│  Example: "4a Street", "4b City", "4c State" → "Mailing Address"   │
│                                                                     │
│  RULE 2: CHECKBOX GROUPING                                         │
│  ────────────────────────                                          │
│  Group checkbox fields with same base ID                           │
│  Example: "9a_sole", "9a_corp", "9a_llc" → "Entity Type"           │
│                                                                     │
│  RULE 3: YES/NO PAIR GROUPING                                      │
│  ───────────────────────────                                       │
│  Group yes/no checkbox pairs                                        │
│  Example: "patio_yes", "patio_no" → "Has Outdoor Patio"            │
│                                                                     │
│  RULE 4: DOMAIN TEMPLATE GROUPING                                  │
│  ───────────────────────────────                                   │
│  Group RIEs with same semantic domain                               │
│  Example: address.street, address.city, address.state → "Address"  │
│                                                                     │
│  RULE 5: SEMANTIC SIMILARITY GROUPING                              │
│  ────────────────────────────────────                              │
│  Group remaining RIEs by embedding similarity (threshold=0.75)     │
│  More permissive than RIE clustering - groups related concepts     │
│                                                                     │
│  RULE 6: SINGLETON TOPICS                                          │
│  ───────────────────────                                           │
│  Each ungrouped RIE becomes its own topic                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 4.5 Topic Grouping Implementation

```python
import re
from collections import defaultdict

TOPIC_GROUPING_THRESHOLD = 0.75  # More permissive than RIE clustering


def apply_topic_grouping(enriched_ries: List[EnrichedRIE]) -> List[Topic]:
    """
    Apply 6 grouping rules to create Topics from EnrichedRIEs.
    """
    
    topics = []
    used_ries = set()
    
    # Rule 1: Prefix grouping (4a, 4b, 4c → one topic)
    prefix_groups = group_by_prefix(enriched_ries)
    for prefix, ries in prefix_groups.items():
        if len(ries) > 1:
            topic = create_topic_from_ries(
                ries, 
                grouping_rule="prefix",
                name_hint=f"Group {prefix}"
            )
            topics.append(topic)
            used_ries.update(rie.id for rie in ries)
    
    # Rule 2: Checkbox grouping (9a_sole, 9a_corp → one topic)
    remaining = [r for r in enriched_ries if r.id not in used_ries]
    checkbox_groups = group_checkboxes(remaining)
    for base_id, ries in checkbox_groups.items():
        if len(ries) > 1:
            topic = create_topic_from_ries(
                ries,
                grouping_rule="checkbox",
                name_hint=f"Select {base_id}"
            )
            topics.append(topic)
            used_ries.update(rie.id for rie in ries)
    
    # Rule 3: Yes/No pair grouping
    remaining = [r for r in enriched_ries if r.id not in used_ries]
    yesno_groups = group_yesno_pairs(remaining)
    for base_name, ries in yesno_groups.items():
        if len(ries) == 2:
            topic = create_topic_from_ries(
                ries,
                grouping_rule="yesno",
                name_hint=base_name
            )
            topics.append(topic)
            used_ries.update(rie.id for rie in ries)
    
    # Rule 4: Domain template grouping (address.*, contact.*)
    remaining = [r for r in enriched_ries if r.id not in used_ries]
    domain_groups = group_by_domain(remaining)
    for domain, ries in domain_groups.items():
        if len(ries) > 1:
            topic = create_topic_from_ries(
                ries,
                grouping_rule="domain",
                name_hint=domain.replace(".", " ").title()
            )
            topics.append(topic)
            used_ries.update(rie.id for rie in ries)
    
    # Rule 5: Semantic similarity (remaining related RIEs)
    remaining = [r for r in enriched_ries if r.id not in used_ries]
    semantic_groups = group_by_semantic_similarity(
        remaining, 
        threshold=TOPIC_GROUPING_THRESHOLD
    )
    for group in semantic_groups:
        if len(group) > 1:
            topic = create_topic_from_ries(
                group,
                grouping_rule="semantic"
            )
            topics.append(topic)
            used_ries.update(rie.id for rie in group)
    
    # Rule 6: Singletons (everything else)
    remaining = [r for r in enriched_ries if r.id not in used_ries]
    for rie in remaining:
        topic = create_topic_from_ries(
            [rie],
            grouping_rule="singleton"
        )
        topics.append(topic)
    
    return topics


def group_by_prefix(ries: List[EnrichedRIE]) -> Dict[str, List[EnrichedRIE]]:
    """Group RIEs by numeric prefix (e.g., 4a, 4b, 4c)."""
    
    prefix_pattern = re.compile(r'^(\d+)[a-z]?\s')
    groups = defaultdict(list)
    
    for rie in ries:
        match = prefix_pattern.match(rie.name)
        if match:
            prefix = match.group(1)
            groups[prefix].append(rie)
    
    return dict(groups)


def group_checkboxes(ries: List[EnrichedRIE]) -> Dict[str, List[EnrichedRIE]]:
    """Group checkbox RIEs with same base ID."""
    
    # Pattern: field_type_variant (e.g., 9a_sole, 9a_corp)
    checkbox_pattern = re.compile(r'^(.+?)_(yes|no|sole|corp|llc|partnership|other|\d+)$')
    groups = defaultdict(list)
    
    for rie in ries:
        if rie.rie_type == RIEType.BOOLEAN or (rie.pdf_field and rie.pdf_field.field_type == "checkbox"):
            match = checkbox_pattern.match(rie.name.lower().replace(" ", "_"))
            if match:
                base = match.group(1)
                groups[base].append(rie)
    
    return dict(groups)


def group_yesno_pairs(ries: List[EnrichedRIE]) -> Dict[str, List[EnrichedRIE]]:
    """Group yes/no checkbox pairs."""
    
    pairs = defaultdict(list)
    
    for rie in ries:
        name_lower = rie.name.lower()
        if "_yes" in name_lower or "_no" in name_lower:
            base = name_lower.replace("_yes", "").replace("_no", "")
            pairs[base].append(rie)
    
    # Only return pairs (exactly 2)
    return {k: v for k, v in pairs.items() if len(v) == 2}


def group_by_domain(ries: List[EnrichedRIE]) -> Dict[str, List[EnrichedRIE]]:
    """Group RIEs by semantic domain prefix."""
    
    # Domains to group: address, contact, business, person, premise
    DOMAIN_PREFIXES = ["address", "contact", "business", "person", "premise"]
    
    groups = defaultdict(list)
    
    for rie in ries:
        if rie.semantic_type:
            parts = rie.semantic_type.split(".")
            if parts[0] in DOMAIN_PREFIXES:
                # Use first two levels: address.mailing, address.physical
                domain = ".".join(parts[:2]) if len(parts) >= 2 else parts[0]
                groups[domain].append(rie)
    
    return dict(groups)


def group_by_semantic_similarity(
    ries: List[EnrichedRIE], 
    threshold: float = 0.75
) -> List[List[EnrichedRIE]]:
    """Group remaining RIEs by semantic similarity."""
    
    if not ries:
        return []
    
    # Generate embeddings
    names = [rie.name for rie in ries]
    embeddings = EMBEDDING_MODEL.encode(names)
    
    # Greedy clustering (same as RIE clustering but lower threshold)
    groups = []
    used = set()
    
    for i, rie in enumerate(ries):
        if i in used:
            continue
        
        group = [rie]
        used.add(i)
        
        for j, other_rie in enumerate(ries):
            if j in used:
                continue
            
            similarity = cosine_similarity(
                [embeddings[i]], [embeddings[j]]
            )[0][0]
            
            if similarity >= threshold:
                group.append(other_rie)
                used.add(j)
        
        if len(group) > 1:  # Only groups with 2+
            groups.append(group)
    
    return groups
```

## 4.6 Creating Topics from RIE Groups

```python
def create_topic_from_ries(
    ries: List[EnrichedRIE],
    grouping_rule: str,
    name_hint: Optional[str] = None
) -> Topic:
    """
    Create a Topic from a group of EnrichedRIEs.
    """
    
    # Generate topic name
    if name_hint:
        name = name_hint
    else:
        # Use most confident RIE's name, cleaned up
        best_rie = max(ries, key=lambda r: r.final_confidence)
        name = clean_topic_name(best_rie.name)
    
    # Generate natural question (will be enhanced by LLM in Phase 4)
    natural_question = generate_basic_question(name, ries)
    
    # Compute average confidence
    avg_confidence = sum(r.final_confidence for r in ries) / len(ries)
    
    return Topic(
        id=f"topic_{sanitize(name)}",
        name=name,
        natural_question=natural_question,
        ries=ries,
        grouping_rule=grouping_rule,
        rie_count=len(ries),
        avg_confidence=avg_confidence
    )


def generate_basic_question(name: str, ries: List[EnrichedRIE]) -> str:
    """Generate a basic question (will be enhanced by LLM later)."""
    
    if len(ries) == 1:
        return f"What is your {name.lower()}?"
    else:
        rie_names = ", ".join(r.name for r in ries[:3])
        if len(ries) > 3:
            rie_names += f", and {len(ries) - 3} more"
        return f"Please provide your {name.lower()} information ({rie_names})."
```

---

# PART V: FIL GENERATION

## 5.1 Overview

Phase 4 transforms Topics into a complete FIL document:
1. Enhance questions using LLM
2. Organize topics into information domains
3. Add triggers and workflow
4. Validate and compute quality metrics

## 5.2 Question Enhancement

```python
QUESTION_ENHANCEMENT_PROMPT = """
You are helping create a conversational interface for government forms.

Given the following topic and its data points, generate a natural, 
friendly question that collects all the needed information.

Topic: {topic_name}
Data points to collect:
{data_points}

Context from the form:
{context}

Requirements:
1. Be conversational, not bureaucratic
2. If multiple data points, ask about them naturally together
3. Include helpful hints or examples
4. Explain why this information is needed if not obvious

Respond with:
{{
  "natural_question": "...",
  "help_text": "...",
  "why_needed": "..."
}}
"""


def enhance_topic_questions(topics: List[Topic]) -> List[Topic]:
    """
    Use LLM to generate natural questions for each topic.
    """
    
    for topic in topics:
        # Format data points
        data_points = "\n".join([
            f"- {rie.name}: {rie.description or 'No description'}"
            for rie in topic.ries
        ])
        
        # Get context
        contexts = [rie.combined_context for rie in topic.ries if rie.combined_context]
        context = " | ".join(contexts[:3])  # Limit context size
        
        # Call LLM
        prompt = QUESTION_ENHANCEMENT_PROMPT.format(
            topic_name=topic.name,
            data_points=data_points,
            context=context
        )
        
        response = llm_call(prompt)
        result = parse_json(response)
        
        # Update topic
        topic.natural_question = result.get("natural_question", topic.natural_question)
        topic.help_text = result.get("help_text")
        topic.why_needed = result.get("why_needed")
    
    return topics
```

## 5.3 Organizing into Information Domains

```python
DOMAIN_CATEGORIES = {
    "business_entity": {
        "name": "Business Information",
        "semantic_prefixes": ["business."],
        "opener": "Let's start with some basic information about your business."
    },
    "contact_info": {
        "name": "Contact Information",
        "semantic_prefixes": ["contact.", "business.phone", "business.email"],
        "opener": "Now I need your contact information."
    },
    "location": {
        "name": "Location & Premises",
        "semantic_prefixes": ["address.", "premise.", "location."],
        "opener": "Let's talk about your business location."
    },
    "operations": {
        "name": "Business Operations",
        "semantic_prefixes": ["operations.", "hours.", "capacity."],
        "opener": "Tell me about how you'll operate."
    },
    "personnel": {
        "name": "Personnel & Management",
        "semantic_prefixes": ["person.", "owner.", "manager.", "employee."],
        "opener": "Now some questions about the people involved."
    },
    "other": {
        "name": "Additional Information",
        "semantic_prefixes": [],
        "opener": "A few more questions."
    }
}


def organize_into_domains(topics: List[Topic]) -> List[InformationDomain]:
    """
    Organize topics into logical information domains.
    """
    
    domain_topics = {domain_id: [] for domain_id in DOMAIN_CATEGORIES}
    
    for topic in topics:
        # Find best matching domain
        assigned = False
        for rie in topic.ries:
            if rie.semantic_type:
                for domain_id, config in DOMAIN_CATEGORIES.items():
                    for prefix in config["semantic_prefixes"]:
                        if rie.semantic_type.startswith(prefix):
                            domain_topics[domain_id].append(topic)
                            assigned = True
                            break
                    if assigned:
                        break
            if assigned:
                break
        
        if not assigned:
            domain_topics["other"].append(topic)
    
    # Create InformationDomain objects
    domains = []
    for idx, (domain_id, topics_list) in enumerate(domain_topics.items()):
        if topics_list:  # Only create domain if it has topics
            config = DOMAIN_CATEGORIES[domain_id]
            domain = InformationDomain(
                id=domain_id,
                name=config["name"],
                conversation_opener=config["opener"],
                topics=topics_list,
                order=idx
            )
            domains.append(domain)
    
    return domains
```

## 5.4 Adding Triggers

```python
def add_triggers_to_fil(domains: List[InformationDomain]) -> List[InformationDomain]:
    """
    Add trigger conditions to topics based on RIE metadata.
    """
    
    for domain in domains:
        for topic in domain.topics:
            for rie in topic.ries:
                # Check for existing triggers from extraction
                if rie.triggers:
                    # Propagate to topic level
                    if not hasattr(topic, 'triggers'):
                        topic.triggers = {}
                    topic.triggers.update(rie.triggers)
                
                # Check for conditional_on
                if rie.conditional_on:
                    topic.conditional_on = rie.conditional_on
    
    return domains
```

## 5.5 Creating Form Fields Mapping

```python
def create_form_fields_mapping(domains: List[InformationDomain]) -> List[Dict]:
    """
    Create the form_fields section mapping PDF fields to RIEs.
    """
    
    form_fields = []
    
    for domain in domains:
        for topic in domain.topics:
            for rie in topic.ries:
                if rie.pdf_field:
                    field_mapping = {
                        "field_id": rie.pdf_field.pdf_field_name,
                        "pdf_field_name": rie.pdf_field.pdf_field_name,
                        "page": rie.pdf_field.page,
                        "field_type": rie.pdf_field.field_type,
                        "populated_by": f"{domain.id}.{topic.id}.{rie.id}"
                    }
                    
                    # Add conditional if present
                    if rie.conditional_on:
                        field_mapping["conditional_on"] = rie.conditional_on
                    
                    form_fields.append(field_mapping)
    
    return form_fields
```

## 5.6 Quality Scoring

```python
def calculate_fil_quality(fil: FILDocument) -> float:
    """
    Calculate production-ready quality score for a FIL.
    
    Returns score 0.0 - 1.0 where ≥0.80 is production-ready.
    """
    
    # Coverage: all RIEs should be in topics
    coverage_score = 1.0  # Assumed if we got here
    
    # Efficiency: fields per topic
    if fil.total_topics > 0:
        efficiency = fil.total_ries / fil.total_topics
        if efficiency >= 3.5:
            efficiency_score = 1.0
        elif efficiency >= 2.5:
            efficiency_score = 0.8
        elif efficiency >= 1.5:
            efficiency_score = 0.6
        else:
            efficiency_score = 0.4
    else:
        efficiency_score = 0.0
    
    # Confidence: average confidence of all RIEs
    all_ries = []
    for domain in fil.information_domains:
        for topic in domain.topics:
            all_ries.extend(topic.ries)
    
    if all_ries:
        avg_confidence = sum(r.final_confidence for r in all_ries) / len(all_ries)
    else:
        avg_confidence = 0.0
    
    # Source diversity: bonus for multiple sources
    sources = set(fil.sources_used)
    if len(sources) >= 3:
        source_score = 1.0
    elif len(sources) == 2:
        source_score = 0.8
    else:
        source_score = 0.6
    
    # Extraction mode penalty
    mode_multiplier = {
        "full": 1.0,
        "l1_l3_only": 0.95,
        "l1_l2_only": 0.8,
        "l1_only": 0.6
    }.get(fil.extraction_mode, 0.5)
    
    # Weighted combination
    base_score = (
        0.25 * coverage_score +
        0.25 * efficiency_score +
        0.30 * avg_confidence +
        0.20 * source_score
    )
    
    final_score = base_score * mode_multiplier
    
    return final_score
```

## 5.7 Assembling the Complete FIL

```python
def generate_individual_fil(
    requirement_id: str,
    gsp_output: Dict,
    enriched_ries: List[EnrichedRIE],
    topics: List[Topic],
    extraction_mode: str
) -> FILDocument:
    """
    Assemble a complete Individual FIL document.
    """
    
    # Enhance questions
    topics = enhance_topic_questions(topics)
    
    # Organize into domains
    domains = organize_into_domains(topics)
    
    # Add triggers
    domains = add_triggers_to_fil(domains)
    
    # Create form fields mapping
    form_fields = create_form_fields_mapping(domains)
    
    # Count totals
    total_ries = sum(len(t.ries) for d in domains for t in d.topics)
    total_topics = sum(len(d.topics) for d in domains)
    
    # Determine sources used
    sources_used = []
    for rie in enriched_ries:
        for source in rie.contributing_sources:
            if source.source_type not in sources_used:
                sources_used.append(source.source_type)
    
    # Create FIL document
    fil = FILDocument(
        fil_version="4.0",
        requirement_id=requirement_id,
        requirement_title=gsp_output.get("title", ""),
        generated_at=datetime.now().isoformat(),
        
        asset_types=gsp_output.get("asset_types", ["form"]),
        overview=gsp_output.get("description"),
        
        information_domains=domains,
        form_fields=form_fields if form_fields else None,
        
        total_ries=total_ries,
        total_topics=total_topics,
        efficiency=total_ries / total_topics if total_topics > 0 else 0,
        extraction_mode=extraction_mode,
        sources_used=sources_used
    )
    
    # Calculate quality score
    fil.quality_score = calculate_fil_quality(fil)
    
    return fil
```

---

# PART VI: COHORT FIL

## 6.1 Overview

The Cohort FIL combines all Individual FILs into a unified workflow:
1. Collect all Topics from Individual FILs
2. Cluster semantically similar Topics across requirements
3. Create Cohort Topics with multi-requirement mapping
4. Assemble the Cohort FIL

## 6.2 Topic Collection

```python
@dataclass
class TaggedTopic:
    """Topic with requirement provenance."""
    topic: Topic
    requirement_id: str
    domain_id: str


def collect_all_topics(individual_fils: List[FILDocument]) -> List[TaggedTopic]:
    """
    Collect all topics from all Individual FILs with provenance.
    """
    
    tagged_topics = []
    
    for fil in individual_fils:
        for domain in fil.information_domains:
            for topic in domain.topics:
                tagged = TaggedTopic(
                    topic=topic,
                    requirement_id=fil.requirement_id,
                    domain_id=domain.id
                )
                tagged_topics.append(tagged)
    
    return tagged_topics
```

## 6.3 Cross-Requirement Topic Clustering

```python
COHORT_SIMILARITY_THRESHOLD = 0.85


def cluster_topics_for_cohort(tagged_topics: List[TaggedTopic]) -> List[List[TaggedTopic]]:
    """
    Cluster topics from different requirements by semantic similarity.
    """
    
    if not tagged_topics:
        return []
    
    # Generate embeddings for topic names + questions
    texts = [
        f"{t.topic.name} {t.topic.natural_question}"
        for t in tagged_topics
    ]
    embeddings = EMBEDDING_MODEL.encode(texts)
    
    # Greedy clustering
    clusters = []
    used = set()
    
    for i, tagged in enumerate(tagged_topics):
        if i in used:
            continue
        
        cluster = [tagged]
        used.add(i)
        cluster_embedding = embeddings[i]
        
        for j, other_tagged in enumerate(tagged_topics):
            if j in used:
                continue
            
            # Don't cluster topics from same requirement
            if other_tagged.requirement_id == tagged.requirement_id:
                continue
            
            similarity = cosine_similarity(
                [cluster_embedding], [embeddings[j]]
            )[0][0]
            
            if similarity >= COHORT_SIMILARITY_THRESHOLD:
                cluster.append(other_tagged)
                used.add(j)
                # Update cluster embedding (average)
                cluster_embeddings = [embeddings[idx] for idx in used if idx <= j]
                cluster_embedding = np.mean(cluster_embeddings, axis=0)
        
        clusters.append(cluster)
    
    return clusters
```

## 6.4 Creating Cohort Topics

```python
def create_cohort_topic(cluster: List[TaggedTopic]) -> CohortTopic:
    """
    Create a CohortTopic from a cluster of Individual FIL topics.
    """
    
    # Select best name (from topic with highest confidence)
    best_tagged = max(cluster, key=lambda t: t.topic.avg_confidence)
    name = best_tagged.topic.name
    
    # Generate unified question
    if len(cluster) == 1:
        question = cluster[0].topic.natural_question
    else:
        # Use LLM to combine questions
        question = generate_unified_question([t.topic for t in cluster])
    
    # Collect all RIEs
    all_ries = []
    for tagged in cluster:
        all_ries.extend(tagged.topic.ries)
    
    # Create mapping
    maps_to = [
        {
            "requirement_id": t.requirement_id,
            "domain_id": t.domain_id,
            "topic_id": t.topic.id
        }
        for t in cluster
    ]
    
    return CohortTopic(
        id=f"cohort_{sanitize(name)}",
        name=name,
        natural_question=question,
        maps_to_requirements=maps_to,
        ries=all_ries,
        requirement_count=len(set(t.requirement_id for t in cluster))
    )


def generate_unified_question(topics: List[Topic]) -> str:
    """
    Use LLM to generate a unified question covering multiple topics.
    """
    
    prompt = f"""
    These topics from different forms ask about the same thing:
    
    {chr(10).join(f'- {t.name}: "{t.natural_question}"' for t in topics)}
    
    Generate a single, natural question that covers all of them.
    The question should work for any of these forms.
    
    Respond with just the question text.
    """
    
    return llm_call(prompt).strip()
```

## 6.5 Assembling the Cohort FIL

```python
def generate_cohort_fil(individual_fils: List[FILDocument]) -> CohortFIL:
    """
    Generate the Cohort FIL from Individual FILs.
    """
    
    # Step 1: Collect all topics
    tagged_topics = collect_all_topics(individual_fils)
    
    # Step 2: Cluster across requirements
    clusters = cluster_topics_for_cohort(tagged_topics)
    
    # Step 3: Create CohortTopics
    cohort_topics = [create_cohort_topic(cluster) for cluster in clusters]
    
    # Step 4: Calculate metrics
    total_fields = sum(
        len(fil.form_fields or []) 
        for fil in individual_fils
    )
    total_ries = sum(len(t.ries) for t in cohort_topics)
    
    # Step 5: Build coverage map
    requirement_coverage = defaultdict(list)
    for topic in cohort_topics:
        for mapping in topic.maps_to_requirements:
            requirement_coverage[mapping["requirement_id"]].append(topic.id)
    
    # Step 6: Assemble
    cohort_fil = CohortFIL(
        fil_version="4.0",
        generated_at=datetime.now().isoformat(),
        
        requirements=[fil.requirement_id for fil in individual_fils],
        total_requirements=len(individual_fils),
        
        topics=cohort_topics,
        total_topics=len(cohort_topics),
        
        total_fields=total_fields,
        total_ries=total_ries,
        efficiency=total_fields / len(cohort_topics) if cohort_topics else 0,
        
        requirement_coverage=dict(requirement_coverage)
    )
    
    # Calculate quality
    cohort_fil.quality_score = calculate_cohort_quality(cohort_fil, individual_fils)
    
    return cohort_fil


def calculate_cohort_quality(
    cohort_fil: CohortFIL, 
    individual_fils: List[FILDocument]
) -> float:
    """
    Calculate quality score for Cohort FIL.
    """
    
    # Requirement coverage
    covered = len(cohort_fil.requirement_coverage)
    total = cohort_fil.total_requirements
    coverage_score = covered / total if total > 0 else 0
    
    # Average individual quality
    avg_individual = sum(f.quality_score for f in individual_fils) / len(individual_fils)
    
    # Efficiency
    if cohort_fil.efficiency >= 10:
        efficiency_score = 1.0
    elif cohort_fil.efficiency >= 7:
        efficiency_score = 0.8
    elif cohort_fil.efficiency >= 5:
        efficiency_score = 0.6
    else:
        efficiency_score = 0.4
    
    # Weighted combination
    return (
        0.30 * coverage_score +
        0.35 * avg_individual +
        0.35 * efficiency_score
    )
```

---

# PART VII: ASSET GENERATION

## 7.1 Overview

Asset generation maps FIL content to specific output types. The FIL is a superset; mapping filters what's relevant.

```
FIL (Superset) ───────► Asset Mapping ───────► Output (Filtered)
     │                       │
     │                       ├── PDF Form Mapping
     │                       ├── Portal Navigation Mapping
     │                       ├── Process Checklist Mapping
     │                       └── ...
     │
     └── Topics that don't map → not included in asset
```

## 7.2 PDF Form Mapping (MVP)

```python
def map_fil_to_pdf(fil: FILDocument, pdf_path: Path) -> Dict:
    """
    Map FIL topics to PDF form fields.
    
    Returns mapping structure for form filling.
    """
    
    if not fil.form_fields:
        return {"error": "No form fields in FIL"}
    
    # Use direct provenance (Option C from earlier discussion)
    direct_mappings = []
    semantic_mappings = []
    
    for field_entry in fil.form_fields:
        # Direct mapping from L3 provenance
        mapping = {
            "pdf_field": field_entry["pdf_field_name"],
            "page": field_entry["page"],
            "source_path": field_entry["populated_by"],
            "mapping_type": "direct"  # From L3 provenance
        }
        
        if field_entry.get("conditional_on"):
            mapping["conditional_on"] = field_entry["conditional_on"]
        
        direct_mappings.append(mapping)
    
    return {
        "pdf_path": str(pdf_path),
        "total_fields": len(direct_mappings),
        "mappings": direct_mappings,
        "unmapped_topics": []  # All L3 fields should be mapped
    }
```

## 7.3 Portal Navigation Mapping (v1.5)

```python
def map_fil_to_portal(fil: FILDocument) -> Dict:
    """
    Map FIL topics to portal navigation steps.
    
    For portals, there's no L3, so we use L1+L2 knowledge
    to create a best-effort navigation guide.
    """
    
    # Group topics by likely portal steps
    steps = []
    
    for domain in fil.information_domains:
        step = {
            "step_name": domain.name,
            "description": domain.conversation_opener,
            "information_needed": []
        }
        
        for topic in domain.topics:
            step["information_needed"].append({
                "topic": topic.name,
                "question_hint": topic.natural_question,
                "data_points": [rie.name for rie in topic.ries]
            })
        
        steps.append(step)
    
    return {
        "portal_type": "navigation_guide",
        "confidence": "medium",  # No L3 ground truth
        "steps": steps,
        "note": "This is a best-effort guide based on similar portals and requirements."
    }
```

## 7.4 Process Checklist Mapping (v1.5)

```python
def map_fil_to_process(fil: FILDocument) -> Dict:
    """
    Map FIL topics to a preparation checklist.
    
    For processes (inspections, meetings), we prepare
    the user for all eventualities.
    """
    
    checklist = {
        "process_type": "preparation_checklist",
        "confidence": "low_to_medium",  # Preparing for unknowns
        "sections": []
    }
    
    for domain in fil.information_domains:
        section = {
            "name": f"Prepare: {domain.name}",
            "items": []
        }
        
        for topic in domain.topics:
            item = {
                "description": f"Have ready: {topic.name}",
                "details": topic.help_text or topic.natural_question,
                "required": any(rie.required for rie in topic.ries)
            }
            section["items"].append(item)
        
        checklist["sections"].append(section)
    
    return checklist
```

---

# PART VIII: CODE REUSE & INTEGRATION

## 8.1 Components to Reuse

| Component | Source File | Reuse Approach |
|-----------|-------------|----------------|
| **PDFAnalyzer** | `pdf_to_fil.py` | Extract class, enhance for near-field context |
| **Field extraction** | `pdf_to_fil.py` | Reuse `_extract_fillable_fields()` |
| **Section detection** | `pdf_to_fil.py` | Reuse `_detect_sections()` |
| **FIL Schema** | `fil-schema.json` | Keep structure, extend for Cohort |
| **FIIS Core** | `fiis.py`, `fiis_enhanced.py` | Keep separate, runs on generated FILs |
| **Questioning LLM** | `questioning_llm.py` | Compatible with Individual FIL |
| **RAG Knowledge Base** | `fiis_enhanced.py` | Leverage for question templates |

## 8.2 What's New

| Component | Purpose |
|-----------|---------|
| **L1 Extractor** | Extract RIEs from GSP output |
| **L2 Extractor** | Extract RIEs from downloaded content |
| **RIE Aggregator** | Softmax aggregation across sources |
| **Topic Grouper** | 6-rule topic creation |
| **Question Enhancer** | LLM-based question improvement |
| **Cohort Generator** | Combine Individual FILs |

## 8.3 Integration Points

### Entry Point

```python
# In pipeline.py or create_package.py

from fil.generator import generate_fils_for_package

def run_pipeline(business: str, city: str, state: str):
    # ... existing phases 1-5 ...
    
    # Phase 6: FIL Generation
    fil_result = generate_fils_for_package(package_path)
    
    # Update dossier assessment
    assessment["fil_generation"] = {
        "individual_fils": len(fil_result.individual_fils),
        "cohort_fil": fil_result.cohort_fil is not None,
        "avg_quality": fil_result.average_quality,
        "production_ready_count": fil_result.production_ready_count
    }
```

### Main Entry Function

```python
# fil/generator.py

def generate_fils_for_package(package_path: Path) -> FILGenerationResult:
    """
    Main entry point for FIL generation.
    
    Args:
        package_path: Path to dossier package directory
    
    Returns:
        FILGenerationResult with individual_fils, cohort_fil, and metrics
    """
    
    # Load requirements
    requirements = load_requirements(package_path / "requirements.json")
    
    individual_fils = {}
    failed = []
    
    for req in requirements:
        req_path = package_path / "requirements" / req["id"]
        
        try:
            # Phase 1: Extract RIEs
            gsp = load_json(req_path / "gsp.json")
            all_ries, mode = extract_all_ries(req_path)
            
            # Phase 2: Aggregate
            enriched_ries = aggregate_ries(all_ries)
            
            # Phase 3: Topic Grouping
            topics = apply_topic_grouping(enriched_ries)
            
            # Phase 4: Generate Individual FIL
            fil = generate_individual_fil(
                req["id"], gsp, enriched_ries, topics, mode
            )
            
            # Save Individual FIL
            save_fil(fil, req_path / "fil.json")
            individual_fils[req["id"]] = fil
            
        except Exception as e:
            failed.append((req["id"], str(e)))
            continue
    
    # Phase 5: Generate Cohort FIL
    cohort_fil = None
    if len(individual_fils) >= len(requirements) * 0.5:
        cohort_fil = generate_cohort_fil(list(individual_fils.values()))
        save_cohort_fil(cohort_fil, package_path / "fil" / "cohort_fil.json")
    
    return FILGenerationResult(
        individual_fils=individual_fils,
        cohort_fil=cohort_fil,
        failed_requirements=failed
    )
```

## 8.4 Directory Structure After FIL Generation

```
output/dossier_restaurant_brookline_ma/
├── manifest.json
├── requirements.json
├── requirements/
│   ├── federal_form_ss_4/
│   │   ├── gsp.json
│   │   ├── candidates.json
│   │   ├── downloads/           # Downloaded L2 content
│   │   │   ├── irs_instructions.html
│   │   │   └── ...
│   │   ├── document.pdf         # L3 primary document
│   │   └── fil.json             # Individual FIL
│   ├── ma_common_victualler/
│   │   └── ...
│   └── ...
├── fil/
│   ├── cohort_fil.json          # Cohort FIL
│   └── generation_report.json   # Quality metrics
└── dossier_assessment.json      # Updated with FIL results
```

## 8.5 FIIS Compatibility

FIIS (Monte Carlo optimization) runs separately, triggered by human or automated process.

```python
# FIIS integration (v2)

from fiis import FIISOptimizer

def optimize_fil_with_fiis(fil_path: Path, expert_feedback: str) -> Path:
    """
    Run FIIS optimization on a generated FIL.
    
    FIIS is compatible because:
    - FIL schema structure is preserved
    - information_domains, topics, data_points structure matches
    - form_fields mapping preserved
    """
    
    optimizer = FIISOptimizer(fil_path)
    improved_fil = optimizer.run_iteration(expert_feedback)
    
    output_path = fil_path.with_suffix(".optimized.json")
    save_fil(improved_fil, output_path)
    
    return output_path
```

---

# PART IX: PARAMETERS & CONFIGURATION

## 9.1 All Tunable Parameters

| Parameter | Default | Range | Impact |
|-----------|---------|-------|--------|
| `l1_score` | 0.6 | 0.4-0.7 | L1 contribution to confidence |
| `l3_score` | 1.0 | Fixed | L3 is ground truth |
| `rie_clustering_threshold` | 0.85 | 0.75-0.95 | RIE aggregation sensitivity |
| `topic_grouping_threshold` | 0.75 | 0.65-0.85 | Topic creation sensitivity |
| `cohort_clustering_threshold` | 0.85 | 0.75-0.95 | Cross-req topic merging |
| `multi_source_bonus_factor` | 0.1 | 0.05-0.2 | Bonus per additional source |
| `max_topic_size` | 5 | 3-8 | Max RIEs per topic |
| `production_ready_threshold` | 0.80 | 0.70-0.90 | Quality score cutoff |

## 9.2 Configuration File

```yaml
# fil_config.yaml

# Source Scores
sources:
  l1_score: 0.6
  l3_score: 1.0
  # L2 score comes from content_score (0.5-0.95)

# Embedding Model
embedding:
  model: "BAAI/bge-large-en-v1.5"
  batch_size: 32
  cache_enabled: true

# RIE Aggregation
aggregation:
  clustering_threshold: 0.85
  multi_source_bonus_factor: 0.1

# Topic Grouping
topic_grouping:
  enable_prefix_rule: true
  enable_checkbox_rule: true
  enable_yesno_rule: true
  enable_domain_rule: true
  enable_semantic_rule: true
  semantic_threshold: 0.75
  max_topic_size: 5

# Cohort Generation
cohort:
  clustering_threshold: 0.85
  min_fils_for_cohort: 0.5  # 50% of requirements

# Quality Thresholds
quality:
  production_ready_threshold: 0.80
  min_efficiency_individual: 3.5
  min_efficiency_cohort: 10.0

# LLM Configuration
llm:
  model: "claude-sonnet-4-20250514"
  max_tokens: 2000
  temperature: 0.3
```

## 9.3 Threshold Calibration Process

Thresholds should be empirically derived using gold standard data:

```python
def calibrate_thresholds(gold_standard_path: Path) -> Dict[str, float]:
    """
    Calibrate thresholds using gold standard FILs.
    
    Process:
    1. Load gold standard FILs with known-correct groupings
    2. For each threshold, sweep range
    3. Measure accuracy vs gold standard
    4. Select value that maximizes F1 score
    """
    
    gold_fils = load_gold_standards(gold_standard_path)
    
    best_thresholds = {}
    
    # Calibrate RIE clustering threshold
    for threshold in np.arange(0.75, 0.96, 0.01):
        accuracy = measure_rie_clustering_accuracy(gold_fils, threshold)
        if accuracy > best_accuracy:
            best_thresholds["rie_clustering"] = threshold
    
    # Calibrate topic grouping threshold
    for threshold in np.arange(0.65, 0.86, 0.01):
        accuracy = measure_topic_grouping_accuracy(gold_fils, threshold)
        if accuracy > best_accuracy:
            best_thresholds["topic_grouping"] = threshold
    
    return best_thresholds
```

---

# PART X: IMPLEMENTATION PLAN

## 10.1 Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 0** | 1 week | Data structures, config, schemas |
| **Phase 1** | 1 week | L3 extraction (reuse + enhance) |
| **Phase 2** | 1 week | L1 + L2 extraction |
| **Phase 3** | 1 week | Aggregation + Topic grouping |
| **Phase 4** | 1 week | FIL generation |
| **Phase 5** | 1 week | Cohort FIL |
| **Phase 6** | 2 weeks | Integration + Testing |

**Total: 8 weeks**

## 10.2 Phase Details

### Phase 0: Foundation (Week 1)

**Deliverables:**
- `fil/models/rie.py` - RIE, EnrichedRIE dataclasses
- `fil/models/topic.py` - Topic, InformationDomain dataclasses
- `fil/models/fil.py` - FILDocument, CohortFIL dataclasses
- `fil/config.py` - Configuration loading
- `fil/schemas/` - JSON schemas for validation
- Unit tests for all models

**Exit Criteria:**
- All dataclasses serialize/deserialize correctly
- Config loads from YAML
- Models validate against schemas

### Phase 1: L3 Extraction (Week 2)

**Deliverables:**
- `fil/extraction/l3_extractor.py` - PDF field extraction
- `fil/extraction/near_field.py` - Context extraction
- Integration with existing PDFAnalyzer

**Exit Criteria:**
- Extracts fields from SS-4 PDF correctly
- Extracts fields from Boston CV PDF correctly
- Near-field context captured

### Phase 2: L1 + L2 Extraction (Week 3)

**Deliverables:**
- `fil/extraction/l1_extractor.py` - GSP RIE extraction
- `fil/extraction/l2_extractor.py` - Content RIE extraction
- Modified GSP prompt (add expected_data_points)
- L2 extraction prompt

**Exit Criteria:**
- L1 extracts 10+ RIEs from SS-4 GSP
- L2 extracts RIEs from downloaded content
- All RIEs have proper source tracking

### Phase 3: Aggregation + Topic Grouping (Week 4)

**Deliverables:**
- `fil/aggregation/aggregator.py` - Softmax aggregation
- `fil/grouping/rules.py` - 6 grouping rules
- `fil/grouping/topic_pipeline.py` - Orchestration

**Exit Criteria:**
- SS-4: 49 RIEs → ~13 topics (≥3.5x efficiency)
- Boston CV: ~112 RIEs → ~30 topics
- No incorrect groupings on gold standard

### Phase 4: FIL Generation (Week 5)

**Deliverables:**
- `fil/generation/question_enhancer.py` - LLM questions
- `fil/generation/domain_organizer.py` - Domain organization
- `fil/generation/fil_assembler.py` - FIL assembly
- `fil/generation/quality_scorer.py` - Quality calculation

**Exit Criteria:**
- Complete FILs generated for all requirements
- FILs pass schema validation
- Quality score ≥0.80 for ≥80% of FILs

### Phase 5: Cohort FIL (Week 6)

**Deliverables:**
- `fil/cohort/topic_collector.py` - Topic collection
- `fil/cohort/cross_req_clusterer.py` - Cross-requirement clustering
- `fil/cohort/cohort_assembler.py` - Cohort FIL assembly

**Exit Criteria:**
- Cohort FIL generated from 40+ requirements
- Efficiency ≥10x
- All requirements covered

### Phase 6: Integration + Testing (Weeks 7-8)

**Deliverables:**
- `fil/generator.py` - Main entry point
- Pipeline integration in `create_package.py`
- Comprehensive test suite
- Documentation

**Exit Criteria:**
- Full pipeline runs end-to-end
- All quality thresholds met
- Tests pass

## 10.3 Success Criteria Summary

| Metric | Target |
|--------|--------|
| Individual FIL coverage | 100% (all requirements get a FIL) |
| Individual FIL efficiency | ≥3.5x |
| Individual FIL quality | ≥0.80 for ≥80% of FILs |
| Cohort FIL efficiency | ≥10x |
| Cohort FIL coverage | 100% (all requirements mapped) |
| Test coverage | ≥80% |

---

# APPENDIX A: SEMANTIC TYPE TAXONOMY

## A.1 Structure

The taxonomy is hierarchical with open leaves:
- **Level 1:** Domain (business, address, person, premise, etc.)
- **Level 2:** Category (business.identity, address.mailing)
- **Level 3+:** Specific type (business.identity.legal_name)

New types can be added at any level.

## A.2 Predefined Types

### business.*

```
business.legal_name          # Full legal entity name
business.dba                 # Doing Business As name
business.ein                 # Employer Identification Number
business.entity_type         # LLC, Corp, Sole Prop, Partnership
business.formation_date      # Date of incorporation
business.state_of_formation  # State where formed
business.is_franchise        # Boolean
business.phone               # Business phone
business.email               # Business email
business.website             # Business website
business.fax                 # Business fax
business.hours.*             # Operating hours
business.opening_date        # Expected opening date
business.manager.*           # Manager info (name, phone, email)
business.owner.*             # Owner info
```

### address.*

```
address.street               # Street address line
address.unit                 # Apartment/suite number
address.city                 # City
address.state                # State
address.zip                  # ZIP code
address.county               # County
address.country              # Country (default USA)

# Subtypes for different address types:
address.mailing.*            # Mailing address
address.physical.*           # Physical/street address
address.billing.*            # Billing address
address.registered.*         # Registered agent address
```

### person.*

```
person.first_name            # Given name
person.middle_name           # Middle name
person.last_name             # Family name
person.full_name             # Complete name
person.ssn                   # Social Security Number
person.dob                   # Date of birth
person.title                 # Professional title
person.phone                 # Personal phone
person.email                 # Personal email
person.address.*             # Personal address
```

### premise.*

```
premise.address.*            # Premise address
premise.area.total           # Total square footage
premise.area.kitchen         # Kitchen square footage
premise.floors               # Number of floors
premise.egresses             # Number of exits
premise.seating.capacity     # Seating capacity
premise.seating.takeout_only # Boolean
premise.patio.exists         # Has outdoor patio
premise.patio.capacity       # Patio seating
premise.patio.hours          # Patio operating hours
premise.patio.property_type  # Private/public
```

### contact.*

```
contact.phone                # General contact phone
contact.email                # General contact email
contact.fax                  # Fax number
contact.name                 # Contact person name
```

### temporal.*

```
temporal.date                # Generic date
temporal.date_range          # Start and end dates
temporal.time                # Time of day
temporal.fiscal_year         # Tax/fiscal year
```

### financial.*

```
financial.amount             # Money amount
financial.currency           # Currency code
financial.fee                # Fee amount
financial.valuation          # Estimated value
```

### signature.*

```
signature.signature          # Signature field
signature.date_signed        # Date of signature
signature.printed_name       # Printed name
signature.title              # Title of signer
```

### custom.*

```
# Open namespace for requirement-specific types
custom.*
```

## A.3 Adding New Types

```python
# Types are added dynamically when encountered
# Format: domain.category.specific

# Examples of valid new types:
"premise.kitchen.location"        # Where is kitchen located
"business.inspection.last_date"   # Last inspection date
"person.citizenship.status"       # Citizenship status
```

---

# APPENDIX B: TRIGGER CONDITION LANGUAGE

## B.1 MVP Trigger Types

| Trigger | Syntax | Example |
|---------|--------|---------|
| `if_true` | `field == true` | Show patio questions if has_patio |
| `if_false` | `field == false` | Skip seating if takeout_only |
| `if_equals` | `field == value` | Different path for LLC vs Corp |
| `if_not_equals` | `field != value` | If not sole proprietor |
| `if_greater_than` | `field > value` | If capacity > 50 |
| `if_less_than` | `field < value` | If square footage < 1000 |
| `if_in_list` | `field in [v1, v2]` | If state in [MA, NH, RI] |

## B.2 Trigger Schema

```json
{
  "trigger_type": "if_greater_than",
  "field": "premise.seating.capacity",
  "value": 50,
  "actions": {
    "require_topics": ["assembly_permit_info"],
    "require_documents": ["place_of_assembly_permit"],
    "message": "With 50+ capacity, you'll need a Place of Assembly permit"
  }
}
```

## B.3 Condition Expression Syntax

```
# Simple comparisons
field == value
field != value
field > value
field >= value
field < value
field <= value

# Boolean
field == true
field == false

# List membership
field in [value1, value2, value3]
field not_in [value1, value2]

# Null checks
field is_null
field is_not_null

# Future (v1.5+)
field1 == field2              # Cross-field comparison
field1 + field2 > value       # Arithmetic
condition1 AND condition2     # Logical AND
condition1 OR condition2      # Logical OR
NOT condition                 # Logical NOT
```

## B.4 Trigger Discovery Agent (v1.5)

```python
# Future: Agent that discovers new trigger patterns

TRIGGER_DISCOVERY_PROMPT = """
Analyze this form content and identify conditional logic patterns.

Look for:
- "If [condition], then [requirement]"
- "Required when [condition]"
- "Skip if [condition]"
- Sections that only apply to certain applicants

Content:
{content}

Extract triggers in JSON format:
{
  "discovered_triggers": [
    {
      "condition_text": "original text from document",
      "trigger_type": "if_greater_than",
      "field": "detected field name",
      "value": detected_value,
      "action": "require_document|skip_topic|...",
      "target": "affected topic/document"
    }
  ]
}
"""
```

---

# APPENDIX C: ERROR CODES

| Code | Error | Recovery |
|------|-------|----------|
| FIL_E001 | L3 extraction failed | Fallback to L1+L2 |
| FIL_E002 | L2 extraction failed | Continue with L1+L3 |
| FIL_E003 | L1 extraction failed | Critical - abort requirement |
| FIL_E004 | Embedding generation failed | Retry, fallback to TF-IDF |
| FIL_E005 | Aggregation failed | Use ungrouped RIEs |
| FIL_E006 | Topic grouping failed | All singletons |
| FIL_E007 | Question generation failed | Use template questions |
| FIL_E008 | Schema validation failed | Log warning, continue |
| FIL_E009 | Cohort generation failed | Use Individual FILs only |
| FIL_E010 | Quality threshold not met | Flag for review |

---

*End of Technical Specification v4.0*

**Document History:**
- v1.0: Initial specification
- v2.0: Added Cohort FIL, asset types, clarifications
- v3.0: Added robustness, measurement, debugging
- v4.0: Complete rewrite with RIE-based architecture, "Data Defines Process" principle, asset type generalization, comprehensive algorithms
