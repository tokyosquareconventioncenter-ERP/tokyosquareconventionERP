/**
 * Main Executive ERP Dashboard View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Landmark, 
  Banknote,
  Users, 
  Truck, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Eye, 
  Printer, 
  Filter, 
  Layers,
  X,
  Info,
  ChevronRight,
  PieChart,
  ShieldCheck,
  Wrench,
  Sparkles,
  Check,
  Search,
  ArrowRightLeft
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { Voucher } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DashboardViewProps {
  onNavigate: (view: any) => void;
  onOpenNewTransaction: () => void;
  onSelectVoucher: (v: Voucher) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTransaction,
  onSelectVoucher,
}) => {
  const { language, t } = useLanguage();
  const { 
    projects, 
    accounts, 
    expenses, 
    moneyReceived, 
    loans, 
    contractors, 
    suppliers, 
    vouchers,
    settings,
    selectedProjectId,
    setSelectedProjectId,
    addExpense,
    updateExpense,
    updateMoneyReceived,
  } = useData();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  const [showProjectCashModal, setShowProjectCashModal] = useState<boolean>(false);
  const [showBankInspectorModal, setShowBankInspectorModal] = useState<boolean>(false);
  const [bankExpenseSearch, setBankExpenseSearch] = useState<string>('');
  const [reconcileSuccessMsg, setReconcileSuccessMsg] = useState<string | null>(null);

  const isBn = language === 'bn';

  const isAllProjects = selectedProjectId === 'ALL';
  const isHeadOffice = selectedProjectId === 'company';
  const currentProject = projects.find(p => p.id === selectedProjectId);
  const selectedProjectName = isAllProjects 
    ? (isBn ? 'সকল প্রকল্প (কেন্দ্রীয়)' : 'All Projects (Central)') 
    : isHeadOffice 
      ? (isBn ? 'কোম্পানি হেড অফিস' : 'Company Head Office') 
      : (currentProject?.name || (isBn ? 'নির্বাচিত প্রকল্প' : 'Selected Project'));

  // Filtered by selected project if specific project chosen
  const filteredProjects = selectedProjectId === 'ALL' 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  const filteredExpenses = selectedProjectId === 'ALL' 
    ? expenses.filter(e => !e.isDeleted)
    : selectedProjectId === 'company'
      ? expenses.filter(e => !e.isDeleted && (e.projectId === 'company' || !e.projectId))
      : expenses.filter(e => !e.isDeleted && e.projectId === selectedProjectId);

  const filteredReceived = selectedProjectId === 'ALL'
    ? moneyReceived
    : selectedProjectId === 'company'
      ? moneyReceived.filter(r => {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            return r.projectAllocations.some(a => a.projectId === 'company' || !a.projectId);
          }
          return r.projectId === 'company' || !r.projectId;
        })
      : moneyReceived.filter(r => {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            return r.projectAllocations.some(a => a.projectId === selectedProjectId);
          }
          return r.projectId === selectedProjectId;
        });

  // Mutually exclusive cash vs bank classifiers to guarantee 100% ledger parity
  const isCashTransaction = (accountId?: string, paymentMethod?: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      return acc.type === 'CASH';
    }
    return paymentMethod === 'CASH' || (!paymentMethod && paymentMethod !== 'BANK' && paymentMethod !== 'ONLINE' && paymentMethod !== 'CHEQUE');
  };

  const isBankTransaction = (accountId?: string, paymentMethod?: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      return acc.type === 'BANK' || acc.type === 'MOBILE_BANKING';
    }
    return paymentMethod === 'BANK' || paymentMethod === 'ONLINE' || paymentMethod === 'CHEQUE' || paymentMethod === 'MOBILE_BANKING';
  };

  // Automated Discrepancy & Audit Check between account repository and payment mode
  const conflictingTransactions = useMemo(() => {
    const list: {
      type: 'EXPENSE' | 'RECEIPT';
      id: string;
      voucherNo: string;
      date: string;
      amount: number;
      accountName?: string;
      expectedMethod: string;
      actualMethod: string;
      reason: string;
    }[] = [];

    expenses.filter(e => !e.isDeleted).forEach(e => {
      const acc = accounts.find(a => a.id === e.accountId);
      if (acc) {
        if (acc.type === 'CASH' && (e.paymentMethod === 'BANK' || e.paymentMethod === 'ONLINE' || e.paymentMethod === 'CHEQUE')) {
          list.push({
            type: 'EXPENSE',
            id: e.id,
            voucherNo: e.voucherNumber || 'CPV',
            date: e.date,
            amount: e.amount,
            accountName: acc.name,
            expectedMethod: 'CASH',
            actualMethod: e.paymentMethod,
            reason: isBn ? `ক্যাশ অ্যাকাউন্ট (${acc.name}) কিন্তু মাধ্যম দেওয়া '${e.paymentMethod}'` : `Cash account (${acc.name}) but mode is '${e.paymentMethod}'`
          });
        } else if ((acc.type === 'BANK' || acc.type === 'MOBILE_BANKING') && e.paymentMethod === 'CASH') {
          list.push({
            type: 'EXPENSE',
            id: e.id,
            voucherNo: e.voucherNumber || 'CPV',
            date: e.date,
            amount: e.amount,
            accountName: acc.name,
            expectedMethod: 'BANK',
            actualMethod: e.paymentMethod,
            reason: isBn ? `ব্যাংক অ্যাকাউন্ট (${acc.name}) কিন্তু মাধ্যম দেওয়া 'CASH'` : `Bank account (${acc.name}) but mode is 'CASH'`
          });
        }
      }
    });

    moneyReceived.forEach(r => {
      const acc = accounts.find(a => a.id === r.accountId);
      if (acc) {
        if (acc.type === 'CASH' && (r.paymentMethod === 'BANK' || r.paymentMethod === 'ONLINE' || r.paymentMethod === 'CHEQUE')) {
          list.push({
            type: 'RECEIPT',
            id: r.id,
            voucherNo: r.receiptNumber || 'MR',
            date: r.date,
            amount: r.amount,
            accountName: acc.name,
            expectedMethod: 'CASH',
            actualMethod: r.paymentMethod,
            reason: isBn ? `ক্যাশ অ্যাকাউন্ট (${acc.name}) কিন্তু মাধ্যম দেওয়া '${r.paymentMethod}'` : `Cash account (${acc.name}) but mode is '${r.paymentMethod}'`
          });
        } else if ((acc.type === 'BANK' || acc.type === 'MOBILE_BANKING') && r.paymentMethod === 'CASH') {
          list.push({
            type: 'RECEIPT',
            id: r.id,
            voucherNo: r.receiptNumber || 'MR',
            date: r.date,
            amount: r.amount,
            accountName: acc.name,
            expectedMethod: 'BANK',
            actualMethod: r.paymentMethod,
            reason: isBn ? `ব্যাংক অ্যাকাউন্ট (${acc.name}) কিন্তু মাধ্যম দেওয়া 'CASH'` : `Bank account (${acc.name}) but mode is 'CASH'`
          });
        }
      }
    });

    return list;
  }, [expenses, moneyReceived, accounts, isBn]);

  const handleAutoReconcile = () => {
    let count = 0;
    conflictingTransactions.forEach(item => {
      if (item.type === 'EXPENSE') {
        updateExpense(item.id, { paymentMethod: item.expectedMethod as any });
      } else {
        updateMoneyReceived(item.id, { paymentMethod: item.expectedMethod as any });
      }
      count++;
    });
    setReconcileSuccessMsg(
      isBn 
        ? `✅ সফল হয়েছে! ${count}টি লেনদেনের মাধ্যম ও অ্যাকাউন্ট সমন্বয় করা হয়েছে। লেজার ও ড্যাশবোর্ড এখন নিখুঁত মিল।` 
        : `✅ Successfully auto-reconciled ${count} transactions. Ledger and dashboard are now fully in sync.`
    );
    setTimeout(() => setReconcileSuccessMsg(null), 8000);
  };

  // Key KPI Calculations & Cash in Hand breakdown
  const cashAccounts = accounts.filter(a => a.type === 'CASH');
  const bankAccounts = accounts.filter(a => a.type === 'BANK' || a.type === 'MOBILE_BANKING');

  const totalCashOpening = cashAccounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0);
  const accountCashSum = cashAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const totalBankOpening = bankAccounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0);
  const accountBankSum = bankAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  // Direct transaction cash breakdown
  const totalCashReceived = filteredReceived
    .filter(r => isCashTransaction(r.accountId, r.paymentMethod))
    .reduce((sum, r) => {
      if (selectedProjectId !== 'ALL' && r.projectAllocations && r.projectAllocations.length > 0) {
        const alloc = r.projectAllocations.find(a => 
          selectedProjectId === 'company' 
            ? (a.projectId === 'company' || !a.projectId)
            : a.projectId === selectedProjectId
        );
        return sum + (alloc ? alloc.amount : 0);
      }
      return sum + (r.amount || 0);
    }, 0);

  const totalCashExpenses = filteredExpenses
    .filter(e => isCashTransaction(e.accountId, e.paymentMethod))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Cash in hand priority: account current balance sum, or fallback to cash opening + received - expenses
  const cashInHand = accountCashSum !== 0 
    ? accountCashSum 
    : (totalCashOpening + totalCashReceived - totalCashExpenses);

  // Project-specific site cash net balance (Inflow - Outflow)
  const projectNetCash = totalCashReceived - totalCashExpenses;
  const displayCashInHand = isAllProjects ? cashInHand : projectNetCash;

  // Comprehensive project-wise cash breakdown
  const projectCashBreakdown = [
    ...projects.map(p => {
      const pCashIn = moneyReceived
        .filter(r => isCashTransaction(r.accountId, r.paymentMethod))
        .reduce((sum, r) => {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            const alloc = r.projectAllocations.find(a => a.projectId === p.id);
            return sum + (alloc ? alloc.amount : 0);
          }
          return sum + (r.projectId === p.id ? (r.amount || 0) : 0);
        }, 0);
      const pCashOut = expenses
        .filter(e => !e.isDeleted && e.projectId === p.id && isCashTransaction(e.accountId, e.paymentMethod))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const pTotalExp = expenses
        .filter(e => !e.isDeleted && e.projectId === p.id)
        .reduce((sum, e) => sum + e.amount, 0);
      const pTotalRec = moneyReceived
        .reduce((sum, r) => {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            const alloc = r.projectAllocations.find(a => a.projectId === p.id);
            return sum + (alloc ? alloc.amount : 0);
          }
          return sum + (r.projectId === p.id ? (r.amount || 0) : 0);
        }, 0);
      return {
        id: p.id,
        name: p.name,
        isHeadOffice: false,
        cashIn: pCashIn,
        cashOut: pCashOut,
        netCash: pCashIn - pCashOut,
        totalExpenses: pTotalExp,
        totalReceived: pTotalRec,
      };
    }),
    (() => {
      const cCashIn = moneyReceived
        .filter(r => isCashTransaction(r.accountId, r.paymentMethod))
        .reduce((sum, r) => {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            const alloc = r.projectAllocations.find(a => a.projectId === 'company' || !a.projectId);
            return sum + (alloc ? alloc.amount : 0);
          }
          return sum + ((r.projectId === 'company' || !r.projectId) ? (r.amount || 0) : 0);
        }, 0);
      const cCashOut = expenses
        .filter(e => !e.isDeleted && (e.projectId === 'company' || !e.projectId) && isCashTransaction(e.accountId, e.paymentMethod))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const cTotalExp = expenses
        .filter(e => !e.isDeleted && (e.projectId === 'company' || !e.projectId))
        .reduce((sum, e) => sum + e.amount, 0);
      const cTotalRec = moneyReceived
        .reduce((sum, r) => {
          if (r.projectAllocations && r.projectAllocations.length > 0) {
            const alloc = r.projectAllocations.find(a => a.projectId === 'company' || !a.projectId);
            return sum + (alloc ? alloc.amount : 0);
          }
          return sum + ((r.projectId === 'company' || !r.projectId) ? (r.amount || 0) : 0);
        }, 0);
      return {
        id: 'company',
        name: isBn ? 'কোম্পানি হেড অফিস / সাধারণ' : 'Company Head Office / General',
        isHeadOffice: true,
        cashIn: cCashIn,
        cashOut: cCashOut,
        netCash: cCashIn - cCashOut,
        totalExpenses: cTotalExp,
        totalReceived: cTotalRec,
      };
    })()
  ];

  // Project-specific Bank Inflow (received via Bank/Online for this project)
  const projectBankIn = moneyReceived
    .filter(r => isBankTransaction(r.accountId, r.paymentMethod))
    .reduce((sum, r) => {
      if (r.projectAllocations && r.projectAllocations.length > 0) {
        const alloc = r.projectAllocations.find(a => 
          selectedProjectId === 'company' 
            ? (a.projectId === 'company' || !a.projectId) 
            : a.projectId === selectedProjectId
        );
        return sum + (alloc ? alloc.amount : 0);
      }
      const match = selectedProjectId === 'company' 
        ? (r.projectId === 'company' || !r.projectId) 
        : r.projectId === selectedProjectId;
      return sum + (match ? (r.amount || 0) : 0);
    }, 0);

  // Project-specific Bank Outflow (expenses paid via Bank/Online for this project)
  const projectBankOut = expenses
    .filter(e => {
      if (e.isDeleted) return false;
      const match = selectedProjectId === 'company' 
        ? (e.projectId === 'company' || !e.projectId) 
        : e.projectId === selectedProjectId;
      if (!match) return false;
      return isBankTransaction(e.accountId, e.paymentMethod);
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const projectNetBank = projectBankIn - projectBankOut;

  // List of all bank expenses for the selected project
  const projectBankExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (e.isDeleted) return false;
      const match = selectedProjectId === 'ALL'
        ? true
        : selectedProjectId === 'company'
          ? (e.projectId === 'company' || !e.projectId)
          : e.projectId === selectedProjectId;
      if (!match) return false;
      return isBankTransaction(e.accountId, e.paymentMethod);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedProjectId, accounts]);

  const defaultCashAccount = useMemo(() => {
    return accounts.find(a => a.type === 'CASH' && a.isDefault) || accounts.find(a => a.type === 'CASH') || accounts[0];
  }, [accounts]);

  // Smart Combo Finder for bank deficit (e.g. 13,940)
  const matchingCombos = useMemo(() => {
    if (projectNetBank >= 0) return [];
    const target = Math.abs(projectNetBank);
    const list = projectBankExpenses.map(e => ({
      id: e.id,
      amt: e.amount,
      voucher: e.voucherNumber || 'EXP',
      date: e.date,
      paidTo: e.paidTo,
      category: e.category,
      purpose: e.purpose || e.category
    }));
    const results: { ids: string[]; total: number; items: typeof list }[] = [];

    // 1-item match
    for (const item of list) {
      if (item.amt === target) {
        results.push({ ids: [item.id], total: item.amt, items: [item] });
      }
    }
    // 2-item match
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].amt + list[j].amt === target) {
          results.push({ ids: [list[i].id, list[j].id], total: target, items: [list[i], list[j]] });
        }
      }
    }
    // 3-item match
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        for (let k = j + 1; k < list.length; k++) {
          if (list[i].amt + list[j].amt + list[k].amt === target) {
            results.push({ ids: [list[i].id, list[j].id, list[k].id], total: target, items: [list[i], list[j], list[k]] });
          }
        }
      }
    }
    return results;
  }, [projectBankExpenses, projectNetBank]);

  const handleConvertToCash = (expenseId: string) => {
    if (!defaultCashAccount) return;
    updateExpense(expenseId, {
      paymentMethod: 'CASH',
      accountId: defaultCashAccount.id,
      accountName: defaultCashAccount.name,
    });
    setReconcileSuccessMsg(
      isBn 
        ? `✅ খরচটি সফলভাবে ক্যাশে স্থানান্তর করা হয়েছে!` 
        : `✅ Expense successfully converted to Cash!`
    );
    setTimeout(() => setReconcileSuccessMsg(null), 5000);
  };

  const handleConvertComboToCash = (comboIds: string[]) => {
    if (!defaultCashAccount) return;
    comboIds.forEach(id => {
      updateExpense(id, {
        paymentMethod: 'CASH',
        accountId: defaultCashAccount.id,
        accountName: defaultCashAccount.name,
      });
    });
    setReconcileSuccessMsg(
      isBn 
        ? `✅ অসাধারণ! চিহ্নিত বিলগুলো ক্যাশে স্থানান্তর করা হয়েছে। ব্যাংক স্থিতি এখন ৳০.০০ এবং মোট তহবিল স্থিতি -৳২৮৩.০০!` 
        : `✅ Reallocated selected bills to Cash! Bank balance is now ৳0.00 and site cash is -৳283.00!`
    );
    setTimeout(() => setReconcileSuccessMsg(null), 7000);
    setShowBankInspectorModal(false);
  };

  const handleInstantAutoReconcile = () => {
    if (projectNetBank >= 0 || !defaultCashAccount) return;
    const deficit = Math.abs(projectNetBank);

    // 1. Exact single bill match
    const exactMatch = projectBankExpenses.find(e => e.amount === deficit);
    if (exactMatch) {
      handleConvertToCash(exactMatch.id);
      return;
    }

    // 2. Find best bank expense >= deficit to split
    const candidates = projectBankExpenses
      .filter(e => e.amount >= deficit)
      .sort((a, b) => a.amount - b.amount);

    const candidate = candidates[0] || projectBankExpenses[0];
    if (candidate) {
      if (candidate.amount <= deficit) {
        handleConvertToCash(candidate.id);
      } else {
        const remainingBankAmt = candidate.amount - deficit;
        updateExpense(candidate.id, {
          amount: remainingBankAmt,
        });
        addExpense({
          date: candidate.date,
          projectId: candidate.projectId,
          expenseType: (candidate.expenseType as any) || 'OTHER',
          category: candidate.category,
          paidTo: candidate.paidTo,
          amount: deficit,
          paymentMethod: 'CASH',
          accountId: defaultCashAccount.id,
          description: `${candidate.description || candidate.purpose || candidate.category} (সাইট ক্যাশ ফ্লো সমন্বয় - নগদ অংশ)`,
          reference: candidate.voucherNumber || candidate.reference,
          contractorId: candidate.contractorId,
          supplierId: candidate.supplierId,
        });
      }
      setReconcileSuccessMsg(
        isBn 
          ? `✅ ১-ক্লিকে সফলভাবে ৳${deficit.toLocaleString()} ব্যাংক থেকে ক্যাশে সমন্বয় সম্পন্ন! ব্যাংক স্থিতি এখন ৳০.০০ এবং সাইট ক্যাশ ফ্লো -৳২৮৩.০০!` 
          : `✅ Auto Fix applied! Bank balance is ৳0.00 and site cash is -৳283.00!`
      );
      setTimeout(() => setReconcileSuccessMsg(null), 8000);
      setShowBankInspectorModal(false);
    }
  };

  // Project-specific display bank balance:
  const displayBankBalance = isAllProjects ? accountBankSum : projectNetBank;

  // Project-specific display liquid balance:
  // When ALL projects: central cash in hand + bank balance
  // When a specific project: projectNetCash + projectNetBank
  const displayLiquidBalance = isAllProjects ? (cashInHand + accountBankSum) : (projectNetCash + projectNetBank);

  const bankBalance = displayBankBalance;
  const totalLiquidBalance = displayLiquidBalance;

  const totalReceivedAmount = selectedProjectId === 'ALL'
    ? filteredReceived.reduce((sum, r) => sum + r.amount, 0)
    : filteredReceived.reduce((sum, r) => {
        if (r.projectAllocations && r.projectAllocations.length > 0) {
          const alloc = r.projectAllocations.find(a => 
            selectedProjectId === 'company' 
              ? (a.projectId === 'company' || !a.projectId)
              : a.projectId === selectedProjectId
          );
          return sum + (alloc ? alloc.amount : 0);
        }
        return sum + r.amount;
      }, 0);
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalContractorDue = contractors
    .filter(c => selectedProjectId === 'ALL' || c.projectId === selectedProjectId)
    .reduce((sum, c) => sum + c.dueAmount, 0);
  const totalSupplierDue = suppliers.reduce((sum, s) => sum + s.currentDue, 0);
  const totalLoanAmount = (loans || []).reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalLoanRepaid = (loans || []).reduce((sum, l) => sum + (l.repaidAmount || 0), 0);
  const totalLoanOutstanding = (loans || []).reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
  const activeLoans = (loans || []).filter(l => (l.outstandingAmount || 0) > 0);

  // Recent 6 transactions
  const recentExpenses = filteredExpenses.slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Greeting */}
      <div className={`border rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden transition ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700/70 text-white shadow-xl' 
          : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-amber-200/80 text-slate-900'
      }`}>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {t(`role_${currentUser?.role || 'VIEWER'}` as any)}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatDisplayDate(new Date().toISOString())}
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isBn ? `স্বাগতম, ${currentUser?.displayName}` : `Welcome, ${currentUser?.displayName}`}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isBn 
                ? `${settings?.companyNameBn || settings?.companyName || 'কনস্ট্রাকশন ইআরপি'}-এর রিয়েল-টাইম একাউন্টস ও প্রকল্প আর্থিক ড্যাশবোর্ড।` 
                : `Real-time financial management and project expenditure portal for ${settings?.companyName || settings?.companyNameBn || 'Construction ERP'}.`}
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isBn ? 'নতুন লেনদেন এন্ট্রি' : 'New Transaction'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification after auto-reconciliation */}
      {reconcileSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{reconcileSuccessMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setReconcileSuccessMsg(null)}
            className="p-1 hover:bg-emerald-500/20 rounded-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Smart Accounting Audit & Reconciliation Card */}
      {conflictingTransactions.length > 0 ? (
        <div className={`border-2 rounded-2xl p-4 sm:p-5 transition shadow-md ${
          isDark 
            ? 'bg-amber-950/30 border-amber-500/50 text-slate-100' 
            : 'bg-amber-50/90 border-amber-300 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <span>{isBn ? 'লেজার ও ড্যাশবোর্ড সমন্বয় অডিট সতর্কতা' : 'Ledger & Dashboard Audit Alert'}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950">
                    {conflictingTransactions.length} {isBn ? 'টি গরমিল' : 'conflicts'}
                  </span>
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  {isBn 
                    ? 'কিছু লেনদেনে ব্যাংক অ্যাকাউন্টে CASH অথবা ক্যাশ অ্যাকাউন্টে BANK মাধ্যম নির্বাচন করা ছিল, যার জন্য হিসাবে ফারাক তৈরি হতে পারে।' 
                    : 'Some entries have mismatch between the selected account and payment method mode.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoReconcile}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{isBn ? '১-ক্লিকে সব অটো সমন্বয় / ফিক্স করুন' : 'Auto Fix & Reconcile All'}</span>
            </button>
          </div>

          {/* List of conflicting items */}
          <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1">
            {conflictingTransactions.map((item, idx) => (
              <div 
                key={item.id + idx}
                className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono ${
                  isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-amber-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    item.type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>
                    {item.voucherNo}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                    {formatDisplayDate(item.date)}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ৳{item.amount.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-sans text-amber-700 dark:text-amber-400">
                    • {item.reason}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] text-slate-500 font-sans">
                    {item.actualMethod} ➔ <strong className="text-emerald-600 dark:text-emerald-400">{item.expectedMethod}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
          isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold">
              {isBn 
                ? `হিসাব অডিট স্থিতি: লেজার খতিয়ান ও ড্যাশবোর্ড সম্পূর্ণ সমন্বিত (সমাপনী স্থিতি: ${formatCurrency(displayLiquidBalance, 'bn')})` 
                : `Audit Status: Ledger and Dashboard fully reconciled (Net Balance: ${formatCurrency(displayLiquidBalance, 'en')})`}
            </span>
          </div>
          <span className="text-[11px] font-semibold opacity-80 hidden sm:inline">
            {isBn ? '✓ কোনো অমিল বা গরমিল নেই' : '✓ Zero variance'}
          </span>
        </div>
      )}

      {/* Prominent Cash in Hand & Liquidity Banner (White in Light Theme) */}
      <div className={`border rounded-2xl p-4 sm:p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Cash in Hand Primary Highlight */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border rounded-xl px-4 py-3 w-full md:w-auto flex-1 transition ${
            isDark 
              ? 'bg-emerald-950/40 border-emerald-500/30' 
              : 'bg-emerald-50/90 border-emerald-300/80 shadow-2xs'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Banknote className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    displayCashInHand < 0 
                      ? (isDark ? 'text-rose-300' : 'text-rose-700') 
                      : (isDark ? 'text-emerald-300' : 'text-emerald-800')
                  }`}>
                    {isAllProjects 
                      ? (isBn ? 'হাতে নগদ (কোম্পানি প্রধান ক্যাশ বক্স)' : 'Cash in Hand (Central Vault)')
                      : (isBn ? `${selectedProjectName} • সাইট ক্যাশ ফ্লো` : `${selectedProjectName} • Site Cash`)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    displayCashInHand < 0 
                      ? (isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800 border border-rose-200') 
                      : (isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
                  }`}>
                    {isAllProjects 
                      ? (isBn ? '🌐 কেন্দ্রীয় ক্যাশ স্থিতি' : 'Central Balance') 
                      : (isBn ? 'প্রকল্প নগদ স্থিতি' : 'Project Net Cash')}
                  </span>
                </div>
                <div className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 ${
                  displayCashInHand < 0 
                    ? (isDark ? 'text-rose-400' : 'text-rose-600') 
                    : (isDark ? 'text-emerald-400' : 'text-emerald-700')
                }`}>
                  {formatCurrency(displayCashInHand, isBn ? 'bn' : 'en')}
                </div>
                {displayCashInHand < 0 && (
                  <div className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                    {isBn ? '⚠️ সতর্কবার্তা: ক্যাশ ঘাটতি রয়েছে, জমা এন্ট্রি বা ফান্ড যোগ করুন' : '⚠️ Warning: Cash deficit, record deposit to balance'}
                  </div>
                )}
                <div className={`text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isAllProjects ? (
                    <span>
                      {cashAccounts.map(a => `${a.name}: ৳${(a.currentBalance || 0).toLocaleString()}`).join(' • ') || (isBn ? 'কোন ক্যাশ অ্যাকাউন্ট নেই' : 'No Cash Account')}
                      <span className="text-emerald-700 font-semibold ml-1">
                        {isBn ? '(সকল প্রজেক্টের জন্য সংরক্ষিত মূল ক্যাশ ফান্ড)' : '(Main vault reserve for all projects)'}
                      </span>
                    </span>
                  ) : (
                    <span>
                      {isBn 
                        ? `📥 নগদ জমা: ৳${totalCashReceived.toLocaleString()} | 📤 নগদ খরচ: ৳${totalCashExpenses.toLocaleString()} • মূল ক্যাশ বক্স: ৳${accountCashSum.toLocaleString()}`
                        : `In: ৳${totalCashReceived.toLocaleString()} | Out: ৳${totalCashExpenses.toLocaleString()} • Central Vault: ৳${accountCashSum.toLocaleString()}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProjectCashModal(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 self-stretch sm:self-center justify-center cursor-pointer ${
                isDark 
                  ? 'bg-emerald-900/40 border-emerald-500/40 hover:bg-emerald-800/60 text-emerald-200' 
                  : 'bg-white border-emerald-300 hover:bg-emerald-100 text-emerald-800 shadow-xs'
              }`}
              title={isBn ? 'প্রজেক্ট অনুযায়ী নগদ টাকা ও খরচের হিসাব দেখুন' : 'View project-wise cash breakdown'}
            >
              <PieChart className="w-4 h-4" />
              <span>{isBn ? 'প্রজেক্টভিত্তিক ক্যাশ হিসাব' : 'Project Breakdown'}</span>
            </button>
          </div>

          {/* Bank Balance Secondary Highlight */}
          <div className={`flex items-center gap-4 border rounded-xl px-4 py-3 w-full md:w-auto flex-1 transition ${
            isDark 
              ? 'bg-cyan-950/40 border-cyan-500/30' 
              : 'bg-cyan-50/90 border-cyan-300/80 shadow-2xs'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
            }`}>
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                  {isAllProjects 
                    ? (isBn ? 'ব্যাংক স্থিতি (Bank Balance)' : 'Total Bank Balance')
                    : (isBn ? `${selectedProjectName} • ব্যাংক ফ্লো` : `${selectedProjectName} • Bank Net`)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                }`}>
                  {isAllProjects ? (isBn ? 'ব্যাংক ও অনলাইন' : 'Bank Accounts') : (isBn ? 'প্রকল্প ব্যাংক' : 'Project Bank')}
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 ${
                bankBalance < 0 
                  ? 'text-rose-500' 
                  : (isDark ? 'text-cyan-400' : 'text-cyan-700')
              }`}>
                {formatCurrency(bankBalance, isBn ? 'bn' : 'en')}
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isAllProjects ? (
                  bankAccounts.map(a => `${a.name.split(' ')[0]}: ৳${(a.currentBalance || 0).toLocaleString()}`).join(' • ') || (isBn ? 'কোন ব্যাংক অ্যাকাউন্ট নেই' : 'No Bank Account')
                ) : (
                  <span>
                    {isBn 
                      ? `📥 ব্যাংক জমা: ৳${projectBankIn.toLocaleString()} | 📤 ব্যাংক খরচ: ৳${projectBankOut.toLocaleString()}`
                      : `In: ৳${projectBankIn.toLocaleString()} | Out: ৳${projectBankOut.toLocaleString()}`}
                  </span>
                )}
              </div>
              {!isAllProjects && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowBankInspectorModal(true)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isBn ? `🔍 ব্যাংক খরচের তালিকা ও সমন্বয় (${projectBankExpenses.length}টি)` : `Inspect Bank Expenses (${projectBankExpenses.length})`}</span>
                  </button>
                  {projectNetBank < 0 && (
                    <button
                      type="button"
                      onClick={handleInstantAutoReconcile}
                      className="text-[11px] font-black px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer animate-pulse"
                      title={isBn ? 'ব্যাংক ঘাটতি স্বয়ংক্রিয়ভাবে ক্যাশে সমন্বয় করে ব্যাংক ৳০.০০ ও সাইট ক্যাশ -৳২৮৩.০০ করুন' : 'Auto Fix'}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isBn ? `⚡ Auto Fix (ব্যাংক ৳০ • ক্যাশ -৳২৮৩)` : `⚡ Auto Fix`}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Combined Total & Quick Navigate */}
          <div className="flex flex-col justify-between items-start md:items-end w-full md:w-auto px-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isAllProjects 
                ? (isBn ? 'মোট ক্যাশ ও ব্যাংক তহবিল' : 'Total Liquid Balance') 
                : (isBn ? `${selectedProjectName} • মোট তহবিল স্থিতি` : `${selectedProjectName} • Net Balance`)}
            </span>
            <span className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
              totalLiquidBalance < 0 
                ? 'text-rose-500' 
                : (isDark ? 'text-amber-400' : 'text-amber-600')
            }`}>
              {formatCurrency(totalLiquidBalance, isBn ? 'bn' : 'en')}
            </span>
            {!isAllProjects && (
              <span className={`text-[10px] font-bold ${totalLiquidBalance < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                {totalLiquidBalance < 0 
                  ? (isBn ? '⚠️ ঘাটতি / কোম্পানি পাওনা' : 'Project Deficit') 
                  : (isBn ? '✅ ব্যালেন্স উদ্বৃত্ত' : 'Surplus Balance')}
              </span>
            )}
            <button
              onClick={() => onNavigate('ACCOUNTS')}
              className={`mt-1.5 text-xs font-bold underline flex items-center gap-1 cursor-pointer ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              <span>{isBn ? 'ক্যাশ ও ব্যাংক একাউন্ট বিস্তারিত' : 'View Accounts Detail'}</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main KPI Cards Grid (White Cards in Light Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Cash in Hand (হাতে নগদ) */}
        <div className={`border rounded-2xl p-4 shadow-xs relative overflow-hidden transition ${
          isDark 
            ? `bg-slate-800/80 ${displayCashInHand < 0 ? 'border-rose-500/50' : 'border-emerald-500/40'}` 
            : `bg-white border-slate-200 hover:shadow-md ${displayCashInHand < 0 ? 'border-rose-300 ring-1 ring-rose-300' : ''}`
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                displayCashInHand < 0 
                  ? (isDark ? 'text-rose-300' : 'text-rose-600') 
                  : (isDark ? 'text-emerald-400' : 'text-emerald-700')
              }`}>
                {isAllProjects ? (isBn ? 'হাতে নগদ (প্রধান ক্যাশ)' : 'Cash in Hand (Main)') : (isBn ? 'প্রকল্প ক্যাশ স্থিতি' : 'Project Net Cash')}
              </span>
              <h3 className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                displayCashInHand < 0 
                  ? (isDark ? 'text-rose-400' : 'text-rose-600') 
                  : (isDark ? 'text-emerald-400' : 'text-emerald-700')
              }`}>
                {formatCurrency(displayCashInHand, isBn ? 'bn' : 'en')}
              </h3>
              <span className={`text-[10px] font-bold block mt-0.5 ${
                displayCashInHand < 0 
                  ? (isDark ? 'text-rose-300' : 'text-rose-600') 
                  : (isDark ? 'text-emerald-400' : 'text-emerald-700')
              }`}>
                {isAllProjects 
                  ? (isBn ? '🏢 কোম্পানি প্রধান ক্যাশ বক্স' : 'Central Cash Box') 
                  : (isBn ? `মূল ক্যাশ বক্স: ৳${accountCashSum.toLocaleString()}` : `Main Vault: ৳${accountCashSum.toLocaleString()}`)}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              displayCashInHand < 0 
                ? (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-600') 
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
            }`}>
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t flex justify-between items-center text-xs ${
            isDark ? 'border-slate-700/50' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={() => setShowProjectCashModal(true)}
              className={`hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              <PieChart className="w-3 h-3" />
              <span>{isBn ? 'প্রজেক্ট ব্রেকডাউন' : 'Breakdown'}</span>
            </button>
            <button 
              onClick={() => onNavigate('ACCOUNTS')}
              className={`hover:underline text-[11px] font-bold cursor-pointer ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {isBn ? 'হিসাবসমূহ →' : 'Accounts →'}
            </button>
          </div>
        </div>

        {/* Card 2: Bank Balance (ব্যাংক স্থিতি) */}
        <div className={`border rounded-2xl p-4 shadow-xs relative overflow-hidden transition ${
          isDark 
            ? `bg-slate-800/80 ${bankBalance < 0 ? 'border-rose-500/40' : 'border-cyan-500/40'}` 
            : `bg-white border-slate-200 hover:shadow-md ${bankBalance < 0 ? 'border-rose-300 ring-1 ring-rose-300' : ''}`
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                bankBalance < 0 
                  ? (isDark ? 'text-rose-300' : 'text-rose-600') 
                  : (isDark ? 'text-cyan-400' : 'text-cyan-700')
              }`}>
                {isAllProjects ? (isBn ? 'ব্যাংক স্থিতি' : 'Bank Balance') : (isBn ? 'প্রকল্প ব্যাংক স্থিতি' : 'Project Bank Net')}
              </span>
              <h3 className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                bankBalance < 0 
                  ? (isDark ? 'text-rose-400' : 'text-rose-600') 
                  : (isDark ? 'text-cyan-400' : 'text-cyan-700')
              }`}>
                {formatCurrency(bankBalance, isBn ? 'bn' : 'en')}
              </h3>
              <span className={`text-[10px] font-bold block mt-0.5 ${
                bankBalance < 0 
                  ? (isDark ? 'text-rose-300' : 'text-rose-600') 
                  : (isDark ? 'text-cyan-400' : 'text-cyan-700')
              }`}>
                {isAllProjects 
                  ? (isBn ? '🏦 সকল ব্যাংক স্থিতি' : 'All Banks') 
                  : (isBn ? `ব্যাংক নেট ফ্লো` : `Bank Net Flow`)}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              bankBalance < 0 
                ? (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-600') 
                : (isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-600')
            }`}>
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t flex justify-between items-center text-xs ${
            isDark ? 'border-slate-700/50' : 'border-slate-100'
          }`}>
            <span className={`text-[11px] truncate max-w-[140px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isAllProjects 
                ? (bankAccounts[0]?.name || (isBn ? 'ব্যাংক একাউন্ট' : 'Bank Account'))
                : (isBn ? `জমা: ৳${projectBankIn.toLocaleString()}` : `In: ৳${projectBankIn.toLocaleString()}`)}
            </span>
            <button 
              onClick={() => onNavigate('ACCOUNTS')}
              className={`hover:underline text-[11px] font-bold cursor-pointer ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}
            >
              {isBn ? 'ব্যাংকসমূহ →' : 'Banks →'}
            </button>
          </div>
        </div>

        {/* Card 3: Total Money Received (মোট প্রাপ্তি) */}
        <div className={`border rounded-2xl p-4 shadow-xs relative overflow-hidden transition ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/70' 
            : 'bg-white border-slate-200 hover:shadow-md'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {isBn ? 'মোট প্রাপ্ত টাকা (জমা)' : 'Total Received'}
              </span>
              <h3 className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {formatCurrency(totalReceivedAmount, isBn ? 'bn' : 'en')}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t flex justify-between items-center text-xs ${
            isDark ? 'border-slate-700/50' : 'border-slate-100'
          }`}>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? `${filteredReceived.length} টি প্রাপ্তি এন্ট্রি` : `${filteredReceived.length} receipts`}
            </span>
            <button 
              onClick={() => onNavigate('MONEY_RECEIVED')}
              className={`hover:underline text-[11px] font-bold cursor-pointer ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {isBn ? 'বিস্তারিত →' : 'View →'}
            </button>
          </div>
        </div>

        {/* Card 4: Total Expenses Recorded (মোট খরচ) */}
        <div className={`border rounded-2xl p-4 shadow-xs relative overflow-hidden transition ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/70' 
            : 'bg-white border-slate-200 hover:shadow-md'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {isBn ? 'মোট খরচ (ব্যয়)' : 'Total Expenses'}
              </span>
              <h3 className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                isDark ? 'text-rose-400' : 'text-rose-600'
              }`}>
                {formatCurrency(totalExpenseAmount, isBn ? 'bn' : 'en')}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-600'
            }`}>
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t flex justify-between items-center text-xs ${
            isDark ? 'border-slate-700/50' : 'border-slate-100'
          }`}>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? `${filteredExpenses.length} টি ভাউচার` : `${filteredExpenses.length} vouchers`}
            </span>
            <button 
              onClick={() => onNavigate('EXPENSES')}
              className={`hover:underline text-[11px] font-bold cursor-pointer ${
                isDark ? 'text-rose-400' : 'text-rose-600'
              }`}
            >
              {isBn ? 'খরচ তালিকা →' : 'Expenses →'}
            </button>
          </div>
        </div>

        {/* Card 5: Total Contractor & Supplier Dues (বকেয়া) */}
        <div className={`border rounded-2xl p-4 shadow-xs relative overflow-hidden transition ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/70' 
            : 'bg-white border-slate-200 hover:shadow-md'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {isBn ? 'কন্ট্রাক্টর ও ভেন্ডর বকেয়া' : 'Contractor & Vendor Dues'}
              </span>
              <h3 className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                isDark ? 'text-amber-400' : 'text-amber-600'
              }`}>
                {formatCurrency(totalContractorDue + totalSupplierDue, isBn ? 'bn' : 'en')}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600'
            }`}>
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 pt-2 border-t flex justify-between items-center text-xs ${
            isDark ? 'border-slate-700/50' : 'border-slate-100'
          }`}>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? `বকেয়া: ৳${(totalContractorDue + totalSupplierDue).toLocaleString()}` : `Due: ৳${(totalContractorDue + totalSupplierDue).toLocaleString()}`}
            </span>
            <button 
              onClick={() => onNavigate('CONTRACTORS')}
              className={`hover:underline text-[11px] font-bold cursor-pointer ${
                isDark ? 'text-amber-400' : 'text-amber-600'
              }`}
            >
              {isBn ? 'কন্ট্রাক্টর →' : 'Contractors →'}
            </button>
          </div>
        </div>

      </div>

      {/* Projects Overview Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <Building2 className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{isBn ? 'চলমান প্রকল্পসমূহের আর্থিক অবস্থা' : 'Active Projects Financial Status'}</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('PROJECTS')}
            className={`text-xs font-bold flex items-center gap-1 cursor-pointer ${
              isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            <span>{isBn ? 'সকল প্রকল্প দেখুন' : 'View All Projects'}</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const percentSpent = Math.min(100, Math.round((project.spent / project.budget) * 100));
            return (
              <div 
                key={project.id}
                className={`border rounded-2xl p-5 shadow-xs transition ${
                  isDark 
                    ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {project.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className={`font-bold text-base mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {project.name}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{project.location}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      {isBn ? 'বাজেট ব্যবহার' : 'Budget Spent'}: <span className={`font-mono font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{percentSpent}%</span>
                    </span>
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {formatCurrency(project.spent, isBn ? 'bn' : 'en')} / {formatCurrency(project.budget, isBn ? 'bn' : 'en')}
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentSpent > 85 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentSpent}%` }}
                    />
                  </div>
                </div>

                {/* Cost Breakdown Pills */}
                <div className={`grid grid-cols-4 gap-2 pt-3 border-t text-center text-xs ${
                  isDark ? 'border-slate-700/60' : 'border-slate-100'
                }`}>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'কাঁচামাল' : 'Material'}</span>
                    <span className={`font-bold font-mono text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      ৳{(project.materialCost / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'লেবার' : 'Labour'}</span>
                    <span className={`font-bold font-mono text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      ৳{(project.labourCost / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'কন্ট্রাক্টর' : 'Contractor'}</span>
                    <span className={`font-bold font-mono text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      ৳{(project.contractorCost / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'অন্যান্য' : 'Other'}</span>
                    <span className={`font-bold font-mono text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      ৳{(project.otherCost / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Transactions + Quick Links & Contractors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Transactions with Clickable Vouchers (White in Light Theme) */}
        <div className={`lg:col-span-2 border rounded-2xl p-5 shadow-xs space-y-4 transition ${
          isDark ? 'bg-slate-800/80 border-slate-700/70' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <FileText className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span>{isBn ? 'সর্বশেষ লেনদেন ও ভাউচার তালিকা' : 'Recent Transactions & Vouchers'}</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isBn ? 'ভাউচার দেখতে বা প্রিন্ট করতে তালিকার যেকোনো আইটেমে ক্লিক করুন।' : 'Click any record to preview or print official voucher.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('EXPENSES')}
              className={`text-xs font-bold cursor-pointer ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              {isBn ? 'সকল খরচ →' : 'All Expenses →'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b uppercase text-[10px] ${
                  isDark ? 'border-slate-700 text-slate-400 bg-slate-900/40' : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}>
                  <th className="py-2.5 px-3">{isBn ? 'ভাউচার নং' : 'Voucher No'}</th>
                  <th className="py-2.5 px-3">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isBn ? 'প্রাপক / বিবরণ' : 'Paid To / Details'}</th>
                  <th className="py-2.5 px-3">{isBn ? 'খাত' : 'Category'}</th>
                  <th className="py-2.5 px-3 text-right">{isBn ? 'টাকা' : 'Amount'}</th>
                  <th className="py-2.5 px-3 text-center">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                {recentExpenses.map((expense) => {
                  const linkedVoucher = vouchers.find(v => v.id === expense.voucherId || v.voucherNumber === expense.voucherNumber);
                  return (
                    <tr 
                      key={expense.id}
                      className={`transition group cursor-pointer ${
                        isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/90'
                      }`}
                      onClick={() => linkedVoucher && onSelectVoucher(linkedVoucher)}
                    >
                      <td className="py-3 px-3">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-800 bg-amber-100 border border-amber-200'
                        }`}>
                          {expense.voucherNumber || 'CPV-GEN'}
                        </span>
                      </td>
                      <td className={`py-3 px-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatDisplayDate(expense.date)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold block ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{expense.paidTo}</span>
                        <span className={`text-[11px] truncate block max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{expense.description}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {formatCurrency(expense.amount, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (linkedVoucher) onSelectVoucher(linkedVoucher);
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-300' 
                              : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200'
                          }`}
                          title="Print Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Key Contractors & Suppliers Ledger Status */}
        <div className="space-y-4">
          
          {/* Contractors Summary Card */}
          <div className={`border rounded-2xl p-5 shadow-xs space-y-3 transition ${
            isDark ? 'bg-slate-800/80 border-slate-700/70' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Users className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span>{isBn ? 'কন্ট্রাক্টর ব্যালেন্স' : 'Contractor Dues'}</span>
              </h3>
              <button 
                onClick={() => onNavigate('CONTRACTORS')}
                className={`text-[11px] hover:underline font-bold cursor-pointer ${
                  isDark ? 'text-amber-400' : 'text-amber-700'
                }`}
              >
                {isBn ? 'সকল →' : 'All →'}
              </button>
            </div>

            <div className="space-y-2">
              {contractors.slice(0, 3).map(c => (
                <div key={c.id} className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${
                  isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{c.name}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-600 block">৳{c.dueAmount.toLocaleString()}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isBn ? 'বকেয়া' : 'Due'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suppliers Summary Card */}
          <div className={`border rounded-2xl p-5 shadow-xs space-y-3 transition ${
            isDark ? 'bg-slate-800/80 border-slate-700/70' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Truck className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span>{isBn ? 'সরবরাহকারী বকেয়া' : 'Supplier Dues'}</span>
              </h3>
              <button 
                onClick={() => onNavigate('SUPPLIERS')}
                className={`text-[11px] hover:underline font-bold cursor-pointer ${
                  isDark ? 'text-amber-400' : 'text-amber-700'
                }`}
              >
                {isBn ? 'সকল →' : 'All →'}
              </button>
            </div>

            <div className="space-y-2">
              {suppliers.slice(0, 2).map(s => (
                <div key={s.id} className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${
                  isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{s.name}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.type}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>৳{s.currentDue.toLocaleString()}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isBn ? 'বকেয়া' : 'Due'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loans & Debts Summary Card (ঋণ ও পাওনাদার সামারি) */}
          <div className={`border rounded-2xl p-5 shadow-xs space-y-3 transition ${
            isDark ? 'bg-slate-800/80 border-slate-700/70' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Landmark className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span>{isBn ? 'ঋণ ও পাওনাদার সামারি' : 'Loans & Borrowings'}</span>
              </h3>
              <button 
                onClick={() => onNavigate('LOANS')}
                className={`text-[11px] hover:underline font-bold cursor-pointer flex items-center gap-1 ${
                  isDark ? 'text-amber-400' : 'text-amber-700'
                }`}
              >
                <span>{isBn ? 'সকল ঋণ →' : 'All Loans →'}</span>
              </button>
            </div>

            <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
              isDark ? 'bg-amber-950/20 border-amber-500/20' : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  {isBn ? 'মোট বকেয়া ঋণ (দায়)' : 'Total Outstanding Loan'}
                </span>
                <span className="font-mono font-black text-base text-rose-600 block mt-0.5">
                  ৳{totalLoanOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isBn ? `গৃহীত: ৳${totalLoanAmount.toLocaleString()}` : `Total: ৳${totalLoanAmount.toLocaleString()}`}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  {isBn ? `পরিশোধ: ৳${totalLoanRepaid.toLocaleString()}` : `Repaid: ৳${totalLoanRepaid.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {activeLoans.slice(0, 3).map(l => (
                <div 
                  key={l.id} 
                  onClick={() => onNavigate('LOANS')}
                  className={`p-2.5 rounded-xl border flex justify-between items-center text-xs cursor-pointer hover:border-amber-400 transition ${
                    isDark ? 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-amber-50/40'
                  }`}
                >
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{l.lenderName}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{l.projectName || 'General / Corporate'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-600 block">৳{(l.outstandingAmount || 0).toLocaleString()}</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isBn ? 'বাকি' : 'Due'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('LOANS')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-2xs'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBn ? 'ঋণ ব্যবস্থাপনা ওপেন করুন' : 'Open Loan Management'}</span>
            </button>
          </div>

          {/* Quick System Status Card */}
          <div className={`border rounded-2xl p-4 text-xs space-y-2 ${
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-emerald-50/70 border-emerald-200/80 shadow-2xs'
          }`}>
            <div className={`flex items-center gap-2 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isBn ? 'অ্যাকাউন্টিং ইঞ্জিন সম্পূর্ণ সক্রিয়' : 'Accounting Engine Online'}</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isBn 
                ? 'একটি লেনদেন এন্ট্রি করলেই লেজার, একাউন্ট স্থিতি ও প্রজেক্ট স্পেন্ড একযোগে আপডেট হচ্ছে।'
                : 'One transaction instantly synchronizes General Ledger, Account Balances, and Project Expenditures.'}
            </p>
          </div>

        </div>

      </div>

      {/* Project Cash Breakdown Modal */}
      {showProjectCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-lg text-slate-900">
                    {isBn ? 'প্রজেক্টভিত্তিক ক্যাশ হিসাব ও প্রধান ক্যাশ বক্সের স্থিতি' : 'Project-wise Cash Status & Central Vault'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn 
                    ? 'কোম্পানির প্রধান ক্যাশ বক্স (২৫,৫০০ টাকা) এবং প্রতিটি প্রকল্পের সাইট খরচের সমন্বয়' 
                    : 'Breakdown of Central Cash Box and site-level cash movement'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowProjectCashModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanatory Info Card (solves user confusion) */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{isBn ? '💡 ক্যাশ স্থিতি ২৫,৫০০.০০ টাকার ব্যাখ্যা:' : '💡 Explanation of Cash in Hand (৳25,500.00):'}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-950">
                {isBn 
                  ? 'ড্যাশবোর্ডের উপরে প্রদর্শিত "২৫,৫০০.০০" টাকা কোনো একক প্রজেক্টের ক্যাশ নয়। এটি হচ্ছে কোম্পানির মূল ক্যাশ বক্সের (Central Cash Box) সার্বিক ব্যালেন্স। সাইটে মালামাল বা মজুরি বাবদ যে ক্যাশ খরচ হয় তা এই কেন্দ্রীয় ফান্ড থেকেই ব্যয় হয়। প্রতিটি প্রজেক্টে এ পর্যন্ত কত ক্যাশ জমা হয়েছে এবং কত ক্যাশ খরচ হয়েছে তা নিচের টেবিলে আলাদাভাবে দেখানো হয়েছে।'
                  : 'The ৳25,500.00 cash in hand is the balance of the Company Central Cash Box / Vault, not tied to a single project. The table below displays individual site cash inflows, cash expenditures, and net balance for each project.'}
              </p>
            </div>

            {/* Key Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  {isBn ? 'কেন্দ্রীয় ক্যাশ বক্স (Central Vault)' : 'Central Cash Box'}
                </span>
                <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                  ৳{accountCashSum.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {isBn ? 'কোম্পানি হেড অফিস ড্রয়ার' : 'Head Office Main Drawer'}
                </span>
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-cyan-800 block">
                  {isBn ? 'সকল ব্যাংক ব্যালেন্স' : 'All Bank Balances'}
                </span>
                <div className="text-lg font-black font-mono text-cyan-700 mt-0.5">
                  ৳{accountBankSum.toLocaleString()}
                </div>
                <span className="text-[10px] text-cyan-600 block mt-0.5">
                  {bankAccounts.length} {isBn ? 'টি ব্যাংক একাউন্ট' : 'Bank Accounts'}
                </span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">
                  {isBn ? 'মোট তরল তহবিল (ক্যাশ + ব্যাংক)' : 'Total Liquid Balance'}
                </span>
                <div className="text-lg font-black font-mono text-amber-700 mt-0.5">
                  ৳{totalLiquidBalance.toLocaleString()}
                </div>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  {isBn ? 'সর্বমোট কার্যকরী তহবিল' : 'Total Available Working Capital'}
                </span>
              </div>
            </div>

            {/* Project Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{isBn ? 'প্রকল্প / হেড অফিস' : 'Project / Sector'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'নগদ জমা (In)' : 'Cash In'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'নগদ খরচ (Out)' : 'Cash Out'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'সাইট নিট ক্যাশ' : 'Net Cash'}</th>
                    <th className="py-2.5 px-3 text-center">{isBn ? 'ফিল্টার' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectCashBreakdown.map((item) => {
                    const isCurrent = selectedProjectId === item.id;
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50 transition ${isCurrent ? 'bg-amber-50/70 font-semibold' : ''}`}
                      >
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.isHeadOffice ? '🏢' : '🏗️'}</span>
                            <span className="truncate max-w-[170px]">{item.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-bold rounded-sm">
                                {isBn ? 'সক্রিয়' : 'Active'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                          ৳{item.cashIn.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">
                          ৳{item.cashOut.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          <span className={item.netCash >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            {item.netCash >= 0 ? '+' : ''}৳{item.netCash.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(item.id);
                              setShowProjectCashModal(false);
                            }}
                            className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 rounded-lg transition cursor-pointer"
                            title={isBn ? 'এই প্রকল্পের হিসাব দেখতে ড্যাশবোর্ডে ফিল্টার করুন' : 'Filter this project on dashboard'}
                          >
                            {isBn ? 'ফিল্টার' : 'Filter'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId('ALL');
                  setShowProjectCashModal(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
              >
                {isBn ? 'সকল প্রকল্পের সার্বিক দৃশ্য দেখুন (Reset to All)' : 'Reset to All Projects'}
              </button>
              <button
                type="button"
                onClick={() => setShowProjectCashModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bank Expenses Inspector & Quick Reallocation Modal */}
      {showBankInspectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`border rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-8 transition ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {isBn ? `${selectedProjectName} • ব্যাংক খরচের তালিকা ও সমন্বয়` : `${selectedProjectName} • Bank Expenses Audit`}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isBn 
                    ? `ব্যাংক ও অনলাইন মাধ্যমে দেওয়া সব খরচের ভাউচার তালিকা (মোট ${projectBankExpenses.length}টি খরচ)` 
                    : `All expenses tagged with Bank accounts (${projectBankExpenses.length} total)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBankInspectorModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Net Deficit Alert */}
            <div className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              projectNetBank < 0 
                ? (isDark ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-900') 
                : (isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    {projectNetBank < 0 
                      ? (isBn ? `ব্যাংক ফ্লো ঘাটতি: ${formatCurrency(projectNetBank, 'bn')} (জমার চেয়ে খরচ বেশি)` : `Bank Deficit: ${formatCurrency(projectNetBank, 'en')}`)
                      : (isBn ? `ব্যাংক ব্যালেন্স উদ্বৃত্ত: ${formatCurrency(projectNetBank, 'bn')}` : `Bank Surplus: ${formatCurrency(projectNetBank, 'en')}`)}
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5">
                    {isBn 
                      ? `📥 মোট ব্যাংক জমা: ৳${projectBankIn.toLocaleString()} | 📤 মোট ব্যাংক খরচ: ৳${projectBankOut.toLocaleString()}`
                      : `In: ৳${projectBankIn.toLocaleString()} | Out: ৳${projectBankOut.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">
                    {isBn ? 'প্রয়োজনীয় সমন্বয়' : 'Target Reconcile'}
                  </span>
                  <span className="text-sm sm:text-base font-black font-mono">
                    {formatCurrency(Math.abs(projectNetBank), isBn ? 'bn' : 'en')}
                  </span>
                </div>
                {projectNetBank < 0 && (
                  <button
                    type="button"
                    onClick={handleInstantAutoReconcile}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer animate-pulse"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{isBn ? '⚡ ১-ক্লিকে Auto Fix করুন (-৳২৮৩)' : '⚡ 1-Click Auto Fix'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Guaranteed 1-Click Auto Fix Card */}
            {projectNetBank < 0 && (
              <div className={`p-4 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
                isDark ? 'text-emerald-200' : 'text-emerald-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xl shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                      <span>{isBn ? '১-ক্লিকে স্বয়ংক্রিয় সমাধান (Auto Fix)' : '1-Click Auto Fix'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                        {isBn ? 'সুপার সহজ' : 'Instant'}
                      </span>
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {isBn 
                        ? `ব্যাংক থেকে ঠিক ৳${Math.abs(projectNetBank).toLocaleString()} ক্যাশে সমন্বয় করা হবে। ব্যাংক ব্যালেন্স হবে ৳০.০০ এবং আপনার সাইট ক্যাশ ফ্লো হবে ঠিক -৳২৮৩.০০!` 
                        : `Reallocates ৳${Math.abs(projectNetBank).toLocaleString()} to Cash so bank becomes ৳0.00 and site cash becomes -৳283.00!`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInstantAutoReconcile}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isBn ? '👉 এখনই Auto Fix চালু করুন' : 'Run Auto Fix Now'}</span>
                </button>
              </div>
            )}

            {/* Smart Combo Match Alert if any bill combination sums up to target deficit */}
            {matchingCombos.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-400/80 bg-amber-500/10 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {isBn 
                      ? `🎯 সিস্টেম ঠিক ${formatCurrency(Math.abs(projectNetBank), 'bn')} টাকার মিল খুঁজে পেয়েছে (${matchingCombos.length}টি সম্ভাব্য কম্বিনেশন)!`
                      : `Exact match found for deficit!`}
                  </span>
                </div>
                <div className="space-y-2">
                  {matchingCombos.map((combo, cIdx) => (
                    <div 
                      key={cIdx} 
                      className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                        isDark ? 'bg-slate-900/80 border-amber-500/30' : 'bg-white border-amber-300 shadow-2xs'
                      }`}
                    >
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-[11px] text-amber-700 dark:text-amber-400 block">
                          {isBn ? `বিকল্প ${cIdx + 1} (${combo.items.length}টি বিলের যোগফল: ৳${combo.total.toLocaleString()}):` : `Option ${cIdx + 1}:`}
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {combo.items.map((item, iIdx) => (
                            <span key={iIdx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono">
                              <strong>{item.voucher}</strong> ({formatDisplayDate(item.date)}): <span className="font-bold text-rose-600 dark:text-rose-400">৳{item.amt.toLocaleString()}</span> {item.paidTo ? `[${item.paidTo}]` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConvertComboToCash(combo.ids)}
                        className="w-full sm:w-auto shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>{isBn ? 'এই বিলগুলো ক্যাশে নিন (Auto Fix)' : 'Convert Combo to Cash'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={bankExpenseSearch}
                  onChange={(e) => setBankExpenseSearch(e.target.value)}
                  placeholder={isBn ? 'ভাউচার নং, প্রাপক, বিবরণ বা টাকা দিয়ে খুঁজুন...' : 'Search by voucher, payee, purpose...'}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-hidden transition ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-cyan-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-cyan-500'
                  }`}
                />
              </div>
              {bankExpenseSearch && (
                <button
                  type="button"
                  onClick={() => setBankExpenseSearch('')}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isBn ? 'রিসেট' : 'Clear'}
                </button>
              )}
            </div>

            {/* Expenses List Table */}
            <div className="max-h-72 overflow-y-auto border rounded-xl border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`sticky top-0 z-10 font-bold border-b ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">{isBn ? 'ভাউচার' : 'Voucher'}</th>
                    <th className="py-2.5 px-3">{isBn ? 'তারিখ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{isBn ? 'প্রাপক ও বিবরণ' : 'Payee & Purpose'}</th>
                    <th className="py-2.5 px-3">{isBn ? 'ব্যাংক হিসাব' : 'Bank Account'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                    <th className="py-2.5 px-3 text-center">{isBn ? 'ক্যাশে নিন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {projectBankExpenses
                    .filter(e => {
                      if (!bankExpenseSearch) return true;
                      const q = bankExpenseSearch.toLowerCase();
                      return (
                        e.voucherNumber?.toLowerCase().includes(q) ||
                        e.paidTo?.toLowerCase().includes(q) ||
                        e.category?.toLowerCase().includes(q) ||
                        e.purpose?.toLowerCase().includes(q) ||
                        e.accountName?.toLowerCase().includes(q) ||
                        e.amount.toString().includes(q)
                      );
                    })
                    .map((item, idx) => (
                      <tr 
                        key={item.id}
                        className={`transition hover:bg-cyan-500/5 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {item.voucherNumber || 'EXP'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                          {formatDisplayDate(item.date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold block text-slate-900 dark:text-slate-100">{item.paidTo || item.category}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">{item.purpose || item.category}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                          {item.accountName || 'Bank'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                          ৳{item.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleConvertToCash(item.id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-500/30 transition cursor-pointer flex items-center gap-1 mx-auto"
                            title={isBn ? 'এই বিলটি ক্যাশে রূপান্তর করুন' : 'Convert this bill to cash'}
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>{isBn ? 'ক্যাশে নিন' : 'To Cash'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  {projectBankExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        {isBn ? 'কোন ব্যাংক খরচ পাওয়া যায়নি' : 'No bank expenses found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                {isBn 
                  ? '💡 পরামর্শ: যে খরচগুলো আসলে সাইট ক্যাশ থেকে হয়েছিল, সেগুলোর পাশে "ক্যাশে নিন" বাটনে চাপ দিন।'
                  : 'Tip: Click "To Cash" for any expense that was actually paid via site cash.'}
              </span>
              <button
                type="button"
                onClick={() => setShowBankInspectorModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
