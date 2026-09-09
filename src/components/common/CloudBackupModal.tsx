import React, { useState, useRef } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudAlert, 
  Download, 
  Upload, 
  RefreshCw, 
  FileJson, 
  ShieldCheck, 
  HelpCircle, 
  X, 
  Database, 
  Laptop, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const {
    cloudSyncStatus,
    cloudLastSyncTime,
    cloudSyncError,
    syncNowWithCloud,
    pullLatestFromCloud,
    exportLocalBackup,
    importLocalBackup,
    vouchers,
    expenses,
    moneyReceived,
    loans,
    accounts,
    projects
  } = useData();

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCloudUpload = async () => {
    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      await syncNowWithCloud();
      setFeedbackMsg({
        type: 'success',
        text: isBn 
          ? 'সফল! সমস্ত লেনদেন, ভাউচার ও প্রজেক্ট ডাটা ফায়ারবেস ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে।' 
          : 'Success! All transactions and vouchers saved to Firebase Cloud successfully.'
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: isBn 
          ? `ক্লাউডে সংরক্ষণে সমস্যা: ${err?.message || 'ইন্টারনেট বা ফায়ারবেস পারমিশন চেক করুন'}`
          : `Failed to save to cloud: ${err?.message || 'Check network or Firebase permission'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloudPull = async () => {
    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      await pullLatestFromCloud();
      setFeedbackMsg({
        type: 'success',
        text: isBn 
          ? 'সফল! ক্লাউড থেকে সর্বশেষ ডাটা সফলভাবে ডাউনলোড ও রিস্টোর করা হয়েছে।' 
          : 'Success! Latest data restored from Firebase Cloud successfully.'
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: isBn 
          ? `ক্লাউড থেকে আনতে সমস্যা: ${err?.message || 'ইন্টারনেট চেক করুন'}` 
          : `Failed to pull from cloud: ${err?.message || 'Check network'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJson = () => {
    try {
      exportLocalBackup();
      setFeedbackMsg({
        type: 'success',
        text: isBn 
          ? 'কম্পিউটারে ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে। এই ফাইলটি নিরাপদ জায়গায় রাখুন।' 
          : 'Backup file downloaded successfully to your computer.'
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: isBn ? 'ফাইল ডাউনলোড ব্যর্থ হয়েছে।' : 'Failed to export backup file.'
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(isBn 
      ? 'আপনি কি ব্যাকআপ ফাইল থেকে ডাটা রিস্টোর করতে চান? এটি বর্তমান তালিকায় নতুন এন্ট্রি যুক্ত করবে।' 
      : 'Are you sure you want to restore from this backup file?'
    )) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      await importLocalBackup(file);
      setFeedbackMsg({
        type: 'success',
        text: isBn 
          ? 'ব্যাকআপ ফাইল থেকে সফলভাবে ডাটা রিস্টোর হয়েছে এবং ক্লাউডে সিঙ্ক করা হয়েছে।' 
          : 'Data successfully restored from file and synced to cloud.'
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: isBn ? (err?.message || 'ভুল ফাইল ফরম্যাট') : (err?.message || 'Invalid file format')
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isBn ? 'ক্লাউড ডাটাবেজ ও লাইভ সিঙ্ক সেন্টার' : 'Cloud Database & Live Sync'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isBn 
                  ? 'গুগল ফায়ারবেস ক্লাউড ডাটাবেজ (মোবাইল, ল্যাপটপ ও বাসার পিসির জন্য)' 
                  : 'Google Firebase Cloud Database (Auto-sync across all devices)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          
          {/* Feedback Message */}
          {feedbackMsg && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              feedbackMsg.type === 'success' 
                ? (isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                : (isDark ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800')
            }`}>
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span className="font-medium">{feedbackMsg.text}</span>
            </div>
          )}

          {/* Cloud Live Status Banner */}
          <div className={`p-4 rounded-xl border ${
            cloudSyncStatus === 'CONNECTED'
              ? (isDark ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-emerald-50/80 border-emerald-200')
              : cloudSyncStatus === 'SYNCING'
                ? (isDark ? 'bg-amber-950/20 border-amber-800/60' : 'bg-amber-50/80 border-amber-200')
                : (isDark ? 'bg-rose-950/20 border-rose-800/60' : 'bg-rose-50/80 border-rose-200')
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    cloudSyncStatus === 'CONNECTED' ? 'bg-emerald-400' : cloudSyncStatus === 'SYNCING' ? 'bg-amber-400' : 'bg-rose-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    cloudSyncStatus === 'CONNECTED' ? 'bg-emerald-500' : cloudSyncStatus === 'SYNCING' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}></span>
                </span>
                <span className="font-bold text-sm">
                  {cloudSyncStatus === 'CONNECTED' && (isBn ? 'গুগল ফায়ারবেস ক্লাউড সংযুক্ত (লাইভ সিঙ্ক সক্রিয়)' : 'Firebase Cloud Connected (Live Sync Active)')}
                  {cloudSyncStatus === 'SYNCING' && (isBn ? 'ক্লাউডের সাথে তথ্য আদান-প্রদান হচ্ছে...' : 'Syncing with cloud database...')}
                  {cloudSyncStatus === 'ERROR' && (isBn ? 'ক্লাউড সংযোগে ত্রুটি' : 'Cloud Sync Error')}
                  {cloudSyncStatus === 'OFFLINE' && (isBn ? 'অফলাইন মোড' : 'Offline Mode')}
                </span>
              </div>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border text-slate-600'
              }`}>
                প্রজেক্ট: tokyosquareconventionerp
              </span>
            </div>

            {cloudLastSyncTime && (
              <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isBn ? 'সর্বশেষ সফল সিঙ্ক:' : 'Last Synced:'} <strong className="font-mono">{cloudLastSyncTime}</strong>
              </p>
            )}

            {cloudSyncError && (
              <p className="mt-2 text-xs text-rose-500 font-medium">
                {cloudSyncError}
              </p>
            )}
          </div>

          {/* Current Live Records Count */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className={`p-2.5 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs text-slate-500">{isBn ? 'ভাউচার' : 'Vouchers'}</div>
              <div className="text-base font-bold text-amber-500 font-mono">{vouchers.length}</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs text-slate-500">{isBn ? 'খরচ' : 'Expenses'}</div>
              <div className="text-base font-bold text-rose-500 font-mono">{expenses.length}</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs text-slate-500">{isBn ? 'টাকা গ্রহণ' : 'Receipts'}</div>
              <div className="text-base font-bold text-emerald-500 font-mono">{moneyReceived.length}</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs text-slate-500">{isBn ? 'ঋণ/কর্জ' : 'Loans'}</div>
              <div className="text-base font-bold text-sky-500 font-mono">{loans.length}</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs text-slate-500">{isBn ? 'অ্যাকাউন্ট' : 'Accounts'}</div>
              <div className="text-base font-bold text-indigo-500 font-mono">{accounts.length}</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xs text-slate-500">{isBn ? 'প্রজেক্ট' : 'Projects'}</div>
              <div className="text-base font-bold text-amber-500 font-mono">{projects.length}</div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {isBn ? 'লাইভ ক্লাউড ও ব্যাকআপ অপশন' : 'Live Cloud & Backup Actions'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Force Cloud Upload */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCloudUpload}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isDark 
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                } shadow-xs hover:border-amber-500/50`}
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isBn ? 'ক্লাউডে সব ডাটা সেভ করুন' : 'Push Data to Cloud'}
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isBn 
                      ? 'বর্তমান সব ডাটা সরাসরি ফায়ারবেস ক্লাউডে তাৎক্ষণিক আপলোড করুন' 
                      : 'Force sync and save all local entries to Firebase Cloud now'}
                  </div>
                </div>
              </button>

              {/* Force Cloud Download */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCloudPull}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isDark 
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                } shadow-xs hover:border-sky-500/50`}
              >
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isBn ? 'ক্লাউড থেকে সব ডাটা আনুন' : 'Pull Data from Cloud'}
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isBn 
                      ? 'ল্যাপটপ বা মোবাইলের ডাটা পেতে ক্লাউড থেকে ফ্রেশ কপি নামিয়ে নিন' 
                      : 'Fetch the latest master dataset from Firebase Cloud'}
                  </div>
                </div>
              </button>

              {/* Download JSON Backup File */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExportJson}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isDark 
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                } shadow-xs hover:border-emerald-500/50`}
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isBn ? 'কম্পিউটারে ব্যাকআপ ফাইল সেভ করুন' : 'Export Offline JSON Backup'}
                  </div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isBn 
                      ? 'সম্পূর্ণ ইআরপির একটি .json ফাইল ডাউনলোড করে পেনড্রাইভ বা পিসিতে রাখুন' 
                      : 'Download a full ERP JSON backup file to your computer drive'}
                  </div>
                </div>
              </button>

              {/* Restore from JSON Backup */}
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".json" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isDark 
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  } shadow-xs hover:border-purple-500/50`}
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                    <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">
                      {isBn ? 'ব্যাকআপ ফাইল থেকে রিস্টোর করুন' : 'Restore from JSON File'}
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isBn 
                        ? 'আগে ডাউনলোড করা কোনো JSON ব্যাকআপ ফাইল থাকলে তা লোড করুন' 
                        : 'Import and restore from a previously downloaded JSON backup'}
                    </div>
                  </div>
                </button>
              </div>

            </div>
          </div>

          {/* Information & Peace of Mind Guide */}
          <div className={`p-4 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-amber-50/40 border-amber-200/80 text-slate-700'
          }`}>
            <div className="flex items-center gap-2 font-bold text-amber-500 text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'ডাটা নিরাপত্তা ও ডিভাইস সিনক্রোনাইজেশন গাইড' : 'Data Security & Synchronization Guide'}</span>
            </div>

            <div className="text-xs space-y-2 leading-relaxed">
              <p>
                <strong>১. নতুন আপডেট বা কোড পরিবর্তনের পরও কি ডাটা থাকবে?</strong><br />
                {isBn 
                  ? 'হ্যাঁ, ১০০% থাকবে। আপনার সমস্ত ডাটা স্বয়ংক্রিয়ভাবে গুগল ফায়ারবেস ক্লাউড ডাটাবেজে (Cloud Database) সংরক্ষিত হচ্ছে। AI Studio বা GitHub থেকে নতুন কোড ডাউনলোড বা আপডেট করলেও ডাটা কখনোই মুছে যাবে না।'
                  : 'Yes! All your records are securely preserved in Firebase Cloud Database. Updating the app code will never wipe out your financial entries.'}
              </p>
              <p>
                <strong>২. ল্যাপটপ এবং বাসার পিসিতে ডাটা কিভাবে একসাথে থাকবে?</strong><br />
                {isBn 
                  ? 'আপনার অফিস ল্যাপটপ, বাসার কম্পিউটার কিংবা মোবাইল—সবগুলোতেই একই ক্লাউড ডাটাবেজ ব্যবহার হচ্ছে। অফিসে এন্ট্রি করার সাথে সাথে তা ক্লাউডে সেভ হয়ে যায়। বাসায় এসে নেট কানেকশন থাকলে স্বয়ংক্রিয়ভাবে সেই ডাটা দেখতে পাবেন।'
                  : 'All devices sync against the same live Firestore collection. As long as you have internet, entries made on one device will automatically show on your other devices.'}
              </p>
              <p>
                <strong>৩. অতিরিক্ত সতর্কতার জন্য সেরা উপায়:</strong><br />
                {isBn 
                  ? 'প্রতি সপ্তাহে বা মাসে একবার "কম্পিউটারে ব্যাকআপ ফাইল সেভ করুন" বাটনে ক্লিক করে একটি ব্যাকআপ ফাইল আপনার কম্পিউটারে রেখে দিন।'
                  : 'Export a JSON backup to your PC periodically for local cold-storage safety.'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase Firestore: tokyosquareconventionerp</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-xs"
          >
            {isBn ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
