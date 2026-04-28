# Supplementary Materials — GOI Paper

This directory contains all artifacts needed to reproduce the
generative validation experiment in §5.5 of the paper
"Generative Ontology Induction: Domain-Agnostic Schema Discovery
from Document Corpora Using Large Language Models."

## Layout

```
supplementary/
├── ontologies/
│   ├── invoice_ontology.json              # Case 1: Software Services Invoice
│   │                                        (48 nodes; example values
│   │                                        anonymized — see note below)
│   ├── jd_ontology.json                   # Case 2: Job Description Ontology
│   │                                        (63 nodes; published verbatim)
│   ├── pain_visit_ontology.json           # Case 3: Pain-Management Clinical
│   │                                        Visit Record Ontology
│   │                                        (45 nodes; example values fully
│   │                                        anonymized — see note below)
│   └── contract_ontology.json             # Case 4: Professional Services
│                                            Contract & Statement of Work
│                                            Ontology (46 nodes; example
│                                            values fully anonymized — see
│                                            note below)
├── generated_outputs/
│   ├── case1_invoice_goi.txt              # System A on Invoice ontology
│   ├── case1_invoice_gst.txt              # System B (3-field) for "invoice"
│   ├── case2_jd_goi.txt                   # System A on JD ontology
│   ├── case2_jd_gst.txt                   # System B (3-field) for "job posting"
│   ├── case3_pain_visit_goi.txt           # System A on Pain-Management ontology
│   ├── case3_pain_visit_gst.txt           # System B for "clinical visit record"
│   ├── case4_contract_goi.txt             # System A on Professional Services
│   │                                        Contract & SOW ontology
│   └── case4_contract_gst.txt             # System B for "professional
│                                            services contract"
├── job_descriptions/                      # Case 2 corpus (3 anonymized listings)
│   ├── README.md
│   ├── 01_ml_infrastructure_engineer.md
│   ├── 02_senior_ml_engineer.md
│   └── 03_platform_engineer.md
├── prompts/
│   ├── system_a_goi_generation.txt        # GOI-style generation prompt
│   └── system_b_gst_baseline.txt          # Generic 3-field template prompt
├── coverage_scores.csv                    # Headline table (case × system × score)
├── coverage_scores_detail.txt             # Per-node detection log for every case
├── scoring_protocol.md                    # Broadened-NCS detection rules
└── README.md
```

## Export shape

Each ontology JSON has three top-level views, matching the
dual-view export shipped by the live tool (paper §3.4):

- `ontology` — name, description, domain.
- `graph` — the raw typed graph (`nodes` and `edges`); node `id`s
  are the stable identifiers referenced by `generated_outputs/`.
- `pipeline` — a denormalized view with `classes`, `dimensions`,
  `constraints`, and a `promptReady` markdown block ready for direct
  injection into an LLM system prompt.

The graph view is sufficient to reload the ontology into the tool;
the pipeline view is what runtime agents consume.

## Anonymization note

The Software Services Invoice ontology was induced from a real
production invoice corpus internal to the author's organization.
To protect seller, employee, contractor, and client confidentiality,
every node's `examples` array in `ontologies/invoice_ontology.json`
has been replaced with synthetic placeholder values that preserve
the original format (routing number length, EIN digit pattern, date
convention, etc.) but contain no real personal, organizational, or
banking data. The structural
schema — node ids, types, properties, relationships, and
constraints — is unchanged from the version actually used in the
experiment, so the reported coverage scores remain reproducible.

Both `case1_*` generated outputs are anonymized in the same way.
The `case2_*` outputs and the JD ontology contain no real personal
data and are reproduced verbatim.

The Pain-Management Clinical Visit Record ontology
(`pain_visit_ontology.json`) was induced from a confidential corpus
internal to the author's clinical partner. Every node's `examples`
array has been replaced with synthetic clinically-plausible
equivalents — synthetic provider names with credentials (e.g.
"James Carter, M.D.", "Marcus Reid, D.O."), plausible-but-fictional
practice names ("Northshore Pain & Rehabilitation",
"Tristate Spine Center"), plausible NY addresses, synthetic patient
identifiers and dates of birth, and synthetic visit and signature
dates. ICD-10 codes, anatomical terminology, generic medication
names and dosages, exam test names, grading scales, and biometric
ranges are preserved as clinical content (not PHI). The published
JSON contains no real PHI; the structural schema is unchanged from
the version used in the experiment, so the reported case 3 coverage
scores remain reproducible.

The Professional Services Contract & Statement of Work ontology
(`contract_ontology.json`) was induced from a confidential corpus
of 20 consulting agreements, contractor contracts, and statements
of work internal to the author's organization. Every node's
`examples` array has been replaced with synthetic
legally-plausible equivalents — synthetic Serbian and Western
corporate names (e.g. "Westline Doo Beograd", "Cohort Office d.o.o",
"Northcrest AI, Inc.", "Brightline Labs Inc", "Selvedge AI Inc"),
plausible-but-fictional addresses ("Knez Mihailova 12, 11000
Belgrade, Serbia"; "150 University Ave, Palo Alto, CA 94301, USA"),
synthetic registration / tax-ID numbers of similar format and
length, synthetic contact information under the new corporate
domain, synthetic agreement identifiers preserving the original
project-code-plus-date pattern (e.g. "NORTH4082023", "AM100320251",
"BL1601241", "SV0801231"), and synthetic signatory names with
matching role/title structure (e.g. "Marko Petrović, CEO";
"Daniel Whitcomb, Chief Operating Officer";
"Helena Park, CEO/Cofounder"). Generic legal-clause language
(boilerplate IP, confidentiality, non-solicitation, severability,
entire-agreement, indemnification text), generic service categories
(Machine Learning Engineering, Software Development, UI/UX Design,
Data Science Research), governing-law phrases, currency codes
(USD/EUR/RSD), and standard rate ranges are preserved as
non-identifying legal/business content. The published JSON contains
no real party-identifying data; the structural schema is unchanged
from the version used in the experiment, so the reported case 4
coverage scores remain reproducible.

## Reproducing the experiment

For each of the four ontologies:

1. Open a fresh chat session with the LLM (paper §5.3 specifies the
   model identifier `claude-sonnet-4-6`; both systems share identical
   decoding settings).
2. Run **System A** by pasting the contents of
   `prompts/system_a_goi_generation.txt`, then substituting the
   `{ontology JSON}` placeholder with the contents of the
   corresponding `ontologies/*.json` file.
3. Run **System B** by pasting the contents of
   `prompts/system_b_gst_baseline.txt`, swapping the document type
   label (`"invoice"` for Case 1, `"job posting"` for Case 2,
   `"clinical visit record"` for Case 3, and
   `"professional services contract"` for Case 4).
4. Score the resulting documents against the ontology's nodes
   following the rules in `scoring_protocol.md`. The deterministic
   scorer is at `scripts/case_score_coverage.ts`; running
   `npx tsx scripts/case_score_coverage.ts` from the repo root
   regenerates `coverage_scores.csv` and `coverage_scores_detail.txt`.
5. Compare against the reference outputs in `generated_outputs/`.

## Corpus availability

The four cases differ in what source corpus is published, reflecting
the original sources:

- **Case 2 (JD).** The Job Description Ontology was
  induced from publicly-listed job postings on
  `pivotshiring.com`. Three of those listings, lightly anonymized
  (applicant counts and platform-specific labels removed), are
  reproduced verbatim at `job_descriptions/`.
- **Case 1 (Invoice).** The Software Services Invoice ontology was
  induced from 20 real production invoices internal to the author's
  organization, containing real client, contractor, employee, and
  banking identifiers. That corpus is **withheld in full**:
  cumulative re-identification risk across 20 documents is high
  even under aggressive scrubbing, and the §5.5 generative
  validation claim does not depend on the corpus being released ---
  the published ontology JSON, the two prompts, and the four
  generated outputs in `generated_outputs/` are sufficient to
  reproduce the reported coverage scores.
- **Case 3 (Pain-Management).** The Pain-Management Clinical Visit
  Record Ontology was induced from a confidential corpus of pain
  management and rehabilitation follow-up visit records held by a
  clinical partner of the author's organization. The corpus
  contains protected health information (PHI) and is **withheld in
  full**; the published ontology JSON has every example value,
  provider name, practice name, address, patient identifier, and
  signature date replaced with synthetic clinically-plausible
  equivalents (see Anonymization note above), so the structural
  schema is reproduced faithfully without any real PHI.
- **Case 4 (Professional Services Contract).** The Professional
  Services Contract & Statement of Work Ontology was induced from a
  confidential corpus of 20 consulting agreements, contractor
  contracts, and statements of work internal to the author's
  organization. The corpus contains real party-identifying data
  (client and provider legal names, registered addresses, tax IDs,
  contact details, agreement identifiers, and authorized
  signatories) and is **withheld in full**; the published ontology
  JSON has every such example value replaced with synthetic
  legally-plausible equivalents (see Anonymization note above), so
  the structural schema is reproduced faithfully without any real
  party-identifying data.

Reviewers requiring corpus access for replication of the induction
step itself may contact the author under a confidentiality
agreement.
