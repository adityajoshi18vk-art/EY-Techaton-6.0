/**
 * Embeddings wrapper for multiple providers
 * Supports Google Gemini and custom embedding APIs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || 'gemini'; // 'gemini' | 'custom'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CUSTOM_EMBED_URL = process.env.CUSTOM_EMBED_URL;
const CUSTOM_EMBED_KEY = process.env.CUSTOM_EMBED_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Generate embeddings using selected provider
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (EMBEDDING_PROVIDER === 'gemini' && genAI) {
      return await generateGeminiEmbedding(text);
    } else if (EMBEDDING_PROVIDER === 'custom' && CUSTOM_EMBED_URL) {
      return await generateCustomEmbedding(text);
    } else {
      // Fallback: simple hash-based embedding (for testing only)
      return generateSimpleEmbedding(text);
    }
  } catch (error) {
    console.error('Embedding generation failed:', error);
    // Return fallback embedding
    return generateSimpleEmbedding(text);
  }
}

/**
 * Generate embedding using Google Gemini
 */
async function generateGeminiEmbedding(text: string): Promise<number[]> {
  if (!genAI) {
    throw new Error('Gemini API not initialized');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error: any) {
    console.error('Gemini embedding error:', error.message);
    throw error;
  }
}

/**
 * Generate embedding using custom API
 */
async function generateCustomEmbedding(text: string): Promise<number[]> {
  if (!CUSTOM_EMBED_URL) {
    throw new Error('Custom embedding URL not configured');
  }

  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (CUSTOM_EMBED_KEY) {
    headers['Authorization'] = `Bearer ${CUSTOM_EMBED_KEY}`;
  }

  const response = await axios.post(
    CUSTOM_EMBED_URL,
    { text },
    { headers }
  );

  return response.data.embedding || response.data.values;
}

/**
 * Simple deterministic embedding for fallback/testing
 * Uses character frequency and position weighting
 */
function generateSimpleEmbedding(text: string, dimensions: number = 384): number[] {
  const normalized = text.toLowerCase().trim();
  const embedding = new Array(dimensions).fill(0);
  
  // Character frequency with position weighting
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = charCode % dimensions;
    const weight = 1 / (i + 1); // Position weight decreases with position
    embedding[index] += weight;
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Batch embedding generation
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  
  return embeddings;
}

/**
 * Check if embedding service is available
 */
export function isEmbeddingAvailable(): boolean {
  return !!(
    (EMBEDDING_PROVIDER === 'gemini' && GEMINI_API_KEY) ||
    (EMBEDDING_PROVIDER === 'custom' && CUSTOM_EMBED_URL)
  );
}
