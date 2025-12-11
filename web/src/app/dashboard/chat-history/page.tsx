'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MessageSquare, Clock, Calendar, User, Mail, TrendingUp, Activity } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeChatHistoryPage() {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: histories, isLoading } = useQuery({
    queryKey: ['all-chat-histories', filterStatus],
    queryFn: () => apiClient.getAllChatHistories({ status: filterStatus || undefined }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ['chat-history-stats'],
    queryFn: () => apiClient.getChatHistoryStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  const chatHistories = histories?.histories || [];
  const chatStats = stats?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Chat History</h2>
        <p className="text-gray-600">Monitor all customer conversations with the AI assistant</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold mb-1">{chatStats.totalChats || 0}</p>
          <p className="text-blue-100 text-sm">Total Conversations</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold mb-1">{chatStats.activeChats || 0}</p>
          <p className="text-green-100 text-sm">Active Chats</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold mb-1">{chatStats.totalMessages || 0}</p>
          <p className="text-purple-100 text-sm">Total Messages</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold mb-1">{chatStats.avgMessagesPerChat || 0}</p>
          <p className="text-orange-100 text-sm">Avg Messages/Chat</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Chats</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <span className="text-sm text-gray-600 ml-auto">
            Showing {chatHistories.length} conversation{chatHistories.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chatHistories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Chat History</h3>
          <p className="text-gray-600">Customer conversations will appear here.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <h3 className="font-bold text-lg">All Conversations</h3>
              <p className="text-sm text-blue-100">{chatHistories.length} chats</p>
            </div>

            <div className="divide-y divide-gray-200 max-h-[700px] overflow-y-auto">
              {chatHistories.map((chat: any) => (
                <button
                  key={chat.sessionId}
                  onClick={() => setSelectedSession(chat)}
                  className={`w-full p-4 text-left hover:bg-blue-50 transition-colors ${
                    selectedSession?.sessionId === chat.sessionId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{chat.customerName}</span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          chat.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {chat.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{chat.customerEmail}</span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {chat.messages?.[chat.messages.length - 1]?.content || 'No messages'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(chat.lastActivity).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(chat.lastActivity).toLocaleTimeString()}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {chat.messageCount} msgs
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {selectedSession ? (
              <>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{selectedSession.customerName}</h3>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedSession.status === 'active'
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>
                  <p className="text-sm text-purple-100">{selectedSession.customerEmail}</p>
                  <p className="text-xs text-purple-200 mt-1">
                    Session: {selectedSession.sessionId.slice(-12)}
                  </p>
                </div>

                <div className="p-4 space-y-4 max-h-[550px] overflow-y-auto">
                  {selectedSession.messages?.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Messages</p>
                      <p className="font-bold text-gray-900">{selectedSession.messageCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Started</p>
                      <p className="font-bold text-gray-900 text-xs">
                        {new Date(selectedSession.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Last Active</p>
                      <p className="font-bold text-gray-900 text-xs">
                        {new Date(selectedSession.lastActivity).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Duration</p>
                      <p className="font-bold text-gray-900">
                        {Math.round(
                          (new Date(selectedSession.lastActivity).getTime() -
                            new Date(selectedSession.startTime).getTime()) /
                            60000
                        )}{' '}
                        min
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-12 text-center">
                <div>
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">
                    Choose a chat from the list to view the full conversation history
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
