import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { organization } from '../../data/mock'
import { Trash2, Mail, Plus, Users, Building2, AlertTriangle } from 'lucide-react'

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

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 6,
}
const selectStyle: React.CSSProperties = {
  padding: '8px 32px 8px 12px', background: '#fff', border: '1px solid #E5E7ED', borderRadius: 10,
  fontSize: 13, color: '#0E1116', outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239AA1B2' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  colorScheme: 'light' as React.CSSProperties['colorScheme'],
  fontFamily: "'Manrope', ui-sans-serif, sans-serif", fontWeight: 600,
}

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 18, border: '1px solid #E5E7ED',
  boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
  overflow: 'hidden',
}

const cardHeaderStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FAFBFE, #fff)',
  borderBottom: '1px solid #EEF0F4',
  padding: '18px 24px',
  display: 'flex', alignItems: 'center', gap: 12,
}

function SectionCard({
  title, description, icon, iconBg, iconColor, children,
}: {
  title: string
  description?: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  children: React.ReactNode
}) {
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, { size: 18, style: { color: iconColor } })}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: V.ink, letterSpacing: '-0.015em' }}>{title}</h2>
          {description && <p style={{ margin: 0, fontSize: 12, color: V.muted }}>{description}</p>}
        </div>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  )
}

export function Settings() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')
  const { teamMembers: members, inviteTeamMember } = useAppStore()

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    inviteTeamMember({
      id: `tm_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'PENDING',
      invitedAt: new Date().toISOString().split('T')[0],
    })
    setInviteEmail('')
  }

  const inputFocusStyle = {
    boxShadow: '0 0 0 4px rgba(48,86,244,0.10)',
    borderColor: V.primary,
  }

  return (
    <div style={{
      padding: '28px 28px 60px', maxWidth: 800,
      fontFamily: "'Manrope', ui-sans-serif, sans-serif",
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0E1116', letterSpacing: '-0.02em' }}>
            Settings
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#6B7385' }}>Manage your organization, team, and preferences</p>
      </div>

      {/* Organization */}
      <SectionCard
        title="Organization"
        description="Basic organization information"
        icon={<Building2 />}
        iconBg={V.primary50}
        iconColor={V.primary}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Organization Name</label>
            <div style={{ position: 'relative' }}>
              <Input
                value={organization.name}
                disabled
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = V.line }}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Plan</label>
            <Input
              value={organization.plan}
              disabled
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = V.line }}
            />
          </div>
        </div>
      </SectionCard>

      {/* Team Members */}
      <SectionCard
        title="Team Members"
        description="Manage who has access to this organization"
        icon={<Users />}
        iconBg="#EEF1FE"
        iconColor={V.primary}
      >
        {/* Invite form */}
        <div style={{
          background: V.bg, border: `1px solid ${V.line}`, borderRadius: 12, padding: 18, marginBottom: 24,
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: V.ink }}>Invite Team Member</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@bank.com"
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = V.line }}
              />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                style={selectStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = V.primary; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(48,86,244,0.10)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = V.line; e.currentTarget.style.boxShadow = 'none' }}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Button onClick={handleInvite}>
              <Plus size={14} /> Invite
            </Button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${V.line}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: V.bg, borderBottom: `1px solid ${V.line}` }}>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 14px',
                    fontSize: 11, fontWeight: 700, color: V.muted2,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                const colors = grad(member.name)
                return (
                  <tr
                    key={member.id}
                    style={{ borderBottom: i < members.length - 1 ? `1px solid ${V.line}` : 'none', transition: 'background .1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em',
                        }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: V.ink, fontSize: 13 }}>{member.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: V.muted }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={12} style={{ color: V.muted2, flexShrink: 0 }} />
                        {member.email}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: V.muted }}>{member.role}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                        ...(member.status === 'ACTIVE'
                          ? { background: V.emerald50, color: V.emerald, border: `1px solid ${V.emeraldBorder}` }
                          : { background: V.amber50, color: V.amber, border: `1px solid ${V.amberBorder}` }),
                      }}>{member.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        style={{
                          color: V.rose, background: 'none', border: 'none', cursor: 'pointer',
                          padding: 6, borderRadius: 8, transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = V.redBg)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div style={{
        background: V.redBg, border: `1px solid ${V.redBorder}`, borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(17,21,74,0.04), 0 1px 3px rgba(17,21,74,0.04)',
      }}>
        <div style={{
          background: 'linear-gradient(180deg, #FEF2F2, #FEF2F2)',
          borderBottom: '1px solid #FCA5A5',
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={18} style={{ color: V.rose }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#991B1B', letterSpacing: '-0.015em' }}>Danger Zone</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#DC2626' }}>Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div style={{ padding: '22px 24px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#DC2626' }}>
            Deleting your organization will permanently remove all agents, data, and configurations.
          </p>
          <Button variant="danger">Delete Organization</Button>
        </div>
      </div>
    </div>
  )
}
