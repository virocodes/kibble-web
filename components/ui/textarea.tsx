'use client'

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-kibble-text-primary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 bg-kibble-surface border rounded-lg text-kibble-text-primary placeholder:text-kibble-text-tertiary resize-none',
            'focus:outline-none focus:ring-2 focus:ring-kibble-primary focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-kibble-error' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-kibble-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-kibble-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
