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
│   │                                        (47 nodes; example values
│   │                                        anonymized — see note below)
│   └── jd_creation_taxonomy_v3.json       # Case 2: JD Creation Taxonomy v3.0
│                                            (63 nodes; published verbatim)
├── generated_outputs/
│   ├── case1_invoice_goi.txt              # System A on Invoice ontology
│   ├── case1_invoice_gst.txt              # System B (3-field) for "invoice"
│   ├── case2_jd_goi.txt                   # System A on JD ontology
│   └── case2_jd_gst.txt                   # System B (3-field) for "job posting"
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
the original format (IBAN length, PIB digit count, date convention,
etc.) but contain no real personal, organizational, or banking data. The structural
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

The job-postings corpus from which the JD Creation Taxonomy v3.0
ontology was induced is available in the parent directory at
`research/job_descriptions/` (3 anonymized listings).
