import { createHash } from 'crypto';

export interface PaynetPaymentRequest {
    MerchantCode: string;
    SecretKey: string;
    ExternalID: string;
    Amount: number; // total in cents (e.g. 100 for 1.00 MDL)
    Description: string;
    CustomerName: string;
    CustomerPhone: string;
    Lang: string;
    SuccessUrl: string;
    CancelUrl: string;
}

/**
 * Generates Paynet signature using MD5 -> Base64 as per SDK
 */
export function generatePaynetSignature(request: PaynetPaymentRequest, expiryDate: string, externalDate: string): string {
    const currency = "498";
    const customerAddress = "Mun. Chisinau";
    const customerCode = request.CustomerPhone;
    const customerName = request.CustomerName;
    const serviceName = "VYN.md Report";
    const serviceDescription = request.Description;

    // Sequence MUST match PaynetAPI.php:
    // $request->Currency . $request->Customer['Address'] . $request->Customer['Code'] . $request->Customer['Name'] . $request->ExpiryDate . strval($request->ExternalID) . $this->merchantCode . $request->Service['Amount'] . $request->Service['Name'] . $request->Service['Description'] . $this->merchant_secret_key;

    // Note: We use ExternalDate from the form, but SignatureGet in PHP uses $pRequest->ExternalDate only if it's part of the concatenated string.
    // Looking at SignatureGet in PaynetAPI.php line 356:
    // $_sing_raw  = $request->Currency;
    // $_sing_raw .= $request->Customer['Address'].$request->Customer['Code'].$request->Customer['Name'];
    // $_sing_raw .= $request->ExpiryDate.strval($request->ExternalID).$this->merchant_code;
    // $_sing_raw .= $request->Service['Amount'].$request->Service['Name'].$request->Service['Description'];			
    // $_sing_raw .= $this->merchant_secret_key;	

    const raw =
        currency +
        customerAddress +
        customerCode +
        customerName +
        expiryDate +
        request.ExternalID.toString() +
        request.MerchantCode +
        request.Amount.toString() +
        serviceName +
        serviceDescription +
        request.SecretKey;

    console.log("[Paynet Signature Raw]:", raw);

    // MD5 binary then Base64
    return createHash('md5').update(raw).digest('base64');
}

export function getPaynetDateTime(addHours: number = 0) {
    const date = new Date();
    // Chisinau time is UTC+2
    const offset = 2;
    date.setHours(date.getUTCHours() + offset + addHours);

    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}`;
}

export function getPaynetFormData(request: PaynetPaymentRequest) {
    const expiryDate = getPaynetDateTime(4);
    const externalDate = getPaynetDateTime(0);
    const signature = generatePaynetSignature(request, expiryDate, externalDate);

    return {
        action: "https://test.paynet.md/acquiring/setecom",
        fields: {
            "ExternalID": request.ExternalID,
            "Services[0][Name]": "VYN.md Report",
            "Services[0][Description]": request.Description,
            "Services[0][Amount]": request.Amount.toString(),
            "Currency": "498",
            "Merchant": request.MerchantCode,
            "Customer.Code": request.CustomerPhone,
            "Customer.Name": request.CustomerName,
            "Customer.Address": "Mun. Chisinau",
            "Payer.Email": "customer@vyn.md",
            "Payer.Name": "Client",
            "Payer.Surname": "VYN",
            "Payer.Mobile": request.CustomerPhone,
            "ExternalDate": externalDate,
            "LinkUrlSuccess": request.SuccessUrl,
            "LinkUrlCancel": request.CancelUrl,
            "ExpiryDate": expiryDate,
            "Signature": signature,
            "Lang": request.Lang
        }
    };
}
