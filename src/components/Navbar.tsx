'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const router = useRouter();

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 md:gap-4 group transition-all duration-300 active:scale-95">
                    {/* Logo mark */}
                    <div className="w-9 h-9 md:w-11 md:h-11 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/logo.png"
                            alt="VYN.md Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    {/* Wordmark */}
                    <div>
                        <h1 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">VYN.md</h1>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-black tracking-widest uppercase leading-none mt-0.5 md:mt-1">
                            Automotive Intelligence
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (window.location.pathname.includes('/report')) {
                                router.push('/#vin-section');
                            } else {
                                document.getElementById('vin-section')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="hidden md:flex items-center gap-2 rounded-xl font-black text-slate-600 hover:bg-slate-100 px-4 transition-all"
                    >
                        <Search className="w-4 h-4" /> VERIFICĂ VIN
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (window.location.pathname.includes('/report')) {
                                router.push('/#vin-section');
                            } else {
                                document.getElementById('vin-section')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="md:hidden rounded-lg text-slate-600"
                    >
                        <Search className="w-5 h-5" />
                    </Button>

                    <div className="h-4 w-px bg-slate-200 mx-1 hidden md:block"></div>

                    <div className="flex items-center">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </nav>
    );
}
