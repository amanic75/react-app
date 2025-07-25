# AI Chatbot Deployment Guide

## 🚨 Current Issue: Vercel Environment Variable Missing

**Error:** `OPENAI_API_KEY environment variable is missing or empty`

**Quick Fix:** Add environment variable to Vercel dashboard.

## 🚀 Option 1: Quick Fix (Current Setup)

### Add Environment Variable to Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (`internship-qb22`)
3. Go to **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add new variable:
   - **Name:** `VITE_OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (starts with `sk-`)
   - **Environment:** All (Production, Preview, Development)
6. **Redeploy** your project

### Security Warning:
⚠️ This exposes your API key to users (can be seen in browser dev tools)
✅ Only use this for development/demo purposes

## 🔒 Option 2: Production-Ready (Recommended)

### Backend API Setup:

#### A. Deploy to Vercel Functions:
1. **Move API file:**
   ```bash
   mkdir -p api
   # The api/ai-chat.js file is already created
   ```

2. **Set server-side environment variables in Vercel:**
   - **Name:** `OPENAI_API_KEY` (no VITE_ prefix)
   - **Value:** Your OpenAI API key
   - **Environment:** All environments

3. **Configure frontend:** Add to your `.env`:
   ```
   VITE_API_ENDPOINT=/api/ai-chat
   ```

#### B. Alternative: Deploy to Railway/Render:
1. **Create new project** on Railway/Render
2. **Deploy** the backend API
3. **Set environment variables** on the platform
4. **Update frontend** to use your API URL

### Frontend Configuration:
The updated `aiService.js` automatically detects:
- **Development:** Uses direct OpenAI calls
- **Production:** Uses backend API endpoint

## 📊 Comparison

| Method | Security | Cost | Complexity | Recommended For |
|--------|----------|------|------------|-----------------|
| **Option 1** | ⚠️ Low | 💰 Direct | 🟢 Simple | Development/Demo |
| **Option 2** | ✅ High | 💰 Same | 🟡 Medium | Production |

## 🎯 Recommended Steps

### For Immediate Testing:
1. **Use Option 1** - Add environment variable to Vercel
2. **Test the chatbot** functionality
3. **Verify everything works**

### For Production:
1. **Implement Option 2** - Deploy backend API
2. **Remove frontend API key** exposure
3. **Add authentication** and rate limiting

## 🔧 Backend API Features

The `api/ai-chat.js` file includes:
- ✅ **Rate limiting** (50 requests per 15 minutes)
- ✅ **Error handling** for OpenAI API failures
- ✅ **Authentication hooks** (ready to implement)
- ✅ **Usage monitoring** and logging
- ✅ **Input validation** and sanitization

## 🚀 Next Steps

1. **Quick Fix:** Add environment variable to Vercel now
2. **Test:** Verify chatbot works in production
3. **Upgrade:** Implement backend API for security
4. **Monitor:** Track usage and costs

## 📞 Support

If you encounter issues:
- Check Vercel build logs
- Verify environment variables are set
- Test API endpoints directly
- Monitor OpenAI usage dashboard

Your AI chatbot is ready for production with proper security measures! # Vercel Environment Variables Setup

## 🔐 Required Environment Variables

### In Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (`internship-qb22`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

#### **Backend API Variable (CRITICAL):**
- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key (starts with `sk-`)
- **Environment:** All (Production, Preview, Development)
- **Description:** Server-side OpenAI API key (hidden from users)

#### **Frontend Configuration (Optional):**
- **Name:** `VITE_API_ENDPOINT`
- **Value:** `/api/ai-chat`
- **Environment:** All (Production, Preview, Development)
- **Description:** Backend API endpoint path

## 🚀 Deploy Steps

### 1. Set Environment Variables
Follow the steps above to add the environment variables in Vercel.

### 2. Deploy
Either:
- **Push to Git:** Commit and push your changes
- **Manual Deploy:** Click "Deploy" in Vercel dashboard

### 3. Test
- Open your deployed app
- Try the AI chatbot
- Check for any errors in browser console

## 🔍 Verification

### Check if Backend API is Working:
1. Open browser dev tools (F12)
2. Go to Network tab
3. Send a message in chatbot
4. Look for POST request to `/api/ai-chat`
5. Should return 200 status with AI response

### Expected Behavior:
- ✅ No exposed API key in frontend
- ✅ API calls go to `/api/ai-chat` endpoint
- ✅ Fast responses from GPT-4o
- ✅ Proper error handling

## 🚨 Security Check

### Frontend (Browser Dev Tools):
- ❌ Should NOT see `OPENAI_API_KEY` in frontend
- ✅ Should see `VITE_API_ENDPOINT` (safe to expose)

### Backend (Server-side):
- ✅ `OPENAI_API_KEY` only exists on server
- ✅ API key never sent to browser
- ✅ All AI requests go through your backend

## 📊 Cost & Performance

### Benefits:
- 🔒 **Secure:** API key hidden from users
- 📈 **Scalable:** Serverless functions auto-scale
- 💰 **Cost-effective:** Pay per request
- 🚀 **Fast:** Vercel edge network

### Monitoring:
- Check Vercel Function logs
- Monitor OpenAI usage dashboard
- Track response times

Your AI chatbot is now production-ready with enterprise-grade security! 🎉 # Easy Demo Setup for Chemformation App

## Step 1: Run the Database Setup
In your Supabase SQL Editor, run the `database_complete_setup.sql` script. This will:
- Set up all the database schema
- Add user tracking and authentication
- Populate all the mock data (formulas, raw materials, suppliers)

## Step 2: Create Demo Users
Since Supabase auth requires proper user creation, create these users manually through the Supabase Auth interface:

### Option A: Through Supabase Dashboard
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user" and create:
   - **admin@chemformation.com** / password123
   - **manager@chemformation.com** / password123  
   - **employee@chemformation.com** / password123

### Option B: Through Your App
1. Open your app at http://localhost:5187
2. Click "Sign up" and create the demo accounts
3. The user profiles will be automatically created with default employee role

## Step 3: Update User Roles (Optional)
If you want the proper roles (admin/manager), run this SQL after creating the users:

```sql
-- Update roles for demo users
UPDATE user_profiles 
SET role = 'admin', department = 'Management' 
WHERE email = 'admin@chemformation.com';

UPDATE user_profiles 
SET role = 'manager', department = 'Operations' 
WHERE email = 'manager@chemformation.com';

UPDATE user_profiles 
SET role = 'employee', department = 'Production' 
WHERE email = 'employee@chemformation.com';
```

## Step 4: Update Data Ownership (Optional)
To properly assign the mock data to demo users, first get their user IDs:

```sql
-- Get user IDs
SELECT id, email, first_name, last_name, role FROM user_profiles;
```

Then update the mock data with real user IDs:

```sql
-- Example: Replace the placeholder UUIDs with real ones
-- UPDATE raw_materials SET created_by = 'REAL_ADMIN_UUID' WHERE created_by = '00000000-0000-0000-0000-000000000001';
-- UPDATE formulas SET created_by = 'REAL_ADMIN_UUID' WHERE created_by = '00000000-0000-0000-0000-000000000001';
-- UPDATE suppliers SET created_by = 'REAL_ADMIN_UUID' WHERE created_by = '00000000-0000-0000-0000-000000000001';
```

## That's it! 🎉

You now have:
- ✅ Full authentication system
- ✅ Demo users with different roles
- ✅ All mock data (10 raw materials, 8 formulas, 8 suppliers)
- ✅ Proper user assignments and filtering
- ✅ All CRUD operations working

## Demo Credentials
- **Admin**: admin@chemformation.com / password123
- **Manager**: manager@chemformation.com / password123  
- **Employee**: employee@chemformation.com / password123

Each user will see different data based on what's assigned to them or created by them! # Production API Setup Guide

## Required Environment Variables

For the password change API to work in production, you need to set the following environment variables in your Vercel dashboard:

### Frontend Variables (already configured)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Variables (required for API)
```
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Local Development Setup

### 1. Create Environment File
Create a `.env.local` file in your project root:
```bash
# Frontend Variables
VITE_SUPABASE_URL=https://scwyzonphgbhfirwwnov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd3l6b25waGdiaGZpcnd3bm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzQ2MTMsImV4cCI6MjA2NzQxMDYxM30.XTqP3aOLIVfyw9kpdawVfqFAiYg8USJaZVLi478wq3I

# Backend Variable (ADD YOUR SERVICE ROLE KEY HERE)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_goes_here
```

### 2. Get Your Service Role Key
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings → API**
4. Copy the **"service_role"** key (the long one at the bottom)
5. Replace `your_service_role_key_goes_here` in `.env.local`

### 3. Start Development Server
```bash
npm run dev
```

This command now starts both:
- **Frontend**: Vite dev server on `http://localhost:5173`
- **API Server**: Express server on `http://localhost:3001`
- **Proxy**: Vite automatically proxies `/api/*` requests to the API server

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the `SUPABASE_SERVICE_ROLE_KEY` variable
5. Set it to your Supabase service role key (found in Supabase dashboard → Settings → API)

## Security Notes

⚠️ **IMPORTANT**: The service role key should NEVER be exposed to the frontend or committed to your repository. It provides admin-level access to your Supabase project.

## API Endpoint

The password change API is available at:
```
POST /api/admin/change-password
```

### Required Permissions
- Only users with "Capacity Admin" role can use this API
- The API validates the admin's session token before allowing password changes

### Request Format
```json
{
  "targetEmail": "user@example.com",
  "newPassword": "newSecurePassword",
  "adminToken": "admin_session_token"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Password successfully changed for user@example.com",
  "type": "admin-update",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Architecture

### Local Development
- **Frontend**: Vite dev server (`localhost:5173`)
- **API**: Express server (`localhost:3001`)
- **Proxy**: Vite proxies `/api/*` to Express server

### Production (Vercel)
- **Frontend**: Static files served by Vercel
- **API**: Serverless functions in `/api/` folder
- **Routing**: Vercel handles routing automatically

## Features

✅ Secure server-side password changes  
✅ Admin permission validation  
✅ Input validation and sanitization  
✅ Comprehensive error handling  
✅ Audit logging  
✅ Security headers  
✅ Rate limiting protection (via Vercel)  
✅ Local development environment  
✅ Production-ready deployment  

## Testing Locally

1. Ensure `.env.local` has your service role key
2. Run `npm run dev`
3. Open `http://localhost:5173`
4. Log in with a Capacity Admin account
5. Test password changes in User Management

## Debugging

- **API Server Logs**: Check terminal for Express server output
- **Frontend Logs**: Check browser console
- **Network Tab**: Verify API calls are hitting `localhost:3001`
- **Health Check**: Visit `http://localhost:3001/api/health` 