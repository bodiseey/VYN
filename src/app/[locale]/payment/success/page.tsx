'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

export default function PaymentSuccessPage() {
    const t = useTranslations('PaymentSuccess');
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const vin = searchParams.get('vin');
    const locale = searchParams.get('locale') || 'ro';
    const [loading, setLoading] = useState(true);

    const displayId = vin || id;

    useEffect(() => {
        // Simulate report generation delay
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full space-y-8 text-center">
                {loading ? (
                    <div className="space-y-6 animate-in fade-in duration-700">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-slate-900">{t('generatingReport')}</h1>
                            <p className="text-slate-500 font-medium text-lg">
                                {t('analyzingHistory')}
                            </p>
                        </div>
                        <div className="flex justify-center gap-2">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden animate-in zoom-in-95 duration-500">
                        <CardContent className="p-12 space-y-8">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto rotate-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('paymentConfirmed')}</h1>
                                <p className="text-slate-500 text-lg font-medium">
                                    {t('reportReady')}
                                </p>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('transNum')}</p>
                                        <p className="font-bold text-slate-900 truncate max-w-[200px]">{displayId}</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => window.location.href = `/${locale}/report/${displayId}`}
                                className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-xl font-black rounded-2xl shadow-2xl shadow-blue-200 transition-all active:scale-95 group"
                            >
                                <span>{t('viewFullReport')}</span>
                                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    {loading ? t('dontClose') : t('sentWhatsapp')}
                </p>
            </div>
        </div>
    );
}
