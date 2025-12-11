/**
 * Re-indexing route for triggering vector store updates
 * POST /api/reindex - Trigger document re-indexing
 */

import { Router, Request, Response } from 'express';
import { vectorStore } from '../lib/vectorStore';
import { Document } from '../schemas/chatbot';
import path from 'path';
import fs from 'fs';

export const reindexRouter = Router();

/**
 * Load documents from JSON files
 */
function loadDocumentsFromFiles(docsDir: string): Document[] {
  const documents: Document[] = [];

  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const docs = JSON.parse(content);

    if (Array.isArray(docs)) {
      documents.push(...docs);
    } else {
      documents.push(docs);
    }
  }

  return documents;
}

/**
 * POST /api/reindex - Trigger document re-indexing
 */
reindexRouter.post('/reindex', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting re-indexing process...');

    const startTime = Date.now();
    const docsDir = path.join(process.cwd(), 'data', 'docs');

    // Load documents from files
    const documents = loadDocumentsFromFiles(docsDir);

    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No documents found to index',
      });
    }

    // Clear existing index
    vectorStore.clear();

    // Re-index all documents
    await vectorStore.addDocuments(documents);

    const duration = Date.now() - startTime;

    console.log(`✅ Re-indexing complete in ${duration}ms`);

    res.json({
      success: true,
      message: 'Documents re-indexed successfully',
      stats: {
        documentsIndexed: documents.length,
        duration: `${duration}ms`,
        indexSize: vectorStore.size(),
      },
    });
  } catch (error: any) {
    console.error('Re-indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to re-index documents',
      details: error.message,
    });
  }
});

/**
 * GET /api/reindex/status - Get indexing status
 */
reindexRouter.get('/reindex/status', (req: Request, res: Response) => {
  try {
    const stats = vectorStore.getStats();

    res.json({
      success: true,
      status: 'active',
      stats: {
        indexName: stats.indexName,
        documentCount: stats.documentCount,
        documents: stats.documents.map(doc => ({
          id: doc.id,
          contentLength: doc.contentLength,
          category: doc.metadata?.category,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get index status',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/reindex/clear - Clear vector store
 */
reindexRouter.delete('/reindex/clear', (req: Request, res: Response) => {
  try {
    const previousSize = vectorStore.size();
    vectorStore.clear();

    console.log('🗑️  Vector store cleared');

    res.json({
      success: true,
      message: 'Vector store cleared',
      previousSize,
      currentSize: vectorStore.size(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear vector store',
      details: error.message,
    });
  }
});
