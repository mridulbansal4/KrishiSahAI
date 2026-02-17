import React from 'react';
import { useLanguage } from '../src/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import PhaseZero from '../components/Home/PhaseZero';
import NewsFeed from '../components/Home/NewsFeed';
import logo from '../src/assets/logo.png'; // Assuming logo is available

const Home: React.FC = () => {
    const { t } = useLanguage();

    const features = [
        {
            img: '/home/1.png',
            text: 'Save your crops in seconds',
            link: '/crop-care'
        },
        {
            img: '/home/2.png',
            text: 'You say waste.\nWe say treasure.',
            link: '/waste-to-value'
        },
        {
            img: '/home/3.png',
            text: 'Kickstart your business journey now',
            link: '/advisory'
        },
        {
            img: '/home/4.png',
            text: 'Be ahead by learning AgriTech',
            link: '/hub'
        }
    ];

    return (
        <div className="min-h-[calc(100vh-100px)] w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

            {/* SECTION 1: TOP SPLIT SECTION */}
            <section className="min-h-[calc(100vh-120px)] w-full content-center">

                {/* Chatbot Entry - Full Width */}
                <Link
                    to="/chat"
                    className="group relative w-full h-[500px] md:h-[600px] bg-transparent rounded-[40px] overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start items-center text-center p-8 md:p-12 block"
                >
                    <div className="relative z-10 space-y-12 max-w-5xl mx-auto mt-16">

                        <h1 className="text-5xl md:text-7xl font-extrabold text-[#3A2E25] leading-tight drop-shadow-sm tracking-tight">
                            Ask ANYTHING about your farm to SahAI
                        </h1>

                        <div className="inline-flex items-center gap-4 text-[#EAD8BD] font-bold uppercase tracking-wider text-2xl mt-8 bg-[#3A2E25] px-12 py-6 rounded-3xl hover:bg-[#5A4638] hover:scale-105 transition-all shadow-2xl">
                            Start Chatting <ArrowRight className="w-8 h-8" />
                        </div>
                    </div>
                </Link>
            </section>

            {/* SECTION 2: 4 FEATURE BOXES */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                    <Link
                        key={index}
                        to={feature.link}
                        className="group relative w-full aspect-[4/3] md:aspect-[16/9] rounded-[20px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.03]"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={feature.img}
                                alt={feature.text}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                style={{ objectPosition: 'center 20%' }} /* Shift content down by showing more top */
                            />
                            {/* Gradient Overlay to make text legible on right */}
                            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent transition-opacity duration-300"></div>
                        </div>

                        {/* Text Overlay - Right Aligned & Highlighted without BG Box */}
                        <div className="absolute inset-0 flex items-center justify-end p-8">
                            <div className="max-w-[60%] text-right">
                                <h2 className="text-2xl md:text-4xl font-extrabold text-[#FAF4E8] leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter brightness-110">
                                    {feature.text}
                                </h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </section>

            {/* SECTION 3: Validation Phase (Existing) */}
            <section className="mt-12">
                <PhaseZero />
            </section>

            {/* SECTION 4: Footer */}
            <footer className="w-full bg-[#3A2E25] text-[#EAD8BD] rounded-[40px] p-12 text-center mt-12 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                        {t.footerTitle || "Empowering Farmers, One Click at a Time"}
                    </h2>
                    <p className="text-lg md:text-xl text-[#EAD8BD]/80 max-w-2xl mx-auto">
                        {t.footerDesc || "Join the revolution of smart farming with KrishiSahAI."}
                    </p>
                    <Link
                        to="/chat"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-[#EAD8BD] text-[#3A2E25] rounded-2xl font-bold text-lg hover:bg-[#FAF4E8] transition-all shadow-lg hover:scale-105"
                    >
                        {t.footerBtn || "Get Started"} <ArrowRight className="w-5 h-5" />
                    </Link>

                    <div className="mt-12 pt-8 border-t border-[#EAD8BD]/20 text-sm opacity-60">
                        <p>{t.footerCopyright || "© 2026 KrishiSahAI. All rights reserved."}</p>
                    </div>
                </div>

                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5E3C]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5E3C]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </footer>
        </div>
    );
};

export default Home;
