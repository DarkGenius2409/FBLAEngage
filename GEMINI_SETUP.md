# Gemini AI Setup Guide

This guide will help you set up Google Gemini AI for the AI Test Generator and Chatbot features.

## Getting Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google Account**
   - Use the same Google account you want to use for the API

3. **Create a new API key**
   - Click "Create API Key"
   - Select "Create API key in new project" (or choose an existing project)
   - Copy the generated API key

4. **Add to your .env file**
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

5. **Restart your development server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

## API Limits

- **Free tier**: 60 requests per minute
- **Rate limits**: May vary based on your Google Cloud project settings
- **Cost**: Free tier includes generous usage limits

## Testing

After setting up your API key:

1. **Test AI Test Generator**:
   - Go to Resources page
   - Click "AI Test Generator"
   - Enter a topic (e.g., "Accounting")
   - Click "Generate Test Questions"
   - You should see 5 AI-generated questions

2. **Test Chatbot**:
   - Go to Resources page
   - Click "FBLA AI Chatbot"
   - Ask a question (e.g., "What are the key components of a business plan?")
   - You should get an AI-generated response

## Troubleshooting

### "Gemini API key is not configured"
- Make sure `VITE_GEMINI_API_KEY` is in your `.env` file
- Restart your dev server after adding the key
- Check that the key doesn't have extra spaces or quotes

### "API request failed"
- Check that your API key is valid
- Verify you haven't exceeded rate limits
- Check your internet connection
- Make sure the API key has proper permissions

### "Unexpected response format"
- This usually means the API returned an error
- Check the browser console for more details
- Try again after a few seconds

## Security Notes

- **Never commit your API key to version control**
- Keep your `.env` file in `.gitignore`
- If you need to share the project, use `.env.example` with placeholder values
- Rotate your API key if it's accidentally exposed

## Features

### AI Test Generator
- Generates 5 comprehensive test questions for any FBLA topic
- Questions are tailored to FBLA competitive events
- Includes mix of question types (conceptual, application, analysis)
- Export questions as a text file

### FBLA Chatbot
- Answers questions about FBLA events and competitions
- Provides study tips and preparation strategies
- Helps with business concepts
- Maintains conversation context for better responses
