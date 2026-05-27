import {
  Agent,
  ApiKey,
  KnowledgeBase,
  Tool,
  Provider,
  Campaign,
  CampaignTarget,
  TeamMember,
  Organization,
  ActivityFeedItem,
  DashboardStats,
  Conversation,
} from '../types'

export const organization: Organization = {
  id: 'org_001',
  name: 'Kotak Bank',
  plan: 'ENTERPRISE',
}

export const providers: Provider[] = [
  { id: 'provider_openai', name: 'OpenAI' },
  { id: 'provider_anthropic', name: 'Anthropic' },
  { id: 'provider_google', name: 'Google' },
  { id: 'provider_perplexity', name: 'Perplexity' },
]

export const apiKeys: ApiKey[] = [
  {
    id: 'key_001',
    label: 'OpenAI Production',
    provider_id: 'provider_openai',
    provider: { id: 'provider_openai', name: 'OpenAI' },
    masked_value: 'sk-proj-***k4xm',
    createdAt: '2026-04-15',
  },
  {
    id: 'key_002',
    label: 'Anthropic Development',
    provider_id: 'provider_anthropic',
    provider: { id: 'provider_anthropic', name: 'Anthropic' },
    masked_value: 'sk-ant-***x9pq',
    createdAt: '2026-03-20',
  },
  {
    id: 'key_003',
    label: 'Google Gemini',
    provider_id: 'provider_google',
    provider: { id: 'provider_google', name: 'Google' },
    masked_value: 'AIza***Sv8w',
    createdAt: '2026-05-01',
  },
]

export const knowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb_001',
    file_name: 'credit_policy_v3.pdf',
    description: 'Credit policies and approval guidelines',
    status: 'READY',
    created_at: '2026-04-10',
    updated_at: '2026-05-10',
  },
  {
    id: 'kb_002',
    file_name: 'product_catalogue_may2026.pdf',
    description: 'Complete product and services catalog',
    status: 'READY',
    created_at: '2026-05-01',
    updated_at: '2026-05-12',
  },
  {
    id: 'kb_003',
    file_name: 'brand_guidelines.docx',
    description: 'Brand voice, tone, and messaging guidelines',
    status: 'READY',
    created_at: '2026-03-22',
    updated_at: '2026-04-15',
  },
  {
    id: 'kb_004',
    file_name: 'faq_collections.txt',
    description: 'Frequently asked questions and answers',
    status: 'PROCESSING',
    created_at: '2026-05-13',
    updated_at: '2026-05-13',
  },
]

export const tools: Tool[] = [
  {
    id: 'tool_001',
    name: 'send_email',
    label: 'Send Email',
    type: 'action',
  },
  {
    id: 'tool_002',
    name: 'create_ticket',
    label: 'Create Support Ticket',
    type: 'action',
  },
  {
    id: 'tool_003',
    name: 'check_balance',
    label: 'Check Account Balance',
    type: 'query',
  },
  {
    id: 'tool_004',
    name: 'schedule_callback',
    label: 'Schedule Callback',
    type: 'action',
  },
  {
    id: 'tool_005',
    name: 'lookup_eligibility',
    label: 'Lookup Loan Eligibility',
    type: 'query',
  },
]

export const agents: Agent[] = [
  {
    id: 'agt_006',
    display_name: 'Home Loan Lead Qualifying Agent',
    description: 'Outbound BFSI agent that qualifies home loan leads from CRM lists and captures renovation vs. purchase intent',
    status: 'ACTIVE',
    channels: ['CALL'],
    system_prompt: `You are Rahul, a friendly loan advisor at Kotak Bank. You are calling leads who expressed interest in home loans.

Your goal:
1. Confirm identity and interest
2. Understand loan purpose (purchase or renovation)
3. Capture loan amount and tenure preference
4. Check employment and income eligibility
5. Collect CRM disposition and schedule RM callback if qualified

Be concise, professional, and conversational. Speak in clear Indian English.`,
    fields: [
      { name: 'lead_name', type: 'text', default_value: '', label: 'Lead Name', context_type: 'llm' },
      { name: 'lead_phone', type: 'text', default_value: '', label: 'Lead Phone', context_type: 'system' },
      { name: 'lead_id', type: 'text', default_value: '', label: 'Lead ID', context_type: 'system' },
      { name: 'list_id', type: 'text', default_value: '', label: 'List ID', context_type: 'system' },
    ],
    functions: [
      { name: 'lookup_eligibility', id: 'tool_005', type: 'query', pre_execute: false },
      { name: 'schedule_callback', id: 'tool_004', type: 'action', pre_execute: false },
    ],
    states: [],
    model: {
      llm: { model_id: 'gpt-4o-mini', provider_id: 'provider_openai', api_key_id: 'key_001' },
      tts: { model_id: 'kotak_male_en_v2', provider_id: 'provider_openai', api_key_id: 'key_001', voice_id: 'kotak_male_en_v2' },
      stt: { model_id: 'deepgram-nova-2', provider_id: 'provider_openai', api_key_id: 'key_001' },
    },
    language_code: 'en-IN',
    is_realtime_api: false,
    is_tts_streaming: true,
    is_background_noise_enabled: false,
    is_user_muted_during_greeting: true,
    is_inbound: false,
    rag_enabled: true,
    cag_enabled: false,
    knowledge_base_list: [knowledgeBases[0], knowledgeBases[1]],
    rag_config: { top_k: 8 },
    realtime_config: {
      temperature: 0,
      seed: 0,
      greeting: { enabled: true, text_prompt: 'Hello, am I speaking with {{lead_name}}? This is Rahul calling from Kotak Bank.' },
    },
    call_config: {
      transfer: {
        enabled: true,
        transfer_phone_number: '+918035100000',
        continue_recording: true,
        transfer_text: 'Let me connect you to our RM team for the next steps.',
      },
    },
    accessMethods: { embed: { enabled: false }, api: { enabled: false } },
    createdAt: '2026-04-20',
    lastInvoked: '10 minutes ago',
    invocationsToday: 312,
  },
  {
    id: 'agt_007',
    display_name: 'Next Best Action Agent',
    description: 'Chat agent that recommends the next best product or action for a customer based on CRM context',
    status: 'ACTIVE',
    channels: ['CHAT'],
    system_prompt: `You are an intelligent banking assistant. Given a customer's CRM profile, recommend the most relevant next action or product cross-sell opportunity. Be concise and data-driven.`,
    fields: [
      { name: 'customer_id', type: 'text', default_value: '', label: 'Customer ID', context_type: 'system' },
      { name: 'crm_segment', type: 'text', default_value: '', label: 'CRM Segment', context_type: 'llm' },
    ],
    functions: [],
    states: ['start', 'analyzing', 'recommended', 'end'],
    model: {
      llm: { model_id: 'gpt-4o', provider_id: 'provider_openai', api_key_id: 'key_001' },
      tts: { model_id: 'tts-1', provider_id: 'provider_openai', api_key_id: 'key_001', voice_id: 'nova' },
      stt: { model_id: 'whisper-1', provider_id: 'provider_openai', api_key_id: 'key_001' },
    },
    language_code: 'en-IN',
    is_realtime_api: false, is_tts_streaming: false, is_background_noise_enabled: false,
    is_user_muted_during_greeting: false, is_inbound: true, rag_enabled: false, cag_enabled: true,
    knowledge_base_list: [],
    rag_config: { top_k: 5 },
    realtime_config: { temperature: 0, seed: 0, greeting: { enabled: false, text_prompt: null } },
    call_config: { transfer: { enabled: false, transfer_phone_number: '', continue_recording: false, transfer_text: '' } },
    accessMethods: { embed: { enabled: false }, api: { enabled: false } },
    createdAt: '2026-05-01',
    lastInvoked: '35 minutes ago',
    invocationsToday: 48,
  },
  {
    id: 'agt_001',
    display_name: 'Customer Retention Agent',
    description: 'Handles inbound retention calls from at-risk customers',
    status: 'ACTIVE',
    channels: ['CALL'],
    system_prompt: `You are a friendly and empathetic bank relationship manager. Your goal is to understand why the customer is considering leaving and offer a tailored solution.

Be conversational, listen actively, and make personalized offers based on their situation.`,
    fields: [
      {
        name: 'customer_name',
        type: 'text',
        default_value: '',
        label: 'Customer Name',
        context_type: 'llm',
      },
      {
        name: 'account_number',
        type: 'text',
        default_value: '',
        label: 'Account Number',
        context_type: 'system',
      },
    ],
    functions: [
      { name: 'check_balance', id: 'tool_003', type: 'query', pre_execute: true },
      { name: 'schedule_callback', id: 'tool_004', type: 'action', pre_execute: false },
    ],
    states: [],
    model: {
      llm: { model_id: 'gemini-live', provider_id: 'provider_google', api_key_id: 'key_003' },
      tts: { model_id: 'google-tts', provider_id: 'provider_google', api_key_id: 'key_003', voice_id: 'aria' },
      stt: { model_id: 'google-cloud-speech', provider_id: 'provider_google', api_key_id: 'key_003' },
    },
    language_code: 'en-IN',
    is_realtime_api: true,
    is_tts_streaming: false,
    is_background_noise_enabled: false,
    is_user_muted_during_greeting: true,
    is_inbound: true,
    rag_enabled: true,
    cag_enabled: false,
    knowledge_base_list: [knowledgeBases[0], knowledgeBases[1]],
    rag_config: { top_k: 10 },
    realtime_config: {
      temperature: 0,
      seed: 0,
      greeting: {
        enabled: true,
        text_prompt: 'Hello, thank you for calling HDFC Bank. How can I assist you today?',
      },
    },
    call_config: {
      transfer: {
        enabled: false,
        transfer_phone_number: '',
        continue_recording: false,
        transfer_text: 'Your call is being transferred',
      },
    },
    createdAt: '2026-02-15',
    lastInvoked: '1 hour ago',
    invocationsToday: 89,
  },
  {
    id: 'agt_002',
    display_name: 'Call Disposition Assistant',
    description: 'Chat-based tool for generating call summaries and disposition notes',
    status: 'ACTIVE',
    channels: ['CHAT'],
    system_prompt: `You are a bank call center supervisor. Listen to or read the call transcript and create a professional disposition note.

Extract:
- Customer issue/request
- Resolution provided
- Next steps
- Follow-up actions

Be concise but comprehensive.`,
    fields: [
      {
        name: 'transcript',
        type: 'text',
        default_value: '',
        label: 'Call Transcript',
        context_type: 'llm',
      },
    ],
    functions: [
      { name: 'create_ticket', id: 'tool_002', type: 'action', pre_execute: false },
    ],
    states: ['start', 'analyzing', 'summarized', 'end'],
    model: {
      llm: { model_id: 'gpt-4o', provider_id: 'provider_openai', api_key_id: 'key_001' },
      tts: { model_id: 'tts-1', provider_id: 'provider_openai', api_key_id: 'key_001', voice_id: 'nova' },
      stt: { model_id: 'whisper-1', provider_id: 'provider_openai', api_key_id: 'key_001' },
    },
    language_code: 'en-IN',
    is_realtime_api: false,
    is_tts_streaming: false,
    is_background_noise_enabled: false,
    is_user_muted_during_greeting: false,
    is_inbound: false,
    rag_enabled: false,
    cag_enabled: true,
    knowledge_base_list: [knowledgeBases[2]],
    rag_config: { top_k: 5 },
    realtime_config: {
      temperature: 0,
      seed: 0,
      greeting: { enabled: false, text_prompt: null },
    },
    call_config: {
      transfer: {
        enabled: false,
        transfer_phone_number: '',
        continue_recording: false,
        transfer_text: 'Your call is being transferred',
      },
    },
    createdAt: '2026-03-22',
    lastInvoked: '14 minutes ago',
    invocationsToday: 234,
  },
  {
    id: 'agt_003',
    display_name: 'Outbound Survey Agent',
    description: 'Outbound calls for customer satisfaction surveys',
    status: 'ACTIVE',
    channels: ['CALL'],
    system_prompt: `You are conducting a customer satisfaction survey. Ask the provided questions in a friendly manner and record responses.

Be conversational and professional.`,
    fields: [
      { name: 'customer_phone', type: 'text', default_value: '', label: 'Customer Phone', context_type: 'system' },
      { name: 'survey_id', type: 'text', default_value: '', label: 'Survey ID', context_type: 'system' },
    ],
    functions: [],
    states: [],
    model: {
      llm: { model_id: 'claude-3-5-sonnet', provider_id: 'provider_anthropic', api_key_id: 'key_002' },
      tts: { model_id: 'tts-1-hd', provider_id: 'provider_openai', api_key_id: 'key_001', voice_id: 'shimmer' },
      stt: { model_id: 'whisper-1', provider_id: 'provider_openai', api_key_id: 'key_001' },
    },
    language_code: 'en-US',
    is_realtime_api: false,
    is_tts_streaming: false,
    is_background_noise_enabled: true,
    is_user_muted_during_greeting: false,
    is_inbound: false,
    rag_enabled: false,
    cag_enabled: false,
    knowledge_base_list: [],
    rag_config: { top_k: 10 },
    realtime_config: {
      temperature: 0,
      seed: 0,
      greeting: {
        enabled: true,
        text_prompt: 'Hi, this is a quick survey call. Do you have 2 minutes?',
      },
    },
    call_config: {
      transfer: {
        enabled: true,
        transfer_phone_number: '+1-800-555-0123',
        continue_recording: false,
        transfer_text: 'I am transferring you to an agent',
      },
    },
    createdAt: '2026-04-05',
    lastInvoked: '2 hours ago',
    invocationsToday: 145,
  },
  {
    id: 'agt_004',
    display_name: 'Draft Offer Generator',
    description: 'Generates personalized offer descriptions for campaigns',
    status: 'DRAFT',
    channels: ['CHAT'],
    system_prompt: `You are a marketing copywriter for a bank. Write compelling, concise offer descriptions that highlight benefits and urgency.

Match the bank's tone: professional yet friendly.`,
    fields: [
      {
        name: 'product_type',
        type: 'text',
        default_value: 'credit_card',
        label: 'Product Type',
        context_type: 'llm',
      },
    ],
    functions: [],
    states: ['draft', 'reviewing', 'approved'],
    model: {
      llm: { model_id: 'gpt-4o', provider_id: 'provider_openai', api_key_id: 'key_001' },
      tts: { model_id: 'tts-1', provider_id: 'provider_openai', api_key_id: 'key_001', voice_id: 'nova' },
      stt: { model_id: 'whisper-1', provider_id: 'provider_openai', api_key_id: 'key_001' },
    },
    language_code: 'en-IN',
    is_realtime_api: false,
    is_tts_streaming: false,
    is_background_noise_enabled: false,
    is_user_muted_during_greeting: false,
    is_inbound: false,
    rag_enabled: true,
    cag_enabled: false,
    knowledge_base_list: [knowledgeBases[1], knowledgeBases[2]],
    rag_config: { top_k: 8 },
    realtime_config: {
      temperature: 0,
      seed: 0,
      greeting: { enabled: false, text_prompt: null },
    },
    call_config: {
      transfer: {
        enabled: false,
        transfer_phone_number: '',
        continue_recording: false,
        transfer_text: 'Your call is being transferred',
      },
    },
    createdAt: '2026-05-10',
    lastInvoked: null,
    invocationsToday: 0,
  },
  {
    id: 'agt_005',
    display_name: 'Omnichannel Product Recommendation Engine',
    description: 'Recommends banking products across web, mobile, and API integrations',
    status: 'ACTIVE',
    channels: ['CHAT'],
    accessMethods: {
      embed: {
        enabled: true,
        keys: [
          {
            id: 'ek_001',
            label: 'Website Production',
            maskedKey: 'pk_live_aB7cDeFgHiJ9KlMn',
            allowedDomains: ['www.hdfc.com', 'app.hdfc.com', 'banking.hdfc.co.in'],
            isActive: true,
            lastUsedAt: '2026-05-14 14:32',
            createdAt: '2026-05-01',
          },
          {
            id: 'ek_002',
            label: 'Mobile App Widget',
            maskedKey: 'pk_live_xYz1234AbCdEfGhI',
            allowedDomains: ['*.hdfc-mobile.app', 'hdfc.app'],
            isActive: true,
            lastUsedAt: '2026-05-14 13:15',
            createdAt: '2026-05-08',
          },
        ],
      },
      api: {
        enabled: true,
        schema: {
          agentId: 'agt_005',
          inputSchema: [
            { id: 'if_001', name: 'customer_id', type: 'text', required: true },
            { id: 'if_002', name: 'account_balance', type: 'number', required: true },
            { id: 'if_003', name: 'monthly_income', type: 'number', required: true },
            { id: 'if_004', name: 'age_group', type: 'text', required: false },
            { id: 'if_005', name: 'employment_type', type: 'text', required: false },
          ],
          outputSchema: [
            { id: 'of_001', name: 'recommendations', type: 'array', required: true },
            { id: 'of_002', name: 'primary_product_id', type: 'text', required: true },
            { id: 'of_003', name: 'confidence_score', type: 'number', required: true },
            { id: 'of_004', name: 'reason', type: 'text', required: true },
          ],
          apiKeyId: 'api_005',
          apiKeyMasked: 'api_key_live_abc123xyz789def456ghi',
          lastUsedAt: '2026-05-14 15:42',
        },
      },
    },
    system_prompt: `You are a smart banking product recommendation engine. Analyze customer data and recommend the most suitable banking products.

Return recommendations as JSON with product_id, name, reason, and confidence score (0-1).
Be concise but persuasive in your recommendations.`,
    fields: [
      {
        name: 'customer_id',
        type: 'text',
        default_value: '',
        label: 'Customer ID',
        context_type: 'system',
      },
      {
        name: 'account_balance',
        type: 'currency',
        default_value: '0',
        label: 'Current Balance',
        context_type: 'llm',
      },
      {
        name: 'monthly_income',
        type: 'currency',
        default_value: '0',
        label: 'Monthly Income',
        context_type: 'llm',
      },
    ],
    functions: [],
    states: [],
    model: {
      llm: { model_id: 'gpt-4o', provider_id: 'provider_openai', api_key_id: 'key_001' },
      tts: { model_id: 'tts-1', provider_id: 'provider_openai', api_key_id: 'key_001', voice_id: 'nova' },
      stt: { model_id: 'whisper-1', provider_id: 'provider_openai', api_key_id: 'key_001' },
    },
    language_code: 'en-IN',
    is_realtime_api: false,
    is_tts_streaming: false,
    is_background_noise_enabled: false,
    is_user_muted_during_greeting: false,
    is_inbound: false,
    rag_enabled: true,
    cag_enabled: false,
    knowledge_base_list: [knowledgeBases[1]],
    rag_config: { top_k: 5 },
    realtime_config: {
      temperature: 0,
      seed: 0,
      greeting: { enabled: false, text_prompt: null },
    },
    call_config: {
      transfer: {
        enabled: false,
        transfer_phone_number: '',
        continue_recording: false,
        transfer_text: 'Your call is being transferred',
      },
    },
    createdAt: '2026-04-15',
    lastInvoked: '5 minutes ago',
    invocationsToday: 342,
  },
]

// CALL agents — no embed/API surface
agents[0].accessMethods = { embed: { enabled: false }, api: { enabled: false } }
agents[2].accessMethods = { embed: { enabled: false }, api: { enabled: false } }

// Call Disposition Assistant — Embed enabled, 1 key (call center CRM widget)
agents[1].accessMethods = {
  embed: {
    enabled: true,
    keys: [
      {
        id: 'ek_003',
        label: 'CRM Integration',
        maskedKey: 'pk_live_mN3oPqRsTuV...wXyZ',
        allowedDomains: ['crm.hdfc.com', 'internal.hdfc.com'],
        isActive: true,
        lastUsedAt: '2026-05-14 11:22',
        createdAt: '2026-03-25',
      },
    ],
  },
  api: { enabled: false },
}

// Draft Offer Generator — Embed enabled, no keys yet (DRAFT agent)
agents[3].accessMethods = {
  embed: { enabled: true, keys: [] },
  api: { enabled: false },
}

export const campaigns: Campaign[] = [
  {
    id: 'camp_kotak_hl_q2',
    name: 'Home Loan Q2 Outbound — May 2026',
    agentId: 'agt_006',
    agentName: 'Home Loan Lead Qualifying Agent',
    status: 'RUNNING',
    totalTargets: 4800,
    completed: 3124,
    pending: 1512,
    failed: 164,
    startedAt: '2026-05-12 09:00',
  },
  {
    id: 'camp_001',
    name: 'Q2 Retention Outreach — May 2026',
    agentId: 'agt_001',
    agentName: 'Customer Retention Agent',
    status: 'RUNNING',
    totalTargets: 2400,
    completed: 1842,
    pending: 450,
    failed: 108,
    startedAt: '2026-05-14 09:00',
  },
  {
    id: 'camp_002',
    name: 'EMI Collection Reminder — Week 20',
    agentId: 'agt_001',
    agentName: 'Customer Retention Agent',
    status: 'COMPLETED',
    totalTargets: 890,
    completed: 823,
    pending: 0,
    failed: 67,
    startedAt: '2026-05-10 08:00',
    completedAt: '2026-05-12 18:30',
  },
  {
    id: 'camp_003',
    name: 'Pre-approved Offer Blast — Apr 2026',
    agentId: 'agt_003',
    agentName: 'Outbound Survey Agent',
    status: 'COMPLETED',
    totalTargets: 2200,
    completed: 2156,
    pending: 0,
    failed: 44,
    startedAt: '2026-04-25 10:00',
    completedAt: '2026-04-26 22:45',
  },
]

export const conversations: Conversation[] = [
  {
    id: 'conv_6fe01fd8c1',
    agent: 'Home Loan Lead Qualifying Agent',
    agentId: 'agt_006',
    channel: 'CALL',
    participants: '+918767062022',
    userPhone: '+918767062022',
    agentPhone: '+918035737856',
    duration: '1 min 29 sec',
    durationMs: 89000,
    timestamp: '2026-05-14 10:54',
    startTime: '2026-05-14 10:54:00',
    endTime: '2026-05-14 10:55:29',
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    language: 'English',
    qualityScore: 87,
    intentScore: { score: 8, label: "Lead showed strong purchase intent for home renovation loan", color: '#22c55e' },
    irateScore: { score: 1, label: 'No signs of frustration — cooperative lead', color: '#ef4444' },
    overallQuality: { score: 9, label: 'Composite: 87/100 — intent captured, eligibility confirmed, RM callback scheduled', color: '#6366f1' },
    aiSummary: 'Outbound qualifying call to Mr. Rakesh for Kotak Home Loan Q2 campaign. Lead confirmed interest in a home renovation loan for his existing property in Solapur. Loan amount requested: ₹25 lakhs. Agent ran eligibility check — lead qualifies for up to ₹30L at 8.9% p.a. CRM disposition set to QUALIFIED with WILL_CALLBACK. RM callback scheduled within 24 hours.',
    callEndState: 'CALL_COMPLETED',
    followups: { doNotCall: false, callbackRequest: true, transferAttempted: false, transferResult: 'NOT_ATTEMPTED', anomaly: 'NA' },
    hasRecording: true,
    userId: 'user_8f2c19',
    campaignId: 'camp_kotak_hl_q2',
    region: 'IN-MH',
    operator: 'Plivo',
    voiceId: 'kotak_male_en_v2',
    asrEngine: 'deepgram-nova-2',
    consentRecorded: true,
    sentimentTrend: [0.45, 0.50, 0.52, 0.65, 0.72, 0.82],
    llmData: {
      tokenUsage: { totalTokens: 2265, promptTokens: 1842, completionTokens: 423, costUsd: 0.0072 },
      latency: { p50Ms: 612, p95Ms: 1184 },
      turns: 11,
      model: 'gpt-4o-mini',
      provider: 'openai',
      toolsInvoked: ['lookup_eligibility', 'schedule_callback'],
      safetyFlags: [],
    },
    externalData: {
      source_system: 'kotak_crm',
      lead_id: 'LD-2026-09-12-883421',
      campaign: 'Home Loan Q2 Outbound',
      list_id: 'list_solapur_renov',
      crm_status: 'QUALIFIED',
      score_band: 'A',
      dispositions: ['INTERESTED', 'WILL_CALLBACK'],
      next_action: 'RM_CALLBACK_24H',
    },
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Hello, am I speaking with Mr. Rakesh? This is Rahul calling from Kotak Bank.', startTime: 0 },
      { id: 't2', speaker: 'Customer', text: 'Yes, this is Rakesh speaking.', startTime: 4 },
      { id: 't3', speaker: 'Agent', text: 'Great. I am calling to follow up on your home loan inquiry. Are you considering this for a new purchase or renovation?', startTime: 6 },
      { id: 't4', speaker: 'Customer', text: 'Renovation. I have an existing house in Solapur and want to do some work on it.', startTime: 13 },
      { id: 't5', speaker: 'Agent', text: 'Understood. May I know the approximate loan amount you are looking for?', startTime: 21 },
      { id: 't6', speaker: 'Customer', text: 'Around 25 lakhs should be enough.', startTime: 27 },
      { id: 't7', speaker: 'Agent', text: 'Perfect. And what is your current monthly income, approximately?', startTime: 31 },
      { id: 't8', speaker: 'Customer', text: 'My salary is around 85,000 per month.', startTime: 38 },
      { id: 't9', speaker: 'Agent', text: 'Great. Let me quickly check your eligibility. One moment please.', startTime: 44 },
      { id: 't10', speaker: 'Agent', text: 'Mr. Rakesh, based on your profile you are eligible for up to ₹30 lakhs at 8.9% per annum. Our RM will call you within 24 hours to take this forward. Is that convenient?', startTime: 52 },
      { id: 't11', speaker: 'Customer', text: 'Yes, that works. Thank you.', startTime: 68 },
    ],
    toolCalls: [
      {
        id: 'tool_call_001',
        toolName: 'lookup_eligibility',
        toolLabel: 'Lookup Loan Eligibility',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-12-883421', loan_type: 'HOME_RENOVATION', monthly_income: 85000, loan_amount: 2500000 },
        output: { eligible: true, max_amount: 3000000, interest_rate: 8.9, tenure_months_max: 240, score_band: 'A' },
        timestamp: '2026-05-14 10:54:44',
      },
      {
        id: 'tool_call_002',
        toolName: 'schedule_callback',
        toolLabel: 'Schedule Callback',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-12-883421', phone: '+918767062022', callback_type: 'RM_FOLLOWUP', within_hours: 24 },
        output: { callback_id: 'CB-2026-05-14-4421', scheduled_by: '2026-05-15 10:00', rm_assigned: 'RM_MH_PUNE_03' },
        timestamp: '2026-05-14 10:55:01',
      },
    ],
  },
  // ── Next Best Action Agent — chat, initiated ──
  {
    id: 'conv_18fe85089d',
    agent: 'Next Best Action Agent',
    agentId: 'agt_007',
    channel: 'CHAT',
    participants: 'API',
    duration: '—',
    timestamp: '2026-05-14 10:39',
    startTime: '2026-05-14 10:39:00',
    status: 'ACTIVE',
    interactionType: 'INBOUND',
    language: 'English',
    userId: 'user_3d8f01',
    campaignId: 'camp_kotak_hl_q2',
    messages: [
      { role: 'agent', text: 'How can I help you today?' },
    ],
  },
  // ── Kotak Home Loan — conv_2f9278e169 ──
  {
    id: 'conv_2f9278e169',
    agent: 'Home Loan Lead Qualifying Agent',
    agentId: 'agt_006',
    channel: 'CALL',
    participants: '+918296774472',
    userPhone: '+918296774472',
    agentPhone: '+918035737856',
    duration: '1 min 39 sec',
    durationMs: 99000,
    timestamp: '2026-05-13 19:41',
    startTime: '2026-05-13 19:41:00',
    endTime: '2026-05-13 19:42:39',
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    language: 'English',
    qualityScore: 84,
    intentScore: { score: 7, label: 'Lead interested, needs time to decide', color: '#22c55e' },
    irateScore: { score: 2, label: 'Slight hesitation, not irate', color: '#ef4444' },
    overallQuality: { score: 8, label: 'Composite: 84/100 — intent captured, follow-up needed', color: '#6366f1' },
    aiSummary: 'Outbound qualifying call for Home Loan Q2. Lead Meena is interested in a home purchase loan of ₹40 lakhs in Pune. Monthly income ₹1.2L. Eligibility check returned PARTIALLY_QUALIFIED — requires co-applicant. Disposition set to WARM_LEAD, callback scheduled.',
    callEndState: 'CALL_COMPLETED',
    followups: { doNotCall: false, callbackRequest: true, transferAttempted: false, transferResult: 'NOT_ATTEMPTED', anomaly: 'NA' },
    hasRecording: true,
    userId: 'user_5c3a11',
    campaignId: 'camp_kotak_hl_q2',
    region: 'IN-MH',
    operator: 'Plivo',
    voiceId: 'kotak_male_en_v2',
    asrEngine: 'deepgram-nova-2',
    consentRecorded: true,
    sentimentTrend: [0.40, 0.42, 0.45, 0.48, 0.52, 0.55],
    llmData: {
      tokenUsage: { totalTokens: 2541, promptTokens: 2098, completionTokens: 443, costUsd: 0.0081 },
      latency: { p50Ms: 588, p95Ms: 1092 },
      turns: 12,
      model: 'gpt-4o-mini',
      provider: 'openai',
      toolsInvoked: ['lookup_eligibility', 'schedule_callback'],
      safetyFlags: [],
    },
    externalData: {
      source_system: 'kotak_crm',
      lead_id: 'LD-2026-09-12-003821',
      campaign: 'Home Loan Q2 Outbound',
      list_id: 'list_pune_purchase',
      crm_status: 'WARM_LEAD',
      score_band: 'B',
      dispositions: ['INTERESTED', 'NEEDS_CO_APPLICANT'],
      next_action: 'RM_CALLBACK_48H',
    },
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Hello, am I speaking with Ms. Meena? This is Rahul calling from Kotak Bank.', startTime: 0 },
      { id: 't2', speaker: 'Customer', text: 'Yes, speaking.', startTime: 4 },
      { id: 't3', speaker: 'Agent', text: 'I am calling regarding your home loan inquiry. Are you looking at a purchase or renovation?', startTime: 6 },
      { id: 't4', speaker: 'Customer', text: 'Purchase. We are planning to buy a flat in Pune.', startTime: 12 },
      { id: 't5', speaker: 'Agent', text: 'Wonderful. What loan amount are you considering?', startTime: 18 },
      { id: 't6', speaker: 'Customer', text: 'Around 40 lakhs.', startTime: 23 },
      { id: 't7', speaker: 'Agent', text: 'And your monthly income, approximately?', startTime: 27 },
      { id: 't8', speaker: 'Customer', text: 'About 1.2 lakhs per month.', startTime: 32 },
      { id: 't9', speaker: 'Agent', text: 'Let me check your eligibility. One moment.', startTime: 37 },
      { id: 't10', speaker: 'Agent', text: 'Ms. Meena, you may be eligible but adding a co-applicant would improve your sanction. Our RM can guide you. Can we call back in 48 hours?', startTime: 44 },
      { id: 't11', speaker: 'Customer', text: 'Yes, that is okay.', startTime: 62 },
      { id: 't12', speaker: 'Agent', text: 'Perfect. We will call on this number. Thank you for your time.', startTime: 66 },
    ],
    toolCalls: [
      {
        id: 'tc_2f9_001',
        toolName: 'lookup_eligibility',
        toolLabel: 'Lookup Loan Eligibility',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-12-003821', loan_type: 'HOME_PURCHASE', monthly_income: 120000, loan_amount: 4000000 },
        output: { eligible: false, reason: 'INCOME_SHORTFALL', recommendation: 'ADD_CO_APPLICANT', max_solo: 3200000 },
        timestamp: '2026-05-13 19:41:37',
      },
      {
        id: 'tc_2f9_002',
        toolName: 'schedule_callback',
        toolLabel: 'Schedule Callback',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-12-003821', phone: '+918296774472', callback_type: 'RM_FOLLOWUP', within_hours: 48 },
        output: { callback_id: 'CB-2026-05-13-8811', scheduled_by: '2026-05-15 12:00' },
        timestamp: '2026-05-13 19:42:01',
      },
    ],
  },
  // ── Kotak Home Loan — conv_ced823aa7a ──
  {
    id: 'conv_ced823aa7a',
    agent: 'Home Loan Lead Qualifying Agent',
    agentId: 'agt_006',
    channel: 'CALL',
    participants: '+918296774472',
    userPhone: '+918296774472',
    agentPhone: '+918035737856',
    duration: '1 min 52 sec',
    durationMs: 112000,
    timestamp: '2026-05-13 19:38',
    startTime: '2026-05-13 19:38:00',
    endTime: '2026-05-13 19:39:52',
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    language: 'English',
    qualityScore: 76,
    intentScore: { score: 6, label: 'Moderate interest, not ready to commit', color: '#22c55e' },
    irateScore: { score: 3, label: 'Mild impatience', color: '#ef4444' },
    overallQuality: { score: 7, label: 'Composite: 76/100 — lead captured but cold', color: '#6366f1' },
    aiSummary: 'Outbound qualifying call. Lead was busy but agreed to a callback. Minimal information captured — self-employed, interested in renovation loan of ₹15L. No eligibility check run. Disposition: COLD_LEAD with callback in 72 hours.',
    callEndState: 'CALL_COMPLETED',
    followups: { doNotCall: false, callbackRequest: true, transferAttempted: false, transferResult: 'NOT_ATTEMPTED', anomaly: 'NA' },
    hasRecording: true,
    userId: 'user_5c3a11',
    campaignId: 'camp_kotak_hl_q2',
    region: 'IN-MH',
    operator: 'Plivo',
    voiceId: 'kotak_male_en_v2',
    asrEngine: 'deepgram-nova-2',
    consentRecorded: true,
    sentimentTrend: [0.40, 0.38, 0.42, 0.40, 0.44, 0.42],
    llmData: {
      tokenUsage: { totalTokens: 1820, promptTokens: 1540, completionTokens: 280, costUsd: 0.0058 },
      latency: { p50Ms: 541, p95Ms: 980 },
      turns: 8,
      model: 'gpt-4o-mini',
      provider: 'openai',
      toolsInvoked: ['schedule_callback'],
      safetyFlags: [],
    },
    externalData: {
      source_system: 'kotak_crm',
      lead_id: 'LD-2026-09-11-771402',
      campaign: 'Home Loan Q2 Outbound',
      list_id: 'list_solapur_renov',
      crm_status: 'COLD_LEAD',
      score_band: 'C',
      dispositions: ['LOW_INTENT', 'CALLBACK_REQUESTED'],
      next_action: 'RM_CALLBACK_72H',
    },
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Hello, am I speaking with Mr. Suresh? This is Rahul from Kotak Bank.', startTime: 0 },
      { id: 't2', speaker: 'Customer', text: "Yes, but I'm a bit busy right now.", startTime: 4 },
      { id: 't3', speaker: 'Agent', text: 'I understand. I will be brief. We have a home loan offer that may interest you. Are you looking for a renovation or purchase?', startTime: 7 },
      { id: 't4', speaker: 'Customer', text: 'Renovation, maybe 15 lakhs. But call me later.', startTime: 13 },
      { id: 't5', speaker: 'Agent', text: 'Of course. When is a good time?', startTime: 20 },
      { id: 't6', speaker: 'Customer', text: 'Try in 3 days.', startTime: 24 },
      { id: 't7', speaker: 'Agent', text: 'Noted. I will schedule a callback in 72 hours. Thank you, Mr. Suresh.', startTime: 27 },
      { id: 't8', speaker: 'Customer', text: 'Okay, bye.', startTime: 34 },
    ],
    toolCalls: [
      {
        id: 'tc_ced_001',
        toolName: 'schedule_callback',
        toolLabel: 'Schedule Callback',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-11-771402', phone: '+918296774472', callback_type: 'RM_FOLLOWUP', within_hours: 72 },
        output: { callback_id: 'CB-2026-05-13-9942', scheduled_by: '2026-05-16 14:00' },
        timestamp: '2026-05-13 19:39:18',
      },
    ],
  },
  // ── Kotak Home Loan — conv_86678b2cfd ──
  {
    id: 'conv_86678b2cfd',
    agent: 'Home Loan Lead Qualifying Agent',
    agentId: 'agt_006',
    channel: 'CALL',
    participants: '+919923029955',
    userPhone: '+919923029955',
    agentPhone: '+918035737856',
    duration: '2 min 02 sec',
    durationMs: 122000,
    timestamp: '2026-05-13 17:44',
    startTime: '2026-05-13 17:44:00',
    endTime: '2026-05-13 17:46:02',
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    language: 'English',
    qualityScore: 91,
    intentScore: { score: 9, label: 'Strong purchase intent, ready to proceed', color: '#22c55e' },
    irateScore: { score: 1, label: 'No friction — enthusiastic lead', color: '#ef4444' },
    overallQuality: { score: 9, label: 'Composite: 91/100 — hot lead, RM callback same day', color: '#6366f1' },
    aiSummary: 'Strong outbound qualifying call. Lead Pradeep is actively searching for a home and wants to buy within 2 months. Loan amount ₹55L, income ₹1.8L/month (salaried). Eligibility check: FULLY_QUALIFIED. Disposition HOT_LEAD. RM same-day callback requested.',
    callEndState: 'CALL_COMPLETED',
    followups: { doNotCall: false, callbackRequest: true, transferAttempted: false, transferResult: 'NOT_ATTEMPTED', anomaly: 'NA' },
    hasRecording: true,
    userId: 'user_9e1b77',
    campaignId: 'camp_kotak_hl_q2',
    region: 'IN-MH',
    operator: 'Plivo',
    voiceId: 'kotak_male_en_v2',
    asrEngine: 'deepgram-nova-2',
    consentRecorded: true,
    sentimentTrend: [0.5, 0.65, 0.7, 0.75, 0.85, 0.9],
    llmData: {
      tokenUsage: { totalTokens: 2890, promptTokens: 2340, completionTokens: 550, costUsd: 0.0092 },
      latency: { p50Ms: 598, p95Ms: 1210 },
      turns: 13,
      model: 'gpt-4o-mini',
      provider: 'openai',
      toolsInvoked: ['lookup_eligibility', 'schedule_callback'],
      safetyFlags: [],
    },
    externalData: {
      source_system: 'kotak_crm',
      lead_id: 'LD-2026-09-12-554801',
      campaign: 'Home Loan Q2 Outbound',
      list_id: 'list_pune_purchase',
      crm_status: 'HOT_LEAD',
      score_band: 'A+',
      dispositions: ['HIGHLY_INTERESTED', 'READY_TO_APPLY'],
      next_action: 'RM_CALLBACK_TODAY',
    },
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Hello, am I speaking with Mr. Pradeep? This is Rahul calling from Kotak Bank.', startTime: 0 },
      { id: 't2', speaker: 'Customer', text: 'Yes, hi Rahul! I was actually waiting for your call.', startTime: 4 },
      { id: 't3', speaker: 'Agent', text: "That's great to hear! So I understand you are interested in a home loan. Is it for a new purchase?", startTime: 7 },
      { id: 't4', speaker: 'Customer', text: 'Yes, we are buying a 3BHK in Wakad, Pune. Hoping to close in 2 months.', startTime: 12 },
      { id: 't5', speaker: 'Agent', text: 'Excellent. What loan amount are you looking at?', startTime: 20 },
      { id: 't6', speaker: 'Customer', text: 'About 55 lakhs.', startTime: 24 },
      { id: 't7', speaker: 'Agent', text: 'And your monthly take-home income?', startTime: 27 },
      { id: 't8', speaker: 'Customer', text: 'Around 1.8 lakhs. I am salaried.', startTime: 30 },
      { id: 't9', speaker: 'Agent', text: "Perfect. Let me run the eligibility check right away.", startTime: 34 },
      { id: 't10', speaker: 'Agent', text: 'Excellent news! You are fully eligible for ₹55 lakhs. We can offer you 8.7% per annum with a flexible tenure up to 20 years.', startTime: 41 },
      { id: 't11', speaker: 'Customer', text: 'That sounds really good. Can someone call me today to discuss the process?', startTime: 54 },
      { id: 't12', speaker: 'Agent', text: 'Absolutely. I am scheduling an RM callback for today itself. You will hear from us by 6 PM.', startTime: 59 },
      { id: 't13', speaker: 'Customer', text: 'Perfect. Thank you, Rahul!', startTime: 72 },
    ],
    toolCalls: [
      {
        id: 'tc_866_001',
        toolName: 'lookup_eligibility',
        toolLabel: 'Lookup Loan Eligibility',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-12-554801', loan_type: 'HOME_PURCHASE', monthly_income: 180000, loan_amount: 5500000 },
        output: { eligible: true, max_amount: 6000000, interest_rate: 8.7, tenure_months_max: 240, score_band: 'A+' },
        timestamp: '2026-05-13 17:44:41',
      },
      {
        id: 'tc_866_002',
        toolName: 'schedule_callback',
        toolLabel: 'Schedule Callback',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-12-554801', phone: '+919923029955', callback_type: 'RM_SAME_DAY', within_hours: 4 },
        output: { callback_id: 'CB-2026-05-13-7700', scheduled_by: '2026-05-13 18:00', rm_assigned: 'RM_MH_PUNE_01' },
        timestamp: '2026-05-13 17:45:52',
      },
    ],
  },
  // ── Kotak Home Loan — conv_a43e4827dd (long call, 3:47) ──
  {
    id: 'conv_a43e4827dd',
    agent: 'Home Loan Lead Qualifying Agent',
    agentId: 'agt_006',
    channel: 'CALL',
    participants: '+918296774472',
    userPhone: '+918296774472',
    agentPhone: '+918035737856',
    duration: '3 min 47 sec',
    durationMs: 227000,
    timestamp: '2026-05-13 17:02',
    startTime: '2026-05-13 17:02:00',
    endTime: '2026-05-13 17:05:47',
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    language: 'English',
    qualityScore: 79,
    intentScore: { score: 7, label: 'Lead engaged but has concerns about interest rate', color: '#22c55e' },
    irateScore: { score: 4, label: 'Some pushback on rate comparison', color: '#ef4444' },
    overallQuality: { score: 7, label: 'Composite: 79/100 — qualified but needs rate comparison', color: '#6366f1' },
    aiSummary: 'Extended qualifying call with lead Anita comparing Kotak rate with SBI and HDFC. Loan ₹30L for home purchase in Nashik. Income ₹95K/month. Eligibility: QUALIFIED at 8.9%. Lead asked for written comparison — noted. Callback in 48 hours with rate sheet.',
    callEndState: 'CALL_COMPLETED',
    followups: { doNotCall: false, callbackRequest: true, transferAttempted: false, transferResult: 'NOT_ATTEMPTED', anomaly: 'NA' },
    hasRecording: true,
    userId: 'user_5c3a11',
    campaignId: 'camp_kotak_hl_q2',
    region: 'IN-MH',
    operator: 'Plivo',
    voiceId: 'kotak_male_en_v2',
    asrEngine: 'deepgram-nova-2',
    consentRecorded: true,
    sentimentTrend: [0.4, 0.5, 0.35, 0.45, 0.55, 0.6],
    llmData: {
      tokenUsage: { totalTokens: 4102, promptTokens: 3390, completionTokens: 712, costUsd: 0.0131 },
      latency: { p50Ms: 634, p95Ms: 1330 },
      turns: 18,
      model: 'gpt-4o-mini',
      provider: 'openai',
      toolsInvoked: ['lookup_eligibility', 'schedule_callback'],
      safetyFlags: [],
    },
    externalData: {
      source_system: 'kotak_crm',
      lead_id: 'LD-2026-09-11-204411',
      campaign: 'Home Loan Q2 Outbound',
      list_id: 'list_nashik_purchase',
      crm_status: 'WARM_LEAD',
      score_band: 'B',
      dispositions: ['INTERESTED', 'RATE_SENSITIVE'],
      next_action: 'SEND_RATE_SHEET_THEN_CALLBACK',
    },
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Hello, am I speaking with Ms. Anita? This is Rahul from Kotak Bank regarding your home loan inquiry.', startTime: 0 },
      { id: 't2', speaker: 'Customer', text: 'Yes. But I want to know — what is your interest rate?', startTime: 5 },
      { id: 't3', speaker: 'Agent', text: 'Our current home loan rate starts at 8.7% per annum. May I ask what you are looking for?', startTime: 9 },
      { id: 't4', speaker: 'Customer', text: 'Home purchase in Nashik. Around 30 lakhs. But SBI is offering 8.5%.', startTime: 15 },
      { id: 't5', speaker: 'Agent', text: 'I understand. Our rate is competitive and we offer faster processing and a dedicated RM. Let me check your eligibility first.', startTime: 24 },
      { id: 't6', speaker: 'Customer', text: 'My income is around 95,000 a month.', startTime: 35 },
      { id: 't7', speaker: 'Agent', text: "That's good. Running the check now.", startTime: 39 },
      { id: 't8', speaker: 'Agent', text: 'Ms. Anita, you are eligible for ₹30 lakhs at 8.9% with us. I can also send you a detailed comparison with SBI and HDFC.', startTime: 45 },
      { id: 't9', speaker: 'Customer', text: 'Yes please send that. WhatsApp or email?', startTime: 58 },
      { id: 't10', speaker: 'Agent', text: 'We will send on WhatsApp. Our RM will also call in 48 hours to walk you through the options.', startTime: 62 },
      { id: 't11', speaker: 'Customer', text: 'Okay. That sounds good.', startTime: 72 },
    ],
    toolCalls: [
      {
        id: 'tc_a43_001',
        toolName: 'lookup_eligibility',
        toolLabel: 'Lookup Loan Eligibility',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-11-204411', loan_type: 'HOME_PURCHASE', monthly_income: 95000, loan_amount: 3000000 },
        output: { eligible: true, max_amount: 3200000, interest_rate: 8.9, tenure_months_max: 180, score_band: 'B' },
        timestamp: '2026-05-13 17:03:39',
      },
      {
        id: 'tc_a43_002',
        toolName: 'schedule_callback',
        toolLabel: 'Schedule Callback',
        status: 'SUCCESS',
        input: { lead_id: 'LD-2026-09-11-204411', phone: '+918296774472', callback_type: 'RM_FOLLOWUP', within_hours: 48, send_rate_sheet: true },
        output: { callback_id: 'CB-2026-05-13-4421', scheduled_by: '2026-05-15 11:00', whatsapp_sent: true },
        timestamp: '2026-05-13 17:05:12',
      },
    ],
  },
  {
    id: 'conv_a3f9b2e845',
    agent: 'Customer Retention Agent',
    agentId: 'agt_001',
    channel: 'CALL',
    participants: '+91-87654XXXXX',
    userPhone: '+91-8765412390',
    agentPhone: '+91-8035737856',
    duration: '8 min 47 sec',
    durationMs: 527000,
    timestamp: '2026-05-14 09:15',
    startTime: '2026-05-14 09:15:04',
    endTime: '2026-05-14 09:23:51',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'English',
    qualityScore: 61,
    intentScore: { score: 4, label: "User's purchase / completion intent", color: '#22c55e' },
    irateScore: { score: 6, label: 'Signs of user frustration', color: '#ef4444' },
    overallQuality: { score: 6, label: 'Composite: 61/100 across coverage, tone, and resolution', color: '#6366f1' },
    aiSummary: 'Customer called to dispute two duplicate ₹5,000 charges on May 10th and 11th. Agent verified the transactions, confirmed a payment gateway glitch, and processed a full refund of ₹5,000 with an additional ₹500 goodwill credit. Customer was initially frustrated but satisfied with resolution. Security escalation scheduled.',
    callEndState: 'CALL_COMPLETED',
    followups: {
      doNotCall: false,
      callbackRequest: false,
      transferAttempted: false,
      transferResult: 'NOT_ATTEMPTED',
      anomaly: 'DUPLICATE_CHARGE_DETECTED',
    },
    hasRecording: true,
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Good afternoon! This is Arjun from HDFC Bank. How are you doing today?', startTime: 3 },
      { id: 't2', speaker: 'Customer', text: "Hello, I'm doing fine. But I'm quite upset about something on my account.", startTime: 9 },
      { id: 't3', speaker: 'Agent', text: "I'm sorry to hear that. What's the issue?", startTime: 16 },
      { id: 't4', speaker: 'Customer', text: "I was charged twice for the same transaction. ₹5,000 on May 10th and again on May 11th. This is unacceptable.", startTime: 20 },
      { id: 't5', speaker: 'Agent', text: "I sincerely apologize for that inconvenience. Let me look into this right away. Can I confirm your account number?", startTime: 34 },
      { id: 't6', speaker: 'Customer', text: "It's 87654. And I want this sorted immediately.", startTime: 44 },
      { id: 't7', speaker: 'Agent', text: "I can see the issue clearly. There's a charge for ₹5,000 on May 10th and another on May 11th. This was due to a payment gateway glitch — I'm very sorry. I'm processing a full refund right now.", startTime: 50 },
      { id: 't8', speaker: 'Customer', text: "How long will the refund take?", startTime: 68 },
      { id: 't9', speaker: 'Agent', text: "The refund of ₹5,000 will be in your account within 24 hours. Additionally, I'm crediting ₹500 as a goodwill gesture for the inconvenience.", startTime: 73 },
      { id: 't10', speaker: 'Customer', text: "OK, that's better. But how did this even happen?", startTime: 88 },
      { id: 't11', speaker: 'Agent', text: "It was an isolated payment gateway incident. Our systems have been updated. I'm also scheduling a security briefing call at your convenience.", startTime: 93 },
      { id: 't12', speaker: 'Customer', text: "Fine. Thank you.", startTime: 110 },
    ],
    toolCalls: [
      {
        id: 'tool_call_004',
        toolName: 'check_balance',
        toolLabel: 'Check Account Balance',
        status: 'SUCCESS',
        input: { account_number: 'ACC-87654', includeTransactions: true },
        output: { balance: 125600, recentTransactions: [{ date: '2026-05-11', amount: 5000, desc: 'Duplicate Charge' }, { date: '2026-05-10', amount: 5000, desc: 'Original Charge' }] },
        timestamp: '2026-05-14 09:16',
      },
    ],
  },
  {
    id: 'conv_d7c4e1a923',
    agent: 'Outbound Survey Agent',
    agentId: 'agt_003',
    channel: 'CALL',
    participants: '+91-99001XXXXX',
    userPhone: '+91-9900112233',
    agentPhone: '+91-8035101010',
    duration: '6 min 45 sec',
    durationMs: 405000,
    timestamp: '2026-05-14 08:30',
    startTime: '2026-05-14 08:30:10',
    endTime: '2026-05-14 08:36:55',
    status: 'COMPLETED',
    interactionType: 'OUTBOUND',
    language: 'English',
    qualityScore: 91,
    intentScore: { score: 9, label: "User's purchase / completion intent", color: '#22c55e' },
    irateScore: { score: 1, label: 'Signs of user frustration', color: '#ef4444' },
    overallQuality: { score: 9, label: 'Composite: 91/100 across coverage, tone, and resolution', color: '#6366f1' },
    aiSummary: 'Outbound satisfaction survey completed successfully. Customer rated online banking 8/10 and customer service 9/10. Main feedback: app performance could be improved and more export options for statements needed. Customer is a promoter — has already referred two friends to HDFC Bank.',
    callEndState: 'CALL_COMPLETED',
    followups: {
      doNotCall: false,
      callbackRequest: false,
      transferAttempted: false,
      transferResult: 'NOT_ATTEMPTED',
      anomaly: 'NA',
    },
    hasRecording: true,
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: "Hi, this is Priya calling from HDFC Bank. Do you have about 5 minutes for a quick customer satisfaction survey?", startTime: 3 },
      { id: 't2', speaker: 'Customer', text: "Sure, go ahead.", startTime: 10 },
      { id: 't3', speaker: 'Agent', text: "Great! First question: How satisfied are you with our online banking platform?", startTime: 13 },
      { id: 't4', speaker: 'Customer', text: "It's pretty good. Easy to use.", startTime: 20 },
      { id: 't5', speaker: 'Agent', text: "That's great to hear. On a scale of 1-10, how would you rate it?", startTime: 25 },
      { id: 't6', speaker: 'Customer', text: "I'd say 8 out of 10.", startTime: 32 },
      { id: 't7', speaker: 'Agent', text: "Excellent. What could we improve?", startTime: 36 },
      { id: 't8', speaker: 'Customer', text: "The app sometimes feels slow, and I'd like more export options for statements.", startTime: 39 },
      { id: 't9', speaker: 'Agent', text: "Perfect feedback. Second question: How happy are you with the customer service you've received?", startTime: 52 },
      { id: 't10', speaker: 'Customer', text: "Very happy. Your team is always helpful.", startTime: 59 },
      { id: 't11', speaker: 'Agent', text: "Thank you! Rate from 1-10?", startTime: 65 },
      { id: 't12', speaker: 'Customer', text: "9 out of 10.", startTime: 68 },
      { id: 't13', speaker: 'Agent', text: "That's wonderful. Last question: Would you recommend HDFC Bank to friends and family?", startTime: 71 },
      { id: 't14', speaker: 'Customer', text: "Absolutely, I already have recommended it to two friends.", startTime: 79 },
      { id: 't15', speaker: 'Agent', text: "That's amazing! Thank you so much for taking the time. We'll work on improving the app performance.", startTime: 84 },
    ],
  },
  {
    id: 'conv_002',
    agent: 'Call Disposition Assistant',
    agentId: 'agt_002',
    channel: 'CHAT',
    participants: 'Vishal Gupta (RM)',
    duration: '7 min 23 sec',
    timestamp: '2026-05-14 10:28',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'English',
    qualityScore: 88,
    aiSummary: 'RM Vishal Gupta used the tool to generate a disposition note for a loan status inquiry call. Customer Sharma inquired about a ₹25L home renovation loan. Agent produced a structured summary and created ticket SUP-2026-4521 assigned to Priya Verma.',
    messages: [
      {
        role: 'user',
        text: `Transcript: Customer Sharma called today about their recent loan application. They wanted to know the status and timeline.

Agent told them:
- Application is in final approval stage
- Should hear back within 2-3 business days
- Current loan amount requested: ₹25 lakhs
- Purpose: Home renovation

Customer sounded satisfied and said they'll wait for the call.`,
      },
      {
        role: 'assistant',
        text: `**Call Disposition Summary**

**Customer:** Amit Sharma
**Call Type:** Inbound - Loan Status Inquiry
**Duration:** 4 min 32 sec

**Issue/Request:**
Customer called to check status of home renovation loan application (₹25 lakhs).

**Resolution:**
- Confirmed application in final approval stage
- Provided 2-3 business day timeline
- Calmed customer concerns about processing speed
- Set expectation for follow-up call

**Next Steps:**
- Dispatch approval decision within 48 hours
- Schedule follow-up call with Loan Officer Priya
- Send WhatsApp confirmation of timeline

**Sentiment:** Positive - Customer satisfied with explanation
**Escalation:** No
**Follow-up Required:** Yes - Loan Officer to contact by 2026-05-16`,
      },
      {
        role: 'user',
        text: `Can you also create a ticket for the follow-up?`,
      },
      {
        role: 'assistant',
        text: `**Ticket Created Successfully**

Ticket ID: SUP-2026-4521
Priority: Medium
Category: Loan - Follow-up
Assigned To: Priya Verma (Loan Officer)
Due Date: 2026-05-16 by 5 PM
Template: Loan Approval & Disbursement

The ticket has been created and Priya has been notified.`,
      },
      {
        role: 'user',
        text: `Perfect. Should we send this disposition to the customer?`,
      },
      {
        role: 'assistant',
        text: `I'd recommend:

✓ **Do send:** The timeline confirmation and next steps
✗ **Don't send:** The internal disposition analysis (sentiment, escalation flags)

Here's what to send to customer:
"Hi Amit, Thank you for calling today. Your loan application (₹25L) is in final approval stage. You'll hear from our team by May 16th. Keep an eye on your email and WhatsApp for updates. - HDFC Bank"`,
      },
    ],
    toolCalls: [
      {
        id: 'tool_call_003',
        toolName: 'create_ticket',
        toolLabel: 'Create Support Ticket',
        status: 'SUCCESS',
        input: {
          title: 'Loan Approval Follow-up - Amit Sharma',
          priority: 'MEDIUM',
          assignee: 'Priya Verma',
          dueDate: '2026-05-16',
        },
        output: { ticketId: 'SUP-2026-4521', createdAt: '2026-05-14 10:32', status: 'OPEN' },
        timestamp: '2026-05-14 10:35',
      },
    ],
  },
  {
    id: 'conv_003',
    agent: 'Call Disposition Assistant',
    agentId: 'agt_002',
    channel: 'CHAT',
    participants: 'Bank Employee - Priya',
    duration: '5 min 12 sec',
    timestamp: '2026-05-14 09:50',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'English',
    qualityScore: 79,
    aiSummary: 'Employee Priya summarized a credit card upgrade call with customer Rahul Verma. Customer showed strong interest in the Platinum card upgrade (₹50K limit, ₹2,500 annual fee). Recommendation: proceed with ₹1,500 first-year fee offer.',
    messages: [
      {
        role: 'user',
        text: `I just handled a customer call about upgrading to our premium credit card. Here's what happened:
- Customer: Rahul Verma
- Current card: Classic (₹5K limit)
- Interest shown in: Platinum card (₹50K limit)
- Annual fee: ₹2500
- Benefits: Lounge access, 2% cashback, travel insurance

Customer asked for time to think about it.`,
      },
      {
        role: 'assistant',
        text: `**Call Summary - Credit Card Upgrade**

**Customer:** Rahul Verma
**Channel:** Inbound - Sales Inquiry
**Duration:** 3 min 18 sec

**Product Interest:**
Platinum Credit Card
- Current Limit: ₹5,000 (Classic Card)
- Proposed Limit: ₹50,000
- Annual Fee: ₹2,500

**Customer Response:** Interested but wants to consider (warm lead)

**Benefits Discussed:**
✓ Lounge access (4 airports)
✓ 2% cashback on spends
✓ Complimentary travel insurance
✓ 50-day interest-free period

**Next Steps:**
1. Send Platinum card details brochure via WhatsApp
2. Follow-up call after 3 days
3. Offer discount on first year fee: ₹1,500

**Likelihood:** 70% - Customer seemed genuinely interested`,
      },
      {
        role: 'user',
        text: `Should we reduce the fee further or stick with ₹1500?`,
      },
      {
        role: 'assistant',
        text: `Based on the call:
- Customer had strong interest (asked many questions)
- Spending pattern (if ₹50K limit needed) suggests high potential
- ₹1,500 first-year fee is competitive

**Recommendation:** Stick with ₹1,500 for now. This is our standard first-time upgrade offer. If customer hesitates further in the follow-up call, then offer ₹999 or waive entirely.

Keep the offer open for 7 days to create urgency.`,
      },
    ],
  },
  {
    id: 'conv_006',
    agent: 'Draft Offer Generator',
    agentId: 'agt_004',
    channel: 'CHAT',
    participants: 'Marketing Team',
    duration: '8 min 45 sec',
    timestamp: '2026-05-13 11:15',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'English',
    qualityScore: 95,
    aiSummary: 'Marketing team used the agent to generate offer copy for the new Personal Loan product. Two drafts were produced — the approved version emphasizes transparent lending and zero hidden charges. SMS and WhatsApp versions also created for multi-channel campaign launch.',
    messages: [
      {
        role: 'user',
        text: `Generate an offer description for our new Personal Loan product. Key features:
- Loan amount: ₹1L to ₹25L
- Interest rate: 8.5% p.a.
- Processing fee: ₹999 (one-time)
- Tenure: 12-60 months
- No hidden charges
- Instant approval (subject to verification)`,
      },
      {
        role: 'assistant',
        text: `**Personal Loan Offer - Draft 1**

"Get up to ₹25 lakhs at just 8.5% interest rate. Instant approval, minimal documentation. Flexible tenure from 1 to 5 years. Apply today and get funds in your account within 24 hours."

**Why this works:**
- Highlights key benefit (amount & rate)
- Emphasizes speed (instant approval)
- Creates urgency (today)
- Simple, conversational tone

Would you like me to create variations or tweak the messaging?`,
      },
      {
        role: 'user',
        text: `Can you make it more premium and highlight the zero hidden charges angle? We want to differentiate from competitors.`,
      },
      {
        role: 'assistant',
        text: `**Personal Loan Offer - Draft 2 (Premium)**

"Experience transparent lending with HDFC Personal Loan. Borrow up to ₹25 lakhs at 8.5% p.a. with zero hidden charges. Instant approval, flexible repayment from 1-5 years. No surprises, just straightforward banking."

**Key improvements:**
✓ "Transparent lending" = differentiator
✓ "Zero hidden charges" = addresses competitor concern
✓ "No surprises, just straightforward banking" = brand voice (trustworthy)
✓ "Instant approval" = benefit emphasis

**Positioning:** Premium but accessible, honest and reliable

Should we test this with the compliance team?`,
      },
      {
        role: 'user',
        text: `Perfect! This is the one. Can you also create a short version for SMS/notifications?`,
      },
      {
        role: 'assistant',
        text: `**SMS Version (70 characters max)**

"HDFC Personal Loan: ₹25L at 8.5% p.a. Zero hidden charges. Instant approval. Apply now → [LINK]"

**WhatsApp Version (more conversational)**

"Hi! Need funds? Get up to ₹25L with HDFC Personal Loan. Transparent rates (8.5%), instant approval, zero hidden charges. Flexible repayment. Apply in 2 mins → [LINK]"

Both are ready for launch. Should I prepare the landing page copy next?`,
      },
    ],
  },
  {
    id: 'conv_e8b1f04a37',
    agent: 'Customer Retention Agent',
    agentId: 'agt_001',
    channel: 'CALL',
    participants: '+91-77889XXXXX',
    userPhone: '+91-7788901234',
    agentPhone: '+91-8035737856',
    duration: '4 min 12 sec',
    durationMs: 252000,
    timestamp: '2026-05-13 16:45',
    startTime: '2026-05-13 16:45:00',
    endTime: '2026-05-13 16:49:12',
    status: 'FAILED',
    interactionType: 'INBOUND',
    language: 'Hindi',
    qualityScore: 35,
    intentScore: { score: 2, label: "User's purchase / completion intent", color: '#22c55e' },
    irateScore: { score: 9, label: 'Signs of user frustration', color: '#ef4444' },
    overallQuality: { score: 3, label: 'Composite: 35/100 across coverage, tone, and resolution', color: '#6366f1' },
    aiSummary: 'Customer called in a highly agitated state regarding an unauthorized transaction of ₹12,000. Customer demanded immediate reversal and threatened to escalate to consumer forum. Agent attempted de-escalation but the customer disconnected mid-conversation. Transfer to fraud team was initiated but not completed.',
    callEndState: 'CALL_DROPPED',
    followups: {
      doNotCall: true,
      callbackRequest: true,
      transferAttempted: true,
      transferResult: 'TRANSFER_FAILED',
      anomaly: 'UNAUTHORIZED_TRANSACTION',
    },
    hasRecording: true,
    callTranscript: [
      { id: 't1', speaker: 'Agent', text: 'Hello, thank you for calling HDFC Bank. How can I assist you today?', startTime: 2 },
      { id: 't2', speaker: 'Customer', text: "I want to know why ₹12,000 was debited from my account without my knowledge! This is fraud!", startTime: 7 },
      { id: 't3', speaker: 'Agent', text: "I completely understand your concern and I sincerely apologize. Let me check your account immediately.", startTime: 18 },
      { id: 't4', speaker: 'Customer', text: "I want this money back RIGHT NOW. This is the third time something like this has happened.", startTime: 26 },
      { id: 't5', speaker: 'Agent', text: "Sir, I can see the transaction. Let me escalate this to our fraud team who can process an immediate reversal.", startTime: 36 },
      { id: 't6', speaker: 'Customer', text: "Escalate? I don't want escalation! I want action! If this isn't resolved I'm going to consumer court!", startTime: 46 },
      { id: 't7', speaker: 'Agent', text: "I hear you completely. I'm connecting you to our senior fraud specialist right now who has the authority to process this immediately.", startTime: 58 },
      { id: 't8', speaker: 'Customer', text: "You people always say that! [call disconnected]", startTime: 70 },
    ],
  },
  // API invocation — product recommendation engine
  {
    id: 'conv_h1b3d9f2a7',
    agent: 'Omnichannel Product Recommendation Engine',
    agentId: 'agt_005',
    channel: 'CHAT',
    accessMethod: 'api',
    participants: 'API',
    duration: '0 min 1 sec',
    durationMs: 1240,
    timestamp: '2026-05-14 15:42',
    startTime: '2026-05-14 15:42:11',
    endTime: '2026-05-14 15:42:12',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'en',
    qualityScore: 97,
    latencyMs: 1240,
    httpStatus: 200,
    requestPayload: {
      customer_id: 'CUST_8823441',
      account_balance: 234500,
      monthly_income: 85000,
      age_group: '35-44',
      employment_type: 'SALARIED',
    },
    responsePayload: {
      status: 'success',
      invocation_id: 'inv_h1b3d9f2a7',
      data: {
        recommendations: [
          { product_id: 'HDFC_REGALIA', name: 'HDFC Regalia Credit Card', reason: 'High spend pattern matches premium travel benefits', confidence: 0.91 },
          { product_id: 'HDFC_FLEXI_LOAN', name: 'FlexiLoan Personal Loan', reason: 'Income-to-debt ratio supports pre-approved offer of ₹12L', confidence: 0.78 },
          { product_id: 'HDFC_RD_PLUS', name: 'RD Plus Recurring Deposit', reason: 'Regular savings pattern, eligible for 9.1% p.a. return', confidence: 0.65 },
        ],
        primary_product_id: 'HDFC_REGALIA',
        confidence_score: 0.91,
        reason: 'Customer profile indicates high engagement with premium products. Monthly income of ₹85,000 and account tenure qualifies for Regalia with lounge access and 4x reward points.',
      },
      latency_ms: 1240,
      timestamp: '2026-05-14T15:42:12.441Z',
    },
    aiSummary: 'Successful headless invocation for customer CUST_8823441. Engine recommended HDFC Regalia Credit Card as primary product (91% confidence) based on income profile and spending patterns. Two secondary recommendations also returned.',
  },
  // API invocation — failed request
  {
    id: 'conv_h4c7e2b831',
    agent: 'Omnichannel Product Recommendation Engine',
    agentId: 'agt_005',
    channel: 'CHAT',
    accessMethod: 'api',
    participants: 'API',
    duration: '0 min 0 sec',
    durationMs: 380,
    timestamp: '2026-05-14 14:11',
    startTime: '2026-05-14 14:11:44',
    endTime: '2026-05-14 14:11:44',
    status: 'FAILED',
    interactionType: 'INBOUND',
    language: 'en',
    latencyMs: 380,
    httpStatus: 400,
    requestPayload: {
      customer_id: 'CUST_0042187',
      account_balance: -500,
      monthly_income: 'eighty_thousand',
    },
    responsePayload: {
      status: 'error',
      error: 'VALIDATION_ERROR',
      message: 'Field `monthly_income` expected type number, received string. Field `account_balance` must be non-negative.',
      fields: [
        { field: 'monthly_income', issue: 'Expected number, got string' },
        { field: 'account_balance', issue: 'Must be >= 0' },
      ],
      timestamp: '2026-05-14T14:11:44.820Z',
    },
    aiSummary: 'Invocation failed at input validation. Two schema violations detected: monthly_income was passed as a string instead of number, and account_balance was negative. No LLM call was made.',
  },
  // Embed widget session
  {
    id: 'conv_e2f8a1c94d',
    agent: 'Omnichannel Product Recommendation Engine',
    agentId: 'agt_005',
    channel: 'CHAT',
    accessMethod: 'embed',
    participants: 'Website User',
    embedKeyLabel: 'Website Production',
    originDomain: 'www.hdfc.com',
    duration: '4 min 18 sec',
    durationMs: 258000,
    timestamp: '2026-05-14 13:15',
    startTime: '2026-05-14 13:15:02',
    endTime: '2026-05-14 13:19:20',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'English',
    qualityScore: 84,
    intentScore: { score: 8, label: "User's purchase / completion intent", color: '#22c55e' },
    overallQuality: { score: 8, label: 'Composite: 84/100 across engagement, resolution, and relevance', color: '#6366f1' },
    aiSummary: 'Website visitor on www.hdfc.com used the embedded widget to explore personal loan options. Agent collected income and purpose details and recommended a pre-approved Personal Loan of ₹10L at 8.5% p.a. User clicked through to the application page.',
    messages: [
      { role: 'agent', text: 'Hi! I\'m your HDFC financial assistant. How can I help you today?' },
      { role: 'user', text: 'I\'m interested in a personal loan. What options do I have?' },
      { role: 'agent', text: 'Great! I can help with that. Could you share approximately how much you\'re looking to borrow and what it\'s for?' },
      { role: 'user', text: 'Around 10 lakhs for home renovation. My monthly salary is about 80,000.' },
      { role: 'agent', text: 'Based on your income profile, you\'re pre-approved for a Personal Loan up to ₹12 lakhs at 8.5% p.a. For ₹10L over 36 months, your EMI would be approximately ₹31,500/month. There are zero hidden charges and instant approval available. Would you like to proceed?' },
      { role: 'user', text: 'That sounds good. What documents do I need?' },
      { role: 'agent', text: 'For a salaried customer, you\'ll need: (1) Last 3 months salary slips, (2) 6 months bank statement, (3) PAN card & Aadhaar. The entire process is online — typically takes under 30 minutes. Shall I take you to the application form?' },
      { role: 'user', text: 'Yes please!' },
    ],
  },
  // Embed widget session — abandoned
  {
    id: 'conv_e5d3b7f012',
    agent: 'Omnichannel Product Recommendation Engine',
    agentId: 'agt_005',
    channel: 'CHAT',
    accessMethod: 'embed',
    participants: 'Website User',
    embedKeyLabel: 'Mobile App Widget',
    originDomain: 'hdfc.app',
    duration: '1 min 02 sec',
    durationMs: 62000,
    timestamp: '2026-05-14 12:48',
    startTime: '2026-05-14 12:48:10',
    endTime: '2026-05-14 12:49:12',
    status: 'COMPLETED',
    interactionType: 'INBOUND',
    language: 'English',
    qualityScore: 52,
    intentScore: { score: 3, label: "User's purchase / completion intent", color: '#22c55e' },
    overallQuality: { score: 5, label: 'Composite: 52/100 — session ended before resolution', color: '#6366f1' },
    aiSummary: 'Short mobile app widget session. User asked about credit card rewards but left before receiving a full recommendation. Session ended without a conversion event.',
    messages: [
      { role: 'agent', text: 'Hi! How can I assist you today?' },
      { role: 'user', text: 'What credit cards do you have with good rewards?' },
      { role: 'agent', text: 'We have several great options! For top rewards: HDFC Regalia (4x on travel + dining), MoneyBack+ (5% cashback on Amazon/Flipkart), and Millenia (5% on online spends). Which category of spending is most important to you?' },
      { role: 'user', text: 'ok thanks' },
    ],
  },
]

export const dashboardStats: DashboardStats = {
  activeAgents: 3,
  apiCallsToday: 2643,
  voiceCallsToday: 89,
  embedSessionsToday: 0,
}

export const activityFeed: ActivityFeedItem[] = [
  {
    id: 'act_001',
    timestamp: '2 minutes ago',
    message: 'Customer Retention Agent invoked',
    agent: 'Customer Retention Agent',
    channel: 'CALL',
  },
  {
    id: 'act_002',
    timestamp: '5 minutes ago',
    message: 'Call Disposition Assistant session completed',
    agent: 'Call Disposition Assistant',
    channel: 'CHAT',
  },
  {
    id: 'act_003',
    timestamp: '12 minutes ago',
    message: 'Outbound Survey Agent call transferred',
    agent: 'Outbound Survey Agent',
    channel: 'CALL',
  },
  {
    id: 'act_004',
    timestamp: '28 minutes ago',
    message: 'Customer Retention Agent invoked',
    agent: 'Customer Retention Agent',
    channel: 'CALL',
  },
  {
    id: 'act_005',
    timestamp: '1 hour ago',
    message: 'Campaign started: Q2 Retention Outreach',
    agent: 'Customer Retention Agent',
    channel: 'CALL',
  },
  {
    id: 'act_006',
    timestamp: '2 hours ago',
    message: 'API key rotated: OpenAI Production',
    agent: 'System',
    channel: 'CALL',
  },
]

export const teamMembers: TeamMember[] = [
  {
    id: 'tm_001',
    name: 'Amogh Pachpor',
    email: 'amogh@hdfc.com',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    id: 'tm_002',
    name: 'Pooja Sharma',
    email: 'pooja@hdfc.com',
    role: 'MEMBER',
    status: 'ACTIVE',
  },
  {
    id: 'tm_003',
    name: 'Rahul Nair',
    email: 'rahul@hdfc.com',
    role: 'MEMBER',
    status: 'PENDING',
    invitedAt: '2026-05-10',
  },
]
