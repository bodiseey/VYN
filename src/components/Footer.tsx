'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="py-12 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                            VYN
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tighter block leading-none">VYN.md</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                Powered by BODISHTYAN SOLUTIONS SRL
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 font-medium">
                        <Link href="#" className="hover:text-blue-600 transition-colors uppercase tracking-wider">{t('terms')}</Link>
                        <Link href="#" className="hover:text-blue-600 transition-colors uppercase tracking-wider">{t('privacy')}</Link>
                    </div>

                    <div className="text-sm text-slate-400 font-medium italic">
                        {t('rights')}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metode de Plată Securizate & Parteneri</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        <img src="/payment-logos/VISA-logo.png" className="h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Visa" />
                        <img src="/payment-logos/Mastercard-logo.svg" className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Mastercard" />
                        <img src="/payment-logos/Google_Pay_Logo.svg.png" className="h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Google Pay" />
                        <img src="/payment-logos/Apple Pay.png" className="h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Apple Pay" />
                        <img src="/payment-logos/logo-paynet.svg" className="h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="Paynet" />
                        <img src="/payment-logos/Mia Instant Payments.webp" className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer" alt="MIA Instant" />
                    </div>
                </div>

                {/* Company Info as per Paynet Requirements */}
                <div className="mt-8 text-center text-xs text-slate-400 space-y-2 font-medium">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-2">Informații Juridice</p>
                    <p className="text-slate-600 font-bold">S.R.L. BODISHTYAN SOLUTIONS</p>
                    <p>IDNO: 1023600021052</p>
                    <p>Adresa: Republica Moldova, r. Hîncești, s. Fundul Galbenei</p>
                    <p>Contact: office@vyn.md</p>
                </div>
            </div>
        </footer>
    );
}
