import { Router, Request, Response } from 'express';
import { getDB, isMongoConnected } from '../db/mongodb';
import { ObjectId } from 'mongodb';

export const feedbackRouter = Router();

interface Feedback {
  _id?: ObjectId;
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  rating: number;
  category: 'service-quality' | 'timeliness' | 'communication' | 'pricing' | 'overall';
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
  resolved: boolean;
  responseText?: string;
}

// In-memory fallback storage
const memoryFeedback: Feedback[] = [];

// GET /api/feedback - Get all feedback
feedbackRouter.get('/feedback', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const sentiment = req.query.sentiment as string | undefined;
    const resolved = req.query.resolved as string | undefined;
    
    let allFeedback: Feedback[];
    let feedback: Feedback[];
    
    if (db && isMongoConnected()) {
      // Use MongoDB
      const collection = db.collection<Feedback>('feedback');
      const filter: any = {};
      if (sentiment) filter.sentiment = sentiment;
      if (resolved !== undefined) filter.resolved = resolved === 'true';
      
      feedback = await collection.find(filter).sort({ timestamp: -1 }).toArray();
      allFeedback = await collection.find().toArray();
    } else {
      // Use in-memory storage
      allFeedback = memoryFeedback;
      feedback = memoryFeedback.filter(f => {
        if (sentiment && f.sentiment !== sentiment) return false;
        if (resolved !== undefined && f.resolved !== (resolved === 'true')) return false;
        return true;
      });
    }
    
    const averageRating = allFeedback.length > 0
      ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(2)
      : '0';
    
    res.json({
      feedback,
      summary: {
        total: allFeedback.length,
        averageRating: parseFloat(averageRating),
        positive: allFeedback.filter(f => f.sentiment === 'positive').length,
        neutral: allFeedback.filter(f => f.sentiment === 'neutral').length,
        negative: allFeedback.filter(f => f.sentiment === 'negative').length,
        resolved: allFeedback.filter(f => f.resolved).length,
        pending: allFeedback.filter(f => !f.resolved).length,
        ratingDistribution: {
          5: allFeedback.filter(f => f.rating === 5).length,
          4: allFeedback.filter(f => f.rating === 4).length,
          3: allFeedback.filter(f => f.rating === 3).length,
          2: allFeedback.filter(f => f.rating === 2).length,
          1: allFeedback.filter(f => f.rating === 1).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET /api/feedback/trends - Get feedback trends
feedbackRouter.get('/feedback/trends', (req: Request, res: Response) => {
  res.json({
    overallSatisfaction: 4.2,
    trend: 'improving',
    monthlyAverages: [
      { month: 'Jan', rating: 3.8 },
      { month: 'Feb', rating: 4.0 },
      { month: 'Mar', rating: 4.2 },
      { month: 'Apr', rating: 4.3 },
      { month: 'May', rating: 4.2 }
    ],
    topIssues: [
      { issue: 'Wait time', count: 12 },
      { issue: 'Communication', count: 8 },
      { issue: 'Pricing clarity', count: 5 }
    ],
    topPraise: [
      { praise: 'Professional staff', count: 45 },
      { praise: 'Quality work', count: 38 },
      { praise: 'Fast service', count: 32 }
    ]
  });
});

// POST /api/feedback - Submit new feedback
feedbackRouter.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { rating, comment, customerName, customerEmail } = req.body;
    const db = await getDB();
    
    console.log('📝 Feedback submission received:', { customerName, customerEmail, rating });
    
    let count = 0;
    if (db && isMongoConnected()) {
      const collection = db.collection<Feedback>('feedback');
      count = await collection.countDocuments();
    } else {
      count = memoryFeedback.length;
    }
    
    const newFeedback: Feedback = {
      id: `F${String(count + 1).padStart(3, '0')}`,
      customerId: 'C001',
      customerName: customerName || 'John Customer',
      customerEmail: customerEmail || 'customer@example.com',
      bookingId: `B${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
      rating: rating || 5,
      category: 'overall',
      comment: comment || '',
      sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    if (db && isMongoConnected()) {
      // Save to MongoDB
      const collection = db.collection<Feedback>('feedback');
      const result = await collection.insertOne(newFeedback);
      console.log('✅ Feedback saved to MongoDB:', result.insertedId);
    } else {
      // Save to in-memory storage
      memoryFeedback.unshift(newFeedback);
      console.log('✅ Feedback saved to memory (total:', memoryFeedback.length, ')');
    }
    
    res.json({
      success: true,
      feedback: newFeedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});
