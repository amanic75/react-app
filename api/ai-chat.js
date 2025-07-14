// Production-ready AI Chat API endpoint for Vercel Functions
// This should be used instead of calling OpenAI directly from the frontend

import OpenAI from 'openai';

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side environment variable
});

// System prompt for chemical industry specialization
const SYSTEM_PROMPT = `You are a specialized AI assistant for Capacity Chemical's internal platform. You ONLY answer questions related to chemistry, chemical engineering, and chemical safety.

Your expertise includes:
- Chemical formulas and molecular structures
- Chemical reactions and mechanisms
- Chemical safety protocols and regulations
- Material properties and specifications
- Laboratory procedures and best practices
- Chemical process engineering
- Regulatory compliance (OSHA, EPA, etc.)
- Chemical supplier information and sourcing
- Industrial chemistry applications

SPECIAL FEATURE - RAW MATERIAL ADDITION:
CRITICAL: When a user asks you to add a chemical or raw material to their database using phrases like:
- "Add [chemical name] to my raw materials"
- "I need to add [chemical name] to the database"
- "Add [chemical name] to our materials"
- "Please add [chemical name]"
- "Add [chemical name] to the system"

YOU MUST:
1. Provide helpful information about the chemical
2. ALWAYS include the special marker: **[ADD_MATERIAL]**
3. Include all known details about the material in this exact JSON format after the marker:
{
  "materialName": "Chemical Name (keep under 100 chars)",
  "casNumber": "CAS Number if known (keep under 50 chars)",
  "supplierName": "Supplier name (keep under 50 chars, use abbreviations if needed)",
  "manufacture": "Manufacturer (keep under 50 chars, use abbreviations)",
  "tradeName": "Trade name (keep under 50 chars)",
  "supplierCost": "Supplier cost per unit (numeric value only, e.g. 25.50)",
  "weightVolume": "Weight/Volume in lbs/gallon (keep under 50 chars, e.g. '8.34 lbs/gal')",
  "activityPercentage": "% Activity/concentration (keep under 50 chars, e.g. '12.5%')",
  "density": "Density value (keep under 50 chars, e.g. '1.2 g/mL')",
  "viscosity": "Viscosity measurement (keep under 50 chars, e.g. '10 cP')",
  "cost": "Cost per unit in USD (numeric value only, e.g. 45.75)",
  "physicalForm": "Solid/Liquid/Gas (keep under 50 chars)",
  "hazardClass": "Hazard class (keep under 50 chars, e.g. 'Corrosive')",
  "purity": "Purity % (keep under 50 chars, e.g. '99%')",
  "country": "Country of origin (keep under 50 chars)",
  "description": "Brief description of the chemical and its uses",
  "storageConditions": "Storage requirements and safety precautions",
  "shelfLife": "Shelf life (keep under 50 chars, e.g. '2 years')"
}

EXAMPLE MATERIAL ADDITION RESPONSE:
When user says "Add sodium chloride to my raw materials", respond exactly like this:

"I'll add sodium chloride (NaCl) to your raw materials database. Sodium chloride is commonly used in chemical processes as a reagent, preservative, and for ionic strength adjustment. It's generally safe to handle but should be stored in a dry environment.

**[ADD_MATERIAL]**
{
  "materialName": "Sodium Chloride",
  "casNumber": "7647-14-5",
  "supplierName": "ChemSupply Co.",
  "manufacture": "Sigma-Aldrich",
  "tradeName": "NaCl",
  "supplierCost": "15.50",
  "weightVolume": "2.16 lbs/gal",
  "activityPercentage": "99%",
  "density": "2.17 g/cm³",
  "viscosity": "N/A",
  "cost": "18.75",
  "physicalForm": "Crystalline Solid",
  "hazardClass": "Non-hazardous",
  "purity": "99.5%",
  "country": "USA",
  "description": "High purity sodium chloride for industrial and laboratory applications",
  "storageConditions": "Store in dry place, avoid moisture",
  "shelfLife": "5 years"
}

IMPORTANT: 
- Research and provide accurate chemical data including CAS numbers, densities, hazard classifications, and typical uses
- Include supplier cost and cost information when possible (use reasonable estimates based on market data)
- For % Activity, provide the active ingredient concentration if it's a solution or mixture
- Keep short fields (marked with character limits) concise to fit database constraints
- Use abbreviations when necessary for field length limits
- Always prioritize safety information in hazard class and storage conditions

IMPORTANT INSTRUCTIONS:
- If a question is NOT related to chemistry, chemical engineering, or chemical safety, politely decline to answer
- Respond with: "I'm a specialized chemistry assistant and can only help with chemistry-related questions. Please ask me about chemical formulas, reactions, safety protocols, or other chemistry topics."
- Always prioritize safety in your chemical responses
- Provide accurate, professional information relevant to chemical engineering and manufacturing
- When users upload files, only analyze them for chemical data, safety information, formulas, or specifications
- For material addition requests, be thorough and include safety information

Stay focused on your chemistry specialty and politely redirect non-chemistry questions.`;

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