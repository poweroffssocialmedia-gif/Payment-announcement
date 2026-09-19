import { SupportedApp, PaymentRecord } from '../types';

export interface ParsedPaymentResult {
  isPayment: boolean;
  app: SupportedApp;
  appDisplayName: string;
  amount: number;
  currency: string;
  payerName: string;
  referenceId?: string;
  extractedTitle: string;
  extractedBody: string;
}

// App package identifier map
export const KNOWN_PACKAGES: Record<string, { app: SupportedApp; name: string }> = {
  'com.phonepe.app': { app: 'phonepe', name: 'PhonePe' },
  'com.phonepe.merchant': { app: 'phonepe', name: 'PhonePe Business' },
  'com.google.android.apps.nbu.paisa.user': { app: 'gpay', name: 'Google Pay' },
  'com.google.android.apps.nbu.paisa.merchant': { app: 'gpay', name: 'Google Pay for Business' },
  'net.one97.paytm': { app: 'paytm', name: 'Paytm' },
  'com.paytmmoney': { app: 'paytm', name: 'Paytm for Business' },
  'in.org.npci.upiapp': { app: 'bhim', name: 'BHIM UPI' },
  'com.amazon.mShop.android.shopping': { app: 'amazonpay', name: 'Amazon Pay' },
  'in.cred.app': { app: 'cred', name: 'CRED' },
  'com.stripe.android': { app: 'stripe', name: 'Stripe' },
  'com.paypal.android.p2pmobile': { app: 'paypal', name: 'PayPal' },
  'com.google.android.apps.messaging': { app: 'bank_sms', name: 'Bank SMS' },
  'com.samsung.android.messaging': { app: 'bank_sms', name: 'Bank SMS' },
};

export function parseNotification(
  title: string,
  body: string,
  packageName = ''
): ParsedPaymentResult {
  const combined = `${title || ''} ${body || ''}`.trim();
  const lower = combined.toLowerCase();

  // Determine App Identity
  let app: SupportedApp = 'other';
  let appDisplayName = 'Payment Alert';

  if (packageName && KNOWN_PACKAGES[packageName]) {
    app = KNOWN_PACKAGES[packageName].app;
    appDisplayName = KNOWN_PACKAGES[packageName].name;
  } else if (lower.includes('phonepe')) {
    app = 'phonepe';
    appDisplayName = 'PhonePe';
  } else if (lower.includes('google pay') || lower.includes('gpay')) {
    app = 'gpay';
    appDisplayName = 'Google Pay';
  } else if (lower.includes('paytm')) {
    app = 'paytm';
    appDisplayName = 'Paytm';
  } else if (lower.includes('bhim')) {
    app = 'bhim';
    appDisplayName = 'BHIM UPI';
  } else if (lower.includes('amazon pay')) {
    app = 'amazonpay';
    appDisplayName = 'Amazon Pay';
  } else if (lower.includes('stripe')) {
    app = 'stripe';
    appDisplayName = 'Stripe';
  } else if (lower.includes('paypal')) {
    app = 'paypal';
    appDisplayName = 'PayPal';
  } else if (
    lower.includes('credited') ||
    lower.includes('a/c') ||
    lower.includes('bank') ||
    lower.includes('upi/ref') ||
    lower.includes('vpa')
  ) {
    app = 'bank_sms';
    appDisplayName = 'Bank Notification';
  }

  // Currency & Amount extraction
  let currency = '₹';
  let amount = 0;

  // Check currency type
  if (combined.includes('$')) {
    currency = '$';
  } else if (combined.includes('€')) {
    currency = '€';
  } else if (combined.includes('£')) {
    currency = '£';
  } else {
    currency = '₹';
  }

  // Regex patterns for amounts
  // 1) ₹150.00 or Rs. 150 or INR 150 or $45.00
  // Matches Java service: (?:₹|rs\.?|inr)\s*([0-9,]+(?:\.[0-9]{1,2})?)
  const amountPatterns = [
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:\$|€|£)\s*([\d,]+(?:\.\d{1,2})?)/,
    /(?:received|credited|payment of|paid you|प्राप्त|प्राप्त हुए)\s*(?:₹|rs\.?|inr|\$|€|£)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rs|inr|rupees|रुपये)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      const cleanNum = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // Extract Payer Name
  let payerName = 'Customer';
  const payerPatterns = [
    /(?:from|by|paid by)\s+([A-Za-z\s]+?)(?:\s+(?:via|using|on|upi|ref|a\/c|to|\.|$))/i,
    /([A-Za-z\s]+?)\s+(?:paid you|sent you|transferred)/i,
    /(?:UPI\/[\d]+\/)([A-Za-z\s]+?)(?:\/|\.|$)/i,
  ];

  for (const pattern of payerPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (
        candidate.length > 1 &&
        candidate.length < 35 &&
        !['payment', 'account', 'money', 'upi', 'bank', 'rupees'].includes(candidate.toLowerCase())
      ) {
        payerName = candidate;
        break;
      }
    }
  }

  // Extract Reference ID / UTR if present
  let referenceId: string | undefined;
  const utrMatch = combined.match(/(?:ref(?:\s*no\.?|id)?|utr|txn id)\s*[:#\-]?\s*([A-Za-z0-9]{8,22})/i);
  if (utrMatch && utrMatch[1]) {
    referenceId = utrMatch[1];
  }

  const isPayment =
    amount > 0 ||
    lower.includes('received') ||
    lower.includes('credited') ||
    lower.includes('प्राप्त') ||
    lower.includes('रुपये');

  return {
    isPayment,
    app,
    appDisplayName,
    amount: amount > 0 ? amount : 100,
    currency,
    payerName,
    referenceId,
    extractedTitle: title,
    extractedBody: body,
  };
}

export function buildPaymentRecord(
  parsed: ParsedPaymentResult,
  speechText: string
): PaymentRecord {
  return {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    app: parsed.app,
    appDisplayName: parsed.appDisplayName,
    amount: parsed.amount,
    currency: parsed.currency,
    payerName: parsed.payerName,
    referenceId: parsed.referenceId,
    rawTitle: parsed.extractedTitle,
    rawText: parsed.extractedBody,
    speechText,
    status: 'announced',
  };
}
