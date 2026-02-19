import { IVinDataSource } from '../types';

/**
 * PublicScraperAdapter — Headless Browser Stub
 *
 * This adapter contains BOILERPLATE for future Playwright/Puppeteer scraping.
 * These sites don't have public APIs, so we need headless browser automation.
 *
 * IMPORTANT: Playwright cannot run in Vercel Serverless Functions (worker size limit).
 * DEPLOYMENT STRATEGY:
 *   - Use a separate long-running service (e.g., Railway.app, Fly.io, or a VPS)
 *   - Or use @sparticuz/chromium + puppeteer-core which works on Vercel with some limits
 *   - Set SCRAPER_SERVICE_URL env var to the scraper microservice endpoint
 *
 * SOURCES QUEUED FOR SCRAPING:
 * ┌────────────────────────────────────────────────────────────────────┐
 * │ SOURCE           │ URL                                  │ FIELD   │
 * ├────────────────────────────────────────────────────────────────────┤
 * │ AIDA Romania     │ https://aida.info.ro                 │ VIN     │
 * │ RAR Romania      │ https://www.rarom.ro/verificare-vin  │ VIN     │
 * │ Regitra Lithuania│ https://www.regitra.lt/en/           │ VIN     │
 * │ Stolen RO Police │ https://www.politiaromana.ro         │ VIN     │
 * │ Stolen Italy     │ https://crimnet.dcpc.interno.gov.it │ VIN     │
 * │ Transportstyrelsen (Sweden) │ https://fu-regnr.transportstyrelsen.se │ Plate │
 * └────────────────────────────────────────────────────────────────────┘
 */
export class PublicScraperAdapter implements IVinDataSource {
    name = 'Public Registries (Romania AIDA · Regitra LT · Italy)';

    async fetchData(vin: string): Promise<Record<string, any> | null> {
        const scraperUrl = process.env.SCRAPER_SERVICE_URL;

        if (scraperUrl) {
            // If a scraper microservice is deployed, delegate to it
            try {
                const res = await fetch(`${scraperUrl}/scrape`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vin }),
                    signal: AbortSignal.timeout(7000),
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                console.warn('[PublicScraperAdapter] Microservice unreachable:', err);
            }
        }

        // ─── STUBS (return UNKNOWN until scraper is live) ───────────────────────
        console.log(`[PublicScraperAdapter] Scraper stubs active for VIN: ${vin}`);

        return {
            romania: {
                aida: null,
                rar: null,
            },
            stolenStatus: {
                romania: 'UNKNOWN',
                italy: 'UNKNOWN',
                lithuania: 'UNKNOWN',
                sweden: 'UNKNOWN',
            },
            _stub: true,
            _note: 'Scraper microservice not configured (SCRAPER_SERVICE_URL env var). Set up a Playwright service to enable this.',
        };
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * FUTURE PLAYWRIGHT SCRAPER BOILERPLATE (for the microservice)
 * ═══════════════════════════════════════════════════════════════════
 *
 * import { chromium } from 'playwright';
 *
 * export async function scrapeAidaRomania(vin: string) {
 *   const browser = await chromium.launch({ headless: true });
 *   const page = await browser.newPage();
 *   try {
 *     await page.goto('https://aida.info.ro/verificare-vin', { waitUntil: 'networkidle' });
 *     await page.fill('input[name="vin"]', vin);
 *     await page.click('button[type="submit"]');
 *     await page.waitForSelector('.result-container', { timeout: 10000 });
 *     const hasAccident = await page.$('.accident-record') !== null;
 *     const records = await page.$$eval('.accident-row', rows => rows.map(r => r.textContent?.trim()));
 *     return { hasAccident, records };
 *   } catch { return null; }
 *   finally { await browser.close(); }
 * }
 *
 * export async function scrapeRegitraLithuania(vin: string) {
 *   const browser = await chromium.launch({ headless: true });
 *   const page = await browser.newPage();
 *   try {
 *     await page.goto('https://www.regitra.lt/en/services/check-vehicle', { waitUntil: 'networkidle' });
 *     await page.fill('input[placeholder*="VIN"]', vin);
 *     await page.keyboard.press('Enter');
 *     await page.waitForNavigation({ timeout: 10000 });
 *     const stolen = await page.$('.stolen-warning') !== null;
 *     return { stolenStatus: stolen ? 'FLAGGED' : 'CLEAR' };
 *   } catch { return null; }
 *   finally { await browser.close(); }
 * }
 *
 * export async function scrapeStolenItaly(vin: string) {
 *   const browser = await chromium.launch({ headless: true });
 *   const page = await browser.newPage();
 *   try {
 *     await page.goto('https://crimnet.dcpc.interno.gov.it/crimnet/', { waitUntil: 'networkidle' });
 *     await page.fill('input[name="telaio"]', vin); // telaio = chassis/VIN
 *     await page.click('input[type="submit"]');
 *     await page.waitForSelector('.response', { timeout: 10000 });
 *     const text = await page.textContent('.response');
 *     const stolen = text?.toLowerCase().includes('rubato') || text?.toLowerCase().includes('stolen');
 *     return { stolenStatus: stolen ? 'FLAGGED' : 'CLEAR', rawResponse: text };
 *   } catch { return null; }
 *   finally { await browser.close(); }
 * }
 */
