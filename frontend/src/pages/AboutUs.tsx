import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Globe, Shield, Target, Award, Milestone, Briefcase, Landmark, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TradovateLogo from '@/components/TradovateLogo';

const AboutUs = () => {
    const navigate = useNavigate();

    const sections = [
        { id: 'roots', title: 'Our Roots', icon: <Landmark className="w-5 h-5" /> },
        { id: 'expertise', title: 'Global Expertise', icon: <Globe className="w-5 h-5" /> },
        { id: 'technology', title: 'Core Technology', icon: <Zap className="w-5 h-5" /> },
        { id: 'services', title: 'Our Services', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'vision', title: 'Strategic Vision', icon: <TrendingUp className="w-5 h-5" /> },
        { id: 'mission', title: 'Our Mission', icon: <Target className="w-5 h-5" /> },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
                <div className="container flex h-20 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </Button>
                        <div className="p-2">
                            <TradovateLogo className="w-32 h-auto" />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-primary hover:text-black transition-all duration-300"
                        onClick={() => navigate('/')}
                    >
                        Go Back
                    </Button>
                </div>
            </nav>

            <main className="container max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">

                    {/* Sidebar / Table of Contents */}
                    <aside className="hidden lg:block sticky top-32 h-fit bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            About Tradovate
                        </h3>
                        <div className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-white/[0.03] rounded-lg transition-all text-left"
                                >
                                    <span className="opacity-50">{section.icon}</span>
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <section className="relative">
                        <div className="mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
                                <Award className="w-3 h-3" />
                                Who We Are
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                                Shaping the <br />
                                Future of <span className="text-primary italic">Finance</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                Tradovate is a next-generation global digital asset trading platform, proudly founded in Connecticut, United States.
                            </p>
                            <div className="w-20 h-1 bg-primary rounded-full mt-8 shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
                        </div>

                        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-primary max-w-none space-y-16">

                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 leading-relaxed text-lg border-l-primary/50 border-l-4">
                                Founded by a team of experienced fintech professionals with deep roots in traditional finance and modern financial technology, Tradovate is built to bridge the gap between institutional reliability and digital innovation.
                            </div>

                            {/* Our Roots */}
                            <div id="roots" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Landmark className="w-6 h-6 text-primary" />
                                    </span>
                                    Our Roots
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>
                                        Built by industry experts from major financial hubs, our leadership and core development team bring decades of combined experience from traditional stock exchanges, institutional trading environments, and advanced financial systems.
                                    </p>
                                    <p>
                                        This expertise has allowed Tradovate to independently design and deploy a robust, secure, and scalable trading infrastructure that meets the highest international standards.
                                    </p>
                                </div>
                            </div>

                            {/* Global Expertise */}
                            <div id="expertise" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Globe className="w-6 h-6 text-primary" />
                                    </span>
                                    Global Expertise
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>
                                        Our team's background spans the globe's most active financial markets, ensuring that our platform is built with a deep understanding of market mechanics, liquidity, and regulatory requirements on a global scale.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                        {['Institutional Experience', 'Regulatory Knowledge', 'Market Mechanics', 'Global Network'].map((item, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                                                <Milestone className="w-4 h-4 text-primary" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Core Technology */}
                            <div id="technology" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Zap className="w-6 h-6 text-primary" />
                                    </span>
                                    Core Technology
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>
                                        At the heart of Tradovate lies our advanced <span className="text-primary font-bold">Spot 3.0 Trading System</span>, engineered for exceptional stability, security, and transparency.
                                    </p>
                                    <p>
                                        Guided by a strict user-first philosophy, we continuously enhance our technical architecture to ensure seamless performance, fast execution, and an intuitive trading experience for users at every level.
                                    </p>
                                </div>
                            </div>

                            {/* Our Services */}
                            <div id="services" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Briefcase className="w-6 h-6 text-primary" />
                                    </span>
                                    Our Services
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Tradovate offers a comprehensive suite of digital asset financial services, including:</p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                        {['Spot trading', 'Contract trading', 'Leveraged trading', 'Binary options', 'Wealth management solutions'].map((item, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Strategic Vision */}
                            <div id="vision" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </span>
                                    Strategic Vision
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>
                                        Our strategic vision integrates trading, risk management, and wealth growth into one powerful ecosystem, enabling traders and investors to operate confidently in dynamic global markets.
                                    </p>
                                </div>
                            </div>

                            {/* Mission */}
                            <div id="mission" className="scroll-mt-32 group bg-primary/5 border border-primary/20 rounded-3xl p-8">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 text-primary">
                                    <Target className="w-8 h-8" />
                                    Our Mission
                                </h2>
                                <div className="grid gap-6">
                                    <p className="text-lg">
                                        Driven by innovation and integrity, Tradovate remains committed to platform reliability, asset security, and continuous technological advancement.
                                    </p>
                                    <div className="p-6 bg-black/40 rounded-2xl border border-primary/10">
                                        <p className="text-muted-foreground leading-relaxed italic">
                                            "As we expand globally, our mission is clear: to empower users with cutting-edge financial tools while shaping the future of digital finance through trust, performance, and excellence."
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
            </main>

            {/* Footer Branding */}
            <footer className="w-full border-t border-white/5 py-12 mt-24">
                <div className="container max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-6">
                    <TradovateLogo className="w-24 opacity-50 grayscale" />
                    <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} TRADOVATE INC. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUs;
