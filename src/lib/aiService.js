import { addMaterial } from './supabaseData';
import ChemicalDatabaseService from './chemicalDatabaseService';

// AI Service for handling AI chat requests
// Enhanced with Level 2 chemical database verification

class AIService {
  constructor() {
    // Check if we're in development or production
    this.isDevelopment = import.meta.env.DEV;
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/api/ai-chat';
    
    // Initialize chemical database service for Level 2 verification
    this.chemicalDB = new ChemicalDatabaseService();
    
    // Only initialize OpenAI client in development
    if (this.isDevelopment && import.meta.env.VITE_OPENAI_API_KEY) {
      // Dynamic import to avoid loading OpenAI in production
      import('openai').then(({ default: OpenAI }) => {
        this.openai = new OpenAI({
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true // Only for development
        });
      });
    }
    
    this.systemPrompt = `You are a specialized AI assistant for Capacity Chemical's internal platform. You ONLY answer questions related to chemistry, chemical engineering, and chemical safety.

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
  }

  async generateResponse(userMessage, files = null, conversationHistory = []) {
    try {
      // In production, use backend API (Level 2 verification handled by backend)
      if (!this.isDevelopment) {
        return await this.generateResponseFromAPI(userMessage, files, conversationHistory);
      }
      
      // In development, use direct OpenAI calls
      if (!this.openai) {
        throw new Error('OpenAI client not initialized. Check your API key.');
      }
      
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: this.buildUserMessage(userMessage, files) }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      });

      const aiResponse = response.choices[0].message.content;
      return await this.processResponse(aiResponse);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async processResponse(response) {
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
          
          // LEVEL 2 ENHANCEMENT: Verify chemical data with PubChem
          const enhancedData = await this.enhanceWithChemicalVerification(materialData);
          
          // Validate and truncate fields to fit database constraints
          const validatedData = this.validateMaterialData(enhancedData);
          
          // Add the material to the database
          const savedMaterial = await addMaterial(validatedData);
          
          if (savedMaterial) {
            return {
              response: informationPart,
              materialAdded: true,
              materialData: savedMaterial,
              successMessage: `✅ Successfully added "${validatedData.materialName}" with ${validatedData.confidenceLevel} confidence verification!`
            };
          } else {
            return {
              response: informationPart,
              materialAdded: false,
              errorMessage: "❌ Failed to save the material to the database. Please try again or add it manually."
            };
          }
        }
      } catch (error) {
        console.error('Error processing material addition:', error);
        return {
          response: response.replace('**[ADD_MATERIAL]**', ''),
          materialAdded: false,
          errorMessage: "❌ Error processing material addition. Please try again."
        };
      }
    }
    
    // Return regular response if no material addition
    return { response };
  }

  async enhanceWithChemicalVerification(materialData) {
    try {
      console.log('🔍 Verifying chemical data with PubChem for:', materialData.materialName);
      
      // Get enhanced chemical data from PubChem
      const enhancedData = await this.chemicalDB.getEnhancedChemicalData(
        materialData.materialName, 
        materialData.casNumber
      );
      
      if (enhancedData && enhancedData.sources.length > 0) {
        console.log('✅ PubChem verification successful:', enhancedData.sources);
        
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
        console.log('⚠️ PubChem verification failed, using AI estimates');
        
        // Fallback to AI estimates with lower confidence
        return {
          ...materialData,
          dataSourceNotes: materialData.dataSourceNotes + ' Chemical verification attempted but not found in databases.',
          confidenceLevel: 'LOW', // No verification possible
          verificationSources: [],
          lastVerified: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Chemical verification error:', error);
      
      // Fallback to original data with error note
      return {
        ...materialData,
        dataSourceNotes: materialData.dataSourceNotes + ' Chemical verification failed due to network error.',
        confidenceLevel: 'LOW',
        verificationSources: [],
        lastVerified: new Date().toISOString()
      };
    }
  }

  validateMaterialData(materialData) {
    // Database field length constraints (based on typical schema)
    const truncateField = (value, maxLength) => {
      if (!value) return value;
      return String(value).substring(0, maxLength);
    };

    // Helper to parse numeric values
    const parseNumeric = (value) => {
      if (!value) return null;
      const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    };

    return {
      materialName: truncateField(materialData.materialName, 100), // Material name can be longer
      casNumber: truncateField(materialData.casNumber, 50),
      supplierName: truncateField(materialData.supplierName, 50),
      manufacture: truncateField(materialData.manufacture, 50),
      tradeName: truncateField(materialData.tradeName, 50),
      supplierCost: parseNumeric(materialData.supplierCost),
      weightVolume: truncateField(materialData.weightVolume, 50),
      activityPercentage: truncateField(materialData.activityPercentage, 50),
      density: truncateField(materialData.density, 50),
      viscosity: truncateField(materialData.viscosity, 50),
      cost: parseNumeric(materialData.cost),
      physicalForm: truncateField(materialData.physicalForm, 50),
      hazardClass: truncateField(materialData.hazardClass, 50),
      purity: truncateField(materialData.purity, 50),
      country: truncateField(materialData.country, 50),
      shelfLife: truncateField(materialData.shelfLife, 50),
      description: materialData.description, // Usually longer text field
      storageConditions: materialData.storageConditions, // Usually longer text field
      assigned_to: materialData.assigned_to,
      // New confidence tracking fields
      dataSourceNotes: materialData.dataSourceNotes,
      confidenceLevel: truncateField(materialData.confidenceLevel, 50),
      verificationSources: materialData.verificationSources || null,
      lastVerified: materialData.lastVerified || new Date().toISOString(),
      // New Level 2 fields
      molecularFormula: truncateField(materialData.molecularFormula, 50),
      molecularWeight: parseNumeric(materialData.molecularWeight),
      iupacName: truncateField(materialData.iupacName, 200),
      pubchemCID: truncateField(materialData.pubchemCID, 50),
      canonicalSMILES: truncateField(materialData.canonicalSMILES, 200)
    };
  }

  async generateResponseFromAPI(userMessage, files, conversationHistory) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        message: userMessage,
        files: files,
        conversationHistory: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle Level 2 backend response format
    if (data.materialAdded) {
      console.log('📦 Frontend: Received backend verification response:', data);
      
      // Check if backend provided material data
      if (!data.materialData) {
        console.error('❌ Frontend: Backend returned materialAdded=true but no materialData');
        return {
          response: data.response,
          materialAdded: false,
          errorMessage: data.errorMessage || "❌ Backend verification failed. Please try again."
        };
      }
      
      try {
        // Backend already processed the material with verification
        const validatedData = this.validateMaterialData(data.materialData);
        console.log('✅ Frontend: Material validated, saving to database:', validatedData.materialName);
        
        const savedMaterial = await addMaterial(validatedData);
        
        if (savedMaterial) {
          return {
            response: data.response,
            materialAdded: true,
            materialData: savedMaterial,
            successMessage: data.successMessage || `✅ Successfully added "${validatedData.materialName}" with backend verification!`
          };
        } else {
          return {
            response: data.response,
            materialAdded: false,
            errorMessage: "❌ Failed to save the verified material to the database. Please try again."
          };
        }
      } catch (error) {
        console.error('❌ Frontend: Error processing backend material data:', error);
        return {
          response: data.response,
          materialAdded: false,
          errorMessage: "❌ Error processing verified material data. Please try again."
        };
      }
    }
    
    return data.response;
  }

  buildUserMessage(text, files) {
    let message = text;
    
    if (files && files.length > 0) {
      message += '\n\nAttached files:\n';
      files.forEach(file => {
        message += `- ${file.name} (${file.type}, ${this.formatFileSize(file.size)})\n`;
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

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // For streaming responses (development only)
  async *generateStreamingResponse(userMessage, files = null, conversationHistory = []) {
    if (!this.isDevelopment || !this.openai) {
      throw new Error('Streaming only available in development mode');
    }

    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: this.buildUserMessage(userMessage, files) }
      ];

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('AI Streaming Error:', error);
      throw new Error('Failed to generate streaming response.');
    }
  }
}

export default new AIService(); 