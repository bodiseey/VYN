import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes that are always accessible (even without access cookie)
const PUBLIC_PATHS = [
    '/maintenance',
    '/api/auth/maintenance',
];

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Always allow: static files, api routes (except guarded), maintenance page
    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
    const isStaticOrApi =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/_vercel') ||
        pathname.includes('.') || // static assets (favicon.svg, logo.png, etc.)
        (pathname.startsWith('/api') && !pathname.startsWith('/api/auth/maintenance'));

    if (isStaticOrApi) {
        return NextResponse.next();
    }

    // Check access cookie
    const accessCookie = req.cookies.get('vyn_access');
    const hasAccess = accessCookie?.value === 'granted';

    // If no access and not already on maintenance page, redirect there
    if (!hasAccess && !isPublic) {
        const maintenanceUrl = new URL('/maintenance', req.url);
        return NextResponse.redirect(maintenanceUrl);
    }

    // If has access and tries to visit maintenance, redirect home
    if (hasAccess && pathname === '/maintenance') {
        return NextResponse.redirect(new URL('/ro', req.url));
    }

    // For all other paths with access: run next-intl middleware
    if (hasAccess && !isPublic) {
        return intlMiddleware(req);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/api/auth/maintenance'],
};
