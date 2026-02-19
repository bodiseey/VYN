import { NextRequest, NextResponse } from 'next/server';
import { fetchRdwData } from '@/lib/vin-aggregator/adapters/rdw';

/**
 * GET /api/vin/rdw?plate=12-ABC-3
 *
 * Direct RDW lookup by Dutch license plate.
 * Use this when a user explicitly provides a Dutch plate (not a VIN).
 */
export async function GET(req: NextRequest) {
    const plate = req.nextUrl.searchParams.get('plate');

    if (!plate) {
        return NextResponse.json(
            { success: false, error: 'plate parameter is required (e.g. ?plate=12-ABC-3)' },
            { status: 400 }
        );
    }

    if (plate.replace(/[\s\-\.]/g, '').length < 4) {
        return NextResponse.json(
            { success: false, error: 'Invalid plate format' },
            { status: 422 }
        );
    }

    try {
        const data = await fetchRdwData(plate);

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Vehicle not found in RDW register' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error('[RDW Route] Error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'RDW lookup failed' },
            { status: 500 }
        );
    }
}
