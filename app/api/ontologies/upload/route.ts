import { NextResponse } from 'next/server'
import { saveOntology } from '@/lib/storage'
import type { OntologyNode, OntologyEdge, NodeType } from '@/lib/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const CLAUDE_MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are an ontology extraction expert. Analyze the provided document and extract a rich, meaningful ontology graph that captures the key concepts, relationships, and structure of the domain.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "name": "Descriptive Ontology Name",
  "description": "1-2 sentence summary of what this ontology models",
  "domain": "single lowercase word (e.g. healthcare, hiring, finance, education, legal, retail)",
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "type": "class|property|value|dimension|relation|constraint",
      "label": "Human Readable Label",
      "description": "What this concept means in context",
      "semantics": "deeper meaning or usage notes",
      "examples": ["example1", "example2"]
    }
  ],
  "edges": [
    {
      "id": "edge_unique_id",
      "source": "node_id",
      "target": "node_id",
      "label": "short relationship label",
      "type": "is_a|has_property|has_value|relates_to|part_of|constrains|instance_of"
    }
  ]
}

Node type guidelines:
- class: main entities or concepts (people roles, objects, processes)
- property: attributes, characteristics, fields of a class
- value: specific enumerated values or instances of a property
- dimension: axes of classification or variation
- relation: named relationships between entities
- constraint: rules, requirements, or restrictions

Aim for 20-40 nodes and enough edges to make the graph meaningfully connected. Cover the full breadth of the document's domain.`

// Layout: arrange nodes by type in rows, spread horizontally
function layoutNodes(nodes: Omit<OntologyNode, 'position'>[]): OntologyNode[] {
  const ROW_Y: Record<NodeType, number> = {
    class: 100,
    dimension: 350,
    property: 600,
    value: 850,
    relation: 1100,
    constraint: 1350,
  }
  const GAP_X = 280
  const counters: Record<string, number> = {}

  return nodes.map(n => {
    const type = n.type as NodeType
    const idx = counters[type] ?? 0
    counters[type] = idx + 1
    const sameType = nodes.filter(x => x.type === type).length
    const startX = -(sameType - 1) * GAP_X / 2
    return { ...n, position: { x: startX + idx * GAP_X, y: ROW_Y[type] ?? 600 } }
  })
}

function buildClaudeRequest(file: File, bytes: ArrayBuffer) {
  const base64 = Buffer.from(bytes).toString('base64')
  const mime = file.type || 'application/octet-stream'
  const isImage = mime.startsWith('image/')
  const isPdf = mime === 'application/pdf'
  const isText = mime.startsWith('text/') || ['application/json', 'application/yaml', 'application/xml'].some(t => mime.includes(t))

  const userText = `Extract a comprehensive ontology from this document: "${file.name}"`

  let content: object[]
  if (isPdf) {
    content = [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
      { type: 'text', text: userText },
    ]
  } else if (isImage) {
    content = [
      { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
      { type: 'text', text: userText },
    ]
  } else if (isText) {
    const text = Buffer.from(bytes).toString('utf-8').slice(0, 100_000)
    content = [{ type: 'text', text: `${userText}\n\n<document>\n${text}\n</document>` }]
  } else {
    // Try UTF-8, fall back to binary description
    let text: string
    try {
      text = Buffer.from(bytes).toString('utf-8').slice(0, 100_000)
    } catch {
      text = `[Binary file: ${file.name}, ${bytes.byteLength} bytes]`
    }
    content = [{ type: 'text', text: `${userText}\n\n<document>\n${text}\n</document>` }]
  }

  return {
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  }
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const claudeReq = buildClaudeRequest(file, bytes)

  let anthropicResp: Response
  try {
    anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(claudeReq),
    })
  } catch (err) {
    return NextResponse.json({ error: `Anthropic API unreachable: ${err}` }, { status: 502 })
  }

  if (!anthropicResp.ok) {
    const err = await anthropicResp.text()
    return NextResponse.json({ error: err }, { status: anthropicResp.status })
  }

  const claudeData = await anthropicResp.json()
  const rawText: string = claudeData.content?.[0]?.text ?? ''

  // Extract JSON from response (may be wrapped in ```json blocks)
  let parsed: { name: string; description: string; domain: string; nodes: object[]; edges: object[] }
  try {
    const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) ?? rawText.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText
    parsed = JSON.parse(jsonStr)
  } catch {
    return NextResponse.json({ error: 'Failed to parse ontology from Claude response', raw: rawText.slice(0, 500) }, { status: 500 })
  }

  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  const rawNodes = (parsed.nodes ?? []) as Omit<OntologyNode, 'position'>[]
  const nodes = layoutNodes(rawNodes)
  const edges: OntologyEdge[] = (parsed.edges ?? []).map((e: object) => ({
    id: crypto.randomUUID(),
    ...(e as OntologyEdge),
  }))

  const ontology = {
    id,
    name: parsed.name ?? file.name,
    description: parsed.description ?? '',
    domain: parsed.domain ?? 'general',
    createdAt: now,
    updatedAt: now,
    nodes,
    edges,
  }

  saveOntology(ontology)
  return NextResponse.json(ontology)
}
