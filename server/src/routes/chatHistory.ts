import { Router, Request, Response } from 'express';
import { getDB } from '../db/mongodb';
import { z } from 'zod';

export const chatHistoryRouter = Router();

// Validation schemas
const saveChatSchema = z.object({
  sessionId: z.string(),
  customerId: z.string().optional(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
    intent: z.string().optional(),
    bookingCreated: z.boolean().optional(),
  })),
  startTime: z.string(),
  lastActivity: z.string(),
  status: z.enum(['active', 'completed']).default('completed'),
});

// GET /api/chat-history - Get all chat histories (for employees)
chatHistoryRouter.get('/chat-history', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const collection = db.collection('chatHistory');
    
    const { customerId, customerEmail, status, limit = '50' } = req.query;
    
    const filter: any = {};
    if (customerId) filter.customerId = customerId;
    if (customerEmail) filter.customerEmail = customerEmail;
    if (status) filter.status = status;
    
    const histories = await collection
      .find(filter)
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit as string))
      .toArray();
    
    res.json({
      success: true,
      histories,
      count: histories.length,
    });
  } catch (error) {
    console.error('Error fetching chat histories:', error);
    res.status(500).json({ error: 'Failed to fetch chat histories' });
  }
});

// GET /api/chat-history/:sessionId - Get specific chat history
chatHistoryRouter.get('/chat-history/:sessionId', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const collection = db.collection('chatHistory');
    
    const history = await collection.findOne({ sessionId: req.params.sessionId });
    
    if (!history) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    
    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat-history - Save or update chat history
chatHistoryRouter.post('/chat-history', async (req: Request, res: Response) => {
  try {
    const validated = saveChatSchema.parse(req.body);
    
    const db = await getDB();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const collection = db.collection('chatHistory');
    
    const chatHistory = {
      ...validated,
      updatedAt: new Date().toISOString(),
      messageCount: validated.messages.length,
    };
    
    // Upsert: update if exists, create if not
    const result = await collection.updateOne(
      { sessionId: validated.sessionId },
      { $set: chatHistory },
      { upsert: true }
    );
    
    console.log(`💾 Chat history ${result.upsertedId ? 'created' : 'updated'} for session: ${validated.sessionId}`);
    
    res.json({
      success: true,
      message: result.upsertedId ? 'Chat history created' : 'Chat history updated',
      sessionId: validated.sessionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error saving chat history:', error);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

// DELETE /api/chat-history/:sessionId - Delete chat history
chatHistoryRouter.delete('/chat-history/:sessionId', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const collection = db.collection('chatHistory');
    
    const result = await collection.deleteOne({ sessionId: req.params.sessionId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    
    res.json({
      success: true,
      message: 'Chat history deleted',
    });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
});

// GET /api/chat-history/stats/summary - Get chat statistics
chatHistoryRouter.get('/chat-history/stats/summary', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const collection = db.collection('chatHistory');
    
    const totalChats = await collection.countDocuments();
    const activeChats = await collection.countDocuments({ status: 'active' });
    const completedChats = await collection.countDocuments({ status: 'completed' });
    
    // Get average messages per chat
    const allChats = await collection.find().toArray();
    const totalMessages = allChats.reduce((sum: number, chat: any) => sum + (chat.messageCount || 0), 0);
    const avgMessagesPerChat = totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : 0;
    
    // Get recent activity
    const recentChats = await collection
      .find()
      .sort({ lastActivity: -1 })
      .limit(5)
      .toArray();
    
    res.json({
      success: true,
      stats: {
        totalChats,
        activeChats,
        completedChats,
        totalMessages,
        avgMessagesPerChat,
        recentChats: recentChats.map((chat: any) => ({
          sessionId: chat.sessionId,
          customerName: chat.customerName,
          customerEmail: chat.customerEmail,
          messageCount: chat.messageCount,
          lastActivity: chat.lastActivity,
          status: chat.status,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ error: 'Failed to fetch chat statistics' });
  }
});
