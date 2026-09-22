import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Key, 
  CreditCard,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

interface MasterLockModalProps {
  onOpenMasterControl?: () => void;
}

export const MasterLockModal: React.FC<MasterLockModalProps> = ({ onOpenMasterControl }) => {
  const { settings, updateSettings } = useData();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const license = settings?.license;
  const isLocked = Boolean(license?.isLocked || license?.status === 'SUSPENDED');

  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isLocked) {
    return null;
  }

  const masterPin = license?.masterPin || '76000';
  const monthlyFee = license?.monthlyFee ?? 300;
  const devPhone = license?.developerContact || '01672965561';
  const devEmail = license?.developerEmail || 'Engtotul176@gmail.com';
  const devBkash = license?.developerBkash || '01672965561';

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === masterPin || pin.trim() === '76000') {
      // Calculate next billing date (+30 days)
      const now = new Date();
      now.setDate(now.getDate() + 30);
      const nextDateStr = now.toISOString().split('T')[0];

      updateSettings({
        license: {
          ...(license || {
            status: 'ACTIVE',
            clientName: settings.companyName,
            clientPhone: devPhone,
            monthlyFee: 300,
            masterPin: '76000',
            developerContact: devPhone,
            developerEmail: devEmail,
            developerBkash: devBkash
          }),
          isLocked: false,
          status: 'ACTIVE',
          nextBillingDate: nextDateStr,
          lastPaidDate: new Date().toISOString().split('T')[0]
        }
      });
      setSuccessMsg(isBn ? 'সিস্টেম সফলভাবে আনলক করা হয়েছে এবং ৩০ দিন মেয়াদ বৃদ্ধি পেয়েছে!' : 'System unlocked successfully with 30 days renewal!');
      setTimeout(() => {
        setShowPinInput(false);
        setPin('');
      }, 1500);
    } else {
      setErrorMsg(isBn ? 'ভুল মাস্টার পিন! পুনরায় চেষ্টা করুন।' : 'Invalid Master PIN! Please try again.');
    }
  };

  const handleQuickUnlockOnly = () => {
    if (pin.trim() === masterPin || pin.trim() === '76000') {
      updateSettings({
        license: {
          ...(license || {
            status: 'ACTIVE',
            clientName: settings.companyName,
            clientPhone: devPhone,
            monthlyFee: 300,
            masterPin: '76000',
            developerContact: devPhone,
            developerEmail: devEmail,
            developerBkash: devBkash,
            nextBillingDate: '2026-12-31'
          }),
          isLocked: false,
          status: 'ACTIVE'
        }
      });
      setSuccessMsg(isBn ? 'সিস্টেম সাময়িকভাবে আনলক করা হয়েছে!' : 'System unlocked temporarily!');
      setTimeout(() => {
        setShowPinInput(false);
        setPin('');
      }, 1500);
    } else {
      setErrorMsg(isBn ? 'ভুল মাস্টার পিন!' : 'Invalid Master PIN!');
    }
  };

  return (
    <div 
      id="master-system-lock-overlay"
      className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 text-slate-100 relative">
        
        {/* Top Icon & Badge */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/20 animate-pulse">
            <Lock className="w-10 h-10" />
          </div>
          
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            {isBn ? 'সফটওয়্যার অ্যাক্সেস সাময়িক স্থগিত' : 'Software Access Suspended'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {settings.companyNameBn || settings.companyName || 'Construction Accounts & Project ERP'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {isBn ? 'কনস্ট্রাকশন অ্যাকাউন্টস ও প্রজেক্ট ইআরপি সিস্টেম' : 'Construction Accounts & Project ERP System'}
          </p>
        </div>

        {/* Notice Message */}
        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 mb-6 text-sm text-red-200 leading-relaxed">
          <p className="font-semibold text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {isBn ? 'মাসিক সাবস্ক্রিপশন মেয়াদোত্তীর্ণ নোটিশ:' : 'Monthly Subscription Overdue Notice:'}
          </p>
          <p className="text-slate-300 text-xs sm:text-sm">
            {license?.suspensionNoticeBn || (isBn 
              ? `সম্মানিত গ্রাহক, আপনার অ্যাকাউন্টের মাসিক সাবস্ক্রিপশন ফি (৳ ${monthlyFee}) অপরিশোধিত থাকায় সিস্টেমের স্বাভাবিক কার্যক্রম সাময়িকভাবে স্থগিত রয়েছে। সফটওয়্যারটি পুনরায় চালু করতে কর্তৃপক্ষের সাথে যোগাযোগ করুন।`
              : `Dear Client, software access is suspended due to overdue monthly subscription fee (৳ ${monthlyFee}). Please contact developer authority to reactivate.`
            )}
          </p>
        </div>

        {/* Payment & Contact Details Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-6 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              {isBn ? 'মাসিক বিলিং ফি:' : 'Monthly Renewal Fee:'}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400">
              ৳ {monthlyFee.toLocaleString()} {isBn ? 'টাকা / মাস' : 'BDT / Month'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              {isBn ? 'বিকাশ / নগদ পার্সোনাল নম্বর:' : 'bKash / Nagad Personal:'}
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-pink-400 bg-pink-950/50 px-3 py-1 rounded-xl border border-pink-500/40 select-all">
              {devBkash}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'সফটওয়্যার হটলাইন:' : 'Helpline:'} <strong className="text-white font-mono text-sm">{devPhone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono">{devEmail}</span>
            </div>
          </div>

          {/* Software Authority Branding */}
          <div className="mt-3 pt-3 border-t border-slate-700/50 text-center">
            <p className="text-[11px] font-bold text-amber-300">
              {isBn ? 'পাওয়ার্ড বাই: আবাবিল সফটওয়্যার সলিউশনস' : 'Powered by: Ababil Software Solutions'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isBn ? 'ইঞ্জিনিয়ার মো. তানভীন আহমেদ টুটুল — কনস্ট্রাকশন ইআরপি সলিউশন' : 'Engineer Md. Tanveen Ahmed Tutul — Construction ERP Solution'}
            </p>
          </div>
        </div>

        {/* Master Provider Unlock Section */}
        <div className="border-t border-slate-800 pt-5">
          {!showPinInput ? (
            <div className="text-center">
              <button
                type="button"
                id="btn-open-master-pin"
                onClick={() => {
                  setShowPinInput(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? '🔑 সফটওয়্যার অথরিটি মাস্টার আনলক (Provider Pin)' : '🔑 Software Provider Unlock (Master PIN)'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleUnlockWithPin} className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  {isBn ? 'মাস্টার সিকিউরিটি পিন দিন:' : 'Enter Master Security PIN:'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPinInput(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕ {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={isBn ? 'মাস্টার সিকিউরিটি পিন লিখুন' : 'Enter Master Security PIN'}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-center tracking-widest text-white focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {successMsg}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isBn ? '+১ মাস বৃদ্ধি ও আনলক' : 'Renew +30 Days & Unlock'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickUnlockOnly}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isBn ? 'তাত্ক্ষণিক আনলক' : 'Quick Unlock Only'}</span>
                </button>
              </div>

              {onOpenMasterControl && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (pin.trim() === masterPin || pin.trim() === '76000') {
                        onOpenMasterControl();
                      } else {
                        setErrorMsg(isBn ? 'কন্ট্রোল প্যানেল খুলতে সঠিক পিন দিন' : 'Enter correct PIN to open master panel');
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {isBn ? 'সরাসরি মাস্টার কন্ট্রোল প্যানেল খুলুন ➔' : 'Open Master Control Panel ➔'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
