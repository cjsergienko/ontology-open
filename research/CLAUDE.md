# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an academic research paper project for **Generative Ontology Induction (GOI)** — a domain-agnostic framework for automatic schema discovery from document corpora using LLMs. The paper targets **ISWC 2025** submission in Springer LNCS format.

## Author Info
- **Author:** Sergei Sergienko
- **Affiliation:** Pivots Global
- **Email:** ssergienko@ontology.live
- **Code repo:** https://github.com/cjsergienko/ontology (public)
- **Live demo:** https://ontology.live

## Key Files

| File | Purpose |
|---|---|
| `GOI_research_paper.md` | Primary paper source in Markdown (canonical content) |
| `GOI_research_paper.tex` | LaTeX version in LNCS format (compiled from .md) |
| `GOI_research_paper.pdf` | Compiled output |
| `llncs.cls` | Springer LNCS document class (must stay in directory) |
| `todo.md` | Task tracking for paper completion |

## Building the PDF

```bash
# Compile LaTeX (run twice to resolve citations/cross-references)
pdflatex -interaction=nonstopmode GOI_research_paper.tex
pdflatex -interaction=nonstopmode GOI_research_paper.tex

# View PDF
open GOI_research_paper.pdf
```

Compilation artifacts (`.aux`, `.log`, `.out`) are normal and can be ignored.

## Research Data Files

The CSV files are literature search results from multiple academic databases (arXiv, Google Scholar, SciSpace) used to support the Related Work section:

- `arxiv_*.csv`, `scholar_*.csv`, `scispace_*.csv` — raw search results by topic
- `combined_*.csv` — deduplicated/merged results across sources
- `commercial_ontology_competitors_*.csv` — commercial tool landscape analysis
- `web_search_*.json` — raw web search results

Research insights are synthesized in:
- `domain_agnostic_ontology_gaps.md` — analysis of open problems in the literature
- `core_feature_research_gaps.md` — gap analysis table by feature area
- `ontology_research_insights.md` — high-level synthesis
- `ontology_live_scraped.md` — scraped ontology tool data

## Paper Structure

The paper has 7 sections:
1. **Introduction** — structure gap problem, cross-functional team communication gap
2. **Related Work** — zero-shot/few-shot ontology construction, corpus-based schema induction, visualization
3. **GOI Framework** — typed graph (6 node types, 7 edge types), multi-document prompting, layout algorithm, import/export
4. **Node Coverage Score** — novel evaluation metric measuring dimension node coverage in generated outputs
5. **Experiments** — three heterogeneous document types, coverage scores vs. baselines
6. **Discussion** — limitations (LLM consistency, token limits, hallucination risks)
7. **Conclusion**

## Core Technical Claims

- **6 node types**: class, property, value, dimension, relation, constraint
- **7 edge types**: is_a, has_property, has_value, relates_to, part_of, constrains, instance_of
- **Node Coverage Score**: % of ontology dimension nodes appearing in LLM-generated outputs
- Accepts multi-format input: PDF, images, text, JSON, YAML
- Exports: YAML/JSON for pipeline integration

## LNCS Format Requirements

- Page limit: typically 15 pages for full papers
- `\documentclass{llncs}` with `llncs.cls` in same directory
- Bibliography via `\bibitem` (no BibTeX file — references inline in `.tex`)
- Author anonymization may be required for blind review
