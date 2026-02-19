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
        <div
            className="bg-slate-50 font-sans"
            style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
        >
            {/* Ambient decorations — absolute, pointer-events-none, behind everything */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed', inset: 0, zIndex: 0,
                    pointerEvents: 'none', overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', top: '-15%', left: '-8%',
                    width: '60%', height: '55%',
                    background: 'radial-gradient(circle, #bfdbfe 0%, transparent 70%)',
                    opacity: 0.5,
                }} />
                <div style={{
                    position: 'absolute', bottom: '-15%', right: '-8%',
                    width: '55%', height: '50%',
                    background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)',
                    opacity: 0.35,
                }} />
            </div>

            {/* ── Navbar ── */}
            <nav style={{
                position: 'relative', zIndex: 10,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #e2e8f0',
                height: 64,
                display: 'flex', alignItems: 'center',
                padding: '0 20px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <LogoMark size={34} />
                    <div>
                        <div style={{
                            fontSize: 15, fontWeight: 900, color: '#0f172a',
                            textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1,
                        }}>VYN.md</div>
                        <div style={{
                            fontSize: 9, color: '#94a3b8', fontWeight: 700,
                            letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2,
                        }}>Automotive Intelligence</div>
                    </div>
                </div>
            </nav>

            {/* ── Scrollable content ── */}
            <div style={{
                flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1,
                padding: '32px 20px 32px',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 40,
                        alignItems: 'start',
                    }}>

                        {/* ── Brand info ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Badge */}
                            <div style={{
                                display: 'inline-flex', alignSelf: 'flex-start',
                                alignItems: 'center', gap: 8,
                                padding: '6px 16px', borderRadius: 999,
                                background: '#eff6ff', border: '1px solid #bfdbfe',
                                color: '#2563eb', fontWeight: 600, fontSize: 13,
                            }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#2563eb', display: 'inline-block',
                                }} />
                                Platformă în Construcție
                            </div>

                            {/* Heading */}
                            <div>
                                <h1 style={{
                                    fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                                    fontWeight: 900, color: '#0f172a',
                                    letterSpacing: '-0.03em', lineHeight: 1.05,
                                    margin: 0,
                                }}>
                                    Primul sistem de<br />
                                    <span style={{ color: '#2563eb' }}>verificare auto</span><br />
                                    din Moldova
                                </h1>
                                <p style={{
                                    marginTop: 16, color: '#64748b', fontSize: 15,
                                    fontWeight: 500, lineHeight: 1.6, maxWidth: 480,
                                }}>
                                    Lucrăm intensiv pentru a lansa cea mai completă platformă de verificare a istoricului autovehiculelor din Republica Moldova. Analiză AI, date oficiale, rapoarte instant.
                                </p>
                            </div>

                            {/* Features */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {features.map(({ icon: Icon, text }, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: '#eff6ff', border: '1px solid #bfdbfe',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Icon style={{ width: 16, height: 16, color: '#2563eb' }} />
                                        </div>
                                        <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, lineHeight: 1.5, marginTop: 8 }}>{text}</p>
                                    </div>
                                ))}
                            </div>

                            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                Powered by BODISHTYAN SOLUTIONS SRL
                            </p>
                        </div>

                        {/* ── Access form ── */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                background: '#ffffff', borderRadius: 24,
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 20px 60px -10px rgba(37,99,235,0.12)',
                                padding: 28, width: '100%', maxWidth: 360,
                                position: 'relative', zIndex: 2,
                            }}>
                                {/* Lock */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16,
                                        background: '#eff6ff', border: '1px solid #bfdbfe',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Lock style={{ width: 24, height: 24, color: '#2563eb' }} />
                                    </div>
                                </div>

                                {/* Title */}
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                                        Acces Restricționat
                                    </h2>
                                    <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                                        Platforma e în dezvoltare activă. Introdu parola de acces pentru preview.
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* Password field */}
                                    <div style={{ position: 'relative', marginBottom: 12 }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Parolă de acces..."
                                            autoComplete="current-password"
                                            style={{
                                                width: '100%', height: 52,
                                                background: '#f8fafc',
                                                border: '1.5px solid #e2e8f0',
                                                borderRadius: 14, padding: '0 52px 0 18px',
                                                fontSize: 16, /* 16px prevents iOS zoom */
                                                fontWeight: 600, color: '#0f172a',
                                                outline: 'none', boxSizing: 'border-box',
                                                WebkitAppearance: 'none',
                                                display: 'block',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#60a5fa';
                                                e.currentTarget.style.background = '#fff';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.background = '#f8fafc';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                        {/* Eye button — using inline styles to prevent any Tailwind z-index issues */}
                                        <button
                                            type="button"
                                            onPointerDown={(e) => {
                                                e.preventDefault(); // prevent input blur before toggle
                                                setShowPassword(v => !v);
                                            }}
                                            style={{
                                                position: 'absolute', right: 14,
                                                top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none',
                                                cursor: 'pointer', padding: 8,
                                                zIndex: 5, color: '#94a3b8',
                                                display: 'flex', alignItems: 'center',
                                                WebkitTapHighlightColor: 'transparent',
                                                touchAction: 'manipulation',
                                            }}
                                        >
                                            {showPassword
                                                ? <EyeOff style={{ width: 20, height: 20 }} />
                                                : <Eye style={{ width: 20, height: 20 }} />
                                            }
                                        </button>
                                    </div>

                                    {error && (
                                        <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>
                                            {error}
                                        </p>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !password}
                                        style={{
                                            width: '100%', height: 52,
                                            background: loading || !password ? '#93c5fd' : '#2563eb',
                                            borderRadius: 14, border: 'none',
                                            color: '#fff', fontSize: 15, fontWeight: 900,
                                            cursor: loading || !password ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: 10, boxSizing: 'border-box',
                                            boxShadow: '0 8px 24px -4px rgba(37,99,235,0.35)',
                                            WebkitTapHighlightColor: 'transparent',
                                            touchAction: 'manipulation',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        {loading
                                            ? <div style={{
                                                width: 20, height: 20,
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTopColor: '#fff',
                                                borderRadius: '50%',
                                                animation: 'spin 0.7s linear infinite',
                                            }} />
                                            : <>Intră în Platformă <ArrowRight style={{ width: 18, height: 18 }} /></>
                                        }
                                    </button>
                                </form>

                                {/* Footer note */}
                                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                    <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
                                        VYN.md © 2026 · Toate drepturile rezervate
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{
                borderTop: '1px solid #e2e8f0', background: '#fff',
                padding: '12px 20px', position: 'relative', zIndex: 2,
                display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                justifyContent: 'space-between', gap: 8,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LogoMark size={20} />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>VYN.md</span>
                </div>
                <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, margin: 0 }}>Powered by BODISHTYAN SOLUTIONS SRL</p>
                <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, margin: 0 }}>© 2026 Toate drepturile rezervate</p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
