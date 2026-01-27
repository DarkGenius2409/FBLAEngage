import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Loader2 } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { getChatbotResponse } from '@/lib/gemini';

interface ChatbotViewProps {
  onBack: () => void;
}

export function ChatbotView({ onBack }: ChatbotViewProps) {
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isBot: boolean }>>([
    { id: '1', text: 'Hello! I\'m your FBLA assistant. How can I help you today?', isBot: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    const newMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const conversationHistory = chatMessages
        .filter(msg => msg.id !== '1')
        .map(msg => ({
          role: msg.isBot ? ('assistant' as const) : ('user' as const),
          content: msg.text,
        }));

      const botResponse = await getChatbotResponse(userMessage, conversationHistory);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again or check your API configuration.',
        isBot: true,
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <MobileHeader
        title="FBLA Assistant"
        subtitle="Ask me anything about FBLA"
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.isBot
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="h-12 text-base flex-1"
          />
          <Button
            size="icon"
            className="h-12 w-12 bg-primary hover:bg-primary/90 flex-shrink-0"
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isChatLoading}
          >
            {isChatLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
