import { IVinDataSource } from '../types';

/**
 * VinAudit API Adapter
 * Standard vehicle history provider for USA/Canada.
 * Provides Salvage, Junk, and Insurance records.
 */
export class VinAuditAdapter implements IVinDataSource {
    name = 'VinAudit (Global)';

    async fetchData(vin: string): Promise<Record<string, any> | null> {
        const apiKey = process.env.VINAUDIT_API_KEY;
        if (!apiKey) return null;

        try {
            const url = `https://api.vinaudit.com/v1/report?vin=${encodeURIComponent(vin)}&key=${apiKey}&format=json`;

            const res = await fetch(url, {
                signal: AbortSignal.timeout(8000)
            });

            if (!res.ok) return null;

            const data = await res.json();

            // Normalize for aggregator
            return {
                id: data.id,
                vin: data.vin,
                stolen: data.theft_records?.length > 0 || false,
                theftRecords: data.theft_records || [],
                auctionHistory: data.salvage_records || [],
                junk: data.junk_records || [],
                insurance: data.insurance_records || [],
                marketValue: data.market_value || null,
                _source: 'VINAUDIT'
            };
        } catch (err) {
            console.error('[VinAuditAdapter] Error:', err);
            return null;
        }
    }
}
