'use client';

import { useLocale } from 'next-intl';
import { routing, usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onLocaleChange(nextLocale: string) {
        router.replace(pathname, { locale: nextLocale });
    }

    return (
        <div className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-slate-200">
            {routing.locales.map((cur) => (
                <Button
                    key={cur}
                    variant={locale === cur ? 'default' : 'ghost'}
                    size="sm"
                    className={`px-3 py-1 h-8 rounded-lg text-xs font-bold uppercase transition-all ${locale === cur ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    onClick={() => onLocaleChange(cur)}
                >
                    {cur}
                </Button>
            ))}
        </div>
    );
}
