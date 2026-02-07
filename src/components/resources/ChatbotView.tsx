import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { MobileHeader } from "./MobileHeader";
import { getChatbotResponse } from "@/lib/gemini";

interface ChatbotViewProps {
  onBack: () => void;
}

export function ChatbotView({ onBack }: ChatbotViewProps) {
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; text: string; isBot: boolean }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    const newMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isBot: false,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const conversationHistory = chatMessages.map((msg) => ({
        role: msg.isBot ? ("assistant" as const) : ("user" as const),
        content: msg.text,
      }));

      const botResponse = await getChatbotResponse(
        userMessage,
        conversationHistory,
      );

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error. Please try again.",
        isBot: true,
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const suggestedQuestions = [
    "What is FBLA?",
    "How do I prepare for competition?",
    "Explain common business topics",
    "Tips for public speaking",
  ];

  return (
    <div className="absolute inset-0 bg-background flex flex-col">
      <MobileHeader title="FBLA Assistant" onBack={onBack} />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto momentum-scroll">
        {/* Welcome Card - shown when no messages */}
        {chatMessages.length === 0 && (
          <div className="px-4 py-6">
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    FBLA AI Assistant
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Ask me anything about FBLA
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                I can help you with competition preparation, business concepts,
                study tips, and more.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-1">
                Suggested questions:
              </p>
              <div className="space-y-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setChatInput(question)}
                    className="w-full text-left px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {chatMessages.length > 0 && (
          <div className="px-4 py-6 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-2 ${
                    message.isBot
                      ? "bg-card border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.isBot ? (
                    <div className="text-sm leading-relaxed text-foreground [&_*:first-child]:mt-0 [&_*:last-child]:mb-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-0.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2 space-y-0.5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          code: ({ className, children, ...props }) =>
                            className ? (
                              <code
                                className={`block p-2 rounded bg-muted text-xs overflow-x-auto ${className}`}
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <code
                                className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            ),
                          pre: ({ children }) => (
                            <pre className="overflow-x-auto mb-2">{children}</pre>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline underline-offset-2"
                            >
                              {children}
                            </a>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-base font-bold mt-2 mb-1 first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm font-bold mt-2 mb-1 first:mt-0">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-primary-foreground">
                      {message.text}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className="border-t border-border bg-card px-4 py-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
      >
        <div className="flex gap-3">
          <Input
            placeholder="Ask a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="h-12 text-base flex-1 rounded-lg px-4"
          />
          <Button
            size="icon"
            className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 rounded-lg"
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isChatLoading}
          >
            {isChatLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
