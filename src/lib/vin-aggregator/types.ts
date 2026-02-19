import { z } from 'zod';

// ─────────────────────────────────────────
// 1. Strict VIN Validation
// ─────────────────────────────────────────
export const VinSchema = z
    .string()
    .transform(s => s.toUpperCase().replace(/\s/g, ''))
    .pipe(
        z
            .string()
            .length(17, 'VIN must be exactly 17 characters')
            .regex(
                /^[A-HJ-NPR-Z0-9]{17}$/,
                'VIN contains invalid characters. Letters I, O, Q are not allowed.'
            )
    );

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

    /** Netherlands RDW Open Data (null if not found) */
    rdwData: z
        .object({
            licensePlate: z.string().nullable(),
            registrationStatus: z.string().nullable(),
            firstRegistration: z.string().nullable(),
            apkExpiry: z.string().nullable(),
            recalled: z.boolean().nullable(),
            brand: z.string().nullable(),
            fuel: z.string().nullable(),
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

    /** Per-source execution status for the UI / debugging */
    sources: z.array(SourceStatusSchema),
});

export type UnifiedVehicleReport = z.infer<typeof UnifiedVehicleReportSchema>;
export type SourceStatus = z.infer<typeof SourceStatusSchema>;
