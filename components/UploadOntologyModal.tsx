'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadIcon, XIcon, FileIcon, FileTextIcon, ImageIcon, AlertCircleIcon } from 'lucide-react'

interface Props {
  onClose: () => void
}

function FileTypeIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <ImageIcon size={18} style={{ color: '#8b5cf6' }} />
  if (mime === 'application/pdf') return <FileTextIcon size={18} style={{ color: '#ef4444' }} />
  return <FileIcon size={18} style={{ color: 'var(--accent)' }} />
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function ElapsedTimer() {
  const [ms, setMs] = useState(0)
  const start = useRef(Date.now())
  useEffect(() => {
    start.current = Date.now()
    const id = setInterval(() => setMs(Date.now() - start.current), 200)
    return () => clearInterval(id)
  }, [])
  const s = (ms / 1000).toFixed(1)
  return <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{s}s</span>
}

export function UploadOntologyModal({ onClose }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => { setFile(f); setError(null) }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const upload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const resp = await fetch('/api/ontologies/upload', { method: 'POST', body: fd })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error ?? 'Upload failed')
      }
      const ontology = await resp.json()
      router.push(`/ontology/${ontology.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(8,12,20,0.85)' }}
      onClick={e => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="rounded-xl w-full max-w-lg animate-fade-in"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
              Generate from File
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Upload any document — Claude will extract a full ontology graph
            </p>
          </div>
          {!loading && (
            <button onClick={onClose} style={{ color: 'var(--text-dim)' }}>
              <XIcon size={16} />
            </button>
          )}
        </div>

        <div className="px-7 pb-7 flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !loading && inputRef.current?.click()}
            className="rounded-lg flex flex-col items-center justify-center gap-3 transition-all cursor-pointer"
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--border2)' : 'var(--border)'}`,
              background: dragging ? 'var(--accent-dim)' : 'var(--surface)',
              minHeight: 160,
              padding: '28px 20px',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <FileTypeIcon mime={file.type} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{file.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {fmtBytes(file.size)} · {file.type || 'unknown type'}
                  </p>
                </div>
                {!loading && (
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    change file
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
                >
                  <UploadIcon size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Drop a file or click to browse
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    PDF, images, text, JSON, CSV, Word, Excel — any format
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Examples hint */}
          {!file && (
            <div className="flex flex-wrap gap-1.5">
              {['Medical staff guide', 'HR policy PDF', 'Product taxonomy', 'Legal contract', 'Financial report', 'Research paper'].map(ex => (
                <span
                  key={ex}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}
                >
                  {ex}
                </span>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              <AlertCircleIcon size={12} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded text-sm transition-opacity"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                opacity: loading ? 0.4 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={upload}
              disabled={!file || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all"
              style={{
                background: !file || loading ? 'var(--surface2)' : 'var(--accent)',
                color: !file || loading ? 'var(--text-muted)' : '#000',
                border: '1px solid transparent',
                opacity: !file ? 0.4 : 1,
              }}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                  />
                  Generating… <ElapsedTimer />
                </>
              ) : (
                <>
                  <UploadIcon size={13} />
                  Generate Ontology
                </>
              )}
            </button>
          </div>

          {loading && (
            <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
              Claude is reading your file and extracting the ontology graph…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
