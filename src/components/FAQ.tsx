'use client';

import { useTranslations } from 'next-intl';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const t = useTranslations('FAQ');

    const items = [
        { q: t('items.0.question'), a: t('items.0.answer') },
        { q: t('items.1.question'), a: t('items.1.answer') }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-12 text-center">{t('title')}</h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {items.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200 rounded-2xl px-6 py-2 overflow-hidden bg-slate-50/50">
                            <AccordionTrigger className="text-left font-bold text-lg hover:no-underline">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-slate-600 text-base leading-relaxed">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
