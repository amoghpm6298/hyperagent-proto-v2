import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { Input, TextArea } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Agent, AgentField, AgentFieldType } from '../../types'
import { ArrowLeft, Plus, Trash2, User, Code2, Variable, Radio } from 'lucide-react'

const V = {
  bg: '#F4F5F8', canvas: '#fff', ink: '#0E1116', ink2: '#2B2F38',
  muted: '#6B7385', muted2: '#9AA1B2', line: '#E5E7ED', line2: '#EEF0F4',
  primary: '#3056F4', primary2: '#1F3FE0', primary50: '#EEF1FE', primary100: '#DCE2FE',
  emerald: '#0F9D6E', emerald50: '#E6F6EF', emeraldBorder: '#6EE7B7',
  amber: '#C2780A', amber50: '#FBF1DA', amberBorder: '#FCD34D',
  rose: '#D63B5B', redBg: '#FEF2F2', redBorder: '#FCA5A5',
}

const GRADS = [
  ['#3056F4','#6B5BFF'],['#0F9D6E','#3FD49B'],['#D63B5B','#FF8FA3'],
  ['#C2780A','#F5C26B'],['#11154A','#3056F4'],['#6B5BFF','#B49DFF'],
]
const grad = (name: string) => GRADS[(name.charCodeAt(0)||0) % GRADS.length]

const FIELD_TYPES: { value: AgentFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
]

const cardBase: React.CSSProperties = {
  background: '#fff', borderRadius: 18, border: '1px solid #E5E7ED',
  boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
  marginBottom: 16, overflow: 'hidden',
}

const cardHeaderStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FAFBFE, #fff)',
  borderBottom: '1px solid #EEF0F4',
  padding: '18px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const cardBodyStyle: React.CSSProperties = {
  padding: '20px 24px',
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 6 }

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 32px 8px 12px', background: '#fff', border: '1px solid #E5E7ED', borderRadius: 10,
  fontSize: 13, color: '#0E1116', outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as any, fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
  boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
}

function SectionIconPill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

export function EditAgent() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const agents = useAppStore((state) => state.agents)
  const agent = agents.find((a) => a.id === id)

  if (!agent) {
    return (
      <div style={{ padding: 32, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => navigate('/agents')} style={{ color: V.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <p style={{ fontSize: 13, color: V.muted, margin: 0 }}>Agent not found</p>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    display_name: agent.display_name,
    description: agent.description,
    system_prompt: agent.system_prompt,
  })
  const [variables, setVariables] = useState<AgentField[]>(agent.fields)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.display_name.trim()) newErrors.display_name = 'Agent name is required'
    if (!formData.system_prompt.trim()) newErrors.system_prompt = 'System prompt is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdate = () => {
    if (!validate()) return
    useAppStore.setState((state) => ({
      agents: state.agents.map((a) => a.id === agent.id ? { ...a, ...formData, fields: variables } : a),
    }))
    navigate(`/agents/${agent.id}`)
  }

  const addVariable = () => setVariables([...variables, { name: '', type: 'text', default_value: '', label: '', context_type: 'llm' }])
  const removeVariable = (index: number) => setVariables(variables.filter((_, i) => i !== index))
  const updateVariable = (index: number, field: keyof AgentField, value: any) => {
    const updated = [...variables]; updated[index] = { ...updated[index], [field]: value }; setVariables(updated)
  }

  const g = grad(agent.display_name)

  return (
    <div style={{ padding: '28px 32px 100px', maxWidth: 760, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => navigate(`/agents/${agent.id}`)}
          style={{
            width: 34, height: 34, borderRadius: 10, color: V.muted, background: '#fff',
            border: '1px solid #E5E7ED', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'color .15s, border-color .15s, box-shadow .15s',
            boxShadow: '0 1px 2px rgba(17,21,74,0.04)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = V.primary
            e.currentTarget.style.borderColor = '#C8D2FB'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(48,86,244,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = V.muted
            e.currentTarget.style.borderColor = '#E5E7ED'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(17,21,74,0.04)'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg,${g[0]},${g[1]})`,
          color: '#fff', fontWeight: 800, fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 14px -4px rgba(17,21,74,0.22)',
          flexShrink: 0,
        }}>
          {agent.display_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: V.ink, letterSpacing: '-0.025em' }}>Edit Agent</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: V.muted }}>{agent.display_name}</p>
        </div>
      </div>

      {/* Identity card */}
      <div style={cardBase}>
        {/* Gradient accent stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />
        <div style={cardHeaderStyle}>
          <SectionIconPill color={V.primary50}>
            <User size={16} color={V.primary} />
          </SectionIconPill>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Agent Identity</div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 1 }}>Name and description</div>
          </div>
        </div>
        <div style={cardBodyStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Agent Name *</label>
              <Input
                value={formData.display_name}
                onChange={e => { setFormData({ ...formData, display_name: e.target.value }); if (errors.display_name) setErrors({ ...errors, display_name: '' }) }}
                placeholder="e.g., Customer Retention Agent"
                style={errors.display_name ? { borderColor: '#DC2626' } : {}}
              />
              {errors.display_name && <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#DC2626' }}>{errors.display_name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <TextArea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this agent do?"
                className="h-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Prompt card */}
      <div style={cardBase}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />
        <div style={cardHeaderStyle}>
          <SectionIconPill color="#F0FDF4">
            <Code2 size={16} color={V.emerald} />
          </SectionIconPill>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>System Prompt *</div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 1 }}>Define behavior, tone, and rules</div>
          </div>
        </div>
        <div style={cardBodyStyle}>
          <TextArea
            value={formData.system_prompt}
            onChange={e => { setFormData({ ...formData, system_prompt: e.target.value }); if (errors.system_prompt) setErrors({ ...errors, system_prompt: '' }) }}
            placeholder="Define agent behavior, tone, rules, and instructions"
            className="h-40"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
          />
          {errors.system_prompt && <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#DC2626' }}>{errors.system_prompt}</p>}
        </div>
      </div>

      {/* Variables card */}
      <div style={cardBase}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />
        <div style={cardHeaderStyle}>
          <SectionIconPill color={V.amber50}>
            <Variable size={16} color={V.amber} />
          </SectionIconPill>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Variables</div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 1 }}>Context variables passed to the agent</div>
          </div>
        </div>
        <div style={cardBodyStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {variables.map((variable, index) => (
              <div
                key={index}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10,
                  padding: '12px', background: V.bg, borderRadius: 12, border: `1px solid ${V.line}`,
                }}
              >
                <Input placeholder="Variable name" value={variable.name} onChange={e => updateVariable(index, 'name', e.target.value)} />
                <select
                  value={variable.type}
                  onChange={e => updateVariable(index, 'type', e.target.value)}
                  style={selectStyle}
                >
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <Input placeholder="Default value" value={variable.default_value} onChange={e => updateVariable(index, 'default_value', e.target.value)} />
                <button
                  onClick={() => removeVariable(index)}
                  style={{
                    color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px', borderRadius: 8, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'background .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = V.redBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              onClick={addVariable}
              style={{
                width: '100%', padding: '10px', border: `2px dashed ${V.line}`, borderRadius: 12,
                fontSize: 13.5, fontWeight: 600, color: V.muted, background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, transition: 'border-color .15s, color .15s',
                fontFamily: "'Manrope', ui-sans-serif, sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.color = V.primary }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.color = V.muted }}
            >
              <Plus size={15} /> Add Variable
            </button>
          </div>
        </div>
      </div>

      {/* Channels card (read-only) */}
      <div style={cardBase}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #3056F4 0%, #6B5BFF 60%, #0F9D6E 100%)' }} />
        <div style={cardHeaderStyle}>
          <SectionIconPill color={V.emerald50}>
            <Radio size={16} color={V.emerald} />
          </SectionIconPill>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, letterSpacing: '-0.01em' }}>Channels</div>
            <div style={{ fontSize: 12, color: V.muted, marginTop: 1 }}>Active communication channels</div>
          </div>
        </div>
        <div style={cardBodyStyle}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {agent.channels.map(ch => <Badge key={ch} variant="default">{ch}</Badge>)}
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: V.muted2 }}>To change channels, create a new agent</p>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'flex-end',
        position: 'sticky', bottom: 0,
        background: 'rgba(244,245,248,0.92)', backdropFilter: 'blur(10px)',
        padding: '14px 0',
        borderTop: `1px solid ${V.line}`,
        borderRadius: '18px 18px 0 0',
        marginLeft: -32, marginRight: -32, paddingLeft: 32, paddingRight: 32,
      }}>
        <Button onClick={() => navigate(`/agents/${agent.id}`)} variant="secondary">Cancel</Button>
        <Button onClick={handleUpdate}>Save Changes</Button>
      </div>
    </div>
  )
}
