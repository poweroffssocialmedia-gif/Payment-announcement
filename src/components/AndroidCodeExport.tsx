import React, { useState } from 'react';
import {
  Copy,
  Check,
  FileCode,
  Download,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { ANDROID_FILES, AndroidFile } from '../data/androidProjectCode';

export const AndroidCodeExport: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'java' | 'config' | 'kotlin'>('all');
  const [activeFile, setActiveFile] = useState<AndroidFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);

  const filteredFiles = ANDROID_FILES.filter((f) => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadActive = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      id="android-code-export-container"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Native Android Implementation
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                com.example.paymentannouncer
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Java NotificationListenerService &amp; AndroidManifest.xml configured for background UPI voice announcements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-android-code"
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-slate-200 dark:border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            id="btn-download-android-file"
            type="button"
            onClick={handleDownloadActive}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs shadow-emerald-900/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Architecture Notice Banner */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-4 mb-5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">How NotificationListenerService Operates:</span>
          <p className="mt-1 text-amber-800 dark:text-amber-300/90 leading-relaxed">
            <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">PaymentNotificationService</code> is bound with Android&apos;s <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">BIND_NOTIFICATION_LISTENER_SERVICE</code> permission. When the app is installed, the user grants permission via <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS</code>. Once enabled, Android delivers incoming payment notifications from PhonePe, GPay, Paytm, and bank SMS directly to the background service, instantly triggering the TextToSpeech engine with <strong>&quot;आपको [राशि] रुपये प्राप्त हुए&quot;</strong>.
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" /> Filter:
          </span>
          {(
            [
              { id: 'all', label: 'All Files' },
              { id: 'java', label: 'Java (Requested)' },
              { id: 'config', label: 'Manifest & Gradle' },
              { id: 'kotlin', label: 'Kotlin' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                const matching = ANDROID_FILES.find((f) => cat.id === 'all' || f.category === cat.id);
                if (matching) setActiveFile(matching);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
        {filteredFiles.map((f) => {
          const isSelected = activeFile.name === f.name;
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => setActiveFile(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{f.name}</span>
              <span className={`text-[10px] uppercase font-mono px-1 rounded ${
                isSelected
                  ? 'bg-white/20 text-white dark:bg-black/10 dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {f.language}
              </span>
            </button>
          );
        })}
      </div>

      {/* File Description Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
        <span className="truncate max-w-md">{activeFile.path}</span>
        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          {activeFile.language}
        </span>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2.5 text-xs text-slate-400 font-mono flex items-center justify-between border-b border-slate-800">
          <span className="font-semibold text-slate-200">{activeFile.name}</span>
          <span className="text-[11px] text-slate-400 max-w-lg truncate">{activeFile.description}</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[440px] leading-relaxed select-text">
          <code>{activeFile.content}</code>
        </pre>
      </div>

      {/* Setup Guide Steps */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
            1. Android Studio Project
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-normal">
            Create an empty project with package <code className="font-mono text-emerald-600 dark:text-emerald-400">com.example.paymentannouncer</code> and add <code className="font-mono text-emerald-600 dark:text-emerald-400">PaymentNotificationService.java</code>.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
            2. Grant Notification Permission
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-normal">
            Launch <code className="font-mono text-emerald-600 dark:text-emerald-400">MainActivity</code> and tap &quot;Grant Notification Access&quot; to open the Android Special App Access settings screen.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
            3. 24/7 Store Readiness
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-normal">
            Disable battery optimization for this app so Android does not put the NotificationListener to sleep while running continuously.
          </p>
        </div>
      </div>
    </div>
  );
};
