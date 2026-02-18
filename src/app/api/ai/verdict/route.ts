import { NextRequest, NextResponse } from 'next/server';
import { generateAIVerdict, VehicleContext } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const ctx: VehicleContext = await req.json();

        if (!ctx.vin) {
            return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
        }

        const verdict = await generateAIVerdict(ctx);
        const hasKey = !!process.env.GEMINI_API_KEY;
        return NextResponse.json({ success: true, verdict, debug_key_present: hasKey });
    } catch (error: any) {
        console.error('[AI Verdict API Error]', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error?.message }, { status: 500 });
    }
}
