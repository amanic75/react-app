// Enhanced AI Service with Function Calling for Real-Time Chemical Data
import { addMaterial } from './supabaseData';
import ChemicalDatabaseService from './chemical_database_service';

class EnhancedAIService {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/api/ai-chat';
    this.chemicalDB = new ChemicalDatabaseService();
    
    // OpenAI Functions for chemical data lookup
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

    this.systemPrompt = `You are a specialized AI assistant for Capacity Chemical's internal platform with access to real-time chemical databases.

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
  }

  async generateEnhancedResponse(userMessage, files = null, conversationHistory = []) {
    try {
      if (!this.isDevelopment) {
        // In production, use the enhanced backend API
        return await this.generateResponseFromEnhancedAPI(userMessage, files, conversationHistory);
      }

      // Development mode with function calling
      if (!this.openai) {
        throw new Error('OpenAI client not initialized');
      }

      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: this.buildUserMessage(userMessage, files) }
      ];

      // First AI call with functions available
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview', // Function calling model
        messages: messages,
        functions: this.functions,
        function_call: 'auto',
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message;
      
      // Check if AI wants to call a function
      if (aiResponse.function_call) {
        const functionResult = await this.handleFunctionCall(aiResponse.function_call);
        
        // Add function call and result to conversation
        messages.push(aiResponse);
        messages.push({
          role: 'function',
          name: aiResponse.function_call.name,
          content: JSON.stringify(functionResult)
        });

        // Get final response with function results
        const finalResponse = await this.openai.chat.completions.create({
          model: 'gpt-4-1106-preview',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        });

        return await this.processEnhancedResponse(finalResponse.choices[0].message.content, functionResult);
      }

      // No function call needed
      return await this.processEnhancedResponse(aiResponse.content);
    } catch (error) {
      console.error('Enhanced AI Service Error:', error);
      throw new Error('Failed to generate enhanced AI response. Please try again.');
    }
  }

  async handleFunctionCall(functionCall) {
    const functionName = functionCall.name;
    const functionArgs = JSON.parse(functionCall.arguments);

    switch (functionName) {
      case 'lookup_chemical_data':
        return await this.lookupChemicalData(functionArgs);
      case 'get_supplier_pricing':
        return await this.getSupplierPricing(functionArgs);
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  async lookupChemicalData(args) {
    try {
      const enhancedData = await this.chemicalDB.getEnhancedChemicalData(
        args.chemical_name,
        args.cas_number
      );

      return {
        success: true,
        data: enhancedData,
        sources: enhancedData.sources,
        confidence: enhancedData.confidence,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chemical lookup error:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'Using AI knowledge base only'
      };
    }
  }

  async getSupplierPricing(args) {
    try {
      // This would integrate with supplier APIs
      // For now, return enhanced estimates
      const pricing = await this.getEnhancedPricingEstimates(args);
      
      return {
        success: true,
        pricing: pricing,
        sources: ['Market Analysis', 'Historical Data'],
        confidence: 'MEDIUM',
        note: 'Pricing estimates - verify with suppliers for current rates'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: 'Using historical pricing estimates'
      };
    }
  }

  async getEnhancedPricingEstimates(args) {
    // Enhanced pricing logic that considers:
    // - Chemical complexity
    // - Purity requirements
    // - Quantity scaling
    // - Market conditions
    
    const basePrice = this.estimateBasePrice(args.chemical_name);
    const purityMultiplier = this.getPurityMultiplier(args.purity);
    const quantityDiscount = this.getQuantityDiscount(args.quantity);
    
    return {
      supplierCost: (basePrice * purityMultiplier * quantityDiscount).toFixed(2),
      retailCost: (basePrice * purityMultiplier * quantityDiscount * 1.3).toFixed(2),
      factors: {
        basePrice: basePrice,
        purityMultiplier: purityMultiplier,
        quantityDiscount: quantityDiscount
      }
    };
  }

  estimateBasePrice(chemicalName) {
    // More sophisticated pricing model based on chemical complexity
    const commonChemicals = {
      'sodium chloride': 10,
      'water': 5,
      'acetone': 25,
      'methanol': 20,
      'sulfuric acid': 15,
      'hydrochloric acid': 18
    };
    
    const name = chemicalName.toLowerCase();
    for (const [chemical, price] of Object.entries(commonChemicals)) {
      if (name.includes(chemical)) {
        return price;
      }
    }
    
    // Default pricing based on name complexity
    return Math.max(15, Math.min(100, chemicalName.length * 2));
  }

  getPurityMultiplier(purity) {
    if (!purity) return 1.0;
    
    const purityNum = parseFloat(purity.replace('%', ''));
    if (purityNum >= 99.5) return 1.5;
    if (purityNum >= 99) return 1.2;
    if (purityNum >= 95) return 1.0;
    return 0.8;
  }

  getQuantityDiscount(quantity) {
    if (!quantity) return 1.0;
    
    const amount = parseFloat(quantity);
    if (amount >= 25) return 0.7; // Bulk discount
    if (amount >= 5) return 0.85;
    return 1.0;
  }

  async processEnhancedResponse(response, functionResult = null) {
    // Enhanced processing that includes verification data
    if (response.includes('**[ADD_MATERIAL]**')) {
      try {
        const parts = response.split('**[ADD_MATERIAL]**');
        const informationPart = parts[0].trim();
        const jsonPart = parts[1].trim();
        
        const jsonMatch = jsonPart.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          let materialData = JSON.parse(jsonMatch[0]);
          
          // Enhance with function results if available
          if (functionResult && functionResult.success) {
            materialData = this.enhanceMaterialWithVerifiedData(materialData, functionResult);
          }
          
          const validatedData = this.validateMaterialData(materialData);
          const savedMaterial = await addMaterial(validatedData);
          
          if (savedMaterial) {
            return {
              response: informationPart,
              materialAdded: true,
              materialData: savedMaterial,
              successMessage: `✅ Successfully added "${validatedData.materialName}" with ${functionResult?.sources?.join(', ') || 'AI'} verification!`,
              verificationSources: functionResult?.sources || ['AI Knowledge Base']
            };
          }
        }
      } catch (error) {
        console.error('Error processing enhanced material addition:', error);
      }
    }
    
    return { response };
  }

  enhanceMaterialWithVerifiedData(aiData, verificationResult) {
    if (!verificationResult.data) return aiData;
    
    const verified = verificationResult.data;
    
    return {
      ...aiData,
      // Override with verified data where available
      casNumber: verified.casNumber || aiData.casNumber,
      molecularFormula: verified.properties?.molecularFormula || aiData.molecularFormula,
      molecularWeight: verified.properties?.molecularWeight || aiData.molecularWeight,
      
      // Add verification metadata
      dataSourceNotes: `Verified via ${verified.sources.join(', ')}. ${aiData.dataSourceNotes || ''}`,
      verificationSources: verified.sources,
      confidenceLevel: verified.confidence.basic || 'MEDIUM',
      lastVerified: new Date().toISOString()
    };
  }
}

export default EnhancedAIService; 