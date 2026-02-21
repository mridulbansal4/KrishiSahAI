import React, { useState } from 'react';
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
    Sparkles
} from 'lucide-react';

const FarmHealth: React.FC = () => {
    const { t } = useLanguage();
    const { activeFarm } = useFarm();
    const [soilInputs, setSoilInputs] = useState({ n: '', p: '', k: '', ph: '' });
    const [loading, setLoading] = useState(false);

    const activeCrop = activeFarm?.crops?.[0] || null;

    return (
        <div className="min-h-screen bg-[#FBFBFA] pb-20">
            {/* Header */}
            <div className="bg-[#1B5E20] text-white p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
                        {t.featureHealthLongTitle}
                    </h1>
                    <p className="text-green-100 font-bold opacity-80">
                        {activeFarm?.nickname} • {activeCrop || 'No Crop Selected'}
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COL: Fertilizer */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Fertilizer Recommendation */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-[#1B5E20] uppercase tracking-tight flex items-center gap-2 mb-6">
                            <TrendingUp className="w-6 h-6" /> {t.fertilizerRec}
                        </h2>

                        {!activeCrop ? (
                            <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl p-10 text-center">
                                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                <p className="text-yellow-800 font-bold">{t.noCropSelected}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Soil Inputs */}
                                <div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t.soilDataTitle}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['n', 'p', 'k', 'ph'].map(field => (
                                            <div key={field}>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 ml-1">{t[field === 'ph' ? 'soilPH' : field === 'n' ? 'nitrogen' : field === 'p' ? 'phosphorus' : 'potassium']}</label>
                                                <input
                                                    type="number"
                                                    value={soilInputs[field as keyof typeof soilInputs]}
                                                    onChange={e => setSoilInputs(prev => ({ ...prev, [field]: e.target.value }))}
                                                    placeholder="--"
                                                    className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-[#1B5E20]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                        <button className="flex-1 bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-3 text-xs font-black text-green-700 uppercase hover:bg-green-100 transition-all flex items-center justify-center gap-2">
                                            <Cloud className="w-4 h-4" /> Upload Soil Report
                                        </button>
                                        <div className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-[10px] font-bold text-gray-400 italic">
                                            * Future: AI Report Parsing
                                        </div>
                                    </div>
                                </div>

                                {/* Results Placeholder */}
                                <div className="bg-[#FAFAF7] border-2 border-[#1B5E20]/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-xl flex items-center justify-center font-black">
                                            <CheckCircle2 />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Recommended Action</p>
                                            <p className="text-lg font-black text-[#1B5E20]">Apply NPK 19-19-19</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white rounded-xl border border-gray-100 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Quantity</p>
                                            <p className="font-black text-gray-800">5kg / Acre</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-gray-100 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Timing</p>
                                            <p className="font-black text-gray-800">Early Morning</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-center">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                                        <p className="text-[10px] font-bold text-yellow-800 leading-tight">Warning: Excessive use of Nitrogen can reduce soil fertility over time. Consider Neem-coated Urea.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COL: AI Suggestion */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-[#1B5E20] uppercase tracking-tight flex items-center gap-2 mb-6">
                            <Info className="w-6 h-6" /> {t.sellSuggestion}
                        </h2>

                        {!activeCrop ? (
                            <p className="text-gray-400 font-bold text-center py-10 uppercase text-xs tracking-widest">Select crop to enable advice</p>
                        ) : (
                            <div className="bg-gradient-to-br from-[#1B5E20] to-[#004D40] rounded-2xl p-6 text-white shadow-lg shadow-green-900/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-green-300" />
                                    <span className="text-xs font-black uppercase tracking-widest text-green-300">{t.sellTiming}</span>
                                </div>
                                <p className="text-2xl font-black mb-2">Hold for 5–7 days</p>
                                <p className="text-sm font-bold text-white/80 leading-relaxed uppercase mb-4">Expect 300-400 price surge due to supply shortage.</p>

                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="opacity-70 font-bold uppercase">Confidence</span>
                                        <span className="font-black text-green-400 uppercase">High (85%)</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-green-400 h-full w-[85%]"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Secondary Advice */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Insights</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-xs font-bold text-gray-600">
                                    <Calendar className="w-4 h-4 text-[#1B5E20] shrink-0" />
                                    <span>Harvesting window starting in 12 days based on current crop stage.</span>
                                </li>
                                <li className="flex gap-3 text-xs font-bold text-gray-600">
                                    <MapPin className="w-4 h-4 text-[#1B5E20] shrink-0" />
                                    <span>Export demand increasing in nearby districts.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmHealth;
