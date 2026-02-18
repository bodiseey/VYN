'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
    const t = useTranslations('PaymentCancel');
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-md w-full space-y-8">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        {t('message')}
                    </p>
                </div>

                <div className="space-y-4 pt-4">
                    <Button
                        onClick={() => router.push('/')}
                        className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> {t('backHome')}
                    </Button>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
                        {t('supportHint')}
                    </p>
                </div>
            </div>
        </div>
    );
}
