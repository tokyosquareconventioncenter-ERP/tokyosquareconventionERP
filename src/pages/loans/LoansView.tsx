/**
 * Loans & Borrowing Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Landmark, 
  Plus, 
  Search, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  CreditCard, 
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  AlertCircle,
  Printer,
  Pencil,
  Receipt,
  Building
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { Loan, Voucher } from '../../types';
import { convertNumberToWordsBn, convertNumberToWordsEn } from '../../utils/numberToWords';
import { useTheme } from '../../context/ThemeContext';

interface LoansViewProps {
  onOpenNewLoanTx: () => void;
  onSelectVoucher?: (voucher: Voucher) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({ onOpenNewLoanTx, onSelectVoucher }) => {
  const { language } = useLanguage();
  const { 
    loans, 
    moneyReceived = [], 
    expenses = [], 
    addLoan, 
    updateLoan, 
    deleteLoan, 
    repayLoan, 
    settings, 
    projects, 
    accounts, 
    vouchers, 
    selectedProjectId = 'ALL' 
  } = useData();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL'); // 'ALL' | 'ACTIVE' | 'FULLY_PAID'
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId || 'ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [deleteModalLoan, setDeleteModalLoan] = useState<Loan | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const [activeTab, setActiveTab] = useState<'CARDS' | 'DONOR_SUMMARY'>('DONOR_SUMMARY');

  const normalizeLenderName = (name: string): string => {
    if (!name) return 'Other Lender';
    const trimmed = name.trim().replace(/\s+/g, ' ');
    const lower = trimmed.toLowerCase();
    if (lower.includes('arifa') || lower.includes('ম্যাডাম') || lower.includes('madam')) return 'Director Arifa Akhter';
    if (lower.includes('k.r islam') || lower.includes('k.r. islam') || lower.includes('কে আর ইসলাম') || lower.includes('ডঃ কে আর ইসলাম')) return 'Dr. K.R ISLAM Sir';
    if (lower.includes('hamid') || lower.includes('হামিদ')) return 'Hamid Sir';
    if (lower.includes('raihan') || lower.includes('রায়হান')) return 'Raihan Sir';
    return trimmed;
  };

  // Dynamically unify live loans from Money Received, custom loans, and recorded repayments
  const unifiedLoans: Loan[] = React.useMemo(() => {
    const isLoanSource = (r: any) => {
      const s = String(r.sourceType || '').toLowerCase();
      const d = String(r.description || '').toLowerCase();
      const f = String(r.receivedFrom || '').toLowerCase();
      return (
        s.includes('loan') || s.includes('ঋণ') || s.includes('কর্জ') || s.includes('ধার') || s.includes('হাওলাত') || 
        d.includes('loan') || d.includes('কর্জ') || d.includes('ঋণ') || d.includes('ধার') ||
        f.includes('arifa') || f.includes('k.r islam') || f.includes('k.r. islam') || f.includes('কে আর ইসলাম') || f.includes('ডঃ কে আর ইসলাম')
      );
    };

    // Calculate total recorded repayments per specific reference and per lender
    const repaymentByReference: Record<string, number> = {};
    const repaymentByLender: Record<string, number> = {};

    expenses.forEach(e => {
      if (e.isDeleted) return;
      const cat = String(e.category || '').toLowerCase();
      const desc = String(e.description || '').toLowerCase();
      const isRepaymentExpense = cat.includes('repay') || cat.includes('পরিশোধ') || desc.includes('loan repayment') || desc.includes('ঋণ পরিশোধ');
      if (isRepaymentExpense) {
        if (e.reference) {
          repaymentByReference[e.reference] = (repaymentByReference[e.reference] || 0) + e.amount;
        }
        if (e.paidTo) {
          const lName = normalizeLenderName(e.paidTo);
          repaymentByLender[lName] = (repaymentByLender[lName] || 0) + e.amount;
        }
      }
    });

    const list: Loan[] = [];

    // 1. Process all money received loan entries
    moneyReceived.filter(isLoanSource).forEach(rec => {
      const lenderCanonical = normalizeLenderName(rec.receivedFrom);

      // Find explicitly matching loan in loans array
      const existing = loans.find(l => 
        (l.id === 'loan-' + rec.id || l.id === rec.id || (Boolean(rec.receiptNumber) && (l.reference === rec.receiptNumber || l.id === rec.receiptNumber))) &&
        normalizeLenderName(l.lenderName) === lenderCanonical
      );

      let repaid = existing?.repaidAmount || 0;
      if (rec.receiptNumber && repaymentByReference[rec.receiptNumber]) {
        repaid = Math.max(repaid, repaymentByReference[rec.receiptNumber]);
      }
      if (existing?.reference && repaymentByReference[existing.reference]) {
        repaid = Math.max(repaid, repaymentByReference[existing.reference]);
      }
      if (existing?.id && repaymentByReference[existing.id]) {
        repaid = Math.max(repaid, repaymentByReference[existing.id]);
      }
      if (repaymentByReference['loan-' + rec.id]) {
        repaid = Math.max(repaid, repaymentByReference['loan-' + rec.id]);
      }

      // If Dr. K.R ISLAM Sir has the official baseline ৳41,000 repayment recorded specifically for his ৳1,00,000 initial loan
      if (lenderCanonical === 'Dr. K.R ISLAM Sir' && (rec.amount === 100000 || rec.receiptNumber === 'MR-2026-00004' || String(rec.reference).includes('441029')) && repaid === 0) {
        repaid = 41000;
      }

      const outstanding = Math.max(0, rec.amount - repaid);

      list.push({
        id: existing?.id || ('loan-' + rec.id),
        lenderName: rec.receivedFrom,
        phone: existing?.phone || '',
        amount: rec.amount,
        repaymentAmount: repaid,
        repaidAmount: repaid,
        outstandingAmount: outstanding,
        purpose: rec.description || `${rec.sourceType || 'Loan'} received via ${rec.receiptNumber}`,
        lenderType: existing?.lenderType || 'INDIVIDUAL',
        paymentMethod: rec.paymentMethod || 'BANK',
        accountId: rec.accountId,
        projectId: rec.projectId,
        projectName: rec.projectName,
        date: rec.date,
        status: (outstanding === 0 ? 'FULLY_PAID' : 'Active') as any,
        reference: rec.receiptNumber || rec.reference,
        createdAt: rec.createdAt || new Date().toISOString(),
        createdBy: rec.createdBy || 'System',
      });
    });

    // 2. Add standalone user-created loans from loans that are not duplicates or obsolete sample data
    loans.forEach(l => {
      if ((l.id === 'loan-001' || l.id === 'loan-002' || l.id === 'loan-003') && moneyReceived.length > 5) {
        return; // Ignore obsolete sample loans when live receipts exist
      }
      const isAlreadyIncluded = list.some(item => 
        item.id === l.id || 
        (Boolean(l.reference) && item.reference === l.reference) ||
        (item.id === 'loan-' + l.id)
      );
      if (!isAlreadyIncluded) {
        list.push(l);
      }
    });

    return list;
  }, [loans, moneyReceived, expenses]);

  const allLoanRecords = unifiedLoans;

  // Filtered loans list based on search, project and status
  const filtered = unifiedLoans.filter(l => {
    if (filterProject !== 'ALL' && l.projectId && l.projectId !== filterProject) return false;
    if (filterStatus === 'ACTIVE' && (l.status === 'FULLY_PAID' || l.outstandingAmount === 0)) return false;
    if (filterStatus === 'FULLY_PAID' && l.status !== 'FULLY_PAID' && l.outstandingAmount > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.lenderName.toLowerCase().includes(q) ||
        (l.purpose && l.purpose.toLowerCase().includes(q)) ||
        (l.projectName && l.projectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalLoanReceived = filtered.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalLoanRepaid = filtered.reduce((sum, l) => sum + (l.repaidAmount || 0), 0);
  const totalOutstanding = filtered.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);

  // Grouped summary by Lender
  interface LenderSummaryItem {
    lenderName: string;
    totalAmount: number;
    repaidAmount: number;
    outstandingAmount: number;
    count: number;
    loans: Loan[];
    projectBreakdown: { projectName: string; amount: number; repaid: number; outstanding: number }[];
  }

  const lenderSummaryList: LenderSummaryItem[] = React.useMemo(() => {
    const map: Record<string, LenderSummaryItem> = {};

    filtered.forEach(loan => {
      const canonical = normalizeLenderName(loan.lenderName);
      if (!map[canonical]) {
        map[canonical] = {
          lenderName: canonical,
          totalAmount: 0,
          repaidAmount: 0,
          outstandingAmount: 0,
          count: 0,
          loans: [],
          projectBreakdown: []
        };
      }

      map[canonical].totalAmount += loan.amount || 0;
      map[canonical].repaidAmount += loan.repaidAmount || 0;
      map[canonical].outstandingAmount += loan.outstandingAmount || 0;
      map[canonical].count += 1;
      map[canonical].loans.push(loan);

      const pName = loan.projectName || 'General / Corporate';
      const existingProj = map[canonical].projectBreakdown.find(p => p.projectName === pName);
      if (existingProj) {
        existingProj.amount += loan.amount || 0;
        existingProj.repaid += loan.repaidAmount || 0;
        existingProj.outstanding += loan.outstandingAmount || 0;
      } else {
        map[canonical].projectBreakdown.push({
          projectName: pName,
          amount: loan.amount || 0,
          repaid: loan.repaidAmount || 0,
          outstanding: loan.outstandingAmount || 0,
        });
      }
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filtered]);

  // Sync with global header project selector
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Add Loan State with Account & Payment Method
  const [lenderName, setLenderName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loanDate, setLoanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK' | 'MOBILE_BANKING'>('CASH');
  const [accountId, setAccountId] = useState(() => accounts.find(a => a.type === 'CASH')?.id || accounts[0]?.id || '');
  const [purpose, setPurpose] = useState('');
  const [lenderType, setLenderType] = useState('INDIVIDUAL');
  const [selectedProj, setSelectedProj] = useState(projects[0]?.id || '');

  // Repay Loan Modal State
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [repayLoanId, setRepayLoanId] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [repayPaymentMethod, setRepayPaymentMethod] = useState<'CASH' | 'BANK' | 'MOBILE_BANKING'>('CASH');
  const [repayAccountId, setRepayAccountId] = useState(() => accounts.find(a => a.type === 'CASH')?.id || accounts[0]?.id || '');
  const [repayDescription, setRepayDescription] = useState('');
  const [repayReference, setRepayReference] = useState('');
  const [repaySuccess, setRepaySuccess] = useState<string | null>(null);

  // Edit Loan State
  const [editModalLoan, setEditModalLoan] = useState<Loan | null>(null);
  const [editLenderName, setEditLenderName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLenderType, setEditLenderType] = useState('INDIVIDUAL');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'FULLY_PAID'>('ACTIVE');

  const isBn = language === 'bn';

  const openRepayModal = (loan?: Loan) => {
    setRepaySuccess(null);
    const activeLoans = allLoanRecords.filter(l => (l.outstandingAmount || 0) > 0);
    const targetLoan = loan || activeLoans[0] || allLoanRecords[0];
    if (targetLoan) {
      setRepayLoanId(targetLoan.id);
      setRepayAmount(String(targetLoan.outstandingAmount || ''));
      setRepayDescription(`Loan repayment to ${targetLoan.lenderName}`);
    } else {
      setRepayLoanId('');
      setRepayAmount('');
      setRepayDescription('');
    }
    setRepayDate(new Date().toISOString().split('T')[0]);
    setRepayPaymentMethod('CASH');
    const cashAcc = accounts.find(a => a.type === 'CASH') || accounts[0];
    if (cashAcc) setRepayAccountId(cashAcc.id);
    setIsRepayModalOpen(true);
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(repayAmount) || 0;
    if (!repayLoanId || parsedAmount <= 0) return;

    const rawId = repayLoanId.replace(/^loan-/, '');
    const targetLoan = allLoanRecords.find(l => l.id === repayLoanId || l.id === rawId || l.id === 'loan-' + rawId) || loans.find(l => l.id === repayLoanId || l.id === rawId);
    if (!targetLoan) {
      alert(isBn ? 'ঋণ রেকর্ডটি পাওয়া যায়নি!' : 'Loan record not found!');
      return;
    }

    try {
      repayLoan({
        loanId: targetLoan.id,
        amount: parsedAmount,
        date: repayDate,
        paymentMethod: repayPaymentMethod,
        accountId: repayAccountId,
        description: repayDescription || `Repaid ৳${parsedAmount} to ${targetLoan.lenderName}`,
        reference: repayReference || targetLoan.reference || targetLoan.id,
      });

      setRepaySuccess(isBn ? `সফলভাবে ৳${parsedAmount.toLocaleString()} ঋণ পরিশোধ রেকর্ড করা হয়েছে!` : `Successfully repaid ৳${parsedAmount.toLocaleString()}!`);
      setTimeout(() => {
        setIsRepayModalOpen(false);
        setRepaySuccess(null);
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Error executing repayment');
    }
  };

  const openEditModal = (loan: Loan) => {
    setEditModalLoan(loan);
    setEditLenderName(loan.lenderName);
    setEditDate(loan.date);
    setEditAmount(loan.amount);
    setEditProjectId(loan.projectId || '');
    setEditPurpose(loan.purpose);
    setEditPhone(loan.phone || '');
    setEditLenderType(loan.lenderType || 'INDIVIDUAL');
    setEditStatus(loan.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalLoan || typeof editAmount !== 'number' || editAmount <= 0) return;

    const proj = projects.find(p => p.id === editProjectId);

    updateLoan(editModalLoan.id, {
      lenderName: editLenderName,
      date: editDate,
      amount: editAmount,
      projectId: editProjectId || undefined,
      projectName: proj ? proj.name : undefined,
      purpose: editPurpose,
      phone: editPhone,
      lenderType: editLenderType,
      status: editStatus,
    });

    setEditModalLoan(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalLoan) return;
    deleteLoan(deleteModalLoan.id, deleteReason || 'User requested deletion');
    setDeleteModalLoan(null);
    setDeleteReason('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    const prjObj = projects.find(p => p.id === selectedProj);
    addLoan({
      lenderName,
      phone,
      amount: parsedAmount,
      purpose,
      lenderType,
      paymentMethod,
      accountId,
      projectId: prjObj ? prjObj.id : undefined,
      projectName: prjObj ? prjObj.name : undefined,
      date: loanDate,
      status: 'Active',
    });
    setIsAddModalOpen(false);
    setLenderName('');
    setPhone('');
    setAmount('');
    setPurpose('');
  };

  // Print Official Money Receipt Voucher (matching rrrr.JPG format)
  const handlePrintLoanReceipt = (loan: Loan) => {
    // 1. Check if an official Money Receipt voucher already exists for this loan
    const matched = vouchers.find(v => 
      v.transactionId === loan.id || 
      (loan.reference && v.reference === loan.reference) ||
      (v.voucherNumber && loan.reference && v.voucherNumber === loan.reference) ||
      (v.paidTo?.toLowerCase().trim() === loan.lenderName.toLowerCase().trim() && v.amount === loan.amount && v.transactionType === 'MONEY_RECEIVED')
    );

    if (matched && onSelectVoucher) {
      onSelectVoucher(matched);
      return;
    }

    // 2. Otherwise synthesize the official Money Receipt Voucher with exact details
    const receiptNumber = loan.reference || `MR-2026-${String(loan.id).replace(/\D/g, '').slice(-5).padStart(5, '0') || '00012'}`;
    const generatedVoucher: Voucher = {
      id: 'vouch-mr-loan-' + loan.id,
      voucherNumber: receiptNumber,
      date: loan.date,
      projectId: loan.projectId || '',
      projectName: loan.projectName || 'Tokyo Square Convention Center - Project A',
      paidTo: loan.lenderName,
      category: 'MONEY RECEIVED (LOAN)',
      description: loan.purpose || 'Project financial & bridge support',
      amount: loan.amount,
      amountInWordsBn: convertNumberToWordsBn(loan.amount),
      amountInWordsEn: convertNumberToWordsEn(loan.amount),
      paymentMethod: (loan.paymentMethod as any) || 'CASH',
      preparedBy: loan.createdBy || 'MD. Tanveen Ahmed',
      receivedBy: loan.lenderName,
      authorizedBy: 'Eng. S.M. Khalilur Rahman (MD)',
      accountName: 'Cash in Hand (প্রধান ক্যাশ বক্স)',
      reference: receiptNumber,
      transactionId: loan.id,
      transactionType: 'MONEY_RECEIVED',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: loan.createdBy || 'MD. Tanveen Ahmed',
    };

    if (onSelectVoucher) {
      onSelectVoucher(generatedVoucher);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Loan Page - Hidden during print if Statement Modal is Open */}
      <div className={isPrintModalOpen ? 'print:hidden space-y-6' : 'space-y-6'}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <Landmark className="w-6 h-6 text-purple-500" />
            <span>{isBn ? 'ঋণ ও কর্জ ব্যবস্থাপনা রেজিস্টার' : 'Loans & Borrowings Register'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'ডাক্তার কে আর ইসলাম, রায়হান স্যার, ম্যাডাম ও অন্যান্য ব্যক্তি/প্রতিষ্ঠানের নিকট হতে গৃহীত ঋণ, পরিশোধ ও বকেয়া স্ট্যাটাস' 
              : 'Loans from Dr. K.R. Islam, Raihan Sir, Madam, and lenders with real-time repayment & status tracking'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer ${
              isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>{isBn ? 'ঋণ স্টেটমেন্ট প্রিন্ট' : 'Print Statement'}</span>
          </button>

          <button
            type="button"
            onClick={() => openRepayModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isBn ? 'ঋণ পরিশোধ করুন' : 'Repay Loan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? '+ নতুন ঋণ গ্রহণ' : '+ Record New Loan'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট গৃহীত ঋণ (ধার)' : 'Total Borrowed'}</span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              {formatCurrency(totalLoanReceived, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'
          }`}>
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট পরিশোধিত ঋণ (শোধ)' : 'Total Repaid'}</span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {formatCurrency(totalLoanRepaid, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'বর্তমান অপরিশোধিত বকেয়া' : 'Outstanding Balance'}</span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              {formatCurrency(totalOutstanding, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
            isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-700'
          }`}>
            ৳
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('DONOR_SUMMARY')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
            activeTab === 'DONOR_SUMMARY'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span>📊</span>
          <span>{isBn ? 'ঋণদাতা সামারি ও লেজার বিবরণী (Lender Summary)' : 'Lender Summary & Statement'}</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
            {lenderSummaryList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CARDS')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
            activeTab === 'CARDS'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span>📋</span>
          <span>{isBn ? 'সকল একক ঋণ রেজিস্টার (All Loan Cards)' : 'Individual Loan Cards'}</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {filtered.length}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className={`border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2 w-full md:w-auto ${
          isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ঋণদাতা, উদ্দেশ্য বা প্রজেক্ট দিয়ে খুঁজুন...' : 'Search lender, purpose, project...'}
            className={`w-full bg-transparent outline-hidden font-medium ${
              isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`border rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">{isBn ? 'সকল ঋণ অবস্থা (All Status)' : 'All Status'}</option>
            <option value="ACTIVE">{isBn ? 'চলমান / বকেয়া ঋণ (Pending)' : 'Active / Unpaid'}</option>
            <option value="FULLY_PAID">{isBn ? 'সম্পূর্ণ পরিশোধিত ঋণ (Paid)' : 'Fully Repaid'}</option>
          </select>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`border rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">{isBn ? 'সকল প্রকল্প' : 'All Projects'}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: Donor & Lender Group Summary */}
      {activeTab === 'DONOR_SUMMARY' && (
        <div className="space-y-6">
          {/* Quick Lender Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lenderSummaryList.map((item) => {
              const isFullyPaid = item.outstandingAmount === 0;
              const percentRepaid = item.totalAmount > 0 ? Math.min(100, Math.round((item.repaidAmount / item.totalAmount) * 100)) : 0;
              return (
                <div
                  key={item.lenderName}
                  className={`border rounded-2xl p-5 shadow-xs space-y-4 transition ${
                    isDark
                      ? isFullyPaid
                        ? 'border-emerald-500/40 bg-slate-800/60'
                        : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
                      : isFullyPaid
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isBn ? 'ধার / ঋণ (Loan)' : 'Loan Provider'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFullyPaid
                            ? isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {isFullyPaid ? (isBn ? '✓ সম্পূর্ণ শোধিত' : '✓ FULLY PAID') : (isBn ? '⏳ চলমান বকেয়া' : 'ACTIVE')}
                        </span>
                      </div>
                      <h3 className={`font-black text-lg mt-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {item.lenderName}
                      </h3>
                      <span className={`text-xs font-semibold block mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                        {item.count} {isBn ? 'টি আলাদা ঋণ প্রাপ্তি' : 'Loan Entries'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[11px] block font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isBn ? 'মোট ঋণ:' : 'Total Borrowed:'}
                      </span>
                      <span className={`text-base font-black font-mono ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                        {formatCurrency(item.totalAmount, isBn ? 'bn' : 'en')}
                      </span>
                    </div>
                  </div>

                  {/* Project Allocations */}
                  <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    isDark ? 'bg-slate-900/60 border-slate-700/70 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <span className="font-bold block text-[11px] text-slate-500">{isBn ? 'প্রকল্প ভিত্তিক বিভাজন:' : 'Project Allocation:'}</span>
                    {item.projectBreakdown.map((pb, pidx) => (
                      <div key={pidx} className="flex justify-between items-center text-xs">
                        <span className="truncate max-w-[65%] font-medium">🏢 {pb.projectName}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(pb.amount, isBn ? 'bn' : 'en')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className={`grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t ${
                    isDark ? 'border-slate-700/60' : 'border-slate-100'
                  }`}>
                    <div className={`p-2 rounded-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট ঋণ' : 'Borrowed'}</span>
                      <span className={`font-bold font-mono text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        ৳{item.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>{isBn ? 'পরিশোধিত' : 'Repaid'}</span>
                      <span className={`font-bold font-mono text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        ৳{item.repaidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className={`p-2 rounded-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-700/60' : isFullyPaid ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                    }`}>
                      <span className={`text-[10px] block ${isDark ? 'text-slate-400' : isFullyPaid ? 'text-emerald-700' : 'text-rose-700'}`}>{isBn ? 'বর্তমান বাকি' : 'Balance'}</span>
                      <span className={`font-bold font-mono text-xs ${
                        isFullyPaid 
                          ? isDark ? 'text-emerald-400' : 'text-emerald-700' 
                          : isDark ? 'text-rose-400' : 'text-rose-700'
                      }`}>
                        ৳{item.outstandingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.lenderName);
                        setActiveTab('CARDS');
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer ${
                        isDark
                          ? 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800'
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isBn ? 'এন্ট্রি তালিকা দেখুন' : 'View Entries'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.lenderName);
                        setIsPrintModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-600"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isBn ? 'স্টেটমেন্ট প্রিন্ট' : 'Statement'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consolidated Table of All Lenders */}
          <div className={`border rounded-2xl p-5 shadow-xs space-y-4 transition ${
            isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-black text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {isBn ? '📊 সকল ঋণ প্রদানকারী ও লেন্ডারদের সার্বিক তুলনামূলক বিবরণী' : '📊 Comparative Summary of All Loan Providers'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isBn ? 'গৃহীত মোট ঋণ, পরিশোধ ও বর্তমান অপরিশোধিত বকেয়ার সমন্বিত সারসংক্ষেপ' : 'Aggregated total loans, repayments, and outstanding balances'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs shadow-xs hover:opacity-90 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isBn ? 'পূর্ণাঙ্গ প্রিন্ট' : 'Full Print'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] uppercase font-bold ${
                    isDark ? 'bg-slate-900/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <th className="p-2.5 w-10">#</th>
                    <th className="p-2.5">{isBn ? 'ঋণ প্রদানকারীর নাম' : 'Lender Name'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'এন্ট্রি সংখ্যা' : 'Entries'}</th>
                    <th className="p-2.5 text-right">{isBn ? 'মোট গৃহীত ঋণ' : 'Total Borrowed'}</th>
                    <th className="p-2.5 text-right">{isBn ? 'মোট পরিশোধিত' : 'Total Repaid'}</th>
                    <th className="p-2.5 text-right font-black text-rose-600 dark:text-rose-400">{isBn ? 'বর্তমান বকেয়া' : 'Outstanding Balance'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {lenderSummaryList.map((item, idx) => {
                    const isFullyPaid = item.outstandingAmount === 0;
                    return (
                      <tr key={item.lenderName} className={isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'}>
                        <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                          {item.lenderName}
                        </td>
                        <td className="p-2.5 text-center font-bold">
                          <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono">
                            {item.count}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-purple-700 dark:text-purple-300">
                          {formatCurrency(item.totalAmount, isBn ? 'bn' : 'en')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(item.repaidAmount, isBn ? 'bn' : 'en')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                          {formatCurrency(item.outstandingAmount, isBn ? 'bn' : 'en')}
                        </td>
                        <td className="p-2.5 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isFullyPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {isFullyPaid ? (isBn ? 'পরিশোধিত' : 'Paid') : (isBn ? 'বকেয়া' : 'Active')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery(item.lenderName);
                              setIsPrintModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                          >
                            {isBn ? 'প্রিন্ট' : 'Print'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className={`font-black border-t-2 ${
                  isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}>
                  <tr>
                    <td colSpan={3} className="p-3 text-right uppercase">{isBn ? 'সর্বমোট (Grand Total):' : 'Grand Total:'}</td>
                    <td className="p-3 text-right font-mono font-black text-purple-700 dark:text-purple-300">
                      {formatCurrency(totalLoanReceived, isBn ? 'bn' : 'en')}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(totalLoanRepaid, isBn ? 'bn' : 'en')}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(totalOutstanding, isBn ? 'bn' : 'en')}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Individual Loan Cards */}
      {activeTab === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((loan) => {
            const isFullyPaid = (loan.outstandingAmount || 0) === 0 || loan.status === 'FULLY_PAID';
            const percentRepaid = loan.amount > 0 ? Math.min(100, Math.round(((loan.repaidAmount || 0) / loan.amount) * 100)) : 0;
            return (
              <div 
                key={loan.id}
                className={`border rounded-2xl p-5 shadow-xs space-y-4 transition ${
                  isDark 
                    ? isFullyPaid 
                      ? 'border-emerald-500/40 bg-slate-800/60' 
                      : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
                    : isFullyPaid
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {loan.lenderType || 'LENDER'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFullyPaid 
                          ? isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {isFullyPaid ? (isBn ? '✓ সম্পূর্ণ শোধিত' : '✓ FULLY PAID') : (isBn ? '⏳ চলমান বকেয়া' : 'PARTIALLY ACTIVE')}
                      </span>
                    </div>
                    <h3 className={`font-bold text-base mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {loan.lenderName}
                    </h3>
                    {loan.projectName && (
                      <span className={`text-xs font-semibold block mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        🏢 {loan.projectName}
                      </span>
                    )}
                    <div className={`flex items-center gap-2 text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{loan.phone || 'No contact'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatDisplayDate(loan.date)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(loan)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isDark 
                            ? 'bg-slate-700/80 hover:bg-blue-600 text-blue-300 hover:text-white' 
                            : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200'
                        }`}
                        title={isBn ? 'ঋণ রেকর্ড সংশোধন / এডিট' : 'Edit Loan Record'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModalLoan(loan)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isDark 
                            ? 'bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white' 
                            : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200'
                        }`}
                        title={isBn ? 'ঋণ রেকর্ড মুছে ফেলুন' : 'Delete Loan Record'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className={`text-xs p-2.5 rounded-xl border ${
                  isDark ? 'text-slate-400 bg-slate-900/60 border-slate-800' : 'text-slate-600 bg-slate-50 border-slate-200'
                }`}>
                  <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>{isBn ? 'ঋণের উদ্দেশ্য:' : 'Purpose:'}</strong> {loan.purpose}
                </p>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {isBn ? 'পরিশোধ সম্পন্ন' : 'Repaid'}: <span className={`font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{percentRepaid}%</span>
                    </span>
                    <span className={`font-mono font-bold ${
                      isFullyPaid 
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600' 
                        : isDark ? 'text-rose-400' : 'text-rose-600'
                    }`}>
                      {isBn ? 'বকেয়া' : 'Outstanding'}: ৳{(loan.outstandingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isFullyPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${percentRepaid}%` }} 
                    />
                  </div>
                </div>

                {/* Financial Box */}
                <div className={`grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t ${
                  isDark ? 'border-slate-700/60' : 'border-slate-100'
                }`}>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'ঋণ গ্রহণ' : 'Borrowed'}</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>৳{(loan.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-emerald-50/50 border-emerald-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>{isBn ? 'পরিশোধিত' : 'Repaid'}</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>৳{(loan.repaidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-700/60' : isFullyPaid ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : isFullyPaid ? 'text-emerald-700' : 'text-rose-700'}`}>{isBn ? 'বাকি ঋণ' : 'Balance'}</span>
                    <span className={`font-bold font-mono ${
                      isFullyPaid 
                        ? isDark ? 'text-emerald-400' : 'text-emerald-700' 
                        : isDark ? 'text-rose-400' : 'text-rose-700'
                    }`}>
                      ৳{(loan.outstandingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions: Receipt Print & Repay */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintLoanReceipt(loan)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer ${
                      isDark
                        ? 'bg-slate-700/80 hover:bg-slate-600 text-emerald-400 hover:text-white border border-slate-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                    title={isBn ? 'মানি রিসিট ভাউচার প্রিন্ট করুন' : 'Print Official Money Receipt'}
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>{isBn ? 'রশিদ প্রিন্ট (Receipt)' : 'Print Receipt'}</span>
                  </button>

                  {!isFullyPaid && (loan.outstandingAmount || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => openRepayModal(loan)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isBn ? 'পরিশোধ করুন' : 'Repay'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {isBn ? 'নতুন ঋণ গ্রহণ এন্ট্রি (Money In / Loan)' : 'Record New Loan (Money In)'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'ঋণ প্রদানকারীর নাম *' : 'Lender Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    placeholder={isBn ? 'যেমন: ম্যাডাম / রায়হান স্যার / ডঃ কে আর ইসলাম' : 'e.g. Madam / Raihan Sir / Dr. K.R. Islam'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'তারিখ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'ঋণের পরিমাণ (টাকা) *' : 'Amount (Tk) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-black text-purple-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'ঋণদাতার ধরন' : 'Lender Type'}
                  </label>
                  <select
                    value={lenderType}
                    onChange={(e) => setLenderType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                  >
                    <option value="INDIVIDUAL">{isBn ? 'ব্যক্তিগত' : 'Individual'}</option>
                    <option value="PARTNER">{isBn ? 'ম্যাডাম / পার্টনার / চেয়ারম্যান' : 'Partner / Madam'}</option>
                    <option value="BANK">{isBn ? 'ব্যাংক' : 'Bank'}</option>
                    <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>
              </div>

              {/* Payment Method & Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    {isBn ? 'টাকা গ্রহণের মাধ্যম *' : 'Payment Method *'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const method = e.target.value as any;
                      setPaymentMethod(method);
                      if (method === 'CASH') {
                        const cAcc = accounts.find(a => a.type === 'CASH');
                        if (cAcc) setAccountId(cAcc.id);
                      } else {
                        const bAcc = accounts.find(a => a.type === 'BANK');
                        if (bAcc) setAccountId(bAcc.id);
                      }
                    }}
                    className="w-full px-3 py-2 border border-purple-200 bg-white rounded-xl text-sm font-semibold"
                  >
                    <option value="CASH">{isBn ? '💵 ক্যাশ (Cash in Hand - হাতে নগদ)' : '💵 Cash in Hand'}</option>
                    <option value="BANK">{isBn ? '🏦 ব্যাংক ট্রান্সফার (Bank Account)' : '🏦 Bank Transfer'}</option>
                    <option value="MOBILE_BANKING">{isBn ? '📱 মোবাইল ব্যাংকিং (bKash/Nagad)' : '📱 Mobile Banking'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    {isBn ? 'টাকা জমা হওয়ার অ্যাকাউন্ট *' : 'Deposit Account *'}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 bg-white rounded-xl text-sm font-semibold"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (স্থিতি: ৳{acc.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'সংশ্লিষ্ট প্রজেক্ট' : 'Related Project'}
                  </label>
                  <select
                    value={selectedProj}
                    onChange={(e) => setSelectedProj(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ঋণ গ্রহণের উদ্দেশ্য / বিবরণ' : 'Purpose / Description'}
                </label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder={isBn ? 'যেমন: জরুরী নির্মাণ কাজের জন্য নেওয়া ধার / অর্থায়ন' : 'e.g. Bridge funding for project site'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  {isBn ? 'সংরক্ষণ করুন ও ক্যাশে জমা দিন' : 'Save & Credit to Cash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repay Loan Modal */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {isBn ? 'ঋণ পরিশোধ এন্ট্রি (Loan Repayment / Money Out)' : 'Record Loan Repayment'}
                </h3>
              </div>
              <button onClick={() => setIsRepayModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {repaySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{repaySuccess}</span>
              </div>
            )}

            <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs">
              {/* Select Loan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'পরিশোধের ঋণ নির্বাচন করুন *' : 'Select Loan to Repay *'}
                </label>
                <select
                  required
                  value={repayLoanId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const rawId = id.replace(/^loan-/, '');
                    setRepayLoanId(id);
                    const l = allLoanRecords.find(x => x.id === id || x.id === rawId || x.id === 'loan-' + rawId) || loans.find(x => x.id === id);
                    if (l) {
                      setRepayAmount(String(l.outstandingAmount || ''));
                      setRepayDescription(`Loan repayment to ${l.lenderName}`);
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-emerald-300 bg-emerald-50/30 rounded-xl text-sm font-bold text-slate-900"
                >
                  <option value="">{isBn ? '-- ঋণ নির্বাচন করুন --' : '-- Select Loan --'}</option>
                  {allLoanRecords.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.lenderName} | {l.projectName || 'General'} | মোট: ৳{(l.amount || 0).toLocaleString()} | বাকি বকেয়া: ৳{(l.outstandingAmount || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Loan Balance Overview Card */}
              {repayLoanId && (() => {
                const rawId = repayLoanId.replace(/^loan-/, '');
                const curLoan = allLoanRecords.find(l => l.id === repayLoanId || l.id === rawId || l.id === 'loan-' + rawId) || loans.find(l => l.id === repayLoanId);
                if (!curLoan) return null;
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">{isBn ? 'ঋণদাতার নাম:' : 'Lender:'} <strong className="text-slate-800">{curLoan.lenderName}</strong></span>
                      <span className="text-slate-500 font-medium">{isBn ? 'মূল ঋণ:' : 'Total Loan:'} <strong>৳{curLoan.amount.toLocaleString()}</strong> | {isBn ? 'পরিশোধিত:' : 'Paid:'} <strong className="text-emerald-600">৳{(curLoan.repaidAmount || 0).toLocaleString()}</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wider">{isBn ? 'বর্তমান বকেয়া' : 'Current Due'}</span>
                      <span className="text-base font-black font-mono text-rose-600">৳{(curLoan.outstandingAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isBn ? 'পরিশোধের পরিমাণ (টাকা) *' : 'Repayment Amount *'}
                    </label>
                    {repayLoanId && (
                      <button
                        type="button"
                        onClick={() => {
                          const rawId = repayLoanId.replace(/^loan-/, '');
                          const l = allLoanRecords.find(x => x.id === repayLoanId || x.id === rawId || x.id === 'loan-' + rawId) || loans.find(x => x.id === repayLoanId);
                          if (l) setRepayAmount(String(l.outstandingAmount || 0));
                        }}
                        className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        {isBn ? 'সম্পূর্ণ বকেয়া' : 'Full Due'}
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    max={(() => {
                      const rawId = repayLoanId.replace(/^loan-/, '');
                      const l = allLoanRecords.find(x => x.id === repayLoanId || x.id === rawId || x.id === 'loan-' + rawId) || loans.find(x => x.id === repayLoanId);
                      return l ? l.outstandingAmount || undefined : undefined;
                    })()}
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-black text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'পরিশোধের তারিখ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={repayDate}
                    onChange={(e) => setRepayDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Payment Method & Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {isBn ? 'টাকা পরিশোধের মাধ্যম *' : 'Payment Method *'}
                  </label>
                  <select
                    value={repayPaymentMethod}
                    onChange={(e) => {
                      const method = e.target.value as any;
                      setRepayPaymentMethod(method);
                      if (method === 'CASH') {
                        const cAcc = accounts.find(a => a.type === 'CASH');
                        if (cAcc) setRepayAccountId(cAcc.id);
                      } else {
                        const bAcc = accounts.find(a => a.type === 'BANK');
                        if (bAcc) setRepayAccountId(bAcc.id);
                      }
                    }}
                    className="w-full px-3 py-2 border border-emerald-200 bg-white rounded-xl text-sm font-semibold"
                  >
                    <option value="CASH">{isBn ? '💵 ক্যাশ (Cash in Hand - হাতে নগদ)' : '💵 Cash in Hand'}</option>
                    <option value="BANK">{isBn ? '🏦 ব্যাংক অ্যাকাউন্ট (Bank Transfer)' : '🏦 Bank Transfer'}</option>
                    <option value="MOBILE_BANKING">{isBn ? '📱 মোবাইল ব্যাংকিং (bKash/Nagad)' : '📱 Mobile Banking'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    {isBn ? 'যে অ্যাকাউন্ট থেকে টাকা কাটা যাবে *' : 'Debit Account *'}
                  </label>
                  <select
                    value={repayAccountId}
                    onChange={(e) => setRepayAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-200 bg-white rounded-xl text-sm font-semibold"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (ব্যালেন্স: ৳{acc.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'বিবরণ / নোট' : 'Description / Note'}
                  </label>
                  <input
                    type="text"
                    value={repayDescription}
                    onChange={(e) => setRepayDescription(e.target.value)}
                    placeholder={isBn ? 'যেমন: ঋণ পরিশোধ কিস্তি ০১' : 'e.g. Loan repayment installment 1'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'রেফারেন্স / চেক নং' : 'Reference / Cheque No'}
                  </label>
                  <input
                    type="text"
                    value={repayReference}
                    onChange={(e) => setRepayReference(e.target.value)}
                    placeholder="e.g. CHQ-99120"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRepayModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  {isBn ? 'ঋণ পরিশোধ নিশ্চিত করুন' : 'Confirm Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Loan Modal */}
      {editModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <span>{isBn ? 'ঋণ রেকর্ড সংশোধন / এডিট' : 'Edit Loan Record'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditModalLoan(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ঋণ প্রদানকারীর নাম *' : 'Lender Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editLenderName}
                  onChange={(e) => setEditLenderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'তারিখ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'মূল ঋণের পরিমাণ (৳) *' : 'Loan Amount (Tk) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-blue-600 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'ঋণদাতার ধরন' : 'Lender Type'}
                  </label>
                  <select
                    value={editLenderType}
                    onChange={(e) => setEditLenderType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="INDIVIDUAL">{isBn ? 'ব্যক্তিগত' : 'Individual'}</option>
                    <option value="BANK">{isBn ? 'ব্যাংক' : 'Bank'}</option>
                    <option value="PARTNER">{isBn ? 'শেয়ারহোল্ডার / পার্টনার' : 'Partner'}</option>
                    <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'ফোন নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'সংশ্লিষ্ট প্রজেক্ট' : 'Related Project'}
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="">{isBn ? '-- সাধারণ / কোনো প্রজেক্ট নয় --' : '-- General / None --'}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'ঋণের অবস্থা (Status)' : 'Loan Status'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'FULLY_PAID')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="ACTIVE">{isBn ? 'চলমান (বকেয়া আছে)' : 'Active (Outstanding)'}</option>
                    <option value="FULLY_PAID">{isBn ? 'সম্পূর্ণ পরিশোধিত (Closed)' : 'Fully Paid (Closed)'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ঋণের উদ্দেশ্য / বিবরণ' : 'Purpose / Description'} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalLoan(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'ঋণ রেকর্ড মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Loan Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে ${deleteModalLoan.lenderName}-এর ৳${deleteModalLoan.amount.toLocaleString()} ঋণের রেকর্ডটি মুছে ফেলতে চান?`
                : `Are you sure you want to delete loan record of ৳${deleteModalLoan.amount.toLocaleString()} from ${deleteModalLoan.lenderName}?`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ' : 'Reason for Deletion'}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুলবশত এন্ট্রি দেওয়া হয়েছিল' : 'e.g. Incorrect entry'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalLoan(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Loan'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div> {/* End of Main Loan Page Wrapper */}

      {/* Loan Statement Print Modal - Outside print:hidden so it never prints blank */}
      {isPrintModalOpen && (
        <div 
          id="loan-statement-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block printable-modal"
        >
          <div className="bg-white text-slate-950 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none print:overflow-visible print:block">
            
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base">
                  {isBn ? 'গৃহীত ঋণ ও পরিশোধ রেজিস্টার স্টেটমেন্ট' : 'Loan Borrowings & Repayment Statement'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    setTimeout(() => {
                      window.print();
                    }, 100);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print Statement'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto print:p-2 print:overflow-visible print:h-auto print:max-h-none print:block text-slate-950 bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 tracking-tight">
                  {isBn ? (settings?.companyNameBn || settings?.companyName || 'কনস্ট্রাকশন অ্যাকাউন্টস ও প্রজেক্ট ইআরপি') : (settings?.companyName || settings?.companyNameBn || 'CONSTRUCTION ACCOUNTS & PROJECT ERP')}
                </h1>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  {isBn ? (settings?.addressBn || '২১, ২২ দুর্গাবাড়ি রোড ময়মনসিংহ') : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
                </p>
                <div className="inline-block mt-3 px-6 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-black tracking-wider uppercase rounded-md shadow-xs">
                  {isBn ? 'গৃহীত ঋণ ও পরিশোধ রেজিস্টার স্টেটমেন্ট' : 'LOAN BORROWINGS & REPAYMENT REGISTER STATEMENT'}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-xs mb-4">
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold">{isBn ? 'ফিল্টার অবস্থা:' : 'Filter Status:'}</span>
                  <span className="font-bold text-slate-950 text-xs">
                    {filterStatus === 'ALL' ? (isBn ? 'সকল ঋণ' : 'All') : filterStatus === 'ACTIVE' ? (isBn ? 'চলমান বকেয়া' : 'Active') : (isBn ? 'পরিশোধিত' : 'Paid')}
                    {filterProject !== 'ALL' && ` • ${projects.find(p => p.id === filterProject)?.name || filterProject}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold">{isBn ? 'মোট গৃহীত ঋণ:' : 'Total Borrowed:'}</span>
                  <span className="font-black text-slate-950 text-sm">{formatCurrency(totalLoanReceived, isBn ? 'bn' : 'en')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold">{isBn ? 'মোট পরিশোধিত ঋণ:' : 'Total Repaid:'}</span>
                  <span className="font-black text-slate-950 text-sm">{formatCurrency(totalLoanRepaid, isBn ? 'bn' : 'en')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold">{isBn ? 'মোট বর্তমান বকেয়া:' : 'Net Outstanding:'}</span>
                  <span className="font-black text-slate-950 text-sm">{formatCurrency(totalOutstanding, isBn ? 'bn' : 'en')}</span>
                </div>
              </div>

              <div className="border border-slate-900 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-xs border-collapse loan-statement-table table-fixed">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-slate-950 font-black text-[10px] sm:text-[11px]">
                      <th className="py-2 px-1 border-r border-slate-300 text-center w-[3.5%]">{isBn ? 'ক্র.' : 'Sl'}</th>
                      <th className="py-2 px-1 border-r border-slate-300 w-[9.5%] whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="py-2 px-1.5 border-r border-slate-300 w-[16%]">{isBn ? 'ঋণ প্রদানকারীর নাম' : 'Lender Name'}</th>
                      <th className="py-2 px-1.5 border-r border-slate-300 w-[12%]">{isBn ? 'প্রকল্প' : 'Project'}</th>
                      <th className="py-2 px-1.5 border-r border-slate-300 w-[15%]">{isBn ? 'উদ্দেশ্য / কারণ' : 'Purpose'}</th>
                      <th className="py-2 px-1.5 border-r border-slate-300 text-right w-[14%] whitespace-nowrap">{isBn ? 'গৃহীত ঋণ (৳)' : 'Borrowed (Tk)'}</th>
                      <th className="py-2 px-1.5 border-r border-slate-300 text-right w-[12.5%] whitespace-nowrap">{isBn ? 'পরিশোধিত (৳)' : 'Repaid (Tk)'}</th>
                      <th className="py-2 px-1.5 border-r border-slate-300 text-right w-[12.5%] whitespace-nowrap">{isBn ? 'বকেয়া (৳)' : 'Balance (Tk)'}</th>
                      <th className="py-2 px-1 text-center w-[5%] whitespace-nowrap">{isBn ? 'অবস্থা' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-[10.5px]">
                    {filtered.map((l, idx) => {
                      const isFullyPaid = (l.outstandingAmount || 0) === 0 || l.status === 'FULLY_PAID';
                      return (
                        <tr key={l.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-1.5 px-1 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                          <td className="py-1.5 px-1 border-r border-slate-300 whitespace-nowrap">{formatDisplayDate(l.date, isBn ? 'bn' : 'en')}</td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300 font-bold text-slate-950">
                            {l.lenderName}
                            {l.phone && <span className="block text-[9.5px] text-slate-500 font-normal">{l.phone}</span>}
                          </td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300 font-medium">{l.projectName || 'General'}</td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300 text-slate-700">{l.purpose}</td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-950 whitespace-nowrap">
                            {formatCurrency(l.amount, isBn ? 'bn' : 'en')}
                          </td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                            {formatCurrency(l.repaidAmount || 0, isBn ? 'bn' : 'en')}
                          </td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                            {formatCurrency(l.outstandingAmount || 0, isBn ? 'bn' : 'en')}
                          </td>
                          <td className="py-1.5 px-1 text-center font-bold whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${
                              isFullyPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isFullyPaid ? (isBn ? 'পরিশোধিত' : 'Paid') : (isBn ? 'বকেয়া' : 'Active')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs">
                      <td colSpan={5} className="py-2 px-2 text-right border-r border-slate-300 whitespace-nowrap">
                        {isBn ? 'সর্বমোট (Grand Total):' : 'Grand Total:'}
                      </td>
                      <td className="py-2 px-1.5 text-right font-mono font-black text-xs text-slate-950 border-r border-slate-300 whitespace-nowrap">
                        {formatCurrency(totalLoanReceived, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="py-2 px-1.5 text-right font-mono font-black text-xs text-emerald-900 border-r border-slate-300 whitespace-nowrap">
                        {formatCurrency(totalLoanRepaid, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="py-2 px-1.5 text-right font-mono font-black text-xs text-rose-900 border-r border-slate-300 whitespace-nowrap">
                        {formatCurrency(totalOutstanding, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="border-slate-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs print-signature-section">
                <div className="flex flex-col items-center justify-end">
                  <div className="w-44 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'হিসাব শাখা' : 'Accounts Officer'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-44 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'নিরীক্ষক / অডিটর' : 'Auditor'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-44 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
