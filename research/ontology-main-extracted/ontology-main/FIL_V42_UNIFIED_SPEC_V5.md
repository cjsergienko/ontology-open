# FIL v4.2 Complete Pipeline Specification

**Document Status:** UNIFIED FINAL  
**Date:** January 13, 2026  
**Version:** 5.0  
**Total Effort:** 52 hours  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [External Dependencies](#3-external-dependencies)
4. [Phase 0: Foundation](#4-phase-0-foundation)
5. [Phase 1: Multi-Candidate Downloads](#5-phase-1-multi-candidate-downloads)
6. [Phase 2: GSP RIE Generation](#6-phase-2-gsp-rie-generation)
7. [Phase 3: Candidate RIE Extraction](#7-phase-3-candidate-rie-extraction)
8. [Phase 4: Document RIE Extraction](#8-phase-4-document-rie-extraction)
9. [Phase 5: Integration & Quality](#9-phase-5-integration--quality)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

# 1. Executive Summary

## 1.1 The Core Insight

```
Rich Context Extraction → Accurate Taxonomy Assignment → Good Topic Grouping → ~4x/~10x Efficiency
```

Topic grouping is the hardest part of FIL generation. Everything in this specification builds toward giving the topic grouping algorithm the rich, well-structured data it needs to succeed.

## 1.2 What This Specification Delivers

| Deliverable | Purpose | Phase |
|-------------|---------|-------|
| `requirement_context.json` | GSP data + generated expected_data_points + business context | 2 |
| `gsp_ries.json` | RIEs from LLM-generated field predictions | 2 |
| `candidate_ries.json` | RIEs from downloaded L2 candidates | 3 |
| `document_ries.json` | RIEs from primary document (L3) | 4 |
| `07_rie_quality.json` | Global quality metrics trace | 5 |

## 1.3 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Source-agnostic RIE schema** | Same structure for GSP, HTML, PDF, TXT |
| **GENERATE expected_data_points** | GSP output lacks field predictions; LLM generates them |
| **GSP scorer for anchor relevance** | Reuse existing scorer for consistent relevance measurement |
| **Existing document.* is rank 1** | Don't re-download primary document |
| **requirement_context.json as bridge** | Single source of truth for Phases 3-4 |
| **PyMuPDF for PDF processing** | Fast, has form field detection, bbox extraction |

## 1.4 Phase Summary

| Phase | Focus | Hours | Key Output |
|-------|-------|-------|------------|
| 0 | Foundation (schemas, config) | 5h | Data structures |
| 1 | Multi-candidate downloads | 13h | downloads/, download_manifest.json |
| 2 | GSP RIE generation | 4h | requirement_context.json, gsp_ries.json |
| 3 | Candidate RIE extraction | 10h | candidate_ries.json |
| 4 | Document RIE extraction | 14h | document_ries.json |
| 5 | Integration & quality | 6h | 07_rie_quality.json |
| **Total** | | **52h** | |

---

# 2. Architecture Overview

## 2.1 Existing File Structure (DO NOT MODIFY)

```
requirements/{requirement_id}/
├── dictionary/
│   ├── definition.json          ← GSP SNAPSHOT (contains gsp_snapshot field)
│   └── metadata.json
├── traces/fil_generation/
│   └── ...
├── document.pdf/.html           ← PRIMARY DOCUMENT (already exists, is rank 1)
├── fil.json                     ← Current FIL (will be v4.2 format)
└── metadata.json
```

**CRITICAL:** 
- GSP data is in `dictionary/definition.json`, NOT `gsp.json`
- Primary document already exists as `document.*`, NOT in downloads/
- `expected_data_points` does NOT exist in GSP - must be GENERATED

## 2.2 New Files We Create

```
requirements/{requirement_id}/
├── downloads/                   ← NEW: Additional candidates (ranks 2-10)
│   ├── candidate_{hash}_002.html
│   ├── candidate_{hash}_003.pdf
│   └── ...
├── download_manifest.json       ← NEW: Download provenance
├── requirement_context.json     ← NEW: GSP + generated data points + business context
├── gsp_ries.json                ← NEW: GSP-derived RIEs
├── candidate_ries.json          ← NEW: Candidate-extracted RIEs
├── document_ries.json           ← NEW: Document-extracted RIEs
└── extraction_metrics.json      ← NEW: Quality metrics

traces/
└── 07_rie_quality.json          ← NEW: Global quality trace
```

## 2.3 Phase Dependency Graph

```
                    Phase 0 (Foundation)
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               │
      Phase 1         Phase 2              │
    (Downloads)      (GSP RIEs)            │
         │               │                 │
         │    ┌──────────┴──────────┐      │
         │    │                     │      │
         ▼    ▼                     ▼      │
      Phase 3                   Phase 4    │
   (Cand RIEs)                (Doc RIEs)   │
         │                         │       │
         └───────────┬─────────────┘       │
                     │                     │
                     ▼                     │
                Phase 5 ◄──────────────────┘
               (Quality)
                     │
                     ▼
               FIL v4.2 Ready
```

**Key Insight:** Phase 2 does NOT depend on Phase 1. They can run in parallel after Phase 0.

## 2.4 Data Flow

```
dictionary/definition.json
         │
         ▼
    [Phase 2: Generate expected_data_points via LLM]
         │
         ▼
requirement_context.json ─────────────────────────────┐
         │                                            │
         ├──────────────────┐                         │
         │                  │                         │
         ▼                  ▼                         ▼
    gsp_ries.json     [Phase 3]                  [Phase 4]
                           │                         │
                           ▼                         ▼
                   candidate_ries.json       document_ries.json
                           │                         │
                           └────────────┬────────────┘
                                        │
                                        ▼
                                   [Phase 5]
                                        │
                                        ▼
                              07_rie_quality.json
```

---

# 3. External Dependencies

## 3.1 Anthropic LLM Client

**Location:** `fil/llm_client.py`

```python
from fil.llm_client import AnthropicClient, LLMResponse

client = AnthropicClient(
    model="claude-3-5-sonnet-20241022",
    cost_tracker=cost_tracker,  # Optional
    max_retries=3,
    retry_delay=1.0
)

response: LLMResponse = client.complete(
    prompt=prompt,
    system_prompt=system_prompt,
    temperature=0.1,
    max_tokens=2048,
    stage="gsp_rie_generation",
    requirement_id=requirement_id
)

text = response.content
data = response.parse_json()
```

**Used by:** Phase 2 (expected_data_points generation)

## 3.2 GSP Scorer

**Location:** `models/` and `discovery/gsp_scorer.py`

```python
from models import (
    DocumentCandidate,
    RequirementPlan,
    BusinessContext,
    ScoringResult,
    SemanticDescription,
    Jurisdiction,
    JurisdictionLevel,
    AcceptanceCriteria,
    ExpectedSources,
    SearchStrategy
)
from discovery.gsp_scorer import ThreePerspectiveBatchRanker

ranker = ThreePerspectiveBatchRanker(verbose=False)
result = ranker.rank_candidates(
    candidates=[candidate],
    requirement=requirement,
    context=context,
    max_candidates=1
)
score = result.selected_candidate.final_score
```

**Used by:** Phase 3 (anchor window scoring)

## 3.3 PDF Processing

**Location:** PyMuPDF (external package)

```python
import pymupdf

doc = pymupdf.open(str(pdf_path))
for page in doc:
    for widget in page.widgets():
        # Extract form field
```

**Used by:** Phase 1 (form field detection), Phase 4 (form field extraction)

## 3.4 Business Context Source

**Location:** `traces/01_gsp_requirements.json`

```python
def load_business_context(dossier_path: Path) -> Dict:
    gsp_path = dossier_path / "traces" / "01_gsp_requirements.json"
    with open(gsp_path) as f:
        data = json.load(f)
    meta = data.get("metadata", {})
    return {
        "business_type": meta.get("business_type", ""),
        "city": meta.get("city", ""),
        "state": meta.get("state", "")
    }
```

**Used by:** Phase 2 (requirement_context.json creation)

---

# 4. Phase 0: Foundation

## 4.1 Overview

| Attribute | Value |
|-----------|-------|
| **Goal** | Establish data structures, configuration, and schemas |
| **Hours** | 5h |
| **Dependencies** | None |
| **Outputs** | Schema files, config files |

## 4.2 Justification

Phase 0 ensures consistency across all subsequent phases by defining:
- **RIE schema** - Source-agnostic structure for all content types
- **ContextInfo** - Rich context for taxonomy assignment
- **Configuration** - Tunable parameters with sensible defaults
- **Metrics** - Quality tracking structures

**Why needed:** Without consistent schemas, each phase would create incompatible data structures.

## 4.3 Task 0.1: RIE Data Structures (2h)

### Deliverable: `src/schemas/rie_schema.py`

### Design Principles

1. **Source-agnostic:** Same RIE structure for GSP, HTML, PDF, TXT
2. **Context is generalized:** Works for form fields AND anchor-based extraction
3. **Relevance uses GSP scorer:** Consistent with existing pipeline
4. **Supports FIL v4.2:** All fields match Appendix F specification

### Schema: SourceInfo

```python
@dataclass
class SourceInfo:
    """Tracks where an RIE was extracted from."""
    
    source_type: str              # "gsp", "candidate", "document"
    source_id: str                # Unique identifier
    source_score: float           # 0.6 (gsp), varies (candidate), 1.0 (document)
    
    content_type_category: Optional[str] = None  # "pdf_with_forms", "html", etc.
    source_file_path: Optional[str] = None
    source_url: Optional[str] = None
    extraction_method: Optional[str] = None      # "gsp_llm_generation", "anchor_gsp_scorer", "form_field_pymupdf"
    extraction_timestamp: Optional[str] = None
```

**source_score Rules:**
- GSP RIEs: Always 0.6 (prediction confidence)
- Candidate RIEs: content_score from GSP scorer (0.0-1.0)
- Document RIEs: Always 1.0 (ground truth)

### Schema: ContextInfo

```python
@dataclass
class ContextInfo:
    """Context for taxonomy assignment."""
    
    # Universal fields (all source types)
    section_header: Optional[str] = None      # Max 100 chars
    surrounding_text: Optional[str] = None    # Max 500 chars
    instructions: Optional[str] = None        # Max 500 chars
    
    # Anchor-based extraction (HTML, PDF no forms, TXT)
    anchor_text: Optional[str] = None         # Max 100 chars
    anchor_source: Optional[str] = None       # "gsp_data_point", "gsp_name", "gsp_authority"
    anchor_position: Optional[int] = None
    
    # PDF form-specific
    neighboring_fields: List[str] = field(default_factory=list)  # Max 5 items
    near_field_text: Optional[str] = None     # Max 200 chars
    page_number: Optional[int] = None
    
    # Quality metrics
    extraction_window_chars: int = 0
    relevance_score: Optional[float] = None   # From GSP scorer
    
    def richness_score(self) -> float:
        """Calculate context richness (0.0 - 1.0)."""
        score = 0.0
        if self.section_header: score += 0.25
        if self.surrounding_text and len(self.surrounding_text) > 100: score += 0.25
        if self.instructions: score += 0.20
        if self.anchor_text and self.relevance_score and self.relevance_score > 0.5: score += 0.15
        if len(self.neighboring_fields) >= 2: score += 0.15
        return min(score, 1.0)
```

**Richness Targets:**
- Document RIEs: ≥0.6
- Candidate RIEs: ≥0.4
- GSP RIEs: ≥0.2

### Schema: PDFFieldInfo

```python
@dataclass
class PDFFieldInfo:
    """PDF form field information - ONLY for document RIEs with form fields."""
    
    pdf_field_name: str           # Exact PDF field identifier
    page: int                     # 1-indexed
    field_type: str               # "text", "checkbox", "radio", "dropdown", "signature"
    bbox: Optional[List[float]] = None  # [x0, y0, x1, y1]
    max_length: Optional[int] = None
    read_only: bool = False
```

### Schema: RIE

```python
@dataclass
class RIE:
    """Requested Information Element - fundamental unit of FIL v4.2."""
    
    rie_id: str                   # Unique within requirement
    name: str                     # Human-readable field name
    source: SourceInfo
    context: ContextInfo
    rie_type: str = "string"      # "string", "text", "boolean", "date", etc.
    description: Optional[str] = None
    required: bool = True
    pdf_field: Optional[PDFFieldInfo] = None
```

**RIE ID Formats:**
- GSP: `gsp_{req_short}_{index:03d}` (e.g., `gsp_federal_ein_000`)
- Candidate: `cand_{hash}_{index:03d}` (e.g., `cand_a1b2c3d4_000`)
- Document: `doc_{field_normalized}_p{page}` (e.g., `doc_business_name_p1`)

### Acceptance Criteria (0.1)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | All classes pass type checking | `mypy src/schemas/rie_schema.py` |
| 2 | `RIE.to_dict()` matches FIL v4.2 Appendix F | Manual comparison |
| 3 | `RIE.from_dict()` roundtrips correctly | Unit test |
| 4 | `richness_score()` returns 0.0-1.0 | Unit test |
| 5 | `truncate_to_limits()` enforces max lengths | Unit test |

---

## 4.4 Task 0.2: Configuration Schemas (1h)

### Deliverable: `src/schemas/extraction_config.py`

```python
@dataclass
class AnchorExtractionConfig:
    """Configuration for anchor-based extraction (Phase 3, 4)."""
    chars_before_anchor: int = 2000
    chars_after_anchor: int = 2000
    max_anchors_per_document: int = 20
    max_total_context_chars: int = 100_000
    min_anchor_relevance: float = 0.3
    min_anchor_distance_chars: int = 500
    fuzzy_match_threshold: float = 0.8

@dataclass
class DownloadConfig:
    """Configuration for multi-candidate downloads (Phase 1)."""
    top_n_candidates: int = 10      # Download until N successes (ranks 2-10+)
    max_retries_per_candidate: int = 2
    timeout_seconds: int = 30
    detect_pdf_form_fields: bool = True
    filename_template: str = "candidate_{hash}_{rank:03d}.{ext}"

@dataclass
class QualityThresholds:
    """Quality thresholds (Phase 5)."""
    document_richness_target: float = 0.6
    candidate_richness_target: float = 0.4
    gsp_richness_target: float = 0.2
    min_gsp_ries: int = 5
    min_document_ries: int = 1

@dataclass
class ContextExtractionConfig:
    """Master configuration."""
    anchor: AnchorExtractionConfig = field(default_factory=AnchorExtractionConfig)
    download: DownloadConfig = field(default_factory=DownloadConfig)
    quality: QualityThresholds = field(default_factory=QualityThresholds)
    skip_semantic_clustering: bool = True
```

### Acceptance Criteria (0.2)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | Config loads from YAML | Unit test |
| 2 | Defaults are sensible | Code review |
| 3 | All phases can import config | Import test |

---

## 4.5 Task 0.3: Extraction Metrics Schema (1h)

### Deliverable: `src/schemas/extraction_metrics.py`

```python
@dataclass
class RequirementExtractionMetrics:
    """Aggregate metrics for a single requirement."""
    requirement_id: str
    requirement_name: str
    extraction_timestamp: str
    
    gsp_ries_count: int = 0
    candidate_ries_count: int = 0
    document_ries_count: int = 0
    
    gsp_avg_richness: float = 0.0
    candidate_avg_richness: float = 0.0
    document_avg_richness: float = 0.0
    
    meets_all_targets: bool = True
    warnings: List[str] = field(default_factory=list)
```

### Acceptance Criteria (0.3)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | Metrics can serialize to JSON | Unit test |
| 2 | All phases can create metrics | Integration test |

---

## 4.6 Task 0.4: YAML Configuration (1h)

### Deliverable: `config/rie_generation_config.yaml`

```yaml
download:
  top_n_candidates: 10
  timeout_seconds: 30
  max_retries: 2

anchor_extraction:
  chars_before_anchor: 2000
  chars_after_anchor: 2000
  min_anchor_relevance: 0.3

quality:
  document_richness_target: 0.6
  candidate_richness_target: 0.4
  gsp_richness_target: 0.2
  min_gsp_ries: 5

pipeline:
  skip_semantic_clustering: true
```

### Acceptance Criteria (0.4)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | YAML parses without errors | Unit test |
| 2 | Values match config schema | Validation |

---

## 4.7 Phase 0 Summary

| Task | Hours | Deliverable | Used By |
|------|-------|-------------|---------|
| 0.1 RIE data structures | 2h | `rie_schema.py` | Phase 2, 3, 4, 5 |
| 0.2 Configuration schemas | 1h | `extraction_config.py` | Phase 1, 2, 3, 4, 5 |
| 0.3 Metrics schemas | 1h | `extraction_metrics.py` | Phase 5 |
| 0.4 YAML config | 1h | `rie_generation_config.yaml` | All phases |
| **Total** | **5h** | | |

---

# 5. Phase 1: Multi-Candidate Downloads

## 5.1 Overview

| Attribute | Value |
|-----------|-------|
| **Goal** | Download additional candidates (ranks 2-10) with provenance |
| **Hours** | 13h |
| **Dependencies** | Phase 0 complete |
| **Inputs** | Scored candidates from existing pipeline |
| **Outputs** | `downloads/` folder, `download_manifest.json` |

## 5.2 Justification

**Why download multiple candidates?**

1. **Multiple source validation:** Same field from different sources increases confidence
2. **Coverage gaps:** Primary document may miss fields in instruction pages
3. **Context enrichment:** Government instruction pages have valuable help text

**Why keep existing document.* as rank 1?**

The existing `document.pdf/.html` at requirement root is:
- Already downloaded by existing pipeline
- Already validated as primary source
- Would be wasteful to re-download

**We ADD ranks 2-10, we don't replace rank 1.**

**FALLBACK:** If no `document.*` exists at requirement root:
- First successful download becomes rank 1
- Copy file to `document.{ext}` at requirement root
- Continue downloading ranks 2-10

## 5.3 Key Behavior

```
EXISTING: document.pdf at requirement root = RANK 1

NEW DOWNLOADS (ranks 2-10):
  Candidates sorted by content_score: [0.92, 0.88, 0.85, 0.82, ...]
  
  Skip rank 1 (already have document.*)
  Try download → SUCCESS → rank 2
  Try download → FAIL (403)
  Try download → SUCCESS → rank 3
  ...continue until 9 more successes (ranks 2-10)
```

## 5.4 File Structure Helper (CORRECTED)

### Deliverable: `src/pipeline/phase1_download/file_structure.py`

```python
class RequirementStructure:
    """Manages file structure for a single requirement."""
    
    def __init__(self, requirement_path: Path):
        self.requirement_path = Path(requirement_path)
        self.requirement_id = self.requirement_path.name
    
    # === EXISTING FILES (READ ONLY) ===
    
    @property
    def definition_path(self) -> Path:
        """GSP snapshot at dictionary/definition.json."""
        return self.requirement_path / "dictionary" / "definition.json"
    
    @property
    def existing_document_paths(self) -> List[Path]:
        """Find existing primary document (document.pdf, document.html)."""
        patterns = ["document.pdf", "document.html", "document.txt"]
        return [self.requirement_path / p for p in patterns 
                if (self.requirement_path / p).exists()]
    
    # === NEW FILES (WE CREATE) ===
    
    @property
    def downloads_dir(self) -> Path:
        return self.requirement_path / "downloads"
    
    @property
    def download_manifest_path(self) -> Path:
        return self.requirement_path / "download_manifest.json"
    
    @property
    def requirement_context_path(self) -> Path:
        return self.requirement_path / "requirement_context.json"
    
    @property
    def gsp_ries_path(self) -> Path:
        return self.requirement_path / "gsp_ries.json"
    
    @property
    def candidate_ries_path(self) -> Path:
        return self.requirement_path / "candidate_ries.json"
    
    @property
    def document_ries_path(self) -> Path:
        return self.requirement_path / "document_ries.json"
    
    # === DATA ACCESS ===
    
    def load_gsp_snapshot(self) -> Dict:
        """Load GSP snapshot from dictionary/definition.json."""
        with open(self.definition_path) as f:
            data = json.load(f)
        # Handle both formats: nested or direct
        return data.get("gsp_snapshot", data)
    
    def has_existing_document(self) -> bool:
        """Check if primary document already exists."""
        return len(self.existing_document_paths) > 0
    
    def get_primary_document_path(self) -> Optional[Path]:
        """Get path to existing primary document."""
        paths = self.existing_document_paths
        return paths[0] if paths else None
    
    def detect_document_category(self, path: Path) -> str:
        """Detect content type category for existing document."""
        import pymupdf
        
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            # Check for form fields
            try:
                doc = pymupdf.open(str(path))
                has_forms = any(list(page.widgets()) for page in doc)
                doc.close()
                return "pdf_with_forms" if has_forms else "pdf_no_forms"
            except:
                return "pdf_no_forms"
        elif suffix in [".html", ".htm"]:
            return "html"
        else:
            return "txt"
```

## 5.5 Download Manifest Schema

```json
{
  "requirement_id": "federal_ein_application",
  "download_timestamp": "2026-01-13T10:30:00Z",
  "config": {"top_n": 10, "timeout": 30},
  
  "primary_document": {
    "rank": 1,
    "local_path": "document.pdf",
    "source": "existing",
    "content_type_category": "pdf_with_forms",
    "detection_note": "content_type_category detected via PyMuPDF form field check"
  },
  
  "downloads": [
    {
      "rank": 2,
      "candidate_id": "...",
      "source_url": "https://...",
      "local_path": "downloads/candidate_a1b2c3d4_002.html",
      "content_type": "text/html",
      "content_type_category": "html",
      "content_score": 0.88,
      "document_chars": 45000
    }
  ],
  
  "failed": [...],
  
  "summary": {
    "successful": 10,
    "failed": 3,
    "target_reached": true
  }
}
```

## 5.6 Acceptance Criteria (Phase 1)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | Existing `document.*` recognized as rank 1 | Check manifest |
| 2 | Downloads continue until N successes | Behavioral test |
| 3 | PDF form field detection works | PyMuPDF test |
| 4 | `download_manifest.json` created | File check |
| 5 | Content type categories correct | Category validation |

## 5.7 Phase 1 Summary

| Task | Hours | Deliverable |
|------|-------|-------------|
| 1.1 Download core | 5h | `download_candidates.py` |
| 1.2 Manifest generator | 2h | `download_manifest.py` |
| 1.3 File structure (corrected) | 2h | `file_structure.py` |
| 1.4 Download trace | 2h | `download_trace.py` |
| 1.5 Integration | 2h | `run_phase1.py` |
| **Total** | **13h** | |

---

# 6. Phase 2: GSP RIE Generation

## 6.1 Overview

| Attribute | Value |
|-----------|-------|
| **Goal** | GENERATE expected_data_points via LLM, create GSP RIEs |
| **Hours** | 4h |
| **Dependencies** | Phase 0 complete (schemas) |
| **Inputs** | `dictionary/definition.json` |
| **Outputs** | `requirement_context.json`, `gsp_ries.json` |

**CRITICAL:** Phase 2 does NOT depend on Phase 1. It can run in parallel.

## 6.2 Justification

**Why GENERATE expected_data_points?**

The GSP output contains:
- ✅ Requirement name, description
- ✅ Issuing authority
- ✅ Expected domains
- ❌ **expected_data_points** - DOES NOT EXIST

FIL v4.2 needs field-level predictions for:
1. Anchor discovery in Phase 3
2. Topic grouping initialization
3. Coverage validation

**Why create requirement_context.json?**

This file serves as the single source of truth for Phases 3 and 4:
- Contains original GSP snapshot
- Contains GENERATED expected_data_points
- Contains business context
- Avoids each phase re-loading and re-parsing

## 6.3 Detailed Flow

```
FOR EACH requirement:
│
├─1─ LOAD GSP snapshot from dictionary/definition.json
│    └── {id, name, description, issuing_authority, authority_level, expected_domains}
│
├─2─ LOAD business context from traces/01_gsp_requirements.json
│    └── {business_type, city, state}
│
├─3─ GENERATE expected_data_points (LLM CALL)
│    │
│    │  INPUT: requirement name, description, authority, business context
│    │  OUTPUT: ["Business Name", "EIN", "Owner SSN", ...]
│    │
│    └── Validate: 5-30 items, no duplicates
│
├─4─ WRITE requirement_context.json
│    └── {from_gsp, generated: {expected_data_points}, business_context}
│
├─5─ CREATE GSP RIEs (one per expected_data_point)
│    │
│    │  FOR EACH data_point:
│    │  - rie_id: gsp_{req_short}_{index:03d}
│    │  - source_score: 0.6 (fixed)
│    │  - source_type: "gsp"
│    │
│    └── Collect List[RIE]
│
└─6─ WRITE gsp_ries.json
```

## 6.4 LLM Prompt

```python
SYSTEM_PROMPT = """You are an expert in government compliance and business licensing.
You analyze compliance requirements and identify the specific data fields that businesses need to provide."""

USER_PROMPT = """Analyze this compliance requirement and list the specific data fields a business owner would need to provide.

**Requirement:** {name}
**Description:** {description}
**Issuing Authority:** {issuing_authority}
**Authority Level:** {authority_level}
**Business Type:** {business_type}
**Location:** {city}, {state}

Instructions:
1. List specific form fields (not categories)
2. Be specific: "Owner SSN" not just "identification"
3. Return 10-25 fields

Return ONLY a JSON array of field names."""
```

## 6.5 requirement_context.json Schema

```json
{
  "requirement_id": "federal_ein_application",
  "generation_timestamp": "2026-01-13T10:30:00Z",
  
  "from_gsp": {
    "name": "Form SS-4 Application for EIN",
    "description": "...",
    "authority_level": "federal",
    "issuing_authority": "Internal Revenue Service (IRS)",
    "is_pdf_likely": true,
    "expected_domains": ["irs.gov"]
  },
  
  "generated": {
    "expected_data_points": [
      "Legal Name of Entity",
      "Trade Name (DBA)",
      "Responsible Party Name",
      "Responsible Party SSN",
      "..."
    ],
    "generation_method": "llm_post_processing"
  },
  
  "business_context": {
    "business_type": "restaurant",
    "city": "Brookline",
    "state": "MA"
  }
}
```

## 6.6 Acceptance Criteria (Phase 2)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | `requirement_context.json` created per requirement | File check |
| 2 | `gsp_ries.json` created per requirement | File check |
| 3 | Each `gsp_ries.json` has ≥5 RIEs | Count check |
| 4 | All RIEs have `source_score=0.6` | Value check |
| 5 | `expected_data_points` array is non-empty | Length check |
| 6 | LLM success rate ≥95% | Error tracking |

## 6.7 Phase 2 Summary

| Task | Hours | Deliverable |
|------|-------|-------------|
| 2.1 Data points generator | 2h | `data_points_generator.py` |
| 2.2 RIE generator + entry point | 2h | `run_phase2.py` |
| **Total** | **4h** | |

---

# 7. Phase 3: Candidate RIE Extraction

## 7.1 Overview

| Attribute | Value |
|-----------|-------|
| **Goal** | Extract RIEs from L2 candidates using anchor-based extraction |
| **Hours** | 10h |
| **Dependencies** | Phase 1 (downloads), Phase 2 (requirement_context.json) |
| **Inputs** | Downloaded candidates, requirement_context.json |
| **Outputs** | `candidate_ries.json` |

## 7.2 Justification

**Why extract from candidates?**

1. **Multiple source validation:** Same field from different sources increases confidence
2. **Additional context:** Instruction pages have valuable help text
3. **Coverage gaps:** Fields mentioned in instructions but not in primary form

## 7.3 Anchor-Based Extraction Algorithm

```
FOR EACH candidate document (rank 2+):
│
├─1─ DISCOVER ANCHORS
│    │
│    │  Using expected_data_points from requirement_context.json:
│    │  "Business Name" → fuzzy match → positions [1234, 5678]
│    │
│    └── Also try: requirement name tokens, issuing authority
│
├─2─ EXTRACT WINDOWS (±2000 chars around each anchor)
│    │
│    │  position 1234 → window = document[234:3234]
│    │
│    └── Find section header above anchor
│
├─3─ SCORE WINDOWS using GSP scorer adapter
│    │
│    │  Wrap window in DocumentCandidate structure
│    │  Call ThreePerspectiveBatchRanker
│    │
│    └── Filter: keep if relevance ≥ 0.3
│
└─4─ CREATE RIEs for passing windows
     │
     ├── rie_id: cand_{hash}_{index:03d}
     ├── source_score: content_score from download manifest
     ├── context.relevance_score: from GSP scorer
     └── context.anchor_text: matched text
```

## 7.4 GSP Scorer Adapter

```python
class AnchorWindowScorer:
    """Adapts GSP scorer for anchor window scoring."""
    
    def __init__(self):
        self.ranker = ThreePerspectiveBatchRanker(verbose=False)
    
    def score_window(
        self,
        window_text: str,
        requirement_context: dict,
        source_url: str,
        source_domain: str
    ) -> float:
        """Score anchor window for relevance (0.0-1.0)."""
        
        # Build DocumentCandidate from window
        candidate = DocumentCandidate(
            url=source_url,
            domain=source_domain,
            document_type="anchor_window",
            source_query="anchor_extraction",
            scraped_content=window_text,
            content_snippet=window_text[:500]
        )
        
        # Build RequirementPlan from context
        from_gsp = requirement_context["from_gsp"]
        requirement = RequirementPlan(
            requirement_id=requirement_context["requirement_id"],
            requirement_name=from_gsp["name"],
            semantic_description=SemanticDescription(
                what_it_is=from_gsp["description"],
                why_needed="Required for compliance",
                who_issues=from_gsp["issuing_authority"]
            ),
            # ... other fields
        )
        
        # Build BusinessContext
        biz = requirement_context["business_context"]
        context = BusinessContext(
            business_type=biz["business_type"],
            city=biz["city"],
            state=biz["state"],
            state_full=self._get_state_full(biz["state"])
        )
        
        # Score
        result = self.ranker.rank_candidates(
            candidates=[candidate],
            requirement=requirement,
            context=context,
            max_candidates=1
        )
        
        return result.selected_candidate.final_score if result.selected_candidate else 0.0
```

## 7.5 Acceptance Criteria (Phase 3)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | `candidate_ries.json` created per requirement | File check |
| 2 | Uses GSP scorer for relevance | Code review |
| 3 | Average relevance ≥ 0.5 | Metrics check |
| 4 | Processes all L2 candidates | Manifest comparison |

## 7.6 Phase 3 Summary

| Task | Hours | Deliverable |
|------|-------|-------------|
| 3.1 Anchor discovery | 3h | `anchor_discovery.py` |
| 3.2 Window extraction | 2h | `window_extraction.py` |
| 3.3 GSP scorer adapter | 2h | `anchor_scorer_adapter.py` |
| 3.4 Candidate RIE generator | 2h | `candidate_rie_generator.py` |
| 3.5 Integration | 1h | `run_phase3.py` |
| **Total** | **10h** | |

---

# 8. Phase 4: Document RIE Extraction

## 8.1 Overview

| Attribute | Value |
|-----------|-------|
| **Goal** | Extract RIEs from primary document with maximum context |
| **Hours** | 14h |
| **Dependencies** | Phase 2 (requirement_context.json) |
| **Inputs** | Primary document (`document.*`), requirement_context.json |
| **Outputs** | `document_ries.json` |

## 8.2 Type-Dependent Extraction

| Document Type | Detection | Extraction Method | source_score |
|---------------|-----------|-------------------|--------------|
| `pdf_with_forms` | PyMuPDF widgets found | Form field extraction | 1.0 |
| `pdf_no_forms` | PyMuPDF no widgets | Anchor extraction | 1.0 |
| `html` | MIME type | Anchor extraction | 1.0 |
| `txt` | MIME type | Anchor extraction | 1.0 |

**Key Rule:** Primary document is ALWAYS `source_score=1.0` regardless of extraction method.

## 8.3 PDF Form Field Extraction

```python
def extract_form_fields(pdf_path: Path) -> List[FormField]:
    """Extract form fields using PyMuPDF."""
    fields = []
    doc = pymupdf.open(str(pdf_path))
    
    for page_num, page in enumerate(doc, start=1):
        for widget in page.widgets():
            fields.append(FormField(
                name=widget.field_name,
                field_type=_map_type(widget.field_type),
                bbox=tuple(widget.rect),
                page=page_num,
                max_length=getattr(widget, 'text_maxlen', None)
            ))
    
    doc.close()
    return fields

def find_section_header(field: FormField, text_blocks: List[TextBlock]) -> Optional[str]:
    """Find section header above form field."""
    candidates = [
        b for b in text_blocks
        if b.page == field.page
        and b.bbox[3] < field.bbox[1]  # Above field
        and (b.is_bold or b.font_size > 11)  # Likely header
    ]
    if candidates:
        return min(candidates, key=lambda b: field.bbox[1] - b.bbox[3]).text[:100]
    return None

def find_neighboring_fields(field: FormField, all_fields: List[FormField]) -> List[str]:
    """Find nearby form fields."""
    # Calculate distance, return nearest 5
    ...
```

## 8.4 Acceptance Criteria (Phase 4)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | `document_ries.json` created per requirement | File check |
| 2 | PDF form fields extracted correctly | PyMuPDF comparison |
| 3 | `pdf_field` populated for form PDFs | Field check |
| 4 | `source_score=1.0` for all | Value check |
| 5 | Average richness ≥ 0.6 | Metrics check |

## 8.5 Phase 4 Summary

| Task | Hours | Deliverable |
|------|-------|-------------|
| 4.1 PDF form extractor | 4h | `pdf_form_extractor.py` |
| 4.2 Text block extractor | 2h | (in pdf_form_extractor.py) |
| 4.3 Context enrichment | 3h | `context_enrichment.py` |
| 4.4 Document RIE generator | 3h | `document_rie_generator.py` |
| 4.5 Integration | 2h | `run_phase4.py` |
| **Total** | **14h** | |

---

# 9. Phase 5: Integration & Quality

## 9.1 Overview

| Attribute | Value |
|-----------|-------|
| **Goal** | Validate all RIE files, compute quality metrics |
| **Hours** | 6h |
| **Dependencies** | Phases 2, 3, 4 complete |
| **Inputs** | All RIE files |
| **Outputs** | `07_rie_quality.json`, `extraction_metrics.json` |

## 9.2 Validation Rules

```python
VALIDATION = {
    "source_score_ranges": {
        "gsp": (0.59, 0.61),       # Must be ~0.6
        "candidate": (0.0, 1.0),   # Any valid
        "document": (0.99, 1.01)   # Must be ~1.0
    },
    "richness_targets": {
        "gsp": 0.2,
        "candidate": 0.4,
        "document": 0.6
    },
    "min_ries": {
        "gsp": 5,
        "candidate": 0,
        "document": 1
    }
}
```

## 9.3 Acceptance Criteria (Phase 5)

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | All 3 RIE files validated per requirement | File checks |
| 2 | Validation pass rate ≥ 95% | Metrics |
| 3 | `07_rie_quality.json` created | File check |
| 4 | Clustering bypass honored | Config flag |

## 9.4 Phase 5 Summary

| Task | Hours | Deliverable |
|------|-------|-------------|
| 5.1 Quality validator | 2h | `quality_validator.py` |
| 5.2 Quality trace | 2h | `quality_trace.py` |
| 5.3 Clustering bypass | 1h | `clustering_bypass.py` |
| 5.4 Integration | 1h | `run_phase5.py` |
| **Total** | **6h** | |

---

# 10. Implementation Roadmap

## 10.1 Execution Order

| Week | Phase | Hours | Parallelizable? |
|------|-------|-------|-----------------|
| 1 | 0: Foundation | 5h | N/A |
| 1-2 | 1: Downloads | 13h | Can start after Phase 0 |
| 1-2 | 2: GSP RIEs | 4h | Can start after Phase 0 (parallel with 1) |
| 2 | 3: Candidate RIEs | 10h | Needs Phase 1 + 2 |
| 2-3 | 4: Document RIEs | 14h | Needs Phase 2 |
| 3 | 5: Quality | 6h | Needs Phase 2, 3, 4 |

## 10.2 Total Hours

| Phase | Hours |
|-------|-------|
| Phase 0 | 5h |
| Phase 1 | 13h |
| Phase 2 | 4h |
| Phase 3 | 10h |
| Phase 4 | 14h |
| Phase 5 | 6h |
| **Total** | **52h** |

## 10.3 Success Criteria (Overall)

| # | Criterion | Target |
|---|-----------|--------|
| 1 | All requirements have 3 RIE files | 100% |
| 2 | Average document richness | ≥0.6 |
| 3 | Average candidate richness | ≥0.4 |
| 4 | Average GSP richness | ≥0.2 |
| 5 | LLM generation success rate | ≥95% |
| 6 | Validation pass rate | ≥95% |

---

## Appendix A: Quick Reference

### RIE Files Per Requirement

| File | Created By | source_score | source_type |
|------|------------|--------------|-------------|
| `gsp_ries.json` | Phase 2 | 0.6 | "gsp" |
| `candidate_ries.json` | Phase 3 | varies | "candidate" |
| `document_ries.json` | Phase 4 | 1.0 | "document" |

### Key File Locations

| File | Path |
|------|------|
| GSP snapshot | `requirements/{id}/dictionary/definition.json` |
| Primary document | `requirements/{id}/document.*` |
| Business context | `traces/01_gsp_requirements.json` |
| Downloads | `requirements/{id}/downloads/` |
| requirement_context | `requirements/{id}/requirement_context.json` |

### Import Paths

```python
# LLM Client
from fil.llm_client import AnthropicClient, LLMResponse

# GSP Scorer
from models import DocumentCandidate, RequirementPlan, BusinessContext
from discovery.gsp_scorer import ThreePerspectiveBatchRanker

# PDF Processing
import pymupdf
```

---

*End of Specification*
