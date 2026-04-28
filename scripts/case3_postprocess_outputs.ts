/**
 * Defense-in-depth post-processor for the case 3 generated outputs.
 *
 * Even though the LLM was given an already-anonymized ontology, its
 * independent date / name choices can coincidentally collide with the
 * original PHI strings. This script scrubs those collisions out of the
 * already-saved output files, so the committed text contains zero PHI.
 *
 * Run: npx tsx scripts/case3_postprocess_outputs.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

const FILES = [
  path.join(process.cwd(), 'research/supplementary/generated_outputs/case3_pain_visit_goi.txt'),
  path.join(process.cwd(), 'research/supplementary/generated_outputs/case3_pain_visit_gst.txt'),
]

const REPLACEMENTS: Array<[RegExp, string]> = [
  // Same name / practice / address replacements as the ontology anonymizer.
  [/Jeffrey\s+Chacko,?\s*M\.?D\.?/gi, 'James Carter, M.D.'],
  [/Sonny\s+Ahluwalia,?\s*D\.?O\.?/gi, 'Marcus Reid, D.O.'],
  [/Yakup\s+Akyol\s*MD/gi, 'Eliana Tan, M.D.'],
  [/Yakup\s+Akyol/gi, 'Eliana Tan'],
  [/Chacko/g, 'Carter'],
  [/Ahluwalia/g, 'Reid'],
  [/Akyol/g, 'Tan'],
  [/Jeffrey/g, 'James'],
  [/Sonny/g, 'Marcus'],
  [/Yakup/g, 'Eliana'],
  [/Precision\s+Pain\s+Care\s+&\s+Rehabilitation/gi, 'Northshore Pain & Rehabilitation'],
  [/Advanced\s+Spine\s+&\s+Pain/gi, 'Tristate Spine Center'],
  [
    /1300\s+Union\s+Turnpike,?\s*Suite\s*203\s+New\s+Hyde\s+Park,?\s*NY\s*11040/gi,
    '200 Madison Avenue, Suite 401, Hempstead, NY 11550',
  ],
  [
    /116-16\s+Jamaica\s+Ave\s+Richmond\s+Hill,?\s*NY\s*11418/gi,
    '450 Garden Boulevard, Riverside, NY 11420',
  ],
  // Date substrings that could overlap original PHI dates, even when the
  // LLM produced them independently.
  [/\b0?6\/18\/2024\b/g, '07/22/2024'],
  [/\b0?1\/23\/2024\b/g, '02/09/2024'],
  [/\b0?1\/4\/2024\b/g, '02/12/2024'],
  [/\b0?6\/21\/2020\b/g, '07/08/2021'],
  [/\b0?1\/01\/1990\b/g, '04/22/1988'],
  [/\b0?3\/15\/1975\b/g, '11/05/1972'],
]

const PHI_TOKENS = [
  'Chacko',
  'Ahluwalia',
  'Akyol',
  'Yakup',
  'Jeffrey',
  'Sonny',
  'Precision Pain Care & Rehabilitation',
  'Advanced Spine & Pain',
  'Union Turnpike',
  'Jamaica Ave',
  'Jane Doe',
  'John Smith',
  'New Hyde Park',
  'Richmond Hill',
]

function scrub(text: string): string {
  let out = text
  for (const [pat, repl] of REPLACEMENTS) {
    out = out.replace(pat, repl)
  }
  return out
}

for (const f of FILES) {
  const raw = readFileSync(f, 'utf-8')
  const scrubbed = scrub(raw)
  writeFileSync(f, scrubbed, 'utf-8')
  const survivors = PHI_TOKENS.filter((t) => scrubbed.includes(t))
  if (survivors.length > 0) {
    console.error(`PHI tokens survived in ${f}:`, survivors)
    process.exit(2)
  }
  console.log(`scrubbed ${f}: 0 PHI token survivors`)
}
