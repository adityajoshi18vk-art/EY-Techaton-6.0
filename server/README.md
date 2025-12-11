# Coders Adda Automotive AI - RAG Pipeline Server

Multi-AI training and RAG (Retrieval-Augmented Generation) pipeline for automotive service chatbot.

## 🚀 Features

- **Fast Keyword Matching**: Instant responses for common queries using predefined responses
- **RAG Flow**: Embed query → vector search → context building → LLM generation
- **Multi-Provider Support**: Google Gemini, Custom LLM, or fallback to local embeddings
- **Vector Store**: In-memory FAISS-like vector database with persistence
- **Session Management**: LRU cache with rate limiting for conversation context
- **Fine-tuning Ready**: Generate JSONL training data for model fine-tuning
- **Document Indexing**: Automatic embedding generation and vector indexing
- **Logging**: Comprehensive query, similarity, and model logging

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 8.2+ running locally
- (Optional) Google Gemini API key for LLM/embeddings
- (Optional) Custom LLM/embedding API endpoints

## 🛠️ Installation

```bash
cd server
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Key Environment Variables

```env
# LLM Configuration
LLM_ENABLED=true
LLM_PROVIDER=gemini          # 'gemini' | 'inbuilt'
GEMINI_API_KEY=your_key_here

# Embeddings
EMBEDDING_PROVIDER=gemini    # 'gemini' | 'custom'

# Vector Store
VECTOR_PROVIDER=local        # 'local' | 'pinecone' | 'weaviate'

# RAG Settings
RAG_SIMILARITY_THRESHOLD=0.55
RAG_TOP_K=5
```

## 📚 Usage

### 1. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:4000`

### 2. Index Documents

First-time setup - index knowledge base documents:

```bash
npm run index:docs
```

This creates embeddings for all documents in `data/docs/*.json` and stores them in the vector database.

### 3. Generate Training Data

Create JSONL files for fine-tuning:

```bash
npm run generate:training
```

Output files:
- `data/train_openai.jsonl` - OpenAI format
- `data/train_gemini.jsonl` - Google Gemini format
- `data/train_summary.json` - Statistics

### 4. Re-index (When Documents Change)

Via CLI:
```bash
npm run reindex
```

Via API:
```bash
POST http://localhost:4000/api/reindex
```

## 🔌 API Endpoints

### Chat Endpoint

**POST `/api/chatbot`**

Send a chat message and get AI-powered response with RAG.

Request:
```json
{
  "message": "How often should I change my oil?",
  "sessionId": "session-123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

Response:
```json
{
  "success": true,
  "sessionId": "session-123",
  "message": {
    "id": "msg-456",
    "role": "assistant",
    "content": "Oil change is recommended every 5,000-7,500 miles...",
    "timestamp": "2025-12-11T10:30:00.000Z"
  },
  "intent": "oil_change",
  "actions": ["offer_booking"],
  "sources": ["oil-change-1"],
  "model": "gemini-pro",
  "similarity": 0.87
}
```

### Re-indexing Endpoints

**POST `/api/reindex`** - Trigger document re-indexing

**GET `/api/reindex/status`** - Get current index status

**DELETE `/api/reindex/clear`** - Clear vector store

### Other Endpoints

- `POST /api/chatbot` - Main chat interface
- `GET /api/chatbot/history/:sessionId` - Get chat history
- `DELETE /api/chatbot/session/:sessionId` - Clear session
- `GET /api/chatbot/stats` - Get chatbot statistics
- `GET /api/chat-history` - All chat histories (employee view)
- `GET /api/chat-history/stats/summary` - Chat analytics

## 🧠 How It Works

### 1. Request Flow

```
User Query
    ↓
Fast Keyword Match? → Yes → Return Canned Response
    ↓ No
Generate Query Embedding
    ↓
Vector Similarity Search (threshold: 0.55)
    ↓
Top-K Results Found? → Yes → Build Context
    ↓                          ↓
    No                    Call LLM with Context
    ↓                          ↓
LLM Enabled? → Yes → Call LLM Fallback
    ↓ No                      ↓
Return Fallback Response ← Return Generated Response
```

### 2. RAG Pipeline

```typescript
// 1. Fast keyword match
const match = findKeywordMatch(query);
if (match) return match.reply;

// 2. Generate embedding
const embedding = await generateEmbedding(query);

// 3. Vector search
const results = await vectorStore.search(query, topK, threshold);

// 4. Build context
const context = results.map(r => r.content).join('\n\n');

// 5. Call LLM with context
const response = await callLLM(query, {
  temperature: 0.1,
  maxTokens: 150,
  context,
  systemPrompt: 'You are Coders Adda assistant...'
});
```

### 3. Multi-Provider Support

**Gemini Provider** (Recommended):
- Uses Google Gemini Pro for LLM
- Uses `embedding-001` model for embeddings
- Low temperature (0.1) for deterministic responses
- 150 token limit for concise answers

**Inbuilt Provider**:
- Connect your own LLM API
- Custom embedding API
- Compatible with OpenAI-like interfaces

**Fallback**:
- Simple hash-based embeddings for testing
- Predefined keyword responses
- No external dependencies

## 📊 Response Strategy

### Priority Order:
1. **Keyword Match** (Fastest) - Instant predefined responses
2. **RAG with High Similarity** (≥0.55) - Retrieved context + LLM
3. **LLM Fallback** (if enabled) - General knowledge LLM
4. **Default Fallback** - Generic help message

### Similarity Thresholds:
- `≥ 0.75`: High confidence - use retrieved docs
- `0.55-0.75`: Medium confidence - combine docs + LLM
- `< 0.55`: Low confidence - prefer keyword match or LLM fallback

## 🗂️ Project Structure

```
server/
├── src/
│   ├── agents/
│   │   └── chatbotResponses.ts      # Predefined responses
│   ├── lib/
│   │   ├── embeddings.ts            # Embedding generation
│   │   ├── llmClients.ts            # LLM provider wrappers
│   │   └── vectorStore.ts           # In-memory vector DB
│   ├── routes/
│   │   ├── chatbot.ts               # Main chat endpoint
│   │   ├── reindex.ts               # Document indexing
│   │   └── chatHistory.ts           # History management
│   ├── schemas/
│   │   └── chatbot.ts               # Zod validation schemas
│   ├── utils/
│   │   └── sessionCache.ts          # LRU session cache
│   └── index.ts                     # Server entry point
├── scripts/
│   ├── generate_jsonl.ts            # Training data generator
│   └── index_docs.ts                # Document indexer
├── data/
│   ├── docs/                        # Knowledge base documents
│   ├── train_openai.jsonl           # OpenAI training format
│   ├── train_gemini.jsonl           # Gemini training format
│   └── vector-store.json            # Persisted embeddings
├── logs/
│   └── chatbot.log                  # Query and response logs
└── package.json
```

## 📝 Sample Test Queries

```bash
# Test keyword matching
curl -X POST http://localhost:4000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'

# Test RAG retrieval
curl -X POST http://localhost:4000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "How often should I change my oil?"}'

# Test diagnostics
curl -X POST http://localhost:4000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "My check engine light is on"}'

# Test booking
curl -X POST http://localhost:4000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "I need to book a brake service"}'
```

## 🔍 Logging

All queries are logged with:
- User query
- Intent detected
- Similarity scores
- Retrieved document IDs
- LLM model used
- Response time
- Session ID

Logs saved to: `logs/chatbot.log`

Example log entry:
```
[2025-12-11T10:30:00.000Z] QUERY sessionId=session-123 query="oil change" intent=oil_change similarity=0.87 docs=[oil-change-1] model=gemini-pro duration=245ms
```

## 🧪 Testing

### Manual Testing

1. Start server: `npm run dev`
2. Test endpoints using curl or Postman
3. Check logs: `tail -f logs/chatbot.log`

### Automated Tests

```bash
npm test
```

Test coverage:
- Keyword matching
- Embedding generation
- Vector similarity search
- RAG context building
- LLM provider switching
- Session caching
- Rate limiting

## 🎯 Fine-Tuning

### Generate Training Data

```bash
npm run generate:training
```

### Upload to Provider

**OpenAI**:
```bash
openai api fine_tunes.create \
  -t data/train_openai.jsonl \
  -m davinci \
  --suffix "coders-adda"
```

**Google Gemini**:
Use Google AI Studio or Vertex AI console to upload `train_gemini.jsonl`

## 🔒 Security

- Rate limiting: 60 requests/minute per session
- Session max age: 1 hour
- API authentication via Bearer tokens (if configured)
- Input validation with Zod schemas
- XSS/injection protection

## 📈 Performance

- **Keyword Match**: < 1ms
- **Vector Search**: 10-50ms (depends on index size)
- **LLM Call**: 200-1000ms (depends on provider)
- **Total Response**: Typically 200-500ms with RAG

## 🐛 Troubleshooting

### "LLM is disabled"
- Set `LLM_ENABLED=true` in `.env`
- Verify `GEMINI_API_KEY` is set

### "Vector store empty"
- Run `npm run index:docs` to index documents
- Check `data/docs/` directory exists

### "Rate limit exceeded"
- Wait 60 seconds
- Increase `SESSION_RATE_LIMIT` in `.env`

### "No results found"
- Lower `RAG_SIMILARITY_THRESHOLD` (default: 0.55)
- Add more documents to knowledge base
- Check embedding provider configuration

## 📚 Knowledge Base

Add new documents to `data/docs/`:

```json
[
  {
    "id": "unique-id",
    "content": "Detailed information about automotive topic...",
    "metadata": {
      "title": "Document Title",
      "category": "maintenance",
      "tags": ["oil", "engine"],
      "source": "service_guide"
    }
  }
]
```

Then re-index:
```bash
npm run index:docs
```

## 🤝 Contributing

1. Add new predefined responses to `src/agents/chatbotResponses.ts`
2. Add knowledge base docs to `data/docs/`
3. Run `npm run index:docs` to update vector store
4. Test with sample queries
5. Check logs for accuracy

## 📄 License

MIT

## 🆘 Support

For issues or questions:
- Check logs: `logs/chatbot.log`
- Review env configuration: `.env`
- Test individual components:
  - Embeddings: `generateEmbedding('test')`
  - LLM: `callLLM('test query')`
  - Vector search: `vectorStore.search('test')`

---

**Status**: 🟢 Production Ready

All components are implemented, tested, and operational with fallback mechanisms for offline/local development.
