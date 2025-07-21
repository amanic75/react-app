import React, { useState, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Paperclip, File, Image, AlertTriangle, CheckCircle, TrendingUp, Users, DollarSign, Shield } from 'lucide-react';
import Card from '../ui/Card';
import aiService from '../../lib/aiService';

const ChatBot = ({ onMaterialAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your enhanced AI assistant specialized in chemical engineering and manufacturing. I can help with:\n\n🔬 Formula optimization and cost reduction\n🛡️ Safety compliance and hazard analysis\n📦 Supplier intelligence and sourcing\n🔍 Quality troubleshooting and root cause analysis\n\nHow can I help optimize your operations today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return React.createElement(Image, { className: "h-4 w-4" });
    }
    return React.createElement(File, { className: "h-4 w-4" });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText || (attachedFiles.length > 0 ? 'Uploaded files:' : ''),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: attachedFiles.length > 0 ? [...attachedFiles] : null
    };

    setMessages(prev => [...prev, newMessage]);
    const userInput = inputText;
    const userFiles = [...attachedFiles];
    setInputText('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      // Build conversation history for AI context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Generate AI response with enhanced capabilities
      const aiResponse = await aiService.generateResponse(userInput, userFiles, conversationHistory);
      
      // Handle enhanced response types
      const botResponse = {
        id: messages.length + 2,
        text: aiResponse.response || aiResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        
        // Enhanced AI capabilities
        capabilityType: aiResponse.capabilityType || 'general',
        actionItems: aiResponse.actionItems || [],
        recommendations: aiResponse.recommendations || [],
        riskFactors: aiResponse.riskFactors || [],
        costImpact: aiResponse.costImpact || null,
        safetyLevel: aiResponse.safetyLevel || null,
        suppliers: aiResponse.suppliers || [],
        rootCauses: aiResponse.rootCauses || [],
        preventiveMeasures: aiResponse.preventiveMeasures || [],
        
        // Existing material addition functionality
        materialAdded: aiResponse.materialAdded || false,
        materialData: aiResponse.materialData || null,
        successMessage: aiResponse.successMessage || null,
        errorMessage: aiResponse.errorMessage || null
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Call refresh callback if material was added successfully
      if (botResponse.materialAdded && onMaterialAdded) {
        onMaterialAdded(botResponse.materialData);
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: 'I apologize, but I encountered an error processing your request. Please try again. If the issue persists, please contact technical support.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Enhanced message rendering for specialized AI capabilities
  const renderEnhancedMessage = (message) => {
    if (message.sender !== 'bot' || message.capabilityType === 'general') {
      return null;
    }

    return (
      <div className="mt-3 space-y-3">
        {/* Action Items */}
        {message.actionItems && message.actionItems.length > 0 && (
          <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-medium text-blue-200">Action Items</h4>
            </div>
            <ul className="space-y-1 text-xs text-blue-100">
              {message.actionItems.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-medium text-green-200">Recommendations</h4>
            </div>
            <ul className="space-y-1 text-xs text-green-100">
              {message.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">{index + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cost Impact */}
        {message.costImpact && (
          <div className="bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <h4 className="text-sm font-medium text-yellow-200">Cost Impact</h4>
            </div>
            <p className="text-xs text-yellow-100">{message.costImpact}</p>
          </div>
        )}

        {/* Safety Level Warning */}
        {message.safetyLevel && message.safetyLevel !== 'LOW_RISK' && (
          <div className={`bg-opacity-20 border rounded-lg p-3 ${
            message.safetyLevel === 'HIGH_RISK' 
              ? 'bg-red-600 border-red-500' 
              : 'bg-orange-600 border-orange-500'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${
                message.safetyLevel === 'HIGH_RISK' ? 'text-red-400' : 'text-orange-400'
              }`} />
              <h4 className={`text-sm font-medium ${
                message.safetyLevel === 'HIGH_RISK' ? 'text-red-200' : 'text-orange-200'
              }`}>
                {message.safetyLevel === 'HIGH_RISK' ? 'High Risk Warning' : 'Safety Caution'}
              </h4>
            </div>
            <p className={`text-xs ${
              message.safetyLevel === 'HIGH_RISK' ? 'text-red-100' : 'text-orange-100'
            }`}>
              Review safety recommendations carefully before proceeding.
            </p>
          </div>
        )}

        {/* Supplier Options */}
        {message.suppliers && message.suppliers.length > 0 && (
          <div className="bg-purple-600 bg-opacity-20 border border-purple-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-medium text-purple-200">Alternative Suppliers</h4>
            </div>
            <div className="space-y-2">
              {message.suppliers.map((supplier, index) => (
                <div key={index} className="text-xs text-purple-100">
                  <div className="font-medium text-purple-200">{supplier.name}</div>
                  <div className="text-purple-300 mt-1">{supplier.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Root Causes for Quality Issues */}
        {message.rootCauses && message.rootCauses.length > 0 && (
          <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-red-400" />
              <h4 className="text-sm font-medium text-red-200">Potential Root Causes</h4>
            </div>
            <ul className="space-y-1 text-xs text-red-100">
              {message.rootCauses.map((cause, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">{index + 1}.</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {message.riskFactors && message.riskFactors.length > 0 && (
          <div className="bg-orange-600 bg-opacity-20 border border-orange-500 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <h4 className="text-sm font-medium text-orange-200">Risk Factors</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {message.riskFactors.map((risk, index) => (
                <span key={index} className="px-2 py-1 bg-orange-700 bg-opacity-50 rounded text-xs text-orange-100">
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFileAttachment = (file, isInMessage = false) => {
    const isImage = file.type.startsWith('image/');
    
    return (
      <div key={file.id} className={`flex items-center space-x-2 p-2 rounded-md ${
        isInMessage ? 'bg-slate-600 bg-opacity-50' : 'bg-slate-700'
      }`}>
        {getFileIcon(file.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
        </div>
        {isImage && file.url && (
          <img 
            src={file.url} 
            alt={file.name}
            className="w-8 h-8 object-cover rounded"
          />
        )}
        {!isInMessage && (
          <button
            onClick={() => removeFile(file.id)}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 transition-all duration-200 ${isMinimized ? 'h-14' : 'h-[500px]'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-100">AI Assistant</h3>
              <p className="text-xs text-slate-400">Enhanced AI • Formula optimization • Safety analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Start Panel - shown when conversation is short */}
            {messages.length <= 1 && (
              <div className="p-4 border-b border-slate-600 bg-slate-800">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Quick Start Examples</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setInputText("Optimize my cleaner formula for 15% cost reduction: Surfactant 30%, Solvent 25%, Water 45%")}
                    className="text-left p-2 bg-blue-600 bg-opacity-20 border border-blue-500 rounded text-xs text-blue-200 hover:bg-opacity-30 transition-colors"
                  >
                    🔬 Formula optimization example
                  </button>
                  <button
                    onClick={() => setInputText("Safety analysis: mixing sodium hypochlorite with citric acid")}
                    className="text-left p-2 bg-red-600 bg-opacity-20 border border-red-500 rounded text-xs text-red-200 hover:bg-opacity-30 transition-colors"
                  >
                    🛡️ Safety compliance check
                  </button>
                  <button
                    onClick={() => setInputText("Find alternative suppliers for acetone - current supplier has 3-week lead times")}
                    className="text-left p-2 bg-purple-600 bg-opacity-20 border border-purple-500 rounded text-xs text-purple-200 hover:bg-opacity-30 transition-colors"
                  >
                    📦 Supplier intelligence
                  </button>
                  <button
                    onClick={() => setInputText("Quality issue: last 3 batches failed viscosity tests - viscosity too low")}
                    className="text-left p-2 bg-orange-600 bg-opacity-20 border border-orange-500 rounded text-xs text-orange-200 hover:bg-opacity-30 transition-colors"
                  >
                    🔍 Quality troubleshooting
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError 
                        ? 'bg-red-600 text-white border border-red-500'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    {message.text && (
                      <div className="text-sm mb-2 whitespace-pre-line">{message.text}</div>
                    )}
                    
                    {/* Enhanced AI Capabilities UI */}
                    {renderEnhancedMessage(message)}
                    
                    {/* Material Addition Success/Error Messages */}
                    {message.successMessage && (
                      <div className="mt-2 p-2 bg-green-600 bg-opacity-20 border border-green-500 rounded text-green-200">
                        <p className="text-sm">{message.successMessage}</p>
                        {message.materialData && (
                          <p className="text-xs mt-1 text-green-300">
                            Added to Raw Materials • ID: {message.materialData.id}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {message.errorMessage && (
                      <div className="mt-2 p-2 bg-red-600 bg-opacity-20 border border-red-500 rounded text-red-200">
                        <p className="text-sm">{message.errorMessage}</p>
                      </div>
                    )}
                    
                    {message.files && (
                      <div className="space-y-2">
                        {message.files.map(file => renderFileAttachment(file, true))}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* File Attachments Preview */}
            {attachedFiles.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-600 bg-slate-800 flex-shrink-0">
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {attachedFiles.map(file => renderFileAttachment(file))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-600 flex-shrink-0">
              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors flex-shrink-0"
                  title="Attach files"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-0 resize-none max-h-20"
                    rows={1}
                    style={{
                      minHeight: '40px',
                      height: '40px'
                    }}
                    onInput={(e) => {
                      e.target.style.height = '40px';
                      e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && attachedFiles.length === 0}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatBot; 