import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  elevated?: boolean
}

export function Card({ className, hoverable = false, elevated = false, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white border border-[#E5E7ED] rounded-xl p-6',
        'transition-all duration-150',
        hoverable && 'hover:border-[#3056F4]/30 hover:shadow-sm cursor-pointer',
        elevated && 'shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('text-sm font-semibold text-[#0E1116]', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx('text-xs text-[#6B7385] mt-0.5', className)} {...props} />
}
