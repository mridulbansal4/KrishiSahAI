import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../src/context/LanguageContext';
import { translations } from '../../src/i18n/translations';
import { ExternalLink } from 'lucide-react';

interface NewsArticle {
    headline: string;
    source: string;
    url: string;
    image?: string;
    published_at: string;
}

const NewsFeed: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetching general news to show on Home Page
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/general`);
                const data = await response.json();
                if (data.success && data.news) {
                    setNews(data.news.slice(0, 5)); // Show top 5 news
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#3A2E25] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-[#3A2E25] mb-4 flex items-center gap-2">
                📰 {t.newsTitle || "Latest Agri News"}
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {news.length === 0 ? (
                    <p className="text-[#5A4638] text-sm">No news available at the moment.</p>
                ) : (
                    news.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-[#FAF4E8] rounded-xl border border-[#D4C5A9] hover:shadow-md hover:border-[#8B5E3C] transition-all group"
                        >
                            <div className="flex gap-4">
                                {item.image && (
                                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                        <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-[#3A2E25] line-clamp-2 leading-tight group-hover:text-[#8B5E3C] transition-colors">
                                        {item.headline}
                                    </h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] uppercase font-bold text-[#8C7B65] bg-[#EAD8BD] px-2 py-0.5 rounded-full">
                                            {item.source}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-[#5A4638] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #D4C5A9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #8B5E3C;
                }
            `}</style>
        </div>
    );
};

export default NewsFeed;
