import { NextRequest, NextResponse } from 'next/server';
import { aggregateVinData } from '@/lib/vin-aggregator/aggregator';

export const maxDuration = 30; // Allow up to 30s for all adapters

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const vin = searchParams.get('vin');

    if (!vin) {
        return NextResponse.json({ success: false, error: 'VIN parameter required' }, { status: 400 });
    }

    try {
        const report = await aggregateVinData(vin);
        return NextResponse.json({ success: true, report }, { status: 200 });
    } catch (err: any) {
        const message = err?.message || 'Aggregation failed';
        const isValidation = message.startsWith('Invalid VIN');
        return NextResponse.json(
            { success: false, error: message },
            { status: isValidation ? 422 : 500 }
        );
    }
}
