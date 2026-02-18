import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI, VehicleContext, ChatMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { message, context, history }: {
            message: string;
            context: VehicleContext;
            history: ChatMessage[];
        } = await req.json();

        if (!message || !context?.vin) {
            return NextResponse.json({ error: 'Message and vehicle context are required' }, { status: 400 });
        }

        const reply = await chatWithAI(message, context, history || []);
        return NextResponse.json({ success: true, reply });
    } catch (error) {
        console.error('[AI Chat API Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
