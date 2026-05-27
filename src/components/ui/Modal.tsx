import React from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, actions, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(14,17,22,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #E5E7ED',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(14,17,22,0.12)',
        width: '100%',
        maxWidth: size === 'sm' ? 380 : size === 'lg' ? 680 : 480,
        fontFamily: "'Manrope', ui-sans-serif, sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7ED' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0E1116' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ color: '#9AA1B2', border: 'none', background: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'background .15s, color .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F4F5F8'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7385' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#9AA1B2' }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid #E5E7ED' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
