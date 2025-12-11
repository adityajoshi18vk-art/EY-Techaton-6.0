import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export const chatbotRouter = Router();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Worker Agent Functions
interface AgentResponse {
  reply: string;
  data?: any;
}

async function analyticsAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await axios.get('http://localhost:4000/api/telemetry');
    const data = response.data;
    const avgSpeed = data.vehicles?.[0]?.speed || 0;
    const fuelLevel = data.vehicles?.[0]?.fuelLevel || 0;
    
    return {
      reply: `Based on current analytics: Your vehicle is running at ${avgSpeed} mph with ${fuelLevel}% fuel remaining. Overall system health is ${data.systemHealth || 'good'}.`,
      data: data
    };
  } catch (error) {
    return { reply: 'Analytics data is currently being processed. Please check the Analytics dashboard for detailed insights.' };
  }
}

async function diagnosticsAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await axios.get('http://localhost:4000/api/diagnostics');
    const data = response.data;
    const issues = data.diagnostics?.filter((d: any) => d.severity === 'high') || [];
    
    if (issues.length > 0) {
      return {
        reply: `⚠️ Found ${issues.length} high-priority issue(s): ${issues[0].issue}. I recommend scheduling a diagnostic appointment soon.`,
        data: data
      };
    }
    return {
      reply: '✅ Great news! No critical issues detected. Your vehicle systems are functioning normally.',
      data: data
    };
  } catch (error) {
    return { reply: 'Diagnostic scan is in progress. Check the Diagnostics page for real-time vehicle health status.' };
  }
}

async function bookingAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await axios.get('http://localhost:4000/api/booking');
    const data = response.data;
    const upcoming = data.bookings?.filter((b: any) => ['scheduled', 'confirmed'].includes(b.status)) || [];
    
    if (upcoming.length > 0) {
      const next = upcoming[0];
      return {
        reply: `You have an upcoming ${next.serviceType} appointment on ${next.scheduledDate} at ${next.scheduledTime}. Would you like to modify or book a new service?`,
        data: data
      };
    }
    return {
      reply: 'You have no upcoming appointments. Would you like to book a service? I can help you schedule oil changes, brake service, diagnostics, and more.',
      data: data
    };
  } catch (error) {
    return { reply: 'Visit the Booking page to schedule your service appointment with available time slots and instant confirmation.' };
  }
}

async function outreachAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await axios.get('http://localhost:4000/api/outreach');
    const data = response.data;
    const campaigns = data.campaigns || [];
    
    return {
      reply: `We have ${campaigns.length} active campaigns. Check your inbox for special offers, maintenance reminders, and seasonal promotions.`,
      data: data
    };
  } catch (error) {
    return { reply: 'Stay tuned for exclusive service offers and maintenance reminders via email and notifications.' };
  }
}

async function feedbackAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await axios.get('http://localhost:4000/api/feedback');
    const data = response.data;
    const avgRating = data.summary?.averageRating || 0;
    
    return {
      reply: `Our service has an average rating of ${avgRating}/5 stars. We value your feedback! You can submit feedback anytime from your dashboard.`,
      data: data
    };
  } catch (error) {
    return { reply: 'We appreciate your feedback! Share your service experience to help us improve and serve you better.' };
  }
}

async function securityAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await axios.get('http://localhost:4000/api/security');
    const data = response.data;
    const events = data.events?.filter((e: any) => e.severity === 'high') || [];
    
    if (events.length > 0) {
      return {
        reply: `Security alert: ${events.length} high-priority event(s) detected. Your data is protected with encryption and multi-factor authentication.`,
        data: data
      };
    }
    return {
      reply: '🔒 Your account is secure. We use bank-level encryption, regular security audits, and strict access controls to protect your data.',
      data: data
    };
  } catch (error) {
    return { reply: 'Your account security is our top priority. We employ industry-standard encryption and monitoring.' };
  }
}

// Intent Detection
function detectIntent(message: string): { intent: string; confidence: number } {
  const msg = message.toLowerCase();
  
  // Booking intents
  if (msg.match(/\b(book|schedule|appointment|reserve)\b/)) {
    return { intent: 'booking', confidence: 0.9 };
  }
  
  // Diagnostics intents
  if (msg.match(/\b(diagnostic|check|problem|issue|error|warning light|health)\b/)) {
    return { intent: 'diagnostics', confidence: 0.85 };
  }
  
  // Analytics intents
  if (msg.match(/\b(analytics|data|stats|performance|fuel|speed|mileage)\b/)) {
    return { intent: 'analytics', confidence: 0.85 };
  }
  
  // Feedback intents
  if (msg.match(/\b(feedback|review|rating|complaint|compliment)\b/)) {
    return { intent: 'feedback', confidence: 0.8 };
  }
  
  // Security intents
  if (msg.match(/\b(security|password|privacy|data protection|account)\b/)) {
    return { intent: 'security', confidence: 0.8 };
  }
  
  // Outreach intents
  if (msg.match(/\b(offer|promotion|discount|campaign|deal)\b/)) {
    return { intent: 'outreach', confidence: 0.75 };
  }
  
  // General/Unknown
  return { intent: 'general', confidence: 0.5 };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface BookingState {
  step: 'service' | 'date' | 'time' | 'contact' | 'confirm';
  serviceType?: string;
  date?: string;
  time?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleInfo?: string;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  startTime: string;
  lastActivity: string;
  bookingState?: BookingState;
}

const chatSessions: Map<string, ChatSession> = new Map();

const chatMessageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
});

// Service options for booking
const serviceOptions = [
  { value: 'Oil Change', price: '$49-89' },
  { value: 'Brake Service', price: '$199-450' },
  { value: 'Tire Rotation', price: '$25-50' },
  { value: 'Diagnostic Scan', price: '$89' },
  { value: 'General Maintenance', price: '$99-299' },
  { value: 'Engine Repair', price: 'Quote Required' }
];

const timeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'];

// Interactive booking handler
function handleBookingFlow(userMessage: string, session: ChatSession): { content: string; options?: string[]; requiresInput?: string } {
  const message = userMessage.toLowerCase().trim();
  
  if (!session.bookingState) {
    // Start new booking
    session.bookingState = { step: 'service' };
    return {
      content: 'Great! I\'ll help you book a service appointment. 🚗\n\nWhat type of service do you need?',
      options: serviceOptions.map(s => `${s.value} (${s.price})`),
    };
  }
  
  const state = session.bookingState;
  
  // Process based on current step
  switch (state.step) {
    case 'service':
      // Find matching service
      const selectedService = serviceOptions.find(s => 
        message.includes(s.value.toLowerCase()) || 
        s.value.toLowerCase().includes(message)
      );
      
      if (selectedService) {
        state.serviceType = selectedService.value;
        state.step = 'date';
        
        const today = new Date();
        const availableDates = [];
        for (let i = 1; i <= 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          availableDates.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        }
        
        return {
          content: `Perfect! ${selectedService.value} selected.\n\nWhen would you like to schedule your appointment?`,
          options: availableDates,
        };
      }
      return {
        content: 'I didn\'t quite catch that. Please choose from the service options above.',
        options: serviceOptions.map(s => `${s.value} (${s.price})`),
      };
      
    case 'date':
      // Accept any reasonable date input
      state.date = userMessage;
      state.step = 'time';
      
      return {
        content: `Great! Date set for ${userMessage}.\n\nWhat time works best for you?`,
        options: timeSlots,
      };
      
    case 'time':
      // Accept time selection
      state.time = userMessage;
      state.step = 'contact';
      
      return {
        content: `Appointment time: ${userMessage} ✓\n\nNow I need your contact information.\n\nPlease provide your full name:`,
        requiresInput: 'name',
      };
      
    case 'contact':
      // Collect contact info step by step
      if (!state.customerName) {
        state.customerName = userMessage;
        return {
          content: `Thanks, ${userMessage}! 👍\n\nWhat's your email address?`,
          requiresInput: 'email',
        };
      }
      
      if (!state.customerEmail) {
        if (message.includes('@') && message.includes('.')) {
          state.customerEmail = userMessage;
          return {
            content: `Email saved: ${userMessage} ✓\n\nPlease provide your phone number:`,
            requiresInput: 'phone',
          };
        }
        return {
          content: 'Please provide a valid email address (e.g., john@example.com):',
          requiresInput: 'email',
        };
      }
      
      if (!state.customerPhone) {
        state.customerPhone = userMessage;
        return {
          content: `Phone number saved: ${userMessage} ✓\n\nFinally, please provide your vehicle information (Make, Model, Year):\n\nExample: "Toyota Camry 2020"`,
          requiresInput: 'vehicle',
        };
      }
      
      if (!state.vehicleInfo) {
        state.vehicleInfo = userMessage;
        state.step = 'confirm';
        
        return {
          content: `Perfect! Here's your booking summary:\n\n📋 **Booking Details**\n` +
            `• Service: ${state.serviceType}\n` +
            `• Date: ${state.date}\n` +
            `• Time: ${state.time}\n` +
            `• Name: ${state.customerName}\n` +
            `• Email: ${state.customerEmail}\n` +
            `• Phone: ${state.customerPhone}\n` +
            `• Vehicle: ${state.vehicleInfo}\n\n` +
            `Type "CONFIRM" to complete your booking, or "CANCEL" to start over.`,
          options: ['CONFIRM', 'CANCEL'],
        };
      }
      break;
      
    case 'confirm':
      if (message === 'confirm') {
        // Create booking via API
        const bookingData = {
          serviceType: state.serviceType,
          scheduledDate: state.date,
          scheduledTime: state.time,
          customerName: state.customerName,
          customerEmail: state.customerEmail,
          customerPhone: state.customerPhone,
          vehicleInfo: state.vehicleInfo,
          status: 'scheduled',
        };
        
        // Reset booking state
        delete session.bookingState;
        
        // Attempt to save to database
        axios.post('http://localhost:4000/api/booking', bookingData)
          .then(() => console.log('✅ Booking saved to database'))
          .catch(err => console.error('❌ Booking save failed:', err.message));
        
        return {
          content: `🎉 Booking confirmed! Your ${state.serviceType} appointment is scheduled for ${state.date} at ${state.time}.\n\n` +
            `You'll receive a confirmation email at ${state.customerEmail}. We look forward to serving you!\n\n` +
            `You can view your bookings in the "Bookings" section of your dashboard.`,
        };
      }
      
      if (message === 'cancel') {
        delete session.bookingState;
        return {
          content: 'Booking cancelled. Feel free to start a new booking anytime by saying "book a service".',
        };
      }
      
      return {
        content: 'Please type "CONFIRM" to complete your booking, or "CANCEL" to start over.',
        options: ['CONFIRM', 'CANCEL'],
      };
  }
  
  return {
    content: 'Something went wrong. Let\'s start over. Type "book" to begin a new appointment.',
  };
}

// Knowledge base for automotive queries
const knowledgeBase: Record<string, string> = {
  'oil change': 'For most vehicles, an oil change is recommended every 5,000-7,500 miles or every 6 months. However, check your owner\'s manual for specific recommendations.',
  'tire pressure': 'Proper tire pressure is typically between 30-35 PSI for most vehicles. Check the sticker on your driver\'s door jamb for exact specifications.',
  'brake service': 'Brake pads typically need replacement every 30,000-70,000 miles. Warning signs include squeaking, grinding noises, or longer stopping distances.',
  'battery': 'Car batteries typically last 3-5 years. Signs of a failing battery include slow engine cranking, dimming lights, or the battery warning light.',
  'engine light': 'The check engine light can indicate various issues. Common causes include loose gas cap, faulty oxygen sensor, or catalytic converter issues. Get a diagnostic scan.',
  'maintenance schedule': 'Regular maintenance includes oil changes every 5,000-7,500 miles, tire rotation every 6,000-8,000 miles, and major service at 30,000, 60,000, and 90,000 miles.',
  'diagnostics': 'Our AI-powered diagnostics can detect issues before they become serious. Check the Diagnostics page for your vehicle\'s health status.',
  'warranty': 'Most repairs come with a 12-month/12,000-mile warranty. Extended warranties are available. Contact us for details about your specific vehicle.',
  'cost': 'Service costs vary by vehicle and service type. Oil changes start at $49, brake service at $199, and diagnostic scans at $89. Get a free estimate online.',
};

async function generateResponse(
  userMessage: string, 
  conversationHistory: ChatMessage[] = [], 
  session?: ChatSession
): Promise<{ content: string; intent?: string; action?: { type: string; path?: string }; actions?: string[]; options?: string[]; requiresInput?: string }> {
  const message = userMessage.toLowerCase();
  
  // Check if user is in an active booking flow
  if (session?.bookingState) {
    const bookingResponse = handleBookingFlow(userMessage, session);
    return {
      ...bookingResponse,
      intent: 'booking',
      actions: ['interactive_booking']
    };
  }
  
  // Detect intent
  const { intent, confidence } = detectIntent(message);
  console.log(`🎯 Detected intent: ${intent} (confidence: ${confidence})`);
  
  // Check for booking-related queries - start interactive booking
  if (intent === 'booking') {
    if (session) {
      const bookingResponse = handleBookingFlow(userMessage, session);
      return {
        ...bookingResponse,
        intent: 'booking',
        actions: ['start_interactive_booking']
      };
    }
    return {
      content: 'I can help you book an appointment! Let me start the booking process...',
      intent: 'booking',
      actions: ['booking_intent']
    };
  }
  
  // Route to worker agents based on intent
  if (confidence >= 0.75) {
    try {
      let agentResponse: AgentResponse;
      
      switch (intent) {
        case 'analytics':
          agentResponse = await analyticsAgent(message);
          break;
        case 'diagnostics':
          agentResponse = await diagnosticsAgent(message);
          break;
        case 'feedback':
          agentResponse = await feedbackAgent(message);
          break;
        case 'security':
          agentResponse = await securityAgent(message);
          break;
        case 'outreach':
          agentResponse = await outreachAgent(message);
          break;
        default:
          agentResponse = { reply: '' };
      }
      
      if (agentResponse.reply) {
        return {
          content: agentResponse.reply,
          intent,
          actions: [`${intent}_query`]
        };
      }
    } catch (error) {
      console.error(`Worker agent error (${intent}):`, error);
    }
  }
  
  // Use Gemini API as fallback if available
  if (genAI && confidence < 0.75) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      });
      
      // Build context from conversation history
      const context = conversationHistory.length > 0
        ? conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')
        : '';
      
      const systemPrompt = `You are an automotive service assistant. Respond concisely in 2-3 sentences.

Help with: maintenance, diagnostics, bookings, pricing, vehicle issues.

Service pricing: Oil Change $49-89, Brake Service $199-450, Tire Rotation $25-50, Diagnostic $89.

${context ? 'Context:\n' + context + '\n' : ''}

Question: ${userMessage}

Keep response under 100 words. Only provide information you can verify.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      return { 
        content: text,
        intent: 'general',
        actions: ['llm_fallback']
      };
    } catch (error) {
      console.error('Gemini API error:', error);
    }
  }
  
  // Fallback to knowledge base if Gemini not available
  for (const [key, response] of Object.entries(knowledgeBase)) {
    if (message.includes(key)) {
      return { content: response };
    }
  }
  
  // Smart pattern matching fallback
  if (message.includes('hello') || message.includes('hi')) {
    return { content: 'Hello! I\'m your AI automotive assistant. I can help with maintenance questions, service bookings, diagnostics, and more. How can I assist you today?' };
  }
  
  if (message.includes('help')) {
    return { content: 'I can assist with:\n• Maintenance schedules and recommendations\n• Service booking information\n• Vehicle diagnostics\n• Repair cost estimates\n• Tire and brake service\n• Engine issues\n\nWhat would you like to know?' };
  }
  
  if (message.includes('thank')) {
    return { content: 'You\'re welcome! Feel free to ask if you have any other questions about your vehicle or our services.' };
  }
  
  if (message.includes('price') || message.includes('how much')) {
    return { content: 'Service pricing varies by vehicle and service type. Common services:\n• Oil Change: $49-89\n• Brake Service: $199-450\n• Tire Rotation: $25-50\n• Diagnostic Scan: $89\n\nVisit our Service Booking page for detailed quotes.' };
  }
  
  // Default response
  return { content: 'I\'m here to help with automotive service questions. You can ask me about:\n• Maintenance schedules\n• Service costs\n• Booking appointments\n• Vehicle diagnostics\n• Common repairs\n\nWhat would you like to know?' };
}

// POST /api/chatbot - Send message and get response
chatbotRouter.post('/chatbot', async (req: Request, res: Response) => {
  try {
    const validated = chatMessageSchema.parse(req.body);
    
    // Get or create session
    let sessionId = validated.sessionId || `session-${Date.now()}`;
    let session = chatSessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        messages: [],
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      chatSessions.set(sessionId, session);
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: validated.message,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMessage);
    
    // Generate AI response with session context
    const response = await generateResponse(validated.message, session.messages, session);
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(assistantMessage);
    
    session.lastActivity = new Date().toISOString();
    
    // Save chat history to database (async, don't wait)
    const customerInfo = validated.customerName || validated.customerEmail || 'Guest';
    axios.post('http://localhost:4000/api/chat-history', {
      sessionId: session.sessionId,
      customerId: validated.customerId,
      customerName: validated.customerName || 'Guest User',
      customerEmail: validated.customerEmail || 'guest@example.com',
      messages: session.messages.map(msg => ({
        ...msg,
        intent: response.intent,
        bookingCreated: response.intent === 'booking' && msg.content.includes('confirmed'),
      })),
      startTime: session.startTime,
      lastActivity: session.lastActivity,
      status: session.bookingState ? 'active' : 'completed',
    }).catch(err => console.error('Failed to save chat history:', err.message));
    
    res.json({
      success: true,
      sessionId,
      message: assistantMessage,
      conversationHistory: session.messages,
      intent: response.intent,
      action: response.action,
      actions: response.actions,
      options: response.options,
      requiresInput: response.requiresInput
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid message data', details: error.errors });
    }
    throw error;
  }
});

// GET /api/chatbot/history/:sessionId - Get chat history
chatbotRouter.get('/chatbot/history/:sessionId', (req: Request, res: Response) => {
  const session = chatSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: session.sessionId,
    messages: session.messages,
    startTime: session.startTime,
    lastActivity: session.lastActivity,
  });
});

// GET /api/chatbot/stats - Get chatbot statistics
chatbotRouter.get('/chatbot/stats', (req: Request, res: Response) => {
  const totalSessions = chatSessions.size;
  const totalMessages = Array.from(chatSessions.values()).reduce(
    (sum, session) => sum + session.messages.length,
    0
  );
  
  const activeSessions = Array.from(chatSessions.values()).filter(
    (session) => Date.now() - new Date(session.lastActivity).getTime() < 3600000 // Active in last hour
  ).length;
  
  res.json({
    totalSessions,
    totalMessages,
    activeSessions,
    averageMessagesPerSession: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : 0,
  });
});

// DELETE /api/chatbot/session/:sessionId - Clear session
chatbotRouter.delete('/chatbot/session/:sessionId', (req: Request, res: Response) => {
  const deleted = chatSessions.delete(req.params.sessionId);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({ success: true, message: 'Session cleared' });
});
