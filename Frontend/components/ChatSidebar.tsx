import React from 'react';
import { Plus, MessageSquare, Menu, X, Trash2 } from 'lucide-react';
import { ChatSession } from '../services/chatService';

interface ChatSidebarProps {
    chats: ChatSession[];
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string, chatTitle: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    chats,
    activeChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    isOpen,
    onClose
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
        fixed md:relative 
        z-50 md:z-auto
        w-[280px] md:w-full 
        h-full 
        bg-white/60 backdrop-blur-md
        border-r border-[#E6E6E6]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
                {/* Header / New Chat */}
                <div className="p-4 border-b border-[#E6E6E6]">
                    <div className="flex justify-between items-center md:hidden mb-4">
                        <h2 className="font-bold text-[#1E1E1E]">Menu</h2>
                        <button onClick={onClose} className="p-2">
                            <X className="w-5 h-5 text-[#555555]" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            onNewChat();
                            onClose(); // Close on mobile after parsing
                        }}
                        className="w-full py-3 px-4 bg-[#043744] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#000D0F] transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chats.length === 0 ? (
                        <div className="text-center text-[#555555] text-sm mt-10 p-4">
                            <p>No chat history.</p>
                            <p className="text-xs mt-2 opacity-70">Start a new conversation with the advisor.</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                className={`
                        relative w-full text-left p-3 rounded-xl transition-all group
                        ${activeChatId === chat.id
                                        ? 'bg-[#E8F5E9] text-[#043744] font-bold border border-[#043744]/10'
                                        : 'text-[#555555] hover:bg-white hover:shadow-sm border border-transparent'}
                    `}
                            >
                                <button
                                    onClick={() => {
                                        onSelectChat(chat.id);
                                        onClose();
                                    }}
                                    className="w-full text-left"
                                >
                                    <div className="flex items-center gap-3 pr-8">
                                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-[#043744]' : 'text-stone-400'}`} />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm">{chat.title || "New Chat"}</p>
                                            {chat.updatedAt && (
                                                <p className="text-[10px] opacity-60 mt-0.5 font-normal">
                                                    {new Date(chat.updatedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id, chat.title || "New Chat");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                    aria-label="Delete chat"
                                    title="Delete chat"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / User Info could go here */}
                {/* <div className="p-4 border-t border-[#E6E6E6]"> ... </div> */}
            </div>
        </>
    );
};

