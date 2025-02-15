import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Loader2, Maximize2, Minimize2, ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sections?: {
    thinking?: string;
    template?: string;
  };
  collapsedSections?: {
    thinking?: boolean;
    template?: boolean;
  };
}

interface AIAssistantProps {
  onSuggest: (template: any) => void;
}

interface ChatStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  clearMessages: () => void;
}

const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages: typeof messages === 'function' ? messages(get().messages) : messages }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ai-chat-storage',
    }
  )
);

export function AIAssistant({ onSuggest }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, setMessages, clearMessages } = useChatStore();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const isAtBottom = (container: HTMLElement) => {
    const { scrollTop, scrollHeight, clientHeight } = container;
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (shouldAutoScroll || isAtBottom(container)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    setShouldAutoScroll(isAtBottom(container));
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && isAtBottom(container)) {
      scrollToBottom();
    }
  }, [messages]);

  const toggleSection = (messageIndex: number, section: 'thinking' | 'template') => {
    setMessages(prev => prev.map((msg, idx) => {
      if (idx === messageIndex) {
        return {
          ...msg,
          collapsedSections: {
            ...msg.collapsedSections,
            [section]: !msg.collapsedSections?.[section]
          }
        };
      }
      return msg;
    }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/ai/template-suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [userMessage] }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        if (!response.body) throw new Error('No response body');
        
        reader = response.body.getReader();
        let currentAssistantMessage = '';
        let currentThinking = '';
        let currentChatMessage = '';
        let currentTemplate = '';
        let templateFound = false;
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          sections: { thinking: '', template: '' },
          collapsedSections: {
            thinking: true,
            template: true
          }
        }]);
        
        const decoder = new TextDecoder();
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const text = decoder.decode(value, { stream: true });
                currentAssistantMessage += text;

                if (currentAssistantMessage.includes("<template>")) {
                    const parts = currentAssistantMessage.split("<template>");
                    if (parts[0].includes("</think>")) {
                        const thinkParts = parts[0].split("</think>");
                        currentThinking = thinkParts[0].replace("<think>", "").trim();
                        currentChatMessage = thinkParts[1].trim();
                    } else {
                        currentThinking = parts[0].replace("<think>", "").trim();
                        currentChatMessage = "";
                    }
                    currentTemplate = parts[1] ? `<template>${parts[1]}` : '';
                } else if (currentAssistantMessage.includes("</think>")) {
                    const parts = currentAssistantMessage.split("</think>");
                    currentThinking = parts[0].replace("<think>", "").trim();
                    currentChatMessage = parts[1].trim();
                } else {
                    currentThinking = currentAssistantMessage.replace("<think>", "").trim();
                    currentChatMessage = "";
                }
                
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.role === 'assistant') {
                        lastMessage.content = currentChatMessage;
                        lastMessage.sections = {
                            thinking: currentThinking,
                            template: currentTemplate
                        };
                        if (!lastMessage.collapsedSections) {
                            lastMessage.collapsedSections = {
                                thinking: true,
                                template: true
                            };
                        }
                    }
                    return newMessages;
                });

                if (!templateFound) {
                    const templateMatch = currentTemplate.match(/<template>\n([\s\S]*?)\n<\/template>/);
                    if (templateMatch) {
                        try {
                            const template = JSON.parse(templateMatch[1]);
                            onSuggest(template);
                            templateFound = true;
                        } catch (error) {
                            console.debug('Incomplete JSON, waiting for more data...');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Stream reading error:', error);
            throw error;
        } finally {
            reader.releaseLock();
        }

    } catch (error) {
        console.error('AI Assistant Error:', error);
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: t('ai.error'),
            sections: { thinking: t('ai.error'), template: '' },
            collapsedSections: { thinking: false, template: false }
        }]);
    } finally {
        setIsLoading(false);
        if (reader) {
            try {
                reader.releaseLock();
            } catch (e) {
                console.debug('Error releasing reader lock:', e);
            }
        }
    }
  };

  const handleNewChat = () => {
    if (isLoading) return;
    clearMessages();
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare />
      </Button>

      {isOpen && (
        <Card 
          className={cn(
            "fixed right-4 flex flex-col shadow-lg transition-all duration-300",
            isMaximized 
              ? "bottom-20 w-[800px] h-[600px]"
              : "bottom-20 w-80 h-96"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">{t('ai.assistant')}</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleNewChat}
                disabled={isLoading}
                title={t('ai.newChat')}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-muted space-y-2'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.role === 'assistant' && message.sections ? (
                    <>
                      {message.sections.thinking && (
                        <div className="space-y-1">
                          <button
                            onClick={() => toggleSection(index, 'thinking')}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {message.collapsedSections?.thinking ? 
                              <ChevronRight className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                            Thinking
                          </button>
                          {!message.collapsedSections?.thinking && (
                            <div className="pl-5">{message.sections.thinking}</div>
                          )}
                        </div>
                      )}
                      {message.content && (
                        <div className="py-2">{message.content}</div>
                      )}
                      {message.sections.template && (
                        <div className="space-y-1">
                          <button
                            onClick={() => toggleSection(index, 'template')}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {message.collapsedSections?.template ? 
                              <ChevronRight className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                            Template
                          </button>
                          {!message.collapsedSections?.template && (
                            <div className="pl-5">{message.sections.template}</div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('ai.inputPlaceholder')}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('ai.send')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
} 