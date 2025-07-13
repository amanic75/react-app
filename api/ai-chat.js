// Production-ready AI Chat API endpoint for Vercel Functions
// This should be used instead of calling OpenAI directly from the frontend

import OpenAI from 'openai';

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side environment variable
});

// System prompt for chemical industry specialization
const SYSTEM_PROMPT = `You are a specialized AI assistant for Capacity Chemical's internal platform. You have expertise in:
- Chemical formulas and molecular structures
- Chemical safety protocols and regulations
- Material properties and specifications
- Supplier information and sourcing
- Laboratory procedures and best practices
- Regulatory compliance (OSHA, EPA, etc.)

Always prioritize safety in your responses and provide accurate, professional information relevant to chemical engineering and manufacturing.

When users upload files, analyze them for chemical data, safety information, formulas, or specifications.`;

// Simple rate limiting for Vercel Functions
const requestCounts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 50;
  
  const userRequests = requestCounts.get(ip) || [];
  const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return true;
  }
  
  validRequests.push(now);
  requestCounts.set(ip, validRequests);
  return false;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (isRateLimited(clientIP)) {
      return res.status(429).json({ 
        error: 'Too many AI requests from this IP, please try again later.' 
      });
    }

    // Validate user authentication (implement your auth logic here)
    // const user = await validateAuthToken(req.headers.authorization);
    // if (!user) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    const { message, conversationHistory = [], files = [] } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: buildUserMessage(message, files) }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      user: 'user-123', // Replace with actual user ID for monitoring
    });

    const aiResponse = completion.choices[0].message.content;

    // Log usage for monitoring (optional)
    console.log('AI Chat Request:', {
      timestamp: new Date().toISOString(),
      tokensUsed: completion.usage.total_tokens,
      model: completion.model,
      // userId: user.id,
    });

    return res.status(200).json({
      response: aiResponse,
      tokensUsed: completion.usage.total_tokens,
      model: completion.model,
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);

    // Handle OpenAI API errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'AI service temporarily unavailable. Please try again later.' 
      });
    }

    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait a moment and try again.' 
      });
    }

    // Generic error response
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}

// Helper function to build user message with file context
function buildUserMessage(text, files) {
  let message = text;
  
  if (files && files.length > 0) {
    message += '\n\nAttached files:\n';
    files.forEach(file => {
      message += `- ${file.name} (${file.type}, ${formatFileSize(file.size)})\n`;
    });
    
    // Add file-specific context
    const fileTypes = files.map(f => f.type);
    if (fileTypes.some(type => type.includes('pdf'))) {
      message += '\nPlease analyze any chemical data, safety information, or formulas in the PDF documents.';
    }
    if (fileTypes.some(type => type.includes('image'))) {
      message += '\nPlease analyze any chemical diagrams, formulas, or laboratory images.';
    }
    if (fileTypes.some(type => type.includes('csv') || type.includes('excel'))) {
      message += '\nPlease analyze the chemical data, material properties, or test results in the spreadsheet.';
    }
  }
  
  return message;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Vercel Functions deployment ready
// Environment variables: OPENAI_API_KEY 