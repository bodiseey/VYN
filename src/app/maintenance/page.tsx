'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPw, setShowPw] = useState(false);
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
                setError('Parolă incorectă.');
                setPassword('');
            }
        } catch {
            setError('Eroare conexiune. Încearcă din nou.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100svh',
            background: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <header style={{
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}>
                {/* Logo inline SVG — no external dependencies */}
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: '#2563eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                        <path d="M3 4L9 20L12 13L15 20L21 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a', letterSpacing: '-0.03em' }}>VYN.md</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Automotive Intelligence</div>
                </div>
            </header>

            {/* Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '40px 24px',
                gap: 40,
                maxWidth: 960,
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
            }}>

                {/* Text section */}
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        color: '#2563eb', fontWeight: 600, fontSize: 13,
                        padding: '5px 14px', borderRadius: 999, marginBottom: 20,
                    }}>
                        <span style={{ width: 8, height: 8, background: '#2563eb', borderRadius: '50%' }} />
                        Platformă în Construcție
                    </div>
                    <h1 style={{
                        margin: 0, fontWeight: 900, color: '#0f172a',
                        fontSize: 'clamp(2rem, 9vw, 3.5rem)',
                        letterSpacing: '-0.03em', lineHeight: 1.1,
                    }}>
                        Primul sistem de<br />
                        <span style={{ color: '#2563eb' }}>verificare auto</span><br />
                        din Moldova
                    </h1>
                    <p style={{
                        marginTop: 16, color: '#64748b', fontSize: 15,
                        lineHeight: 1.6, maxWidth: 480,
                    }}>
                        Lucrăm intensiv pentru a lansa cea mai completă platformă de verificare a istoricului autovehiculelor din Republica Moldova.
                    </p>
                </div>

                {/* Form section — always visible, no z-index tricks */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 20,
                        padding: '28px 24px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        maxWidth: 400,
                        width: '100%',
                    }}
                >
                    <h2 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 20, color: '#0f172a' }}>
                        Acces Restricționat
                    </h2>
                    <p style={{ margin: '0 0 24px', fontSize: 14, color: '#94a3b8' }}>
                        Introdu parola de acces pentru preview.
                    </p>

                    {/* Input wrapper */}
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                        <input
                            type={showPw ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Parolă de acces..."
                            autoComplete="current-password"
                            style={{
                                display: 'block',
                                width: '100%',
                                boxSizing: 'border-box',
                                height: 52,
                                borderRadius: 12,
                                border: '1.5px solid #e2e8f0',
                                background: '#f8fafc',
                                padding: '0 52px 0 16px',
                                fontSize: 16,
                                color: '#0f172a',
                                fontFamily: 'inherit',
                                outline: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                            }}
                        />
                        {/* Eye toggle */}
                        <button
                            type="button"
                            tabIndex={-1}
                            onPointerDown={e => { e.preventDefault(); setShowPw(v => !v); }}
                            style={{
                                position: 'absolute',
                                right: 0, top: 0,
                                width: 52, height: 52,
                                background: 'none', border: 'none',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#94a3b8',
                                fontSize: 20,
                                WebkitTapHighlightColor: 'transparent',
                                touchAction: 'manipulation',
                            }}
                            aria-label={showPw ? 'Ascunde parola' : 'Arată parola'}
                        >
                            {showPw ? '🙈' : '👁️'}
                        </button>
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, margin: '0 0 10px', textAlign: 'center' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!password || loading}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: 52,
                            borderRadius: 12,
                            border: 'none',
                            background: !password || loading ? '#93c5fd' : '#2563eb',
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 800,
                            cursor: !password || loading ? 'default' : 'pointer',
                            fontFamily: 'inherit',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {loading ? 'Se verifică...' : 'Intră în Platformă →'}
                    </button>

                    <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 11, color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        VYN.md © 2026
                    </p>
                </form>
            </div>
        </div>
    );
}
