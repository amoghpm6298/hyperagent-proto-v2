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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/agents"
          element={
            <Layout>
              <AgentList />
            </Layout>
          }
        />
        <Route
          path="/agents/create"
          element={<CreateAgent />}
        />
        <Route
          path="/agents/:id"
          element={
            <Layout>
              <AgentDetail />
            </Layout>
          }
        />
        <Route
          path="/agents/:id/edit"
          element={
            <Layout>
              <EditAgent />
            </Layout>
          }
        />
        <Route
          path="/campaigns"
          element={
            <Layout>
              <CampaignList />
            </Layout>
          }
        />
        <Route
          path="/campaigns/:id"
          element={
            <Layout>
              <CampaignDetail />
            </Layout>
          }
        />
        <Route
          path="/invocations"
          element={
            <Layout>
              <InvocationList />
            </Layout>
          }
        />
        <Route
          path="/invocations/:id"
          element={
            <Layout>
              <InvocationDetail />
            </Layout>
          }
        />
        <Route
          path="/knowledge-base"
          element={
            <Layout>
              <KnowledgeBaseList />
            </Layout>
          }
        />
        <Route
          path="/api-keys"
          element={
            <Layout>
              <ApiKeysList />
            </Layout>
          }
        />
        <Route
          path="/tools"
          element={
            <Layout>
              <ToolsList />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
