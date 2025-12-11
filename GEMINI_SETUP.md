# Gemini API Setup Guide

## Overview
The AI chatbot is now integrated with Google's Gemini API for advanced conversational AI capabilities. The system will fallback to the knowledge base if Gemini API is not configured.

## Getting Your Gemini API Key

### Step 1: Visit Google AI Studio
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account

### Step 2: Create API Key
1. Click on **"Create API Key"**
2. Select a Google Cloud project (or create a new one)
3. Copy your API key

### Step 3: Add to Environment Variables
1. Open `server/.env` file
2. Replace `your_gemini_api_key_here` with your actual API key:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### Step 4: Restart Server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Features

### With Gemini API (Recommended)
- ✅ Natural language understanding
- ✅ Context-aware responses
- ✅ Conversation history tracking
- ✅ Intelligent recommendations
- ✅ Dynamic responses to complex queries

### Without Gemini API (Fallback)
- ✅ Knowledge base responses
- ✅ Pattern matching
- ✅ Basic conversation flow
- ⚠️ Limited to predefined responses

## Testing

### Test the Integration
1. Go to Customer Dashboard → AI Assistant
2. Ask questions like:
   - "What's the difference between synthetic and conventional oil?"
   - "My car is making a grinding noise when I brake"
   - "How often should I rotate my tires?"
3. With Gemini: You'll get detailed, contextual responses
4. Without Gemini: You'll get knowledge base responses

### Verify API is Working
Check the server console for:
- ✅ No "Gemini API error" messages = Working
- ⚠️ "Gemini API error" messages = Check API key

## Automatic Navigation
The chatbot detects booking intent and automatically redirects:
- "book service" → Redirects to booking page
- "schedule appointment" → Redirects to booking page
- "make appointment" → Redirects to booking page

## API Pricing
- **Free Tier**: 60 requests per minute
- **Paid Tier**: Higher limits available
- Check current pricing: [https://ai.google.dev/pricing](https://ai.google.dev/pricing)

## Troubleshooting

### Issue: API Key Error
**Solution**: Verify your API key in `.env` file

### Issue: "Gemini API error" in console
**Causes**:
1. Invalid API key
2. API quota exceeded
3. Network connection issue

**Solution**: Check API key, verify quota at [Google AI Studio](https://makersuite.google.com)

### Issue: Getting generic responses
**Cause**: Gemini API not configured, using fallback
**Solution**: Add valid API key to `.env`

## Environment Variables Reference

```env
# Required for Gemini integration
GEMINI_API_KEY=your_api_key_here

# Other configurations
MONGODB_URI=mongodb://localhost:27017
DB_NAME=automotive_ai
PORT=4000
```

## Notes
- The system gracefully falls back to knowledge base if Gemini API is unavailable
- Conversation history is maintained in server memory
- API responses are cached per session for better performance
