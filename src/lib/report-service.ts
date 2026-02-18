import { GovVehicleData, GovTechnicalInspection, GovBorderCrossing } from './mconnect';

export interface UnifiedReport {
    vin: string;
    make: string;
    model: string;
    year: string;
    specs: Record<string, string>;
    allSpecs?: Record<string, string>;
    nationalData: any;
    marketData: {
        averagePrice: number;
        currency: string;
        listings: any[];
    };
    history: any[];
}

/**
 * Enhanced Search for 999.md
 */
async function search999md(vin: string) {
    const token = process.env.NINENV_API_TOKEN || 'rEzEP4JIaVjT8u2K2JvoF7USlHK3';
    const cleanVin = vin.toUpperCase().trim();

    try {
        const response = await fetch(`https://business-api.999.md/items/search?query=${cleanVin}&lang=ro`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            next: { revalidate: 3600 }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                return data.items.map((item: any) => ({
                    platform: '999.md',
                    id: item.id,
                    title: item.title,
                    price: item.price?.value || '0',
                    currency: item.price?.unit || 'EUR',
                    url: `https://999.md/ro/${item.id}`,
                    status: 'Activ',
                    posted: item.date_posted || new Date().toISOString()
                }));
            }
        }

        const publicSearchUrl = `https://999.md/ro/search?query=${cleanVin}`;
        const publicRes = await fetch(publicSearchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15' }
        });
        const html = await publicRes.text();

        if (html.includes(cleanVin)) {
            const idMatch = html.match(/\/ro\/(\d{8,10})/);
            const foundId = idMatch ? idMatch[1] : null;
            return [{
                platform: '999.md',
                id: foundId || 'search_result',
                title: `Vehicul găsit în anunțurile 999.md`,
                price: 'Evaluare la cerere',
                currency: '',
                url: foundId ? `https://999.md/ro/${foundId}` : publicSearchUrl,
                status: 'Activ',
                posted: new Date().toISOString()
            }];
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * Aggregates all REAL data
 */
export async function getFullVehicleReport(vin: string, extended: boolean = false): Promise<UnifiedReport> {
    const cleanVin = vin.toUpperCase().trim();

    // 1. Fetch from REAL bases (NHTSA, 999, M-Connect)
    const [nhtsaRes, mdData, marketListings] = await Promise.all([
        fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVin}?format=json`).then(r => r.json()).catch(() => ({})),
        import('./mconnect').then(m => m.getNationalReportData(cleanVin)),
        search999md(cleanVin)
    ]);

    const results = nhtsaRes.Results || [];
    const findNHTSA = (v: string) => results.find((r: any) => r.Variable === v)?.Value;

    // 2. Technical Extraction (Real)
    const specs: Record<string, string> = {
        'Țară Origine': findNHTSA('Plant Country') || 'N/A',
        'Motor': findNHTSA('Displacement (L)') ? `${findNHTSA('Displacement (L)')}L ${findNHTSA('Engine Number of Cylinders') || ''} Cilindri` : 'N/A',
        'Putere (HP)': findNHTSA('Engine HP') || 'N/A',
        'Combustibil': findNHTSA('Fuel Type - Primary') || 'N/A',
        'Caroserie': findNHTSA('Body Class') || 'N/A',
        'Tracțiune': findNHTSA('Drive Type') || 'N/A',
        'Transmisie': findNHTSA('Transmission Style') || 'N/A',
        'An Fabricație': findNHTSA('Model Year') || 'N/A'
    };

    let allSpecs: Record<string, string> = {};
    if (extended) {
        results.forEach((r: any) => {
            if (r.Value && !['Not Applicable', 'N/A', ''].includes(r.Value)) {
                allSpecs[r.Variable] = r.Value;
            }
        });
    }

    // 3. Timeline Construction (ONLY REAL DATA)
    const history: any[] = [];

    // MD Official Data
    if (mdData.success) {
        if (mdData.inspections) {
            mdData.inspections.forEach((ins: any) => history.push({
                date: ins.Date,
                type: 'INSPECȚIE',
                description: `Verificare tehnică RM: ${ins.Result} la ${ins.Mileage} KM`,
                location: ins.Station
            }));
        }
        if (mdData.borderCrossings) {
            mdData.borderCrossings.forEach((b: any) => history.push({
                date: b.DateTime.split(' ')[0],
                type: 'FRONTIERĂ',
                description: `Punct trecere: ${b.Point} (${b.Direction === 'ENTRY' ? 'Intrare' : 'Ieșire'})`,
                location: b.Point
            }));
        }
    }

    // Market Presence
    if (marketListings.length > 0) {
        marketListings.forEach((listing: any) => {
            history.push({
                date: listing.posted.split('T')[0],
                type: 'MARKET',
                description: `Pus la vânzare: ${listing.title} (${listing.price} EUR)`,
                location: '999.md'
            });
        });
    }

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 4. Market Pricing (Calculated from REAL active ads if found)
    const validPrices = marketListings.map((l: any) => parseFloat(l.price)).filter((p: number) => !isNaN(p) && p > 0);
    const calculatedAvg = validPrices.length > 0
        ? Math.round(validPrices.reduce((a: number, b: number) => a + b, 0) / validPrices.length)
        : 0; // Returns 0 if no local ads found

    return {
        vin: cleanVin,
        make: findNHTSA('Make') || 'Unknown',
        model: findNHTSA('Model') || 'Unknown',
        year: findNHTSA('Model Year') || 'N/A',
        specs,
        allSpecs: extended ? allSpecs : undefined,
        nationalData: mdData.success ? mdData : null,
        marketData: {
            averagePrice: calculatedAvg,
            currency: 'EUR',
            listings: marketListings
        },
        history
    };
}
