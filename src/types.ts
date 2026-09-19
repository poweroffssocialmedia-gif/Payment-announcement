export type SupportedApp =
  | 'phonepe'
  | 'gpay'
  | 'paytm'
  | 'bhim'
  | 'cred'
  | 'amazonpay'
  | 'stripe'
  | 'paypal'
  | 'bank_sms'
  | 'other';

export interface PaymentRecord {
  id: string;
  timestamp: number;
  app: SupportedApp;
  appDisplayName: string;
  amount: number;
  currency: string; // '₹', '$', '€', '£', etc.
  payerName: string;
  referenceId?: string;
  rawTitle: string;
  rawText: string;
  speechText: string;
  status: 'announced' | 'queued' | 'manual';
}

export type ChimeSoundType =
  | 'soundbox_chime'
  | 'cash_register'
  | 'digital_bell'
  | 'marimba'
  | 'arcade';

export type TemplatePreset =
  | 'standard'
  | 'detailed'
  | 'short'
  | 'hindi'
  | 'hindi_detailed'
  | 'custom';

export interface SoundboxSettings {
  voiceURI: string;
  language: string;
  pitch: number; // 0.5 - 1.5
  rate: number; // 0.7 - 1.4
  volume: number; // 0.1 - 1.0
  chimeSound: ChimeSoundType;
  chimeVolume: number; // 0.1 - 1.0
  playChimeBeforeVoice: boolean;
  template: TemplatePreset;
  customTemplate: string;
  repeatCount: 1 | 2;
  autoAnnounce: boolean;
  browserNotifications: boolean;
  keepScreenActive: boolean;
}

export interface SampleNotification {
  id: string;
  appName: string;
  app: SupportedApp;
  packageName: string;
  title: string;
  body: string;
  expectedAmount: number;
  expectedCurrency: string;
  expectedPayer: string;
}
