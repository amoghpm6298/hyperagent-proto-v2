import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-[10px] select-none',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-[4px] focus-visible:ring-[#3056F4]/20 focus-visible:border-[#3056F4]',
        {
          'gap-1 px-2.5 py-1.5 text-[12.5px]': size === 'sm',
          'gap-2 px-4 py-2.5 text-[13px]':      size === 'md',
          'gap-2 px-6 py-3 text-[13.5px]':       size === 'lg',
          // Primary — gradient brand
          [`bg-gradient-to-br from-[#3056F4] to-[#6B5BFF] text-white
            hover:from-[#1F3FE0] hover:to-[#5548E8]
            active:from-[#1A35C4] active:to-[#4A3ED8]
            shadow-[0_6px_14px_-6px_rgba(48,86,244,0.50)]
            hover:shadow-[0_8px_20px_-6px_rgba(48,86,244,0.60)]
            hover:-translate-y-px
            disabled:from-[#C8D2FB] disabled:to-[#B0BCFF] disabled:shadow-none disabled:translate-y-0`]:
            variant === 'primary',
          // Secondary
          'bg-white border border-[#E5E7ED] text-[#0E1116] hover:bg-[#F4F5F8] hover:border-[#C8D2FB] active:bg-[#EEF0F4] disabled:bg-[#F4F5F8] disabled:text-[#9AA1B2]':
            variant === 'secondary',
          // Danger
          'bg-[#FDECEF] border border-[#F8A3B3] text-[#D63B5B] hover:bg-[#FEE2E8] hover:border-[#F87096] active:bg-[#FDD0DA]':
            variant === 'danger',
          // Ghost
          'text-[#6B7385] hover:text-[#0E1116] hover:bg-[#F4F5F8] active:bg-[#EEF0F4]':
            variant === 'ghost',
          'cursor-not-allowed opacity-[0.42]': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
