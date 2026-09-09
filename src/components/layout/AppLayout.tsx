/**
 * Master App Shell Layout
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar, ActiveNavView } from './Sidebar';
import { NewTransactionModal } from '../transactions/NewTransactionModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { VoucherModal } from '../vouchers/VoucherModal';
import { Voucher } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            <span>
              {language === 'bn' 
                ? '© ২০২৬ এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ — সর্বস্বত্ব সংরক্ষিত।' 
                : '© 2026 S.M. Khalilur Rahman Properties Ltd. — All rights reserved.'}
            </span>
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
      </div>

      <VoucherModal
        voucher={activeVoucher}
        onClose={() => setActiveVoucher(null)}
      />

    </div>
  );
};
