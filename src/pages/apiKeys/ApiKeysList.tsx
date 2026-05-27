import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { KeyRound, Plus, Copy, Trash2, Eye } from 'lucide-react'

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

const PROVIDERS = [
  { id: 'provider_openai', name: 'OpenAI' },
  { id: 'provider_anthropic', name: 'Anthropic' },
  { id: 'provider_google', name: 'Google' },
  { id: 'provider_perplexity', name: 'Perplexity' },
]

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 6,
}
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 32px 8px 12px', background: '#fff',
  border: '1px solid #E5E7ED', borderRadius: 10,
  fontSize: 13, color: '#0E1116', outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as React.CSSProperties['colorScheme'],
  fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
}

export function ApiKeysList() {
  const apiKeys = useAppStore((state) => state.apiKeys)
  const createApiKey = useAppStore((state) => state.createApiKey)
  const deleteApiKey = useAppStore((state) => state.deleteApiKey)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showFullKey, setShowFullKey] = useState(false)
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ label: '', provider_id: '', value: '' })

  const handleCreate = () => {
    if (!formData.label.trim() || !formData.provider_id || !formData.value.trim()) return
    const provider = PROVIDERS.find((p) => p.id === formData.provider_id)
    if (!provider) return
    const newKey: any = {
      id: `key_${Date.now()}`,
      label: formData.label,
      provider_id: formData.provider_id,
      provider,
      masked_value: `${formData.value.slice(0, 5)}***${formData.value.slice(-4)}`,
      full_value: formData.value,
      createdAt: new Date().toISOString().split('T')[0],
    }
    createApiKey(newKey)
    setRevealedKeyId(newKey.id)
    setFormData({ label: '', provider_id: '', value: '' })
    setShowFullKey(true)
    setIsCreateModalOpen(false)
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.02em' }}>
              API Keys
            </h1>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
              background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{apiKeys.length}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7385' }}>Manage provider credentials that power your agents</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={15} /> Add API Key
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18, padding: '64px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
        }}>
          <KeyRound size={32} style={{ color: '#C8CDD8', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: V.muted, margin: '0 0 4px' }}>No API keys configured</p>
          <p style={{ fontSize: 12, color: V.muted2, margin: 0 }}>Add provider credentials to power your agents</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {apiKeys.map((key) => {
            const colors = grad(key.label)
            return (
              <div
                key={key.id}
                style={{
                  background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18,
                  boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
                  overflow: 'hidden',
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
                {/* Gradient top accent stripe */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 100%)` }} />

                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    {/* Gradient avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em',
                    }}>
                      {key.label.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: V.ink }}>{key.label}</p>
                        <Badge variant="info">{key.provider.name}</Badge>
                      </div>

                      {/* Monospace key display */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: '7px 12px', background: V.bg,
                        border: `1px solid ${V.line}`, borderRadius: 9, marginBottom: 8,
                      }}>
                        <KeyRound size={12} style={{ color: V.muted2, flexShrink: 0 }} />
                        <code style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          fontSize: 12.5, color: V.ink2, letterSpacing: '0.04em', fontWeight: 500,
                        }}>{key.masked_value}</code>
                        <button
                          onClick={() => copyToClipboard(key.masked_value)}
                          style={{
                            color: V.muted2, background: 'none', border: 'none', cursor: 'pointer',
                            padding: '2px 4px', borderRadius: 4, transition: 'color .15s', display: 'flex', alignItems: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = V.primary)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = V.muted2)}
                          title="Copy to clipboard"
                        >
                          <Copy size={12} />
                        </button>
                      </div>

                      <p style={{ margin: 0, fontSize: 11.5, color: V.muted2 }}>
                        Added {key.createdAt}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteApiKey(key.id)}
                    style={{
                      color: V.rose, background: 'none', border: 'none', cursor: 'pointer',
                      padding: 8, borderRadius: 8, flexShrink: 0, marginLeft: 12, transition: 'background .15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.redBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    title="Delete key"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add API Key" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Label *</label>
            <Input
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., OpenAI Production"
            />
          </div>
          <div>
            <label style={labelStyle}>Provider *</label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select a provider</option>
              {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>API Key Value *</label>
            <Input
              type="password"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter your API key"
            />
            <p style={{ margin: '4px 0 0', fontSize: 11.5, color: V.muted2 }}>
              This will be encrypted and stored securely.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${V.line}` }}>
            <Button onClick={() => setIsCreateModalOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleCreate}>Add Key</Button>
          </div>
        </div>
      </Modal>

      {/* Revealed Key Modal */}
      {revealedKeyId && showFullKey && (
        <Modal
          isOpen={showFullKey}
          onClose={() => { setShowFullKey(false); setRevealedKeyId(null) }}
          title="API Key Created"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: V.amber50, border: `1px solid ${V.amberBorder}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <Eye size={16} style={{ color: V.amber, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 13.5, color: V.amber, fontWeight: 700 }}>
                  Save this key now. You won't be able to see it again.
                </p>
              </div>
              <code style={{
                display: 'block', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 12.5, background: '#FEF3C7', border: '1px solid #FDE68A',
                borderRadius: 8, padding: '10px 14px', wordBreak: 'break-all', color: '#78350F',
                letterSpacing: '0.04em',
              }}>
                {apiKeys.find((k) => k.id === revealedKeyId)?.full_value}
              </code>
            </div>
            <Button
              onClick={() => copyToClipboard(apiKeys.find((k) => k.id === revealedKeyId)?.full_value || '')}
              variant="secondary"
            >
              <Copy size={14} /> Copy to Clipboard
            </Button>
            <Button onClick={() => { setShowFullKey(false); setRevealedKeyId(null) }}>
              I've Saved This Key
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
