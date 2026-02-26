import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Info, Scale, AlertTriangle, CreditCard, UserCheck, HelpCircle, Lock, Landmark, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TradovateLogo from '@/components/TradovateLogo';

const TermsAndConditions = () => {
    const navigate = useNavigate();

    const sections = [
        { id: 'eligibility', title: '1. Eligibility', icon: <UserCheck className="w-5 h-5" /> },
        { id: 'account', title: '2. Account Registration', icon: <Lock className="w-5 h-5" /> },
        { id: 'services', title: '3. Services Provided', icon: <FileText className="w-5 h-5" /> },
        { id: 'risk', title: '4. Risk Disclosure', icon: <AlertTriangle className="w-5 h-5" /> },
        { id: 'fees', title: '5. Fees and Charges', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'obligations', title: '6. User Obligations', icon: <Shield className="w-5 h-5" /> },
        { id: 'property', title: '7. Intellectual Property', icon: <Info className="w-5 h-5" /> },
        { id: 'availability', title: '8. Platform Availability', icon: <RefreshCw className="w-5 h-5" /> },
        { id: 'liability', title: '9. Limitation of Liability', icon: <Scale className="w-5 h-5" /> },
        { id: 'termination', title: '10. Termination', icon: <ArrowLeft className="w-5 h-5" /> },
        { id: 'privacy', title: '11. Privacy', icon: <Lock className="w-5 h-5" /> },
        { id: 'law', title: '12. Governing Law', icon: <Landmark className="w-5 h-5" /> },
        { id: 'amendments', title: '13. Amendments', icon: <RefreshCw className="w-5 h-5" /> },
        { id: 'contact', title: '14. Contact Information', icon: <Mail className="w-5 h-5" /> },
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
                            <FileText className="w-4 h-4" />
                            Table of Contents
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
                                <Shield className="w-3 h-3" />
                                Legal Documents
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                                Terms and <br />
                                <span className="text-primary italic">Conditions</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                Effective Date: <span className="text-foreground font-semibold">September 09, 2019</span>
                            </p>
                            <div className="w-20 h-1 bg-primary rounded-full mt-8 shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
                        </div>

                        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-primary max-w-none space-y-16">

                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 leading-relaxed text-lg border-l-primary/50 border-l-4">
                                Welcome to Tradovate (“Company,” “we,” “our,” or “us”). Tradovate is a digital asset trading and financial services platform founded in Connecticut, United States. By accessing or using our website, platform, or services (collectively, the “Services”), you agree to be bound by these Terms and Conditions (“Terms”). If you do not agree, you must not use our Services.
                            </div>

                            {/* 1. Eligibility */}
                            <div id="eligibility" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <UserCheck className="w-6 h-6 text-primary" />
                                    </span>
                                    1. Eligibility
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>By using Tradovate, you confirm that:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>You are at least 18 years old (or the legal age in your jurisdiction).</li>
                                        <li>You have the legal capacity to enter into binding agreements.</li>
                                        <li>You are not restricted from using digital asset trading services under applicable laws.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 2. Account Registration */}
                            <div id="account" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Lock className="w-6 h-6 text-primary" />
                                    </span>
                                    2. Account Registration
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>To access certain Services, you may be required to create an account. You agree to:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Provide accurate, complete, and current information.</li>
                                        <li>Maintain the confidentiality of your account credentials.</li>
                                        <li>Be fully responsible for all activities conducted through your account.</li>
                                    </ul>
                                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mt-4">
                                        <p className="text-sm text-primary/80 italic">Tradovate reserves the right to suspend or terminate accounts that provide false information or violate these Terms.</p>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Services Provided */}
                            <div id="services" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </span>
                                    3. Services Provided
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Tradovate offers digital asset financial services, including but not limited to:</p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                        {['Contract trading', 'Leveraged trading', 'Binary options', 'Investment and wealth management tools'].map((item, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-4 italic">All services are subject to availability, market conditions, and regulatory requirements.</p>
                                </div>
                            </div>

                            {/* 4. Risk Disclosure */}
                            <div id="risk" className="scroll-mt-32 group bg-danger/5 border border-danger/20 rounded-3xl p-8">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 text-danger">
                                    <AlertTriangle className="w-8 h-8" />
                                    4. Risk Disclosure
                                </h2>
                                <div className="grid gap-6">
                                    <p className="text-lg">Trading digital assets involves <strong className="text-danger">significant risk</strong>, including the potential loss of all invested capital. Prices may be volatile and affected by market, regulatory, technical, or economic factors.</p>
                                    <div className="grid gap-3 p-6 bg-black/40 rounded-2xl border border-danger/10">
                                        <p className="font-semibold text-foreground">You acknowledge that:</p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-4">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                                                <span className="text-muted-foreground text-sm leading-relaxed">Tradovate does not guarantee profits or returns.</span>
                                            </li>
                                            <li className="flex items-start gap-4">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                                                <span className="text-muted-foreground text-sm leading-relaxed">Past performance does not indicate future results.</span>
                                            </li>
                                            <li className="flex items-start gap-4">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                                                <span className="text-muted-foreground text-sm leading-relaxed">You are solely responsible for your trading decisions.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Fees and Charges */}
                            <div id="fees" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <CreditCard className="w-6 h-6 text-primary" />
                                    </span>
                                    5. Fees and Charges
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>All applicable fees, commissions, and charges will be disclosed on the platform. Tradovate reserves the right to update fees at any time with reasonable notice.</p>
                                </div>
                            </div>

                            {/* 6. User Obligations */}
                            <div id="obligations" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Shield className="w-6 h-6 text-primary" />
                                    </span>
                                    6. User Obligations
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p className="mb-4">You agree not to:</p>
                                    <div className="grid gap-2">
                                        {[
                                            'Use the platform for illegal or fraudulent activities.',
                                            'Attempt to manipulate markets or system operations.',
                                            'Access or interfere with other users’ accounts or data.',
                                            'Upload malicious software or engage in cyberattacks.'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                <div className="w-8 h-8 rounded-full border border-danger/30 flex items-center justify-center text-danger text-xs font-bold">✕</div>
                                                <span className="text-muted-foreground">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm border-t border-white/5 pt-4 mt-2 text-muted-foreground italic">Violation of these obligations may result in immediate account suspension or termination.</p>
                                </div>
                            </div>

                            {/* 7. Intellectual Property */}
                            <div id="property" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Info className="w-6 h-6 text-primary" />
                                    </span>
                                    7. Intellectual Property
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>All content, software, trademarks, logos, and technology used on Tradovate are the exclusive property of Tradovate or its licensors. You may not copy, modify, distribute, or exploit any part of the platform without prior written consent.</p>
                                </div>
                            </div>

                            {/* 8. Platform Availability */}
                            <div id="availability" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <RefreshCw className="w-6 h-6 text-primary" />
                                    </span>
                                    8. Platform Availability
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Tradovate strives to maintain continuous platform availability but does not guarantee uninterrupted access. We are not liable for losses caused by:</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['System maintenance', 'Network failures', 'Force majeure', 'Technical malfunctions'].map((tag, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 9. Limitation of Liability */}
                            <div id="liability" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Scale className="w-6 h-6 text-primary" />
                                    </span>
                                    9. Limitation of Liability
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>To the maximum extent permitted by law, Tradovate shall not be liable for:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Indirect, incidental, or consequential damages</li>
                                        <li>Loss of profits, data, or trading opportunities</li>
                                        <li>User errors or third-party actions</li>
                                    </ul>
                                    <p className="mt-4 font-bold text-foreground">Your sole remedy is to discontinue use of the Services.</p>
                                </div>
                            </div>

                            {/* 10. Termination */}
                            <div id="termination" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <ArrowLeft className="w-6 h-6 text-primary rotate-180" />
                                    </span>
                                    10. Termination
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Tradovate reserves the right to suspend or terminate your access at any time, with or without notice, if you violate these Terms or applicable laws.</p>
                                </div>
                            </div>

                            {/* 11. Privacy */}
                            <div id="privacy" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Lock className="w-6 h-6 text-primary" />
                                    </span>
                                    11. Privacy
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Your use of Tradovate is also governed by our <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>, which explains how we collect, use, and protect your personal information.</p>
                                </div>
                            </div>

                            {/* 12. Governing Law */}
                            <div id="law" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Landmark className="w-6 h-6 text-primary" />
                                    </span>
                                    12. Governing Law
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>These Terms are governed by and construed in accordance with the laws of the State of Connecticut, United States, without regard to conflict of law principles.</p>
                                </div>
                            </div>

                            {/* 13. Amendments */}
                            <div id="amendments" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <RefreshCw className="w-6 h-6 text-primary" />
                                    </span>
                                    13. Amendments
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Tradovate may update these Terms at any time. Continued use of the Services after changes constitutes acceptance of the revised Terms.</p>
                                </div>
                            </div>

                            {/* 14. Contact Information */}
                            <div id="contact" className="scroll-mt-32 pt-16 mt-32 border-t border-white/10 group">
                                <h2 className="flex items-center gap-3 text-3xl font-bold mb-8 group-hover:text-primary transition-colors">
                                    <Mail className="w-8 h-8 text-primary" />
                                    Contact Support
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all group">
                                        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Email Address</p>
                                        <a href="mailto:support@tradovate.com" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
                                            support@tradovate.com
                                        </a>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all group">
                                        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Headquarters</p>
                                        <p className="text-xl font-semibold text-foreground">
                                            Connecticut, <br /> United States
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

export default TermsAndConditions;
