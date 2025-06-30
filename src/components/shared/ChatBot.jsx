import React, { useState, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Paperclip, File, Image } from 'lucide-react';
import Card from '../ui/Card';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I can help with chemical formulas, safety protocols, and analyze documents you upload. How can I help you today?",
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
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
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
    setInputText('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Simulate AI response with file analysis
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputText, newMessage.files),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userMessage, files) => {
    if (files && files.length > 0) {
      const fileTypes = files.map(f => f.type);
      if (fileTypes.some(type => type.includes('pdf'))) {
        return "I've analyzed your PDF document. Based on the content, I can help you understand chemical formulas, safety protocols, or material specifications. What specific information would you like me to extract or explain?";
      }
      if (fileTypes.some(type => type.includes('image'))) {
        return "I've processed your image. If it contains chemical diagrams, formulas, or lab equipment, I can help explain what I see. Would you like me to analyze any specific aspects?";
      }
      if (fileTypes.some(type => type.includes('csv') || type.includes('excel'))) {
        return "I've reviewed your data file. I can help analyze chemical data, material properties, or safety metrics. What insights are you looking for?";
      }
      return `I've received your ${files.length} file(s). I can analyze chemical documents, safety data sheets, formulas, and lab results. How would you like me to help with this content?`;
    }

    const responses = [
      "I can help you with chemical formulas, safety protocols, and material information. What specific topic would you like to explore?",
      "Based on our database, I can provide information about chemical compounds, their properties, and safety guidelines. What would you like to know?",
      "I'm here to assist with your chemical engineering questions. Feel free to ask about formulas, raw materials, or supplier information.",
      "That's an interesting question! Let me search our knowledge base for relevant information about chemical processes and safety protocols.",
      "I can help you understand chemical reactions, material properties, and regulatory compliance. What specific area interests you?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
              <p className="text-xs text-slate-400">Online • File uploads supported</p>
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
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    {message.text && <p className="text-sm mb-2">{message.text}</p>}
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