'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wrench, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function DiagnosticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['diagnostics'],
    queryFn: () => apiClient.getDiagnostics(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const diagnostics = data?.diagnostics || [];
  const summary = data?.summary || {};

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Diagnostics Agent</h2>
        <p className="text-gray-600">Predictive maintenance and fault detection</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Issues</p>
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-700">Critical</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">{summary.critical || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-700">Warnings</p>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-900">{summary.warnings || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Info</p>
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{summary.info || 0}</p>
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {diagnostics.map((diagnostic: any) => (
          <div 
            key={diagnostic.id} 
            className={`bg-white rounded-xl p-6 shadow-sm border-2 ${getSeverityColor(diagnostic.severity)}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getSeverityIcon(diagnostic.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{diagnostic.issue}</h3>
                    <p className="text-sm text-gray-600">
                      Vehicle: {diagnostic.vehicleId} | VIN: {diagnostic.vin}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(diagnostic.severity)}`}>
                    {diagnostic.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600">{diagnostic.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                    <p className="text-sm text-gray-600">{diagnostic.recommendation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {diagnostic.estimatedCost && (
                    <span>Estimated Cost: ${diagnostic.estimatedCost}</span>
                  )}
                  {diagnostic.predictedFailureDate && (
                    <span>Predicted Failure: {new Date(diagnostic.predictedFailureDate).toLocaleDateString()}</span>
                  )}
                  <span>{new Date(diagnostic.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {diagnostics.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Systems Healthy</h3>
          <p className="text-gray-600">No diagnostic issues detected at this time</p>
        </div>
      )}
    </div>
  );
}
