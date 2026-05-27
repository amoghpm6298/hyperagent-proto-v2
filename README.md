# HyperAgent Studio — Frontend Prototype

A comprehensive Vite + React + TypeScript prototype of HyperAgent Studio, showcasing the full platform experience for bank ops teams to manage AI agents across all channels.

## Features

- **Full Agent Management** — Create, configure, and deploy agents
- **Knowledge Base** — Upload and manage documents per agent
- **All Access Patterns:**
  - Voice — Inbound/outbound calls with campaign management
  - Chat — Text-based conversations
  - Embed Widget — Embed agents in external products (M1)
  - Headless API — Machine-to-machine structured responses (M4)
  - Event Triggers & Scheduled (Coming Soon)
- **Generic Conversations View** — Unified log of all interactions across all channels
- **Agent Analytics** — Performance metrics per agent
- **Voice Campaigns** — Run bulk outbound campaigns with target tracking
- **Team Management** — Invite and manage team members

## Tech Stack

- **Vite** — Fast build tool
- **React 19** — UI framework
- **TypeScript** — Type safety
- **React Router v6** — Client routing
- **Tailwind CSS** — Styling
- **Lucide React** — Icons
- **Zustand** — State management (mock data)
- **clsx** — Conditional classnames

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:5173`.

## Project Structure

```
src/
├── types/              # TypeScript types
├── data/               # Mock data
├── store/              # Zustand store
├── components/
│   ├── layout/         # Sidebar, TopBar, Layout
│   ├── ui/             # Primitive components (Button, Card, Modal, etc.)
│   └── shared/         # Domain components (ChannelBadge, StatusBadge, etc.)
├── pages/              # Page components organized by route
├── App.tsx             # Router setup
└── main.tsx            # Entry point
```

## Navigation

- **Dashboard** — Overview with stats and activity feed
- **Agents** — List all agents, create new agent
- **Conversations** — Generic unified log of all interactions (voice, chat, embed, headless)
- **Campaigns** — Voice campaign list and detail
- **Settings** — Organization and team member management

## Key Flows

### Create Agent
1. Enter agent name, purpose, description, select model
2. Write system prompt
3. Select channels (Voice, Chat, Embed, Headless)
4. Lands on agent detail page

### Generate Embed Key
1. Agent Detail → Channels tab → Embed Widget section → "Add Key"
2. Enter label + allowed domains
3. Key shown once with integration snippet
4. Copy button for quick integration

### Generate Headless API Key
1. Agent Detail → Channels tab → Headless API section
2. Define input/output schema (field name, type, required)
3. Generate API key (shown once)
4. Test invocation with sample JSON

### Voice Campaigns
1. Campaigns → "New Campaign"
2. Select agent, upload CSV targets, schedule
3. Track progress in real-time

### Conversations (Generic)
1. View all interactions: voice calls, chat sessions, embed sessions, API invocations
2. Filter by channel
3. Expand any conversation to see full input/output JSON

## Mock Data

All data is in `src/data/mock.ts` — no backend. Interactions (generate keys, create agents, etc.) persist in the Zustand store during the session.

### Pre-loaded Data
- 5 agents (some active, one draft)
- 2 embed keys, 1 headless API per relevant agent
- KB documents per agent
- 3 voice campaigns with target lists
- 10+ invocation logs across agents
- 3 team members (2 active, 1 pending invite)

## Design Principles

- **Modern AI SaaS** — Clean, professional, minimal
- **Bank User–Friendly** — Simple navigation, clear workflows, no jargon
- **Scalable** — Easy to add new agents, channels, features
- **Responsive** — Works on desktop (primary) and tablet
- **Dark Mode Ready** — Can be extended with dark theme

## Conversations Tab (Generic)

Unlike typical "conversations" tabs that focus only on voice/chat, this prototype includes a unified view of **all agent interactions**:
- Voice calls (inbound/outbound)
- Chat sessions
- Embed widget interactions
- Headless API invocations
- Event triggers (when implemented)
- Scheduled runs (when implemented)

Filter by channel, expand any to see full input/output.

## Agent Analytics Tab

Per-agent metrics:
- Total invocations (all-time)
- Success rate (%)
- Failed count
- Average latency
- Invocations by channel breakdown
- Performance trends

## Future Enhancements

- Event Triggers — Wire webhooks to agents
- Scheduled Runs — Cron-based agent execution
- Dark Mode — Theme switcher
- Real Backend — Replace mock store with API calls
- More Analytics — Trends, exports, integrations
- Mobile SDK — Native mobile embedding
