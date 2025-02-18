import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Loader2, Maximize2, Minimize2, ChevronDown, ChevronRight, PlusCircle, Copy, MousePointerClick } from 'lucide-react';
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
        [key: string]: string | undefined;
    };
    collapsedSections?: {
        thinking?: boolean;
        [key: string]: boolean | undefined;
    };
    sectionData?: {
        [key: string]: any;
    };
}

interface AIAssistantProps {
    onSuggest: (data: any) => void;
    endpoint: string;
    storageKey: string;
    sections?: string[];
    includeHistory?: boolean;
}

interface ChatStore {
    messages: Message[];
    suggestionHistory: Array<{ section: string; data: any }>;
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
    clearMessages: () => void;
    addToHistory: (section: string, data: any) => void;
}

const createChatStore = (storageKey: string) => create<ChatStore>()(
    persist(
        (set, get) => ({
            messages: [],
            suggestionHistory: [],
            addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
            setMessages: (messages) => set({ messages: typeof messages === 'function' ? messages(get().messages) : messages }),
            clearMessages: () => set({ messages: [] }),
            addToHistory: (section: string, data: any) => set((state) => ({
                suggestionHistory: [...state.suggestionHistory, { section, data }]
            })),
        }),
        {
            name: storageKey,
        }
    )
);

export function AIAssistant({ onSuggest, endpoint, storageKey, sections = [], includeHistory = true }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const useChatStore = useRef(createChatStore(storageKey));
    const { messages, setMessages, clearMessages } = useChatStore.current();
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

    const toggleSection = (messageIndex: number, section: string) => {
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

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: includeHistory
                        ? [...messages, userMessage].map(({ role, content }) => ({ role, content }))
                        : [userMessage].map(({ role, content }) => ({ role, content }))
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            if (!response.body) throw new Error('No response body');

            reader = response.body.getReader();
            let currentAssistantMessage = '';
            let currentThinking = '';
            let currentChatMessage = '';
            let currentSections: Record<string, string> = {};
            let dataFound = false;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '',
                sections: { thinking: '', ...sections.reduce((acc, section) => ({ ...acc, [section]: '' }), {}) },
                collapsedSections: {
                    thinking: true,
                    ...sections.reduce((acc, section) => ({ ...acc, [section]: true }), {})
                }
            }]);

            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    currentAssistantMessage += text;

                    // Process sections
                    sections.forEach(section => {
                        if (currentAssistantMessage.includes(`<${section}>`)) {
                            const parts = currentAssistantMessage.split(`<${section}>`);
                            if (parts[0].includes("</think>")) {
                                const thinkParts = parts[0].split("</think>");
                                currentThinking = thinkParts[0].replace("<think>", "").trim();
                                currentChatMessage = thinkParts[1].trim();
                            } else {
                                currentThinking = parts[0].replace("<think>", "").trim();
                                currentChatMessage = "";
                            }
                            currentSections[section] = parts[1] ? `<${section}>${parts[1]}` : '';
                        }
                    });

                    if (currentAssistantMessage.includes("</think>") && !sections.some(section => currentAssistantMessage.includes(`<${section}>`))) {
                        const parts = currentAssistantMessage.split("</think>");
                        currentThinking = parts[0].replace("<think>", "").trim();
                        currentChatMessage = parts[1].trim();
                    } else if (!sections.some(section => currentAssistantMessage.includes(`<${section}>`))) {
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
                                ...currentSections
                            };
                            if (!lastMessage.collapsedSections) {
                                lastMessage.collapsedSections = {
                                    thinking: true,
                                    ...sections.reduce((acc, section) => ({ ...acc, [section]: true }), {})
                                };
                            }
                        }
                        return newMessages;
                    });

                    if (!dataFound) {
                        for (const section of sections) {
                            const match = currentSections[section]?.match(new RegExp(`<${section}>\\n([\\s\\S]*?)\\n<\/${section}>`));
                            if (match) {
                                try {
                                    const data = JSON.parse(match[1]);
                                    onSuggest(data);
                                    dataFound = true;
                                    break;
                                } catch (error) {
                                    console.debug('Incomplete JSON, waiting for more data...');
                                }
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
                sections: {
                    thinking: t('ai.error'),
                    ...sections.reduce((acc, section) => ({ ...acc, [section]: '' }), {})
                },
                collapsedSections: {
                    thinking: false,
                    ...sections.reduce((acc, section) => ({ ...acc, [section]: false }), {})
                }
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
                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                <p className="text-center text-sm">{t('ai.emptyState')}</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`rounded-lg px-3 py-2 max-w-[80%] ${message.role === 'assistant' ? 'bg-muted space-y-2' : 'bg-primary text-primary-foreground'}`}
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
                                                {sections.map(section => (
                                                    message.sections?.[section] && (
                                                        <div key={section} className="space-y-1">
                                                            <button
                                                                onClick={() => toggleSection(index, section)}
                                                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                                            >
                                                                {message.collapsedSections?.[section] ?
                                                                    <ChevronRight className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                                {section.charAt(0).toUpperCase() + section.slice(1)}
                                                            </button>
                                                            {!message.collapsedSections?.[section] && (
                                                                <div className="space-y-2">
                                                                    <div className="pl-5">{message.sections[section]}</div>
                                                                    <div className="flex gap-2 pl-5">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const content = message.sections?.[section]?.match(new RegExp(`<${section}>\\n([\\s\\S]*?)\\n<\/${section}>`))?.[1] || '';
                                                                                navigator.clipboard.writeText(content);
                                                                            }}
                                                                        >
                                                                            <Copy className="h-4 w-4 mr-2" />
                                                                            {t('ai.copy')}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const match = message.sections?.[section]?.match(new RegExp(`<${section}>\\n([\\s\\S]*?)\\n<\/${section}>`));
                                                                                if (match) {
                                                                                    try {
                                                                                        const data = JSON.parse(match[1]);
                                                                                        onSuggest(data);
                                                                                    } catch (error) {
                                                                                        console.error('Error parsing section data:', error);
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <MousePointerClick className="h-4 w-4 mr-2" />
                                                                            {t('ai.apply')}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                ))}
                                            </>
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex items-center gap-2 p-4 border-t">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder={t('ai.inputPlaceholder')}
                            disabled={isLoading}
                        />
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('ai.send')}
                        </Button>
                    </div>
                </Card>
            )}
        </>
    );
}