import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Zap, Radio, MessageSquare, Settings, LogOut, Library, Key, Wrench, ChevronDown, Check, Building2 } from 'lucide-react'
import clsx from 'clsx'

function HFLogo() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      background: '#3056F4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 2h4v4.5H2zM9 2h4v4.5H9zM2 8.5h4V13H2zM9 8.5h4V13H9z" fill="#fff" fillOpacity={0.9} />
        <rect x="5.5" y="6.25" width="4" height="2.5" fill="#fff" fillOpacity={0.6} rx="1" />
      </svg>
    </div>
  )
}

const navItems = [
  { label: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Agents',        href: '/agents',          icon: Zap },
  { label: 'Invocations',   href: '/invocations',     icon: MessageSquare },
  { label: 'Campaigns',     href: '/campaigns',       icon: Radio },
  { label: 'Knowledge Base',href: '/knowledge-base',  icon: Library },
  { label: 'API Keys',      href: '/api-keys',        icon: Key },
  { label: 'Tools',         href: '/tools',           icon: Wrench },
  { label: 'Settings',      href: '/settings',        icon: Settings },
]

const TENANTS = [
  { id: 'global',   label: 'Global',        color: '#3056F4', bg: '#EEF1FE' },
  { id: 'indusind', label: 'IndusInd Bank', color: '#0F9D6E', bg: '#E6F6EF' },
  { id: 'abc',      label: 'ABC Bank',      color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'yes',      label: 'Yes Bank',      color: '#C2780A', bg: '#FBF1DA' },
]


export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedTenant, setSelectedTenant] = useState(TENANTS[0])
  const [tenantOpen, setTenantOpen] = useState(false)

  return (
    <aside className="w-[216px] flex-shrink-0 flex flex-col h-screen"
      style={{ background: '#fff', borderRight: '1px solid #E5E7ED' }}>

      {/* Logo */}
      <div className="px-4 h-14 flex items-center" style={{ borderBottom: '1px solid #EEF0F4', gap: 10 }}>
        <HFLogo />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.02em', fontFamily: 'Manrope, sans-serif' }}>HyperAgent</span>
      </div>

      {/* Tenant selector */}
      <div style={{ padding: '10px 10px 4px', position: 'relative' }}>
        <button
          onClick={() => setTenantOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 10, border: '1px solid #E5E7ED',
            background: tenantOpen ? '#F4F5F8' : '#FAFBFE',
            cursor: 'pointer', textAlign: 'left',
            fontFamily: 'Manrope, sans-serif',
            transition: 'background .15s, border-color .15s',
          }}
          onMouseEnter={e => { if (!tenantOpen) e.currentTarget.style.background = '#F4F5F8' }}
          onMouseLeave={e => { if (!tenantOpen) e.currentTarget.style.background = '#FAFBFE' }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
            background: selectedTenant.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={13} style={{ color: selectedTenant.color }} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9AA1B2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tenant</p>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#0E1116', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedTenant.label}
            </p>
          </div>
          <ChevronDown size={13} style={{ color: '#9AA1B2', flexShrink: 0, transform: tenantOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>

        {/* Dropdown */}
        {tenantOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% - 4px)', left: 10, right: 10, zIndex: 100,
            background: '#fff', border: '1px solid #E5E7ED', borderRadius: 12,
            boxShadow: '0 8px 24px -6px rgba(17,21,74,0.14), 0 2px 8px -2px rgba(17,21,74,0.08)',
            overflow: 'hidden',
          }}>
            {TENANTS.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => { setSelectedTenant(tenant); setTenantOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 12px', border: 'none',
                  background: selectedTenant.id === tenant.id ? tenant.bg : 'transparent',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'Manrope, sans-serif',
                  transition: 'background .1s',
                } as React.CSSProperties}
                onMouseEnter={e => { if (selectedTenant.id !== tenant.id) e.currentTarget.style.background = '#F4F5F8' }}
                onMouseLeave={e => { if (selectedTenant.id !== tenant.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: tenant.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={12} style={{ color: tenant.color }} strokeWidth={2} />
                </div>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: selectedTenant.id === tenant.id ? 700 : 500, color: '#0E1116' }}>
                  {tenant.label}
                </span>
                {selectedTenant.id === tenant.id && (
                  <Check size={12} style={{ color: tenant.color, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/' && location.pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setTenantOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 10, textDecoration: 'none',
                fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1F3FE0' : '#6B7385',
                background: isActive ? '#EEF1FE' : 'transparent',
                transition: 'all .15s',
              }}
              className={clsx(!isActive && 'hover:bg-[#F4F5F8]')}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5}
                style={{ color: isActive ? '#3056F4' : '#9AA1B2', flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid #EEF0F4', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3056F4, #6B5BFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>AP</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: '#0E1116', lineHeight: 1.2, margin: 0 }}>Amogh P.</p>
              <p style={{ fontSize: 11, color: '#9AA1B2', lineHeight: 1.2, margin: 0 }}>Admin</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('ha_auth'); navigate('/login') }}
            title="Sign out"
            style={{ color: '#9AA1B2', border: 'none', background: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }}
            className="hover:bg-[#F4F5F8] hover:text-[#6B7385] transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
