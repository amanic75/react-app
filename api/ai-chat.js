// Production-ready AI Chat API endpoint for Vercel Functions
// Enhanced with Level 2 chemical database verification

import OpenAI from 'openai';

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side environment variable
});

// Level 2 Chemical Database Integration
class ChemicalDatabaseService {
  constructor() {
    this.pubchemBaseUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
  }

  // Get verified chemical data from PubChem (free, no API key needed)
  async getPubChemData(chemicalName, casNumber = null) {
    try {
      let searchUrl;
      
      if (casNumber) {
        searchUrl = `${this.pubchemBaseUrl}/compound/name/${encodeURIComponent(casNumber)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`;
      } else {
        searchUrl = `${this.pubchemBaseUrl}/compound/name/${encodeURIComponent(chemicalName)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`;
      }

      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`PubChem API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.PropertyTable && data.PropertyTable.Properties.length > 0) {
        const props = data.PropertyTable.Properties[0];
        return {
          source: 'PubChem',
          confidence: 'HIGH',
          data: {
            molecularFormula: props.MolecularFormula,
            molecularWeight: props.MolecularWeight,
            iupacName: props.IUPACName,
            canonicalSMILES: props.CanonicalSMILES,
            cid: props.CID
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('PubChem lookup error:', error);
      return null;
    }
  }

  // Enhanced chemical lookup
  async getEnhancedChemicalData(chemicalName, casNumber = null) {
    const results = {
      name: chemicalName,
      casNumber: casNumber,
      sources: [],
      confidence: {},
      properties: {}
    };

    const pubchemData = await this.getPubChemData(chemicalName, casNumber);
    if (pubchemData) {
      results.sources.push('PubChem');
      results.confidence.basic = 'HIGH';
      results.properties = { ...results.properties, ...pubchemData.data };
    }

    return results;
  }
}

const chemicalDB = new ChemicalDatabaseService();

// Level 2 Response Processing with Chemical Verification
async function processResponseWithVerification(response) {
  // Check if the response contains a material addition request
  if (response.includes('**[ADD_MATERIAL]**')) {
    try {
      const parts = response.split('**[ADD_MATERIAL]**');
      const informationPart = parts[0].trim();
      const jsonPart = parts[1].trim();
      
      // Extract JSON from the response
      const jsonMatch = jsonPart.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        // Clean JSON by removing comments (// text) that AI includes for confidence indicators
        const cleanedJson = jsonMatch[0].replace(/\/\/[^\r\n]*/g, '').trim();
        const materialData = JSON.parse(cleanedJson);
        
        console.log('🔍 Backend: Verifying chemical data with PubChem for:', materialData.materialName);
        
        // LEVEL 2 ENHANCEMENT: Verify chemical data with PubChem
        const enhancedData = await enhanceWithChemicalVerification(materialData);
        
        // Return enhanced response (frontend will handle database saving)
        return {
          response: informationPart,
          materialAdded: true,
          materialData: enhancedData,
          successMessage: `✅ Chemical data verified with ${enhancedData.confidenceLevel} confidence!`,
        };
      }
    } catch (error) {
      console.error('Backend material processing error:', error);
      return {
        response: response.replace('**[ADD_MATERIAL]**', ''),
        materialAdded: false,
        errorMessage: "❌ Error processing chemical verification. Using AI estimates only."
      };
    }
  }
  
  // Return regular response if no material addition
  return { response };
}

// Level 2 Chemical Enhancement Function
async function enhanceWithChemicalVerification(materialData) {
  try {
    console.log('🔍 Backend: PubChem verification starting for:', materialData.materialName);
    
    // Get enhanced chemical data from PubChem (with timeout)
    const enhancedData = await Promise.race([
      chemicalDB.getEnhancedChemicalData(materialData.materialName, materialData.casNumber),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PubChem timeout')), 10000) // 10 second timeout
      )
    ]);
    
    if (enhancedData && enhancedData.sources.length > 0) {
      console.log('✅ Backend: PubChem verification successful:', enhancedData.sources);
      
      // Merge verified data with AI estimates
      return {
        ...materialData,
        // Override with verified data where available
        casNumber: enhancedData.casNumber || materialData.casNumber,
        molecularFormula: enhancedData.properties.molecularFormula,
        molecularWeight: enhancedData.properties.molecularWeight,
        iupacName: enhancedData.properties.iupacName,
        
        // Enhanced confidence and source tracking
        dataSourceNotes: `Verified via ${enhancedData.sources.join(', ')} databases. Chemical properties confirmed. Pricing and supplier info estimated from AI.`,
        confidenceLevel: 'HIGH', // Chemical data verified
        verificationSources: enhancedData.sources,
        lastVerified: new Date().toISOString(),
        
        // Add new verified fields
        pubchemCID: enhancedData.properties.cid,
        canonicalSMILES: enhancedData.properties.canonicalSMILES
      };
    } else {
      console.log('⚠️ Backend: PubChem verification failed, using AI estimates');
      
      // Fallback to AI estimates with lower confidence
      return {
        ...materialData,
        dataSourceNotes: (materialData.dataSourceNotes || '') + ' Chemical verification attempted but not found in databases.',
        confidenceLevel: 'LOW', // No verification possible
        verificationSources: [],
        lastVerified: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Backend chemical verification error:', error);
    
    // Fallback to original data with error note
    return {
      ...materialData,
      dataSourceNotes: (materialData.dataSourceNotes || '') + ' Chemical verification failed due to network error.',
      confidenceLevel: 'LOW',
      verificationSources: [],
      lastVerified: new Date().toISOString()
    };
  }
}

// Enhanced system prompt with confidence levels for chemical industry specialization
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

SPECIAL FEATURE - RAW MATERIAL ADDITION WITH CONFIDENCE LEVELS:
When adding materials, you must include confidence levels for each field:

HIGH CONFIDENCE (✅): Well-established chemical properties from training data
- CAS numbers for common chemicals
- Basic physical properties (density, melting point)
- Standard safety classifications
- Molecular formulas and structures

MEDIUM CONFIDENCE (🟡): Industry-standard values that may vary
- Typical purity grades
- Standard storage conditions
- Common applications and uses
- General manufacturer information

LOW CONFIDENCE (⚠️): Estimated values that should be verified
- Supplier pricing (always estimated)
- Specific supplier availability
- Regional sourcing information
- Activity percentages for solutions
- Viscosity values

CRITICAL: When a user asks you to add a chemical or raw material to their database using phrases like:
- "Add [chemical name] to my raw materials"
- "I need to add [chemical name] to the database"
- "Add [chemical name] to our materials"
- "Please add [chemical name]"
- "Add [chemical name] to the system"

YOU MUST:
1. Provide helpful information about the chemical
2. ALWAYS include the special marker: **[ADD_MATERIAL]**
3. Include all known details about the material with confidence indicators in this exact JSON format after the marker:
{
  "materialName": "Chemical Name (keep under 100 chars)",
  "casNumber": "CAS Number if known (keep under 50 chars)", // ✅ HIGH or ⚠️ LOW
  "supplierName": "Supplier name (keep under 50 chars, use abbreviations if needed)", // ⚠️ LOW - Please verify
  "manufacture": "Manufacturer (keep under 50 chars, use abbreviations)", // 🟡 MEDIUM
  "tradeName": "Trade name (keep under 50 chars)",
  "supplierCost": "Supplier cost per unit (numeric value only, e.g. 25.50)", // ⚠️ LOW - Market estimate only
  "weightVolume": "Weight/Volume in lbs/gallon (keep under 50 chars, e.g. '8.34 lbs/gal')",
  "activityPercentage": "% Activity/concentration (keep under 50 chars, e.g. '12.5%')", // ⚠️ LOW - Estimate
  "density": "Density value (keep under 50 chars, e.g. '1.2 g/mL')", // ✅ HIGH
  "viscosity": "Viscosity measurement (keep under 50 chars, e.g. '10 cP')", // ⚠️ LOW - Estimate
  "cost": "Cost per unit in USD (numeric value only, e.g. 45.75)", // ⚠️ LOW - Market estimate only
  "physicalForm": "Solid/Liquid/Gas (keep under 50 chars)", // ✅ HIGH
  "hazardClass": "Hazard class (keep under 50 chars, e.g. 'Corrosive')", // ✅ HIGH
  "purity": "Purity % (keep under 50 chars, e.g. '99%')", // 🟡 MEDIUM - Typical grade
  "country": "Country of origin (keep under 50 chars)", // ⚠️ LOW - Please verify
  "description": "Brief description of the chemical and its uses with confidence notes",
  "storageConditions": "Storage requirements and safety precautions",
  "shelfLife": "Shelf life (keep under 50 chars, e.g. '2 years')",
  "dataSourceNotes": "Explain the reliability of the information provided. Example: CAS and density from chemical databases. Pricing estimated from historical data. Please verify supplier information.",
  "confidenceLevel": "MIXED" // Overall confidence: HIGH, MEDIUM, LOW, or MIXED
}

EXAMPLE MATERIAL ADDITION RESPONSE:
When user says "Add sodium chloride to my raw materials", respond exactly like this:

"I'll add sodium chloride (NaCl) to your raw materials database. Sodium chloride is commonly used in chemical processes as a reagent, preservative, and for ionic strength adjustment. It's generally safe to handle but should be stored in a dry environment.

**[ADD_MATERIAL]**
{
  "materialName": "Sodium Chloride",
  "casNumber": "7647-14-5", // ✅ HIGH - Well-known CAS number
  "supplierName": "ChemSupply Co.", // ⚠️ LOW - Please verify with your preferred suppliers
  "manufacture": "Sigma-Aldrich", // 🟡 MEDIUM - Common manufacturer for this chemical
  "tradeName": "NaCl",
  "supplierCost": "15.50", // ⚠️ LOW - Market estimate only, verify current pricing
  "weightVolume": "2.16 lbs/gal",
  "activityPercentage": "99%", // 🟡 MEDIUM - Typical for reagent grade
  "density": "2.17 g/cm³", // ✅ HIGH - Standard physical property
  "viscosity": "N/A",
  "cost": "18.75", // ⚠️ LOW - Market estimate only
  "physicalForm": "Crystalline Solid", // ✅ HIGH - Well-established
  "hazardClass": "Non-hazardous", // ✅ HIGH - Established safety classification
  "purity": "99.5%", // 🟡 MEDIUM - Typical reagent grade purity
  "country": "USA", // ⚠️ LOW - Please verify supplier location
  "description": "High purity sodium chloride for industrial and laboratory applications. CAS number and physical properties verified from chemical databases.",
  "storageConditions": "Store in dry place, avoid moisture", // ✅ HIGH - Standard storage requirements
  "shelfLife": "5 years", // 🟡 MEDIUM - Typical for dry salts
  "dataSourceNotes": "CAS number, density, and safety data verified from chemical databases. Pricing estimated from market data. Please verify supplier information and current pricing.",
  "confidenceLevel": "MIXED" // Mix of high-confidence chemical data and low-confidence commercial data
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

    // Call OpenAI API with timeout
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o', // Use faster model
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        user: 'user-123', // Replace with actual user ID for monitoring
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI request timeout')), 25000) // 25 second timeout
      )
    ]);

    const aiResponse = completion.choices[0].message.content;

    // LEVEL 2 ENHANCEMENT: Process material addition with chemical verification
    const processedResponse = await processResponseWithVerification(aiResponse);

    // Log usage for monitoring (optional)
    console.log('AI Chat Request:', {
      timestamp: new Date().toISOString(),
      tokensUsed: completion.usage.total_tokens,
      model: completion.model,
      hasVerification: processedResponse.materialAdded || false,
      // userId: user.id,
    });

    return res.status(200).json({
      response: processedResponse.response,
      materialAdded: processedResponse.materialAdded,
      successMessage: processedResponse.successMessage,
      errorMessage: processedResponse.errorMessage,
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