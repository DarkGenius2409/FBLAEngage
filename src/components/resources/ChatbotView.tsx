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
    <div className="absolute inset-0 bg-background flex flex-col">
      <MobileHeader
        title="FBLA Assistant"
        subtitle="AI-Powered Help"
        onBack={onBack}
        rightAction={
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-accent-foreground" />
          </div>
        }
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 momentum-scroll bg-muted/30">
        {chatMessages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            {message.isBot && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[80%] ${
                message.isBot
                  ? 'bg-card border border-border shadow-sm'
                  : 'bg-primary'
              } rounded-2xl px-5 py-4`}
            >
              {message.isBot && index === 0 && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-primary">FBLA AI Assistant</span>
                  <span className="text-xs text-accent">● Online</span>
                </div>
              )}
              <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                message.isBot ? 'text-foreground' : 'text-primary-foreground'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        ))}
        
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="bg-card border border-border shadow-sm rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions (show when only welcome message) */}
      {chatMessages.length === 1 && (
        <div className="px-4 py-3 bg-background border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'What is FBLA?',
              'How do I prepare for competition?',
              'Explain Business Law topics',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setChatInput(suggestion);
                }}
                className="px-3 py-2 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div 
        className="border-t border-border bg-background px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <div className="flex gap-3">
          <Input
            placeholder="Ask about FBLA..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="h-14 text-base flex-1 rounded-xl px-4"
          />
          <Button
            size="icon"
            className="h-14 w-14 bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0 rounded-xl shadow-lg"
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
