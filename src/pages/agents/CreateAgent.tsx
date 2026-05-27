import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Agent, AgentField, AgentFieldType } from '../../types'
import { Sidebar } from '../../components/layout/Sidebar'

// ─── CSS variable token values ─────────────────────────────────────────────
// --bg:#F4F5F8  --canvas:#fff  --ink:#0E1116  --ink-2:#2B2F38
// --muted:#6B7385  --muted-2:#9AA1B2  --line:#E5E7ED  --line-2:#EEF0F4
// --primary:#3056F4  --primary-2:#1F3FE0  --primary-50:#EEF1FE  --primary-100:#DCE2FE
// --navy:#11154A  --accent:#6B5BFF
// --emerald:#0F9D6E  --emerald-50:#E6F6EF
// --amber:#C2780A  --amber-50:#FBF1DA
// --rose:#D63B5B

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  navy: '#11154A', accent: '#6B5BFF',
  emerald: '#0F9D6E', emerald50: '#E6F6EF',
  amber: '#C2780A', amber50: '#FBF1DA',
  rose: '#D63B5B',
}

// ─── Shared button styles ──────────────────────────────────────────────────
const btnSecondary: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  background: '#fff', color: V.ink2, border: `1px solid ${V.line}`, cursor: 'pointer',
  fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
  background: V.primary, color: '#fff', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit',
}

// ─── Stage definitions ─────────────────────────────────────────────────────
const STAGES = [
  { id: 'identity',          num: '01', title: 'Identity',               summary: 'Name, avatar, description' },
  { id: 'persona',           num: '02', title: 'Persona & Intelligence', summary: 'Model stack, system prompt, voice & tone' },
  { id: 'knowledge_params',  num: '03', title: 'Knowledge & Parameters', summary: 'Docs, retrieval, context variables' },
  { id: 'tools',             num: '04', title: 'Tools',                  summary: 'Tool calls available in the flow' },
  { id: 'channel_config',    num: '05', title: 'Channel Config',         summary: 'Greeting, fallback, handoff, channels' },
  { id: 'guardrails_launch', num: '06', title: 'Guardrails & Launch',    summary: 'Rules, active hours, test & deploy' },
]

// ─── Constants ─────────────────────────────────────────────────────────────
const AVATARS = [
  { id: 'a1', grad: ['#3056F4', '#6B5BFF'], glyph: 'R' },
  { id: 'a2', grad: ['#0F9D6E', '#3FD49B'], glyph: 'M' },
  { id: 'a3', grad: ['#D63B5B', '#FF8FA3'], glyph: 'P' },
  { id: 'a4', grad: ['#C2780A', '#F5C26B'], glyph: 'A' },
  { id: 'a5', grad: ['#11154A', '#3056F4'], glyph: 'N' },
  { id: 'a6', grad: ['#6B5BFF', '#B49DFF'], glyph: 'S' },
]

const MODELS = {
  s2s: [
    { id: 'gpt-4o-realtime',  label: 'gpt-4o-realtime',       provider: 'OpenAI',  meta: 'Realtime · 200ms' },
    { id: 'gemini-live-2.5',  label: 'gemini-2.5-flash-live', provider: 'Google',  meta: 'Realtime · multimodal' },
  ],
  stt: [
    { id: 'sarvam-asr-v2',    label: 'sarvam-asr-v2',         provider: 'Sarvam',   meta: '12 Indic langs · 180ms' },
    { id: 'whisper-large-v3', label: 'whisper-large-v3',       provider: 'OpenAI',  meta: '99 langs · high accuracy' },
    { id: 'deepgram-nova-3',  label: 'nova-3',                 provider: 'Deepgram', meta: 'Streaming · 120ms' },
  ],
  llm: [
    { id: 'gpt-4o',           label: 'gpt-4o',                 provider: 'OpenAI',     meta: '128k ctx · $2.50/Mtok' },
    { id: 'claude-sonnet-4',  label: 'claude-sonnet-4',        provider: 'Anthropic',  meta: '200k ctx · $3/Mtok' },
    { id: 'gemini-2.5-pro',   label: 'gemini-2.5-pro',         provider: 'Google',     meta: '1M ctx · $1.25/Mtok' },
    { id: 'llama-3.3-70b',    label: 'llama-3.3-70b',          provider: 'Self-hosted', meta: 'On Hyperface infra' },
  ],
  tts: [
    { id: 'gemini-2.5-tts',   label: 'gemini-2.5-tts',         provider: 'Google',     meta: '30 voices · 24 langs' },
    { id: 'sarvam-tts',       label: 'sarvam-tts',             provider: 'Sarvam',     meta: 'Indic-native · 6 voices' },
    { id: 'elevenlabs-turbo', label: 'eleven-turbo-v3',         provider: 'ElevenLabs', meta: 'Low-latency · 6 voices' },
    { id: 'openai-tts-1',     label: 'tts-1-hd',               provider: 'OpenAI',     meta: 'HQ · 6 voices' },
  ],
}

const VOICES = [
  // Gemini 2.5 TTS — 30 voices
  { id: 'gemini-zephyr',        display: 'zephyr',        style: 'Bright',         gender: 'F', provider: 'gemini-2.5-tts', grad: ['#F5B342','#F7C870'] as [string,string] },
  { id: 'gemini-puck',          display: 'puck',          style: 'Upbeat',         gender: 'M', provider: 'gemini-2.5-tts', grad: ['#FF8A3D','#FFB07A'] as [string,string] },
  { id: 'gemini-charon',        display: 'charon',        style: 'Informative',    gender: 'M', provider: 'gemini-2.5-tts', grad: ['#11154A','#3056F4'] as [string,string] },
  { id: 'gemini-kore',          display: 'kore',          style: 'Firm',           gender: 'F', provider: 'gemini-2.5-tts', grad: ['#1A2750','#3F5BD1'] as [string,string] },
  { id: 'gemini-fenrir',        display: 'fenrir',        style: 'Excitable',      gender: 'M', provider: 'gemini-2.5-tts', grad: ['#9333EA','#C77DFF'] as [string,string] },
  { id: 'gemini-leda',          display: 'leda',          style: 'Youthful',       gender: 'F', provider: 'gemini-2.5-tts', grad: ['#8B5CF6','#B794F4'] as [string,string] },
  { id: 'gemini-orus',          display: 'orus',          style: 'Firm',           gender: 'M', provider: 'gemini-2.5-tts', grad: ['#1E293B','#3F5BD1'] as [string,string] },
  { id: 'gemini-aoede',         display: 'aoede',         style: 'Breezy',         gender: 'F', provider: 'gemini-2.5-tts', grad: ['#9333EA','#A78BFA'] as [string,string] },
  { id: 'gemini-callirrhoe',    display: 'callirrhoe',    style: 'Easy-going',     gender: 'F', provider: 'gemini-2.5-tts', grad: ['#059669','#34D399'] as [string,string] },
  { id: 'gemini-autonoe',       display: 'autonoe',       style: 'Bright',         gender: 'F', provider: 'gemini-2.5-tts', grad: ['#D97706','#FCD34D'] as [string,string] },
  { id: 'gemini-enceladus',     display: 'enceladus',     style: 'Breathy',        gender: 'M', provider: 'gemini-2.5-tts', grad: ['#7C3AED','#A78BFA'] as [string,string] },
  { id: 'gemini-iapetus',       display: 'iapetus',       style: 'Clear',          gender: 'M', provider: 'gemini-2.5-tts', grad: ['#1D4ED8','#60A5FA'] as [string,string] },
  { id: 'gemini-umbriel',       display: 'umbriel',       style: 'Easy-going',     gender: 'M', provider: 'gemini-2.5-tts', grad: ['#0891B2','#38BDF8'] as [string,string] },
  { id: 'gemini-algieba',       display: 'algieba',       style: 'Smooth',         gender: 'M', provider: 'gemini-2.5-tts', grad: ['#4338CA','#818CF8'] as [string,string] },
  { id: 'gemini-despina',       display: 'despina',       style: 'Smooth',         gender: 'F', provider: 'gemini-2.5-tts', grad: ['#6D28D9','#A78BFA'] as [string,string] },
  { id: 'gemini-erinome',       display: 'erinome',       style: 'Clear',          gender: 'F', provider: 'gemini-2.5-tts', grad: ['#2563EB','#93C5FD'] as [string,string] },
  { id: 'gemini-algenib',       display: 'algenib',       style: 'Gravelly',       gender: 'M', provider: 'gemini-2.5-tts', grad: ['#374151','#6B7280'] as [string,string] },
  { id: 'gemini-rasalgethi',    display: 'rasalgethi',    style: 'Informative',    gender: 'M', provider: 'gemini-2.5-tts', grad: ['#1E3A5F','#2563EB'] as [string,string] },
  { id: 'gemini-laomedeia',     display: 'laomedeia',     style: 'Upbeat',         gender: 'F', provider: 'gemini-2.5-tts', grad: ['#EA580C','#FB923C'] as [string,string] },
  { id: 'gemini-achernar',      display: 'achernar',      style: 'Soft',           gender: 'F', provider: 'gemini-2.5-tts', grad: ['#DB2777','#F472B6'] as [string,string] },
  { id: 'gemini-alnilam',       display: 'alnilam',       style: 'Firm',           gender: 'M', provider: 'gemini-2.5-tts', grad: ['#0F172A','#334155'] as [string,string] },
  { id: 'gemini-schedar',       display: 'schedar',       style: 'Even',           gender: 'M', provider: 'gemini-2.5-tts', grad: ['#475569','#94A3B8'] as [string,string] },
  { id: 'gemini-gacrux',        display: 'gacrux',        style: 'Mature',         gender: 'M', provider: 'gemini-2.5-tts', grad: ['#1E293B','#475569'] as [string,string] },
  { id: 'gemini-pulcherrima',   display: 'pulcherrima',   style: 'Forward',        gender: 'F', provider: 'gemini-2.5-tts', grad: ['#B45309','#FBBF24'] as [string,string] },
  { id: 'gemini-achird',        display: 'achird',        style: 'Friendly',       gender: 'F', provider: 'gemini-2.5-tts', grad: ['#047857','#34D399'] as [string,string] },
  { id: 'gemini-zubenelgenubi', display: 'zubenelgenubi', style: 'Casual',         gender: 'M', provider: 'gemini-2.5-tts', grad: ['#4B5563','#9CA3AF'] as [string,string] },
  { id: 'gemini-vindemiatrix',  display: 'vindemiatrix',  style: 'Gentle',         gender: 'F', provider: 'gemini-2.5-tts', grad: ['#7C3AED','#C4B5FD'] as [string,string] },
  { id: 'gemini-sadachbia',     display: 'sadachbia',     style: 'Lively',         gender: 'M', provider: 'gemini-2.5-tts', grad: ['#DC2626','#F87171'] as [string,string] },
  { id: 'gemini-sadaltager',    display: 'sadaltager',    style: 'Knowledgeable',  gender: 'M', provider: 'gemini-2.5-tts', grad: ['#1E40AF','#3B82F6'] as [string,string] },
  { id: 'gemini-sulafat',       display: 'sulafat',       style: 'Warm',           gender: 'F', provider: 'gemini-2.5-tts', grad: ['#B45309','#F59E0B'] as [string,string] },
  // Sarvam
  { id: 'sarvam-meera',         display: 'meera',         style: 'Warm',           gender: 'F', provider: 'sarvam-tts',     grad: ['#3056F4','#6B5BFF'] as [string,string] },
  { id: 'sarvam-arjun',         display: 'arjun',         style: 'Firm',           gender: 'M', provider: 'sarvam-tts',     grad: ['#11154A','#3056F4'] as [string,string] },
  // OpenAI
  { id: 'openai-nova',          display: 'nova',          style: 'Friendly',       gender: 'F', provider: 'openai-tts-1',   grad: ['#15803D','#4ADE80'] as [string,string] },
  { id: 'openai-alloy',         display: 'alloy',         style: 'Neutral',        gender: 'M', provider: 'openai-tts-1',   grad: ['#334155','#64748B'] as [string,string] },
  { id: 'openai-shimmer',       display: 'shimmer',       style: 'Soft',           gender: 'F', provider: 'openai-tts-1',   grad: ['#D6336C','#F08FB3'] as [string,string] },
]

const TOOL_REGISTRY = [
  { id: 'get_account_balance',   name: 'get_account_balance',   cat: 'Accounts',      desc: 'Fetches the current account balance for a given customer ID.' },
  { id: 'lookup_transaction',    name: 'lookup_transaction',    cat: 'Accounts',      desc: 'Searches recent transactions by reference ID, date range or amount.' },
  { id: 'get_account_summary',   name: 'get_account_summary',   cat: 'Accounts',      desc: 'Returns a 30-day summary of credits, debits and pending charges.' },
  { id: 'list_linked_accounts',  name: 'list_linked_accounts',  cat: 'Accounts',      desc: 'Lists all savings, current and deposit accounts linked to a customer.' },
  { id: 'fetch_kyc_status',      name: 'fetch_kyc_status',      cat: 'KYC',           desc: 'Returns the current KYC verification stage and last update timestamp.' },
  { id: 'reverify_aadhaar',      name: 'reverify_aadhaar',      cat: 'KYC',           desc: 'Initiates an Aadhaar OTP-based re-verification flow.' },
  { id: 'block_card',            name: 'block_card',            cat: 'Cards',         desc: 'Initiates an emergency card block and triggers reissue workflow.' },
  { id: 'set_card_pin',          name: 'set_card_pin',          cat: 'Cards',         desc: 'Sends a secure deep-link to set or reset the card PIN.' },
  { id: 'send_payment_link',     name: 'send_payment_link',     cat: 'Payments',      desc: 'Generates a UPI/card payment link and delivers it over SMS or WhatsApp.' },
  { id: 'initiate_neft',         name: 'initiate_neft',         cat: 'Payments',      desc: 'Starts a NEFT transfer with two-factor confirmation.' },
  { id: 'create_ticket',         name: 'create_ticket',         cat: 'CRM',           desc: 'Creates a support ticket in the connected CRM with priority and category.' },
  { id: 'lookup_customer',       name: 'lookup_customer',       cat: 'CRM',           desc: 'Pulls the full customer record by phone, email or customer ID.' },
  { id: 'send_otp',              name: 'send_otp',              cat: 'Notifications', desc: 'Sends a one-time password to the customer\'s registered mobile number.' },
  { id: 'send_sms',              name: 'send_sms',              cat: 'Notifications', desc: 'Sends a transactional SMS using a pre-approved DLT template.' },
  { id: 'send_whatsapp',         name: 'send_whatsapp',         cat: 'Notifications', desc: 'Sends a WhatsApp template message via the BSP gateway.' },
  { id: 'check_loan_eligibility',name: 'check_loan_eligibility',cat: 'Lending',       desc: 'Returns pre-approved loan offers based on the customer\'s profile.' },
  { id: 'emi_calculator',        name: 'emi_calculator',        cat: 'Lending',       desc: 'Computes EMI for a given principal, tenure and rate.' },
  { id: 'transfer_to_human',     name: 'transfer_to_human',     cat: 'Handoff',       desc: 'Hands off the live conversation to a tier-1 human agent in the routing queue.' },
  { id: 'schedule_callback',     name: 'schedule_callback',     cat: 'Handoff',       desc: 'Books a callback slot on the customer\'s preferred date and time.' },
]
const TOOL_CATEGORIES = ['All', 'Accounts', 'KYC', 'Cards', 'Payments', 'CRM', 'Notifications', 'Lending', 'Handoff']

const FIELD_TYPES: { value: AgentFieldType; label: string }[] = [
  { value: 'text',     label: 'Text' },
  { value: 'number',   label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'date',     label: 'Date' },
  { value: 'time',     label: 'Time' },
]

const DEFAULT_PROMPT = `## PERSONA ##
You are a Virtual Relationship Manager. Your tone must be polite, kind and professional.

## SCENARIO ##
Your objective is to help customers with their queries and provide accurate information.

## RULES ##
- Initiate interactions with a friendly greeting.
- Do not handle issues outside your scope — escalate to a human agent.
- Never share sensitive data unless the customer's identity is verified.

## TONE ##
Maintain a friendly, clear, and professional tone. Keep responses brief and to the point.`

// ─── Primitive components ─────────────────────────────────────────────────

function Field({ label, hint, required, optional, children }: {
  label?: string; hint?: string; required?: boolean; optional?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: V.ink, letterSpacing: '-0.005em' }}>
            {label}{required && <span style={{ color: V.rose, marginLeft: 3 }}>*</span>}
          </label>
          {optional && (
            <span style={{ fontSize: 10.5, color: V.muted2, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>optional</span>
          )}
        </div>
      )}
      {hint && <div style={{ fontSize: 12.5, color: V.muted, marginTop: -2, lineHeight: 1.45 }}>{hint}</div>}
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, prefix, mono, readOnly }: {
  value: string; onChange?: (v: string) => void; placeholder?: string
  prefix?: React.ReactNode; mono?: boolean; readOnly?: boolean
}) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#fff',
      border: `1px solid ${focus ? V.primary : V.line}`,
      borderRadius: 12, padding: '0 12px', minHeight: 44,
      transition: 'border-color .15s, box-shadow .15s',
      boxShadow: focus ? `0 0 0 4px rgba(48,86,244,0.10)` : 'none',
    }}>
      {prefix && <div style={{ color: V.muted }}>{prefix}</div>}
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: V.ink, minWidth: 0, fontFamily: mono ? 'monospace' : 'inherit', colorScheme: 'light',
        }}
      />
    </div>
  )
}

function Textarea({ value, onChange, placeholder, minHeight = 180 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; minHeight?: number
}) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${focus ? V.primary : V.line}`,
      background: '#fff', transition: 'border-color .15s, box-shadow .15s',
      boxShadow: focus ? `0 0 0 4px rgba(48,86,244,0.10)` : 'none', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 10px 7px 14px', borderBottom: `1px solid ${V.line2}`,
        background: 'linear-gradient(180deg, #FAFBFE, #F4F6FC)',
        fontSize: 12, color: V.muted, fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span style={{ fontSize: 11, color: V.muted2, fontFamily: "'JetBrains Mono', monospace" }}>system prompt</span>
        <span style={{ color: V.muted2, fontSize: 11 }}>{Math.ceil(value.length / 4)} tokens</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', minHeight, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 13.5, color: V.ink, padding: '14px 16px', resize: 'vertical',
          lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", boxSizing: 'border-box', colorScheme: 'light',
        }}
      />
    </div>
  )
}

function Segmented({ options, value, onChange }: {
  options: { value: string; label: string; icon?: React.ReactNode }[]
  value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{
      position: 'relative', display: 'grid',
      gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`,
      gap: 4, padding: 4,
      background: '#EDEFF5', borderRadius: 12, border: `1px solid ${V.line2}`,
    }}>
      {options.map(o => {
        const isActive = value === o.value
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '7px 14px', fontSize: 12.5, fontWeight: 600,
            color: isActive ? V.ink : V.muted,
            background: isActive ? '#fff' : 'transparent',
            border: 'none', borderRadius: 9, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: isActive ? `0 1px 2px rgba(17,21,74,0.08), 0 0 0 1px ${V.line}` : 'none',
            transition: 'all .2s', whiteSpace: 'nowrap', fontFamily: 'inherit',
          }}>{o.icon}{o.label}</button>
        )
      })}
    </div>
  )
}

function ToggleCard({ icon, title, desc, active, onClick, badge }: {
  icon: React.ReactNode; title: string; desc: string
  active: boolean; onClick: () => void; badge?: string
}) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', position: 'relative',
      padding: 14, borderRadius: 14, background: '#fff',
      border: `1px solid ${active ? V.primary : V.line}`,
      boxShadow: active ? `0 0 0 3px ${V.primary}22` : 'none',
      cursor: 'pointer', transition: 'all .15s',
      display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'inherit',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: active ? V.primary : '#F4F5F8',
          color: active ? '#fff' : V.ink2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        <div style={{
          width: 32, height: 18, borderRadius: 999,
          background: active ? V.primary : '#E5E7ED', position: 'relative', transition: 'background .2s',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: active ? 16 : 2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#fff', transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: V.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
          {title}
          {badge && <span style={{
            fontSize: 9.5, padding: '2px 5px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace",
            background: V.amber50, color: V.amber, letterSpacing: '0.05em',
          }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12, color: V.muted, marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 42, height: 24, borderRadius: 999, position: 'relative',
      background: checked ? V.primary : '#D6D9E0',
      border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: checked ? 20 : 2,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function FancySlider({ value, onChange, min = 0, max = 100, leftLabel, rightLabel, unit = '', accent = V.primary }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number
  leftLabel?: string; rightLabel?: string; unit?: string; accent?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  const ticks = [25, 50, 75]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center', marginTop: 22 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, background: '#EEF0F4' }} />
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 6, borderRadius: 999, background: `linear-gradient(90deg, ${accent}, ${V.accent})` }} />
        {ticks.map(t => (
          <div key={t} style={{
            position: 'absolute', left: `${t}%`, top: '50%', transform: 'translate(-50%,-50%)',
            width: 2, height: 10, background: t <= pct ? accent : '#D6D9E0', borderRadius: 1,
          }} />
        ))}
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }} />
        <div style={{
          position: 'absolute', left: `${pct}%`, transform: 'translate(-50%,0)',
          width: 22, height: 22, borderRadius: '50%', background: '#fff',
          border: `3px solid ${accent}`, boxShadow: '0 2px 6px rgba(17,21,74,0.18)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: `${pct}%`, top: -22, transform: 'translate(-50%,0)',
          fontSize: 11, fontWeight: 700, color: accent, pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace",
        }}>{value}{unit}</div>
      </div>
      {(leftLabel || rightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: V.muted }}>
          <span>{leftLabel}</span><span>{rightLabel}</span>
        </div>
      )}
    </div>
  )
}

function AvatarPicker({ value, onChange, name }: { value: string; onChange: (v: string) => void; name: string }) {
  const av = AVATARS.find(a => a.id === value) || AVATARS[0]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: `linear-gradient(135deg, ${av.grad.join(',')})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em',
          boxShadow: '0 8px 18px -6px rgba(17,21,74,0.25), inset 0 -8px 16px rgba(255,255,255,0.18)',
        }}>
          {name ? name[0]?.toUpperCase() : av.glyph}
        </div>
        <div style={{
          position: 'absolute', right: -4, bottom: -4, width: 22, height: 22,
          borderRadius: '50%', background: V.emerald, border: '3px solid #fff',
        }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ fontSize: 12, color: V.muted, fontWeight: 500 }}>Pick an avatar style</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AVATARS.map(a => (
            <button key={a.id} onClick={() => onChange(a.id)} style={{
              width: 36, height: 36, borderRadius: 12,
              background: `linear-gradient(135deg, ${a.grad.join(',')})`,
              border: value === a.id ? `2px solid ${V.ink}` : '2px solid transparent',
              boxShadow: value === a.id ? '0 0 0 2px #fff inset, 0 4px 10px -2px rgba(17,21,74,0.2)' : '0 2px 6px -2px rgba(17,21,74,0.15)',
              cursor: 'pointer', transition: 'transform .15s',
              transform: value === a.id ? 'scale(1.06)' : 'scale(1)',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Dropdown({ options, value, onChange, placeholder = 'Select…' }: {
  options: { id: string; label: string; provider?: string; meta?: string }[]
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])
  const sel = options.find(o => o.id === value)
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 12, background: '#fff', color: V.ink,
        border: `1px solid ${open ? V.primary : V.line}`,
        boxShadow: open ? `0 0 0 4px rgba(48,86,244,0.10)` : 'none',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <div>
          {sel ? (
            <span style={{ fontSize: 13.5, fontWeight: 600, color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>{sel.label}</span>
          ) : (
            <span style={{ fontSize: 13.5, color: V.muted2 }}>{placeholder}</span>
          )}
          {sel?.provider && <span style={{ fontSize: 11.5, color: V.muted, marginLeft: 8 }}>{sel.provider}</span>}
        </div>
        <ChevronDownIcon size={16} color={V.muted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: 4,
          background: '#fff', borderRadius: 12, border: `1px solid ${V.line}`,
          boxShadow: '0 12px 32px -8px rgba(17,21,74,0.18)', overflow: 'hidden',
        }}>
          {options.map(o => (
            <button key={o.id} onClick={() => { onChange(o.id); setOpen(false) }} style={{
              width: '100%', textAlign: 'left', padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: value === o.id ? V.primary50 : 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: `1px solid ${V.line2}`,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>{o.label}</span>
              <div style={{ textAlign: 'right' }}>
                {o.provider && <div style={{ fontSize: 11.5, color: V.muted }}>{o.provider}</div>}
                {o.meta && <div style={{ fontSize: 11, color: V.muted2, fontFamily: "'JetBrains Mono', monospace" }}>{o.meta}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TagInput({ tags, setTags, placeholder, suggestions = [] }: {
  tags: string[]; setTags: (v: string[]) => void; placeholder?: string; suggestions?: string[]
}) {
  const [v, setV] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        padding: 8, borderRadius: 12, background: '#fff', border: `1px solid ${V.line}`, minHeight: 44,
      }}>
        {tags.map(t => (
          <span key={t} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 4px 4px 10px', borderRadius: 8,
            background: V.primary50, color: V.primary2, fontSize: 12, fontWeight: 600,
          }}>
            {t}
            <button onClick={() => setTags(tags.filter(x => x !== t))} style={{
              width: 16, height: 16, borderRadius: 4, border: 'none',
              background: 'rgba(48,86,244,0.12)', color: V.primary2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>✕</button>
          </span>
        ))}
        <input value={v} onChange={e => setV(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && v.trim()) { setTags([...tags, v.trim()]); setV('') }
            if (e.key === 'Backspace' && !v && tags.length) setTags(tags.slice(0, -1))
          }}
          placeholder={tags.length ? '' : placeholder}
          style={{ flex: 1, minWidth: 100, border: 'none', outline: 'none', fontSize: 13, padding: '4px 6px', background: 'transparent', color: V.ink, colorScheme: 'light' }}
        />
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: V.muted, alignSelf: 'center', marginRight: 4 }}>Try:</span>
          {suggestions.filter(s => !tags.includes(s)).slice(0, 5).map(s => (
            <button key={s} onClick={() => setTags([...tags, s])} style={{
              fontSize: 11.5, padding: '3px 8px', borderRadius: 6,
              background: '#fff', color: V.muted, border: `1px solid ${V.line}`, cursor: 'pointer', fontFamily: 'inherit',
            }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function DayPicker({ days, setDays }: { days: number[]; setDays: (v: number[]) => void }) {
  const D = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {D.map((d, i) => {
        const on = days.includes(i)
        return (
          <button key={i} onClick={() => setDays(on ? days.filter(x => x !== i) : [...days, i])} style={{
            width: 36, height: 36, borderRadius: 10,
            background: on ? V.ink : '#fff',
            color: on ? '#fff' : V.ink2,
            border: `1px solid ${on ? V.ink : V.line}`,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{d}</button>
        )
      })}
    </div>
  )
}

// ─── Inline SVG icons (matching HTML's 24px icon style) ───────────────────

function ChevronDownIcon({ size = 18, color = 'currentColor', style: s }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M6 9l6 6 6-6"/></svg>
}
function CheckIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10"/></svg>
}
function PlusIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
}
function TrashIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
}
function PlayIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l13 8-13 8z"/></svg>
}
function ShieldIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function LaunchIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
}
function ChevronRightIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
}
function ChevronLeftIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
}
function EyeIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
}
function SearchIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
}
function HashIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>
}
function WrenchIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
}
function LayersIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l10 6 10-6M2 17l10 6 10-6M12 2L2 7l10 5 10-5-10-5z"/></svg>
}
function MicIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>
}
function PhoneIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
}
function GlobeIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>
}
function ChatIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v12H8l-4 3z"/></svg>
}
function BotIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4"/><circle cx="12" cy="3" r="1"/><path d="M9 13h.01M15 13h.01"/><path d="M9 17h6"/></svg>
}
function SparklesIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>
}
function BookIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h12"/></svg>
}
function LinkIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
}
function UploadIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V5"/><path d="M6 11l6-6 6 6"/><path d="M5 19h14"/></svg>
}
function SendIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-8-8 18-2-8z"/></svg>
}

// Hyperface logo
function HFLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="url(#hflg)"/>
      <path d="M9 9h3.2v5.4h6.6V9H22v14h-3.2v-5.6h-6.6V23H9z" fill="white"/>
      <circle cx="24" cy="9" r="2.5" fill="#6B5BFF"/>
      <defs>
        <linearGradient id="hflg" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#1F3FE0"/><stop offset="1" stopColor="#11154A"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Stage icon resolver ──────────────────────────────────────────────────
function StageIcon({ id, size = 18, color = 'currentColor' }: { id: string; size?: number; color?: string }) {
  if (id === 'identity')          return <BotIcon size={size} color={color} />
  if (id === 'persona')           return <SparklesIcon size={size} color={color} />
  if (id === 'knowledge_params')  return <BookIcon size={size} color={color} />
  if (id === 'tools')             return <WrenchIcon size={size} color={color} />
  if (id === 'channel_config')    return <GlobeIcon size={size} color={color} />
  if (id === 'guardrails_launch') return <ShieldIcon size={size} color={color} />
  return null
}

// ─── TopBar ───────────────────────────────────────────────────────────────
function CreateTopBar({ progress, onDiscard }: { progress: number; onDiscard: () => void }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px', background: 'rgba(244,245,248,0.85)',
      backdropFilter: 'blur(10px)', borderBottom: `1px solid ${V.line2}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: V.muted }}>
        <Link to="/agents" style={{ color: V.muted, textDecoration: 'none' }}>Agents</Link>
        <ChevronRightIcon size={14} color={V.muted2} />
        <span style={{ color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>create</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onDiscard} style={btnSecondary}>Discard</button>
        <button style={btnSecondary}>Save draft</button>
        <button style={{ ...btnPrimary, opacity: progress < 100 ? 0.6 : 1 }}>
          <LaunchIcon size={14} color="#fff" /> Deploy
        </button>
      </div>
    </div>
  )
}

// ─── StepperRail ──────────────────────────────────────────────────────────
function StepperRail({ active, setActive, completed }: {
  active: string; setActive: (id: string) => void; completed: Record<string, boolean>
}) {
  const activeIdx = STAGES.findIndex(s => s.id === active)
  return (
    <aside style={{ position: 'sticky', top: 20, alignSelf: 'start', height: 'fit-content' }}>
      <div style={{
        background: '#fff', borderRadius: 16, border: `1px solid ${V.line}`,
        padding: 18, boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 2px rgba(17,21,74,0.04)',
      }}>
        <div style={{
          fontSize: 11, color: V.muted, textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 700, marginBottom: 14, fontFamily: "'JetBrains Mono', monospace",
        }}>Setup stages</div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', left: 13, top: 14, bottom: 14, width: 2, background: V.line, borderRadius: 2 }} />
          <div style={{
            position: 'absolute', left: 13, top: 14, width: 2,
            height: `${activeIdx / (STAGES.length - 1) * 100}%`,
            background: `linear-gradient(180deg, ${V.primary}, ${V.accent})`, borderRadius: 2,
            transition: 'height .35s',
          }} />
          {STAGES.map((s, i) => {
            const isActive = s.id === active
            const isDone = !!completed[s.id]
            return (
              <button key={s.id} onClick={() => setActive(s.id)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isDone ? V.emerald : (isActive ? V.primary : '#fff'),
                  color: (isDone || isActive) ? '#fff' : V.muted,
                  border: `2px solid ${isDone ? V.emerald : (isActive ? V.primary : V.line)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0, zIndex: 1, position: 'relative',
                  boxShadow: isActive ? `0 0 0 4px rgba(48,86,244,0.15)` : 'none',
                  transition: 'all .2s', fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {isDone ? <CheckIcon size={14} color="#fff" /> : s.num.replace('0', '')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? V.ink : (isDone ? V.ink2 : V.muted) }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: V.muted2, marginTop: 1 }}>{s.summary}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

// ─── Stage Card (accordion) ───────────────────────────────────────────────
function StageCard({ stage, expanded, done, onExpand, onContinue, children }: {
  stage: typeof STAGES[0]; expanded: boolean; done: boolean
  onExpand: () => void; onContinue: () => void; children: React.ReactNode
}) {
  return (
    <section style={{
      background: '#fff', borderRadius: 18,
      border: `1px solid ${expanded ? V.primary : V.line}`,
      boxShadow: expanded
        ? `0 10px 30px -12px rgba(48,86,244,0.18), 0 1px 0 rgba(17,21,74,0.04)`
        : '0 1px 0 rgba(17,21,74,0.04), 0 1px 2px rgba(17,21,74,0.04)',
      transition: 'all .25s', overflow: 'hidden',
    }}>
      <button onClick={onExpand} style={{
        display: 'flex', alignItems: 'center', gap: 16,
        width: '100%', padding: '18px 22px', background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: done ? V.emerald50 : (expanded ? V.primary50 : '#F4F5F8'),
          color: done ? V.emerald : (expanded ? V.primary2 : V.muted),
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {done ? <CheckIcon size={20} color={V.emerald} /> : <StageIcon id={stage.id} size={20} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 11, color: V.muted2, letterSpacing: '0.06em', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{stage.num}</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', color: V.ink }}>{stage.title}</h2>
            {done && <span style={{ fontSize: 11, fontWeight: 700, color: V.emerald, padding: '2px 8px', borderRadius: 999, background: V.emerald50 }}>Complete</span>}
          </div>
          <div style={{ fontSize: 12.5, color: V.muted, marginTop: 3 }}>{stage.summary}</div>
        </div>
        <div style={{ color: V.muted, transition: 'transform .25s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          <ChevronDownIcon size={20} color={V.muted} />
        </div>
      </button>
      <div style={{ maxHeight: expanded ? 4000 : 0, overflow: 'hidden', transition: 'max-height .4s cubic-bezier(.2,.7,.3,1)' }}>
        <div style={{ padding: '4px 22px 22px', borderTop: `1px solid ${V.line2}` }}>
          <div style={{ paddingTop: 18 }}>{children}</div>
        </div>
      </div>
    </section>
  )
}

// ─── Sticky footer ────────────────────────────────────────────────────────
function CreateFooter({ active, setActive, completed, completeStage }: {
  active: string; setActive: (id: string) => void
  completed: Record<string, boolean>; completeStage: (id: string) => void
}) {
  const idx = STAGES.findIndex(s => s.id === active)
  return (
    <footer style={{
      position: 'fixed', bottom: 0, left: 216, right: 0, zIndex: 20,
      padding: '12px 28px', background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(10px)', borderTop: `1px solid ${V.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: V.muted2, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
          STEP {String(idx + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {STAGES.map((s, i) => (
            <span key={s.id} style={{
              width: i === idx ? 24 : 8, height: 6, borderRadius: 999,
              background: completed[s.id] ? V.emerald : (i === idx ? V.primary : '#E5E7ED'),
              transition: 'width .25s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={idx === 0}
          onClick={() => idx > 0 && setActive(STAGES[idx - 1].id)}
          style={{ ...btnSecondary, opacity: idx === 0 ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ChevronLeftIcon size={14} color={V.ink2} /> Back
        </button>
        <button onClick={() => completeStage(active)} style={btnPrimary}>
          {idx === STAGES.length - 1
            ? <><span>Launch agent</span> <LaunchIcon size={14} color="#fff" /></>
            : <><span>Continue</span> <ChevronRightIcon size={14} color="#fff" /></>
          }
        </button>
      </div>
    </footer>
  )
}

// ─── Stage content: Identity ──────────────────────────────────────────────
function StageIdentity({ data, set }: { data: AgentData; set: SetFn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Field label="Avatar & display name" hint="Shown on cards, headers and live calls.">
        <AvatarPicker value={data.avatar} onChange={v => set('avatar', v)} name={data.name} />
      </Field>
      <Field label="Agent name" required>
        <TextInput value={data.name} onChange={v => set('name', v)} placeholder="e.g. Onboarding Agent" />
      </Field>
      <Field label="Description" hint="A one-liner so teammates know what this agent does.">
        <TextInput value={data.description} onChange={v => set('description', v)} placeholder="Helps customers with…" />
      </Field>
      <Field label="Agent type" hint="What modality this agent will primarily operate in.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <ToggleCard icon={<PhoneIcon size={18} />}  title="Voice"        desc="Phone calls & dialer flows"     active={data.type === 'voice'} onClick={() => set('type', 'voice')} />
          <ToggleCard icon={<ChatIcon size={18} />}   title="Chat"         desc="WhatsApp, web chat, SMS"        active={data.type === 'chat'}  onClick={() => set('type', 'chat')} />
          <ToggleCard icon={<LayersIcon size={18} />} title="Omnichannel"  desc="Both voice & chat unified"      active={data.type === 'omni'}  onClick={() => set('type', 'omni')} badge="NEW" />
        </div>
      </Field>
    </div>
  )
}

// ─── Stage content: Persona & Voice ──────────────────────────────────────
function buildPrompt(description: string, agentType: string): string {
  const desc = description.trim() || 'assist customers with their queries'
  const isVoice = agentType === 'voice' || agentType === 'omni'
  return `## PERSONA ##
You are a professional AI ${isVoice ? 'voice' : 'chat'} assistant. Your tone must be polite, empathetic, and solution-oriented.

## SCENARIO ##
Your objective is to ${desc}.

## RULES ##
- Always greet the customer warmly at the start of the conversation.
- Verify the customer's identity before sharing account-sensitive information.
- Do not handle requests outside your defined scope — escalate to a human agent when needed.
- Keep all responses concise and clear. Avoid jargon.
- If you cannot resolve an issue, offer a callback or escalation.

## TONE ##
Maintain a friendly, professional, and empathetic tone throughout. Acknowledge customer concerns before offering solutions. Keep responses brief and to the point.`
}

function PromptGeneratorPopover({ agentName, agentType, onApply, onClose }: {
  agentName: string; agentType: string; onApply: (prompt: string) => void; onClose: () => void
}) {
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState('')
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerated(buildPrompt(description || agentName, agentType))
      setGenerating(false)
    }, 1200)
  }

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 200,
      width: 500, background: '#fff', borderRadius: 18, border: '1px solid #E5E7ED',
      boxShadow: '0 24px 60px -12px rgba(17,21,74,0.22), 0 1px 0 rgba(17,21,74,0.04)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #EEF0F4', background: 'linear-gradient(180deg, #FAFBFE, #fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#EEF1FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SparklesIcon size={15} color="#3056F4" />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.01em' }}>AI Prompt Generator</div>
            <div style={{ fontSize: 11.5, color: '#9AA1B2', marginTop: 1 }}>Describe your agent and we'll write the prompt</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA1B2', fontSize: 20, lineHeight: 1, padding: '0 2px', fontFamily: 'inherit' }}>×</button>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!generated ? (
          <>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0E1116', display: 'block', marginBottom: 7 }}>What should this agent do?</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={`e.g. A customer retention agent for a savings bank that handles account closure requests and offers product upgrades…`}
                style={{ width: '100%', boxSizing: 'border-box', height: 80, border: '1px solid #E5E7ED', borderRadius: 10, padding: '10px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', colorScheme: 'light' as React.CSSProperties['colorScheme'], lineHeight: 1.55, color: '#0E1116', background: '#FAFBFE' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#3056F4'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)'; e.currentTarget.style.background = '#fff' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7ED'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#FAFBFE' }}
              />
            </div>
            <button onClick={handleGenerate} disabled={generating}
              style={{ padding: '10px 18px', borderRadius: 11, background: generating ? '#6B7385' : '#3056F4', color: '#fff', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start', transition: 'background .15s' }}>
              {generating
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Generating…</>
                : <><SparklesIcon size={14} color="#fff" />Generate prompt</>
              }
            </button>
          </>
        ) : (
          <>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, color: '#9AA1B2', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Generated prompt</p>
              <pre style={{ margin: 0, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.65, background: '#F4F5F8', border: '1px solid #E5E7ED', borderRadius: 10, padding: '12px 14px', overflowY: 'auto', maxHeight: 220, whiteSpace: 'pre-wrap', color: '#0E1116' }}>
                {generated}
              </pre>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onApply(generated)}
                style={{ padding: '9px 18px', borderRadius: 10, background: '#3056F4', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, flex: 1, boxShadow: '0 2px 8px rgba(48,86,244,0.25)' }}>
                Use this prompt ↵
              </button>
              <button onClick={() => { setGenerated(''); setDescription('') }}
                style={{ padding: '9px 14px', borderRadius: 10, background: '#fff', color: '#6B7385', border: '1px solid #E5E7ED', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
                Regenerate
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function StagePersona({ data, set }: { data: AgentData; set: SetFn }) {
  const isVoice = data.type === 'voice' || data.type === 'omni'
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [showPromptGen, setShowPromptGen] = useState(false)
  const [voiceSearch, setVoiceSearch] = useState('')
  const [voiceGender, setVoiceGender] = useState<'all' | 'F' | 'M'>('all')
  const [voiceStyle, setVoiceStyle] = useState('All')
  const availableVoices = VOICES.filter(v => data.models.tts === 'sarvam-tts' ? v.provider === 'sarvam-tts' : v.provider === data.models.tts || v.provider === 'gemini-2.5-tts')
  const voiceStyles = ['All', ...Array.from(new Set(availableVoices.map(v => v.style))).sort()]
  const filteredVoices = availableVoices.filter(v => {
    const q = voiceSearch.toLowerCase()
    const matchSearch = !q || v.display.includes(q) || v.style.toLowerCase().includes(q)
    const matchGender = voiceGender === 'all' || v.gender === voiceGender
    const matchStyle = voiceStyle === 'All' || v.style === voiceStyle
    return matchSearch && matchGender && matchStyle
  })
  const selectedVoiceObj = availableVoices.find(v => v.id === data.voice)
  const ttsMeta = { 'gemini-2.5-tts': 'Google · 30 voices', 'sarvam-tts': 'Sarvam · 6 voices', 'openai-tts-1': 'OpenAI · 6 voices', 'elevenlabs-turbo': 'ElevenLabs · 6 voices' }[data.models.tts] || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Model stack */}
      <div style={{ padding: 18, borderRadius: 16, border: `1px solid ${V.line}`, background: 'linear-gradient(180deg, #FAFBFE, #fff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: V.primary50, color: V.primary2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayersIcon size={15} color={V.primary2} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Model stack</div>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 999,
            background: '#F0F2F8', color: V.muted, letterSpacing: '0.05em', fontWeight: 700,
            textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {isVoice ? (data.mode === 's2s' ? 'speech ↔ speech' : 'stt → llm → tts') : 'llm only'}
          </span>
        </div>

        {!isVoice ? (
          <Field label="LLM" hint="The reasoning model the chat agent runs on.">
            <Dropdown options={MODELS.llm} value={data.models.llm} onChange={v => set('models', { ...data.models, llm: v })} />
          </Field>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Voice mode" hint="How audio flows through the model. Speech-to-Speech is faster; cascaded gives more control.">
              <Segmented value={data.mode} onChange={v => set('mode', v)} options={[
                { value: 's2s',      label: 'Speech ↔ Speech', icon: <MicIcon size={12} /> },
                { value: 'cascaded', label: 'STT → LLM → TTS', icon: <LayersIcon size={12} /> },
              ]} />
            </Field>
            {data.mode === 's2s' ? (
              <Field label="Realtime model" hint="A single model handles transcription, reasoning and synthesis end-to-end.">
                <Dropdown options={MODELS.s2s} value={data.models.s2s} onChange={v => set('models', { ...data.models, s2s: v })} />
              </Field>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="STT (Speech-to-Text)">
                  <Dropdown options={MODELS.stt} value={data.models.stt} onChange={v => set('models', { ...data.models, stt: v })} />
                </Field>
                <Field label="LLM">
                  <Dropdown options={MODELS.llm} value={data.models.llm} onChange={v => set('models', { ...data.models, llm: v })} />
                </Field>
                <Field label="TTS (Text-to-Speech)">
                  <Dropdown options={MODELS.tts} value={data.models.tts} onChange={v => set('models', { ...data.models, tts: v })} />
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: V.ink, letterSpacing: '-0.005em' }}>
                System prompt <span style={{ color: V.rose }}>*</span>
              </label>
            </div>
            <div style={{ fontSize: 12.5, color: V.muted, marginTop: 3 }}>The instructions that define how the agent thinks and responds.</div>
          </div>
          <button
            onClick={() => setShowPromptGen(!showPromptGen)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 700, border: '1px solid #C8D2FB',
              background: showPromptGen ? '#DCE2FE' : 'linear-gradient(135deg, #EEF1FE, #DCE2FE)',
              color: V.primary, transition: 'all .15s', flexShrink: 0,
              boxShadow: showPromptGen ? '0 0 0 3px rgba(48,86,244,0.12)' : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DCE2FE'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(48,86,244,0.2)' }}
            onMouseLeave={e => { if (!showPromptGen) { e.currentTarget.style.background = 'linear-gradient(135deg, #EEF1FE, #DCE2FE)'; e.currentTarget.style.boxShadow = 'none' } }}
          >
            <SparklesIcon size={13} color={V.primary} /> AI Generate
          </button>
        </div>
        <Textarea value={data.prompt} onChange={v => set('prompt', v)} placeholder="## PERSONA ##&#10;You are a …&#10;&#10;## SCENARIO ##&#10;Your objective is to …" />
        {showPromptGen && (
          <PromptGeneratorPopover
            agentName={data.name}
            agentType={data.type}
            onApply={v => { set('prompt', v); setShowPromptGen(false) }}
            onClose={() => setShowPromptGen(false)}
          />
        )}
      </div>

      {isVoice && data.mode !== 's2s' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Voice header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>Voice</span>
              <span style={{ fontSize: 11.5, color: V.muted2, background: V.bg, padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>{ttsMeta}</span>
            </div>
            {selectedVoiceObj && (
              <span style={{ fontSize: 12, color: V.muted }}>
                From <strong style={{ color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>{data.models.tts}</strong>
                {' · '}currently <strong style={{ color: V.ink }}>{selectedVoiceObj.display}</strong>
                <span style={{ color: V.muted2 }}> ({selectedVoiceObj.style})</span>
              </span>
            )}
          </div>

          <div style={{ borderRadius: 16, border: `1px solid ${V.line}`, background: '#fff', overflow: 'hidden' }}>
            {/* Search + gender filter */}
            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${V.line2}` }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <SearchIcon size={14} color={V.muted2} />
                </div>
                <input
                  value={voiceSearch}
                  onChange={e => setVoiceSearch(e.target.value)}
                  placeholder="Search by name or characteristic..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 12px 8px 32px', borderRadius: 10,
                    border: `1px solid ${V.line}`, fontSize: 13, color: V.ink,
                    background: V.bg, fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${V.line}`, overflow: 'hidden', background: V.bg }}>
                {(['all', 'F', 'M'] as const).map(g => (
                  <button key={g} onClick={() => setVoiceGender(g)} style={{
                    padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: 'none', fontFamily: 'inherit',
                    background: voiceGender === g ? '#fff' : 'transparent',
                    color: voiceGender === g ? V.ink : V.muted,
                    boxShadow: voiceGender === g ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    borderRight: g !== 'M' ? `1px solid ${V.line2}` : 'none',
                  }}>
                    {g === 'all' ? 'All' : g === 'F' ? 'Female' : 'Male'}
                  </button>
                ))}
              </div>
            </div>

            {/* Style pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px', borderBottom: `1px solid ${V.line2}` }}>
              {voiceStyles.map(s => {
                const count = s === 'All' ? availableVoices.length : availableVoices.filter(v => v.style === s).length
                const active = voiceStyle === s
                return (
                  <button key={s} onClick={() => setVoiceStyle(s)} style={{
                    padding: '5px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
                    border: active ? `1.5px solid ${V.primary}` : `1px solid ${V.line}`,
                    background: active ? V.primary50 : '#fff',
                    color: active ? V.primary : V.ink,
                  }}>
                    {s === 'All' ? `All · ${count}` : s}
                  </button>
                )
              })}
            </div>

            {/* Voice grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, maxHeight: 420, overflowY: 'auto' }}>
              {filteredVoices.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '32px', textAlign: 'center', fontSize: 13, color: V.muted2 }}>
                  No voices match your search
                </div>
              ) : filteredVoices.map((v, i) => {
                const isSelected = data.voice === v.id
                const isPlaying = playingVoice === v.id
                const col = i % 3
                const row = Math.floor(i / 3)
                const totalRows = Math.ceil(filteredVoices.length / 3)
                const borderRight = col < 2 ? `1px solid ${V.line2}` : 'none'
                const borderBottom = row < totalRows - 1 ? `1px solid ${V.line2}` : 'none'
                return (
                  <div
                    key={v.id}
                    onClick={() => set('voice', v.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      cursor: 'pointer', transition: 'background .12s',
                      background: isSelected ? V.primary50 : '#fff',
                      borderRight, borderBottom,
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = V.bg }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                  >
                    {/* Avatar with selected check */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: `linear-gradient(135deg, ${v.grad[0]}, ${v.grad[1]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 15,
                        textTransform: 'uppercase',
                        boxShadow: isSelected ? `0 3px 10px ${v.grad[0]}60` : 'none',
                      }}>
                        {v.display[0]}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute', top: -4, right: -4,
                          width: 16, height: 16, borderRadius: '50%',
                          background: V.primary, border: '2px solid #fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <CheckIcon size={9} color="#fff" />
                        </div>
                      )}
                    </div>

                    {/* Name + gender + style */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>{v.display}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                          background: V.bg, color: V.muted2, letterSpacing: '0.02em',
                        }}>{v.gender}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: V.muted, marginTop: 2 }}>{v.style}</div>
                    </div>

                    {/* Play button */}
                    <button
                      onClick={e => { e.stopPropagation(); setPlayingVoice(isPlaying ? null : v.id) }}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        border: `1.5px solid ${V.line}`, background: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.background = V.primary50 }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.background = '#fff' }}
                    >
                      <PlayIcon size={11} color={V.primary} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <Field label="Speaking speed">
          <FancySlider value={data.speed} onChange={v => set('speed', v)} leftLabel="Slow & deliberate" rightLabel="Quick & punchy" />
        </Field>
        <Field label="Formality">
          <FancySlider value={data.formality} onChange={v => set('formality', v)} leftLabel="Casual" rightLabel="Formal" accent={V.accent} />
        </Field>
      </div>

      <Field label="Creativity & response variety" hint="Higher creativity makes responses more varied; lower keeps them predictable.">
        <FancySlider value={data.creativity} onChange={v => set('creativity', v)} unit="%" leftLabel="Deterministic" rightLabel="Creative" />
      </Field>
    </div>
  )
}

// ─── Stage content: Knowledge & Parameters ───────────────────────────────
type Param = { id: string; name: string; type: AgentFieldType; default: string; sendToLlm: boolean }

function StageKnowledgeParams({ data, set }: { data: AgentData; set: SetFn }) {
  const [dragging, setDragging] = useState(false)
  const kbList = useAppStore(s => s.knowledgeBases)
  const toggleKb = (id: string) =>
    set('knowledgeBaseIds', data.knowledgeBaseIds.includes(id)
      ? data.knowledgeBaseIds.filter(x => x !== id)
      : [...data.knowledgeBaseIds, id]
    )
  const params = data.parameters
  const update = (id: string, patch: Partial<Param>) =>
    set('parameters', params.map(p => p.id === id ? { ...p, ...patch } : p))
  const remove = (id: string) => set('parameters', params.filter(p => p.id !== id))
  const add = () => set('parameters', [
    ...params,
    { id: 'p_' + Math.random().toString(36).slice(2, 7), name: '', type: 'text' as AgentFieldType, default: '', sendToLlm: true },
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>

      {/* Knowledge base section */}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: V.ink, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: V.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookIcon size={14} color={V.primary2} />
          </div>
          Knowledge base
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Attach from Knowledge Base" hint="Select existing knowledge bases to connect to this agent.">
            <div style={{ borderRadius: 14, border: `1px solid ${V.line}`, overflow: 'hidden', background: '#fff' }}>
              {kbList.filter(kb => kb.status === 'READY').map((kb, i, arr) => {
                const isOn = data.knowledgeBaseIds.includes(kb.id)
                return (
                  <div key={kb.id} onClick={() => toggleKb(kb.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    cursor: 'pointer',
                    background: isOn ? V.primary50 : '#fff',
                    borderBottom: i < arr.length - 1 ? `1px solid ${V.line2}` : 'none',
                    transition: 'background .15s',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: isOn ? V.primary : '#fff',
                      border: `1.5px solid ${isOn ? V.primary : V.line}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isOn && <CheckIcon size={12} color="#fff" />}
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: V.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookIcon size={15} color={V.primary2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>{kb.file_name}</div>
                      <div style={{ fontSize: 11.5, color: V.muted, marginTop: 2 }}>{kb.description}</div>
                    </div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, fontFamily: "'JetBrains Mono', monospace",
                      background: V.emerald50, color: V.emerald,
                    }}>READY</span>
                  </div>
                )
              })}
            </div>
          </Field>
          <Field label="Upload new document" hint="Add a new file — it will be indexed and available across all agents.">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false) }}
              style={{
                border: `1.5px dashed ${dragging ? V.primary : V.line}`,
                borderRadius: 14, padding: '24px', textAlign: 'center',
                background: dragging ? V.primary50 : '#FAFBFE', transition: 'all .2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <UploadIcon size={18} color={V.muted} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: V.ink }}>Drop file or <span style={{ color: V.primary, cursor: 'pointer' }}>browse</span></span>
                <span style={{ fontSize: 12, color: V.muted }}>PDF, DOCX, TXT, CSV · 10 MB max</span>
              </div>
            </div>
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: '#FAFBFE', border: `1px dashed ${V.line}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: V.primary50, color: V.primary2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LinkIcon size={16} color={V.primary2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Or sync from a website</div>
              <div style={{ fontSize: 11.5, color: V.muted }}>Crawl + index automatically every 24 hours</div>
            </div>
            <button style={btnSecondary}>Connect URL</button>
          </div>
          <Field label="Retrieval settings" hint="Tune how documents are pulled into the agent's context window.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Top-k chunks', value: '5', unit: 'chunks' },
                { label: 'Similarity threshold', value: '0.78', unit: 'cosine' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${V.line}`, background: '#fff' }}>
                  <div style={{ fontSize: 11.5, color: V.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: "'JetBrains Mono', monospace" }}>{item.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{item.value}</span>
                    <span style={{ fontSize: 11, color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div style={{ height: 1, background: V.line }} />

      {/* Context variables section */}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: V.ink, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: V.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HashIcon size={14} color={V.primary2} />
          </div>
          Context variables
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            padding: '10px 14px', borderRadius: 12,
            background: 'linear-gradient(135deg, #F4F6FE, #FFFFFF)', border: `1px solid ${V.primary100}`,
            fontSize: 12, color: V.muted, lineHeight: 1.5,
          }}>
            The invoking system passes these in the call API. Variables flagged for the LLM are injected into the system prompt at runtime.
          </div>
          <div style={{ borderRadius: 14, border: `1px solid ${V.line}`, overflow: 'hidden', background: '#fff' }}>
            <div style={{
              padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10,
              background: '#FAFBFE', borderBottom: `1px solid ${V.line2}`,
              fontSize: 11, fontWeight: 700, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{ width: 200, flexShrink: 0 }}>Variable name</span>
              <span style={{ width: 130, flexShrink: 0 }}>Type</span>
              <span style={{ flex: 1, minWidth: 0 }}>Default value</span>
              <span style={{ width: 110, flexShrink: 0, textAlign: 'center' }}>Send to LLM</span>
              <span style={{ width: 32, flexShrink: 0 }} />
            </div>
            {params.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: V.muted, fontSize: 13 }}>
                No variables yet. Add one to capture runtime context.
              </div>
            ) : params.map(p => (
              <div key={p.id} style={{
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: `1px solid ${V.line2}`,
              }}>
                <div style={{ width: 200, flexShrink: 0 }}>
                  <input value={p.name} onChange={e => update(p.id, { name: e.target.value })}
                    placeholder="variable_name" style={{
                      width: '100%', border: `1px solid ${V.line}`, borderRadius: 8,
                      padding: '6px 10px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: 'none', background: '#fff', color: V.ink, colorScheme: 'light',
                    }} />
                </div>
                <div style={{ width: 130, flexShrink: 0 }}>
                  <select value={p.type} onChange={e => update(p.id, { type: e.target.value as AgentFieldType })}
                    style={{ width: '100%', border: `1px solid ${V.line}`, borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none', background: '#fff', color: V.ink, fontFamily: 'inherit', colorScheme: 'light' }}>
                    {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input value={p.default} onChange={e => update(p.id, { default: e.target.value })}
                    placeholder="Optional default…" style={{
                      width: '100%', border: `1px solid ${V.line}`, borderRadius: 8,
                      padding: '6px 10px', fontSize: 13, outline: 'none', background: '#fff', color: V.ink, fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'light',
                    }} />
                </div>
                <div style={{ width: 110, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <Toggle checked={p.sendToLlm} onChange={() => update(p.id, { sendToLlm: !p.sendToLlm })} />
                </div>
                <div style={{ width: 32, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => remove(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: V.muted, padding: 4 }}>
                    <TrashIcon size={15} color={V.muted} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={add} style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
            <PlusIcon size={14} color={V.ink2} /> Add variable
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stage content: Tools ─────────────────────────────────────────────────
const TOOLS_PAGE_SIZE = 8

function StageTools({ data, set }: { data: AgentData; set: SetFn }) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [page, setPage] = useState(1)

  const selected = useMemo(() => new Set(data.tools), [data.tools])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOL_REGISTRY.filter(t => {
      if (cat !== 'All' && t.cat !== cat) return false
      if (!q) return true
      return t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q)
    })
  }, [query, cat])

  useEffect(() => { setPage(1) }, [query, cat])

  const pageCount = Math.max(1, Math.ceil(filtered.length / TOOLS_PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageItems = filtered.slice((safePage - 1) * TOOLS_PAGE_SIZE, safePage * TOOLS_PAGE_SIZE)

  const toggle = (id: string) => set('tools', selected.has(id) ? data.tools.filter(x => x !== id) : [...data.tools, id])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(135deg, #F4F6FE, #FFFFFF)', border: `1px solid ${V.primary100}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: `1px solid ${V.primary100}`, color: V.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WrenchIcon size={18} color={V.primary} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Tool calls available to this agent</div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>Pick from {TOOL_REGISTRY.length} tools in your workspace registry.</div>
          </div>
        </div>
        <button style={{ ...btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <PlusIcon size={13} color={V.ink2} /> New tool
        </button>
      </div>

      {/* Search + category filter */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: V.muted2 }}><SearchIcon size={15} color={V.muted2} /></div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tools…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, height: 40, border: `1px solid ${V.line}`, borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', color: V.ink, boxSizing: 'border-box', fontFamily: 'inherit', colorScheme: 'light' }} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {TOOL_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '6px 11px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: cat === c ? V.primary : '#fff',
              color: cat === c ? '#fff' : V.muted,
              border: `1px solid ${cat === c ? V.primary : V.line}`,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Tool list */}
      <div style={{ borderRadius: 14, border: `1px solid ${V.line}`, overflow: 'hidden', background: '#fff' }}>
        {pageItems.map((t, i) => {
          const isSelected = selected.has(t.id)
          return (
            <div key={t.id} onClick={() => toggle(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px', cursor: 'pointer',
              background: isSelected ? '#FAFBFE' : '#fff',
              borderBottom: i < pageItems.length - 1 ? `1px solid ${V.line2}` : 'none',
              transition: 'background .15s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                background: isSelected ? V.primary : '#fff',
                border: `1.5px solid ${isSelected ? V.primary : V.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <CheckIcon size={12} color="#fff" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: V.ink, fontFamily: "'JetBrains Mono', monospace" }}>{t.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: '#F4F5F8', color: V.muted, fontFamily: "'JetBrains Mono', monospace" }}>{t.cat}</span>
                </div>
                <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>{t.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: safePage === i + 1 ? V.primary : '#fff',
              color: safePage === i + 1 ? '#fff' : V.ink,
              border: `1px solid ${safePage === i + 1 ? V.primary : V.line}`,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{i + 1}</button>
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <div style={{ fontSize: 12.5, color: V.muted, textAlign: 'center' }}>
          {selected.size} tool{selected.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  )
}

// ─── Stage content: Channel Config ───────────────────────────────────────
function StageChannelConfig({ data, set }: { data: AgentData; set: SetFn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field label="Channels" hint="Where this agent will be reachable.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <ToggleCard icon={<GlobeIcon size={18} />}  title="Web widget"   desc="Embed on your site"          active={data.channels.web}       onClick={() => set('channels', { ...data.channels, web: !data.channels.web })} />
          <ToggleCard icon={<PhoneIcon size={18} />}  title="Voice (PSTN)" desc="+91 80 4567 1234"            active={data.channels.voice}     onClick={() => set('channels', { ...data.channels, voice: !data.channels.voice })} />
          <ToggleCard icon={<ChatIcon size={18} />}   title="WhatsApp"     desc="Connected: +91 98••• 4321"   active={data.channels.whatsapp}  onClick={() => set('channels', { ...data.channels, whatsapp: !data.channels.whatsapp })} />
          <ToggleCard icon={<ChatIcon size={18} />}   title="SMS"          desc="Two-way SMS routing"         active={data.channels.sms}       onClick={() => set('channels', { ...data.channels, sms: !data.channels.sms })} />
        </div>
      </Field>

      <Field label="Opening greeting" hint="The first thing the agent says when a call or chat begins.">
        <TextInput value={data.greeting} onChange={v => set('greeting', v)} placeholder="Hi, I'm your assistant. How can I help you today?" />
      </Field>

      <Field label="Fallback response" hint="Used when the agent doesn't understand or has no good answer.">
        <TextInput value={data.fallback} onChange={v => set('fallback', v)} placeholder="Sorry, I didn't quite catch that. Could you say it once more?" />
      </Field>

      <div style={{ padding: 16, borderRadius: 14, border: `1px solid ${V.line}`, background: '#FAFBFE', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: data.handoffOn ? V.emerald : V.muted2 }} />
              Human handoff
            </div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>Transfer the conversation to a live agent when escalation triggers.</div>
          </div>
          <Toggle checked={data.handoffOn} onChange={() => set('handoffOn', !data.handoffOn)} />
        </div>
        {data.handoffOn && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Trigger" hint="When to escalate — select all that apply">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'request',  label: 'On request' },
                  { value: 'negative', label: 'Negative sentiment' },
                  { value: 'failed',   label: 'After 2 failures' },
                ].map(opt => {
                  const isOn = data.handoffTriggers.includes(opt.value)
                  return (
                    <button key={opt.value} onClick={() => {
                      const next = isOn
                        ? data.handoffTriggers.filter(t => t !== opt.value)
                        : [...data.handoffTriggers, opt.value]
                      set('handoffTriggers', next)
                    }} style={{
                      padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                      background: isOn ? V.primary : '#fff',
                      color: isOn ? '#fff' : V.muted,
                      border: `1px solid ${isOn ? V.primary : V.line}`,
                      boxShadow: isOn ? `0 0 0 3px ${V.primary}22` : 'none',
                      cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                    }}>{opt.label}</button>
                  )
                })}
              </div>
            </Field>
            <Field label="Route to" hint="Team or skill group">
              <TextInput value={data.handoffRoute} onChange={v => set('handoffRoute', v)} placeholder="banking-support · tier-2" mono prefix={<SendIcon size={13} color={V.muted} />} />
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stage content: Guardrails & Launch ──────────────────────────────────
function StageGuardrailsLaunch({ data, set }: { data: AgentData; set: SetFn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field label="Guardrails" hint="Rules the agent must never break. Press enter to add.">
        <TagInput tags={data.guardrails} setTags={v => set('guardrails', v)}
          placeholder="Type a rule and press enter…"
          suggestions={['No legal advice', 'PII redaction', 'No promises on rates', "Don't quote pricing"]} />
      </Field>

      <Field label="Active hours" hint="Outside these hours, callers go straight to voicemail.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <DayPicker days={data.activeDays} setDays={v => set('activeDays', v)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TextInput value={data.activeFrom} onChange={v => set('activeFrom', v)} mono />
            <span style={{ color: V.muted, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>→</span>
            <TextInput value={data.activeTo} onChange={v => set('activeTo', v)} mono />
          </div>
          <span style={{ fontSize: 11, color: V.muted, padding: '4px 8px', borderRadius: 6, background: '#F0F2F8', fontFamily: "'JetBrains Mono', monospace" }}>IST · UTC+05:30</span>
        </div>
      </Field>

      <div style={{
        padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #F4F6FE, #FFFFFF)', border: `1px solid ${V.primary100}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: `1px solid ${V.primary100}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: V.primary }}>
          <EyeIcon size={20} color={V.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Test this agent in a sandbox first</div>
          <div style={{ fontSize: 12, color: V.muted, marginTop: 2 }}>Run a simulated call before going live. Free, takes ~30 seconds.</div>
        </div>
        <button style={btnPrimary}><PlayIcon size={13} color="#fff" /> Run test</button>
      </div>

      <Field label="Pre-launch checklist">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { ok: !!data.name && !!data.prompt,                                                           label: 'Agent name & system prompt set' },
            { ok: data.type === 'chat' || !!data.voice || data.mode === 's2s',                            label: 'Voice configured (voice & omni agents)' },
            { ok: data.knowledgeBaseIds.length > 0,                                                       label: 'Knowledge base attached' },
            { ok: Object.values(data.channels).some(Boolean),                                             label: 'At least one channel enabled' },
            { ok: false,                                                                                   label: 'Test call passed without errors' },
          ].map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 10, background: c.ok ? V.emerald50 : '#FAFBFE',
              border: `1px solid ${c.ok ? 'rgba(15,157,110,0.2)' : V.line}`,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: c.ok ? V.emerald : '#fff',
                border: c.ok ? 'none' : `1.5px solid ${V.line}`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{c.ok && <CheckIcon size={11} color="#fff" />}</div>
              <div style={{ fontSize: 13, color: c.ok ? V.ink : V.muted, fontWeight: c.ok ? 600 : 500 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </Field>
    </div>
  )
}

// ─── Types for AgentData ──────────────────────────────────────────────────
type AgentData = {
  name: string; description: string; avatar: string; type: string
  prompt: string; mode: string
  models: { s2s: string; stt: string; llm: string; tts: string }
  voice: string; speed: number; formality: number; creativity: number
  tools: string[]
  knowledgeBaseIds: string[]
  channels: { web: boolean; voice: boolean; whatsapp: boolean; sms: boolean }
  activeDays: number[]; activeFrom: string; activeTo: string
  handoffOn: boolean; handoffTriggers: string[]; handoffRoute: string
  guardrails: string[]
  parameters: Param[]
  greeting: string; fallback: string
}
type SetFn = (key: keyof AgentData, value: AgentData[keyof AgentData]) => void

// ─── Main component ───────────────────────────────────────────────────────
export function CreateAgent() {
  const navigate = useNavigate()
  const createAgent = useAppStore(s => s.createAgent)

  const [active, setActive] = useState('identity')
  const [completed, setCompleted] = useState<Record<string, boolean>>({})

  const [data, setData] = useState<AgentData>({
    name: '', description: '', avatar: 'a1', type: 'voice',
    prompt: DEFAULT_PROMPT, mode: 'cascaded',
    models: { s2s: 'gpt-4o-realtime', stt: 'sarvam-asr-v2', llm: 'gpt-4o', tts: 'gemini-2.5-tts' },
    voice: 'gemini-zephyr', speed: 50, formality: 35, creativity: 60,
    tools: [],
    knowledgeBaseIds: [],
    channels: { web: false, voice: true, whatsapp: false, sms: false },
    activeDays: [0, 1, 2, 3, 4], activeFrom: '09:00', activeTo: '20:00',
    handoffOn: false, handoffTriggers: ['request'], handoffRoute: '',
    guardrails: [], parameters: [],
    greeting: '', fallback: '',
  })

  const set: SetFn = (key, value) => setData(d => ({ ...d, [key]: value }))

  const completeStage = (id: string) => {
    setCompleted(c => ({ ...c, [id]: true }))
    const idx = STAGES.findIndex(s => s.id === id)
    if (idx < STAGES.length - 1) setActive(STAGES[idx + 1].id)
  }

  const progress = (Object.keys(completed).length / STAGES.length) * 100

  const handleDeploy = () => {
    const fields: AgentField[] = data.parameters.map(p => ({
      name: p.name, type: p.type, default_value: p.default,
      label: p.name, context_type: (p.sendToLlm ? 'llm' : 'system') as import('../../types').ContextType,
    }))
    const agent: Agent = {
      id: `agent-${Date.now()}`,
      display_name: data.name,
      description: data.description,
      status: 'DRAFT',
      channels: [
        ...(data.channels.voice ? ['CALL' as const] : []),
        ...(data.channels.web ? ['CHAT' as const] : []),
      ],
      system_prompt: data.prompt,
      fields,
      functions: data.tools.map(id => ({ id, name: id, type: 'function', pre_execute: false })),
      states: [],
      model: {
        llm: { model_id: data.models.llm, provider_id: 'openai', api_key_id: '' },
        tts: { model_id: data.models.tts, provider_id: 'google', api_key_id: '', voice_id: data.voice },
        stt: { model_id: data.models.stt, provider_id: 'sarvam', api_key_id: '' },
      },
      language_code: 'en-IN',
      is_realtime_api: data.mode === 's2s',
      is_tts_streaming: true,
      is_background_noise_enabled: false,
      is_user_muted_during_greeting: false,
      is_inbound: true,
      rag_enabled: false,
      cag_enabled: false,
      knowledge_base_list: [],
      rag_config: { top_k: 5 },
      realtime_config: {
        temperature: 0.7,
        seed: 0,
        greeting: { enabled: !!data.greeting, text_prompt: data.greeting || null },
      },
      call_config: {
        transfer: { enabled: data.handoffOn, transfer_phone_number: data.handoffRoute, continue_recording: false, transfer_text: '' },
      },
      createdAt: new Date().toISOString(),
      lastInvoked: null,
      invocationsToday: 0,
    }
    createAgent(agent)
    navigate('/agents')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: V.bg, color: V.ink, colorScheme: 'light', fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <CreateTopBar progress={progress} onDiscard={() => navigate('/agents')} />
        <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '260px minmax(0, 920px)',
          gap: 20, padding: '20px 28px 120px', minWidth: 0, justifyContent: 'center',
        }}>
          <StepperRail active={active} setActive={setActive} completed={completed} />
          <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STAGES.map(s => (
              <StageCard
                key={s.id} stage={s}
                expanded={active === s.id}
                done={!!completed[s.id]}
                onExpand={() => setActive(s.id)}
                onContinue={() => completeStage(s.id)}
              >
                {s.id === 'identity'          && <StageIdentity         data={data} set={set} />}
                {s.id === 'persona'           && <StagePersona          data={data} set={set} />}
                {s.id === 'knowledge_params'  && <StageKnowledgeParams  data={data} set={set} />}
                {s.id === 'tools'             && <StageTools            data={data} set={set} />}
                {s.id === 'channel_config'    && <StageChannelConfig    data={data} set={set} />}
                {s.id === 'guardrails_launch' && <StageGuardrailsLaunch data={data} set={set} />}
              </StageCard>
            ))}
          </main>
        </div>
        </div>
        <CreateFooter active={active} setActive={setActive} completed={completed} completeStage={completeStage} />
      </div>
    </div>
  )
}
