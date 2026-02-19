'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LogoMark } from './LogoMark';

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-white border-t border-slate-100">

            {/* Main footer body */}
            <div className="container mx-auto px-6 py-14">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10">

                    {/* Brand block */}
                    <div className="flex items-center gap-4">
                        <LogoMark size={40} />
                        <div>
                            <span className="font-black text-2xl tracking-tighter text-slate-900 block leading-none">VYN.md</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-none mt-1 block">
                                Powered by BODISHTYAN SOLUTIONS SRL
                            </span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-semibold items-center">
                        <Link href="#" className="hover:text-blue-600 transition-colors uppercase tracking-wider text-xs">{t('terms')}</Link>
                        <Link href="#" className="hover:text-blue-600 transition-colors uppercase tracking-wider text-xs">{t('privacy')}</Link>
                    </div>

                    {/* Rights */}
                    <div className="text-xs text-slate-400 font-medium italic self-center">
                        {t('rights')}
                    </div>
                </div>
            </div>

            {/* Payment Methods divider */}
            <div className="border-t border-slate-100 py-8">
                <div className="container mx-auto px-6 flex flex-col items-center gap-5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Metode de Plată Securizate &amp; Parteneri</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
                        <img src="/payment-logos/VISA-logo.png" className="h-5 w-auto grayscale hover:grayscale-0 opacity-40 hover:opacity-80 transition-all duration-300" alt="Visa" />
                        <img src="/payment-logos/Mastercard-logo.svg" className="h-7 w-auto grayscale hover:grayscale-0 opacity-40 hover:opacity-80 transition-all duration-300" alt="Mastercard" />
                        <img src="/payment-logos/Google_Pay_Logo.svg.png" className="h-5 w-auto grayscale hover:grayscale-0 opacity-40 hover:opacity-80 transition-all duration-300" alt="Google Pay" />
                        <img src="/payment-logos/Apple Pay.png" className="h-5 w-auto grayscale hover:grayscale-0 opacity-40 hover:opacity-80 transition-all duration-300" alt="Apple Pay" />
                        <img src="/payment-logos/logo-paynet.svg" className="h-5 w-auto grayscale hover:grayscale-0 opacity-40 hover:opacity-80 transition-all duration-300" alt="Paynet" />
                        <img src="/payment-logos/Mia Instant Payments.webp" className="h-7 w-auto grayscale hover:grayscale-0 opacity-40 hover:opacity-80 transition-all duration-300" alt="MIA Instant" />
                    </div>
                </div>
            </div>

            {/* Legal info */}
            <div className="border-t border-slate-50 bg-slate-50 py-6">
                <div className="container mx-auto px-6 text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Informații Juridice</p>
                    <p className="text-[11px] text-slate-600 font-bold">S.R.L. BODISHTYAN SOLUTIONS</p>
                    <p className="text-[10px] text-slate-400">IDNO: 1023600021052</p>
                    <p className="text-[10px] text-slate-400">Republica Moldova, r. Hîncești, s. Fundul Galbenei</p>
                    <p className="text-[10px] text-slate-400">office@vyn.md</p>
                </div>
            </div>

        </footer>
    );
}
