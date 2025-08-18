# Digital Fleet System - Vercel Deployment Script (PowerShell)
Write-Host "🚀 Starting Vercel deployment for Digital Fleet System..." -ForegroundColor Green

# Check if vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found!" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Please install it with: npm install -g vercel" -ForegroundColor Red
    exit 1
}

# Login to Vercel (if not already logged in)
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow
try {
    vercel whoami
} catch {
    Write-Host "Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Run production build to ensure everything works
Write-Host "🔨 Running production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Deployment successful!" -ForegroundColor Green
        Write-Host "🌐 Your Digital Fleet System is now live on Vercel!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Post-deployment checklist:" -ForegroundColor Cyan
        Write-Host "   - Test all pages and functionality" -ForegroundColor White
        Write-Host "   - Verify authentication works" -ForegroundColor White
        Write-Host "   - Check database connections" -ForegroundColor White
        Write-Host "   - Test responsive design" -ForegroundColor White
        Write-Host "   - Monitor performance in Vercel dashboard" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 Remember to set environment variables in Vercel Dashboard:" -ForegroundColor Yellow
        Write-Host "   VITE_SUPABASE_URL=https://dftwstjxrxwszkufggom.supabase.co" -ForegroundColor Gray
        Write-Host "   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor Gray
        Write-Host "   VITE_APP_TITLE=Digital Fleet Management System" -ForegroundColor Gray
        Write-Host "   VITE_ENABLE_HTTPS=true" -ForegroundColor Gray
        Write-Host "   VITE_SECURE_COOKIES=true" -ForegroundColor Gray
    } else {
        Write-Host "❌ Deployment failed! Check the error messages above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Build failed! Please fix the errors before deploying." -ForegroundColor Red
    exit 1
}
