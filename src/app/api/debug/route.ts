import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Debug endpoint - remove after testing
    const hasKey = !!process.env.GEMINI_API_KEY;
    const keyPrefix = process.env.GEMINI_API_KEY?.substring(0, 8) || 'NOT_SET';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET';

    return NextResponse.json({
        gemini_key_present: hasKey,
        gemini_key_prefix: keyPrefix,
        app_url: appUrl,
        node_env: process.env.NODE_ENV,
    });
}
