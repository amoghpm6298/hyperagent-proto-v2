import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, TextArea } from '../../components/ui/Input'
import { LibraryBig, Plus, Trash2, Download, FileText } from 'lucide-react'

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

const statusConfig: Record<string, { bg: string; color: string; border: string }> = {
  READY:      { bg: V.emerald50, color: V.emerald, border: V.emeraldBorder },
  PROCESSING: { bg: V.amber50,   color: V.amber,   border: V.amberBorder },
  FAILED:     { bg: V.redBg,     color: V.rose,    border: V.redBorder },
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 6,
}

export function KnowledgeBaseList() {
  const knowledgeBases = useAppStore((state) => state.knowledgeBases)
  const deleteKB = useAppStore((state) => state.deleteKnowledgeBase)
  const createKB = useAppStore((state) => state.createKnowledgeBase)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({ file_name: '', description: '' })

  const handleCreate = () => {
    if (!formData.file_name.trim()) return
    const newKB = {
      id: `kb_${Date.now()}`,
      file_name: formData.file_name,
      description: formData.description,
      status: 'PROCESSING' as const,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    }
    createKB(newKB)
    setFormData({ file_name: '', description: '' })
    setIsCreateModalOpen(false)
    setTimeout(() => {
      useAppStore.setState((state) => ({
        knowledgeBases: state.knowledgeBases.map((kb) =>
          kb.id === newKB.id ? { ...kb, status: 'READY' as const } : kb
        ),
      }))
    }, 2000)
  }

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, fontFamily: "'Manrope', ui-sans-serif, sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.02em' }}>
              Knowledge Bases
            </h1>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
              background: '#EEF1FE', color: '#3056F4', border: '1px solid #C8D2FB',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{knowledgeBases.length}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7385' }}>
            Documents that enhance your agents with retrieval-augmented generation
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={15} /> Upload Document
        </Button>
      </div>

      {knowledgeBases.length === 0 ? (
        <div style={{
          background: V.canvas, border: `1px solid ${V.line}`, borderRadius: 18,
          padding: '64px 24px', textAlign: 'center',
          boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
        }}>
          <LibraryBig size={32} style={{ color: '#C8CDD8', margin: '0 auto 12px' }} strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: V.muted, margin: '0 0 4px' }}>No knowledge bases yet</p>
          <p style={{ fontSize: 12, color: V.muted2, margin: 0 }}>Upload documents to enhance your agents with RAG</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {knowledgeBases.map((kb) => {
            const colors = grad(kb.file_name)
            const sStatus = statusConfig[kb.status] ?? statusConfig.READY
            return (
              <div
                key={kb.id}
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
                {/* Gradient accent stripe */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 60%, #0F9D6E 100%)` }} />

                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    {/* Gradient document avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={19} style={{ color: '#fff' }} strokeWidth={2} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <p style={{
                          margin: 0, fontSize: 14, fontWeight: 800, color: V.ink,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{kb.file_name}</p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                          background: sStatus.bg, color: sStatus.color, border: `1px solid ${sStatus.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>{kb.status}</span>
                      </div>

                      {kb.description && (
                        <p style={{
                          margin: '0 0 8px', fontSize: 12.5, color: V.muted,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
                          overflow: 'hidden',
                        }}>{kb.description}</p>
                      )}

                      <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: V.muted2 }}>
                        <span>Created {kb.created_at}</span>
                        <span>Updated {kb.updated_at}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4, marginLeft: 12, flexShrink: 0 }}>
                    <button
                      style={{
                        color: V.muted2, background: 'none', border: 'none', cursor: 'pointer',
                        padding: 8, borderRadius: 8, transition: 'background .15s, color .15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = V.bg; e.currentTarget.style.color = V.ink }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = V.muted2 }}
                      title="Download"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={() => deleteKB(kb.id)}
                      style={{
                        color: V.rose, background: 'none', border: 'none', cursor: 'pointer',
                        padding: 8, borderRadius: 8, transition: 'background .15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = V.redBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Upload Document" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>File Name</label>
            <Input
              value={formData.file_name}
              onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
              placeholder="e.g., credit_policy_v3.pdf"
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this document contain?"
              className="h-20"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${V.line}` }}>
            <Button onClick={() => setIsCreateModalOpen(false)} variant="secondary">Cancel</Button>
            <Button onClick={handleCreate}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
