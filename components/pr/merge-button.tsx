'use client'

import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { PullRequest } from '@/types'

type MergeMethod = 'merge' | 'squash' | 'rebase'

interface MergeButtonProps {
  pr: PullRequest
  onMerge: (method: MergeMethod) => Promise<void>
  disabled?: boolean
}

export function MergeButton({ pr, onMerge, disabled }: MergeButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [method, setMethod] = useState<MergeMethod>('squash')
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canMerge = pr.state === 'open' && !pr.draft && pr.mergeable !== false
  const isMerged = !!pr.merged_at

  const handleMerge = async () => {
    setMerging(true)
    setError(null)
    try {
      await onMerge(method)
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge')
    } finally {
      setMerging(false)
    }
  }

  if (isMerged) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 rounded-lg">
        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-purple-700">Merged</span>
      </div>
    )
  }

  if (pr.state === 'closed') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-lg">
        <svg className="w-5 h-5 text-kibble-error" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-kibble-error">Closed</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {pr.mergeable === false && (
          <div className="flex items-center gap-2 px-4 py-3 bg-kibble-warning/10 rounded-lg text-sm">
            <svg className="w-5 h-5 text-kibble-warning" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-kibble-warning">This branch has conflicts that must be resolved</span>
          </div>
        )}

        <Button
          onClick={() => setShowModal(true)}
          disabled={disabled || !canMerge}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          Merge Pull Request
        </Button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Merge Pull Request"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-kibble-text-secondary">
            Choose how you want to merge this pull request:
          </p>

          {/* Merge Method Selection */}
          <div className="space-y-2">
            {([
              { value: 'squash', label: 'Squash and merge', description: 'Combine all commits into one' },
              { value: 'merge', label: 'Create a merge commit', description: 'All commits will be added' },
              { value: 'rebase', label: 'Rebase and merge', description: 'Add commits to base branch' },
            ] as const).map((option) => (
              <button
                key={option.value}
                onClick={() => setMethod(option.value)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                  method === option.value
                    ? 'border-kibble-primary bg-kibble-primary-light'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    method === option.value ? 'border-kibble-primary' : 'border-gray-300'
                  )}
                >
                  {method === option.value && (
                    <span className="w-2.5 h-2.5 rounded-full bg-kibble-primary" />
                  )}
                </span>
                <div>
                  <p className="font-medium text-kibble-text-primary">{option.label}</p>
                  <p className="text-sm text-kibble-text-secondary">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-kibble-error/10 rounded-lg text-sm text-kibble-error">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMerge} loading={merging}>
              Confirm Merge
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
