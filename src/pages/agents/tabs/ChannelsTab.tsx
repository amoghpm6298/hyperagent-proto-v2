import React, { useState, useRef, useEffect } from 'react'
import { Agent, EmbedKey } from '../../../types'
import { useAppStore } from '../../../store'
import { CopyButton } from '../../../components/shared/CopyButton'
import { ChevronDown, ChevronUp, Info, Key, Plus } from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF', emeraldBorder: '#6EE7B7',
  amber: '#C2780A', amber50: '#FBF1DA', amberBorder: '#FCD34D',
  rose: '#D63B5B', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

const baseCardShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '8px 12px', background: V.canvas, border: `1px solid ${V.line}`,
  borderRadius: 8, fontSize: 12.5, color: V.ink, outline: 'none',
  fontFamily: "'Manrope', ui-sans-serif, sans-serif",
  colorScheme: 'light' as any, transition: 'border-color .15s, box-shadow .15s',
}

function AccessToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      style={{
        width: 40, height: 24, borderRadius: 12, border: 'none',
        background: enabled ? V.primary : '#D6D9E0',
        position: 'relative', cursor: 'pointer',
        transition: 'background .2s, box-shadow .2s', flexShrink: 0,
        boxShadow: enabled ? '0 0 0 3px rgba(48,86,244,0.15)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: enabled ? 19 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </button>
  )
}

// ── Interactive chat widget preview ────────────────────────────────────────

type WidgetMsg = { role: 'agent' | 'user'; text: string }

const WIDGET_REPLIES = [
  "Sure! I'd be happy to help with that. Could you give me a bit more detail?",
  "Got it. Let me look into that for you — one moment.",
  "Great question! Based on what you've shared, here's what I recommend.",
  "I understand completely. That's something I can definitely help you with.",
  "Of course! Is there anything else you'd like to know about this?",
  "Let me check that for you right away.",
]

const FIELD_REPLIES = [
  "I can help with that. What should this prompt focus on — tone, task type, or a specific domain?",
  "Here's a draft based on what you've described:\n\nYou are a helpful assistant specialized in customer support. Your goal is to resolve issues efficiently and empathetically. Always confirm understanding before proposing a solution.",
  "Good feedback. Here's a revised version that's more concise and action-oriented.",
  "Updated — I've tightened the language and made the objective clearer.",
  "Here's an alternative framing that leads with the persona rather than the task.",
]

const COLOR_PRESETS = [
  { color: '#3056F4', g2: '#1F3FE0', label: 'Blue' },
  { color: '#7C3AED', g2: '#5B21B6', label: 'Violet' },
  { color: '#0F9D6E', g2: '#065F46', label: 'Emerald' },
  { color: '#0891B2', g2: '#0E7490', label: 'Cyan' },
  { color: '#E11D48', g2: '#BE123C', label: 'Rose' },
  { color: '#D97706', g2: '#B45309', label: 'Amber' },
]

function resolveGradient(color?: string): [string, string] {
  if (!color) return [COLOR_PRESETS[0].color, COLOR_PRESETS[0].g2]
  const preset = COLOR_PRESETS.find(p => p.color === color)
  if (preset) return [preset.color, preset.g2]
  // Custom hex: darken slightly for g2
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    const r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16)
    const d = (n: number) => Math.max(0, Math.floor(n * 0.82)).toString(16).padStart(2, '0')
    return [color, `#${d(r)}${d(g)}${d(b)}`]
  }
  return [COLOR_PRESETS[0].color, COLOR_PRESETS[0].g2]
}

function ChatWidgetPreview({ agentName, agentInitial, g1, g2, logoUrl, displayName, subtitle }: {
  agentName: string; agentInitial: string; g1: string; g2: string
  logoUrl?: string; displayName?: string; subtitle?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [msgs, setMsgs] = useState<WidgetMsg[]>([
    { role: 'agent', text: `👋 Hi! I'm ${displayName || agentName}. How can I help you today?` },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [replyIdx, setReplyIdx] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, isTyping])

  const send = () => {
    const text = input.trim()
    if (!text || isTyping) return
    setMsgs(prev => [...prev, { role: 'user', text }])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMsgs(prev => [...prev, { role: 'agent', text: WIDGET_REPLIES[replyIdx % WIDGET_REPLIES.length] }])
      setReplyIdx(i => i + 1)
    }, 1600)
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') send() }

  const dotAvatar: React.CSSProperties = {
    width: 28, height: 28, borderRadius: '50%',
    background: logoUrl ? '#fff' : `linear-gradient(135deg, ${g1}, ${g2})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
    overflow: 'hidden', border: logoUrl ? `1.5px solid ${V.line}` : 'none',
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      <style>{`
        @keyframes ha-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes ha-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Chat popup */}
      {isOpen && (
        <div style={{
          width: 360, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 48px rgba(14,17,22,0.18), 0 2px 12px rgba(14,17,22,0.08)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          animation: 'ha-slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
          border: '1px solid rgba(14,17,22,0.06)',
        }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.35)', flexShrink: 0, overflow: 'hidden' }}>
              {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : agentInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'Manrope', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName || agentName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 0 2px rgba(74,222,128,0.3)', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontFamily: "'Manrope', sans-serif" }}>Online · {subtitle || 'Replies instantly'}</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.30)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)' }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, background: '#F8F9FB', maxHeight: 320, overflowY: 'auto' }}>
            <p style={{ margin: 0, textAlign: 'center', fontSize: 11, color: '#9AA1B2', fontFamily: "'Manrope', sans-serif" }}>Today</p>
            {msgs.map((m, i) => m.role === 'agent' ? (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={dotAvatar}>{logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : agentInitial}</div>
                <div style={{ maxWidth: '78%', padding: '10px 12px', background: '#fff', borderRadius: '12px 12px 12px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', fontSize: 13, color: '#1a1a2e', lineHeight: 1.55, fontFamily: "'Manrope', sans-serif" }}>
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: '75%', padding: '10px 12px', background: g1, borderRadius: '12px 12px 4px 12px', fontSize: 13, color: '#fff', lineHeight: 1.55, fontFamily: "'Manrope', sans-serif" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={dotAvatar}>{logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : agentInitial}</div>
                <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '12px 12px 12px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {([0, 150, 300] as number[]).map(d => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9AA1B2', display: 'inline-block', animation: `ha-bounce 1.1s ${d}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', background: '#fff', borderTop: '1px solid #EAEBED', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={`Message ${agentName}…`}
              style={{ flex: 1, background: '#F4F5F8', border: '1.5px solid transparent', borderRadius: 20, padding: '9px 14px', fontSize: 13, color: '#1a1a2e', outline: 'none', fontFamily: "'Manrope', sans-serif", transition: 'border-color 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = g1 + '55' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'transparent' }}
            />
            <button onClick={send} disabled={!input.trim() || isTyping}
              style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s',
                background: input.trim() && !isTyping ? `linear-gradient(135deg, ${g1}, ${g2})` : '#E0E2E8',
                boxShadow: input.trim() && !isTyping ? '0 2px 8px rgba(48,86,244,0.35)' : 'none',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Branding */}
          <div style={{ padding: '6px 14px 8px', background: '#FAFBFE', borderTop: '1px solid #F0F1F4', textAlign: 'center' }}>
            <span style={{ fontSize: 10.5, color: '#C8CDD8', fontFamily: "'Manrope', sans-serif" }}>Powered by <strong style={{ color: g1 }}>HyperAgent</strong></span>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button onClick={() => setIsOpen(o => !o)}
        style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${g1}, ${g2})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(48,86,244,0.40), 0 0 0 3px rgba(255,255,255,0.9)', transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(48,86,244,0.50), 0 0 0 3px rgba(255,255,255,0.9)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(48,86,244,0.40), 0 0 0 3px rgba(255,255,255,0.9)' }}
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </button>
    </div>
  )
}

// ── Field Fill preview ────────────────────────────────────────────────────

function FieldFillPreview({ agentName, agentInitial, g1, g2, logoUrl, displayName, subtitle }: {
  agentName: string; agentInitial: string; g1: string; g2: string
  logoUrl?: string; displayName?: string; subtitle?: string
}) {
  const [chatOpen, setChatOpen] = useState(false)
  const [fieldValue, setFieldValue] = useState('')
  const [msgs, setMsgs] = useState<WidgetMsg[]>([
    { role: 'agent', text: `Hi! I'm ${agentName}. Describe what you need and I'll draft it for you.` },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [replyIdx, setReplyIdx] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, isTyping])

  const send = () => {
    const text = input.trim()
    if (!text || isTyping) return
    setMsgs(prev => [...prev, { role: 'user', text }])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMsgs(prev => [...prev, { role: 'agent', text: FIELD_REPLIES[replyIdx % FIELD_REPLIES.length] }])
      setReplyIdx(i => i + 1)
    }, 1800)
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') send() }

  const approve = (text: string) => { setFieldValue(text); setChatOpen(false) }

  const dotAvatar: React.CSSProperties = {
    width: 28, height: 28, borderRadius: '50%',
    background: logoUrl ? '#fff' : `linear-gradient(135deg, ${g1}, ${g2})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
    overflow: 'hidden', border: logoUrl ? `1.5px solid ${V.line}` : 'none',
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      <style>{`
        @keyframes ha-bounce { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes ha-slide-up { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {/* Chat panel */}
      {chatOpen && (
        <div style={{ width: 360, background: '#fff', borderRadius: 16, boxShadow: '0 8px 48px rgba(14,17,22,0.18), 0 2px 12px rgba(14,17,22,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'ha-slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1) both', border: '1px solid rgba(14,17,22,0.06)' }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.35)', flexShrink: 0, overflow: 'hidden' }}>
              {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : agentInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#fff', fontFamily: "'Manrope', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName || agentName}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.80)', fontFamily: "'Manrope', sans-serif" }}>Field fill mode · approve to populate</p>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.30)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)' }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Context strip */}
          <div style={{ padding: '7px 14px', background: '#F0F2FF', borderBottom: '1px solid #DCE2FE', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={g1} strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={g1} strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 11, color: g1, fontFamily: "'Manrope', sans-serif" }}>Filling: <strong>System Prompt</strong></span>
          </div>

          {/* Messages */}
          <div style={{ padding: '12px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, background: '#F8F9FB', maxHeight: 280, overflowY: 'auto' }}>
            <p style={{ margin: 0, textAlign: 'center', fontSize: 11, color: '#9AA1B2', fontFamily: "'Manrope', sans-serif" }}>Today</p>
            {msgs.map((m, i) => m.role === 'agent' ? (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={dotAvatar}>{logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : agentInitial}</div>
                <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ padding: '9px 12px', background: '#fff', borderRadius: '12px 12px 12px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', fontSize: 12.5, color: '#1a1a2e', lineHeight: 1.55, fontFamily: "'Manrope', sans-serif', whiteSpace: 'pre-wrap" as any }}>{m.text}</div>
                  {i > 0 && (
                    <button onClick={() => approve(m.text)}
                      style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: g1, border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", transition: 'opacity 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Use this
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: '75%', padding: '9px 12px', background: g1, borderRadius: '12px 12px 4px 12px', fontSize: 12.5, color: '#fff', lineHeight: 1.55, fontFamily: "'Manrope', sans-serif" }}>{m.text}</div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={dotAvatar}>{logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : agentInitial}</div>
                <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '12px 12px 12px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {([0, 150, 300] as number[]).map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9AA1B2', display: 'inline-block', animation: `ha-bounce 1.1s ${d}ms infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', background: '#fff', borderTop: '1px solid #EAEBED', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Describe what you need…"
              style={{ flex: 1, background: '#F4F5F8', border: '1.5px solid transparent', borderRadius: 20, padding: '9px 14px', fontSize: 13, color: '#1a1a2e', outline: 'none', fontFamily: "'Manrope', sans-serif", transition: 'border-color 0.15s' }}
              onFocus={e => { e.currentTarget.style.borderColor = g1 + '55' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'transparent' }} />
            <button onClick={send} disabled={!input.trim() || isTyping}
              style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s', background: input.trim() && !isTyping ? `linear-gradient(135deg, ${g1}, ${g2})` : '#E0E2E8', boxShadow: input.trim() && !isTyping ? '0 2px 8px rgba(48,86,244,0.35)' : 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div style={{ padding: '6px 14px 8px', background: '#FAFBFE', borderTop: '1px solid #F0F1F4', textAlign: 'center' }}>
            <span style={{ fontSize: 10.5, color: '#C8CDD8', fontFamily: "'Manrope', sans-serif" }}>Powered by <strong style={{ color: g1 }}>HyperAgent</strong></span>
          </div>
        </div>
      )}

      {/* Demo form card */}
      <div style={{ width: 300, background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(14,17,22,0.12), 0 1px 6px rgba(14,17,22,0.06)', border: '1px solid rgba(14,17,22,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '9px 14px', background: '#F8F9FB', borderBottom: '1px solid #EAEBED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: V.ink2, fontFamily: "'Manrope', sans-serif" }}>Demo Form</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: V.primary50, color: V.primary, border: `1px solid #C8D2FB`, borderRadius: 5, fontFamily: "'Manrope', sans-serif", letterSpacing: '0.04em' }}>PREVIEW</span>
        </div>
        <div style={{ padding: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 11.5, fontWeight: 600, color: V.ink, fontFamily: "'Manrope', sans-serif" }}>System Prompt</p>
          <div style={{ position: 'relative' }}>
            <textarea value={fieldValue} onChange={e => setFieldValue(e.target.value)} rows={4}
              placeholder="Click 'Generate' to draft with AI…"
              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', padding: '8px 10px', background: V.bg, border: `1.5px solid ${fieldValue ? V.emeraldBorder : V.line}`, borderRadius: 8, fontSize: 12, color: V.ink, fontFamily: "'Manrope', sans-serif", outline: 'none', lineHeight: 1.5, transition: 'border-color 0.2s' }} />
            {fieldValue && (
              <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', background: V.emerald50, border: `1px solid ${V.emeraldBorder}`, borderRadius: 5 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={V.emerald} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: V.emerald, fontFamily: "'Manrope', sans-serif" }}>Applied</span>
              </div>
            )}
          </div>
          <button onClick={() => setChatOpen(o => !o)}
            style={{ marginTop: 8, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: chatOpen ? '#E0E2E8' : `linear-gradient(135deg, ${g1}, ${g2})`, border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: chatOpen ? V.muted : '#fff', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", boxShadow: chatOpen ? 'none' : '0 2px 8px rgba(48,86,244,0.28)', transition: 'all 0.15s' }}>
            {chatOpen ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke={V.muted} strokeWidth="2.5" strokeLinecap="round"/></svg> Close chat</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Generate with AI</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────

function ChannelCard({ title, description, badge, id, isActive, onToggle, expandedChannel, setExpandedChannel, children }: {
  title: string; description: string | React.ReactNode; badge?: string
  id: string; isActive: boolean; onToggle?: () => void
  expandedChannel: string | null; setExpandedChannel: (id: string | null) => void
  children?: React.ReactNode
}) {
  const expanded = isActive && expandedChannel === id
  return (
    <div style={{
      background: V.canvas, border: `1px solid ${V.line}`,
      borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow,
      transition: 'box-shadow .15s, border-color .15s',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 10px 30px -12px rgba(48,86,244,0.18)'
        el.style.borderColor = '#C8D2FB'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = baseCardShadow
        el.style.borderColor = V.line
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '16px 20px', cursor: isActive ? 'pointer' : 'default',
        background: 'linear-gradient(180deg, #FAFBFE, #fff)',
        borderBottom: expanded ? `1px solid ${V.line2}` : 'none',
      }}
        onClick={() => isActive && setExpandedChannel(expandedChannel === id ? null : id)}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>{title}</p>
            {badge && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
                ...(badge === 'Disabled' ? { background: V.bg, color: V.muted2, border: `1px solid ${V.line}` } : { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' })
              }}>{badge}</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: V.muted, lineHeight: 1.5 }}>{description}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 2 }}>
          {onToggle && <AccessToggle enabled={isActive} onToggle={onToggle} />}
          {isActive && (expanded ? <ChevronUp size={14} style={{ color: V.muted2 }} /> : <ChevronDown size={14} style={{ color: V.muted2 }} />)}
        </div>
      </div>
      {expanded && children && (
        <div style={{ borderTop: `1px solid ${V.line}`, padding: '18px 20px' }}>{children}</div>
      )}
    </div>
  )
}

export function ChannelsTab({ agent }: { agent: Agent }) {
  const addEmbedKey = useAppStore(state => state.addEmbedKey)
  const updateEmbedKey = useAppStore(state => state.updateEmbedKey)
  const revokeEmbedKey = useAppStore(state => state.revokeEmbedKey)
  const updateAgent = useAppStore(state => state.updateAgent)

  const toggleEmbed = () => {
    const nowEnabled = !(agent.accessMethods?.embed?.enabled ?? false)
    updateAgent(agent.id, { accessMethods: { ...agent.accessMethods, embed: { ...(agent.accessMethods?.embed ?? {}), enabled: nowEnabled } } })
    if (nowEnabled) setExpandedChannel('embed')
  }

  const toggleApi = () => {
    const nowEnabled = !(agent.accessMethods?.api?.enabled ?? false)
    updateAgent(agent.id, { accessMethods: { ...agent.accessMethods, api: { ...(agent.accessMethods?.api ?? {}), enabled: nowEnabled } } })
    if (nowEnabled) setExpandedChannel('api')
  }

  const [expandedChannel, setExpandedChannel] = useState<string | null>(null)
  const [embedMode, setEmbedMode] = useState<'widget' | 'invoke' | 'fill'>('widget')
  const [previewKeyId, setPreviewKeyId] = useState<string | null>(null)
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null)
  const [editColor, setEditColor] = useState(COLOR_PRESETS[0].color)
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editDomains, setEditDomains] = useState('')
  const [showKeyForm, setShowKeyForm] = useState(false)
  const [keyLabel, setKeyLabel] = useState('')
  const [keyDomains, setKeyDomains] = useState('')
  const [keyColor, setKeyColor] = useState(COLOR_PRESETS[0].color)
  const [keyLogoUrl, setKeyLogoUrl] = useState<string | null>(null)
  const [keyDisplayName, setKeyDisplayName] = useState('')
  const [keySubtitle, setKeySubtitle] = useState('')
  const [revealedKeyData, setRevealedKeyData] = useState<{
    fullKey: string; label: string; allowedDomains: string[]
    color?: string; logoUrl?: string; displayName?: string; subtitle?: string
    createdAt: string
  } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  React.useEffect(() => { setPreviewKeyId(null) }, [embedMode])

  const handleGenerateKey = async () => {
    if (!keyLabel.trim() || isGenerating) return
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 1300))
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    const fullKey = `pk_live_${hex}`
    const last4 = hex.slice(-4)
    const domains = keyDomains.split(',').map(d => d.trim()).filter(Boolean)
    const createdAt = new Date().toISOString().split('T')[0]
    const newKey: EmbedKey = {
      id: `key_${Date.now()}`, label: keyLabel,
      maskedKey: `pk_live_${'•'.repeat(16)}${last4}`,
      allowedDomains: domains,
      isActive: true, lastUsedAt: null, createdAt,
      color: keyColor, logoUrl: keyLogoUrl ?? undefined,
      displayName: keyDisplayName.trim() || undefined, subtitle: keySubtitle.trim() || undefined,
    }
    addEmbedKey(agent.id, newKey)
    setRevealedKeyData({
      fullKey, label: keyLabel, allowedDomains: domains, createdAt,
      color: keyColor, logoUrl: keyLogoUrl ?? undefined,
      displayName: keyDisplayName.trim() || undefined, subtitle: keySubtitle.trim() || undefined,
    })
    setKeyLabel(''); setKeyDomains('')
    setKeyColor(COLOR_PRESETS[0].color); setKeyLogoUrl(null)
    setKeyDisplayName(''); setKeySubtitle(''); setShowKeyForm(false)
    setPreviewKeyId(id => id === '__new__' ? null : id)
    setIsGenerating(false)
  }

  const hasFields = agent.fields.length > 0
  const firstKey = agent.accessMethods?.embed?.keys?.find(k => k.isActive)?.maskedKey || 'YOUR_EMBED_KEY'
  const contextLines = hasFields ? agent.fields.map(f => `    ${f.name}: user.${f.name},  // ${f.type}`).join('\n') : '    // no input fields configured'
  const inputLines = hasFields ? agent.fields.map(f => `  ${f.name}: user.${f.name},  // ${f.type}`).join('\n') : '  // no input fields configured'

  const ctxBlock = hasFields
    ? `\n  // ⚠️  Never pass raw user data as context — it runs in the browser and\n  //     can be forged. Use a server-signed context token:\n  //\n  //  Backend: POST https://api.hyperagent.io/v1/context-token\n  //    Authorization: Bearer sk_live_...  (secret key — never in the browser)\n  //    Body: { context: { ${agent.fields.map(f => f.name).join(', ')} }, expiresIn: "1h" }\n  //    ← { contextToken: "eyJ..." }\n  const { contextToken } = await fetch('/api/ha-token').then(r => r.json())\n`
    : ''

  const widgetSnippet = `<script src="https://cdn.hyperagent.io/embed.js"><\/script>\n<script>${ctxBlock}\n  HyperAgent.chat({\n    embedKey: '${firstKey}',${hasFields ? "\n    contextToken,           // signed JWT — not raw user data" : ''}\n    targetElt: '#chat-container',\n  });\n<\/script>`

  const invokeSnippet = `// @hyperagent/embed — streaming response\nimport { HyperAgent } from '@hyperagent/embed'\n\nconst stream = HyperAgent.invokeStream({\n  embedKey: '${firstKey}',\n  input: {\n${inputLines}\n  }\n})\n\nfor await (const chunk of stream) {\n  process.stdout.write(chunk.delta)   // tokens arrive incrementally\n}\n\nconst { output } = await stream.result()\nconsole.log(output)`
  const apiSchema = agent.accessMethods?.api?.schema
  const curlInputLines = apiSchema?.inputSchema?.length ? apiSchema.inputSchema.map(f => `    "${f.name}": ${f.type === 'number' ? '0' : `"your_${f.name}"`}`).join(',\n') : '    "query": "your value here"'
  const curlCommand = `curl -X POST https://api.hyperagent.io/v1/invoke/${agent.id} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${apiSchema?.apiKeyMasked || 'sk_live_YOUR_SECRET_KEY'}" \\\n  -d '{\n${curlInputLines}\n  }'`

  const ctxSecurityNote = hasFields ? (
    <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, marginBottom: 10 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/></svg>
      <p style={{ margin: 0, fontSize: 11.5, color: '#92400E', lineHeight: 1.5 }}>
        <strong>Context security:</strong> This agent has input fields. Raw context passed from the browser can be forged. The snippet below shows the server-signed token pattern.
      </p>
    </div>
  ) : null

  const sectionLabel: React.CSSProperties = { margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }
  const codeBox: React.CSSProperties = {
    margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
    background: V.bg, border: `1px solid ${V.line}`,
    borderRadius: 12, padding: '12px 14px',
    overflowX: 'auto', whiteSpace: 'pre', color: V.ink,
  }

  const agentInitial = agent.display_name.charAt(0).toUpperCase()

  function KeyForm() {
    const [g1, g2] = resolveGradient(keyColor)
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => setKeyLogoUrl(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
    return (
      <div style={{ marginTop: 10, padding: 14, background: V.bg, border: `1px solid ${V.line}`, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Basic fields */}
        <input type="text" placeholder="Label (e.g., Production)" value={keyLabel} onChange={e => setKeyLabel(e.target.value)} style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
          onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
        <div>
          <input type="text" placeholder="Allowed domains — comma-separated (e.g., app.bank.com, *.bank.com)" value={keyDomains} onChange={e => setKeyDomains(e.target.value)} style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
            onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
          <p style={{ margin: '5px 0 0', fontSize: 10.5, color: V.muted2, fontFamily: "'Manrope', sans-serif" }}>Wildcards supported (*.bank.com) · Protocol and port are ignored · Leave blank to allow all origins</p>
        </div>

        {/* Branding section */}
        <div style={{ paddingTop: 4, borderTop: `1px solid ${V.line}` }}>
          <p style={{ margin: '8px 0 10px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Widget Branding</p>

          {/* Display name + subtitle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 2 }}>
            <div>
              <p style={{ margin: '0 0 5px', fontSize: 11.5, fontWeight: 600, color: V.ink, fontFamily: "'Manrope', sans-serif" }}>Display Name</p>
              <input type="text" value={keyDisplayName} onChange={e => setKeyDisplayName(e.target.value)}
                placeholder={agent.display_name}
                style={{ ...inputStyle, fontSize: 12 }}
                onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
            </div>
            <div>
              <p style={{ margin: '0 0 5px', fontSize: 11.5, fontWeight: 600, color: V.ink, fontFamily: "'Manrope', sans-serif" }}>Subtitle</p>
              <div style={{ display: 'flex', alignItems: 'center', background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .15s, box-shadow .15s' }}
                onFocus={e => { (e.currentTarget as HTMLDivElement).style.borderColor = V.primary; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                onBlur={e => { (e.currentTarget as HTMLDivElement).style.borderColor = V.line; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                <span style={{ paddingLeft: 12, paddingRight: 2, fontSize: 12, color: V.muted2, whiteSpace: 'nowrap', userSelect: 'none' as const, fontFamily: "'Manrope', sans-serif" }}>Online ·</span>
                <input type="text" value={keySubtitle} onChange={e => setKeySubtitle(e.target.value)}
                  placeholder="Replies instantly"
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 12px 8px 5px', fontSize: 12, color: V.ink, background: 'transparent', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }} />
              </div>
            </div>
          </div>

          {/* Color */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11.5, fontWeight: 600, color: V.ink, fontFamily: "'Manrope', sans-serif" }}>Primary Color</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
              {/* Quick-pick presets */}
              {COLOR_PRESETS.map(preset => (
                <button key={preset.color} onClick={() => setKeyColor(preset.color)} title={preset.label}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: preset.color, border: keyColor === preset.color ? `2px solid ${V.ink}` : '2px solid transparent', cursor: 'pointer', outline: keyColor === preset.color ? `2.5px solid ${preset.color}55` : 'none', outlineOffset: 2, transition: 'transform 0.12s', transform: keyColor === preset.color ? 'scale(1.18)' : 'scale(1)', flexShrink: 0 }} />
              ))}
              {/* Hex input with native color picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 5px', background: V.canvas, border: `1.5px solid ${V.line}`, borderRadius: 8 }}>
                <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: keyColor, cursor: 'pointer', border: `1px solid rgba(0,0,0,0.08)` }} />
                  <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(keyColor) ? keyColor : '#3056F4'} onChange={e => setKeyColor(e.target.value)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', padding: 0, border: 'none' }} />
                </div>
                <input type="text" value={keyColor}
                  onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setKeyColor(v) }}
                  style={{ width: 64, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", border: 'none', outline: 'none', color: V.ink, background: 'transparent' }} />
              </div>
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 11.5, fontWeight: 600, color: V.ink, fontFamily: "'Manrope', sans-serif" }}>Logo / Illustration</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ cursor: 'pointer' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: V.canvas, border: `1.5px solid ${V.line}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: V.muted, fontFamily: "'Manrope', sans-serif", transition: 'border-color 0.15s' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={V.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Upload image
                </div>
              </label>
              {keyLogoUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={keyLogoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: `1px solid ${V.line}` }} />
                  <button onClick={() => setKeyLogoUrl(null)}
                    style={{ width: 20, height: 20, borderRadius: '50%', background: V.bg, border: `1px solid ${V.line}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke={V.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                </div>
              )}
              {!keyLogoUrl && <span style={{ fontSize: 11.5, color: V.muted2, fontFamily: "'Manrope', sans-serif" }}>PNG, SVG, JPG · shown in widget header</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 2px' }}>
          <span style={{ fontSize: 11.5, color: V.muted, fontFamily: "'Manrope', sans-serif" }}>Preview widget</span>
          <AccessToggle enabled={previewKeyId === '__new__'} onToggle={() => setPreviewKeyId(id => id === '__new__' ? null : '__new__')} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleGenerateKey} disabled={!keyLabel.trim() || isGenerating}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 12.5, fontWeight: 600, color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 12px', cursor: keyLabel.trim() && !isGenerating ? 'pointer' : 'default',
              opacity: keyLabel.trim() && !isGenerating ? 1 : 0.6,
              fontFamily: "'Manrope', ui-sans-serif, sans-serif",
              background: `linear-gradient(135deg, ${V.primary}, ${V.primary2})`,
              boxShadow: keyLabel.trim() && !isGenerating ? '0 4px 12px rgba(48,86,244,0.25)' : 'none',
              transition: 'box-shadow .15s, opacity .15s',
            }}>
            {isGenerating ? (
              <>
                <style>{`@keyframes ha-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: 'ha-spin .8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                Generating…
              </>
            ) : <><Key size={12} /> Generate Key</>}
          </button>
          <button onClick={() => { setShowKeyForm(false); setKeyLogoUrl(null); setKeyDisplayName(''); setKeySubtitle(''); setPreviewKeyId(id => id === '__new__' ? null : id) }}
            style={{ fontSize: 12.5, color: V.muted, background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  function RevealedKeyModal() {
    if (!revealedKeyData) return null
    const { fullKey, label, allowedDomains, color, logoUrl, displayName, subtitle, createdAt } = revealedKeyData
    const [g1, g2] = resolveGradient(color)
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,17,22,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={e => { if (e.target === e.currentTarget) setRevealedKeyData(null) }}>
        <div style={{ width: 480, background: '#fff', borderRadius: 20, boxShadow: '0 24px 64px -12px rgba(14,17,22,0.28), 0 4px 16px -4px rgba(14,17,22,0.12)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', padding: '18px 20px', borderBottom: '1px solid #6EE7B7', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1px solid #6EE7B7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Key size={17} style={{ color: '#0F9D6E' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#065F46', letterSpacing: '-0.01em' }}>Embed key generated</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#059669' }}>Copy now — this key won't be shown again</p>
              </div>
            </div>
            <button onClick={() => setRevealedKeyData(null)}
              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(6,95,70,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,95,70,0.18)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,95,70,0.10)' }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke="#065F46" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full key */}
            <div style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Key</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <code style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#065F46', wordBreak: 'break-all', lineHeight: 1.5 }}>{fullKey}</code>
                <div style={{ flexShrink: 0 }}><CopyButton text={fullKey} /></div>
              </div>
            </div>

            {/* Key config details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: V.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${V.line}` }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Label</p>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: V.ink }}>{label}</p>
              </div>
              <div style={{ background: V.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${V.line}` }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Created</p>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: V.ink }}>{createdAt}</p>
              </div>
              <div style={{ background: V.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${V.line}` }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Allowed Domains</p>
                {allowedDomains.length > 0
                  ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{allowedDomains.map(d => <span key={d} style={{ fontSize: 10.5, padding: '1px 6px', background: V.canvas, color: V.muted, borderRadius: 4, border: `1px solid ${V.line}` }}>{d}</span>)}</div>
                  : <p style={{ margin: 0, fontSize: 12, color: V.muted2, fontStyle: 'italic' }}>All origins</p>
                }
              </div>
              <div style={{ background: V.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${V.line}` }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Widget Branding</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {logoUrl
                    ? <img src={logoUrl} alt="" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover', border: `1px solid ${V.line}`, flexShrink: 0 }} />
                    : <div style={{ width: 16, height: 16, borderRadius: '50%', background: `linear-gradient(135deg, ${g1}, ${g2})`, flexShrink: 0 }} />
                  }
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: V.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName || agent.display_name}</p>
                    <p style={{ margin: 0, fontSize: 10.5, color: V.muted2 }}>Online · {subtitle || 'Replies instantly'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Done button */}
            <button onClick={() => setRevealedKeyData(null)}
              style={{ width: '100%', padding: '10px 0', background: `linear-gradient(135deg, ${V.primary}, ${V.primary2})`, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", boxShadow: '0 4px 12px rgba(48,86,244,0.28)', transition: 'opacity .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
              I've copied the key — Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {RevealedKeyModal()}
      {/* Info callout */}
      <div style={{ padding: '12px 14px', background: V.primary50, border: `1px solid #C8D2FB`, borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Info size={13} style={{ color: V.primary, marginTop: 2, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: V.primary2, lineHeight: 1.5 }}>
          <strong>Embed</strong> uses a domain-restricted public key (<code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>pk_live_</code>) — safe to ship in the browser.{' '}
          <strong>API</strong> uses a secret key (<code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>sk_live_</code>) — server-side only, never expose in client code.
        </p>
      </div>

      {/* Embed */}
      {agent.channels.includes('CHAT') && (
        <ChannelCard id="embed" title="Embed — Client-side SDK"
          description={agent.fields.length > 0
            ? "Client-side JS SDK. Chat Widget (pre-built bubble), Custom UI (bring your own interface — agent handles the AI), or Field Fill (AI-assisted form fields). This agent has input variables — Custom UI is recommended."
            : "Client-side JS SDK. Drop a pre-built chat bubble, render output in your own interface, or attach AI-assisted generation to any form field."
          }
          badge={agent.accessMethods?.embed?.enabled ? `${agent.accessMethods.embed.keys?.length ?? 0} key${(agent.accessMethods.embed.keys?.length ?? 0) !== 1 ? 's' : ''}` : 'Disabled'}
          isActive={agent.accessMethods?.embed?.enabled ?? false} onToggle={toggleEmbed}
          expandedChannel={expandedChannel} setExpandedChannel={setExpandedChannel}
        >
          {agent.accessMethods?.embed?.keys && agent.accessMethods.embed.keys.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Keys list */}
              <div>
                <p style={sectionLabel}>Keys</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {agent.accessMethods.embed.keys.map((key) => (
                    <div key={key.id} style={{ background: V.bg, borderRadius: 8, border: `1px solid ${editingKeyId === key.id ? '#C8D2FB' : V.line}`, transition: 'border-color 0.15s, opacity 0.2s', opacity: key.isActive ? 1 : 0.6 }}>
                      {/* Key row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px' }}>
                        {key.logoUrl
                          ? <img src={key.logoUrl} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover', border: `1px solid ${V.line}`, flexShrink: 0, marginTop: 2 }} />
                          : <div style={{ width: 10, height: 10, borderRadius: '50%', background: key.color ?? V.primary, flexShrink: 0, marginTop: 4 }} />
                        }
                        {/* label + metadata */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: V.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{key.label}</p>
                            {!key.isActive && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: V.bg, color: V.muted2, border: `1px solid ${V.line}`, flexShrink: 0, letterSpacing: '0.04em' }}>Inactive</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                            <code style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: V.muted2 }}>{key.maskedKey}</code>
                            {key.allowedDomains.map(d => <span key={d} style={{ fontSize: 10.5, padding: '1px 6px', background: V.canvas, color: V.muted, borderRadius: 4, border: `1px solid ${V.line}` }}>{d}</span>)}
                          </div>
                          <p style={{ margin: 0, fontSize: 10.5, color: V.muted2, fontFamily: "'Manrope', sans-serif" }}>
                            Created {key.createdAt}{key.lastUsedAt ? ` · Last used ${key.lastUsedAt}` : ' · Never used'}
                          </p>
                        </div>
                        {/* controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 1 }}>
                          <AccessToggle enabled={key.isActive} onToggle={() => updateEmbedKey(agent.id, key.id, { isActive: !key.isActive })} />
                          <button
                            onClick={() => {
                              if (editingKeyId === key.id) { setEditingKeyId(null) }
                              else { setEditingKeyId(key.id); setEditColor(key.color ?? COLOR_PRESETS[0].color); setEditLogoUrl(key.logoUrl ?? null); setEditDisplayName(key.displayName ?? ''); setEditSubtitle(key.subtitle ?? ''); setEditLabel(key.label); setEditDomains(key.allowedDomains.join(', ')) }
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, border: `1px solid ${editingKeyId === key.id ? '#C8D2FB' : V.line}`, background: editingKeyId === key.id ? V.primary50 : V.canvas, cursor: 'pointer', transition: 'all 0.15s' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={editingKeyId === key.id ? V.primary : V.muted} strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={editingKeyId === key.id ? V.primary : V.muted} strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                          {confirmDeleteId === key.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 11, color: V.rose, fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>Delete?</span>
                              <button onClick={() => { revokeEmbedKey(agent.id, key.id); setConfirmDeleteId(null) }} style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: V.rose, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>Yes</button>
                              <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: 11, color: V.muted, background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(key.id)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, border: `1px solid ${V.line}`, background: V.canvas, cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FCA5A5'; e.currentTarget.style.background = '#FEF2F2' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.background = V.canvas }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke={V.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={V.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 11, color: V.muted, fontFamily: "'Manrope', sans-serif" }}>Preview</span>
                            <AccessToggle enabled={previewKeyId === key.id} onToggle={() => setPreviewKeyId(id => id === key.id ? null : key.id)} />
                          </div>
                        </div>
                      </div>

                      {/* Inline edit panel */}
                      {editingKeyId === key.id && (() => {
                        const [eG1, eG2] = resolveGradient(editColor)
                        const handleEditLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0]; if (!file) return
                          const reader = new FileReader()
                          reader.onload = ev => setEditLogoUrl(ev.target?.result as string)
                          reader.readAsDataURL(file)
                        }
                        const saveEdit = () => {
                          updateEmbedKey(agent.id, key.id, {
                            color: editColor, logoUrl: editLogoUrl ?? undefined,
                            displayName: editDisplayName.trim() || undefined, subtitle: editSubtitle.trim() || undefined,
                            label: editLabel.trim() || key.label,
                            allowedDomains: editDomains.split(',').map(d => d.trim()).filter(Boolean),
                          })
                          setEditingKeyId(null)
                        }
                        return (
                          <div style={{ borderTop: `1px solid #DCE2FE`, padding: '14px 12px', background: V.primary50, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Label + Domains */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <div>
                                <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Label</p>
                                <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{ ...inputStyle, fontSize: 12 }}
                                  onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                                  onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
                              </div>
                              <div>
                                <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Allowed Domains</p>
                                <input type="text" value={editDomains} onChange={e => setEditDomains(e.target.value)} placeholder="app.bank.com, *.bank.com" style={{ ...inputStyle, fontSize: 12 }}
                                  onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                                  onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Color */}
                                <div>
                                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Color</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                                    {COLOR_PRESETS.map(p => (
                                      <button key={p.color} onClick={() => setEditColor(p.color)} title={p.label}
                                        style={{ width: 20, height: 20, borderRadius: '50%', background: p.color, border: editColor === p.color ? `2px solid ${V.ink}` : '2px solid transparent', cursor: 'pointer', outline: editColor === p.color ? `2.5px solid ${p.color}55` : 'none', outlineOffset: 2, transition: 'transform 0.12s', transform: editColor === p.color ? 'scale(1.18)' : 'scale(1)', flexShrink: 0 }} />
                                    ))}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px 3px 4px', background: V.canvas, border: `1.5px solid ${V.line}`, borderRadius: 7 }}>
                                      <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
                                        <div style={{ width: 18, height: 18, borderRadius: 4, background: editColor, border: '1px solid rgba(0,0,0,0.08)' }} />
                                        <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(editColor) ? editColor : '#3056F4'} onChange={e => setEditColor(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', padding: 0, border: 'none' }} />
                                      </div>
                                      <input type="text" value={editColor} onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setEditColor(v) }}
                                        style={{ width: 60, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", border: 'none', outline: 'none', color: V.ink, background: 'transparent' }} />
                                    </div>
                                  </div>
                                </div>
                                {/* Logo */}
                                <div>
                                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Logo</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <label style={{ cursor: 'pointer' }}>
                                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEditLogo} />
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: V.canvas, border: `1.5px solid ${V.line}`, borderRadius: 7, fontSize: 11.5, fontWeight: 600, color: V.muted, fontFamily: "'Manrope', sans-serif" }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={V.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Upload
                                      </div>
                                    </label>
                                    {editLogoUrl && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <img src={editLogoUrl} alt="" style={{ width: 26, height: 26, borderRadius: 5, objectFit: 'cover', border: `1px solid ${V.line}` }} />
                                        <button onClick={() => setEditLogoUrl(null)} style={{ width: 18, height: 18, borderRadius: '50%', background: V.bg, border: `1px solid ${V.line}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M11 1L1 11" stroke={V.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
                                        </button>
                                      </div>
                                    )}
                                    {!editLogoUrl && <span style={{ fontSize: 11, color: V.muted2, fontFamily: "'Manrope', sans-serif" }}>PNG, SVG, JPG</span>}
                                  </div>
                                </div>
                                {/* Display name + subtitle */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                  <div>
                                    <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Display Name</p>
                                    <input type="text" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)}
                                      placeholder={agent.display_name}
                                      style={{ ...inputStyle, fontSize: 12 }}
                                      onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                                      onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
                                  </div>
                                  <div>
                                    <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: V.muted2, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: "'Manrope', sans-serif" }}>Subtitle</p>
                                    <div style={{ display: 'flex', alignItems: 'center', background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .15s, box-shadow .15s' }}
                                      onFocus={e => { (e.currentTarget as HTMLDivElement).style.borderColor = V.primary; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                                      onBlur={e => { (e.currentTarget as HTMLDivElement).style.borderColor = V.line; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                                      <span style={{ paddingLeft: 12, paddingRight: 2, fontSize: 12, color: V.muted2, whiteSpace: 'nowrap', userSelect: 'none' as const, fontFamily: "'Manrope', sans-serif" }}>Online ·</span>
                                      <input type="text" value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)}
                                        placeholder="Replies instantly"
                                        style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 12px 8px 5px', fontSize: 12, color: V.ink, background: 'transparent', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }} />
                                    </div>
                                  </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={saveEdit}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: `linear-gradient(135deg, ${V.primary}, ${V.primary2})`, border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", boxShadow: '0 2px 8px rgba(48,86,244,0.25)' }}>
                                Save changes
                              </button>
                              <button onClick={() => setEditingKeyId(null)}
                                style={{ padding: '7px 14px', background: 'transparent', border: `1px solid ${V.line}`, borderRadius: 8, fontSize: 12.5, color: V.muted, cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ))}
                </div>
                {showKeyForm ? KeyForm() : (
                  <button onClick={() => setShowKeyForm(true)}
                    style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: V.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
                    <Plus size={11} /> Add key
                  </button>
                )}
              </div>

              {/* Mode tabs + snippet */}
              <div style={{ borderTop: `1px solid ${V.line}`, paddingTop: 16 }}>
                <p style={sectionLabel}>Integration Snippet</p>
                <div style={{ display: 'flex', gap: 4, padding: 4, background: V.bg, border: `1px solid ${V.line}`, borderRadius: 9, marginBottom: 12 }}>
                  {([
                    { id: 'widget', label: 'Chat Widget' },
                    { id: 'invoke', label: 'Custom UI' },
                    { id: 'fill',   label: 'Field Fill' },
                  ] as const).map(({ id, label }) => (
                    <button key={id} onClick={() => setEmbedMode(id)}
                      style={{ flex: 1, fontSize: 11.5, fontWeight: 600, padding: '6px 0', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'background .15s, color .15s', fontFamily: "'Manrope', ui-sans-serif, sans-serif",
                        ...(embedMode === id ? { background: V.canvas, color: V.ink, boxShadow: '0 1px 4px rgba(14,17,22,0.06)' } : { background: 'transparent', color: V.muted })
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
                {embedMode === 'widget' ? (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: 12, color: V.muted, lineHeight: 1.5 }}>
                      Renders a pre-built floating chat bubble. End users type messages, the agent responds in real time.
                    </p>
                    {ctxSecurityNote}
                    <div style={{ position: 'relative' }}>
                      <pre style={codeBox}>{widgetSnippet}</pre>
                      <CopyButton text={widgetSnippet} />
                    </div>
                  </>
                ) : embedMode === 'invoke' ? (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: 12, color: V.muted, lineHeight: 1.5 }}>
                      Use the embed SDK but render output in your own interface. Useful for inline summarization, classification, or content generation without a chat bubble. Tokens stream incrementally via <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>invokeStream</code>.
                    </p>
                    <div style={{ position: 'relative' }}>
                      <pre style={codeBox}>{invokeSnippet}</pre>
                      <CopyButton text={invokeSnippet} />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: 12, color: V.muted, lineHeight: 1.5 }}>
                      Attach a trigger button to any form field. Clicking it opens a chat — the user converses with the agent to generate content, then approves and the field is populated automatically.
                    </p>
                    <div style={{ position: 'relative' }}>
                      <pre style={codeBox}>{`// @hyperagent/embed SDK\nHyperAgent.fill({\n  embedKey: '${firstKey}',\n  trigger: '#generate-btn',   // button that opens the chat\n  target:  '#prompt-field',   // field to populate on approve\n  context: {\n${contextLines}\n  }\n})`}</pre>
                      <CopyButton text={`HyperAgent.fill({ embedKey: '${firstKey}', trigger: '#generate-btn', target: '#prompt-field' })`} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {showKeyForm ? KeyForm() : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12.5, color: V.muted }}>No embed keys configured yet.</p>
                  <button onClick={() => setShowKeyForm(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: V.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
                    <Key size={12} /> Generate embed key
                  </button>
                </div>
              )}
            </div>
          )}
        </ChannelCard>
      )}

      {/* API */}
      {agent.channels.includes('CHAT') && (
        <ChannelCard id="api" title="Server-side API"
          description="REST API called from your backend. Structured JSON in → JSON out. Authenticated by a secret API key."
          badge={agent.accessMethods?.api?.enabled ? 'Configured' : 'Disabled'}
          isActive={agent.accessMethods?.api?.enabled ?? false} onToggle={toggleApi}
          expandedChannel={expandedChannel} setExpandedChannel={setExpandedChannel}
        >
          {agent.accessMethods?.api ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={sectionLabel}>Endpoint</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, background: V.bg, border: `1px solid ${V.line}`, borderRadius: 7, padding: '7px 10px', color: V.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    POST https://api.hyperagent.io/v1/invoke/{agent.id}
                  </code>
                  <CopyButton text={`https://api.hyperagent.io/v1/invoke/${agent.id}`} />
                </div>
              </div>

              {apiSchema && (
                <div style={{ borderTop: `1px solid ${V.line}`, paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <p style={sectionLabel}>Input Fields</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {apiSchema.inputSchema.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <code style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: V.ink }}>{f.name}</code>
                          <span style={{ fontSize: 11, color: V.muted2 }}>({f.type})</span>
                          {f.required && <span style={{ fontSize: 10.5, color: '#DC2626', fontWeight: 600 }}>required</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={sectionLabel}>Output Fields</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {apiSchema.outputSchema.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <code style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: V.ink }}>{f.name}</code>
                          <span style={{ fontSize: 11, color: V.muted2 }}>({f.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ borderTop: `1px solid ${V.line}`, paddingTop: 14 }}>
                <p style={sectionLabel}>Sample Request</p>
                <div style={{ position: 'relative' }}>
                  <pre style={codeBox}>{curlCommand}</pre>
                  <CopyButton text={curlCommand} />
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px 0', fontSize: 12.5, color: V.muted }}>API access is not configured for this agent.</p>
          )}
        </ChannelCard>
      )}

      {!agent.channels.includes('CHAT') && (
        <div style={{
          padding: '32px 24px', border: `1px solid ${V.line}`,
          borderRadius: 18, textAlign: 'center', boxShadow: baseCardShadow,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: V.bg, border: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Info size={22} style={{ color: '#C8CDD8' }} strokeWidth={1.5} />
          </div>
          <p style={{ margin: '0 0 6px', fontSize: 13.5, color: V.muted }}>This agent uses the Voice Call channel.</p>
          <p style={{ margin: 0, fontSize: 12, color: V.muted2 }}>Call routing and telephony settings are configured in the Overview tab.</p>
        </div>
      )}

      {(() => {
        if (!previewKeyId) return null
        const isNew = previewKeyId === '__new__'
        const isEditing = !isNew && editingKeyId === previewKeyId
        const wKey = isNew ? undefined : agent.accessMethods?.embed?.keys?.find(k => k.id === previewKeyId)
        const [wG1, wG2] = resolveGradient(isNew ? keyColor : isEditing ? editColor : wKey?.color)
        const wLogo = isNew ? (keyLogoUrl ?? undefined) : isEditing ? (editLogoUrl ?? undefined) : wKey?.logoUrl
        const wDisplayName = isNew ? (keyDisplayName.trim() || undefined) : isEditing ? (editDisplayName.trim() || undefined) : wKey?.displayName
        const wSubtitle = isNew ? (keySubtitle.trim() || undefined) : isEditing ? (editSubtitle.trim() || undefined) : wKey?.subtitle
        return <ChatWidgetPreview agentName={agent.display_name} agentInitial={agentInitial} g1={wG1} g2={wG2} logoUrl={wLogo} displayName={wDisplayName} subtitle={wSubtitle} />
      })()}
    </div>
  )
}
