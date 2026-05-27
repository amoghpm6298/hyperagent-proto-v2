import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Plus, Upload, X, Radio, Activity, CheckCircle, Users, Target } from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF', emeraldBorder: '#6EE7B7',
  amber: '#C2780A', amber50: '#FBF1DA', amberBorder: '#FCD34D',
  rose: '#D63B5B', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

const GRADS = [
  ['#3056F4', '#6B5BFF'], ['#0F9D6E', '#3FD49B'], ['#D63B5B', '#FF8FA3'],
  ['#C2780A', '#F5C26B'], ['#11154A', '#3056F4'], ['#6B5BFF', '#B49DFF'],
]
const grad = (name: string) => GRADS[(name.charCodeAt(0) || 0) % GRADS.length]

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 6,
}
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 32px 8px 12px', background: '#fff',
  border: '1px solid #E5E7ED', borderRadius: 10,
  fontSize: 13, color: '#0E1116', outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as React.CSSProperties['colorScheme'],
  fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
}

export function CampaignList() {
  const campaigns = useAppStore((state) => state.campaigns)
  const agents = useAppStore((state) => state.agents)
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [scheduleType, setScheduleType] = useState<'immediate' | 'later'>('immediate')
  const [scheduleDate, setScheduleDate] = useState('')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const voiceAgents = agents.filter((a) => a.channels.includes('CALL'))

  const handleCreateCampaign = () => {
    if (!campaignName.trim() || !selectedAgent || !uploadedFile) return
    const agent = agents.find((a) => a.id === selectedAgent)
    if (!agent) return
    useAppStore.setState((state) => ({
      campaigns: [{
        id: `camp_${Date.now()}`,
        name: campaignName,
        agentId: selectedAgent,
        agentName: agent.display_name,
        status: 'PENDING' as const,
        totalTargets: Math.floor(Math.random() * 500) + 100,
        completed: 0, pending: 0, failed: 0,
        startedAt: new Date().toLocaleString(),
      }, ...state.campaigns],
    }))
    setCampaignName(''); setSelectedAgent(''); setUploadedFile(null)
    setScheduleType('immediate'); setScheduleDate(''); setShowCreateModal(false)
  }

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.02em' }}>
              Campaigns
            </h1>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
              background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{campaigns.length}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7385' }}>
            Bulk outreach campaigns powered by your voice agents
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={15} /> New Campaign
        </Button>
      </div>

      {/* KPI cards */}
      {(() => {
        const active = campaigns.filter(c => c.status === 'RUNNING').length
        const totalTargets = campaigns.reduce((s, c) => s + (c.totalTargets || 0), 0)
        const totalDone = campaigns.reduce((s, c) => s + (c.completed || 0), 0)
        const pctDone = totalTargets ? Math.round((totalDone / totalTargets) * 100) : 0
        const kpis = [
          { label: 'Total Campaigns',  value: campaigns.length, icon: Activity,      accent: V.primary,  accentBg: V.primary50 },
          { label: 'Active',           value: active,           icon: Radio,         accent: V.emerald,  accentBg: V.emerald50 },
          { label: 'Total Targets',    value: totalTargets,     icon: Users,         accent: '#7C3AED',  accentBg: '#F5F3FF' },
          { label: 'Completion Rate',  value: `${pctDone}%`,    icon: Target,        accent: V.amber,    accentBg: V.amber50 },
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

      {campaigns.length === 0 ? (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18,
          padding: '64px 24px', textAlign: 'center',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
        }}>
          <Radio size={32} style={{ color: '#C8CDD8', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: V.muted, margin: '0 0 4px' }}>No campaigns yet</p>
          <p style={{ fontSize: 12, color: V.muted2, margin: 0 }}>
            Create a campaign to start bulk calling with your voice agents
          </p>
        </div>
      ) : (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
        }}>
          {/* Table header gradient accent */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(180deg, #FAFBFE, #fff)', borderBottom: `1px solid ${V.line2}` }}>
                {['Campaign', 'Agent', 'Status', 'Progress', 'Started', 'Actions'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 11, fontWeight: 700, color: V.muted2,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, i) => {
                const progress = campaign.totalTargets > 0
                  ? ((campaign.completed / campaign.totalTargets) * 100).toFixed(0)
                  : '0'
                const colors = grad(campaign.name)
                return (
                  <tr
                    key={campaign.id}
                    style={{
                      borderBottom: i < campaigns.length - 1 ? `1px solid ${V.line}` : 'none',
                      cursor: 'pointer', transition: 'background .1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    {/* Campaign name with gradient avatar */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: '#fff',
                        }}>
                          {campaign.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: V.ink, fontSize: 13 }}>{campaign.name}</span>
                      </div>
                    </td>

                    <td style={{ padding: '13px 16px', color: V.muted, fontSize: 12.5 }}>
                      {campaign.agentName}
                    </td>

                    <td style={{ padding: '13px 16px' }}>
                      <StatusBadge status={campaign.status as any} size="sm" />
                    </td>

                    {/* Gradient progress bar */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 88, height: 6, background: V.line2,
                          borderRadius: 99, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${progress}%`, height: '100%',
                            background: 'linear-gradient(90deg, #3056F4, #6B5BFF)',
                            borderRadius: 99, transition: 'width .4s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: V.muted2, minWidth: 28 }}>
                          {progress}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '13px 16px', color: V.muted, fontSize: 12.5 }}>
                      {campaign.startedAt}
                    </td>

                    <td style={{ padding: '13px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Campaign" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Campaign Name</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Q2 Retention Outreach"
            />
          </div>

          <div>
            <label style={labelStyle}>Select Voice Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={selectStyle}
            >
              <option value="">Choose an agent...</option>
              {voiceAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.display_name}</option>
              ))}
            </select>
            {voiceAgents.length === 0 && (
              <p style={{ fontSize: 11.5, color: V.amber, marginTop: 4 }}>
                No voice agents available. Create a voice agent first.
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Target List (CSV)</label>
            {uploadedFile ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: V.emerald50, border: `1px solid ${V.emeraldBorder}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 13, color: V.emerald, fontWeight: 600 }}>{uploadedFile}</span>
                <button
                  onClick={() => setUploadedFile(null)}
                  style={{ color: V.emerald, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="csv-upload"
                style={{
                  display: 'block', border: '2px dashed #D0D5E8', borderRadius: 12,
                  padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color .15s, background .15s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLLabelElement
                  el.style.borderColor = V.primary
                  el.style.background = V.primary50
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLLabelElement
                  el.style.borderColor = '#D0D5E8'
                  el.style.background = 'transparent'
                }}
              >
                <Upload size={22} style={{ color: V.muted2, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: V.muted, margin: '0 0 4px' }}>
                  Upload CSV with target phone numbers
                </p>
                <span style={{ fontSize: 12, color: V.primary, fontWeight: 700 }}>Click to browse</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f.name) }}
                  style={{ display: 'none' }}
                  id="csv-upload"
                />
              </label>
            )}
          </div>

          <div>
            <label style={labelStyle}>Schedule</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['immediate', 'later'] as const).map((val) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: V.ink }}>
                  <input
                    type="radio"
                    name="schedule"
                    value={val}
                    checked={scheduleType === val}
                    onChange={() => setScheduleType(val)}
                    style={{ colorScheme: 'light' as React.CSSProperties['colorScheme'] }}
                  />
                  {val === 'immediate' ? 'Start immediately' : 'Schedule for later'}
                </label>
              ))}
              {scheduleType === 'later' && (
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{
                    marginLeft: 22, padding: '8px 12px', background: V.canvas,
                    border: `1px solid ${V.line}`, borderRadius: 10,
                    fontSize: 13, color: V.ink,
                    colorScheme: 'light' as React.CSSProperties['colorScheme'],
                    outline: 'none',
                  }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${V.line}` }}>
            <Button onClick={() => setShowCreateModal(false)} variant="secondary">Cancel</Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={!campaignName.trim() || !selectedAgent || !uploadedFile}
            >
              Create Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
