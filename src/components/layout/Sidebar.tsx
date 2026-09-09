/**
 * App Sidebar Navigation
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { 
  LayoutDashboard, 
  Building2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  Wallet, 
  Landmark, 
  BookOpen, 
  Layers, 
  Truck, 
  Users, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  UserCheck, 
  X,
  Sparkles,
  Cloud
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { hasPermission } from '../../utils/permissions';
import buildingLogoImg from '../../assets/images/skrp_building_logo_1788342210019.jpg';
import { CloudBackupModal } from '../common/CloudBackupModal';

export type ActiveNavView = 
  | 'DASHBOARD'
  | 'PROJECTS'
  | 'MONEY_RECEIVED'
  | 'EXPENSES'
  | 'VOUCHERS'
  | 'ACCOUNTS'
  | 'LOANS'
  | 'LEDGER'
  | 'MATERIALS'
  | 'SUPPLIERS'
  | 'CONTRACTORS'
  | 'CONTRACTOR_PAYMENTS'
  | 'MONTHLY_BILLS'
  | 'REPORTS'
  | 'USERS'
  | 'AUDIT_LOGS'
  | 'SETTINGS';

interface SidebarProps {
  currentView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const { settings, cloudSyncStatus } = useData();

  const [cloudModalOpen, setCloudModalOpen] = React.useState(false);

  const isBn = language === 'bn';
  const role = currentUser?.role;
  const currentLogo = settings?.logoUrl || buildingLogoImg;

  const navItem = (view: ActiveNavView, labelBn: string, labelEn: string, icon: React.ReactNode, count?: number) => {
    const active = currentView === view;
    return (
      <button
        type="button"
        key={view}
        id={`nav-${view.toLowerCase()}`}
        onClick={() => {
          onNavigate(view);
          onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition duration-150 cursor-pointer ${
          active
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
            : isDark 
              ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className={`shrink-0 ${active ? 'text-slate-950' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
            {icon}
          </span>
          <span className="truncate">{isBn ? labelBn : labelEn}</span>
        </div>
        {count !== undefined && (
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
            active 
              ? 'bg-slate-950 text-amber-400' 
              : isDark 
                ? 'bg-slate-800 text-slate-400' 
                : 'bg-slate-200 text-slate-700'
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  const navSection = (titleBn: string, titleEn: string) => (
    <div className="pt-4 pb-1.5 px-3">
      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
        isDark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        {isBn ? titleBn : titleEn}
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 print:hidden ${
          isDark 
            ? 'bg-slate-950 border-slate-800 text-white' 
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand & Logo Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/50 shadow-md bg-slate-900 shrink-0">
              <img 
                src={currentLogo} 
                alt="S.M. Khalilur Rahman Properties Ltd." 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className={`font-bold text-xs sm:text-sm leading-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                S.M. Khalilur Rahman
              </h1>
              <p className={`text-[10px] font-mono tracking-wider ${
                isDark ? 'text-amber-400' : 'text-amber-600 font-bold'
              }`}>
                PROPERTIES LTD. ERP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className={`p-1 rounded-lg md:hidden ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className={`flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin ${
          isDark ? 'scrollbar-thumb-slate-800' : 'scrollbar-thumb-slate-200'
        }`}>
          
          {/* Main Dashboard */}
          {navItem('DASHBOARD', 'ড্যাশবোর্ড', 'Dashboard', <LayoutDashboard className="w-4 h-4" />)}
          {navItem('PROJECTS', 'প্রকল্পসমূহ', 'Projects', <Building2 className="w-4 h-4" />)}

          {/* Core Finance & Accounts */}
          {navSection('হিসাব ও লেনদেন', 'Accounts & Finance')}
          {navItem('EXPENSES', 'দৈনিক খরচ সমূহ', 'Expenses', <ArrowDownLeft className="w-4 h-4 text-rose-400" />)}
          {navItem('MONEY_RECEIVED', 'টাকা গ্রহণ', 'Money Received', <ArrowUpRight className="w-4 h-4 text-emerald-400" />)}
          {navItem('VOUCHERS', 'ভাউচার রেজিস্টার', 'Voucher Register', <FileText className="w-4 h-4 text-amber-400" />)}
          {navItem('LEDGER', 'জেনারেল লেজার', 'General Ledger', <BookOpen className="w-4 h-4 text-blue-400" />)}
          {navItem('ACCOUNTS', 'ক্যাশ ও ব্যাংক', 'Cash & Bank', <Wallet className="w-4 h-4 text-teal-400" />)}
          {navItem('LOANS', 'ঋণ ব্যবস্থাপনা', 'Loans & Debts', <Landmark className="w-4 h-4 text-purple-400" />)}

          {/* Construction Sub-modules */}
          {navSection('নির্মাণ ও সরবরাহ', 'Construction & Vendor')}
          {navItem('MATERIALS', 'ম্যাটেরিয়াল / কাঁচামাল', 'Materials & Inventory', <Layers className="w-4 h-4 text-indigo-400" />)}
          {navItem('SUPPLIERS', 'সরবরাহকারী (Supplier)', 'Suppliers', <Truck className="w-4 h-4 text-amber-400" />)}
          {navItem('CONTRACTORS', 'কন্ট্রাক্টর তালিকা', 'Contractors', <Users className="w-4 h-4 text-emerald-400" />)}
          {navItem('CONTRACTOR_PAYMENTS', 'কন্ট্রাক্টর পেমেন্ট', 'Contractor Payments', <CreditCard className="w-4 h-4 text-sky-400" />)}

          {/* Monthly Company Expenses */}
          {navSection('কোম্পানি পরিচালনা', 'Company Operations')}
          {navItem('MONTHLY_BILLS', 'মাসিক বিল ও বেতন', 'Monthly Bills & Salary', <Receipt className="w-4 h-4 text-orange-400" />)}

          {/* Reports */}
          {navSection('রিপোর্ট ও বিশ্লেষণ', 'Reports & Analytics')}
          {navItem('REPORTS', 'হিসাব রিপোর্ট সমূহ', 'Reports Center', <BarChart3 className="w-4 h-4 text-cyan-400" />)}

          {/* Administration (Super Admin / Admin Only) */}
          {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <>
              {navSection('সিস্টেম ও অডিট', 'Admin & Audit')}
              {hasPermission(role, 'canManageUsers') && (
                navItem('USERS', 'ব্যবহারকারী ব্যবস্থাপনা', 'User Management', <UserCheck className="w-4 h-4 text-purple-400" />)
              )}
              {hasPermission(role, 'canViewAuditLogs') && (
                navItem('AUDIT_LOGS', 'অডিট ট্রেইল লগ', 'Audit Logs', <ShieldAlert className="w-4 h-4 text-rose-400" />)
              )}
              {hasPermission(role, 'canManageSettings') && (
                navItem('SETTINGS', 'সিস্টেম সেটিংস', 'ERP Settings', <Settings className="w-4 h-4 text-slate-400" />)
              )}
            </>
          )}

        </div>

        {/* Cloud & Backup Button */}
        <div className={`p-2 border-t ${
          isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
        }`}>
          <button
            type="button"
            onClick={() => setCloudModalOpen(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{isBn ? 'ক্লাউড ও ব্যাকআপ' : 'Cloud & Backup'}</span>
            </div>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                cloudSyncStatus === 'CONNECTED' ? 'bg-emerald-400' : cloudSyncStatus === 'SYNCING' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                cloudSyncStatus === 'CONNECTED' ? 'bg-emerald-500' : cloudSyncStatus === 'SYNCING' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className={`p-3 border-t text-center ${
          isDark ? 'border-slate-800/80 bg-slate-950/60 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'
        }`}>
          <div className="text-[10px] font-mono">
            {isBn ? 'ভার্সন ২.০ • রিয়েল-টাইম ইআরপি' : 'v2.0 • Real-time Construction ERP'}
          </div>
        </div>

      </aside>

      {/* Cloud & Backup Modal */}
      <CloudBackupModal 
        isOpen={cloudModalOpen} 
        onClose={() => setCloudModalOpen(false)} 
      />
    </>
  );
};
