import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authed = localStorage.getItem('ha_auth') === '1'
  return authed ? <>{children}</> : <Navigate to="/login" replace />
}
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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/dashboard"    element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/agents"       element={<ProtectedRoute><Layout><AgentList /></Layout></ProtectedRoute>} />
        <Route path="/agents/create" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
        <Route path="/agents/:id"   element={<ProtectedRoute><Layout><AgentDetail /></Layout></ProtectedRoute>} />
        <Route path="/agents/:id/edit" element={<ProtectedRoute><Layout><EditAgent /></Layout></ProtectedRoute>} />
        <Route path="/campaigns"    element={<ProtectedRoute><Layout><CampaignList /></Layout></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute><Layout><CampaignDetail /></Layout></ProtectedRoute>} />
        <Route path="/invocations"  element={<ProtectedRoute><Layout><InvocationList /></Layout></ProtectedRoute>} />
        <Route path="/invocations/:id" element={<ProtectedRoute><Layout><InvocationDetail /></Layout></ProtectedRoute>} />
        <Route path="/knowledge-base" element={<ProtectedRoute><Layout><KnowledgeBaseList /></Layout></ProtectedRoute>} />
        <Route path="/api-keys"     element={<ProtectedRoute><Layout><ApiKeysList /></Layout></ProtectedRoute>} />
        <Route path="/tools"        element={<ProtectedRoute><Layout><ToolsList /></Layout></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
