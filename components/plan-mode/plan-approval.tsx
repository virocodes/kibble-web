'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal, Textarea } from '@/components/ui'
import { PlanStep } from './plan-step'
import { cn } from '@/lib/utils'
import type { AgentPlan, PlanStatus } from '@/types'

interface PlanApprovalProps {
  plan: AgentPlan
  onApprove: () => void
  onReject: (feedback: string) => void
  disabled?: boolean
}

export function PlanApproval({ plan, onApprove, onReject, disabled }: PlanApprovalProps) {
  const [expanded, setExpanded] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [feedback, setFeedback] = useState('')

  const completedSteps = plan.steps.filter((s) => s.status === 'completed').length
  const totalSteps = plan.steps.length
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const isExecuting = plan.status === 'executing'
  const isCompleted = plan.status === 'completed'
  const isFailed = plan.status === 'failed'
  const isPending = plan.status === 'pending'

  const handleReject = () => {
    if (feedback.trim()) {
      onReject(feedback.trim())
      setShowRejectModal(false)
      setFeedback('')
    }
  }

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Approval</Badge>
      case 'approved':
        return <Badge variant="info">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline">Rejected</Badge>
      case 'executing':
        return <Badge variant="info">Executing...</Badge>
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-kibble-error border-kibble-error">Failed</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <Card className="bg-kibble-surface-elevated border-kibble-primary/20">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-kibble-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="font-semibold text-kibble-text-primary">{plan.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(plan.status)}
              <span className="text-sm text-kibble-text-tertiary">
                {totalSteps} step{totalSteps !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-kibble-text-tertiary hover:text-kibble-text-secondary"
          >
            <svg
              className={cn('w-5 h-5 transition-transform', expanded && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        {plan.summary && (
          <p className="text-sm text-kibble-text-secondary mb-4">
            {plan.summary}
          </p>
        )}

        {/* Progress Bar */}
        {(isExecuting || isCompleted) && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-kibble-text-tertiary mb-1">
              <span>Progress</span>
              <span>{completedSteps} / {totalSteps}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isCompleted ? 'bg-kibble-success' : 'bg-kibble-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        {expanded && (
          <div className="space-y-2 mb-4">
            {plan.steps.map((step, index) => (
              <PlanStep key={step.id} step={step} index={index} />
            ))}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(true)}
              disabled={disabled}
            >
              Reject
            </Button>
            <Button
              onClick={onApprove}
              disabled={disabled}
            >
              Approve Plan
            </Button>
          </div>
        )}

        {/* Failure Message */}
        {isFailed && plan.rejection_feedback && (
          <div className="mt-4 p-3 bg-kibble-error/10 rounded-lg">
            <p className="text-sm text-kibble-error">{plan.rejection_feedback}</p>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Plan"
        size="md"
      >
        <p className="text-sm text-kibble-text-secondary mb-4">
          Please provide feedback on why you&apos;re rejecting this plan. This helps the AI assistant improve.
        </p>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What changes would you like to see?"
          rows={4}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={!feedback.trim()}
          >
            Reject Plan
          </Button>
        </div>
      </Modal>
    </>
  )
}
