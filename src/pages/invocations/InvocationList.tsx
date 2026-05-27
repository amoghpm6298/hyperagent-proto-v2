import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store'
import { ChannelBadge } from '../../components/shared/ChannelBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { MessageSquare, Search, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, Activity, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { AgentChannel } from '../../types'

const PAGE_SIZE = 15

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF', emeraldBorder: '#6EE7B7',
  amber: '#C2780A', amber50: '#FBF1DA', amberBorder: '#FCD34D',
  rose: '#D63B5B', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

const selectStyle: React.CSSProperties = {
  padding: '8px 32px 8px 12px', background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 10,
  fontSize: 13, color: V.ink, outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as React.CSSProperties['colorScheme'],
  fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
  boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
}

function QualityDot({ score }: { score: number }) {
  const color = score >= 80 ? V.emerald : score >= 60 ? V.amber : V.rose
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: 13, color }}>{score}</span>
    </div>
  )
}

const maskPhone = (phone?: string): string => {
  if (!phone || phone === '—') return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return phone
  const last4 = digits.slice(-4)
  const prefix = phone.includes('+91') ? '+91 ' : ''
  return `${prefix}••••••${last4}`
}

// columns — pct must sum to 100%
const COLS = [
  { label: 'Conversation', pct: '16%' },
  { label: 'Agent',        pct: '19%' },
  { label: 'User #',       pct: '13%' },
  { label: 'Status',       pct: '12%' },
  { label: 'Channel',      pct: '9%'  },
  { label: 'Duration',     pct: '9%'  },
  { label: 'Quality',      pct: '8%'  },
  { label: 'Created',      pct: '14%' },
]

export function InvocationList() {
  const conversations = useAppStore((s) => s.conversations)
  const [channelFilter, setChannelFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [qualityFilter, setQualityFilter] = useState<string>('ALL')
  const [interactionFilter, setInteractionFilter] = useState<string>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)

  const filtered = conversations.filter((conv) => {
    if (channelFilter !== 'ALL' && conv.channel !== (channelFilter as AgentChannel)) return false
    if (statusFilter !== 'ALL' && conv.status !== statusFilter) return false
    if (interactionFilter !== 'ALL' && conv.interactionType !== interactionFilter) return false
    if (sourceFilter === 'TEST' && !conv.isTestRun) return false
    if (sourceFilter === 'PROD' && conv.isTestRun) return false
    if (qualityFilter === 'HIGH'   && (conv.qualityScore === undefined || conv.qualityScore < 80)) return false
    if (qualityFilter === 'MEDIUM' && (conv.qualityScore === undefined || conv.qualityScore < 60 || conv.qualityScore >= 80)) return false
    if (qualityFilter === 'LOW'    && (conv.qualityScore === undefined || conv.qualityScore >= 60)) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!conv.agent.toLowerCase().includes(term) && !conv.id.toLowerCase().includes(term)) return false
    }
    return true
  })

  useEffect(() => { setPage(1) }, [channelFilter, statusFilter, searchTerm, qualityFilter, interactionFilter, sourceFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const total = conversations.length
  const completed = conversations.filter(c => c.status === 'COMPLETED').length
  const failed = conversations.filter(c => c.status === 'FAILED').length
  const qualScores = conversations.filter(c => c.qualityScore !== undefined).map(c => c.qualityScore!)
  const avgQuality = qualScores.length ? Math.round(qualScores.reduce((a, b) => a + b, 0) / qualScores.length) : 0

  const kpis = [
    { label: 'Total Invocations', value: total,      icon: Activity,     accent: V.primary, accentBg: V.primary50 },
    { label: 'Completed',         value: completed,  icon: CheckCircle,  accent: V.emerald, accentBg: V.emerald50 },
    { label: 'Failed',            value: failed,     icon: XCircle,      accent: V.rose,    accentBg: V.redBg    },
    { label: 'Avg Quality',       value: avgQuality, icon: Star,         accent: V.amber,   accentBg: V.amber50  },
  ]

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>Invocations</h1>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
              background: V.primary50, color: V.primary, border: '1px solid #C8D2FB',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{total}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: V.muted }}>View and analyze all agent invocations across channels</p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map(({ label, value, icon: Icon, accent, accentBg }) => (
          <div key={label} style={{
            background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 14,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 1px 0 rgba(17,21,74,0.03)',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} style={{ color: accent }} strokeWidth={2} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 22 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: V.muted2, pointerEvents: 'none' }} />
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agent or conversation ID…"
            style={{
              width: '100%', boxSizing: 'border-box', paddingLeft: 32, paddingRight: 12, height: 38,
              background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 10,
              fontSize: 13, color: V.ink, outline: 'none',
              fontFamily: "'Manrope', ui-sans-serif, sans-serif",
              colorScheme: 'light' as React.CSSProperties['colorScheme'],
              transition: 'border-color .15s, box-shadow .15s', fontWeight: 500,
              boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(48,86,244,0.10)' }}
            onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = '0 1px 2px rgba(17,21,74,0.04)' }}
          />
        </div>
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Channels</option>
          <option value="CALL">Call</option>
          <option value="CHAT">Chat</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="ACTIVE">Active</option>
        </select>
        <select value={interactionFilter} onChange={(e) => setInteractionFilter(e.target.value)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Directions</option>
          <option value="INBOUND">Inbound</option>
          <option value="OUTBOUND">Outbound</option>
        </select>
        <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Quality</option>
          <option value="HIGH">High (≥80)</option>
          <option value="MEDIUM">Medium (60–79)</option>
          <option value="LOW">Low (&lt;60)</option>
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Sources</option>
          <option value="PROD">Production</option>
          <option value="TEST">Test runs</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: V.muted2, fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18,
          padding: '72px 24px', textAlign: 'center',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04)',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: V.bg, border: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <MessageSquare size={22} style={{ color: '#C8CDD8' }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: V.ink, margin: '0 0 4px' }}>No invocations found</p>
          <p style={{ fontSize: 12.5, color: V.muted, margin: 0 }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ borderRadius: 18, border: `1px solid ${V.line}`, boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)', overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 12.5, background: V.canvas }}>
              <colgroup>
                {COLS.map(c => <col key={c.label} style={{ width: c.pct }} />)}
              </colgroup>
              <thead>
                <tr style={{ background: 'linear-gradient(180deg, #FAFBFE, #fff)', borderBottom: `1px solid ${V.line}` }}>
                  {COLS.map((c, i) => (
                    <th key={c.label} style={{
                      textAlign: 'left', padding: '11px 12px',
                      fontSize: 10.5, fontWeight: 700, color: V.muted2,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace",
                      ...(i === COLS.length - 1 ? { textAlign: 'right' } : {}),
                    }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((conv) => (
                  <tr key={conv.id}
                    style={{ borderBottom: `1px solid ${V.line2}`, cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = V.bg)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { window.location.href = `/invocations/${conv.id}` }}
                  >
                    {/* Conversation */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {conv.interactionType === 'OUTBOUND'
                          ? <ArrowUpRight size={11} style={{ color: V.emerald, flexShrink: 0 }} />
                          : <ArrowDownLeft size={11} style={{ color: V.primary, flexShrink: 0 }} />
                        }
                        <Link to={`/invocations/${conv.id}`} onClick={(e) => e.stopPropagation()}
                          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: V.primary, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130, display: 'block' }}
                          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                        >{conv.id}</Link>
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                        {conv.isTestRun && (
                          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.07em', padding: '1px 6px', borderRadius: 4, background: V.primary50, color: V.primary, border: `1px solid #C8D2FB` }}>
                            TEST
                          </span>
                        )}
                        {conv.toolCalls && conv.toolCalls.length > 0 && (
                          <span style={{ fontSize: 9.5, color: V.muted, fontWeight: 600, background: V.bg, padding: '1px 6px', borderRadius: 4, border: `1px solid ${V.line}` }}>
                            {conv.toolCalls.length} tool{conv.toolCalls.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Agent */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle', fontWeight: 600, color: V.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.agent}
                    </td>
                    {/* User # */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: V.muted, whiteSpace: 'nowrap' }}>
                      {maskPhone(conv.userPhone || conv.participants)}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle' }}>
                      <StatusBadge status={conv.status} size="sm" />
                    </td>
                    {/* Channel */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle' }}>
                      <ChannelBadge channel={conv.channel} size="sm" />
                    </td>
                    {/* Duration */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle', color: V.muted, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                      {conv.duration}
                    </td>
                    {/* Quality */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle' }}>
                      {conv.qualityScore !== undefined
                        ? <QualityDot score={conv.qualityScore} />
                        : <span style={{ color: '#C8CDD8' }}>—</span>
                      }
                    </td>
                    {/* Created */}
                    <td style={{ padding: '13px 14px', verticalAlign: 'middle', color: V.muted2, fontSize: 11.5, whiteSpace: 'nowrap', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                      {conv.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '0 4px' }}>
          <span style={{ fontSize: 12, color: V.muted2, fontWeight: 600 }}>
            Page {safePage} of {pageCount} · {filtered.length} total
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${V.line}`,
                background: V.canvas, cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: safePage === 1 ? 0.4 : 1, transition: 'opacity .15s',
              }}
            ><ChevronLeft size={14} style={{ color: V.muted }} /></button>
            {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
              const p = pageCount <= 7 ? i + 1
                : safePage <= 4 ? i + 1
                : safePage >= pageCount - 3 ? pageCount - 6 + i
                : safePage - 3 + i
              return (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 32, height: 32, borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  background: safePage === p ? V.primary : V.canvas,
                  color: safePage === p ? '#fff' : V.ink,
                  border: `1px solid ${safePage === p ? V.primary : V.line}`,
                  cursor: 'pointer', transition: 'all .15s',
                }}>{p}</button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${V.line}`,
                background: V.canvas, cursor: safePage === pageCount ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: safePage === pageCount ? 0.4 : 1, transition: 'opacity .15s',
              }}
            ><ChevronRight size={14} style={{ color: V.muted }} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
