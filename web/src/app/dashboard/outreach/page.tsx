'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Users, Mail, MessageSquare, Bell, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function OutreachPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['outreach'],
    queryFn: () => apiClient.getOutreach(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const campaigns = data?.campaigns || [];
  const summary = data?.summary || {};

  const statusData = [
    { name: 'Active', value: summary.active || 0, color: '#3B82F6' },
    { name: 'Completed', value: summary.completed || 0, color: '#10B981' },
    { name: 'Scheduled', value: summary.scheduled || 0, color: '#F59E0B' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'push': return <Bell className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Outreach Agent</h2>
        <p className="text-gray-600">Personalized engagement campaigns</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Recipients</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.totalRecipients || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.averageOpenRate || 0}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.averageConversionRate || 0}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.active || 0}</p>
        </div>
      </div>

      {/* Campaign Status Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((campaign: any) => (
          <div key={campaign.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                {getTypeIcon(campaign.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                    <p className="text-sm text-gray-600">Target: {campaign.targetSegment}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4">{campaign.message}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Recipients</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.recipientCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Open Rate</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.openRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Click Rate</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.clickRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversion</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Type: {campaign.type.toUpperCase()}</span>
                  <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                  {campaign.scheduledFor && (
                    <span>Scheduled: {new Date(campaign.scheduledFor).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
