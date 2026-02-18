'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';

export default function Pricing() {
    const t = useTranslations('Pricing');

    const features = [
        "Full History & Damages",
        "Real Odometer Data",
        "Theft Records Check",
        "AI Interpretation",
        "Download PDF Report"
    ];

    return (
        <section id="pricing" className="py-24 bg-blue-600 text-white rounded-[4rem] mx-6 my-12 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">{t('title')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
                    {/* Standard Pack */}
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white text-slate-900 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                        <CardHeader className="text-center pt-10 pb-6">
                            <div className="inline-block px-4 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
                                {t('standard.name')}
                            </div>
                            <CardTitle className="text-5xl font-black text-slate-900">{t('standard.price')}</CardTitle>
                            <p className="text-slate-500 mt-4 font-medium italic">{t('standard.description')}</p>
                        </CardHeader>
                        <CardContent className="px-10 pb-12 space-y-8">
                            <ul className="space-y-4">
                                {features.map((f, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-slate-600 font-medium">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg font-bold transition-all">
                                {t('standard.cta')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Value Pack */}
                    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative transform scale-105 border-4 border-blue-400">
                        <div className="absolute top-4 right-4 animate-pulse">
                            <Sparkles className="w-6 h-6 text-blue-400" />
                        </div>
                        <CardHeader className="text-center pt-10 pb-6">
                            <div className="inline-block px-4 py-1 bg-blue-500 text-white rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
                                {t('value.name')}
                            </div>
                            <CardTitle className="text-5xl font-black text-blue-400">{t('value.price')}</CardTitle>
                            <p className="text-slate-400 mt-4 font-medium italic">{t('value.description')}</p>
                        </CardHeader>
                        <CardContent className="px-10 pb-12 space-y-8">
                            <ul className="space-y-4">
                                {features.map((f, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-slate-300 font-medium">
                                        <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                                <li className="flex items-center space-x-3 text-blue-400 font-bold">
                                    <Check className="w-5 h-5 shrink-0" />
                                    <span>Permanent access</span>
                                </li>
                            </ul>
                            <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-xl hover:shadow-blue-500/50 transition-all border-none">
                                {t('value.cta')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
