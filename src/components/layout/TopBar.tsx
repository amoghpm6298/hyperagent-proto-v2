import React from 'react'

interface TopBarProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      borderBottom: '1px solid #EEF0F4',
      background: 'rgba(244,245,248,0.9)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {title && <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.01em' }}>{title}</h1>}
          {subtitle && <p style={{ margin: 0, fontSize: 12, color: '#6B7385', marginTop: 1 }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
