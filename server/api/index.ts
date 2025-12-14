import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { connectDB } from '../src/db/mongodb';
import { chatbotRouter } from '../src/routes/chatbot';
import { chatHistoryRouter } from '../src/routes/chatHistory';
import { authRouter } from '../src/routes/auth';
import { bookingRouter } from '../src/routes/booking';
import { feedbackRouter } from '../src/routes/feedback';
import { inboxRouter } from '../src/routes/inbox';
import { telemetryRouter } from '../src/routes/telemetry';
import { diagnosticsRouter } from '../src/routes/diagnostics';
import { outreachRouter } from '../src/routes/outreach';
import { securityRouter } from '../src/routes/security';
import { masterRouter } from '../src/routes/master';
import { presenceRouter } from '../src/routes/presence';
import { reindexRouter } from '../src/routes/reindex';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EY Automotive AI API', 
    version: '1.0.0',
    endpoints: [
      '/api/chatbot',
      '/api/chat-history',
      '/api/login',
      '/api/booking',
      '/api/feedback',
      '/api/inbox',
      '/api/telemetry',
      '/api/diagnostics',
      '/api/outreach',
      '/api/security',
      '/api/master',
      '/api/presence',
      '/api/reindex'
    ]
  });
});

// Routes
app.use('/api', chatbotRouter);
app.use('/api', chatHistoryRouter);
app.use('/api', authRouter);
app.use('/api', bookingRouter);
app.use('/api', feedbackRouter);
app.use('/api', inboxRouter);
app.use('/api', telemetryRouter);
app.use('/api', diagnosticsRouter);
app.use('/api', outreachRouter);
app.use('/api', securityRouter);
app.use('/api', masterRouter);
app.use('/api', presenceRouter);
app.use('/api', reindexRouter);

// Initialize DB connection once
let dbConnected = false;
async function initDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initDB();
    return app(req as any, res as any);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
