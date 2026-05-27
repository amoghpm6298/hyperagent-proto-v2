import React from 'react'
import clsx from 'clsx'

interface StatusBadgeProps {
  status: 'ACTIVE' | 'DRAFT' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'PROCESSING' | 'READY' | 'FAILED'
  size?: 'sm' | 'md'
}

const config: Record<string, {
  bg: string; text: string; dot: string; pulse?: boolean; label?: string
}> = {
  ACTIVE:     { bg: 'bg-[#E6F6EF] border border-[#6EE7B7]', text: 'text-[#0F9D6E]', dot: 'bg-[#0F9D6E]', pulse: true,  label: 'Live'       },
  DRAFT:      { bg: 'bg-[#F4F5F8] border border-[#E5E7ED]', text: 'text-[#6B7385]', dot: 'bg-[#9AA1B2]', pulse: false, label: 'Draft'      },
  PENDING:    { bg: 'bg-[#FBF1DA] border border-[#FCD34D]', text: 'text-[#C2780A]', dot: 'bg-[#C2780A]', pulse: true,  label: 'Pending'    },
  RUNNING:    { bg: 'bg-[#FBF1DA] border border-[#FCD34D]', text: 'text-[#C2780A]', dot: 'bg-[#C2780A]', pulse: true,  label: 'Running'    },
  COMPLETED:  { bg: 'bg-[#E6F6EF] border border-[#6EE7B7]', text: 'text-[#0F9D6E]', dot: 'bg-[#0F9D6E]', pulse: false, label: 'Completed'  },
  PROCESSING: { bg: 'bg-[#EEF1FE] border border-[#C8D2FB]', text: 'text-[#3056F4]', dot: 'bg-[#3056F4]', pulse: true,  label: 'Processing' },
  READY:      { bg: 'bg-[#E6F6EF] border border-[#6EE7B7]', text: 'text-[#0F9D6E]', dot: 'bg-[#0F9D6E]', pulse: false, label: 'Ready'      },
  FAILED:     { bg: 'bg-[#FDECEF] border border-[#F8A3B3]', text: 'text-[#D63B5B]', dot: 'bg-[#D63B5B]', pulse: false, label: 'Failed'     },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = config[status] || config.DRAFT

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full mono',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      'font-bold tracking-[0.04em] uppercase',
      cfg.bg, cfg.text
    )}>
      <span className="relative flex-shrink-0" style={{ width: 6, height: 6 }}>
        {cfg.pulse && (
          <span className={clsx(
            'absolute inset-0 rounded-full pulse-ring-anim opacity-60',
            cfg.dot
          )} />
        )}
        <span className={clsx('relative block w-full h-full rounded-full', cfg.dot)} />
      </span>
      {cfg.label ?? status}
    </span>
  )
}
