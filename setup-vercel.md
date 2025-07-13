# Vercel Environment Variables Setup

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

Your AI chatbot is now production-ready with enterprise-grade security! 🎉 