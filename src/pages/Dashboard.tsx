import React, { useState } from 'react'
import { useAppStore } from '../store'
import { StatCard } from '../components/shared/StatCard'
import { ChannelBadge } from '../components/shared/ChannelBadge'
import { dashboardStats, activityFeed, conversations } from '../data/mock'
import { TrendingUp, Zap, Phone, MessageSquare, ArrowRight, Clock, Activity, CheckCircle, XCircle, AlertCircle, Timer, Award, Megaphone, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF',
  amber: '#C2780A', amber50: '#FBF1DA',
  rose: '#D63B5B',
}

const baseCardShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'

const GRADS: [string, string][] = [
  ['#3056F4', '#6B5BFF'], ['#0F9D6E', '#3FD49B'], ['#D63B5B', '#FF8FA3'],
  ['#C2780A', '#F5C26B'], ['#11154A', '#3056F4'], ['#6B5BFF', '#B49DFF'],
]
const agentGrad = (name: string) => GRADS[(name.charCodeAt(0) || 0) % GRADS.length]

const ACTIVITY_COLORS: Record<string, string> = {
  CALL: '#7C3AED', CHAT: '#1D4ED8', EMBED: '#065F46', API: '#92400E',
}

// Matches what the sidebar shows
const CURRENT_USER = { displayName: 'Amogh P.', firstName: 'Amogh', initials: 'AP', role: 'Admin', workspace: 'Hyperface' }

const TEMPLATES = [
  { id: 't1', letter: 'O', name: 'KYC Onboarding', channel: 'Voice', category: 'Banking', desc: 'Walks customers through identity re-verification with regulator-aligned scripts.', setup: '~3 min setup', grad: ['#3056F4', '#6B5BFF'] as [string, string] },
  { id: 't2', letter: 'R', name: 'Recovery Concierge', channel: 'Voice', category: 'Lending', desc: 'Polite collections agent for B1-B3 buckets with payment-link drop and dispute handling.', setup: '~5 min setup', grad: ['#0F9D6E', '#3FD49B'] as [string, string] },
  { id: 't3', letter: 'C', name: 'Card Activation', channel: 'Omni', category: 'Cards', desc: 'Activate, set PIN, and troubleshoot. Handles OTP and links to delivery tracking.', setup: '~4 min setup', grad: ['#C2780A', '#F5C26B'] as [string, string] },
  { id: 't4', letter: 'L', name: 'Loan Pre-qualification', channel: 'Voice', category: 'Sales', desc: 'Pre-qualifies customers for personal & home loans using salary and bureau data.', setup: '~6 min setup', grad: ['#11154A', '#3056F4'] as [string, string] },
  { id: 't5', letter: 'S', name: 'L1 Support', channel: 'Chat', category: 'Support', desc: 'First-line support that handles FAQs, escalates complex queries, and logs tickets.', setup: '~2 min setup', grad: ['#6B5BFF', '#B49DFF'] as [string, string] },
  { id: 't6', letter: '+', name: 'Blank canvas', channel: 'Any', category: '', desc: 'Start with a clean slate. Wire up any channel, tools, and model parameters yourself.', setup: '0 min setup', grad: ['#9AA1B2', '#6B7385'] as [string, string] },
]

const PREVIEW_AGENTS = [
  { letter: 'O', name: 'Onboarding Agent', tags: 'Voice · KYC + Compliance', grad: ['#3056F4', '#6B5BFF'] as [string, string], waveColor: '#3056F4', floatCls: 'float-1' },
  { letter: 'R', name: 'Recovery Concierge', tags: 'Voice · Collections', grad: ['#0F9D6E', '#3FD49B'] as [string, string], waveColor: '#0F9D6E', floatCls: 'float-2' },
  { letter: 'C', name: 'Card Activation', tags: 'Omni · Customer Support', grad: ['#C2780A', '#F5C26B'] as [string, string], waveColor: '#C2780A', floatCls: 'float-3' },
]

function invocationLabel(channels: string[]) {
  const hasCall = channels.includes('CALL')
  const hasChat = channels.includes('CHAT')
  if (hasCall && hasChat) return 'invocations today'
  if (hasCall) return 'calls today'
  return 'sessions today'
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') return <CheckCircle size={13} style={{ color: V.emerald, flexShrink: 0 }} />
  if (status === 'FAILED') return <XCircle size={13} style={{ color: V.rose, flexShrink: 0 }} />
  if (status === 'ACTIVE') return <AlertCircle size={13} style={{ color: V.primary, flexShrink: 0 }} />
  return <AlertCircle size={13} style={{ color: V.muted2, flexShrink: 0 }} />
}

function statusColor(status: string) {
  if (status === 'COMPLETED') return V.emerald
  if (status === 'FAILED') return V.rose
  if (status === 'ACTIVE') return V.primary
  return V.muted2
}

const WAVE_CLASSES = ['wave-a', 'wave-b', 'wave-c', 'wave-d', 'wave-e']
const WAVE_HEIGHTS = [3, 7, 11, 5, 14, 9, 16, 7, 11, 4, 8, 13, 6, 10, 5, 12, 8, 14, 7, 11]

function AnimatedWaveform({ color }: { color: string }) {
  return (
    <div style={{ padding: '3px 0 3px 10px', opacity: 0.55 }}>
      <svg width="120" height="18" viewBox="0 0 120 18" style={{ display: 'block', overflow: 'visible' }}>
        {WAVE_HEIGHTS.map((h, i) => (
          <rect
            key={i}
            x={i * 6 + 1} y={(18 - h) / 2}
            width={4} height={h} rx={2}
            fill={color}
            className={WAVE_CLASSES[i % 5]}
            style={{ transformOrigin: `${i * 6 + 3}px 9px` }}
          />
        ))}
      </svg>
    </div>
  )
}

function EmptyDashboard() {
  return (
    <div>
      <style>{`
        @keyframes livePulse {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes waveAnim {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.2); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes gradShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .wave-a { animation: waveAnim 0.85s ease-in-out infinite; }
        .wave-b { animation: waveAnim 1.10s ease-in-out 0.12s infinite; }
        .wave-c { animation: waveAnim 0.70s ease-in-out 0.28s infinite; }
        .wave-d { animation: waveAnim 1.30s ease-in-out 0.07s infinite; }
        .wave-e { animation: waveAnim 0.95s ease-in-out 0.40s infinite; }
        .float-1 { animation: floatY 4.2s ease-in-out infinite; }
        .float-2 { animation: floatY 4.2s ease-in-out 0.7s infinite; }
        .float-3 { animation: floatY 4.2s ease-in-out 1.4s infinite; }
        .live-ring {
          position: absolute; inset: -3px; border-radius: 50%;
          background: #0F9D6E;
          animation: livePulse 2.6s ease-out infinite;
        }
        .create-btn:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 12px 32px -4px rgba(48,86,244,0.55) !important; }
        .create-btn { transition: opacity .18s, transform .18s, box-shadow .18s; }
        .tmpl-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(17,21,74,0.10) !important; }
        .tmpl-card { transition: transform .2s, box-shadow .2s; }
      `}</style>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#F3F4FF',
        backgroundImage: [
          'radial-gradient(circle, rgba(48,86,244,0.07) 1px, transparent 1px)',
          'radial-gradient(ellipse 820px 620px at 92% 15%, rgba(107,91,255,0.18) 0%, transparent 65%)',
          'radial-gradient(ellipse 500px 500px at 5% 90%, rgba(15,157,110,0.08) 0%, transparent 65%)',
          'radial-gradient(ellipse 350px 350px at 45% 5%, rgba(48,86,244,0.09) 0%, transparent 65%)',
        ].join(', '),
        backgroundSize: '28px 28px, auto, auto, auto',
        padding: '72px 64px 60px',
        display: 'grid',
        gridTemplateColumns: '1fr 430px',
        gap: 56,
        alignItems: 'center',
        minHeight: 420,
      }}>

        {/* Left content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(48,86,244,0.08)', border: '1px solid rgba(48,86,244,0.15)',
            fontSize: 10.5, fontWeight: 700, color: V.primary, letterSpacing: '0.07em',
            textTransform: 'uppercase', marginBottom: 22,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: V.emerald }} />
            {CURRENT_USER.workspace} workspace · Agents
          </div>

          <h1 style={{ margin: '0 0 18px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            <span style={{
              fontSize: 48, fontWeight: 900, letterSpacing: '-0.035em',
              background: 'linear-gradient(130deg, #0E1116 10%, #3056F4 55%, #6B5BFF 90%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline',
              fontFamily: "'Manrope', ui-sans-serif, sans-serif",
            }}>Welcome, {CURRENT_USER.firstName}. </span>
            <span style={{
              fontSize: 46, fontWeight: 400, fontStyle: 'italic',
              fontFamily: "'Instrument Serif', Georgia, serif",
              color: V.muted, display: 'inline',
            }}>Build your first agent in ~5 minutes</span>
          </h1>

          <p style={{ margin: '0 0 32px', fontSize: 15, color: V.muted, lineHeight: 1.7, maxWidth: 480 }}>
            Create one from scratch, or start from a template below.<br />
            Anyone in the workspace can edit, test, and ship from here.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <Link
              to="/agents"
              className="create-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 26px', borderRadius: 12,
                background: 'linear-gradient(135deg, #3056F4 0%, #6B5BFF 100%)',
                color: '#fff', fontSize: 14.5, fontWeight: 700, textDecoration: 'none',
                letterSpacing: '-0.01em',
                boxShadow: '0 8px 24px -4px rgba(48,86,244,0.45), 0 2px 6px rgba(107,91,255,0.2)',
              }}
            >
              <Plus size={16} /> Create agent
            </Link>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 26px', borderRadius: 12,
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: V.ink, fontSize: 14.5, fontWeight: 700,
              border: `1.5px solid rgba(14,17,22,0.12)`, cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}>
              Browse templates
            </button>
          </div>

          {/* Platform stats strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: V.muted2 }}>
            <span><strong style={{ color: V.ink, fontWeight: 700 }}>10,847</strong> API calls today</span>
            <span style={{ color: V.line, padding: '0 4px' }}>·</span>
            <span><strong style={{ color: V.ink, fontWeight: 700 }}>94%</strong> success rate</span>
            <span style={{ color: V.line, padding: '0 4px' }}>·</span>
            <span><strong style={{ color: V.ink, fontWeight: 700 }}>1.2s</strong> avg latency</span>
          </div>
        </div>

        {/* Right — diagonal cascade stack */}
        <div style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>

          {PREVIEW_AGENTS.map((agent, i) => (
            <React.Fragment key={agent.name}>
              {/* Card */}
              <div
                className={agent.floatCls}
                style={{
                  marginLeft: i * 52,
                  position: 'relative',
                  zIndex: i + 1,
                  background: 'rgba(255,255,255,0.94)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 18,
                  padding: '15px 18px',
                  boxShadow: '0 4px 28px rgba(17,21,74,0.13), 0 1px 6px rgba(17,21,74,0.07)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${agent.grad[0]}, ${agent.grad[1]})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 19,
                  boxShadow: `0 6px 18px -3px ${agent.grad[0]}80`,
                }}>{agent.letter}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink }}>{agent.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: V.muted }}>{agent.tags}</p>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  padding: '5px 12px 5px 10px', borderRadius: 999,
                  background: 'rgba(15,157,110,0.10)', fontSize: 11.5, fontWeight: 700, color: V.emerald,
                }}>
                  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 8, height: 8 }}>
                    <span className="live-ring" />
                    <span style={{ position: 'relative', width: 6, height: 6, borderRadius: '50%', background: V.emerald, display: 'block', zIndex: 1 }} />
                  </span>
                  LIVE
                </div>
              </div>
              {/* Waveform sits in the stair-step gap, left-aligned to current card */}
              <div style={{ marginLeft: i * 52 + 12 }}>
                <AnimatedWaveform color={agent.waveColor} />
              </div>
            </React.Fragment>
          ))}

          {/* Placeholder */}
          <div style={{
            marginLeft: PREVIEW_AGENTS.length * 52,
            position: 'relative',
            zIndex: PREVIEW_AGENTS.length + 1,
            border: `1.5px dashed rgba(48,86,244,0.35)`,
            borderRadius: 18, padding: '15px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(238,241,254,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(48,86,244,0.07)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              border: `1.5px dashed rgba(48,86,244,0.4)`, background: 'rgba(238,241,254,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: V.primary, fontSize: 26, fontWeight: 300,
            }}>+</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontStyle: 'italic', color: V.primary, fontWeight: 600, fontFamily: "'Instrument Serif', Georgia, serif" }}>Your first agent</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: V.muted2 }}>Lives here in just a few minutes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Templates ── */}
      <div style={{ padding: '56px 64px 72px', background: V.bg }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: V.muted2, letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>TEMPLATES</p>
            <h2 style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 700, color: V.ink, letterSpacing: '-0.015em' }}>Start from a template</h2>
            <p style={{ margin: 0, fontSize: 14, color: V.muted, lineHeight: 1.65 }}>
              Pre-configured prompts, voice, and tool wiring for common workflows.<br />
              Edit anything before you ship.
            </p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 600, color: V.primary,
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', marginTop: 6, padding: 0,
          }}>
            Browse all templates <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {TEMPLATES.map(t => (
            <div key={t.id} className="tmpl-card" style={{
              background: V.canvas, borderRadius: 18, padding: '24px 24px 20px',
              border: `1px solid ${V.line}`,
              boxShadow: baseCardShadow,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 15,
                  background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 20,
                  boxShadow: `0 6px 16px -4px ${t.grad[0]}60`,
                }}>{t.letter}</div>
                <div style={{
                  padding: '4px 11px', borderRadius: 9, background: V.bg,
                  fontSize: 11.5, fontWeight: 600, color: V.muted2, whiteSpace: 'nowrap',
                }}>{t.channel}{t.category ? ` · ${t.category}` : ''}</div>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 15.5, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>{t.name}</p>
              <p style={{ margin: '0 0 20px', fontSize: 13.5, color: V.muted, lineHeight: 1.55, flex: 1 }}>{t.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${V.line2}`, paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: V.muted2 }}>
                  <Clock size={12} /> {t.setup}
                </div>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 13.5, fontWeight: 700, color: V.primary,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  Use this <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [showEmpty, setShowEmpty] = useState(false)
  const agents = useAppStore((state) => state.agents)
  const topAgents = [...agents]
    .sort((a, b) => (b.invocationsToday ?? 0) - (a.invocationsToday ?? 0))
    .slice(0, 5)

  const recentInvocations = [...conversations]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8)

  const activeCampaigns = 3
  const avgLatency = '1.2s'
  const successRate = '94%'
  const avgQuality = 87

  const toggleBtn = (
    <button
      onClick={() => setShowEmpty(v => !v)}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 200,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 16px', borderRadius: 999,
        background: V.ink2, color: '#fff',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
        boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {showEmpty ? '← Back to dashboard' : 'Preview: empty state'}
    </button>
  )

  if (showEmpty) {
    return (
      <div style={{ fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
        {toggleBtn}
        <EmptyDashboard />
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {toggleBtn}

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>Overview</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: V.muted }}>Monitor your AI agents and platform activity</p>
      </div>

      {/* ── Stats Row 1 — Volume ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard icon={Zap}           label="Active Agents"   value={dashboardStats.activeAgents}                    change={{ value: 25, direction: 'up' }}   accent="#3056F4" accentBg="#EEF1FE" />
        <StatCard icon={TrendingUp}    label="API Calls (24h)" value={dashboardStats.apiCallsToday.toLocaleString()}  change={{ value: 12, direction: 'up' }}   accent="#0F9D6E" accentBg="#E6F6EF" />
        <StatCard icon={Phone}         label="Voice Calls"     value={dashboardStats.voiceCallsToday}                 change={{ value: 8,  direction: 'down' }}  accent="#7C3AED" accentBg="#F5F3FF" />
        <StatCard icon={MessageSquare} label="Sessions (24h)"  value={dashboardStats.embedSessionsToday || 234}       change={{ value: 35, direction: 'up' }}   accent="#1D4ED8" accentBg="#EFF6FF" />
      </div>

      {/* ── Stats Row 2 — Quality ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard icon={CheckCircle}   label="Success Rate"       value={successRate}         change={{ value: 2,  direction: 'up' }}   accent="#0F9D6E" accentBg="#E6F6EF" />
        <StatCard icon={Timer}         label="Avg Response Time"  value={avgLatency}                                                    accent="#0891B2" accentBg="#ECFEFF" />
        <StatCard icon={Award}         label="Avg Quality Score"  value={`${avgQuality}/100`} change={{ value: 3,  direction: 'up' }}   accent="#C2780A" accentBg="#FBF1DA" />
        <StatCard icon={Megaphone}     label="Active Campaigns"   value={activeCampaigns}     change={{ value: 1,  direction: 'up' }}   accent="#7C3AED" accentBg="#F5F3FF" />
      </div>

      {/* ── Top Agents + Activity Feed ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'stretch', marginBottom: 20 }}>

        {/* Top Agents */}
        <div style={{ background: V.canvas, borderRadius: 18, border: `1px solid ${V.line}`, boxShadow: baseCardShadow, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />
          <div style={{
            padding: '13px 20px', borderBottom: `1px solid ${V.line2}`,
            background: 'linear-gradient(180deg, #FAFBFE, #fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: V.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={15} style={{ color: V.primary }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Top Agents</p>
                <p style={{ margin: '1px 0 0', fontSize: 11.5, color: V.muted }}>Most active in last 24h</p>
              </div>
            </div>
            <Link to="/agents" style={{ fontSize: 12.5, fontWeight: 600, color: V.primary, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {topAgents.map((agent, i) => {
              const [g1, g2] = agentGrad(agent.display_name)
              const label = invocationLabel(agent.channels)
              return (
                <Link key={agent.id} to={`/agents/${agent.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', textDecoration: 'none', borderBottom: i < topAgents.length - 1 ? `1px solid ${V.line2}` : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = V.bg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em', boxShadow: '0 3px 8px -2px rgba(17,21,74,0.18)' }}>
                      {agent.display_name[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: V.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.display_name}</p>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                        {agent.channels.slice(0, 3).map((ch) => <ChannelBadge key={ch} channel={ch} size="sm" />)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>{agent.invocationsToday?.toLocaleString()}</p>
                    <p style={{ margin: '1px 0 0', fontSize: 10.5, color: V.muted2 }}>{label}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: V.canvas, borderRadius: 18, border: `1px solid ${V.line}`, boxShadow: baseCardShadow, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #C2780A 0%, #F5C26B 60%, #3056F4 100%)' }} />
          <div style={{ padding: '13px 20px', borderBottom: `1px solid ${V.line2}`, background: 'linear-gradient(180deg, #FAFBFE, #fff)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#FBF1DA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={15} style={{ color: V.amber }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Activity</p>
              <p style={{ margin: '1px 0 0', fontSize: 11.5, color: V.muted }}>Recent platform events</p>
            </div>
          </div>
          <div>
            {activityFeed.slice(0, 5).map((item, i) => {
              const dotColor = ACTIVITY_COLORS[item.channel] || V.primary
              return (
                <div key={item.id} style={{ padding: '9px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: i < 4 ? `1px solid ${V.line2}` : 'none' }}>
                  <div style={{ marginTop: 4, flexShrink: 0, position: 'relative' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
                    {i < 4 && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 1, height: 22, background: V.line }} />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: V.ink, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                      <ChannelBadge channel={item.channel} size="sm" />
                      <span style={{ fontSize: 10.5, color: V.muted2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={9} /> {item.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Invocations ── */}
      <div style={{ background: V.canvas, borderRadius: 18, border: `1px solid ${V.line}`, boxShadow: baseCardShadow, overflow: 'hidden' }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #7C3AED 0%, #3056F4 50%, #0891B2 100%)' }} />
        <div style={{
          padding: '16px 22px', borderBottom: `1px solid ${V.line}`,
          background: 'linear-gradient(180deg, #FAFBFE, #fff)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Recent Invocations</p>
              <p style={{ margin: '1px 0 0', fontSize: 11.5, color: V.muted }}>Latest conversations across all agents</p>
            </div>
          </div>
          <Link to="/invocations" style={{ fontSize: 12.5, fontWeight: 600, color: V.primary, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 120px', gap: 0, padding: '8px 22px', background: V.bg, borderBottom: `1px solid ${V.line}` }}>
          {['Agent', 'Channel', 'Status', 'Duration', 'Time'].map(h => (
            <span key={h} style={{ fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>
        {recentInvocations.map((conv, i) => (
          <Link key={conv.id} to={`/invocations/${conv.id}`}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 120px', gap: 0, padding: '12px 22px', textDecoration: 'none', borderBottom: i < recentInvocations.length - 1 ? `1px solid ${V.line}` : 'none', transition: 'background .15s', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = V.bg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {(() => {
                const [g1, g2] = agentGrad(conv.agent)
                return (
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11 }}>
                    {conv.agent[0]?.toUpperCase()}
                  </div>
                )
              })()}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: V.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.agent}</span>
            </div>
            <div><ChannelBadge channel={conv.channel} size="sm" /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <StatusIcon status={conv.status} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: statusColor(conv.status) }}>
                {conv.status === 'COMPLETED' ? 'Done' : conv.status === 'ACTIVE' ? 'Live' : conv.status === 'FAILED' ? 'Failed' : conv.status}
              </span>
            </div>
            <span style={{ fontSize: 12, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>{conv.duration}</span>
            <span style={{ fontSize: 11.5, color: V.muted2 }}>{conv.timestamp}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
