import React from 'react'
import { AgentChannel } from '../../types'
import { Phone, MessageSquare, Globe, Cpu } from 'lucide-react'
import clsx from 'clsx'

interface ChannelBadgeProps {
  channel: AgentChannel | string
  size?: 'sm' | 'md'
}

const config: Record<string, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  CALL:     { icon: <Phone size={10} strokeWidth={2} />,        label: 'Call',     bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]' },
  CHAT:     { icon: <MessageSquare size={10} strokeWidth={2} />, label: 'Chat',    bg: 'bg-[#EEF1FE]', text: 'text-[#3056F4]', border: 'border-[#C8D2FB]' },
  EMBED:    { icon: <Globe size={10} strokeWidth={2} />,         label: 'Embed',   bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
  HEADLESS: { icon: <Cpu size={10} strokeWidth={2} />,           label: 'API',     bg: 'bg-[#F8F9FB]', text: 'text-[#6B7385]', border: 'border-[#E5E7ED]' },
}

export function ChannelBadge({ channel, size = 'md' }: ChannelBadgeProps) {
  const cfg = config[channel] ?? config.HEADLESS

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full border mono font-bold tracking-[0.04em] uppercase',
      size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10.5px]',
      cfg.bg, cfg.text, cfg.border
    )}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}
