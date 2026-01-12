'use client'

import { useState } from 'react'
import { Card, Button, Input, Textarea, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SkillConfig } from '@/types'

interface SkillEditorProps {
  skills: SkillConfig[]
  onChange: (skills: SkillConfig[]) => void
}

export function SkillEditor({ skills, onChange }: SkillEditorProps) {
  const [editingSkill, setEditingSkill] = useState<SkillConfig | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleAdd = () => {
    const newSkill: SkillConfig = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      content: '',
      enabled: true,
    }
    setEditingSkill(newSkill)
    setShowModal(true)
  }

  const handleEdit = (skill: SkillConfig) => {
    setEditingSkill({ ...skill })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!editingSkill || !editingSkill.name) return

    const existing = skills.find((s) => s.id === editingSkill.id)
    if (existing) {
      onChange(skills.map((s) => (s.id === editingSkill.id ? editingSkill : s)))
    } else {
      onChange([...skills, editingSkill])
    }
    setShowModal(false)
    setEditingSkill(null)
  }

  const handleDelete = (id: string) => {
    onChange(skills.filter((s) => s.id !== id))
  }

  const handleToggle = (id: string) => {
    onChange(skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-kibble-text-primary">Skills</h3>
        <Button size="sm" onClick={handleAdd}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-6 text-kibble-text-tertiary text-sm">
          No skills configured
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              onEdit={() => handleEdit(skill)}
              onDelete={() => handleDelete(skill.id)}
              onToggle={() => handleToggle(skill.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSkill?.name ? 'Edit Skill' : 'Add Skill'}
        size="lg"
      >
        {editingSkill && (
          <SkillForm
            skill={editingSkill}
            onChange={setEditingSkill}
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  )
}

function SkillRow({
  skill,
  onEdit,
  onDelete,
  onToggle,
}: {
  skill: SkillConfig
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <Card className={cn('flex items-center justify-between', !skill.enabled && 'opacity-50')}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative',
            skill.enabled ? 'bg-kibble-success' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
              skill.enabled ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
        <div>
          <span className="font-medium text-kibble-text-primary">{skill.name}</span>
          <p className="text-xs text-kibble-text-tertiary truncate max-w-xs">
            {skill.description}
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

function SkillForm({
  skill,
  onChange,
  onSave,
  onCancel,
}: {
  skill: SkillConfig
  onChange: (skill: SkillConfig) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Name"
        value={skill.name}
        onChange={(e) => onChange({ ...skill, name: e.target.value })}
        placeholder="commit"
        helperText="This will be the slash command name (e.g., /commit)"
      />

      <Input
        label="Description"
        value={skill.description}
        onChange={(e) => onChange({ ...skill, description: e.target.value })}
        placeholder="Creates a git commit with a summary of changes"
      />

      <Textarea
        label="Content"
        value={skill.content}
        onChange={(e) => onChange({ ...skill, content: e.target.value })}
        placeholder="Instructions for the skill..."
        rows={8}
        helperText="The instructions that will be given to the agent when this skill is invoked"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!skill.name}>
          Save
        </Button>
      </div>
    </div>
  )
}
