import React from 'react'
import clsx from 'clsx'

const inputBase = clsx(
  'input-base',
  'placeholder:text-[#9AA1B2]',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F4F5F8]'
)

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(inputBase, className)}
      style={{ colorScheme: 'light' }}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(inputBase, 'mono resize-vertical leading-relaxed', className)}
      style={{ colorScheme: 'light', minHeight: 96 }}
      {...props}
    />
  )
)
TextArea.displayName = 'TextArea'
