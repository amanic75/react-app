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
    
    // Enhanced system prompt with specialized chemical intelligence
    this.systemPrompt = `You are an advanced AI assistant specialized in chemical engineering and manufacturing for Capacity Chemical's platform. You have expert-level knowledge in chemistry, formulation science, safety protocols, and supply chain optimization.

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
     
     YOU MUST IMMEDIATELY add the material using your extensive chemical knowledge. DO NOT ask the user for information you already know. For common chemicals, you have comprehensive data including CAS numbers, properties, hazards, and uses.

     RESPONSE FORMAT: You MUST provide BOTH a natural response AND the technical JSON data. The user will only see the natural response, but the system needs the JSON to process the material addition.

     STRUCTURE YOUR RESPONSE EXACTLY LIKE THIS:

     [Natural user-friendly response]

     **[ADD_MATERIAL]**
     {JSON data}

     STEP 1 - USER VISIBLE RESPONSE:
     "Sure! I'll add [chemical name] to your raw materials database. 

     **Safety Information:**
     - [Key safety warnings and hazard information]
     - [Storage requirements]
     - [PPE recommendations]

     **Chemical Properties:**
     - CAS Number: [number]
     - Molecular Formula: [formula] 
     - Density: [value]
     - Physical Form: [liquid/solid/gas]

     **Confidence Level:** [HIGH/MEDIUM/LOW] - [brief explanation of data sources]

     The material has been processed and will be added to your database momentarily."

     STEP 2 - TECHNICAL DATA (REQUIRED FOR PROCESSING):
     **[ADD_MATERIAL]**
     {
       "materialName": "Chemical Name",
       "casNumber": "CAS number from your knowledge",
       "supplierName": "Generic Chemical Supply Co",
       "manufacture": "Standard Chemical Manufacturer",
       "supplierCost": "estimated market price",
       "density": "known density value",
       "physicalForm": "Liquid/Solid/Gas",
       "hazardClass": "Flammable/Corrosive/Toxic/etc",
       "description": "Chemical properties, molecular formula, and common uses",
       "storageConditions": "Proper storage requirements based on chemical properties",
       "dataSourceNotes": "Chemical database knowledge with estimated supplier info",
       "confidenceLevel": "HIGH for chemical properties, LOW for supplier pricing"
     }

     CRITICAL: You MUST include both parts - the system filters out the JSON from what users see!

     EXAMPLES:
     - Acetone: "Sure! I'll add acetone to your raw materials database. **Safety Information:** Highly flammable liquid, avoid heat sources and flames. Store in cool, dry, well-ventilated area. Use appropriate PPE including gloves and safety glasses. **Chemical Properties:** CAS: 67-64-1, Formula: C₃H₆O, Density: 0.791 g/mL, Physical Form: Liquid. **Confidence Level:** HIGH - Chemical properties verified from chemical databases."
     
     CRITICAL: Use "materialName" not "material", "casNumber" not "CAS_number"!

     IMPORTANT GUIDELINES:
    - Always prioritize safety in all recommendations
    - Provide specific, actionable advice rather than general information
    - Include cost considerations and business impact where relevant
    - Suggest verification steps for critical recommendations
    - Stay focused on chemistry, chemical engineering, and manufacturing topics
    - For non-chemistry questions, politely redirect: "I'm specialized in chemical engineering and manufacturing. Please ask about formulations, safety, suppliers, or quality control."

    Remember: You're an expert consultant helping chemical manufacturers optimize their operations, ensure safety, and improve profitability.`;
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
    
    // Process enhanced AI capabilities responses
    const enhancedResponse = this.processEnhancedCapabilities(response);
    
    // Return regular response if no special processing needed
    return enhancedResponse;
  }

  processEnhancedCapabilities(response) {
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
        actionItems: this.extractActionItems(response, 'Next Steps:'),
        recommendations: this.extractRecommendations(response, 'Recommendations:'),
        costImpact: this.extractCostImpact(response)
      };
    }

    // Safety & Compliance Enhancement  
    if (capabilities.safetyCompliance) {
      enhancedResponse = {
        ...enhancedResponse,
        capabilityType: 'safetyCompliance',
        riskFactors: this.extractRiskFactors(response),
        actionItems: this.extractActionItems(response, 'Compliance Actions:'),
        safetyLevel: this.determineSafetyLevel(response)
      };
    }

    // Supplier Intelligence Enhancement
    if (capabilities.supplierIntelligence) {
      enhancedResponse = {
        ...enhancedResponse,
        capabilityType: 'supplierIntelligence',
        suppliers: this.extractSupplierOptions(response),
        riskFactors: this.extractRiskFactors(response),
        recommendations: this.extractRecommendations(response, 'Recommendations:')
      };
    }

    // Quality Troubleshooting Enhancement
    if (capabilities.qualityTroubleshooting) {
      enhancedResponse = {
        ...enhancedResponse,
        capabilityType: 'qualityTroubleshooting',
        rootCauses: this.extractRootCauses(response),
        actionItems: this.extractActionItems(response, 'Corrective Actions:'),
        preventiveMeasures: this.extractActionItems(response, 'Preventive Measures:')
      };
    }

    return enhancedResponse;
  }

  extractActionItems(response, sectionHeader) {
    const regex = new RegExp(`${sectionHeader}([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = response.match(regex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.match(/^\d+\./))
      .map(line => line.replace(/^[-\d.]\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  extractRecommendations(response, sectionHeader) {
    const regex = new RegExp(`${sectionHeader}([\\s\\S]*?)(?=\\n[A-Z]|$)`, 'i');
    const match = response.match(regex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  extractCostImpact(response) {
    const costRegex = /Cost Impact:\s*([^\n]+)/i;
    const match = response.match(costRegex);
    return match ? match[1].trim() : null;
  }

  extractRiskFactors(response) {
    const riskRegex = /Risk Assessment:\s*([^\n]+)/i;
    const match = response.match(riskRegex);
    if (!match) return [];

    return match[1]
      .split(',')
      .map(risk => risk.trim())
      .filter(risk => risk.length > 0);
  }

  determineSafetyLevel(response) {
    const responseText = response.toLowerCase();
    if (responseText.includes('high risk') || responseText.includes('dangerous') || responseText.includes('critical')) {
      return 'HIGH_RISK';
    } else if (responseText.includes('medium risk') || responseText.includes('caution')) {
      return 'MEDIUM_RISK';
    } else {
      return 'LOW_RISK';
    }
  }

  extractSupplierOptions(response) {
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

  extractRootCauses(response) {
    const causesRegex = /Potential Root Causes:([\s\S]*?)(?=\nDiagnostic Steps:|$)/i;
    const match = response.match(causesRegex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(cause => cause.length > 0);
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