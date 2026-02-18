/**
 * VYN.md — Gemini AI Brain
 * Senior Automotive Consultant powered by Google Gemini
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an elite car inspector and automotive consultant with 20 years of experience in the Moldovan and international car markets. Your name is VYN AI.

You are sharp, honest, and cannot be fooled by odometer rollbacks or hidden damage. Your tone is professional yet candid. You know that in Moldova, many cars are sold with hidden histories, imported from flood-damaged regions in Germany, or with rolled-back odometers from Poland and Lithuania.

Your job is to protect the buyer. You analyze vehicle data and give a clear, actionable verdict.

RULES:
- NEVER guess or fabricate information. If data is missing, say: "Based on available data, I cannot confirm this. Proceed with a physical inspection."
- Be CONSERVATIVE with "Safe" ratings. When in doubt, flag it.
- Always consider the Moldovan context: local repair costs, parts availability, and typical import routes.
- Respond in the SAME LANGUAGE the user writes in (Romanian, Russian, or English).
- Keep responses concise and structured. Use bullet points for clarity.
- When giving a verdict, always end with one of: 🟢 SIGUR, 🟡 NECESITĂ VERIFICARE, or 🔴 EVITAȚI (or their equivalents in the user's language).`;

// gemini-flash-lite-latest: confirmed working on Free Tier
const GEMINI_MODEL = 'gemini-flash-lite-latest';

export interface VehicleContext {
    vin: string;
    make: string;
    model: string;
    year: string;
    specs: Record<string, string>;
    allSpecs?: Record<string, string>; // Full NHTSA extended specs (EXTRAS_PLUS)
    mileage?: number;
    inspectionResult?: string;
    inspectionDate?: string;
    allInspections?: Array<{ Date: string; Result: string; Mileage: number; Station?: string }>;
    borderCrossings?: number;
    allBorderCrossings?: Array<{ DateTime: string; Point: string; Direction: string }>;
    marketListings?: number;
    averagePrice?: number;
    nationalStatus?: string;
    lastOperation?: string;
    color?: string;
    nationalVehicle?: Record<string, any>; // Full vehicle registry data
}

export interface AIVerdict {
    rating: 'green' | 'yellow' | 'red';
    title: string;
    summary: string;
    keyPoints: string[];
    recommendation: string;
    confidence: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

function buildContextString(ctx: VehicleContext): string {
    const currentYear = new Date().getFullYear();
    const carAge = ctx.year ? currentYear - parseInt(ctx.year) : null;

    // Use allSpecs if available (EXTRAS_PLUS), otherwise basic specs
    const specsToUse = ctx.allSpecs && Object.keys(ctx.allSpecs).length > 0 ? ctx.allSpecs : ctx.specs;
    const specsSection = Object.entries(specsToUse)
        .filter(([, v]) => v && v !== 'N/A')
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');

    const inspectionsSection = ctx.allInspections && ctx.allInspections.length > 0
        ? ctx.allInspections.map(i =>
            `  • ${i.Date}: ${i.Result} — ${i.Mileage?.toLocaleString()} km${i.Station ? ` (${i.Station})` : ''}`
        ).join('\n')
        : ctx.inspectionResult
            ? `  • ${ctx.inspectionDate}: ${ctx.inspectionResult} — ${ctx.mileage?.toLocaleString()} km`
            : '  No inspection data available';

    const borderSection = ctx.allBorderCrossings && ctx.allBorderCrossings.length > 0
        ? ctx.allBorderCrossings.map(b =>
            `  • ${b.DateTime}: ${b.Point} (${b.Direction})`
        ).join('\n')
        : `  Total crossings: ${ctx.borderCrossings ?? 0}`;

    const nationalSection = ctx.nationalVehicle
        ? Object.entries(ctx.nationalVehicle)
            .filter(([, v]) => v)
            .map(([k, v]) => `- ${k}: ${v}`)
            .join('\n')
        : `- Status: ${ctx.nationalStatus || 'Not found in RM registry'}
- Last Operation: ${ctx.lastOperation || 'N/A'}
- Color: ${ctx.color || 'N/A'}`;

    return `
=== COMPLETE VEHICLE DATA FOR ANALYSIS ===
VIN: ${ctx.vin}
Make/Model/Year: ${ctx.year} ${ctx.make} ${ctx.model}
Car Age: ${carAge ? `${carAge} years` : 'Unknown'}
Data Completeness: ${ctx.allSpecs ? 'FULL (EXTRAS_PLUS extended scan)' : 'BASIC'}

TECHNICAL SPECIFICATIONS (${Object.keys(specsToUse).length} data points):
${specsSection}

MOLDOVA NATIONAL REGISTRY:
${nationalSection}

TECHNICAL INSPECTIONS (ITP) — ALL RECORDS:
${inspectionsSection}

BORDER CROSSINGS — ALL RECORDS:
${borderSection}

MARKET PRESENCE (999.md):
- Active Listings Found: ${ctx.marketListings ?? 0}
- Average Market Price: ${ctx.averagePrice ? `€${ctx.averagePrice.toLocaleString()}` : 'No market data'}
==========================================
`;
}

/**
 * Generate the AI Verdict card for a vehicle
 */
export async function generateAIVerdict(ctx: VehicleContext): Promise<AIVerdict> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return getFallbackVerdict();
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_PROMPT,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const prompt = `${buildContextString(ctx)}

Analyze this vehicle and provide a structured JSON verdict. Respond ONLY with valid JSON, no markdown, no extra text:

{
  "rating": "green",
  "title": "Short verdict title max 8 words",
  "summary": "2-3 sentence overall assessment",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "recommendation": "Clear action recommendation for the buyer 1-2 sentences",
  "confidence": 75
}

Rating guide:
- green: Car appears safe, data is consistent, no major red flags
- yellow: Some concerns found, physical inspection strongly recommended
- red: Significant red flags, high risk purchase, buyer should be very cautious

Respond in Romanian language.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON - handle both raw JSON and markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null;
        if (!jsonStr) throw new Error('No JSON in response: ' + text.substring(0, 200));

        const parsed = JSON.parse(jsonStr.trim());
        return {
            rating: ['green', 'yellow', 'red'].includes(parsed.rating) ? parsed.rating : 'yellow',
            title: parsed.title || 'Analiză completă',
            summary: parsed.summary || '',
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
            recommendation: parsed.recommendation || '',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 50
        };
    } catch (e: any) {
        console.error('[Gemini Verdict Error]', e?.message || e);
        return getFallbackVerdict();
    }
}

/**
 * Chat with the AI about a specific vehicle
 */
export async function chatWithAI(
    message: string,
    ctx: VehicleContext,
    history: ChatMessage[]
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return 'Serviciul AI nu este configurat momentan. Te rugăm să revii mai târziu.';
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_PROMPT,
        });

        const contextPreamble = buildContextString(ctx);

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `Here is the vehicle context for our conversation:\n${contextPreamble}\n\nI will now ask you questions about this specific vehicle.` }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Înțeles. Am analizat datele vehiculului. Sunt pregătit să răspund la întrebările tale despre acest vehicul specific.' }]
                },
                ...history.map(m => ({
                    role: m.role as 'user' | 'model',
                    parts: [{ text: m.content }]
                }))
            ]
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (e: any) {
        console.error('[Gemini Chat Error]', e?.message || e);
        return 'A apărut o eroare la procesarea întrebării. Te rugăm să încerci din nou.';
    }
}

function getFallbackVerdict(): AIVerdict {
    return {
        rating: 'yellow',
        title: 'Analiză AI indisponibilă',
        summary: 'Serviciul AI nu este configurat. Verdictul automat nu poate fi generat.',
        keyPoints: [
            'Verificați istoricul tehnic la ITP Moldova',
            'Solicitați un raport CARFAX sau AutoCheck',
            'Inspecție fizică obligatorie la un service autorizat',
            'Verificați VIN-ul la poliție pentru furturi'
        ],
        recommendation: 'Procedați cu o inspecție fizică completă înainte de achiziție.',
        confidence: 0
    };
}
