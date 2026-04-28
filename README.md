# ontology.live — Generative Ontology Induction

Open-source companion to the paper **"Generative Ontology Induction: Domain-Agnostic Schema Discovery from Document Corpora Using Large Language Models"** (Sergienko, 2026; ISWC 2025 submission). This repository hosts the live tool at [ontology.live](https://ontology.live), the LaTeX/PDF source of the paper, and the full reproducibility bundle for the §5 generative-validation experiments. The paper introduces **Generative Ontology Induction (GOI)** — a six-node-type, seven-edge-type typed graph framework for inducing generative ontologies directly from heterogeneous document corpora — and validates the resulting ontologies under a broadened **Node Coverage Score (NCS)** metric across four domains, showing that GOI-induced ontologies are sufficient as system prompts to drive an LLM to produce structurally-complete documents where a 3-field generic baseline degrades by 22–48 percentage points on bespoke schemas.

---

## Companion to the paper

- **Paper PDF (this repo):** [`research/GOI_research_paper.pdf`](research/GOI_research_paper.pdf) — 11 pages, Springer LNCS format
- **LaTeX source:** [`research/GOI_research_paper.tex`](research/GOI_research_paper.tex)
- **arXiv:** TBD — pending moderator review (submission `7503066`)
- **Zenodo DOI (code + supplementary, archival):** [`10.5281/zenodo.19772179`](https://doi.org/10.5281/zenodo.19772179)
- **Live demo:** [https://ontology.live](https://ontology.live) (Google sign-in; see "Try the live app" below)
- **Author:** Sergei Sergienko — Pivots Global — `ssergienko@ontology.live`
- **Contact:** `contact@ontology.live`

---

## Headline result

The §5.5 experiment compares **System A (GOI)** — a Claude Sonnet generation primed with the GOI ontology in `pipeline.promptReady` form — against **System B (3-field baseline)** — the same model given only the document type label, a one-line description, and a "be thorough" instruction. Outputs are scored under the broadened NCS protocol (`research/supplementary/scoring_protocol.md`): label match, example match, and distinctive-token match against every structural node in the reference ontology.

| Case | Ontology | Domain | Structural nodes | GOI (System A) | 3-field (System B) | Gap |
|------|----------|--------|-----------------:|---------------:|-------------------:|----:|
| 1 | Software Services Invoice | B2B billing | 45 | 97.8% | 97.8% | 0.0 pp |
| 2 | Job Description | Talent acquisition | 23\* | 100.0% | 52.2% | 47.8 pp |
| 3 | Pain-Management Clinical Visit | Healthcare | 45 | 95.6% | 62.2% | 33.4 pp |
| 4 | Professional Services Contract | Legal | 46 | 100.0% | 78.3% | 21.7 pp |

\* Case 2 reports the 23 applicable non-context structural nodes (the JD ontology contains additional `metadata.generate = "context"` nodes excluded from output-side scoring per §5.4 of the paper).

**Interpretation.** GOI's structural-coverage advantage scales with how non-boilerplate the document type is. On highly templated artifacts where the LLM has strong priors — invoices in particular — generic 3-field prompting already saturates structural coverage and GOI provides no measurable benefit. As the document type becomes more bespoke (job descriptions, clinical visit notes, professional services contracts) the gap widens to 22–48 pp, with the largest gap on the JD ontology, whose dimension set encodes editorial conventions a model cannot recover from the type label alone. This is the core empirical claim of the paper: **a structured generative ontology is the lever that lets an LLM cover the long tail of domain-specific structural commitments.**

The numbers in the table above are read directly from `research/supplementary/coverage_scores.csv`; the per-node detection log used to derive them is at `research/supplementary/coverage_scores_detail.txt`.

---

## Try the live app

The hosted instance at [ontology.live](https://ontology.live) is the easiest way to inspect what the paper describes. After Google sign-in, every authenticated user receives a budget of **100,000 output tokens** (defined as `TOKEN_LIMIT` in [`lib/users.ts`](lib/users.ts)) — enough for roughly 16–20 ontology inductions or imports at typical sizes. When the budget is exhausted, the API returns HTTP 402 and the UI opens a contact-form modal that emails `contact@ontology.live` for budget extension.

The app supports three entry points, all reachable from the dashboard:

### 1. Manual graph editing

Click **New Ontology**, give it a name, description, and domain, then build the graph by hand:

- **Six node types:** `class`, `property`, `value`, `dimension`, `relation`, `constraint`
- **Seven edge types:** `is_a`, `has_property`, `has_value`, `relates_to`, `part_of`, `constrains`, `instance_of`

Click any node or edge to edit it in the right-hand side panel. The layout engine (`lib/layout.ts`) re-runs on demand. This is the simplest path for reviewers who want to inspect the type system end-to-end without invoking any LLM.

### 2. Import an existing ontology

Click **Import Ontology** and paste or upload an ontology in any of the following formats:

- JSON, YAML, OWL/XML, RDF/Turtle, Markdown, plain text descriptions

The Claude API parses the input and projects it onto the GOI typed graph. This is useful for reviewers who want to see how an existing OWL/RDF ontology gets re-expressed under the six-node-type system. (One import consumes some of your token budget — typically 3–10k output tokens depending on size.)

### 3. Generate from documents

Click **Generate from Files** and upload N example documents of the same type — PDFs, images, plain text, or markdown. The Anthropic Files API handles uploads above the per-request limit; client-side image compression keeps payloads tractable. Claude Sonnet then induces the generative ontology — the schema behind the document type — and the result lands in the editor as a typed graph. This is the headline "GOI" pipeline described in §3 of the paper.

---

## Reproducibility bundle

Everything needed to reproduce the §5.5 generative-validation experiment lives under [`research/supplementary/`](research/supplementary/). The bundle is self-contained: every reference ontology, every prompt, and every saved LLM output that produced the headline table is published verbatim.

```
research/supplementary/
├── ontologies/
│   ├── invoice_ontology.json          # Case 1 — 48 nodes, examples anonymized
│   ├── jd_ontology.json               # Case 2 — 63 nodes, published verbatim
│   ├── pain_visit_ontology.json       # Case 3 — 45 nodes, examples anonymized (no PHI)
│   └── contract_ontology.json         # Case 4 — 46 nodes, examples anonymized
├── prompts/
│   ├── system_a_goi_generation.txt    # GOI generation prompt (System A)
│   └── system_b_gst_baseline.txt      # 3-field generic baseline (System B)
├── generated_outputs/
│   ├── case1_invoice_goi.txt
│   ├── case1_invoice_gst.txt
│   ├── case2_jd_goi.txt
│   ├── case2_jd_gst.txt
│   ├── case3_pain_visit_goi.txt
│   ├── case3_pain_visit_gst.txt
│   ├── case4_contract_goi.txt
│   └── case4_contract_gst.txt         # 8 saved outputs = 4 cases × 2 systems
├── job_descriptions/                  # Case 2 corpus (3 anonymized listings)
│   ├── 01_ml_infrastructure_engineer.md
│   ├── 02_senior_ml_engineer.md
│   ├── 03_platform_engineer.md
│   └── README.md
├── coverage_scores.csv                # Headline 4×2 table
├── coverage_scores_detail.txt         # Per-node detection log
├── scoring_protocol.md                # Broadened-NCS matching rules
└── README.md                          # Bundle-specific notes (anonymization, naming)
```

**On the dual-view ontology JSONs.** Each file in `ontologies/` is shipped in the same shape the live tool exports: a top-level `ontology` block (name, description, domain), a `graph` block (raw `nodes` and `edges` — the canonical reload-into-tool form), and a `pipeline` block with `classes`, `dimensions`, `constraints`, and a markdown-rendered `promptReady` string. See "The export format" section below.

**On corpus availability.** Case 2's source corpus is reproduced verbatim in `job_descriptions/` (three anonymized listings from `pivotshiring.com`). Cases 1, 3, and 4 induced from confidential corpora — production invoices, clinical pain-management visit records, and consulting agreements respectively — that are withheld in full; the bundle's anonymized ontologies, prompts, and saved outputs are nonetheless sufficient to reproduce the §5.5 coverage scores. Reviewers requiring corpus access for replication of the induction step can contact the author under NDA. Full anonymization details are in `research/supplementary/README.md`.

---

## Reproducing the experiments

The deterministic scorer at `scripts/case_score_coverage.ts` reads the published `generated_outputs/` files and the published `ontologies/*.json` files, applies the matching rules from `scoring_protocol.md`, and rewrites `coverage_scores.csv` plus `coverage_scores_detail.txt`. Re-scoring is offline and free — no API calls.

```bash
# 1. Re-score the 4 cases against the saved generated outputs (offline, no API).
#    Regenerates research/supplementary/coverage_scores.csv and coverage_scores_detail.txt.
ANTHROPIC_API_KEY=sk-... npx tsx scripts/case_score_coverage.ts

# 2. Regenerate System A and System B outputs for cases 3 and 4 from scratch
#    (calls Claude Sonnet; expect roughly $0.10-$0.50 in API cost per script).
npx tsx scripts/case3_anonymize_and_run.ts   # Pain-Management Clinical Visit
npx tsx scripts/case4_anonymize_and_run.ts   # Professional Services Contract
```

Cases 1 and 2 outputs were generated in an earlier run and are preserved verbatim in `generated_outputs/`; cases 3 and 4 were added post-hoc from raw confidential inputs and therefore ship with anonymize-and-run scripts that perform the example-value substitution before calling the model. Decoding settings are described in §5.3 of the paper (`claude-sonnet-4-6`, identical settings for both systems).

---

## The export format (key paper artifact)

§3.4 of the paper specifies a dual-view export shape that lets the same ontology serve as (a) a graph the editor can reload, (b) a denormalized object an agent runtime can introspect, and (c) a markdown system-prompt block that drops directly into an LLM call. Each ontology JSON in the bundle is shipped in this shape:

```json
{
  "ontology": {
    "name": "Job Description Ontology",
    "description": "Ontology-driven job description generation — 8 categories, 42 dimensions, 42 role families. O*NET-aligned.",
    "domain": "hiring"
  },
  "graph": {
    "nodes": [ /* typed nodes — class | property | value | dimension | relation | constraint */ ],
    "edges": [ /* typed edges — is_a | has_property | has_value | relates_to | part_of | constrains | instance_of */ ]
  },
  "pipeline": {
    "classes":     [ /* classes with their immediate properties */ ],
    "dimensions":  [ /* generative dimensions — what to vary per document */ ],
    "constraints": [ /* hard constraints on legal value combinations */ ],
    "promptReady": "# Job Description Ontology\n\nOntology-driven job description generation — ..."
  }
}
```

The `pipeline.promptReady` field is the GOI thesis made tangible — a fully-rendered markdown ontology ready to drop verbatim into a system prompt. A typical `promptReady` block opens like this:

```markdown
# Job Description Ontology

Ontology-driven job description generation — 8 categories, 42 dimensions, 42 role families. O*NET-aligned.

**Domain:** hiring

## Classes
```

This is exactly the artifact System A consumes in the §5.5 experiment, and it is what the live tool's "Copy as system prompt" button produces.

---

## Repo structure

```
app/                    Next.js 16 App Router pages + API routes
  ontology/[id]/        Graph editor route
  api/ontologies/       REST API (list, create, update, import, generate)
  api/contact/          Token-limit contact form endpoint
components/             React UI (OntologyEditor, NewOntologyModal, NodePanel, ...)
lib/
  types.ts                NodeType, EdgeType, Ontology interfaces
  storage.ts              SQLite read/write (better-sqlite3)
  layout.ts               Graph layout (@dagrejs/dagre)
  users.ts                TOKEN_LIMIT = 100000, canUseAI, incrementTokensUsed
  notify.ts               Gmail OAuth — registration + contact emails
research/
  GOI_research_paper.tex      LaTeX source (LNCS format)
  GOI_research_paper.pdf      Compiled PDF (11 pages)
  llncs.cls                   Springer LNCS class
  supplementary/              Reproducibility bundle (see above)
  *.csv, *.json, *.md         Literature search artifacts
scripts/
  case_score_coverage.ts          Deterministic coverage scorer
  case3_anonymize_and_run.ts      Case 3 regen pipeline
  case4_anonymize_and_run.ts      Case 4 regen pipeline
  migrate-json-to-sqlite.ts       Storage migration helper
e2e/                    Playwright tests (5 spec files: auth, import, limits,
                        registration, upload-staging) — run on pre-push hook
data/                   Runtime SQLite (ontologies.db; gitignored)
```

---

## Self-host instructions

**Requirements:** Node.js >= 20, npm.

```bash
git clone https://github.com/cjsergienko/ontology-open.git ontology
cd ontology
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
```

`.env.local` additionally accepts `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` for NextAuth, plus Gmail OAuth credentials if you want the contact-form email flow. The minimum viable config for a local single-user run is just `ANTHROPIC_API_KEY`.

```bash
# Development (Turbopack, hot reload)
npm run dev -- --port 3900

# Production via PM2
pm2 restart ontology-builder
pm2 logs ontology-builder

# E2E tests (Playwright; runs auth, import, limits, registration, upload-staging)
npm run test:e2e
```

The app runs at **http://localhost:3900**. The maintainer's deployment is exposed at **https://ontology.live** via a Cloudflare tunnel (`tunnel-ontology-live` → `~/.cloudflared/config-ontology-live.yml`).

---

## Tech stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack in dev), React 19.2.3, TypeScript 5
- **Graph editor:** `@xyflow/react` 12 (React Flow) with `@dagrejs/dagre` for layout
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **AI:** Anthropic Claude Sonnet for ontology induction and import; Anthropic Files API for large multi-document uploads (see commits `fd0d9e9`, `79b47fe`)
- **Storage:** SQLite via `better-sqlite3` 12 — single file at `data/ontologies.db`
- **Auth:** NextAuth (`next-auth` 5 beta) with Google OAuth
- **Email:** `nodemailer` 8 over Gmail OAuth (registration + contact-form alerts)
- **Edge / production:** Cloudflare tunnel; PM2 process manager (`ontology-builder`)
- **Testing:** Playwright 1.58.2

---

## Citation

```bibtex
@misc{sergienko2026goi,
  title  = {Generative Ontology Induction: Domain-Agnostic Schema Discovery
            from Document Corpora Using Large Language Models},
  author = {Sergienko, Sergei},
  year   = {2026},
  note   = {arXiv preprint, submission 7503066 (under review).
            Code and supplementary at
            https://github.com/cjsergienko/ontology-open;
            archival DOI 10.5281/zenodo.19772179.}
}
```

---

## License and contact

This repository does not currently ship a top-level `LICENSE` file. Until one is added, the code and bundle are made available **for academic review and reproducibility purposes**; redistribution and derivative use should be coordinated with the author. A formal open-source license will be added once the paper enters its public-archive state.

For all questions — review, reproduction, corpus access under NDA, budget extensions on the live tool — write to **`contact@ontology.live`** (or directly to the author at `ssergienko@ontology.live`).
