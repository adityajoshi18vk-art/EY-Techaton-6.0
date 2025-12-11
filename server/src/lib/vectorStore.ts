/**
 * In-memory Vector Store with FAISS-like functionality
 * Supports document indexing, similarity search, and CRUD operations
 */

import { generateEmbedding, cosineSimilarity } from '../lib/embeddings';
import { Document, VectorSearchResult } from '../schemas/chatbot';
import fs from 'fs';
import path from 'path';

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export class VectorStore {
  private documents: Map<string, VectorDocument>;
  private indexName: string;
  private persistPath?: string;

  constructor(indexName: string = 'default', persistPath?: string) {
    this.documents = new Map();
    this.indexName = indexName;
    this.persistPath = persistPath;

    if (persistPath && fs.existsSync(persistPath)) {
      this.load();
    }
  }

  /**
   * Add document to vector store
   */
  async addDocument(doc: Document): Promise<void> {
    const embedding = await generateEmbedding(doc.content);

    this.documents.set(doc.id, {
      id: doc.id,
      content: doc.content,
      embedding,
      metadata: doc.metadata,
    });

    console.log(`📄 Indexed document: ${doc.id}`);
  }

  /**
   * Add multiple documents in batch
   */
  async addDocuments(docs: Document[]): Promise<void> {
    for (const doc of docs) {
      await this.addDocument(doc);
    }

    if (this.persistPath) {
      this.save();
    }
  }

  /**
   * Search for similar documents
   */
  async search(query: string, topK: number = 5, threshold: number = 0.55): Promise<VectorSearchResult[]> {
    const queryEmbedding = await generateEmbedding(query);
    const results: Array<VectorSearchResult & { score: number }> = [];

    for (const [id, doc] of this.documents.entries()) {
      const score = cosineSimilarity(queryEmbedding, doc.embedding);

      if (score >= threshold) {
        results.push({
          id,
          score,
          content: doc.content,
          metadata: doc.metadata,
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Return top K results
    return results.slice(0, topK);
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): VectorDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Delete document by ID
   */
  deleteDocument(id: string): boolean {
    const result = this.documents.delete(id);
    if (result && this.persistPath) {
      this.save();
    }
    return result;
  }

  /**
   * Update document
   */
  async updateDocument(id: string, content: string, metadata?: Record<string, any>): Promise<void> {
    const embedding = await generateEmbedding(content);

    this.documents.set(id, {
      id,
      content,
      embedding,
      metadata,
    });

    if (this.persistPath) {
      this.save();
    }
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
    if (this.persistPath) {
      this.save();
    }
  }

  /**
   * Get total document count
   */
  size(): number {
    return this.documents.size;
  }

  /**
   * Get all document IDs
   */
  getDocumentIds(): string[] {
    return Array.from(this.documents.keys());
  }

  /**
   * Save vector store to disk
   */
  save(): void {
    if (!this.persistPath) {
      return;
    }

    try {
      const data = {
        indexName: this.indexName,
        documents: Array.from(this.documents.entries()).map(([id, doc]) => ({
          id,
          content: doc.content,
          embedding: doc.embedding,
          metadata: doc.metadata,
        })),
        timestamp: new Date().toISOString(),
      };

      const dir = path.dirname(this.persistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.persistPath, JSON.stringify(data, null, 2));
      console.log(`💾 Vector store saved: ${this.persistPath}`);
    } catch (error: any) {
      console.error('Failed to save vector store:', error.message);
    }
  }

  /**
   * Load vector store from disk
   */
  load(): void {
    if (!this.persistPath || !fs.existsSync(this.persistPath)) {
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.persistPath, 'utf-8'));

      this.documents.clear();
      for (const doc of data.documents) {
        this.documents.set(doc.id, doc);
      }

      console.log(`📂 Vector store loaded: ${this.documents.size} documents`);
    } catch (error: any) {
      console.error('Failed to load vector store:', error.message);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      indexName: this.indexName,
      documentCount: this.documents.size,
      persistPath: this.persistPath,
      documents: Array.from(this.documents.values()).map(doc => ({
        id: doc.id,
        contentLength: doc.content.length,
        embeddingDims: doc.embedding.length,
        metadata: doc.metadata,
      })),
    };
  }
}

// Singleton instance
const VECTOR_STORE_PATH = path.join(process.cwd(), 'data', 'vector-store.json');
export const vectorStore = new VectorStore('coders-adda', VECTOR_STORE_PATH);
