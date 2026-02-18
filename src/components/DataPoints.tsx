'use client';

import { useTranslations } from 'next-intl';
import {
    Camera,
    CarFront,
    AlertTriangle,
    Calendar,
    Settings,
    BarChart3,
    Lock,
    Coins
} from 'lucide-react';

export default function DataPoints() {
    const t = useTranslations('DataPoints');

    const iconMap = [
        <Camera className="w-6 h-6" />,
        <AlertTriangle className="w-6 h-6" />,
        <Lock className="w-6 h-6" />,
        <BarChart3 className="w-6 h-6" />,
        <Settings className="w-6 h-6" />,
        <Coins className="w-6 h-6" />,
        <CarFront className="w-6 h-6" />,
        <Lock className="w-6 h-6" />
    ];

    const items = [
        t('items.0'),
        t('items.1'),
        t('items.2'),
        t('items.3'),
        t('items.4'),
        t('items.5'),
        t('items.6'),
        t('items.7')
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
                    <p className="text-lg text-slate-600">{t('subtitle')}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                        <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center space-y-4">
                            <div className="text-blue-600">
                                {iconMap[index]}
                            </div>
                            <span className="font-bold text-slate-900">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
