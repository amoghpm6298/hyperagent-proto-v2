import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { conversations } from '../../data/mock'
import { Button } from '../../components/ui/Button'
import { ChannelBadge } from '../../components/shared/ChannelBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import {
  ArrowLeft, Download, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, Clock, Flag, Play, Pause, Mic, ExternalLink, Phone, MessageSquare,
  TrendingUp, Activity, Zap, FileText, Cpu, Database, Tag, ChevronRight,
} from 'lucide-react'
import { ConversationReplay } from './ConversationReplay'
import { useAppStore } from '../../store'
import { Conversation, ToolCall } from '../../types'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116',
  muted: '#6B7385', subtle: '#9AA1B2', border: '#E5E7ED',
  primary: '#3056F4', primaryBg: '#EEF1FE', primaryBorder: '#C8D2FB',
  emerald: '#0F9D6E', emeraldBg: '#ECFDF5', emeraldBorder: '#6EE7B7',
  amber: '#D97706', amberBg: '#FFFBEB', amberBorder: '#FCD34D',
  red: '#DC2626', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

type Tab = 'report' | 'transcript' | 'llm_data' | 'external_data' | 'metadata'

export function InvocationDetail() {
  const { id } = useParams<{ id: string }>()
  const conversation = conversations.find((c) => c.id === id)
  const agents = useAppStore((state) => state.agents)
  const [activeTab, setActiveTab] = useState<Tab>('report')
  const [summaryExpanded, setSummaryExpanded] = useState(true)

  const agent = conversation ? agents.find((a) => a.id === conversation.agentId) : null

  if (!conversation) {
    return (
      <div style={{ padding: 32, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
        <Link to="/invocations" style={{ display: 'flex', alignItems: 'center', gap: 6, color: V.primary, textDecoration: 'none', fontSize: 13, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Invocations
        </Link>
        <p style={{ fontSize: 13, color: V.muted }}>Invocation not found</p>
      </div>
    )
  }

  const hasReplay = conversation.channel === 'CALL' && !!conversation.callTranscript?.length

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'report',        label: 'Report',                                  icon: FileText    },
    { id: 'transcript',    label: hasReplay ? 'Replay' : 'Transcript',       icon: hasReplay ? Play : MessageSquare },
    { id: 'llm_data',      label: 'LLM Data',                               icon: Cpu         },
    { id: 'external_data', label: 'External Data',                          icon: Database    },
    { id: 'metadata',      label: 'Metadata',                               icon: Tag         },
  ]

  const qualityColor = (q: number) => q >= 80 ? V.emerald : q >= 60 ? V.amber : V.red
  const qualityBg = (q: number) => q >= 80 ? V.emeraldBg : q >= 60 ? V.amberBg : V.redBg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ background: V.canvas, borderBottom: `1px solid ${V.border}`, padding: '0 24px' }}>
        <div style={{ paddingTop: 16 }}>
          {/* Breadcrumb row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: V.subtle, fontWeight: 600 }}>
              {/* Logo pill */}
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: V.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
              }}>H</div>
              <span>HyperAgent</span>
              <ChevronRight size={13} style={{ color: V.subtle }} />
              <Link
                to="/invocations"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: V.subtle, fontWeight: 600, padding: 0, fontFamily: 'inherit', textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = V.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = V.subtle)}
              >
                Invocations
              </Link>
              <ChevronRight size={13} style={{ color: V.subtle }} />
              <span style={{ color: V.ink, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{conversation.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px 60px', maxWidth: 1100, overflowY: 'auto' }}>

      {/* ── Rich header ── */}
      <div style={{
        background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 16,
        overflow: 'hidden', marginBottom: 20,
        boxShadow: '0 1px 8px rgba(14,17,22,0.05)',
      }}>
        {/* Top accent stripe */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />

        <div style={{ padding: '20px 24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            {/* Left: primary metadata */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* ID + interaction type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: V.primary, background: V.primaryBg, border: `1px solid ${V.primaryBorder}`, borderRadius: 6, padding: '2px 8px' }}>
                  {conversation.id}
                </span>
                {conversation.interactionType && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    ...(conversation.interactionType === 'OUTBOUND'
                      ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' }
                      : { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }),
                  }}>
                    {conversation.interactionType === 'OUTBOUND' ? '↗ Outbound' : '↙ Inbound'}
                  </span>
                )}
                <StatusBadge status={conversation.status} size="sm" />
                <ChannelBadge channel={conversation.channel} size="sm" />
              </div>

              {/* Agent + phone/embed info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <MetaField label="Agent">
                  {agent ? (
                    <Link to={`/agents/${agent.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: V.primary, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                      {conversation.agent} <ExternalLink size={10} />
                    </Link>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>{conversation.agent}</span>
                  )}
                </MetaField>

                {conversation.channel === 'CALL' && conversation.userPhone && (
                  <MetaField label="Caller">
                    <span style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", color: V.muted }}>{conversation.userPhone}</span>
                  </MetaField>
                )}
                {conversation.channel === 'CALL' && conversation.agentPhone && (
                  <MetaField label="Agent #">
                    <span style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", color: V.muted }}>{conversation.agentPhone}</span>
                  </MetaField>
                )}
                {conversation.accessMethod === 'embed' && conversation.originDomain && (
                  <MetaField label="Origin">
                    <span style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", color: V.muted }}>{conversation.originDomain}</span>
                  </MetaField>
                )}
                {conversation.accessMethod === 'api' && conversation.httpStatus && (
                  <MetaField label="HTTP">
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: conversation.httpStatus === 200 ? V.emerald : V.red }}>{conversation.httpStatus}</span>
                  </MetaField>
                )}

                <MetaField label="Duration">
                  <span style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>{conversation.duration}</span>
                </MetaField>

                {conversation.language && (
                  <MetaField label="Language">
                    <span style={{ fontSize: 12.5, color: V.muted }}>{conversation.language}</span>
                  </MetaField>
                )}

                {conversation.startTime && (
                  <MetaField label="Started">
                    <span style={{ fontSize: 12, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>{conversation.startTime}</span>
                  </MetaField>
                )}
              </div>
            </div>

            {/* Right: quality score ring */}
            {conversation.qualityScore !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <QualityRing score={conversation.qualityScore} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quality</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${V.border}`, marginBottom: 20 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? V.primary : V.muted,
                background: 'none', border: 'none', borderBottom: isActive ? `2px solid ${V.primary}` : '2px solid transparent',
                marginBottom: -1, cursor: 'pointer', transition: 'color .15s',
                fontFamily: "'Manrope', ui-sans-serif, sans-serif",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = V.ink }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = V.muted }}
            >
              <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
            </button>
          )
        })}
        <div style={{ marginLeft: 'auto', paddingBottom: 8 }}>
          <Button variant="secondary" size="sm">
            <Download size={13} style={{ marginRight: 4 }} /> Export
          </Button>
        </div>
      </div>

      {/* ── Report tab ── */}
      {activeTab === 'report' && (
        <>
          {/* API invocation report */}
          {conversation.accessMethod === 'api' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Status banner */}
                <div style={{
                  borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                  ...(conversation.httpStatus === 200
                    ? { background: V.emeraldBg, border: `1px solid ${V.emeraldBorder}` }
                    : { background: V.redBg, border: `1px solid ${V.redBorder}` }),
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: conversation.httpStatus === 200 ? V.emerald : V.red, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: conversation.httpStatus === 200 ? V.emerald : V.red }}>
                    HTTP {conversation.httpStatus} — {conversation.httpStatus === 200 ? 'Success' : 'Error'}
                  </span>
                  {conversation.latencyMs && (
                    <span style={{ marginLeft: 'auto', fontSize: 11.5, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>{conversation.latencyMs}ms</span>
                  )}
                </div>

                {conversation.aiSummary && <SummaryCard summary={conversation.aiSummary} />}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <CodeCard title="Request Payload" code={JSON.stringify(conversation.requestPayload, null, 2)} />
                  <CodeCard title="Response Payload" code={JSON.stringify(conversation.responsePayload, null, 2)} error={conversation.httpStatus !== 200} />
                </div>
              </div>

              <SidebarDetailsCard conversation={conversation} />
            </div>
          )}

          {/* CALL / CHAT report */}
          {(conversation.channel === 'CALL' || conversation.channel === 'CHAT') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {conversation.aiSummary && (
                  <SummaryCard
                    summary={conversation.aiSummary}
                    expanded={summaryExpanded}
                    onToggle={() => setSummaryExpanded(!summaryExpanded)}
                    callEndState={conversation.callEndState}
                  />
                )}

                {(conversation.intentScore || conversation.irateScore || conversation.overallQuality) && (
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: V.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Activity size={14} style={{ color: V.primary }} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>Quality Scores</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {conversation.intentScore && (
                        <ScoreRow header="Intent" score={conversation.intentScore.score} total={10} label={conversation.intentScore.label} color={conversation.intentScore.color} />
                      )}
                      {conversation.irateScore && (
                        <ScoreRow header="Frustration (Irate)" score={conversation.irateScore.score} total={10} label={conversation.irateScore.label} color={conversation.irateScore.color} />
                      )}
                      {conversation.overallQuality && (
                        <ScoreRow header="Overall Quality" score={conversation.overallQuality.score} total={10} label={conversation.overallQuality.label} color={conversation.overallQuality.color} highlight />
                      )}
                    </div>
                  </div>
                )}

                {/* ── Call Intelligence ── */}
                {(conversation.channel === 'CALL' || conversation.channel === 'CHAT') && conversation.overallQuality && (() => {
                  const irate = conversation.irateScore?.score ?? 0
                  const quality = conversation.overallQuality?.score ?? 0
                  const fcr = conversation.callEndState === 'CALL_COMPLETED' && !conversation.followups?.transferAttempted
                  const escalation = irate >= 7 ? 'High' : irate >= 4 ? 'Medium' : 'Low'
                  const escColor = irate >= 7 ? V.red : irate >= 4 ? V.amber : V.emerald
                  const escBg = irate >= 7 ? V.redBg : irate >= 4 ? V.amberBg : V.emeraldBg
                  const csatLabel = quality >= 8 ? 'High' : quality >= 5 ? 'Medium' : 'Low'
                  const csatColor = quality >= 8 ? V.emerald : quality >= 5 ? V.amber : V.red
                  const csatBg = quality >= 8 ? V.emeraldBg : quality >= 5 ? V.amberBg : V.redBg
                  const compliance = !conversation.followups?.anomaly || conversation.followups.anomaly === 'NA'
                  const summary = (conversation.aiSummary || '').toLowerCase()
                  const allTopics = [
                    { kw: 'clos', label: 'Account Closure' },
                    { kw: 'upgrade', label: 'Product Upgrade' },
                    { kw: 'retain', label: 'Retention' },
                    { kw: 'callback', label: 'Callback Scheduled' },
                    { kw: 'disput', label: 'Transaction Dispute' },
                    { kw: 'refund', label: 'Refund' },
                    { kw: 'balance', label: 'Balance Enquiry' },
                    { kw: 'kyc', label: 'KYC' },
                    { kw: 'loan', label: 'Loan' },
                    { kw: 'card', label: 'Card Issue' },
                    { kw: 'payment', label: 'Payment' },
                    { kw: 'transfer', label: 'Transfer' },
                  ]
                  const topics = allTopics.filter(t => summary.includes(t.kw)).map(t => t.label)
                  return (
                    <>
                      <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <TrendingUp size={14} style={{ color: '#1D4ED8' }} />
                          </div>
                          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>Call Intelligence</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                          {[
                            { label: 'First Call Resolution', value: fcr ? 'Resolved' : 'Unresolved', color: fcr ? V.emerald : V.red, bg: fcr ? V.emeraldBg : V.redBg },
                            { label: 'Escalation Risk',       value: escalation,                        color: escColor,               bg: escBg               },
                            { label: 'CSAT Prediction',       value: csatLabel,                         color: csatColor,              bg: csatBg              },
                            { label: 'Compliance Check',      value: compliance ? 'Passed' : 'Flagged', color: compliance ? V.emerald : V.red, bg: compliance ? V.emeraldBg : V.redBg },
                          ].map(item => (
                            <div key={item.label} style={{ padding: '11px 14px', borderRadius: 10, border: `1px solid ${V.border}`, background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <span style={{ fontSize: 12, color: V.muted, fontWeight: 500 }}>{item.label}</span>
                              <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: item.bg, color: item.color, flexShrink: 0 }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {topics.length > 0 && (
                        <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Zap size={14} style={{ color: '#7C3AED' }} />
                              </div>
                              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>Topics Detected</h3>
                            </div>
                            {conversation.toolCalls && conversation.toolCalls.length > 0 && (
                              <span style={{ fontSize: 11.5, color: V.subtle, fontWeight: 600 }}>{conversation.toolCalls.length} tool call{conversation.toolCalls.length !== 1 ? 's' : ''} made</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                            {topics.map(topic => (
                              <span key={topic} style={{ fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 999, background: V.primaryBg, color: V.primary, border: `1px solid ${V.primaryBorder}` }}>{topic}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}

                {conversation.hasRecording && conversation.channel === 'CALL' && (
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mic size={13} style={{ color: '#7C3AED' }} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: V.ink }}>Recording</h3>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      <MockAudioPlayer duration={conversation.durationMs || 0} />
                    </div>
                  </div>
                )}

                {conversation.channel === 'CHAT' && conversation.messages && (
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MessageSquare size={14} style={{ color: '#1D4ED8' }} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>Conversation Preview</h3>
                      </div>
                      <span style={{ fontSize: 11.5, color: V.subtle, fontWeight: 600 }}>{conversation.messages.length} messages</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
                      {conversation.messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '75%', fontSize: 13, lineHeight: 1.5, padding: '10px 14px', borderRadius: 12, textAlign: 'left',
                            ...(msg.role === 'user'
                              ? { background: V.primaryBg, border: `1px solid ${V.primaryBorder}`, color: V.ink }
                              : { background: V.bg, border: `1px solid ${V.border}`, color: V.ink }),
                          }}>
                            <p style={{ margin: '0 0 4px', fontSize: 10.5, fontWeight: 700, color: msg.role === 'user' ? V.primary : V.emerald }}>
                              {msg.role === 'user' ? 'User' : 'Agent'}
                            </p>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SidebarDetailsCard conversation={conversation} />

                {conversation.followups && (
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flag size={13} style={{ color: '#D97706' }} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: V.ink }}>Follow-ups & Flags</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Do not call', value: conversation.followups.doNotCall ? 'Yes' : 'No', danger: conversation.followups.doNotCall },
                        { label: 'Callback request', value: conversation.followups.callbackRequest ? 'Yes' : 'No', positive: conversation.followups.callbackRequest },
                        { label: 'Transfer attempted', value: conversation.followups.transferAttempted ? 'Yes' : 'No' },
                        { label: 'Transfer result', value: conversation.followups.transferResult },
                        { label: 'Anomaly', value: conversation.followups.anomaly },
                      ].map(({ label, value, danger, positive }) => value ? (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: V.muted }}>{label}</span>
                          <span style={{
                            fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                            ...(danger
                              ? { background: V.redBg, color: V.red, border: `1px solid ${V.redBorder}` }
                              : positive
                              ? { background: V.emeraldBg, color: V.emerald, border: `1px solid ${V.emeraldBorder}` }
                              : value === 'NA' || value === 'NOT_ATTEMPTED' || value === 'No'
                              ? { background: V.bg, color: V.muted, border: `1px solid ${V.border}` }
                              : { background: '#FFFBEB', color: '#D97706', border: '1px solid #FCD34D' }),
                          }}>
                            {value}
                          </span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Transcript / Replay tab ── */}
      {activeTab === 'transcript' && (
        <div style={{ maxWidth: 860 }}>
          {conversation.accessMethod === 'api' && (
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '48px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: V.muted }}>API invocations do not have a transcript. View the request and response payloads in the Report tab.</p>
            </div>
          )}
          {conversation.channel === 'CALL' && conversation.callTranscript ? (
            <ConversationReplay conversation={conversation} />
          ) : conversation.messages ? (
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '20px 22px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: V.ink }}>Chat Transcript</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {conversation.messages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', fontSize: 13, lineHeight: 1.6, padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                      ...(msg.role === 'user'
                        ? { background: V.primaryBg, border: `1px solid ${V.primaryBorder}`, color: V.ink }
                        : { background: V.bg, border: `1px solid ${V.border}`, color: V.ink }),
                    }}>
                      <p style={{ margin: '0 0 5px', fontSize: 10.5, fontWeight: 700, color: msg.role === 'user' ? V.primary : V.emerald }}>
                        {msg.role === 'user' ? 'User' : 'Agent'}
                      </p>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontSize: 13 }}>{msg.text}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '48px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: V.muted }}>No transcript available for this conversation.</p>
            </div>
          )}
        </div>
      )}

      {/* ── LLM Data tab ── */}
      {activeTab === 'llm_data' && (
        <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {conversation.llmData ? (() => {
            const ld = conversation.llmData!
            const barW = (n: number, total: number) => `${Math.round((n / total) * 100)}%`
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  {/* Token usage card */}
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px', gridColumn: '1 / 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                      <Activity size={14} style={{ color: V.muted }} />
                      <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Token Usage</p>
                    </div>
                    <p style={{ margin: '0 0 2px', fontSize: 28, fontWeight: 800, color: V.ink, letterSpacing: '-0.03em' }}>{ld.tokenUsage.totalTokens.toLocaleString()}</p>
                    <p style={{ margin: '0 0 14px', fontSize: 11.5, color: V.subtle }}>Total tokens</p>
                    <div style={{ height: 6, borderRadius: 3, background: V.bg, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', width: barW(ld.tokenUsage.promptTokens, ld.tokenUsage.totalTokens), background: `linear-gradient(90deg, ${V.primary}, #6B5BFF)`, borderRadius: 3, display: 'inline-block' }} />
                      <div style={{ height: '100%', width: barW(ld.tokenUsage.completionTokens, ld.tokenUsage.totalTokens), background: '#0F9D6E', borderRadius: 3, display: 'inline-block' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: V.primary }} />
                        <span style={{ fontSize: 11.5, color: V.muted }}>Prompt</span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: V.ink }}>{ld.tokenUsage.promptTokens.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#0F9D6E' }} />
                        <span style={{ fontSize: 11.5, color: V.muted }}>Completion</span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: V.ink }}>{ld.tokenUsage.completionTokens.toLocaleString()}</span>
                      </div>
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: 12, color: V.muted }}>Cost <strong style={{ color: V.ink }}>${ld.tokenUsage.costUsd.toFixed(4)}</strong></p>
                  </div>
                  {/* Latency card */}
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                      <Clock size={14} style={{ color: V.muted }} />
                      <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latency</p>
                    </div>
                    {([['p50', ld.latency.p50Ms], ['p95', ld.latency.p95Ms]] as [string, number][]).map(([label, val]) => {
                      const pct = Math.min(100, Math.round((val / 2000) * 100))
                      const col = val < 700 ? '#0F9D6E' : val < 1200 ? '#D97706' : '#DC2626'
                      return (
                        <div key={label} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: V.muted }}>{label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: V.ink }}>{val} ms</span>
                          </div>
                          <div style={{ height: 6, background: V.bg, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                    <p style={{ margin: '12px 0 0', fontSize: 12, color: V.muted }}>Turns <strong style={{ color: V.ink }}>{ld.turns}</strong></p>
                  </div>
                  {/* Model & raw card */}
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                      <Cpu size={14} style={{ color: V.muted }} />
                      <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model & Raw</p>
                    </div>
                    {([['model', ld.model], ['provider', ld.provider]] as [string, string][]).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: V.subtle }}>{k}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: V.subtle }}>tools_invoked</span>
                      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {ld.toolsInvoked.length > 0 ? ld.toolsInvoked.map(t => (
                          <span key={t} style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: V.primary }}>{t}</span>
                        )) : <span style={{ fontSize: 12, color: V.subtle, fontStyle: 'italic' }}>none</span>}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: V.subtle }}>safety_flags</span>
                      <span style={{ fontSize: 12, color: V.subtle, marginLeft: 8, fontStyle: 'italic' }}>
                        {ld.safetyFlags.length === 0 ? 'empty' : ld.safetyFlags.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Tool calls */}
                {conversation.toolCalls && conversation.toolCalls.length > 0 && (
                  <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: V.ink }}>Tool Calls <span style={{ fontSize: 12, color: V.subtle, fontWeight: 400 }}>({conversation.toolCalls.length})</span></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {conversation.toolCalls.map((tc) => <ToolCallCard key={tc.id} toolCall={tc} />)}
                    </div>
                  </div>
                )}
              </>
            )
          })() : (
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '48px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: V.muted }}>No LLM data recorded for this invocation.</p>
            </div>
          )}
        </div>
      )}

      {/* ── External Data tab ── */}
      {activeTab === 'external_data' && (
        <div style={{ maxWidth: 860 }}>
          {conversation.externalData ? (() => {
            const ed = conversation.externalData!
            const entries = Object.entries(ed)
            return (
              <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${V.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={14} style={{ color: V.muted }} />
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>External System Data</p>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(ed, null, 2))}
                    style={{ fontSize: 12, color: V.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Manrope', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                    Copy JSON
                  </button>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {entries.map(([key, val], i) => (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, padding: '12px 20px', borderBottom: i < entries.length - 1 ? `1px solid ${V.border}` : 'none', alignItems: 'start' }}>
                      <span style={{ fontSize: 12.5, color: V.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{key}</span>
                      <span style={{ fontSize: 12.5, color: V.ink, fontWeight: 500 }}>
                        {Array.isArray(val) ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {(val as string[]).map(v => (
                              <span key={v} style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', background: V.primaryBg, color: V.primary, border: `1px solid ${V.primaryBorder}`, borderRadius: 5 }}>{v}</span>
                            ))}
                          </div>
                        ) : typeof val === 'boolean' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <CheckCircle size={13} style={{ color: val ? '#0F9D6E' : V.subtle }} />
                            <span style={{ color: val ? '#0F9D6E' : V.subtle }}>{String(val)}</span>
                          </span>
                        ) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })() : (
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '48px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: V.muted }}>No external data fetched during this invocation.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Metadata tab ── */}
      {activeTab === 'metadata' && (() => {
        const identifiers: [string, string | undefined][] = [
          ['conversation_id', conversation.id],
          ['agent_id', conversation.agentId],
          ['user_id', conversation.userId],
          ['campaign_id', conversation.campaignId],
          ['channel', conversation.channel],
          ['interaction_type', conversation.interactionType],
          ['status', conversation.status],
          ['end_state', conversation.callEndState],
        ]
        const extras: [string, any][] = [
          ['region', conversation.region],
          ['operator', conversation.operator],
          ['voice_id', conversation.voiceId],
          ['asr_engine', conversation.asrEngine],
          ['consent_recorded', conversation.consentRecorded],
          ['sentiment_trend', conversation.sentimentTrend],
        ].filter(([, v]) => v !== undefined) as [string, any][]
        const MetaRow = ({ k, v }: { k: string; v: any }) => (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, padding: '12px 20px', borderBottom: `1px solid ${V.border}`, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: V.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
            <span style={{ fontSize: 12.5, color: V.ink, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>
              {v === undefined || v === null ? <span style={{ color: V.subtle, fontStyle: 'italic' }}>—</span>
               : typeof v === 'boolean' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={12} style={{ color: v ? '#0F9D6E' : V.subtle }} />
                  <span style={{ color: v ? '#0F9D6E' : V.subtle }}>{String(v)}</span>
                </span>
               ) : Array.isArray(v) ? `[${v.join(', ')}]`
               : String(v)}
            </span>
          </div>
        )
        return (
          <div style={{ maxWidth: 860, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={13} style={{ color: V.muted }} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: V.ink }}>Conversation Identifiers</p>
              </div>
              {identifiers.map(([k, v]) => <MetaRow key={k} k={k} v={v} />)}
            </div>
            <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={13} style={{ color: V.muted }} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: V.ink }}>Extra Info</p>
              </div>
              {extras.length > 0
                ? extras.map(([k, v]) => <MetaRow key={k} k={k} v={v} />)
                : <p style={{ padding: '24px 20px', fontSize: 12.5, color: V.muted, margin: 0 }}>No additional metadata available.</p>}
            </div>
          </div>
        )
      })()}
      </div>
    </div>
  )
}

/* ── Subcomponents ── */

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 3px', fontSize: 10.5, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
      {children}
    </div>
  )
}

function QualityRing({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  const color = score >= 80 ? V.emerald : score >= 60 ? V.amber : V.red
  const bg = score >= 80 ? V.emeraldBg : score >= 60 ? V.amberBg : V.redBg

  return (
    <div style={{ position: 'relative', width: 70, height: 70 }}>
      <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="35" cy="35" r={r} strokeWidth="5" stroke={V.border} fill={bg} />
        <circle cx="35" cy="35" r={r} strokeWidth="5" stroke={color} fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 17, fontWeight: 800, color, letterSpacing: '-0.03em' }}>{score}</span>
      </div>
    </div>
  )
}

function SummaryCard({ summary, expanded, onToggle, callEndState }: {
  summary: string; expanded?: boolean; onToggle?: () => void; callEndState?: string
}) {
  return (
    <div style={{
      background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(48,86,244,0.04)',
    }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 100%)' }} />
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: V.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={14} style={{ color: V.primary }} />
          </div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>AI Summary</h3>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: V.muted, lineHeight: 1.65, ...(expanded === false ? { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}) }}>
          {summary}
        </p>
        {onToggle && summary.length > 200 && (
          <button onClick={onToggle} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: V.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600 }}>
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
          </button>
        )}
        {callEndState && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${V.border}` }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: V.bg, color: V.muted, border: `1px solid ${V.border}`, fontFamily: "'JetBrains Mono', monospace" }}>
              {callEndState}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreRow({ header, score, total, label, color, highlight }: {
  header: string; score: number; total: number; label?: string; color: string; highlight?: boolean
}) {
  const scoreColor = color || (score / total >= 0.8 ? V.emerald : score / total >= 0.6 ? V.amber : V.red)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* Score circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: highlight ? scoreColor : V.bg, border: `2px solid ${highlight ? scoreColor : V.border}`,
        boxShadow: highlight ? `0 0 0 4px ${scoreColor}18` : 'none',
      }}>
        <span style={{ fontSize: highlight ? 15 : 14, fontWeight: 800, color: highlight ? '#fff' : scoreColor, letterSpacing: '-0.03em' }}>
          {score}
        </span>
      </div>

      {/* Label + bars */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: V.ink, letterSpacing: '0.01em' }}>{header}</span>
          <span style={{ fontSize: 11, color: V.subtle }}>{score} / {total}</span>
        </div>
        <div style={{ display: 'flex', gap: 3, height: 7 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 3,
              background: i < score ? scoreColor : V.border,
              opacity: i < score ? 1 : 0.7,
              transition: 'background .2s',
            }} />
          ))}
        </div>
        {label && <p style={{ margin: '5px 0 0', fontSize: 11, color: V.subtle }}>{label}</p>}
      </div>
    </div>
  )
}

function SidebarDetailsCard({ conversation }: { conversation: Conversation }) {
  const rows = [
    ...(conversation.accessMethod === 'embed' ? [
      { label: 'Embed key', value: conversation.embedKeyLabel, mono: false },
      { label: 'Origin', value: conversation.originDomain, mono: true },
    ] : []),
    { label: 'Start time', value: conversation.startTime, mono: true },
    { label: 'End time', value: conversation.endTime, mono: true },
    { label: 'Duration', value: conversation.duration, mono: false },
    { label: 'Language', value: conversation.language, mono: false },
    { label: 'Interaction', value: conversation.interactionType, mono: false },
    { label: 'Channel', value: conversation.channel, mono: false },
    { label: 'Access method', value: formatAccessMethod(conversation.accessMethod), mono: false },
    ...(conversation.latencyMs ? [{ label: 'Latency', value: `${conversation.latencyMs}ms`, mono: true }] : []),
    ...(conversation.messages ? [{ label: 'Messages', value: `${conversation.messages.length}`, mono: false }] : []),
  ].filter((r) => r.value)

  return (
    <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: V.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={13} style={{ color: V.primary }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: V.ink }}>Session Details</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {rows.map(({ label, value, mono }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 12, color: V.muted, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: V.ink, textAlign: 'right', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', wordBreak: 'break-all' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CodeCard({ title, code, error }: { title: string; code?: string; error?: boolean }) {
  return (
    <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 11.5, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</h3>
      <pre style={{
        margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6,
        background: error ? V.redBg : V.bg,
        color: error ? V.red : V.ink,
        border: `1px solid ${error ? V.redBorder : V.border}`,
        borderRadius: 8, padding: '12px 14px', overflowX: 'auto', maxHeight: 280, whiteSpace: 'pre-wrap',
      }}>
        {code || '—'}
      </pre>
    </div>
  )
}

function MockAudioPlayer({ duration }: { duration: number }) {
  const totalSec = Math.round(duration / 1000)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          if (next >= totalSec) { setIsPlaying(false); setProgress(100); clearInterval(intervalRef.current!); return totalSec }
          setProgress((next / totalSec) * 100)
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, totalSec])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const newElapsed = Math.round(ratio * totalSec)
    setElapsed(newElapsed); setProgress(ratio * 100)
  }

  const handleToggle = () => {
    if (elapsed >= totalSec) { setElapsed(0); setProgress(0) }
    setIsPlaying((p) => !p)
  }

  const bars = Array.from({ length: 60 }, (_, i) => {
    const h = 20 + Math.sin(i * 0.7) * 12 + Math.sin(i * 1.3) * 8 + Math.sin(i * 2.1) * 5
    return Math.max(4, Math.round(h))
  })
  const filledBars = Math.round((progress / 100) * bars.length)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button onClick={handleToggle} style={{ position: 'relative', width: 38, height: 38, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="38" height="38" viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="15" strokeWidth="2.5" stroke={V.border} fill="none" />
          <circle cx="19" cy="19" r="15" strokeWidth="2.5" stroke={V.primary} fill="none"
            strokeDasharray={`${2 * Math.PI * 15}`}
            strokeDashoffset={`${2 * Math.PI * 15 * (1 - progress / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>
        {isPlaying
          ? <Pause size={13} style={{ color: V.primary, position: 'relative', zIndex: 1 }} />
          : <Play size={13} style={{ color: V.primary, position: 'relative', zIndex: 1, marginLeft: 1 }} />
        }
      </button>

      <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: V.muted, flexShrink: 0, width: 36 }}>
        {formatTime(elapsed)}
      </span>

      <div onClick={handleSeek} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', height: 32 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: h, borderRadius: 2, background: i < filledBars ? V.primary : V.border, transition: 'background .1s' }} />
        ))}
      </div>

      <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: V.subtle, flexShrink: 0, width: 36, textAlign: 'right' }}>
        {formatTime(totalSec)}
      </span>

      <button style={{ flexShrink: 0, padding: 7, borderRadius: 8, background: 'none', border: `1px solid ${V.border}`, cursor: 'pointer', display: 'flex', color: V.muted, transition: 'background .15s, color .15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = V.bg; e.currentTarget.style.color = V.ink }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = V.muted }}
        title="Download recording">
        <Download size={14} />
      </button>
    </div>
  )
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false)
  const isSuccess = toolCall.status === 'SUCCESS'

  return (
    <div style={{ background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: "'Manrope', ui-sans-serif, sans-serif", transition: 'background .1s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = V.bg)}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: isSuccess ? V.emeraldBg : V.redBg, border: `1px solid ${isSuccess ? V.emeraldBorder : V.redBorder}` }}>
            {isSuccess
              ? <CheckCircle size={14} style={{ color: V.emerald }} />
              : <AlertCircle size={14} style={{ color: V.red }} />
            }
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: V.ink }}>{toolCall.toolLabel}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: V.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{toolCall.timestamp}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: isSuccess ? V.emeraldBg : V.redBg,
            color: isSuccess ? V.emerald : V.red,
            border: `1px solid ${isSuccess ? V.emeraldBorder : V.redBorder}` }}>
            {toolCall.status}
          </span>
          {expanded ? <ChevronUp size={14} style={{ color: V.subtle }} /> : <ChevronDown size={14} style={{ color: V.subtle }} />}
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${V.border}`, display: 'flex', flexDirection: 'column', gap: 12, background: V.bg }}>
          {Object.keys(toolCall.input).length > 0 && (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Input</p>
              <pre style={{ margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: V.ink, background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 8, padding: '10px 12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.output && Object.keys(toolCall.output).length > 0 && (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Output</p>
              <pre style={{ margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: V.ink, background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 8, padding: '10px 12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.errorMessage && (
            <div style={{ background: V.redBg, border: `1px solid ${V.redBorder}`, borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: 12.5, color: V.red }}>{toolCall.errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatAccessMethod(method?: string): string | undefined {
  if (!method) return undefined
  switch (method) {
    case 'embed': return 'Embed Widget'
    case 'api': return 'Headless API'
    case 'event': return 'Event Trigger'
    case 'scheduled': return 'Scheduled'
    default: return method
  }
}
