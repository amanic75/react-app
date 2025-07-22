# Production API Setup Guide

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