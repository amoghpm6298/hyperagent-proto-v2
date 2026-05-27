import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface LayoutProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  headerAction?: React.ReactNode
}

export function Layout({ title, subtitle, children, headerAction }: LayoutProps) {
  return (
    <div className="flex h-screen" style={{ background: '#F4F5F8' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {(title || headerAction) && <TopBar title={title} subtitle={subtitle} action={headerAction} />}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
