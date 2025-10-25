# CMPC LIMS - Deployment Guide for Railway

This guide will walk you through deploying the CMPC LIMS application to Railway.

## Prerequisites

- GitHub account (already set up: https://github.com/arvergara/CMPC)
- Railway account (free tier available)

## Deployment Steps

### 1. Create Railway Account

1. Go to [Railway.app](https://railway.app/)
2. Sign up using your GitHub account
3. Authorize Railway to access your GitHub repositories

### 2. Deploy Backend

#### 2.1 Create Backend Project

1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose the repository: `arvergara/CMPC`
4. Railway will detect the Nest.js application

#### 2.2 Configure Backend Service

1. Go to project settings
2. Set **Root Directory**: `backend`
3. Railway will automatically detect the Dockerfile

#### 2.3 Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically:
   - Create a PostgreSQL instance
   - Generate a `DATABASE_URL` environment variable
   - Link it to your backend service

#### 2.4 Configure Environment Variables

In the backend service, go to "Variables" tab and add:

```bash
# Required Variables
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-url.railway.app  # Update after frontend deployment

# JWT Secrets (generate secure random strings)
JWT_SECRET=<generate-secure-random-string-64-chars>
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=<generate-secure-random-string-64-chars>
JWT_REFRESH_EXPIRATION=7d

# Password Hashing
BCRYPT_ROUNDS=12

# Email Configuration (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASSWORD=<your-app-password>
SMTP_FROM=noreply@cmpc.cl

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**Generate secure JWT secrets:**
```bash
# Run this twice to get two different secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2.5 Run Database Migrations

After the backend deploys successfully:

1. Go to the backend service
2. Click "Settings" → "Deploy"
3. In the deployment logs, find the Railway CLI connection command
4. Or use the following command in your local terminal:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run --service backend npx prisma migrate deploy

# Generate Prisma Client
railway run --service backend npx prisma generate
```

#### 2.6 Get Backend URL

1. Go to backend service settings
2. Find the public URL (e.g., `https://cmpc-lims-backend-production.up.railway.app`)
3. Save this URL for frontend configuration

### 3. Deploy Frontend

#### 3.1 Create Frontend Service

1. In the same Railway project, click "+ New"
2. Select "GitHub Repo" → Choose `arvergara/CMPC`
3. Create a new service

#### 3.2 Configure Frontend Service

1. Go to service settings
2. Set **Root Directory**: `frontend`
3. Railway will automatically detect the Dockerfile

#### 3.3 Configure Environment Variables

In the frontend service, go to "Variables" tab and add:

```bash
# Point to your backend URL (from step 2.6)
VITE_API_URL=https://your-backend-url.railway.app/api

# Application info
VITE_APP_NAME=CMPC LIMS
VITE_APP_VERSION=1.0.0
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_DEBUG=false
```

#### 3.4 Get Frontend URL

1. Go to frontend service settings
2. Find the public URL (e.g., `https://cmpc-lims-frontend-production.up.railway.app`)
3. Copy this URL

### 4. Update Backend FRONTEND_URL

1. Go back to backend service
2. Update the `FRONTEND_URL` variable with your actual frontend URL
3. Redeploy backend service

### 5. Seed Initial Data (Optional)

To create an admin user and initial data:

```bash
# Using Railway CLI
railway run --service backend npm run seed

# Or create manually via API:
# POST https://your-backend-url.railway.app/api/auth/register
# Body: {
#   "email": "admin@cmpc.cl",
#   "password": "SecurePassword123!",
#   "nombre": "Admin",
#   "rol": "ADMIN"
# }
```

### 6. Test the Deployment

1. Open your frontend URL in a browser
2. You should see the CMPC LIMS login page
3. Try logging in with your credentials
4. Test key functionality:
   - Create a requirement
   - Create a sample
   - View dashboard statistics

## Architecture Overview

```
┌─────────────────┐
│   GitHub Repo   │
│  arvergara/CMPC │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────────┐
│          Railway Project               │
│                                        │
│  ┌──────────────┐  ┌──────────────┐  │
│  │   Backend    │  │   Frontend   │  │
│  │  (NestJS)    │  │   (React)    │  │
│  │              │  │              │  │
│  │  Port: 3000  │  │  Port: 80    │  │
│  └──────┬───────┘  └──────────────┘  │
│         │                             │
│         ▼                             │
│  ┌──────────────┐                    │
│  │ PostgreSQL   │                    │
│  │   Database   │                    │
│  └──────────────┘                    │
└────────────────────────────────────────┘
```

## Monitoring and Logs

### View Logs

1. Go to your service in Railway
2. Click on "Deployments"
3. Select a deployment to view logs

### Monitor Resources

1. Go to service settings
2. Click "Metrics" to view:
   - CPU usage
   - Memory usage
   - Network activity

### Set Up Alerts (Optional)

Railway doesn't have built-in alerting, but you can integrate with:
- Sentry for error tracking
- Better Uptime for uptime monitoring

## Common Issues and Solutions

### Backend fails to connect to database

**Issue**: `Cannot connect to PostgreSQL`

**Solution**: 
1. Ensure PostgreSQL service is running
2. Check that `DATABASE_URL` is automatically set
3. Verify network connectivity in Railway dashboard

### Frontend shows "Network Error"

**Issue**: Frontend can't reach backend

**Solution**:
1. Verify `VITE_API_URL` is set correctly
2. Check backend is running and accessible
3. Ensure CORS is configured (already done in backend)

### Database migrations fail

**Issue**: `Migration failed` or `Schema out of sync`

**Solution**:
```bash
# Reset migrations (CAREFUL: This deletes data!)
railway run --service backend npx prisma migrate reset

# Or force deploy migrations
railway run --service backend npx prisma migrate deploy --force
```

### Application crashes on startup

**Issue**: Service stops immediately after starting

**Solution**:
1. Check logs for error messages
2. Verify all required environment variables are set
3. Ensure Dockerfile is building correctly

## Cost Estimation

### Free Tier (Railway)
- $5 free credit per month
- Enough for development/testing
- Includes:
  - Backend service
  - Frontend service  
  - PostgreSQL database

### Paid Plan (if needed)
- Usage-based pricing
- Estimated ~$10-20/month for small production use
- Scales automatically based on traffic

## Updating the Application

When you push changes to GitHub:

1. Railway automatically detects changes
2. Triggers a new build
3. Deploys if build succeeds
4. Zero-downtime deployment

To manually trigger deployment:
1. Go to service in Railway
2. Click "Deploy" → "Redeploy"

## Security Checklist

- [ ] Set strong JWT secrets (64+ characters, random)
- [ ] Configure SMTP for production email service
- [ ] Enable HTTPS (automatic in Railway)
- [ ] Set secure password policy
- [ ] Review CORS settings
- [ ] Enable rate limiting (already configured)
- [ ] Set up error monitoring (Sentry)
- [ ] Regular database backups (Railway auto-backup)

## Support

For Railway-specific issues:
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)

For CMPC LIMS issues:
- GitHub Repository: https://github.com/arvergara/CMPC

## Quick Reference

```bash
# Railway CLI Commands
railway login                           # Login to Railway
railway link                            # Link to project
railway run --service backend <cmd>     # Run command in backend
railway run --service frontend <cmd>    # Run command in frontend
railway logs --service backend          # View backend logs
railway logs --service frontend         # View frontend logs

# Useful Database Commands
railway run --service backend npx prisma migrate deploy
railway run --service backend npx prisma migrate reset
railway run --service backend npx prisma studio  # Open Prisma Studio
railway run --service backend npx prisma db push  # Push schema changes
```

## Next Steps

After successful deployment:

1. Configure SMTP for email notifications
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Create initial admin users
5. Import existing data if needed
6. Train users on the system

Congratulations! Your CMPC LIMS is now deployed and ready to use! 🎉
