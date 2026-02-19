import { IVinDataSource } from '../types';

/**
 * Netherlands RDW Open Data Adapter
 *
 * HOW TO ACCESS (FREE, NO KEY REQUIRED):
 * SODA API: https://opendata.rdw.nl/
 * Dataset "Gekentekende voertuigen": https://opendata.rdw.nl/resource/m9d7-ebf2.json
 *
 * NOTE ON VIN vs KENTEKEN (LICENSE PLATE):
 *   RDW's primary identifier is the Dutch license plate (kenteken), NOT the VIN.
 *   This adapter supports TWO modes:
 *   1. If `vin` looks like a Dutch license plate (e.g. "AB-123-C"), search by kenteken.
 *   2. For actual VINs, we cannot directly query RDW — this adapter returns null.
 *      In production, prompt users who say "Dutch import" to also provide the plate.
 *
 * DATA: registration status, first registration date, APK (inspection) expiry, fuel, brand, recall flag.
 */
export class RdwAdapter implements IVinDataSource {
    name = 'Netherlands RDW Open Data';

    /** Rough heuristic: Dutch plates don't pass VIN length/char rules */
    private isDutchPlate(input: string): boolean {
        // Dutch plates are 6–8 chars, often contain hyphens
        const clean = input.replace(/-/g, '').toUpperCase();
        return clean.length >= 4 && clean.length <= 8 && /[A-Z]/.test(clean) && /[0-9]/.test(clean);
    }

    async fetchData(vin: string): Promise<Record<string, any> | null> {
        // VIN is 17 chars — RDW works on license plate. Skip unless it's a plate.
        // This adapter will be triggered in the future when user provides a plate separately.
        if (!this.isDutchPlate(vin)) {
            return null; // graceful skip — not a plate
        }

        const plate = vin.replace(/-/g, '').toUpperCase();

        try {
            const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${plate}&$limit=1`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(7000),
                next: { revalidate: 3600 },
            });

            if (!res.ok) return null;

            const data: any[] = await res.json();
            if (!data || data.length === 0) return null;

            const v = data[0];

            // Also check for recalls via the recall dataset
            let recalled: boolean | null = null;
            try {
                const recallUrl = `https://opendata.rdw.nl/resource/j9yg-7rg5.json?kenteken=${plate}&$limit=1`;
                const recallRes = await fetch(recallUrl, { signal: AbortSignal.timeout(4000) });
                if (recallRes.ok) {
                    const recallData: any[] = await recallRes.json();
                    recalled = recallData.length > 0;
                }
            } catch { /* ignore */ }

            return {
                licensePlate: plate,
                registrationStatus: v.voertuigsoort || null,
                brand: v.merk || null,
                fuel: v.brandstof_omschrijving || null,
                firstRegistration: v.datum_eerste_toelating
                    ? `${v.datum_eerste_toelating.slice(0, 4)}-${v.datum_eerste_toelating.slice(4, 6)}-${v.datum_eerste_toelating.slice(6, 8)}`
                    : null,
                apkExpiry: v.vervaldatum_apk
                    ? `${v.vervaldatum_apk.slice(0, 4)}-${v.vervaldatum_apk.slice(4, 6)}-${v.vervaldatum_apk.slice(6, 8)}`
                    : null,
                recalled,
            };
        } catch (err) {
            console.error('[RdwAdapter] Error:', err);
            return null;
        }
    }
}
