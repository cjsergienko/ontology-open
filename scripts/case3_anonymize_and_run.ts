/**
 * Case 3 (Pain-Management Clinical Visit) experiment runner.
 *
 *  1. Reads /tmp/pain_visit_raw_input.json (PHI-bearing).
 *  2. Anonymizes example values: synthetic provider/practice/patient/date strings.
 *  3. Builds the dual-view export shape via toFullExportShape().
 *  4. Writes the anonymized JSON to research/supplementary/ontologies/.
 *  5. Calls Anthropic claude-sonnet-4-6 twice (System A and System B)
 *     and saves the outputs to research/supplementary/generated_outputs/.
 *
 * Run: npx tsx scripts/case3_anonymize_and_run.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { toFullExportShape } from '../lib/exportFormat'
import type { Ontology, OntologyNode, OntologyEdge } from '../lib/types'

const RAW_PATH = '/tmp/pain_visit_raw_input.json'
const OUT_ONTOLOGY = path.join(
  process.cwd(),
  'research/supplementary/ontologies/pain_visit_ontology.json',
)
const OUT_GOI = path.join(
  process.cwd(),
  'research/supplementary/generated_outputs/case3_pain_visit_goi.txt',
)
const OUT_GST = path.join(
  process.cwd(),
  'research/supplementary/generated_outputs/case3_pain_visit_gst.txt',
)
const SYS_A_PROMPT = path.join(
  process.cwd(),
  'research/supplementary/prompts/system_a_goi_generation.txt',
)
const SYS_B_PROMPT = path.join(
  process.cwd(),
  'research/supplementary/prompts/system_b_gst_baseline.txt',
)

const MODEL = 'claude-sonnet-4-6'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set')
  process.exit(1)
}

// ---------- Stage 1: anonymization ----------
//
// Verbatim PHI tokens that must NOT survive into the published file.
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
  '01/01/1990',
  '03/15/1975',
  '6/18/2024',
  '1/23/2024',
  '1/4/2024',
  '6/21/2020',
]

// Targeted replacements applied to every string in the graph (node.examples,
// node.description, node.semantics, edge.label). The replacements preserve
// clinical realism: synthetic provider names with credentials, plausible
// practice names, plausible NY addresses, anonymized patient identifiers,
// and synthetic visit / signature dates.
const REPLACEMENTS: Array<[RegExp, string]> = [
  // Provider full names with credentials
  [/Jeffrey\s+Chacko,?\s*M\.?D\.?/gi, 'James Carter, M.D.'],
  [/Sonny\s+Ahluwalia,?\s*D\.?O\.?/gi, 'Marcus Reid, D.O.'],
  [/Yakup\s+Akyol\s*MD/gi, 'Eliana Tan, M.D.'],
  [/Yakup\s+Akyol/gi, 'Eliana Tan'],
  // Bare last names (after the credentialed forms above are consumed)
  [/Chacko/g, 'Carter'],
  [/Ahluwalia/g, 'Reid'],
  [/Akyol/g, 'Tan'],
  [/Jeffrey/g, 'James'],
  [/Sonny/g, 'Marcus'],
  [/Yakup/g, 'Eliana'],
  // Practice names
  [/Precision\s+Pain\s+Care\s+&\s+Rehabilitation/gi, 'Northshore Pain & Rehabilitation'],
  [/Advanced\s+Spine\s+&\s+Pain/gi, 'Tristate Spine Center'],
  // Addresses
  [
    /1300\s+Union\s+Turnpike,?\s*Suite\s*203\s+New\s+Hyde\s+Park,?\s*NY\s*11040/gi,
    '200 Madison Avenue, Suite 401, Hempstead, NY 11550',
  ],
  [
    /116-16\s+Jamaica\s+Ave\s+Richmond\s+Hill,?\s*NY\s*11418/gi,
    '450 Garden Boulevard, Riverside, NY 11420',
  ],
  // Patient names + DOBs
  [/Jane\s+Doe,?\s*DOB\s*01\/01\/1990/gi, 'Maria Rivera, DOB 04/22/1988'],
  [/John\s+Smith,?\s*DOB\s*03\/15\/1975/gi, 'Daniel Ortiz, DOB 11/05/1972'],
  [/Jane\s+Doe/g, 'Maria Rivera'],
  [/John\s+Smith/g, 'Daniel Ortiz'],
  // Specific dates appearing as exam/visit/signature dates
  [/6\/18\/2024/g, '5/14/2024'],
  [/1\/23\/2024/g, '2/9/2024'],
  [/1\/4\/2024/g, '2/12/2024'],
  [/6\/21\/2020/g, '7/8/2021'],
]

function scrubString(s: string): string {
  let out = s
  for (const [pat, repl] of REPLACEMENTS) {
    out = out.replace(pat, repl)
  }
  return out
}

function scrubNode(n: OntologyNode): OntologyNode {
  const out: OntologyNode = {
    ...n,
    label: scrubString(n.label),
    description: scrubString(n.description ?? ''),
    // toFullExportShape strips position via toCleanNode, but the input shape
    // requires it. Provide a stub if the raw input omits it.
    position: n.position ?? { x: 0, y: 0 },
  }
  if (n.semantics !== undefined) out.semantics = scrubString(n.semantics)
  if (n.examples !== undefined) out.examples = n.examples.map(scrubString)
  if (n.constraints !== undefined) out.constraints = n.constraints.map(scrubString)
  return out
}

function scrubEdge(e: OntologyEdge): OntologyEdge {
  return { ...e, label: scrubString(e.label ?? '') }
}

/**
 * Defense-in-depth post-processor for LLM-generated outputs. Replaces any
 * substring that coincides with an original PHI date or name from the raw
 * input, regardless of how the LLM independently selected it.
 */
function scrubGenerated(text: string): string {
  let out = scrubString(text)
  // Date substrings that could collide with original PHI dates even when the
  // LLM produced them independently (e.g. "06/18/2024" overlapping
  // "6/18/2024").
  const dateOverlaps: Array<[RegExp, string]> = [
    [/\b0?6\/18\/2024\b/g, '07/22/2024'],
    [/\b0?1\/23\/2024\b/g, '02/09/2024'],
    [/\b0?1\/4\/2024\b/g, '02/12/2024'],
    [/\b0?6\/21\/2020\b/g, '07/08/2021'],
    [/\b0?1\/01\/1990\b/g, '04/22/1988'],
    [/\b0?3\/15\/1975\b/g, '11/05/1972'],
  ]
  for (const [pat, repl] of dateOverlaps) {
    out = out.replace(pat, repl)
  }
  return out
}

// ---------- Anthropic helper ----------

interface AnthropicUsage {
  input_tokens: number
  output_tokens: number
}

async function callAnthropic(prompt: string, label: string): Promise<{ text: string; usage: AnthropicUsage }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic API error (${label}) ${res.status}: ${errText}`)
  }
  const data = await res.json()
  const text = (data.content ?? [])
    .map((b: { type: string; text?: string }) => (b.type === 'text' ? b.text ?? '' : ''))
    .join('')
  const usage: AnthropicUsage = {
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  }
  process.stderr.write(
    `[${label}] usage: input=${usage.input_tokens} output=${usage.output_tokens}\n`,
  )
  return { text, usage }
}

// ---------- Main ----------

async function main() {
  const raw = JSON.parse(readFileSync(RAW_PATH, 'utf-8'))

  // Flatten dual-view input into the Ontology shape lib expects.
  const flatInput: Ontology = {
    id: 'pain_visit',
    name: raw.ontology.name,
    description: raw.ontology.description,
    domain: raw.ontology.domain,
    nodes: raw.graph.nodes as OntologyNode[],
    edges: (raw.graph.edges as Array<Omit<OntologyEdge, 'id' | 'label'> & { label?: string }>).map(
      (e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        type: e.type,
        label: (e as { label?: string }).label ?? '',
      }),
    ),
    createdAt: '',
    updatedAt: '',
  }

  // Anonymize.
  const anonymized: Ontology = {
    ...flatInput,
    nodes: flatInput.nodes.map(scrubNode),
    edges: flatInput.edges.map(scrubEdge),
  }

  // Run through the official export builder so the on-disk file matches the
  // dual-view shape the live tool produces.
  const fullExport = toFullExportShape(anonymized)
  writeFileSync(OUT_ONTOLOGY, JSON.stringify(fullExport, null, 2) + '\n', 'utf-8')
  process.stderr.write(`Wrote anonymized ontology to ${OUT_ONTOLOGY}\n`)

  // Self-check: zero PHI tokens in the saved file.
  const onDisk = readFileSync(OUT_ONTOLOGY, 'utf-8')
  const survivors = PHI_TOKENS.filter((t) => onDisk.includes(t))
  if (survivors.length > 0) {
    console.error('PHI tokens survived anonymization:', survivors)
    process.exit(2)
  }
  process.stderr.write(`Anonymization PHI grep: 0 survivors across ${PHI_TOKENS.length} tokens.\n`)

  // ---------- Stage 2: experiments ----------
  if (process.env.SKIP_GEN === '1') {
    process.stderr.write('SKIP_GEN=1; skipping Anthropic calls.\n')
    return
  }

  // System A: full ontology JSON pasted into the GOI generation prompt.
  const sysAtemplate = readFileSync(SYS_A_PROMPT, 'utf-8')
  const sysAPrompt = sysAtemplate.replace('{ontology JSON}', JSON.stringify(fullExport, null, 2))
  const aResult = await callAnthropic(sysAPrompt, 'case3 System A')
  // Sanitize generated text for any incidental substring overlap with the
  // original PHI tokens (defense in depth — the LLM is generating its own
  // names and dates, but coincidental overlap is possible).
  const aSanitized = scrubGenerated(aResult.text)
  writeFileSync(OUT_GOI, aSanitized + '\n', 'utf-8')
  process.stderr.write(`Wrote System A output to ${OUT_GOI}\n`)

  // System B: 3-field template prompt with document type "clinical visit record".
  const sysBtemplate = readFileSync(SYS_B_PROMPT, 'utf-8')
  // The template has a literal {document_type} placeholder; substitute it.
  const sysBPrompt = sysBtemplate.replace('{document_type}', 'clinical visit record')
  const bResult = await callAnthropic(sysBPrompt, 'case3 System B')
  const bSanitized = scrubGenerated(bResult.text)
  writeFileSync(OUT_GST, bSanitized + '\n', 'utf-8')
  process.stderr.write(`Wrote System B output to ${OUT_GST}\n`)

  // Final summary on stderr for the operator.
  const totalIn = aResult.usage.input_tokens + bResult.usage.input_tokens
  const totalOut = aResult.usage.output_tokens + bResult.usage.output_tokens
  process.stderr.write(
    `\n=== Case 3 Anthropic usage ===\n` +
      `System A: in=${aResult.usage.input_tokens}, out=${aResult.usage.output_tokens}\n` +
      `System B: in=${bResult.usage.input_tokens}, out=${bResult.usage.output_tokens}\n` +
      `Total:    in=${totalIn}, out=${totalOut}\n`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
