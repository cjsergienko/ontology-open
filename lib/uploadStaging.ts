/**
 * In-memory staging store for sequential per-file uploads.
 *
 * Why: the multi-file upload endpoint can hit per-request body-size limits
 * (Cloudflare 100MB, Next 50MB, Anthropic ~32MB) when N large PDFs are sent
 * in one POST. Instead, we let the client stage each file independently via
 * /upload/stage; binary docs (PDFs, images) are forwarded to the Anthropic
 * Files API at stage time and only the resulting file_id is held here.
 * Text-ish payloads (JSON/YAML/Markdown/plain text) are kept inline because
 * we already truncate them to 80k chars in the message and they don't blow
 * up the request size.
 *
 * Storage: module-level Map. PM2 single-process — no IPC/Redis needed.
 * TTL: 1 hour. Cleaned lazily on each stage write.
 */
import { randomUUID } from 'crypto'

export interface StagedFile {
  ownerEmail: string
  name: string
  mime: string
  /**
   * For binary docs uploaded to the Anthropic Files API: the returned file_id.
   * For inline text-ish docs: undefined.
   */
  anthropicFileId?: string
  /**
   * For text-ish docs kept inline: the raw bytes. We hold these only for
   * small text payloads, so memory pressure is bounded.
   * For binary docs uploaded to Files API: undefined (bytes are released
   * once Anthropic has accepted them).
   */
  bytes?: Buffer
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
