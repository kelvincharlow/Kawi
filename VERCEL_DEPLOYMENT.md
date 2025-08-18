# Vercel Deployment Guide for Digital Fleet System

## Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. Git repository (this project should be committed to Git)
3. Vercel CLI installed globally

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Set Environment Variables in Vercel
You have two options to set environment variables:

### Option A: Via Vercel Dashboard
1. Go to your project dashboard on vercel.com
2. Navigate to Settings > Environment Variables
3. Add these variables:

```
VITE_SUPABASE_URL=https://dftwstjxrxwszkufggom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHdzdGp4cnh3c3prdWZnZ29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODU1MDMsImV4cCI6MjA2ODk2MTUwM30.kui2ggN_OhOokDzX46wEcP_yb8HHEseyB4aF9ZnRMns
VITE_APP_TITLE=Digital Fleet Management System
VITE_ENABLE_HTTPS=true
VITE_SECURE_COOKIES=true
```

### Option B: Via Vercel CLI
```bash
vercel env add VITE_SUPABASE_URL
# Enter: https://dftwstjxrxwszkufggom.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHdzdGp4cnh3c3prdWZnZ29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODU1MDMsImV4cCI6MjA2ODk2MTUwM30.kui2ggN_OhOokDzX46wEcP_yb8HHEseyB4aF9ZnRMns

vercel env add VITE_APP_TITLE
# Enter: Digital Fleet Management System

vercel env add VITE_ENABLE_HTTPS
# Enter: true

vercel env add VITE_SECURE_COOKIES
# Enter: true
```

## Step 4: Deploy to Vercel
```bash
# For initial deployment
vercel

# For production deployment
vercel --prod
```

## Step 5: Set Up Automatic Deployments (Optional)
1. Connect your Git repository to Vercel
2. Every push to main branch will trigger automatic deployment
3. Pull requests will get preview deployments

## Security Features Implemented

### ✅ Environment Variables
- API keys moved from hardcoded values to environment variables
- Local `.env.local` file for development (not committed to Git)
- Production variables set in Vercel dashboard

### ✅ .gitignore Security
- `.env*` files excluded from Git
- `utils/supabase/info.tsx` excluded from Git (contains sensitive fallbacks)
- `supabase/.env` and `supabase/config.toml` excluded

### ✅ Build Configuration
- `vercel.json` configured for SPA routing
- Environment variables properly injected during build
- TypeScript types for environment variables

### ✅ Validation
- Production environment validation for required variables
- Fallback values only for development environment
- Clear error messages for missing configuration

## Important Notes

1. **Never commit API keys to Git** - They are now safely stored in Vercel environment variables
2. **The .env.local file is for local development only** - Don't share or commit it
3. **Supabase anon key is safe to expose** - It's designed for client-side use
4. **The project ID extraction is automatic** - Derived from the Supabase URL

## Troubleshooting

### Build Failures
- Ensure all environment variables are set in Vercel
- Check that TypeScript compilation passes locally
- Verify `npm run build` works locally

### Runtime Errors
- Check browser console for environment variable errors
- Verify Supabase connection in Network tab
- Ensure Supabase project is active and accessible

### Performance
- Static files are served from Vercel's CDN
- SPA routing configured for client-side navigation
- Build optimization enabled through Vite

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Check database connections
- [ ] Validate all environment variables are working
- [ ] Test responsive design on different devices
- [ ] Verify HTTPS is working properly
- [ ] Check performance metrics in Vercel dashboard
