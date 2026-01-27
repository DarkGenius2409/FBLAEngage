/**
 * Google Gemini AI API Integration
 * Used for AI Test Generator and Chatbot features
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using gemini-1.5-flash (faster and more cost-effective) or gemini-1.5-pro (more capable)
// gemini-pro is deprecated, use gemini-1.5-flash or gemini-1.5-pro instead
const GEMINI_MODEL = 'gemini-2.5-flash'; // Change to 'gemini-1.5-pro' for better quality
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

if (!GEMINI_API_KEY) {
  console.warn('VITE_GEMINI_API_KEY is not set. AI features will not work.');
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Generate content using Gemini AI
 */
async function generateContent(prompt: string): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY) {
    return {
      text: '',
      error: 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.',
    };
  }

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        text: data.candidates[0].content.parts[0].text,
      };
    }

    throw new Error('Unexpected response format from Gemini API');
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to generate content',
    };
  }
}

/**
 * Generate test questions for a given FBLA event and topic
 */
export async function generateTestQuestions(eventName: string, topic: string): Promise<string[]> {
  const eventContext = eventName && eventName !== topic 
    ? `for the FBLA competitive event: "${eventName}"`
    : 'for FBLA (Future Business Leaders of America) competitions';
  
  const prompt = `Generate 5 comprehensive test questions ${eventContext} on the topic: "${topic}".

Requirements:
- Questions should be specifically relevant to ${eventName ? `the ${eventName} competitive event` : 'FBLA competitive events'}
- Include a mix of question types (conceptual, application, analysis, calculation if applicable)
- Format each question as a numbered list (1., 2., 3., etc.)
- Make questions challenging but appropriate for high school students
- Focus on practical business knowledge and skills relevant to ${eventName || 'FBLA'}
- Questions should test understanding of key concepts, terminology, and real-world applications

${eventName ? `Event: ${eventName}` : ''}
Topic: ${topic}

Generate exactly 5 questions:`;

  const result = await generateContent(prompt);

  if (result.error) {
    throw new Error(result.error);
  }

  // Parse the response into individual questions
  const questions = result.text
    .split(/\n+/)
    .filter((line) => {
      const trimmed = line.trim();
      // Match lines that start with numbers (1., 2., etc.) or are clearly questions
      return (
        trimmed.length > 10 &&
        (/^\d+[\.\)]\s/.test(trimmed) || trimmed.startsWith('Q') || trimmed.includes('?'))
      );
    })
    .map((line) => line.trim())
    .slice(0, 5); // Take first 5 questions

  // If parsing didn't work well, split by numbered patterns
  if (questions.length < 3) {
    const numberedMatches = result.text.match(/\d+[\.\)]\s+[^\n]+/g);
    if (numberedMatches) {
      return numberedMatches.slice(0, 5).map((q) => q.trim());
    }
  }

  // Fallback: return the full text split by double newlines
  if (questions.length === 0) {
    return result.text.split(/\n\n+/).filter((q) => q.trim().length > 20).slice(0, 5);
  }

  return questions.length > 0 ? questions : [result.text];
}

/**
 * Get chatbot response for a user message
 */
export async function getChatbotResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  // Build conversation context
  const systemPrompt = `You are a helpful assistant for FBLA (Future Business Leaders of America) students. Your role is to:
- Answer questions about FBLA competitive events, rules, and best practices
- Provide study tips and preparation strategies
- Help with business concepts relevant to FBLA competitions
- Offer guidance on leadership and professional development
- Be encouraging and supportive

Keep responses concise (2-3 sentences when possible) but informative. If asked about something outside FBLA scope, politely redirect to FBLA-related topics.`;

  // Build the full prompt with conversation history
  let prompt = systemPrompt + '\n\n';
  
  // Add recent conversation history (last 5 exchanges to keep context manageable)
  const recentHistory = conversationHistory.slice(-5);
  for (const msg of recentHistory) {
    prompt += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n\n`;
  }
  
  prompt += `Student: ${userMessage}\n\nAssistant:`;

  const result = await generateContent(prompt);

  if (result.error) {
    return `I'm sorry, I encountered an error: ${result.error}. Please try again or check your API configuration.`;
  }

  return result.text.trim();
}
