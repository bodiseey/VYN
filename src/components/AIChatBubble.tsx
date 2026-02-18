'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleContext, ChatMessage } from '@/lib/gemini';

interface AIChatBubbleProps {
    context: VehicleContext;
}

const QUICK_QUESTIONS = [
    'Este prețul corect pentru Moldova?',
    'Ce probleme comune are acest motor?',
    'Cât costă întreținerea anuală?',
    'Este sigur să cumpăr această mașină?',
];

export default function AIChatBubble({ context }: AIChatBubbleProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && messages.length === 0) {
            // Welcome message
            setMessages([{
                role: 'model',
                content: `Bună! Sunt **VYN AI**, consultantul tău auto. Am analizat datele pentru **${context.year} ${context.make} ${context.model}** (VIN: ${context.vin}).\n\nPoți să mă întrebi orice despre această mașină — preț, întreținere, riscuri sau dacă merită cumpărată.`
            }]);
        }
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setShowQuick(false);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    context,
                    history: messages.filter(m => m.role !== 'model' || messages.indexOf(m) > 0)
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'model',
                content: 'A apărut o eroare. Te rugăm să încerci din nou.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const formatMessage = (text: string) => {
        // Simple markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/🟢/g, '<span class="text-emerald-400">🟢</span>')
            .replace(/🟡/g, '<span class="text-amber-400">🟡</span>')
            .replace(/🔴/g, '<span class="text-red-400">🔴</span>')
            .split('\n')
            .map(line => line.startsWith('- ') ? `<li class="ml-4 list-disc">${line.slice(2)}</li>` : line)
            .join('<br/>');
    };

    return (
        <>
            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-24 right-4 md:right-8 z-[200] w-[calc(100vw-2rem)] max-w-sm md:max-w-md bg-slate-950 border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
                        style={{ maxHeight: 'calc(100vh - 140px)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm">VYN AI</p>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Consultant Auto</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-white/60" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 min-h-0">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-sm font-medium'
                                                : 'bg-white/10 text-white/90 rounded-bl-sm'
                                            }`}
                                        dangerouslySetInnerHTML={
                                            msg.role === 'model'
                                                ? { __html: formatMessage(msg.content) }
                                                : undefined
                                        }
                                    >
                                        {msg.role === 'user' ? msg.content : undefined}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                                        <span className="text-white/50 text-sm font-medium">Analizez...</span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Questions */}
                            {showQuick && messages.length === 1 && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Întrebări rapide</p>
                                    {QUICK_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(q)}
                                            className="w-full text-left px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-medium transition-all"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 md:p-4 border-t border-white/10 flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                                    placeholder="Întreabă despre această mașină..."
                                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || loading}
                                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Bubble Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-4 md:right-8 z-[200] w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center transition-colors"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <ChevronDown className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse ring */}
                {!open && (
                    <span className="absolute inset-0 rounded-2xl animate-ping bg-blue-600 opacity-20" />
                )}
            </motion.button>
        </>
    );
}
