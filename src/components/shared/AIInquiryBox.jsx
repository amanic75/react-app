import React, { useState } from 'react';
import { Send, Upload, MessageSquare } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AIInquiryBox = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsThinking(true);
    setResponse('');

    // Simulate AI thinking time
    setTimeout(() => {
      setIsThinking(false);
      setResponse(`As an AI assistant, I am processing your request regarding "${question}". Based on our chemical database and safety protocols, I can provide you with comprehensive information about this topic. Please note that all chemical processes should follow established safety guidelines.`);
      setQuestion('');
    }, 2000);
  };

  return (
    <Card className="p-6 h-fit">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-slate-900">AI Inquiry</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about chemical processes, safety protocols, or regulations..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm 
                     placeholder-slate-400 focus:outline-none focus:ring-2 
                     focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows={4}
          />
        </div>
        
        <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center">
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Drop files here or click to upload</p>
          <p className="text-xs text-slate-500">Support for PDFs, images, and documents</p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={!question.trim() || isThinking}
        >
          <Send className="h-4 w-4 mr-2" />
          {isThinking ? 'Processing...' : 'Submit Query'}
        </Button>
      </form>
      
      {(isThinking || response) && (
        <div className="mt-6 p-4 bg-slate-50 rounded-md">
          <h3 className="font-medium text-slate-900 mb-2">AI Response:</h3>
          {isThinking ? (
            <div className="flex items-center text-slate-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Thinking...
            </div>
          ) : (
            <p className="text-slate-700 text-sm leading-relaxed">{response}</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default AIInquiryBox; 