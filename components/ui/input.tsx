'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-kibble-text-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-3 py-2 bg-kibble-surface border rounded-lg text-kibble-text-primary placeholder:text-kibble-text-tertiary',
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

Input.displayName = 'Input'

export { Input }
