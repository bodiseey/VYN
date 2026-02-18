'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Target, TrendingDown } from 'lucide-react';

export default function Features() {
    const t = useTranslations('WhyCheck');

    const icons = [
        <ShieldCheck className="w-10 h-10 text-blue-600" />,
        <Target className="w-10 h-10 text-blue-600" />,
        <TrendingDown className="w-10 h-10 text-blue-600" />
    ];

    const points = [
        { title: t('points.0.title'), description: t('points.0.description') },
        { title: t('points.1.title'), description: t('points.1.description') },
        { title: t('points.2.title'), description: t('points.2.description') }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
                    <p className="text-lg text-slate-600">{t('subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {points.map((point, index) => (
                        <div key={index} className="space-y-6 group">
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                {icons[index]}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{point.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {point.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
