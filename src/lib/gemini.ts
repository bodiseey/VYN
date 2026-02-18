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

export interface VehicleContext {
    vin: string;
    make: string;
    model: string;
    year: string;
    specs: Record<string, string>;
    mileage?: number;
    inspectionResult?: string;
    inspectionDate?: string;
    borderCrossings?: number;
    marketListings?: number;
    averagePrice?: number;
    nationalStatus?: string;
    lastOperation?: string;
    color?: string;
}

export interface AIVerdict {
    rating: 'green' | 'yellow' | 'red';
    title: string;
    summary: string;
    keyPoints: string[];
    recommendation: string;
    confidence: number; // 0-100
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

function buildContextString(ctx: VehicleContext): string {
    const currentYear = new Date().getFullYear();
    const carAge = ctx.year ? currentYear - parseInt(ctx.year) : null;

    return `
=== VEHICLE DATA FOR ANALYSIS ===
VIN: ${ctx.vin}
Make/Model/Year: ${ctx.year} ${ctx.make} ${ctx.model}
Car Age: ${carAge ? `${carAge} years` : 'Unknown'}

TECHNICAL SPECS:
${Object.entries(ctx.specs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

MOLDOVA REGISTRY DATA:
- Registration Status: ${ctx.nationalStatus || 'Not found in RM registry'}
- Last Official Operation: ${ctx.lastOperation || 'N/A'}
- Color: ${ctx.color || 'N/A'}

TECHNICAL INSPECTION (ITP):
- Last Inspection Result: ${ctx.inspectionResult || 'No inspection data'}
- Last Inspection Date: ${ctx.inspectionDate || 'N/A'}
- Recorded Mileage at Inspection: ${ctx.mileage ? `${ctx.mileage.toLocaleString()} km` : 'N/A'}

MARKET PRESENCE:
- Active Ads on 999.md: ${ctx.marketListings ?? 0}
- Average Market Price: ${ctx.averagePrice ? `€${ctx.averagePrice.toLocaleString()}` : 'N/A'}
- Border Crossings Recorded: ${ctx.borderCrossings ?? 0}
=================================
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
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const prompt = `${buildContextString(ctx)}

Analyze this vehicle and provide a structured JSON verdict. Respond ONLY with valid JSON, no markdown, no extra text:

{
  "rating": "green" | "yellow" | "red",
  "title": "Short verdict title (max 8 words)",
  "summary": "2-3 sentence overall assessment",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "recommendation": "Clear action recommendation for the buyer (1-2 sentences)",
  "confidence": <number 0-100 based on data completeness>
}

Rating guide:
- green: Car appears safe, data is consistent, no major red flags
- yellow: Some concerns found, physical inspection strongly recommended
- red: Significant red flags, high risk purchase, buyer should be very cautious

Respond in Romanian language.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            rating: parsed.rating || 'yellow',
            title: parsed.title || 'Analiză incompletă',
            summary: parsed.summary || '',
            keyPoints: parsed.keyPoints || [],
            recommendation: parsed.recommendation || '',
            confidence: parsed.confidence || 50
        };
    } catch (e) {
        console.error('[Gemini Verdict Error]', e);
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
            model: 'gemini-1.5-flash',
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
    } catch (e) {
        console.error('[Gemini Chat Error]', e);
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
