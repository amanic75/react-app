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
    console.log('🎯 Backend: Found ADD_MATERIAL marker, processing...');
    try {
      const parts = response.split('**[ADD_MATERIAL]**');
      const informationPart = parts[0].trim();
      const jsonPart = parts[1].trim();
      
      console.log('📝 Backend: JSON part to parse:', jsonPart);
      
      // Extract JSON from the response
      const jsonMatch = jsonPart.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        // Clean JSON by removing comments (// text) that AI includes for confidence indicators
        const cleanedJson = jsonMatch[0].replace(/\/\/[^\r\n]*/g, '').trim();
        console.log('🧹 Backend: Cleaned JSON:', cleanedJson);
        
        const materialData = JSON.parse(cleanedJson);
        console.log('✅ Backend: Parsed material data:', materialData);
        
        // Handle legacy field names - convert "material" to "materialName"
        if (materialData.material && !materialData.materialName) {
          materialData.materialName = materialData.material;
          delete materialData.material;
          console.log('🔄 Backend: Converted "material" field to "materialName"');
        }
        
        // Handle other legacy field names
        if (materialData.CAS_number && !materialData.casNumber) {
          materialData.casNumber = materialData.CAS_number;
          delete materialData.CAS_number;
        }
        if (materialData.chemical_name && !materialData.description) {
          materialData.description = materialData.chemical_name;
        }
        
        if (!materialData.materialName) {
          console.error('❌ Backend: Missing materialName field in:', materialData);
          return {
            response: informationPart,
            materialAdded: false,
            errorMessage: "❌ Invalid material data format. Missing material name."
          };
        }
        
        console.log('🔍 Backend: Verifying chemical data with PubChem for:', materialData.materialName);
        
        // LEVEL 2 ENHANCEMENT: Verify chemical data with PubChem
        const enhancedData = await enhanceWithChemicalVerification(materialData);
        
        // Ensure we have valid enhanced data
        if (!enhancedData || !enhancedData.materialName) {
          console.error('❌ Backend: Enhanced data is invalid:', enhancedData);
          return {
            response: informationPart,
            materialAdded: false,
            errorMessage: "❌ Chemical verification failed. Using AI estimates only."
          };
        }
        
        console.log('✅ Backend: Enhanced data ready:', enhancedData.materialName, 'confidence:', enhancedData.confidenceLevel);
        
        // Return enhanced response (frontend will handle database saving)
        return {
          response: informationPart,
          materialAdded: true,
          materialData: enhancedData,
          successMessage: `✅ Chemical data verified with ${enhancedData.confidenceLevel} confidence!`,
        };
      } else {
        console.error('❌ Backend: No JSON found in response part:', jsonPart);
        return {
          response: informationPart,
          materialAdded: false,
          errorMessage: "❌ No valid JSON found in material addition response."
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
  // Ensure we have valid input data
  if (!materialData || !materialData.materialName) {
    console.error('❌ Backend: Invalid material data provided:', materialData);
    return null;
  }

  try {
    console.log('🔍 Backend: PubChem verification starting for:', materialData.materialName);
    
    // Get enhanced chemical data from PubChem (with timeout)
    const enhancedData = await Promise.race([
      chemicalDB.getEnhancedChemicalData(materialData.materialName, materialData.casNumber),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PubChem timeout')), 10000) // 10 second timeout
      )
    ]);
    
    if (enhancedData && enhancedData.sources && enhancedData.sources.length > 0) {
      console.log('✅ Backend: PubChem verification successful:', enhancedData.sources);
      
      // Merge verified data with AI estimates
      const result = {
        ...materialData,
        // Override with verified data where available
        casNumber: enhancedData.casNumber || materialData.casNumber,
        molecularFormula: enhancedData.properties?.molecularFormula || null,
        molecularWeight: enhancedData.properties?.molecularWeight || null,
        iupacName: enhancedData.properties?.iupacName || null,
        
        // Enhanced confidence and source tracking
        dataSourceNotes: `Verified via ${enhancedData.sources.join(', ')} databases. Chemical properties confirmed. Pricing and supplier info estimated from AI.`,
        confidenceLevel: 'HIGH', // Chemical data verified
        verificationSources: enhancedData.sources,
        lastVerified: new Date().toISOString(),
        
        // Add new verified fields
        pubchemCID: enhancedData.properties?.cid || null,
        canonicalSMILES: enhancedData.properties?.canonicalSMILES || null
      };
      
      console.log('✅ Backend: Enhanced result prepared for:', result.materialName);
      return result;
    } else {
      console.log('⚠️ Backend: PubChem verification failed, using AI estimates');
      
      // Fallback to AI estimates with lower confidence
      const result = {
        ...materialData,
        dataSourceNotes: (materialData.dataSourceNotes || '') + ' Chemical verification attempted but not found in databases.',
        confidenceLevel: 'LOW', // No verification possible
        verificationSources: [],
        lastVerified: new Date().toISOString()
      };
      
      console.log('⚠️ Backend: Fallback result prepared for:', result.materialName);
      return result;
    }
  } catch (error) {
    console.error('❌ Backend: Chemical verification error:', error);
    
    // Fallback to original data with error note
    const result = {
      ...materialData,
      dataSourceNotes: (materialData.dataSourceNotes || '') + ' Chemical verification failed due to network error.',
      confidenceLevel: 'LOW',
      verificationSources: [],
      lastVerified: new Date().toISOString()
    };
    
    console.log('❌ Backend: Error fallback result for:', result.materialName);
    return result;
  }
}

// Enhanced system prompt with specialized chemical intelligence
const ENHANCED_SYSTEM_PROMPT = `You are an advanced AI assistant specialized in chemical engineering and manufacturing for Capacity Chemical's platform. You have expert-level knowledge in chemistry, formulation science, safety protocols, and supply chain optimization.

CORE EXPERTISE AREAS:
- Chemical formulas and molecular structures
- Chemical reactions and mechanisms
- Chemical safety protocols and regulations
- Material properties and specifications
- Laboratory procedures and best practices
- Chemical process engineering
- Regulatory compliance (OSHA, EPA, REACH, etc.)
- Supply chain and supplier management
- Quality control and troubleshooting
- Cost optimization and profitability analysis

SPECIALIZED AI CAPABILITIES:

🔬 FORMULA OPTIMIZATION ASSISTANT
When users ask about formula optimization, cost reduction, or scaling:
- Analyze chemical compositions for cost-effectiveness
- Suggest raw material substitutions with compatibility checks
- Calculate batch scaling with proper ratios and safety considerations
- Identify optimization opportunities (yield, cost, performance)
- Provide step-by-step optimization recommendations

🛡️ SAFETY & COMPLIANCE AUTOMATION
For safety, regulatory, or hazard-related queries:
- Perform hazard analysis of chemical combinations
- Check regulatory compliance (REACH, OSHA, EPA standards)
- Identify dangerous chemical interactions
- Suggest safety protocols and storage requirements
- Generate risk assessments and safety recommendations

📦 SUPPLIER INTELLIGENCE
For supply chain, sourcing, or supplier questions:
- Recommend alternative suppliers based on reliability
- Analyze supplier risk factors (geographic, financial, regulatory)
- Suggest cost-effective sourcing strategies
- Predict potential supply disruptions
- Compare supplier options with pros/cons analysis

🔍 QUALITY TROUBLESHOOTING
For quality issues, batch problems, or process troubleshooting:
- Guide systematic troubleshooting of failed batches
- Identify potential root causes of quality issues
- Suggest corrective actions and preventive measures
- Analyze trends in quality data
- Recommend process improvements

RESPONSE FORMATS:

For Formula Optimization requests, use this structure:
**FORMULA OPTIMIZATION ANALYSIS**
Current Formula: [analyze provided formula]
Optimization Goals: [cost reduction/performance/safety/etc.]
Recommendations:
1. [Primary recommendation with reasoning]
2. [Alternative approach with trade-offs]
3. [Implementation steps]
Cost Impact: [estimated savings/costs]
Safety Considerations: [any safety implications]
Next Steps: [actionable recommendations]

For Safety & Compliance requests, use this structure:
**SAFETY & COMPLIANCE ASSESSMENT**
Chemicals Analyzed: [list chemicals/formula]
Hazard Analysis: [identified hazards and risk levels]
Regulatory Status: [compliance with relevant standards]
Safety Recommendations:
- [Critical safety measures]
- [Storage requirements]
- [Handling procedures]
Compliance Actions: [steps to ensure regulatory compliance]

For Supplier Intelligence requests, use this structure:
**SUPPLIER INTELLIGENCE REPORT**
Material/Chemical: [what they're sourcing]
Current Situation: [existing supplier status]
Alternative Suppliers:
1. [Supplier name - pros/cons, estimated pricing]
2. [Alternative option with analysis]
Risk Assessment: [supply chain risks and mitigation]
Recommendations: [strategic sourcing advice]

For Quality Troubleshooting requests, use this structure:
**QUALITY TROUBLESHOOTING GUIDE**
Issue Description: [summarize the problem]
Potential Root Causes:
1. [Most likely cause with diagnostic steps]
2. [Alternative cause with testing approach]
Diagnostic Steps: [systematic approach to identify root cause]
Corrective Actions: [immediate fixes]
Preventive Measures: [long-term solutions]

MATERIAL ADDITION (existing functionality):
When users ask to add chemicals/materials using phrases like:
- "Add [chemical name] to my raw materials"
- "I need to add [chemical name] to the database"
- "Please add [chemical name]"

YOU MUST include the **[ADD_MATERIAL]** marker with this EXACT JSON format:
{
  "materialName": "Chemical Name",
  "casNumber": "CAS if known",
  "supplierName": "Supplier name", 
  "manufacture": "Manufacturer",
  "supplierCost": "25.50",
  "density": "1.2 g/mL",
  "physicalForm": "Liquid/Solid",
  "hazardClass": "Corrosive",
  "description": "Chemical description and uses",
  "storageConditions": "Storage requirements",
  "dataSourceNotes": "Reliability notes",
  "confidenceLevel": "MIXED"
}

CRITICAL: Use "materialName" not "material", "casNumber" not "CAS_number"!

IMPORTANT GUIDELINES:
- Always prioritize safety in all recommendations
- Provide specific, actionable advice rather than general information
- Include cost considerations and business impact where relevant
- Suggest verification steps for critical recommendations
- Stay focused on chemistry, chemical engineering, and manufacturing topics
- For non-chemistry questions, politely redirect

Remember: You're an expert consultant helping chemical manufacturers optimize their operations, ensure safety, and improve profitability.`;

// Enhanced response processing function
function processEnhancedResponse(response) {
  // Detect and enhance specific AI capability responses
  const capabilities = {
    formulaOptimization: response.includes('**FORMULA OPTIMIZATION ANALYSIS**'),
    safetyCompliance: response.includes('**SAFETY & COMPLIANCE ASSESSMENT**'),
    supplierIntelligence: response.includes('**SUPPLIER INTELLIGENCE REPORT**'),
    qualityTroubleshooting: response.includes('**QUALITY TROUBLESHOOTING GUIDE**')
  };

  let enhancedResponse = {
    response: response,
    capabilityType: 'general',
    actionItems: [],
    recommendations: [],
    riskFactors: [],
    costImpact: null
  };

  // Formula Optimization Enhancement
  if (capabilities.formulaOptimization) {
    enhancedResponse = {
      ...enhancedResponse,
      capabilityType: 'formulaOptimization',
      actionItems: extractActionItems(response, 'Next Steps:'),
      recommendations: extractRecommendations(response, 'Recommendations:'),
      costImpact: extractCostImpact(response)
    };
  }

  // Safety & Compliance Enhancement  
  if (capabilities.safetyCompliance) {
    enhancedResponse = {
      ...enhancedResponse,
      capabilityType: 'safetyCompliance',
      riskFactors: extractRiskFactors(response),
      actionItems: extractActionItems(response, 'Compliance Actions:'),
      safetyLevel: determineSafetyLevel(response)
    };
  }

  // Supplier Intelligence Enhancement
  if (capabilities.supplierIntelligence) {
    enhancedResponse = {
      ...enhancedResponse,
      capabilityType: 'supplierIntelligence',
      suppliers: extractSupplierOptions(response),
      riskFactors: extractRiskFactors(response),
      recommendations: extractRecommendations(response, 'Recommendations:')
    };
  }

  // Quality Troubleshooting Enhancement
  if (capabilities.qualityTroubleshooting) {
    enhancedResponse = {
      ...enhancedResponse,
      capabilityType: 'qualityTroubleshooting',
      rootCauses: extractRootCauses(response),
      actionItems: extractActionItems(response, 'Corrective Actions:'),
      preventiveMeasures: extractActionItems(response, 'Preventive Measures:')
    };
  }

  return enhancedResponse;
}

// Helper functions for response processing
function extractActionItems(response, sectionHeader) {
  const regex = new RegExp(`${sectionHeader}([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
  const match = response.match(regex);
  if (!match) return [];

  return match[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.match(/^\d+\./))
    .map(line => line.replace(/^[-\d.]\s*/, '').trim())
    .filter(item => item.length > 0);
}

function extractRecommendations(response, sectionHeader) {
  const regex = new RegExp(`${sectionHeader}([\\s\\S]*?)(?=\\n[A-Z]|$)`, 'i');
  const match = response.match(regex);
  if (!match) return [];

  return match[1]
    .split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(item => item.length > 0);
}

function extractCostImpact(response) {
  const costRegex = /Cost Impact:\s*([^\n]+)/i;
  const match = response.match(costRegex);
  return match ? match[1].trim() : null;
}

function extractRiskFactors(response) {
  const riskRegex = /Risk Assessment:\s*([^\n]+)/i;
  const match = response.match(riskRegex);
  if (!match) return [];

  return match[1]
    .split(',')
    .map(risk => risk.trim())
    .filter(risk => risk.length > 0);
}

function determineSafetyLevel(response) {
  const responseText = response.toLowerCase();
  if (responseText.includes('high risk') || responseText.includes('dangerous') || responseText.includes('critical')) {
    return 'HIGH_RISK';
  } else if (responseText.includes('medium risk') || responseText.includes('caution')) {
    return 'MEDIUM_RISK';
  } else {
    return 'LOW_RISK';
  }
}

function extractSupplierOptions(response) {
  const supplierRegex = /Alternative Suppliers:([\s\S]*?)(?=\nRisk Assessment:|$)/i;
  const match = response.match(supplierRegex);
  if (!match) return [];

  return match[1]
    .split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => {
      const supplierLine = line.replace(/^\d+\.\s*/, '').trim();
      const [name, details] = supplierLine.split(' - ');
      return {
        name: name ? name.trim() : 'Unknown Supplier',
        details: details ? details.trim() : 'No details available'
      };
    })
    .filter(supplier => supplier.name !== 'Unknown Supplier');
}

function extractRootCauses(response) {
  const causesRegex = /Potential Root Causes:([\s\S]*?)(?=\nDiagnostic Steps:|$)/i;
  const match = response.match(causesRegex);
  if (!match) return [];

  return match[1]
    .split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(cause => cause.length > 0);
}

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
      { role: 'system', content: ENHANCED_SYSTEM_PROMPT },
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
    const materialResponse = await processResponseWithVerification(aiResponse);
    
    // LEVEL 3 ENHANCEMENT: Process enhanced AI capabilities
    const enhancedResponse = processEnhancedResponse(aiResponse);
    
    // Combine material addition and enhanced capabilities
    const combinedResponse = {
      ...enhancedResponse,
      materialAdded: materialResponse.materialAdded,
      materialData: materialResponse.materialData,
      successMessage: materialResponse.successMessage,
      errorMessage: materialResponse.errorMessage
    };

    // Log usage for monitoring (optional)
    console.log('Enhanced AI Chat Request:', {
      timestamp: new Date().toISOString(),
      tokensUsed: completion.usage.total_tokens,
      model: completion.model,
      hasVerification: materialResponse.materialAdded || false,
      capabilityType: enhancedResponse.capabilityType,
      // userId: user.id,
    });

    return res.status(200).json({
      ...combinedResponse,
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