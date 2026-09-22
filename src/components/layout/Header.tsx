/**
 * App Topbar Header
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Building, 
  Search, 
  Plus, 
  Bell, 
  Globe, 
  LogOut, 
  Shield, 
  Menu, 
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useTheme } from '../../context/ThemeContext';
import { CloudBackupModal } from '../common/CloudBackupModal';
import { Cloud } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenQuickTransaction: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenQuickTransaction,
  onOpenSearch,
}) => {
  const { currentUser, signOut } = useAuth();
  const { language, t } = useLanguage();
  const { projects, selectedProjectId, setSelectedProjectId, accounts, cloudSyncStatus } = useData();
  const { isDark, toggleTheme } = useTheme();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);

  const isBn = language === 'bn';

  // Calculate live cash + bank balance
  const totalLiquidCash = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  return (
    <header className={`sticky top-0 z-30 md:pl-64 border-b px-3 sm:px-6 py-2.5 flex items-center justify-between transition-colors duration-150 ${
      isDark ? 'bg-slate-900 border-slate-800 text-white shadow-md' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
    }`}>
      
      {/* Left: Mobile Menu Trigger & Project Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg md:hidden transition ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs shadow-xs transition ${
          isDark 
            ? 'bg-slate-800/90 hover:bg-slate-800 border-amber-500/40 hover:border-amber-400/70 text-amber-300' 
            : 'bg-amber-50/60 hover:bg-amber-50 border-amber-400/60 text-slate-800'
        }`}>
          <Building className={`w-4 h-4 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <div className="hidden sm:block">
            <span className={`text-[10px] font-bold block leading-none ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {isBn ? 'প্রকল্প ফিল্টার' : 'Filter Project'}
            </span>
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className={`font-bold text-xs sm:text-sm outline-hidden cursor-pointer max-w-[150px] sm:max-w-[240px] border rounded-lg px-2 py-1 transition ${
              isDark 
                ? 'bg-slate-900 text-amber-300 border-slate-700' 
                : 'bg-white text-slate-900 border-slate-300 shadow-2xs'
            }`}
          >
            <option value="ALL" className={isDark ? 'bg-slate-900 text-white font-semibold' : 'bg-white text-slate-900 font-semibold'}>
              {isBn ? '🌐 সকল প্রকল্প ও হেড অফিস (All Combined)' : '🌐 All Projects & Office'}
            </option>
            <option value="company" className={isDark ? 'bg-slate-900 text-slate-100 font-medium' : 'bg-white text-slate-900 font-medium'}>
              🏢 {isBn ? 'হেড অফিস / কোম্পানি অ্যাকাউন্ট' : 'Company Head Office'}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className={isDark ? 'bg-slate-900 text-slate-100 font-medium' : 'bg-white text-slate-900 font-medium'}>
                🏗️ {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Universal Search Bar (Click to open Global Search modal) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={onOpenSearch}
          className={`w-full flex items-center justify-between px-3.5 py-1.5 border rounded-xl text-xs transition ${
            isDark 
              ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border-slate-700/60' 
              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Search className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className="truncate">
              {isBn ? 'ভাউচার নং (CPV-2026-000125), কন্ট্রাক্টর বা খরচ খুঁজুন...' : 'Search voucher, contractor, supplier...'}
            </span>
          </div>
          <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
            isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-white text-slate-600 border-slate-300 shadow-2xs'
          }`}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action, Search Icon (Mobile), Theme Toggle, Language, User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className={`p-2 rounded-lg md:hidden transition ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Global Quick Action Button */}
        <button
          type="button"
          onClick={onOpenQuickTransaction}
          id="btn-quick-new-transaction"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">{isBn ? 'নতুন লেনদেন' : 'New Entry'}</span>
          <span className="sm:hidden">{isBn ? 'এন্ট্রি' : 'New'}</span>
        </button>

        {/* Theme Toggle Button (White Background / Dark Mode) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isBn ? (isDark ? 'সাদা ব্যাকগ্রাউন্ড / লাইট মোড করুন' : 'ডার্ক মোড করুন') : (isDark ? 'Switch to White / Light Mode' : 'Switch to Dark Mode')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-2xs cursor-pointer ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isBn ? 'সাদা মোড' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{isBn ? 'ডার্ক মোড' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Cloud Sync Status & Backup Center Button */}
        <button
          type="button"
          onClick={() => setCloudModalOpen(true)}
          title={isBn ? 'গুগল ফায়ারবেস ক্লাউড ডাটাবেজ ও ব্যাকআপ' : 'Firebase Cloud Database & Backup Center'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-2xs cursor-pointer ${
            cloudSyncStatus === 'CONNECTED'
              ? (isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100')
              : cloudSyncStatus === 'SYNCING'
                ? (isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100')
                : (isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100')
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              cloudSyncStatus === 'CONNECTED' ? 'bg-emerald-400' : cloudSyncStatus === 'SYNCING' ? 'bg-amber-400' : 'bg-rose-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              cloudSyncStatus === 'CONNECTED' ? 'bg-emerald-500' : cloudSyncStatus === 'SYNCING' ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
          </span>
          <Cloud className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden lg:inline">{isBn ? 'ক্লাউড সিঙ্ক' : 'Cloud'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`p-2 rounded-xl relative transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ${isDark ? 'ring-slate-900' : 'ring-white'}`} />
          </button>

          {notificationOpen && (
            <div className={`absolute right-0 mt-2 w-72 border rounded-2xl shadow-xl p-3 z-50 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{isBn ? 'বিজ্ঞপ্তি' : 'Notifications'}</span>
                <span className={`text-[10px] font-mono ${isDark ? 'text-amber-400' : 'text-amber-600 font-bold'}`}>২টি নতুন</span>
              </div>
              <div className="py-2 space-y-2">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                  <p className={`font-bold text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Tokyo Square A - Cement Delivery</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>৫০ ব্যাগ ক্রাউন সিমেন্ট খালাস সম্পন্ন। ভাউচার জেনারেট করা হয়েছে।</p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                  <p className={`font-bold text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>মাসিক হিসাব রিপোর্ট</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>আগস্ট ২০২৬ মাসের খরচের সামারি প্রস্তুত।</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Role & Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`flex items-center gap-2 p-1 pl-2 border rounded-xl transition cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-100' 
                : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs">
              {currentUser?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left pr-1">
              <span className={`font-bold text-xs block leading-tight truncate max-w-[120px] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {currentUser?.displayName}
              </span>
              <span className={`text-[10px] font-mono block leading-none ${isDark ? 'text-amber-400' : 'text-amber-600 font-bold'}`}>
                {t(`role_${currentUser?.role || 'VIEWER'}` as any)}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>

          {userDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-60 border rounded-2xl shadow-xl p-2 z-50 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser?.displayName}</p>
                <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                  isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {t(`role_${currentUser?.role || 'VIEWER'}` as any)}
                </span>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isBn ? 'লগআউট করুন' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Cloud & Backup Modal */}
      <CloudBackupModal 
        isOpen={cloudModalOpen} 
        onClose={() => setCloudModalOpen(false)} 
      />

    </header>
  );
};
