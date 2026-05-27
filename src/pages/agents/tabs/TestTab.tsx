import React, { useState, useRef, useEffect } from 'react'
import { Agent, Conversation } from '../../../types'
import { useAppStore } from '../../../store'
import { Button } from '../../../components/ui/Button'
import { MessageSquare, Send, RotateCcw, Phone, CheckCircle, Zap, X, Globe, ChevronRight } from 'lucide-react'

function makeTestId() {
  return `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function nowTs() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16)
}

function makeTestConv(agent: Agent, channel: 'CALL' | 'CHAT', overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: makeTestId(),
    agent: agent.display_name,
    agentId: agent.id,
    channel,
    participants: channel === 'CALL' ? overrides.participants || 'Web Browser' : 'Test Chat',
    duration: overrides.duration || '—',
    durationMs: overrides.durationMs,
    timestamp: nowTs(),
    startTime: nowTs(),
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    isTestRun: true,
    language: 'English',
    ...overrides,
  }
}

const GRADS_TT = [
  ['#3056F4', '#6B5BFF'], ['#0F9D6E', '#3FD49B'], ['#D63B5B', '#FF8FA3'],
  ['#C2780A', '#F5C26B'], ['#11154A', '#3056F4'], ['#6B5BFF', '#B49DFF'],
]
const agentGradTT = (name: string) => GRADS_TT[(name.charCodeAt(0) || 0) % GRADS_TT.length]

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
  borderRadius: 14, minHeight: 50, fontSize: 13, color: V.ink, outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
  colorScheme: 'light' as any,
  transition: 'border-color .15s, box-shadow .15s',
}

const CHAT_RESPONSES: Record<string, string> = {
  balance: 'Your current account balance is ₹2,34,500. Your savings account has earned ₹1,847 in interest this month.',
  loan: "Based on your profile, you're eligible for a Personal Loan up to ₹15 lakhs at 8.5% p.a.",
  card: 'Your HDFC Regalia Credit Card has a current outstanding of ₹12,340. Your minimum due is ₹1,234.',
  default: "I've noted your query and can assist you right away. How can I help you today?",
}

function getChatResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('balance') || lower.includes('account')) return CHAT_RESPONSES.balance
  if (lower.includes('loan') || lower.includes('borrow')) return CHAT_RESPONSES.loan
  if (lower.includes('card') || lower.includes('outstanding')) return CHAT_RESPONSES.card
  return CHAT_RESPONSES.default
}

function now(): string {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function buildMockInvokeResponse(agent: Agent, inputs: Record<string, string>): object {
  const outputSchema = agent.accessMethods?.api?.schema?.outputSchema
  if (outputSchema && outputSchema.length > 0) {
    const output: Record<string, any> = {}
    for (const field of outputSchema) {
      if (field.name === 'recommendations') output[field.name] = [{ product: 'HDFC Regalia Credit Card', reason: 'High income segment' }]
      else if (field.type === 'number') output[field.name] = 0.87
      else if (field.type === 'boolean') output[field.name] = true
      else output[field.name] = `mock_${field.name}`
    }
    return { status: 'success', latency_ms: 1240, output }
  }
  return { status: 'success', latency_ms: 1240, output: { recommendation: 'emi_restructuring', confidence: 0.87 } }
}

export function TestTab({ agent }: { agent: Agent }) {
  const addConversation = useAppStore((s) => s.addConversation)

  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'agent'; text: string; ts: string }>>([
    { role: 'agent', text: `Hi! I'm ${agent.display_name}. How can I help you today?`, ts: now() },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  const [phoneNumber, setPhoneNumber] = useState('+91-')
  const [callVariables, setCallVariables] = useState<Record<string, string>>({})
  const [callTriggered, setCallTriggered] = useState(false)

  const [voiceFlavorModal, setVoiceFlavorModal] = useState(false)
  const [voiceFlavor, setVoiceFlavor] = useState<'web' | 'telephony' | null>(null)
  const [webVoicePhase, setWebVoicePhase] = useState<'connecting' | 'listening' | 'speaking'>('connecting')
  const [webVoiceActive, setWebVoiceActive] = useState(false)
  const webTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const webVoiceStartRef = useRef<number>(0)

  const startWebVoice = () => {
    setWebVoiceActive(true)
    setWebVoicePhase('connecting')
    webVoiceStartRef.current = Date.now()
    if (webTimerRef.current) clearTimeout(webTimerRef.current)
    webTimerRef.current = setTimeout(() => {
      setWebVoicePhase('listening')
      webTimerRef.current = setTimeout(() => {
        setWebVoicePhase('speaking')
        webTimerRef.current = setTimeout(() => setWebVoicePhase('listening'), 3200)
      }, 3000)
    }, 1500)
  }

  const stopWebVoice = () => {
    if (webTimerRef.current) clearTimeout(webTimerRef.current)
    const durationMs = Date.now() - webVoiceStartRef.current
    const secs = Math.round(durationMs / 1000)
    const durStr = secs >= 60 ? `${Math.floor(secs / 60)} min ${secs % 60} sec` : `${secs} sec`
    addConversation(makeTestConv(agent, 'CALL', {
      participants: 'Web Browser',
      duration: durStr,
      durationMs,
      aiSummary: 'Web voice test session via browser mic & speakers.',
    }))
    setWebVoiceActive(false)
    setVoiceFlavor(null)
  }

  useEffect(() => () => { if (webTimerRef.current) clearTimeout(webTimerRef.current) }, [])

  const [invokeInputs, setInvokeInputs] = useState<Record<string, string>>({})
  const [invokeLoading, setInvokeLoading] = useState(false)
  const [invokeResult, setInvokeResult] = useState<string | null>(null)
  const [invokeLatency, setInvokeLatency] = useState<number | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chatMessages])

  const sendMessage = () => {
    if (!chatMessage.trim()) return
    const ts = now()
    const userText = chatMessage
    const agentText = getChatResponse(chatMessage)
    setChatMessages(prev => [...prev,
      { role: 'user', text: userText, ts },
      { role: 'agent', text: agentText, ts },
    ])
    setChatMessage('')
    addConversation(makeTestConv(agent, 'CHAT', {
      messages: [
        { role: 'user', text: userText },
        { role: 'agent', text: agentText },
      ],
      duration: '—',
      aiSummary: `Test chat: "${userText.slice(0, 80)}${userText.length > 80 ? '…' : ''}"`,
    }))
  }

  const resetChat = () => {
    setChatMessages([{ role: 'agent', text: `Hi! I'm ${agent.display_name}. How can I help you today?`, ts: now() }])
  }

  const triggerTestCall = () => {
    setCallTriggered(true)
    setTimeout(() => setCallTriggered(false), 2500)
    addConversation(makeTestConv(agent, 'CALL', {
      participants: phoneNumber,
      userPhone: phoneNumber,
      duration: '—',
      aiSummary: `Telephony test call triggered to ${phoneNumber}.`,
    }))
  }

  const runInvoke = () => {
    setInvokeLoading(true); setInvokeResult(null); setInvokeLatency(null)
    const start = Date.now()
    setTimeout(() => {
      setInvokeResult(JSON.stringify(buildMockInvokeResponse(agent, invokeInputs), null, 2))
      setInvokeLatency(Date.now() - start)
      setInvokeLoading(false)
    }, 1200)
  }

  const isChat = agent.channels.includes('CHAT')
  const isCall = agent.channels.includes('CALL')
  const hasFields = agent.fields.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Invoke Sandbox */}
      {isChat && hasFields && (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`,
          borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px',
            background: 'linear-gradient(180deg, #FAFBFE, #fff)',
            borderBottom: `1px solid ${V.line2}`,
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10,
              background: '#FFF7ED', color: '#EA580C', flexShrink: 0,
            }}>
              <Zap size={16} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Invoke Sandbox</h3>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: V.muted2 }}>Pass structured input and inspect the agent's output</p>
            </div>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {agent.fields.map((field) => (
              <div key={field.name}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: V.muted, textTransform: 'none' }}>{field.name}</code>
                  <span style={{ color: '#C8CDD8' }}>({field.type})</span>
                </label>
                <input type="text" value={invokeInputs[field.name] || ''} onChange={(e) => setInvokeInputs({ ...invokeInputs, [field.name]: e.target.value })}
                  placeholder={field.default_value || `Enter ${field.type} value…`} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
              </div>
            ))}
            <button
              onClick={runInvoke}
              disabled={invokeLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 10, border: 'none', cursor: invokeLoading ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, color: '#fff',
                background: invokeLoading ? '#9AA1B2' : `linear-gradient(135deg, ${V.primary}, ${V.primary2})`,
                boxShadow: invokeLoading ? 'none' : '0 4px 12px rgba(48,86,244,0.25)',
                transition: 'box-shadow .15s, background .15s',
                fontFamily: "'Manrope', ui-sans-serif, sans-serif",
                opacity: invokeLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!invokeLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(48,86,244,0.35)' }}
              onMouseLeave={e => { if (!invokeLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(48,86,244,0.25)' }}
            >
              {invokeLoading
                ? <><span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> Running…</>
                : <><Zap size={13} /> Run Invoke</>}
            </button>
            {invokeResult && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'JetBrains Mono', monospace" }}>Response</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10.5, padding: '2px 6px', background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7', borderRadius: 5 }}>200 OK</span>
                    {invokeLatency && <span style={{ fontSize: 10.5, color: V.muted2, fontFamily: "'JetBrains Mono', monospace" }}>{invokeLatency}ms</span>}
                  </div>
                </div>
                <pre style={{
                  fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  background: V.bg, border: `1px solid ${V.line}`,
                  borderRadius: 12, padding: '12px 14px',
                  color: V.ink, overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: 240, margin: 0,
                }}>{invokeResult}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Simulator */}
      {isChat && (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`,
          borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'linear-gradient(180deg, #FAFBFE, #fff)',
            borderBottom: `1px solid ${V.line2}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10,
                background: '#EFF6FF', color: '#3B82F6', flexShrink: 0,
              }}>
                <MessageSquare size={16} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Chat Simulator</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: V.muted2 }}>{agent.display_name}</span>
                  <span style={{ fontSize: 10.5, padding: '1px 6px', background: V.bg, color: V.muted, borderRadius: 5, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${V.line}` }}>{agent.model.llm.model_id}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetChat}><RotateCcw size={12} /> Reset</Button>
          </div>

          <div ref={scrollRef} style={{ background: V.bg, maxHeight: 280, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
                  <div style={{
                    padding: '8px 12px', fontSize: 13, lineHeight: 1.5,
                    ...(msg.role === 'user'
                      ? { background: V.primary50, border: `1px solid #C8D2FB`, color: V.primary2, borderRadius: 14, borderBottomRightRadius: 4 }
                      : { background: V.canvas, border: `1px solid ${V.line}`, color: V.ink, borderRadius: 14, borderBottomLeftRadius: 4 })
                  }}>{msg.text}</div>
                  <span style={{ fontSize: 10, color: V.muted2, marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.ts}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${V.line}`, padding: '12px 18px', display: 'flex', gap: 8 }}>
            <input
              type="text" value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message…"
              style={{ ...inputStyle, flex: 1, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}
              onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
              onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              onClick={sendMessage}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 50, height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3056F4, #6B5BFF)',
                boxShadow: '0 6px 14px -6px rgba(48,86,244,0.50)',
                color: '#fff', flexShrink: 0,
                transition: 'box-shadow .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,86,244,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(48,86,244,0.25)')}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Voice Test */}
      {isCall && (() => {
        const [g1, g2] = agentGradTT(agent.display_name)
        const waveBarStyle = (delay: string, h: number): React.CSSProperties => ({
          width: 3, height: h, borderRadius: 3,
          animation: `wvAnim 1.1s ease-in-out ${delay} infinite alternate`,
          transformOrigin: 'bottom',
        })
        return (
          <>
            <style>{`
              @keyframes wvAnim { from { transform: scaleY(0.25); opacity: 0.4; } to { transform: scaleY(1); opacity: 1; } }
              @keyframes wvSpin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Voice Flavor Modal */}
            {voiceFlavorModal && (
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(14,17,22,0.42)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                onClick={() => setVoiceFlavorModal(false)}
              >
                <div
                  style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 480, boxShadow: '0 28px 60px -12px rgba(17,21,74,0.3), 0 8px 24px -8px rgba(17,21,74,0.12)', overflow: 'hidden' }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid #EEF0F4', background: 'linear-gradient(180deg, #FAFBFE, #fff)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `linear-gradient(135deg, ${g1}, ${g2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: '0 4px 12px -4px rgba(17,21,74,0.24)' }}>
                      {agent.display_name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0E1116', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.display_name}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 5, background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB', flexShrink: 0 }}>TEST RUN</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#9AA1B2' }}>{agent.channels.join(' · ')}</p>
                    </div>
                    <button onClick={() => setVoiceFlavorModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F4F5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7385', flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>

                  {/* Modal body */}
                  <div style={{ padding: '22px 20px 20px' }}>
                    <h2 style={{ margin: '0 0 6px', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: '#0E1116', letterSpacing: '-0.01em' }}>
                      Pick voice flavor
                    </h2>
                    <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6B7385', lineHeight: 1.55 }}>
                      Both flavors run the same agent. Pick web voice unless you specifically want to test the telephony stack.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Web voice */}
                      <button
                        onClick={() => { setVoiceFlavorModal(false); setVoiceFlavor('web'); startWebVoice() }}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: '#F8F9FF', border: '1.5px solid #C8D2FB', borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background .15s, box-shadow .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#EEF1FE'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(48,86,244,0.12)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F8F9FF'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -6px rgba(48,86,244,0.50)' }}>
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

                      {/* Telephony voice */}
                      <button
                        onClick={() => { setVoiceFlavorModal(false); setVoiceFlavor('telephony') }}
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
            )}

            {/* Voice Test Card */}
            <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'linear-gradient(180deg, #FAFBFE, #fff)', borderBottom: `1px solid ${V.line2}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: '#F5F3FF', color: '#7C3AED', flexShrink: 0 }}>
                    <Phone size={16} />
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Voice Test</h3>
                    {voiceFlavor && (
                      <p style={{ margin: '1px 0 0', fontSize: 11, color: V.muted2 }}>
                        {voiceFlavor === 'web' ? 'Web voice · browser mic & speakers' : 'Telephony voice · outbound call'}
                      </p>
                    )}
                  </div>
                </div>
                {voiceFlavor && (
                  <button
                    onClick={() => { stopWebVoice(); setVoiceFlavor(null); setVoiceFlavorModal(true) }}
                    style={{ fontSize: 11.5, fontWeight: 600, color: V.muted, padding: '5px 10px', borderRadius: 8, border: `1px solid ${V.line}`, background: V.bg, cursor: 'pointer', fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}
                  >
                    Change mode
                  </button>
                )}
              </div>

              <div style={{ padding: 20 }}>
                {/* No flavor selected */}
                {voiceFlavor === null && (
                  <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Phone size={22} style={{ color: '#7C3AED' }} strokeWidth={1.5} />
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: 13, color: V.muted, lineHeight: 1.5 }}>Choose how you want to test this voice agent</p>
                    <button
                      onClick={() => setVoiceFlavorModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 11, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', boxShadow: '0 4px 12px rgba(48,86,244,0.28)', fontFamily: "'Manrope', ui-sans-serif, sans-serif", transition: 'box-shadow .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,86,244,0.38)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(48,86,244,0.28)')}
                    >
                      <Phone size={14} /> Start Voice Test
                    </button>
                  </div>
                )}

                {/* Web voice test */}
                {voiceFlavor === 'web' && (
                  <div style={{ textAlign: 'center' }}>
                    {webVoicePhase === 'connecting' ? (
                      <div style={{ padding: '24px 0 20px' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid #EEF1FE', borderTopColor: V.primary, animation: 'wvSpin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: V.ink }}>Connecting to agent…</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: V.muted2 }}>Initialising browser audio session</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: '20px 0 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: webVoicePhase === 'listening' ? '#0F9D6E' : V.primary, boxShadow: webVoicePhase === 'listening' ? '0 0 0 4px rgba(15,157,110,0.2)' : '0 0 0 4px rgba(48,86,244,0.2)' }} />
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: V.ink }}>
                              {webVoicePhase === 'listening' ? 'Listening…' : 'Agent speaking…'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: 36 }}>
                            {[28, 18, 34, 22, 30, 16, 26].map((h, i) => (
                              <div key={i} style={{
                                ...waveBarStyle(`${i * 0.12}s`, h),
                                background: webVoicePhase === 'listening'
                                  ? `linear-gradient(to top, #0F9D6E, #3FD49B)`
                                  : `linear-gradient(to top, ${g1}, ${g2})`,
                              }} />
                            ))}
                          </div>
                          <p style={{ margin: '14px 0 0', fontSize: 11.5, color: V.muted2 }}>
                            {webVoicePhase === 'listening' ? `Speak to ${agent.display_name}` : `${agent.display_name} is responding`}
                          </p>
                        </div>
                        <button
                          onClick={stopWebVoice}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#D63B5B', fontFamily: "'Manrope', ui-sans-serif, sans-serif", transition: 'background .15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                        >
                          End session
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Telephony voice */}
                {voiceFlavor === 'telephony' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>Recipient phone number</label>
                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91-9876543210"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
                      </div>
                      {agent.fields.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'JetBrains Mono', monospace" }}>Agent variables</p>
                          {agent.fields.map((field) => (
                            <div key={field.name}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: V.muted2, marginBottom: 5 }}>
                                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: V.muted }}>{field.name}</code>
                                <span>({field.type})</span>
                              </label>
                              <input type="text" value={callVariables[field.name] || ''} onChange={(e) => setCallVariables({ ...callVariables, [field.name]: e.target.value })}
                                placeholder={field.default_value || `Enter ${field.type} value…`} style={inputStyle}
                                onFocus={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                                onBlur={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={triggerTestCall}
                      disabled={callTriggered || phoneNumber.replace(/\D/g, '').length < 10}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 10, border: 'none',
                        fontSize: 13, fontWeight: 600, color: '#fff',
                        background: (callTriggered || phoneNumber.replace(/\D/g, '').length < 10) ? '#9AA1B2' : `linear-gradient(135deg, ${V.primary}, ${V.primary2})`,
                        boxShadow: (callTriggered || phoneNumber.replace(/\D/g, '').length < 10) ? 'none' : '0 4px 12px rgba(48,86,244,0.25)',
                        cursor: (callTriggered || phoneNumber.replace(/\D/g, '').length < 10) ? 'not-allowed' : 'pointer',
                        transition: 'box-shadow .15s', fontFamily: "'Manrope', ui-sans-serif, sans-serif",
                      }}
                    >
                      {callTriggered ? <><CheckCircle size={13} /> Call triggered</> : <><Phone size={13} /> Trigger Test Call</>}
                    </button>
                    {callTriggered && <p style={{ margin: '8px 0 0', fontSize: 11.5, color: V.muted2, textAlign: 'center' }}>Outbound call initiated to {phoneNumber}</p>}
                  </>
                )}
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
