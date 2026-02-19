import { NextRequest, NextResponse } from 'next/server';
import { fetchRdwData } from '@/lib/vin-aggregator/adapters/rdw';

/**
 * Enhanced Scan Endpoint
 * Supports both VIN (17 chars) -> NHTSA
 * And Dutch Plate (4-8 chars) -> RDW
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawInput = searchParams.get('vin') || ''; // 'vin' param used for both
    const input = rawInput.toUpperCase().replace(/[\s-]/g, '');

    // ── CASE A: Dutch License Plate (4-8 chars) ─────────────────────────────
    if (input.length >= 4 && input.length <= 8) {
        try {
            console.log(`[Scan] Detected possible Dutch plate: ${input}`);
            const rdwData = await fetchRdwData(input);
            if (rdwData && rdwData.brand) {
                return NextResponse.json({
                    success: true,
                    ModelYear: rdwData.firstRegistration ? rdwData.firstRegistration.substring(0, 4) : 'N/A',
                    Make: rdwData.brand,
                    Model: rdwData.model,
                    PlantCountry: 'NETHERLANDS', // infer location from source
                    vin: input, // return input as ID since we don't have VIN
                    id: `rdw_${input}`,
                    source: 'RDW'
                });
            } else {
                return NextResponse.json({ success: false, error: 'Număr înmatriculare Olanda invalid sau vehicul negăsit.' }, { status: 404 });
            }
        } catch (err) {
            console.error('[Scan] RDW Error:', err);
            return NextResponse.json({ success: false, error: 'Eroare la verificare RDW' }, { status: 500 });
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
