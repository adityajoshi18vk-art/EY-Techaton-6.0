import { z } from 'zod';

/**
 * Action types for chatbot responses
 */
export const actionSchema = z.object({
  type: z.enum(['navigate', 'offer_booking', 'run_diagnostics', 'show_report', 'create_booking', 'open_page']),
  payload: z.any().optional(),
});

export type Action = z.infer<typeof actionSchema>;

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;

/**
 * Chat response schema
 */
export const chatResponseSchema = z.object({
  success: z.boolean(),
  sessionId: z.string(),
  message: z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
  }),
  conversationHistory: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
  })),
  intent: z.string().optional(),
  actions: z.array(z.string()).optional(),
  action: z.object({
    type: z.string(),
    path: z.string().optional(),
    payload: z.any().optional(),
  }).optional(),
  options: z.array(z.string()).optional(),
  requiresInput: z.string().optional(),
  sources: z.array(z.string()).optional(),
  model: z.string().optional(),
  similarity: z.number().optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

/**
 * RAG context schema
 */
export const ragContextSchema = z.object({
  query: z.string(),
  retrievedDocs: z.array(z.object({
    id: z.string(),
    content: z.string(),
    score: z.number(),
    metadata: z.record(z.any()).optional(),
  })),
  threshold: z.number().default(0.55),
});

export type RAGContext = z.infer<typeof ragContextSchema>;

/**
 * Embedding request schema
 */
export const embeddingRequestSchema = z.object({
  text: z.string(),
  model: z.string().optional(),
});

export type EmbeddingRequest = z.infer<typeof embeddingRequestSchema>;

/**
 * Vector search result schema
 */
export const vectorSearchResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  metadata: z.record(z.any()).optional(),
  content: z.string(),
});

export type VectorSearchResult = z.infer<typeof vectorSearchResultSchema>;

/**
 * Document schema for indexing
 */
export const documentSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    source: z.string().optional(),
  }).optional(),
});

export type Document = z.infer<typeof documentSchema>;
