# Coverage Scoring Protocol

This document describes the broadened **Node Coverage Score (NCS)** used in
the experiments reported in §5 of the paper.

## What gets scored

For each ontology under test we extract the **structural backbone** —
nodes whose type is one of:

- `class`
- `property`
- `dimension`

Nodes of type `value`, `relation`, and `constraint` are excluded. Values are
leaves consumed by their parent dimensions; relations are only realised as
edge annotations; constraints describe rules that hold over other nodes
rather than discrete content slots.

In addition, structural nodes flagged in the JSON with
`metadata.generate === "context"` are excluded — these are
generation-control axes (employer-brand voice, posting platform, JD tone,
etc.) that legitimately steer content without surfacing as visible document
slots. This filter only affects the JD ontology; the Invoice,
Pain-Management, and Professional Services Contract ontologies do not use
the `context` flag.

## Detection rules

For each structural node, we check whether the LLM-generated output
contains a textual signal of the node, using detectors evaluated in this
order:

1. **Full-label substring match.** Case-insensitive: the entire label
   (with `_` rewritten as space) appears as a substring of the output.
2. **Single-token label match.** When the label has a single
   significant token (≥ 3 characters, not a stopword), that token must
   appear in the output.
3. **All-token label match.** When the label has multiple significant
   tokens, every one of them must appear somewhere in the output (no
   adjacency requirement).
4. **Distinctive-token label match.** When the label has multiple tokens
   and rule 3 fails, a single distinctive token (≥ 5 characters, not a
   stopword) is sufficient. This handles compositional axis labels such
   as `certification_profile` matching an output that says
   "certification" without saying "profile".
5. **Example match.** If `node.examples` is non-empty, any example value
   ≥ 4 characters (excluding pure placeholders containing `XXX...`) is
   tried as a substring of the output.
6. **Synonym match.** A per-case manual synonym table maps canonical
   labels to additional surface forms (e.g. `Buyer / Client` →
   `bill to`, `Body Region` → `lumbar`, `cervical`, `knee`,
   `shoulder`). Synonyms are applied case-insensitively as substrings.
   The full table is in `scripts/case_score_coverage.ts`.

A node counts as **covered** if any of the six detectors fires; otherwise
it counts as missed. The metric is the fraction of structural nodes
covered, multiplied by 100.

## Reproducibility

Run from the repo root:

```bash
npx tsx scripts/case_score_coverage.ts
```

This regenerates:

- `research/supplementary/coverage_scores.csv` — the table reported in
  the paper.
- `research/supplementary/coverage_scores_detail.txt` — per-node
  detection log (which detector fired, or empty if missed) for each
  case × system combination.

## Stopword list

`a, an, and, or, the, of, to, in, at, by, for, with, on, per, is, are,
as, be, no, not, this, that, sub, set, name, block, rule`.

## Excluded examples

Example values that match the regex `/x{3,}/i` (placeholder strings such
as `INV-XXX` or `EIN: XX-XXXXXXX`) are not used as detection probes
because they never appear verbatim in real generated documents.

## Notes on case 3

Case 3's Pain-Management Clinical Visit ontology has no nodes of type
`constraint`; the three `constrains` edges in the graph attach
dimensions and properties directly to the nodes they govern (e.g. `Visit
Type --[constrains]--> Physical Examination`). The structural backbone
of case 3 therefore consists entirely of `class`, `property`, and
`dimension` nodes (45 total).

System A's case 3 output reached the 8 192-token output limit before
emitting the final two structural nodes (`Signature Block` and
`Radiologist`); these are the two missing nodes in the case 3 System A
score. This is an honest truncation gap reflecting a long, verbose
generation, not a detection failure.

## Notes on case 4

Case 4's Professional Services Contract & Statement of Work ontology
similarly has no nodes of type `constraint`; the two `constrains` edges
attach properties and provisions directly to the nodes they govern
(e.g. `Termination Provisions --[constrains]--> Contract Term`,
`Fee Structure --[constrains]--> Weekly Hours Cap`). The structural
backbone of case 4 therefore consists entirely of `class`, `property`,
and `dimension` nodes (46 total).

Case 4's System A output instantiated all 46 structural nodes
(100.0%). System B emitted a generic fixed-fee UX design contract that
covered 36/46 nodes (78.3%); the 10 missed nodes are precisely the
SOW-specific structural backbone the LLM's prior does not surface
unprompted (auto-renewal, hourly rate, non-solicitation, exclusivity,
severability, SOW number, assumptions/risks, communication plan,
weekly hours cap, indemnification).
