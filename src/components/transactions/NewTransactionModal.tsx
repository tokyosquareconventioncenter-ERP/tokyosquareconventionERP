/**
 * Universal Quick Transaction Modal
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 * Enforces "One Transaction Creates All Accounting Records"
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  X, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Users, 
  Receipt, 
  Landmark, 
  CheckCircle2, 
  Printer, 
  FileText,
  AlertCircle,
  ChevronDown,
  Calendar,
  Camera,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { ExpenseType, PaymentMethod, SourceType, Voucher } from '../../types';
import { compressImage } from '../../utils/imageUtils';
import { 
  DEFAULT_CONSTRUCTION_CATEGORIES, 
  getSavedCustomCategories, 
  saveCustomCategoryToStorage,
  getSavedCustomMonthlyExpenseHeads,
  saveCustomMonthlyExpenseHeadToStorage
} from '../../data/constructionCategories';

const MONTH_NAMES = [
  { value: '01', nameBn: 'জানুয়ারি', nameEn: 'Jan' },
  { value: '02', nameBn: 'ফেব্রুয়ারি', nameEn: 'Feb' },
  { value: '03', nameBn: 'মার্চ', nameEn: 'Mar' },
  { value: '04', nameBn: 'এপ্রিল', nameEn: 'Apr' },
  { value: '05', nameBn: 'মে', nameEn: 'May' },
  { value: '06', nameBn: 'জুন', nameEn: 'Jun' },
  { value: '07', nameBn: 'জুলাই', nameEn: 'Jul' },
  { value: '08', nameBn: 'আগস্ট', nameEn: 'Aug' },
  { value: '09', nameBn: 'সেপ্টেম্বর', nameEn: 'Sep' },
  { value: '10', nameBn: 'অক্টোবর', nameEn: 'Oct' },
  { value: '11', nameBn: 'নভেম্বর', nameEn: 'Nov' },
  { value: '12', nameBn: 'ডিসেম্বর', nameEn: 'Dec' },
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

const YEAR_OPTIONS = [
  '2030', '2029', '2028', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'
];

const toBnDigits = (str: string | number) => {
  const bnNums: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(str).split('').map(c => bnNums[c] || c).join('');
};

export type TransactionModalTab = 
  | 'EXPENSE' 
  | 'RECEIVE' 
  | 'CONTRACTOR' 
  | 'MONTHLY_BILL' 
  | 'LOAN' 
  | 'TRANSFER'
  | 'MONEY_IN'
  | 'CONTRACTOR_PAYMENT'
  | 'LOAN_REPAY';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TransactionModalTab;
  initialType?: TransactionModalTab;
  onVoucherCreated?: (voucher: Voucher) => void;
}

const normalizeTab = (t?: TransactionModalTab): 'EXPENSE' | 'RECEIVE' | 'CONTRACTOR' | 'MONTHLY_BILL' | 'LOAN' | 'TRANSFER' => {
  if (t === 'MONEY_IN') return 'RECEIVE';
  if (t === 'CONTRACTOR_PAYMENT') return 'CONTRACTOR';
  if (t === 'LOAN_REPAY') return 'LOAN';
  if (t === 'RECEIVE' || t === 'CONTRACTOR' || t === 'MONTHLY_BILL' || t === 'LOAN' || t === 'TRANSFER') return t;
  return 'EXPENSE';
};

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'EXPENSE',
  initialType,
  onVoucherCreated,
}) => {
  const { language, t } = useLanguage();
  const { 
    projects, 
    accounts, 
    contractors, 
    suppliers, 
    addExpense, 
    addMoneyReceived, 
    addContractorPayment, 
    addMonthlyBill, 
    addLoan,
    addAccountTransfer
  } = useData();

  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'RECEIVE' | 'CONTRACTOR' | 'MONTHLY_BILL' | 'LOAN' | 'TRANSFER'>(() => 
    normalizeTab(initialType || defaultTab)
  );

  // Synchronize tab if prop changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      const target = initialType || defaultTab;
      if (target) {
        setActiveTab(normalizeTab(target));
      }
    }
  }, [isOpen, defaultTab, initialType]);

  // Common Form States
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Explicit Day, Month, Year states to prevent DD/MM inversion confusion
  const initialDateParts = (new Date().toISOString().split('T')[0]).split('-');
  const [dayVal, setDayVal] = useState<string>(initialDateParts[2] || '01');
  const [monthVal, setMonthVal] = useState<string>(initialDateParts[1] || '01');
  const [yearVal, setYearVal] = useState<string>(initialDateParts[0] || '2026');

  const handleDateChangeCustom = (newDay: string, newMonth: string, newYear: string) => {
    setDayVal(newDay);
    setMonthVal(newMonth);
    setYearVal(newYear);
    const combined = `${newYear}-${newMonth}-${newDay}`;
    setDate(combined);
    try {
      const d = new Date(combined);
      if (!isNaN(d.getTime())) {
        setMonthlyMonth(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
      }
    } catch {}
  };

  const handleNativeDateChange = (isoDate: string) => {
    if (!isoDate) return;
    setDate(isoDate);
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      setYearVal(parts[0]);
      setMonthVal(parts[1]);
      setDayVal(parts[2]);
      try {
        const d = new Date(isoDate);
        if (!isNaN(d.getTime())) {
          setMonthlyMonth(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
        }
      } catch {}
    }
  };

  const setTodayDate = () => {
    const now = new Date();
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    handleDateChangeCustom(d, m, y);
  };

  const setYesterdayDate = () => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    handleDateChangeCustom(d, m, y);
  };

  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  
  const defaultCashAcc = accounts.find(a => a.type === 'CASH') || accounts[0];
  const [accountId, setAccountId] = useState<string>(defaultCashAcc?.id || '');

  // Synchronize initial modal opening to default cash account if CASH method
  React.useEffect(() => {
    if (isOpen) {
      const c = accounts.find(a => a.type === 'CASH') || accounts[0];
      if (c) {
        setPaymentMethod('CASH');
        setAccountId(c.id);
      }
    }
  }, [isOpen]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'CASH') {
      const cashAcc = accounts.find(a => a.type === 'CASH');
      if (cashAcc) setAccountId(cashAcc.id);
    } else if (method === 'MOBILE_BANKING') {
      const mobAcc = accounts.find(a => a.type === 'MOBILE_BANKING') || accounts.find(a => a.type === 'BANK');
      if (mobAcc) setAccountId(mobAcc.id);
    } else {
      const bankAcc = accounts.find(a => a.type === 'BANK') || accounts.find(a => a.type === 'MOBILE_BANKING');
      if (bankAcc) setAccountId(bankAcc.id);
    }
  };

  const handleAccountChange = (selectedAccId: string) => {
    setAccountId(selectedAccId);
    const acc = accounts.find(a => a.id === selectedAccId);
    if (acc) {
      if (acc.type === 'CASH') {
        setPaymentMethod('CASH');
      } else if (acc.type === 'MOBILE_BANKING') {
        setPaymentMethod('MOBILE_BANKING');
      } else if (acc.type === 'BANK') {
        setPaymentMethod('BANK');
      }
    }
  };
  const [description, setDescription] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [isCompressingImg, setIsCompressingImg] = useState<boolean>(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingImg(true);
      const compressed = await compressImage(file, 1200, 0.75);
      setAttachmentUrl(compressed);
    } catch (err) {
      console.error('Error compressing image:', err);
    } finally {
      setIsCompressingImg(false);
    }
  };

  // Expense Specific
  const [expenseType, setExpenseType] = useState<ExpenseType>('MATERIAL');
  const [category, setCategory] = useState<string>('সিমেন্ট (Cement)');
  const [paidTo, setPaidTo] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [contractorId, setContractorId] = useState<string>('');

  // Dynamic Custom Category States
  const [customCategories, setCustomCategories] = useState<string[]>(() => getSavedCustomCategories());
  const [isCustomCategoryInput, setIsCustomCategoryInput] = useState<boolean>(false);
  const [customCategoryText, setCustomCategoryText] = useState<string>('');

  const handleSaveCustomCategoryInline = () => {
    const trimmed = customCategoryText.trim();
    if (!trimmed) return;
    const updated = saveCustomCategoryToStorage(trimmed);
    setCustomCategories(updated);
    setCategory(trimmed);
    setIsCustomCategoryInput(false);
    setCustomCategoryText('');
  };

  // Money Received Specific
  const [receivedFrom, setReceivedFrom] = useState<string>('');
  const [sourceType, setSourceType] = useState<SourceType>('Company Fund');
  const [isMultiProjectSplit, setIsMultiProjectSplit] = useState<boolean>(false);
  const [projectSplits, setProjectSplits] = useState<{ projectId: string; amount: string }[]>([
    { projectId: '', amount: '' },
    { projectId: '', amount: '' }
  ]);

  // Helper to compute Month Year string e.g. "September 2026"
  const getMonthYearFromDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'September 2026';
      return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'September 2026';
    }
  };

  // Monthly Bill Specific
  const [monthlyExpenseHeads, setMonthlyExpenseHeads] = useState<string[]>(() => getSavedCustomMonthlyExpenseHeads());
  const [monthlyExpenseName, setMonthlyExpenseName] = useState<string>('MD. eleyes');
  const [isCustomMonthlyHeadInput, setIsCustomMonthlyHeadInput] = useState<boolean>(false);
  const [customMonthlyHeadText, setCustomMonthlyHeadText] = useState<string>('');
  const [monthlyMonth, setMonthlyMonth] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  });

  const handleSaveCustomMonthlyHeadInline = () => {
    const trimmed = customMonthlyHeadText.trim();
    if (!trimmed) return;
    const updated = saveCustomMonthlyExpenseHeadToStorage(trimmed);
    setMonthlyExpenseHeads(updated);
    setMonthlyExpenseName(trimmed);
    setIsCustomMonthlyHeadInput(false);
    setCustomMonthlyHeadText('');
  };

  // Loan Specific
  const [lenderName, setLenderName] = useState<string>('');
  const [loanPurpose, setLoanPurpose] = useState<string>('');

  // Fund Transfer Specific (Bank to Cash / Cash to Bank / Account to Account)
  const [fromAccountId, setFromAccountId] = useState<string>(() => {
    const bankAcc = accounts.find(a => a.type === 'BANK') || accounts[0];
    return bankAcc?.id || '';
  });
  const [toAccountId, setToAccountId] = useState<string>(() => {
    const cashAcc = accounts.find(a => a.type === 'CASH') || accounts[1] || accounts[0];
    return cashAcc?.id || '';
  });

  // Success State
  const [createdVoucher, setCreatedVoucher] = useState<Voucher | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const isBn = language === 'bn';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সঠিক টাকার পরিমাণ প্রদান করুন।' : 'Please provide a valid amount.');
      return;
    }

    try {
      if (activeTab === 'EXPENSE') {
        let finalCategory = category;
        if (isCustomCategoryInput && customCategoryText.trim()) {
          finalCategory = customCategoryText.trim();
          const updated = saveCustomCategoryToStorage(finalCategory);
          setCustomCategories(updated);
          setCategory(finalCategory);
          setIsCustomCategoryInput(false);
          setCustomCategoryText('');
        }

        const recipient = paidTo || (supplierId ? suppliers.find(s => s.id === supplierId)?.name : 'Vendor') || 'Cash Payee';
        const result = addExpense({
          date,
          projectId,
          expenseType,
          category: finalCategory,
          paidTo: recipient,
          amount: parsedAmount,
          paymentMethod,
          accountId,
          description: description || `${finalCategory} purchase/expense for project`,
          supplierId: supplierId || undefined,
          contractorId: contractorId || undefined,
          reference,
          attachmentUrl: attachmentUrl || undefined,
        });
        setCreatedVoucher(result.voucher);
        if (onVoucherCreated) onVoucherCreated(result.voucher);
      } else if (activeTab === 'RECEIVE') {
        let allocationsToSend: { projectId: string; amount: number }[] | undefined = undefined;

        if (isMultiProjectSplit) {
          const validSplits = projectSplits
            .filter(s => s.projectId && parseFloat(s.amount) > 0)
            .map(s => ({
              projectId: s.projectId,
              amount: parseFloat(s.amount),
            }));

          if (validSplits.length > 0) {
            const splitTotal = validSplits.reduce((sum, s) => sum + s.amount, 0);
            if (Math.abs(splitTotal - parsedAmount) > 0.01) {
              setErrorMsg(isBn 
                ? `প্রজেক্টে বিভক্ত টাকার মোট পরিমাণ (৳${splitTotal.toLocaleString()}) মূল জমা টাকার (৳${parsedAmount.toLocaleString()}) সাথে সমান হতে হবে!` 
                : `Total allocated amount (৳${splitTotal.toLocaleString()}) must match the total received amount (৳${parsedAmount.toLocaleString()})!`);
              return;
            }
            allocationsToSend = validSplits;
          }
        }

        const result = addMoneyReceived({
          date,
          receivedFrom: receivedFrom || 'S.M. Khalilur Rahman Properties Ltd.',
          sourceType,
          projectId: isMultiProjectSplit && allocationsToSend && allocationsToSend.length > 0 ? allocationsToSend[0].projectId : projectId,
          amount: parsedAmount,
          projectAllocations: allocationsToSend,
          paymentMethod,
          accountId,
          reference,
          description: description || `Money received from ${receivedFrom || sourceType}`,
          attachmentUrl: attachmentUrl || undefined,
        });
        if (result?.voucher) {
          setCreatedVoucher(result.voucher);
          if (onVoucherCreated) onVoucherCreated(result.voucher);
        }
      } else if (activeTab === 'CONTRACTOR') {
        const contractor = contractors.find(c => c.id === contractorId);
        const result = addContractorPayment({
          date,
          projectId,
          contractorId: contractorId || contractors[0]?.id || '',
          amount: parsedAmount,
          paymentMethod,
          accountId,
          workDescription: description || `Payment for ${contractor?.type || 'contractor work'}`,
          reference,
        });
        setCreatedVoucher(result.voucher);
        if (onVoucherCreated) onVoucherCreated(result.voucher);
      } else if (activeTab === 'MONTHLY_BILL') {
        let finalMonthlyHead = monthlyExpenseName;
        if (isCustomMonthlyHeadInput && customMonthlyHeadText.trim()) {
          finalMonthlyHead = customMonthlyHeadText.trim();
          const updated = saveCustomMonthlyExpenseHeadToStorage(finalMonthlyHead);
          setMonthlyExpenseHeads(updated);
          setMonthlyExpenseName(finalMonthlyHead);
          setIsCustomMonthlyHeadInput(false);
          setCustomMonthlyHeadText('');
        }

        const result = addMonthlyBill({
          date,
          projectId: projectId || 'company',
          month: monthlyMonth,
          year: date ? new Date(date).getFullYear() : new Date().getFullYear(),
          expenseName: finalMonthlyHead,
          category: finalMonthlyHead.toLowerCase().includes('salary') ? 'SALARY' : 'OFFICE',
          amount: parsedAmount,
          paymentMethod,
          accountId,
          description: description || `${finalMonthlyHead} payment for ${monthlyMonth}`,
        });
        setCreatedVoucher(result.voucher);
        if (onVoucherCreated) onVoucherCreated(result.voucher);
      } else if (activeTab === 'LOAN') {
        const result = addLoan({
          lenderName: lenderName || 'Private Lender',
          date,
          amount: parsedAmount,
          projectId: projectId || undefined,
          purpose: loanPurpose || 'Project cash flow support',
          paymentMethod,
          accountId,
          reference,
        });
        if (result?.voucher) {
          setCreatedVoucher(result.voucher);
          if (onVoucherCreated) onVoucherCreated(result.voucher);
        }
      } else if (activeTab === 'TRANSFER') {
        if (!fromAccountId || !toAccountId) {
          setErrorMsg(isBn ? 'উৎস একাউন্ট এবং গন্তব্য একাউন্ট উভয়ই নির্বাচন করুন।' : 'Please select both source and destination accounts.');
          return;
        }
        if (fromAccountId === toAccountId) {
          setErrorMsg(isBn ? 'উৎস একাউন্ট এবং গন্তব্য একাউন্ট একই হতে পারে না।' : 'Source and destination accounts cannot be the same.');
          return;
        }
        const result = addAccountTransfer({
          date,
          fromAccountId,
          toAccountId,
          amount: parsedAmount,
          projectId: projectId || undefined,
          description: description || undefined,
          reference: reference || undefined,
        });
        if (result?.voucher) {
          setCreatedVoucher(result.voucher);
          if (onVoucherCreated) onVoucherCreated(result.voucher);
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Transaction could not be recorded.');
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setCreatedVoucher(null);
    setAmount('');
    setDescription('');
    setReference('');
    setAttachmentUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-100">
                {isBn ? 'নতুন লেনদেন এন্ট্রি' : 'New Transaction Entry'}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isBn ? 'স্বয়ংক্রিয় লেজার ও ভাউচার সমন্বিত হিসাব' : 'Automatic Ledger, Account & Voucher Synchronization'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Fully Visible 6-Tab Grid */}
        {!isSuccess && (
          <div className="p-2 sm:p-3 bg-slate-100 border-b border-slate-200 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {/* 1. Expense */}
              <button
                type="button"
                onClick={() => setActiveTab('EXPENSE')}
                className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition text-left border ${
                  activeTab === 'EXPENSE'
                    ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-xs ring-2 ring-rose-400/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'EXPENSE' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-100 text-rose-600'}`}>
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{isBn ? 'খরচ (Expense)' : 'Expense'}</span>
              </button>

              {/* 2. Money In */}
              <button
                type="button"
                onClick={() => setActiveTab('RECEIVE')}
                className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition text-left border ${
                  activeTab === 'RECEIVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-500/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'RECEIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-100 text-emerald-700'}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{isBn ? 'টাকা গ্রহণ (Money In)' : 'Money In'}</span>
              </button>

              {/* 3. Contractor Payment */}
              <button
                type="button"
                onClick={() => setActiveTab('CONTRACTOR')}
                className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition text-left border ${
                  activeTab === 'CONTRACTOR'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs ring-2 ring-indigo-400/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'CONTRACTOR' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{isBn ? 'কন্ট্রাক্টর পেমেন্ট' : 'Contractor'}</span>
              </button>

              {/* 4. Monthly Bill */}
              <button
                type="button"
                onClick={() => setActiveTab('MONTHLY_BILL')}
                className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition text-left border ${
                  activeTab === 'MONTHLY_BILL'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-400/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'MONTHLY_BILL' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-100 text-amber-600'}`}>
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{isBn ? 'মাসিক কোম্পানি বিল' : 'Monthly Bill'}</span>
              </button>

              {/* 5. Loan */}
              <button
                type="button"
                onClick={() => setActiveTab('LOAN')}
                className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition text-left border ${
                  activeTab === 'LOAN'
                    ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-xs ring-2 ring-purple-400/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'LOAN' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-100 text-purple-600'}`}>
                  <Landmark className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{isBn ? 'ঋণ / ধার (Loan)' : 'Loan Entry'}</span>
              </button>

              {/* 6. Bank <-> Cash Transfer */}
              <button
                type="button"
                onClick={() => setActiveTab('TRANSFER')}
                className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition text-left border ${
                  activeTab === 'TRANSFER'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-500/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'TRANSFER' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-100 text-emerald-700'}`}>
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
                <span className="truncate flex items-center gap-1">
                  <span>{isBn ? 'ব্যাংক ⇄ ক্যাশ' : 'Bank ⇄ Cash'}</span>
                  <span className="text-[9px] bg-emerald-200 text-emerald-900 font-extrabold px-1 py-0.2 rounded">Contra</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isBn ? 'লেনদেন সফলভাবে সম্পন্ন হয়েছে!' : 'Transaction Recorded Successfully!'}
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {isBn 
                    ? 'লেজার, একাউন্ট ব্যালেন্স এবং সংশ্লিষ্ট প্রজেক্ট খরচ স্বয়ংক্রিয়ভাবে আপডেট করা হয়েছে।' 
                    : 'The General Ledger, Account Balances, and Project Expenditures have been updated automatically.'}
                </p>
              </div>

              {createdVoucher && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{isBn ? 'তৈরিকৃত ভাউচার নং:' : 'Generated Voucher No:'}</span>
                    <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-amber-100 rounded text-amber-900">
                      {createdVoucher.voucherNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{isBn ? 'প্রাপক:' : 'Paid To:'}</span>
                    <span className="font-semibold text-slate-900">{createdVoucher.paidTo}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{isBn ? 'টাকার পরিমাণ:' : 'Amount:'}</span>
                    <span className="font-bold text-slate-900 font-mono">৳{createdVoucher.amount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-4">
                {createdVoucher && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onVoucherCreated && createdVoucher) onVoucherCreated(createdVoucher);
                      handleResetAndClose();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xs transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isBn ? 'ভাউচার দেখুন ও প্রিন্ট করুন' : 'View & Print Voucher'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition"
                >
                  {isBn ? 'সম্পন্ন / বন্ধ করুন' : 'Done & Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Date & Project */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Day ➔ Month ➔ Year Date Selection with Live Preview */}
                <div className="bg-amber-50/70 border border-amber-200/90 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      {isBn ? 'তারিখ (দিন ➔ মাস ➔ বছর)' : 'Date (Day ➔ Month ➔ Year)'} *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={setTodayDate}
                        className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded cursor-pointer transition shadow-2xs"
                        title={isBn ? 'আজকের তারিখ সেট করুন' : 'Select today'}
                      >
                        {isBn ? '📅 আজ' : '📅 Today'}
                      </button>
                      <button
                        type="button"
                        onClick={setYesterdayDate}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded cursor-pointer transition"
                        title={isBn ? 'গতকালের তারিখ সেট করুন' : 'Select yesterday'}
                      >
                        {isBn ? 'গতকাল' : 'Yesterday'}
                      </button>
                    </div>
                  </div>

                  {/* 3 Dropdowns: Day (০১-৩১), Month (জানুয়ারি-ডিসেম্বর), Year (২০২৪-২০৩০) */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* 1. Day */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        {isBn ? '১. দিন (Day)' : '1. Day'}
                      </span>
                      <select
                        value={dayVal}
                        onChange={(e) => handleDateChangeCustom(e.target.value, monthVal, yearVal)}
                        className="w-full px-2 py-1.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden cursor-pointer"
                      >
                        {DAY_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {isBn ? `${toBnDigits(d)} তারিখ` : `${d}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Month */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        {isBn ? '২. মাস (Month)' : '2. Month'}
                      </span>
                      <select
                        value={monthVal}
                        onChange={(e) => handleDateChangeCustom(dayVal, e.target.value, yearVal)}
                        className="w-full px-2 py-1.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden cursor-pointer"
                      >
                        {MONTH_NAMES.map((m) => (
                          <option key={m.value} value={m.value}>
                            {isBn ? m.nameBn : m.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Year */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        {isBn ? '৩. বছর (Year)' : '3. Year'}
                      </span>
                      <select
                        value={yearVal}
                        onChange={(e) => handleDateChangeCustom(dayVal, monthVal, e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden cursor-pointer"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {isBn ? toBnDigits(y) : y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Live Confirmation Badge - guarantees 0 confusion */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-950 bg-amber-200/80 border border-amber-300 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span className="truncate">
                        {isBn 
                          ? `নির্বাচিত: ${toBnDigits(dayVal)} ${MONTH_NAMES.find(m => m.value === monthVal)?.nameBn} ${toBnDigits(yearVal)}` 
                          : `Selected: ${dayVal} ${MONTH_NAMES.find(m => m.value === monthVal)?.nameEn} ${yearVal}`}
                      </span>
                    </div>

                    {/* Native calendar picker fallback button */}
                    <label className="relative cursor-pointer text-[10px] font-bold text-amber-900 hover:text-black underline shrink-0 flex items-center gap-1 ml-2">
                      <span>{isBn ? 'ক্যালেন্ডার পপ-আপ' : 'Calendar'}</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => handleNativeDateChange(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        tabIndex={-1}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'প্রকল্প / হেড' : 'Project / Head'} *
                  </label>
                  {activeTab === 'RECEIVE' && isMultiProjectSplit ? (
                    <div className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2">
                      <span className="text-base">🔀</span>
                      <span>{isBn ? 'একাধিক প্রজেক্টে ভাগ হচ্ছে (নিচে প্রজেক্ট ও টাকা নির্দিষ্ট করুন)' : 'Multi-Project Split Active (Specify projects below)'}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id} className="bg-slate-900 text-white font-medium py-1">
                            🏗️ {p.name}
                          </option>
                        ))}
                        <option value="company" className="bg-slate-900 text-amber-300 font-bold py-1">
                          🏢 {isBn ? 'কোম্পানি হেড অফিস / সাধারণ' : 'Company Head Office / General'}
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Form Sections Based on Tab */}
              {activeTab === 'EXPENSE' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isBn ? 'খরচের ধরণ' : 'Expense Type'}
                      </label>
                      <div className="relative">
                        <select
                          value={expenseType}
                          onChange={(e) => {
                            const newType = e.target.value as ExpenseType;
                            setExpenseType(newType);
                            // Auto select a relevant construction category if available
                            const matchingGroup = DEFAULT_CONSTRUCTION_CATEGORIES.find(g => g.expenseType === newType);
                            if (matchingGroup && matchingGroup.items.length > 0 && !isCustomCategoryInput) {
                              setCategory(matchingGroup.items[0].bn);
                            }
                          }}
                          className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                        >
                          <option value="MATERIAL" className="bg-slate-900 text-white font-medium py-1">{isBn ? '📦 ম্যাটেরিয়াল / কাঁচামাল' : 'Material'}</option>
                          <option value="LABOUR" className="bg-slate-900 text-white font-medium py-1">{isBn ? '👷 লেবার / মজুরি' : 'Labour'}</option>
                          <option value="CONTRACTOR" className="bg-slate-900 text-white font-medium py-1">{isBn ? '🏗️ কন্ট্রাক্টর বিল' : 'Contractor'}</option>
                          <option value="SALARY" className="bg-slate-900 text-white font-medium py-1">{isBn ? '💼 বেতন (Salary)' : 'Salary'}</option>
                          <option value="CONVEYANCE" className="bg-slate-900 text-white font-medium py-1">{isBn ? '🚗 যাতায়াত খরচ' : 'Conveyance'}</option>
                          <option value="FOOD" className="bg-slate-900 text-white font-medium py-1">{isBn ? '🍲 খাবার বিল' : 'Food Bill'}</option>
                          <option value="ELECTRICITY" className="bg-slate-900 text-white font-medium py-1">{isBn ? '⚡ বিদ্যুৎ বিল' : 'Electricity'}</option>
                          <option value="OTHER" className="bg-slate-900 text-white font-medium py-1">{isBn ? '📋 অন্যান্য / পেটি ক্যাশ' : 'Other'}</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          {isBn ? 'ক্যাটাগরি / খরচের খাত' : 'Category / Expense Head'} *
                        </label>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsCustomCategoryInput(!isCustomCategoryInput);
                            if (!isCustomCategoryInput) {
                              setCustomCategoryText('');
                            }
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          {isCustomCategoryInput 
                            ? (isBn ? '📋 তালিকা থেকে বেছে নিন' : '📋 Select from list') 
                            : (isBn ? '✍️ + নতুন খাত হাতে লিখুন' : '✍️ + Write custom')}
                        </button>
                      </div>

                      {isCustomCategoryInput ? (
                        <div className="space-y-1.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customCategoryText}
                              onChange={(e) => setCustomCategoryText(e.target.value)}
                              placeholder={isBn ? 'নতুন খরচের খাত লিখুন (যেমন: সয়েল টেস্ট ল্যাব ফি, গ্যাস লাইন শিফটিং...)' : 'Type custom category (e.g. Soil Test Lab Fee)...'}
                              required
                              autoFocus
                              className="flex-1 px-3 py-2 bg-amber-50/70 border-2 border-amber-500 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden transition"
                            />
                            <button
                              type="button"
                              onClick={handleSaveCustomCategoryInline}
                              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 active:scale-95 cursor-pointer transition"
                            >
                              + {isBn ? 'সেভ করুন' : 'Save'}
                            </button>
                          </div>
                          <p className="text-[11px] text-amber-800 font-semibold">
                            {isBn 
                              ? '💡 এই খাতটি সেভ করলে স্বয়ংক্রিয়ভাবে ড্রপডাউন তালিকায় যুক্ত থাকবে।' 
                              : '💡 Saving this will permanently add it to the dropdown menu.'}
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={category}
                            onChange={(e) => {
                              if (e.target.value === '__CUSTOM_NEW__') {
                                setIsCustomCategoryInput(true);
                                setCustomCategoryText('');
                              } else {
                                setCategory(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                          >
                            {customCategories.length > 0 && (
                              <optgroup label={isBn ? '⭐ সংরক্ষিত কাস্টম খাত (Saved Custom)' : '⭐ Saved Custom Categories'}>
                                {customCategories.map(c => (
                                  <option key={c} value={c} className="bg-slate-900 text-amber-300 font-bold py-1">
                                    ⭐ {c}
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {DEFAULT_CONSTRUCTION_CATEGORIES.map(group => (
                              <optgroup key={group.groupNameEn} label={isBn ? group.groupNameBn : group.groupNameEn}>
                                {group.items.map(item => (
                                  <option key={item.en} value={item.bn} className="bg-slate-900 text-white font-medium py-1">
                                    {isBn ? item.bn : item.en}
                                  </option>
                                ))}
                              </optgroup>
                            ))}

                            <option value="__CUSTOM_NEW__" className="bg-slate-950 text-amber-400 font-black py-2 border-t border-slate-700">
                              ✍️ {isBn ? 'তালিকায় না থাকলে নতুন খাতের নাম হাতে লিখুন...' : 'Type custom category by hand...'}
                            </option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isBn ? 'প্রাপকের নাম' : 'Paid To'} *
                      </label>
                      <input
                        type="text"
                        value={paidTo}
                        onChange={(e) => setPaidTo(e.target.value)}
                        placeholder={isBn ? 'যার নিকট টাকা প্রদান করা হলো' : 'Person or company paid'}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                      />
                    </div>

                    {expenseType === 'MATERIAL' && suppliers.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isBn ? 'সরবরাহকারী নির্বাচন (ঐচ্ছিক)' : 'Select Supplier (Optional)'}
                        </label>
                        <div className="relative">
                          <select
                            value={supplierId}
                            onChange={(e) => {
                              setSupplierId(e.target.value);
                              const s = suppliers.find(sup => sup.id === e.target.value);
                              if (s) setPaidTo(s.name);
                            }}
                            className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                          >
                            <option value="" className="bg-slate-900 text-slate-300 font-medium py-1">{isBn ? '-- সরাসরি ভেন্ডর / ক্যাশ ক্রয় --' : '-- Direct Vendor / Cash Buy --'}</option>
                            {suppliers.map(s => (
                              <option key={s.id} value={s.id} className="bg-slate-900 text-white font-medium py-1">
                                🏭 {s.name} (বকেয়া: ৳{s.currentDue.toLocaleString()})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'RECEIVE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isBn ? 'টাকা প্রাপ্তির উৎস' : 'Source Type'} *
                      </label>
                      <div className="relative">
                        <select
                          value={sourceType}
                          onChange={(e) => setSourceType(e.target.value as SourceType)}
                          className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                        >
                          <option value="Japan City Tower" className="bg-slate-900 text-white font-medium py-1">Japan City Tower (জাপান সিটি টাওয়ার)</option>
                          <option value="Share Voucher / Partner" className="bg-slate-900 text-white font-medium py-1">Share Voucher / Partner (শেয়ার ভাউচার / অংশীদার)</option>
                          <option value="Japan Garden City" className="bg-slate-900 text-white font-medium py-1">Japan Garden City</option>
                          <option value="Company Fund" className="bg-slate-900 text-white font-medium py-1">Company Fund</option>
                          <option value="Owner" className="bg-slate-900 text-white font-medium py-1">Owner (S.M. Khalilur Rahman)</option>
                          <option value="Director" className="bg-slate-900 text-white font-medium py-1">Director / Executive</option>
                          <option value="Loan" className="bg-slate-900 text-white font-medium py-1">Loan / Borrowed</option>
                          <option value="Client" className="bg-slate-900 text-white font-medium py-1">Client Booking</option>
                          <option value="Other" className="bg-slate-900 text-white font-medium py-1">Other</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isBn ? 'প্রদানকারীর নাম' : 'Received From'} *
                      </label>
                      <input
                        type="text"
                        value={receivedFrom}
                        onChange={(e) => setReceivedFrom(e.target.value)}
                        placeholder={isBn ? 'যেমন: Hamid Sir / মোঃ হামিদুর রহমান' : 'e.g. Hamid Sir / Director'}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                      />
                    </div>
                  </div>

                  {/* Multi-Project Split Toggle Banner */}
                  <div className="bg-amber-50/80 border border-amber-300/80 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔀</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {isBn ? 'একাধিক প্রজেক্টে টাকা ভাগ করে দেওয়া (Multi-Project Split)' : 'Allocate to Multiple Projects'}
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            {isBn 
                              ? 'একক ব্যাংকে পুরো টাকা ঢুকবে, কিন্তু বিভিন্ন প্রজেক্টে স্বয়ংক্রিয় ভাগ হয়ে যাবে (যেমন: ৮১,০০০ + ৩৫,০০০ = ১,১৬,০০০)' 
                              : 'Credit full sum to bank while allocating portions to distinct project budgets'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isMultiProjectSplit}
                          onChange={(e) => {
                            setIsMultiProjectSplit(e.target.checked);
                            if (e.target.checked && projectSplits.every(s => !s.projectId)) {
                              setProjectSplits([
                                { projectId: projects[0]?.id || '', amount: '' },
                                { projectId: projects[1]?.id || projects[0]?.id || '', amount: '' }
                              ]);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    {/* Multi-Project Split Inputs */}
                    {isMultiProjectSplit && (
                      <div className="space-y-2.5 pt-2 border-t border-amber-200">
                        <div className="text-[11px] font-bold text-amber-900 flex justify-between items-center">
                          <span>{isBn ? 'প্রজেক্ট এবং বরাদ্দের পরিমাণ:' : 'Project & Allocated Amount:'}</span>
                          <span className="font-mono">
                            {isBn ? 'মোট বণ্টন:' : 'Allocated:'} ৳{projectSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0).toLocaleString()} 
                            {amount && ` / ৳${parseFloat(amount || '0').toLocaleString()}`}
                          </span>
                        </div>

                        {projectSplits.map((split, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                            <span className="text-xs font-bold text-slate-500 w-5 text-center">#{index + 1}</span>
                            <div className="flex-1">
                              <select
                                value={split.projectId}
                                onChange={(e) => {
                                  const updated = [...projectSplits];
                                  updated[index].projectId = e.target.value;
                                  setProjectSplits(updated);
                                }}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                              >
                                <option value="">{isBn ? '-- প্রজেক্ট নির্বাচন করুন --' : '-- Select Project --'}</option>
                                {projects.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    🏗️ {p.name}
                                  </option>
                                ))}
                                <option value="company">🏢 {isBn ? 'কোম্পানি হেড অফিস / সাধারণ' : 'Company Head Office'}</option>
                              </select>
                            </div>
                            <div className="w-36 relative">
                              <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">৳</span>
                              <input
                                type="number"
                                value={split.amount}
                                onChange={(e) => {
                                  const updated = [...projectSplits];
                                  updated[index].amount = e.target.value;
                                  setProjectSplits(updated);
                                }}
                                placeholder="0.00"
                                className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-hidden"
                              />
                            </div>
                            {projectSplits.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setProjectSplits(projectSplits.filter((_, i) => i !== index))}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title={isBn ? 'মুছে ফেলুন' : 'Remove'}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-between items-center pt-1">
                          <button
                            type="button"
                            onClick={() => setProjectSplits([...projectSplits, { projectId: '', amount: '' }])}
                            className="text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-200/80 hover:bg-amber-300/80 px-3 py-1 rounded-lg transition cursor-pointer"
                          >
                            + {isBn ? 'আরেকটি প্রজেক্ট যোগ করুন' : 'Add Another Project'}
                          </button>

                          {/* Quick Auto-Fill remaining button */}
                          {amount && parseFloat(amount) > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const currentSum = projectSplits.slice(0, -1).reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                                const remainder = Math.max(0, parseFloat(amount) - currentSum);
                                const updated = [...projectSplits];
                                updated[updated.length - 1].amount = String(remainder);
                                setProjectSplits(updated);
                              }}
                              className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                            >
                              {isBn ? 'অবশিষ্ট টাকা শেষ প্রজেক্টে বসান' : 'Auto-fill remainder'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'CONTRACTOR' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBn ? 'কন্ট্রাক্টর নির্বাচন' : 'Select Contractor'} *
                    </label>
                    <div className="relative">
                      <select
                        value={contractorId}
                        onChange={(e) => setContractorId(e.target.value)}
                        className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                      >
                        {contractors.map(c => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white font-medium py-1">
                            👷 {c.name} ({c.type}) — বাকি: ৳{c.dueAmount.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'MONTHLY_BILL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        {isBn ? 'কোম্পানি খরচের খাত (Expense Head)' : 'Company Expense Name'} *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomMonthlyHeadInput(!isCustomMonthlyHeadInput);
                          if (!isCustomMonthlyHeadInput) setCustomMonthlyHeadText('');
                        }}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        {isCustomMonthlyHeadInput 
                          ? (isBn ? '📋 ড্রপডাউন থেকে সিলেক্ট করুন' : '📋 Pick from Dropdown')
                          : (isBn ? '✏️ নতুন খাত লিখুন (হাতে লিখুন)' : '✏️ Add Custom Head (Type by Hand)')
                        }
                      </button>
                    </div>

                    {!isCustomMonthlyHeadInput ? (
                      <div className="relative">
                        <select
                          value={monthlyExpenseName}
                          onChange={(e) => {
                            if (e.target.value === '__CUSTOM_NEW__') {
                              setIsCustomMonthlyHeadInput(true);
                              setCustomMonthlyHeadText('');
                            } else {
                              setMonthlyExpenseName(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 pr-8 bg-white border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                        >
                          {monthlyExpenseHeads.map((head) => (
                            <option key={head} value={head} className="bg-slate-900 text-white font-medium py-1">
                              {head}
                            </option>
                          ))}
                          <option value="__CUSTOM_NEW__" className="bg-amber-700 text-white font-bold py-1">
                            {isBn ? '✏️ অন্যান্য... (হাতে লিখুন)' : '✏️ Other... (Type Custom Head)'}
                          </option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customMonthlyHeadText}
                            onChange={(e) => setCustomMonthlyHeadText(e.target.value)}
                            placeholder={isBn ? 'যেমন: পানির বিল, নাইট গার্ড বেতন, ড্রাইভার সার্ভিস খরচ...' : 'e.g., Water Bill, Night Guard Salary...'}
                            className="flex-1 px-3 py-2 bg-white border-2 border-amber-500 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-amber-500/20"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleSaveCustomMonthlyHeadInline}
                            disabled={!customMonthlyHeadText.trim()}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
                          >
                            {isBn ? 'যোগ করুন' : 'Add to List'}
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium">
                          {isBn ? '💡 এখানে লিখে সেভ করলে এই নতুন খাতটি ভবিষ্যতে ড্রপডাউন লিস্টেও সেভ হয়ে থাকবে।' : '💡 Typing a custom head will permanently add it to the dropdown options.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700">
                        {isBn ? 'বিলিং মাস ও বছর (Bill Month)' : 'Billing Month & Year'} *
                      </label>
                      
                      {/* Quick preset buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setMonthlyMonth(now.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition cursor-pointer"
                        >
                          {isBn ? 'চলতি মাস' : 'Current Month'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const prev = new Date();
                            prev.setMonth(prev.getMonth() - 1);
                            setMonthlyMonth(prev.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition cursor-pointer"
                        >
                          {isBn ? 'গত মাস' : 'Last Month'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Month dropdown */}
                      <select
                        onChange={(e) => {
                          const mName = e.target.value;
                          if (!mName) return;
                          const matchYear = monthlyMonth.match(/\d{4}/);
                          const yr = matchYear ? matchYear[0] : '2026';
                          setMonthlyMonth(`${mName} ${yr}`);
                        }}
                        className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>{isBn ? '📅 মাস নির্বাচন করুন...' : '📅 Select Month...'}</option>
                        <option value="January">{isBn ? 'জানুয়ারি (January)' : 'January'}</option>
                        <option value="February">{isBn ? 'ফেব্রুয়ারি (February)' : 'February'}</option>
                        <option value="March">{isBn ? 'মার্চ (March)' : 'March'}</option>
                        <option value="April">{isBn ? 'এপ্রিল (April)' : 'April'}</option>
                        <option value="May">{isBn ? 'মে (May)' : 'May'}</option>
                        <option value="June">{isBn ? 'জুন (June)' : 'June'}</option>
                        <option value="July">{isBn ? 'জুলাই (July)' : 'July'}</option>
                        <option value="August">{isBn ? 'আগস্ট (August)' : 'August'}</option>
                        <option value="September">{isBn ? 'সেপ্টেম্বর (September)' : 'September'}</option>
                        <option value="October">{isBn ? 'অক্টোবর (October)' : 'October'}</option>
                        <option value="November">{isBn ? 'নভেম্বর (November)' : 'November'}</option>
                        <option value="December">{isBn ? 'ডিসেম্বর (December)' : 'December'}</option>
                      </select>

                      {/* Year dropdown */}
                      <select
                        onChange={(e) => {
                          const yr = e.target.value;
                          if (!yr) return;
                          const matchMonth = monthlyMonth.replace(/\d{4}/, '').trim();
                          const mName = matchMonth || 'September';
                          setMonthlyMonth(`${mName} ${yr}`);
                        }}
                        className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>{isBn ? '📆 বছর নির্বাচন...' : '📆 Select Year...'}</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                      </select>

                      {/* Explicit Text Input */}
                      <input
                        type="text"
                        value={monthlyMonth}
                        onChange={(e) => setMonthlyMonth(e.target.value)}
                        placeholder="e.g. September 2026"
                        className="px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                        title={isBn ? 'সরাসরি মাসের নাম লিখুন বা ড্রপডাউন ব্যবহার করুন' : 'Type custom month or use dropdown'}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {isBn ? '💡 উপরের তারিখ পরিবর্তনের সাথে সাথে বিলের মাস স্বয়ংক্রিয় সেট হয় অথবা ড্রপডাউন থেকে পরিবর্তন করুন।' : '💡 Auto-updates with the date above, or choose directly from the dropdowns.'}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'LOAN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBn ? 'ঋণদাতার নাম' : 'Lender Name'} *
                    </label>
                    <input
                      type="text"
                      value={lenderName}
                      onChange={(e) => setLenderName(e.target.value)}
                      placeholder="e.g. Dr. Kayer Islam"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBn ? 'ঋণের উদ্দেশ্য' : 'Purpose'}
                    </label>
                    <input
                      type="text"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      placeholder={isBn ? 'যেমন: রড ও সিমেন্ট ক্রয়ের জন্য' : 'e.g. Procurement support'}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'TRANSFER' && (
                <div className="space-y-4 bg-emerald-50/60 border-2 border-emerald-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-900">
                        {isBn ? 'ব্যাংক ⇄ ক্যাশ তহবিল স্থানান্তর (Contra Entry)' : 'Account to Account Fund Transfer'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      {isBn ? 'স্বয়ংক্রিয় সমন্বয়' : 'Auto Dual Entry'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Source Account (From) */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>{isBn ? 'উৎস একাউন্ট (যেখান থেকে টাকা যাবে)' : 'Source Account (From)'} *</span>
                        <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">Debit (-)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={fromAccountId}
                          onChange={(e) => setFromAccountId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 pr-8 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden cursor-pointer appearance-none transition shadow-xs"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="bg-slate-900 text-white font-medium py-1">
                              {acc.type === 'CASH' ? '💵' : '🏦'} {acc.name} (বর্তমান: ৳{acc.currentBalance.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* Transfer Direction Indicator */}
                    <div className="sm:col-span-2 flex flex-col items-center justify-center pt-2 sm:pt-4">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 mt-1 uppercase tracking-wider">
                        {isBn ? 'স্থানান্তর' : 'Transfer'}
                      </span>
                    </div>

                    {/* Destination Account (To) */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>{isBn ? 'গন্তব্য একাউন্ট (যেখানে টাকা জমা হবে)' : 'Destination Account (To)'} *</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Credit (+)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={toAccountId}
                          onChange={(e) => setToAccountId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 pr-8 bg-white border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden cursor-pointer appearance-none transition shadow-xs"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="bg-slate-900 text-white font-medium py-1">
                              {acc.type === 'CASH' ? '💵' : '🏦'} {acc.name} (বর্তমান: ৳{acc.currentBalance.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 font-medium bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-300/70 leading-relaxed">
                    {isBn
                      ? '💡 ব্যাংক থেকে টাকা তুলে সাইট খরচের জন্য ক্যাশ বক্সে নিতে Source এ Bank এবং Destination এ Cash নির্বাচন করুন। এতে কোনো ভুয়া জমা তৈরি না হয়ে প্রকৃত ব্যালেন্স এবং লেজার নির্ভুল থাকবে।'
                      : '💡 To withdraw funds from the Bank to the site Cash box, select Bank as Source and Cash as Destination. This creates a contra entry maintaining exact cash & bank balances.'}
                  </p>
                </div>
              )}

              {/* Amount & Account */}
              {activeTab === 'TRANSFER' ? (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'স্থানান্তরকৃত টাকার পরিমাণ (টাকা)' : 'Transfer Amount (BDT)'} *
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3 top-2.5 text-emerald-600 font-bold">৳</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      min="1"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBn ? 'টাকার পরিমাণ (টাকা)' : 'Amount (BDT)'} *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold">৳</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        min="1"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                    </label>
                    <div className="relative">
                      <select
                        value={paymentMethod}
                        onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                      >
                        <option value="CASH" className="bg-slate-900 text-white font-medium py-1">{isBn ? '💵 ক্যাশ (Cash in Hand)' : 'Cash'}</option>
                        <option value="BANK" className="bg-slate-900 text-white font-medium py-1">{isBn ? '🏦 ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                        <option value="CHEQUE" className="bg-slate-900 text-white font-medium py-1">{isBn ? '📜 চেক (Cheque)' : 'Cheque'}</option>
                        <option value="MOBILE_BANKING" className="bg-slate-900 text-white font-medium py-1">{isBn ? '📱 মোবাইল ব্যাংকিং (bKash/Nagad)' : 'Mobile Banking'}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBn ? 'টাকা প্রদানের একাউন্ট' : 'Account'} *
                    </label>
                    <div className="relative">
                      <select
                        value={accountId}
                        onChange={(e) => handleAccountChange(e.target.value)}
                        className="w-full px-3 py-2 pr-8 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden cursor-pointer appearance-none transition"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id} className="bg-slate-900 text-white font-medium py-1">
                            💳 {acc.name} (ব্যালেন্স: ৳{acc.currentBalance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Description & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'কাজের বিবরণ / পার্টিকুলার' : 'Particulars / Description'}
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isBn ? 'বিস্তারিত বর্ণনা লিখুন...' : 'Description of goods/work...'}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'রেফারেন্স / বিল / চালান নং' : 'Bill / Challan / Ref No'}
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. Challan #9982, Cheque #0912"
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Bill / Cash Memo Receipt Photo Upload (Optional) */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>{isBn ? 'দোকানের ক্যাশ মেমো / বিলের ছবি বা ভাউচার (ঐচ্ছিক)' : 'Shop Memo / Bill Receipt Photo (Optional)'}</span>
                  </label>
                  {attachmentUrl && (
                    <button
                      type="button"
                      onClick={() => setAttachmentUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ছবি মুছুন' : 'Remove'}</span>
                    </button>
                  )}
                </div>

                {isCompressingImg ? (
                  <div className="flex items-center justify-center p-4 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-800 font-semibold gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>{isBn ? 'ছবি প্রসেস ও কম্প্রেস করা হচ্ছে...' : 'Processing and compressing image...'}</span>
                  </div>
                ) : attachmentUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-200">
                    <img 
                      src={attachmentUrl} 
                      alt="Bill receipt" 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {isBn ? '✅ মেমো / রিসিটের ছবি সফলভাবে যুক্ত হয়েছে' : '✅ Bill photo attached'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isBn ? 'ভাউচারের সাথে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে' : 'Will be saved with voucher'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-amber-100/50 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer text-xs font-bold text-amber-900 transition">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>{isBn ? 'ক্যামেরা দিয়ে ছবি তুলুন' : 'Take Photo (Camera)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-amber-100/50 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer text-xs font-bold text-amber-900 transition">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>{isBn ? 'ফাইল বা গ্যালারি থেকে সিলেক্ট' : 'Upload from File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-100 transition"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeTab === 'EXPENSE' || activeTab === 'CONTRACTOR' || activeTab === 'MONTHLY_BILL'
                      ? (isBn ? 'সংরক্ষণ ও ভাউচার তৈরি করুন' : 'Save & Generate Voucher')
                      : (isBn ? 'সংরক্ষণ করুন' : 'Save Transaction')}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
