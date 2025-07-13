# AI Chatbot Setup Instructions

## Quick Setup (OpenAI Integration)

Your chatbot is now configured to use OpenAI's API. Follow these steps to make it functional:

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Set Environment Variable
I've created a `.env` file for you. Replace the placeholder with your actual API key:
```
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

Note: In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser.

⚠️ **Important**: Add `.env` to your `.gitignore` file to keep your API key secure!

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Open the chatbot in your application
3. Send a message about chemical formulas or safety protocols
4. The AI should respond with relevant information

## Alternative AI Services

### Option 2: Anthropic Claude (Alternative)
If you prefer Claude over OpenAI:

1. Install Claude SDK: `npm install @anthropic-ai/sdk`
2. Update `src/lib/aiService.js` to use Anthropic instead
3. Add `VITE_ANTHROPIC_API_KEY` to your `.env` file

### Option 3: Azure OpenAI (Enterprise)
For enterprise deployments:

1. Set up Azure OpenAI Service
2. Update the OpenAI configuration in `aiService.js`
3. Add Azure-specific environment variables

## Production Considerations

### Security
- **Never expose API keys in frontend code**
- Create a backend API endpoint to proxy AI requests
- Implement rate limiting and authentication

### Backend Implementation (Recommended)
Create an API endpoint like:
```javascript
// backend/api/ai-chat.js
app.post('/api/ai-chat', async (req, res) => {
  // Validate user authentication
  // Call AI service server-side
  // Return response
});
```

### Cost Management
- Set usage limits in your OpenAI dashboard
- Monitor token usage
- Implement message length limits
- Consider caching common responses

## Advanced Features

### File Upload Processing
The chatbot supports file uploads but currently only sends file metadata. To process actual file content:

1. **PDF Processing**: Use `pdf-parse` library
2. **Image Analysis**: Use OpenAI Vision API
3. **Excel/CSV**: Use libraries like `xlsx` or `csv-parser`

### Custom Training
For chemical industry-specific responses:

1. **Fine-tuning**: Train on your chemical data
2. **Vector Search**: Use embeddings for document search
3. **RAG System**: Combine AI with your knowledge base

## Troubleshooting

### Common Issues
- **"API key not found"**: Check your `.env` file
- **CORS errors**: API key should be used server-side
- **Rate limiting**: Implement request throttling

### Error Handling
The chatbot includes error handling for:
- API failures
- Network issues
- Invalid responses

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test basic functionality
3. 🔄 Implement backend proxy (recommended)
4. 🔄 Add file content processing
5. 🔄 Customize for chemical industry needs
6. 🔄 Deploy with production security

## File Structure
```
src/
├── lib/
│   └── aiService.js          # AI integration logic
├── components/
│   └── shared/
│       └── ChatBot.jsx       # Updated chatbot component
└── AI_SETUP_INSTRUCTIONS.md  # This file
```

Your chatbot is now ready for AI integration! Follow the setup steps above to make it functional. 