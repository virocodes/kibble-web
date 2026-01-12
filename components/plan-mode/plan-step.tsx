'use client'

import { cn } from '@/lib/utils'
import type { PlanStep as PlanStepType, PlanStepStatus } from '@/types'

interface PlanStepProps {
  step: PlanStepType
  index: number
}

export function PlanStep({ step, index }: PlanStepProps) {
  const getStatusIcon = (status: PlanStepStatus) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 rounded-full bg-kibble-success flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'in_progress':
        return (
          <div className="w-6 h-6 rounded-full bg-kibble-primary flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )
      case 'skipped':
        return (
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-kibble-text-tertiary">
              {index + 1}
            </span>
          </div>
        )
    }
  }

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg',
      step.status === 'in_progress' && 'bg-kibble-primary/5',
      step.status === 'completed' && 'bg-kibble-success/5',
      step.status === 'skipped' && 'opacity-50'
    )}>
      {getStatusIcon(step.status)}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          step.status === 'completed' && 'text-kibble-text-secondary line-through',
          step.status === 'in_progress' && 'text-kibble-text-primary font-medium',
          step.status === 'pending' && 'text-kibble-text-secondary',
          step.status === 'skipped' && 'text-kibble-text-tertiary line-through'
        )}>
          {step.description}
        </p>
        {step.files && step.files.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {step.files.map((file, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-kibble-text-tertiary px-1.5 py-0.5 rounded font-mono"
              >
                {file.split('/').pop()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
