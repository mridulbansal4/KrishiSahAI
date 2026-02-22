import React from 'react';
import { Link } from 'react-router-dom';
import { Article, LocalizedContent } from '../../src/types/article';
import { useLanguage } from '../../src/context/LanguageContext';
import { ArrowRight } from 'lucide-react';

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    const { language, t } = useLanguage();

    // Helper to get content based on current language
    const getContent = (content: LocalizedContent) => {
        return content[language.toLowerCase() as keyof LocalizedContent] || content.en;
    };

    const title = getContent(article.data.title);
    const fullContent = getContent(article.data.content);

    // Use excerpt if available, otherwise derive from content
    const excerpt = article.data.excerpt ? getContent(article.data.excerpt) :
        fullContent.slice(0, 160).replace(/[#*_]/g, '') + '...';


    return (
        <Link
            to={`/knowledge/${article.slug}`}
            className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-full flex flex-col"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={article.heroImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-green-900 mb-3 line-clamp-2 font-display">
                    {title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-grow leading-relaxed">
                    {excerpt}
                </p>

                <div className="flex items-center text-green-700 font-semibold text-sm mt-auto group-hover:text-green-800 transition-colors">
                    {t.readMore}
                    <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
};

export default ArticleCard;
