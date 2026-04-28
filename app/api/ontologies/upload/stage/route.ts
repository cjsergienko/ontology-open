/**
 * POST /api/ontologies/upload/stage
 *
 * Accepts multipart formData with a single 'file' field.
 *
 * Behavior:
 *   - PDFs and images: forwarded to the Anthropic Files API; only the
 *     returned file_id is held in memory. This keeps the eventual
 *     /api/ontologies/upload (finalize) request tiny regardless of how
 *     many or how large the source files are, sidestepping Anthropic's
 *     ~32MB per-request cap on Messages.
 *   - text/JSON/YAML/Markdown: kept inline in memory (raw bytes). These
 *     are already truncated to 80k chars at finalize time, so they never
 *     dominate request size.
 *
 * Auth-gated: only authenticated users may stage files; only the same
 * user may later finalize their own staged files via /api/ontologies/upload.
 *
 * No quota check here — the token gate runs at finalize time, in /upload.
 */
import { NextResponse } from 'next/server'
import { stageFile } from '@/lib/uploadStaging'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const ANTHROPIC_FILES_BETA = 'files-api-2025-04-14'

// Soft per-file size cap for the staging endpoint. The whole point of staging
// is to keep individual requests under the platform/proxy limits, so reject
// anything obviously too large rather than buffer it.
const MAX_STAGED_FILE_BYTES = 50 * 1024 * 1024 // 50 MB

function isInlineTextMime(mime: string): boolean {
  return (
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/yaml' ||
    mime === 'application/x-yaml' ||
    mime === 'application/xml'
  )
}

function shouldUploadToAnthropic(mime: string): boolean {
  // Anything that isn't safely-inline text gets uploaded to Files API.
  // Covers PDFs, images, and any unknown/octet-stream binary.
  return !isInlineTextMime(mime)
}

export async function POST(req: Request) {
  const { getSessionUser } = await import('@/lib/authHelper')
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_STAGED_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large (${file.size} bytes); max is ${MAX_STAGED_FILE_BYTES}` },
      { status: 413 }
    )
  }

  const mime = file.type || 'application/octet-stream'
  const bytes = Buffer.from(await file.arrayBuffer())

  if (shouldUploadToAnthropic(mime)) {
    // Stream the binary up to Anthropic Files API and only retain the file_id.
    // The original buffer is released as soon as fetch() resolves.
    const uploadForm = new FormData()
    const blob = new Blob([new Uint8Array(bytes)], { type: mime })
    uploadForm.append('file', blob, file.name)

    let uploadResp: Response
    try {
      uploadResp = await fetch('https://api.anthropic.com/v1/files', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': ANTHROPIC_FILES_BETA,
        },
        body: uploadForm,
      })
    } catch (err) {
      return NextResponse.json(
        { error: `Anthropic Files API unreachable: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 },
      )
    }

    if (!uploadResp.ok) {
      const errText = await uploadResp.text().catch(() => '')
      return NextResponse.json(
        { error: `Anthropic Files API rejected ${file.name}: ${errText || uploadResp.statusText}` },
        { status: 502 },
      )
    }

    const { id: anthropicFileId } = (await uploadResp.json()) as { id: string }
    const stagingId = stageFile({
      ownerEmail: sessionUser.email,
      name: file.name,
      mime,
      anthropicFileId,
    })
    return NextResponse.json({ stagingId, name: file.name, size: bytes.byteLength })
  }

  // Inline text/JSON/YAML/Markdown path — keep bytes in memory.
  const stagingId = stageFile({
    ownerEmail: sessionUser.email,
    name: file.name,
    mime,
    bytes,
  })

  return NextResponse.json({ stagingId, name: file.name, size: bytes.byteLength })
}
