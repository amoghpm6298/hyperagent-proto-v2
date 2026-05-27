import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { conversations } from '../../data/mock'
import { ChannelBadge } from '../../components/shared/ChannelBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { MessageSquare, Phone, Search, ChevronRight, Calendar } from 'lucide-react'
import { AgentChannel } from '../../types'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF', emeraldBorder: '#6EE7B7',
  amber: '#C2780A', amber50: '#FBF1DA', amberBorder: '#FCD34D',
  rose: '#D63B5B', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

const GRADS = [
  ['#3056F4','#6B5BFF'],['#0F9D6E','#3FD49B'],['#D63B5B','#FF8FA3'],
  ['#C2780A','#F5C26B'],['#11154A','#3056F4'],['#6B5BFF','#B49DFF'],
]
const grad = (name: string) => GRADS[(name.charCodeAt(0)||0) % GRADS.length]

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 32px 8px 12px', background: '#fff', border: '1px solid #E5E7ED', borderRadius: 10,
  fontSize: 13, color: '#0E1116', outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as any, fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
  boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
  transition: 'border-color .15s, box-shadow .15s',
}

const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

export function ConversationList() {
  const [channelFilter, setChannelFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = conversations.filter((conv) => {
    if (channelFilter !== 'ALL' && conv.channel !== (channelFilter as AgentChannel)) return false
    if (searchTerm && !conv.agent.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 900, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: V.ink, letterSpacing: '-0.025em' }}>Conversations</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: V.muted }}>View and manage all agent conversations across channels</p>
        </div>
        {/* Gradient date badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 10,
          background: 'linear-gradient(135deg, #EEF1FE, #E6F6EF)',
          border: '1px solid #C8D2FB',
          boxShadow: '0 1px 3px rgba(17,21,74,0.06)',
        }}>
          <Calendar size={13} color={V.primary} />
          <span style={{ fontSize: 12, fontWeight: 700, color: V.primary, letterSpacing: '-0.01em' }}>{today}</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: V.ink, marginBottom: 6 }}>Search Agent</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: V.muted2, pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by agent name…"
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 32, paddingRight: 12,
                paddingTop: 0, paddingBottom: 0, minHeight: 40,
                background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 10,
                fontSize: 13, color: V.ink, outline: 'none',
                colorScheme: 'light', transition: 'border-color .15s, box-shadow .15s',
                fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 500,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = V.primary
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = V.line
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: V.ink, marginBottom: 6 }}>Channel</label>
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            style={selectStyle}
            onFocus={e => {
              e.currentTarget.style.borderColor = V.primary
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = V.line
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <option value="ALL">All Channels</option>
            <option value="CALL">Call</option>
            <option value="CHAT">Chat</option>
          </select>
        </div>
      </div>

      {/* Conversations list */}
      {filtered.length === 0 ? (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
        }}>
          <EmptyState icon={MessageSquare} title="No conversations" description="No conversations match your filters" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((conv) => {
            const g = grad(conv.agent)
            return (
              <Link key={conv.id} to={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 16,
                    padding: '16px 20px', cursor: 'pointer',
                    transition: 'border-color .15s, box-shadow .15s, transform .15s',
                    boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = '#C8D2FB'
                    el.style.boxShadow = '0 10px 30px -12px rgba(48,86,244,0.18)'
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = V.line
                    el.style.boxShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Gradient avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
                        color: '#fff', fontWeight: 800, fontSize: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 14px -4px rgba(17,21,74,0.22)',
                        marginTop: 1,
                      }}>
                        {conv.agent.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {/* Name + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>{conv.agent}</p>
                          <ChannelBadge channel={conv.channel} size="sm" />
                          {conv.toolCalls && conv.toolCalls.length > 0 && (
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                              background: V.primary50, color: V.primary, border: `1px solid ${V.primary100}`,
                            }}>
                              {conv.toolCalls.length} tool call{conv.toolCalls.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: V.muted }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {conv.channel === 'CALL' ? <Phone size={12} /> : <MessageSquare size={12} />}
                            <span style={{ fontWeight: 500 }}>{conv.participants}</span>
                          </span>
                          <span>{conv.duration}</span>
                          <span style={{ color: V.muted2 }}>{conv.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    {/* Status + chevron */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                      <StatusBadge status={conv.status} size="sm" />
                      <ChevronRight size={15} style={{ color: V.muted2 }} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
