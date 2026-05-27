import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE',
}

const baseCardShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'

const MOCK_LOGS = [
  { id: 'log_001', ts: '2026-05-15 14:32:18', channel: 'CALL', accessMethod: null,    input: { customer_id: 'C123456', action: 'retention_check' },   output: { outcome: 'success', recommendation: 'emi_offer' },              latency: 2340, status: 'SUCCESS' },
  { id: 'log_002', ts: '2026-05-15 14:15:42', channel: 'CHAT', accessMethod: 'embed', input: { session_id: 'sess_abc', domain: 'portal.bank.com' },    output: { summary: 'Customer interested in premium card upgrade' },        latency: 1240, status: 'SUCCESS' },
  { id: 'log_003', ts: '2026-05-15 13:58:21', channel: 'CALL', accessMethod: null,    input: { customer_id: 'C789012', language: 'hi-IN' },            output: { error: 'transfer_timeout' },                                     latency: 5000, status: 'FAILED'  },
  { id: 'log_004', ts: '2026-05-15 13:44:05', channel: 'CHAT', accessMethod: 'api',   input: { account_id: 'A-9021', query: 'credit_limit' },          output: { credit_limit: 250000, currency: 'INR' },                        latency: 890,  status: 'SUCCESS' },
  { id: 'log_005', ts: '2026-05-15 13:31:12', channel: 'CHAT', accessMethod: 'embed', input: { session_id: 'sess_xyz', domain: 'mobileapp.bank.com' }, output: { action: 'offer_presented', product: 'balance_transfer' },       latency: 1560, status: 'SUCCESS' },
  { id: 'log_006', ts: '2026-05-15 13:18:44', channel: 'CHAT', accessMethod: 'api',   input: { account_id: 'A-4417', query: 'eligibility_check' },     output: { error: 'upstream_timeout', provider: 'crif' },                  latency: 8200, status: 'FAILED'  },
  { id: 'log_007', ts: '2026-05-15 12:55:33', channel: 'CALL', accessMethod: null,    input: { customer_id: 'C334455', action: 'loan_query' },         output: { recommendation: 'personal_loan_3L', rate: '11.5%' },            latency: 3100, status: 'SUCCESS' },
  { id: 'log_008', ts: '2026-05-15 12:41:07', channel: 'CHAT', accessMethod: null,    input: { transcript: 'Card block request' },                    output: { outcome: 'escalated_to_human', reason: 'high_value_card' },      latency: 980,  status: 'SUCCESS' },
  { id: 'log_009', ts: '2026-05-15 12:28:50', channel: 'CHAT', accessMethod: 'embed', input: { session_id: 'sess_pqr', domain: 'mobileapp.bank.com' }, output: { action: 'dismissed' },                                          latency: 620,  status: 'SUCCESS' },
  { id: 'log_010', ts: '2026-05-15 12:15:22', channel: 'CALL', accessMethod: null,    input: { customer_id: 'C991122', action: 'emi_moratorium' },     output: { outcome: 'approved', moratorium_months: 3 },                    latency: 2890, status: 'SUCCESS' },
]

const selectStyle: React.CSSProperties = {
  padding: '6px 28px 6px 10px', background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 7,
  fontSize: 12, color: V.ink, outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  colorScheme: 'light' as any, fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 500,
  transition: 'border-color .15s',
}

export function LogsTab({ agentId }: { agentId: string }) {
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [accessMethodFilter, setAccessMethodFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = MOCK_LOGS.filter((l) => {
    if (channelFilter !== 'ALL' && l.channel !== channelFilter) return false
    if (accessMethodFilter !== 'ALL') {
      if (accessMethodFilter === 'direct' && l.accessMethod !== null) return false
      if (accessMethodFilter !== 'direct' && l.accessMethod !== accessMethodFilter) return false
    }
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false
    return true
  })

  const channelStyle = (ch: string): React.CSSProperties => ch === 'CALL'
    ? { background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }
    : { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }

  const amStyle = (am: string): React.CSSProperties => am === 'embed'
    ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' }
    : { background: '#FFF7ED', color: '#92400E', border: '1px solid #FCD34D' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Channels</option>
          <option value="CALL">Call</option>
          <option value="CHAT">Chat</option>
        </select>
        <select value={accessMethodFilter} onChange={(e) => setAccessMethodFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Access Methods</option>
          <option value="direct">Direct</option>
          <option value="embed">Embed</option>
          <option value="api">API</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: V.muted2 }}>{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div style={{
        background: V.canvas, border: `1px solid ${V.line}`,
        borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow,
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 4fr 1.5fr 1fr',
          padding: '10px 16px',
          borderBottom: `1px solid ${V.line2}`,
          background: 'linear-gradient(180deg, #FAFBFE, #fff)',
        }}>
          {['Timestamp', 'Channel', 'Via', 'Input', 'Status', 'ms'].map((h, i) => (
            <p key={h} style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: i === 5 ? 'right' : 'left' }}>{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: V.bg, border: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ChevronDown size={20} style={{ color: '#C8CDD8' }} strokeWidth={1.5} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: V.muted }}>No logs match your filters</p>
          </div>
        ) : (
          filtered.map((log) => (
            <React.Fragment key={log.id}>
              <button
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 4fr 1.5fr 1fr',
                  width: '100%', padding: '11px 16px', textAlign: 'left',
                  background: 'transparent', border: 'none', borderBottom: `1px solid ${V.line}`,
                  cursor: 'pointer', transition: 'background .1s', alignItems: 'center',
                  fontFamily: "'Manrope', ui-sans-serif, sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = V.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: V.muted2 }}>
                    {expandedId === log.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </span>
                  <span style={{ fontSize: 11.5, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>{log.ts.split(' ')[1]}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 5, ...channelStyle(log.channel) }}>{log.channel}</span>
                </div>
                <div>
                  {log.accessMethod
                    ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 5, ...amStyle(log.accessMethod) }}>{log.accessMethod}</span>
                    : <span style={{ fontSize: 12, color: '#C8CDD8' }}>—</span>
                  }
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11.5, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {JSON.stringify(log.input).slice(0, 52)}{JSON.stringify(log.input).length > 52 ? '…' : ''}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 5,
                    ...(log.status === 'SUCCESS'
                      ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' }
                      : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' })
                  }}>{log.status}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: log.latency > 3000 ? '#D97706' : V.muted }}>{log.latency.toLocaleString()}</span>
                </div>
              </button>

              {expandedId === log.id && (
                <div style={{ padding: '14px 16px', background: V.bg, borderBottom: `1px solid ${V.line}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Input</p>
                      <pre style={{ margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: V.ink, background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 12, padding: '10px 12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(log.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Output</p>
                      <pre style={{ margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", borderRadius: 12, padding: '10px 12px', overflowX: 'auto', whiteSpace: 'pre-wrap',
                        ...(log.status === 'FAILED'
                          ? { color: '#991B1B', background: '#FEF2F2', border: '1px solid #FCA5A5' }
                          : { color: V.ink, background: V.canvas, border: `1px solid ${V.line}` })
                      }}>
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 10.5, color: V.muted2, fontFamily: "'JetBrains Mono', monospace" }}>{log.ts} · {log.id}</p>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  )
}
