'use client'

import { useState } from 'react'
import { Card, Button, Input, Textarea, Modal, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SubagentConfig, SubagentModel } from '@/types'

interface SubagentEditorProps {
  subagents: SubagentConfig[]
  onChange: (subagents: SubagentConfig[]) => void
}

export function SubagentEditor({ subagents, onChange }: SubagentEditorProps) {
  const [editingSubagent, setEditingSubagent] = useState<SubagentConfig | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleAdd = () => {
    const newSubagent: SubagentConfig = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      prompt: '',
      model: 'sonnet',
      enabled: true,
    }
    setEditingSubagent(newSubagent)
    setShowModal(true)
  }

  const handleEdit = (subagent: SubagentConfig) => {
    setEditingSubagent({ ...subagent })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!editingSubagent || !editingSubagent.name) return

    const existing = subagents.find((s) => s.id === editingSubagent.id)
    if (existing) {
      onChange(subagents.map((s) => (s.id === editingSubagent.id ? editingSubagent : s)))
    } else {
      onChange([...subagents, editingSubagent])
    }
    setShowModal(false)
    setEditingSubagent(null)
  }

  const handleDelete = (id: string) => {
    onChange(subagents.filter((s) => s.id !== id))
  }

  const handleToggle = (id: string) => {
    onChange(subagents.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-kibble-text-primary">Subagents</h3>
        <Button size="sm" onClick={handleAdd}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subagent
        </Button>
      </div>

      {subagents.length === 0 ? (
        <div className="text-center py-6 text-kibble-text-tertiary text-sm">
          No subagents configured
        </div>
      ) : (
        <div className="space-y-2">
          {subagents.map((subagent) => (
            <SubagentRow
              key={subagent.id}
              subagent={subagent}
              onEdit={() => handleEdit(subagent)}
              onDelete={() => handleDelete(subagent.id)}
              onToggle={() => handleToggle(subagent.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSubagent?.name ? 'Edit Subagent' : 'Add Subagent'}
        size="lg"
      >
        {editingSubagent && (
          <SubagentForm
            subagent={editingSubagent}
            onChange={setEditingSubagent}
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  )
}

function SubagentRow({
  subagent,
  onEdit,
  onDelete,
  onToggle,
}: {
  subagent: SubagentConfig
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <Card className={cn('flex items-center justify-between', !subagent.enabled && 'opacity-50')}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative',
            subagent.enabled ? 'bg-kibble-success' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
              subagent.enabled ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-kibble-text-primary">{subagent.name}</span>
            {subagent.model && (
              <Badge variant="outline" size="sm">
                {subagent.model}
              </Badge>
            )}
          </div>
          <p className="text-xs text-kibble-text-tertiary truncate max-w-xs">
            {subagent.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="p-1.5 text-kibble-text-tertiary hover:text-kibble-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={onDelete} className="p-1.5 text-kibble-text-tertiary hover:text-kibble-error">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </Card>
  )
}

function SubagentForm({
  subagent,
  onChange,
  onSave,
  onCancel,
}: {
  subagent: SubagentConfig
  onChange: (subagent: SubagentConfig) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Name"
        value={subagent.name}
        onChange={(e) => onChange({ ...subagent, name: e.target.value })}
        placeholder="Code Reviewer"
      />

      <Input
        label="Description"
        value={subagent.description}
        onChange={(e) => onChange({ ...subagent, description: e.target.value })}
        placeholder="Reviews code changes for best practices"
      />

      <div>
        <label className="block text-sm font-medium text-kibble-text-secondary mb-2">
          Model
        </label>
        <div className="flex gap-2">
          {(['sonnet', 'opus', 'haiku'] as SubagentModel[]).map((model) => (
            <button
              key={model}
              onClick={() => onChange({ ...subagent, model })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                subagent.model === model
                  ? 'bg-kibble-primary text-white'
                  : 'bg-kibble-background text-kibble-text-secondary hover:bg-gray-200'
              )}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="System Prompt"
        value={subagent.prompt}
        onChange={(e) => onChange({ ...subagent, prompt: e.target.value })}
        placeholder="You are a code reviewer. Analyze code changes for..."
        rows={6}
      />

      <Input
        label="Allowed Tools (comma-separated, optional)"
        value={subagent.allowed_tools?.join(', ') || ''}
        onChange={(e) =>
          onChange({
            ...subagent,
            allowed_tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
          })
        }
        placeholder="Read, Grep, Glob"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!subagent.name}>
          Save
        </Button>
      </div>
    </div>
  )
}
