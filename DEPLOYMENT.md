# AttendEasy - Monorepo Deployment Guide

## Repository Structure

```
class-companion/
├── src/              # Frontend React app
├── server/           # Backend Node.js API
│   ├── src/
│   ├── package.json
│   └── .env
├── render.yaml       # Render deployment config
└── package.json      # Frontend dependencies
```

## Deploy to Render.com

### 1. Push to GitHub

```bash
cd class-companion
git add .
git commit -m "Add backend server for monorepo deployment"
git push
```

### 2. Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +" → "PostgreSQL"**
3. Configure:
   - Name: `attendeasy-db`
   - Database: `attendeasy`
   - Region: Singapore (or closest)
   - Plan: **Free**
4. Click **"Create Database"**
5. Copy the **Internal Database URL**

### 3. Deploy Backend API

1. Click **"New +" → "Web Service"**
2. Connect your **class-companion** repository
3. Configure:
   - **Name**: `attendeasy-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste-internal-database-url>
   JWT_SECRET=<generate-random-string>
   ALLOWED_ORIGINS=https://your-frontend.netlify.app
   ```

5. Click **"Create Web Service"**

### 4. Initialize Database

Use Render Shell:
```bash
cd src/db
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < clear-and-setup-users.sql
```

### 5. Update Frontend

Update `class-companion/.env`:
```env
VITE_API_URL=https://attendeasy-api.onrender.com/api
```

Commit and push to trigger Netlify redeploy.

## Test Deployment

```bash
# Health check
curl https://attendeasy-api.onrender.com/health

# Login test
curl -X POST https://attendeasy-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@college.edu","password":"teacher123"}'
```

## Default Accounts

**Teacher:**
- Email: `teacher@college.edu`
- Password: `teacher123`

**Student:**
- Email: `student@college.edu`
- Password: `student123`

## Important Notes

- ⚠️ Free tier spins down after 15 min inactivity (30-60s cold start)
- Database has 90-day retention on free tier
- Update `ALLOWED_ORIGINS` with your exact Netlify URL

## Your API URL

```
https://attendeasy-api.onrender.com
```
