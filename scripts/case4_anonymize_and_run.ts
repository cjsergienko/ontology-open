/**
 * Case 4 (Professional Services Contract & Statement of Work) experiment runner.
 *
 *  1. Reads /tmp/contract_raw_input.json (PII-bearing).
 *  2. Anonymizes example values: synthetic company / person / address /
 *     tax-ID / contact / agreement-identifier strings.
 *  3. Builds the dual-view export shape via toFullExportShape().
 *  4. Writes the anonymized JSON to research/supplementary/ontologies/.
 *  5. Calls Anthropic claude-sonnet-4-6 twice (System A and System B)
 *     and saves the outputs to research/supplementary/generated_outputs/.
 *
 * Run: npx tsx scripts/case4_anonymize_and_run.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { toFullExportShape } from '../lib/exportFormat'
import type { Ontology, OntologyNode, OntologyEdge } from '../lib/types'

const RAW_PATH = '/tmp/contract_raw_input.json'
const OUT_ONTOLOGY = path.join(
  process.cwd(),
  'research/supplementary/ontologies/contract_ontology.json',
)
const OUT_GOI = path.join(
  process.cwd(),
  'research/supplementary/generated_outputs/case4_contract_goi.txt',
)
const OUT_GST = path.join(
  process.cwd(),
  'research/supplementary/generated_outputs/case4_contract_gst.txt',
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
// Verbatim PII tokens that must NOT survive into the published file.
const PII_TOKENS = [
  'Pivots Doo',
  'Smart Office Coworking',
  'Plat4m',
  'Archetype AI',
  'Flagship AI',
  'Hasan Doğan',
  'Sergei Sergienko',
  'Brandon Barbello',
  'Jenny Wang',
  'Georgia Bucea',
  'Lorenzo Steccanella',
  'Kneza Mihaila',
  '303 1st street',
  '21808067',
  '113130609',
  '83-3836380',
  '21495891',
  'pivotsdoo',
  'SSERGIENKO',
  '+381 677 380 528',
  'PLAT4M3071723',
  'LS100320251',
  'NT1601241',
  'DL0801231',
  'Android Delivery Application',
  'local stores',
  'local shops',
]

// Targeted replacements applied to every string in the graph (node.examples,
// node.description, node.semantics, edge.label). The replacements preserve
// legal/business realism: synthetic Serbian and Western corporate names,
// plausible-but-fictional addresses, synthetic tax/registration numbers
// of similar format/length, synthetic contacts under the new domain, and
// synthetic agreement IDs preserving the "PROJ-CODE + DATE" pattern.
//
// IMPORTANT ordering: agreement IDs and addresses (which embed substrings of
// company names like "PLAT4M" or "Beograd") must be replaced BEFORE the bare
// company-name regexes consume those substrings.
const REPLACEMENTS: Array<[RegExp, string]> = [
  // ---- Agreement IDs first (preserve PROJ-CODE + DATE pattern) ----
  [/PLAT4M3071723/gi, 'NORTH4082023'],
  [/LS100320251/g, 'AM100320251'],
  [/NT1601241/g, 'BL1601241'],
  [/DL0801231/g, 'SV0801231'],
  // ---- Addresses (embed Beograd substring; replace before bare names) ----
  [
    /Kneza\s+Mihaila\s+33,?\s*sprat\s*2,?\s*11000\s+Beograd,?\s*Serbia/gi,
    'Knez Mihailova 12, 11000 Belgrade, Serbia',
  ],
  [/Kneza\s+Mihaila/gi, 'Knez Mihailova'],
  [
    /303\s+1st\s+street,?\s*Los\s+Altos,?\s*CA\s*94022,?\s*USA/gi,
    '150 University Ave, Palo Alto, CA 94301, USA',
  ],
  [/303\s+1st\s+street/gi, '150 University Ave'],
  // ---- Service-provider company names ----
  [/Pivots\s+Doo\s+Beograd/gi, 'Westline Doo Beograd'],
  [/Pivots\s+Doo/gi, 'Westline Doo'],
  [/Smart\s+Office\s+Coworking\s+d\.?o\.?o\.?/gi, 'Cohort Office d.o.o'],
  [/Smart\s+Office\s+Coworking/gi, 'Cohort Office'],
  // ---- Client / consultant company names ----
  [/Plat4m\s+Inc/gi, 'Northcrest AI, Inc.'],
  [/Plat4m/gi, 'Northcrest AI'],
  [/Archetype\s+AI,\s*Inc\.?/gi, 'Brightline Labs Inc'],
  [/Archetype\s+AI\s+Inc/gi, 'Brightline Labs Inc'],
  [/Archetype\s+AI/gi, 'Brightline Labs'],
  [/Flagship\s+AI\s+Inc/gi, 'Selvedge AI Inc'],
  [/Flagship\s+AI/gi, 'Selvedge AI'],
  // ---- Individual contractor name ----
  [/Hasan\s+Doğan/gi, 'Aslan Demirci'],
  [/Hasan\s+Dogan/gi, 'Aslan Demirci'],
  // ---- Person names with role/title ----
  [/Sergei\s+Sergienko,?\s*CEO/gi, 'Marko Petrović, CEO'],
  [/Brandon\s+Barbello,?\s*Chief\s+Operating\s+Officer/gi,
    'Daniel Whitcomb, Chief Operating Officer'],
  [/Jenny\s+Wang,?\s*CEO\s*\/\s*Cofounder/gi, 'Helena Park, CEO/Cofounder'],
  [/Georgia\s+Bucea/gi, 'Mirela Ardelean'],
  [/Lorenzo\s+Steccanella/gi, 'Alessio Marconi'],
  // ---- Bare last/first names (after the credentialed forms above) ----
  [/Sergienko/g, 'Petrović'],
  [/Sergei/g, 'Marko'],
  [/Barbello/g, 'Whitcomb'],
  [/Brandon/g, 'Daniel'],
  [/\bWang\b/g, 'Park'],
  [/Jenny/g, 'Helena'],
  [/Bucea/g, 'Ardelean'],
  [/Georgia/g, 'Mirela'],
  [/Steccanella/g, 'Marconi'],
  [/Lorenzo/g, 'Alessio'],
  // ---- Tax IDs / registration numbers ----
  [/\b21808067\b/g, '20435189'],
  [/\b113130609\b/g, '107284316'],
  [/\b83-3836380\b/g, '87-4129055'],
  [/\b21495891\b/g, '20518734'],
  // ---- Contact info ----
  [/contact@pivotsdoo\.com/gi, 'contact@westlinedoo.com'],
  [/SSERGIENKO@PIVOTSDOO\.COM/g, 'MPETROVIC@WESTLINEDOO.COM'],
  [/sergienko@pivotsdoo\.com/gi, 'mpetrovic@westlinedoo.com'],
  [/pivotsdoo\.com/gi, 'westlinedoo.com'],
  [/\+381\s*677\s*380\s*528/g, '+381 645 217 904'],
  // ---- Project descriptions naming real products ----
  [/Android\s+Delivery\s+Application\s+for\s+local\s+stores/gi,
    'Android logistics application for neighborhood retailers'],
  [/Android\s+Delivery\s+Application\s+development/gi,
    'Android logistics application development'],
  [/Android\s+Delivery\s+Application/gi,
    'Android logistics application'],
  [/Platform\s+connecting\s+local\s+shops\s+with\s+delivery\s+agents/gi,
    'Platform connecting neighborhood retailers with last-mile couriers'],
  [/local\s+shops/gi, 'neighborhood retailers'],
  [/local\s+stores/gi, 'neighborhood retailers'],
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
 * substring that coincides with an original PII token from the raw input,
 * regardless of how the LLM independently selected it.
 */
function scrubGenerated(text: string): string {
  return scrubString(text)
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
    id: 'contract',
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

  // Self-check: zero PII tokens in the saved file.
  const onDisk = readFileSync(OUT_ONTOLOGY, 'utf-8')
  const survivors = PII_TOKENS.filter((t) => onDisk.includes(t))
  if (survivors.length > 0) {
    console.error('PII tokens survived anonymization:', survivors)
    process.exit(2)
  }
  process.stderr.write(`Anonymization PII grep: 0 survivors across ${PII_TOKENS.length} tokens.\n`)

  // ---------- Stage 2: experiments ----------
  if (process.env.SKIP_GEN === '1') {
    process.stderr.write('SKIP_GEN=1; skipping Anthropic calls.\n')
    return
  }

  // System A: full ontology JSON pasted into the GOI generation prompt.
  const sysAtemplate = readFileSync(SYS_A_PROMPT, 'utf-8')
  const sysAPrompt = sysAtemplate.replace('{ontology JSON}', JSON.stringify(fullExport, null, 2))
  const aResult = await callAnthropic(sysAPrompt, 'case4 System A')
  // Sanitize generated text for any incidental substring overlap with the
  // original PII tokens (defense in depth - the LLM is generating its own
  // names, but coincidental overlap is possible).
  const aSanitized = scrubGenerated(aResult.text)
  writeFileSync(OUT_GOI, aSanitized + '\n', 'utf-8')
  process.stderr.write(`Wrote System A output to ${OUT_GOI}\n`)

  // System B: 3-field template prompt with document type
  // "professional services contract".
  const sysBtemplate = readFileSync(SYS_B_PROMPT, 'utf-8')
  // The template has a literal {document_type} placeholder; substitute it.
  const sysBPrompt = sysBtemplate.replace('{document_type}', 'professional services contract')
  const bResult = await callAnthropic(sysBPrompt, 'case4 System B')
  const bSanitized = scrubGenerated(bResult.text)
  writeFileSync(OUT_GST, bSanitized + '\n', 'utf-8')
  process.stderr.write(`Wrote System B output to ${OUT_GST}\n`)

  // Final summary on stderr for the operator.
  const totalIn = aResult.usage.input_tokens + bResult.usage.input_tokens
  const totalOut = aResult.usage.output_tokens + bResult.usage.output_tokens
  process.stderr.write(
    `\n=== Case 4 Anthropic usage ===\n` +
      `System A: in=${aResult.usage.input_tokens}, out=${aResult.usage.output_tokens}\n` +
      `System B: in=${bResult.usage.input_tokens}, out=${bResult.usage.output_tokens}\n` +
      `Total:    in=${totalIn}, out=${totalOut}\n`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
