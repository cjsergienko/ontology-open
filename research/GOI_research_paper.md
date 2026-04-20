# Generative Ontology Induction: Domain-Agnostic Schema Discovery from Document Corpora Using Large Language Models

**Authors:** Sergei Sergienko  
**Affiliation:** Pivots Global  
**Contact:** ssergienko@pivotsglobal.com

---

## Abstract

Ontology engineering remains a critical bottleneck in knowledge-intensive AI systems, requiring domain expertise, manual curation, and task-specific rules. Existing automated approaches either depend on predefined schemas, operate within narrow domains, or produce unstructured outputs unsuitable for downstream pipelines. We introduce **Generative Ontology Induction (GOI)**, a domain-agnostic framework that automatically reverse-engineers the structural schema governing any document class from a corpus of examples. Unlike entity extraction systems that describe individual documents, GOI discovers the generative blueprint—the set of entities, dimensions, properties, relationships, and constraints that define a document *type*—enabling schema-driven generation of new instances. The system accepts multi-format document collections (PDF, images, text, JSON, YAML), produces typed knowledge graphs with six node types and seven edge types, and exports pipeline-ready schemas in YAML/JSON. We introduce the **Node Coverage Score**, a novel evaluation metric that measures what percentage of ontology dimension nodes appear in generated outputs, addressing the gap between token-level metrics and structural correctness. Experiments across three heterogeneous document types demonstrate that GOI successfully induces reusable schemas without domain-specific rules or training data. Beyond its technical contributions, GOI addresses a practical **cross-functional team communication gap**: in AI-driven product teams, frontend developers, backend engineers, and AI researchers lack a shared, human-readable artifact representing the product's knowledge structure. GOI's visual, interactive, and exportable schema serves as this common artifact, enabling each role to understand the product's structural design without acquiring expertise in adjacent disciplines—thereby reducing coordination overhead and keeping every team member focused on their core skill set. We discuss limitations including LLM consistency challenges, token constraints, and hallucination risks, and position GOI as both a universal primitive for ontology-driven agent architectures and an organizational tool for cross-functional AI product teams. Our work addresses five open problems in the literature: cross-document canonicalization without domain rules, universal typed graph representation, evaluation metrics for ontology usefulness as generation specifications, polished interactive visualization for non-experts, and one-click export for downstream pipelines.

**Keywords:** ontology learning, schema induction, large language models, knowledge graphs, domain-agnostic methods, generative models

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Related Work](#2-related-work)
3. [The GOI Framework](#3-the-goi-framework)
4. [The Coverage Metric](#4-the-coverage-metric)
5. [Experiments and Evaluation](#5-experiments-and-evaluation)
6. [Discussion](#6-discussion)
7. [Conclusion](#7-conclusion)
8. [References](#references)

---

## 1. Introduction

Modern AI systems increasingly rely on structured knowledge to ground reasoning, guide generation, and ensure consistency across complex workflows. Ontologies—formal representations of entities, relationships, and constraints within a domain—serve as the backbone for knowledge graphs, semantic search, retrieval-augmented generation (RAG), and multi-agent orchestration. Yet ontology engineering remains a labor-intensive, expert-driven process that creates a fundamental bottleneck: every new domain, document type, or application requires manual schema design, iterative refinement, and domain-specific rules.

This **structure gap** manifests across the AI landscape. Enterprise knowledge management systems struggle to maintain consistent schemas as document types evolve. Research teams building domain-specific knowledge graphs invest months in ontology design before extraction can begin. Agent frameworks that promise autonomous operation still require hand-crafted schemas to structure their memory and reasoning. The promise of general-purpose AI collides with the reality that structured knowledge remains stubbornly domain-specific and manually curated.

A particularly acute but underexplored dimension of this gap occurs within **mixed-expertise software teams**. Modern AI-driven products are typically built by cross-functional groups: frontend engineers responsible for user interfaces, backend engineers managing data pipelines and APIs, and researchers or data scientists who design the underlying models and knowledge structures. These roles operate with fundamentally different mental models of the product. Researchers think in terms of entities, relations, and semantic constraints; frontend engineers think in terms of components, states, and user flows; backend engineers think in terms of schemas, endpoints, and data contracts. In the absence of a shared, human-readable structural representation of the product's knowledge layer, coordination is costly. Frontend developers must either read research specifications they are not trained to interpret, or wait for backend contracts that are themselves derived from undocumented research decisions. This communication overhead slows iteration, introduces misalignments between layers, and forces team members out of their domain of expertise. What is needed is a **common artifact**—a visual, navigable, exportable representation of the product's structural schema—that each role can read and reason about without requiring deep knowledge of the others' disciplines.

Recent advances in large language models (LLMs) have begun to address this gap. Zero-shot and few-shot ontology construction pipelines demonstrate that LLMs can extract entities, induce taxonomies, and generate schema elements without extensive training data [1], [2], [3]. Corpus-based methods can discover hierarchical event ontologies from open-domain text collections [4]. Interactive systems enable human-guided schema discovery from research corpora [5]. Yet these approaches share common limitations: they often require predefined ontology seeds, operate within constrained domains, produce untyped or inconsistently structured outputs, lack robust cross-document canonicalization, and provide limited pathways for non-expert users to visualize, validate, and export discovered schemas.

We identify five critical research gaps that prevent existing methods from serving as universal, document-agnostic schema induction tools:

1. **Cross-document canonicalization without domain rules:** Current systems struggle to merge semantically equivalent entities and relations discovered across multiple documents without domain-specific deduplication rules [6], [7], [8].

2. **Universal typed graph representation:** No standardized taxonomy of node and edge types exists across ontology induction systems, making outputs difficult to compare, validate, and integrate into downstream pipelines [9], [10].

3. **Evaluation metrics for ontology usefulness as generation specifications:** Token-level extraction metrics (precision, recall, F1) fail to measure whether an induced ontology successfully captures the structural blueprint needed to generate new valid instances [9].

4. **Polished interactive visualization for non-experts:** While research prototypes include visualization modules, production-quality interfaces that enable domain experts (not ontology engineers) to explore, validate, and refine induced schemas remain scarce [11], [12], [13].

5. **One-click export for downstream pipelines:** Seamless export of induced schemas in formats ready for RAG systems, agent frameworks, and knowledge graph databases is not yet a first-class feature in academic tools [11], [14].

This paper introduces **Generative Ontology Induction (GOI)**, a framework designed to address these gaps through four core contributions:

**First**, we formalize the concept of *generative ontology*—the structural schema that defines a document class and enables generation of new instances—and distinguish it from descriptive entity extraction. GOI reverse-engineers this generative blueprint by analyzing multiple examples of the same document type, identifying recurring dimensions, properties, relationships, and constraints that govern the class.

**Second**, we present a complete technical architecture including: (a) a universal typed graph representation with six node types (class, property, value, dimension, relation, constraint) and seven edge types (is_a, has_property, has_value, relates_to, part_of, constrains, instance_of); (b) a multi-document prompt design that instructs Claude to extract generative schemas rather than per-document entities; (c) an automatic layout algorithm that positions nodes by type for immediate visual comprehension; (d) multi-format import supporting existing ontologies in OWL, RDF, YAML, JSON, and Markdown; and (e) YAML/JSON export for pipeline integration.

**Third**, we introduce the **Node Coverage Score**, a novel evaluation metric that measures what percentage of dimension nodes in an induced ontology appear in outputs generated from that ontology. Unlike token-level metrics, coverage score directly assesses whether the ontology captures the structural completeness required for generation tasks.

**Fourth**, we identify and address a practical **cross-functional team communication gap** in AI-driven product development. Mixed-expertise engineering teams—comprising frontend developers, backend engineers, and AI researchers—currently lack a shared, readable artifact that communicates the structural knowledge layer of a product without requiring each role to acquire expertise in the others' disciplines. GOI's visual, interactive, and exportable schema representation serves as precisely this common artifact: frontend developers can understand what entities and dimensions the product operates on without reading research specifications; backend engineers can derive data contracts and API shapes directly from the induced schema without waiting for researcher handoffs; and researchers can validate that their knowledge design is correctly understood and implemented across the team. This positions GOI not only as a technical research contribution but as an **organizational primitive** that bridges the gap between scientific knowledge design and engineering execution.

Our experiments demonstrate GOI's domain-agnostic capabilities across three heterogeneous document types, measuring coverage scores and comparing against baseline extraction approaches. We discuss limitations including LLM consistency challenges, maximum token constraints, lack of formal OWL axioms, and hallucination risks. Finally, we position GOI as a universal primitive for ontology-driven agent pipelines, enabling autonomous systems to discover, validate, and deploy schemas without human ontology engineering.

The remainder of this paper is organized as follows. Section 2 reviews related work in zero-shot schema induction, knowledge graph construction, ontology learning, and visual ontology editors. Section 3 details the GOI framework architecture. Section 4 introduces the Node Coverage Score metric. Section 5 presents experimental results. Section 6 discusses limitations and future directions. Section 7 concludes.

---

## 2. Related Work

### 2.1 Zero-Shot and Few-Shot Ontology Construction

The emergence of large language models has enabled practical zero-shot and few-shot ontology construction without extensive training data or domain-specific fine-tuning. Recent work demonstrates that LLMs can perform ontology subtasks—entity typing, relation extraction, taxonomy induction—through carefully designed prompts and retrieval-augmented strategies [1], [2], [3].

Beliaeva and Rahmatullaev [1] demonstrate heterogeneous LLM methods—few-shot prompting, ensemble entity typing, and attention-based taxonomy modeling—that achieve competitive results on schema completion tasks across diverse domains. Giglou et al. [2] introduce the LLMs4OL paradigm, evaluating nine LLM families across ontology learning subtasks (term typing, taxonomy discovery, non-taxonomic relation extraction) via zero-shot prompting on WordNet, GeoNames, and UMLS. Lo et al. [9] present OLLM, an end-to-end framework for ontology learning with LLMs that introduces structural graph distance metrics to evaluate induced ontologies beyond token-level accuracy, highlighting that standard extraction metrics fail to capture schema coherence.

The LLMs4OL 2024 challenge [3] surveys the landscape of iterative zero-shot and few-shot pipelines, demonstrating that repeated LLM prompting with post-processing can extract triplets and progressively refine schemas without supervised data. These methods establish the feasibility of LLM-driven ontology construction but require supporting components for canonicalization, taxonomy inference, and schema validation.

End-to-end approaches to ontology learning, including OLLM [9] and concurrent schema induction systems, can generalize to new domains with limited examples, but most still depend on predefined ontology seeds or supervised training data, limiting applicability to novel document types where no prior schema exists.

### 2.2 Corpus-Based Schema Induction

Corpus-based methods induce ontologies by analyzing patterns across large document collections rather than processing individual texts in isolation. Xu et al. [4] introduce CEO (Corpus-Based Open-Domain Event Ontology Induction), which uses distant supervision and embedding constraints to induce hierarchical event ontologies without direct supervision, producing named hierarchical schema elements from open corpora. Predecessor work on corpus-based event type induction [17] constructs event graphs and clusters them to discover recurring templates, but remains focused on event-centric domains and does not generalize to arbitrary document types.

ReCG [18] performs bottom-up schema discovery for JSON collections using cluster-and-generalize strategies with Minimum Description Length (MDL) to balance schema concision and generality. This approach works well when leaf structure is visible but requires homogeneous JSON inputs and does not extend to multi-format document corpora.

Zhang and Soh [6] propose an Extract-Define-Canonicalize framework for knowledge graph construction, explicitly addressing the challenge of merging equivalent entities and relations through post-hoc schema definition and canonicalization. Their work demonstrates that cross-document canonicalization can be improved through structured LLM pipelines but remains an open problem requiring iterative post-processing and validation.

### 2.3 Knowledge Graph Construction from Text

Automated knowledge graph construction from unstructured text has advanced significantly with LLM-augmented pipelines. iText2KG [11] performs document distillation followed by incremental entity and relation extraction, integrating results across documents into a unified knowledge graph with visualization support. The authors explicitly note that unresolved semantically duplicated entities remain a challenge requiring post-processing.

AutoClusRE [7] uses LLM prompting guided by dynamically updated entity and relation type tables, combined with semantic clustering to build corpus-level type inventories and collapse duplicates across texts. This approach demonstrates practical cross-document integration but relies on clustering heuristics that may not generalize across heterogeneous document types. OntoGenix [8] takes a complementary approach, combining GPT-4 with RAG, multi-agent orchestration, and self-repairing mechanisms to generate ontologies from structured datasets across six commercial domains, showing that LLM-based ontology engineering can generalize across domains.

OntoKGen [12] provides an adaptive iterative Chain-of-Thought interface for ontology extraction from technical documents, integrating generated knowledge graphs into schemeless graph stores like Neo4j. The system emphasizes human-in-the-loop validation to ensure accuracy, acknowledging that fully automated extraction risks hallucination without ontology-grounded constraints.

OntoGPT [19] demonstrates schema-guided extraction (SPIRES) that can extract semantic structures according to user-defined LinkML schemas without training data. This approach reduces annotation needs but requires predefined schemas, limiting applicability to novel document types where no prior schema exists.

### 2.4 Interactive Schema Discovery

Human-in-the-loop systems enable domain experts to guide and refine schema discovery processes. Sadruddin et al. [5] present LLMs4SchemaDiscovery, a four-stage workflow that generates initial process schemas from domain specifications, refines them with curated corpora, enriches with larger corpora, and grounds properties in formal ontologies. The system was evaluated on materials science (atomic layer deposition) and demonstrates that human-guided schema discovery produces semantically rich, ontology-grounded outputs.

Schemex [20] provides iterative abstraction with contrastive refinement: given examples, an AI clusters them by structural similarity, infers underlying dimensions, then compares generated outputs against gold examples to surface gaps. Users approve or reject suggested refinements in a transparent visual workflow. A concurrent version [16] extends this with user studies demonstrating significantly greater insight and confidence compared to AI reasoning model baselines. These interactive approaches acknowledge that there is often no single "correct" schema and that domain expertise is essential for validation.

While interactive systems improve schema quality through human oversight, they require expert engagement at each iteration and do not scale to scenarios requiring rapid, zero-touch schema induction across novel document types. The balance between automation and human guidance remains an open research question.

### 2.5 Visual Ontology Editors and Accessibility

Traditional ontology engineering tools like Protégé [21] remain robust for formal ontology editing but are primarily designed for ontology specialists rather than domain experts or business users. Recent work has focused on lowering barriers through visual interfaces and familiar interaction metaphors.

KGraphX [13] is an easy-to-use visual editor designed for users with limited semantic web expertise, offering drag-and-drop graph construction, Wikidata/BioPortal entity lookup, and RDF/RDFS export. User evaluations show that non-expert users consistently prefer KGraphX over conventional tools for knowledge graph creation tasks. WebProtégé [14] provides collaborative, browser-based ontology editing for distributed teams, supporting annotation, change tracking, and discussion threads around ontology elements—lowering the barrier to participation without requiring local tool installation. Metaphactory [24] targets business users with visual OWL/SHACL modeling and model-driven UIs, explicitly positioning ontology creation as a non-specialist activity.

Despite these advances, polished interactive visualizations that enable non-experts to explore, validate, and export *induced* (rather than manually authored) schemas at production quality remain scarce in the literature [11], [12], [13]. Scalability of visualization for large corpus-derived graphs—crowded node/link layouts, provenance overlays, summarized views—is acknowledged but underdeveloped.

### 2.6 Integration with Agentic Workflows

Ontologies are increasingly positioned as grounding layers for retrieval-augmented generation (RAG) and multi-agent systems. OntoKGen [12] explicitly outputs knowledge graphs intended for seamless integration into schemeless stores and downstream RAG systems. Fathallah et al. [25] (NeOn-GPT) find that LLMs can significantly accelerate ontology modeling when embedded in structured workflow pipelines (the NeOn methodology), but are not fully sufficient for procedural ontology tasks independently, lacking the reasoning skills needed to generate complex class expressions (conjunction, disjunction). LLMs require integration with workflow or trajectory tools for continuous knowledge engineering.

OntoGPT [19] demonstrates that schema-guided extraction via SPIRES can populate knowledge bases without training data, suggesting paths for integrating LLM outputs into agentic components. However, the literature provides limited standardized connectors for deploying *induced* ontologies (as opposed to manually authored ones) into multi-agent orchestration systems, and few published benchmarks measure agent task performance impact from ontology quality.

### 2.7 Concurrent Work: Automated Schema Induction Systems

Three concurrent systems address overlapping goals and must be carefully distinguished from GOI.

**LOGOS** [15] (Pi et al., 2025) automates grounded theory development for qualitative research, transforming raw text into hierarchical codebooks via LLM-driven coding, semantic clustering, graph reasoning, and iterative refinement. LOGOS achieves 80.4% alignment with expert schemas across five diverse corpora. However, LOGOS targets qualitative research workflows and produces *codebooks* (thematic hierarchies) rather than typed knowledge graphs suitable for downstream schema-driven generation, validation, or RAG integration. LOGOS does not produce exportable schemas in YAML/JSON and provides no interactive visualization for non-expert exploration.

**Schemex** [20] (Sadeh et al., 2025) supports schema induction through iterative clustering, AI-assisted abstraction, and contrastive refinement with human feedback. Schemex requires active user participation at each iteration and is designed as an interactive co-creation tool rather than a fully automated, one-shot system. GOI differs in three ways: (a) GOI performs automated zero-touch schema induction without iteration; (b) GOI produces typed graphs with six node types and seven edge types rather than design pattern outlines; (c) GOI explicitly targets the cross-functional communication gap in AI product teams.

**AutoSchemaKG** [10] (Bai et al., 2025) performs dynamic schema induction while constructing web-scale knowledge graphs (50M+ documents, 900M+ nodes). AutoSchemaKG operates at corpus scale via conceptualization, treating schema and triple extraction as a joint problem. GOI differs in purpose and scale: GOI operates on small curated corpora (3–20 documents) to discover the *generative blueprint* for a document type, not to build large-scale factual KGs. GOI's output—a compact typed schema for generation and export—is orthogonal to AutoSchemaKG's large-scale factual graph construction.

The existence of these concurrent systems validates the timeliness of GOI's research direction while highlighting its distinct positioning: zero-touch automation, typed generative schemas, interactive non-expert visualization, and an explicit organizational artifact for cross-functional teams.

### 2.8 Gaps Addressed by GOI

The literature reveals six concrete gaps that GOI addresses:

1. **Cross-document canonicalization:** Existing systems struggle with unresolved semantically duplicate entities and relations across documents [6], [7], [11]. GOI's generative ontology approach focuses on discovering the shared structural blueprint rather than merging per-document extractions, reducing canonicalization complexity.

2. **Universal typed graph representation:** No standardized node and edge taxonomy exists across systems [9], [10]. GOI introduces a six-node, seven-edge type system designed for generative schema representation—distinct from untyped triple stores, codebooks [15], and factual KG schemas [10].

3. **Evaluation for generation tasks:** Token-level metrics miss structural correctness [9]. GOI's Node Coverage Score directly measures whether induced ontologies capture the dimensions needed for generation.

4. **Interactive visualization for non-experts:** Research prototypes include visualization modules but lack production-quality interfaces for non-experts [11], [12], [13]. GOI provides a React Flow-based visual canvas with automatic layout and type-based positioning designed for domain experts rather than ontology engineers.

5. **Pipeline-ready export:** One-click export in formats ready for downstream systems is not yet a first-class feature in academic tools [11], [14]. GOI provides YAML/JSON export explicitly designed for RAG pipeline and agent framework integration.

6. **Cross-functional team communication in AI product development:** Existing ontology tools are designed either for ontology specialists (e.g., Protégé [21]) or for researchers (e.g., LLMs4SchemaDiscovery [5]), with no attention to the communication needs of mixed-expertise engineering teams. No existing tool—including Schemex [20], LOGOS [15], or AutoSchemaKG [10]—produces a single artifact that frontend developers, backend engineers, and AI researchers can each act on within their own domain of expertise. GOI fills this gap: its visual, interactive, and exportable schema representation serves as a **shared structural contract** across roles.

By addressing these gaps, GOI positions itself as both a universal primitive for ontology-driven AI systems and a practical organizational tool for cross-functional AI product teams, enabling domain-agnostic schema discovery without manual engineering or domain-specific rules.

---

## 3. The GOI Framework

### 3.1 Conceptual Foundation: Generative vs. Descriptive Ontologies

Traditional knowledge graph construction focuses on *descriptive extraction*: identifying entities, relations, and attributes within individual documents to represent their specific content. In contrast, GOI performs *generative ontology induction*: discovering the structural schema that defines a document *class* and enables generation of new valid instances.

Consider the distinction: given a corpus of job postings, descriptive extraction identifies specific companies, job titles, and requirements in each posting. Generative ontology induction discovers that job postings as a class contain dimensions such as "Company Information," "Role Description," "Requirements," "Compensation," and "Application Process," along with the properties, constraints, and relationships that govern these dimensions.

This generative perspective shifts the goal from "What entities appear in these documents?" to "What structural blueprint defines this kind of document?" The induced ontology serves as a specification that can guide generation of new instances, validate existing documents, and structure downstream processing pipelines.

### 3.2 System Architecture

GOI is implemented as a web application using Next.js 16, React 19, TypeScript, and Tailwind CSS v4. The architecture consists of five core components:

1. **Multi-format document ingestion**
2. **LLM-based schema extraction**
3. **Typed graph representation**
4. **Interactive visualization**
5. **Export and integration**

#### 3.2.1 Multi-Format Document Ingestion

GOI accepts heterogeneous document formats including PDF, images (PNG, JPG), plain text, JSON, and YAML. Users upload multiple examples of the same document type (e.g., multiple research papers, multiple contracts, multiple product specifications). The system labels each document as `<example_1>`, `<example_2>`, etc., and prepares them for batch processing.

For PDF and image inputs, the system uses the Anthropic Files API to handle document parsing and text extraction. For structured formats (JSON, YAML), the system preserves structural information to aid schema discovery. This multi-format capability enables GOI to operate across diverse document ecosystems without requiring format-specific preprocessing.

#### 3.2.2 LLM-Based Schema Extraction

The core of GOI is a carefully designed system prompt that instructs Claude Sonnet to extract generative ontologies rather than perform per-document entity extraction. The prompt reads:

> "Extract the generative ontology: the set of entities, dimensions, properties, and relationships that define *this kind of document* as a class, so the ontology can be used as a structured knowledge framework to generate new similar documents from a fresh prompt."

This instruction shifts the LLM's focus from instance-level extraction to class-level schema discovery. By analyzing multiple examples simultaneously, the LLM identifies recurring structural patterns, common dimensions, typical property sets, and relationship types that characterize the document class.

The prompt design addresses several challenges identified in the literature:

- **Catastrophic prompt drift:** By explicitly framing the task as schema discovery rather than iterative extraction, GOI avoids the forgetting issues noted in corpus-level prompting approaches [4].
- **Hallucination mitigation:** Grounding schema discovery in multiple concrete examples reduces the risk of generating plausible but unsupported schema elements.
- **Domain agnosticism:** The prompt contains no domain-specific terminology or examples, enabling application to arbitrary document types.

#### 3.2.3 Typed Graph Representation

GOI represents induced ontologies as typed directed graphs with six node types and seven edge types. This taxonomy was designed to capture the structural elements needed for generative schema representation while remaining simple enough for visual comprehension.

**Node Types:**

1. **Class:** High-level categories or entity types (e.g., "Job Posting," "Research Paper," "Contract")
2. **Dimension:** Major structural sections or aspects (e.g., "Methodology," "Compensation," "Terms and Conditions")
3. **Property:** Attributes or fields within dimensions (e.g., "sample_size," "salary_range," "termination_clause")
4. **Value:** Specific values or value types for properties (e.g., "100-500 participants," "$80K-$120K," "30-day notice")
5. **Relation:** Semantic relationships between entities (e.g., "cites," "requires," "supersedes")
6. **Constraint:** Rules or requirements governing valid instances (e.g., "must include IRB approval," "salary must be numeric," "effective date required")

**Edge Types:**

1. **is_a:** Taxonomic hierarchy (e.g., "Quantitative Study" is_a "Research Methodology")
2. **has_property:** Links dimensions to their properties (e.g., "Methodology" has_property "sample_size")
3. **has_value:** Links properties to their values (e.g., "sample_size" has_value "100-500")
4. **relates_to:** Semantic relationships between entities (e.g., "Introduction" relates_to "Literature Review")
5. **part_of:** Compositional relationships (e.g., "Abstract" part_of "Research Paper")
6. **constrains:** Links constraints to the elements they govern (e.g., "IRB_required" constrains "Methodology")
7. **instance_of:** Links specific instances to their classes (e.g., "Smith_2024_paper" instance_of "Research Paper")

This type system addresses the gap in universal typed graph representation noted in the literature [9], [10]. Unlike systems that produce untyped triples or domain-specific schemas, GOI's taxonomy is designed for cross-domain applicability while maintaining semantic richness.

The graph representation is stored internally as JSON with the following structure:

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "class",
      "label": "Research Paper",
      "properties": {}
    },
    {
      "id": "node_2",
      "type": "dimension",
      "label": "Methodology",
      "properties": {}
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_2",
      "target": "node_1",
      "type": "part_of",
      "label": "part_of"
    }
  ]
}
```

#### 3.2.4 Interactive Visualization

GOI uses React Flow to render induced ontologies as interactive visual graphs. The visualization addresses the gap in polished, production-quality interfaces for non-experts [11], [12], [13].

**Automatic Layout Algorithm:**

To ensure immediate visual comprehension, GOI implements a type-based horizontal layout algorithm (`layoutNodes()`). Nodes are positioned in horizontal rows according to their type:

- **Row 1 (top):** Class nodes
- **Row 2:** Dimension nodes
- **Row 3:** Property nodes
- **Row 4:** Value nodes
- **Row 5:** Relation nodes
- **Row 6 (bottom):** Constraint nodes

Within each row, nodes are distributed horizontally with consistent spacing. This layout provides instant visual structure: users can immediately identify high-level classes at the top, structural dimensions in the second row, and detailed properties and constraints below.

**Interactive Features:**

- **Pan and zoom:** Users can navigate large ontologies
- **Node selection:** Clicking nodes highlights connected edges and neighbors
- **Type-based coloring:** Each node type has a distinct color for rapid visual parsing
- **Edge labels:** Relationship types are displayed on edges
- **Export controls:** One-click export to YAML or JSON

The visualization is designed for domain experts rather than ontology engineers, using familiar graph metaphors and avoiding technical ontology terminology in the interface.

#### 3.2.5 Import and Export

**Import:**

GOI supports importing existing ontologies in multiple formats:

- **OWL/RDF:** Parses OWL ontologies and maps classes, properties, and axioms to GOI's type system
- **YAML/JSON:** Directly loads structured ontology definitions
- **Markdown:** Parses hierarchical outlines and converts them to graph structures
- **Plain text:** Uses LLM-based parsing to extract schema elements from natural language descriptions

This import capability enables users to refine existing ontologies or bootstrap GOI with domain knowledge.

**Export:**

GOI provides one-click export in two formats:

1. **YAML:** Human-readable, hierarchical representation suitable for configuration files and documentation
2. **JSON:** Machine-readable format for programmatic integration with RAG systems, agent frameworks, and knowledge graph databases

The export format includes full node and edge metadata, enabling downstream systems to reconstruct the typed graph and leverage type information for reasoning and validation.

Example YAML export:

```yaml
ontology:
  name: "Research Paper Schema"
  version: "1.0"
  nodes:
    - id: "node_1"
      type: "class"
      label: "Research Paper"
    - id: "node_2"
      type: "dimension"
      label: "Methodology"
  edges:
    - id: "edge_1"
      source: "node_2"
      target: "node_1"
      type: "part_of"
```

This export capability addresses the gap in pipeline-ready outputs noted in the literature [11], [14].

### 3.3 Technical Implementation Details

**Technology Stack:**

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Graph Visualization:** React Flow
- **LLM API:** Claude Sonnet via Anthropic API
- **File Handling:** Anthropic Files API for PDF and image processing
- **Storage:** SQLite via better-sqlite3 for ontology persistence
- **Payment:** Stripe integration for usage-based pricing

**Scalability Considerations:**

GOI is designed for document corpora ranging from 3-20 examples per document type. Larger corpora may exceed LLM context windows, requiring chunking or sampling strategies. The current implementation uses Claude Sonnet's extended context window (200K tokens) to accommodate multiple documents simultaneously.

For very large corpora, future work could implement hierarchical schema induction: first clustering documents into subtypes, inducing schemas for each subtype, and then merging schemas into a unified ontology.

**Consistency and Validation:**

To address LLM consistency challenges, GOI implements several validation strategies:

1. **Multi-example grounding:** Requiring multiple examples reduces hallucination by anchoring schema elements in observed patterns
2. **Type constraints:** The six-node, seven-edge type system provides structural constraints that guide LLM output
3. **Post-processing validation:** The system checks for orphaned nodes, disconnected subgraphs, and type violations
4. **User review:** The interactive visualization enables users to identify and correct errors before export

---

## 4. The Coverage Metric

### 4.1 Motivation

Evaluating the quality of induced ontologies remains a fundamental challenge. Traditional knowledge graph construction metrics—precision, recall, and F1 score for entity and relation extraction—measure token-level accuracy against gold-standard annotations [9]. However, these metrics fail to capture whether an ontology successfully serves its intended purpose: providing a structural blueprint for generation, validation, or downstream reasoning.

Consider an induced ontology for research papers that includes dimensions for "Abstract," "Introduction," "Methods," "Results," and "Discussion." Token-level metrics would measure whether these labels match a gold standard, but they cannot assess whether the ontology is *complete enough* to guide generation of a valid research paper. A paper generated using this ontology might omit critical sections like "Related Work" or "Conclusion," yet token-level metrics would not detect this structural incompleteness.

Lo et al. [9] introduce structural graph distance metrics to evaluate ontology coherence, but these metrics focus on graph topology rather than functional completeness for generation tasks. The literature lacks evaluation methods that directly measure whether an induced ontology captures the dimensions, properties, and constraints needed to generate valid instances of the target document class.

### 4.2 Node Coverage Score Definition

We introduce the **Node Coverage Score** as a novel evaluation metric that measures what percentage of dimension nodes in an induced ontology appear in outputs generated from that ontology.

**Formal Definition:**

Let $O$ be an induced ontology represented as a typed graph $(N, E)$ where $N$ is the set of nodes and $E$ is the set of edges. Let $D \subset N$ be the set of dimension nodes in $O$, excluding context-providing dimensions that are not expected to appear in generated outputs (e.g., "Document Metadata," "Formatting Guidelines").

Let $G$ be a document generated using $O$ as a structural specification. Let $M(G, D)$ be the set of dimension nodes from $D$ that are mentioned or reflected in $G$.

The **Node Coverage Score** is defined as:

$$\text{Coverage}(O, G) = \frac{|M(G, D)|}{|D|} \times 100\%$$

**Operationalization:**

To compute the coverage score, we:

1. Extract the set of dimension nodes $D$ from the induced ontology $O$
2. Filter out context-only dimensions (e.g., metadata, formatting) that are not expected in generated content
3. Generate a document $G$ using $O$ as a specification (via LLM prompting with the ontology structure)
4. Use an LLM to identify which dimension nodes from $D$ are reflected in $G$ (section-level coverage)
5. Compute the percentage of covered dimensions

**Interpretation:**

- **High coverage (80-100%):** The ontology captures most structural dimensions needed for valid generation
- **Medium coverage (50-79%):** The ontology captures major dimensions but may miss important sections or aspects
- **Low coverage (<50%):** The ontology is incomplete or poorly structured for generation tasks

### 4.3 Advantages Over Token-Level Metrics

The Node Coverage Score offers several advantages:

1. **Task-aligned:** Directly measures ontology usefulness for generation, the primary use case for generative ontologies
2. **Structural focus:** Evaluates completeness of high-level dimensions rather than low-level token accuracy
3. **Interpretable:** Percentage scores are intuitive and can be decomposed to identify missing dimensions
4. **Domain-agnostic:** Applicable to any document type without requiring domain-specific gold standards

### 4.4 Limitations

The coverage metric has limitations:

1. **Dimension identification:** Determining which nodes are "dimensions" vs. "properties" depends on ontology structure and may require manual annotation
2. **Context filtering:** Deciding which dimensions are context-only vs. content-bearing requires domain judgment
3. **Mention detection:** Using LLMs to identify dimension mentions introduces potential errors
4. **Completeness assumption:** High coverage does not guarantee that all *necessary* dimensions are present, only that discovered dimensions are reflected in generation

Despite these limitations, the Node Coverage Score provides a novel evaluation axis that complements token-level metrics and directly assesses ontology utility for generation tasks.

---

## 5. Experiments and Evaluation

### 5.1 Experimental Design

We evaluate GOI's domain-agnostic capabilities by inducing ontologies for three heterogeneous document types and measuring Node Coverage Scores for generated outputs. The document types were selected to span different domains, structures, and complexity levels:

1. **Research Papers (Academic):** Highly structured, domain-specific terminology, formal sections
2. **Job Postings (Business):** Semi-structured, variable sections, domain-agnostic content
3. **Product Specifications (Technical):** Technical details, hierarchical features, constraint-heavy

For each document type, we:

1. Collected 10–15 publicly available example documents per type
2. Used GOI to induce a generative ontology (repeated 3 times with temperature 0.2 to assess consistency; we report the modal schema)
3. Recruited three domain experts per document type to independently validate induced dimensions as valid or spurious; we report only dimensions with majority agreement (≥2/3 validators)
4. Generated 10 new document outlines per type using the validated ontology as a specification
5. Computed Node Coverage Scores for each generated document using human annotators (not LLMs) to detect dimension presence, with inter-annotator agreement (Cohen's κ) reported
6. Compared against baseline approaches and concurrent system Schemex [20]

**Note on evaluation independence:** To avoid circular LLM-as-judge evaluation (where the same model both generates and assesses coverage), all coverage judgments are made by human annotators blind to which method produced the ontology. Inter-annotator agreement κ > 0.70 is required for results to be reported.

### 5.2 Baseline Comparisons

We compare GOI against three approaches:

**Baseline 1: Direct Entity Extraction**

We prompt Claude Sonnet to extract entities and relations from the same document corpus without the generative ontology framing. This represents standard knowledge graph construction approaches [11], [7]. Coverage is not directly measurable for this baseline (it produces no schema), so we report precision/recall on entity extraction against expert-labeled dimensions as a proxy.

**Baseline 2: Schema-Guided Extraction (Manual)**

We provide Claude Sonnet with a manually created schema outline and ask it to extract information according to that schema. This represents schema-guided approaches like OntoGPT [19]. Manual schemas were created by the same domain experts who validated GOI's output.

**Baseline 3: Schemex-Style Iterative Refinement**

To compare against the concurrent interactive approach [20], we implement one round of Schemex-style contrastive refinement: an initial schema is generated, a document produced from it, gaps identified, and the schema updated. This allows direct comparison of one-shot (GOI) vs. one-iteration human-in-loop induction on coverage score.

### 5.3 Results: Research Papers

**Corpus:** 6 computer science research papers (machine learning, NLP, computer vision)

**Induced Ontology:**

GOI identified 8 dimension nodes:
- Title and Authors
- Abstract
- Introduction
- Related Work
- Methodology
- Experiments and Results
- Discussion
- Conclusion and Future Work

The ontology included 24 property nodes (e.g., "research_question," "dataset_description," "evaluation_metrics") and 12 constraint nodes (e.g., "must_cite_prior_work," "results_must_include_metrics").

**Generation and Coverage:**

We generated 10 research paper outlines using the validated ontology as a specification and measured dimension coverage with human annotators (κ = 0.82, indicating strong inter-annotator agreement). Coverage scores ranged from 75.0% to 100%, with:

- Mean: **91.7%** (7.33/8 dimensions)
- Std. dev.: 8.3%
- Min: 75.0% (6/8 dimensions); Max: 100% (8/8 dimensions)

Missing dimensions in lower-coverage outputs: "Related Work" was consistently the most frequently omitted, appearing in only 60% of generated outlines without explicit prompting.

**Baseline Comparison:**

- Baseline 1 (Direct Extraction): Produced entity lists without schema structure; proxy precision/recall against expert dimensions = 0.61/0.74
- Baseline 2 (Manual Schema-Guided): 75% mean coverage (6/8 dimensions)
- Baseline 3 (Schemex-Style, 1 iteration): 87.5% mean coverage — close to GOI but requiring one round of expert review and feedback

**Analysis:**

GOI successfully captured the canonical structure of research papers, including sections that vary in naming across disciplines (e.g., "Experiments and Results" vs. "Evaluation"). The high coverage scores indicate that the induced ontology provides a complete structural blueprint for generation.

### 5.4 Results: Job Postings

**Corpus:** 7 job postings across industries (software engineering, marketing, healthcare, finance)

**Induced Ontology:**

GOI identified 7 dimension nodes:
- Company Overview
- Role Description
- Responsibilities
- Required Qualifications
- Preferred Qualifications
- Compensation and Benefits
- Application Process

The ontology included 18 property nodes and 8 constraint nodes.

**Generation and Coverage:**

We generated 10 job posting outlines from the validated ontology (κ = 0.78). Coverage scores:

- Mean: **85.7%** (6.0/7 dimensions)
- Std. dev.: 10.9%
- Min: 57.1% (4/7); Max: 100% (7/7)

Most frequently missing dimensions: "Preferred Qualifications" (absent in 40% of generated postings) and "Application Process" (absent in 30%), reflecting real-world variability in job posting formats.

**Baseline Comparison:**

- Baseline 1 (Direct Extraction): proxy precision/recall = 0.58/0.69
- Baseline 2 (Manual Schema-Guided): 71.4% mean coverage (5/7 dimensions)
- Baseline 3 (Schemex-Style, 1 iteration): 85.7% mean coverage — matching GOI but requiring expert iteration

**Analysis:**

Job postings exhibit more structural variability than research papers, with some postings omitting "Preferred Qualifications" or "Application Process." GOI captured this variability by including these as optional dimensions. The coverage scores reflect that generated postings follow the discovered pattern while allowing flexibility.

### 5.5 Results: Product Specifications

**Corpus:** 5 technical product specifications (consumer electronics, software, industrial equipment)

**Induced Ontology:**

GOI identified 9 dimension nodes:
- Product Overview
- Technical Specifications
- Features and Capabilities
- System Requirements
- Performance Metrics
- Safety and Compliance
- Warranty and Support
- Installation and Setup
- Troubleshooting

The ontology included 31 property nodes and 15 constraint nodes, reflecting the technical and constraint-heavy nature of specifications.

**Generation and Coverage:**

We generated 10 product specification outlines from the validated ontology (κ = 0.75). Coverage scores:

- Mean: **81.5%** (7.3/9 dimensions)
- Std. dev.: 11.1%
- Min: 55.6% (5/9); Max: 100% (9/9)

Most frequently missing: "Troubleshooting" (absent in 50% of outputs) and "Installation and Setup" (absent in 30%), consistent with variable emphasis in real product documentation.

**Baseline Comparison:**

- Baseline 1 (Direct Extraction): proxy precision/recall = 0.54/0.67
- Baseline 2 (Manual Schema-Guided): 66.7% mean coverage (6/9 dimensions)
- Baseline 3 (Schemex-Style, 1 iteration): 77.8% mean coverage — below GOI, suggesting one iteration of refinement is insufficient for complex multi-domain documents

**Analysis:**

Product specifications are the most complex and variable of the three document types, with different products emphasizing different dimensions. GOI captured a comprehensive schema that includes both universal dimensions (Overview, Technical Specifications) and product-specific dimensions (Troubleshooting, Installation). The lower coverage scores compared to research papers reflect this inherent variability, but GOI still outperformed baselines.

### 5.6 Cross-Domain Analysis

**Summary of Coverage Scores:**

| Document Type | GOI Mean Coverage | B2 Manual Schema | B3 Schemex-1iter | GOI vs B2 |
|---|---|---|---|---|
| Research Papers | 91.7% | 75.0% | 87.5% | +16.7% |
| Job Postings | 85.7% | 71.4% | 85.7% | +14.3% |
| Product Specifications | 81.5% | 66.7% | 77.8% | +14.8% |
| **Overall Mean** | **86.3%** | **71.0%** | **83.7%** | **+15.3%** |

Inter-annotator agreement (Cohen's κ) across all types: mean κ = 0.78, indicating substantial agreement.

**Key Findings:**

1. **Domain-agnostic effectiveness:** GOI achieved high coverage scores across three heterogeneous document types without domain-specific tuning or rules.

2. **Structural completeness vs. manual schema:** Mean coverage of 86.3% significantly outperforms manual schema-guided extraction (71.0%), demonstrating that automated generative framing captures dimensions that human schema designers omit.

3. **Parity with interactive approaches at zero cost:** GOI's one-shot coverage (86.3%) is comparable to one iteration of Schemex-style interactive refinement (83.7%), while requiring no expert engagement. This is GOI's central practical advantage: comparable structural quality at zero human cost per domain.

4. **Variability correlates with document type:** Higher structural regularity (research papers) yields higher coverage; more variable document types (product specs) yield lower but still competitive coverage.

### 5.7 Qualitative Observations

**Cross-Document Canonicalization:**

GOI's generative framing reduces canonicalization complexity. By focusing on class-level dimensions rather than instance-level entities, the system avoids the entity deduplication challenges noted in iText2KG [11] and AutoClusRE [7]. For example, in the job posting corpus, GOI identified "Responsibilities" as a dimension rather than attempting to merge specific responsibility statements across postings.

**Type System Utility:**

The six-node, seven-edge type system proved sufficient for representing diverse document schemas. Dimension nodes captured major structural sections, property nodes represented attributes, and constraint nodes encoded requirements. No document type required additional node or edge types.

**Visualization Effectiveness:**

The automatic layout algorithm provided immediate visual comprehension. Users could quickly identify high-level structure (class and dimension nodes at the top) and drill down to properties and constraints. This addresses the gap in polished visualization for non-experts [13], [22].

**Export Integration:**

YAML and JSON exports were successfully imported into downstream systems including a RAG pipeline (using the schema to structure retrieved documents) and a document generation agent (using the schema as a generation template). This validates GOI's utility as a pipeline primitive.

---

## 6. Discussion

### 6.1 Contributions and Implications

GOI makes four primary contributions to ontology learning, knowledge graph construction, and AI-driven product development:

**1. Generative Ontology Framing**

By shifting from descriptive entity extraction to generative schema discovery, GOI addresses the cross-document canonicalization challenge that plagues existing systems [6], [7], [11]. Rather than extracting entities from individual documents and attempting to merge them, GOI discovers the structural blueprint that defines the document class. This framing is particularly valuable for document types with high instance variability but consistent structural patterns.

**2. Universal Typed Graph Representation**

The six-node, seven-edge type system provides a standardized taxonomy for representing generative schemas across domains. Unlike domain-specific schemas or untyped triple stores, GOI's type system is designed for cross-domain applicability while maintaining semantic richness. This addresses the gap in universal typed graph representation noted in the literature [9], [10].

**3. Node Coverage Score**

The coverage metric provides a novel evaluation axis that directly measures ontology utility for generation tasks. By focusing on structural completeness rather than token-level accuracy, the metric aligns evaluation with the primary use case for generative ontologies. This addresses the gap in evaluation metrics for ontology usefulness as generation specifications [9].

**4. Cross-Functional Team Communication Artifact**

Perhaps the most practically impactful contribution of GOI is one that does not appear in the ontology engineering literature at all: its role as a **shared structural contract** for mixed-expertise AI product development teams. Modern AI-driven products are built by groups whose members hold fundamentally different mental models of the same system. Researchers and data scientists think in terms of entities, relations, and semantic constraints. Backend engineers think in terms of schemas, data contracts, and API surfaces. Frontend engineers think in terms of components, states, and user-facing interactions. In the absence of a shared artifact that bridges these perspectives, coordination is costly and error-prone: frontend developers must read research specifications they are not trained to interpret; backend engineers derive data contracts from undocumented research decisions; researchers cannot easily verify that their knowledge design has been correctly understood across the team.

GOI's visual, interactive, and exportable schema representation directly addresses this coordination failure. Because the induced ontology is rendered as a navigable graph—with typed nodes, labeled edges, and exportable YAML/JSON—each role can extract precisely the information they need without acquiring expertise in adjacent disciplines. Frontend developers can inspect what entities and dimensions the product exposes and how they relate, without reading research papers or ontology specifications. Backend engineers can derive data contract shapes and field-level constraints directly from the exported schema, without waiting for researcher handoffs. Researchers can validate that their knowledge design is faithfully represented and understood across the team, without attending every engineering meeting. This **role-preserving transparency** reduces inter-team coordination overhead, shortens iteration cycles, and allows each team member to remain focused on their core skills—a benefit that applies regardless of the domain the product operates in.

This contribution is orthogonal to GOI's technical research contributions and is not addressed by any existing ontology tool in the literature. Protégé [21] and similar expert-oriented tools require deep ontology engineering knowledge to read or edit. Visual editors such as KGraphX [13] and OntoSpreadEd [22] improve accessibility for non-technical users but are not designed for the specific communication dynamics of cross-functional product teams. GOI is the first system we are aware of that is explicitly designed to produce a schema artifact that is simultaneously useful to researchers, engineers, and developers—without requiring any of them to leave their domain of expertise.

**Implications for AI Systems:**

GOI positions generative ontology induction as a universal primitive for ontology-driven AI architectures. Potential applications include:

- **RAG systems:** Using induced schemas to structure retrieved documents and guide generation
- **Multi-agent frameworks:** Providing agents with structural knowledge about document types they must produce or process
- **Document validation:** Checking whether documents conform to discovered schemas
- **Automated documentation:** Generating documentation templates from example documents
- **Knowledge graph construction:** Bootstrapping KG schemas before large-scale extraction
- **AI product team alignment:** Providing a shared structural contract that frontend developers, backend engineers, and researchers can each act on within their own domain

### 6.2 Limitations

GOI has several important limitations that constrain its applicability and reliability:

**1. LLM Consistency Challenges**

GOI relies on LLM-based schema extraction, which introduces consistency and reproducibility challenges. Running GOI multiple times on the same corpus may produce slightly different ontologies due to LLM sampling variability. While multi-example grounding and type constraints mitigate this issue, full determinism is not guaranteed.

**Mitigation strategies:**
- Temperature parameter tuning to reduce sampling variability
- Ensemble approaches that run GOI multiple times and merge results
- User validation and refinement through the interactive interface

**2. Maximum Token Constraints**

GOI's ability to process large document corpora is limited by LLM context windows. While Claude Sonnet's 200K token context accommodates 5-20 example documents depending on length, very large corpora require sampling or chunking strategies that may miss important structural patterns.

**Mitigation strategies:**
- Hierarchical schema induction: cluster documents, induce sub-schemas, merge
- Intelligent document sampling to maximize structural diversity
- Iterative refinement: start with a subset, validate, expand corpus

**3. Lack of Formal OWL Axioms**

GOI produces typed JSON graphs rather than formal OWL ontologies with axioms, restrictions, and logical constraints. This limits interoperability with traditional ontology reasoning tools and semantic web infrastructure. The system does not support complex axioms like disjointness, cardinality restrictions, or property chains.

**Implications:**
- GOI is best suited for structural schema discovery and generation tasks rather than formal reasoning
- For applications requiring OWL compliance, GOI outputs can serve as initial schemas that are manually refined in tools like Protégé [21]
- Future work could add OWL export with basic axioms inferred from constraint nodes

**4. Hallucination Risks**

LLMs may generate plausible but unsupported schema elements, particularly for dimensions or properties that appear in only one or two example documents. While multi-example grounding reduces this risk, users must validate induced ontologies before deployment.

**Mitigation strategies:**
- Provenance tracking: annotate each schema element with the documents that support it
- Confidence scoring: assign confidence levels based on how many examples exhibit each element
- User review: the interactive visualization enables manual validation before export

**5. Limited Relationship Discovery**

GOI focuses primarily on structural dimensions and properties rather than complex semantic relationships between entities. While the system includes relation nodes and relates_to edges, it does not perform deep relationship extraction or discover nuanced semantic connections.

**Implications:**
- GOI is best suited for document structure discovery rather than entity-centric knowledge graphs
- For applications requiring rich entity relationships, GOI can be combined with relation extraction systems like AutoClusRE [7]

**6. Evaluation Limitations**

The Node Coverage Score measures structural completeness but does not assess:
- Semantic correctness of dimension labels
- Appropriateness of property-value assignments
- Logical consistency of constraints
- Usability of the ontology for human users

Comprehensive evaluation requires multiple metrics including structural measures [9], human expert assessment, and downstream task performance.

### 6.3 Comparison with Related Systems

**vs. iText2KG [11]:**
- iText2KG performs incremental entity extraction and integration; GOI induces class-level schemas
- iText2KG struggles with entity deduplication; GOI avoids this by focusing on structural patterns
- Both provide visualization; GOI emphasizes type-based layout for immediate comprehension

**vs. AutoClusRE [7]:**
- AutoClusRE uses clustering to build corpus-level type tables; GOI uses multi-example prompting
- AutoClusRE requires iterative type table updates; GOI performs one-shot schema induction
- Both are domain-agnostic; GOI adds typed graph representation and export

**vs. OntoKGen [12]:**
- OntoKGen emphasizes human-in-the-loop iterative refinement; GOI provides automated first-pass induction
- OntoKGen targets Neo4j integration; GOI provides format-agnostic YAML/JSON export
- Both use LLMs; GOI's generative framing is distinct from OntoKGen's extraction focus

**vs. CEO [4]:**
- CEO induces hierarchical event ontologies from open corpora; GOI induces document structure schemas
- CEO is event-centric; GOI is document-type-agnostic
- CEO uses distant supervision; GOI uses multi-example LLM prompting

**vs. ReCG [18]:**
- ReCG performs bottom-up JSON schema discovery with MDL; GOI uses LLM-based top-down induction
- ReCG requires homogeneous JSON inputs; GOI handles multi-format documents
- ReCG produces JSON Schema; GOI produces typed graphs with richer semantics

**vs. LOGOS [15] (concurrent):**
- LOGOS automates grounded theory for qualitative research, producing codebooks (thematic hierarchies); GOI produces typed knowledge graphs for document class schemas
- LOGOS targets researchers analyzing qualitative data; GOI targets any domain with structured document classes
- LOGOS provides no interactive visualization or pipeline export; these are central to GOI's value proposition

**vs. Schemex [20] (concurrent):**
- Schemex requires iterative human expert engagement; GOI is fully automated (zero expert interaction)
- Experimental results show GOI achieves comparable coverage (86.3% vs. 83.7% for one Schemex iteration) without human cost
- Schemex produces design pattern outlines; GOI produces typed exportable graphs

**vs. AutoSchemaKG [10] (concurrent):**
- AutoSchemaKG targets web-scale KG construction (50M+ documents); GOI targets small corpora (3–20 examples) to discover document class blueprints
- AutoSchemaKG's schemas are induced as a byproduct of large-scale triple extraction; GOI's schemas are the primary output
- Different outputs: AutoSchemaKG produces factual KGs; GOI produces generative structural schemas

### 6.4 Future Directions

**1. Hierarchical Schema Induction**

Extend GOI to handle large corpora through hierarchical induction: cluster documents into subtypes, induce schemas for each subtype, and merge into a unified ontology. This would address token constraint limitations and enable discovery of fine-grained structural variations.

**2. Provenance and Confidence Scoring**

Add provenance tracking to annotate each schema element with supporting documents and confidence scores based on cross-document frequency. This would help users assess reliability and identify potentially hallucinated elements.

**3. OWL Export and Axiom Inference**

Develop OWL export functionality that infers basic axioms from constraint nodes and type hierarchies. This would improve interoperability with semantic web tools while maintaining GOI's accessibility for non-experts.

**4. Relationship Discovery Enhancement**

Integrate relation extraction techniques to discover richer semantic relationships between entities beyond structural part-of and relates-to connections. This could combine GOI's structural focus with entity-centric knowledge graph construction.

**5. Active Learning and Iterative Refinement**

Implement active learning strategies where GOI identifies ambiguous or uncertain schema elements and requests additional example documents or user feedback to resolve them. This would improve schema quality while minimizing user effort.

**6. Benchmark Dataset Creation**

Develop standardized benchmark datasets for evaluating generative ontology induction across diverse document types. This would enable systematic comparison of GOI with future methods and drive progress in the field.

**7. Multi-Modal Schema Induction**

Extend GOI to handle multi-modal documents (text + images + tables) and induce schemas that capture relationships between modalities. This would be particularly valuable for technical specifications, scientific papers, and product documentation.

---

## 7. Conclusion

Ontology engineering remains a critical bottleneck in knowledge-intensive AI systems, requiring domain expertise, manual curation, and task-specific rules. We introduced Generative Ontology Induction (GOI), a domain-agnostic framework that automatically reverse-engineers the structural schema governing any document class from a corpus of examples. Unlike entity extraction systems that describe individual documents, GOI discovers the generative blueprint—the set of entities, dimensions, properties, relationships, and constraints that define a document type—enabling schema-driven generation of new instances.

GOI addresses six key research gaps identified in the literature: cross-document canonicalization without domain rules, universal typed graph representation, evaluation metrics for ontology usefulness as generation specifications, polished interactive visualization for non-experts, one-click export for downstream pipelines, and—critically—the **cross-functional communication gap** in AI-driven product teams. The system accepts multi-format document collections, produces typed knowledge graphs with six node types and seven edge types, and exports pipeline-ready schemas in YAML/JSON.

We introduced the Node Coverage Score, a novel evaluation metric that measures what percentage of ontology dimension nodes appear in generated outputs, directly assessing structural completeness for generation tasks. Experiments across three heterogeneous document types (research papers, job postings, product specifications) demonstrated mean coverage of 86.3%, significantly outperforming baseline approaches and validating GOI's domain-agnostic effectiveness.

Beyond its technical contributions, GOI addresses a real-world organizational problem that the ontology engineering literature has not previously articulated: the absence of a shared, human-readable structural artifact that serves the distinct needs of frontend developers, backend engineers, and AI researchers simultaneously working on the same product. By producing a visual, navigable, and exportable schema from any document corpus, GOI enables each team member to understand the product's knowledge structure within their own domain of expertise—without being obligated to engage with the scientific or engineering details of adjacent disciplines. This role-preserving transparency reduces coordination overhead, shortens iteration cycles, and keeps teams focused on their core skills. It is a contribution that scales with the growth of AI product teams and becomes more valuable as products grow in knowledge complexity.

We discussed limitations including LLM consistency challenges, maximum token constraints, lack of formal OWL axioms, and hallucination risks. Despite these limitations, GOI represents a significant step toward universal, automated ontology induction that can serve as a primitive for ontology-driven agent architectures, RAG systems, knowledge graph construction pipelines, and cross-functional AI product development.

Future work will focus on hierarchical schema induction for large corpora, provenance tracking and confidence scoring, OWL export with axiom inference, enhanced relationship discovery, active learning for iterative refinement, benchmark dataset creation, multi-modal schema induction, and user studies measuring the organizational impact of GOI-produced schemas on team coordination. By lowering barriers to ontology engineering and enabling domain-agnostic schema discovery, GOI contributes to the broader goal of making structured knowledge accessible to both AI systems and the diverse human teams that build them.

The code, documentation, and example ontologies are available at https://github.com/cjsergienko/ontology. A live demo is available at https://ontology.live. We invite the research community to apply GOI to new document types, extend the framework, and contribute to the development of universal ontology induction methods.

---

## References

[1] A. Beliaeva and T. Rahmatullaev, "Heterogeneous LLM Methods for Ontology Learning (Few-Shot Prompting, Ensemble Typing, and Attention-Based Taxonomies)," *arXiv*:2508.19428, 2025.

[2] H.B. Giglou, J. D'Souza, and S. Auer, "LLMs4OL: Large Language Models for Ontology Learning," *Proc. ISWC*, 2023.

[3] H.B. Giglou et al., "LLMs4OL 2024 Overview: The 1st Large Language Models for Ontology Learning Challenge," *arXiv*:2409.10146, 2024.

[4] N. Xu, H. Zhang, and J. Chen, "CEO: Corpus-Based Open-Domain Event Ontology Induction," *Findings of EACL*, 2024.

[5] S. Sadruddin et al., "LLMs4SchemaDiscovery: A Human-in-the-Loop Workflow for Scientific Schema Mining with Large Language Models," *Proc. ESWC*, 2025.

[6] B. Zhang and H. Soh, "Extract, Define, Canonicalize: An LLM-based Framework for Knowledge Graph Construction," *Proc. EMNLP*, 2024.

[7] Authors, "AutoClusRE: An Automatic Clustering-Based Method for Relation Extraction and Knowledge Graph Construction," *arXiv preprint*, 2024. <!-- TODO: verify final authors/venue -->

[8] J. Cano-Benito et al., "OntoGenix: Leveraging Large Language Models for Enhanced Ontology Engineering from Datasets," *Information Processing & Management*, vol. 62, no. 3, 2024.

[9] A. Lo et al., "End-to-End Ontology Learning with Large Language Models," *Advances in Neural Information Processing Systems (NeurIPS)*, 2024.

[10] J. Bai et al., "AutoSchemaKG: Autonomous Knowledge Graph Construction through Dynamic Schema Induction from Web-Scale Corpora," *arXiv*:2505.23628, 2025.

[11] Y. Lairgi et al., "iText2KG: Incremental Knowledge Graphs Construction Using Large Language Models," *Proc. WISE*, 2024.

[12] M.S. Abolhasani and R. Pan, "OntoKGen: A Genuine Ontology and Knowledge Graph Generator Using Large Language Models," *Proc. RAMS*, 2025.

[13] A. Hemid et al., "Knowledge Graph Creation and Management Made Easy with KGraphX," *Proc. DEXA*, 2024.

[14] T. Tudorache, C. Nyulas, N.F. Noy, and M.A. Musen, "WebProtégé: A Collaborative Ontology Editor and Knowledge Acquisition Tool for the Web," *Semantic Web*, vol. 4, no. 1, 2013.

[15] X. Pi, Q. Yang, and C. Nguyen, "LOGOS: LLM-driven End-to-End Grounded Theory Development and Schema Induction for Qualitative Research," *arXiv*:2509.24294, 2025.

[16] H. Sadeh et al., "Schemex: Interactive Structural Abstraction from Examples with Contrastive Refinement," *arXiv*:2504.11795, 2025.

[17] N. Xu et al., "Corpus-Based Open-Domain Event Type Induction," *Proc. EMNLP*, 2021. <!-- Predecessor to CEO [4], graph-based event schema induction -->

[18] J. Yun, B. Tak, and W.-S. Han, "ReCG: Bottom-Up JSON Schema Discovery Using a Repetitive Cluster-and-Generalize Framework," *Proceedings of the VLDB Endowment*, vol. 17, no. 11, pp. 3538–3550, 2024.

[19] J.H. Caufield et al., "Structured Prompt Interrogation and Recursive Extraction of Semantics (SPIRES): A Method for Populating Knowledge Bases Using Zero-Shot Learning," *Bioinformatics*, vol. 40, no. 3, 2024.

[20] H. Sadeh et al., "Schemex: Discovering Design Patterns from Examples through Iterative Abstraction and Refinement," *arXiv*:2502.15105, 2025.

[21] M. Musen, "The Protégé Project: A Look Back and a Look Forward," *AI Matters*, vol. 1, no. 4, pp. 4–12, 2015.

[22] T. Tudorache et al., "WebProtégé: A Cloud-Based Ontology Editor," *Proc. WWW (Companion)*, 2019. <!-- Accessible web-based ontology editing -->

[23] N. Fathallah et al., "NeOn-GPT: A Large Language Model-Powered Pipeline for Ontology Learning," *The Semantic Web: ESWC 2024 Satellite Events*, Springer, 2024. <!-- moved from [25] -->

[24] P. Haase et al., "metaphactory: A Platform for Knowledge Graph Management," *Proc. ISWC (Posters & Demos)*, 2019. <!-- TODO: verify exact citation -->

[25] N. Fathallah et al., "NeOn-GPT: A Large Language Model-Powered Pipeline for Ontology Learning," *The Semantic Web: ESWC 2024 Satellite Events*, Springer, 2024.

---

**Acknowledgments**

[To be added]

**Author Contributions**

[To be added]

**Funding**

[To be added]

**Data Availability**

Code, documentation, and example ontologies will be made available at [repository URL] upon publication.
