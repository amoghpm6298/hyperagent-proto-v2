import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon?: LucideIcon
  label: string
  value: string | number
  change?: { value: number; direction: 'up' | 'down' }
  accent?: string
  accentBg?: string
}

export function StatCard({ icon: Icon, label, value, change, accent = '#3056F4', accentBg = '#EEF1FE' }: StatCardProps) {
  const isPositive = change?.direction === 'up'
  const pct = Math.min(100, Math.abs(change?.value ?? 0) * 2)

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid #E5E7ED',
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
      transition: 'box-shadow .2s, border-color .2s, transform .15s',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 10px 30px -12px rgba(48,86,244,0.14)'
        el.style.borderColor = '#C8D2FB'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)'
        el.style.borderColor = '#E5E7ED'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9AA1B2', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
          <p style={{ fontSize: 30, fontWeight: 800, color: '#0E1116', letterSpacing: '-0.035em', margin: '8px 0 0', lineHeight: 1 }}>{value}</p>
        </div>
        {Icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={17} style={{ color: accent }} strokeWidth={2} />
          </div>
        )}
      </div>

      {change && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: isPositive ? '#0F9D6E' : '#E5533C' }}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPositive ? '+' : '-'}{Math.abs(change.value)}%</span>
            </div>
            <span style={{ fontSize: 11, color: '#9AA1B2' }}>vs last period</span>
          </div>
          <div style={{ height: 3, borderRadius: 999, background: '#EEF0F4', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: 999,
              background: isPositive
                ? 'linear-gradient(90deg, #0F9D6E, #3FD49B)'
                : 'linear-gradient(90deg, #E5533C, #FF8A6B)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
