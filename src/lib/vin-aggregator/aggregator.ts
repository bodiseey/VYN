import { IVinDataSource, UnifiedVehicleReport, VinSchema } from './types';
import { NhtsaAdapter } from './adapters/nhtsa';
import { DvsaMotAdapter } from './adapters/dvsa-mot';
import { RdwAdapter } from './adapters/rdw';
import { PublicScraperAdapter } from './adapters/scraper-stub';

const ADAPTER_TIMEOUT_MS = 8000;

// ─────────────────────────────────────────────────────────────────
// Timeout wrapper — drops slow adapters to keep UX fast
// ─────────────────────────────────────────────────────────────────
function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    adapterName: string
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(
            () => reject(new Error(`TIMEOUT:${adapterName}:${ms}ms`)),
            ms
        )
    );
    return Promise.race([promise, timeout]);
}

// ─────────────────────────────────────────────────────────────────
// Master Aggregator
// ─────────────────────────────────────────────────────────────────
export async function aggregateVinData(rawVin: string): Promise<UnifiedVehicleReport> {
    // 1. Strict VIN validation
    const parseResult = VinSchema.safeParse(rawVin);
    if (!parseResult.success) {
        throw new Error(`Invalid VIN: ${parseResult.error.issues.map((e: { message: string }) => e.message).join(', ')}`);
    }
    const vin = parseResult.data;

    // 2. Initialize adapters
    const adapters: IVinDataSource[] = [
        new NhtsaAdapter(),
        new DvsaMotAdapter(),
        new RdwAdapter(),
        new PublicScraperAdapter(),
    ];

    // 3. Run all adapters concurrently with individual timeouts
    const startAll = Date.now();
    const timings = adapters.map(() => Date.now());

    const settled = await Promise.allSettled(
        adapters.map((adapter, i) =>
            withTimeout(adapter.fetchData(vin), ADAPTER_TIMEOUT_MS, adapter.name)
                .then(data => ({ data, duration: Date.now() - timings[i] }))
                .catch(err => ({ data: null, error: err, duration: Date.now() - timings[i] }))
        )
    );

    console.log(`[VYN Aggregator] VIN ${vin} — all adapters completed in ${Date.now() - startAll}ms`);

    // 4. Extract results per adapter index
    const getResult = (i: number): { data: any; duration: number; error?: Error } => {
        const s = settled[i];
        if (s.status === 'fulfilled') return s.value as any;
        return { data: null, duration: 0, error: s.reason };
    };

    const nhtsaResult = getResult(0);
    const motResult = getResult(1);
    const rdwResult = getResult(2);
    const scraperResult = getResult(3);

    const nhtsa = nhtsaResult.data;
    const mot = motResult.data;
    const rdw = rdwResult.data;
    const scraper = scraperResult.data;

    // 5. Build source status log for the UI
    const sourceStatus = (
        name: string,
        result: { data: any; duration: number; error?: any }
    ) => {
        let status: 'success' | 'failed' | 'timeout' | 'stub' | 'skipped' = 'failed';
        if (result.data?._stub) status = 'stub';
        else if (result.data) status = 'success';
        else if (result.error?.message?.startsWith('TIMEOUT')) status = 'timeout';
        else if (!result.data) status = 'skipped';
        return { name, status, durationMs: result.duration } as const;
    };

    const sources = [
        sourceStatus(adapters[0].name, nhtsaResult),
        sourceStatus(adapters[1].name, motResult),
        sourceStatus(adapters[2].name, rdwResult),
        sourceStatus(adapters[3].name, scraperResult),
    ];

    // 6. Build normalized UnifiedVehicleReport
    return {
        vin,
        fetchedAt: new Date().toISOString(),

        identity: {
            make: nhtsa?.make ?? null,
            model: nhtsa?.model ?? null,
            year: nhtsa?.year ?? null,
            trim: nhtsa?.trim ?? null,
            bodyClass: nhtsa?.bodyClass ?? null,
            vehicleType: nhtsa?.vehicleType ?? null,
            series: nhtsa?.series ?? null,
        },

        specs: {
            engine: nhtsa?.engine ?? {
                displacement: null,
                cylinders: null,
                hp: null,
                fuelType: null,
                configuration: null,
                turbo: null,
            },
            transmission: nhtsa?.transmission ?? { style: null, speeds: null },
            drivetrain: nhtsa?.drivetrain ?? null,
            plantCountry: nhtsa?.plantCountry ?? null,
            plantCity: nhtsa?.plantCity ?? null,
            manufacturer: nhtsa?.manufacturer ?? null,
            gvwr: nhtsa?.gvwr ?? null,
            doors: nhtsa?.doors ?? null,
            seats: nhtsa?.seats ?? null,
        },

        safety: {
            recallCount: nhtsa?.recalls?.length ?? 0,
            recalls: nhtsa?.recalls ?? [],
            airbagLocations: nhtsa?.airbagLocations ?? null,
            abs: nhtsa?.abs ?? null,
            esc: nhtsa?.esc ?? null,
            tpms: nhtsa?.tpms ?? null,
        },

        motHistory: mot
            ? {
                latestMileage: mot.latestMileage,
                motExpiry: mot.motExpiry,
                testResults: mot.testResults ?? [],
            }
            : null,

        rdwData: rdw
            ? {
                licensePlate: rdw.licensePlate ?? null,
                registrationStatus: rdw.registrationStatus ?? null,
                firstRegistration: rdw.firstRegistration ?? null,
                apkExpiry: rdw.apkExpiry ?? null,
                recalled: rdw.recalled ?? null,
                brand: rdw.brand ?? null,
                model: rdw.model ?? null,
                fuel: rdw.fuelType ?? null,
                firstRegistrationNL: rdw.firstRegistrationNL ?? null,
                cataloguePrice: rdw.cataloguePrice ?? null,
                powerKw: rdw.powerKw ?? null,
                cylinderCapacity: rdw.cylinderCapacity ?? null,
                bodyType: rdw.bodyType ?? null,
                export_indicator: rdw.exportedFlag ?? undefined,
                wamStatus: rdw.wamStatus ?? undefined,
            }
            : null,

        scraped: scraper
            ? {
                romania: scraper.romania ?? null,
                stolenStatus: scraper.stolenStatus ?? {
                    romania: 'UNKNOWN',
                    italy: 'UNKNOWN',
                    lithuania: 'UNKNOWN',
                    sweden: 'UNKNOWN',
                },
            }
            : null,

        sources,

        raw: {
            nhtsa: nhtsa ?? null,
            rdw: rdw ?? null,
            dvsa: mot ?? null,
            scraper: scraper ?? null,
        }
    };
}
