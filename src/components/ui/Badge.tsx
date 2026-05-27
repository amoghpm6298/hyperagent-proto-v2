import React from 'react'
import clsx from 'clsx'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        {
          'bg-[#F4F5F8] text-[#6B7385] border border-[#E5E7ED]': variant === 'default',
          'bg-emerald-50 text-emerald-700 border border-emerald-200': variant === 'success',
          'bg-amber-50 text-amber-700 border border-amber-200': variant === 'warning',
          'bg-red-50 text-red-600 border border-red-200': variant === 'error',
          'bg-blue-50 text-blue-600 border border-blue-200': variant === 'info',
        },
        className
      )}
      {...props}
    />
  )
}
