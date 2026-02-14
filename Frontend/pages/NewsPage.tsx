import React, { useState, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { auth } from '../firebase';

interface NewsArticle {
    headline: string;
    source: string;
    summary: string;
    url: string;
    published_at: string;
    image?: string;
}

interface NewsPageProps {
    lang: Language;
    user: UserProfile | null;
}

const NewsPage: React.FC<NewsPageProps> = ({ lang, user }) => {
    const t = translations[lang];
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            if (!user || !auth.currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Use the centralized API service
                // The backend route is /api/news/<uid>
                const uid = auth.currentUser.uid;
                const data = await api.get(`/news/${uid}`);

                if (data.success) {
                    setNews(data.news);
                } else {
                    setError(data.error || 'Failed to load news');
                }
            } catch (err: any) {
                console.error("News Fetch Error:", err);
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-[#555555]">Please login to view personalized news.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#1E1E1E] tracking-tight mb-3">
                        {lang === 'HI' ? 'कृषि समाचार' : lang === 'MR' ? 'कृषी बातम्या' : 'Agriculture News'}
                    </h1>
                    <p className="text-lg text-[#555555] font-medium">
                        {lang === 'HI' ? 'आपके लिए नवीनतम खेती की जानकारी' : lang === 'MR' ? 'तुमच्यासाठी नवीनतम शेतीची माहिती' : 'Latest insights curated for your crops.'}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1F5F4A]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center">
                    <p className="font-bold">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm hover:bg-gray-50">
                        Retry
                    </button>
                </div>
            ) : news.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-[#E6E6E6]">
                    <p className="text-[#555555] text-lg">No news found for your crops at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <div key={index} className="bg-white border border-[#E6E6E6] rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                            {item.image && (
                                <div className="h-48 overflow-hidden">
                                    <img src={item.image} alt={item.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#1F5F4A] bg-[#E9F2EF] px-3 py-1 rounded-full">
                                        {item.source}
                                    </span>
                                    <span className="text-xs text-[#999999] font-medium">
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#1E1E1E] mb-3 leading-tight group-hover:text-[#1F5F4A] transition-colors">
                                    {item.headline}
                                </h3>
                                <p className="text-[#555555] text-sm leading-relaxed mb-6 flex-grow">
                                    {item.summary}
                                </p>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#1F5F4A] font-bold hover:underline mt-auto"
                                >
                                    {lang === 'HI' ? 'पूरा पढ़ें' : lang === 'MR' ? 'संपूर्ण वाचा' : 'Read Full Article'}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsPage;
