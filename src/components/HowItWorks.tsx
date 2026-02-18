'use client';

import { useTranslations } from 'next-intl';

export default function HowItWorks() {
    const t = useTranslations('HowItWorks');

    const steps = [
        { title: t('steps.0.title'), description: t('steps.0.description') },
        { title: t('steps.1.title'), description: t('steps.1.description') },
        { title: t('steps.2.title'), description: t('steps.2.description') },
        { title: t('steps.3.title'), description: t('steps.3.description') }
    ];

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative space-y-6">
                            <div className="text-[10rem] font-bold text-slate-50 absolute -top-20 -left-4 -z-10 leading-none select-none">
                                {index + 1}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 pt-8">{step.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
