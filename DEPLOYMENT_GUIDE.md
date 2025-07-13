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

Your AI chatbot is ready for production with proper security measures! 