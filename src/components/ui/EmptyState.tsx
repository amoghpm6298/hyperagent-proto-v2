import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      {Icon && <Icon size={40} style={{ color: '#C8CDD8', marginBottom: 16 }} strokeWidth={1.5} />}
      <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0E1116' }}>{title}</h3>
      {description && <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6B7385', textAlign: 'center', maxWidth: 320 }}>{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          style={{ fontSize: 13, fontWeight: 600, color: '#3056F4', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
