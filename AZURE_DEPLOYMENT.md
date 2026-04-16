# 🚀 Azure Static Web Apps Deployment Guide

## Architecture Overview

- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Frontend**: Azure Static Web Apps (React + Vite)
- **Mobile**: Capacitor (iOS & Android)

## Prerequisites

1. **Azure Account**: https://azure.microsoft.com/
2. **Supabase Project**: Already configured ✅
3. **Azure Static Web Apps Resource**: Create one in Azure Portal

## 🔧 Setup Steps

### 1. Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"
5. Fill in:
   - **Resource Group**: Create new or use existing
   - **Name**: `day-care-ecosystem` (or your preferred name)
   - **Plan type**: Free (for testing) or Standard (for production)
   - **Region**: Choose closest to your users
   - **Deployment source**: GitHub (or "Other" for manual)
6. Click "Review + Create" → "Create"

### 2. Get Deployment Token

1. Once created, go to your Static Web App resource
2. Click on "Overview"
3. Click "Manage deployment token" in the top menu
4. Copy the deployment token (keep it secure!)

### 3. Set Environment Variables in Azure

1. In your Static Web App resource, go to "Configuration"
2. Click "Application settings"
3. Add these variables:
   ```
   VITE_SUPABASE_PROJECT_ID = chsymveauapcrxywrsii
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoc3ltdmVhdWFwY3J4eXdyc2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTM3NzQsImV4cCI6MjA5MTc4OTc3NH0.0immZ6K508LPUm64x55SAxyFLvlZYjFPwrJJbyYBtwM
   VITE_SUPABASE_URL = https://chsymveauapcrxywrsii.supabase.co
   ```
4. Click "Save"

**Note**: These environment variables will be injected during build time on Azure.

### 4. Deploy Using Token

#### Option A: Using npm script
```bash
npm run deploy:azure <YOUR_DEPLOYMENT_TOKEN>
```

#### Option B: Using SWA CLI directly
```bash
# Build first
npm run build

# Deploy
npx swa deploy ./dist --deployment-token <YOUR_DEPLOYMENT_TOKEN>
```

#### Option C: Set token as environment variable (recommended)
```bash
# Add to your shell profile (~/.zshrc or ~/.bashrc)
export AZURE_SWA_DEPLOYMENT_TOKEN="your-deployment-token-here"

# Then deploy
npm run build
npx swa deploy ./dist --deployment-token $AZURE_SWA_DEPLOYMENT_TOKEN
```

## 🔒 Security Best Practices

### Local Development (.env file)
Your `.env` file contains your Supabase credentials for local development:
```env
VITE_SUPABASE_PROJECT_ID="chsymveauapcrxywrsii"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://chsymveauapcrxywrsii.supabase.co"
```

**Important**: 
- ✅ `.env` is in `.gitignore` - never commit it
- ✅ The anon/public key is safe to expose (it's read-only with RLS)
- ✅ Use Azure Application Settings for production
- ❌ Never commit your service_role key or database password

### Production (Azure)
Environment variables are stored in Azure Static Web Apps configuration and injected at build time. They are NOT exposed to the client in the final build.

## 📱 Mobile App Configuration

For iOS and Android apps, the Supabase credentials are bundled during the build. They use the same `.env` file during development and the same Azure environment variables when deployed.

### Building Mobile Apps with Production Config

1. **Ensure production env vars are set locally**:
   ```bash
   # Create .env.production
   cp .env .env.production
   ```

2. **Build for mobile**:
   ```bash
   npm run mobile:sync
   ```

3. **Open in native IDEs**:
   ```bash
   npm run ios:open      # For iOS
   npm run android:open  # For Android
   ```

## 🌐 Custom Domain (Optional)

1. In Azure Static Web App, go to "Custom domains"
2. Click "Add"
3. Follow instructions to add your domain
4. Azure will provide DNS records to add to your domain registrar

## 🔄 Continuous Deployment Options

### Manual Deployment (Current Setup)
- Run `npm run deploy:azure <TOKEN>` whenever you want to deploy
- Full control over when deployments happen

### GitHub Actions (Optional)
If you want automatic deployments on push to main:
1. Add deployment token to GitHub Secrets:
   - Go to your repo → Settings → Secrets → Actions
   - Add secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
2. The workflow will auto-deploy on push to main

## 📊 Monitoring

1. In Azure Portal, go to your Static Web App
2. Check:
   - **Metrics**: Traffic, errors, performance
   - **Logs**: Application logs and errors
   - **Deployment History**: See all deployments

## 🐛 Troubleshooting

### Build fails with missing environment variables
- Make sure you've added all three VITE_SUPABASE_* variables in Azure Application Settings

### App deployed but Supabase connection fails
- Check that the VITE_SUPABASE_URL is correct
- Verify the anon key is valid in Supabase Dashboard

### 404 errors on page refresh
- Already fixed with `staticwebapp.config.json` that redirects all routes to index.html

## 📝 Quick Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Azure
npm run deploy:azure $AZURE_SWA_DEPLOYMENT_TOKEN

# Mobile app development
npm run mobile:sync    # Build web + sync to mobile
npm run ios:open       # Open iOS in Xcode
npm run android:open   # Open Android in Android Studio
```

## 🎯 Next Steps

1. ✅ Supabase backend is configured
2. ✅ Azure Static Web Apps config created
3. ✅ Deployment script added
4. ⏳ Create Azure Static Web App resource
5. ⏳ Get deployment token
6. ⏳ Run first deployment
7. ⏳ Test the live app!

---

**Questions?** Check:
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Supabase Docs](https://supabase.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
