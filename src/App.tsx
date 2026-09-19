import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  Sliders,
  Smartphone,
  Cpu,
  Receipt,
  Radio,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Bell,
  VolumeX,
  Info,
  ArrowLeft,
  X,
} from 'lucide-react';
import { SoundboxDevice } from './components/SoundboxDevice';
import { NotificationSimulator } from './components/NotificationSimulator';
import { SoundboxSettingsModal } from './components/SoundboxSettingsModal';
import { LedgerHistory } from './components/LedgerHistory';
import { AndroidCodeExport } from './components/AndroidCodeExport';
import { PaymentRecord, SoundboxSettings } from './types';
import { parseNotification, buildPaymentRecord } from './utils/notificationParser';
import {
  announcePayment,
  formatAnnouncement,
  stopCurrentAnnouncement,
} from './utils/speechEngine';

const INITIAL_SETTINGS: SoundboxSettings = {
  voiceURI: '',
  language: 'en-IN',
  pitch: 1.0,
  rate: 1.0,
  volume: 0.9,
  chimeSound: 'soundbox_chime',
  chimeVolume: 0.85,
  playChimeBeforeVoice: true,
  template: 'standard',
  customTemplate: 'Received {amount} {currency} on {app} from {name}',
  repeatCount: 1,
  autoAnnounce: true,
  browserNotifications: false,
  keepScreenActive: true,
};

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_seed_1',
    timestamp: Date.now() - 1000 * 60 * 12,
    app: 'gpay',
    appDisplayName: 'Google Pay',
    amount: 500,
    currency: '₹',
    payerName: 'Priya Verma',
    referenceId: 'UPI4268901234',
    rawTitle: 'Google Pay • Paid you',
    rawText: 'Priya Verma paid you ₹500.00 using Google Pay',
    speechText: 'Received 500 rupees on Google Pay',
    status: 'announced',
  },
  {
    id: 'pay_seed_2',
    timestamp: Date.now() - 1000 * 60 * 38,
    app: 'phonepe',
    appDisplayName: 'PhonePe',
    amount: 150,
    currency: '₹',
    payerName: 'Amit Sharma',
    referenceId: 'TXN992812034',
    rawTitle: 'Payment Received',
    rawText: 'Received ₹150 from Amit Sharma on PhonePe',
    speechText: 'Received 150 rupees on PhonePe',
    status: 'announced',
  },
];

export default function App() {
  // Settings with localStorage persistence
  const [settings, setSettings] = useState<SoundboxSettings>(() => {
    try {
      const saved = localStorage.getItem('soundbox_settings');
      if (saved) return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return INITIAL_SETTINGS;
  });

  // Payments Ledger with localStorage persistence
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('soundbox_payments');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_PAYMENTS;
  });

  const [activeTab, setActiveTab] = useState<'soundbox' | 'android' | 'ledger'>('soundbox');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentRecord | null>(null);
  const [lastPayment, setLastPayment] = useState<PaymentRecord | null>(payments[0] || null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('soundbox_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('soundbox_payments', JSON.stringify(payments));
    } catch {
      // ignore
    }
  }, [payments]);

  // Handle incoming notification announcement
  const handleAnnounceNotification = useCallback(
    async (title: string, body: string, packageName?: string) => {
      setAudioUnlocked(true);

      const parsed = parseNotification(title, body, packageName);
      const speechText = formatAnnouncement(parsed, settings);
      const record = buildPaymentRecord(parsed, speechText);

      // Add to ledger
      setPayments((prev) => [record, ...prev]);
      setActivePayment(record);
      setLastPayment(record);

      // Play through speaker synthesizer if autoAnnounce is on
      if (settings.autoAnnounce) {
        setIsAnnouncing(true);
        try {
          await announcePayment(speechText, settings, {
            onStart: () => setIsAnnouncing(true),
            onEnd: () => {
              setIsAnnouncing(false);
              setActivePayment(null);
            },
            onError: () => {
              setIsAnnouncing(false);
              setActivePayment(null);
            },
          });
        } catch {
          setIsAnnouncing(false);
          setActivePayment(null);
        }
      }
    },
    [settings]
  );

  // Quick simulate trigger
  const handleQuickSimulate = useCallback(
    (amount: number, appName: string) => {
      const title = `${appName} Payment Alert`;
      const body = `Received ₹${amount} from Customer on ${appName}`;
      handleAnnounceNotification(title, body);
    },
    [handleAnnounceNotification]
  );

  // Replay specific or last payment
  const handleReplayPayment = useCallback(
    async (payment: PaymentRecord) => {
      setAudioUnlocked(true);
      setActivePayment(payment);
      setLastPayment(payment);
      setIsAnnouncing(true);

      const speechText = formatAnnouncement(payment, settings);
      try {
        await announcePayment(speechText, settings, {
          onStart: () => setIsAnnouncing(true),
          onEnd: () => {
            setIsAnnouncing(false);
            setActivePayment(null);
          },
          onError: () => {
            setIsAnnouncing(false);
            setActivePayment(null);
          },
        });
      } catch {
        setIsAnnouncing(false);
        setActivePayment(null);
      }
    },
    [settings]
  );

  const handleStopAnnouncement = () => {
    stopCurrentAnnouncement();
    setIsAnnouncing(false);
    setActivePayment(null);
  };

  const handleUpdateSettings = (partial: Partial<SoundboxSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleClearHistory = () => {
    setPayments([]);
    setActivePayment(null);
    setLastPayment(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Payment Announcer
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Soundbox Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                pkg: com.example.paymentannouncer
              </p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <button
              id="tab-soundbox"
              type="button"
              onClick={() => setActiveTab('soundbox')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'soundbox'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Soundbox & Tester</span>
            </button>

            <button
              id="tab-android-code"
              type="button"
              onClick={() => setActiveTab('android')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Native Android Code</span>
            </button>

            <button
              id="tab-ledger"
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ledger History</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
                {payments.length}
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-about"
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-medium"
              title="About App & Developer (AboutActivity)"
            >
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">About</span>
            </button>

            <button
              id="btn-open-settings"
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700"
              title="Soundbox Voice & Audio Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('soundbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'soundbox'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Soundbox & Tester
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'android'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Android Project Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Ledger ({payments.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'soundbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Physical Soundbox Hardware Visualizer */}
            <div className="lg:col-span-6">
              <SoundboxDevice
                isAnnouncing={isAnnouncing}
                activePayment={activePayment}
                lastPayment={lastPayment}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onReplayLast={() => lastPayment && handleReplayPayment(lastPayment)}
                onStop={handleStopAnnouncement}
                onQuickSimulate={handleQuickSimulate}
              />
            </div>

            {/* Right Column: Android Notification Simulator & Parser */}
            <div className="lg:col-span-6">
              <NotificationSimulator
                settings={settings}
                onAnnounceNotification={handleAnnounceNotification}
                isAnnouncing={isAnnouncing}
              />
            </div>
          </div>
        )}

        {activeTab === 'android' && (
          <div>
            <AndroidCodeExport />
          </div>
        )}

        {activeTab === 'ledger' && (
          <div>
            <LedgerHistory
              payments={payments}
              onReplayPayment={handleReplayPayment}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}
      </main>

      {/* Footer Branding matching activity_about.xml */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold tracking-wide text-slate-700 dark:text-slate-300">
            PAYMENT ANNOUNCER APP
          </div>
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
            title="Click to view About Activity"
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Owner &amp; Developer:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 tracking-wide underline decoration-blue-400/30 underline-offset-4">MD IRFAN ALAM</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-400 font-mono text-[11px]">Version 1.0</span>
          </button>
        </div>
      </footer>

      {/* AboutActivity Android Screen Simulator Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Action Bar matching getSupportActionBar().setTitle("About") & setDisplayHomeAsUpEnabled(true) */}
            <div className="bg-[#1A73E8] text-white px-4 py-3 flex items-center justify-between shadow-xs">
              <button
                type="button"
                onClick={() => setIsAboutOpen(false)}
                className="flex items-center gap-2 text-white/90 hover:text-white transition cursor-pointer"
                title="Back (onSupportNavigateUp)"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-base">About</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAboutOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* XML Layout: activity_about.xml rendered */}
            <div className="p-8 flex flex-col items-center justify-center text-center bg-white min-h-[340px]">
              {/* ऐप का नाम */}
              <h2 className="text-[20px] font-bold text-[#333333] mb-6 tracking-tight">
                PAYMENT ANNOUNCER APP
              </h2>

              {/* ओनर लेबल */}
              <p className="text-[14px] font-medium text-[#666666] uppercase tracking-[0.1em]">
                OWNER &amp; DEVELOPER
              </p>

              {/* आपका नाम बड़े अक्षरों में */}
              <h1 className="text-[26px] font-bold text-[#1A73E8] mt-2 tracking-[0.05em]">
                MD IRFAN ALAM
              </h1>

              {/* वर्जन या सब-टेक्स्ट */}
              <p className="text-[12px] text-[#999999] mt-4 font-mono">
                Version 1.0
              </p>

              {/* Java source shortcut */}
              <div className="mt-8 pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAboutOpen(false);
                    setActiveTab('android');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                >
                  View AboutActivity.java Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SoundboxSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
