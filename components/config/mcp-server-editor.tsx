'use client'

import { useState } from 'react'
import { Card, Button, Input, Textarea, Modal, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MCPServerConfig, MCPServerType } from '@/types'

interface MCPServerEditorProps {
  servers: MCPServerConfig[]
  onChange: (servers: MCPServerConfig[]) => void
}

export function MCPServerEditor({ servers, onChange }: MCPServerEditorProps) {
  const [editingServer, setEditingServer] = useState<MCPServerConfig | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleAdd = () => {
    const newServer: MCPServerConfig = {
      id: crypto.randomUUID(),
      name: '',
      type: 'stdio',
      command: '',
      args: [],
      enabled: true,
    }
    setEditingServer(newServer)
    setShowModal(true)
  }

  const handleEdit = (server: MCPServerConfig) => {
    setEditingServer({ ...server })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!editingServer || !editingServer.name) return

    const existing = servers.find((s) => s.id === editingServer.id)
    if (existing) {
      onChange(servers.map((s) => (s.id === editingServer.id ? editingServer : s)))
    } else {
      onChange([...servers, editingServer])
    }
    setShowModal(false)
    setEditingServer(null)
  }

  const handleDelete = (id: string) => {
    onChange(servers.filter((s) => s.id !== id))
  }

  const handleToggle = (id: string) => {
    onChange(servers.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-kibble-text-primary">MCP Servers</h3>
        <Button size="sm" onClick={handleAdd}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Server
        </Button>
      </div>

      {servers.length === 0 ? (
        <div className="text-center py-6 text-kibble-text-tertiary text-sm">
          No MCP servers configured
        </div>
      ) : (
        <div className="space-y-2">
          {servers.map((server) => (
            <ServerRow
              key={server.id}
              server={server}
              onEdit={() => handleEdit(server)}
              onDelete={() => handleDelete(server.id)}
              onToggle={() => handleToggle(server.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingServer?.name ? 'Edit MCP Server' : 'Add MCP Server'}
        size="md"
      >
        {editingServer && (
          <ServerForm
            server={editingServer}
            onChange={setEditingServer}
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  )
}

function ServerRow({
  server,
  onEdit,
  onDelete,
  onToggle,
}: {
  server: MCPServerConfig
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <Card className={cn('flex items-center justify-between', !server.enabled && 'opacity-50')}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative',
            server.enabled ? 'bg-kibble-success' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
              server.enabled ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-kibble-text-primary">{server.name}</span>
            <Badge variant="outline" size="sm">
              {server.type}
            </Badge>
          </div>
          <p className="text-xs text-kibble-text-tertiary font-mono truncate max-w-xs">
            {server.type === 'stdio' ? server.command : server.url}
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

function ServerForm({
  server,
  onChange,
  onSave,
  onCancel,
}: {
  server: MCPServerConfig
  onChange: (server: MCPServerConfig) => void
  onSave: () => void
  onCancel: () => void
}) {
  const handleTypeChange = (type: MCPServerType) => {
    onChange({ ...server, type })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Name"
        value={server.name}
        onChange={(e) => onChange({ ...server, name: e.target.value })}
        placeholder="My MCP Server"
      />

      <div>
        <label className="block text-sm font-medium text-kibble-text-secondary mb-2">
          Type
        </label>
        <div className="flex gap-2">
          {(['stdio', 'http', 'sse'] as MCPServerType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                server.type === type
                  ? 'bg-kibble-primary text-white'
                  : 'bg-kibble-background text-kibble-text-secondary hover:bg-gray-200'
              )}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {server.type === 'stdio' ? (
        <>
          <Input
            label="Command"
            value={server.command || ''}
            onChange={(e) => onChange({ ...server, command: e.target.value })}
            placeholder="npx @modelcontextprotocol/server-filesystem"
          />
          <Input
            label="Arguments (comma-separated)"
            value={server.args?.join(', ') || ''}
            onChange={(e) =>
              onChange({
                ...server,
                args: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="/path/to/allowed/directory"
          />
        </>
      ) : (
        <Input
          label="URL"
          value={server.url || ''}
          onChange={(e) => onChange({ ...server, url: e.target.value })}
          placeholder="http://localhost:3001/mcp"
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!server.name}>
          Save
        </Button>
      </div>
    </div>
  )
}
