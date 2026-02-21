import React, { Suspense } from 'react';
import { useLanguage } from '../src/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Recycle, Briefcase, BookOpen, Loader2, Sparkles, ChevronDown, Activity, ShieldCheck, Target, ChevronUp } from 'lucide-react';
import HomeChatPanel from '../components/Home/HomeChatPanel';
import { useFarm } from '../src/context/FarmContext';
import logo from '../src/assets/logo.png';

const PhaseZero = React.lazy(() => import('../components/Home/PhaseZero'));

const Home: React.FC = () => {
    const { t } = useLanguage();
    const { activeFarm } = useFarm();
    const [isChatCollapsed, setIsChatCollapsed] = React.useState(true);

    const features = [
        {
            title: t.featurePlannerTitle,
            subtitle: t.featurePlannerSub,
            link: '/planner',
            icon: <Target className="w-8 h-8 md:w-12 md:h-12" />,
            bgColor: 'bg-[#2E7D32]', // Medium Green
            hoverColor: 'hover:bg-[#1B5E20]'
        },
        {
            title: t.featureHealthTitle,
            subtitle: t.featureHealthSub,
            link: '/health',
            icon: <Activity className="w-8 h-8 md:w-12 md:h-12" />,
            bgColor: 'bg-[#00695C]', // Blue-Green (Teal)
            hoverColor: 'hover:bg-[#004D40]'
        },
        {
            title: t.featureCropCareTitle,
            subtitle: t.featureCropCareSub,
            link: '/crop-care',
            icon: <ShieldCheck className="w-8 h-8 md:w-12 md:h-12" />,
            bgColor: 'bg-[#1B5E20]', // Dark Green
            hoverColor: 'hover:bg-[#0D3B12]'
        },
        {
            title: t.featureWasteTitle,
            subtitle: t.featureWasteSub,
            link: '/waste-to-value',
            icon: <Recycle className="w-8 h-8 md:w-12 md:h-12" />,
            bgColor: 'bg-[#2E7D32]', // Medium Green
            hoverColor: 'hover:bg-[#1B5E20]'
        },
        {
            title: t.featureBusinessTitle,
            subtitle: t.featureBusinessSub,
            link: '/advisory',
            icon: <Briefcase className="w-8 h-8 md:w-12 md:h-12" />,
            bgColor: 'bg-[#00695C]', // Blue-Green (Teal)
            hoverColor: 'hover:bg-[#004D40]'
        },
        {
            title: t.featureKnowledgeTitle,
            subtitle: t.featureKnowledgeSub,
            link: '/hub',
            icon: <BookOpen className="w-8 h-8 md:w-12 md:h-12" />,
            bgColor: 'bg-[#1565C0]', // Blue
            hoverColor: 'hover:bg-[#0D47A1]'
        }
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* FARM CONTEXT RIBBON */}
            <div className="w-full bg-deep-green text-white px-4 py-2 flex justify-between items-center text-xs md:text-sm font-bold shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <span className="opacity-70 uppercase tracking-widest text-[10px] md:text-xs">Active Farm:</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded-full">{activeFarm?.nickname || 'Default'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="opacity-70 uppercase tracking-widest text-[10px] md:text-xs">Current Crop:</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded-full">
                        {activeFarm?.crops?.join(', ') || 'No Crop'}
                    </span>
                </div>
            </div>

            <div className="h-[calc(100vh-100px)] overflow-y-auto scroll-smooth">
                {/* SECTION 1: MAIN DASHBOARD (Split Screen) */}
                <section className="h-full flex flex-col w-full max-w-[1600px] mx-auto p-2 md:p-4 gap-2 md:gap-4 bg-white relative">
                    <div className="flex flex-col lg:flex-row h-full w-full gap-2 md:gap-4 flex-1 items-stretch">

                        {/* LEFT SIDE (40%) - CHATBOT PANEL */}
                        <div className={`w-full lg:w-[40%] transition-all duration-300 lg:h-full order-1 flex flex-col ${isChatCollapsed ? 'h-[60px] lg:h-full' : 'h-[60%] lg:h-full'}`}>
                            <div className="lg:hidden flex items-center justify-between p-3 bg-light-green border-2 border-deep-green rounded-t-2xl">
                                <span className="font-bold text-deep-green flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Quick Assistant Panel
                                </span>
                                <button
                                    onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                                    className="p-1 hover:bg-deep-green/10 rounded-full text-deep-green transition-colors"
                                >
                                    {isChatCollapsed ? <ChevronDown /> : <ChevronUp />}
                                </button>
                            </div>
                            <div className={`${isChatCollapsed ? 'hidden lg:block' : 'block'} flex-1 h-full`}>
                                <HomeChatPanel />
                            </div>
                        </div>

                        {/* RIGHT SIDE (60%) - FEATURE GRID PANEL */}
                        <div className="w-full lg:w-[60%] flex-1 order-2">
                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 md:gap-4 h-full">
                                {features.map((feature, index) => (
                                    <Link
                                        key={index}
                                        to={feature.link}
                                        className={`group relative w-full h-full min-h-[110px] md:min-h-[160px] lg:min-h-0 flex flex-col justify-center items-center gap-2 md:gap-4 p-4 md:p-6 ${feature.bgColor} ${feature.hoverColor} transition-all duration-300 no-underline shadow-lg hover:shadow-xl rounded-2xl md:rounded-3xl text-center overflow-hidden border border-black/5 active:scale-95`}
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                            {feature.icon}
                                        </div>
                                        <div className="text-white/90 group-hover:text-white transition-all transform group-hover:scale-110 duration-500 bg-black/10 p-2 md:p-3 rounded-full">
                                            {React.cloneElement(feature.icon as any, { className: 'w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12' })}
                                        </div>
                                        <div className="flex flex-col items-center z-10">
                                            <h3 className="text-sm md:text-xl lg:text-2xl font-black text-white leading-tight mb-0.5 md:mb-1 tracking-tight drop-shadow-sm">
                                                {feature.title}
                                            </h3>
                                            <p className="hidden md:flex text-white/80 text-[10px] md:text-sm font-bold items-center gap-1 md:gap-1.5 justify-center leading-none">
                                                {feature.subtitle}
                                            </p>
                                        </div>
                                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-300">
                                            <ArrowRight className="text-white w-4 h-4 md:w-6 md:h-6" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Validation Phase */}
                <section className="min-h-full flex flex-col items-center justify-center bg-white">
                    <div className="w-full">
                        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-deep-green" /></div>}>
                            <PhaseZero />
                        </Suspense>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
