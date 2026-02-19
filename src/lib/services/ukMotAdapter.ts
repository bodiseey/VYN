/**
 * UK DVSA MOT History API Adapter (OAuth2 Version)
 * 
 * Handles authentication via Microsoft Entra ID (Azure AD) and 
 * retrieves MOT history data from the official UK Government API.
 */

export interface UkMotTest {
    date: string;
    result: 'PASSED' | 'FAILED';
    mileage: number;
    failures: string[];
    advisories: string[];
}

export interface UkVehicleData {
    registration: string | null;
    make: string | null;
    model: string | null;
    firstUsedDate: string | null;
    fuelType: string | null;
    primaryColour: string | null;
    registrationDate: string | null;
    motExpiry: string | null;
    latestMileage: number | null;
    testResults: UkMotTest[];
}

export class UkMotAdapter {
    private static accessToken: string | null = null;
    private static tokenExpiry: number = 0;

    private static async getAccessToken(): Promise<string | null> {
        // Return cached token if still valid (minus 2 minutes buffer)
        if (this.accessToken && Date.now() < this.tokenExpiry - 120000) {
            return this.accessToken;
        }

        const clientId = process.env.DVSA_CLIENT_ID;
        const clientSecret = process.env.DVSA_CLIENT_SECRET;
        const tenantId = process.env.DVSA_TENANT_ID || '66966113-1b9c-4f7f-85d8-793574d6c4e7';

        if (!clientId || !clientSecret) {
            console.error('[UkMotAdapter] Missing DVSA credentials');
            return null;
        }

        try {
            const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('scope', 'https://tapi.dvsa.gov.uk/.default');

            const res = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`Failed to get DVSA token: ${res.status} - ${errBody}`);
            }

            const data = await res.json();
            this.accessToken = data.access_token;
            // expires_in is in seconds
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);

            return this.accessToken;
        } catch (err) {
            console.error('[UkMotAdapter] Token error:', err);
            return null;
        }
    }

    /**
     * Fetch MOT history by registration (license plate)
     */
    async fetchData(registration: string): Promise<UkVehicleData | null> {
        const token = await UkMotAdapter.getAccessToken();
        const apiKey = process.env.DVSA_API_KEY;

        if (!token || !apiKey) return null;

        const cleanReg = registration.replace(/\s/g, '').toUpperCase();

        try {
            const url = `https://tapi.dvsa.gov.uk/v1/trade/vehicles/registration/${encodeURIComponent(cleanReg)}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-API-Key': apiKey,
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) {
                if (res.status === 404) return null;
                console.error(`[UkMotAdapter] API error: ${res.status}`);
                return null;
            }

            const vehicles: any[] = await res.json();
            if (!vehicles || vehicles.length === 0) return null;

            const v = vehicles[0];

            // Map the results to our internal interface
            const testResults: UkMotTest[] = (v.motTests || []).map((test: any) => ({
                date: test.completedDate || '',
                result: test.testResult === 'PASSED' ? 'PASSED' : 'FAILED',
                mileage: test.odometerValue ? parseInt(test.odometerValue, 10) : 0,
                failures: (test.rfrAndComments || [])
                    .filter((c: any) => c.type === 'FAIL' || c.type === 'MAJOR' || c.type === 'DANGEROUS')
                    .map((c: any) => c.text || c.comment || ''),
                advisories: (test.rfrAndComments || [])
                    .filter((c: any) => c.type === 'ADVISORY' || c.type === 'MINOR')
                    .map((c: any) => c.text || c.comment || ''),
            }));

            const latestPassed = testResults.find(t => t.result === 'PASSED');

            return {
                registration: v.registration || null,
                make: v.make || null,
                model: v.model || null,
                firstUsedDate: v.firstUsedDate || null,
                fuelType: v.fuelType || null,
                primaryColour: v.primaryColour || null,
                registrationDate: v.registrationDate || null,
                motExpiry: v.motTestExpiryDate || null,
                latestMileage: latestPassed?.mileage || null,
                testResults: testResults
            };
        } catch (err) {
            console.error('[UkMotAdapter] Fetch error:', err);
            return null;
        }
    }

    /**
     * Fetch MOT history by VIN
     */
    async fetchDataByVin(vin: string): Promise<UkVehicleData | null> {
        const token = await UkMotAdapter.getAccessToken();
        const apiKey = process.env.DVSA_API_KEY;

        if (!token || !apiKey) return null;

        try {
            const url = `https://tapi.dvsa.gov.uk/v1/trade/vehicles/vin/${encodeURIComponent(vin)}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-API-Key': apiKey,
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) {
                if (res.status === 404) return null;
                return null;
            }

            const vehicles: any[] = await res.json();
            if (!vehicles || vehicles.length === 0) return null;

            // Same mapping logic... (could be refactored)
            const v = vehicles[0];
            const testResults: UkMotTest[] = (v.motTests || []).map((test: any) => ({
                date: test.completedDate || '',
                result: test.testResult === 'PASSED' ? 'PASSED' : 'FAILED',
                mileage: test.odometerValue ? parseInt(test.odometerValue, 10) : 0,
                failures: (test.rfrAndComments || [])
                    .filter((c: any) => c.type === 'FAIL' || c.type === 'MAJOR' || c.type === 'DANGEROUS')
                    .map((c: any) => c.text || c.comment || ''),
                advisories: (test.rfrAndComments || [])
                    .filter((c: any) => c.type === 'ADVISORY' || c.type === 'MINOR')
                    .map((c: any) => c.text || c.comment || ''),
            }));

            const latestPassed = testResults.find(t => t.result === 'PASSED');

            return {
                registration: v.registration || null,
                make: v.make || null,
                model: v.model || null,
                firstUsedDate: v.firstUsedDate || null,
                fuelType: v.fuelType || null,
                primaryColour: v.primaryColour || null,
                registrationDate: v.registrationDate || null,
                motExpiry: v.motTestExpiryDate || null,
                latestMileage: latestPassed?.mileage || null,
                testResults: testResults
            };
        } catch (err) {
            return null;
        }
    }
}
