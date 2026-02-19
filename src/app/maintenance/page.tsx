'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, Shield, Zap, Database, Brain } from 'lucide-react';

export default function MaintenancePage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                setShake(true);
                setTimeout(() => setShake(false), 600);
            }
        } catch {
            setError('Eroare de conexiune.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Shield, text: 'Verificare istoricul complet al autovehiculului din surse oficiale' },
        { icon: Database, text: 'Date din Registrul Național al Moldovei, NHTSA și piețele auto' },
        { icon: Brain, text: 'Analiză AI avansată pentru fiecare vehicul verificat' },
        { icon: Zap, text: 'Raport instant în secunde, nu ore' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Ambient background glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                    {/* LEFT — Brand & Description */}
                    <div className="text-white space-y-8">

                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 relative flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo.png"
                                    alt="VYN.md"
                                    className="w-full h-full object-contain"
                                    style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(3167%) hue-rotate(213deg) brightness(102%)' }}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">VYN.md</h1>
                                <p className="text-[11px] font-bold text-blue-400 tracking-[0.25em] uppercase mt-1">Automotive Intelligence</p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Platformă în Construcție</span>
                        </div>

                        {/* Main message */}
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
                                Primul sistem de<br />
                                <span className="text-blue-400">verificare auto</span><br />
                                din Moldova
                            </h2>
                            <p className="text-slate-400 text-base leading-relaxed font-medium max-w-md">
                                Lucrăm intensiv pentru a lansa cea mai completă platformă de verificare a istoricului autovehiculelor din Republica Moldova. Analiză AI, date oficiale, rapoarte instant.
                            </p>
                        </div>

                        {/* Features list */}
                        <div className="space-y-3">
                            {features.map(({ icon: Icon, text }, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Powered by */}
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                            Powered by BODISHTYAN SOLUTIONS SRL
                        </p>
                    </div>

                    {/* RIGHT — Access form */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-sm">
                            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                                {/* Form header */}
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Acces Restricționat</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">
                                        Platforma e în dezvoltare activă. Introdu parola de acces pentru preview.
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className={`relative transition-all duration-200 ${shake ? 'animate-[shake_0.3s_ease-in-out_2]' : ''}`}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Parolă de acces..."
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 pr-14 text-white placeholder-slate-500 font-semibold text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-xs font-bold text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !password}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/30 text-sm"
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

                                {/* Bottom note */}
                                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                                        vyn.md © 2025 · Toate drepturile rezervate
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
            `}</style>
        </div>
    );
}
