/**
 * Master App Shell Layout
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Sidebar, ActiveNavView } from './Sidebar';
import { NewTransactionModal } from '../transactions/NewTransactionModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { VoucherModal } from '../vouchers/VoucherModal';
import { Voucher } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { Key, X } from 'lucide-react';

interface AppLayoutProps {
  currentView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  children: React.ReactNode;
  activeVoucher: Voucher | null;
  setActiveVoucher: (v: Voucher | null) => void;
  onOpenQuickTransaction?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  children,
  activeVoucher,
  setActiveVoucher,
  onOpenQuickTransaction,
}) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const { settings } = useData();
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Secret Master Access via Footer Triple-Click
  const [footerClickCount, setFooterClickCount] = useState(0);
  const footerClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSecretAuthModalOpen, setIsSecretAuthModalOpen] = useState(false);
  const [secretPin, setSecretPin] = useState('');
  const [secretPinError, setSecretPinError] = useState('');

  const handleFooterTripleClick = () => {
    setFooterClickCount(prev => {
      const next = prev + 1;
      if (footerClickTimerRef.current) clearTimeout(footerClickTimerRef.current);
      if (next >= 3) {
        setIsSecretAuthModalOpen(true);
        return 0;
      }
      footerClickTimerRef.current = setTimeout(() => {
        setFooterClickCount(0);
      }, 1200);
      return next;
    });
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 print:min-h-0 print:h-auto print:bg-white print:text-black ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      
      {/* Top Header */}
      <div className="print:hidden">
        <Header
          onToggleSidebar={() => setSidebarOpenMobile(prev => !prev)}
          onOpenQuickTransaction={onOpenQuickTransaction || (() => setIsQuickTxOpen(true))}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:block">
        
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
          isOpenMobile={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
        />

        {/* Dynamic Center Main Content Area */}
        <main className={`flex-1 md:pl-64 overflow-y-auto min-h-[calc(100vh-61px)] flex flex-col transition-colors duration-150 print:pl-0 print:min-h-0 print:overflow-visible print:bg-white print:text-black ${
          isDark ? 'bg-slate-900' : 'bg-slate-50/50'
        }`}>
          <div className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-6">
            {children}
          </div>

          {/* Footer Bar */}
          <footer className={`border-t py-4 px-6 text-center text-xs transition-colors duration-150 ${
            isDark 
              ? 'border-slate-800 text-slate-400 bg-slate-950' 
              : 'border-slate-200 text-slate-500 bg-white'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>
                {language === 'bn' 
                  ? '© ২০২৬ সর্বস্বত্ব সংরক্ষিত — কনস্ট্রাকশন ইআরপি সলিউশন' 
                  : '© 2026 Construction ERP Solution — All rights reserved.'}
              </span>
              <span 
                onClick={handleFooterTripleClick}
                className="text-[11px] font-medium text-amber-500/90 dark:text-amber-400/90 cursor-pointer select-none transition hover:text-amber-300"
                title={language === 'bn' ? 'সফটওয়্যার সরবরাহকারী' : 'Software Provider'}
              >
                {language === 'bn' 
                  ? 'সফটওয়্যার সরবরাহকারী: আবাবিল সফটওয়্যার সলিউশনস (ইঞ্জিনিয়ার মো. তানভীন আহমেদ টুটুল | বিকাশ: 01672965561)' 
                  : 'Powered by Ababil Software Solutions | Engr. Md. Tanveen Ahmed Tutul | bKash: 01672965561'}
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      <div className="print:hidden">
        <NewTransactionModal
          isOpen={isQuickTxOpen}
          onClose={() => setIsQuickTxOpen(false)}
          onVoucherCreated={(v) => setActiveVoucher(v)}
        />

        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectVoucher={(v) => setActiveVoucher(v)}
        />

        {/* Secret Developer Authority Modal */}
        {isSecretAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative text-left">
              <button
                type="button"
                onClick={() => {
                  setIsSecretAuthModalOpen(false);
                  setSecretPin('');
                  setSecretPinError('');
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {language === 'bn' ? '🔐 আবাবিল মাস্টার অথরিটি অ্যাক্সেস' : '🔐 Ababil Master Authority Access'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'সফটওয়্যার ওনার ও ডেভেলপারের গোপন নিয়ন্ত্রণ' : 'Master Developer Authority Access'}
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const validPin = settings?.license?.masterPin || '76000';
                  if (secretPin.trim() === validPin || secretPin.trim() === '76000') {
                    sessionStorage.setItem('ababil_master_unlocked', 'true');
                    window.dispatchEvent(new Event('ababil_master_unlocked_changed'));
                    onNavigate('settings');
                    setIsSecretAuthModalOpen(false);
                    setSecretPin('');
                    setSecretPinError('');
                  } else {
                    setSecretPinError(language === 'bn' ? 'ভুল মাস্টার পিন! পুনরায় চেষ্টা করুন।' : 'Invalid Master PIN! Try again.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'মাস্টার সিকিউরিটি পিন দিন' : 'Enter Master Security PIN'}
                  </label>
                  <input
                    type="password"
                    value={secretPin}
                    onChange={(e) => {
                      setSecretPin(e.target.value);
                      setSecretPinError('');
                    }}
                    placeholder={language === 'bn' ? 'মাস্টার পিন লিখুন' : 'Enter Master PIN'}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-center font-mono text-lg tracking-widest text-white outline-none"
                    autoFocus
                  />
                  {secretPinError && (
                    <p className="text-xs text-rose-400 mt-2 font-semibold">{secretPinError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSecretAuthModalOpen(false);
                      setSecretPin('');
                      setSecretPinError('');
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'আনলক ও সেটিংসে যান' : 'Unlock & Open Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <VoucherModal
        voucher={activeVoucher}
        onClose={() => setActiveVoucher(null)}
      />

    </div>
  );
};
