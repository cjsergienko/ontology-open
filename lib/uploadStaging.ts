/**
 * In-memory staging store for sequential per-file uploads.
 *
 * Why: the multi-file upload endpoint can hit per-request body-size limits
 * (Cloudflare 100MB, Next 50MB, etc.) when N large PDFs are sent in one POST.
 * Instead, we let the client stage each file independently via /upload/stage,
 * then call /upload with a JSON list of stagingIds to run a single LLM call
 * over all of them.
 *
 * Storage: module-level Map. PM2 single-process — no IPC/Redis needed.
 * TTL: 1 hour. Cleaned lazily on each stage write.
 */
import { randomUUID } from 'crypto'

export interface StagedFile {
  ownerEmail: string
  name: string
  mime: string
  bytes: Buffer
  createdAt: number
}

const STAGE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Module-scope store. Survives across requests within the same Node process.
const stagingStore = new Map<string, StagedFile>()

function sweepExpired(now: number = Date.now()) {
  for (const [id, entry] of stagingStore) {
    if (now - entry.createdAt > STAGE_TTL_MS) stagingStore.delete(id)
  }
}

export function stageFile(entry: Omit<StagedFile, 'createdAt'>): string {
  sweepExpired()
  const id = randomUUID()
  stagingStore.set(id, { ...entry, createdAt: Date.now() })
  return id
}

export function getStagedFile(id: string): StagedFile | undefined {
  return stagingStore.get(id)
}

export function consumeStagedFile(id: string): StagedFile | undefined {
  const entry = stagingStore.get(id)
  if (entry) stagingStore.delete(id)
  return entry
}

export function deleteStagedFile(id: string): void {
  stagingStore.delete(id)
}
