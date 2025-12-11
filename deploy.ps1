# Quick Deploy Script for PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Coders Adda Automotive - Vercel Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Vercel CLI
Write-Host "Step 1: Checking Vercel CLI installation..." -ForegroundColor Yellow
try {
    vercel --version
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}
Write-Host ""

# Login
Write-Host "Step 2: Login to Vercel..." -ForegroundColor Yellow
Write-Host "Browser will open for authentication" -ForegroundColor Gray
vercel login
Write-Host ""

# Deploy Frontend
Write-Host "Step 3: Deploying Frontend (Next.js)..." -ForegroundColor Yellow
Set-Location -Path "web"
vercel --prod
Set-Location -Path ".."
Write-Host "✅ Frontend deployed!" -ForegroundColor Green
Write-Host ""

# Backend Instructions
Write-Host "Step 4: Backend Deployment Options..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Vercel has limitations with Express servers" -ForegroundColor Red
Write-Host "We recommend deploying backend to Railway or Render" -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 1: Railway (Recommended)" -ForegroundColor Cyan
Write-Host "  1. Visit: https://railway.app" -ForegroundColor Gray
Write-Host "  2. Click 'Start a New Project'" -ForegroundColor Gray
Write-Host "  3. Select 'Deploy from GitHub repo'" -ForegroundColor Gray
Write-Host "  4. Choose your repository" -ForegroundColor Gray
Write-Host "  5. Set Root Directory: server" -ForegroundColor Gray
Write-Host "  6. Add environment variables from server/.env.example" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Render (Free Tier)" -ForegroundColor Cyan
Write-Host "  1. Visit: https://render.com" -ForegroundColor Gray
Write-Host "  2. Click 'New +' → 'Web Service'" -ForegroundColor Gray
Write-Host "  3. Connect your GitHub repository" -ForegroundColor Gray
Write-Host "  4. Settings:" -ForegroundColor Gray
Write-Host "     - Root Directory: server" -ForegroundColor Gray
Write-Host "     - Build Command: npm install && npm run build" -ForegroundColor Gray
Write-Host "     - Start Command: npm start" -ForegroundColor Gray
Write-Host "  5. Add environment variables" -ForegroundColor Gray
Write-Host ""

$deployBackend = Read-Host "Do you want to deploy backend to Vercel anyway? (y/n)"
if ($deployBackend -eq "y") {
    Write-Host "Deploying backend to Vercel..." -ForegroundColor Yellow
    Set-Location -Path "server"
    vercel --prod
    Set-Location -Path ".."
    Write-Host "✅ Backend deployed to Vercel (with limitations)" -ForegroundColor Green
}
Write-Host ""

# Final Instructions
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set environment variables in Vercel dashboard" -ForegroundColor Gray
Write-Host "2. Update NEXT_PUBLIC_API_URL with your backend URL" -ForegroundColor Gray
Write-Host "3. Run: curl -X POST https://your-backend-url/api/reindex" -ForegroundColor Gray
Write-Host "4. Test your application" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Yellow
Write-Host "  Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "  Railway: https://railway.app" -ForegroundColor Cyan
Write-Host "  Render: https://render.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
