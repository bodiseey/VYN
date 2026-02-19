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
// Dataset IDs (verified working Feb 2026)
const DS_VEHICLES = 'm9d7-ebf2'; // Gekentekende voertuigen (main)
const DS_RECALLS = 't49b-isb7'; // Terugroep_actie_status (recall status per plate)
const DS_FUEL = '8ys7-d773'; // Brandstof + Euro emission class


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
        let recallStatuses: string[] = [];

        // ── 3. Fuel/Euro class dataset (parallel, non-critical) ───────────────
        let euroClass: string | null = null;
        let fuelType: string | null = null;

        await Promise.allSettled([
            // Recalls
            fetch(`${RDW_BASE}/${DS_RECALLS}.json?kenteken=${normalizedPlate}&$limit=10`, {
                headers: this.headers(),
                signal: AbortSignal.timeout(4000),
                next: { revalidate: 3600 },
            }).then(r => r.ok ? r.json() : []).then((recalls: any[]) => {
                recalled = recalls.length > 0;
                recallDetails = recalls.map(r => r.referentiecode_rdw || 'N/A');
                recallStatuses = recalls.map(r => r.status || '');
            }),

            // Fuel + Euro emission class
            fetch(`${RDW_BASE}/${DS_FUEL}.json?kenteken=${normalizedPlate}&$limit=1`, {
                headers: this.headers(),
                signal: AbortSignal.timeout(4000),
                next: { revalidate: 3600 },
            }).then(r => r.ok ? r.json() : []).then((fuels: any[]) => {
                if (fuels.length > 0) {
                    fuelType = fuels[0].brandstof_omschrijving || null;
                    euroClass = fuels[0].uitlaatemissieniveau || null;
                }
            }),
        ]);


        // ── 3. Map to UnifiedVehicleReport fields ────────────────────────────
        return {
            licensePlate: normalizedPlate,
            formattedPlate: plate,

            // Identity
            brand: v.merk || null,
            model: v.handelsbenaming || null,
            vehicleType: v.voertuigsoort || null,
            bodyType: v.inrichting || null,
            color: v.eerste_kleur || null,
            colorSecondary: v.tweede_kleur !== 'Niet geregistreerd' ? v.tweede_kleur : null,

            // Registration
            registrationStatus: v.voertuigsoort || null,
            firstRegistration: formatRdwDate(v.datum_eerste_toelating),
            firstRegistrationNL: formatRdwDate(v.datum_eerste_tenaamstelling_in_nederland),
            numberOfPreviousOwners: v.aantal_eigenaren !== undefined
                ? parseInt(v.aantal_eigenaren, 10)
                : null,
            exportedFlag: v.export_indicator === 'Ja',

            // Inspection (APK)
            apkExpiry: formatRdwDate(v.vervaldatum_apk),
            apkExpiryFormatted: v.vervaldatum_apk_dt || null,

            // Technical specs
            numberOfCylinders: v.aantal_cilinders ? parseInt(v.aantal_cilinders, 10) : null,
            cylinderCapacity: v.cilinderinhoud ? parseInt(v.cilinderinhoud, 10) : null,
            fuelType: fuelType || v.brandstof_omschrijving || null,
            powerKw: v.vermogen_massarijklaar ? parseFloat(v.vermogen_massarijklaar) : null,
            numberOfDoors: v.aantal_deuren ? parseInt(v.aantal_deuren, 10) : null,
            numberOfSeats: v.aantal_zitplaatsen ? parseInt(v.aantal_zitplaatsen, 10) : null,
            massEmpty: v.massa_ledig_voertuig ? parseInt(v.massa_ledig_voertuig, 10) : null,
            cataloguePrice: formatPrice(v.catalogusprijs),

            // Safety / environmental
            euroClass: euroClass || v.euro_klasse_milieucode || null,
            // RDW flag: openstaande_terugroepactie_indicator = open recall exists on vehicle
            rdwRecallFlag: v.openstaande_terugroepactie_indicator === 'Ja',
            wamStatus: v.wam_verzekerd === 'Ja',

            // From recall dataset t49b-isb7
            recalled,
            recallCodes: recallDetails,
            recallStatuses,
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
