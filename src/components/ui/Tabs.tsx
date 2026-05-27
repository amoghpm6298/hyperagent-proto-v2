import React from 'react'

interface TabItem {
  label: string
  id: string
  icon?: React.ElementType
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div style={{ borderBottom: '1px solid #E5E7ED' }}>
      <div style={{ display: 'flex', gap: 0 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: isActive ? '-0.005em' : 'normal',
                color: isActive ? '#3056F4' : '#6B7385',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #3056F4' : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                transition: 'color .15s, border-color .15s',
                fontFamily: "'Manrope', ui-sans-serif, sans-serif",
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = '#0E1116'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = '#6B7385'
              }}
            >
              {Icon && <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />}
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
