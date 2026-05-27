import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { AgentList } from './pages/agents/AgentList'
import { AgentDetail } from './pages/agents/AgentDetail'
import { CreateAgent } from './pages/agents/CreateAgent'
import { EditAgent } from './pages/agents/EditAgent'
import { CampaignList } from './pages/campaigns/CampaignList'
import { CampaignDetail } from './pages/campaigns/CampaignDetail'
import { InvocationList } from './pages/invocations/InvocationList'
import { InvocationDetail } from './pages/invocations/InvocationDetail'
import { KnowledgeBaseList } from './pages/knowledgeBase/KnowledgeBaseList'
import { ApiKeysList } from './pages/apiKeys/ApiKeysList'
import { ToolsList } from './pages/tools/ToolsList'
import { Settings } from './pages/settings/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authed = localStorage.getItem('ha_auth') === '1'
  return authed ? <>{children}</> : <Navigate to="/login" replace />
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"          element={<Login />} />
        <Route path="/"               element={<Navigate to="/login" replace />} />

        <Route path="/dashboard"      element={<P><Dashboard /></P>} />
        <Route path="/agents"         element={<P><AgentList /></P>} />
        <Route path="/agents/:id"     element={<P><AgentDetail /></P>} />
        <Route path="/agents/:id/edit" element={<P><EditAgent /></P>} />
        <Route path="/agents/create"  element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
        <Route path="/campaigns"      element={<P><CampaignList /></P>} />
        <Route path="/campaigns/:id"  element={<P><CampaignDetail /></P>} />
        <Route path="/invocations"    element={<P><InvocationList /></P>} />
        <Route path="/invocations/:id" element={<P><InvocationDetail /></P>} />
        <Route path="/knowledge-base" element={<P><KnowledgeBaseList /></P>} />
        <Route path="/api-keys"       element={<P><ApiKeysList /></P>} />
        <Route path="/tools"          element={<P><ToolsList /></P>} />
        <Route path="/settings"       element={<P><Settings /></P>} />
      </Routes>
    </BrowserRouter>
  )
}
