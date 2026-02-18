const getApiKey = () => process.env.VINAUDIT_API_KEY || 'VA_DEMO_KEY';

// Mock data for a stable demo experience with VA_DEMO_KEY
const MOCK_VEHICLES: Record<string, any> = {
    '1NXBR32E85Z505904': { year: '2005', make: 'Toyota', model: 'Corolla CE', success: true },
    '1VXBR12EXCP901214': { year: '2005', make: 'Toyota', model: 'Corolla', success: true },
    '5J8TC1H38KL003076': { year: '2019', make: 'Acura', model: 'RDX', success: true },
    '1FTFW1RG2LFA00001': { year: '2020', make: 'Ford', model: 'F-150', success: true },
    '2T1BURHE3EC020936': { year: '2014', make: 'Toyota', model: 'Corolla S', success: true }
};

export interface VinAuditQueryResponse {
    vin: string;
    id: string;
    attributes: {
        vin: string;
        year: string;
        make: string;
        model: string;
        trim?: string;
        style?: string;
        engine?: string;
        made_in?: string;
        type?: string;
    };
    success: boolean;
    error?: string;
    error_message?: string;
}

export async function getSpecifications(vin: string) {
    const key = getApiKey();
    const url = `https://specifications.vinaudit.com/v3/specifications?format=json&key=${key}&vin=${vin}`;
    const response = await fetch(url);
    return response.json();
}

/**
 * Higher-level function to perform a full VIN scan for the free tier (Step 2)
 */
export async function getFreeVinData(vin: string) {
    const cleanVin = vin.toUpperCase().trim();
    const key = getApiKey();

    console.log(`[VinAudit] Scanning VIN: ${cleanVin} (Key: ${key})`);

    // 1. If it's a known demo VIN and we are in demo mode, return mock data for stability
    if (key === 'VA_DEMO_KEY' && MOCK_VEHICLES[cleanVin]) {
        console.log(`[VinAudit] Returning MOCK data for stable demo.`);
        return {
            ...MOCK_VEHICLES[cleanVin],
            vin: cleanVin,
            id: `demo_${cleanVin}`
        };
    }

    try {
        // 2. Try the real Specifications API
        const specs = await getSpecifications(cleanVin);

        if (specs.success && specs.attributes) {
            return {
                success: true,
                year: specs.attributes.year || specs.year,
                make: specs.attributes.make || specs.make,
                model: specs.attributes.model || specs.model,
                vin: cleanVin,
                id: specs.id
            };
        }

        // 3. Last resort for demo: if API rejected us but we want to SHOW something
        if (key === 'VA_DEMO_KEY') {
            return {
                success: false,
                error: "Acest VIN nu este disponibil în modul DEMO. Te rugăm să folosești un VIN de test sau o cheie API reală."
            };
        }

        return {
            success: false,
            error: specs.error_message || 'Vehicle not found'
        };
    } catch (error) {
        console.error('VinAudit Global Error:', error);
        return { success: false, error: 'Failed to connect to VinAudit' };
    }
}
