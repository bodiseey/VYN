'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    CheckCircle2,
    Car
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBrandLogo } from '@/lib/brand-utils';
import DatabaseScanner from '@/components/DatabaseScanner';
import { useLocale, useTranslations } from 'next-intl';

interface VinScannerProps {
    placeholder?: string;
    cta?: string;
    rehook?: boolean;
}

export default function VinScanner({ placeholder, cta, rehook }: VinScannerProps) {
    const t = useTranslations('VinScanner');
    const locale = useLocale();
    const [vin, setVin] = useState('');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'found' | 'error' | 'hook'>('idle');
    const [vehicle, setVehicle] = useState<any>(null);
    const [error, setError] = useState('');
    // Holds the real API promise so DatabaseScanner can wait for it
    const apiPromiseRef = useRef<Promise<any> | null>(null);
    const vehicleRef = useRef<any>(null);

    const validateVin = (v: string) => {
        const clean = v.toUpperCase().replace(/[\s-]/g, '');
        // Allow VIN (17) OR Dutch Plate (4-8 chars)
        if (clean.length === 17) return true;
        if (clean.length >= 4 && clean.length <= 8 && /^[A-Z0-9]+$/.test(clean)) return true;
        return false;
    };

    const handleScan = async () => {
        const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (!validateVin(cleanVin)) {
            setError(t('invalidVin'));
            setStatus('error');
            return;
        }

        setError('');

        // Create the API promise BEFORE showing the scanner
        const promise = fetch(`/api/vin/scan?vin=${cleanVin}`)
            .then(r => r.json())
            .then(data => {
                if (data.success && data.Make) {
                    vehicleRef.current = data;
                    setVin(cleanVin);
                    setVehicle(data);
                }
                return data;
            })
            .catch(() => null);

        apiPromiseRef.current = promise;
        setStatus('scanning');
    };

    // Called by DatabaseScanner when its sequence + API both complete
    const handleScannerComplete = async () => {
        const data = await apiPromiseRef.current;
        if (data?.success && data?.Make) {
            setStatus('found');
        } else {
            setError(data?.error || t('carNotFound'));
            setStatus('error');
        }
    };

    const handleProceed = () => {
        setStatus('hook');
    };

    const handlePayment = async () => {
        try {
            // Need a phone number for Paynet, asking user or using a default for guest checkout
            // In a real flow, we would have a small form to collect email/phone before payment
            const phone = "060000000";

            const res = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vin, phone, amount: 1, locale })
            });

            const data = await res.json();

            if (data.success && data.paynet) {
                // Create a dynamic form to POST to Paynet
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.paynet.action;

                // Add all fields as hidden inputs
                Object.entries(data.paynet.fields).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value as string;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            }
        } catch (e) {
            console.error('Payment init failed', e);
            setError(t('paymentInitError'));
        }
    };

    const handleReset = () => {
        setVin('');
        setStatus('idle');
        setVehicle(null);
        setError('');
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                {status === 'idle' || status === 'error' ? (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative flex flex-col md:flex-row gap-3 bg-white p-3 rounded-[1.8rem] shadow-2xl">
                                <div className="relative flex-1">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                    <Input
                                        placeholder={placeholder || t('placeholder')}
                                        className="h-16 pl-14 pr-6 border-none bg-slate-50 rounded-2xl font-black tracking-widest text-base md:text-lg text-slate-900 placeholder:text-slate-300 placeholder:font-bold focus:ring-0"
                                        value={vin}
                                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                                        maxLength={17}
                                    />
                                </div>
                                <Button
                                    onClick={handleScan}
                                    className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                                >
                                    {cta || t('cta')}
                                </Button>
                            </div>
                        </div>

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100"
                            >
                                <AlertCircle className="w-5 h-5" />
                                <p className="font-bold text-sm tracking-tight">{error}</p>
                            </motion.div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                            <img src="/payment-logos/VISA-logo.png" className="h-3 md:h-4 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Visa" />
                            <img src="/payment-logos/Mastercard-logo.svg" className="h-5 md:h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Mastercard" />
                            <img src="/payment-logos/Google_Pay_Logo.svg.png" className="h-4 md:h-5 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Google Pay" />
                            <img src="/payment-logos/Apple Pay.png" className="h-4 md:h-5 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Apple Pay" />
                            <img src="/payment-logos/logo-paynet.svg" className="h-4 md:h-5 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Paynet" />
                            <img src="/payment-logos/Mia Instant Payments.webp" className="h-5 md:h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="MIA Instant" />
                        </div>
                    </motion.div>
                ) : status === 'scanning' ? (
                    <DatabaseScanner
                        key="scanner"
                        vin={vin || 'UNKNOWN'}
                        onComplete={handleScannerComplete}
                        apiPromise={apiPromiseRef.current ?? undefined}
                    />
                ) : status === 'found' ? (
                    <motion.div
                        key="found"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-3xl border border-slate-100 space-y-6 md:space-y-8 relative"
                    >
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all px-4 h-8"
                        >
                            {t('tryOther')}
                        </Button>

                        <div className="flex items-center gap-4">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-2 rounded-xl font-black tracking-widest text-[10px]">{t('vehicleFound')}</Badge>
                            <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                        </div>

                        <div className="flex items-start justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none break-words">
                                    {vehicle?.ModelYear} {vehicle?.Make} {vehicle?.Model}
                                </h3>
                                <p className="font-mono text-slate-400 font-bold tracking-widest text-xs md:text-sm italic">{vin.toUpperCase()}</p>
                            </div>
                            <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 shadow-xl flex items-center justify-center p-3 relative overflow-hidden group">
                                <img
                                    src={getBrandLogo(vehicle?.Make || '')}
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 z-10"
                                    alt={vehicle?.Make}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (next) next.style.opacity = '1';
                                    }}
                                />
                                <Car className="absolute inset-0 m-auto w-10 h-10 text-slate-200 opacity-0 transition-opacity z-0" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('countryOrigin')}</p>
                                <p className="font-bold text-slate-900 text-lg uppercase tracking-tight">{vehicle?.PlantCountry || 'SUA/Global'}</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleProceed}
                            className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black text-xl flex items-center justify-between px-10 transition-all active:scale-95 group shadow-2xl"
                        >
                            {t('continueCheck')}
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="hook"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 rounded-[2.5rem] p-10 shadow-3xl text-white space-y-8 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <ShieldCheck className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tighter leading-none">{t('readyToReport')}</h3>
                                <p className="text-slate-400 font-bold">{t('checkingSources')}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black">1</div>
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">{t('promoPrice')}</p>
                                        <p className="text-2xl font-black text-emerald-400 tracking-tighter">1.00 MDL <span className="text-xs text-slate-400 line-through ml-2 opacity-50 italic">350 MDL</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <Button
                                    onClick={handlePayment}
                                    className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                                >
                                    <ShieldCheck className="w-6 h-6" />
                                    {t('paySecure')}
                                </Button>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-500 font-bold text-center italic mt-6">{t('secureBy')}</p>
                    </motion.div >
                )
                }
            </AnimatePresence >
        </div >
    );
}
