import { NextRequest, NextResponse } from 'next/server';
import { generateAIVerdict, VehicleContext } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const ctx: VehicleContext = await req.json();

        if (!ctx.vin) {
            return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
        }

        const verdict = await generateAIVerdict(ctx);
        return NextResponse.json({ success: true, verdict });
    } catch (error) {
        console.error('[AI Verdict API Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
