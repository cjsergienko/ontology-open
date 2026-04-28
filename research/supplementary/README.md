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
│   └── jd_ontology.json                   # Case 2: JD Creation Taxonomy v3.0
│                                            (63 nodes; published verbatim)
├── generated_outputs/
│   ├── case1_invoice_goi.txt              # System A on Invoice ontology
│   ├── case1_invoice_gst.txt              # System B (3-field) for "invoice"
│   ├── case2_jd_goi.txt                   # System A on JD ontology
│   └── case2_jd_gst.txt                   # System B (3-field) for "job posting"
├── job_descriptions/                      # Case 2 corpus (3 anonymized listings)
│   ├── README.md
│   ├── 01_ml_infrastructure_engineer.md
│   ├── 02_senior_ml_engineer.md
│   └── 03_platform_engineer.md
├── prompts/
│   ├── system_a_goi_generation.txt        # GOI-style generation prompt
│   └── system_b_gst_baseline.txt          # Generic 3-field template prompt
└── README.md
```

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

## Reproducing the experiment

For each of the two ontologies:

1. Open a fresh chat session with the LLM (paper §5.5 specifies the
   model and temperature used).
2. Run **System A** by pasting the contents of
   `prompts/system_a_goi_generation.txt`, then substituting the
   `{ontology JSON}` placeholder with the contents of the
   corresponding `ontologies/*.json` file.
3. Run **System B** by pasting the contents of
   `prompts/system_b_gst_baseline.txt`, swapping the document type
   label (`"invoice"` for Case 1, `"job posting"` for Case 2).
4. Score the resulting documents against the ontology's nodes by
   counting which node labels appear in the generated text.
5. Compare against the reference outputs in `generated_outputs/`.

## Corpus availability

The two cases differ in what source corpus is published, reflecting
the original sources:

- **Case 2 (JD).** The JD Creation Taxonomy v3.0 ontology was
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

Reviewers requiring corpus access for replication of the induction
step itself may contact the author under a confidentiality
agreement.
