import { NextRequest, NextResponse } from 'next/server';
import { fetchRdwData } from '@/lib/vin-aggregator/adapters/rdw';

/**
 * Enhanced Scan Endpoint
 * Supports both VIN (17 chars) -> NHTSA
 * And License Plates (4-8 chars) -> RDW (NL) / DVSA (UK)
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawInput = searchParams.get('vin') || ''; // 'vin' param used for both
    const input = rawInput.toUpperCase().replace(/[\s-]/g, '');

    // ── CASE A: License Plate (4-8 chars) - Try Netherlands, then UK ─────────
    if (input.length >= 4 && input.length <= 8) {
        try {
            console.log(`[Scan] Detected plate format: ${input}. Trying RDW...`);
            const rdwData = await fetchRdwData(input);

            if (rdwData && rdwData.brand) {
                return NextResponse.json({
                    success: true,
                    ModelYear: rdwData.firstRegistration ? rdwData.firstRegistration.substring(0, 4) : 'N/A',
                    Make: rdwData.brand,
                    Model: rdwData.model,
                    PlantCountry: 'NETHERLANDS',
                    vin: input,
                    id: `rdw_${input}`,
                    source: 'RDW'
                });
            }

            // If not found in NL, try UK (DVSA)
            console.log(`[Scan] Not found in RDW. Trying UK DVSA...`);
            const { UkMotAdapter } = await import('@/lib/services/ukMotAdapter');
            const ukService = new UkMotAdapter();
            const ukData = await ukService.fetchData(input);

            if (ukData && ukData.make) {
                return NextResponse.json({
                    success: true,
                    ModelYear: ukData.registrationDate ? ukData.registrationDate.substring(0, 4) : (ukData.firstUsedDate ? ukData.firstUsedDate.substring(0, 4) : 'N/A'),
                    Make: ukData.make,
                    Model: ukData.model,
                    PlantCountry: 'UNITED KINGDOM',
                    vin: input,
                    id: `uk_${input}`,
                    source: 'DVSA'
                });
            }

            return NextResponse.json({ success: false, error: 'Vehiculul nu a fost găsit în bazele de date Olanda sau Anglia.' }, { status: 404 });
        } catch (err) {
            console.error('[Scan] Registry Error:', err);
            return NextResponse.json({ success: false, error: 'Eroare la verificare baze date externe' }, { status: 500 });
        }
    }

    // ── CASE B: VIN (17 chars) ──────────────────────────────────────────────
    if (input.length !== 17) {
        return NextResponse.json({ success: false, error: 'Format invalid (VIN 17 caractere sau Nr. Înmatriculare Olanda)' }, { status: 400 });
    }

    if (/[IOQ]/i.test(input)) {
        return NextResponse.json({ success: false, error: 'VIN invalid (litere I, O, Q interzise)' }, { status: 400 });
    }

    try {
        console.log(`[NHTSA] Decoding VIN: ${input}`);
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${input}?format=json`);
        const data = await response.json();

        if (!data.Results) {
            return NextResponse.json({ success: false, error: 'Nu s-au putut prelua datele' }, { status: 404 });
        }

        const results = data.Results;
        const findValue = (variable: string) => results.find((r: any) => r.Variable === variable)?.Value;

        const make = findValue('Make');
        const model = findValue('Model');
        const year = findValue('Model Year');
        const country = findValue('Plant Country');

        if (!make || !model) {
            return NextResponse.json({ success: false, error: 'Vehiculul nu a fost găsit în baza de date NHTSA' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            ModelYear: year,
            Make: make,
            Model: model,
            PlantCountry: country,
            vin: input,
            id: `nhtsa_${input}`
        });
    } catch (error) {
        console.error('NHTSA API Error:', error);
        return NextResponse.json({ success: false, error: 'Eroare conexiune server NHTSA' }, { status: 500 });
    }
}
