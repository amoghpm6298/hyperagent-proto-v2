import React from 'react'
import { Agent } from '../../../types'
import { Badge } from '../../../components/ui/Badge'
import {
  TrendingUp, TrendingDown, Minus, BarChart2,
  Clock, Users, Zap, Shield, MessageSquare, ArrowUpRight,
} from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF',
  amber: '#C2780A', amber50: '#FBF1DA',
  rose: '#D63B5B', redBg: '#FEF2F2',
  violet: '#7C3AED', violet50: '#F5F3FF',
  blue: '#1D4ED8', blue50: '#EFF6FF',
}

const baseCardShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'

const cardHeader = (title: string, sub?: string) => (
  <div style={{
    padding: '12px 18px',
    background: 'linear-gradient(180deg, #FAFBFE, #fff)',
    borderBottom: `1px solid ${V.line2}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>{title}</h3>
      {sub && <p style={{ margin: '1px 0 0', fontSize: 11, color: V.muted2 }}>{sub}</p>}
    </div>
  </div>
)

export function AnalyticsTab({ agent }: { agent: Agent }) {
  if (agent.invocationsToday === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: V.bg, border: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <BarChart2 size={22} style={{ color: '#C8CDD8' }} strokeWidth={1.5} />
        </div>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: V.ink }}>No analytics yet</p>
        <p style={{ margin: 0, fontSize: 13, color: V.muted, maxWidth: 320, lineHeight: 1.5 }}>
          Analytics will appear here once this agent starts receiving invocations.
          {agent.status === 'DRAFT' && ' Publish the agent to start collecting data.'}
        </p>
      </div>
    )
  }

  const isCall = agent.channels.includes('CALL')

  // 7-day invocation data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const invMultipliers = [0.85, 1.03, 0.95, 1.15, 0.98, 0.99, 0.71]
  const weeklyTrend = days.map((day, i) => ({
    day,
    count: Math.max(1, Math.round(agent.invocationsToday * invMultipliers[i])),
  }))
  const weeklyTotal = weeklyTrend.reduce((s, d) => s + d.count, 0)
  const maxCount = Math.max(...weeklyTrend.map(w => w.count))

  // 7-day quality trend
  const baseQuality = isCall ? 71 : 78
  const qualMultipliers = [0.91, 0.94, 0.93, 0.96, 0.97, 0.95, 1.0]
  const qualityTrend = days.map((day, i) => ({
    day,
    score: Math.round(baseQuality * qualMultipliers[i]),
  }))
  const minQual = Math.min(...qualityTrend.map(q => q.score)) - 3
  const maxQual = Math.max(...qualityTrend.map(q => q.score)) + 3

  // Primary metric cards
  const primaryMetrics = [
    {
      label: 'Invocations (7d)', value: weeklyTotal.toLocaleString(),
      delta: '+12%', dir: 'up' as const, sub: 'vs prev week',
      accent: V.primary, accentBg: V.primary50,
    },
    {
      label: isCall ? 'Connect Rate' : 'Resolution Rate',
      value: isCall ? '78.4%' : '94.5%',
      delta: isCall ? '−2.1%' : '−1.2%', dir: 'down' as const, sub: 'vs prev week',
      accent: V.rose, accentBg: V.redBg,
    },
    {
      label: isCall ? 'Avg Call Score' : 'Avg Quality',
      value: isCall ? '71 / 100' : '78 / 100',
      delta: '+4 pts', dir: 'up' as const, sub: 'vs prev week',
      accent: V.emerald, accentBg: V.emerald50,
    },
    {
      label: isCall ? 'Escalation Rate' : 'Handoff Rate',
      value: isCall ? '6.2%' : '4.8%',
      delta: isCall ? '−1.4%' : '−0.7%', dir: 'down' as const, sub: 'good — fewer escalations',
      accent: V.amber, accentBg: V.amber50,
    },
  ]

  // Secondary KPI strip
  const secondaryMetrics = isCall
    ? [
        { label: 'Avg Handle Time',      value: '3m 22s', icon: Clock,        color: V.violet, bg: V.violet50 },
        { label: 'First Call Resolution', value: '71.8%',  icon: Shield,       color: V.emerald, bg: V.emerald50 },
        { label: 'Barge-In Rate',         value: '14.3%',  icon: Zap,          color: V.amber, bg: V.amber50 },
        { label: 'Repeat Callers',        value: '8.9%',   icon: Users,        color: V.rose, bg: V.redBg },
      ]
    : [
        { label: 'Avg Session Duration',   value: '4m 48s', icon: Clock,        color: V.violet, bg: V.violet50 },
        { label: 'Avg Messages / Session', value: '9.4',    icon: MessageSquare, color: V.emerald, bg: V.emerald50 },
        { label: 'Median Response Time',   value: '1.2s',   icon: Zap,          color: V.amber, bg: V.amber50 },
        { label: 'Return Visitors',        value: '23.1%',  icon: Users,        color: V.blue, bg: V.blue50 },
      ]

  // Quality distribution buckets
  const qualityBuckets = isCall
    ? [
        { label: 'Excellent', range: '90–100', pct: 28, color: '#10B981', dark: '#059669' },
        { label: 'Good',      range: '70–89',  pct: 44, color: '#3B82F6', dark: '#2563EB' },
        { label: 'Fair',      range: '50–69',  pct: 18, color: '#F59E0B', dark: '#D97706' },
        { label: 'Poor',      range: '< 50',   pct: 10, color: '#EF4444', dark: '#DC2626' },
      ]
    : [
        { label: 'Excellent', range: '90–100', pct: 34, color: '#10B981', dark: '#059669' },
        { label: 'Good',      range: '70–89',  pct: 47, color: '#3B82F6', dark: '#2563EB' },
        { label: 'Fair',      range: '50–69',  pct: 14, color: '#F59E0B', dark: '#D97706' },
        { label: 'Poor',      range: '< 50',   pct: 5,  color: '#EF4444', dark: '#DC2626' },
      ]

  // Outcome / intent breakdown
  const outcomeBreakdown = isCall
    ? [
        { label: 'Resolved by AI',       pct: 72, color: '#10B981', dark: '#059669' },
        { label: 'Human Escalated',       pct: 14, color: '#F59E0B', dark: '#D97706' },
        { label: 'Call Dropped',          pct: 10, color: '#EF4444', dark: '#DC2626' },
        { label: 'Voicemail',             pct: 4,  color: '#9CA3AF', dark: '#6B7280' },
      ]
    : [
        { label: 'Account Balance',       pct: 34, color: '#3056F4', dark: '#1F3FE0' },
        { label: 'Loan Eligibility',      pct: 22, color: '#7C3AED', dark: '#6D28D9' },
        { label: 'Credit Card Info',      pct: 18, color: '#3B82F6', dark: '#2563EB' },
        { label: 'Transaction Queries',   pct: 14, color: '#10B981', dark: '#059669' },
        { label: 'Other / Unresolved',    pct: 12, color: '#9CA3AF', dark: '#6B7280' },
      ]

  // Peak hours (6 blocks)
  const peakBlocks = isCall
    ? [
        { label: '12–6 AM', sub: 'Late Night', pct: 4  },
        { label: '6–9 AM',  sub: 'Morning',    pct: 22 },
        { label: '9 AM–12', sub: 'Mid-Morning', pct: 38 },
        { label: '12–4 PM', sub: 'Afternoon',  pct: 48 },
        { label: '4–8 PM',  sub: 'Evening',    pct: 30 },
        { label: '8 PM–12', sub: 'Night',      pct: 11 },
      ]
    : [
        { label: '12–6 AM', sub: 'Late Night', pct: 2  },
        { label: '6–9 AM',  sub: 'Morning',    pct: 12 },
        { label: '9 AM–12', sub: 'Mid-Morning', pct: 34 },
        { label: '12–4 PM', sub: 'Afternoon',  pct: 44 },
        { label: '4–8 PM',  sub: 'Evening',    pct: 36 },
        { label: '8 PM–12', sub: 'Night',      pct: 9  },
      ]
  const maxPeak = Math.max(...peakBlocks.map(b => b.pct))

  // SVG quality trend line
  const svgW = 280, svgH = 90, padX = 6, padY = 10
  const pts = qualityTrend.map((q, i) => {
    const x = padX + (i / (qualityTrend.length - 1)) * (svgW - padX * 2)
    const y = padY + (1 - (q.score - minQual) / (maxQual - minQual)) * (svgH - padY * 2)
    return { x, y, ...q }
  })
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${svgH} L${pts[0].x.toFixed(1)},${svgH} Z`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Primary KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {primaryMetrics.map((m) => {
          const isUp = m.dir === 'up', isDown = m.dir === 'down'
          const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
          const trendColor = isUp ? V.emerald : isDown ? V.rose : V.muted2
          return (
            <div key={m.label} style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 16, padding: '14px 16px', boxShadow: baseCardShadow }}>
              <p style={{ margin: '0 0 6px', fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</p>
              <p style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: V.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.value}</p>
              <div style={{ width: '100%', height: 3, borderRadius: 99, background: V.line2, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: isUp ? '72%' : isDown ? '28%' : '50%',
                  background: isUp
                    ? `linear-gradient(90deg, ${V.emerald}, #3FD49B)`
                    : isDown
                      ? `linear-gradient(90deg, ${V.rose}, #FF7A93)`
                      : `linear-gradient(90deg, ${V.muted2}, #6B7280)`,
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendIcon size={11} style={{ color: trendColor }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: trendColor }}>{m.delta}</span>
                <span style={{ fontSize: 10.5, color: V.muted2 }}>{m.sub}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Secondary KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {secondaryMetrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} style={{
              background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 14,
              padding: '12px 14px', boxShadow: baseCardShadow,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} style={{ color: m.color }} strokeWidth={2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: V.ink, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{m.value}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10.5, color: V.muted2, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 7-day invocation trend */}
      <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
        {cardHeader('Invocation Volume — Last 7 Days', `${weeklyTotal.toLocaleString()} total · daily avg ${Math.round(weeklyTotal / 7).toLocaleString()}`)}
        <div style={{ padding: '16px 18px' }}>
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {weeklyTrend.map((item, i) => {
              const isToday = i === weeklyTrend.length - 1
              return (
                <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 10.5, color: isToday ? V.primary : V.muted2, fontWeight: 700, letterSpacing: '-0.02em' }}>{item.count.toLocaleString()}</span>
                  <div
                    style={{
                      width: '100%',
                      background: isToday
                        ? `linear-gradient(180deg, ${V.primary}, ${V.primary2})`
                        : `linear-gradient(180deg, #8BA4F9, #A8B8FC)`,
                      borderRadius: '5px 5px 0 0',
                      height: `${(item.count / maxCount) * 100}%`,
                      minHeight: 6,
                      opacity: isToday ? 1 : 0.7,
                      transition: 'opacity .15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = isToday ? '1' : '0.7' }}
                    title={`${item.day}: ${item.count.toLocaleString()}`}
                  />
                  <span style={{ fontSize: 10.5, color: isToday ? V.primary : V.muted2, fontWeight: isToday ? 700 : 400 }}>{item.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Middle row: Quality Distribution | Outcome Breakdown | Quality Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'start' }}>

        {/* Quality Score Distribution */}
        <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
          {cardHeader('Quality Score Distribution', 'Last 7 days')}
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
            {qualityBuckets.map((b) => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: V.ink, fontWeight: 600 }}>{b.label}</span>
                  <span style={{ fontSize: 11, color: V.muted2 }}>{b.range} · <strong style={{ color: V.ink }}>{b.pct}%</strong></span>
                </div>
                <div style={{ width: '100%', background: V.bg, borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${b.color}, ${b.dark})`, width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome / Intent Breakdown */}
        <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
          {cardHeader(isCall ? 'Call Outcome Breakdown' : 'Top User Intents', 'Last 7 days')}
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
            {outcomeBreakdown.map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: V.ink, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: V.ink }}>{item.pct}%</span>
                </div>
                <div style={{ width: '100%', background: V.bg, borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${item.color}, ${item.dark})`, width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Score Trend (SVG line) */}
        <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
          {cardHeader('Quality Score Trend', 'Daily avg over last 7 days')}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: V.ink, letterSpacing: '-0.03em' }}>{qualityTrend[qualityTrend.length - 1].score}</span>
              <span style={{ fontSize: 12, color: V.muted2 }}>/ 100 today</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                <TrendingUp size={12} style={{ color: V.emerald }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: V.emerald }}>+{qualityTrend[qualityTrend.length - 1].score - qualityTrend[0].score} pts</span>
              </div>
            </div>
            <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={V.primary} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={V.primary} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#qualGrad)" />
              <path d={linePath} fill="none" stroke={V.primary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={V.canvas} stroke={V.primary} strokeWidth="1.5" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {qualityTrend.map((q) => (
                <span key={q.day} style={{ fontSize: 9.5, color: V.muted2 }}>{q.day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Peak Hours + Channel Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>

        {/* Peak Traffic Hours */}
        <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
          {cardHeader('Peak Traffic Hours', 'Distribution of sessions by time of day')}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
              {peakBlocks.map((b) => {
                const isPeak = b.pct === maxPeak
                return (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: isPeak ? V.primary : V.muted2 }}>{b.pct}%</span>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: isPeak
                        ? `linear-gradient(180deg, ${V.primary}, ${V.primary2})`
                        : `linear-gradient(180deg, #C8D2FB, #DCE2FE)`,
                      height: `${(b.pct / maxPeak) * 100}%`,
                      minHeight: 4,
                    }} title={`${b.sub}: ${b.pct}%`} />
                    <span style={{ fontSize: 9, color: isPeak ? V.primary : V.muted2, fontWeight: isPeak ? 700 : 400, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{b.label}</span>
                  </div>
                )
              })}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 11, color: V.muted2 }}>
              Peak: <strong style={{ color: V.ink }}>{peakBlocks.find(b => b.pct === maxPeak)?.sub}</strong> ({peakBlocks.find(b => b.pct === maxPeak)?.label})
            </p>
          </div>
        </div>

        {/* Channel & Volume Health */}
        <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
          {cardHeader('Performance Health', isCall ? 'Key call quality signals' : 'Key conversation signals')}
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(isCall
              ? [
                  { label: 'Avg Ring Time before Connect', value: '8.2s',  good: true  },
                  { label: 'Avg Silence / Dead Air',       value: '4.1s',  good: false },
                  { label: 'Calls with Tool Use',          value: '41%',   good: true  },
                  { label: 'Calls Ending in Resolution',   value: '72%',   good: true  },
                  { label: 'Voicemail Rate',               value: '4.0%',  good: true  },
                  { label: 'Avg TTS Latency',              value: '380ms', good: true  },
                ]
              : [
                  { label: 'Avg First Response Time',      value: '1.2s',  good: true  },
                  { label: 'Sessions with Tool Use',       value: '38%',   good: true  },
                  { label: 'Sessions Resolved by AI',      value: '94.5%', good: true  },
                  { label: 'Avg LLM Latency',              value: '920ms', good: true  },
                  { label: 'Human Handoff Rate',           value: '4.8%',  good: true  },
                  { label: 'Knowledge Base Hit Rate',      value: '67%',   good: true  },
                ]
            ).map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${V.line2}` : 'none',
              }}>
                <span style={{ fontSize: 12, color: V.muted }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: V.ink }}>{row.value}</span>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: row.good ? V.emerald : V.rose,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
