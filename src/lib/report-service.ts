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
    raw?: {
        nhtsa: Record<string, any> | null;
        rdw: Record<string, any> | null;
        dvsa: Record<string, any> | null;
        scraper: Record<string, any> | null;
    };
}

// Translation maps for NHTSA values → Romanian
const FUEL_TYPE_RO: Record<string, string> = {
    'Gasoline': 'Benzină',
    'Diesel': 'Diesel',
    'Electric': 'Electric',
    'Hybrid': 'Hibrid',
    'Plug-In Hybrid': 'Hibrid Plug-In',
    'Natural Gas': 'Gaz Natural',
    'Flex Fuel (FFVS)': 'Flex Fuel',
    'Ethanol': 'Etanol',
};

const BODY_CLASS_RO: Record<string, string> = {
    'Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)': 'SUV',
    'Sport Utility Vehicle (SUV)': 'SUV',
    'Sedan/Saloon': 'Sedan',
    'Hatchback': 'Hatchback',
    'Wagon': 'Break',
    'Convertible/Cabriolet': 'Cabrio',
    'Coupe': 'Coupe',
    'Pickup': 'Pickup',
    'Van': 'Van',
    'Minivan': 'Minivan',
    'Crossover': 'Crossover',
    'Truck': 'Camion',
};

const DRIVE_TYPE_RO: Record<string, string> = {
    'FWD/Front-Wheel Drive': 'Tracțiune Față (FWD)',
    'RWD/Rear-Wheel Drive': 'Tracțiune Spate (RWD)',
    'AWD/All-Wheel Drive': 'Tracțiune Integrală (AWD)',
    '4WD/4-Wheel Drive/4x4': 'Tracțiune 4x4',
    '4WD': 'Tracțiune 4x4',
    'AWD': 'Tracțiune Integrală (AWD)',
    'FWD': 'Tracțiune Față (FWD)',
    'RWD': 'Tracțiune Spate (RWD)',
};

const TRANSMISSION_RO: Record<string, string> = {
    'Automatic': 'Automată',
    'Manual': 'Manuală',
    'CVT': 'CVT (Variator)',
    'Dual-Clutch': 'Dublu Ambreiaj (DCT)',
    'Semi-Automatic': 'Semi-Automată',
};

const COUNTRY_RO: Record<string, string> = {
    'UNITED STATES (USA)': 'SUA',
    'UNITED STATES': 'SUA',
    'CANADA': 'Canada',
    'GERMANY': 'Germania',
    'JAPAN': 'Japonia',
    'SOUTH KOREA': 'Coreea de Sud',
    'MEXICO': 'Mexic',
    'UNITED KINGDOM': 'Marea Britanie',
    'FRANCE': 'Franța',
    'ITALY': 'Italia',
    'SWEDEN': 'Suedia',
    'SPAIN': 'Spania',
    'CHINA': 'China',
    'SLOVAKIA': 'Slovacia',
    'CZECH REPUBLIC': 'Cehia',
    'HUNGARY': 'Ungaria',
    'ROMANIA': 'România',
    'TURKEY': 'Turcia',
    'INDIA': 'India',
    'BRAZIL': 'Brazilia',
    'AUSTRIA': 'Austria',
    'BELGIUM': 'Belgia',
    'NETHERLANDS': 'Olanda',
    'FINLAND': 'Finlanda',
    'AUSTRALIA': 'Australia',
    'SOUTH AFRICA': 'Africa de Sud',
};

function translateValue(map: Record<string, string>, value: string | undefined): string | undefined {
    if (!value) return undefined;
    // Try exact match first
    if (map[value]) return map[value];
    // Try case-insensitive
    const upper = value.toUpperCase();
    for (const [k, v] of Object.entries(map)) {
        if (k.toUpperCase() === upper) return v;
    }
    // Return original if no translation found
    return value;
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
    const [nhtsaRes, mdData, marketListings, aggregatorRes] = await Promise.all([
        fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVin}?format=json`).then(r => r.json()).catch(() => ({})),
        import('./mconnect').then(m => m.getNationalReportData(cleanVin)),
        search999md(cleanVin),
        import('./vin-aggregator/aggregator').then(m => m.aggregateVinData(cleanVin)).catch(() => null)
    ]);

    const results = nhtsaRes.Results || [];
    const findNHTSA = (v: string) => results.find((r: any) => r.Variable === v)?.Value;

    // 2. Technical Extraction — translated to Romanian
    const rawFuel = findNHTSA('Fuel Type - Primary');
    const rawBody = findNHTSA('Body Class');
    const rawDrive = findNHTSA('Drive Type');
    const rawTransmission = findNHTSA('Transmission Style');
    const rawCountry = findNHTSA('Plant Country');

    const specs: Record<string, string> = {
        'Țară Origine': translateValue(COUNTRY_RO, rawCountry) || 'N/A',
        'Motor': findNHTSA('Displacement (L)') ? `${findNHTSA('Displacement (L)')}L ${findNHTSA('Engine Number of Cylinders') || ''} Cil.` : 'N/A',
        'Putere (CP)': findNHTSA('Engine HP') ? `${findNHTSA('Engine HP')} CP` : 'N/A',
        'Combustibil': translateValue(FUEL_TYPE_RO, rawFuel) || 'N/A',
        'Caroserie': translateValue(BODY_CLASS_RO, rawBody) || 'N/A',
        'Tracțiune': translateValue(DRIVE_TYPE_RO, rawDrive) || 'N/A',
        'Transmisie': translateValue(TRANSMISSION_RO, rawTransmission) || 'N/A',
        'An Fabricație': findNHTSA('Model Year') || 'N/A',
    };

    // Extended specs — translate known values
    let allSpecs: Record<string, string> = {};
    if (extended) {
        results.forEach((r: any) => {
            if (r.Value && !['Not Applicable', 'N/A', '', '0'].includes(r.Value)) {
                allSpecs[r.Variable] = r.Value;
            }
        });
        // Apply translations to extended specs too
        if (allSpecs['Fuel Type - Primary']) allSpecs['Fuel Type - Primary'] = translateValue(FUEL_TYPE_RO, allSpecs['Fuel Type - Primary']) || allSpecs['Fuel Type - Primary'];
        if (allSpecs['Body Class']) allSpecs['Body Class'] = translateValue(BODY_CLASS_RO, allSpecs['Body Class']) || allSpecs['Body Class'];
        if (allSpecs['Drive Type']) allSpecs['Drive Type'] = translateValue(DRIVE_TYPE_RO, allSpecs['Drive Type']) || allSpecs['Drive Type'];
        if (allSpecs['Transmission Style']) allSpecs['Transmission Style'] = translateValue(TRANSMISSION_RO, allSpecs['Transmission Style']) || allSpecs['Transmission Style'];
        if (allSpecs['Plant Country']) allSpecs['Plant Country'] = translateValue(COUNTRY_RO, allSpecs['Plant Country']) || allSpecs['Plant Country'];
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

    // Market Presence — only add to history if found
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

    // 4. Market Pricing
    const validPrices = marketListings.map((l: any) => parseFloat(l.price)).filter((p: number) => !isNaN(p) && p > 0);
    const calculatedAvg = validPrices.length > 0
        ? Math.round(validPrices.reduce((a: number, b: number) => a + b, 0) / validPrices.length)
        : 0;

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
        history,
        raw: aggregatorRes?.raw
    };
}
