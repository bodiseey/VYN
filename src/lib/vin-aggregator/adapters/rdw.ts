import { IVinDataSource } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Netherlands RDW Open Data Adapter — Production Ready
//
// API: https://opendata.rdw.nl/resource/m9d7-ebf2.json (Socrata SODA API)
// Auth: X-App-Token header → env RDW_APP_TOKEN  (avoids 1000 req/hr anon limit)
//       Secret Token     → env RDW_SECRET_TOKEN (for write access, not needed here)
//
// Primary Key: kenteken (Dutch license plate) — NOT VIN
// VIN mode: VinScanner passes 17-char VIN → adapter skips gracefully (returns null)
// Plate mode: User provides Dutch plate (e.g. "12-ABC-3") → full data returned
//
// Datasets used:
//   m9d7-ebf2  — Gekentekende voertuigen (registered vehicles — main dataset)
//   j9yg-7rg5  — Terugroepacties (recalls per kenteken)
//   a34c-vvps  — Defecten (defects/damage reports)
// ─────────────────────────────────────────────────────────────────────────────

const RDW_BASE = 'https://opendata.rdw.nl/resource';

/** Normalize Dutch plate: '12-ABC-3' → '12ABC3', 'ab 12 cd' → 'AB12CD' */
function normalizePlate(input: string): string {
    return input.toUpperCase().replace(/[\s\-\.]/g, '');
}

/**
 * Heuristic: is this input a Dutch license plate (not a VIN)?
 * Dutch plates: 4–8 chars after normalization, always mix of letters + digits.
 * VINs: exactly 17 alphanumeric chars.
 */
function isDutchPlate(input: string): boolean {
    const clean = normalizePlate(input);
    if (clean.length === 17) return false; // Almost certainly a VIN
    if (clean.length < 4 || clean.length > 8) return false;
    return /[A-Z]/.test(clean) && /[0-9]/.test(clean);
}

/**
 * Format RDW raw date strings:
 *  "20180315" → "2018-03-15"
 *  "20231231" → "2023-12-31"
 */
function formatRdwDate(raw: string | undefined): string | null {
    if (!raw || raw.length < 8) return null;
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

/**
 * Format RDW currency: "2499500" → "24995.00" (stored in cents)
 * RDW stores catalogusprijs in eurocents (no decimals in raw)
 */
function formatPrice(raw: string | undefined): number | null {
    if (!raw) return null;
    const n = parseInt(raw, 10);
    if (isNaN(n) || n === 0) return null;
    // RDW stores in whole euros (NOT cents despite looking large)
    return n;
}

export class RdwAdapter implements IVinDataSource {
    name = 'Netherlands RDW Open Data';

    private get appToken(): string {
        return process.env.RDW_APP_TOKEN || '';
    }

    private headers(): HeadersInit {
        const h: Record<string, string> = { Accept: 'application/json' };
        if (this.appToken) h['X-App-Token'] = this.appToken;
        return h;
    }

    async fetchData(input: string): Promise<Record<string, any> | null> {
        // Only process Dutch license plates — skip VINs gracefully
        if (!isDutchPlate(input)) {
            return null;
        }

        const plate = normalizePlate(input);
        console.log(`[RdwAdapter] Querying RDW for plate: ${plate}`);

        try {
            return await this.fetchByPlate(plate);
        } catch (err) {
            console.error('[RdwAdapter] Error:', err);
            return null;
        }
    }

    async fetchByPlate(plate: string): Promise<Record<string, any> | null> {
        const normalizedPlate = normalizePlate(plate);

        // ── 1. Main vehicle dataset ───────────────────────────────────────────
        const vehicleUrl =
            `${RDW_BASE}/m9d7-ebf2.json?kenteken=${normalizedPlate}&$limit=1`;

        const vehicleRes = await fetch(vehicleUrl, {
            headers: this.headers(),
            signal: AbortSignal.timeout(7000),
            next: { revalidate: 3600 }, // cache 1h — plate data doesn't change often
        });

        if (!vehicleRes.ok) {
            console.warn(`[RdwAdapter] Vehicle lookup failed: ${vehicleRes.status}`);
            return null;
        }

        const vehicles: any[] = await vehicleRes.json();
        if (!vehicles || vehicles.length === 0) {
            console.log(`[RdwAdapter] No vehicle found for plate: ${normalizedPlate}`);
            return null;
        }

        const v = vehicles[0];

        // ── 2. Recalls dataset (parallel, non-critical) ───────────────────────
        let recalled = false;
        let recallDetails: string[] = [];
        try {
            const recallUrl =
                `${RDW_BASE}/j9yg-7rg5.json?kenteken=${normalizedPlate}&$limit=5`;
            const recallRes = await fetch(recallUrl, {
                headers: this.headers(),
                signal: AbortSignal.timeout(4000),
                next: { revalidate: 3600 },
            });
            if (recallRes.ok) {
                const recalls: any[] = await recallRes.json();
                recalled = recalls.length > 0;
                recallDetails = recalls.map(r => r.code_terugroepactie || r.referentiecode_rdw || 'N/A');
            }
        } catch { /* non-critical */ }

        // ── 3. Map to UnifiedVehicleReport fields ────────────────────────────
        return {
            licensePlate: normalizedPlate,
            formattedPlate: plate, // original user input

            // Identity
            brand: v.merk || null,                          // e.g. "VOLKSWAGEN"
            model: v.handelsbenaming || null,                // e.g. "GOLF"
            vehicleType: v.voertuigsoort || null,            // e.g. "Personenauto"
            bodyType: v.inrichting || null,                  // e.g. "Hatchback"
            color: v.eerste_kleur || null,                   // e.g. "ZWART" (black)
            colorSecondary: v.tweede_kleur || null,

            // Registration
            registrationStatus: v.voertuigsoort || null,
            firstRegistration: formatRdwDate(v.datum_eerste_toelating),  // "2018-03-15"
            firstRegistrationNL: formatRdwDate(v.datum_eerste_afgifte_nederland), // When imported to NL
            numberOfPreviousOwners: v.aantal_eigenaren !== undefined
                ? parseInt(v.aantal_eigenaren, 10)
                : null,
            exportedFlag: v.exportindicator === 'Ja',        // true if exported

            // Inspection (APK = Dutch equivalent of MOT/ITP)
            apkExpiry: formatRdwDate(v.vervaldatum_apk),     // e.g. "2024-11-30"
            apkExpiryFormatted: v.vervaldatum_apk_dt || null,

            // Technical specs
            numberOfCylinders: v.aantal_cilinders ? parseInt(v.aantal_cilinders, 10) : null,
            cylinderCapacity: v.cilinderinhoud ? parseInt(v.cilinderinhoud, 10) : null, // in cc
            fuelType: v.brandstof_omschrijving || null,      // e.g. "Benzine", "Diesel"
            powerKw: v.vermogen_massarijklaar ? parseFloat(v.vermogen_massarijklaar) : null,
            numberOfDoors: v.aantal_deuren ? parseInt(v.aantal_deuren, 10) : null,
            numberOfSeats: v.aantal_zitplaatsen ? parseInt(v.aantal_zitplaatsen, 10) : null,
            massEmpty: v.massa_ledig_voertuig ? parseInt(v.massa_ledig_voertuig, 10) : null, // kg
            cataloguePrice: formatPrice(v.catalogusprijs),   // Original list price in EUR

            // Safety / environmental
            euroClass: v.euro_klasse_milieucode || null,     // e.g. "EURO 6"
            wamStatus: v.wam_verzekerd === 'Ja',             // WAM = mandatory liability insurance

            // Recalls
            recalled,
            recallCodes: recallDetails,
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Named export for direct use outside the aggregator engine
// (e.g., if user explicitly provides a Dutch plate)
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchRdwData(plate: string): Promise<Record<string, any> | null> {
    const adapter = new RdwAdapter();
    return adapter.fetchByPlate(plate);
}
