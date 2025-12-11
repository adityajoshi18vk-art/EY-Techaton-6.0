'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Brain, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MasterDashboard() {
  const { data: masterData, isLoading } = useQuery({
    queryKey: ['master-logs'],
    queryFn: () => apiClient.getMasterLogs(),
    refetchInterval: 5000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['master-stats'],
    queryFn: () => apiClient.getMasterStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const logs = masterData?.logs || [];
  const agentStatuses = masterData?.agentStatuses || [];
  const systemStatus = masterData?.systemStatus || {};
  const stats = statsData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Master AI Agent</h2>
        <p className="text-gray-600">Orchestrating 6 specialized worker agents for automotive intelligence</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Decisions</p>
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalDecisions || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{((stats.successRate || 0) * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Active Workers</p>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{systemStatus.activeAgents || 0}/6</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">System Uptime</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{systemStatus.uptime || '0h'}</p>
        </div>
      </div>

      {/* Worker Agent Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Worker Agent Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentStatuses.map((agent: any) => (
            <div key={agent.type} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 text-sm">{agent.name}</p>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  agent.status === 'active' ? 'bg-green-100 text-green-700' :
                  agent.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {agent.status}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">{agent.currentTask || 'Idle'}</p>
              <p className="text-xs text-gray-500">Tasks completed: {agent.tasksCompleted}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Logs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Live Decision Logs</h3>
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{log.decision}</p>
                  <p className="text-sm text-gray-600 mt-1">{log.context}</p>
                </div>
                <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                  log.status === 'completed' ? 'bg-green-100 text-green-700' :
                  log.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.status}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{new Date(log.timestamp).toLocaleString()}</span>
                <span>Confidence: {(log.confidence * 100).toFixed(0)}%</span>
                {log.delegatedTo && (
                  <span>Delegated to: {log.delegatedTo.join(', ')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Master Agent Intelligence</h3>
        <p className="text-blue-100 mb-4">
          The Master Agent continuously monitors all worker agents, analyzes patterns, and makes
          intelligent decisions to optimize automotive operations.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium">Tasks in Progress</p>
            <p className="text-2xl font-bold">{stats.tasksInProgress || 0}</p>
          </div>
          <div>
            <p className="font-medium">Tasks Pending</p>
            <p className="text-2xl font-bold">{stats.tasksPending || 0}</p>
          </div>
          <div>
            <p className="font-medium">Tasks Completed</p>
            <p className="text-2xl font-bold">{stats.tasksCompleted || 0}</p>
          </div>
          <div>
            <p className="font-medium">Avg Confidence</p>
            <p className="text-2xl font-bold">{((stats.averageConfidence || 0) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
