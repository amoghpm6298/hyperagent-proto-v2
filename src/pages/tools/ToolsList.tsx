import React from 'react'
import { Button } from '../../components/ui/Button'
import { tools } from '../../data/mock'
import { Plus, Zap, Database, Trash2, Search } from 'lucide-react'

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

type ToolType = 'action' | 'query' | 'notification' | 'handoff'

const typeConfig: Record<ToolType | string, { label: string; bg: string; color: string; border: string; gradFrom: string; gradTo: string }> = {
  action: {
    label: 'Action', bg: V.amber50, color: V.amber, border: V.amberBorder,
    gradFrom: '#C2780A', gradTo: '#F5C26B',
  },
  query: {
    label: 'Query', bg: V.emerald50, color: V.emerald, border: V.emeraldBorder,
    gradFrom: '#0F9D6E', gradTo: '#3FD49B',
  },
  notification: {
    label: 'Notification', bg: V.primary50, color: V.primary, border: V.primary100,
    gradFrom: '#3056F4', gradTo: '#6B5BFF',
  },
  handoff: {
    label: 'Handoff', bg: '#F5F0FF', color: '#7C3AED', border: '#DDD6FE',
    gradFrom: '#7C3AED', gradTo: '#A78BFA',
  },
}

function TypeChip({ type }: { type: string }) {
  const cfg = typeConfig[type] ?? typeConfig.action
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {cfg.label}
    </span>
  )
}

function ToolCard({ tool }: { tool: typeof tools[0] }) {
  const colors = grad(tool.label)
  const cfg = typeConfig[tool.type] ?? typeConfig.action

  return (
    <div
      style={{
        background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
        transition: 'border-color .15s, box-shadow .15s, transform .15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 10px 30px -12px rgba(48,86,244,0.18)'
        el.style.borderColor = '#C8D2FB'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'
        el.style.borderColor = V.line
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Category color stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.gradFrom}, ${cfg.gradTo})` }} />

      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Gradient avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {tool.type === 'query'
              ? <Search size={16} style={{ color: '#fff' }} strokeWidth={2.5} />
              : <Zap size={16} style={{ color: '#fff' }} strokeWidth={2.5} />
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: V.ink }}>{tool.label}</h3>
              <TypeChip type={tool.type} />
            </div>
            <div>
              <code style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 11.5, background: V.bg, padding: '3px 8px',
                borderRadius: 6, border: `1px solid ${V.line}`, color: V.ink2,
                letterSpacing: '0.03em',
              }}>{tool.name}</code>
            </div>
          </div>
        </div>

        <button
          style={{
            color: V.rose, background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, borderRadius: 8, flexShrink: 0, marginLeft: 8, transition: 'background .15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = V.redBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export function ToolsList() {
  const actionTools = tools.filter((t) => t.type === 'action')
  const queryTools = tools.filter((t) => t.type === 'query')

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.02em' }}>
              Tools
            </h1>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
              background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{tools.length}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7385' }}>
            Capabilities your agents can use during conversations
          </p>
        </div>
        <Button><Plus size={14} /> Add Tool</Button>
      </div>

      {/* Action Tools */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${typeConfig.action.gradFrom}, ${typeConfig.action.gradTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={17} style={{ color: '#fff' }} strokeWidth={2.5} />
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: V.ink, letterSpacing: '-0.015em' }}>Action Tools</h2>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            background: V.amber50, color: V.amber, border: `1px solid ${V.amberBorder}`,
          }}>{actionTools.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {actionTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>

      {/* Query Tools */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${typeConfig.query.gradFrom}, ${typeConfig.query.gradTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Database size={17} style={{ color: '#fff' }} strokeWidth={2.5} />
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: V.ink, letterSpacing: '-0.015em' }}>Query Tools</h2>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            background: V.emerald50, color: V.emerald, border: `1px solid ${V.emeraldBorder}`,
          }}>{queryTools.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {queryTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>
    </div>
  )
}
