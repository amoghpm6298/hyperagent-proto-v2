import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Tabs } from '../../components/ui/Tabs'
import { OverviewTab } from './tabs/OverviewTab'
import { ChannelsTab } from './tabs/ChannelsTab'
import { TestTab } from './tabs/TestTab'
import { LogsTab } from './tabs/LogsTab'
import { AnalyticsTab } from './tabs/AnalyticsTab'
import { Edit, FlaskConical, ChevronRight, Calendar, Clock, ArrowLeft, LayoutDashboard, Radio, ScrollText, BarChart2 } from 'lucide-react'

const TABS = [
  { id: 'overview',  label: 'Overview',       icon: LayoutDashboard },
  { id: 'channels',  label: 'Access Methods', icon: Radio           },
  { id: 'test',      label: 'Test',           icon: FlaskConical    },
  { id: 'logs',      label: 'Logs',           icon: ScrollText      },
  { id: 'analytics', label: 'Analytics',      icon: BarChart2       },
]

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF',
}

export function AgentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const agents = useAppStore((state) => state.agents)
  const [activeTab, setActiveTab] = useState('overview')

  const agent = agents.find((a) => a.id === id)

  if (!agent) {
    return (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
        <button onClick={() => navigate('/agents')} style={{ color: V.muted2, border: 'none', background: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} />
        </button>
        <p style={{ fontSize: 13, color: V.muted, margin: 0 }}>Agent not found</p>
      </div>
    )
  }

  const isLive = agent.status === 'ACTIVE'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ background: V.canvas, borderBottom: `1px solid ${V.line}`, padding: '0 24px' }}>
        <div style={{ paddingTop: 16 }}>

          {/* Breadcrumb row + action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: V.muted2, fontWeight: 600 }}>
              {/* Logo pill */}
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: V.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
              }}>H</div>
              <span>HyperAgent</span>
              <ChevronRight size={13} style={{ color: V.muted2 }} />
              <button
                onClick={() => navigate('/agents')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: V.muted2, fontWeight: 600, padding: 0, fontFamily: 'inherit', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = V.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = V.muted2)}
              >
                Agents
              </button>
              <ChevronRight size={13} style={{ color: V.muted2 }} />
              <span style={{ color: V.ink, fontWeight: 700 }}>{agent.display_name}</span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Live/Draft badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 20,
                border: `1px solid ${isLive ? '#6EE7B7' : V.line}`,
                background: isLive ? V.emerald50 : V.bg,
                fontSize: 12, fontWeight: 700,
                color: isLive ? V.emerald : V.muted2,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isLive ? V.emerald : V.muted2,
                  ...(isLive ? { boxShadow: `0 0 0 2px rgba(15,157,110,0.25)` } : {}),
                }} />
                {isLive ? 'LIVE' : 'DRAFT'}
              </div>

              {/* Edit button */}
              <button
                onClick={() => navigate(`/agents/${agent.id}/edit`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', color: '#fff', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .15s, box-shadow .15s',
                  boxShadow: '0 6px 14px -6px rgba(48,86,244,0.50)',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.boxShadow = '0 10px 24px -6px rgba(48,86,244,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 6px 14px -6px rgba(48,86,244,0.50)' }}
              >
                <Edit size={13} /> Edit
              </button>
            </div>
          </div>

          {/* Agent name + meta row */}
          <div style={{ marginBottom: 14 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
              {agent.display_name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: V.muted2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={10} /> Created {agent.createdAt}
              </span>
              <span>·</span>
              {agent.lastInvoked && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> Updated {agent.lastInvoked}
                  </span>
                  <span>·</span>
                </>
              )}
              <span style={{ fontWeight: 600, color: V.muted }}>
                {agent.invocationsToday.toLocaleString()} invocations today
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: 24, maxWidth: 960 }}>
          {activeTab === 'overview'   && <OverviewTab agent={agent} />}
          {activeTab === 'channels'   && <ChannelsTab agent={agent} />}
          {activeTab === 'test'       && <TestTab agent={agent} />}
          {activeTab === 'logs'       && <LogsTab agentId={agent.id} />}
          {activeTab === 'analytics'  && <AnalyticsTab agent={agent} />}
        </div>
      </div>
    </div>
  )
}
