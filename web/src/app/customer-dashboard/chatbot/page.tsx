'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';
import { Bot, Send, Trash2, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  options?: string[];
  requiresInput?: string;
}

export default function CustomerChatbotPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      apiClient.sendChatMessage(message, sessionId, {
        customerId: user?.id,
        customerName: user?.name,
        customerEmail: user?.email,
      }),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(data.conversationHistory.map((msg: any) => ({
        ...msg,
        options: undefined,
        requiresInput: undefined
      })));
      
      // Set current options from the latest assistant message
      setCurrentOptions(data.options || []);
      
      // Handle navigation action
      if (data.action?.type === 'navigate' && data.action.path) {
        setTimeout(() => {
          router.push(data.action.path);
        }, 1500); // Wait 1.5 seconds to let user see the response
      }
    },
  });

  const clearSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.clearChatSession(sessionId),
    onSuccess: () => {
      setMessages([]);
      setSessionId(null);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessageMutation.mutate({ message: input, sessionId: sessionId || undefined });
    setInput('');
    setCurrentOptions([]);
  };

  const handleOptionClick = (option: string) => {
    sendMessageMutation.mutate({ message: option, sessionId: sessionId || undefined });
    setCurrentOptions([]);
  };

  const handleClearChat = () => {
    if (sessionId) {
      clearSessionMutation.mutate(sessionId);
    }
  };

  const quickQuestions = [
    'Book a service appointment',
    'How often should I change my oil?',
    'What does the check engine light mean?',
    'What are your service prices?',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h2>
        <p className="text-gray-600">Get instant help with your automotive questions</p>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">AI Automotive Assistant</h3>
              <p className="text-sm text-blue-100">Ask me anything about vehicle maintenance</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Start a Conversation</h3>
              <p className="text-gray-600 mb-6">Ask me anything about automotive service and maintenance</p>
              
              {/* Quick Questions */}
              <div className="max-w-2xl mx-auto space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                    }}
                    className="block w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
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
                      <span className="text-sm font-medium text-gray-600">You</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Options Buttons */}
              {currentOptions.length > 0 && (
                <div className="flex flex-col gap-2 max-w-[70%]">
                  <p className="text-sm text-gray-600 font-medium mb-1">Choose an option:</p>
                  {currentOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      disabled={sendMessageMutation.isPending}
                      className="text-left p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm text-gray-800 font-medium disabled:opacity-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={sendMessageMutation.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sendMessageMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">AI-Powered Support</h3>
        <p className="text-purple-100 mb-4">
          Our chatbot uses advanced AI to provide instant answers about vehicle maintenance, 
          service scheduling, diagnostic information, and more. Available 24/7 to assist you.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium">Instant Responses</p>
            <p className="text-purple-200">&lt; 1 second</p>
          </div>
          <div>
            <p className="font-medium">Topics Covered</p>
            <p className="text-purple-200">10+ categories</p>
          </div>
          <div>
            <p className="font-medium">Accuracy</p>
            <p className="text-purple-200">95%+</p>
          </div>
          <div>
            <p className="font-medium">Availability</p>
            <p className="text-purple-200">24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
