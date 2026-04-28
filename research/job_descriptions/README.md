# Job Description Corpus — pivotshiring.com

Source: publicly-listed job postings on pivotshiring.com, fetched 2026-04-28.

Used as the corpus for the second case study in §5.5 of the GOI paper
("Ontology-as-Prompt: Generative Validation"). All postings are real
production listings from the pivotshiring platform with the following
anonymization applied:

- Job-listing URL slugs and internal IDs removed
- Applicant counts removed (aggregate numbers were potentially identifying)
- Hiring-platform-specific labels (e.g. "AI Screened", "Remote B2B",
  "EU Talent Pool", "pre-screened candidates available") removed
- No employer name, recruiter name, contact email, or candidate name
  was present in the original public listings

Each posting is preserved verbatim except for the strips above, so a
reviewer can re-run the GOI generative experiment against the same corpus.

## Files
- `01_ml_infrastructure_engineer.md`
- `02_senior_ml_engineer.md`
- `03_platform_engineer.md`
