import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawVin = searchParams.get('vin') || '';
    const vin = rawVin.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!vin || vin.length !== 17) {
        return NextResponse.json({ success: false, error: 'VIN invalid (trebuie să aibă exact 17 caractere)' }, { status: 400 });
    }

    // Validation: No I, O, Q
    if (/[IOQ]/i.test(vin)) {
        return NextResponse.json({ success: false, error: 'VIN invalid (nu poate conține literele I, O sau Q)' }, { status: 400 });
    }

    try {
        console.log(`[NHTSA] Decoding VIN: ${vin}`);
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
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
            vin,
            id: `nhtsa_${vin}`
        });
    } catch (error) {
        console.error('NHTSA API Error:', error);
        return NextResponse.json({ success: false, error: 'Eroare conexiune server NHTSA' }, { status: 500 });
    }
}
