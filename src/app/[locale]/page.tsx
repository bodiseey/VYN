import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Features from '@/components/Features';
import DataPoints from '@/components/DataPoints';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import VinScanner from '@/components/VinScanner';
import Navbar from '@/components/Navbar';

export default function HomePage() {
    const t = useTranslations('HomePage');

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            {/* Hero Section */}
            <section id="vin-section" className="min-h-screen pt-20 flex flex-col items-center justify-center p-6 md:p-24 overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-50" />
                </div>

                <div className="max-w-4xl w-full text-center space-y-12">
                    <header className="space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-sm animate-fade-in shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            <span>AI Powered Car Assistant</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            {t('title')}
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            {t('subtitle')}
                        </p>
                    </header>

                    <div className="max-w-2xl mx-auto w-full space-y-3">
                        <VinScanner placeholder={t('inputPlaceholder')} cta={t('cta')} />
                        <p className="text-slate-400 text-xs text-center font-medium leading-relaxed px-2">
                            {t('vinHint')}
                        </p>
                    </div>

                    <div className="text-slate-400 text-sm font-medium">
                        {t('freeTier')}
                    </div>
                </div>
            </section>

            {/* Why Check Section */}
            <Features />

            {/* Data You Get Section */}
            <DataPoints />

            {/* How It Works Section */}
            <HowItWorks />

            {/* Pricing Section */}
            <Pricing />

            {/* Re-hook VIN Input Section */}
            <section className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-6 text-center space-y-10">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                        {t('rehook')}
                    </h2>
                    <VinScanner placeholder={t('inputPlaceholder')} cta={t('cta')} rehook />
                </div>
            </section>

            {/* FAQ Section */}
            <FAQ />

            {/* Footer Section */}
            <Footer />
        </div>
    );
}
