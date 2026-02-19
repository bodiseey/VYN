'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Lock, Shield, Brain, Database, Zap } from 'lucide-react';
import { LogoMark } from '@/components/LogoMark';

export default function MaintenancePage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (data.success) {
                router.refresh();
                router.push('/ro');
            } else {
                setError('Parolă incorectă. Încearcă din nou.');
                setPassword('');
            }
        } catch {
            setError('Eroare de conexiune.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Shield, text: 'Verificare completă a istoricului autovehiculului din surse oficiale' },
        { icon: Database, text: 'Date din Registrul Național al Moldovei, NHTSA și piețele auto' },
        { icon: Brain, text: 'Analiză AI avansată pentru fiecare vehicul verificat' },
        { icon: Zap, text: 'Raport instant în secunde, nu ore' },
    ];

    return (
        /* 
          KEY MOBILE FIXES:
          - overflow-y-auto (not hidden) so page scrolls when keyboard opens
          - No autoFocus on input (prevents keyboard popping on load)
          - pb-safe for notch/home-bar on iOS
        */
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-y-auto">

            {/* ── Navbar ── */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 md:h-20 flex items-center px-5 md:px-10 flex-shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <LogoMark size={34} />
                    <div>
                        <div className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none">VYN.md</div>
                        <div className="text-[9px] text-slate-400 font-black tracking-[0.2em] uppercase leading-none mt-0.5">Automotive Intelligence</div>
                    </div>
                </div>
            </nav>

            {/* ── Main content — scrollable, not centered vertically on mobile ── */}
            <div className="flex-1 px-5 md:px-10 py-8 md:py-16 relative">

                {/* Ambient gradients */}
                <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-15%] left-[-8%] w-[70%] h-[50%] bg-blue-100 rounded-full blur-[130px] opacity-40" />
                    <div className="absolute bottom-[-15%] right-[-8%] w-[60%] h-[50%] bg-indigo-100 rounded-full blur-[110px] opacity-30" />
                </div>

                <div className="w-full max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:items-center">

                        {/* ── TOP on mobile / LEFT on desktop — Brand info ── */}
                        <div className="space-y-5 order-1">

                            {/* Status badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-sm shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                                </span>
                                Platformă în Construcție
                            </div>

                            {/* Heading */}
                            <div className="space-y-3">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                                    Primul sistem de<br />
                                    <span className="text-blue-600">verificare auto</span><br />
                                    din Moldova
                                </h1>
                                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-lg">
                                    Lucrăm intensiv pentru a lansa cea mai completă platformă de verificare a istoricului autovehiculelor din Republica Moldova. Analiză AI, date oficiale, rapoarte instant.
                                </p>
                            </div>

                            {/* Features — hidden on small mobile to save space, visible from sm up */}
                            <div className="hidden sm:flex flex-col space-y-3">
                                {features.map(({ icon: Icon, text }, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Icon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed pt-1">{text}</p>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hidden sm:block">
                                Powered by BODISHTYAN SOLUTIONS SRL
                            </p>
                        </div>

                        {/* ── BOTTOM on mobile / RIGHT on desktop — Access form ── */}
                        <div className="order-2 flex justify-center lg:justify-end">
                            <div className="w-full max-w-sm">
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-blue-100/40 p-6 md:p-8">

                                    {/* Lock icon — smaller on mobile */}
                                    <div className="flex justify-center mb-5">
                                        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>

                                    {/* Header */}
                                    <div className="text-center mb-6 space-y-1.5">
                                        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Acces Restricționat</h2>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                            Platforma e în dezvoltare activă. Introdu parola de acces pentru preview.
                                        </p>
                                    </div>

                                    {/* Form — NO autoFocus, font-size 16px+ to prevent iOS zoom */}
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Parolă de acces..."
                                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 pr-12 text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                                style={{ fontSize: '16px' }} /* prevents iOS auto-zoom */
                                                autoComplete="current-password"
                                                inputMode="text"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 touch-manipulation"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        {error && (
                                            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !password}
                                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/25 touch-manipulation"
                                            style={{ fontSize: '16px' }}
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Intră în Platformă
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            VYN.md © 2026 · Toate drepturile rezervate
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 bg-white py-4 px-5 md:px-10 flex flex-wrap items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-2">
                    <LogoMark size={20} />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">VYN.md</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Powered by BODISHTYAN SOLUTIONS SRL</p>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">© 2026 Toate drepturile rezervate</p>
            </div>

        </div>
    );
}
