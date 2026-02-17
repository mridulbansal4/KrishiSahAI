import React, { useState, useEffect } from 'react';
import { Article } from '../src/types/article';
import ArticleCard from '../components/KnowledgeHub/ArticleCard';
import { useLanguage } from '../src/context/LanguageContext';

const KnowledgeHub: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const { language } = useLanguage();

    useEffect(() => {
        const loadArticles = async () => {
            // Dynamically import all index.json files from src/articles
            const modules = import.meta.glob('/src/articles/*/index.json', { eager: true });

            // Dynamically import all images to resolve paths
            const imageModules = import.meta.glob('/src/articles/*/*.{png,jpg,jpeg,svg,webp}', { eager: true });

            const loadedArticles: Article[] = Object.entries(modules).map(([path, mod]: [string, any]) => {
                const data = mod.default || mod;
                const parts = path.split('/');
                const slug = parts[parts.length - 2];

                let heroImage = data.heroImage;

                // Resolve heroImage path
                const expectedPath = `/src/articles/${slug}/${heroImage}`;
                const imageMod = imageModules[expectedPath] as any;

                if (imageMod) {
                    heroImage = imageMod.default || imageMod;
                } else {
                    const anyImageEntry = Object.entries(imageModules).find(([k]) => k.includes(`/src/articles/${slug}/`));
                    if (anyImageEntry) {
                        heroImage = (anyImageEntry[1] as any).default || anyImageEntry[1];
                    }
                }

                return {
                    ...data,
                    heroImage: heroImage,
                    slug: slug
                };
            });


            setArticles(loadedArticles);
        };

        loadArticles();
    }, []);

    const headers = {
        en: { title: "Knowledge Hub", subtitle: "Learn modern farming techniques and insights" },
        hi: { title: "ज्ञान केंद्र", subtitle: "आधुनिक खेती की तकनीकें और अंतर्दृष्टि सीखें" },
        mr: { title: "ज्ञान केंद्र", subtitle: "आधुनिक शेती तंत्र आणि अंतर्दृष्टी शिका" }
    };

    const currentHeader = headers[language.toLowerCase() as keyof typeof headers] || headers.en;

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-4 font-display">
                        {currentHeader.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {currentHeader.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <ArticleCard key={article.slug} article={article} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeHub;
