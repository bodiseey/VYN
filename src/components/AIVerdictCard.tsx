'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIVerdict, VehicleContext } from '@/lib/gemini';

interface AIVerdictCardProps {
    context: VehicleContext;
}

const ratingConfig = {
    green: {
        bg: 'bg-emerald-950',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500',
        icon: ShieldCheck,
        iconColor: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        label: '🟢 SIGUR',
        barColor: 'bg-emerald-500',
    },
    yellow: {
        bg: 'bg-amber-950',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500',
        icon: ShieldAlert,
        iconColor: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        label: '🟡 NECESITĂ VERIFICARE',
        barColor: 'bg-amber-500',
    },
    red: {
        bg: 'bg-red-950',
        border: 'border-red-500/30',
        badge: 'bg-red-500',
        icon: ShieldX,
        iconColor: 'text-red-400',
        glow: 'shadow-red-500/20',
        label: '🔴 EVITAȚI',
        barColor: 'bg-red-500',
    },
};

export default function AIVerdictCard({ context }: AIVerdictCardProps) {
    const [verdict, setVerdict] = useState<AIVerdict | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchVerdict = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/ai/verdict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(context),
                });
                const data = await res.json();
                if (data.success) {
                    setVerdict(data.verdict);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchVerdict();
    }, [context.vin]);

    const cfg = verdict ? ratingConfig[verdict.rating] : ratingConfig.yellow;
    const Icon = cfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-[2.5rem] border ${cfg.border} ${cfg.bg} shadow-2xl ${cfg.glow} overflow-hidden`}
        >
            {/* Header */}
            <div className="p-6 md:p-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0`}>
                        {loading ? (
                            <Loader2 className="w-7 h-7 text-white/60 animate-spin" />
                        ) : (
                            <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-white/40" />
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">VYN AI · Consultant Auto</p>
                        </div>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-5 w-48 bg-white/10 rounded-lg animate-pulse" />
                                <div className="h-3 w-32 bg-white/5 rounded-lg animate-pulse" />
                            </div>
                        ) : (
                            <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight">
                                {verdict?.title || 'Analiză indisponibilă'}
                            </h3>
                        )}
                    </div>
                </div>

                {!loading && verdict && (
                    <Badge className={`${cfg.badge} border-none text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 flex-shrink-0`}>
                        {cfg.label}
                    </Badge>
                )}
            </div>

            {/* Confidence Bar */}
            {!loading && verdict && (
                <div className="px-6 md:px-8 pb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Încredere în date</p>
                        <p className="text-[10px] font-black text-white/50">{verdict.confidence}%</p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${verdict.confidence}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                            className={`h-full ${cfg.barColor} rounded-full`}
                        />
                    </div>
                </div>
            )}

            {/* Summary */}
            {!loading && verdict && (
                <div className="px-6 md:px-8 pb-4">
                    <p className="text-white/70 font-medium text-sm leading-relaxed">
                        {verdict.summary}
                    </p>
                </div>
            )}

            {/* Expandable Key Points */}
            {!loading && verdict && verdict.keyPoints.length > 0 && (
                <>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-6 md:px-8 py-3 flex items-center justify-between text-white/50 hover:text-white/80 transition-colors border-t border-white/10"
                    >
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {expanded ? 'Ascunde detalii' : `${verdict.keyPoints.length} puncte cheie`}
                        </span>
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 md:px-8 pb-6 space-y-3">
                                    {verdict.keyPoints.map((point, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.barColor} mt-2 flex-shrink-0`} />
                                            <p className="text-white/70 text-sm font-medium leading-relaxed">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Recommendation */}
            {!loading && verdict && (
                <div className="px-6 md:px-8 py-5 border-t border-white/10 bg-white/5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Recomandare VYN AI</p>
                    <p className="text-white font-bold text-sm leading-relaxed">{verdict.recommendation}</p>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div className="px-6 md:px-8 pb-6">
                    <p className="text-white/50 text-sm font-medium">
                        Serviciul AI nu este disponibil momentan. Adaugă cheia GEMINI_API_KEY în setările Vercel.
                    </p>
                </div>
            )}
        </motion.div>
    );
}
