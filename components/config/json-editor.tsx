'use client'

import { useState, useEffect } from 'react'
import { Button, Textarea } from '@/components/ui'
import type { ProjectConfiguration } from '@/types'

interface JSONEditorProps {
  config: ProjectConfiguration
  onChange: (config: ProjectConfiguration) => void
}

export function JSONEditor({ config, onChange }: JSONEditorProps) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2))
  }, [config])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setError(null)
      onChange(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleReset = () => {
    setJsonText(JSON.stringify(config, null, 2))
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-kibble-text-primary">Raw JSON</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            Apply
          </Button>
        </div>
      </div>

      <p className="text-sm text-kibble-text-tertiary">
        Edit the configuration directly as JSON. Be careful - invalid JSON will not be saved.
      </p>

      <div className="relative">
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value)
            setError(null)
          }}
          className="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-kibble-primary/50"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="p-3 bg-kibble-error/10 rounded-lg text-sm text-kibble-error">
          {error}
        </div>
      )}
    </div>
  )
}
