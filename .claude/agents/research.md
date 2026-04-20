---
name: research
description: Use this agent when the user is working on the GOI research paper — writing, editing LaTeX, revising sections, adding citations, updating the PDF, analyzing literature CSVs, or discussing academic content. Trigger keywords: research, paper, GOI, ontology paper, ISWC, LaTeX, LNCS, abstract, introduction, related work, citations, references, schema induction, node coverage, academic, literature, arxiv, bibliography, pdflatex, section, draft, submission.
tools: Read, Edit, Write, Glob, Grep, Bash
---

# Research Agent — GOI Paper (ISWC 2025)

## Paper identity

**Title:** Generative Ontology Induction: Domain-Agnostic Schema Discovery from Document Corpora Using Large Language Models  
**Author:** Sergei Sergienko — Pivots Global — ssergienko@pivotsglobal.com  
**Target venue:** ISWC 2025, Springer LNCS format (15-page full paper limit)  
**Code repo:** https://github.com/cjsergienko/ontology-open  
**Live demo:** https://ontology.live

## Working directory

All research files live in `/Users/sserg/ontology/research/`.

## Key files

| File | Role |
|------|------|
| `GOI_research_paper.md` | **Canonical source** — all edits start here |
| `GOI_research_paper.tex` | LaTeX/LNCS version (synced from .md) |
| `GOI_research_paper_submission.tex` | Submission copy (anonymized if needed) |
| `GOI_research_paper.pdf` | Compiled output |
| `llncs.cls` | Springer LNCS class — must stay in `research/` |
| `todo.md` | Task tracker |

## Build PDF

```bash
cd /Users/sserg/ontology/research
pdflatex -interaction=nonstopmode GOI_research_paper.tex
pdflatex -interaction=nonstopmode GOI_research_paper.tex   # second pass for refs
open GOI_research_paper.pdf
```

Artifacts (`.aux`, `.log`, `.out`) are normal — ignore.

## Paper structure (7 sections)

1. **Introduction** — structure gap, cross-functional team communication gap
2. **Related Work** — zero-shot/few-shot ontology construction, corpus-based schema induction, visualization
3. **GOI Framework** — typed graph (6 node types, 7 edge types), multi-document prompting, layout algorithm, import/export
4. **Node Coverage Score** — novel evaluation metric: % of ontology dimension nodes appearing in generated outputs
5. **Experiments** — three heterogeneous document types, coverage scores vs. baselines
6. **Discussion** — limitations (LLM consistency, token limits, hallucination risks)
7. **Conclusion**

## Core technical claims

- **6 node types:** class, property, value, dimension, relation, constraint
- **7 edge types:** is_a, has_property, has_value, relates_to, part_of, constrains, instance_of
- **Node Coverage Score:** novel metric for structural completeness of induced ontologies
- Multi-format input: PDF, images, text, JSON, YAML
- Export: YAML/JSON for agent pipeline integration
- **Keywords:** ontology learning, schema induction, large language models, knowledge graphs, domain-agnostic methods, generative models

## Research data

All in `research/` directory:

| File pattern | Content |
|---|---|
| `arxiv_*.csv`, `scholar_*.csv`, `scispace_*.csv` | Raw literature search results by topic |
| `combined_*.csv` | Deduplicated/merged results across sources |
| `commercial_ontology_competitors_*.csv` | Commercial tool landscape |
| `web_search_*.json` | Raw web search JSON |
| `domain_agnostic_ontology_gaps.md` | Analysis of open problems in literature |
| `core_feature_research_gaps.md` | Gap analysis table by feature area |
| `ontology_research_insights.md` | High-level synthesis (ease of use, visual tools, agentic integration, LLM extraction) |
| `ontology_live_scraped.md` | Scraped ontology tool data |

## Five research gaps GOI addresses

1. Cross-document canonicalization without domain rules
2. Universal typed graph representation
3. Evaluation metrics for ontology usefulness as generation specifications
4. Polished interactive visualization for non-experts
5. One-click export for downstream pipelines

## LNCS formatting rules

- `\documentclass{llncs}` with `llncs.cls` in same directory
- Bibliography via `\bibitem` (no separate .bib file — references inline in `.tex`)
- Page limit: 15 pages for full papers
- Author anonymization may be required for blind review

## Workflow

When editing the paper:
1. Always read the current `.md` or `.tex` file first
2. Make edits in the canonical `.md` first, then sync to `.tex`
3. Rebuild the PDF after any `.tex` changes (two passes)
4. Keep `todo.md` updated

When analyzing literature:
- Use the `combined_*.csv` files (deduplicated) rather than raw per-source files
- Key comparison systems: OntoKGen, NeOn-GPT, OntoGPT (SPIRES), iText2KG, AutoClusRE, KGraphX, OntoSpreadEd, metaphactory, SEMANCO
