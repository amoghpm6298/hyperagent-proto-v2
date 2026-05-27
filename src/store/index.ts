import { create } from 'zustand'
import { Agent, ApiKey, KnowledgeBase, Campaign, TeamMember, EmbedKey, Conversation } from '../types'
import * as mockData from '../data/mock'

interface AppState {
  agents: Agent[]
  apiKeys: ApiKey[]
  knowledgeBases: KnowledgeBase[]
  campaigns: Campaign[]
  teamMembers: TeamMember[]
  conversations: Conversation[]

  // Agent actions
  createAgent: (agent: Agent) => void
  updateAgent: (agentId: string, updates: Partial<Agent>) => void
  deleteAgent: (agentId: string) => void

  // Embed key actions
  addEmbedKey: (agentId: string, key: EmbedKey) => void
  updateEmbedKey: (agentId: string, keyId: string, updates: Partial<EmbedKey>) => void
  revokeEmbedKey: (agentId: string, keyId: string) => void

  // API Key actions
  createApiKey: (key: ApiKey) => void
  deleteApiKey: (keyId: string) => void

  // Knowledge Base actions
  createKnowledgeBase: (kb: KnowledgeBase) => void
  deleteKnowledgeBase: (kbId: string) => void

  // Campaign actions
  createCampaign: (campaign: Campaign) => void

  // Team Member actions
  inviteTeamMember: (member: TeamMember) => void

  // Conversation actions
  addConversation: (conv: Conversation) => void
}

export const useAppStore = create<AppState>((set) => ({
  agents: mockData.agents,
  apiKeys: mockData.apiKeys,
  knowledgeBases: mockData.knowledgeBases,
  campaigns: mockData.campaigns,
  teamMembers: mockData.teamMembers,
  conversations: mockData.conversations,

  createAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  addEmbedKey: (agentId, key) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId) return a
        const existingKeys = a.accessMethods?.embed?.keys ?? []
        return {
          ...a,
          accessMethods: {
            ...a.accessMethods,
            embed: { ...(a.accessMethods?.embed ?? { enabled: true }), keys: [...existingKeys, key] },
          },
        }
      }),
    })),

  updateEmbedKey: (agentId, keyId, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId) return a
        return {
          ...a,
          accessMethods: {
            ...a.accessMethods,
            embed: {
              ...(a.accessMethods?.embed ?? { enabled: true }),
              keys: (a.accessMethods?.embed?.keys ?? []).map(k => k.id === keyId ? { ...k, ...updates } : k),
            },
          },
        }
      }),
    })),

  revokeEmbedKey: (agentId, keyId) =>
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id !== agentId) return a
        return {
          ...a,
          accessMethods: {
            ...a.accessMethods,
            embed: {
              ...(a.accessMethods?.embed ?? { enabled: true }),
              keys: (a.accessMethods?.embed?.keys ?? []).filter((k) => k.id !== keyId),
            },
          },
        }
      }),
    })),

  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === agentId ? { ...a, ...updates } : a)),
    })),

  deleteAgent: (agentId) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== agentId),
    })),

  createApiKey: (key) =>
    set((state) => ({
      apiKeys: [...state.apiKeys, key],
    })),

  deleteApiKey: (keyId) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((k) => k.id !== keyId),
    })),

  createKnowledgeBase: (kb) =>
    set((state) => ({
      knowledgeBases: [...state.knowledgeBases, kb],
    })),

  deleteKnowledgeBase: (kbId) =>
    set((state) => ({
      knowledgeBases: state.knowledgeBases.filter((k) => k.id !== kbId),
    })),

  createCampaign: (campaign) =>
    set((state) => ({
      campaigns: [...state.campaigns, campaign],
    })),

  inviteTeamMember: (member) =>
    set((state) => ({
      teamMembers: [...state.teamMembers, member],
    })),

  addConversation: (conv) =>
    set((state) => ({
      conversations: [conv, ...state.conversations],
    })),
}))
