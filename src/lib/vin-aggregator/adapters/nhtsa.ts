import { IVinDataSource } from '../types';

/**
 * NHTSA vPIC (Vehicle Product Information Catalog) Adapter
 * Endpoint: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/[VIN]?format=json
 * Recalls: https://api.nhtsa.gov/recalls/recallsByVehicle
 *
 * 100% FREE — no API key required. No rate limits published.
 * Returns: full spec decode + recall history for that make/model/year.
 */
export class NhtsaAdapter implements IVinDataSource {
    name = 'US NHTSA Recall & Spec Database';

    async fetchData(vin: string): Promise<Record<string, any> | null> {
        try {
            const decodeUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`;

            const res = await fetch(decodeUrl, {
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(7500),
                next: { revalidate: 86400 }, // cache 24h — specs don't change
            });

            if (!res.ok) return null;

            const json = await res.json();
            const r = json.Results?.[0];
            if (!r || !r.Make) return null;

            const make = r.Make || null;
            const model = r.Model || null;
            const year = r.ModelYear ? parseInt(r.ModelYear, 10) : null;

            // Fetch recalls concurrently — if it fails, we just return empty array
            let recalls: any[] = [];
            if (make && model && year) {
                try {
                    const recallUrl =
                        `https://api.nhtsa.gov/recalls/recallsByVehicle?` +
                        `modelYear=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;

                    const recallRes = await fetch(recallUrl, {
                        signal: AbortSignal.timeout(5000),
                        next: { revalidate: 86400 },
                    });

                    if (recallRes.ok) {
                        const recallJson = await recallRes.json();
                        recalls = (recallJson.results || []).slice(0, 15).map((rc: any) => ({
                            campaign: rc.NHTSACampaignNumber || '',
                            component: rc.Component || '',
                            summary: rc.Summary || '',
                            consequence: rc.Consequence || null,
                            remedy: rc.Remedy || null,
                        }));
                    }
                } catch {
                    /* recall fetch is non-critical */
                }
            }

            return {
                make,
                model,
                year,
                trim: r.Trim || null,
                bodyClass: r.BodyClass || null,
                vehicleType: r.VehicleType || null,
                series: r.Series || null,

                engine: {
                    displacement: r['Displacement (L)'] || null,
                    cylinders: r['Engine Number of Cylinders']
                        ? parseInt(r['Engine Number of Cylinders'], 10)
                        : null,
                    hp: r['Engine HP'] ? parseFloat(r['Engine HP']) : null,
                    fuelType: r['Fuel Type - Primary'] || null,
                    configuration: r['Engine Configuration'] || null,
                    turbo: r['Turbo'] || null,
                },

                transmission: {
                    style: r['Transmission Style'] || null,
                    speeds: r['Transmission Speeds']
                        ? parseInt(r['Transmission Speeds'], 10)
                        : null,
                },

                drivetrain: r['Drive Type'] || null,
                plantCountry: r['Plant Country'] || null,
                plantCity: r['Plant City'] || null,
                manufacturer: r['Manufacturer Name'] || null,
                gvwr: r['GVWR'] || null,
                doors: r['Doors'] ? parseInt(r['Doors'], 10) : null,
                seats: r['Seat Rows'] ? parseInt(r['Seat Rows'], 10) * 2 : null,

                airbagLocations: r['Air Bag Loc Front'] || null,
                abs: r['Anti-lock Braking System (ABS)'] || null,
                esc: r['Electronic Stability Control (ESC)'] || null,
                tpms: r['Tire Pressure Monitoring System (TPMS) Type'] || null,

                recalls,
            };
        } catch (err) {
            console.error('[NhtsaAdapter] Error:', err);
            return null;
        }
    }
}
