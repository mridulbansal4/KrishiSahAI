import React from 'react';

interface WeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    wind_speed: number;
    daily_max_temp: number;
    daily_min_temp: number;
    rainfall_probability: number;
}

interface WeatherModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: WeatherData | null;
    loading: boolean;
    location: string;
}

const WeatherModal: React.FC<WeatherModalProps> = ({ isOpen, onClose, data, loading, location }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-[#1F5F4A] p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-3xl">☁</span> {location}
                        </h2>
                        <p className="text-white/80 text-sm font-medium mt-1">Live Weather Updates</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1F5F4A]"></div>
                            <p className="text-[#555555] font-medium">Fetching latest weather...</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-8">
                            {/* Main Temp */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-5xl font-extrabold text-[#1E1E1E]">{data.temperature}°C</div>
                                    <div className="text-[#1F5F4A] font-bold text-lg mt-1">{data.condition}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-[#555555] font-bold uppercase tracking-widest mb-1">High / Low</div>
                                    <div className="text-xl font-bold text-[#1E1E1E]">{data.daily_max_temp}° / {data.daily_min_temp}°</div>
                                </div>
                            </div>

                            {/* Grid Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-[#FAFAF7] p-4 rounded-2xl border border-[#E6E6E6] flex flex-col items-center text-center hover:border-[#1F5F4A] transition-colors">
                                    <span className="text-2xl mb-2">💧</span>
                                    <span className="text-xs font-bold text-[#555555] uppercase tracking-wider">Humidity</span>
                                    <span className="text-lg font-extrabold text-[#1E1E1E] mt-1">{data.humidity}%</span>
                                </div>
                                <div className="bg-[#FAFAF7] p-4 rounded-2xl border border-[#E6E6E6] flex flex-col items-center text-center hover:border-[#1F5F4A] transition-colors">
                                    <span className="text-2xl mb-2">💨</span>
                                    <span className="text-xs font-bold text-[#555555] uppercase tracking-wider">Wind</span>
                                    <span className="text-lg font-extrabold text-[#1E1E1E] mt-1">{data.wind_speed} <span className="text-xs font-bold">km/h</span></span>
                                </div>
                                <div className="bg-[#FAFAF7] p-4 rounded-2xl border border-[#E6E6E6] flex flex-col items-center text-center hover:border-[#1F5F4A] transition-colors">
                                    <span className="text-2xl mb-2">☔</span>
                                    <span className="text-xs font-bold text-[#555555] uppercase tracking-wider">Rain</span>
                                    <span className="text-lg font-extrabold text-[#1E1E1E] mt-1">{data.rainfall_probability}%</span>
                                </div>
                            </div>

                            {/* Advisory Tip */}
                            <div className="bg-[#E9F2EF] p-4 rounded-2xl border border-[#1F5F4A]/20 flex gap-3 items-start">
                                <div className="bg-[#1F5F4A] text-white p-1.5 rounded-lg mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-2 2-4 2-4s-4-2-4-2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm text-[#1F5F4A] font-bold">Farming Tip</p>
                                    <p className="text-xs text-[#555555] font-medium mt-1 leading-relaxed">
                                        {data.rainfall_probability > 50
                                            ? "High chance of rain today. Avoid spraying pesticides or fertilizers."
                                            : "Conditions are good for field activities."}
                                    </p>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-red-500 font-bold">Failed to load weather data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeatherModal;
