import React, { useState, useEffect, useRef } from 'react'
import { Conversation } from '../../types'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116',
  muted: '#6B7385', subtle: '#9AA1B2', border: '#E5E7ED',
  primary: '#3056F4', primaryBg: '#EEF1FE', primaryBorder: '#C8D2FB',
  emerald: '#0F9D6E', emeraldBg: '#ECFDF5', emeraldBorder: '#6EE7B7',
  amber: '#D97706', amberBg: '#FFFBEB', amberBorder: '#FCD34D',
  red: '#DC2626', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function dateToSec(ts: string): number {
  const m = ts.match(/(\d{2}):(\d{2}):(\d{2})/)
  if (!m) return 0
  return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3])
}

export function ConversationReplay({ conversation }: { conversation: Conversation }) {
  const transcript = conversation.callTranscript ?? []
  const toolCalls = conversation.toolCalls ?? []
  const sentimentTrend = conversation.sentimentTrend ?? []
  const totalSec = conversation.durationMs
    ? conversation.durationMs / 1000
    : (transcript.at(-1)?.startTime ?? 60) + 8

  // Compute relative seconds for each tool call
  const callStartSec = conversation.startTime ? dateToSec(conversation.startTime) : 0
  const toolsWithSec = toolCalls.map((tc, i, arr) => {
    const sec = conversation.startTime
      ? Math.max(0, dateToSec(tc.timestamp) - callStartSec)
      : (totalSec * (i + 1)) / (arr.length + 1)
    return { ...tc, sec }
  })

  const [playhead, setPlayhead] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<1 | 2>(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  const didScrollRef = useRef(-1)

  // Playback engine
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setPlayhead(p => {
          const next = parseFloat((p + 0.1 * speed).toFixed(2))
          if (next >= totalSec) { setIsPlaying(false); return totalSec }
          return next
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, speed, totalSec])

  // Auto-scroll active message into view (at turn boundaries)
  const activeIdx = transcript.reduce((best, msg, i) => msg.startTime <= playhead ? i : best, -1)
  useEffect(() => {
    if (activeIdx !== didScrollRef.current) {
      didScrollRef.current = activeIdx
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeIdx])

  const pct = totalSec > 0 ? (playhead / totalSec) * 100 : 0
  const firedTools = toolsWithSec.filter(tc => tc.sec <= playhead)

  // Sentiment interpolation
  const sentVal = (() => {
    if (!sentimentTrend.length) return null
    const idx = (playhead / totalSec) * (sentimentTrend.length - 1)
    const lo = Math.floor(idx), hi = Math.ceil(idx)
    const t = idx - lo
    return lo === hi ? sentimentTrend[lo] : sentimentTrend[lo] * (1 - t) + sentimentTrend[hi] * t
  })()

  const sentLabel = sentVal === null ? '' : sentVal >= 0.6 ? 'Positive' : sentVal >= 0.35 ? 'Neutral' : 'Negative'
  const sentColor = sentVal === null ? V.subtle : sentVal >= 0.6 ? V.emerald : sentVal >= 0.35 ? V.amber : V.red

  // SVG sparkline path (viewBox 0 0 100 30)
  const SVG_W = 100, SVG_H = 30
  const sparkPath = sentimentTrend.length > 1
    ? sentimentTrend.map((v, i) => {
        const x = (i / (sentimentTrend.length - 1)) * SVG_W
        const y = SVG_H - v * SVG_H * 0.75 - SVG_H * 0.1
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      }).join(' ')
    : ''


  if (!transcript.length) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: V.subtle, fontSize: 13 }}>
      No transcript available for replay.
    </div>
  )

  return (
    <div style={{ fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      <style>{`
        @keyframes ha-tc-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Player bar ───────────────────────────────────────────── */}
      <div style={{
        background: V.canvas, border: `1px solid ${V.border}`, borderRadius: 14,
        padding: '14px 18px 12px', marginBottom: 14,
        boxShadow: '0 1px 4px rgba(14,17,22,0.05)',
      }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: sentimentTrend.length ? 12 : 0 }}>
          {/* Play / Pause */}
          <button
            onClick={() => { if (playhead >= totalSec) setPlayhead(0); setIsPlaying(p => !p) }}
            style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${V.primary}, #6B5BFF)`,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(48,86,244,0.35)', transition: 'transform .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          >
            {isPlaying
              ? <svg width="11" height="13" viewBox="0 0 11 13" fill="white"><rect x="0" y="0" width="3.5" height="13" rx="1.5"/><rect x="7.5" y="0" width="3.5" height="13" rx="1.5"/></svg>
              : <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M1.5 1.5L10.5 7L1.5 12.5V1.5Z"/></svg>
            }
          </button>

          {/* Time */}
          <span style={{ fontSize: 12, fontWeight: 700, color: V.ink, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, minWidth: 72 }}>
            {fmt(playhead)} <span style={{ color: V.subtle, fontWeight: 400 }}>/ {fmt(totalSec)}</span>
          </span>

          {/* Scrubber */}
          <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
            {/* Track */}
            <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: '#E8EAF0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${V.primary}, #6B5BFF)`, transition: 'width .08s linear', borderRadius: 2 }} />
            </div>
            {/* Tool call markers */}
            {toolsWithSec.map(tc => (
              <div key={tc.id} title={tc.toolLabel} style={{
                position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                left: `${(tc.sec / totalSec) * 100}%`,
                width: 9, height: 9, borderRadius: '50%', zIndex: 2, pointerEvents: 'none',
                background: tc.status === 'SUCCESS' ? V.emerald : tc.status === 'FAILED' ? V.red : V.amber,
                border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
                opacity: tc.sec <= playhead ? 1 : 0.45, transition: 'opacity .3s',
              }} />
            ))}
            {/* Thumb */}
            <div style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
              left: `${pct}%`, width: 14, height: 14, borderRadius: '50%',
              background: V.primary, border: '2px solid #fff',
              boxShadow: '0 1px 6px rgba(48,86,244,0.4)', zIndex: 3, pointerEvents: 'none',
              transition: 'left .08s linear',
            }} />
            {/* Invisible range input for interaction */}
            <input type="range" min={0} max={totalSec} step={0.1} value={playhead}
              onChange={e => { setPlayhead(parseFloat(e.target.value)); setIsPlaying(false) }}
              style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
          </div>

          {/* Speed */}
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {([1, 2] as const).map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                style={{
                  padding: '4px 9px', borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  border: speed === s ? `1.5px solid ${V.primary}` : `1px solid ${V.border}`,
                  background: speed === s ? V.primaryBg : 'transparent',
                  color: speed === s ? V.primary : V.subtle,
                  fontFamily: "'JetBrains Mono', monospace", transition: 'all .12s',
                }}>
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Sentiment strip */}
        {sentimentTrend.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0, width: 58 }}>Sentiment</span>
            <div style={{ flex: 1, position: 'relative', height: SVG_H }}>
              {/* SVG for paths only — no circles (they distort with preserveAspectRatio="none") */}
              <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none"
                style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <clipPath id="ha-sent-clip">
                    <rect x="0" y="0" width={pct} height={SVG_H + 4} />
                  </clipPath>
                </defs>
                <path d={sparkPath} fill="none" stroke="#E0E3EB" strokeWidth="2" strokeLinejoin="round" />
                <path d={sparkPath} fill="none" stroke={sentColor} strokeWidth="2.5" strokeLinejoin="round" clipPath="url(#ha-sent-clip)" />
              </svg>
              {/* Dot as HTML div — stays perfectly circular regardless of SVG scaling */}
              {sentVal !== null && playhead > 0 && (
                <div style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: `${(1 - (sentVal ?? 0) * 0.75 - 0.1) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 9, height: 9, borderRadius: '50%',
                  background: sentColor, border: '2px solid #fff',
                  boxShadow: `0 1px 5px ${sentColor}66`,
                  transition: 'left .08s linear, top .15s ease, background .3s',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: playhead > 0 ? sentColor : V.subtle, flexShrink: 0, minWidth: 52, textAlign: 'right', transition: 'color .3s' }}>
              {playhead > 0 ? sentLabel : '—'}
            </span>
          </div>
        )}
      </div>

      {/* ── Transcript + Tool calls ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 14, alignItems: 'start' }}>

        {/* Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 420, overflowY: 'auto', paddingRight: 2 }}>
          {transcript.map((msg, i) => {
            const isPast = msg.startTime < playhead
            const isActive = i === activeIdx
            const isFuture = msg.startTime > playhead
            const isAgent = msg.speaker === 'Agent'
            return (
              <div key={msg.id}
                ref={isActive ? activeRef : null}
                style={{
                  padding: '11px 14px 11px 16px', borderRadius: 12, position: 'relative',
                  border: `1px solid ${isActive ? (isAgent ? V.emeraldBorder : V.primaryBorder) : V.border}`,
                  background: isActive ? (isAgent ? '#F0FDF9' : V.primaryBg) : V.canvas,
                  opacity: isFuture ? 0.28 : 1,
                  transition: 'opacity .35s, border-color .25s, background .25s',
                }}
              >
                {/* Active accent bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
                  borderRadius: '0 2px 2px 0',
                  background: isActive ? (isAgent ? V.emerald : V.primary) : 'transparent',
                  transition: 'background .25s',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: isAgent ? V.emerald : V.primary, letterSpacing: '0.03em' }}>
                    {msg.speaker.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10.5, color: V.subtle, fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(msg.startTime)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: V.ink, lineHeight: 1.6 }}>{msg.text}</p>
              </div>
            )
          })}
        </div>

        {/* Tool calls sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 10.5, fontWeight: 700, color: V.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tool Calls</p>
          {firedTools.length === 0 ? (
            <div style={{
              padding: '24px 14px', border: `1.5px dashed ${V.border}`, borderRadius: 10,
              textAlign: 'center', background: V.bg,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: V.border, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 010 1.4l1.6 1.6a1 1 0 011.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke={V.subtle} strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <p style={{ margin: 0, fontSize: 11.5, color: V.subtle }}>Waiting for tools…</p>
            </div>
          ) : (
            firedTools.map(tc => {
              const ok = tc.status === 'SUCCESS'
              const fail = tc.status === 'FAILED'
              return (
                <div key={tc.id} style={{
                  animation: 'ha-tc-in 0.25s ease both',
                  padding: '10px 12px', borderRadius: 10,
                  border: `1px solid ${ok ? V.emeraldBorder : fail ? V.redBorder : V.amberBorder}`,
                  background: ok ? '#F0FDF9' : fail ? V.redBg : V.amberBg,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: ok ? V.emerald : fail ? V.red : V.amber }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: V.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tc.toolLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10.5, color: V.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(tc.sec)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: ok ? V.emeraldBorder : fail ? V.redBorder : V.amberBorder, color: ok ? '#065F46' : fail ? V.red : V.amber }}>
                      {tc.status}
                    </span>
                  </div>
                  {tc.output && ok && (
                    <div style={{ marginTop: 7, paddingTop: 7, borderTop: `1px solid ${V.emeraldBorder}` }}>
                      <pre style={{ margin: 0, fontSize: 10, color: '#065F46', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(tc.output, null, 1)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
