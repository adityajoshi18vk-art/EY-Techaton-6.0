/**
 * Coders Adda - Automotive Intelligence Chatbot
 * Predefined responses for automotive and platform-related queries
 */

export interface ChatbotResponse {
  intent: string;
  keywords: string[];
  response: string;
  category: string;
}

export const chatbotResponses: ChatbotResponse[] = [
  // 1. Vehicle Health Issues
  {
    intent: "engine_problem",
    keywords: ["engine", "motor", "starting", "won't start", "stalling", "noise", "knocking", "misfiring"],
    category: "Vehicle Health",
    response: "Engine issues detected. Common causes include: battery problems, fuel system issues, or spark plug failures. I recommend scheduling an immediate diagnostic check. Our AI system can analyze your vehicle's OBD data to pinpoint the exact issue. Would you like to book a service appointment?"
  },
  {
    intent: "brake_issue",
    keywords: ["brake", "braking", "squeaking", "grinding", "stopping", "pedal", "abs"],
    category: "Vehicle Health",
    response: "Brake system concerns require immediate attention for safety. Common symptoms include squeaking (worn pads), grinding (metal-on-metal contact), or soft pedal (fluid leak). Our platform monitors brake pad thickness and fluid levels. I recommend an urgent brake inspection. Shall I schedule one for you?"
  },
  {
    intent: "battery_problem",
    keywords: ["battery", "dead", "charging", "alternator", "electrical", "power", "jump start"],
    category: "Vehicle Health",
    response: "Battery and electrical system issues can leave you stranded. Typical signs include slow cranking, dim lights, or electrical failures. Our system tracks battery voltage and charging patterns. Average battery life is 3-5 years. Would you like me to run a battery health diagnostic or schedule a replacement?"
  },
  {
    intent: "overheating",
    keywords: ["overheating", "temperature", "coolant", "radiator", "hot", "steam", "heat"],
    category: "Vehicle Health",
    response: "Engine overheating is a critical issue that can cause severe damage. Common causes: low coolant, thermostat failure, or radiator problems. Stop driving immediately if the temperature gauge is in the red zone. Our system can check your coolant levels and temperature history. Need emergency roadside assistance?"
  },
  {
    intent: "transmission",
    keywords: ["transmission", "shifting", "gears", "clutch", "slipping", "automatic", "manual"],
    category: "Vehicle Health",
    response: "Transmission problems can be complex and costly if ignored. Symptoms include rough shifting, slipping gears, or delayed engagement. Our predictive system monitors transmission fluid temperature and shift patterns. Early detection saves thousands in repairs. Should I create a service ticket?"
  },

  // 2. Predictive Maintenance
  {
    intent: "predictive_maintenance",
    keywords: ["maintenance", "service due", "when to service", "predict", "schedule", "upcoming", "recommended"],
    category: "Predictive Maintenance",
    response: "Our AI-powered predictive maintenance system analyzes your vehicle's usage patterns, mileage, and component wear. Based on your current data, I can forecast service needs 30-60 days in advance. This prevents breakdowns and extends vehicle life. Would you like to see your personalized maintenance timeline?"
  },
  {
    intent: "oil_change",
    keywords: ["oil change", "oil life", "synthetic", "engine oil", "lubrication", "oil filter"],
    category: "Predictive Maintenance",
    response: "Oil changes are crucial for engine longevity. Based on your driving patterns (mileage, climate, driving style), our system calculates optimal intervals. Synthetic oil typically lasts 7,500-10,000 miles, while conventional is 3,000-5,000 miles. Your next oil change is recommended in approximately [calculated based on data]. Book now?"
  },
  {
    intent: "tire_maintenance",
    keywords: ["tire", "tyre", "rotation", "alignment", "pressure", "tread", "wear", "balance"],
    category: "Predictive Maintenance",
    response: "Tire health impacts safety, fuel efficiency, and handling. Our sensors monitor tire pressure, tread depth, and wear patterns. We recommend: rotation every 6,000-8,000 miles, alignment check annually, and replacement when tread depth falls below 2/32\". Your current tire status shows [data]. Need a tire inspection?"
  },
  {
    intent: "filter_replacement",
    keywords: ["filter", "air filter", "cabin filter", "fuel filter", "replacement"],
    category: "Predictive Maintenance",
    response: "Filters protect your engine and cabin air quality. Air filters should be replaced every 15,000-30,000 miles, cabin filters every 12,000-15,000 miles. Dirty filters reduce performance and fuel economy. Our system tracks filter condition based on usage. Your filters are [status]. Schedule replacement?"
  },

  // 3. Service Booking & Rescheduling
  {
    intent: "book_service",
    keywords: ["book", "appointment", "schedule", "reservation", "service center", "mechanic", "workshop"],
    category: "Service Booking",
    response: "I can help you book a service appointment instantly. Our network includes certified service centers with real-time availability. Please provide: (1) Service type needed, (2) Preferred date/time, (3) Location preference. Average wait time is 2-4 days. Urgent services available within 24 hours. Ready to book?"
  },
  {
    intent: "reschedule_service",
    keywords: ["reschedule", "change appointment", "modify", "cancel", "postpone", "move appointment"],
    category: "Service Booking",
    response: "Need to reschedule? No problem. I can help you modify your appointment with no fees if done 24 hours in advance. Please provide your booking reference number or registered mobile number. I'll show you available alternative slots at your preferred service center. What's your booking ID?"
  },
  {
    intent: "service_status",
    keywords: ["service status", "repair status", "job card", "progress", "ready", "completed"],
    category: "Service Booking",
    response: "Track your service in real-time! Our platform provides live updates as technicians work on your vehicle. Current typical stages: Check-in → Diagnosis → Approval → Repair → Quality Check → Ready for Pickup. Please share your job card number, and I'll fetch the current status immediately."
  },

  // 4. Diagnostic Fault Codes (OBD)
  {
    intent: "obd_codes",
    keywords: ["dtc", "fault code", "error code", "p0", "obd", "check engine", "diagnostic", "trouble code"],
    category: "Diagnostics",
    response: "Diagnostic Trouble Codes (DTCs) help identify specific vehicle issues. Common codes: P0300 (misfire), P0420 (catalytic converter), P0171 (lean fuel mixture). Our OBD-II system reads codes instantly and provides detailed explanations with recommended actions. Share your code (e.g., P0420), and I'll diagnose it."
  },
  {
    intent: "check_engine_light",
    keywords: ["check engine", "warning light", "malfunction indicator", "mil", "cel", "dashboard light"],
    category: "Diagnostics",
    response: "Check Engine Light indicates the OBD system detected an issue. It can range from minor (loose gas cap) to critical (catalytic converter failure). Our platform connects to your vehicle's ECU to read exact codes and severity. Don't ignore it—early diagnosis prevents expensive repairs. Run remote diagnostic now?"
  },
  {
    intent: "scan_vehicle",
    keywords: ["scan", "diagnostic scan", "vehicle scan", "ecu", "computer check", "system check"],
    category: "Diagnostics",
    response: "Comprehensive vehicle scans analyze all electronic systems: engine, transmission, ABS, airbags, and more. Our advanced diagnostic tools identify hidden issues before they become failures. Standard scan takes 5-10 minutes and generates a detailed health report. Would you like to initiate a remote scan via our connected device?"
  },

  // 5. Alerts & Warnings Explanation
  {
    intent: "dashboard_warning",
    keywords: ["warning", "alert", "notification", "dashboard", "indicator", "symbol", "light on"],
    category: "Alerts",
    response: "Dashboard warnings communicate critical information. Key alerts: Red = Stop immediately (oil pressure, temperature), Yellow/Amber = Service soon (maintenance required, tire pressure), Blue/Green = Informational (high beams, cruise control). Which warning light are you seeing? Describe it, and I'll explain what action to take."
  },
  {
    intent: "tire_pressure_warning",
    keywords: ["tpms", "tire pressure", "low pressure", "pressure warning", "tire light"],
    category: "Alerts",
    response: "TPMS (Tire Pressure Monitoring System) alerts indicate under-inflated tires—reducing fuel efficiency, tire life, and safety. Check tire pressures when cold. Recommended pressure is on your driver's door jamb (typically 32-35 PSI). Our system can show real-time pressure for each tire. Need help locating an air station?"
  },
  {
    intent: "maintenance_alert",
    keywords: ["service reminder", "maintenance due", "oil life", "service soon", "maintenance required"],
    category: "Alerts",
    response: "Maintenance reminders are triggered by mileage, time, or system algorithms. They ensure your vehicle stays in optimal condition. Common reminders: oil change, tire rotation, brake inspection. Our platform sends personalized alerts 2 weeks before service due dates. You can view, snooze, or schedule service directly. Check your alerts?"
  },

  // 6. Security & Compliance
  {
    intent: "vehicle_security",
    keywords: ["security", "theft", "alarm", "tracking", "stolen", "immobilizer", "gps"],
    category: "Security",
    response: "Vehicle security features include: GPS tracking, remote immobilization, geofencing alerts, and theft notifications. Our platform monitors 24/7 and sends instant alerts for unauthorized movement. In case of theft, we collaborate with law enforcement for vehicle recovery. Average recovery rate: 85%. Enable advanced security features?"
  },
  {
    intent: "data_privacy",
    keywords: ["privacy", "data security", "personal data", "gdpr", "information", "confidential"],
    category: "Security",
    response: "Your data privacy is paramount. We comply with GDPR, CCPA, and automotive data protection standards. All vehicle data is encrypted end-to-end, stored on secure servers, and never sold to third parties. You control data sharing preferences and can request deletion anytime. View our privacy policy or manage data settings?"
  },
  {
    intent: "compliance",
    keywords: ["compliance", "emissions", "inspection", "certification", "regulations", "smog test"],
    category: "Security",
    response: "We help you stay compliant with emissions standards, safety inspections, and registration requirements. Our system tracks inspection due dates and alerts you 30 days in advance. We can also schedule inspections at certified centers. Non-compliance can result in fines or registration suspension. Check your compliance status?"
  },

  // 7. Data Analytics & Reports
  {
    intent: "vehicle_report",
    keywords: ["report", "analytics", "statistics", "data", "insights", "performance", "history"],
    category: "Analytics",
    response: "Comprehensive vehicle reports provide actionable insights: fuel efficiency trends, driving behavior analysis, maintenance history, cost breakdowns, and component health scores. Reports can be generated weekly, monthly, or on-demand. Export formats: PDF, Excel, CSV. Which report would you like to generate?"
  },
  {
    intent: "fuel_efficiency",
    keywords: ["fuel economy", "mpg", "mileage", "consumption", "gas", "efficiency", "fuel usage"],
    category: "Analytics",
    response: "Track and improve fuel efficiency with our detailed analytics. We monitor: trip-by-trip MPG, driving style impact (acceleration, braking), route efficiency, and cost per mile. Industry average: 25-30 MPG. Your current average: [data]. Recommendations to improve: smooth acceleration, proper tire pressure, regular maintenance. View detailed report?"
  },
  {
    intent: "driving_behavior",
    keywords: ["driving", "behavior", "score", "habits", "style", "safety", "eco-driving"],
    category: "Analytics",
    response: "Your driving behavior impacts safety, fuel costs, and vehicle wear. We analyze: harsh braking, rapid acceleration, speeding, cornering, and idle time. Your driving score: [calculated]. Higher scores = lower insurance premiums through our partners. Get personalized coaching tips to improve your score and save money."
  },

  // 8. Customer Communication & Outreach
  {
    intent: "customer_support",
    keywords: ["support", "help", "contact", "customer service", "representative", "agent", "human"],
    category: "Communication",
    response: "Our customer support team is available 24/7 to assist you. Contact methods: (1) Live chat with human agent, (2) Phone: 1-800-AUTO-HELP, (3) Email: support@codersadda.com, (4) In-app ticket system. Average response time: <5 minutes for urgent issues, <2 hours for general queries. Connect with an agent now?"
  },
  {
    intent: "feedback",
    keywords: ["feedback", "review", "rating", "complaint", "suggestion", "improvement", "experience"],
    category: "Communication",
    response: "Your feedback drives our continuous improvement. We value your opinions on: service quality, platform usability, feature requests, and issue resolution. Rate your experience (1-5 stars) and share specific feedback. All reviews are read by our team, and we respond within 48 hours. We offer incentives for detailed feedback. Share your thoughts?"
  },
  {
    intent: "notifications",
    keywords: ["notification", "message", "sms", "email", "push", "alert settings", "preferences"],
    category: "Communication",
    response: "Customize your notification preferences: service reminders, diagnostic alerts, promotional offers, maintenance tips, and system updates. Choose delivery methods: push notifications, SMS, email, or in-app only. Frequency settings: real-time, daily digest, or weekly summary. Manage your notification preferences in Settings > Notifications."
  },

  // 9. Platform Usage Help
  {
    intent: "dashboard_help",
    keywords: ["dashboard", "how to use", "navigate", "interface", "features", "tutorial", "guide"],
    category: "Platform Help",
    response: "Welcome to Coders Adda Dashboard! Key features: (1) Vehicle Health Overview - real-time diagnostics, (2) Maintenance Scheduler - upcoming services, (3) Trip History - detailed analytics, (4) Service Network - find centers, (5) Reports - generate insights. New user? Take our 3-minute interactive tutorial. Start tutorial?"
  },
  {
    intent: "login_help",
    keywords: ["login", "sign in", "password", "forgot", "reset", "access", "username", "account"],
    category: "Platform Help",
    response: "Having trouble logging in? Common solutions: (1) Reset password via 'Forgot Password' link, (2) Check email for verification link, (3) Clear browser cache/cookies, (4) Try different browser. Account locked after 5 failed attempts (auto-unlocks in 30 min). For immediate help, contact support with your registered email."
  },
  {
    intent: "agent_management",
    keywords: ["agent", "mechanic", "technician", "service provider", "workshop", "network"],
    category: "Platform Help",
    response: "Our certified agent network includes 500+ service centers nationwide. All agents undergo: background checks, technical certification, customer service training, and quality audits. View agent profiles with: ratings, specializations, pricing, availability, and customer reviews. Filter by location, services, and price range. Find an agent near you?"
  },
  {
    intent: "mobile_app",
    keywords: ["app", "mobile", "download", "ios", "android", "smartphone", "install"],
    category: "Platform Help",
    response: "Download our mobile app for on-the-go access: Available on iOS (App Store) and Android (Google Play). Features: remote diagnostics, emergency assistance, digital service records, trip tracking, and push notifications. QR code for quick download in your email or visit: codersadda.com/app. Already installed? Enable location and Bluetooth for best experience."
  },

  // 10. General Greetings & Fallback
  {
    intent: "greeting",
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"],
    category: "General",
    response: "Hello! Welcome to Coders Adda – your intelligent automotive assistant. I'm here 24/7 to help with vehicle diagnostics, maintenance scheduling, service bookings, and platform guidance. How can I assist you today?"
  },
  {
    intent: "goodbye",
    keywords: ["bye", "goodbye", "see you", "thanks", "thank you", "that's all"],
    category: "General",
    response: "Thank you for using Coders Adda! Your vehicle's health and safety are our priority. Feel free to return anytime for assistance. Drive safe! 🚗"
  },
  {
    intent: "help_general",
    keywords: ["help", "assist", "support", "what can you do", "features", "capabilities"],
    category: "General",
    response: "I can assist you with: ✓ Vehicle diagnostics & health checks, ✓ Predictive maintenance scheduling, ✓ Service bookings & rescheduling, ✓ OBD fault code interpretation, ✓ Dashboard warning explanations, ✓ Security & compliance tracking, ✓ Analytics & performance reports, ✓ Platform navigation help. What do you need help with?"
  },
  {
    intent: "fallback",
    keywords: [],
    category: "General",
    response: "I'm not quite sure I understood that. Could you please rephrase your question? I specialize in automotive diagnostics, maintenance, service bookings, and platform assistance. For complex queries, I can connect you with a human expert. Type 'help' to see what I can do, or describe your vehicle issue in detail."
  }
];

/**
 * Intent detection function - finds best matching response
 */
export function detectIntent(userMessage: string): ChatbotResponse {
  const messageLower = userMessage.toLowerCase().trim();
  
  // Score each response based on keyword matches
  let bestMatch: ChatbotResponse | null = null;
  let highestScore = 0;
  
  for (const response of chatbotResponses) {
    let score = 0;
    
    // Check each keyword for matches
    for (const keyword of response.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // Multi-word keywords get higher weight
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = response;
    }
  }
  
  // Return fallback if no good match found
  if (!bestMatch || highestScore === 0) {
    return chatbotResponses.find(r => r.intent === "fallback")!;
  }
  
  return bestMatch;
}
