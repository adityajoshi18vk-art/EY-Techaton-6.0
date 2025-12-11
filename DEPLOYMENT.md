# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket
3. **Environment Variables**: Prepare your production credentials

## Deployment Steps

### 1. Install Vercel CLI (Optional but recommended)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy via CLI

From the project root directory:

```bash
cd "c:\Users\Asus\OneDrive\Documents\apna college cpp\automotive-project"
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `coders-adda-automotive`
- In which directory is your code located? `./`

### 4. Deploy via Vercel Dashboard (Alternative)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 5. Configure Environment Variables

#### Frontend (Next.js) Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-backend-url.vercel.app
NEXT_PUBLIC_APP_NAME=Coders Adda Automotive
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Backend (Express) Environment Variables

Deploy backend separately or use Vercel Functions:

```
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/automotive_ai

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# LLM Configuration
LLM_ENABLED=true
LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=gemini

# RAG Settings
RAG_SIMILARITY_THRESHOLD=0.55
RAG_TOP_K=5
VECTOR_PROVIDER=local

# Session Configuration
SESSION_MAX_SIZE=1000
SESSION_MAX_AGE=3600000
SESSION_RATE_LIMIT=60

# Server Configuration
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Logging
LOG_LEVEL=info
LOG_FILE=logs/chatbot.log
```

### 6. Backend Deployment Options

#### Option A: Separate Backend Deployment

Create a separate Vercel project for the backend:

```bash
cd server
vercel
```

Configure as Node.js project with `server/src/index.ts` as entry point.

#### Option B: Deploy to Railway/Render

For full Express support, consider:
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **Fly.io**: [fly.io](https://fly.io)

These platforms better support long-running Node.js servers.

#### Option C: Vercel Serverless Functions

Convert Express routes to Vercel Functions (requires refactoring).

### 7. MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist Vercel IPs: `0.0.0.0/0` (or specific IPs)
5. Get connection string: `mongodb+srv://...`
6. Add to environment variables

### 8. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatic

### 9. Production Build Test

Before deploying, test production build locally:

```bash
# Frontend
cd web
npm run build
npm run start

# Backend
cd server
npm run build
npm run start
```

### 10. Deploy to Production

```bash
vercel --prod
```

Or push to main branch if auto-deployment is configured.

## Post-Deployment

### 1. Index Documents

After backend is deployed, initialize vector store:

```bash
curl -X POST https://your-backend-url.vercel.app/api/reindex
```

Or run via SSH if using Railway/Render:
```bash
npm run index:docs
```

### 2. Verify Endpoints

Test all API endpoints:

```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Chat endpoint
curl -X POST https://your-backend-url.vercel.app/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'

# Chat history
curl https://your-backend-url.vercel.app/api/chat-history
```

### 3. Monitor Logs

- Vercel Dashboard → Your Project → Logs
- Check for errors and performance issues
- Monitor API response times

### 4. Set Up Analytics (Optional)

Enable Vercel Analytics:
1. Project Settings → Analytics
2. Enable Web Analytics
3. Monitor traffic and performance

## Environment-Specific Configuration

### Development
```bash
npm run dev
```
Uses `.env.local` or `.env`

### Production
```bash
npm run build
npm run start
```
Uses `.env.production` and environment variables from Vercel

## Troubleshooting

### "API URL not found"
- Check `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- Ensure it starts with `https://`
- Redeploy after adding variables

### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas (allow all: `0.0.0.0/0`)
- Test connection string locally first

### "Gemini API error"
- Verify `GEMINI_API_KEY` is set
- Check API key is valid in Google AI Studio
- Ensure billing is enabled for Gemini API

### "Vector store empty"
- Run re-indexing: `POST /api/reindex`
- Check documents exist in `server/data/docs/`
- Verify vector store persistence path

### "Build failed"
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Fix TypeScript errors locally first

### "Serverless function timeout"
- Vercel free tier has 10s timeout
- Upgrade to Pro for 60s timeout
- Or deploy backend to Railway/Render

## Performance Optimization

1. **Enable caching**:
   ```javascript
   // next.config.js
   module.exports = {
     headers: async () => [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Cache-Control', value: 'public, max-age=60' }
         ]
       }
     ]
   };
   ```

2. **Optimize images**: Use Next.js Image component

3. **Enable compression**: Vercel does this automatically

4. **Use CDN**: Vercel's global edge network

## Continuous Deployment

### Auto-Deploy on Git Push

1. Connect repository in Vercel dashboard
2. Enable Git integration
3. Configure branch:
   - `main` → Production
   - `develop` → Preview

### Manual Deployment

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Cost Estimation

### Vercel Free Tier
- ✅ 100 GB bandwidth
- ✅ Unlimited websites
- ✅ Automatic SSL
- ✅ Serverless functions (10s timeout)
- ❌ Limited build minutes

### Vercel Pro ($20/month)
- ✅ 1 TB bandwidth
- ✅ 60s function timeout
- ✅ Priority support
- ✅ Advanced analytics

### Recommended Setup
- **Frontend**: Vercel (free tier works great)
- **Backend**: Railway ($5/month) or Render (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Total**: $0-5/month for small projects

## Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ CORS configured with specific origins
- ✅ Rate limiting enabled
- ✅ MongoDB IP whitelist configured
- ✅ API keys rotated regularly
- ✅ HTTPS enforced (automatic on Vercel)
- ✅ Input validation with Zod schemas

## Monitoring

### Set up monitoring services:
1. **Vercel Analytics**: Built-in web analytics
2. **Sentry**: Error tracking ([sentry.io](https://sentry.io))
3. **LogRocket**: Session replay
4. **Uptime Robot**: Uptime monitoring

## Rollback

If deployment fails:

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

Or use Vercel dashboard → Deployments → Promote to Production

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)

---

## Quick Deploy Commands

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy frontend
cd web
vercel --prod

# 4. Deploy backend (separate project)
cd ../server
vercel --prod

# 5. Set environment variables via CLI
vercel env add MONGODB_URI production
vercel env add GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_API_URL production

# 6. Redeploy with new env vars
vercel --prod
```

🚀 **Your application is now live!**
