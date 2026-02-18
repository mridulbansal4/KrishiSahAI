import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowRight } from 'lucide-react';

const HomeChatPanel: React.FC = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        // Navigate to /chat with the initial message to start/continue conversation
        navigate('/chat', { state: { initialMessage: input } });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-light-green border-2 border-deep-green p-0 overflow-hidden relative rounded-3xl">
            {/* Header Area */}
            <div className="p-4 md:p-6 bg-deep-green/5 border-b border-deep-green/10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-deep-green tracking-tight leading-none">
                    Ask SahAI
                </h2>
                <p className="text-sm md:text-md text-deep-green/80 font-medium mt-1">
                    Ask anything about your farm.
                </p>
            </div>

            {/* Chat Area (Visual Placeholder for "Start") */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col justify-end">
                <div className="space-y-4">
                    <div className="flex justify-start">
                        <div className="bg-white border border-deep-green/20 p-3 md:p-4 max-w-[90%] md:max-w-[85%] rounded-2xl rounded-tl-none">
                            <p className="text-text-primary text-xs md:text-sm font-medium leading-relaxed">
                                Namaste! I am your AI Agriculture Assistant. How can I help you increase your harvest today?
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white border-t-2 border-deep-green">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type question..."
                        className="flex-1 p-3 md:p-4 bg-gray-50 text-text-primary placeholder:text-gray-400 focus:outline-none font-medium text-base md:text-lg border-2 border-gray-200 focus:border-deep-green transition-all rounded-xl"
                    />
                    <button
                        onClick={handleSend}
                        className="p-3 md:p-4 bg-deep-green text-white hover:bg-deep-green/90 transition-all active:scale-95 flex items-center justify-center min-w-[3rem] md:min-w-[3.5rem] rounded-xl"
                    >
                        <Send className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeChatPanel;
