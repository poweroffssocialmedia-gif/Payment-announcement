import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sliders,
  Music,
  Languages,
  Mic,
  RotateCcw,
  Sparkles,
  Play,
} from 'lucide-react';
import { SoundboxSettings, ChimeSoundType, TemplatePreset } from '../types';
import { getAvailableVoices } from '../utils/speechEngine';
import { playChimeSound } from '../utils/soundSynthesizer';

interface SoundboxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SoundboxSettings;
  onSave: (newSettings: SoundboxSettings) => void;
}

export const SoundboxSettingsModal: React.FC<SoundboxSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [draft, setDraft] = useState<SoundboxSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    getAvailableVoices().then((v) => {
      const seen = new Set<string>();
      const uniqueVoices: SpeechSynthesisVoice[] = [];
      for (const item of v) {
        const key = `${item.voiceURI || item.name}___${item.lang}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueVoices.push(item);
        }
      }
      setVoices(uniqueVoices);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestChime = (chime: ChimeSoundType) => {
    playChimeSound(chime, draft.chimeVolume);
  };

  const handleApply = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div
      id="soundbox-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="soundbox-settings-modal-dialog"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-900 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base">Soundbox & Voice Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure TTS voice, chime sound effects, and announcement phrasing
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Section 1: Voice & Language */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              <Languages className="w-3.5 h-3.5 text-sky-500" />
              Text-To-Speech Voice
            </label>

            <select
              id="select-tts-voice"
              value={draft.voiceURI}
              onChange={(e) => {
                const uri = e.target.value;
                const v = voices.find((item) => (item.voiceURI || item.name) === uri);
                setDraft((prev) => ({
                  ...prev,
                  voiceURI: uri,
                  language: v ? v.lang : prev.language,
                }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Default System Voice</option>
              {voices.map((v, idx) => (
                <option key={`tts-voice-${v.voiceURI || v.name}-${v.lang}-${idx}`} value={v.voiceURI || v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Chime Audio Sound */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Music className="w-3.5 h-3.5 text-emerald-500" />
                Pre-Announcement Chime Sound
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Play Chime:</span>
                <input
                  type="checkbox"
                  checked={draft.playChimeBeforeVoice}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, playChimeBeforeVoice: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'soundbox_chime', label: 'Soundbox Beep' },
                  { id: 'cash_register', label: 'Cash Register' },
                  { id: 'digital_bell', label: 'Digital Bell' },
                  { id: 'marimba', label: 'Warm Marimba' },
                  { id: 'arcade', label: 'Retro Blip' },
                ] as const
              ).map((chime) => {
                const isSelected = draft.chimeSound === chime.id;
                return (
                  <div
                    key={chime.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, chimeSound: chime.id }))
                    }
                  >
                    <span>{chime.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestChime(chime.id);
                      }}
                      className="p-1 rounded-md bg-white dark:bg-slate-700 shadow-xs hover:text-emerald-600 dark:hover:text-emerald-400"
                      title="Preview Chime"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Speech Rates & Pitch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Speed / Rate: {draft.rate.toFixed(2)}x</span>
                <span className="text-slate-400 font-normal">Normal = 1.0</span>
              </div>
              <input
                id="range-speech-rate"
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={draft.rate}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))
                }
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Voice Pitch: {draft.pitch.toFixed(2)}</span>
                <span className="text-slate-400 font-normal">Normal = 1.0</span>
              </div>
              <input
                id="range-speech-pitch"
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={draft.pitch}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, pitch: parseFloat(e.target.value) }))
                }
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Announcement Template */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Announcement Phrasing Template:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
              {[
                { id: 'hindi', label: 'हिंदी (सेवा डिफ़ॉल्ट)', desc: 'आपको 150 रुपये प्राप्त हुए' },
                { id: 'hindi_detailed', label: 'हिंदी (विस्तृत)', desc: 'फोनपे पर 150 रुपये प्राप्त हुए' },
                { id: 'standard', label: 'Standard', desc: 'Received ₹150 on GPay' },
                { id: 'detailed', label: 'Detailed', desc: 'Received ₹150 from Rahul on GPay' },
                { id: 'short', label: 'Short', desc: '150 rupees received' },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, template: tpl.id as TemplatePreset }))
                  }
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    draft.template === tpl.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold">{tpl.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {tpl.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Repeat count & Auto Announce */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Repeat Announcement
                  </div>
                  <div className="text-[11px] text-slate-500">For noisy store floors</div>
                </div>
                <select
                  value={draft.repeatCount}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      repeatCount: parseInt(e.target.value) as 1 | 2,
                    }))
                  }
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  <option value={1}>1 time</option>
                  <option value={2}>2 times</option>
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Auto-Announce
                  </div>
                  <div className="text-[11px] text-slate-500">Speak immediately on receipt</div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.autoAnnounce}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, autoAnnounce: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            id="btn-cancel-settings"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            id="btn-save-settings"
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition active:scale-95"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
