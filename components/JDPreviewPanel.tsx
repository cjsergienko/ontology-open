'use client'

import { useEffect, useRef, useState } from 'react'
import { XIcon, PlayIcon, AlertCircleIcon, ClockIcon } from 'lucide-react'

interface UsageStat {
  stage: string
  model: string
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_write_tokens: number
  duration_ms: number
  cost_usd: number
}

interface PreviewResult {
  jd_text: string
  jd_output: Record<string, unknown>
  dimension_assignments: Record<string, unknown>
  usage_stats: UsageStat[]
  pipeline_duration_ms: number
}

interface Props {
  ontologyId: string
  ontologyName: string
  onClose: () => void
}

const STAGE_LABELS: Record<string, string> = {
  strategy: 'Strategy (CPO)',
  router: 'Router',
  role_identity: 'Role Identity',
  culture_fit: 'Culture Fit',
  technical_reqs: 'Technical Reqs',
  value_prop: 'Value Prop',
  messaging: 'Messaging',
  compliance: 'Compliance',
  combiner: 'Combiner',
}

function isHaiku(model: string) {
  return model.includes('haiku')
}

function fmt(n: number): string {
  return n.toLocaleString()
}

function fmtMs(ms: number): string {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

function fmtCost(usd: number): string {
  if (usd < 0.001) return `$${(usd * 1000).toFixed(3)}m` // milli-dollars
  return `$${usd.toFixed(4)}`
}

function ElapsedTimer({ running }: { running: boolean }) {
  const [ms, setMs] = useState(0)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!running) { setMs(0); return }
    startRef.current = Date.now()
    const id = setInterval(() => setMs(Date.now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [running])

  if (!running) return null
  return (
    <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--accent)' }}>
      <ClockIcon size={10} />
      {fmtMs(ms)}
    </span>
  )
}

export function JDPreviewPanel({ ontologyId, ontologyName, onClose }: Props) {
  const [prompt, setPrompt] = useState(
    'Generate a senior software engineer job description for a fast-growing B2B SaaS startup building developer tools. The role is fully remote.'
  )
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PreviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'jd' | 'dimensions' | 'usage'>('jd')

  const generate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const resp = await fetch(`/api/ontologies/${ontologyId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          company_context: companyName ? { name: companyName } : {},
        }),
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'Generation failed')
      }
      const data = await resp.json()
      setResult(data)
      setActiveTab('jd')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // Usage totals
  const usage = result?.usage_stats ?? []
  const totalInput = usage.reduce((s, u) => s + u.input_tokens, 0)
  const totalOutput = usage.reduce((s, u) => s + u.output_tokens, 0)
  const totalCacheRead = usage.reduce((s, u) => s + u.cache_read_tokens, 0)
  const totalCacheWrite = usage.reduce((s, u) => s + u.cache_write_tokens, 0)
  const totalCost = usage.reduce((s, u) => s + u.cost_usd, 0)
  const totalTokens = totalInput + totalOutput
  const jdWords = result?.jd_text ? result.jd_text.split(/\s+/).filter(Boolean).length : 0
  const compressionRatio = totalInput > 0 ? (totalOutput / totalInput).toFixed(2) : null
  const cacheHitPct = (totalInput + totalCacheRead) > 0
    ? Math.round((totalCacheRead / (totalInput + totalCacheRead)) * 100)
    : 0

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="ml-auto h-full flex flex-col overflow-hidden"
        style={{
          width: 960,
          maxWidth: '95vw',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <PlayIcon size={14} style={{ color: 'var(--accent)' }} />
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
                JD Preview
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{ontologyName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <XIcon size={14} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: input + scores */}
          <div
            className="flex flex-col overflow-y-auto shrink-0"
            style={{ width: 296, borderRight: '1px solid var(--border)', padding: '16px' }}
          >
            <label className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>ROLE PROMPT</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              className="w-full text-xs rounded px-3 py-2 resize-none mb-3 outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'inherit',
              }}
            />

            <label className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>COMPANY NAME (optional)</label>
            <input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full text-xs rounded px-3 py-2 mb-4 outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="e.g. Acme Corp"
            />

            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="flex items-center justify-center gap-2 w-full py-2 rounded text-xs font-medium transition-all mb-5"
              style={{
                background: loading ? 'var(--surface2)' : 'var(--accent)',
                color: loading ? 'var(--text-muted)' : '#000',
                opacity: !prompt.trim() ? 0.4 : 1,
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                  />
                  <ElapsedTimer running={loading} />
                </>
              ) : (
                <><PlayIcon size={11} /> Generate JD</>
              )}
            </button>

            {error && (
              <div
                className="flex items-start gap-2 p-3 rounded text-xs mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              >
                <AlertCircleIcon size={12} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Quick stats */}
            {result && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>JD words</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{fmt(jdWords)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Total time</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{fmtMs(result.pipeline_duration_ms)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Total cost</span>
                  <span className="font-mono" style={{ color: 'var(--accent)' }}>{fmtCost(totalCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Total tokens</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{fmt(totalTokens)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: tabs + content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {result && (
              <div className="flex items-center gap-1 px-5 pt-3 pb-0 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                {(['jd', 'usage', 'dimensions'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                      marginBottom: -1,
                    }}
                  >
                    {tab === 'jd' ? 'Job Description' : tab === 'usage' ? '⚡ Usage & Timing' : 'Dimension Map'}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                  <PlayIcon size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Enter a role prompt and click Generate</p>
                  <p className="text-xs mt-1 opacity-60">Pipeline: Strategy → Router → 5 clusters (parallel) → Combiner → Scorer</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                  <div
                    className="w-8 h-8 rounded-full border-2 animate-spin mb-4"
                    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                  />
                  <p className="text-sm mb-1">Running pipeline…</p>
                  <p className="text-xs opacity-60">Strategy → Routing → 5 cluster agents in parallel → Combiner → Scorer</p>
                </div>
              )}

              {result && activeTab === 'jd' && (
                <pre className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>
                  {result.jd_text}
                </pre>
              )}

              {result && activeTab === 'usage' && (
                <div>
                  {/* Summary cards */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Total time', value: fmtMs(result.pipeline_duration_ms), sub: 'wall clock' },
                      { label: 'Total cost', value: fmtCost(totalCost), sub: 'API spend', accent: true },
                      { label: 'Total tokens', value: fmt(totalTokens), sub: `${fmt(totalInput)} in + ${fmt(totalOutput)} out` },
                      { label: 'Cache hit', value: `${cacheHitPct}%`, sub: `${fmt(totalCacheRead)} saved tokens` },
                    ].map(c => (
                      <div key={c.label} className="p-3 rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                        <div className="text-lg font-mono font-bold mb-0.5" style={{ color: c.accent ? 'var(--accent)' : 'var(--text)' }}>{c.value}</div>
                        <div className="text-xs" style={{ color: 'var(--text-dim)', fontSize: 10 }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Extra metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'JD word count', value: fmt(jdWords), sub: 'output document' },
                      { label: 'Output/Input ratio', value: compressionRatio ?? '—', sub: 'tokens generated per input token' },
                      { label: 'Cache writes', value: fmt(totalCacheWrite), sub: 'tokens cached for reuse' },
                    ].map(c => (
                      <div key={c.label} className="p-3 rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                        <div className="text-base font-mono font-bold mb-0.5" style={{ color: 'var(--text)' }}>{c.value}</div>
                        <div className="text-xs" style={{ color: 'var(--text-dim)', fontSize: 10 }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Per-stage table */}
                  <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-dim)' }}>PER-STAGE BREAKDOWN</div>
                  <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                          {['Stage', 'Model', 'Time', 'Input tok', 'Output tok', 'Cache read', 'Cost'].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {usage.map((u, i) => (
                          <tr
                            key={i}
                            style={{ borderBottom: i < usage.length - 1 ? '1px solid var(--border)' : 'none' }}
                          >
                            <td className="px-3 py-2 font-medium" style={{ color: 'var(--text)' }}>
                              {STAGE_LABELS[u.stage] ?? u.stage}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  background: isHaiku(u.model) ? 'rgba(139,92,246,0.15)' : 'rgba(234,179,8,0.15)',
                                  color: isHaiku(u.model) ? '#a78bfa' : '#fbbf24',
                                }}
                              >
                                {isHaiku(u.model) ? 'haiku' : 'sonnet'}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono" style={{ color: 'var(--text)' }}>{fmtMs(u.duration_ms)}</td>
                            <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{fmt(u.input_tokens)}</td>
                            <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{fmt(u.output_tokens)}</td>
                            <td className="px-3 py-2 font-mono" style={{ color: u.cache_read_tokens > 0 ? '#10b981' : 'var(--text-dim)' }}>
                              {fmt(u.cache_read_tokens)}
                            </td>
                            <td className="px-3 py-2 font-mono" style={{ color: 'var(--accent)' }}>{fmtCost(u.cost_usd)}</td>
                          </tr>
                        ))}
                        {/* Totals row */}
                        <tr style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                          <td className="px-3 py-2 font-semibold" style={{ color: 'var(--text)' }} colSpan={2}>Total</td>
                          <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text)' }}>{fmtMs(result.pipeline_duration_ms)}</td>
                          <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text)' }}>{fmt(totalInput)}</td>
                          <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text)' }}>{fmt(totalOutput)}</td>
                          <td className="px-3 py-2 font-mono font-semibold" style={{ color: '#10b981' }}>{fmt(totalCacheRead)}</td>
                          <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--accent)' }}>{fmtCost(totalCost)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pricing note */}
                  <p className="text-xs mt-3" style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                    Pricing: Sonnet $3/$15 per MTok in/out · Haiku $0.80/$4 per MTok in/out · Cache reads at 10% of input rate
                  </p>
                </div>
              )}

              {result && activeTab === 'dimensions' && (
                <div className="space-y-4">
                  {Object.entries(result.dimension_assignments).map(([cluster, dims]) => (
                    <div key={cluster}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                        {cluster.replace(/_/g, ' ')}
                      </h3>
                      <div className="space-y-1">
                        {Object.entries(dims as Record<string, unknown>).map(([dim, val]) => (
                          <div key={dim} className="flex items-start gap-3 text-xs">
                            <span className="shrink-0 w-40 font-mono" style={{ color: 'var(--text-muted)' }}>{dim}</span>
                            <span style={{ color: 'var(--text)' }}>
                              {Array.isArray(val) ? val.join(', ') : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
