# Agentic AI Orchestration Architecture
## Coders Adda Automotive Project

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Frontend["🖥️ Frontend (Next.js)"]
        User[User Browser]
        ChatUI[Chat UI Component]
        Dashboard[Dashboard Pages]
        Booking[Booking Interface]
    end

    subgraph Backend["⚙️ Backend (Express + TypeScript)"]
        MA[🧠 Master Agent<br/>/api/chatbot]
        
        subgraph Workers["🤖 Worker Agents"]
            AG_Analytics[📊 Analytics Agent]
            AG_Diagnostics[🔧 Diagnostics Agent]
            AG_Outreach[📢 Outreach Agent]
            AG_Booking[📅 Booking Agent]
            AG_Feedback[⭐ Feedback Agent]
            AG_Security[🔒 Security Agent]
        end
        
        subgraph Core["Core Services"]
            IntentDetector[Intent Detection<br/>Regex + Keywords]
            SessionCache[(Session Cache<br/>LRU + Rate Limit)]
            ChatHistory[(Chat History DB<br/>MongoDB)]
        end
        
        subgraph APIs["📡 Data APIs"]
            API_Telemetry[/api/telemetry]
            API_Diagnostics[/api/diagnostics]
            API_Booking[/api/booking]
            API_Feedback[/api/feedback]
            API_Security[/api/security]
            API_Outreach[/api/outreach]
        end
        
        LLM[🤖 Gemini AI<br/>Fallback LLM]
    end

    User -->|POST message| MA
    MA --> IntentDetector
    MA --> SessionCache
    IntentDetector -->|confidence ≥ 0.75| Workers
    
    MA -->|booking intent| AG_Booking
    MA -->|analytics intent| AG_Analytics
    MA -->|diagnostics intent| AG_Diagnostics
    MA -->|outreach intent| AG_Outreach
    MA -->|feedback intent| AG_Feedback
    MA -->|security intent| AG_Security
    
    AG_Analytics --> API_Telemetry
    AG_Diagnostics --> API_Diagnostics
    AG_Booking --> API_Booking
    AG_Outreach --> API_Outreach
    AG_Feedback --> API_Feedback
    AG_Security --> API_Security
    
    MA -->|confidence < 0.75| LLM
    LLM -->|150 tokens max| MA
    
    MA -->|save session| ChatHistory
    MA -->|response + actions| ChatUI
    ChatUI -->|action: navigate| Booking
    ChatUI -->|action: navigate| Dashboard

    style MA fill:#4F46E5,stroke:#312E81,color:#fff
    style Workers fill:#10B981,stroke:#065F46,color:#fff
    style LLM fill:#F59E0B,stroke:#92400E,color:#fff
    style APIs fill:#3B82F6,stroke:#1E40AF,color:#fff
```

## 🔄 Sequence Flow: "Book Service After Diagnostics"

```mermaid
sequenceDiagram
    actor User
    participant ChatUI as Chat UI
    participant Master as Master Agent
    participant Intent as Intent Detector
    participant Diag as Diagnostics Agent
    participant Book as Booking Agent
    participant API_D as /api/diagnostics
    participant API_B as /api/booking
    participant Session as Session Cache
    participant History as Chat History DB

    User->>ChatUI: "Check my vehicle issues"
    ChatUI->>Master: POST /api/chatbot<br/>{message, sessionId, customer}
    Master->>Session: Get/Create session
    Session-->>Master: Session data
    Master->>Intent: detectIntent("check my vehicle issues")
    Intent-->>Master: {intent: "diagnostics", confidence: 0.85}
    
    Note over Master: confidence ≥ 0.75<br/>Route to worker
    
    Master->>Diag: diagnosticsAgent(message)
    Diag->>API_D: GET /api/diagnostics
    API_D-->>Diag: {diagnostics: [...], severity: "high"}
    Diag-->>Master: {reply: "⚠️ Found 2 issues...", data}
    
    Master->>Session: Update messages
    Master->>History: Save chat history
    Master-->>ChatUI: {reply, intent, actions: ["diagnostics_query"]}
    ChatUI-->>User: Display: "⚠️ Found 2 high-priority issues..."
    
    User->>ChatUI: "Book a service to fix them"
    ChatUI->>Master: POST /api/chatbot<br/>{message, sessionId}
    Master->>Intent: detectIntent("book a service")
    Intent-->>Master: {intent: "booking", confidence: 0.9}
    
    alt Interactive Booking Flow
        Master->>Book: Start booking flow
        Book-->>Master: {content: "What service?", options: [...]}
        Master-->>ChatUI: {reply, options, requiresInput}
        ChatUI-->>User: Show service options as buttons
        
        User->>ChatUI: Clicks "Brake Service ($199-450)"
        ChatUI->>Master: POST {message: "Brake Service"}
        Master->>Book: Continue booking flow (date step)
        Book-->>Master: {content: "When?", options: [dates]}
        Master-->>ChatUI: {reply, options}
        ChatUI-->>User: Show date options
        
        User->>ChatUI: Selects "Dec 14, 2:00 PM"
        Note over Master,Book: Multi-step flow continues...<br/>Collect: time → name → email → phone → vehicle
        
        User->>ChatUI: Types "CONFIRM"
        ChatUI->>Master: POST {message: "CONFIRM"}
        Master->>Book: Confirm booking
        Book->>API_B: POST /api/booking<br/>{serviceType, date, time, customer}
        API_B-->>Book: {success: true, bookingId}
        Book-->>Master: {reply: "🎉 Booking confirmed!"}
    end
    
    Master->>History: Save complete chat
    Master-->>ChatUI: {reply, intent: "booking", actions: ["booking_confirmed"]}
    ChatUI-->>User: "🎉 Booking confirmed! Your Brake Service..."
    
    Note over User,History: End-to-end flow complete:<br/>Diagnostics → Interactive Booking → Confirmation
```

## 📋 Implementation Details

### 1. Master Agent (Intent Detection + Routing)

**Location**: `server/src/routes/chatbot.ts`

**Key Functions**:
- `detectIntent(message: string)` - Regex-based intent classification with confidence scoring
- `generateResponse(message, history, session)` - Routes to worker agents or LLM fallback
- `handleBookingFlow(message, session)` - Multi-step interactive booking state machine

**Intent Detection Logic**:
```typescript
function detectIntent(message: string): { intent: string; confidence: number } {
  const msg = message.toLowerCase();
  
  // Booking intents - highest priority
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
  
  // ... other intents with decreasing confidence
  
  return { intent: 'general', confidence: 0.5 };
}
```

### 2. Worker Agents

Each worker agent implements the same interface:

```typescript
interface AgentResponse {
  reply: string;
  data?: any;
}

async function workerAgent(query: string): Promise<AgentResponse>
```

#### Analytics Agent 📊
- **Purpose**: Vehicle telemetry, performance metrics, fuel levels
- **API**: `GET /api/telemetry`
- **Returns**: Speed, fuel level, system health status

#### Diagnostics Agent 🔧
- **Purpose**: Vehicle health checks, issue detection
- **API**: `GET /api/diagnostics`
- **Returns**: High-priority issues with recommendations

#### Booking Agent 📅
- **Purpose**: Interactive multi-step booking flow
- **API**: `GET /api/booking`, `POST /api/booking`
- **State Machine**: service → date → time → contact → confirm
- **Returns**: Booking options, confirmation

#### Outreach Agent 📢
- **Purpose**: Marketing campaigns, promotions
- **API**: `GET /api/outreach`
- **Returns**: Active campaign count, offer details

#### Feedback Agent ⭐
- **Purpose**: Customer ratings, service reviews
- **API**: `GET /api/feedback`
- **Returns**: Average rating, feedback summary

#### Security Agent 🔒
- **Purpose**: Account security, threat detection
- **API**: `GET /api/security`
- **Returns**: Security status, alert count

### 3. Session Management

**Location**: In-memory Map with session tracking

```typescript
interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  startTime: string;
  lastActivity: string;
  bookingState?: BookingState; // Multi-step booking context
}

const chatSessions: Map<string, ChatSession> = new Map();
```

**Features**:
- Session-based conversation context (last 6 messages)
- Booking state persistence across messages
- Auto-cleanup on session end

### 4. LLM Fallback (Gemini AI)

**Trigger**: When confidence < 0.75 or worker agents fail

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    maxOutputTokens: 150,  // Constrained output
    temperature: 0.7,
  }
});

const systemPrompt = `You are an automotive service assistant. 
Respond concisely in 2-3 sentences.
Help with: maintenance, diagnostics, bookings, pricing, vehicle issues.
Keep response under 100 words.`;
```

### 5. Action Types

```typescript
interface Action {
  type: 'navigate' | 'interactive_booking' | 'show_options';
  path?: string;
  payload?: any;
}
```

**Action Examples**:
- `{ type: 'navigate', path: '/customer-dashboard/booking' }` - Redirect to booking page
- `{ type: 'interactive_booking', payload: { options: [...] } }` - Show booking options
- `{ type: 'show_options', payload: { requiresInput: 'date' } }` - Display date picker

### 6. Zod Schemas

```typescript
// Request Schema
const chatMessageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
});

// Response Schema (implicit)
interface ChatResponse {
  success: boolean;
  sessionId: string;
  message: ChatMessage;
  conversationHistory: ChatMessage[];
  intent?: string;
  action?: Action;
  actions?: string[];
  options?: string[];
  requiresInput?: string;
}

// Chat History Schema
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
```

### 7. Frontend Integration

**Location**: `web/src/app/customer-dashboard/chatbot/page.tsx`

```typescript
const sendMessageMutation = useMutation({
  mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
    apiClient.sendChatMessage(message, sessionId, {
      customerId: user?.id,
      customerName: user?.name,
      customerEmail: user?.email,
    }),
  onSuccess: (data) => {
    setSessionId(data.sessionId);
    setMessages(data.conversationHistory);
    setCurrentOptions(data.options || []); // Interactive options
    
    // Handle navigation action
    if (data.action?.type === 'navigate' && data.action.path) {
      setTimeout(() => router.push(data.action.path), 1500);
    }
  },
});
```

**Interactive Options UI**:
```typescript
{currentOptions.length > 0 && (
  <div className="flex flex-col gap-2">
    {currentOptions.map((option, index) => (
      <button
        key={index}
        onClick={() => handleOptionClick(option)}
        className="p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400"
      >
        {option}
      </button>
    ))}
  </div>
)}
```

### 8. Chat History Persistence

**Location**: `server/src/routes/chatHistory.ts`

Every chat message is automatically saved to MongoDB:

```typescript
axios.post('http://localhost:4000/api/chat-history', {
  sessionId: session.sessionId,
  customerId: validated.customerId,
  customerName: validated.customerName || 'Guest User',
  customerEmail: validated.customerEmail || 'guest@example.com',
  messages: session.messages,
  startTime: session.startTime,
  lastActivity: session.lastActivity,
  status: session.bookingState ? 'active' : 'completed',
}).catch(err => console.error('Failed to save chat history:', err.message));
```

## 🎯 Example Flow: Complete End-to-End

### Scenario: "User checks diagnostics, then books repair service"

1. **User**: "Check my vehicle for problems"
2. **Intent Detection**: diagnostics (confidence: 0.85)
3. **Route to**: diagnosticsAgent
4. **Agent calls**: GET /api/diagnostics
5. **Response**: "⚠️ Found 2 high-priority issues: Brake pad wear..."
6. **User**: "Book a service to fix the brakes"
7. **Intent Detection**: booking (confidence: 0.9)
8. **Route to**: bookingAgent (interactive flow)
9. **Agent returns**: Options for service types
10. **UI displays**: Clickable buttons [Oil Change] [Brake Service] [Tire Rotation]...
11. **User clicks**: "Brake Service ($199-450)"
12. **Agent returns**: Date options for next 7 days
13. **User selects**: "Wed, Dec 14"
14. **Agent returns**: Time slot options
15. **User selects**: "2:00 PM"
16. **Agent requests**: Contact info (name → email → phone → vehicle)
17. **User provides**: Each field step-by-step
18. **Agent shows**: Booking summary with CONFIRM/CANCEL
19. **User clicks**: CONFIRM
20. **Agent calls**: POST /api/booking with all details
21. **Response**: "🎉 Booking confirmed! Your Brake Service appointment..."
22. **History saved**: Full conversation stored in MongoDB
23. **Available in**: Customer History tab + Employee Chat History tab

## 🔧 Configuration

**Environment Variables**:
```env
GEMINI_API_KEY=AIzaSyDXEHcETKc8E1WCa1Sh_xMeqyfrBOknpy0
MONGODB_URI=mongodb://localhost:27017
PORT=4000
```

**Routing Logic**:
- **Confidence ≥ 0.75**: Route to specific worker agent
- **Confidence < 0.75**: Fallback to Gemini AI (if API key set)
- **No API key**: Use predefined knowledge base responses

## 📊 System Status

**Backend**: ✅ Running on http://localhost:4000
**Frontend**: ✅ Running on http://localhost:3000
**Database**: ✅ MongoDB connected (automotive_ai)
**AI Model**: ✅ Gemini Pro active
**Worker Agents**: ✅ All 6 operational

**API Endpoints**:
- POST `/api/chatbot` - Master agent entry point
- GET `/api/chat-history` - Retrieve all chat histories
- GET `/api/chat-history/stats/summary` - Chat statistics
- GET `/api/telemetry` - Analytics data
- GET `/api/diagnostics` - Diagnostics data
- GET `/api/booking` - Booking data
- POST `/api/booking` - Create booking
- GET `/api/feedback` - Feedback data
- GET `/api/security` - Security events
- GET `/api/outreach` - Campaign data

## 🚀 Key Features

1. ✅ **Multi-Agent Architecture** - 1 Master + 6 Workers
2. ✅ **Intent Detection** - Regex + confidence scoring
3. ✅ **Worker Routing** - Automatic based on intent
4. ✅ **Interactive Flows** - Multi-step booking state machine
5. ✅ **LLM Fallback** - Gemini AI with 150-token constraint
6. ✅ **Session Management** - In-memory cache with context
7. ✅ **Chat Persistence** - MongoDB with full history
8. ✅ **Action System** - Navigate, show options, create bookings
9. ✅ **Real-time Updates** - 30s polling for history
10. ✅ **Employee Monitoring** - View all customer chats
11. ✅ **Customer Privacy** - Users see only their own history
12. ✅ **Statistics Dashboard** - Total chats, active sessions, message counts

---

**Status**: 🟢 **FULLY OPERATIONAL**

All components are implemented, tested, and running in production mode.
