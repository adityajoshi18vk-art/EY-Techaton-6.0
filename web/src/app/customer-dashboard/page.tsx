'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';
import { Car, Activity, AlertTriangle, CheckCircle, Calendar, TrendingUp, Star, Send, MessageSquare } from 'lucide-react';

export default function CustomerDashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: telemetryData } = useQuery({
    queryKey: ['telemetry'],
    queryFn: () => apiClient.getTelemetry(),
    refetchInterval: 5000,
  });

  const { data: diagnosticsData } = useQuery({
    queryKey: ['diagnostics'],
    queryFn: () => apiClient.getDiagnostics(),
  });

  const submitFeedback = useMutation({
    mutationFn: (feedback: any) => apiClient.submitFeedback(feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setRating(5);
      setComment('');
    },
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback.mutate({ 
      rating, 
      comment,
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || 'customer@example.com'
    });
  };

  const latestVehicle = telemetryData?.vehicles?.[0];
  const diagnosticIssues = diagnosticsData?.diagnostics?.filter((d: any) => d.severity === 'high') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Vehicle Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Real-time vehicle health and performance monitoring
        </p>
      </div>

      {/* Vehicle Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle ID</p>
              <p className="text-xl font-bold text-gray-900">
                {latestVehicle?.vehicleId || 'V001'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Speed</p>
              <p className="text-xl font-bold text-gray-900">
                {latestVehicle?.speed || 0} km/h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fuel Level</p>
              <p className="text-xl font-bold text-gray-900">
                {latestVehicle?.fuelLevel || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              diagnosticIssues.length > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {diagnosticIssues.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Health Status</p>
              <p className="text-xl font-bold text-gray-900">
                {diagnosticIssues.length > 0 ? 'Needs Attention' : 'Good'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Issues */}
      {diagnosticIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Issues Detected
              </h3>
              <div className="space-y-2">
                {diagnosticIssues.slice(0, 3).map((issue: any) => (
                  <div key={issue.id} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-medium text-gray-900">{issue.component}</p>
                    <p className="text-sm text-gray-600">{issue.issue}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Schedule Service Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Engine Temperature</p>
            <p className="text-lg font-semibold text-gray-900">
              {latestVehicle?.engineTemp || 90}°C
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Battery Voltage</p>
            <p className="text-lg font-semibold text-gray-900">
              {latestVehicle?.batteryVoltage || 12.6}V
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Oil Pressure</p>
            <p className="text-lg font-semibold text-gray-900">
              {latestVehicle?.oilPressure || 45} PSI
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tire Pressure</p>
            <p className="text-lg font-semibold text-gray-900">
              {latestVehicle?.tirePressure || 32} PSI
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-lg font-semibold text-gray-900">
              {latestVehicle?.location || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900">
              {latestVehicle?.timestamp 
                ? new Date(latestVehicle.timestamp).toLocaleTimeString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
            <p className="text-gray-600">Help us improve your experience</p>
          </div>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate Your Experience
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 cursor-pointer ${
                      value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              rows={5}
              placeholder="Tell us about your experience with our service..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitFeedback.isPending}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-lg"
          >
            <Send className="w-5 h-5" />
            {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {submitFeedback.isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Thank you for your feedback!</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
