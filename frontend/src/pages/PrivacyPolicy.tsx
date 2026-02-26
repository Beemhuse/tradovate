import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Share2, UserCheck, ShieldCheck, FileLock, Bell, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TradovateLogo from '@/components/TradovateLogo';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const sections = [
        { id: 'collection', title: '1. Information Collection', icon: <Database className="w-5 h-5" /> },
        { id: 'usage', title: '2. How We Use Information', icon: <Eye className="w-5 h-5" /> },
        { id: 'security', title: '3. Data Security', icon: <Lock className="w-5 h-5" /> },
        { id: 'sharing', title: '4. Information Sharing', icon: <Share2 className="w-5 h-5" /> },
        { id: 'rights', title: '5. Your Privacy Rights', icon: <UserCheck className="w-5 h-5" /> },
        { id: 'cookies', title: '6. Cookies and Tracking', icon: <Globe className="w-5 h-5" /> },
        { id: 'retention', title: '7. Data Retention', icon: <FileLock className="w-5 h-5" /> },
        { id: 'updates', title: '8. Policy Updates', icon: <Bell className="w-5 h-5" /> },
        { id: 'contact', title: '9. Contact Us', icon: <Mail className="w-5 h-5" /> },
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
                            <ShieldCheck className="w-4 h-4" />
                            Privacy Center
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
                                Data Protection
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                                Privacy <br />
                                <span className="text-primary italic">Policy</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                Effective Date: <span className="text-foreground font-semibold">February 26, 2026</span>
                            </p>
                            <div className="w-20 h-1 bg-primary rounded-full mt-8 shadow-[0_0_15px_rgba(255,191,0,0.5)]" />
                        </div>

                        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-primary max-w-none space-y-16">

                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 leading-relaxed text-lg border-l-primary/50 border-l-4">
                                At Tradovate, we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
                            </div>

                            {/* 1. Information Collection */}
                            <div id="collection" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Database className="w-6 h-6 text-primary" />
                                    </span>
                                    1. Information Collection
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>We collect information that you provides directly to us, including:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li><strong className="text-primary">Personal Details:</strong> Name, email address, phone number, and residential address.</li>
                                        <li><strong className="text-primary">Identity Verification (KYC):</strong> Government-issued ID, facial recognition data, and proof of address for regulatory compliance.</li>
                                        <li><strong className="text-primary">Financial Information:</strong> Wallet addresses, transaction history, and payment details.</li>
                                        <li><strong className="text-primary">Technical Data:</strong> IP address, device type, browser information, and platform usage statistics.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 2. How We Use Information */}
                            <div id="usage" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Eye className="w-6 h-6 text-primary" />
                                    </span>
                                    2. How We Use Information
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Your information is used to:</p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                        {[
                                            'Facilitate trading services',
                                            'Verify your identity (KYC)',
                                            'Process transactions',
                                            'Prevent fraud and cyber-attacks',
                                            'Provide customer support',
                                            'Improve platform performance'
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Data Security */}
                            <div id="security" className="scroll-mt-32 group bg-primary/5 border border-primary/20 rounded-3xl p-8">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 text-primary">
                                    <Lock className="w-8 h-8" />
                                    3. Data Security
                                </h2>
                                <div className="grid gap-6">
                                    <p className="text-lg">We implement industry-leading security measures to protect your assets and data.</p>
                                    <div className="grid gap-4">
                                        <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-primary/10">
                                            <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold mb-1">Advanced Encryption</h4>
                                                <p className="text-sm text-muted-foreground">All sensitive data is encrypted using AES-256 and transmitted via TLS/SSL protocols.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-primary/10">
                                            <UserCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-bold mb-1">Multi-Factor Authentication</h4>
                                                <p className="text-sm text-muted-foreground">Mandatory 2FA for all critical account actions and withdrawals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Information Sharing */}
                            <div id="sharing" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Share2 className="w-6 h-6 text-primary" />
                                    </span>
                                    4. Information Sharing
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>We do not sell your personal data. We only share information with:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Regulatory bodies and law enforcement when required by law.</li>
                                        <li>Third-party KYC/AML verification providers.</li>
                                        <li>Technical service providers essential for platform operations.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 5. Your Privacy Rights */}
                            <div id="rights" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <UserCheck className="w-6 h-6 text-primary" />
                                    </span>
                                    5. Your Privacy Rights
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>Depending on your jurisdiction, you have the right to:</p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                        {['Access your data', 'Rectify errors', 'Request deletion', 'Object to processing'].map((right, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <span>{right}</span>
                                                <ShieldCheck className="w-4 h-4 text-primary" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 6. Cookies and Tracking */}
                            <div id="cookies" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Globe className="w-6 h-6 text-primary" />
                                    </span>
                                    6. Cookies and Tracking
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>We use cookies to improve your experience, remember your preferences, and analyze site traffic. You can manage cookie preferences in your browser settings.</p>
                                </div>
                            </div>

                            {/* 7. Data Retention */}
                            <div id="retention" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <FileLock className="w-6 h-6 text-primary" />
                                    </span>
                                    7. Data Retention
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>We retain your personal information for as long as necessary to provide our services and comply with legal, tax, and accounting requirements (typically 5-10 years post-account closure).</p>
                                </div>
                            </div>

                            {/* 8. Policy Updates */}
                            <div id="updates" className="scroll-mt-32 group">
                                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                                        <Bell className="w-6 h-6 text-primary" />
                                    </span>
                                    8. Policy Updates
                                </h2>
                                <div className="grid gap-4 pl-4 border-l border-white/10">
                                    <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or platform announcements.</p>
                                </div>
                            </div>

                            {/* 9. Contact Us */}
                            <div id="contact" className="scroll-mt-32 pt-16 mt-32 border-t border-white/10 group">
                                <h2 className="flex items-center gap-3 text-3xl font-bold mb-8 group-hover:text-primary transition-colors">
                                    <Mail className="w-8 h-8 text-primary" />
                                    Privacy Inquiries
                                </h2>
                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all text-center">
                                    <p className="text-muted-foreground mb-6">For any questions regarding your data privacy, please reach out to our Data Protection Officer.</p>
                                    <a href="mailto:privacy@tradovate.com" className="text-2xl font-bold text-primary hover:underline">
                                        privacy@tradovate.com
                                    </a>
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

export default PrivacyPolicy;
