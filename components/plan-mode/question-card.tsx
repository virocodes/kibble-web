'use client'

import { useState } from 'react'
import { Card, Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AgentQuestion, QuestionOption } from '@/types'

interface QuestionCardProps {
  question: AgentQuestion
  onSubmit: (answers: string[], customAnswer?: string) => void
  disabled?: boolean
}

export function QuestionCard({ question, onSubmit, disabled }: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customAnswer, setCustomAnswer] = useState('')

  const handleOptionToggle = (optionId: string) => {
    const newSelected = new Set(selectedOptions)

    if (question.multi_select) {
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId)
      } else {
        newSelected.add(optionId)
      }
    } else {
      newSelected.clear()
      newSelected.add(optionId)
    }

    setSelectedOptions(newSelected)
    setShowCustom(false)
  }

  const handleOtherClick = () => {
    if (!question.multi_select) {
      setSelectedOptions(new Set())
    }
    setShowCustom(true)
  }

  const handleSubmit = () => {
    const answers = Array.from(selectedOptions)
    const custom = showCustom && customAnswer.trim() ? customAnswer.trim() : undefined
    onSubmit(answers, custom)
  }

  const isValid = selectedOptions.size > 0 || (showCustom && customAnswer.trim())

  return (
    <Card className="bg-kibble-surface-elevated border-kibble-primary/20">
      {/* Header */}
      {question.header && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-kibble-primary bg-kibble-primary-light px-2 py-0.5 rounded">
            {question.header}
          </span>
          {question.question_index !== undefined && question.total_questions && (
            <span className="text-xs text-kibble-text-tertiary">
              {question.question_index + 1} of {question.total_questions}
            </span>
          )}
        </div>
      )}

      {/* Question */}
      <h3 className="text-base font-medium text-kibble-text-primary mb-4">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            selected={selectedOptions.has(option.id)}
            multiSelect={question.multi_select}
            onClick={() => handleOptionToggle(option.id)}
            disabled={disabled}
          />
        ))}

        {/* Other Option */}
        <button
          onClick={handleOtherClick}
          disabled={disabled}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
            showCustom
              ? 'border-kibble-primary bg-kibble-primary-light'
              : 'border-gray-200 hover:border-gray-300 bg-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              showCustom ? 'border-kibble-primary' : 'border-gray-300'
            )}
          >
            {showCustom && (
              <span className="w-2.5 h-2.5 rounded-full bg-kibble-primary" />
            )}
          </span>
          <span className="text-kibble-text-primary">Other...</span>
        </button>
      </div>

      {/* Custom Answer */}
      {showCustom && (
        <div className="mb-4">
          <Textarea
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            placeholder="Enter your answer..."
            rows={3}
            disabled={disabled}
          />
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || disabled}
        >
          Submit Answer
        </Button>
      </div>
    </Card>
  )
}

interface OptionButtonProps {
  option: QuestionOption
  selected: boolean
  multiSelect: boolean
  onClick: () => void
  disabled?: boolean
}

function OptionButton({ option, selected, multiSelect, onClick, disabled }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
        selected
          ? 'border-kibble-primary bg-kibble-primary-light'
          : 'border-gray-200 hover:border-gray-300 bg-white',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'w-5 h-5 shrink-0 flex items-center justify-center border-2 mt-0.5',
          multiSelect ? 'rounded' : 'rounded-full',
          selected ? 'border-kibble-primary bg-kibble-primary' : 'border-gray-300'
        )}
      >
        {selected && (
          multiSelect ? (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          )
        )}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-kibble-text-primary">{option.label}</p>
        {option.description && (
          <p className="text-sm text-kibble-text-secondary mt-0.5">
            {option.description}
          </p>
        )}
      </div>
    </button>
  )
}
