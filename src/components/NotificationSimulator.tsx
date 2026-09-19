import React, { useState, useMemo } from 'react';
import {
  Bell,
  Smartphone,
  ArrowRight,
  Sparkles,
  Check,
  Search,
  Code2,
} from 'lucide-react';
import { SAMPLE_NOTIFICATIONS } from '../data/sampleNotifications';
import { parseNotification } from '../utils/notificationParser';
import { formatAnnouncement } from '../utils/speechEngine';
import { SampleNotification, SoundboxSettings } from '../types';

interface NotificationSimulatorProps {
  settings: SoundboxSettings;
  onAnnounceNotification: (title: string, body: string, packageName?: string) => void;
  isAnnouncing: boolean;
}

export const NotificationSimulator: React.FC<NotificationSimulatorProps> = ({
  settings,
  onAnnounceNotification,
  isAnnouncing,
}) => {
  const [selectedSample, setSelectedSample] = useState<SampleNotification>(SAMPLE_NOTIFICATIONS[0]);
  const [customTitle, setCustomTitle] = useState(SAMPLE_NOTIFICATIONS[0].title);
  const [customBody, setCustomBody] = useState(SAMPLE_NOTIFICATIONS[0].body);
  const [customPackage, setCustomPackage] = useState(SAMPLE_NOTIFICATIONS[0].packageName);

  // Live parsed extraction
  const liveParsed = useMemo(() => {
    return parseNotification(customTitle, customBody, customPackage);
  }, [customTitle, customBody, customPackage]);

  // Live preview speech announcement string
  const speechPreview = useMemo(() => {
    return formatAnnouncement(
      {
        amount: liveParsed.amount,
        currency: liveParsed.currency,
        appDisplayName: liveParsed.appDisplayName,
        payerName: liveParsed.payerName,
        referenceId: liveParsed.referenceId,
      },
      settings
    );
  }, [liveParsed, settings]);

  const handleSelectPreset = (sample: SampleNotification) => {
    setSelectedSample(sample);
    setCustomTitle(sample.title);
    setCustomBody(sample.body);
    setCustomPackage(sample.packageName);
  };

  const handleTrigger = () => {
    onAnnounceNotification(customTitle, customBody, customPackage);
  };

  return (
    <div
      id="notification-simulator-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Android Notification Tester
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate PaymentNotificationService input
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Regex Engine v1.4
          </span>
        </div>

        {/* Quick Presets Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Select Sample Notification:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_NOTIFICATIONS.slice(0, 8).map((sample) => {
              const isSelected = selectedSample.id === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectPreset(sample)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-1 ring-sky-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span className="truncate">{sample.appName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 font-mono">
                    {sample.expectedCurrency}{sample.expectedAmount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone Notification Card Preview / Editor */}
        <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-[11px] truncate max-w-[220px]">
                {customPackage}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Just now</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Notification Title (EXTRA_TITLE)
              </label>
              <input
                id="input-notification-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Notification Title"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Notification Body (EXTRA_TEXT / EXTRA_BIG_TEXT)
              </label>
              <textarea
                id="input-notification-body"
                rows={2}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                placeholder="Notification Body"
              />
            </div>
          </div>
        </div>

        {/* Live Extraction Diagnostics */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-3.5 mb-4 text-xs">
          <div className="flex items-center justify-between font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
            <span className="flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Extracted Parameters
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 rounded">
              Ready to Speak
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <div className="text-[10px] text-slate-400 uppercase">Amount</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {liveParsed.currency}{liveParsed.amount}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <div className="text-[10px] text-slate-400 uppercase">Payer</div>
              <div className="font-bold truncate text-slate-900 dark:text-slate-100">
                {liveParsed.payerName}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <div className="text-[10px] text-slate-400 uppercase">Provider</div>
              <div className="font-bold truncate text-slate-900 dark:text-slate-100">
                {liveParsed.appDisplayName}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <div className="text-[10px] text-slate-400 uppercase">Ref / UTR</div>
              <div className="font-bold truncate text-slate-600 dark:text-slate-400">
                {liveParsed.referenceId || 'N/A'}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40 text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">TTS String:</span>
            <span className="italic text-emerald-900 dark:text-emerald-200 font-medium">
              "{speechPreview}"
            </span>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        id="btn-simulate-notification"
        type="button"
        onClick={handleTrigger}
        disabled={isAnnouncing}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-sky-900/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span>Send Notification to Soundbox</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
