import { addMaterial } from './materials';
import ChemicalDatabaseService from './chemicalDatabaseService';

// --- System Prompts ---
const BASIC_SYSTEM_PROMPT = `You are an advanced AI assistant specialized in chemical engineering and manufacturing for Capacity Chemical's platform. You have expert-level knowledge in chemistry, formulation science, safety protocols, and supply chain optimization.

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

         MATERIAL ADDITION - MAXIMUM REALISM REQUIRED:
     When users ask to add chemicals/materials, you MUST provide the most realistic, accurate data possible using your extensive chemical knowledge. Every field must be chemically accurate and industry-appropriate.

     RESPONSE STRUCTURE - User sees clean response, system processes JSON:

     [Natural user response with safety info]

     **[ADD_MATERIAL]**
     {Complete realistic material data}

     USER RESPONSE FORMAT (KEEP IT SHORT):
     "Sure! Adding [chemical name] - CAS: [number], [physical form], [key hazard warning]. Added successfully."

     TECHNICAL DATA - MAXIMUM REALISM REQUIRED:
     **[ADD_MATERIAL]**
     {
       "materialName": "[Exact chemical name]",
       "casNumber": "[Real CAS number - use your knowledge]",
       "tradeName": "[Common trade name if widely known, or same as material name]",
       "supplierName": "[Realistic major supplier - Fisher Scientific, Sigma-Aldrich, VWR, etc.]",
       "manufacture": "[Actual major manufacturer if known - BASF, Dow, etc.]",
       "supplierCost": "[Realistic market price - vary by chemical rarity/complexity]",
       "density": "[Accurate density in g/mL]",
       "physicalForm": "[Solid/Liquid/Gas at room temperature]",
       "hazardClass": "[Accurate GHS classification - Flammable/Corrosive/Toxic/Oxidizing]",
       "purity": "[Typical commercial grade - 95%, 99%, 99.9%, ACS grade, etc.]",
       "shelfLife": "[Realistic based on chemical stability - 6 months to 5 years]",
       "weightVolume": "[Realistic lbs/gallon for liquids or lbs/ft³ for solids]",
       "activityPercentage": "[100% for pure chemicals, lower for solutions]",
       "viscosity": "[Accurate viscosity in cP for liquids]",
       "country": "[Major production country - USA, Germany, China, etc.]",
       "storageConditions": "[Specific requirements - temperature, atmosphere, light sensitivity]",  
       "description": "[Comprehensive: molecular formula, uses, properties, enhanced with database verification notes]",
       "dataSourceNotes": "[Mention chemical database verification and source confidence]",
       "confidenceLevel": "[HIGH for common chemicals, MEDIUM for specialty]"
     }

     PRICING GUIDELINES - BE REALISTIC:
     - Common solvents (acetone, ethanol): $15-40/L
     - Laboratory reagents: $30-100/kg
     - Specialty chemicals: $100-500/kg  
     - Rare/complex compounds: $500-2000/kg
     - Controlled substances: "Restricted - Contact DEA licensed supplier"

     REALISM EXAMPLES:
     - Acetone: CAS 67-64-1, Sigma-Aldrich, $18.50/L, 0.791 g/mL, Flammable, 99.5% purity
     - Sodium Hydroxide: CAS 1310-73-2, Fisher Scientific, $35.00/kg, Corrosive, ACS grade
     - Benzene: CAS 71-43-2, $45.00/L, Carcinogenic, requires special handling

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

const ENHANCED_SYSTEM_PROMPT = `You are a specialized AI assistant for Capacity Chemical's internal platform with access to real-time chemical databases.

    ENHANCED CAPABILITIES:
    - You can lookup verified chemical data from PubChem, ChemSpider, and NIST
    - You can access real-time supplier pricing (when configured)
    - You provide confidence levels for all data
    - You cross-validate information from multiple sources

    WHEN TO USE FUNCTIONS:
    - ALWAYS use lookup_chemical_data for any material addition request
    - Use get_supplier_pricing if the user mentions needing current pricing
    - Combine function results with your knowledge for comprehensive responses

    MATERIAL ADDITION WORKFLOW:
    1. When user requests to add a chemical, FIRST call lookup_chemical_data
    2. If pricing is important, also call get_supplier_pricing
    3. Combine verified data with reasonable estimates
    4. Include confidence levels and data sources
    5. Format with **[ADD_MATERIAL]** marker

    CONFIDENCE LEVELS:
    ✅ HIGH: Data from authoritative databases (PubChem, NIST)
    🟡 MEDIUM: Cross-validated from multiple sources
    ⚠️ LOW: AI estimates or single-source data

    Always be transparent about data sources and encourage verification for critical applications.`;

class AIService {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/api/ai-chat';
    this.chemicalDB = new ChemicalDatabaseService();
    this.openai = null;
    this.functions = [
      {
        name: "lookup_chemical_data",
        description: "Get verified chemical properties from authoritative databases like PubChem",
        parameters: {
          type: "object",
          properties: {
            chemical_name: {
              type: "string",
              description: "The name of the chemical to look up"
            },
            cas_number: {
              type: "string",
              description: "CAS registry number if known (optional but more accurate)"
            }
          },
          required: ["chemical_name"]
        }
      },
      {
        name: "get_supplier_pricing",
        description: "Get real-time pricing from chemical suppliers (if API keys configured)",
        parameters: {
          type: "object",
          properties: {
            chemical_name: { type: "string" },
            cas_number: { type: "string" },
            quantity: { type: "string", description: "Quantity needed (e.g., '1L', '500g')" },
            purity: { type: "string", description: "Required purity (e.g., '99%', 'ACS grade')" }
          },
          required: ["chemical_name"]
        }
      }
    ];
    // Only initialize OpenAI client in development
    if (this.isDevelopment && import.meta.env.VITE_OPENAI_API_KEY) {
      import('openai').then(({ default: OpenAI }) => {
        this.openai = new OpenAI({
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
      });
    }
  }

  async generateResponse(userMessage, files = null, conversationHistory = [], options = { mode: 'basic' }) {
    const mode = options.mode || 'basic';
    const systemPrompt = mode === 'enhanced' ? ENHANCED_SYSTEM_PROMPT : BASIC_SYSTEM_PROMPT;
    const useFunctionCalling = mode === 'enhanced';
    try {
      if (!this.isDevelopment) {
        return await this.generateResponseFromAPI(userMessage, files, conversationHistory, mode);
      }
      if (!this.openai) {
        throw new Error('OpenAI client not initialized. Check your API key.');
      }
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: this.buildUserMessage(userMessage, files) }
      ];
      if (useFunctionCalling) {
        // Enhanced mode: function calling
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-1106-preview',
          messages: messages,
          functions: this.functions,
          function_call: 'auto',
          max_tokens: 1000,
          temperature: 0.7
        });
        const aiResponse = response.choices[0].message;
        if (aiResponse.function_call) {
          const functionResult = await this.handleFunctionCall(aiResponse.function_call);
          messages.push(aiResponse);
          messages.push({
            role: 'function',
            name: aiResponse.function_call.name,
            content: JSON.stringify(functionResult)
          });
          const finalResponse = await this.openai.chat.completions.create({
            model: 'gpt-4-1106-preview',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
          });
          return await this.processEnhancedResponse(finalResponse.choices[0].message.content, functionResult);
        }
        return await this.processEnhancedResponse(aiResponse.content);
      } else {
        // Basic mode: regular chat
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        });
        const aiResponse = response.choices[0].message.content;
        return await this.processResponse(aiResponse);
      }
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

  async generateResponseFromAPI(userMessage, files, conversationHistory, mode) {
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
        conversationHistory: conversationHistory,
        mode: mode // Pass the mode to the backend
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

  async handleFunctionCall(functionCall) {
    const functionName = functionCall.name;
    const functionArgs = JSON.parse(functionCall.arguments);

    if (functionName === 'lookup_chemical_data') {
      const { chemical_name, cas_number } = functionArgs;
      return await this.chemicalDB.getEnhancedChemicalData(chemical_name, cas_number);
    } else if (functionName === 'get_supplier_pricing') {
      const { chemical_name, cas_number, quantity, purity } = functionArgs;
      return await this.chemicalDB.getSupplierPricing(chemical_name, cas_number, quantity, purity);
    } else {
      console.warn(`Unknown function called: ${functionName}`);
      return { error: `Unknown function called: ${functionName}` };
    }
  }

  async processEnhancedResponse(response, functionResult = null) {
    if (response.includes('**[ADD_MATERIAL]**')) {
      try {
        const parts = response.split('**[ADD_MATERIAL]**');
        const informationPart = parts[0].trim();
        const jsonPart = parts[1].trim();
        
        const jsonMatch = jsonPart.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const cleanedJson = jsonMatch[0].replace(/\/\/[^\r\n]*/g, '').trim();
          const materialData = JSON.parse(cleanedJson);
          
          const enhancedData = await this.enhanceWithChemicalVerification(materialData);
          const validatedData = this.validateMaterialData(enhancedData);
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
    
    // If function call was made, append the function result to the response
    if (functionResult) {
      enhancedResponse.functionResult = functionResult;
    }

    return enhancedResponse;
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
        { role: 'system', content: BASIC_SYSTEM_PROMPT }, // Use basic prompt for streaming
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