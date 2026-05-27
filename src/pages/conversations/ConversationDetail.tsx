import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { conversations } from '../../data/mock'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ChannelBadge } from '../../components/shared/ChannelBadge'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Download, ArrowLeft, Clock, Users, MessageSquare, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { Conversation, ToolCall } from '../../types'

export function ConversationDetail() {
  const { id } = useParams<{ id: string }>()
  const conversation = conversations.find((c) => c.id === id)

  if (!conversation) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/conversations" className="text-indigo-600 hover:text-indigo-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">Conversation not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/conversations" className="text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">{conversation.agent}</h1>
          <p className="text-muted mt-1">{conversation.timestamp}</p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2">
          <Download size={16} />
          Export
        </Button>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Channel</p>
            <ChannelBadge channel={conversation.channel} />
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Status</p>
            <StatusBadge status={conversation.status} />
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Clock size={12} /> Duration
            </p>
            <p className="text-sm font-medium text-zinc-200">{conversation.duration}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Users size={12} /> Participants
            </p>
            <p className="text-sm font-medium text-zinc-200">{conversation.participants}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Transcript/Messages */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
              {conversation.channel === 'CALL' ? 'Call Transcript' : 'Conversation'}
            </h2>

            {conversation.messages ? (
              <div className="space-y-4">
                {conversation.messages.map((msg, idx) => (
                  <div key={idx} className={msg.role === 'user' ? 'text-right' : ''}>
                    <div className="inline-block max-w-xl rounded-lg px-4 py-3 text-sm leading-relaxed">
                      {msg.role === 'user' ? (
                        <div className="bg-indigo-900/50 text-indigo-100 rounded-lg px-4 py-3">
                          {msg.text}
                        </div>
                      ) : (
                        <div className="bg-zinc-800/50 text-gray-100 rounded-lg px-4 py-3 text-left">
                          {msg.text}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">No transcript available.</p>
            )}
          </Card>

          {/* Tool Calls */}
          {conversation.toolCalls && conversation.toolCalls.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">Tool Calls</h2>
              <div className="space-y-4">
                {conversation.toolCalls.map((toolCall) => (
                  <ToolCallCard key={toolCall.id} toolCall={toolCall} />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <h3 className="text-sm font-medium text-zinc-200 mb-4">Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Agent</p>
                <p className="text-sm font-medium text-zinc-200">{conversation.agent}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Channel Type</p>
                <p className="text-sm font-medium text-zinc-200">
                  {conversation.channel === 'CALL' ? 'Voice Call' : conversation.channel === 'CHAT' ? 'Text Chat' : 'API Call'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Initiated</p>
                <p className="text-sm font-medium text-zinc-200">{conversation.timestamp}</p>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-xs text-gray-500 uppercase mb-1">Message Count</p>
                <p className="text-sm font-medium text-zinc-200">
                  {conversation.messages ? conversation.messages.length : 'N/A'}
                </p>
              </div>
              {conversation.toolCalls && conversation.toolCalls.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Tool Calls</p>
                  <p className="text-sm font-medium text-zinc-200">{conversation.toolCalls.length}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-center gap-2">
                <MessageSquare size={14} />
                Reply
              </Button>
              <Button variant="secondary" className="w-full justify-center gap-2">
                <Phone size={14} />
                Schedule Follow-up
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const isSuccess = toolCall.status === 'SUCCESS'

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/40">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-red-400" />
          )}
          <div>
            <p className="font-medium text-sm text-gray-100">{toolCall.toolLabel}</p>
            <p className="text-xs text-gray-500">{toolCall.timestamp}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            isSuccess ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'
          }`}
        >
          {toolCall.status}
        </span>
      </div>

      {/* Input */}
      {Object.keys(toolCall.input).length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">Input</p>
          <div className="bg-zinc-800/50 p-2 rounded text-xs font-mono text-gray-300 overflow-x-auto border border-zinc-800">
            <pre>{JSON.stringify(toolCall.input, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Output */}
      {toolCall.output && Object.keys(toolCall.output).length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">Output</p>
          <div className="bg-zinc-800/50 p-2 rounded text-xs font-mono text-gray-300 overflow-x-auto border border-zinc-800">
            <pre>{JSON.stringify(toolCall.output, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Error */}
      {toolCall.errorMessage && (
        <div className="bg-red-900/30 p-2 rounded border border-red-700/50">
          <p className="text-xs text-red-300">{toolCall.errorMessage}</p>
        </div>
      )}
    </div>
  )
}
