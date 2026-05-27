import React from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Card, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/shared/StatusBadge'

interface Target {
  id: string
  phoneNumber: string
  status: string
  calledAt?: string
  duration?: number
  outcome?: string
}

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const campaigns = useAppStore((state) => state.campaigns)
  const campaign = campaigns.find((c) => c.id === id)

  // Generate mock targets
  const targets: Target[] = Array.from({ length: 20 }, (_, i) => ({
    id: `target_${i}`,
    phoneNumber: `+91-${Math.random().toString().slice(2, 10)}XXXXX`,
    status: i % 3 === 0 ? 'PENDING' : i % 2 === 0 ? 'COMPLETED' : 'IN_PROGRESS',
    calledAt: i < 15 ? `2026-05-14 ${9 + Math.floor(i / 2)}:${Math.floor(Math.random() * 60)}` : undefined,
    duration: i < 15 ? Math.floor(Math.random() * 8 * 60) : undefined,
    outcome: i < 12 ? ['CONTACTED', 'NO_ANSWER', 'FAILED'][Math.floor(Math.random() * 3)] : undefined,
  }))

  if (!campaign) return <div className="p-8">Campaign not found</div>

  const successRate = ((campaign.completed / campaign.totalTargets) * 100).toFixed(1)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">{campaign.name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Agent: {campaign.agentName}</p>
        </div>
        <div className="flex gap-3">
          <StatusBadge status={campaign.status as any} size="md" />
          {campaign.status === 'RUNNING' && <Button variant="secondary">Pause</Button>}
          {campaign.status === 'PAUSED' && <Button variant="secondary">Resume</Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="hover:shadow-sm transition-all">
          <p className="metric-label">Total Targets</p>
          <p className="metric-value mt-2">{campaign.totalTargets}</p>
        </Card>
        <Card className="hover:shadow-sm transition-all">
          <p className="metric-label">Completed</p>
          <p className="metric-value mt-2 text-emerald-600">{campaign.completed}</p>
        </Card>
        <Card className="hover:shadow-sm transition-all">
          <p className="metric-label">Pending</p>
          <p className="metric-value mt-2 text-amber-600">{campaign.pending}</p>
        </Card>
        <Card className="hover:shadow-sm transition-all">
          <p className="metric-label">Failed</p>
          <p className="metric-value mt-2 text-red-600">{campaign.failed}</p>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardTitle>Campaign Progress</CardTitle>
        <div className="mt-6">
          <div className="w-full bg-zinc-700/50 rounded-full h-2.5">
            <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${successRate}%` }}></div>
          </div>
          <p className="text-sm font-medium text-gray-400 mt-3">{successRate}% complete</p>
        </div>
      </Card>

      {/* Targets */}
      <Card className="overflow-hidden">
        <CardTitle>Call Targets</CardTitle>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Called At</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Duration</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-300">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {targets.slice(0, 10).map((target) => (
                <tr key={target.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-300">{target.phoneNumber}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={target.status as any} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-gray-400">{target.calledAt || '-'}</td>
                  <td className="py-3 px-4 text-gray-400">{target.duration ? `${target.duration}s` : '-'}</td>
                  <td className="py-3 px-4 text-gray-400">{target.outcome || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">Showing {Math.min(10, targets.length)} of {targets.length} targets</p>
      </Card>
    </div>
  )
}
