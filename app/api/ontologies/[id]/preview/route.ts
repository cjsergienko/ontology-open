import { NextResponse } from 'next/server'
import { getOntology } from '@/lib/storage'

const JD_API_URL = process.env.JD_API_URL || 'http://localhost:8000'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { prompt, company_context = {} } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 })

  let resp: Response
  try {
    resp = await fetch(`${JD_API_URL}/api/v1/generate-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, company_context }),
    })
  } catch (err) {
    return NextResponse.json({ error: `JD API unreachable: ${err}` }, { status: 502 })
  }

  if (!resp.ok) {
    const text = await resp.text()
    return NextResponse.json({ error: text }, { status: resp.status })
  }

  const data = await resp.json()
  return NextResponse.json(data)
}
