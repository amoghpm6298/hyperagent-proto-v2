import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const V = {
  ink: '#0E1116', ink2: '#2B2F38', muted: '#6B7385', muted2: '#9AA1B2',
  line: '#E5E7ED', line2: '#EEF0F4', bg: '#F4F5F8',
  primary: '#3056F4', primary50: '#EEF1FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF',
}

const WAVEFORM = [4, 9, 14, 7, 18, 11, 22, 8, 16, 5, 12, 19, 7, 14, 6, 20, 10, 17, 8, 13, 5, 16, 11, 20, 7]
const WAVE_CLASSES = ['wa', 'wb', 'wc', 'wd', 'we']

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [keepSigned, setKeepSigned] = useState(true)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Manrope', ui-sans-serif, sans-serif", overflow: 'hidden' }}>
      <style>{`
        @keyframes wa { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.2)} }
        @keyframes wb { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.4)} }
        @keyframes wc { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.15)} }
        @keyframes wd { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.5)} }
        @keyframes we { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.25)} }
        .wa { animation: wa 0.9s ease-in-out infinite; }
        .wb { animation: wb 1.15s ease-in-out 0.1s infinite; }
        .wc { animation: wc 0.75s ease-in-out 0.25s infinite; }
        .wd { animation: wd 1.35s ease-in-out 0.08s infinite; }
        .we { animation: we 1.0s ease-in-out 0.35s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor { animation: blink 1s step-end infinite; }
        .signin-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .signin-btn { transition: opacity .15s, transform .15s; }
        .input-field:focus { outline: none; border-color: #3056F4 !important; box-shadow: 0 0 0 3px rgba(48,86,244,0.12) !important; }
      `}</style>

      {/* ── Left panel ── */}
      <div style={{
        flex: '0 0 56%', position: 'relative', overflow: 'hidden',
        background: '#F3F4FF',
        backgroundImage: [
          'radial-gradient(circle, rgba(48,86,244,0.07) 1px, transparent 1px)',
          'radial-gradient(ellipse 700px 500px at 85% 15%, rgba(107,91,255,0.13) 0%, transparent 65%)',
          'radial-gradient(ellipse 400px 400px at 10% 85%, rgba(15,157,110,0.06) 0%, transparent 60%)',
        ].join(', '),
        backgroundSize: '28px 28px, auto, auto',
        display: 'flex', flexDirection: 'column',
        padding: '32px 48px 28px',
      }}>

        {/* Decorative concentric circles */}
        <div style={{ position: 'absolute', top: 60, right: 60, pointerEvents: 'none' }}>
          {[120, 90, 62, 38].map((size, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: size, height: size, borderRadius: '50%',
              border: `1px solid rgba(48,86,244,${0.06 + i * 0.03})`,
            }} />
          ))}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(48,86,244,0.25)',
          }} />
        </div>

        {/* Accent dot */}
        <div style={{ position: 'absolute', top: 280, right: 200, width: 6, height: 6, borderRadius: '50%', background: 'rgba(48,86,244,0.3)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 200, left: 120, width: 5, height: 5, borderRadius: '50%', background: 'rgba(15,157,110,0.4)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #1A2750, #3056F4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16,
          }}>H</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: V.ink, letterSpacing: '-0.02em' }}>HyperAgent</span>
        </div>

        {/* Hero text */}
        <div style={{ flex: 1 }}>
          {/* Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 13px', borderRadius: 999,
            background: '#fff', border: `1px solid ${V.line}`,
            fontSize: 11, fontWeight: 700, color: V.ink2, letterSpacing: '0.06em',
            marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: V.emerald }} />
            THE AI AGENT PLATFORM
          </div>

          <h1 style={{ margin: '0 0 4px', fontSize: 38, fontWeight: 900, color: V.ink, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Voice &amp; chat agents,
          </h1>
          <h1 style={{ margin: '0 0 18px', fontSize: 40, fontWeight: 400, fontStyle: 'italic', color: V.muted, lineHeight: 1.1, fontFamily: "'Instrument Serif', Georgia, serif" }}>
            production-ready in days.
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: 14.5, color: V.muted, lineHeight: 1.7, maxWidth: 480 }}>
            Build, deploy, and supervise AI agents across every channel your<br />
            customers use — voice, WhatsApp, web, and beyond.
          </p>

          {/* Live call widget — GIF placeholder with CSS animation */}
          <div style={{
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(17,21,74,0.15), 0 2px 8px rgba(17,21,74,0.08)',
            maxWidth: 420, background: '#fff',
          }}>
            {/* Agent header */}
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #EEF0F4' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #3056F4, #6B5BFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 16,
              }}>O</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: V.ink }}>Onboarding Agent</div>
                <div style={{ fontSize: 11.5, color: V.muted, marginTop: 1 }}>Voice · KYC + Compliance</div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 999,
                background: '#ECFDF5', fontSize: 11, fontWeight: 700, color: '#047857',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#047857' }} />
                ON CALL
              </div>
            </div>

            {/* Waveform */}
            <div style={{ padding: '14px 18px 10px', background: '#fff' }}>
              <svg width="360" height="36" viewBox="0 0 360 36" style={{ display: 'block', width: '100%' }}>
                {WAVEFORM.map((h, i) => (
                  <rect
                    key={i}
                    x={i * 14 + 2} y={(36 - h) / 2}
                    width={8} height={h} rx={3}
                    fill="#3056F4"
                    className={WAVE_CLASSES[i % 5]}
                    style={{ transformOrigin: `${i * 14 + 6}px 18px`, opacity: 0.85 }}
                  />
                ))}
              </svg>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '6px 18px 12px', fontSize: 11.5, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              <span><strong style={{ color: V.ink }}>02:14</strong> elapsed</span>
              <span>turn <strong style={{ color: V.ink }}>14 / 18</strong></span>
              <span>p99 <strong style={{ color: '#047857' }}>84ms</strong></span>
            </div>

            {/* Live transcript */}
            <div style={{ background: '#F8F9FD', borderTop: '1px solid #EEF0F4', padding: '12px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: V.muted2, letterSpacing: '0.06em' }}>LIVE TRANSCRIPT</span>
                <span style={{ fontSize: 10, color: V.muted2, fontFamily: "'JetBrains Mono', monospace" }}>en-IN · hi-IN</span>
              </div>
              {/* Customer bubble */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E5E7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: V.muted, flexShrink: 0, marginTop: 2 }}>P</div>
                <div style={{ background: '#fff', borderRadius: '12px 12px 12px 3px', padding: '9px 12px', fontSize: 12.5, color: V.ink, lineHeight: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: 280 }}>
                  Yeah I'd like to upgrade my card. Can you check what I'm eligible for?
                </div>
              </div>
              {/* Agent bubble */}
              <div style={{ display: 'flex', gap: 8, flexDirection: 'row-reverse' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #3056F4, #6B5BFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2 }}>O</div>
                <div style={{ background: V.primary50, borderRadius: '12px 12px 3px 12px', padding: '9px 12px', fontSize: 12.5, color: V.ink, lineHeight: 1.5, maxWidth: 260 }}>
                  One sec — pulling your eligibility now.<span className="cursor" style={{ color: V.primary }}>|</span>
                </div>
              </div>
            </div>

            {/* Tool call */}
            <div style={{ background: '#0E1116', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>&lt;/&gt;</span>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: '#E2E8F0' }}>
                    <span style={{ color: '#60A5FA' }}>tools</span>
                    <span style={{ color: '#94A3B8' }}>.</span>
                    <span style={{ color: '#86EFAC' }}>card_eligibility</span>
                    <span style={{ color: '#94A3B8' }}>(customer_id)</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>200 OK · 412ms · 3 plans returned</div>
                </div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #334155', borderTopColor: '#60A5FA', animation: 'spin 1s linear infinite' }} />
            </div>
          </div>

          {/* Ships to */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: V.muted2, letterSpacing: '0.07em', textTransform: 'uppercase' }}>SHIPS TO</span>
            {[
              { label: 'WhatsApp', color: '#25D366', bg: '#E8FBF0', icon: '💬' },
              { label: 'Voice', color: '#3056F4', bg: '#EEF1FE', icon: '📞' },
              { label: 'Web', color: '#0891B2', bg: '#ECFEFF', icon: '🌐' },
              { label: 'SMS', color: '#7C3AED', bg: '#F5F3FF', icon: '📱' },
            ].map(ch => (
              <div key={ch.label} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 999, background: ch.bg,
                fontSize: 12, fontWeight: 600, color: ch.color,
              }}>
                {ch.label}
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 20, borderTop: `1px solid rgba(14,17,22,0.08)`, marginTop: 20 }}>
          {['PCI DSS 4', 'ISO 27001', 'GDPR & DPDP'].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: V.muted2, fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#9AA1B2" strokeWidth="1"/><path d="M4 6.5l1.8 1.8L9 4.5" stroke="#9AA1B2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {b}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: V.emerald }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: V.emerald }} />
            99.99% uptime
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 56px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: V.ink, letterSpacing: '-0.025em' }}>
            Sign in to your workspace
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: V.muted, lineHeight: 1.6 }}>
            Use your work email or continue with your SSO provider.
          </p>

          {/* Google SSO */}
          <button disabled style={{
            width: '100%', padding: '11px 16px', borderRadius: 12,
            border: `1.5px solid ${V.line}`, background: '#fff', cursor: 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 14, fontWeight: 600, color: V.ink2, fontFamily: 'inherit',
            opacity: 0.8, marginBottom: 6,
          }}>
            {/* Google G */}
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: V.bg, color: V.muted2, letterSpacing: '0.05em', marginLeft: 4 }}>COMING SOON</span>
          </button>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: V.line }} />
            <span style={{ fontSize: 12, color: V.muted2, fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: V.line }} />
          </div>

          <form onSubmit={e => { e.preventDefault(); navigate('/dashboard') }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: V.ink, display: 'block', marginBottom: 7 }}>Work email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#9AA1B2" strokeWidth="1.2"/><path d="M1 5.5l7 4 7-4" stroke="#9AA1B2" strokeWidth="1.2"/></svg>
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-field"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px 11px 38px', borderRadius: 12,
                    border: `1.5px solid ${V.line}`, fontSize: 13.5, color: V.ink,
                    background: V.bg, fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>Password</label>
                <button type="button" style={{ fontSize: 12.5, fontWeight: 600, color: V.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#9AA1B2" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 016 0v2" stroke="#9AA1B2" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="input-field"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 40px 11px 38px', borderRadius: 12,
                    border: `1.5px solid ${V.line}`, fontSize: 13.5, color: V.ink,
                    background: V.bg, fontFamily: 'inherit',
                  }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: V.muted2,
                }}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="#9AA1B2" strokeWidth="1.2"/><circle cx="8" cy="8" r="1.5" stroke="#9AA1B2" strokeWidth="1.2"/><line x1="2" y1="2" x2="14" y2="14" stroke="#9AA1B2" strokeWidth="1.2"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="#9AA1B2" strokeWidth="1.2"/><circle cx="8" cy="8" r="1.5" stroke="#9AA1B2" strokeWidth="1.2"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Keep signed in */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setKeepSigned(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  background: keepSigned ? V.primary : '#fff',
                  border: `1.5px solid ${keepSigned ? V.primary : V.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}
              >
                {keepSigned && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13, color: V.ink2, fontWeight: 500 }}>Keep me signed in on this device</span>
            </label>

            {/* Submit */}
            <button type="submit" className="signin-btn" style={{
              width: '100%', padding: '13px 16px', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #3056F4, #1F3FE0)',
              color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 6px 20px -4px rgba(48,86,244,0.45)',
              marginTop: 4,
            }}>
              Sign in
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </form>

          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: V.muted }}>
            New to HyperAgent?{' '}
            <button style={{ fontSize: 13, fontWeight: 700, color: V.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Request access
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
