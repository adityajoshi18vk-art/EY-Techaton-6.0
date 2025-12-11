'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TrendingUp, Car, Zap, Fuel } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['telemetry'],
    queryFn: () => apiClient.getTelemetry(),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const telemetryData = data?.data || [];
  const summary = data?.summary || {};

  const chartData = telemetryData.map((v: any) => ({
    name: v.vehicleId,
    speed: v.speed,
    engineTemp: v.engineTemp,
    fuelLevel: v.fuelLevel,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Analytics Agent</h2>
        <p className="text-gray-600">Real-time vehicle telemetry and performance insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.totalVehicles || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.activeVehicles || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Issues Detected</p>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.vehiclesWithIssues || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Avg Fuel Level</p>
            <Fuel className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.averageFuelLevel || 0}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Speed Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="speed" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Engine Temperature</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="engineTemp" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Telemetry Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vehicle ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">VIN</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Speed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Engine Temp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Fuel</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Battery</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {telemetryData.map((vehicle: any) => (
                <tr key={vehicle.vehicleId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{vehicle.vehicleId}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{vehicle.vin}</td>
                  <td className="py-3 px-4">{vehicle.speed} mph</td>
                  <td className="py-3 px-4">{vehicle.engineTemp}°C</td>
                  <td className="py-3 px-4">{vehicle.fuelLevel}%</td>
                  <td className="py-3 px-4">{vehicle.batteryVoltage}V</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.diagnosticCodes.length > 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {vehicle.diagnosticCodes.length > 0 ? 'Issues' : 'Healthy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
