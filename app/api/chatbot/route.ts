import { NextRequest, NextResponse } from 'next/server';
import { detectIntent } from '@/data/chatbotResponses';

/**
 * POST /api/chatbot
 * Handles chatbot message processing with intent detection
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { message } = body;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 500 characters allowed.' },
        { status: 400 }
      );
    }

    // Detect intent and get response
    const result = detectIntent(message);

    // Simulate processing delay for realistic feel (100-300ms)
    const delay = Math.random() * 200 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Return response
    return NextResponse.json({
      reply: result.response,
      intent: result.intent,
      category: result.category,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chatbot
 * Returns API information and health check
 */
export async function GET() {
  return NextResponse.json({
    service: 'Coders Adda Chatbot API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      POST: '/api/chatbot - Send message and receive response'
    },
    categories: [
      'Vehicle Health',
      'Predictive Maintenance',
      'Service Booking',
      'Diagnostics',
      'Alerts',
      'Security',
      'Analytics',
      'Communication',
      'Platform Help',
      'General'
    ]
  });
}
