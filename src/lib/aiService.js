import { addMaterial } from './supabaseData';

// AI Service for handling AI chat requests
// This version uses a backend API for production security

class AIService {
  constructor() {
    // Check if we're in development or production
    this.isDevelopment = import.meta.env.DEV;
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/api/ai-chat';
    
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
  }

  async generateResponse(userMessage, files = null, conversationHistory = []) {
    try {
      // In production, use backend API
      if (!this.isDevelopment) {
        const response = await this.generateResponseFromAPI(userMessage, files, conversationHistory);
        return await this.processResponse(response);
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
          const materialData = JSON.parse(jsonMatch[0]);
          
          // Validate and truncate fields to fit database constraints
          const validatedData = this.validateMaterialData(materialData);
          
          // Add the material to the database
          const savedMaterial = await addMaterial(validatedData);
          
          if (savedMaterial) {
            return {
              response: informationPart,
              materialAdded: true,
              materialData: savedMaterial,
              successMessage: `✅ Successfully added "${validatedData.materialName}" to your raw materials database!`
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
      assigned_to: materialData.assigned_to
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