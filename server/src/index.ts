import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { masterRouter } from './routes/master';
import { telemetryRouter } from './routes/telemetry';
import { diagnosticsRouter } from './routes/diagnostics';
import { outreachRouter } from './routes/outreach';
import { bookingRouter } from './routes/booking';
import { feedbackRouter } from './routes/feedback';
import { securityRouter } from './routes/security';
import { presenceRouter } from './routes/presence';
import { authRouter } from './routes/auth';
import { chatbotRouter } from './routes/chatbot';
import { inboxRouter, generateAutoNotifications } from './routes/inbox';
import { chatHistoryRouter } from './routes/chatHistory';
import { reindexRouter } from './routes/reindex';
import { connectDB } from './db/mongodb';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', masterRouter);
app.use('/api', telemetryRouter);
app.use('/api', diagnosticsRouter);
app.use('/api', outreachRouter);
app.use('/api', bookingRouter);
app.use('/api', feedbackRouter);
app.use('/api', securityRouter);
app.use('/api', presenceRouter);
app.use('/api', authRouter);
app.use('/api', chatbotRouter);
app.use('/api', inboxRouter);
app.use('/api', chatHistoryRouter);
app.use('/api', reindexRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Master Agent orchestrator active`);
      console.log(`🤖 6 Worker AI Agents ready + AI Chatbot for customers`);
      
      // Generate auto-notifications every hour
      setInterval(() => {
        generateAutoNotifications().catch(console.error);
      }, 60 * 60 * 1000);
      
      // Generate on startup
      generateAutoNotifications().catch(console.error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
