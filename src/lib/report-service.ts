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
        vinaudit: Record<string, any> | null;
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

function translateValue(map: Record<string, string>, value: string | null | undefined): string | undefined {
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

    // 1. Run Aggregator FIRST (It handles RDW, DVSA, NHTSA logic centrally)
    const aggregatorRes = await import('./vin-aggregator/aggregator')
        .then(m => m.aggregateVinData(cleanVin))
        .catch(() => null);

    // 2. Fetch locally relevant data (Moldova & Market) in parallel
    const [mdData, marketListings] = await Promise.all([
        import('./mconnect').then(m => m.getNationalReportData(cleanVin)),
        search999md(cleanVin)
    ]);

    // 3. Determine Identity (Source of Truth Priority: RDW > DVSA > NHTSA)
    let vehicleIdentity = {
        make: aggregatorRes?.identity?.make,
        model: aggregatorRes?.identity?.model,
        year: aggregatorRes?.identity?.year?.toString(),
        country: aggregatorRes?.specs?.plantCountry || 'Unknown',
        fuel: aggregatorRes?.specs?.engine?.fuelType,
        engine: aggregatorRes?.specs?.engine?.displacement ? `${aggregatorRes.specs.engine.displacement}L` : null,
        hp: aggregatorRes?.specs?.engine?.hp,
        body: aggregatorRes?.identity?.bodyClass,
        drive: aggregatorRes?.specs?.drivetrain,
        trans: aggregatorRes?.specs?.transmission?.style
    };

    // Fallback/Enhancement logic:
    // Priority 1: Netherlands (RDW)
    if ((!vehicleIdentity.make || vehicleIdentity.make === 'Unknown') && aggregatorRes?.rdwData?.brand) {
        vehicleIdentity.make = aggregatorRes.rdwData.brand;
        vehicleIdentity.model = aggregatorRes.rdwData.model;
        vehicleIdentity.year = aggregatorRes.rdwData.firstRegistration?.substring(0, 4);
        vehicleIdentity.country = 'NETHERLANDS';
        vehicleIdentity.fuel = aggregatorRes.rdwData.fuel;
    }

    // Priority 2: UK (DVSA)
    if ((!vehicleIdentity.make || vehicleIdentity.make === 'Unknown') && aggregatorRes?.motHistory) {
        // aggregatorRes.raw.dvsa contains the detailed UK data
        const dvsa = aggregatorRes.raw?.dvsa;
        if (dvsa) {
            vehicleIdentity.make = dvsa.make;
            vehicleIdentity.model = dvsa.model;
            vehicleIdentity.year = dvsa.firstUsedDate?.substring(0, 4) || dvsa.registrationDate?.substring(0, 4);
            vehicleIdentity.country = 'UNITED KINGDOM';
            vehicleIdentity.fuel = dvsa.fuelType;
        }
    }

    // Nhtsa Raw for deep specs mapping (legacy support)
    const nhtsaRaw = aggregatorRes?.raw?.nhtsa || {};
    const findNHTSA = (v: string) => {
        if (nhtsaRaw.Results) {
            return nhtsaRaw.Results.find((r: any) => r.Variable === v)?.Value;
        }
        return null;
    };

    // Specs Map
    const specs: Record<string, string> = {
        'Țară Origine': translateValue(COUNTRY_RO, vehicleIdentity.country) || 'N/A',
        'Motor': vehicleIdentity.engine || (aggregatorRes?.rdwData?.cylinderCapacity ? `${aggregatorRes.rdwData.cylinderCapacity} cc` : 'N/A'),
        'Putere (CP)': vehicleIdentity.hp ? `${vehicleIdentity.hp} CP` : (aggregatorRes?.rdwData?.powerKw ? `${Math.round(aggregatorRes.rdwData.powerKw * 1.341)} CP` : 'N/A'),
        'Combustibil': translateValue(FUEL_TYPE_RO, vehicleIdentity.fuel) || 'N/A',
        'Caroserie': translateValue(BODY_CLASS_RO, vehicleIdentity.body) || (aggregatorRes?.rdwData?.bodyType || 'N/A'),
        'Tracțiune': translateValue(DRIVE_TYPE_RO, vehicleIdentity.drive) || 'N/A',
        'Transmisie': translateValue(TRANSMISSION_RO, vehicleIdentity.trans) || 'N/A',
        'An Fabricație': vehicleIdentity.year || 'N/A',
    };

    // Extended specs (if NHTSA is present)
    let allSpecs: Record<string, string> = {};
    if (extended && nhtsaRaw.Results) {
        nhtsaRaw.Results.forEach((r: any) => {
            if (r.Value && !['Not Applicable', 'N/A', '', '0'].includes(r.Value)) {
                allSpecs[r.Variable] = r.Value;
            }
        });
        // Translations...
        if (allSpecs['Fuel Type - Primary']) allSpecs['Fuel Type - Primary'] = translateValue(FUEL_TYPE_RO, allSpecs['Fuel Type - Primary']) || allSpecs['Fuel Type - Primary'];
        if (allSpecs['Body Class']) allSpecs['Body Class'] = translateValue(BODY_CLASS_RO, allSpecs['Body Class']) || allSpecs['Body Class'];
        if (allSpecs['Drive Type']) allSpecs['Drive Type'] = translateValue(DRIVE_TYPE_RO, allSpecs['Drive Type']) || allSpecs['Drive Type'];
        if (allSpecs['Transmission Style']) allSpecs['Transmission Style'] = translateValue(TRANSMISSION_RO, allSpecs['Transmission Style']) || allSpecs['Transmission Style'];
        if (allSpecs['Plant Country']) allSpecs['Plant Country'] = translateValue(COUNTRY_RO, allSpecs['Plant Country']) || allSpecs['Plant Country'];
    }

    // 3. Timeline Construction
    const history: any[] = [];

    // UK MOT Events
    if (aggregatorRes?.motHistory?.testResults) {
        aggregatorRes.motHistory.testResults.forEach((test: any) => {
            history.push({
                date: test.date,
                type: test.result === 'PASSED' ? 'ITP (UK)' : 'ITP EȘUAT (UK)',
                description: [
                    `Inspecție tehnică în Marea Britanie: ${test.result}`,
                    test.mileage ? `Kilometraj: ${test.mileage} mile (~${Math.round(test.mileage * 1.609)} KM)` : null,
                    test.failures?.length ? `Eșecuri: ${test.failures.join(', ')}` : null,
                    test.advisories?.length ? `Observații: ${test.advisories.join(', ')}` : null
                ].filter(Boolean).join(' | '),
                location: 'Marea Britanie',
                details: {
                    failures: test.failures,
                    advisories: test.advisories,
                    mileage: test.mileage
                }
            });
        });
    }

    // Global Databases (VinAudit)
    if (aggregatorRes?.raw?.vinaudit) {
        const va = aggregatorRes.raw.vinaudit;

        // Theft Records
        if (va.theftRecords && va.theftRecords.length > 0) {
            va.theftRecords.forEach((record: any) => {
                history.push({
                    date: record.date || new Date().toISOString().split('T')[0],
                    type: 'ALERTA FURT (GLOBAL)',
                    description: `Înregistrare furt detectată: ${record.description || 'Fără detalii'}`,
                    location: record.region || 'Global',
                    isAlert: true
                });
            });
        }

        // Salvage / Auction Records
        if (va.auctionHistory && va.auctionHistory.length > 0) {
            va.auctionHistory.forEach((record: any) => {
                history.push({
                    date: record.date || record.disposition_date || '',
                    type: 'LICITAȚIE SALVARE',
                    description: `Vehicul vândut la licitație de salvare. Daune raportate: ${record.damage || 'Daune majore'} | Odometer: ${record.odometer_reading || 'N/A'}`,
                    location: record.state || 'Global',
                    isWarning: true
                });
            });
        }

        // Junk Records
        if (va.junk && va.junk.length > 0) {
            va.junk.forEach((record: any) => {
                history.push({
                    date: record.date || record.disposition_date || '',
                    type: 'CASARE / JUNK',
                    description: `Vehicul declarat daună totală/casat. Entitate: ${record.entity_name || 'N/A'}`,
                    location: record.state || 'Global',
                    isAlert: true
                });
            });
        }
    }

    // RDW Events (Netherlands)
    if (aggregatorRes?.rdwData) {
        const rdw = aggregatorRes.rdwData;
        if (rdw.firstRegistration) {
            history.push({
                date: rdw.firstRegistration,
                type: 'ÎNMATRICULARE',
                description: `Prima înmatriculare (Globală): ${rdw.firstRegistration}`,
                location: 'Olanda'
            });
        }
        if (rdw.firstRegistrationNL && rdw.firstRegistrationNL !== rdw.firstRegistration) {
            history.push({
                date: rdw.firstRegistrationNL,
                type: 'IMPORT',
                description: `Înregistrată în Olanda`,
                location: 'Olanda'
            });
        }
        if (rdw.apkExpiry) {
            history.push({
                date: rdw.apkExpiry,
                type: 'ITP / APK',
                description: `Expirare Inspecție Tehnică (APK)`,
                location: 'Olanda'
            });
        }
        if (rdw.recalled) {
            history.push({
                date: new Date().toISOString().split('T')[0],
                type: 'RECALL',
                description: `Există rechemări oficiale active pentru acest vehicul`,
                location: 'RDW'
            });
        }
    }

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

    // 4. Market Pricing
    const validPrices = marketListings.map((l: any) => parseFloat(l.price)).filter((p: number) => !isNaN(p) && p > 0);
    const calculatedAvg = validPrices.length > 0
        ? Math.round(validPrices.reduce((a: number, b: number) => a + b, 0) / validPrices.length)
        : (aggregatorRes?.rdwData?.cataloguePrice ? parseInt(aggregatorRes.rdwData.cataloguePrice.replace(/\D/g, '')) : 0);

    return {
        vin: cleanVin,
        make: vehicleIdentity.make || 'Unknown',
        model: vehicleIdentity.model || 'Unknown',
        year: vehicleIdentity.year || 'N/A',
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
