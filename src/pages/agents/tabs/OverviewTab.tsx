import React, { useState, useRef, useEffect } from 'react'
import { Agent } from '../../../types'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/Input'
import { useAppStore } from '../../../store'
import { Edit2, Check, X, BookOpen, Cpu, TrendingUp, Wrench, Sparkles, AlertTriangle, XCircle, Lightbulb, CheckCircle as CheckCircleIcon } from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF', emeraldBorder: '#6EE7B7',
  amber: '#C2780A', amber50: '#FBF1DA', amberBorder: '#FCD34D',
  rose: '#D63B5B', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

const baseCardShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'

function SubCard({ icon, title, badge, children }: { icon: React.ReactNode; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: baseCardShadow }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
        background: 'linear-gradient(180deg, #FAFBFE, #fff)', borderBottom: `1px solid ${V.line2}`,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: V.primary50, color: V.primary, flexShrink: 0 }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>{title}</p>
        {badge && <span style={{ marginLeft: 'auto', fontSize: 10.5, color: V.muted2 }}>{badge}</span>}
      </div>
      <div style={{ padding: '14px 18px' }}>{children}</div>
    </div>
  )
}

type RecommendationVariant = 'error' | 'warning' | 'info' | 'success'

const variantConfig: Record<RecommendationVariant, { bg: string; border: string; iconColor: string }> = {
  error:   { bg: '#FEF2F2', border: '#FCA5A5', iconColor: '#DC2626' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', iconColor: '#D97706' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', iconColor: '#2563EB' },
  success: { bg: '#F0FDF4', border: '#6EE7B7', iconColor: '#059669' },
}

const SCAN_STEPS = [
  'Reading prompt structure…',
  'Analysing 7-day call data…',
  'Detecting intent gaps…',
  'Generating recommendations…',
]

function PromptSuggestionsPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const isCall = agent.channels.includes('CALL')
  const [phase, setPhase] = useState<'loading' | 'done'>('loading')
  const [scanStep, setScanStep] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)

  const recommendations = isCall
    ? [
        { variant: 'error' as const,   icon: <XCircle size={14} />,         title: 'High drop rate during eligibility step',     finding: '12% of calls drop between greeting and account verification — avg at 38 seconds.', recommendation: 'Shorten the verification prompt. Move account number collection earlier.',     affected: '~12% of calls' },
        { variant: 'warning' as const, icon: <AlertTriangle size={14} />,   title: 'Silence gaps above 3s detected',             finding: 'Avg 4.1s silence gap after agent asks for registered mobile number.',             recommendation: 'Add a clarification prompt and enable barge-in so users can respond mid-flow.', affected: '28% of calls' },
        { variant: 'info' as const,    icon: <Lightbulb size={14} />,       title: 'Off-script request: balance check',          finding: 'Users frequently ask for account balance mid-call — not in current script.',        recommendation: 'Add a balance-check intent handler or early branch after greeting.',            affected: '~9% of calls' },
        { variant: 'success' as const, icon: <CheckCircleIcon size={14} />, title: 'Strong conversion on EMI offers',            finding: 'EMI restructuring offers accepted in 64% of eligible calls.',                        recommendation: 'Performing well. Consider A/B testing a shorter offer pitch.',                  affected: '31% of connected calls' },
      ]
    : [
        { variant: 'warning' as const, icon: <AlertTriangle size={14} />,   title: 'High frustration on loan queries',           finding: 'Avg irate score 6.4/10 when users ask about loan eligibility.',                     recommendation: 'Add explicit eligibility criteria and income thresholds to your system prompt.', affected: '22% of conversations' },
        { variant: 'error' as const,   icon: <XCircle size={14} />,         title: '12% unresolved conversations',               finding: '578 conversations ended without clear resolution in the last 7 days.',                recommendation: 'Add a human escalation fallback with a contact number.',                         affected: '578 conversations' },
        { variant: 'info' as const,    icon: <Lightbulb size={14} />,       title: 'Frequent intent: minimum balance queries',   finding: 'Users frequently ask about minimum balance requirements.',                           recommendation: 'Add minimum balance info to knowledge base or system prompt.',                   affected: '~8% of conversations' },
        { variant: 'success' as const, icon: <CheckCircleIcon size={14} />, title: 'Strong credit card query performance',       finding: 'Credit card queries have avg quality score of 91/100.',                              recommendation: 'Your prompt handles this well. Use as a model for other intents.',               affected: '18% of conversations' },
      ]

  useEffect(() => {
    let step = 0
    const stepInterval = setInterval(() => {
      step++
      if (step < SCAN_STEPS.length) {
        setScanStep(step)
      } else {
        clearInterval(stepInterval)
        setTimeout(() => {
          setPhase('done')
          // stagger each card in
          recommendations.forEach((_, i) => {
            setTimeout(() => setVisibleCount(i + 1), i * 180)
          })
        }, 300)
      }
    }, 520)
    return () => clearInterval(stepInterval)
  }, [])

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      width: 370,
      background: V.canvas,
      borderRadius: 16,
      border: `1px solid ${V.line}`,
      boxShadow: '0 24px 64px -12px rgba(17,21,74,0.20), 0 4px 16px -4px rgba(17,21,74,0.10)',
      zIndex: 50,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Animated gradient top stripe */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #3056F4, #7C3AED, #0F9D6E, #3056F4)',
        backgroundSize: '200% 100%',
        animation: phase === 'loading' ? 'shimmer 1.4s linear infinite' : 'none',
      }} />

      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
        @keyframes pulse-dot { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes fade-slide-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px',
        background: 'linear-gradient(135deg, #EEF1FE 0%, #F5F3FF 100%)',
        borderBottom: `1px solid ${V.line}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #3056F4, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(48,86,244,0.3)',
            animation: phase === 'loading' ? 'spin-slow 3s linear infinite' : 'none',
          }}>
            <Sparkles size={15} style={{ color: '#fff' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: V.ink, letterSpacing: '-0.01em' }}>AI Prompt Suggestions</p>
            <p style={{ margin: 0, fontSize: 10.5, color: '#7C3AED', fontWeight: 600 }}>
              {phase === 'loading' ? SCAN_STEPS[scanStep] : `${recommendations.length} improvements found`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'rgba(17,21,74,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: V.muted, transition: 'background .15s', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(17,21,74,0.13)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(17,21,74,0.07)')}
        ><X size={12} /></button>
      </div>

      {/* Loading state */}
      {phase === 'loading' && (
        <div style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Scanning animation */}
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid #EEF1FE',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#3056F4',
              borderRightColor: '#7C3AED',
              animation: 'spin-slow 1s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 8, borderRadius: '50%',
              border: '1.5px solid transparent',
              borderTopColor: '#7C3AED',
              animation: 'spin-slow .7s linear infinite reverse',
            }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={20} style={{ color: '#3056F4' }} />
            </div>
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            {SCAN_STEPS.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: i <= scanStep ? 1 : 0.3,
                transition: 'opacity .3s',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: i < scanStep ? 'linear-gradient(135deg, #0F9D6E, #3FD49B)' : i === scanStep ? 'linear-gradient(135deg, #3056F4, #7C3AED)' : V.line,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .3s',
                }}>
                  {i < scanStep
                    ? <CheckCircleIcon size={11} style={{ color: '#fff' }} />
                    : i === scanStep
                    ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse-dot 1s ease-in-out infinite' }} />
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: V.muted2 }} />
                  }
                </div>
                <span style={{ fontSize: 12, fontWeight: i === scanStep ? 700 : 500, color: i <= scanStep ? V.ink : V.muted2 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'done' && (
        <div style={{ overflowY: 'auto', maxHeight: 420, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommendations.map((rec, i) => {
            const cfg = variantConfig[rec.variant]
            const visible = i < visibleCount
            return (
              <div key={i} style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 12,
                padding: '11px 13px',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity .25s ease, transform .25s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 6 }}>
                  <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }}>{rec.icon}</span>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{rec.title}</p>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 11.5, color: V.muted, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: V.ink2 }}>Finding:</span> {rec.finding}
                </p>
                <p style={{ margin: '0 0 7px', fontSize: 11.5, color: V.muted, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: V.ink2 }}>Fix:</span> {rec.recommendation}
                </p>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.06)', color: V.muted }}>
                  {rec.affected}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function OverviewTab({ agent }: { agent: Agent }) {
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [promptDraft, setPromptDraft] = useState(agent.system_prompt)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    if (showSuggestions) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSuggestions])

  const savePrompt = () => {
    useAppStore.setState((s) => ({
      agents: s.agents.map((a) => a.id === agent.id ? { ...a, system_prompt: promptDraft } : a),
    }))
    setEditingPrompt(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Stats row */}
      {(() => {
        const qualityScore = 87
        const successRate = 94
        const stats = [
          {
            label: 'Invocations Today',
            value: agent.invocationsToday.toLocaleString(),
            sub: 'calls today',
          },
          {
            label: 'Avg Quality Score',
            value: String(qualityScore),
            sub: 'out of 100',
          },
          {
            label: 'Success Rate',
            value: `${successRate}%`,
            sub: 'calls completed',
          },
        ]
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, padding: '16px 18px', boxShadow: baseCardShadow }}>
                <p style={{ margin: '0 0 6px', fontSize: 10.5, fontWeight: 700, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stat.label}</p>
                <p style={{ margin: '0 0 2px', fontSize: 28, fontWeight: 800, color: V.ink, letterSpacing: '-0.03em' }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: V.muted }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        )
      })()}

      {/* System Prompt */}
      <div style={{ background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, boxShadow: baseCardShadow }}>
        <div
          ref={panelRef}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'linear-gradient(180deg, #FAFBFE, #fff)',
            borderBottom: `1px solid ${V.line2}`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: V.primary50, color: V.primary, flexShrink: 0 }}>
              <BookOpen size={16} />
            </span>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>System Prompt</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Suggestions button + panel */}
            <div>
              <button
                onClick={() => setShowSuggestions(v => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 11px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: 'linear-gradient(135deg, #EEF1FE, #F5F3FF)',
                  color: V.primary, border: `1px solid ${V.primary100}`,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'box-shadow .15s, transform .1s',
                  boxShadow: showSuggestions ? '0 0 0 3px rgba(48,86,244,0.12)' : 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(48,86,244,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { if (!showSuggestions) e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Sparkles size={12} />
                Suggestions
              </button>

              {showSuggestions && (
                <PromptSuggestionsPanel agent={agent} onClose={() => setShowSuggestions(false)} />
              )}
            </div>

            {!editingPrompt ? (
              <Button variant="ghost" size="sm" onClick={() => { setPromptDraft(agent.system_prompt); setEditingPrompt(true) }}>
                <Edit2 size={12} /> Edit
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Button variant="ghost" size="sm" onClick={() => setEditingPrompt(false)}><X size={13} /></Button>
                <Button variant="primary" size="sm" onClick={savePrompt}><Check size={12} /> Save</Button>
              </div>
            )}
          </div>
        </div>

        {editingPrompt ? (
          <TextArea
            value={promptDraft}
            onChange={(e) => setPromptDraft(e.target.value)}
            style={{ border: 'none', borderRadius: 0, minHeight: 200, fontSize: 13, lineHeight: 1.6, background: V.canvas }}
          />
        ) : (
          <pre style={{
            padding: '14px 18px',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'pre-wrap', lineHeight: 1.6,
            maxHeight: 240, overflowY: 'auto',
            background: '#1A1D27',
            color: '#E2E8F0',
            borderRadius: 14,
            border: `1px solid #2D3148`,
            margin: '14px 18px',
          }}>
            {agent.system_prompt}
          </pre>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Configuration */}
        <SubCard icon={<Cpu size={16} />} title="Configuration">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Channel',   value: agent.channels.join(', ') },
              { label: 'LLM',       value: agent.model.llm.model_id },
              { label: 'Language',  value: agent.language_code },
              ...(agent.channels.includes('CALL') ? [
                { label: 'Pipeline',  value: agent.is_realtime_api ? 'Gemini Live (Realtime)' : 'Standard STT + LLM + TTS' },
                { label: 'Direction', value: agent.is_inbound ? 'Inbound' : 'Outbound' },
              ] : []),
              ...(agent.rag_enabled ? [{ label: 'RAG', value: `Top ${agent.rag_config.top_k} results` }] : []),
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: V.muted, flexShrink: 0 }}>{row.label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: V.ink, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{row.value}</p>
              </div>
            ))}
          </div>
        </SubCard>

        {/* Knowledge base + variables + tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {agent.knowledge_base_list.length > 0 && (
            <SubCard icon={<BookOpen size={16} />} title="Knowledge Base" badge={`${agent.knowledge_base_list.length} docs`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agent.knowledge_base_list.map((kb) => (
                  <div key={kb.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: V.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kb.file_name}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, marginLeft: 8, flexShrink: 0,
                      ...(kb.status === 'READY' ? { background: '#ECFDF5', color: '#065F46' } : { background: '#FFFBEB', color: '#92400E' })
                    }}>{kb.status}</span>
                  </div>
                ))}
              </div>
            </SubCard>
          )}

          {agent.fields.length > 0 && (
            <SubCard icon={<TrendingUp size={16} />} title="Variables" badge={String(agent.fields.length)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {agent.fields.map((f) => (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: V.ink }}>{f.name}</code>
                    <span style={{ fontSize: 10.5, color: V.muted, background: V.bg, padding: '2px 6px', borderRadius: 5, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${V.line}` }}>{f.type}</span>
                  </div>
                ))}
              </div>
            </SubCard>
          )}

          {agent.functions.length > 0 && (
            <SubCard icon={<Wrench size={16} />} title="Tools" badge={String(agent.functions.length)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agent.functions.map((fn) => (
                  <div key={fn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <code style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: V.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fn.name}</code>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, flexShrink: 0,
                        ...(fn.type === 'query' ? { background: '#EFF6FF', color: '#1D4ED8' } : { background: '#F5F3FF', color: '#6D28D9' })
                      }}>{fn.type}</span>
                    </div>
                    {fn.pre_execute && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: '#FFFBEB', color: '#92400E', flexShrink: 0 }}>pre-execute</span>
                    )}
                  </div>
                ))}
              </div>
            </SubCard>
          )}
        </div>
      </div>
    </div>
  )
}
