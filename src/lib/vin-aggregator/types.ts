import { z } from 'zod';

// ─────────────────────────────────────────
// 1. Strict VIN Validation
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// 1. Input Validation (VIN or License Plate)
// ─────────────────────────────────────────
export const VinSchema = z.string()
    .transform(s => s.toUpperCase().replace(/[\s-]/g, '')) // Remove spaces and dashes
    .refine((val) => {
        const len = val.length;
        // Case A: VIN (17 chars, no I/O/Q usuall, but we allow simple length check here)
        const isVin = len === 17;
        // Case B: Dutch Plate (4-8 chars usually)
        const isPlate = len >= 4 && len <= 8 && /^[A-Z0-9]+$/.test(val);

        return isVin || isPlate;
    }, {
        message: "Input must be a valid 17-character VIN or a Dutch License Plate (4-8 chars)."
    });

export type ValidVin = z.infer<typeof VinSchema>;

// ─────────────────────────────────────────
// 2. Adapter Interface
// ─────────────────────────────────────────
export interface IVinDataSource {
    /** Human-readable name shown in the UI scanner */
    name: string;
    /** Fetch raw data for the given VIN. Returns null on failure — never throws. */
    fetchData(vin: string): Promise<Record<string, any> | null>;
}

// ─────────────────────────────────────────
// 3. Unified Vehicle Report Schema
// ─────────────────────────────────────────

const RecallSchema = z.object({
    campaign: z.string(),
    component: z.string(),
    summary: z.string(),
    consequence: z.string().nullable(),
    remedy: z.string().nullable(),
});

const MotTestSchema = z.object({
    date: z.string(),
    result: z.enum(['PASSED', 'FAILED']),
    mileage: z.number(),
    failures: z.array(z.string()),
    advisories: z.array(z.string()),
});

const SourceStatusSchema = z.object({
    name: z.string(),
    status: z.enum(['success', 'failed', 'timeout', 'stub', 'skipped']),
    durationMs: z.number(),
    note: z.string().optional(),
});

export const UnifiedVehicleReportSchema = z.object({
    vin: z.string(),
    fetchedAt: z.string(),

    /** Core vehicle identity */
    identity: z.object({
        make: z.string().nullable(),
        model: z.string().nullable(),
        year: z.number().nullable(),
        trim: z.string().nullable(),
        bodyClass: z.string().nullable(),
        vehicleType: z.string().nullable(),
        series: z.string().nullable(),
    }),

    /** Technical specifications */
    specs: z.object({
        engine: z.object({
            displacement: z.string().nullable(),
            cylinders: z.number().nullable(),
            hp: z.number().nullable(),
            fuelType: z.string().nullable(),
            configuration: z.string().nullable(),
            turbo: z.string().nullable(),
        }),
        transmission: z.object({
            style: z.string().nullable(),
            speeds: z.number().nullable(),
        }),
        drivetrain: z.string().nullable(),
        plantCountry: z.string().nullable(),
        plantCity: z.string().nullable(),
        manufacturer: z.string().nullable(),
        gvwr: z.string().nullable(),
        doors: z.number().nullable(),
        seats: z.number().nullable(),
    }),

    /** Safety: airbags, ABS, recalls */
    safety: z.object({
        recallCount: z.number(),
        recalls: z.array(RecallSchema),
        airbagLocations: z.string().nullable(),
        abs: z.string().nullable(),
        esc: z.string().nullable(),
        tpms: z.string().nullable(),
    }),

    /** UK DVSA MOT History (null if not a UK vehicle / no API key) */
    motHistory: z
        .object({
            latestMileage: z.number().nullable(),
            motExpiry: z.string().nullable(),
            testResults: z.array(MotTestSchema),
        })
        .nullable(),

    /** Netherlands RDW Data */
    rdwData: z
        .object({
            licensePlate: z.string().nullable(),
            registrationStatus: z.string().nullable(),
            firstRegistration: z.string().nullable(),
            apkExpiry: z.string().nullable(),
            recalled: z.boolean().nullable(),
            brand: z.string().nullable(),
            model: z.string().nullable(),
            fuel: z.string().nullable(),
            firstRegistrationNL: z.string().nullable(),
            cataloguePrice: z.string().nullable(),
            powerKw: z.number().nullable(),
            cylinderCapacity: z.number().nullable(),
            bodyType: z.string().nullable(),
            export_indicator: z.boolean().optional(),
            wamStatus: z.boolean().optional(),
        })
        .nullable(),

    /** Scraped sources  — results from headless browser fetchers */
    scraped: z
        .object({
            romania: z
                .object({
                    aida: z.any().nullable(),      // AIDA damage history
                    rar: z.any().nullable(),        // RAR mileage history
                })
                .nullable(),
            stolenStatus: z.object({
                romania: z.enum(['CLEAR', 'FLAGGED', 'UNKNOWN']),
                italy: z.enum(['CLEAR', 'FLAGGED', 'UNKNOWN']),
                lithuania: z.enum(['CLEAR', 'FLAGGED', 'UNKNOWN']),
                sweden: z.enum(['CLEAR', 'FLAGGED', 'UNKNOWN']),
            }),
        })
        .nullable(),

    /** Per-source execution status */
    sources: z.array(SourceStatusSchema),

    /** 
     * RAW DATA DUMP (For "Technical Deep Dive" tab)
     * Stores the complete, unopinionated JSON response from every provider.
     * Guaranteed 100% data retention.
     */
    raw: z.object({
        nhtsa: z.record(z.string(), z.any()).nullable(),
        rdw: z.record(z.string(), z.any()).nullable(),
        dvsa: z.record(z.string(), z.any()).nullable(),
        scraper: z.record(z.string(), z.any()).nullable(),
    }).optional(),
});

export type UnifiedVehicleReport = z.infer<typeof UnifiedVehicleReportSchema>;
export type SourceStatus = z.infer<typeof SourceStatusSchema>;
