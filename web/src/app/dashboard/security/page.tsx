'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Shield, AlertTriangle, CheckCircle, Lock, Activity } from 'lucide-react';

export default function SecurityPage() {
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => apiClient.getSecurityEvents(),
    refetchInterval: 5000,
  });

  const { data: complianceData } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => apiClient.getCompliance(),
  });

  const { data: threatsData } = useQuery({
    queryKey: ['threats'],
    queryFn: () => apiClient.getThreats(),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const events = eventsData?.events || [];
  const eventsSummary = eventsData?.summary || {};
  const compliance = complianceData?.compliance || [];
  const complianceOverview = complianceData?.overview || {};
  const threats = threatsData || {};

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-yellow-100 text-yellow-700';
      case 'non-compliant': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Security & Compliance Agent</h2>
        <p className="text-gray-600">Data protection and regulatory compliance monitoring</p>
      </div>

      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Events</p>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{eventsSummary.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-700">Critical</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">{eventsSummary.critical || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-700">High Priority</p>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">{eventsSummary.high || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Unresolved</p>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{eventsSummary.unresolved || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">Blocked Attacks</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{threats.blockedAttacks || 0}</p>
        </div>
      </div>

      {/* Threat Intelligence */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Threat Intelligence</h3>
            <p className="text-red-100">Current threat level: {threats.threatLevel || 'Unknown'}</p>
          </div>
          <Lock className="w-12 h-12 opacity-50" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-red-100 text-sm">Active Threats</p>
            <p className="text-3xl font-bold">{threats.activeThreats || 0}</p>
          </div>
          <div>
            <p className="text-red-100 text-sm">Suspicious Activities</p>
            <p className="text-3xl font-bold">{threats.suspiciousActivities || 0}</p>
          </div>
          <div>
            <p className="text-red-100 text-sm">Blocked Attacks</p>
            <p className="text-3xl font-bold">{threats.blockedAttacks || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      {threats.recentThreats && threats.recentThreats.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Threat Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threats.recentThreats.map((threat: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 text-sm">{threat.type}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    threat.status === 'blocked' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {threat.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{threat.count}</p>
                <p className="text-xs text-gray-500">Last seen: {new Date(threat.lastSeen).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Compliance Status</h3>
          <div className="text-right">
            <p className="text-sm text-gray-600">Overall Score</p>
            <p className="text-2xl font-bold text-gray-900">{complianceOverview.overallScore || 0}/100</p>
          </div>
        </div>
        <div className="space-y-4">
          {compliance.map((item: any) => (
            <div key={item.regulation} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{item.regulation}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(item.status)}`}>
                  {item.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Score</p>
                  <p className="font-bold text-gray-900">{item.score}/100</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Audit</p>
                  <p className="font-medium text-gray-900">{new Date(item.lastAudit).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Audit</p>
                  <p className="font-medium text-gray-900">{new Date(item.nextAudit).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Security Events</h3>
        {events.map((event: any) => (
          <div key={event.id} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${getSeverityColor(event.severity)}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getSeverityColor(event.severity)}`}>
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{event.description}</h4>
                    <p className="text-sm text-gray-600">Event Type: {event.eventType.toUpperCase()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3">{event.details}</p>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                  <span>Action: {event.action}</span>
                  {event.userId && <span>User: {event.userId}</span>}
                  <span>IP: {event.ipAddress}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className={`font-medium ${
                    event.status === 'resolved' ? 'text-green-600' : 
                    event.status === 'investigating' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    Status: {event.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
