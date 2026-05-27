export type AgentChannel = 'CALL' | 'CHAT'
export type AccessMethod = 'embed' | 'api' | 'event' | 'scheduled'
export type AgentStatus = 'ACTIVE' | 'DRAFT'
export type AgentFieldType = 'text' | 'number' | 'currency' | 'date' | 'time'
export type ContextType = 'llm' | 'system'
export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED'
export type CampaignStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'FAILED'
export type TargetStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
export type TeamMemberRole = 'ADMIN' | 'MEMBER'
export type TeamMemberStatus = 'ACTIVE' | 'PENDING'
export type ConversationStatus = 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'FAILED'

export interface AgentField {
  name: string
  type: AgentFieldType
  default_value: string
  label: string
  context_type: ContextType
}

export interface Provider {
  id: string
  name: string
}

export interface Model {
  id: string
  label: string
  type: 'LLM' | 'STT' | 'TTS'
}

export interface Voice {
  id: string
  label: string
}

export interface Tool {
  id: string
  name: string
  label: string
  type: string
}

export interface ApiKey {
  id: string
  label: string
  provider_id: string
  provider: Provider
  masked_value: string
  full_value?: string // Only present when first generated
  createdAt: string
}

export interface KnowledgeBase {
  id: string
  file_name: string
  description: string
  status: DocumentStatus
  created_at: string
  updated_at: string
}

export interface EmbedKey {
  id: string
  label: string
  maskedKey: string
  fullKey?: string
  allowedDomains: string[]
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
  color?: string
  logoUrl?: string
  displayName?: string
  subtitle?: string
}

export interface SchemaField {
  id?: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'array' | 'enum'
  required: boolean
  enumValues?: string[]
}

export interface HeadlessSchema {
  agentId: string
  inputSchema: SchemaField[]
  outputSchema: SchemaField[]
  apiKeyId: string
  apiKeyMasked: string
  apiKeyFull?: string
  lastUsedAt: string | null
}

export interface AgentModel {
  llm: {
    model_id: string
    provider_id: string
    api_key_id: string
  }
  tts: {
    model_id: string
    provider_id: string
    api_key_id: string
    voice_id: string
  }
  stt: {
    model_id: string
    provider_id: string
    api_key_id: string
  }
}

export interface RAGConfig {
  top_k: number
}

export interface RealtimeConfig {
  temperature: number
  seed: number
  greeting: {
    enabled: boolean
    text_prompt: string | null
  }
}

export interface CallConfig {
  transfer: {
    enabled: boolean
    transfer_phone_number: string
    continue_recording: boolean
    transfer_text: string
  }
}

export interface AccessMethodConfig {
  embed?: {
    enabled: boolean
    keys?: EmbedKey[]
  }
  api?: {
    enabled: boolean
    schema?: HeadlessSchema
  }
  event?: {
    enabled: boolean
  }
  scheduled?: {
    enabled: boolean
  }
}

export interface Agent {
  id: string
  display_name: string
  description: string
  status: AgentStatus
  channels: AgentChannel[]
  accessMethods?: AccessMethodConfig
  system_prompt: string
  fields: AgentField[]
  functions: Array<{ name: string; id: string; type: string; pre_execute: boolean }>
  states: string[]
  model: AgentModel
  language_code: string
  is_realtime_api: boolean
  is_tts_streaming: boolean
  is_background_noise_enabled: boolean
  is_user_muted_during_greeting: boolean
  is_inbound: boolean
  rag_enabled: boolean
  cag_enabled: boolean
  knowledge_base_list: KnowledgeBase[]
  rag_config: RAGConfig
  realtime_config: RealtimeConfig
  call_config: CallConfig
  createdAt: string
  lastInvoked: string | null
  invocationsToday: number
}

export interface Campaign {
  id: string
  name: string
  agentId: string
  agentName: string
  status: CampaignStatus
  totalTargets: number
  completed: number
  pending: number
  failed: number
  startedAt: string
  completedAt?: string
}

export interface CampaignTarget {
  id: string
  phoneNumber: string
  status: TargetStatus
  calledAt?: string
  duration?: number
  outcome?: 'CONTACTED' | 'NO_ANSWER' | 'FAILED'
}

export interface ToolCall {
  id: string
  toolName: string
  toolLabel: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  input: Record<string, any>
  output?: Record<string, any>
  timestamp: string
  errorMessage?: string
}

export interface TranscriptMessage {
  id: string
  speaker: 'Agent' | 'Customer'
  text: string
  startTime: number // seconds from call start
}

export interface QualityScore {
  score: number // 0–10
  label: string
  color: string
}

export interface ConversationFollowups {
  doNotCall: boolean
  callbackRequest: boolean
  transferAttempted: boolean
  transferResult: string
  anomaly: string
}

export interface LLMData {
  tokenUsage: { totalTokens: number; promptTokens: number; completionTokens: number; costUsd: number }
  latency: { p50Ms: number; p95Ms: number }
  turns: number
  model: string
  provider: string
  toolsInvoked: string[]
  safetyFlags: string[]
}

export interface Conversation {
  id: string
  agent: string
  agentId: string
  channel: AgentChannel
  accessMethod?: AccessMethod
  participants: string
  userPhone?: string
  agentPhone?: string
  duration: string
  durationMs?: number
  timestamp: string
  startTime?: string
  endTime?: string
  status: ConversationStatus
  interactionType?: 'INBOUND' | 'OUTBOUND'
  language?: string
  qualityScore?: number
  intentScore?: QualityScore
  irateScore?: QualityScore
  overallQuality?: QualityScore
  aiSummary?: string
  callEndState?: string
  followups?: ConversationFollowups
  hasRecording?: boolean
  messages?: Array<{ role: string; text: string }>
  callTranscript?: TranscriptMessage[]
  toolCalls?: ToolCall[]
  // Rich tab data
  llmData?: LLMData
  externalData?: Record<string, any>
  userId?: string
  campaignId?: string
  region?: string
  operator?: string
  voiceId?: string
  asrEngine?: string
  consentRecorded?: boolean
  sentimentTrend?: number[]
  // HEADLESS-specific
  requestPayload?: Record<string, any>
  responsePayload?: Record<string, any>
  httpStatus?: number
  latencyMs?: number
  // EMBED-specific
  embedKeyLabel?: string
  originDomain?: string
  // test run flag
  isTestRun?: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamMemberRole
  status: TeamMemberStatus
  invitedAt?: string
}

export interface Organization {
  id: string
  name: string
  plan: 'ENTERPRISE' | 'PRO' | 'STARTER'
}

export interface DashboardStats {
  activeAgents: number
  apiCallsToday: number
  voiceCallsToday: number
  embedSessionsToday: number
}

export interface ActivityFeedItem {
  id: string
  timestamp: string
  message: string
  agent: string
  channel: AgentChannel
}
