import { IVinDataSource } from '../types';
import { UkMotAdapter } from '@/lib/services/ukMotAdapter';

/**
 * UK DVSA MOT History API Adapter
 * Now uses the official OAuth2-enabled UkMotAdapter.
 * 
 * NOTE: Detects if input is a VIN (17 chars) or a registration (UK plate).
 */
export class DvsaMotAdapter implements IVinDataSource {
    name = 'UK Govt (DVSA)';
    private service = new UkMotAdapter();

    async fetchData(input: string): Promise<Record<string, any> | null> {
        // Detect if it's a UK Plate (usually 4-8 chars) or a VIN (17 chars)
        const isVin = input.length === 17;

        try {
            const data = isVin
                ? await this.service.fetchDataByVin(input)
                : await this.service.fetchData(input);

            if (!data) return null;

            // Return normalized record for the aggregator
            return {
                ...data,
                // Add some flags for the aggregator
                _source: 'DVSA',
                _isUk: true
            };
        } catch (err) {
            console.error('[DvsaMotAdapter] Global error:', err);
            return null;
        }
    }
}
