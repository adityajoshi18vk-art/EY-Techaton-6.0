/**
 * LRU Session Cache for storing recent conversation history
 * Implements rate limiting and automatic cleanup
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

interface SessionData {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  lastAccessed: string;
}

export class SessionCache {
  private cache: Map<string, CacheEntry<SessionData>>;
  private maxSize: number;
  private maxAge: number; // in milliseconds
  private maxMessagesPerSession: number;
  private rateLimitMap: Map<string, number[]>;
  private maxRequestsPerMinute: number;

  constructor(
    maxSize: number = 1000,
    maxAge: number = 3600000, // 1 hour
    maxMessagesPerSession: number = 6,
    maxRequestsPerMinute: number = 60
  ) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
    this.maxMessagesPerSession = maxMessagesPerSession;
    this.rateLimitMap = new Map();
    this.maxRequestsPerMinute = maxRequestsPerMinute;

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Get session data from cache
   */
  get(sessionId: string): SessionData | null {
    const entry = this.cache.get(sessionId);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(sessionId);
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    entry.timestamp = Date.now();
    
    return entry.value;
  }

  /**
   * Set session data in cache
   */
  set(sessionId: string, data: SessionData): void {
    // Enforce LRU: remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(sessionId)) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    // Limit messages per session to last N messages
    if (data.messages.length > this.maxMessagesPerSession) {
      data.messages = data.messages.slice(-this.maxMessagesPerSession);
    }

    this.cache.set(sessionId, {
      value: data,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Check rate limit for a session
   */
  checkRateLimit(sessionId: string): boolean {
    const now = Date.now();
    const requests = this.rateLimitMap.get(sessionId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(timestamp => now - timestamp < 60000);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.rateLimitMap.set(sessionId, recentRequests);
    
    return true;
  }

  /**
   * Delete session from cache
   */
  delete(sessionId: string): boolean {
    this.rateLimitMap.delete(sessionId);
    return this.cache.delete(sessionId);
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.cache.clear();
    this.rateLimitMap.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      sessions: Array.from(this.cache.entries()).map(([id, entry]) => ({
        sessionId: id,
        messageCount: entry.value.messages.length,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
      })),
    };
  }

  /**
   * Find oldest entry by timestamp
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => {
      this.cache.delete(key);
      this.rateLimitMap.delete(key);
    });

    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} expired sessions`);
    }
  }
}

// Singleton instance
export const sessionCache = new SessionCache();
