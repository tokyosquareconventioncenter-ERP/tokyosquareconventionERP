/**
 * Money Received Management View & Money Receipt Printing
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Building, 
  Layers, 
  Wallet, 
  CheckCircle2,
  Trash2,
  AlertCircle,
  Printer,
  Receipt,
  X,
  Pencil,
  Camera,
  ChevronRight,
  User,
  PieChart,
  Landmark
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { MoneyReceived, Voucher, PaymentMethod } from '../../types';
import { convertNumberToWordsBn, convertNumberToWordsEn } from '../../utils/numberToWords';
import { useTheme } from '../../context/ThemeContext';

interface MoneyReceivedViewProps {
  onOpenNewMoneyIn: () => void;
  onSelectVoucher?: (v: Voucher) => void;
}

export const MoneyReceivedView: React.FC<MoneyReceivedViewProps> = ({ 
  onOpenNewMoneyIn,
  onSelectVoucher 
}) => {
  const { language } = useLanguage();
  const { moneyReceived, projects, accounts, selectedProjectId, deleteMoneyReceived, updateMoneyReceived, vouchers, settings } = useData();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId);
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [deleteModalItem, setDeleteModalItem] = useState<MoneyReceived | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isReceiptRegisterPrintOpen, setIsReceiptRegisterPrintOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [contributorStatementItem, setContributorStatementItem] = useState<any | null>(null);

  // Edit Money Received State
  const [editModalItem, setEditModalItem] = useState<MoneyReceived | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editReceivedFrom, setEditReceivedFrom] = useState('');
  const [editSourceType, setEditSourceType] = useState<any>('DIRECTOR_DEPOSIT');
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('BANK');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReference, setEditReference] = useState('');

  const isBn = language === 'bn';

  const openEditModal = (item: MoneyReceived) => {
    setEditModalItem(item);
    setEditDate(item.date);
    setEditProjectId(item.projectId || '');
    setEditReceivedFrom(item.receivedFrom);
    setEditSourceType(item.sourceType);
    setEditAmount(item.amount);
    setEditPaymentMethod(item.paymentMethod);
    setEditAccountId(item.accountId);
    setEditDescription(item.description);
    setEditReference(item.reference || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem || typeof editAmount !== 'number' || editAmount <= 0) return;

    updateMoneyReceived(editModalItem.id, {
      date: editDate,
      projectId: editProjectId || undefined,
      receivedFrom: editReceivedFrom,
      sourceType: editSourceType,
      amount: editAmount,
      paymentMethod: editPaymentMethod,
      accountId: editAccountId,
      description: editDescription,
      reference: editReference,
    });

    setEditModalItem(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalItem) return;
    deleteMoneyReceived(deleteModalItem.id, deleteReason || 'User requested deletion');
    setDeleteModalItem(null);
    setDeleteReason('');
  };

  const handlePrintReceipt = (item: MoneyReceived) => {
    // Check if voucher exists in vouchers list
    let voucher = vouchers.find(v => v.transactionId === item.id || v.voucherNumber === item.receiptNumber);
    if (!voucher) {
      voucher = {
        id: 'vch-' + item.id,
        voucherNumber: item.receiptNumber || 'MR-GEN',
        date: item.date,
        projectId: item.projectId,
        projectName: item.projectName || 'General Fund',
        paidTo: item.receivedFrom,
        category: `Money Received (${item.sourceType})`,
        description: item.description || `Received from ${item.receivedFrom} on account of ${item.sourceType}`,
        amount: item.amount,
        amountInWordsBn: convertNumberToWordsBn(item.amount),
        amountInWordsEn: convertNumberToWordsEn(item.amount),
        paymentMethod: item.paymentMethod,
        preparedBy: item.createdBy || 'MD. eleyes',
        receivedBy: item.receivedFrom,
        authorizedBy: 'Eng. S.M. Khalilur Rahman (MD)',
        accountName: item.accountName,
        reference: item.reference,
        transactionId: item.id,
        transactionType: item.sourceType === 'Share Voucher / Partner' ? 'SHARE_VOUCHER' : 'MONEY_RECEIVED',
        status: 'ACTIVE',
        printCount: 0,
        createdAt: item.createdAt,
        createdBy: item.createdBy || 'MD. eleyes',
      };
    }
    if (onSelectVoucher) {
      onSelectVoucher(voucher);
    }
  };

  const [filterSourceType, setFilterSourceType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'DONOR_BREAKDOWN'>('REGISTER');

  // Derived available months from all actual received records (supports all past & future dates)
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    moneyReceived.forEach((m) => {
      if (m.date) {
        const ym = m.date.substring(0, 7);
        if (ym.length === 7) set.add(ym);
      }
    });
    return Array.from(set).sort().reverse();
  }, [moneyReceived]);

  const formatMonthLabel = (ym: string) => {
    if (ym === 'ALL') return isBn ? '🗓️ সকল মাস ও বছর' : '🗓️ All Months & Years';
    const [year, month] = ym.split('-');
    const mNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const mNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = parseInt(month, 10) - 1;
    if (idx >= 0 && idx < 12) {
      if (isBn) {
        const bnNums: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        const bnYear = year.split('').map(c => bnNums[c] || c).join('');
        return `${mNamesBn[idx]} ${bnYear}`;
      }
      return `${mNamesEn[idx]} ${year}`;
    }
    return ym;
  };

  const filtered = React.useMemo(() => {
    return moneyReceived
      .filter((r) => {
        if (filterProject !== 'ALL') {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            const hasProject = r.projectAllocations.some(a => a.projectId === filterProject);
            if (!hasProject) return false;
          } else if (r.projectId !== filterProject) {
            return false;
          }
        }
        if (filterMonth !== 'ALL' && r.date && !r.date.startsWith(filterMonth)) return false;
        if (filterSourceType !== 'ALL') {
          if (filterSourceType === 'LOAN' && r.sourceType !== 'Loan') return false;
          if (filterSourceType === 'FUND' && (r.sourceType === 'Loan' || r.sourceType === 'Share Voucher / Partner')) return false;
          if (filterSourceType === 'PARTNER' && r.sourceType !== 'Share Voucher / Partner') return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            r.receivedFrom.toLowerCase().includes(q) ||
            r.sourceType.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            (r.receiptNumber && r.receiptNumber.toLowerCase().includes(q)) ||
            (r.reference && r.reference.toLowerCase().includes(q)) ||
            (r.projectName && r.projectName.toLowerCase().includes(q)) ||
            (r.projectAllocations && r.projectAllocations.some(a => a.projectName.toLowerCase().includes(q)));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });
  }, [moneyReceived, filterProject, filterMonth, filterSourceType, searchQuery]);

  interface DonorSummaryItem {
    receivedFrom: string;
    projectName: string;
    sourceType: string;
    totalAmount: number;
    count: number;
    isLoan: boolean;
    records: MoneyReceived[];
  }

  interface ContributorOverallItem {
    receivedFrom: string;
    primarySourceType: string;
    totalAmount: number;
    cashAmount: number;
    bankAmount: number;
    count: number;
    isLoan: boolean;
    records: MoneyReceived[];
    projectBreakdown: { projectName: string; amount: number }[];
  }

  // Helper to normalize contributor name (trims, handles casing and common variations)
  const normalizeName = (name: string): string => {
    if (!name) return 'S.M. Khalilur Rahman Properties Ltd.';
    const trimmed = name.trim().replace(/\s+/g, ' ');
    const lower = trimmed.toLowerCase();
    
    // Normalized mapping for well-known contributors
    if (lower === 'director arifa akhter' || lower === 'arifa akhter' || lower === 'director arifa akter') {
      return 'Director Arifa Akhter';
    }
    if (lower === 'hamid sir' || lower === 'md. abdul hamid' || lower === 'abdul hamid') {
      return 'Hamid Sir';
    }
    if (lower.includes('japan garden city')) {
      return 'Japan Garden City';
    }
    if (lower.includes('japan city tower')) {
      return 'Japan City Tower';
    }
    if (lower.includes('khalilur rahman') || lower.includes('s.m. khalilur')) {
      return 'S.M. Khalilur Rahman (Owner)';
    }

    return trimmed;
  };

  // Calculate donor totals for breakdown view
  const donorSummaryMap: Record<string, DonorSummaryItem> = filtered.reduce((acc, r) => {
    const canonicalName = normalizeName(r.receivedFrom);

    if (r.projectAllocations && r.projectAllocations.length > 0) {
      r.projectAllocations.forEach(alloc => {
        if (filterProject !== 'ALL' && alloc.projectId !== filterProject) return;
        const pName = alloc.projectName || 'General Fund';
        const key = `${canonicalName}___${pName}`;
        if (!acc[key]) {
          acc[key] = {
            receivedFrom: canonicalName,
            projectName: pName,
            sourceType: r.sourceType,
            totalAmount: 0,
            count: 0,
            isLoan: r.sourceType === 'Loan',
            records: []
          };
        }
        acc[key].totalAmount += alloc.amount;
        acc[key].count += 1;
        if (!acc[key].records.some(rec => rec.id === r.id)) {
          acc[key].records.push(r);
        }
      });
    } else {
      if (filterProject === 'ALL' || r.projectId === filterProject) {
        const key = `${canonicalName}___${r.projectName || 'General'}`;
        if (!acc[key]) {
          acc[key] = {
            receivedFrom: canonicalName,
            projectName: r.projectName || 'General Fund',
            sourceType: r.sourceType,
            totalAmount: 0,
            count: 0,
            isLoan: r.sourceType === 'Loan',
            records: []
          };
        }
        acc[key].totalAmount += r.amount;
        acc[key].count += 1;
        if (!acc[key].records.some(rec => rec.id === r.id)) {
          acc[key].records.push(r);
        }
      }
    }
    return acc;
  }, {} as Record<string, DonorSummaryItem>);

  const donorSummaryList: DonorSummaryItem[] = Object.values(donorSummaryMap);

  // Overall Contributor Grouping (Japan Garden City, Company Fund, Dr. K.R. Islam, etc.)
  const contributorOverallList: ContributorOverallItem[] = React.useMemo(() => {
    const map: Record<string, ContributorOverallItem> = {};
    filtered.forEach((r) => {
      const canonicalName = normalizeName(r.receivedFrom);
      
      let effectiveAmount = r.amount;
      if (filterProject !== 'ALL') {
        if (r.projectAllocations && r.projectAllocations.length > 0) {
          const alloc = r.projectAllocations.find(a => a.projectId === filterProject);
          effectiveAmount = alloc ? alloc.amount : 0;
        } else if (r.projectId !== filterProject) {
          effectiveAmount = 0;
        }
      }
      if (effectiveAmount <= 0) return;

      if (!map[canonicalName]) {
        map[canonicalName] = {
          receivedFrom: canonicalName,
          primarySourceType: r.sourceType,
          totalAmount: 0,
          cashAmount: 0,
          bankAmount: 0,
          count: 0,
          isLoan: r.sourceType === 'Loan',
          records: [],
          projectBreakdown: []
        };
      }
      map[canonicalName].totalAmount += effectiveAmount;
      if (r.paymentMethod === 'CASH') {
        map[canonicalName].cashAmount += effectiveAmount;
      } else {
        map[canonicalName].bankAmount += effectiveAmount;
      }
      map[canonicalName].count += 1;
      if (r.sourceType === 'Loan') map[canonicalName].isLoan = true;
      if (!map[canonicalName].records.some(rec => rec.id === r.id)) {
        map[canonicalName].records.push(r);
      }
    });

    Object.values(map).forEach(item => {
      const pMap: Record<string, number> = {};
      item.records.forEach(rec => {
        if (rec.projectAllocations && rec.projectAllocations.length > 0) {
          rec.projectAllocations.forEach(alloc => {
            if (filterProject !== 'ALL' && alloc.projectId !== filterProject) return;
            const pName = alloc.projectName || 'General Fund';
            pMap[pName] = (pMap[pName] || 0) + alloc.amount;
          });
        } else {
          if (filterProject === 'ALL' || rec.projectId === filterProject) {
            const pName = rec.projectName || 'General Fund';
            pMap[pName] = (pMap[pName] || 0) + rec.amount;
          }
        }
      });
      item.projectBreakdown = Object.entries(pMap).map(([projectName, amount]) => ({
        projectName,
        amount
      }));
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filtered, filterProject]);

  const totalLoanAmount = contributorOverallList.filter(c => c.isLoan).reduce((sum, c) => sum + c.totalAmount, 0);
  const totalFundAmount = contributorOverallList.filter(c => !c.isLoan).reduce((sum, c) => sum + c.totalAmount, 0);

  const totalReceived = filtered.reduce((sum, r) => {
    if (filterProject !== 'ALL') {
      if (r.projectAllocations && r.projectAllocations.length > 0) {
        const alloc = r.projectAllocations.find(a => a.projectId === filterProject);
        return sum + (alloc ? alloc.amount : 0);
      }
      return sum + (r.projectId === filterProject ? r.amount : 0);
    }
    return sum + r.amount;
  }, 0);
  const selectedProjectObj = projects.find(p => p.id === filterProject);
  const selectedProjectName = filterProject === 'ALL' 
    ? (isBn ? 'সকল প্রকল্প (All Projects)' : 'All Projects') 
    : (selectedProjectObj?.name || filterProject);

  return (
    <div className="space-y-6">
      
      {/* Main Money Received Page - Hidden during print if Statement Modal is Open */}
      <div className={(contributorStatementItem || isReceiptRegisterPrintOpen) ? 'print:hidden space-y-6' : 'space-y-6'}>
      
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <ArrowUpRight className="w-6 h-6 text-emerald-500" />
            <span>{isBn ? 'টাকা গ্রহণ ও রশিদ রেজিস্টার' : 'Money Received & Receipt Register'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'জাপান সিটি টাওয়ার, জাপান গার্ডেন সিটি, কোম্পানির ফান্ড, মালিক বা অংশীদারদের প্রাপ্ত টাকার অফিসিয়াল রশিদ ও রেজিস্টার' 
              : 'Record funds from Japan City Tower, Japan Garden City, Partners, and print Money Receipts'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsReceiptRegisterPrintOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl text-xs sm:text-sm transition active:scale-95 cursor-pointer border ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-700 border-slate-700 text-amber-400' 
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'প্রাপ্তি রিপোর্ট প্রিন্ট' : 'Print Receipts Statement'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewMoneyIn}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? '+ টাকা গ্রহণ এন্ট্রি' : '+ Receive Money'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট প্রাপ্ত টাকা (জমা)' : 'Total Received'}</span>
            <h3 className="text-xl font-mono font-black text-emerald-500 mt-0.5">
              {formatCurrency(totalReceived, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'প্রাপ্তি এন্ট্রি সংখ্যা' : 'Receipt Count'}</span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {filtered.length} {isBn ? 'টি' : 'entries'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'প্রধান প্রকল্প / খাত' : 'Project Focus'}</span>
            <h3 className={`text-base font-bold mt-0.5 truncate max-w-[200px] ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {selectedProjectName}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}>
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & View Switch Bar */}
      <div className={`border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        
        {/* View Mode Tabs */}
        <div className={`flex items-center p-1 border rounded-xl w-full md:w-auto transition ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('REGISTER')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
              activeTab === 'REGISTER' 
                ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isBn ? '📋 রিসিট রেজিস্টার তালিকা' : 'Receipt Register'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DONOR_BREAKDOWN')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
              activeTab === 'DONOR_BREAKDOWN' 
                ? 'bg-amber-400 text-slate-950 shadow-xs' 
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isBn ? '📊 কে কত দিলো (প্রজেক্ট ও দাতা সামারি)' : 'Contributor Breakdown'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className={`flex-1 min-w-[180px] flex items-center gap-2 border rounded-xl px-3 py-1.5 transition ${
            isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <Search className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'নাম, রিসিট নং বা উৎস...' : 'Search name, receipt...'}
              className="w-full bg-transparent placeholder-slate-400 outline-hidden font-medium text-xs"
            />
          </div>

          {/* Source Type Filter */}
          <select
            value={filterSourceType}
            onChange={(e) => setFilterSourceType(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 outline-hidden font-semibold cursor-pointer text-xs transition ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">{isBn ? 'সকল ধরন (লোন ও ফান্ড)' : 'All Types'}</option>
            <option value="FUND">{isBn ? 'শুধুমাত্র প্রজেক্ট ফান্ড' : 'Project Funds'}</option>
            <option value="LOAN">{isBn ? 'শুধুমাত্র গৃহিত ঋণ (Loan)' : 'Loans Only'}</option>
            <option value="PARTNER">{isBn ? 'পার্টনার/শেয়ার ডিপোজিট' : 'Partner Share'}</option>
          </select>

          {/* Month & Year Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={`border rounded-xl px-3 py-1.5 outline-hidden font-semibold cursor-pointer text-xs transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="ALL">{isBn ? '🗓️ সকল মাস ও বছর' : '🗓️ All Months & Years'}</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 outline-hidden font-semibold cursor-pointer text-xs transition ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">{isBn ? 'সকল প্রকল্প' : 'All Projects'}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donor & Source Breakdown Summary View */}
      {activeTab === 'DONOR_BREAKDOWN' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span>{isBn ? 'টাকা প্রাপ্তির উৎস ও দাতা লেজার বিবরণী' : 'Source of Funds & Contributor Ledgers'}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {isBn 
                  ? 'জাপান গার্ডেন সিটি, কোম্পানি ফান্ড, ব্যাংক লোন, বা ব্যক্তিগত ঋণ কে কত দিলো তার নিখুঁত হিসাব ও আলাদা অফিসিয়াল স্টেটমেন্ট প্রিন্ট' 
                  : 'Track and print exact contribution amounts from Japan Garden City, Company Funds, Loans, and Partners'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReceiptRegisterPrintOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'পূর্ণাঙ্গ রেজিস্টার প্রিন্ট' : 'Print All Receipts'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics by Source Types */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border transition ${
              isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <span className={`text-xs block font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isBn ? 'মোট ফান্ড ও লোন জমা' : 'Grand Total Received'}
              </span>
              <div className="text-2xl font-mono font-black text-emerald-500 mt-1">
                {formatCurrency(totalReceived, isBn ? 'bn' : 'en')}
              </div>
              <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {contributorOverallList.length} {isBn ? 'টি আলাদা উৎস বা দাতা' : 'sources/contributors'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border transition ${
              isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <span className={`text-xs block font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isBn ? 'কোম্পানি ও প্রজেক্ট ফান্ড' : 'Company & Project Funds'}
              </span>
              <div className="text-2xl font-mono font-black text-blue-400 mt-1">
                {formatCurrency(totalFundAmount, isBn ? 'bn' : 'en')}
              </div>
              <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {isBn ? 'জাপান গার্ডেন সিটি, অফিস ডিপোজিট ইত্যাদি' : 'Direct deposits & company capital'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border transition ${
              isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <span className={`text-xs block font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isBn ? 'গৃহীত মোট ঋণ / ধার' : 'Total Loans Received'}
              </span>
              <div className="text-2xl font-mono font-black text-purple-400 mt-1">
                {formatCurrency(totalLoanAmount, isBn ? 'bn' : 'en')}
              </div>
              <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {isBn ? 'ব্যক্তি ও ব্যাংক ঋণ খাত' : 'Personal and institutional loans'}
              </span>
            </div>
          </div>

          {/* Source Filter Quick Pills */}
          <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center gap-2 ${
            isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <span className={`text-xs font-bold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isBn ? '🔍 উৎস ফিল্টার:' : 'Filter Source:'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedContributor(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedContributor === null
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : isDark ? 'bg-slate-900 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'সকল উৎস ও দাতা' : 'All Sources'} ({contributorOverallList.length})
            </button>
            {contributorOverallList.map((c) => (
              <button
                key={c.receivedFrom}
                type="button"
                onClick={() => setSelectedContributor(c.receivedFrom)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedContributor === c.receivedFrom
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark ? 'bg-slate-900 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{c.receivedFrom}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedContributor === c.receivedFrom ? 'bg-slate-950 text-amber-300' : 'bg-slate-700 text-slate-300'
                }`}>
                  ৳{(c.totalAmount / 1000).toFixed(0)}k
                </span>
              </button>
            ))}
          </div>

          {/* Focused Contributor Section (when selected) */}
          {selectedContributor && (() => {
            const activeContr = contributorOverallList.find(c => c.receivedFrom === selectedContributor);
            if (!activeContr) return null;

            return (
              <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${
                isDark ? 'bg-slate-900/90 border-amber-500/40' : 'bg-amber-50/50 border-amber-300 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeContr.isLoan
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {activeContr.isLoan ? (isBn ? 'ধার / ঋণ (Loan)' : 'Loan') : activeContr.primarySourceType}
                      </span>
                      <h3 className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {activeContr.receivedFrom}
                      </h3>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isBn 
                        ? `মোট জমা: ৳${activeContr.totalAmount.toLocaleString()} | ক্যাশ: ৳${activeContr.cashAmount.toLocaleString()} | ব্যাংক: ৳${activeContr.bankAmount.toLocaleString()} (${activeContr.count}টি এন্ট্রি)` 
                        : `Total: ৳${activeContr.totalAmount.toLocaleString()} | Cash: ৳${activeContr.cashAmount.toLocaleString()} | Bank: ৳${activeContr.bankAmount.toLocaleString()} (${activeContr.count} entries)`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setContributorStatementItem(activeContr)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isBn ? 'অফিসিয়াল স্টেটমেন্ট প্রিন্ট (A4)' : 'Print Contributor Statement'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedContributor(null)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="ফিল্টার বাতিল করুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contributor's detailed transaction table */}
                <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}>
                        <th className="py-2.5 px-3">{isBn ? 'রিসিট নং' : 'Receipt No'}</th>
                        <th className="py-2.5 px-3">{isBn ? 'তারিখ' : 'Date'}</th>
                        <th className="py-2.5 px-3">{isBn ? 'প্রকল্প' : 'Project'}</th>
                        <th className="py-2.5 px-3">{isBn ? 'বিবরণ' : 'Description'}</th>
                        <th className="py-2.5 px-3">{isBn ? 'পেমেন্ট মাধ্যম ও অ্যাকাউন্ট' : 'Payment & Account'}</th>
                        <th className="py-2.5 px-3 text-right">{isBn ? 'টাকা' : 'Amount'}</th>
                        <th className="py-2.5 px-3 text-center">{isBn ? 'রশিদ প্রিন্ট' : 'Receipt'}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800 bg-slate-900/60' : 'divide-slate-200 bg-white'}`}>
                      {activeContr.records.map((rec) => (
                        <tr key={rec.id} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{rec.receiptNumber || 'MR-GEN'}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{formatDisplayDate(rec.date, isBn ? 'bn' : 'en')}</td>
                          <td className="py-2.5 px-3 font-medium">{rec.projectName || 'General'}</td>
                          <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">{rec.description}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 mr-1.5">
                              {rec.paymentMethod}
                            </span>
                            <span className="text-slate-400 text-[11px]">{rec.accountName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-400">
                            {formatCurrency(rec.amount, isBn ? 'bn' : 'en')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handlePrintReceipt(rec)}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              {isBn ? 'রশিদ' : 'Print'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className={`border-t-2 font-black ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <td colSpan={5} className="py-3 px-3 text-right">
                          {isBn ? `মোট জমাকৃত টাকা (${activeContr.receivedFrom}):` : 'Total Received:'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                          {formatCurrency(activeContr.totalAmount, isBn ? 'bn' : 'en')}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Contributor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributorOverallList.map((item) => (
              <div 
                key={item.receivedFrom} 
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  selectedContributor === item.receivedFrom
                    ? 'border-amber-500 ring-2 ring-amber-500/30 bg-slate-800/95'
                    : isDark ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600' : 'bg-white border-slate-200 shadow-2xs hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.isLoan 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.isLoan ? (isBn ? 'ধার / ঋণ (Loan)' : 'Loan') : item.primarySourceType}
                    </span>
                    <h4 className={`font-black text-sm mt-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {item.receivedFrom}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-900 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
                    {item.count} {isBn ? 'টি এন্ট্রি' : 'tx'}
                  </span>
                </div>

                {/* Total Highlight */}
                <div className={`p-3 rounded-xl flex justify-between items-center ${
                  isDark ? 'bg-slate-900/90 border border-slate-700/60' : 'bg-slate-50 border border-slate-200'
                }`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isBn ? 'সর্বমোট প্রদানকৃত টাকা:' : 'Total Received:'}
                  </span>
                  <span className="text-base font-mono font-black text-emerald-400">
                    {formatCurrency(item.totalAmount, isBn ? 'bn' : 'en')}
                  </span>
                </div>

                {/* Payment Breakdown (Cash vs Bank) */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'নগদ (Cash):' : 'Cash:'}</span>
                    <span className="font-mono font-bold">{formatCurrency(item.cashAmount, isBn ? 'bn' : 'en')}</span>
                  </div>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'ব্যাংক (Bank):' : 'Bank:'}</span>
                    <span className="font-mono font-bold">{formatCurrency(item.bankAmount, isBn ? 'bn' : 'en')}</span>
                  </div>
                </div>

                {/* Project Breakdown Tags */}
                {item.projectBreakdown.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {isBn ? 'প্রকল্প ভিত্তিক বিভাজন:' : 'Project Allocation:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.projectBreakdown.map((pb, pIdx) => (
                        <span 
                          key={pIdx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-900/70 border border-slate-700/60 text-amber-300 font-medium"
                        >
                          {pb.projectName}: ৳{(pb.amount / 1000).toFixed(0)}k
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/40">
                  <button
                    type="button"
                    onClick={() => setSelectedContributor(item.receivedFrom)}
                    className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition text-center cursor-pointer"
                  >
                    {isBn ? '🔍 লেজার দেখুন' : 'View Ledger'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContributorStatementItem(item)}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isBn ? 'স্টেটমেন্ট প্রিন্ট' : 'Print Statement'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Master Comparison Table */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {isBn ? '📊 সকল ফান্ড উৎস ও দাতার সার্বিক তুলনামূলক বিবরণী' : 'Master Contributor & Fund Source Ledger'}
              </h4>
              <button
                type="button"
                onClick={() => setIsReceiptRegisterPrintOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isBn ? 'পূর্ণাঙ্গ প্রিন্ট' : 'Print All'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[10px] uppercase tracking-wider ${
                    isDark ? 'bg-slate-900/90 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">{isBn ? 'উৎস / প্রদানকারী' : 'Source / Contributor'}</th>
                    <th className="py-2.5 px-3">{isBn ? 'খাত / ধরন' : 'Category'}</th>
                    <th className="py-2.5 px-3">{isBn ? 'এন্ট্রি সংখ্যা' : 'Entries'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'নগদ (Cash)' : 'Cash'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'ব্যাংক (Bank)' : 'Bank'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'মোট টাকা' : 'Total Amount'}</th>
                    <th className="py-2.5 px-3 text-center">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {contributorOverallList.map((item, idx) => (
                    <tr key={idx} className={isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 text-slate-400 font-mono font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">{item.receivedFrom}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isLoan ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.isLoan ? (isBn ? 'ঋণ (Loan)' : 'Loan') : item.primarySourceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{item.count}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatCurrency(item.cashAmount, isBn ? 'bn' : 'en')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatCurrency(item.bankAmount, isBn ? 'bn' : 'en')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-400">
                        {formatCurrency(item.totalAmount, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setContributorStatementItem(item)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                        >
                          {isBn ? 'প্রিন্ট' : 'Print'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className={`border-t-2 font-black ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                    <td colSpan={6} className="py-3 px-3 text-right text-xs">
                      {isBn ? 'সর্বমোট ফান্ড ও ঋণ প্রাপ্তি (Grand Total):' : 'Grand Total:'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                      {formatCurrency(totalReceived, isBn ? 'bn' : 'en')}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Table (Register View) */}
      {activeTab === 'REGISTER' && (
      <div className={`border rounded-2xl overflow-hidden shadow-xs transition ${
        isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase text-[10px] tracking-wider ${
                isDark ? 'border-slate-700 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}>
                <th className="py-3 px-4">{isBn ? 'রিসিট নং' : 'Receipt No'}</th>
                <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রকল্প' : 'Project'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রদানকারী (কার নিকট হতে প্রাপ্ত)' : 'Received From'}</th>
                <th className="py-3 px-4">{isBn ? 'উৎস / খাত' : 'Source / Head'}</th>
                <th className="py-3 px-4">{isBn ? 'জমা একাউন্ট' : 'Account'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                <th className="py-3 px-4 text-center">{isBn ? 'প্রিন্ট ও অ্যাকশন' : 'Print / Action'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {isBn ? 'কোন টাকা প্রাপ্তির রেকর্ড পাওয়া যায়নি।' : 'No money receipts found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`transition cursor-pointer ${
                      isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handlePrintReceipt(item)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-[11px] border ${
                        isDark 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                      }`}>
                        {item.receiptNumber || 'MR-GEN'}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatDisplayDate(item.date, isBn ? 'bn' : 'en')}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.projectAllocations && item.projectAllocations.length > 1 ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            🔀 {item.projectAllocations.length} {isBn ? 'টি প্রজেক্টে ভাগ' : 'Projects Split'}
                          </span>
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            {item.projectAllocations.map((a, aIdx) => (
                              <span key={aIdx} className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                • {a.projectName}: <strong className="font-mono">৳{a.amount.toLocaleString()}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className={`font-semibold block truncate max-w-[160px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {item.projectName || 'General Fund'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold block ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.receivedFrom}</span>
                      <span className={`text-[11px] truncate block max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        isDark 
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {item.sourceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.accountName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-mono font-black text-sm text-emerald-500">
                        {formatCurrency(item.amount, isBn ? 'bn' : 'en')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const linkedVoucher = vouchers.find(v => v.transactionId === item.id || v.voucherNumber === item.receiptNumber);
                          if (!linkedVoucher?.attachmentUrl) return null;
                          return (
                            <button
                              type="button"
                              onClick={() => onSelectVoucher && onSelectVoucher(linkedVoucher)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isDark 
                                  ? 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300' 
                                  : 'bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-700 border border-amber-200'
                              }`}
                              title={isBn ? 'সংযুক্ত মেমো বা রশিদ দেখুন' : 'View Memo'}
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          );
                        })()}

                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition text-xs shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isBn ? 'রশিদ প্রিন্ট' : 'Print Receipt'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700/80 hover:bg-blue-600 text-blue-300 hover:text-white' 
                              : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200'
                          }`}
                          title={isBn ? 'টাকা প্রাপ্তি এডিট / সংশোধন' : 'Edit Receipt'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteModalItem(item)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white' 
                              : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200'
                          }`}
                          title={isBn ? 'প্রাপ্তি এন্ট্রি মুছে ফেলুন' : 'Delete Money Received'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      </div> {/* End of Main Money Received Page Wrapper */}

      {/* Full Statement Modal */}
      {isReceiptRegisterPrintOpen && (
        <div 
          id="receipt-register-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block printable-modal"
        >
          <div className="bg-white text-slate-950 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none print:overflow-visible print:block">
            
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {isBn ? 'টাকা প্রাপ্তি ও রশিদ রেজিস্টার স্টেটমেন্ট' : 'Money Received Register Statement'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print Statement'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptRegisterPrintOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto print:p-4 text-slate-950">
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
                  {isBn ? (settings?.companyNameBn || 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ') : (settings?.companyName || 'S.M. KHALILUR RAHMAN PROPERTIES LTD.')}
                </h1>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {isBn ? (settings?.addressBn || settings?.address || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ') : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
                </p>
                <p className="text-[11px] text-slate-600">
                  Phone: {settings?.phone || '01672965561'} | Email: {settings?.email || 'info@skrpproperties.com'}
                </p>
                <div className="inline-block mt-3 px-5 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-black tracking-wider uppercase rounded-md">
                  {isBn ? 'টাকা প্রাপ্তি ও ফান্ডিং রেজিস্টার স্টেটমেন্ট' : 'MONEY RECEIVED & DEPOSIT REGISTER STATEMENT'}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-lg border border-slate-400 text-xs mb-4">
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'প্রকল্প:' : 'Project:'}</span>
                  <span className="font-bold text-slate-950">{selectedProjectName}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'তারিখ:' : 'Report Date:'}</span>
                  <span className="font-bold text-slate-950">{formatDisplayDate(new Date().toISOString().split('T')[0], isBn ? 'bn' : 'en')}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'মোট এন্ট্রি সংখ্যা:' : 'Total Receipts:'}</span>
                  <span className="font-bold text-slate-950">{filtered.length} {isBn ? 'টি' : 'records'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'সর্বমোট প্রাপ্ত টাকা:' : 'Total Received:'}</span>
                  <span className="font-black text-slate-950 text-sm text-emerald-800">{formatCurrency(totalReceived, isBn ? 'bn' : 'en')}</span>
                </div>
              </div>

              <div className="border-2 border-slate-800 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 border-b-2 border-slate-800 text-slate-950 font-black text-[11px] uppercase">
                      <th className="py-2.5 px-3 border-r border-slate-400 text-center w-10">{isBn ? 'ক্র.' : 'Sl'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'রিসিট নং' : 'Receipt No'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'প্রকল্প' : 'Project'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'প্রদানকারী' : 'Received From'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'উৎস ও বিবরণ' : 'Source & Description'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'জমা একাউন্ট' : 'Account'}</th>
                      <th className="py-2.5 px-3 text-right">{isBn ? 'পরিমাণ (৳)' : 'Amount (Tk)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-slate-300 text-[11px]">
                    {filtered.map((r, idx) => (
                      <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-950">{r.receiptNumber || 'MR-GEN'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 whitespace-nowrap">{formatDisplayDate(r.date, isBn ? 'bn' : 'en')}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-medium">{r.projectName || 'General'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-950">{r.receivedFrom}</td>
                        <td className="py-2 px-3 border-r border-slate-300">
                          <span className="font-bold text-slate-900 block">{r.sourceType}</span>
                          <span className="text-slate-600 block text-[10px]">{r.description}</span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-700">{r.accountName}</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                          {formatCurrency(r.amount, isBn ? 'bn' : 'en')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-black border-t-2 border-slate-800 text-xs">
                      <td colSpan={7} className="py-3 px-3 text-right border-r border-slate-400">
                        {isBn ? 'সর্বমোট প্রাপ্ত টাকা (Grand Total):' : 'Grand Total Received:'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-emerald-900">
                        {formatCurrency(totalReceived, isBn ? 'bn' : 'en')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
                <div className="flex flex-col items-center justify-end">
                  <div className="w-48 border-t-2 border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'হিসাব শাখা' : 'Accounts Officer'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-48 border-t-2 border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'গ্রহীতার স্বাক্ষর' : 'Received By'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-48 border-t-2 border-slate-900 pt-1 font-bold text-slate-950">
                    {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Official Contributor / Fund Source Statement Print Modal (A4) */}
      {contributorStatementItem && (
        <div 
          id="contributor-statement-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block printable-modal"
        >
          <div className="bg-white text-slate-950 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none print:overflow-visible print:block">
            
            {/* Modal Screen Top Bar (Hidden in Print) */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">
                    {isBn ? 'ফান্ডিং উৎস ও দাতা স্টেটমেন্ট প্রিন্ট' : 'Contributor & Fund Source Statement'}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    {contributorStatementItem.receivedFrom}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? 'A4 পেপারে প্রিন্ট করুন' : 'Print Statement'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContributorStatementItem(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Document on Official Pad */}
            <div className="p-6 sm:p-8 overflow-y-auto print:p-4 text-slate-950">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
                  {isBn ? (settings?.companyNameBn || 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ') : (settings?.companyName || 'S.M. KHALILUR RAHMAN PROPERTIES LTD.')}
                </h1>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {isBn ? (settings?.addressBn || settings?.address || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ') : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
                </p>
                <p className="text-[11px] text-slate-600">
                  Phone: {settings?.phone || '01672965561'} | Email: {settings?.email || 'info@skrpproperties.com'}
                </p>
                <div className="inline-block mt-3 px-6 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-black tracking-wider uppercase rounded-md">
                  {isBn ? 'টাকা প্রাপ্তির উৎস ও ফান্ডিং বিবরণী' : 'SOURCE OF FUNDS & CONTRIBUTOR LEDGER STATEMENT'}
                </div>
              </div>

              {/* Contributor Profile & High-level summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-4 rounded-xl border border-slate-400 text-xs mb-4">
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'ফান্ড উৎস / দাতা:' : 'Contributor / Source:'}</span>
                  <span className="font-black text-sm text-slate-950">{contributorStatementItem.receivedFrom}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'খাত / ধরন:' : 'Category / Type:'}</span>
                  <span className="font-bold text-slate-900">
                    {contributorStatementItem.isLoan ? (isBn ? 'ধার / ঋণ (Loan)' : 'Loan') : contributorStatementItem.primarySourceType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'মোট এন্ট্রি সংখ্যা:' : 'Total Records:'}</span>
                  <span className="font-bold text-slate-950">{contributorStatementItem.count} {isBn ? 'টি' : 'entries'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'সর্বমোট প্রাপ্ত টাকা:' : 'Total Received:'}</span>
                  <span className="font-black text-sm text-emerald-800 font-mono">
                    {formatCurrency(contributorStatementItem.totalAmount, isBn ? 'bn' : 'en')}
                  </span>
                </div>
              </div>

              {/* Cash vs Bank and Amount in Words */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs mb-5">
                <div>
                  <span className="font-bold text-slate-700">{isBn ? 'কথায়:' : 'In Words:'} </span>
                  <span className="font-semibold text-slate-950">
                    {isBn ? convertNumberToWordsBn(contributorStatementItem.totalAmount) : convertNumberToWordsEn(contributorStatementItem.totalAmount)} {isBn ? 'টাকা মাত্র' : 'Taka Only'}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-700">
                  {isBn ? 'নগদ:' : 'Cash:'} ৳{contributorStatementItem.cashAmount.toLocaleString()} | {isBn ? 'ব্যাংক:' : 'Bank:'} ৳{contributorStatementItem.bankAmount.toLocaleString()}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border-2 border-slate-800 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 border-b-2 border-slate-800 text-slate-950 font-black text-[11px] uppercase">
                      <th className="py-2.5 px-3 border-r border-slate-400 text-center w-10">{isBn ? 'ক্র.' : 'Sl'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'রিসিট নং' : 'Receipt No'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'প্রকল্প' : 'Project'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'বিবরণ ও মাধ্যম' : 'Description & Mode'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'জমা অ্যাকাউন্ট' : 'Deposit Account'}</th>
                      <th className="py-2.5 px-3 text-right">{isBn ? 'পরিমাণ (৳)' : 'Amount (Tk)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-slate-300 text-[11px]">
                    {contributorStatementItem.records.map((rec: MoneyReceived, idx: number) => (
                      <tr key={rec.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-950">{rec.receiptNumber || 'MR-GEN'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 whitespace-nowrap">{formatDisplayDate(rec.date, isBn ? 'bn' : 'en')}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-medium">{rec.projectName || 'General'}</td>
                        <td className="py-2 px-3 border-r border-slate-300">
                          <span className="font-semibold text-slate-900 block">{rec.description}</span>
                          <span className="text-slate-600 text-[10px]">{rec.paymentMethod}</span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-700">{rec.accountName}</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                          {formatCurrency(rec.amount, isBn ? 'bn' : 'en')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-black border-t-2 border-slate-800 text-xs">
                      <td colSpan={6} className="py-3 px-3 text-right border-r border-slate-400">
                        {isBn ? 'সর্বমোট প্রদানকৃত টাকা (Total Contribution):' : 'Total Contribution:'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-emerald-900">
                        {formatCurrency(contributorStatementItem.totalAmount, isBn ? 'bn' : 'en')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Authorized Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
                <div className="flex flex-col items-center justify-end">
                  <div className="w-44 border-t-2 border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'প্রস্তুতকারক' : 'Prepared By'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-44 border-t-2 border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'হিসাব শাখা' : 'Accounts Officer'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-44 border-t-2 border-slate-900 pt-1 font-bold text-slate-950">
                    {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Money Received Modal */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {isBn ? 'টাকা গ্রহণ / রিসিট সংশোধন' : 'Edit Money Received Record'}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-mono">
                    {editModalItem.receiptNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'তারিখ' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'প্রকল্প (ঐচ্ছিক/জেনারেল)' : 'Project'}
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="">{isBn ? 'হেড অফিস / সাধারণ তহবিল' : 'Head Office / General Fund'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'কার নিকট হতে প্রাপ্ত' : 'Received From'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editReceivedFrom}
                    onChange={(e) => setEditReceivedFrom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                    placeholder="e.g. Dr. K.R. Islam / Japan City"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'প্রাপ্ত টাকার পরিমাণ (৳)' : 'Amount Received (৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-sm outline-hidden"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'প্রাপ্তির ধরন / ফান্ড' : 'Source Type'}
                  </label>
                  <select
                    value={editSourceType}
                    onChange={(e) => setEditSourceType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="DIRECTOR_DEPOSIT">{isBn ? 'ডিরেক্টর ডিপোজিট / পার্টনার' : 'Director Deposit'}</option>
                    <option value="LOAN">{isBn ? 'গৃহিত ঋণ (Loan)' : 'Loan'}</option>
                    <option value="FLAT_SALE">{isBn ? 'ফ্ল্যাট বিক্রয় বুকিং/কিস্তি' : 'Flat Sale Installment'}</option>
                    <option value="SHAREHOLDER_EQUITY">{isBn ? 'শেয়ারহোল্ডার ইকুইটি' : 'Shareholder Equity'}</option>
                    <option value="LANDOWNER_ADVANCE">{isBn ? 'জমিমালিক অগ্রগতি' : 'Landowner Advance'}</option>
                    <option value="BANK_FINANCING">{isBn ? 'ব্যাংক ফাইন্যান্সিং' : 'Bank Financing'}</option>
                    <option value="OTHER">{isBn ? 'অন্যান্য প্রাপ্তি' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'জমা হওয়া একাউন্ট' : 'Deposit Account'} *
                  </label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} (৳{a.currentBalance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK">BANK</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="MOBILE_BANKING">MOBILE BANKING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'চেক/ট্রানজেকশন রেফারেন্স' : 'Reference / Cheque No.'}
                  </label>
                  <input
                    type="text"
                    value={editReference}
                    onChange={(e) => setEditReference(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                    placeholder="e.g. CQ-99102"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isBn ? 'বিবরণ (Description)' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 outline-hidden font-medium resize-none"
                  placeholder="Details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition font-semibold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'টাকা গ্রহণের এন্ট্রি মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে ${deleteModalItem.receivedFrom} হতে প্রাপ্ত ৳${deleteModalItem.amount.toLocaleString()} এন্ট্রিটি মুছে ফেলতে চান? এটি একাউন্ট জমা রিভার্স করবে।`
                : `Are you sure you want to delete receipt of ৳${deleteModalItem.amount.toLocaleString()} from ${deleteModalItem.receivedFrom}? This will reverse the account deposit.`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ' : 'Reason for Deletion'}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুল এন্ট্রি / টাইপিং ভুল' : 'e.g. Data entry error'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
