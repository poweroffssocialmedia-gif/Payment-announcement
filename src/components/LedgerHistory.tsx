import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  Trash2,
  Volume2,
  Search,
  Filter,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { PaymentRecord } from '../types';

interface LedgerHistoryProps {
  payments: PaymentRecord[];
  onReplayPayment: (payment: PaymentRecord) => void;
  onClearHistory: () => void;
}

export const LedgerHistory: React.FC<LedgerHistoryProps> = ({
  payments,
  onReplayPayment,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApp, setFilterApp] = useState('all');

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const count = payments.length;
    const avg = count > 0 ? Math.round(totalAmount / count) : 0;
    return {
      totalAmount,
      count,
      avg,
    };
  }, [payments]);

  // Filtered payments
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.appDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.amount.toString().includes(searchTerm) ||
        (p.referenceId && p.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesApp = filterApp === 'all' || p.app === filterApp;

      return matchesSearch && matchesApp;
    });
  }, [payments, searchTerm, filterApp]);

  const handleExportCSV = () => {
    if (payments.length === 0) return;
    const headers = 'ID,Date,Time,App,Amount,Currency,Payer,Reference,Speech_Text\n';
    const rows = payments
      .map((p) => {
        const d = new Date(p.timestamp);
        const dateStr = d.toLocaleDateString();
        const timeStr = d.toLocaleTimeString();
        return `"${p.id}","${dateStr}","${timeStr}","${p.appDisplayName}",${p.amount},"${p.currency}","${p.payerName}","${p.referenceId || ''}","${p.speechText.replace(/"/g, '""')}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment_announcer_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="ledger-history-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Today
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{metrics.totalAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live Settlement
            </div>
          </div>

          <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/40 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
              Announced
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-sky-600 dark:text-sky-400 mt-0.5">
              {metrics.count} <span className="text-xs font-normal">txns</span>
            </div>
            <div className="text-[10px] text-sky-700/70 dark:text-sky-400/70 mt-0.5">
              100% TTS Accuracy
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl p-3.5">
            <div className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              Avg Ticket
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
              ₹{metrics.avg.toLocaleString()}
            </div>
            <div className="text-[10px] text-purple-700/70 dark:text-purple-400/70 mt-0.5">
              Per Transaction
            </div>
          </div>
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-ledger-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payer, amount, UTR..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              id="select-ledger-app-filter"
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
            >
              <option value="all">All Apps</option>
              <option value="phonepe">PhonePe</option>
              <option value="gpay">Google Pay</option>
              <option value="paytm">Paytm</option>
              <option value="bhim">BHIM UPI</option>
              <option value="bank_sms">Bank SMS</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={payments.length === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-clear-ledger"
              type="button"
              onClick={onClearHistory}
              disabled={payments.length === 0}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition disabled:opacity-40"
              title="Clear Ledger"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium">No payment transactions recorded yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulate a notification or tap "Test ₹100" to trigger the soundbox
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 text-sm">
                    {p.currency}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {p.payerName}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-md font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {p.appDisplayName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>
                        {new Date(p.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {p.referenceId && (
                        <span>• Ref: {p.referenceId.slice(0, 10)}...</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    +{p.currency}{p.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onReplayPayment(p)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-600 transition active:scale-95"
                    title="Replay Voice Announcement"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono">
        <span>STORE LEDGER • REALTIME PERSISTENCE</span>
        <span>{filtered.length} of {payments.length} shown</span>
      </div>
    </div>
  );
};
