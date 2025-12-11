const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string, role?: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  // Master Agent
  async getMasterLogs() {
    return this.request<any>('/api/master-logs');
  }

  async getMasterStats() {
    return this.request<any>('/api/master/stats');
  }

  // Telemetry
  async getTelemetry() {
    return this.request<any>('/api/telemetry');
  }

  // Diagnostics
  async getDiagnostics(severity?: string) {
    const query = severity ? `?severity=${severity}` : '';
    return this.request<any>(`/api/diagnostics${query}`);
  }

  async runDiagnostics(data: { vehicleId: string; symptoms?: string[]; urgency?: string }) {
    return this.request<any>('/api/diagnostics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Outreach
  async getOutreach(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any>(`/api/outreach${query}`);
  }

  // Booking
  async getBookings(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any>(`/api/booking${query}`);
  }

  async createBooking(data: any) {
    return this.request<any>('/api/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Feedback
  async getFeedback(params?: { sentiment?: string; resolved?: boolean }) {
    const query = new URLSearchParams();
    if (params?.sentiment) query.append('sentiment', params.sentiment);
    if (params?.resolved !== undefined) query.append('resolved', params.resolved.toString());
    const queryString = query.toString();
    return this.request<any>(`/api/feedback${queryString ? `?${queryString}` : ''}`);
  }

  async getFeedbackTrends() {
    return this.request<any>('/api/feedback/trends');
  }

  async submitFeedback(data: any) {
    return this.request<any>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Security
  async getSecurityEvents(params?: { severity?: string; eventType?: string }) {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.eventType) query.append('eventType', params.eventType);
    const queryString = query.toString();
    return this.request<any>(`/api/security${queryString ? `?${queryString}` : ''}`);
  }

  async getCompliance() {
    return this.request<any>('/api/security/compliance');
  }

  async getThreats() {
    return this.request<any>('/api/security/threats');
  }

  // Presence
  async getPresence() {
    return this.request<any>('/api/presence');
  }

  // Chatbot
  async sendChatMessage(message: string, sessionId?: string, customerInfo?: { customerId?: string; customerName?: string; customerEmail?: string }) {
    return this.request<any>('/api/chatbot', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, ...customerInfo }),
    });
  }

  async getChatHistory(sessionId: string) {
    return this.request<any>(`/api/chatbot/history/${sessionId}`);
  }

  async getChatbotStats() {
    return this.request<any>('/api/chatbot/stats');
  }

  async clearChatSession(sessionId: string) {
    return this.request<any>(`/api/chatbot/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Chat History
  async getAllChatHistories(params?: { customerId?: string; customerEmail?: string; status?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.customerEmail) query.append('customerEmail', params.customerEmail);
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    const queryString = query.toString();
    return this.request<any>(`/api/chat-history${queryString ? '?' + queryString : ''}`);
  }

  async getChatHistoryById(sessionId: string) {
    return this.request<any>(`/api/chat-history/${sessionId}`);
  }

  async getChatHistoryStats() {
    return this.request<any>('/api/chat-history/stats/summary');
  }

  // Inbox / Notifications
  async getNotifications(params?: { customerId?: string; customerEmail?: string; unreadOnly?: boolean }) {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.customerEmail) query.append('customerEmail', params.customerEmail);
    if (params?.unreadOnly) query.append('unreadOnly', 'true');
    const queryString = query.toString();
    return this.request<any>(`/api/inbox${queryString ? '?' + queryString : ''}`);
  }

  async createNotification(data: any) {
    return this.request<any>('/api/inbox', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/api/inbox/${id}/read`, {
      method: 'PATCH',
    });
  }

  async deleteNotification(id: string) {
    return this.request<any>(`/api/inbox/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
