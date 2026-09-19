import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Wifi,
  Radio,
  Sparkles,
  CheckCircle2,
  Play,
  Square,
} from 'lucide-react';
import { PaymentRecord, SoundboxSettings } from '../types';

interface SoundboxDeviceProps {
  isAnnouncing: boolean;
  activePayment: PaymentRecord | null;
  lastPayment: PaymentRecord | null;
  settings: SoundboxSettings;
  onUpdateSettings: (newSettings: Partial<SoundboxSettings>) => void;
  onReplayLast: () => void;
  onStop: () => void;
  onQuickSimulate: (amount: number, appName: string) => void;
}

export const SoundboxDevice: React.FC<SoundboxDeviceProps> = ({
  isAnnouncing,
  activePayment,
  lastPayment,
  settings,
  onUpdateSettings,
  onReplayLast,
  onStop,
  onQuickSimulate,
}) => {
  const currentDisplay = activePayment || lastPayment;

  return (
    <div
      id="soundbox-device-container"
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between"
    >
      {/* Subtle background glow effect when announcing */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-sky-500/20 blur-xl transition-opacity duration-500 pointer-events-none ${
          isAnnouncing ? 'opacity-100' : 'opacity-20'
        }`}
      />

      {/* Top Header / Status Row */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-slate-100 uppercase">
                Payment Soundbox Pro
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              4G LTE • VoLTE • Battery: 94%
            </p>
          </div>
        </div>

        {/* Hardware Status LEDs */}
        <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono">Synced</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isAnnouncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="text-[11px] font-mono">
              {isAnnouncing ? 'SPEAKING' : 'IDLE'}
            </span>
          </span>
        </div>
      </div>

      {/* Digital LED Screen */}
      <div
        id="soundbox-led-screen"
        className="relative z-10 bg-slate-950 rounded-2xl p-5 border border-slate-800/90 shadow-inner mb-6"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span>MERCHANT SOUNDPOD DISPLAY</span>
          <span className="text-emerald-400 font-semibold">
            {isAnnouncing ? '⚡ TRANSMITTING VOICE' : 'STANDBY READY'}
          </span>
        </div>

        <div className="min-h-[96px] flex flex-col items-center justify-center text-center">
          {currentDisplay ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {currentDisplay.appDisplayName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(currentDisplay.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight flex items-center justify-center gap-1">
                <span>{currentDisplay.currency}</span>
                <span>{currentDisplay.amount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto line-clamp-1">
                {currentDisplay.payerName && currentDisplay.payerName !== 'Customer'
                  ? `From ${currentDisplay.payerName}`
                  : 'UPI Instant Settlement'}
              </p>
            </div>
          ) : (
            <div className="py-2 text-slate-500">
              <div className="text-2xl font-mono font-bold text-slate-400 tracking-wider">
                READY FOR PAYMENT
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Waiting for UPI / bank notification trigger
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Voice Soundwave Bars */}
        <div className="flex items-center justify-center gap-1.5 h-7 mt-3 pt-2 border-t border-slate-900">
          {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 40].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isAnnouncing
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-800'
              }`}
              style={{
                height: isAnnouncing ? `${Math.max(15, h * 0.25)}px` : '4px',
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Acoustic Speaker Grille Pattern */}
      <div
        id="soundbox-speaker-grille"
        className="relative z-10 bg-gradient-to-b from-slate-950 to-slate-900/90 rounded-2xl p-4 border border-slate-800/80 mb-6 flex flex-col items-center justify-center"
      >
        <div className="w-full flex justify-between items-center px-2 mb-2 text-[11px] font-mono text-slate-400">
          <span>HIGH DYNAMICS 5W TRANSDUCER</span>
          <span>{Math.round(settings.volume * 100)}% GAIN</span>
        </div>

        {/* Perforated holes pattern */}
        <div className="grid grid-cols-12 gap-2 p-2 w-full max-w-md place-items-center">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                isAnnouncing && i % 3 === 0
                  ? 'bg-emerald-500/70 shadow-sm shadow-emerald-400'
                  : 'bg-slate-800/90'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tactile Hardware Buttons */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <button
          id="btn-soundbox-volume-down"
          type="button"
          onClick={() =>
            onUpdateSettings({ volume: Math.max(0.1, +(settings.volume - 0.1).toFixed(1)) })
          }
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold transition border border-slate-700"
          title="Decrease Volume"
        >
          <VolumeX className="w-4 h-4 text-slate-400" />
          <span>Vol -</span>
        </button>

        <button
          id="btn-soundbox-volume-up"
          type="button"
          onClick={() =>
            onUpdateSettings({ volume: Math.min(1.0, +(settings.volume + 0.1).toFixed(1)) })
          }
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold transition border border-slate-700"
          title="Increase Volume"
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Vol +</span>
        </button>

        <button
          id="btn-soundbox-replay"
          type="button"
          onClick={onReplayLast}
          disabled={!lastPayment && !activePayment}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold transition border border-slate-700 disabled:opacity-40 disabled:pointer-events-none"
          title="Replay Last Announcement"
        >
          <RotateCcw className="w-4 h-4 text-sky-400" />
          <span>Repeat</span>
        </button>

        {isAnnouncing ? (
          <button
            id="btn-soundbox-stop"
            type="button"
            onClick={onStop}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition border border-rose-500 shadow-md shadow-rose-900/50"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Silence</span>
          </button>
        ) : (
          <button
            id="btn-soundbox-test"
            type="button"
            onClick={() => onQuickSimulate(100, 'Google Pay')}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition border border-emerald-500 shadow-md shadow-emerald-950"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test ₹100</span>
          </button>
        )}
      </div>

      {/* Quick Simulate Pills */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Soundbox Trigger:
          </span>
          <span className="text-[11px] text-slate-500">Tap to announce</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { amount: 50, app: 'PhonePe' },
            { amount: 150, app: 'Google Pay' },
            { amount: 250, app: 'Paytm' },
            { amount: 500, app: 'BHIM UPI' },
            { amount: 1200, app: 'Bank SMS' },
          ].map((item) => (
            <button
              key={`${item.app}-${item.amount}`}
              type="button"
              onClick={() => onQuickSimulate(item.amount, item.app)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700/60 transition active:scale-95"
            >
              ₹{item.amount} ({item.app})
            </button>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>DEV: <strong className="text-sky-400 font-semibold">MD IRFAN ALAM</strong></span>
          <span>v1.0 • SOUNDBOX EDITION</span>
        </div>
      </div>
    </div>
  );
};
