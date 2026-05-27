import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { ChannelBadge } from '../../components/shared/ChannelBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Agent, AgentStatus } from '../../types'
import { Plus, Clock, Zap, Activity, CheckCircle, Phone, Search, SlidersHorizontal, X, Globe, ChevronRight, Play } from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF',
}

const GRADS = [
  ['#3056F4', '#6B5BFF'], ['#0F9D6E', '#3FD49B'], ['#D63B5B', '#FF8FA3'],
  ['#C2780A', '#F5C26B'], ['#11154A', '#3056F4'], ['#6B5BFF', '#B49DFF'],
]
const agentGrad = (name: string) => GRADS[(name.charCodeAt(0) || 0) % GRADS.length]

const selectStyle: React.CSSProperties = {
  padding: '8px 32px 8px 12px', background: V.canvas, border: `1px solid ${V.line}`,
  borderRadius: 10, fontSize: 13, color: V.ink, outline: 'none', cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as any, fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
  boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
}

export function AgentList() {
  const agents = useAppStore((state) => state.agents)
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'ALL' | AgentStatus>('ALL')
  const [channelFilter, setChannelFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'active' | 'invocations'>('invocations')
  const [testModalAgent, setTestModalAgent] = useState<Agent | null>(null)

  const filtered = agents.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
    if (channelFilter !== 'ALL' && !a.channels.includes(channelFilter as any)) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!a.display_name.toLowerCase().includes(term) && !a.description?.toLowerCase().includes(term)) return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'name') return a.display_name.localeCompare(b.display_name)
    if (sortBy === 'active') return (a.status === 'ACTIVE' ? 0 : 1) - (b.status === 'ACTIVE' ? 0 : 1)
    return (b.invocationsToday || 0) - (a.invocationsToday || 0)
  })

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>

      {/* Voice Flavor Modal */}
      {testModalAgent && (() => {
        const [mg1, mg2] = agentGrad(testModalAgent.display_name)
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(14,17,22,0.42)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setTestModalAgent(null)}
          >
            <div
              style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 480, boxShadow: '0 28px 60px -12px rgba(17,21,74,0.3), 0 8px 24px -8px rgba(17,21,74,0.12)', overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid #EEF0F4', background: 'linear-gradient(180deg, #FAFBFE, #fff)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `linear-gradient(135deg, ${mg1}, ${mg2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: '0 4px 12px -4px rgba(17,21,74,0.24)' }}>
                  {testModalAgent.display_name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0E1116', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{testModalAgent.display_name}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 5, background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB', flexShrink: 0 }}>TEST RUN</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#9AA1B2' }}>{testModalAgent.channels.join(' · ')}</p>
                </div>
                <button onClick={() => setTestModalAgent(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F4F5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7385', flexShrink: 0 }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: '22px 20px 20px' }}>
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: '#0E1116', letterSpacing: '-0.01em' }}>
                  Pick voice flavor
                </h2>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6B7385', lineHeight: 1.55 }}>
                  Both flavors run the same agent. Pick web voice unless you specifically want to test the telephony stack.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => { navigate(`/agents/${testModalAgent.id}`); setTestModalAgent(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: '#F8F9FF', border: '1.5px solid #C8D2FB', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background .15s, box-shadow .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EEF1FE'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(48,86,244,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FF'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(48,86,244,0.25)' }}>
                      <Globe size={18} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0E1116' }}>Web voice</span>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', padding: '2px 6px', borderRadius: 5, background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB' }}>RECOMMENDED</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7385', lineHeight: 1.45 }}>Uses your browser mic & speakers — no phone needed.</p>
                    </div>
                    <ChevronRight size={16} style={{ color: '#9AA1B2', flexShrink: 0 }} />
                  </button>

                  <button
                    onClick={() => { navigate(`/agents/${testModalAgent.id}`); setTestModalAgent(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: '#FAFAFA', border: '1px solid #E5E7ED', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background .15s, border-color .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F8'; e.currentTarget.style.borderColor = '#C8CDD8' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#E5E7ED' }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={18} style={{ color: '#7C3AED' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#0E1116' }}>Telephony voice</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7385', lineHeight: 1.45 }}>Outbound call to a real phone number. Uses call credits.</p>
                    </div>
                    <ChevronRight size={16} style={{ color: '#9AA1B2', flexShrink: 0 }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>Agents</h1>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
              background: V.primary50, color: V.primary, border: '1px solid #C8D2FB',
            }}>
              {agents.length}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: V.muted }}>Build, deploy, and monitor conversational AI agents</p>
        </div>
        <button
          onClick={() => navigate('/agents/create')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 11, fontSize: 13.5, fontWeight: 700,
            background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: "'Manrope', ui-sans-serif, sans-serif",
            boxShadow: '0 6px 14px -6px rgba(48,86,244,0.50)',
            transition: 'box-shadow .2s, transform .15s, opacity .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px -6px rgba(48,86,244,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 14px -6px rgba(48,86,244,0.50)' }}
        >
          <Plus size={15} /> New Agent
        </button>
      </div>

      {/* KPI cards */}
      {(() => {
        const activeCount = agents.filter(a => a.status === 'ACTIVE').length
        const totalToday = agents.reduce((s, a) => s + (a.invocationsToday || 0), 0)
        const callAgents = agents.filter(a => a.channels.includes('CALL' as any)).length
        const kpis = [
          { label: 'Total Agents',     value: agents.length,  icon: Zap,           accent: V.primary,  accentBg: V.primary50 },
          { label: 'Active',           value: activeCount,    icon: CheckCircle,   accent: V.emerald,  accentBg: '#E6F6EF' },
          { label: 'Invocations Today',value: totalToday,     icon: Activity,      accent: '#7C3AED',  accentBg: '#F5F3FF' },
          { label: 'Voice Agents',     value: callAgents,     icon: Phone,         accent: '#1D4ED8',  accentBg: '#EFF6FF' },
        ]
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {kpis.map(({ label, value, icon: Icon, accent, accentBg }) => (
              <div key={label} style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 0 rgba(17,21,74,0.03)' }}>
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
        )
      })()}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: V.muted2, pointerEvents: 'none' }} />
          <input
            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search agents…"
            style={{
              width: '100%', boxSizing: 'border-box', paddingLeft: 32, paddingRight: 12, height: 38,
              background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 10,
              fontSize: 13, color: V.ink, outline: 'none', fontFamily: "'Manrope', ui-sans-serif, sans-serif",
              colorScheme: 'light' as React.CSSProperties['colorScheme'], fontWeight: 500,
              boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(48,86,244,0.10)' }}
            onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = '0 1px 2px rgba(17,21,74,0.04)' }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="ALL">All Channels</option>
          <option value="CALL">Call</option>
          <option value="CHAT">Chat</option>
          <option value="EMBED">Embed</option>
          <option value="HEADLESS">Headless</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={selectStyle}
          onFocus={e => (e.currentTarget.style.borderColor = V.primary)} onBlur={e => (e.currentTarget.style.borderColor = V.line)}>
          <option value="invocations">Most Active</option>
          <option value="name">Name A–Z</option>
          <option value="active">Status</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: V.muted2, fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'agent' : 'agents'}
        </span>
      </div>

      {/* Agent Grid */}
      {filtered.length === 0 ? (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18,
          padding: '72px 24px', textAlign: 'center',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04)',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: V.bg, border: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Zap size={22} style={{ color: '#C8CDD8' }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: V.ink, margin: '0 0 4px' }}>No agents found</p>
          <p style={{ fontSize: 12.5, color: V.muted, margin: 0 }}>Try adjusting your filters or create a new agent</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map((agent) => {
            const [g1, g2] = agentGrad(agent.display_name)
            return (
              <div
                key={agent.id}
                onClick={() => navigate(`/agents/${agent.id}`)}
                style={{
                  background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18,
                  cursor: 'pointer', overflow: 'hidden',
                  boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
                  transition: 'border-color .2s, box-shadow .2s, transform .15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = '#C8D2FB'
                  el.style.boxShadow = '0 10px 30px -12px rgba(48,86,244,0.18), 0 1px 0 rgba(17,21,74,0.04)'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = V.line
                  el.style.boxShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {/* Gradient top stripe */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />
                <div style={{ padding: '20px 22px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                    background: `linear-gradient(135deg, ${g1}, ${g2})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em',
                    boxShadow: '0 6px 14px -4px rgba(17,21,74,0.22)',
                  }}>
                    {agent.display_name[0]?.toUpperCase()}
                  </div>
                  <StatusBadge status={agent.status} />
                </div>

                {/* Name + desc */}
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: V.ink, letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {agent.display_name}
                  </h3>
                  <p style={{ margin: '5px 0 0', fontSize: 12, color: V.muted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {agent.description}
                  </p>
                </div>

                {/* Channels */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {agent.channels.slice(0, 3).map((ch) => <ChannelBadge key={ch} channel={ch} size="sm" />)}
                  {agent.channels.length > 3 && (
                    <span style={{ fontSize: 11, padding: '2px 7px', background: V.bg, color: V.muted, borderRadius: 6, border: `1px solid ${V.line}`, fontWeight: 600 }}>
                      +{agent.channels.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ borderTop: `1px solid ${V.line}`, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: V.muted2 }}>
                    <Clock size={11} />
                    <span>{agent.lastInvoked || 'Never invoked'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {agent.channels.includes('CALL' as any) && (
                      <button
                        onClick={e => { e.stopPropagation(); setTestModalAgent(agent) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: '#fff', fontFamily: "'Manrope', ui-sans-serif, sans-serif", transition: 'opacity .15s, box-shadow .15s', boxShadow: '0 6px 14px -6px rgba(48,86,244,0.50)' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.boxShadow = '0 8px 18px -6px rgba(48,86,244,0.55)' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 6px 14px -6px rgba(48,86,244,0.50)' }}
                      >
                        <Play size={10} strokeWidth={2.5} /> Test
                      </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5 }}>
                      <span style={{ fontWeight: 700, color: V.ink, letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace" }}>{agent.invocationsToday}</span>
                      <span style={{ color: V.muted2 }}>today</span>
                    </div>
                  </div>
                </div>
                </div>{/* end inner padding wrapper */}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
