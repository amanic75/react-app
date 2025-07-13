// AI Service for handling OpenAI API integration
import OpenAI from 'openai';

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
    
    this.systemPrompt = `You are a specialized AI assistant for Capacity Chemical's internal platform. You have expertise in:
    - Chemical formulas and molecular structures
    - Chemical safety protocols and regulations
    - Material properties and specifications
    - Supplier information and sourcing
    - Laboratory procedures and best practices
    - Regulatory compliance (OSHA, EPA, etc.)
    
    Always prioritize safety in your responses and provide accurate, professional information relevant to chemical engineering and manufacturing.
    
    When users upload files, analyze them for chemical data, safety information, formulas, or specifications.`;
  }

  async generateResponse(userMessage, files = null, conversationHistory = []) {
    try {
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

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
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

  // For streaming responses (optional)
  async *generateStreamingResponse(userMessage, files = null, conversationHistory = []) {
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