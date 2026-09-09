/**
 * General Ledger View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData, recalculateLedgerEntries, parseDateToTimestamp } from '../../context/DataContext';
import { 
  BookOpen, 
  Search, 
  Download, 
  Wallet, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  HelpCircle, 
  Pencil, 
  X,
  Plus,
  ArrowDownUp,
  CheckCircle2,
  Printer,
  Building
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { LedgerEntry, PaymentMethod } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const LedgerView: React.FC = () => {
  const { language } = useLanguage();
  const { 
    ledger = [], 
    accounts = [], 
    projects = [], 
    contractors = [], 
    suppliers = [], 
    selectedProjectId = 'ALL',
    settings,
    deleteLedgerEntry, 
    updateLedgerEntry,
    addExpense,
    addMoneyReceived 
  } = useData();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL'); // 'ALL' or 'YYYY-MM'
  const [deleteModalEntry, setDeleteModalEntry] = useState<LedgerEntry | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Sync with global header project selector
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Month Sorting Order: 'CHRONOLOGICAL' (earliest/previous month first e.g. Aug -> Sep) vs 'NEWEST_FIRST'
  const [monthSortOrder, setMonthSortOrder] = useState<'CHRONOLOGICAL' | 'NEWEST_FIRST'>('CHRONOLOGICAL');

  // Direct New Ledger Entry Modal State
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [newAmount, setNewAmount] = useState('');
  const [newAccountId, setNewAccountId] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newParticulars, setNewParticulars] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newVoucherNo, setNewVoucherNo] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('CASH');

  // Edit Ledger Entry State
  const [editModalEntry, setEditModalEntry] = useState<LedgerEntry | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editParticulars, setEditParticulars] = useState('');
  const [editPerson, setEditPerson] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDebit, setEditDebit] = useState<number | ''>('');
  const [editCredit, setEditCredit] = useState<number | ''>('');
  const [editVoucherNo, setEditVoucherNo] = useState('');

  const isBn = language === 'bn';

  const handleCreateNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (!amt || amt <= 0) return;
    const acc = accounts.find(a => a.id === newAccountId) || accounts[0];
    const accId = acc ? acc.id : (accounts[0]?.id || 'acc-cash');

    if (newType === 'DEBIT') {
      addExpense({
        date: newDate,
        amount: amt,
        accountId: accId,
        projectId: newProjectId || (projects[0]?.id || ''),
        expenseType: 'OTHER',
        category: newParticulars || 'সাধারণ খরচ',
        paidTo: newPerson || 'General Payee',
        paymentMethod: newPaymentMethod,
        description: newParticulars,
        reference: newVoucherNo || undefined,
      });
    } else {
      addMoneyReceived({
        date: newDate,
        amount: amt,
        accountId: accId,
        projectId: newProjectId || (projects[0]?.id || ''),
        sourceType: 'OTHER',
        receivedFrom: newPerson || 'General Payer',
        paymentMethod: newPaymentMethod,
        description: newParticulars,
        reference: newVoucherNo || undefined,
      });
    }

    setIsNewEntryModalOpen(false);
    setNewAmount('');
    setNewParticulars('');
    setNewPerson('');
    setNewVoucherNo('');
  };

  const openEditModal = (entry: LedgerEntry) => {
    setEditModalEntry(entry);
    setEditDate(entry.date);
    setEditParticulars(entry.description || entry.particulars || '');
    setEditPerson(entry.person || '');
    setEditCategory(entry.category || '');
    setEditProjectId(entry.projectId || '');
    setEditAccountId(entry.accountId || '');
    const d = getDebit(entry);
    const c = getCredit(entry);
    setEditDebit(d > 0 ? d : '');
    setEditCredit(c > 0 ? c : '');
    setEditVoucherNo(entry.voucherNo || entry.voucherNumber || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalEntry) return;

    const debVal = typeof editDebit === 'number' ? editDebit : 0;
    const credVal = typeof editCredit === 'number' ? editCredit : 0;
    const proj = projects.find(p => p.id === editProjectId);
    const acc = accounts.find(a => a.id === editAccountId);

    updateLedgerEntry(editModalEntry.id, {
      date: editDate,
      description: editParticulars,
      particulars: editParticulars,
      person: editPerson,
      category: editCategory,
      projectId: editProjectId || undefined,
      projectName: proj ? proj.name : undefined,
      accountId: editAccountId || undefined,
      accountName: acc ? acc.name : undefined,
      payment: debVal,
      received: credVal,
      amount: debVal > 0 ? debVal : credVal,
      type: debVal > 0 ? 'DEBIT' : 'CREDIT',
      voucherNo: editVoucherNo,
    });

    setEditModalEntry(null);
  };

  const getDebit = (entry: LedgerEntry, forProjectId?: string): number => {
    if (forProjectId && forProjectId !== 'ALL') {
      if (entry.projectAllocations && entry.projectAllocations.length > 0) {
        // Multi-project money received has 0 debit anyway
        return 0;
      }
    }
    if (typeof entry.payment === 'number' && !isNaN(entry.payment)) return entry.payment;
    if (entry.type === 'DEBIT' && typeof entry.amount === 'number' && !isNaN(entry.amount)) return entry.amount;
    return 0;
  };

  const getCredit = (entry: LedgerEntry, forProjectId?: string): number => {
    if (forProjectId && forProjectId !== 'ALL') {
      if (entry.projectAllocations && entry.projectAllocations.length > 0) {
        const alloc = entry.projectAllocations.find(a => a.projectId === forProjectId);
        return alloc ? alloc.amount : 0;
      }
    }
    if (typeof entry.received === 'number' && !isNaN(entry.received)) return entry.received;
    if (entry.type === 'CREDIT' && typeof entry.amount === 'number' && !isNaN(entry.amount)) return entry.amount;
    return 0;
  };

  const getBalance = (entry: LedgerEntry): number => {
    if (typeof entry.balance === 'number' && !isNaN(entry.balance)) return entry.balance;
    if (typeof entry.runningBalance === 'number' && !isNaN(entry.runningBalance)) return entry.runningBalance;
    return 0;
  };

  const getParticulars = (entry: LedgerEntry): string => {
    return entry.description || entry.particulars || entry.category || 'General Transaction';
  };

  const getVoucher = (entry: LedgerEntry): string => {
    return entry.voucherNo || entry.voucherNumber || entry.reference || '-';
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalEntry) return;
    try {
      deleteLedgerEntry(deleteModalEntry.id);
    } catch (err) {
      console.error('Failed to delete ledger entry:', err);
    }
    setDeleteModalEntry(null);
  };

  // Strictly recalculate running balance chronologically
  const safeLedger = useMemo(() => {
    return recalculateLedgerEntries(Array.isArray(ledger) ? ledger : []);
  }, [ledger]);

  // Extract unique available months (e.g. ['2026-09', '2026-08', '2026-07']) sorted descending
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    safeLedger.forEach(e => {
      if (e.date) {
        const ym = e.date.substring(0, 7); // YYYY-MM
        if (ym.length === 7) set.add(ym);
      }
    });
    return Array.from(set).sort().reverse();
  }, [safeLedger]);

  // Helper for Month-Year label
  const getMonthYearLabel = (ymStr: string) => {
    if (ymStr === 'ALL') return isBn ? 'সকল মাস ও বছর (সব খতিয়ান)' : 'All Months & Years';
    const [year, month] = ymStr.split('-');
    const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = parseInt(month, 10) - 1;
    if (idx >= 0 && idx < 12) {
      if (isBn) {
        const bnNums: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        const bnYear = year.split('').map(c => bnNums[c] || c).join('');
        return `${monthNamesBn[idx]} ${bnYear}`;
      }
      return `${monthNamesEn[idx]} ${year}`;
    }
    return ymStr;
  };

  // Filtered entries by account, project, month, and search query
  const filtered = safeLedger.filter((entry) => {
    if (!entry) return false;
    if (filterAccount !== 'ALL' && entry.accountId !== filterAccount) return false;
    
    // Project filter check (supports single project, multi-project allocations, and company office)
    if (filterProject !== 'ALL') {
      const matchesDirect = entry.projectId === filterProject;
      const matchesAlloc = entry.projectAllocations && entry.projectAllocations.some(a => a.projectId === filterProject);
      if (!matchesDirect && !matchesAlloc) return false;
    }

    if (selectedMonth !== 'ALL' && entry.date && !entry.date.startsWith(selectedMonth)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const particulars = getParticulars(entry).toLowerCase();
      const voucher = getVoucher(entry).toLowerCase();
      const account = (entry.accountName || '').toLowerCase();
      const person = (entry.person || '').toLowerCase();
      const project = (entry.projectName || '').toLowerCase();
      const allocProjects = (entry.projectAllocations || []).map(a => a.projectName.toLowerCase()).join(' ');
      if (!particulars.includes(q) && !voucher.includes(q) && !account.includes(q) && !person.includes(q) && !project.includes(q) && !allocProjects.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Calculate totals
  const totalCredits = filtered.reduce((s, l) => s + getCredit(l, filterProject), 0);
  const totalDebits = filtered.reduce((s, l) => s + getDebit(l, filterProject), 0);

  // Total cash in hand across accounts
  const totalCashInHand = accounts.reduce((s, a) => s + (a.currentBalance || 0), 0);

  // Today's Expense Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = safeLedger
    .filter(e => e.date === todayStr)
    .filter(e => {
      if (filterProject === 'ALL') return true;
      const matchesDirect = e.projectId === filterProject;
      const matchesAlloc = e.projectAllocations && e.projectAllocations.some(a => a.projectId === filterProject);
      return matchesDirect || matchesAlloc;
    })
    .reduce((s, e) => s + getDebit(e, filterProject), 0);

  // Group filtered entries by Month (YYYY-MM) with strictly serial chronological continuity
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: LedgerEntry[] } = {};
    filtered.forEach(entry => {
      const ym = entry.date ? entry.date.substring(0, 7) : 'Other';
      if (!groups[ym]) groups[ym] = [];
      groups[ym].push(entry);
    });

    const keys = Object.keys(groups);
    const sortedKeys = monthSortOrder === 'CHRONOLOGICAL'
      ? keys.sort((a, b) => a.localeCompare(b))
      : keys.sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(ym => {
      // 1. Sort entries within this month strictly chronologically (earliest first)
      const monthEntries = [...groups[ym]].sort((a, b) => {
        const timeA = parseDateToTimestamp(a.date, a.createdAt);
        const timeB = parseDateToTimestamp(b.date, b.createdAt);
        if (timeA !== timeB) return timeA - timeB;
        const cDiff = (a.createdAt || '').localeCompare(b.createdAt || '');
        if (cDiff !== 0) return cDiff;
        return (a.id || '').localeCompare(b.id || '');
      });

      // 2. Exact Opening Balance for this month:
      // Sum of all entries in safeLedger occurring BEFORE this month (ym):
      // (Respecting account and project filters)
      const priorEntries = safeLedger.filter(e => {
        if (filterAccount !== 'ALL' && e.accountId !== filterAccount) return false;
        if (filterProject !== 'ALL') {
          const matchesDirect = e.projectId === filterProject;
          const matchesAlloc = e.projectAllocations && e.projectAllocations.some(a => a.projectId === filterProject);
          if (!matchesDirect && !matchesAlloc) return false;
        }
        const entryYm = (e.date || '').substring(0, 7);
        return entryYm < ym;
      });
      const openingBalance = priorEntries.reduce((sum, e) => sum + getCredit(e, filterProject) - getDebit(e, filterProject), 0);

      // 3. Sequential running balance within this month, strictly continuing from openingBalance:
      let curRunning = openingBalance;
      const entriesWithRunning = monthEntries.map(e => {
        const deb = getDebit(e, filterProject);
        const cred = getCredit(e, filterProject);
        curRunning = curRunning + cred - deb;
        return {
          ...e,
          calculatedDebit: deb,
          calculatedCredit: cred,
          calculatedRunningBalance: curRunning,
        };
      });

      const monthCredits = monthEntries.reduce((s, e) => s + getCredit(e, filterProject), 0);
      const monthDebits = monthEntries.reduce((s, e) => s + getDebit(e, filterProject), 0);
      const closingBalance = curRunning;

      return {
        monthKey: ym,
        monthLabel: getMonthYearLabel(ym),
        entries: entriesWithRunning,
        monthCredits,
        monthDebits,
        openingBalance,
        closingBalance
      };
    });
  }, [filtered, safeLedger, filterAccount, filterProject, monthSortOrder, isBn]);

  const handleExportCSV = () => {
    const headers = ['Entry No', 'Date', 'Voucher / Ref', 'Account', 'Particulars', 'Debit (Out)', 'Credit (In)', 'Running Balance'];
    const rows = filtered.map(l => [
      l.id,
      l.date,
      `"${getVoucher(l).replace(/"/g, '""')}"`,
      `"${(l.accountName || '').replace(/"/g, '""')}"`,
      `"${getParticulars(l).replace(/"/g, '""')}"`,
      getDebit(l),
      getCredit(l),
      getBalance(l),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SKRP_General_Ledger_${selectedMonth}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const modalAmount = deleteModalEntry ? (getDebit(deleteModalEntry) || getCredit(deleteModalEntry) || deleteModalEntry.amount || 0) : 0;
  const modalParticulars = deleteModalEntry ? getParticulars(deleteModalEntry) : '';

  return (
    <div className="space-y-6">
      
      {/* Printable Official Company Letterhead Header (Visible ONLY during print) */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900 text-center space-y-1">
        {settings?.logoUrl && (
          <img 
            src={settings.logoUrl} 
            alt="Company Logo" 
            className="w-12 h-12 mx-auto mb-1 rounded-lg border border-slate-800" 
            referrerPolicy="no-referrer"
          />
        )}
        <h1 className="text-2xl font-black text-slate-950 font-serif tracking-tight uppercase">
          {isBn ? (settings?.companyNameBn || 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ') : (settings?.companyName || 'S.M. Khalilur Rahman Properties Ltd.')}
        </h1>
        <p className="text-xs text-slate-800 font-medium">
          {isBn ? (settings?.addressBn || settings?.address || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ') : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
        </p>
        <p className="text-[11px] text-slate-600 font-mono">
          Phone: {settings?.phone || '01672965561'} | Email: {settings?.email || 'info@skrpproperties.com'}
        </p>
        <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white font-black text-sm tracking-wider uppercase rounded">
          {isBn ? 'জেনারেল লেজার ও হিসাব বিবরণী' : 'OFFICIAL GENERAL LEDGER STATEMENT'}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-300 text-left text-xs text-slate-800 font-sans">
          <div><strong>{isBn ? 'প্রকল্প:' : 'Project:'}</strong> {filterProject === 'ALL' ? (isBn ? 'সকল প্রকল্প' : 'All Projects') : (projects.find(p => p.id === filterProject)?.name || filterProject)}</div>
          <div><strong>{isBn ? 'হিসাব খাত:' : 'Account Filter:'}</strong> {filterAccount === 'ALL' ? (isBn ? 'সকল অ্যাকাউন্ট' : 'All Accounts') : (accounts.find(a => a.id === filterAccount)?.name || filterAccount)}</div>
          <div><strong>{isBn ? 'সময়কাল / মাস:' : 'Statement Period:'}</strong> {selectedMonth === 'ALL' ? (isBn ? 'সকল মাস' : 'All Months') : getMonthYearLabel(selectedMonth)}</div>
        </div>
      </div>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition print:hidden ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span>{isBn ? 'জেনারেল লেজার ও মাসভিত্তিক খতিয়ান' : 'General Ledger & Monthly Khata'}</span>
            </h1>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-amber-400 border-slate-600' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title={isBn ? 'লেজার কিভাবে কাজ করে জানুন' : 'Learn how ledger works'}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isBn ? 'কিভাবে কাজ করে?' : 'How it works'}</span>
            </button>
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'মাস ও বছর ভিত্তিক ম্যানুয়াল খাতার নিয়মে ডাবল-এন্ট্রি বুককিপিং ও চলমান ব্যালেন্স' 
              : 'Monthly closed double-entry bookkeeping with opening/closing balances and real-time cash tracking'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
            title={isBn ? 'মাসিক খতিয়ান বা লেজার সরাসরি প্রিন্ট করুন' : 'Print Monthly Ledger Report'}
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'লেজার প্রিন্ট করুন' : 'Print Ledger'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewEntryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? '+ নতুন লেজার এন্ট্রি' : '+ New Ledger Entry'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer border ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'লেজার CSV ডাউনলোড' : 'Export Ledger'}</span>
          </button>
        </div>
      </div>

      {/* Explanation Accordion Box */}
      {showExplanation && (
        <div className={`p-5 border rounded-2xl text-xs space-y-2 animate-in fade-in transition print:hidden ${
          isDark 
            ? 'bg-blue-950/40 border-blue-800/60 text-blue-200' 
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        }`}>
          <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>{isBn ? 'জেনারেল লেজার ও মাসিক খতিয়ান ব্যবস্থা যেভাবে কাজ করে:' : 'How General Ledger System Works:'}</span>
          </h3>
          <ul className={`list-disc list-inside space-y-1.5 leading-relaxed ${isDark ? 'text-blue-200/90' : 'text-blue-800/90'}`}>
            <li>
              <strong>{isBn ? 'মাস ও বছরভিত্তিক বিন্যাস (Monthly Closing):' : 'Monthly Closings:'}</strong> আপনার ম্যানুয়াল খাতার মতো প্রতি মাসের শুরুতেই প্রারম্ভিক জের (Opening Balance) যোগ হয় এবং মাস শেষে উক্ত মাসের মোট জমা, মোট খরচ ও সমাপনী ব্যালেন্স (Closing Balance) সমন্বয় করা হয়।
            </li>
            <li>
              <strong>{isBn ? 'চলমান স্থিতি (Running Balance):' : 'Continuous Running Balance:'}</strong> ভাউচার বা ক্যাশ/ব্যাংক ট্রানজেকশনের প্রতিটি ডেবিট (খরচ) ও ক্রেডিট (জমা) কালানুক্রমিকভাবে হিসাব করে আপনার হাতে বর্তমান কত টাকা আছে তা একদম নিখুঁত দেখায়।
            </li>
            <li>
              <strong>{isBn ? 'দৈনিক খরচ ও হাতে নগদ:' : 'Daily Expenses & Cash in Hand:'}</strong> আজকের দিনে কত খরচ হয়েছে, রানিং মাসে মোট খরচ কত হলো এবং ব্যাংকে/ক্যাশ বাক্সে সর্বমোট কত টাকা জমা আছে তা উপরে সার্বক্ষণিক প্রদর্শিত থাকে।
            </li>
          </ul>
        </div>
      )}

      {/* Monthly Khata Header Card */}
      <div className={`border rounded-2xl p-5 shadow-sm space-y-4 transition ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-amber-500/30' 
          : 'bg-white border-amber-300'
      }`}>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${
          isDark ? 'border-slate-700/60' : 'border-slate-200'
        }`}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`px-3 py-1 font-black rounded-lg text-xs flex items-center gap-1.5 border ${
              isDark 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{isBn ? 'ম্যানুয়াল খাতা ভিউ:' : 'Running Khata:'} {getMonthYearLabel(selectedMonth)}</span>
            </span>

            {/* Month Sort Sequence Toggle */}
            <div className={`flex items-center p-0.5 rounded-xl border print:hidden ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => setMonthSortOrder('CHRONOLOGICAL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  monthSortOrder === 'CHRONOLOGICAL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isBn ? 'ধারাবাহিক কালানুক্রমিক ক্রম (যেমন: আগস্ট আগে, সেপ্টেম্বর পরে)' : 'Chronological order (earlier month first)'}
              >
                <Calendar className="w-3 h-3" />
                <span>{isBn ? 'ধারাবাহিক ক্রম' : 'Chronological'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMonthSortOrder('NEWEST_FIRST')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  monthSortOrder === 'NEWEST_FIRST'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isBn ? 'সর্বশেষ মাস প্রথমে' : 'Newest month first'}
              >
                <ArrowDownUp className="w-3 h-3" />
                <span>{isBn ? 'সর্বশেষ প্রথমে' : 'Newest First'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs print:hidden">
            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isBn ? 'মাস পরিবর্তন করুন:' : 'Select Month:'}</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`border font-bold rounded-xl px-3 py-1.5 outline-hidden cursor-pointer transition ${
                isDark 
                  ? 'bg-slate-900 border-amber-500/50 text-amber-300' 
                  : 'bg-slate-50 border-amber-300 text-amber-900'
              }`}
            >
              <option value="ALL">{isBn ? 'সকল মাস (সম্পূর্ণ খতিয়ান)' : 'All Months (Full Ledger)'}</option>
              {availableMonths.map(ym => (
                <option key={ym} value={ym}>
                  {getMonthYearLabel(ym)} {ym === availableMonths[0] ? (isBn ? ' (রানিং মাস)' : ' (Current)') : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Khata Stat Cards - 4 Core Accounting Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className={`border p-3 rounded-xl transition ${
            isDark ? 'bg-slate-900/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'আজকের দিনের খরচ' : "Today's Expense"}</span>
            <span className="text-base sm:text-lg font-mono font-black text-rose-500 mt-0.5 block">
              {formatCurrency(todayExpense, isBn ? 'bn' : 'en')}
            </span>
          </div>

          <div className={`border p-3 rounded-xl transition ${
            isDark ? 'bg-slate-900/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? (selectedMonth === 'ALL' ? 'মোট জমা (ক্রেডিট)' : 'নির্বাচিত মাসের মোট জমা') : 'Total Inflow (Deposit)'}
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-500 mt-0.5 block">
              {formatCurrency(totalCredits, isBn ? 'bn' : 'en')}
            </span>
          </div>

          <div className={`border p-3 rounded-xl transition ${
            isDark ? 'bg-slate-900/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? (selectedMonth === 'ALL' ? 'মোট খরচ (ডেবিট)' : 'নির্বাচিত মাসের মোট খরচ') : 'Total Outflow (Expense)'}
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-rose-500 mt-0.5 block">
              {formatCurrency(totalDebits, isBn ? 'bn' : 'en')}
            </span>
          </div>

          <div className={`border p-3 rounded-xl transition ${
            isDark ? 'bg-slate-900/80 border-emerald-500/30' : 'bg-emerald-50/60 border-emerald-200'
          }`}>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{isBn ? 'হাতে নগদ / ব্যাংক সমাপনী' : 'Cash/Bank in Hand'}</span>
            <span className={`text-base sm:text-lg font-mono font-black mt-0.5 block ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              {formatCurrency(totalCashInHand, isBn ? 'bn' : 'en')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={`border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs transition print:hidden ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2 w-full md:w-auto transition ${
          isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'বিবরণ, ভাউচার নং, প্রজেক্ট বা ব্যক্তি দিয়ে খুঁজুন...' : 'Search particulars, voucher no, project...'}
            className="w-full bg-transparent placeholder-slate-400 outline-hidden font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className={`border rounded-xl px-3 py-2 outline-hidden font-medium w-full sm:w-52 cursor-pointer transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">{isBn ? 'সকল প্রজেক্ট ও হেড অফিস' : 'All Projects & Office'}</option>
              <option value="company">{isBn ? '🏢 কোম্পানি হেড অফিস' : '🏢 Company Head Office'}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Wallet className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className={`border rounded-xl px-3 py-2 outline-hidden font-medium w-full sm:w-48 cursor-pointer transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">{isBn ? 'সকল অ্যাকাউন্ট' : 'All Accounts'}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Ledger Tables by Month */}
      <div className="space-y-8">
        {groupedByMonth.length === 0 ? (
          <div className={`border rounded-2xl p-12 text-center font-medium transition ${
            isDark ? 'bg-slate-800/90 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            {isBn ? 'কোনো লেজার এন্ট্রি পাওয়া যায়নি।' : 'No ledger records found for selected month or search query.'}
          </div>
        ) : (
          groupedByMonth.map((group) => (
            <div key={group.monthKey} className={`border rounded-2xl overflow-hidden shadow-xs transition print:border-slate-300 print:rounded-none ${
              isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
            }`}>
              
              {/* Month Header Banner (Manual Khata Style) */}
              <div className={`px-5 py-3.5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse print:hidden"></span>
                  <h3 className={`font-black text-sm sm:text-base tracking-wide uppercase ${
                    isDark ? 'text-amber-400' : 'text-amber-800'
                  }`}>
                    📌 {group.monthLabel} {group.monthKey === availableMonths[0] ? (isBn ? '- রানিং মাস' : '- Current Month') : ''}
                  </h3>
                </div>

                <div className={`flex items-center gap-4 text-xs font-mono font-bold ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <span>
                    {isBn ? 'প্রারম্ভিক জের (Opening):' : 'Opening:'}{' '}
                    <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>{formatCurrency(group.openingBalance, isBn ? 'bn' : 'en')}</span>
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left text-xs ledger-print-table">
                  <thead>
                    <tr className={`border-b uppercase text-[10px] tracking-wider ${
                      isDark ? 'border-slate-700 bg-slate-950/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 ledger-col-date">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 ledger-col-voucher">{isBn ? 'ভাউচার / রেফারেন্স' : 'Voucher / Ref'}</th>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 ledger-col-account">{isBn ? 'হিসাব খাত' : 'Account'}</th>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 ledger-col-particulars">{isBn ? 'বিবরণ (Particulars)' : 'Particulars'}</th>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 text-right ledger-col-debit">{isBn ? 'ডেবিট (খরচ)' : 'Debit (Out)'}</th>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 text-right ledger-col-credit">{isBn ? 'ক্রেডিট (জমা)' : 'Credit (In)'}</th>
                      <th className="py-3 px-4 print:py-1.5 print:px-1 text-right ledger-col-balance">{isBn ? 'চলমান স্থিতি' : 'Running Balance'}</th>
                      <th className="py-3 px-4 text-center print:hidden">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                    {group.entries.map((entry) => {
                      const debit = (entry as any).calculatedDebit !== undefined ? (entry as any).calculatedDebit : getDebit(entry);
                      const credit = (entry as any).calculatedCredit !== undefined ? (entry as any).calculatedCredit : getCredit(entry);
                      const balance = (entry as any).calculatedRunningBalance !== undefined ? (entry as any).calculatedRunningBalance : getBalance(entry);
                      const voucherText = getVoucher(entry);
                      const particulars = getParticulars(entry);

                      return (
                        <tr key={entry.id} className={`transition ${
                          isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                        }`}>
                          <td className={`py-3 px-4 print:py-1.5 print:px-1 whitespace-nowrap font-sans ledger-col-date ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {formatDisplayDate(entry.date)}
                          </td>
                          <td className="py-3 px-4 print:py-1.5 print:px-1 whitespace-nowrap ledger-col-voucher">
                            {voucherText !== '-' ? (
                              <span className={`font-bold px-2 py-0.5 rounded text-[11px] print:text-[9.5px] print:p-0 ${
                                isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-800 bg-amber-100'
                              }`}>
                                {voucherText}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className={`py-3 px-4 print:py-1.5 print:px-1 font-sans ledger-col-account ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {entry.accountName || '-'}
                          </td>
                          <td className={`py-3 px-4 print:py-1.5 print:px-1 font-sans ledger-col-particulars ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <span className="block font-medium">{particulars}</span>
                            {entry.projectAllocations && entry.projectAllocations.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.projectAllocations.map((alloc) => (
                                  <span
                                    key={alloc.projectId}
                                    className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-mono border ${
                                      filterProject === alloc.projectId
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                                        : isDark
                                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    🏗️ {alloc.projectName}: ৳{alloc.amount.toLocaleString()}
                                  </span>
                                ))}
                              </div>
                            ) : entry.projectName ? (
                              <span className={`text-[10px] block print:text-[8.5px] ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>🏗️ {entry.projectName}</span>
                            ) : null}
                            {entry.person && (
                              <span className={`text-[10px] block print:text-[8.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>👤 {entry.person}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 print:py-1.5 print:px-1 text-right font-bold text-rose-500 whitespace-nowrap ledger-col-debit">
                            {debit > 0 ? formatCurrency(debit, isBn ? 'bn' : 'en') : '-'}
                          </td>
                          <td className="py-3 px-4 print:py-1.5 print:px-1 text-right font-bold text-emerald-500 whitespace-nowrap ledger-col-credit">
                            {credit > 0 ? formatCurrency(credit, isBn ? 'bn' : 'en') : '-'}
                          </td>
                          <td className="py-3 px-4 print:py-1.5 print:px-1 text-right whitespace-nowrap ledger-col-balance">
                            <span className={`font-black ${balance < 0 ? 'text-rose-500 font-bold' : isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {formatCurrency(balance, isBn ? 'bn' : 'en')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap print:hidden">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(entry)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isDark 
                                    ? 'bg-slate-700/80 hover:bg-blue-600 text-blue-300 hover:text-white' 
                                    : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200'
                                }`}
                                title={isBn ? 'খতিয়ান এন্ট্রি সংশোধন / এডিট' : 'Edit Ledger Entry'}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteModalEntry(entry)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isDark 
                                    ? 'bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white' 
                                    : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200'
                                }`}
                                title={isBn ? 'এন্ট্রি মুছুন' : 'Delete Entry'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Monthly Khata Closing Summary Bar */}
                  <tfoot>
                    <tr className={`font-mono text-xs border-t-2 ${
                      isDark ? 'bg-slate-900/90 border-amber-500/50' : 'bg-amber-50/50 border-amber-400'
                    }`}>
                      <td colSpan={4} className={`py-3 px-4 print:py-1.5 print:px-1 font-bold uppercase font-sans ${
                        isDark ? 'text-amber-300' : 'text-amber-900'
                      }`}>
                        🔒 {group.monthLabel} - {isBn ? 'মাসিক ক্লোজিং হিসাব:' : 'Monthly Closing Trail:'}
                      </td>
                      <td className="py-3 px-4 print:py-1.5 print:px-1 text-right font-black text-rose-500 ledger-col-debit">
                        {formatCurrency(group.monthDebits, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="py-3 px-4 print:py-1.5 print:px-1 text-right font-black text-emerald-500 ledger-col-credit">
                        {formatCurrency(group.monthCredits, isBn ? 'bn' : 'en')}
                      </td>
                      <td className={`py-3 px-4 print:py-1.5 print:px-1 text-right font-black ledger-col-balance ${
                        isDark ? 'text-slate-100 bg-amber-500/10' : 'text-slate-900 bg-amber-100/60'
                      }`}>
                        <span className={`text-[10px] print:text-[8.5px] block font-sans font-semibold ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {isBn ? 'সমাপনী ব্যালেন্স' : 'Closing Balance'}
                        </span>
                        {formatCurrency(group.closingBalance, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Printable Official Signatures Footer (Visible ONLY during print) */}
      <div className="hidden print:grid grid-cols-4 gap-4 text-center text-xs pt-12 mt-8 border-t-2 border-slate-900">
        <div className="flex flex-col items-center justify-end">
          <div className="w-full border-t border-slate-900 pt-1 font-bold text-slate-950">
            {isBn ? 'প্রস্তুতকারী (Prepared By)' : 'Prepared By'}
          </div>
        </div>
        <div className="flex flex-col items-center justify-end">
          <div className="w-full border-t border-slate-900 pt-1 font-bold text-slate-950">
            {isBn ? 'যাচাইকারী (Checked By)' : 'Checked By'}
          </div>
        </div>
        <div className="flex flex-col items-center justify-end">
          <div className="w-full border-t border-slate-900 pt-1 font-bold text-slate-950">
            {isBn ? 'হিসাবরক্ষণ কর্মকর্তা' : 'Accounts Officer'}
          </div>
        </div>
        <div className="flex flex-col items-center justify-end">
          <div className="w-full border-t border-slate-900 pt-1 font-bold text-slate-950">
            {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
          </div>
        </div>
      </div>

      {/* Edit Ledger Entry Modal */}
      {editModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className={`rounded-2xl shadow-2xl border w-full max-w-xl overflow-hidden my-6 font-sans transition ${
            isDark ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {isBn ? 'খতিয়ান / লেজার এন্ট্রি সংশোধন' : 'Edit Ledger Entry'}
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ID: {editModalEntry.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalEntry(null)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'তারিখ' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'ভাউচার / রেফারেন্স নং' : 'Voucher / Ref No.'}
                  </label>
                  <input
                    type="text"
                    value={editVoucherNo}
                    onChange={(e) => setEditVoucherNo(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="e.g. CPV-001"
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isBn ? 'বিবরণ / লেনদেনের বিবরণ' : 'Particulars / Description'} *
                </label>
                <input
                  type="text"
                  required
                  value={editParticulars}
                  onChange={(e) => setEditParticulars(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  placeholder="e.g. সিমেন্ট ক্রয় / নগদ উত্তোলন"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'ব্যক্তি / গ্রহীতা / দাতা' : 'Person / Party'}
                  </label>
                  <input
                    type="text"
                    value={editPerson}
                    onChange={(e) => setEditPerson(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="e.g. Rahim Mia"
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'খাত / ক্যাটাগরি' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="e.g. নির্মাণ সামগ্রী / বেতন"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'প্রকল্প (Project)' : 'Project'}
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">{isBn ? 'সাধারণ / কোনো প্রকল্প নয়' : 'None / General'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'একাউন্ট (Account)' : 'Account'}
                  </label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">{isBn ? 'সিলেক্ট করুন' : 'Select Account'}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-rose-500 font-semibold mb-1">
                    {isBn ? 'ডেবিট / খরচ / পেমেন্ট (৳)' : 'Debit / Outflow (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editDebit}
                    onChange={(e) => {
                      setEditDebit(e.target.value ? Number(e.target.value) : '');
                      if (e.target.value) setEditCredit('');
                    }}
                    className={`w-full border rounded-xl px-3 py-2 text-rose-500 font-mono font-bold text-sm outline-hidden ${
                      isDark ? 'bg-slate-800 border-rose-900/50' : 'bg-rose-50/50 border-rose-200'
                    }`}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-emerald-500 font-semibold mb-1">
                    {isBn ? 'ক্রেডিট / জমা / প্রাপ্তি (৳)' : 'Credit / Inflow (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editCredit}
                    onChange={(e) => {
                      setEditCredit(e.target.value ? Number(e.target.value) : '');
                      if (e.target.value) setEditDebit('');
                    }}
                    className={`w-full border rounded-xl px-3 py-2 text-emerald-500 font-mono font-bold text-sm outline-hidden ${
                      isDark ? 'bg-slate-800 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-3 border-t ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setEditModalEntry(null)}
                  className={`px-4 py-2 border rounded-xl transition font-semibold cursor-pointer ${
                    isDark 
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className={`rounded-2xl shadow-2xl border w-full max-w-md p-6 space-y-4 font-sans transition ${
            isDark ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'লেজার এন্ট্রি মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Entry Deletion'}</h3>
            </div>
            
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {isBn 
                ? `আপনি কি নিশ্চিত যে "${modalParticulars}" লেজার এন্ট্রিটি (৳${modalAmount.toLocaleString()}) মুছে ফেলতে চান? এতে সংশ্লিষ্ট হিসাব খাতের ব্যালেন্স স্বয়ংক্রিয়ভাবে সমন্বয় করা হবে।`
                : `Are you sure you want to delete ledger entry "${modalParticulars}" (৳${modalAmount.toLocaleString()})? Account balance will be restored automatically.`}
            </p>

            <div className={`flex justify-end gap-3 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <button
                type="button"
                onClick={() => setDeleteModalEntry(null)}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ledger Entry Modal */}
      {isNewEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className={`rounded-2xl shadow-2xl border w-full max-w-xl overflow-hidden my-6 font-sans transition ${
            isDark ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {isBn ? 'নতুন লেজার এন্ট্রি যুক্ত করুন' : 'Add New Ledger Entry'}
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isBn ? 'যেকোনো মাসের খরচ বা জমার এন্ট্রি সরাসরি লেজারে যুক্ত করুন' : 'Record an entry for any month directly into ledger'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewEntryModalOpen(false)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewEntry} className="p-6 space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isBn ? 'লেনদেনের ধরন (Transaction Type)' : 'Transaction Type'} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewType('DEBIT')}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer ${
                      newType === 'DEBIT'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isBn ? 'ডেবিট / খরচ / প্রদান' : 'Debit / Outflow'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('CREDIT')}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer ${
                      newType === 'CREDIT'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isBn ? 'ক্রেডিট / জমা / প্রাপ্তি' : 'Credit / Inflow'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'তারিখ (Date)' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${
                    newType === 'DEBIT' ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 font-mono font-bold text-sm outline-hidden ${
                      newType === 'DEBIT'
                        ? isDark ? 'bg-slate-800 border-rose-900/60 text-rose-400' : 'bg-rose-50/50 border-rose-300 text-rose-600'
                        : isDark ? 'bg-slate-800 border-emerald-900/60 text-emerald-400' : 'bg-emerald-50/50 border-emerald-300 text-emerald-600'
                    }`}
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isBn ? 'বিবরণ (Particulars)' : 'Particulars / Description'} *
                </label>
                <input
                  type="text"
                  required
                  value={newParticulars}
                  onChange={(e) => setNewParticulars(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  placeholder={newType === 'DEBIT' ? (isBn ? 'যেমন: রড ক্রয় / লেবার বিল' : 'e.g. Cement purchase') : (isBn ? 'যেমন: বিনিয়োগ জমা / ক্লায়েন্ট কিস্তি' : 'e.g. Client installment')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'হিসাব খাত (Account)' : 'Account'} *
                  </label>
                  <select
                    required
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">{isBn ? 'একাউন্ট নির্বাচন করুন' : 'Select Account'}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} (ব্যালেন্স: ৳{a.currentBalance?.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'প্রকল্প (Project - ঐচ্ছিক)' : 'Project (Optional)'}
                  </label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">{isBn ? 'সাধারণ / কোনো প্রকল্প নয়' : 'None / General Fund'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {newType === 'DEBIT' ? (isBn ? 'গ্রহীতা / ব্যক্তি' : 'Payee / Person') : (isBn ? 'প্রদানকারী / ব্যক্তি' : 'Payer / Person')}
                  </label>
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="e.g. Rahim Mia"
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'ভাউচার / রেফারেন্স নং' : 'Voucher / Ref No'}
                  </label>
                  <input
                    type="text"
                    value={newVoucherNo}
                    onChange={(e) => setNewVoucherNo(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 outline-hidden font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="e.g. REF-2026-001"
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-3 border-t ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsNewEntryModalOpen(false)}
                  className={`px-4 py-2 border rounded-xl transition font-semibold cursor-pointer ${
                    isDark 
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {isBn ? 'লেজারে এন্ট্রি যুক্ত করুন' : 'Record Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

