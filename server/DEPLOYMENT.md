# AttendEasy Backend - Deployment Guide

Quick reference for deploying to Render.com

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

## Quick Setup

1. **Create PostgreSQL Database**
   - Name: `attendeasy-db`
   - Plan: Free
   - Copy Internal Database URL

2. **Create Web Service**
   - Repository: Your GitHub repo
   - Build: `npm install`
   - Start: `npm start`
   - Add environment variables (see below)

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-database-url>
   JWT_SECRET=<generate-random-string>
   ALLOWED_ORIGINS=https://your-frontend.netlify.app
   ```

4. **Initialize Database**
   - Use Render Shell or external client
   - Run `schema.sql` and `setup-users.sql`

## API Endpoint

Your API will be available at:
```
https://attendeasy-api.onrender.com
```

## Test Deployment

```bash
curl https://attendeasy-api.onrender.com/health
```

## Update Frontend

Update `.env` in your frontend:
```
VITE_API_URL=https://attendeasy-api.onrender.com/api
```

## Default Accounts

After running setup scripts:

**Teacher:**
- Email: `teacher@college.edu`
- Password: `teacher123`

**Student:**
- Email: `student@college.edu`
- Password: `student123`

## Support

See full deployment guide in the artifacts for detailed instructions.
