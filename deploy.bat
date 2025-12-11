@echo off
echo ============================================
echo Coders Adda Automotive - Vercel Deployment
echo ============================================
echo.

echo Step 1: Checking Vercel CLI installation...
call vercel --version
if errorlevel 1 (
    echo ERROR: Vercel CLI not found. Installing...
    call npm install -g vercel
)
echo.

echo Step 2: Login to Vercel (browser will open)...
call vercel login
echo.

echo Step 3: Deploying Frontend (Next.js)...
cd web
echo Deploying frontend...
call vercel --prod
cd ..
echo.

echo Step 4: Deploying Backend (Express)...
echo.
echo NOTE: For backend deployment, we recommend using Railway or Render
echo Vercel has limitations with long-running Express servers.
echo.
echo Option 1: Deploy to Railway (recommended)
echo   1. Go to https://railway.app
echo   2. Create new project from GitHub repo
echo   3. Set environment variables from server/.env.example
echo.
echo Option 2: Deploy to Render (free tier available)
echo   1. Go to https://render.com
echo   2. Create new Web Service
echo   3. Connect GitHub repo
echo   4. Set Build Command: cd server ^&^& npm install ^&^& npm run build
echo   5. Set Start Command: cd server ^&^& npm start
echo   6. Add environment variables
echo.
echo Option 3: Deploy backend to Vercel (limited functionality)
cd server
call vercel --prod
cd ..
echo.

echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Update NEXT_PUBLIC_API_URL with your backend URL
echo 3. Run: npm run index:docs (on backend to initialize vector store)
echo 4. Test your endpoints
echo.
echo Visit: https://vercel.com/dashboard
echo.
pause
