# Semantic FIL Generation Architecture
## Version 1.0 | January 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Design Principles](#3-design-principles)
4. [Architecture Overview](#4-architecture-overview)
5. [Component Specifications](#5-component-specifications)
6. [Data Flow & Persistence](#6-data-flow--persistence)
7. [Configuration System](#7-configuration-system)
8. [Fallback Mechanisms](#8-fallback-mechanisms)
9. [Quality Scoring & Metrics](#9-quality-scoring--metrics)
10. [Integration with Existing Pipeline](#10-integration-with-existing-pipeline)
11. [Cost Management](#11-cost-management)
12. [Testing Strategy](#12-testing-strategy)
13. [Extensibility for Monte Carlo & RAG](#13-extensibility-for-monte-carlo--rag)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Risk Mitigation](#15-risk-mitigation)
16. [Appendices](#16-appendices)

---

## 1. Executive Summary

### What We're Building

A **semantic FIL (Form Instruction Layer) generation system** that produces high-quality, conversational form-filling instructions by:

1. **Extracting semantic domains** from three information levels (GSP, Candidates, Final Document)
2. **Asking 12 optimized domain questions** to interrogate content
3. **Clustering semantically similar fields** across sources
4. **Mapping unified fields** back to document structure
5. **Scoring quality** and providing fallbacks when needed

### Why This Approach

| Current System | Semantic System |
|----------------|-----------------|
| Template-based field lists | LLM-derived semantic understanding |
| Hardcoded document types | Content-driven classification |
| 40-60% coverage | 95-106% coverage |
| 60-70% precision | 93-95% precision |
| Breaks on new geographies | Works universally |
| C/O misclassified | Correct semantic classification |

### Validated Performance (from experiments)

| Metric | Value | Source |
|--------|-------|--------|
| Optimal question count | **12** | Sigmoid curve analysis |
| Clustering threshold | **0.85** | Experiment tuning |
| Average deduplication | **35%** | 9 requirement tests |
| Coverage | **104%** | Combined experiments |
| Precision | **95%** | Combined experiments |
| Production-ready rate | **100%** (9/9) | All tests pass 85+ |

---

## 2. Problem Statement

### 2.1 Current System Failures

1. **Template Dependency**: Current `field_extractor.py` has 1018 lines of hardcoded field definitions
2. **Document Type Blindness**: Classifier at `document_classifier.py` uses keyword patterns, not semantic understanding
3. **Single-Source Extraction**: Only extracts from final document, missing GSP and candidate context
4. **No Quality Measurement**: No systematic way to know if FIL is good or bad
5. **Geography Coupling**: Massachusetts-specific assumptions embedded throughout

### 2.2 What We Need

1. **Semantic Understanding**: LLM understands what "Certificate of Occupancy" actually means
2. **Multi-Source Triangulation**: Fields confirmed across GSP, candidates, and document
3. **Quality Scoring**: Quantitative metrics for coverage, precision, efficiency
4. **Universal Applicability**: Same code works for Brookline MA, Austin TX, any jurisdiction
5. **Graceful Degradation**: Produces useful output even when documents unavailable

### 2.3 Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Field Coverage | ≥95% | FIL fields that map to document ÷ Total document fields |
| Precision | ≥90% | Correctly mapped fields ÷ Total FIL fields |
| Production Ready | ≥85 score | Weighted quality score |
| Zero Hardcoding | 100% | No geography-specific code |
| Standalone Testable | Yes | Can run after Phase 4 with trace files |
| Cost per FIL | <$0.05 | LLM API costs |

---

## 3. Design Principles

### 3.1 ZERO-HARDCODING

**Principle**: No code should reference specific geographies, document names, or field patterns.

**Implementation**:
- All questions in configuration files
- All thresholds as parameters
- Geography passed as runtime context
- Patterns learned, not coded

**Verification**: `grep -r "massachusetts\|brookline\|mass.gov" fil/` returns zero results

### 3.2 PROGRESSIVE PERSISTENCE

**Principle**: Every intermediate result is saved to disk, enabling checkpoint/resume and debugging.

**Implementation**:
- `fil_trace_level1_gsp.json` - After GSP extraction
- `fil_trace_level2_candidates.json` - After candidate extraction
- `fil_trace_level3_document.json` - After document extraction
- `fil_trace_clustered.json` - After clustering
- `fil_trace_mapped.json` - After mapping
- `fil_final.json` - Final FIL output

**Benefit**: Can restart from any checkpoint, debug any stage, audit any decision

### 3.3 CONFIGURATION-DRIVEN

**Principle**: Behavior controlled by configuration, not code changes.

**Implementation**:
```yaml
# semantic_fil_config.yaml
questions:
  core: [...]
  important: [...]
  optional: [...]
clustering:
  similarity_threshold: 0.85
scoring:
  weights:
    coverage: 0.30
    precision: 0.25
    ...
```

**Benefit**: Tune behavior without code deployment, A/B test configurations

### 3.4 SINGLE SOURCE OF TRUTH

**Principle**: Each piece of information has exactly one authoritative source.

**Implementation**:
- Error categories: `tracing/download_error.py`
- Requirement IDs: `utils/identifiers.py`
- File paths: `tracing/paths.py`
- FIL schema: `fil/semantic_schema.py`

### 3.5 OBSERVABLE BY DEFAULT

**Principle**: Every operation produces observable output for debugging and analytics.

**Implementation**:
- Verbose logging with configurable levels
- Cost tracking per LLM call
- Timing metrics per stage
- Source provenance for every field

### 3.6 GRACEFUL DEGRADATION

**Principle**: Partial success is better than complete failure.

**Implementation**:
- Level 3 fails → Use Level 1+2 (reduced confidence)
- No document → Fallback FIL from GSP
- Clustering fails → Return unclustered fields
- Mapping fails → Return unmapped FIL with warning

---

## 4. Architecture Overview

### 4.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEMANTIC FIL GENERATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INPUTS (from Pipeline Phase 4)                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ GSP Output  │  │ Candidates  │  │  Selected   │  │  Downloaded │         │
│  │ (01_gsp_    │  │ (03_raw_    │  │  Document   │  │   Content   │         │
│  │ requirements│  │ candidates  │  │ (04_scorer_ │  │ (05_content │         │
│  │ .json)      │  │ .json)      │  │ decisions)  │  │ _downloads) │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │                 │
│         ▼                ▼                ▼                ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                    FILInput (from integration.py)                 │       │
│  │  requirement_id, name, jurisdiction, gsp_*, document_path, etc.   │       │
│  └───────────────────────────────┬──────────────────────────────────┘       │
│                                  │                                           │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │              SEMANTIC FIL GENERATOR (Orchestrator)                │       │
│  │                                                                   │       │
│  │   ┌─────────────────────────────────────────────────────────┐    │       │
│  │   │  STAGE 1: THREE-LEVEL EXTRACTION                        │    │       │
│  │   │                                                         │    │       │
│  │   │  ┌─────────┐    ┌─────────┐    ┌─────────┐             │    │       │
│  │   │  │ Level 1 │    │ Level 2 │    │ Level 3 │             │    │       │
│  │   │  │   GSP   │    │Candidates│   │Document │             │    │       │
│  │   │  │Extractor│    │Extractor│    │Extractor│             │    │       │
│  │   │  └────┬────┘    └────┬────┘    └────┬────┘             │    │       │
│  │   │       │              │              │                   │    │       │
│  │   │       ▼              ▼              ▼                   │    │       │
│  │   │  [Save L1]      [Save L2]      [Save L3]               │    │       │
│  │   └─────────────────────┬───────────────────────────────────┘    │       │
│  │                         │                                         │       │
│  │   ┌─────────────────────▼───────────────────────────────────┐    │       │
│  │   │  STAGE 2: SEMANTIC CLUSTERING                           │    │       │
│  │   │                                                         │    │       │
│  │   │  - Flatten all fields from L1, L2, L3                  │    │       │
│  │   │  - Generate embeddings (or LLM similarity)             │    │       │
│  │   │  - Cluster at 0.85 threshold                           │    │       │
│  │   │  - Select canonical representatives                    │    │       │
│  │   │  - Track source provenance per field                   │    │       │
│  │   │                                                         │    │       │
│  │   │  [Save Clustered]                                       │    │       │
│  │   └─────────────────────┬───────────────────────────────────┘    │       │
│  │                         │                                         │       │
│  │   ┌─────────────────────▼───────────────────────────────────┐    │       │
│  │   │  STAGE 3: DOMAIN GROUPING                               │    │       │
│  │   │                                                         │    │       │
│  │   │  - Group fields into semantic domains                  │    │       │
│  │   │  - business_identity, contact_info, owner_info, etc.   │    │       │
│  │   │  - Generate conversation openers per domain            │    │       │
│  │   │                                                         │    │       │
│  │   │  [Save Grouped]                                         │    │       │
│  │   └─────────────────────┬───────────────────────────────────┘    │       │
│  │                         │                                         │       │
│  │   ┌─────────────────────▼───────────────────────────────────┐    │       │
│  │   │  STAGE 4: DOCUMENT MAPPING (if document available)      │    │       │
│  │   │                                                         │    │       │
│  │   │  - Analyze document structure (PDF fields, HTML forms) │    │       │
│  │   │  - Map FIL fields to document locations                │    │       │
│  │   │  - Calculate mapping confidence                        │    │       │
│  │   │                                                         │    │       │
│  │   │  [Save Mapped]                                          │    │       │
│  │   └─────────────────────┬───────────────────────────────────┘    │       │
│  │                         │                                         │       │
│  │   ┌─────────────────────▼───────────────────────────────────┐    │       │
│  │   │  STAGE 5: QUALITY SCORING                               │    │       │
│  │   │                                                         │    │       │
│  │   │  - Coverage (FIL fields / Document fields)             │    │       │
│  │   │  - Precision (Mapped fields / Total FIL fields)        │    │       │
│  │   │  - Efficiency (Fields / Questions)                     │    │       │
│  │   │  - Consensus (Multi-source fields / Total)             │    │       │
│  │   │  - Total weighted score                                │    │       │
│  │   │                                                         │    │       │
│  │   │  [Save Scored]                                          │    │       │
│  │   └─────────────────────┬───────────────────────────────────┘    │       │
│  │                         │                                         │       │
│  │   ┌─────────────────────▼───────────────────────────────────┐    │       │
│  │   │  STAGE 6: FIL ASSEMBLY                                  │    │       │
│  │   │                                                         │    │       │
│  │   │  - Build FILOutput with all components                 │    │       │
│  │   │  - Add conversation prompts                            │    │       │
│  │   │  - Add validation rules                                │    │       │
│  │   │  - Add business rules (conditionals)                   │    │       │
│  │   │                                                         │    │       │
│  │   │  [Save Final FIL]                                       │    │       │
│  │   └─────────────────────────────────────────────────────────┘    │       │
│  │                                                                   │       │
│  └───────────────────────────────┬──────────────────────────────────┘       │
│                                  │                                           │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                         FILOutput                                 │       │
│  │  - information_domains with fields                                │       │
│  │  - form_fields with mappings                                      │       │
│  │  - conversation_guide                                             │       │
│  │  - quality_score                                                  │       │
│  │  - source_provenance                                              │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Diagram

```
fil/
├── __init__.py                    # Module exports
├── semantic_config.py             # Configuration dataclasses + loader
├── semantic_schema.py             # Extended FIL schema with provenance
├── semantic_extractor.py          # 3-level LLM interrogation
├── semantic_clusterer.py          # Field clustering + deduplication
├── semantic_mapper.py             # Document structure analysis + mapping
├── semantic_scorer.py             # Quality scoring
├── semantic_generator.py          # Main orchestrator
├── semantic_fallback.py           # Fallback FIL generation
├── semantic_tracer.py             # Trace file management
├── integration.py                 # EXISTING - FILInput/FILOutput (from 6985314)
├── cohort_generator.py            # EXISTING - Requirement grouping
└── config/
    ├── questions.yaml             # Domain questions (mutable)
    ├── domains.yaml               # Domain patterns (mutable)
    ├── thresholds.yaml            # Scoring thresholds (mutable)
    └── prompts.yaml               # LLM prompt templates (mutable)
```

---

## 5. Component Specifications

### 5.1 SemanticConfig (`semantic_config.py`)

**Purpose**: Load and manage all configuration for semantic FIL generation.

```python
@dataclass
class DomainQuestion:
    """A single domain question."""
    id: str                    # e.g., "who_completes"
    question: str              # The actual question text
    category: str              # "core", "important", "optional"
    field_yield: float         # Expected field yield (from experiments)
    criticality: str           # "essential", "high", "medium", "low"

@dataclass
class ClusteringConfig:
    """Configuration for semantic clustering."""
    similarity_threshold: float = 0.85
    min_cluster_size: int = 1
    embedding_method: str = "llm"  # "llm" or "sentence_transformer"

@dataclass
class ScoringConfig:
    """Configuration for quality scoring."""
    coverage_weight: float = 0.30
    precision_weight: float = 0.25
    confidence_weight: float = 0.20
    efficiency_weight: float = 0.15
    consensus_weight: float = 0.10
    production_threshold: float = 85.0

@dataclass
class CostConfig:
    """LLM cost tracking configuration."""
    model_costs: Dict[str, float]  # e.g., {"claude-3-haiku": 0.00025}
    max_cost_per_fil: float = 0.05
    warn_threshold: float = 0.03

@dataclass
class SemanticFILConfig:
    """Master configuration for semantic FIL generation."""
    questions: List[DomainQuestion]
    clustering: ClusteringConfig
    scoring: ScoringConfig
    costs: CostConfig
    domain_patterns: Dict[str, List[str]]  # Domain name -> keyword patterns
    
    @classmethod
    def load(cls, config_dir: Path) -> "SemanticFILConfig":
        """Load configuration from YAML files."""
        
    def get_questions_by_category(self, category: str) -> List[DomainQuestion]:
        """Get questions filtered by category."""
        
    def get_active_questions(self) -> List[DomainQuestion]:
        """Get all active questions (core + important + optionally optional)."""
```

**Key Design Decisions**:
1. Questions are external YAML, not hardcoded
2. All thresholds configurable
3. Cost limits enforced
4. Domain patterns learned/configured, not coded

### 5.2 SemanticExtractor (`semantic_extractor.py`)

**Purpose**: Extract semantic domains from content at each level using LLM interrogation.

```python
@dataclass
class ExtractionResult:
    """Result from a single level of extraction."""
    level: int                           # 1, 2, or 3
    source: str                          # "gsp", "candidate:<url>", "document"
    source_confidence: float             # 0.6 for L1, 0.8 for L2, 1.0 for L3
    question_responses: Dict[str, Any]   # Question ID -> response
    extracted_fields: List[ExtractedField]
    llm_cost: float                       # Cost of this extraction
    extraction_time: float                # Seconds
    
@dataclass
class ExtractedField:
    """A single field extracted from content."""
    field_id: str                        # Normalized field name
    field_text: str                      # Original text
    source: str                          # Where it came from
    level: int                           # 1, 2, or 3
    confidence: float                    # Source confidence
    question_id: str                     # Which question produced it
    context: str                         # Surrounding context (for debugging)

class SemanticExtractor:
    """Extracts semantic domains using LLM interrogation."""
    
    def __init__(self, config: SemanticFILConfig, llm_client: Any):
        self.config = config
        self.llm = llm_client
        self.cost_tracker = CostTracker()
        
    def extract_level1_gsp(
        self, 
        fil_input: FILInput
    ) -> ExtractionResult:
        """
        Extract from GSP-level information (requirement name + description).
        
        Uses "lossy decompression" - LLM infers what information is typically
        needed for this type of requirement.
        
        Input: requirement_name, jurisdiction, issuing_authority, gsp_description
        Output: ExtractionResult with inferred fields
        """
        
    def extract_level2_candidates(
        self, 
        fil_input: FILInput,
        candidates: List[CandidateDocument]
    ) -> List[ExtractionResult]:
        """
        Extract from candidate documents (supporting docs, instructions).
        
        Uses "anchored expansion" - LLM extracts specific details mentioned
        in supporting documentation.
        
        Input: Top N candidates with score >= threshold
        Output: List of ExtractionResult, one per candidate
        """
        
    def extract_level3_document(
        self, 
        fil_input: FILInput,
        document_content: str
    ) -> ExtractionResult:
        """
        Extract from final selected document (PDF/HTML form).
        
        This is "ground truth" - actual fields from the official form.
        
        Input: Document text content
        Output: ExtractionResult with form fields
        """
        
    def _interrogate_content(
        self,
        content: str,
        source_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ask all configured domain questions against content.
        
        Returns structured response with:
        - info_required: List of fields
        - docs_required: List of documents
        - who_completes: String
        - etc.
        """
        
    def _build_extraction_prompt(
        self,
        content: str,
        source_type: str,
        questions: List[DomainQuestion]
    ) -> str:
        """Build the LLM prompt for extraction."""
```

**Key Design Decisions**:
1. Each level produces an `ExtractionResult` that's immediately saved
2. Cost tracked per extraction
3. Questions come from config, not hardcoded
4. Confidence varies by level (L1=0.6, L2=0.8, L3=1.0)

### 5.3 SemanticClusterer (`semantic_clusterer.py`)

**Purpose**: Cluster semantically similar fields and deduplicate.

```python
@dataclass
class FieldCluster:
    """A cluster of semantically similar fields."""
    cluster_id: str
    canonical_field: ExtractedField      # The representative field
    members: List[ExtractedField]        # All fields in cluster
    sources: Set[str]                    # Unique sources
    source_count: int                    # Number of sources (consensus)
    max_level: int                       # Highest level (1, 2, or 3)
    avg_confidence: float

@dataclass  
class ClusteringResult:
    """Result from clustering operation."""
    clusters: List[FieldCluster]
    total_input_fields: int
    total_output_fields: int             # = len(clusters)
    deduplication_rate: float            # (input - output) / input
    clustering_time: float

class SemanticClusterer:
    """Clusters and deduplicates fields across extraction levels."""
    
    def __init__(self, config: SemanticFILConfig):
        self.config = config
        self.similarity_threshold = config.clustering.similarity_threshold
        
    def cluster_fields(
        self,
        level1_result: ExtractionResult,
        level2_results: List[ExtractionResult],
        level3_result: Optional[ExtractionResult]
    ) -> ClusteringResult:
        """
        Cluster all extracted fields across levels.
        
        Algorithm:
        1. Flatten all fields into single list with provenance
        2. Normalize field names
        3. Compute pairwise similarity (LLM or embedding)
        4. Hierarchical clustering with threshold
        5. Select canonical representative per cluster
        6. Track source provenance
        """
        
    def _flatten_fields(
        self,
        *results: ExtractionResult
    ) -> List[ExtractedField]:
        """Flatten all fields from multiple results."""
        
    def _normalize_field_name(self, field_text: str) -> str:
        """
        Normalize field name for comparison.
        
        - Lowercase
        - Remove special characters
        - Replace whitespace with underscore
        - Apply common abbreviation mappings
        """
        
    def _compute_similarity_matrix(
        self,
        fields: List[ExtractedField]
    ) -> np.ndarray:
        """
        Compute pairwise similarity between all fields.
        
        Method depends on config:
        - "llm": Ask LLM to rate similarity
        - "embedding": Use sentence embeddings + cosine similarity
        """
        
    def _select_canonical(
        self,
        cluster_members: List[ExtractedField]
    ) -> ExtractedField:
        """
        Select the canonical representative for a cluster.
        
        Priority:
        1. Highest level (L3 > L2 > L1)
        2. Highest confidence
        3. Most specific name
        """
```

**Key Design Decisions**:
1. Preserves source provenance through clustering
2. Configurable similarity threshold (default 0.85)
3. Multiple similarity methods supported
4. Canonical selection prioritizes ground truth (L3)

### 5.4 SemanticMapper (`semantic_mapper.py`)

**Purpose**: Map FIL fields to actual document structure.

```python
@dataclass
class DocumentStructure:
    """Analyzed structure of a document."""
    document_type: str                   # "pdf_form", "html_form", "portal", etc.
    sections: List[DocumentSection]
    fields: List[DocumentField]
    total_field_count: int

@dataclass
class DocumentField:
    """A field found in the document."""
    field_id: str
    field_name: str
    field_type: str                      # "text", "checkbox", "dropdown", etc.
    location: str                        # "Line 1", "Section A", "Page 2", etc.
    nearby_text: str                     # Text near the field (for proximity matching)
    
@dataclass
class FieldMapping:
    """Mapping between a FIL field and document field."""
    fil_field_id: str
    document_field_id: Optional[str]
    document_location: Optional[str]
    mapping_confidence: float            # 0.0 - 1.0
    mapping_method: str                  # "exact", "semantic", "proximity", "none"

@dataclass
class MappingResult:
    """Result from mapping operation."""
    mappings: List[FieldMapping]
    document_structure: DocumentStructure
    mapped_count: int
    unmapped_fields: List[str]
    mapping_time: float

class SemanticMapper:
    """Maps FIL fields to document structure."""
    
    def __init__(self, config: SemanticFILConfig, llm_client: Any):
        self.config = config
        self.llm = llm_client
        
    def analyze_document(
        self,
        document_path: Path,
        document_type: str
    ) -> DocumentStructure:
        """
        Analyze document structure.
        
        Strategies by type:
        - PDF: Extract form fields using PyPDF2/pdfplumber
        - HTML: Parse form elements
        - Portal: LLM-based field identification
        """
        
    def map_fields(
        self,
        clusters: List[FieldCluster],
        document_structure: DocumentStructure
    ) -> MappingResult:
        """
        Map FIL fields to document fields.
        
        Strategies (in priority order):
        1. Exact match (normalized names equal)
        2. Semantic match (embeddings > 0.7)
        3. Proximity match (FIL field name in nearby_text)
        4. No match (unmapped)
        """
        
    def _analyze_pdf(self, path: Path) -> DocumentStructure:
        """Extract structure from PDF form."""
        
    def _analyze_html(self, path: Path) -> DocumentStructure:
        """Extract structure from HTML page."""
        
    def _find_best_match(
        self,
        fil_field: str,
        document_fields: List[DocumentField]
    ) -> FieldMapping:
        """Find the best matching document field for a FIL field."""
```

**Key Design Decisions**:
1. Multiple document type analyzers
2. Tiered matching strategies
3. Captures unmapped fields for analysis
4. Mapping confidence scored

### 5.5 SemanticScorer (`semantic_scorer.py`)

**Purpose**: Calculate quality scores for generated FILs.

```python
@dataclass
class QualityScore:
    """Comprehensive quality score for a FIL."""
    total_score: float                   # 0-100 weighted total
    coverage: float                      # FIL covers document fields
    precision: float                     # FIL fields are accurate
    efficiency: float                    # Fields per question ratio
    consensus: float                     # Multi-source confirmation
    avg_confidence: float                # Average mapping confidence
    
    production_ready: bool               # total_score >= threshold
    
    # Diagnostic details
    total_fil_fields: int
    total_doc_fields: int
    mapped_field_count: int
    unmapped_fields: List[str]
    multi_source_fields: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""

class SemanticScorer:
    """Scores FIL quality."""
    
    def __init__(self, config: SemanticFILConfig):
        self.config = config
        self.weights = config.scoring
        
    def score(
        self,
        clusters: List[FieldCluster],
        mapping_result: MappingResult
    ) -> QualityScore:
        """
        Calculate comprehensive quality score.
        
        Formula:
        total = (coverage * 0.30) + (precision * 0.25) + 
                (confidence * 0.20) + (efficiency * 0.15) + (consensus * 0.10)
        """
        
    def _calculate_coverage(
        self,
        mapped_count: int,
        doc_field_count: int
    ) -> float:
        """Coverage = mapped / document fields."""
        
    def _calculate_precision(
        self,
        mapped_count: int,
        total_fil_fields: int
    ) -> float:
        """Precision = mapped / total FIL fields."""
        
    def _calculate_efficiency(
        self,
        total_fields: int,
        question_count: int
    ) -> float:
        """Efficiency = fields / questions (capped at 1.0)."""
        
    def _calculate_consensus(
        self,
        clusters: List[FieldCluster]
    ) -> float:
        """Consensus = multi-source fields / total fields."""
```

### 5.6 SemanticFallback (`semantic_fallback.py`)

**Purpose**: Generate fallback FILs when documents unavailable.

```python
class SemanticFallback:
    """Generates fallback FILs from GSP data only."""
    
    def __init__(self, config: SemanticFILConfig, llm_client: Any):
        self.config = config
        self.llm = llm_client
        
    def generate_fallback(
        self,
        fil_input: FILInput,
        level1_result: Optional[ExtractionResult] = None
    ) -> "SemanticFILOutput":
        """
        Generate a fallback FIL when document not available.
        
        Strategies:
        1. If L1 extraction exists, use those fields
        2. Otherwise, use GSP description to infer fields
        3. Generate generic guidance based on requirement type
        """
        
    def _generate_generic_guidance(
        self,
        requirement_name: str,
        jurisdiction: str,
        issuing_authority: str
    ) -> Dict[str, Any]:
        """Generate generic process guidance."""
```

### 5.7 SemanticTracer (`semantic_tracer.py`)

**Purpose**: Manage trace files for observability and checkpointing.

```python
@dataclass
class TraceMetadata:
    """Metadata for a trace file."""
    stage: str                           # "level1", "level2", "clustered", etc.
    requirement_id: str
    timestamp: datetime
    duration_seconds: float
    llm_cost: float
    success: bool
    error_message: Optional[str]

class SemanticTracer:
    """Manages trace files for semantic FIL generation."""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.traces_dir = output_dir / "fil_traces"
        self.traces_dir.mkdir(parents=True, exist_ok=True)
        
    def save_extraction(
        self,
        requirement_id: str,
        level: int,
        result: ExtractionResult
    ) -> Path:
        """Save extraction result to trace file."""
        filename = f"{requirement_id}_level{level}_{result.source}.json"
        # ...
        
    def save_clustering(
        self,
        requirement_id: str,
        result: ClusteringResult
    ) -> Path:
        """Save clustering result to trace file."""
        
    def save_mapping(
        self,
        requirement_id: str,
        result: MappingResult
    ) -> Path:
        """Save mapping result to trace file."""
        
    def save_score(
        self,
        requirement_id: str,
        score: QualityScore
    ) -> Path:
        """Save quality score to trace file."""
        
    def save_final(
        self,
        requirement_id: str,
        fil_output: "SemanticFILOutput"
    ) -> Path:
        """Save final FIL output."""
        
    def load_checkpoint(
        self,
        requirement_id: str,
        stage: str
    ) -> Optional[Any]:
        """Load a checkpoint if it exists (for resume)."""
        
    def get_trace_summary(
        self,
        requirement_id: str
    ) -> Dict[str, TraceMetadata]:
        """Get summary of all traces for a requirement."""
```

### 5.8 SemanticFILGenerator (`semantic_generator.py`)

**Purpose**: Main orchestrator that coordinates all components.

```python
@dataclass
class SemanticFILOutput:
    """Extended FIL output with semantic provenance."""
    # Standard FIL fields (from FILOutput)
    fil_version: str = "2.0"
    requirement_id: str = ""
    requirement_name: str = ""
    
    # Semantic domains with provenance
    information_domains: List[InformationDomain] = field(default_factory=list)
    
    # Form fields with mappings
    form_fields: List[SemanticField] = field(default_factory=list)
    
    # Conversation guide
    conversation_opener: str = ""
    domain_transitions: Dict[str, str] = field(default_factory=dict)
    
    # Quality metrics
    quality_score: QualityScore = None
    
    # Provenance
    extraction_levels_used: List[int] = field(default_factory=list)
    source_documents: List[str] = field(default_factory=list)
    generation_method: str = "semantic"  # "semantic", "fallback"
    
    # Cost tracking
    total_llm_cost: float = 0.0
    generation_time_seconds: float = 0.0

@dataclass
class InformationDomain:
    """A semantic domain grouping related fields."""
    domain_id: str
    domain_name: str
    conversation_opener: str
    fields: List[SemanticField]
    field_count: int

@dataclass
class SemanticField:
    """A field with full semantic provenance."""
    field_id: str
    field_name: str
    field_type: str
    required: bool
    
    # Conversation
    natural_question: str
    help_text: str
    
    # Provenance
    sources: List[str]                   # Which levels/docs it came from
    source_count: int                    # Consensus count
    confidence: float
    
    # Mapping (if document available)
    maps_to_document_field: Optional[str]
    document_location: Optional[str]
    mapping_confidence: float

class SemanticFILGenerator:
    """
    Main orchestrator for semantic FIL generation.
    
    Coordinates all components to produce high-quality FILs.
    """
    
    def __init__(
        self,
        config_dir: Path = None,
        output_dir: Path = None,
        llm_client: Any = None,
        verbose: bool = False
    ):
        self.config = SemanticFILConfig.load(config_dir)
        self.output_dir = output_dir
        self.verbose = verbose
        
        # Initialize components
        self.extractor = SemanticExtractor(self.config, llm_client)
        self.clusterer = SemanticClusterer(self.config)
        self.mapper = SemanticMapper(self.config, llm_client)
        self.scorer = SemanticScorer(self.config)
        self.fallback = SemanticFallback(self.config, llm_client)
        self.tracer = SemanticTracer(output_dir)
        
        # Cost tracking
        self.cost_tracker = CostTracker()
        
    def generate(
        self,
        fil_input: FILInput,
        candidates: List[CandidateDocument] = None,
        document_content: str = None,
        resume_from: str = None  # Checkpoint to resume from
    ) -> SemanticFILOutput:
        """
        Generate a semantic FIL for a single requirement.
        
        Args:
            fil_input: Input from FILIntegrator
            candidates: Optional list of candidate documents
            document_content: Optional extracted document text
            resume_from: Optional checkpoint stage to resume from
            
        Returns:
            SemanticFILOutput with full provenance
        """
        start_time = time.time()
        
        try:
            # Stage 1: Three-level extraction
            level1_result = self._extract_level1(fil_input, resume_from)
            level2_results = self._extract_level2(fil_input, candidates, resume_from)
            level3_result = self._extract_level3(fil_input, document_content, resume_from)
            
            # Check if we have any extraction results
            if not any([level1_result, level2_results, level3_result]):
                return self.fallback.generate_fallback(fil_input)
            
            # Stage 2: Clustering
            clustering_result = self._cluster_fields(
                level1_result, level2_results, level3_result, resume_from
            )
            
            # Stage 3: Domain grouping
            domains = self._group_into_domains(clustering_result)
            
            # Stage 4: Document mapping (if document available)
            mapping_result = None
            if fil_input.document_path and fil_input.document_path.exists():
                mapping_result = self._map_to_document(
                    clustering_result, fil_input, resume_from
                )
            
            # Stage 5: Quality scoring
            quality_score = self._score_quality(
                clustering_result, mapping_result
            )
            
            # Stage 6: Assemble final FIL
            output = self._assemble_fil(
                fil_input, domains, clustering_result, 
                mapping_result, quality_score
            )
            
            # Track timing
            output.generation_time_seconds = time.time() - start_time
            output.total_llm_cost = self.cost_tracker.total_cost
            
            # Save final output
            self.tracer.save_final(fil_input.requirement_id, output)
            
            return output
            
        except Exception as e:
            self.log(f"Error generating FIL: {e}")
            # Fallback on any error
            return self.fallback.generate_fallback(fil_input, level1_result)
    
    def generate_batch(
        self,
        fil_inputs: List[FILInput],
        candidates_by_req: Dict[str, List[CandidateDocument]] = None,
        documents_by_req: Dict[str, str] = None
    ) -> List[SemanticFILOutput]:
        """Generate FILs for multiple requirements."""
        outputs = []
        for fil_input in fil_inputs:
            candidates = (candidates_by_req or {}).get(fil_input.requirement_id, [])
            document = (documents_by_req or {}).get(fil_input.requirement_id)
            output = self.generate(fil_input, candidates, document)
            outputs.append(output)
        return outputs
        
    def _extract_level1(self, fil_input, resume_from) -> Optional[ExtractionResult]:
        """Stage 1a: Extract from GSP."""
        if resume_from and resume_from != "level1":
            cached = self.tracer.load_checkpoint(fil_input.requirement_id, "level1")
            if cached:
                return cached
                
        result = self.extractor.extract_level1_gsp(fil_input)
        self.tracer.save_extraction(fil_input.requirement_id, 1, result)
        return result
        
    # ... similar methods for other stages ...
    
    def log(self, message: str):
        """Log message if verbose."""
        if self.verbose:
            print(f"[SemanticFILGenerator] {message}")
```

---

## 6. Data Flow & Persistence

### 6.1 Trace File Structure

```
output/dossier_restaurant_brookline_ma/
├── 01_gsp_requirements.json          # Input (from Phase 1)
├── 03_raw_candidates.json            # Input (from Phase 3)
├── 04_scorer_decisions.json          # Input (from Phase 4)
├── 05_content_downloads.json         # Input (from Phase 5)
├── dossier_assessment.json           # Input (from Phase 6)
│
├── fil_traces/                       # NEW: Semantic FIL traces
│   ├── federal_form_ss_4/
│   │   ├── level1_gsp.json
│   │   ├── level2_candidate_irs_gov.json
│   │   ├── level2_candidate_instructions.json
│   │   ├── level3_document.json
│   │   ├── clustered.json
│   │   ├── grouped.json
│   │   ├── mapped.json
│   │   ├── scored.json
│   │   └── final.json
│   ├── brookline_common_victualler/
│   │   └── ...
│   └── _summary.json                 # Aggregated metrics
│
├── enhanced_fils/                    # Final FIL outputs
│   ├── federal_form_ss_4_enhanced_fil.json
│   ├── brookline_common_victualler_enhanced_fil.json
│   └── ...
│
└── 06_fil_generation.json            # NEW: Generation summary
```

### 6.2 Trace File Schemas

**Level Extraction Trace** (`level1_gsp.json`):
```json
{
  "trace_version": "1.0",
  "requirement_id": "federal_form_ss_4",
  "stage": "level1_extraction",
  "timestamp": "2026-01-06T10:30:00Z",
  "duration_seconds": 2.3,
  "llm_cost": 0.0012,
  
  "input": {
    "content_type": "gsp_description",
    "content_length": 450,
    "questions_asked": 12
  },
  
  "output": {
    "fields_extracted": 13,
    "fields": [
      {
        "field_id": "legal_name",
        "field_text": "Legal name of entity",
        "question_id": "info_required",
        "confidence": 0.6
      }
    ],
    "question_responses": {
      "who_completes": "Business owner or responsible party",
      "info_required": ["legal_name", "trade_name", ...],
      ...
    }
  }
}
```

**Clustering Trace** (`clustered.json`):
```json
{
  "trace_version": "1.0",
  "requirement_id": "federal_form_ss_4",
  "stage": "clustering",
  "timestamp": "2026-01-06T10:30:05Z",
  "duration_seconds": 1.2,
  
  "input": {
    "total_fields": 49,
    "from_level1": 13,
    "from_level2": 8,
    "from_level3": 28
  },
  
  "output": {
    "clusters": 30,
    "deduplication_rate": 0.39,
    "clusters_detail": [
      {
        "cluster_id": "C1",
        "canonical_field": "legal_name",
        "members": ["legal_name", "legal_name_of_entity"],
        "sources": ["gsp", "document"],
        "source_count": 2,
        "max_level": 3
      }
    ]
  }
}
```

**Quality Score Trace** (`scored.json`):
```json
{
  "trace_version": "1.0",
  "requirement_id": "federal_form_ss_4",
  "stage": "scoring",
  "timestamp": "2026-01-06T10:30:08Z",
  
  "scores": {
    "total_score": 91.8,
    "coverage": 100,
    "precision": 93,
    "efficiency": 85,
    "consensus": 73,
    "avg_confidence": 92
  },
  
  "diagnostics": {
    "total_fil_fields": 30,
    "total_doc_fields": 28,
    "mapped_count": 28,
    "unmapped_fields": ["foreign_country", "withholding_agent_date"],
    "multi_source_fields": 22
  },
  
  "production_ready": true
}
```

### 6.3 Checkpoint/Resume Protocol

```python
# Resume from clustering stage (skip extraction)
generator.generate(
    fil_input,
    resume_from="clustering"
)

# Resume logic in generator:
def _extract_level1(self, fil_input, resume_from):
    if resume_from in ["clustering", "mapping", "scoring", "final"]:
        # Load from checkpoint
        return self.tracer.load_checkpoint(fil_input.requirement_id, "level1")
    # Otherwise extract fresh
    ...
```

---

## 7. Configuration System

### 7.1 Questions Configuration (`config/questions.yaml`)

```yaml
# Domain questions for semantic extraction
# Derived from experimental optimization (12 questions optimal)

questions:
  core:
    # CRITICAL: These produce ~60% of fields
    - id: who_completes
      question: "Who is responsible for completing this requirement?"
      field_yield: 2.3
      criticality: high
      
    - id: who_reviews
      question: "Who reviews or approves this requirement?"
      field_yield: 1.5
      criticality: high
      
    - id: info_required
      question: |
        What specific information must be provided? 
        List ALL data fields, form fields, checkboxes, and required inputs.
        Be exhaustive - include every piece of information needed.
      field_yield: 15.3
      criticality: essential
      
    - id: docs_required
      question: "What supporting documents must be submitted with this requirement?"
      field_yield: 4.7
      criticality: essential
      
    - id: when_due
      question: "When must this be completed? What triggers this requirement?"
      field_yield: 1.5
      criticality: medium
      
    - id: submission_method
      question: "How is this submitted? (online portal, mail, in-person, fax)"
      field_yield: 2.1
      criticality: essential

  important:
    # HIGH VALUE: These add ~25% more fields
    - id: who_else
      question: "Who else is involved in this process? (other departments, inspectors)"
      field_yield: 3.0
      criticality: high
      
    - id: format_requirements
      question: "What format requirements or constraints exist for the information?"
      field_yield: 1.2
      criticality: medium
      
    - id: rejection_reasons
      question: "What common mistakes or issues cause rejection or delays?"
      field_yield: 1.7
      criticality: low
      
    - id: verification_method
      question: "How does the authority verify or validate the information provided?"
      field_yield: 1.8
      criticality: medium

  optional:
    # WORKFLOW: Lower field yield but important for FIL flow
    - id: renewal_frequency
      question: "How often must this be renewed to maintain compliance?"
      field_yield: 0.5
      criticality: low
      
    - id: prerequisites
      question: "What must be completed before this requirement can be started?"
      field_yield: 0.3
      criticality: low

# Which categories to use by default
active_categories:
  - core
  - important
  # optional: enable for comprehensive extraction
```

### 7.2 Domain Patterns Configuration (`config/domains.yaml`)

```yaml
# Semantic domain patterns for field grouping
# ZERO-HARDCODING: These are generic patterns, not geography-specific

domains:
  business_identity:
    display_name: "Business Information"
    conversation_opener: "Let's start with your business details."
    patterns:
      - business_name
      - legal_name
      - dba
      - trade_name
      - entity_type
      - ein
      - fein
      - ssn
      - tax_id
      - date_established
      - date_started
      
  contact_info:
    display_name: "Contact Information"
    conversation_opener: "Now I need your contact information."
    patterns:
      - address
      - street
      - city
      - state
      - zip
      - phone
      - email
      - fax
      - mailing
      - physical
      
  owner_info:
    display_name: "Owner/Principal Information"
    conversation_opener: "Tell me about the business owner or principal."
    patterns:
      - owner
      - principal
      - officer
      - director
      - member
      - partner
      - responsible_party
      - citizenship
      - dob
      - birth
      
  manager_info:
    display_name: "Manager Information"
    conversation_opener: "Who will be managing the day-to-day operations?"
    patterns:
      - manager
      - alternate
      - backup
      - record
      
  premises_info:
    display_name: "Premises Details"
    conversation_opener: "Let's talk about your business location."
    patterns:
      - square_footage
      - seating
      - capacity
      - occupant
      - parking
      - floor
      - stories
      - zoning
      
  operations:
    display_name: "Operations"
    conversation_opener: "How will your business operate?"
    patterns:
      - hours
      - days
      - service
      - food
      - alcohol
      - entertainment
      - outdoor
      - music
      
  permits_docs:
    display_name: "Required Documents"
    conversation_opener: "You'll need to gather some documents."
    patterns:
      - permit
      - license
      - certificate
      - inspection
      - affidavit
      - insurance
      - attached
      - required
      
  certification:
    display_name: "Certification & Signature"
    conversation_opener: "Finally, let's complete the certification."
    patterns:
      - signature
      - sign
      - date
      - title
      - certify
      - attest
      
  other:
    display_name: "Additional Information"
    conversation_opener: "A few more details are needed."
    patterns: []  # Catch-all for unmatched fields
```

### 7.3 Thresholds Configuration (`config/thresholds.yaml`)

```yaml
# Thresholds and weights for semantic FIL generation
# Derived from experimental validation

clustering:
  similarity_threshold: 0.85        # From experiment tuning
  min_cluster_size: 1
  embedding_method: llm             # "llm" or "sentence_transformer"
  
scoring:
  weights:
    coverage: 0.30
    precision: 0.25
    confidence: 0.20
    efficiency: 0.15
    consensus: 0.10
  
  thresholds:
    production_ready: 85.0          # Minimum score for production use
    high_quality: 90.0              # Target for optimization
    
extraction:
  candidate_score_threshold: 0.7    # Min score to include candidate
  max_candidates: 5                 # Max candidates for L2 extraction
  content_max_chars: 8000           # Truncate content for LLM
  
confidence:
  level1: 0.6                       # GSP extraction confidence
  level2: 0.8                       # Candidate extraction confidence  
  level3: 1.0                       # Document extraction confidence (ground truth)
  
mapping:
  exact_match_threshold: 1.0
  semantic_match_threshold: 0.7
  proximity_match_threshold: 0.6
```

### 7.4 LLM Prompts Configuration (`config/prompts.yaml`)

```yaml
# LLM prompt templates for semantic extraction
# Separated from code for easy tuning

extraction:
  system_prompt: |
    You are an expert at analyzing regulatory requirements and forms.
    Your task is to extract structured information from the provided content.
    Be thorough and precise. List every field, requirement, and detail.
    
  level1_prompt: |
    Analyze this regulatory requirement and answer each question based on
    your knowledge of how such requirements typically work.
    
    Requirement: {requirement_name}
    Authority: {issuing_authority}
    Jurisdiction: {jurisdiction}
    Description: {gsp_description}
    
    For the "info_required" question, be exhaustive - list every piece of
    information that is typically required, including all form fields.
    
    QUESTIONS:
    {questions_json}
    
    Respond in JSON format with each question ID as a key.
    For "info_required" and "docs_required", provide arrays of strings.
    
  level2_prompt: |
    Analyze this supporting document for a regulatory requirement.
    Extract any additional details about what information is needed.
    
    Requirement: {requirement_name}
    Document Source: {source_url}
    
    CONTENT (first {max_chars} characters):
    {content}
    
    QUESTIONS:
    {questions_json}
    
    Focus on specific details mentioned in this document.
    If the content doesn't address a question, respond with "Not specified".
    
  level3_prompt: |
    Analyze this official form/document and extract ALL fields.
    This is the actual form that must be completed.
    
    Requirement: {requirement_name}
    Document Type: {document_type}
    
    CONTENT:
    {content}
    
    For "info_required", list EVERY field on the form, including:
    - Text fields
    - Checkboxes
    - Dropdown selections
    - Signature fields
    - Date fields
    
    Include the field name and any line numbers if visible.

clustering:
  similarity_prompt: |
    Rate the semantic similarity between these two field names on a scale of 0-1.
    Consider if they refer to the same piece of information.
    
    Field 1: {field1}
    Field 2: {field2}
    
    Respond with only a number between 0 and 1.

conversation:
  natural_question_prompt: |
    Convert this form field into a natural conversational question.
    Make it friendly and clear for someone filling out a business form.
    
    Field: {field_name}
    Context: {context}
    
    Respond with only the question, no explanation.
```

---

## 8. Fallback Mechanisms

### 8.1 Fallback Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FALLBACK HIERARCHY                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Level 3 Available (Full Document)                                  │
│  ├── Use L1 + L2 + L3 extraction                                   │
│  ├── Full clustering and mapping                                   │
│  └── Quality: HIGH (expected score 90+)                            │
│                                                                     │
│  Level 3 Failed, Level 2 Available (Candidates Only)               │
│  ├── Use L1 + L2 extraction                                        │
│  ├── Clustering without ground truth                               │
│  ├── No document mapping (skip stage)                              │
│  └── Quality: MEDIUM (expected score 75-85)                        │
│                                                                     │
│  Level 2 Failed, Level 1 Only (GSP Only)                           │
│  ├── Use L1 extraction only                                        │
│  ├── No clustering (single source)                                 │
│  ├── No document mapping                                           │
│  └── Quality: LOW (expected score 60-75)                           │
│                                                                     │
│  All Extraction Failed (Pure Fallback)                             │
│  ├── Generate from GSP description only                            │
│  ├── Use generic templates for requirement type                    │
│  ├── Provide general guidance                                      │
│  └── Quality: MINIMAL (expected score 40-60)                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Fallback Triggers

| Condition | Trigger | Fallback Action |
|-----------|---------|-----------------|
| Document not downloaded | `fil_input.download_success == False` | Skip L3, use L1+L2 |
| Document parse failed | Exception in L3 extraction | Skip L3, use L1+L2 |
| No candidates available | Empty candidate list | Skip L2, use L1+L3 |
| All candidates low score | All scores < 0.7 | Skip L2, use L1+L3 |
| L1 extraction failed | Exception in L1 extraction | Use L2+L3 only |
| Clustering failed | Exception in clustering | Return unclustered fields |
| Mapping failed | Exception in mapping | Return unmapped FIL |
| Total failure | All stages failed | Use pure fallback generator |

### 8.3 Fallback Quality Signals

```python
@dataclass
class FallbackSignals:
    """Signals indicating fallback was used."""
    levels_attempted: List[int]          # [1, 2, 3] or subset
    levels_succeeded: List[int]          # Which actually worked
    fallback_reason: Optional[str]       # Why fallback was needed
    expected_quality: str                # "high", "medium", "low", "minimal"
    confidence_adjustment: float         # Multiply confidence by this
```

---

## 9. Quality Scoring & Metrics

### 9.1 Score Formula

```
Total Score = (Coverage × 0.30) + (Precision × 0.25) + 
              (Confidence × 0.20) + (Efficiency × 0.15) + (Consensus × 0.10)

Where:
- Coverage = min(1.0, mapped_fields / document_fields)
- Precision = mapped_fields / total_fil_fields
- Confidence = avg(mapping_confidence for all mappings)
- Efficiency = min(1.0, total_fields / (question_count × target_efficiency))
- Consensus = multi_source_fields / total_fields
```

### 9.2 Score Interpretation

| Score Range | Quality | Action |
|-------------|---------|--------|
| 90-100 | Excellent | Production ready, consider for RAG bootstrap |
| 85-89 | Good | Production ready |
| 75-84 | Acceptable | Review unmapped fields, consider for production |
| 60-74 | Marginal | Flag for manual review |
| <60 | Poor | Fallback or manual creation needed |

### 9.3 Diagnostic Metrics

```python
@dataclass
class DiagnosticMetrics:
    """Detailed metrics for analysis."""
    
    # Field counts
    total_input_fields: int              # Before deduplication
    total_output_fields: int             # After deduplication
    fields_from_level1: int
    fields_from_level2: int
    fields_from_level3: int
    
    # Deduplication
    deduplication_rate: float            # (input - output) / input
    avg_cluster_size: float
    
    # Mapping
    exact_matches: int
    semantic_matches: int
    proximity_matches: int
    unmapped_count: int
    
    # Sources
    single_source_fields: int
    dual_source_fields: int
    triple_source_fields: int            # Highest confidence
    
    # Efficiency
    fields_per_question: float
    questions_with_zero_yield: List[str]
    
    # Cost
    total_llm_cost: float
    cost_per_field: float
```

---

## 10. Integration with Existing Pipeline

### 10.1 Entry Point

The semantic FIL generator integrates at `FILIntegrator.generate_enhanced_fils()`:

```python
# In fil/integration.py (existing at commit 6985314)

class FILIntegrator:
    def generate_enhanced_fils(self, inputs: List[FILInput]) -> List[FILOutput]:
        """
        Generate Enhanced FILs using semantic extraction.
        
        UPDATED: Now uses SemanticFILGenerator instead of placeholder.
        """
        from fil.semantic_generator import SemanticFILGenerator
        
        generator = SemanticFILGenerator(
            config_dir=self.config_dir,
            output_dir=self.fil_output_path,
            verbose=self.verbose
        )
        
        outputs = []
        for fil_input in inputs:
            # Get candidates for this requirement
            candidates = self._get_candidates_for_requirement(fil_input.requirement_id)
            
            # Get document content if available
            document_content = self._get_document_content(fil_input)
            
            # Generate semantic FIL
            semantic_output = generator.generate(
                fil_input=fil_input,
                candidates=candidates,
                document_content=document_content
            )
            
            # Convert to FILOutput for compatibility
            fil_output = self._convert_to_fil_output(semantic_output)
            outputs.append(fil_output)
            
        return outputs
```

### 10.2 Required Data from Pipeline

| Data | Source File | How to Access |
|------|-------------|---------------|
| Requirements | `01_gsp_requirements.json` | `fil_input.gsp_*` fields |
| Candidates | `03_raw_candidates.json` | Load and filter by requirement |
| Selection | `04_scorer_decisions.json` | Get selected URL and score |
| Download | `05_content_downloads.json` | `fil_input.document_path` |
| Content | `assets/candidates/*.pdf` | Read file content |

### 10.3 Standalone Execution

```python
# scripts/run_semantic_fil.py

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dossier_path", help="Path to dossier output directory")
    parser.add_argument("--requirement", help="Single requirement ID (optional)")
    parser.add_argument("--resume-from", help="Checkpoint to resume from")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    
    # Load existing pipeline outputs
    integrator = FILIntegrator(
        dossier_path=args.dossier_path,
        verbose=args.verbose
    )
    
    # Prepare inputs
    inputs = integrator.prepare_inputs()
    
    if args.requirement:
        inputs = [i for i in inputs if i.requirement_id == args.requirement]
    
    # Generate FILs
    outputs = integrator.generate_enhanced_fils(inputs)
    
    # Save results
    integrator.save_fils(outputs)
    
    # Print summary
    print(f"\nGenerated {len(outputs)} FILs")
    print(f"Production ready: {sum(1 for o in outputs if o.quality_score.production_ready)}")
```

---

## 11. Cost Management

### 11.1 Cost Model

| Operation | Model | Est. Tokens | Est. Cost |
|-----------|-------|-------------|-----------|
| L1 Extraction | Claude Haiku | 2000 | $0.0005 |
| L2 Extraction (per candidate) | Claude Haiku | 3000 | $0.0008 |
| L3 Extraction | Claude Haiku | 4000 | $0.0010 |
| Similarity Check (per pair) | Claude Haiku | 100 | $0.00003 |
| Natural Question Gen | Claude Haiku | 200 | $0.00005 |

**Estimated cost per FIL:**
- With 5 candidates: ~$0.008
- With document mapping: ~$0.012
- Total with overhead: ~$0.015

### 11.2 Cost Tracking

```python
class CostTracker:
    """Track LLM API costs."""
    
    def __init__(self, config: CostConfig):
        self.config = config
        self.calls: List[LLMCall] = []
        self.total_cost = 0.0
        
    def track_call(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        purpose: str
    ) -> float:
        """Track a single LLM call and return its cost."""
        cost = self._calculate_cost(model, input_tokens, output_tokens)
        self.calls.append(LLMCall(
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            purpose=purpose,
            timestamp=datetime.now()
        ))
        self.total_cost += cost
        
        # Check limits
        if self.total_cost > self.config.max_cost_per_fil:
            raise CostLimitExceeded(f"Cost {self.total_cost} exceeds limit")
            
        return cost
        
    def get_summary(self) -> Dict[str, Any]:
        """Get cost summary."""
        return {
            "total_cost": self.total_cost,
            "call_count": len(self.calls),
            "by_purpose": self._group_by_purpose(),
            "by_model": self._group_by_model()
        }
```

### 11.3 Cost Optimization Strategies

1. **Use Haiku for extraction** - Sufficient quality at 1/10th cost
2. **Batch similarity checks** - One call for multiple pairs
3. **Cache repeated extractions** - Same candidate, same result
4. **Truncate content intelligently** - First 8K chars usually sufficient
5. **Skip optional questions** - When cost limit approaching

---

## 12. Testing Strategy

### 12.1 Unit Tests

```python
# tests/test_semantic_extractor.py

class TestSemanticExtractor:
    """Unit tests for semantic extraction."""
    
    def test_level1_extraction_produces_fields(self):
        """L1 extraction should produce field list."""
        
    def test_level1_questions_from_config(self):
        """Should use questions from config, not hardcoded."""
        
    def test_level2_filters_low_score_candidates(self):
        """Should skip candidates below threshold."""
        
    def test_level3_handles_pdf_content(self):
        """Should extract fields from PDF text."""
        
    def test_extraction_tracks_cost(self):
        """Should track LLM cost per extraction."""


# tests/test_semantic_clusterer.py

class TestSemanticClusterer:
    """Unit tests for clustering."""
    
    def test_clusters_similar_fields(self):
        """Fields with >0.85 similarity should cluster."""
        
    def test_preserves_source_provenance(self):
        """Cluster should track which sources contributed."""
        
    def test_selects_highest_level_canonical(self):
        """Should prefer L3 over L2 over L1 for canonical."""
        
    def test_calculates_deduplication_rate(self):
        """Should report correct dedup rate."""


# tests/test_semantic_mapper.py

class TestSemanticMapper:
    """Unit tests for document mapping."""
    
    def test_exact_match_confidence_100(self):
        """Exact name match should have 1.0 confidence."""
        
    def test_semantic_match_above_threshold(self):
        """Semantic match should have confidence > 0.7."""
        
    def test_tracks_unmapped_fields(self):
        """Should report which fields couldn't be mapped."""


# tests/test_semantic_scorer.py

class TestSemanticScorer:
    """Unit tests for quality scoring."""
    
    def test_score_formula(self):
        """Score should match expected formula."""
        
    def test_production_ready_threshold(self):
        """Scores >= 85 should be production ready."""
        
    def test_consensus_rewards_multi_source(self):
        """Multi-source fields should boost consensus score."""
```

### 12.2 Integration Tests

```python
# tests/test_semantic_fil_integration.py

class TestSemanticFILIntegration:
    """Integration tests using real dossier data."""
    
    @pytest.fixture
    def brookline_dossier(self):
        """Load Brookline restaurant dossier."""
        return Path("test_fixtures/dossier_restaurant_brookline_ma")
        
    def test_form_ss4_produces_valid_fil(self, brookline_dossier):
        """Form SS-4 should produce high-quality FIL."""
        # Expected: score >= 90, 28+ mapped fields
        
    def test_common_victualler_produces_valid_fil(self, brookline_dossier):
        """Common Victualler should produce valid FIL."""
        # Expected: score >= 85, handles portal type
        
    def test_fallback_when_no_document(self, brookline_dossier):
        """Should produce fallback FIL when document unavailable."""
        
    def test_checkpoint_resume(self, brookline_dossier):
        """Should resume from checkpoint correctly."""
        
    def test_all_44_requirements_produce_fils(self, brookline_dossier):
        """All requirements should produce some FIL."""
        # Verify no complete failures
```

### 12.3 Golden Standard Tests

```python
# tests/test_golden_standard.py

class TestGoldenStandard:
    """Tests against manually verified golden standards."""
    
    GOLDEN_STANDARDS = {
        "federal_form_ss_4": {
            "expected_fields": ["legal_name", "trade_name", "entity_type", ...],
            "min_field_count": 28,
            "min_score": 90
        },
        "brookline_common_victualler": {
            "expected_fields": ["business_name", "manager_name", ...],
            "min_field_count": 35,
            "min_score": 85
        },
        # ... more golden standards
    }
    
    def test_matches_golden_standard(self):
        """Generated FIL should match golden standard."""
        for req_id, expected in self.GOLDEN_STANDARDS.items():
            fil = generate_fil_for_requirement(req_id)
            
            # Check field coverage
            actual_fields = {f.field_id for f in fil.form_fields}
            for expected_field in expected["expected_fields"]:
                assert expected_field in actual_fields
                
            # Check counts
            assert len(fil.form_fields) >= expected["min_field_count"]
            
            # Check score
            assert fil.quality_score.total_score >= expected["min_score"]
```

### 12.4 Performance Tests

```python
# tests/test_performance.py

class TestPerformance:
    """Performance and cost tests."""
    
    def test_single_fil_under_30_seconds(self):
        """Single FIL generation should complete in < 30s."""
        
    def test_batch_44_under_20_minutes(self):
        """Full 44-requirement batch should complete in < 20 min."""
        
    def test_cost_under_limit(self):
        """Cost per FIL should be < $0.05."""
        
    def test_memory_usage_stable(self):
        """Memory should not grow unboundedly during batch."""
```

---

## 13. Extensibility for Monte Carlo & RAG

### 13.1 Monte Carlo Integration Points

```python
# Future: fil/monte_carlo_optimizer.py

class MonteCarloFILOptimizer:
    """
    Monte Carlo optimization for FIL improvement.
    
    Uses the 6 mutation types:
    1. ADDITIVE - Add new prompts/fields
    2. REFINEMENT - Improve existing prompts
    3. RESTRUCTURE - Reorganize domains
    4. EXAMPLE_BASED - Add examples from successful FILs
    5. CONSTRAINT_BASED - Add validation rules
    6. FEEDBACK_DRIVEN - Apply user feedback
    """
    
    def optimize(
        self,
        fil: SemanticFILOutput,
        feedback: Optional[Dict] = None,
        max_iterations: int = 5
    ) -> SemanticFILOutput:
        """Optimize FIL using Monte Carlo search."""
```

**Integration Points:**
- `SemanticFILOutput` includes `quality_score` for optimization target
- `InformationDomain` structure supports restructuring
- `SemanticField` includes `natural_question` for refinement
- Trace files provide data for mutation selection

### 13.2 RAG Bootstrap Integration Points

```python
# Future: fil/rag_bootstrap.py

class FILRAGBootstrap:
    """
    Bootstrap RAG from successful FILs.
    
    When a FIL scores >= 90:
    - Extract successful patterns
    - Store in vector database
    - Use to improve similar requirements
    """
    
    def ingest_successful_fil(
        self,
        fil: SemanticFILOutput,
        min_score: float = 90.0
    ):
        """Ingest a successful FIL into the knowledge base."""
        
    def retrieve_similar_patterns(
        self,
        requirement_name: str,
        jurisdiction: str
    ) -> List[FILPattern]:
        """Retrieve patterns from similar successful FILs."""
```

**Integration Points:**
- `SemanticFILOutput.quality_score.total_score` determines ingestion eligibility
- `InformationDomain` structure is vectorizable
- `SemanticField.sources` enables provenance-aware retrieval
- Trace files provide training data

### 13.3 Data Structures for Extensibility

```python
# Ensure these are present for future use

@dataclass
class SemanticFILOutput:
    # ... existing fields ...
    
    # Monte Carlo optimization ready
    optimization_history: List[Dict] = field(default_factory=list)
    mutation_log: List[str] = field(default_factory=list)
    
    # RAG bootstrap ready
    pattern_id: Optional[str] = None          # Unique pattern identifier
    similar_patterns_used: List[str] = field(default_factory=list)
    embedding: Optional[List[float]] = None   # For vector storage
```

---

## 14. Implementation Roadmap

### 14.1 Phase 1: Foundation (Days 1-2)

| Task | File | Description |
|------|------|-------------|
| 1.1 | `semantic_config.py` | Configuration system + YAML loader |
| 1.2 | `config/*.yaml` | All configuration files |
| 1.3 | `semantic_schema.py` | Extended schema with provenance |
| 1.4 | `semantic_tracer.py` | Trace file management |

**Deliverable:** Configuration and tracing infrastructure

### 14.2 Phase 2: Extraction (Days 3-4)

| Task | File | Description |
|------|------|-------------|
| 2.1 | `semantic_extractor.py` | Three-level extraction |
| 2.2 | Unit tests | Test extraction at each level |
| 2.3 | Cost tracking | Integrate with extractor |

**Deliverable:** Working extraction with traces

### 14.3 Phase 3: Clustering & Mapping (Days 5-6)

| Task | File | Description |
|------|------|-------------|
| 3.1 | `semantic_clusterer.py` | Field clustering |
| 3.2 | `semantic_mapper.py` | Document mapping |
| 3.3 | Unit tests | Test clustering and mapping |

**Deliverable:** Working clustering and mapping

### 14.4 Phase 4: Scoring & Fallback (Day 7)

| Task | File | Description |
|------|------|-------------|
| 4.1 | `semantic_scorer.py` | Quality scoring |
| 4.2 | `semantic_fallback.py` | Fallback generation |
| 4.3 | Unit tests | Test scoring formula |

**Deliverable:** Quality measurement and fallbacks

### 14.5 Phase 5: Orchestration (Days 8-9)

| Task | File | Description |
|------|------|-------------|
| 5.1 | `semantic_generator.py` | Main orchestrator |
| 5.2 | Update `integration.py` | Wire into existing interface |
| 5.3 | Integration tests | End-to-end tests |

**Deliverable:** Complete semantic FIL generator

### 14.6 Phase 6: Testing & Validation (Days 10-11)

| Task | File | Description |
|------|------|-------------|
| 6.1 | Golden standard tests | Validate against known good FILs |
| 6.2 | Performance tests | Ensure time/cost limits met |
| 6.3 | Full dossier test | Run on all 44 Brookline requirements |

**Deliverable:** Validated, production-ready system

### 14.7 Phase 7: Documentation & Cleanup (Day 12)

| Task | Description |
|------|-------------|
| 7.1 | Update COMPLIANCE_DOSSIER_COMPLETE_DOCUMENTATION.md |
| 7.2 | Create SEMANTIC_FIL_USAGE.md |
| 7.3 | Code cleanup and comments |
| 7.4 | Final commit and tag |

**Deliverable:** Documented, deployable system

---

## 15. Risk Mitigation

### 15.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM extraction quality varies | Medium | High | Use Opus for complex cases, Haiku for simple |
| Clustering produces poor results | Low | Medium | Tunable threshold, fallback to unclustered |
| Document parsing fails | Medium | Medium | Multiple parse strategies, graceful fallback |
| Cost exceeds budget | Low | Medium | Hard limits, early termination |
| Performance too slow | Low | Medium | Caching, parallel extraction |

### 15.2 Mitigation Strategies

**LLM Quality:**
- Use specific prompts tested in experiments
- Include examples in prompts
- Validate JSON responses before use
- Retry with different prompt on failure

**Clustering Quality:**
- Configurable threshold (can tune per use case)
- Track cluster quality metrics
- Manual review option for low scores

**Document Parsing:**
- Try multiple PDF libraries (pdfplumber, PyPDF2, pdfminer)
- Fall back to LLM-based extraction
- Store raw content for debugging

**Cost Control:**
- Track cost per call
- Warn at 60% of limit
- Stop at 100% of limit
- Log all costs for analysis

**Performance:**
- Cache extraction results
- Reuse embeddings
- Parallel candidate extraction
- Progress indicators

---

## 16. Appendices

### 16.1 Experimental Data Reference

**Sigmoid Curve Parameters:**
```
Score = 30 / (1 + exp(-0.6 * (questions - 8.5))) + 62

Key points:
- Phase transition: 8 questions
- Optimal: 12 questions (89+ score)
- Plateau: 14+ questions
```

**Question Effectiveness (from experiments):**
```
| Question | Avg Field Yield | Criticality |
|----------|-----------------|-------------|
| info_required | 15.3 | ESSENTIAL |
| docs_required | 4.7 | ESSENTIAL |
| who_else | 3.0 | HIGH |
| who_completes | 2.3 | HIGH |
| submission_method | 2.1 | ESSENTIAL |
| verification | 1.8 | MEDIUM |
| rejection_reasons | 1.7 | LOW |
| when_due | 1.5 | MEDIUM |
| renewal | 0.5 | LOW |
| prerequisites | 0.3 | LOW |
```

**Requirement Type Results:**
```
| Type | Coverage | Precision | Efficiency |
|------|----------|-----------|------------|
| Federal PDF | 104% | 95% | 4.3 |
| State Portal | 104% | 95% | 3.2 |
| State PDF | 104% | 94% | 2.7 |
| Local Portal | 104% | 96% | 4.5 |
| Local PDF | 100% | 100% | 2.3 |
```

### 16.2 File Structure Reference

```
compliance_dossier/
├── fil/
│   ├── __init__.py
│   ├── integration.py              # EXISTING (keep from 6985314)
│   ├── cohort_generator.py         # EXISTING (keep)
│   │
│   ├── semantic_config.py          # NEW
│   ├── semantic_schema.py          # NEW
│   ├── semantic_extractor.py       # NEW
│   ├── semantic_clusterer.py       # NEW
│   ├── semantic_mapper.py          # NEW
│   ├── semantic_scorer.py          # NEW
│   ├── semantic_fallback.py        # NEW
│   ├── semantic_tracer.py          # NEW
│   ├── semantic_generator.py       # NEW
│   │
│   ├── config/
│   │   ├── questions.yaml          # NEW
│   │   ├── domains.yaml            # NEW
│   │   ├── thresholds.yaml         # NEW
│   │   └── prompts.yaml            # NEW
│   │
│   └── (DELETE old files)
│       ├── field_extractor.py      # DELETE
│       ├── fil_generator.py        # DELETE
│       └── llm_fil_enhancer.py     # DELETE
│
├── scripts/
│   └── run_semantic_fil.py         # NEW
│
└── tests/
    ├── test_semantic_extractor.py  # NEW
    ├── test_semantic_clusterer.py  # NEW
    ├── test_semantic_mapper.py     # NEW
    ├── test_semantic_scorer.py     # NEW
    ├── test_semantic_fil_integration.py  # NEW
    ├── test_golden_standard.py     # NEW
    └── test_performance.py         # NEW
```

### 16.3 Git Commands Reference

```bash
# Start from the right commit
git checkout 6985314
git checkout -b feature/semantic-fil-generation

# After implementation
git add fil/semantic_*.py fil/config/*.yaml
git commit -m "feat(fil): Add semantic FIL generation system

- 3-level extraction (GSP, Candidates, Document)
- 12 optimized domain questions
- Semantic clustering with 0.85 threshold
- Document mapping with confidence scoring
- Quality scoring (coverage, precision, efficiency, consensus)
- Fallback mechanisms for degraded operation
- Full tracing and checkpoint/resume support
- ZERO-HARDCODING: All configuration external

Implements validated approach from experiments:
- 9/9 requirements pass (100% production ready)
- Average score: 91.1
- Coverage: 104%, Precision: 95%"

# Tag the release
git tag -a v5.0.0-semantic-fil -m "Semantic FIL Generation v5.0.0"
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | Claude + Borya | Initial architecture |

---

*This document is the source of truth for Semantic FIL Generation implementation.*
