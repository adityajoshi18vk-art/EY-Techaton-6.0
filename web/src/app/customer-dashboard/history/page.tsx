'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';
import { MessageSquare, Clock, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function CustomerHistoryPage() {
  const { user } = useAuthStore();
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const { data: histories, isLoading } = useQuery({
    queryKey: ['chat-histories', user?.email],
    queryFn: () => apiClient.getAllChatHistories({ customerEmail: user?.email }),
    enabled: !!user?.email,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const chatHistories = histories?.histories || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chat History</h2>
        <p className="text-gray-600">View all your previous conversations with our AI assistant</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chatHistories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Chat History</h3>
          <p className="text-gray-600">
            Your conversations with our AI assistant will appear here.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <h3 className="font-bold text-lg">Your Conversations</h3>
              <p className="text-sm text-blue-100">{chatHistories.length} total chats</p>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {chatHistories.map((chat: any) => (
                <button
                  key={chat.sessionId}
                  onClick={() => setSelectedSession(chat)}
                  className={`w-full p-4 text-left hover:bg-blue-50 transition-colors ${
                    selectedSession?.sessionId === chat.sessionId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate">
                          Session {chat.sessionId.slice(-8)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {chat.messages?.[0]?.content || 'No messages'}
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
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
                  <h3 className="font-bold text-lg mb-1">Conversation Details</h3>
                  <p className="text-sm text-purple-100">
                    {new Date(selectedSession.startTime).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
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
                          <span className="text-xs font-medium text-gray-600">You</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Messages</p>
                      <p className="font-bold text-gray-900">{selectedSession.messageCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Status</p>
                      <p className="font-bold text-gray-900 capitalize">{selectedSession.status}</p>
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
