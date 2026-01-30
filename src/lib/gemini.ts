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
 * Multiple choice question structure
 */
export interface MultipleChoiceQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

/**
 * Generate multiple choice test questions for a given FBLA event
 */
export async function generateTestQuestions(eventName: string, _topic: string): Promise<string[]> {
  // Legacy function - kept for backwards compatibility
  const result = await generateMultipleChoiceQuestions(eventName, 5);
  return result.map((q, i) => `${i + 1}. ${q.question}`);
}

/**
 * Generate multiple choice questions for a given FBLA event
 */
export async function generateMultipleChoiceQuestions(
  eventName: string, 
  questionCount: number
): Promise<MultipleChoiceQuestion[]> {
  const prompt = `Generate exactly ${questionCount} multiple choice questions for the FBLA competitive event: "${eventName}".

IMPORTANT: You must respond with ONLY a valid JSON array, no other text.

Requirements:
- Questions should be specifically relevant to the ${eventName} competitive event
- Each question should have exactly 4 options (A, B, C, D)
- Only one answer should be correct
- Make questions challenging but appropriate for high school students
- Questions should test understanding of key concepts, terminology, and real-world applications

Respond with ONLY this JSON format (no markdown, no explanation):
[
  {
    "question": "What is...",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A"
  }
]

Generate exactly ${questionCount} questions in valid JSON format:`;

  const result = await generateContent(prompt);

  if (result.error) {
    throw new Error(result.error);
  }

  try {
    // Try to extract JSON from the response
    let jsonText = result.text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Find the JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const questions = JSON.parse(jsonText) as MultipleChoiceQuestion[];
    
    // Validate the structure
    const validQuestions = questions.filter(q => 
      q.question && 
      q.options && 
      q.options.A && q.options.B && q.options.C && q.options.D &&
      ['A', 'B', 'C', 'D'].includes(q.correctAnswer)
    ).slice(0, questionCount);
    
    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }
    
    return validQuestions;
  } catch (parseError) {
    console.error('Failed to parse questions:', parseError, result.text);
    throw new Error('Failed to parse generated questions. Please try again.');
  }
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
