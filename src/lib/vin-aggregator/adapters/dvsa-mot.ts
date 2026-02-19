import { IVinDataSource } from '../types';

/**
 * UK DVSA MOT History API Adapter
 *
 * HOW TO GET AN API KEY (FREE):
 * 1. Go to: https://developer-portal.driver-vehicle-licensing.api.gov.uk/
 * 2. Register a free account
 * 3. Subscribe to "MOT History API" (free tier: 500 requests/day)
 * 4. Your API key goes to: process.env.UK_DVSA_KEY
 *
 * ENDPOINT: https://history.mot.api.gov.uk/v1/trade/vehicles/registration/{registration}
 * NOTE: This API works by LICENSE PLATE (registration number), not by VIN directly.
 * For UK vehicles, users should enter the UK license plate.
 * Some UK vehicles can also be found by VIN via the /vin endpoint if the provider supports it.
 *
 * DATA: MOT pass/fail dates, mileage at each test, failure reasons, advisories.
 */
export class DvsaMotAdapter implements IVinDataSource {
    name = 'UK DVSA MOT History API';

    async fetchData(vin: string): Promise<Record<string, any> | null> {
        const apiKey = process.env.UK_DVSA_KEY;

        if (!apiKey) {
            console.log('[DvsaMotAdapter] UK_DVSA_KEY not set — skipping adapter.');
            return null;
        }

        try {
            // Try VIN-based lookup first (DVSA supports this via the /vin endpoint)
            const res = await fetch(
                `https://history.mot.api.gov.uk/v1/trade/vehicles/vin/${encodeURIComponent(vin)}`,
                {
                    headers: {
                        Accept: 'application/json+v6',
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(7500),
                }
            );

            if (!res.ok) {
                // 404 = vehicle not registered in UK, not an error
                if (res.status === 404) return null;
                console.warn('[DvsaMotAdapter] Response not OK:', res.status);
                return null;
            }

            const vehicles: any[] = await res.json();
            if (!vehicles || vehicles.length === 0) return null;

            // Take the most relevant vehicle (first result)
            const vehicle = vehicles[0];
            const motTests = (vehicle.motTests || []).map((test: any) => ({
                date: test.completedDate || test.motTestDate || '',
                result: test.testResult === 'PASSED' ? 'PASSED' : 'FAILED',
                mileage: test.odometerValue ? parseInt(test.odometerValue, 10) : 0,
                failures: (test.rfrAndComments || [])
                    .filter((c: any) => c.type === 'FAIL' || c.type === 'MAJOR' || c.type === 'DANGEROUS')
                    .map((c: any) => c.text || c.comment || ''),
                advisories: (test.rfrAndComments || [])
                    .filter((c: any) => c.type === 'ADVISORY' || c.type === 'MINOR')
                    .map((c: any) => c.text || c.comment || ''),
            }));

            const latestPassed = motTests.find((t: any) => t.result === 'PASSED');

            return {
                registration: vehicle.registration || null,
                latestMileage: latestPassed?.mileage ?? null,
                motExpiry: vehicle.motTestExpiryDate || null,
                testResults: motTests.slice(0, 10), // Return up to 10 historical tests
            };
        } catch (err) {
            console.error('[DvsaMotAdapter] Error:', err);
            return null;
        }
    }
}
