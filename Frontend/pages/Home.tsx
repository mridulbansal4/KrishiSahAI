import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Link } from 'react-router-dom';
import { Briefcase, Sprout, Recycle, ArrowRight, RefreshCw, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { auth } from '../firebase';
import { getUserProfile } from '../services/firebase_db';

const Home: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang];
    const [weather, setWeather] = useState<any>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [location, setLocation] = useState<string>('India');
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (loc: string) => {
        setWeatherLoading(true);
        setError(null);
        try {
            const data = await api.getCurrentWeather(loc);
            if (data.success) {
                setWeather(data.weather);
            } else {
                setError('Failed to load weather');
            }
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError('Weather unavailable');
        } finally {
            setWeatherLoading(false);
        }
    };

    useEffect(() => {
        const initWeather = async () => {
            let userLoc = 'India';
            if (auth.currentUser) {
                const profile = await getUserProfile(auth.currentUser.uid);
                if (profile) {
                    if (profile.district && profile.state) {
                        userLoc = `${profile.district}, ${profile.state}`;
                    } else if (profile.district) {
                        userLoc = profile.district;
                    } else if (profile.state) {
                        userLoc = profile.state;
                    }
                }
            }
            setLocation(userLoc);
            fetchWeather(userLoc);
        };

        // Small delay to ensure auth state is ready if not already
        setTimeout(initWeather, 500);
    }, []);

    const handleRefreshWeather = (e: React.MouseEvent) => {
        e.preventDefault();
        fetchWeather(location);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Weather Widget Removed - Relocated to Header */}

            <div className="bg-[#1F5F4A] rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">{t.heroTitle}</h1>
                    <p className="text-xl font-medium text-white/90 mb-10">{t.heroSub}</p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to="/chat"
                            className="px-8 py-4 bg-white text-[#1F5F4A] rounded-2xl font-bold text-lg hover:bg-[#E9F2EF] transition-all shadow-lg flex items-center gap-2"
                        >
                            {t.startConv} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/advisory" className="bg-white p-8 rounded-[32px] border border-[#E6E6E6] shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-[#FAFAF7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-8 h-8 text-[#1F5F4A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2">{t.business}</h3>
                    <p className="text-[#555555] font-medium">{t.cropAdvisorSub}</p>
                </Link>

                <Link to="/crop-care" className="bg-white p-8 rounded-[32px] border border-[#E6E6E6] shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-[#FAFAF7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Sprout className="w-8 h-8 text-[#1F5F4A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2">{t.cropCare}</h3>
                    <p className="text-[#555555] font-medium">{t.diseaseDetectionSub}</p>
                </Link>

                <Link to="/waste-to-value" className="bg-white p-8 rounded-[32px] border border-[#E6E6E6] shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-[#FAFAF7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Recycle className="w-8 h-8 text-[#1F5F4A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2">{t.wasteValue}</h3>
                    <p className="text-[#555555] font-medium">{t.wasteOptimizerSub}</p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
