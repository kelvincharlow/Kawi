#!/usr/bin/env bash

# Digital Fleet System - Vercel Deployment Script
echo "🚀 Starting Vercel deployment for Digital Fleet System..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set environment variables if they don't exist
echo "🔧 Setting up environment variables..."

# Check if environment variables are already set
ENV_CHECK=$(vercel env ls 2>/dev/null | grep VITE_SUPABASE_URL || echo "not_found")

if [[ "$ENV_CHECK" == "not_found" ]]; then
    echo "📝 Setting up environment variables for the first time..."
    
    echo "Setting VITE_SUPABASE_URL..."
    echo "https://dftwstjxrxwszkufggom.supabase.co" | vercel env add VITE_SUPABASE_URL production
    
    echo "Setting VITE_SUPABASE_ANON_KEY..."
    echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHdzdGp4cnh3c3prdWZnZ29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODU1MDMsImV4cCI6MjA2ODk2MTUwM30.kui2ggN_OhOokDzX46wEcP_yb8HHEseyB4aF9ZnRMns" | vercel env add VITE_SUPABASE_ANON_KEY production
    
    echo "Setting VITE_APP_TITLE..."
    echo "Digital Fleet Management System" | vercel env add VITE_APP_TITLE production
    
    echo "Setting VITE_ENABLE_HTTPS..."
    echo "true" | vercel env add VITE_ENABLE_HTTPS production
    
    echo "Setting VITE_SECURE_COOKIES..."
    echo "true" | vercel env add VITE_SECURE_COOKIES production
    
    echo "✅ Environment variables configured!"
else
    echo "✅ Environment variables already configured!"
fi

# Run production build to ensure everything works
echo "🔨 Running production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌐 Your Digital Fleet System is now live on Vercel!"
        echo ""
        echo "📋 Post-deployment checklist:"
        echo "   - Test all pages and functionality"
        echo "   - Verify authentication works"
        echo "   - Check database connections"
        echo "   - Test responsive design"
        echo "   - Monitor performance in Vercel dashboard"
    else
        echo "❌ Deployment failed! Check the error messages above."
        exit 1
    fi
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi
