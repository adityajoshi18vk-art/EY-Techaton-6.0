@echo off
echo ============================================
echo Deploying to Vercel
echo ============================================
echo.
echo IMPORTANT: When asked for project name, use lowercase only
echo Example: ey-techathon or automotive-ai
echo.
echo Press any key to continue...
pause > nul
echo.

cd D:\project\automotive-project\web
vercel --prod

echo.
echo ============================================
echo Deployment started!
echo ============================================
echo.
echo Your live URL will be displayed above.
echo.
echo IMPORTANT: For the backend (Express server)
echo Deploy it separately to Railway or Render:
echo.
echo Railway: https://railway.app
echo Render: https://render.com
echo.
echo Then update NEXT_PUBLIC_API_URL in Vercel:
echo 1. Go to vercel.com/dashboard
echo 2. Select your project
echo 3. Settings -> Environment Variables
echo 4. Add NEXT_PUBLIC_API_URL with your backend URL
echo.
pause
