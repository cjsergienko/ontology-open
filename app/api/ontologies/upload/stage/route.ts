/**
 * POST /api/ontologies/upload/stage
 *
 * Accepts multipart formData with a single 'file' field. Stores the bytes
 * in the in-memory staging store and returns a stagingId. Auth-gated:
 * only authenticated users may stage files; only the same user may
 * later finalize their own staged files via /api/ontologies/upload.
 *
 * No quota check here — the token gate runs at finalize time, in /upload.
 */
import { NextResponse } from 'next/server'
import { stageFile } from '@/lib/uploadStaging'

// Soft per-file size cap for the staging endpoint. The whole point of staging
// is to keep individual requests under the platform/proxy limits, so reject
// anything obviously too large rather than buffer it.
const MAX_STAGED_FILE_BYTES = 50 * 1024 * 1024 // 50 MB

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

  const bytes = Buffer.from(await file.arrayBuffer())
  const stagingId = stageFile({
    ownerEmail: sessionUser.email,
    name: file.name,
    mime: file.type || 'application/octet-stream',
    bytes,
  })

  return NextResponse.json({ stagingId, name: file.name, size: bytes.byteLength })
}
