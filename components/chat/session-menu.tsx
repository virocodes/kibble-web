'use client'

import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'

interface SessionMenuProps {
  onCommit: () => void
  onCreatePR: () => void
  onViewPR?: () => void
  onEndSession: () => void
  prUrl?: string
  disabled?: boolean
}

export function SessionMenu({
  onCommit,
  onCreatePR,
  onViewPR,
  onEndSession,
  prUrl,
  disabled,
}: SessionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const handleAction = (action: () => void) => {
    setIsOpen(false)
    action()
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          className="!p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => handleAction(onCommit)}
                disabled={disabled}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                  'hover:bg-kibble-background text-kibble-text-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Request Commit
              </button>

              <button
                onClick={() => handleAction(onCreatePR)}
                disabled={disabled}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                  'hover:bg-kibble-background text-kibble-text-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Create PR
              </button>

              {prUrl && onViewPR && (
                <button
                  onClick={() => handleAction(onViewPR)}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                    'hover:bg-kibble-background text-kibble-primary'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View PR
                </button>
              )}

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => {
                  setIsOpen(false)
                  setShowEndConfirm(true)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                  'hover:bg-red-50 text-kibble-error'
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Session
              </button>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        title="End Session"
        size="sm"
      >
        <p className="text-kibble-text-secondary mb-4">
          Are you sure you want to end this session? Any unsaved changes will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowEndConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowEndConfirm(false)
              onEndSession()
            }}
          >
            End Session
          </Button>
        </div>
      </Modal>
    </>
  )
}
