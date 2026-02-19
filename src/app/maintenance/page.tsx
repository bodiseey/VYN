'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Lock, Cpu, Database, Brain, Shield } from 'lucide-react';

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
        { icon: Shield, label: 'Rapoint verificare complet VIN din surse oficiale' },
        { icon: Database, label: 'Date din Registrul Național RM, NHTSA, piețe auto' },
        { icon: Brain, label: 'Analiză AI avansată pentru fiecare vehicul' },
        { icon: Cpu, label: 'Raport instant — nu ore, ci secunde' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

            {/* Same navbar style as site */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center px-6 md:px-10">
                <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-blue.svg" alt="VYN.md" className="w-9 h-9 object-contain" />
                    <div>
                        <div className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none">VYN.md</div>
                        <div className="text-[9px] text-slate-400 font-black tracking-[0.25em] uppercase leading-none mt-0.5">Automotive Intelligence</div>
                    </div>
                </div>
            </nav>

            {/* Hero section — matches homepage style */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">

                {/* Background gradients matching the site */}
                <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] bg-blue-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-indigo-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

                <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-8">

                    {/* Status badge — same as "AI Powered Car Assistant" on homepage */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm shadow-sm border border-blue-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        Platformă în dezvoltare activă
                    </div>

                    {/* Big heading — same weight & style as homepage */}
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                            Verifică istoricul<br />
                            <span className="text-blue-600">mașinii cu AI</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                            Lucrăm la primul sistem complet de verificare a autovehiculelor din Moldova.
                            Date oficiale din registrele de stat, analiză AI și raport instant.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {features.map(({ icon: Icon, label }, i) => (
                            <div key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 text-sm font-semibold">
                                <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Password form — styled like the VIN input on homepage */}
                    <div className="max-w-md mx-auto space-y-3">
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-xl shadow-blue-100/50 p-2 gap-2">
                                <div className="flex items-center gap-3 flex-1 px-3">
                                    <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Parolă de acces preview..."
                                        className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none py-2"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl flex items-center gap-2 transition-all active:scale-95 text-sm whitespace-nowrap shadow-lg shadow-blue-600/30"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Intră în Preview
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                        )}

                        <p className="text-slate-400 text-xs font-medium">
                            Accesul este restricționat în timpul dezvoltării.
                        </p>
                    </div>

                </div>
            </div>

            {/* Footer — same as site */}
            <div className="border-t border-slate-200 bg-white py-5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-blue.svg" alt="VYN.md" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">VYN.md</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                    Powered by BODISHTYAN SOLUTIONS SRL
                </p>
                <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                    © 2025 Toate drepturile rezervate
                </p>
            </div>

        </div>
    );
}
