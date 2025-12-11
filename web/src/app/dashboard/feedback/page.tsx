'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MessageSquare, Star, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function FeedbackPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => apiClient.getFeedback(),
    refetchInterval: 5000,
  });

  const { data: trendsData } = useQuery({
    queryKey: ['feedback-trends'],
    queryFn: () => apiClient.getFeedbackTrends(),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const feedbackList = data?.feedback || [];
  const summary = data?.summary || {};
  const trends = trendsData || {};

  const ratingData = Object.entries(summary.ratingDistribution || {}).map(([rating, count]) => ({
    rating: `${rating} ★`,
    count: count as number
  }));

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'neutral': return 'bg-yellow-100 text-yellow-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Continuous Feedback Agent</h2>
        <p className="text-gray-600">Customer satisfaction tracking and sentiment analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Feedback</p>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-700">Avg Rating</p>
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-900">{(summary.averageRating || 0).toFixed(1)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">Positive</p>
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{summary.positive || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-700">Negative</p>
            <ThumbsDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">{summary.negative || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.pending || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Satisfaction Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends.monthlyAverages || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Issues & Praise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Issues</h3>
          <div className="space-y-3">
            {(trends.topIssues || []).map((issue: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{issue.issue}</span>
                <span className="text-sm font-bold text-red-700">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Praise</h3>
          <div className="space-y-3">
            {(trends.topPraise || []).map((praise: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{praise.praise}</span>
                <span className="text-sm font-bold text-green-700">{praise.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackList.map((feedback: any) => (
          <div key={feedback.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{feedback.customerName}</h3>
                      <div className="flex items-center gap-1">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {feedback.customerEmail && <span className="mr-3">📧 {feedback.customerEmail}</span>}
                      Booking: {feedback.bookingId}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                    {feedback.sentiment}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">{feedback.comment}</p>

                {feedback.responseText && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                    <p className="text-xs font-medium text-blue-700 mb-1">Response:</p>
                    <p className="text-sm text-blue-900">{feedback.responseText}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Category: {feedback.category.replace('-', ' ')}</span>
                  <span>•</span>
                  <span>{new Date(feedback.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className={feedback.resolved ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                    {feedback.resolved ? 'Resolved' : 'Pending'}
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
