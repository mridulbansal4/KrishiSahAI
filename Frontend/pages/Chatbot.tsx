import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language, ChatMessage } from '../types';
import {
    Send,
    ArrowLeft,
    Menu,
    Bot,
    User
} from 'lucide-react';
import { translations } from '../translations';
import { api } from '../services/api';
import { auth } from '../firebase';
import { getUserProfile } from '../services/firebase_db';
import { chatService, ChatSession, Message } from '../services/chatService';
import { ChatLayout } from '../components/ChatLayout';
import { ChatSidebar } from '../components/ChatSidebar';
import { onAuthStateChanged } from 'firebase/auth';

const Chatbot: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang];
    const location = useLocation();
    const navigate = useNavigate();

    // Auth & User State
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Chat Data State
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // UI State
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Backend Session State
    const [backendSessionId, setBackendSessionId] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // 1. Initialize Auth and Load Chats
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Subscribe to chats
                const unsubChats = chatService.subscribeToUserChats(currentUser.uid, (data) => {
                    setChats(data);
                });
                setAuthLoading(false);
                return () => unsubChats();
            } else {
                setUser(null);
                setAuthLoading(false);
                setChats([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Handle Active Chat Selection
    useEffect(() => {
        const loadActiveChat = async () => {
            if (!user || !activeChatId) {
                setMessages([]);
                setBackendSessionId(null);
                return;
            }

            setIsLoading(true);
            try {
                // Find chat object to get backend ID
                const chat = chats.find(c => c.id === activeChatId);
                if (chat?.backendSessionId) {
                    setBackendSessionId(chat.backendSessionId);
                } else {
                    // If no backend ID stored, we might need to init a new one or handle it
                    // For now, let's assume we'll init if missing when sending message
                    setBackendSessionId(null);
                }

                const msgs = await chatService.getChatMessages(user.uid, activeChatId);
                setMessages(msgs);
            } catch (err) {
                console.error("Failed to load chat:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadActiveChat();
    }, [activeChatId, user]); // Removing chats dependency to prevent loop, relying on find

    // 3. Handle Navigation State (e.g. "Ask AI" from other pages)
    useEffect(() => {
        if (location.state?.initialMessage && !activeChatId && !isLoading && user) {
            const initMsg = location.state.initialMessage;
            // Clear state to prevent loop
            window.history.replaceState({}, document.title);
            handleSend(initMsg);
        }
    }, [location.state, user]);


    const initBackendSession = async () => {
        try {
            console.log("[Chatbot] Initializing backend session for user:", user.uid);
            const profile = await getUserProfile(user.uid);
            console.log("[Chatbot] User profile loaded:", profile);

            const data = await api.post('/business-advisor/init', {
                name: profile?.name || "Farmer",
                land_size: profile?.land_size || 5,
                language: lang.toLowerCase(),
                ...profile
            });

            console.log("[Chatbot] Init response:", data);

            if (data.success && data.session_id) {
                console.log("[Chatbot] Backend session initialized:", data.session_id);
                return data.session_id;
            } else {
                console.error("[Chatbot] Init returned success=false or no session_id");
            }
        } catch (e) {
            console.error("[Chatbot] Init session failed:", e);
        }
        return null;
    };

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
        setBackendSessionId(null);
        setInput('');
        setIsSidebarOpen(false); // Close sidebar on mobile
    };

    const handleSend = async (manualMessage?: string) => {
        const text = manualMessage || input;
        if (!text.trim() || !user) return;

        setInput('');

        // Optimistic UI update
        const tempUserMsg: Message = { role: 'user', content: text, createdAt: new Date() };
        setMessages(prev => [...prev, tempUserMsg]);

        let currentChatId = activeChatId;
        let currentBackendId = backendSessionId;

        try {
            // Initialize Chat & Session if needed
            if (!currentChatId) {
                // 1. Init Backend Session
                if (!currentBackendId) {
                    currentBackendId = await initBackendSession();
                    setBackendSessionId(currentBackendId);
                }

                // 2. Create Firestore Chat
                // Generate simple title from first few words
                const title = text.split(' ').slice(0, 5).join(' ') + "...";
                currentChatId = await chatService.createChat(user.uid, title, currentBackendId || undefined);
                setActiveChatId(currentChatId);
            } else if (!currentBackendId) {
                // Resuming a chat that lost its backend session?
                currentBackendId = await initBackendSession();
                setBackendSessionId(currentBackendId);
                // Note: we might want to update the chat doc with this new ID
            }

            // Save User Message to Firestore
            if (currentChatId) {
                await chatService.saveMessage(user.uid, currentChatId, tempUserMsg);
            }

            // Stream Response
            if (!currentBackendId) {
                console.error("[Chatbot] Cannot stream: No backend session ID");
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Error: Failed to initialize AI session. Please try refreshing the page.",
                    createdAt: new Date()
                }]);
                return;
            }

            console.log("[Chatbot] Streaming with session ID:", currentBackendId);
            setMessages(prev => [...prev, { role: 'assistant', content: '', createdAt: new Date() }]);

            let responseText = '';
            let retryCount = 0;
            const MAX_RETRIES = 1;

            const attemptStream = async (): Promise<void> => {
                try {
                    await api.stream(
                        '/business-advisor/chat/stream',
                        {
                            message: text,
                            session_id: currentBackendId,
                            language: lang.toLowerCase()
                        },
                        (chunk) => {
                            responseText += chunk;
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                const last = newMsgs[newMsgs.length - 1];
                                if (last.role === 'assistant') {
                                    last.content = responseText;
                                }
                                return newMsgs;
                            });
                        },
                        async (err) => {
                            // Check if this is an invalid session error
                            if (err?.message?.includes('Invalid session_id') && retryCount < MAX_RETRIES) {
                                retryCount++;
                                console.warn("[Chatbot] Invalid session detected, reinitializing...");

                                // Clear stale session
                                currentBackendId = null;
                                setBackendSessionId(null);

                                // Re-initialize session
                                currentBackendId = await initBackendSession();
                                setBackendSessionId(currentBackendId);

                                // Update Firestore chat with new backend ID
                                if (currentChatId && currentBackendId) {
                                    await chatService.updateChatBackendSession(user.uid, currentChatId, currentBackendId);
                                }

                                if (currentBackendId) {
                                    console.log("[Chatbot] Session reinitialized, retrying stream...");
                                    // Retry the stream
                                    await attemptStream();
                                } else {
                                    throw new Error("Failed to reinitialize session");
                                }
                            } else {
                                throw err;
                            }
                        }
                    );
                } catch (error) {
                    console.error("Stream Error:", error);
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const last = newMsgs[newMsgs.length - 1];
                        if (last.role === 'assistant') {
                            last.content = "Error: Could not connect to AI. Please try again.";
                        }
                        return newMsgs;
                    });
                }
            };

            await attemptStream();

            // Save Assistant Message to Firestore when done
            if (currentChatId && responseText) {
                await chatService.saveMessage(user.uid, currentChatId, {
                    role: 'assistant',
                    content: responseText,
                    createdAt: new Date()
                });
            }

        } catch (e) {
            console.error("Send Loop Error:", e);
        }
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const Sidebar = (
        <ChatSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onNewChat={handleNewChat}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
    );

    return (
        <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] max-w-7xl mx-auto md:p-6 p-0">
            <ChatLayout sidebar={Sidebar}>
                {/* Header for Back Navigation (if from Advisory OR CropCare) - Visible on both Mobile & Desktop */}
                {(location.state?.fromAdvisory || location.state?.fromCropCare) && (
                    <div className="flex items-center p-4 border-b border-[#E6E6E6] bg-white sticky top-0 z-30">
                        <button
                            onClick={() => {
                                // Navigate back to source with restored state
                                const targetPath = location.state?.fromAdvisory ? '/advisory' : '/crop-care';
                                navigate(targetPath, { state: location.state.previousState });
                            }}
                            className="flex items-center gap-2 text-[#555555] font-bold hover:text-[#1F5F4A] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {t.back} to {location.state?.fromAdvisory ? 'Recommendations' : 'Assessment'}
                        </button>
                    </div>
                )}

                {/* Mobile Header (Only show if NOT from advisory, OR keep it but maybe different style? 
                    Actually, if from advisory, we probably want the back button to take precedence.
                    Let's hide the default mobile header if we show the back button locally, OR just stack them.
                    Stacking might be crowded. Let's show Mobile Header only if NOT from advisory, 
                    OR modify it. 
                    Simple approach: If fromAdvisory, showing the back button bar above is fine. 
                */}
                {!location.state?.fromAdvisory && !location.state?.fromCropCare && (
                    <div className="md:hidden flex items-center p-4 border-b border-[#E6E6E6] bg-white sticky top-0 z-10">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 mr-2">
                            <Menu className="w-6 h-6 text-[#1E1E1E]" />
                        </button>
                        <h1 className="text-lg font-bold text-[#1E1E1E]">Knowledge Assistant</h1>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-24 h-24 bg-[#FAFAF7] rounded-[32px] flex items-center justify-center mb-6">
                                <Bot className="w-12 h-12 text-[#1F5F4A]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">{t.navAskAI}</h2>
                            <p className="max-w-xs mx-auto text-[#555555]">Ask about crop diseases, market prices, or farming techniques.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-[#1F5F4A] flex items-center justify-center mt-2 flex-shrink-0">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                )}

                                <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[24px] shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#1F5F4A] text-white rounded-tr-sm'
                                    : 'bg-[#FAFAF7] text-[#1E1E1E] border border-[#E6E6E6] rounded-tl-sm'
                                    }`}>
                                    <div className={`text-[15px] leading-relaxed markdown-body whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : ''}`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            components={{
                                                strong: ({ node, ...props }) => <span className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-[#1F5F4A]'}`} {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                            }}
                                        >
                                            {msg.content || ""}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-[#E9F2EF] flex items-center justify-center mt-2 flex-shrink-0">
                                        <User className="w-5 h-5 text-[#1F5F4A]" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-white border-t border-[#E6E6E6]">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t.chatPlaceholder}
                            className="w-full p-4 pr-14 bg-[#FAFAF7] border border-[#E6E6E6] rounded-[24px] focus:outline-none focus:border-[#1F5F4A] focus:ring-4 focus:ring-[#1F5F4A]/5 transition-all font-medium placeholder:text-stone-400"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 bg-[#1F5F4A] text-white rounded-2xl hover:bg-[#184d3c] disabled:opacity-50 disabled:bg-stone-300 transition-all shadow-md"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] uppercase font-bold tracking-widest text-stone-400 mt-3">
                        AI can make mistakes. Verify important info.
                    </p>
                </div>
            </ChatLayout>
        </div>
    );
};

export default Chatbot;
