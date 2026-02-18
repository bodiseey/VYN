import { NextRequest, NextResponse } from 'next/server';
import { getPaynetFormData } from '@/lib/paynet';

export async function POST(req: NextRequest) {
    try {
        const { vin, phone, amount = 1, locale = 'ro' } = await req.json();

        if (!vin || !phone) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        // Generate a unique transaction ID for TEST
        const timestamp = Date.now();
        const externalId = `${timestamp}`;

        const merchantCode = process.env.PAYNET_MERCHANT_CODE || '975860';
        const secretKey = process.env.PAYNET_MERCHANT_SEC_KEY || '5D270BA3-C74D-488C-951A-9D7416A1D11F';

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = `${baseUrl}/${locale}/payment/success?vin=${vin}&id=${externalId}`;
        const cancelUrl = `${baseUrl}/${locale}/payment/cancel`;

        const paynetData = getPaynetFormData({
            MerchantCode: merchantCode,
            SecretKey: secretKey,
            ExternalID: externalId,
            Amount: amount * 100, // Convert MDL to bani (cents)
            Description: `Raport Istoric VIN: ${vin}`,
            CustomerName: 'Client VYN.md',
            CustomerPhone: phone.replace(/\s+/g, ''), // Clean phone number
            Lang: locale,
            SuccessUrl: successUrl,
            CancelUrl: cancelUrl,
        });

        console.log(`[Paynet TEST] Initiating payment for VIN: ${vin}, ID: ${externalId}`);

        return NextResponse.json({ success: true, paynet: paynetData });
    } catch (error) {
        console.error('Payment TEST Init Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
