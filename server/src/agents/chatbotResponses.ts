/**
 * Predefined chatbot responses with intent, keywords, and actions
 * Used for fast keyword matching and fine-tuning data generation
 */

export interface PredefinedResponse {
  intent: string;
  keywords: string[];
  reply: string;
  actions?: Array<{
    type: 'navigate' | 'offer_booking' | 'run_diagnostics' | 'show_report';
    payload?: any;
  }>;
  category?: string;
  priority?: number;
}

export const predefinedResponses: PredefinedResponse[] = [
  // Booking Intent
  {
    intent: 'booking',
    keywords: ['book', 'schedule', 'appointment', 'reserve', 'booking'],
    reply: 'I can help you book a service appointment. What type of service do you need? We offer oil changes, brake service, tire rotation, diagnostics, and more.',
    actions: [{ type: 'offer_booking' }],
    category: 'booking',
    priority: 1,
  },
  {
    intent: 'booking_confirmation',
    keywords: ['confirm booking', 'confirm appointment', 'yes book'],
    reply: 'Great! Let me help you complete your booking. What service would you like to schedule?',
    actions: [{ type: 'offer_booking' }],
    category: 'booking',
    priority: 1,
  },

  // Diagnostics Intent
  {
    intent: 'diagnostics',
    keywords: ['diagnostic', 'check', 'problem', 'issue', 'error', 'warning light', 'malfunction'],
    reply: 'I can help check your vehicle for issues. Would you like me to run a diagnostic scan? Our AI-powered diagnostics can detect problems early.',
    actions: [{ type: 'run_diagnostics' }, { type: 'navigate', payload: { path: '/customer-dashboard' } }],
    category: 'diagnostics',
    priority: 1,
  },
  {
    intent: 'check_engine_light',
    keywords: ['check engine', 'engine light', 'warning light', 'dashboard light'],
    reply: 'The check engine light can indicate various issues from a loose gas cap to serious engine problems. I recommend scheduling a diagnostic scan to identify the exact cause. Would you like to book a diagnostic appointment?',
    actions: [{ type: 'offer_booking', payload: { serviceType: 'Diagnostic Scan' } }],
    category: 'diagnostics',
    priority: 2,
  },

  // Oil Change
  {
    intent: 'oil_change',
    keywords: ['oil change', 'oil service', 'engine oil', 'oil replacement'],
    reply: 'For most vehicles, an oil change is recommended every 5,000-7,500 miles or every 6 months. Our oil change service costs $49-89 and includes a 23-point inspection. Would you like to schedule one?',
    actions: [{ type: 'offer_booking', payload: { serviceType: 'Oil Change' } }],
    category: 'maintenance',
    priority: 2,
  },

  // Brake Service
  {
    intent: 'brake_service',
    keywords: ['brake', 'brakes', 'brake pad', 'brake service', 'squeaking brake'],
    reply: 'Brake service is crucial for safety. Warning signs include squeaking, grinding, or longer stopping distances. Our brake service costs $199-450 depending on the service needed. Would you like to schedule a brake inspection?',
    actions: [{ type: 'offer_booking', payload: { serviceType: 'Brake Service' } }],
    category: 'maintenance',
    priority: 2,
  },

  // Tire Service
  {
    intent: 'tire_service',
    keywords: ['tire', 'tires', 'tire rotation', 'tire pressure', 'wheel alignment'],
    reply: 'Proper tire maintenance improves safety and fuel economy. Tire rotation costs $25-50 and should be done every 6,000-8,000 miles. Tire pressure should be 30-35 PSI for most vehicles. Need tire service?',
    actions: [{ type: 'offer_booking', payload: { serviceType: 'Tire Rotation' } }],
    category: 'maintenance',
    priority: 2,
  },

  // Battery
  {
    intent: 'battery',
    keywords: ['battery', 'car battery', 'battery dead', 'battery replacement', 'won\'t start'],
    reply: 'Car batteries typically last 3-5 years. Signs of a failing battery include slow cranking, dimming lights, or the battery warning light. We can test your battery for free. Would you like to schedule a battery check?',
    actions: [{ type: 'offer_booking', payload: { serviceType: 'Battery Service' } }],
    category: 'maintenance',
    priority: 2,
  },

  // Pricing
  {
    intent: 'pricing',
    keywords: ['price', 'cost', 'how much', 'expensive', 'fee', 'charge'],
    reply: 'Our service pricing varies by vehicle and service type:\n• Oil Change: $49-89\n• Brake Service: $199-450\n• Tire Rotation: $25-50\n• Diagnostic Scan: $89\n• General Maintenance: $99-299\n\nWould you like a detailed quote for a specific service?',
    category: 'pricing',
    priority: 1,
  },

  // Hours/Location
  {
    intent: 'hours',
    keywords: ['hours', 'open', 'closed', 'location', 'where', 'address'],
    reply: 'We\'re open Monday-Friday 8AM-6PM and Saturday 9AM-4PM. Our location and contact details are available in your dashboard. Need directions or want to schedule an appointment?',
    category: 'information',
    priority: 2,
  },

  // Warranty
  {
    intent: 'warranty',
    keywords: ['warranty', 'guarantee', 'coverage', 'protected'],
    reply: 'Most repairs come with a 12-month/12,000-mile warranty. Extended warranties are available for major repairs. Specific warranty details vary by service. Would you like more information about warranty coverage?',
    category: 'information',
    priority: 2,
  },

  // Analytics/Reports
  {
    intent: 'analytics',
    keywords: ['analytics', 'report', 'data', 'stats', 'performance', 'fuel economy', 'mileage'],
    reply: 'You can view detailed vehicle analytics including fuel economy, mileage, and performance metrics in your dashboard. Would you like me to show you your vehicle report?',
    actions: [{ type: 'show_report' }, { type: 'navigate', payload: { path: '/customer-dashboard' } }],
    category: 'analytics',
    priority: 1,
  },

  // Feedback
  {
    intent: 'feedback',
    keywords: ['feedback', 'review', 'rating', 'complaint', 'compliment', 'satisfied'],
    reply: 'We value your feedback! Our service has an average rating of 4.5/5 stars. You can submit feedback anytime from your dashboard. How was your experience with us?',
    category: 'feedback',
    priority: 2,
  },

  // Security/Account
  {
    intent: 'security',
    keywords: ['security', 'password', 'account', 'privacy', 'data', 'safe', 'secure'],
    reply: '🔒 Your account is protected with bank-level encryption, multi-factor authentication, and regular security audits. We never share your data without permission. Need help with your account security?',
    category: 'security',
    priority: 2,
  },

  // Promotions
  {
    intent: 'promotions',
    keywords: ['promotion', 'discount', 'deal', 'offer', 'special', 'coupon'],
    reply: 'We have several active promotions! Check your inbox for exclusive offers, seasonal discounts, and maintenance packages. Would you like to see our current deals?',
    actions: [{ type: 'navigate', payload: { path: '/customer-dashboard/inbox' } }],
    category: 'outreach',
    priority: 2,
  },

  // Greeting
  {
    intent: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    reply: 'Hello! I\'m your AI automotive assistant. I can help with maintenance questions, service bookings, diagnostics, and more. How can I assist you today?',
    category: 'general',
    priority: 1,
  },

  // Help
  {
    intent: 'help',
    keywords: ['help', 'what can you do', 'how does this work', 'commands'],
    reply: 'I can assist with:\n• Maintenance schedules and recommendations\n• Service booking\n• Vehicle diagnostics\n• Pricing and estimates\n• Tire and brake service\n• Engine issues\n• Account and security\n\nWhat would you like to know?',
    category: 'general',
    priority: 1,
  },

  // Thank you
  {
    intent: 'thanks',
    keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
    reply: 'You\'re welcome! Feel free to ask if you have any other questions about your vehicle or our services. I\'m here to help!',
    category: 'general',
    priority: 3,
  },

  // Goodbye
  {
    intent: 'goodbye',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'exit'],
    reply: 'Goodbye! Drive safely, and don\'t hesitate to reach out if you need anything. Have a great day!',
    category: 'general',
    priority: 3,
  },
];

/**
 * Find matching response based on keywords
 */
export function findKeywordMatch(query: string): PredefinedResponse | null {
  const lowerQuery = query.toLowerCase();
  
  // Sort by priority (lower number = higher priority)
  const sorted = [...predefinedResponses].sort((a, b) => (a.priority || 99) - (b.priority || 99));
  
  for (const response of sorted) {
    for (const keyword of response.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        return response;
      }
    }
  }
  
  return null;
}

/**
 * Get all responses for a specific category
 */
export function getResponsesByCategory(category: string): PredefinedResponse[] {
  return predefinedResponses.filter(r => r.category === category);
}

/**
 * Get all unique intents
 */
export function getAllIntents(): string[] {
  return Array.from(new Set(predefinedResponses.map(r => r.intent)));
}
