import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../src/context/LanguageContext';
import { useFarm } from '../src/context/FarmContext';
import {
    Cloud,
    TrendingUp,
    AlertTriangle,
    MapPin,
    Info,
    Calendar,
    CheckCircle2,
    Sparkles,
    Search,
    X,
    MessageSquare,
    Send,
    Loader2
} from 'lucide-react';

interface AIResult {
    fertilizer_options?: {
        name: string;
        action: string;
        quantity: string;
        timing: string;
        advantages: string[];
    }[];
    market_advice?: {
        timing: string;
        rationale: string;
        confidence_percentage: number;
        confidence_label: string;
    };
    insights?: string[];
}

const FarmHealth: React.FC = () => {
    const { t } = useLanguage();
    const { farms } = useFarm();

    // AI Integration States
    const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
    const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});

    // Chat Modal States
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [chatContext, setChatContext] = useState<any>(null);
    const [chatCrop, setChatCrop] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialLoadTriggered = useRef<Set<string>>(new Set());



    const analyzeSoil = async (farmIndex: number, cropIndex: number, crop: string) => {
        const key = `${farmIndex}-${cropIndex}`;
        setAnalyzing(prev => ({ ...prev, [key]: true }));

        try {
            const inputs = { n: 'N/A', p: 'N/A', k: 'N/A', ph: 'N/A' };
            const token = localStorage.getItem('token');
            const farm = farms[farmIndex];
            const location = farm.district && farm.state ? `${farm.district}, ${farm.state}` : (farm.state || 'India');
            const soilType = farm.soilType || farm.landType || 'Unknown Soil Type';

            const res = await fetch('http://localhost:5000/api/farm-health/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ crop, soil_data: inputs, location, soil_type: soilType })
            });
            const data = await res.json();
            if (data.success && data.result) {
                setAiResults(prev => ({ ...prev, [key]: data.result }));
            }
        } catch (error) {
            console.error("AI Analysis failed", error);
        } finally {
            setAnalyzing(prev => ({ ...prev, [key]: false }));
        }
    };

    const openDeepDive = (result: AIResult, crop: string) => {
        setChatContext(result);
        setChatCrop(crop);
        setMessages([{
            role: 'assistant',
            text: `Hi! I am your AI Agronomist.I've analyzed your ${crop}. Ask me anything about my recommendations! `
        }]);
        setChatModalOpen(true);
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || isStreaming) return;

        const userMsg = chatInput;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsStreaming(true);
        setMessages(prev => [...prev, { role: 'assistant', text: '' }]); // Placeholder

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/farm-health/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ context: chatContext, question: userMsg })
            });

            if (!res.body) throw new Error("No response body");
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunkStr = decoder.decode(value);
                const lines = chunkStr.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.chunk) {
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[newMsgs.length - 1].text += data.chunk;
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            // ignore parse error on incomplete chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].text = "Sorry, I encountered an error connecting to the AI.";
                return newMsgs;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-load analysis
    useEffect(() => {
        if (farms && farms.length > 0) {
            farms.forEach((farm, fIndex) => {
                if (farm.crops) {
                    farm.crops.forEach((crop, cIndex) => {
                        const key = `${fIndex}-${cIndex}`;
                        if (!initialLoadTriggered.current.has(key)) {
                            initialLoadTriggered.current.add(key);
                            // Fire and forget analyze call
                            analyzeSoil(fIndex, cIndex, crop).catch(console.error);
                        }
                    });
                }
            });
        }
    }, [farms]); // Only trigger when farms list changes/loads

    return (
        <div className="min-h-screen bg-[#FBFBFA] pb-20">
            {/* Header */}
            <div className="bg-[#1B5E20] text-white p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
                        {t.featureHealthLongTitle || "Farm Health Monitor"}
                    </h1>
                    <p className="text-green-100 font-bold opacity-80">
                        {farms.length > 0 ? `${farms.length} Farms Integrated` : 'No Farms Registered'}
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-10">
                {farms.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">No farms found. Please add a farm in your Profile.</div>
                ) : (
                    farms.map((farm, fIndex) => (
                        <div key={fIndex} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            {/* Farm Header */}
                            <div className="bg-[#E8F5E9] p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-[#1B5E20] uppercase tracking-tight flex items-center gap-2">
                                        <MapPin className="w-6 h-6" /> {farm.nickname}
                                    </h2>
                                    <p className="text-[#1B5E20]/70 font-bold text-sm mt-1 uppercase tracking-wider">
                                        {farm.landSize} {farm.unit} • {farm.landType}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 md:p-8">
                                {(!farm.crops || farm.crops.length === 0) ? (
                                    <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl p-8 text-center">
                                        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                                        <p className="text-yellow-800 font-bold text-sm uppercase">{t.noCropSelected || "No crops selected for this farm."}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {farm.crops.map((crop, cIndex) => {
                                            const cropKey = `${fIndex}-${cIndex}`;
                                            const result = aiResults[cropKey];

                                            return (
                                                <div key={cIndex} className="bg-[#FAFAF7] border-2 border-[#1B5E20]/5 rounded-[2rem] p-6 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                                                        <Sparkles className="w-5 h-5 text-green-500" />
                                                        <h3 className="text-xl font-black text-[#1B5E20] uppercase tracking-wide">
                                                            {crop}
                                                        </h3>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-black text-[#1E1E1E] uppercase tracking-widest flex items-center gap-2 mb-4">
                                                            <TrendingUp className="w-4 h-4 text-[#1B5E20]" /> {t.fertilizerRec || "Fertilizer Recommendation"}
                                                        </h4>

                                                        <div className="bg-white border-2 border-green-50 rounded-2xl p-6 shadow-sm">
                                                            {!result ? (
                                                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-emerald-100/50 bg-gradient-to-b from-transparent to-emerald-50/30">
                                                                    <div className="relative mb-6">
                                                                        <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                                                        <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-emerald-50">
                                                                            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                                                        </div>
                                                                    </div>
                                                                    <h4 className="text-sm font-black uppercase tracking-widest text-emerald-800 mb-2">Analyzing Crop Context...</h4>
                                                                    <p className="text-xs font-medium text-emerald-600/70 max-w-xs leading-relaxed">Cross-referencing your soil type and location with the latest agrinomic AI models.</p>
                                                                </div>
                                                            ) : (
                                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                                                                    {result.fertilizer_options?.map((option, optIdx) => (
                                                                        <div key={optIdx} className="border border-emerald-100 rounded-3xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden mb-5">
                                                                            {/* Subtle Background Accent */}
                                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-60"></div>

                                                                            <div className="flex items-start gap-4 mb-5">
                                                                                <div className="w-12 h-12 bg-gradient-to-br from-[#1B5E20] to-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                                                                                    {optIdx + 1}
                                                                                </div>
                                                                                <div className="flex-1 pt-1">
                                                                                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Option {optIdx + 1}</h5>
                                                                                    <h4 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                                                                                        {option.name ? option.name : option.action}
                                                                                    </h4>
                                                                                    {option.name && option.action && (
                                                                                        <p className="text-sm font-medium text-gray-600 mt-1">{option.action}</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 gap-4 mb-5">
                                                                                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Quantity
                                                                                    </p>
                                                                                    <p className="text-sm font-bold text-gray-800">{option.quantity}</p>
                                                                                </div>
                                                                                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> Timing
                                                                                    </p>
                                                                                    <p className="text-sm font-bold text-gray-800">{option.timing}</p>
                                                                                </div>
                                                                            </div>

                                                                            {option.advantages && option.advantages.length > 0 && (
                                                                                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
                                                                                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                                                        <Sparkles className="w-3.5 h-3.5" /> Advantages & Benefits
                                                                                    </p>
                                                                                    <ul className="space-y-2.5">
                                                                                        {option.advantages.map((adv, idx) => (
                                                                                            <li key={idx} className="text-sm font-medium text-gray-700 flex items-start gap-2.5">
                                                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                                                                <span className="leading-relaxed">{adv}</span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}

                                                                    <button
                                                                        onClick={() => openDeepDive(result, crop)}
                                                                        className="w-full mt-2 group relative flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/20 active:scale-[0.98]">
                                                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                                        <Sparkles className="w-5 h-5 relative z-10 text-emerald-400 group-hover:text-white transition-colors" />
                                                                        <span className="relative z-10 text-sm font-black uppercase tracking-[0.2em]">Deep Dive Analysis</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Deep Dive Modal */}
            {chatModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1B5E20] text-white rounded-t-3xl">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-green-300" /> Deep Dive: {chatCrop}
                                </h3>
                                <p className="text-xs text-green-100/70 font-bold uppercase tracking-widest mt-1">AI Agronomist Assistant</p>
                            </div>
                            <button onClick={() => setChatModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FBFBFA]">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-[#1B5E20] text-white rounded-br-sm'
                                        : 'bg-white border text-gray-800 border-gray-200 rounded-bl-sm shadow-sm'
                                        }`}>
                                        <div
                                            // Make bold text work via basic replacement
                                            dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                            className="whitespace-pre-wrap leading-relaxed"
                                        />
                                        {msg.role === 'assistant' && msg.text === '' && (
                                            <div className="flex gap-1 items-center h-4">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-100" />
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }}
                                className="flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Ask about fertilizer, market, or timing..."
                                    className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] font-medium"
                                    disabled={isStreaming}
                                />
                                <button
                                    type="submit"
                                    disabled={isStreaming || !chatInput.trim()}
                                    className="bg-[#1B5E20] text-white p-3 rounded-xl hover:bg-[#004D40] disabled:opacity-50 transition"
                                >
                                    {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmHealth;
