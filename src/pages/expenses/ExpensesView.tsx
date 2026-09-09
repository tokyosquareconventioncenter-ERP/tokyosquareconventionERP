/**
 * Expenses Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Trash2, 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  CreditCard, 
  Tag, 
  AlertCircle, 
  X,
  Pencil,
  Camera
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { Expense, ExpenseType, Voucher, PaymentMethod } from '../../types';
import { hasPermission } from '../../utils/permissions';
import { useTheme } from '../../context/ThemeContext';

interface ExpensesViewProps {
  onOpenNewExpense: () => void;
  onSelectVoucher: (v: Voucher) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenNewExpense,
  onSelectVoucher,
}) => {
  const { language } = useLanguage();
  const { expenses, projects, accounts, vouchers, softDeleteExpense, updateExpense, selectedProjectId } = useData();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId || 'ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [deleteModalExpense, setDeleteModalExpense] = useState<Expense | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Sync with global header project selector
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Edit Expense State
  const [editModalExpense, setEditModalExpense] = useState<Expense | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editExpenseType, setEditExpenseType] = useState<ExpenseType>('OTHER');
  const [editCategory, setEditCategory] = useState('');
  const [editPaidTo, setEditPaidTo] = useState('');
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('CASH');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReference, setEditReference] = useState('');

  const openEditModal = (expense: Expense) => {
    setEditModalExpense(expense);
    setEditDate(expense.date);
    setEditProjectId(expense.projectId);
    setEditExpenseType(expense.expenseType);
    setEditCategory(expense.category);
    setEditPaidTo(expense.paidTo);
    setEditAmount(expense.amount);
    setEditPaymentMethod(expense.paymentMethod);
    setEditAccountId(expense.accountId);
    setEditDescription(expense.description);
    setEditReference(expense.reference || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalExpense || typeof editAmount !== 'number' || editAmount <= 0) return;

    updateExpense(editModalExpense.id, {
      date: editDate,
      projectId: editProjectId,
      expenseType: editExpenseType,
      category: editCategory,
      paidTo: editPaidTo,
      amount: editAmount,
      paymentMethod: editPaymentMethod,
      accountId: editAccountId,
      description: editDescription,
      reference: editReference,
    });

    setEditModalExpense(null);
  };

  const isBn = language === 'bn';
  const canDelete = hasPermission(currentUser?.role, 'canDeleteTransactions');

  // Dynamic available months derived from all actual expenses (supports all past & future dates)
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.filter(e => !e.isDeleted).forEach(e => {
      if (e.date) {
        const ym = e.date.substring(0, 7);
        if (ym.length === 7) set.add(ym);
      }
    });
    return Array.from(set).sort().reverse();
  }, [expenses]);

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

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (e.isDeleted) return false;
        if (filterProject !== 'ALL' && e.projectId !== filterProject) return false;
        if (filterType !== 'ALL' && e.expenseType !== filterType) return false;
        if (filterMonth !== 'ALL' && e.date && !e.date.startsWith(filterMonth)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            e.paidTo.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.voucherNumber && e.voucherNumber.toLowerCase().includes(q)) ||
            (e.reference && e.reference.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });
  }, [expenses, filterProject, filterType, filterMonth, searchQuery]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDeleteConfirm = () => {
    if (!deleteModalExpense) return;
    softDeleteExpense(deleteModalExpense.id, deleteReason || 'User requested deletion');
    setDeleteModalExpense(null);
    setDeleteReason('');
  };

  const handleExportCSV = () => {
    const headers = ['Voucher No', 'Date', 'Project', 'Category', 'Paid To', 'Amount (BDT)', 'Payment Method', 'Description', 'Reference'];
    const rows = filteredExpenses.map(e => [
      e.voucherNumber || '',
      e.date,
      e.projectName || '',
      e.category,
      `"${e.paidTo.replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMethod,
      `"${e.description.replace(/"/g, '""')}"`,
      e.reference || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SKRP_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <ArrowDownLeft className="w-6 h-6 text-rose-500" />
            <span>{isBn ? 'দৈনিক খরচ ও খরচের হিসাব' : 'Daily Expenses & Payments'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'কাঁচামাল, লেবার, কন্ট্রাক্টর এবং সাইট খরচের নির্ভুল হিসাব — ক্যাশ পেমেন্ট ভাউচার প্রিন্ট সুবিধা সহ' 
              : 'Detailed site expenditure registry with integrated Cash Payment Voucher generation'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer border ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV Export</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewExpense}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? '+ নতুন খরচ এন্ট্রি' : '+ Record Expense'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? 'ফিল্টারকৃত মোট খরচ' : 'Filtered Total Cost'}
            </span>
            <h3 className="text-xl font-mono font-black text-rose-500 mt-0.5">
              {formatCurrency(totalFilteredAmount, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            ৳
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? 'মোট ভাউচার সংখ্যা' : 'Total Vouchers'}
            </span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {filteredExpenses.length} {isBn ? 'টি' : 'records'}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? 'সর্বশেষ এন্ট্রি তারিখ' : 'Latest Entry Date'}
            </span>
            <h3 className={`text-base font-semibold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {filteredExpenses[0] ? formatDisplayDate(filteredExpenses[0].date) : '-'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        
        {/* Search */}
        <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2 w-full md:w-auto transition ${
          isDark ? 'bg-slate-900/80 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ভাউচার নং (CPV), প্রাপক, খাত বা বিবরণ দিয়ে খুঁজুন...' : 'Search by voucher no, payee, category...'}
            className="w-full bg-transparent placeholder-slate-400 outline-hidden font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Month & Year Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className={`w-4 h-4 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={`border rounded-xl px-3 py-2 outline-hidden font-medium w-full md:w-44 transition ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-900'
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

        {/* Project Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`border rounded-xl px-3 py-2 outline-hidden font-medium w-full md:w-48 transition ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="ALL">{isBn ? 'সকল প্রকল্প ও হেড অফিস' : 'All Projects & Office'}</option>
            <option value="company">{isBn ? '🏢 কোম্পানি হেড অফিস' : '🏢 Company Head Office'}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Type Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tag className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`border rounded-xl px-3 py-2 outline-hidden font-medium w-full md:w-40 transition ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="ALL">{isBn ? 'সকল খরচের খাত' : 'All Categories'}</option>
            <option value="MATERIAL">{isBn ? 'ম্যাটেরিয়াল / কাঁচামাল' : 'Material'}</option>
            <option value="LABOUR">{isBn ? 'লেবার / মজুরি' : 'Labour'}</option>
            <option value="CONTRACTOR">{isBn ? 'কন্ট্রাক্টর' : 'Contractor'}</option>
            <option value="SALARY">{isBn ? 'বেতন' : 'Salary'}</option>
            <option value="CONVEYANCE">{isBn ? 'যাতায়াত' : 'Conveyance'}</option>
            <option value="FOOD">{isBn ? 'খাবার বিল' : 'Food Bill'}</option>
            <option value="ELECTRICITY">{isBn ? 'বিদ্যুৎ' : 'Electricity'}</option>
            <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
          </select>
        </div>

      </div>

      {/* Main Expenses Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xs transition ${
        isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase text-[10px] tracking-wider ${
                isDark ? 'border-slate-700 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}>
                <th className="py-3 px-4">{isBn ? 'ভাউচার নং' : 'Voucher No'}</th>
                <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রকল্প' : 'Project'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রাপক' : 'Paid To'}</th>
                <th className="py-3 px-4">{isBn ? 'খাত ও বিবরণ' : 'Category & Details'}</th>
                <th className="py-3 px-4">{isBn ? 'মাধ্যম' : 'Mode'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                <th className="py-3 px-4 text-center">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm">{isBn ? 'কোনো খরচ পাওয়া যায়নি।' : 'No expenses matching filters.'}</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const linkedVoucher = vouchers.find(v => v.id === expense.voucherId || v.voucherNumber === expense.voucherNumber);
                  return (
                    <tr 
                      key={expense.id}
                      className={`transition group cursor-pointer ${
                        isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => linkedVoucher && onSelectVoucher(linkedVoucher)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-[11px] border ${
                          isDark 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                            : 'text-amber-800 bg-amber-50 border-amber-300'
                        }`}>
                          {expense.voucherNumber || 'CPV-GEN'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatDisplayDate(expense.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold block truncate max-w-[160px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {expense.projectName || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold block ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {expense.paidTo}
                        </span>
                        {expense.reference && (
                          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ref: {expense.reference}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {expense.category}
                          </span>
                          {linkedVoucher?.attachmentUrl && (
                            <button
                              type="button"
                              onClick={() => onSelectVoucher(linkedVoucher)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 transition cursor-pointer"
                              title="দোকানের ক্যাশ মেমোর ছবি দেখতে ক্লিক করুন"
                            >
                              <Camera className="w-3 h-3" />
                              <span>{isBn ? 'মেমো' : 'Memo'}</span>
                            </button>
                          )}
                        </div>
                        <p className={`text-[11px] truncate max-w-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {expense.description}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-mono uppercase text-[10px] px-2 py-0.5 rounded ${
                          isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-mono font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {formatCurrency(expense.amount, isBn ? 'bn' : 'en')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => linkedVoucher && onSelectVoucher(linkedVoucher)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDark 
                                ? 'bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-300' 
                                : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-600 border border-slate-200'
                            }`}
                            title={isBn ? 'ভাউচার প্রিন্ট' : 'Print Voucher'}
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {linkedVoucher?.attachmentUrl && (
                            <button
                              type="button"
                              onClick={() => onSelectVoucher(linkedVoucher)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isDark 
                                  ? 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300' 
                                  : 'bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-700 border border-amber-200'
                              }`}
                              title={isBn ? 'সংযুক্ত ক্যাশ মেমো বা বিলের ছবি দেখুন' : 'View Shop Memo'}
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(expense)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDark 
                                ? 'bg-slate-700/70 hover:bg-blue-600 text-blue-300 hover:text-white' 
                                : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200'
                            }`}
                            title={isBn ? 'খরচ এডিট / সংশোধন' : 'Edit Expense'}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteModalExpense(expense)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isDark 
                                  ? 'bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white' 
                                  : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200'
                              }`}
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {isBn ? 'দৈনিক খরচ সংশোধন / এডিট' : 'Edit Expense Record'}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-mono">
                    {editModalExpense.voucherNumber || 'CPV-GEN'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalExpense(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
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
                    {isBn ? 'প্রকল্প (Project)' : 'Project'} *
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'প্রাপকের নাম (Paid To)' : 'Paid To / Person'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPaidTo}
                    onChange={(e) => setEditPaidTo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                    placeholder="e.g. Rahim Miah"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'খরচের পরিমাণ (৳)' : 'Amount (৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold text-sm outline-hidden"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'খরচের ধরন (Expense Type)' : 'Expense Type'}
                  </label>
                  <select
                    value={editExpenseType}
                    onChange={(e) => setEditExpenseType(e.target.value as ExpenseType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="MATERIAL">{isBn ? 'ম্যাটেরিয়াল / কাঁচামাল' : 'Material'}</option>
                    <option value="LABOUR">{isBn ? 'লেবার / মজুরি' : 'Labour'}</option>
                    <option value="CONTRACTOR">{isBn ? 'কন্ট্রাক্টর' : 'Contractor'}</option>
                    <option value="SALARY">{isBn ? 'বেতন' : 'Salary'}</option>
                    <option value="CONVEYANCE">{isBn ? 'যাতায়াত' : 'Conveyance'}</option>
                    <option value="FOOD">{isBn ? 'খাবার বিল' : 'Food Bill'}</option>
                    <option value="ELECTRICITY">{isBn ? 'বিদ্যুৎ' : 'Electricity'}</option>
                    <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'খাত / ক্যাটাগরি' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                    placeholder="e.g. Cement, Site Food, Rod"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'হিসাব / অ্যাকাউন্ট (Paid From)' : 'Account (Paid From)'} *
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
                    <option value="MOBILE_BANKING">MOBILE BANKING (bKash/Nagad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isBn ? 'রেফারেন্স / বিল নং' : 'Reference / Bill No.'}
                </label>
                <input
                  type="text"
                  value={editReference}
                  onChange={(e) => setEditReference(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                  placeholder="e.g. Memo #445"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isBn ? 'খরচের বিবরণ (Description)' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 outline-hidden font-medium resize-none"
                  placeholder="Details of the expense..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalExpense(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Reason Modal */}
      {deleteModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'লেনদেন মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Expense Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে ভাউচার নং ${deleteModalExpense.voucherNumber} (৳${deleteModalExpense.amount.toLocaleString()}) মুছে ফেলতে চান? এটি ক্যাশ/ব্যাংক ব্যালেন্স সমন্বয় করবে এবং ভাউচার রেজিস্টার, জেনারেল লেজার ও কাঁচামাল খতিয়ান থেকে একসাথেই স্বয়ংক্রিয়ভাবে মুছে যাবে।`
                : `Are you sure you want to delete Voucher ${deleteModalExpense.voucherNumber} (৳${deleteModalExpense.amount.toLocaleString()})? This will restore account balance and cleanly remove the entry from Vouchers, General Ledger, and Materials registers simultaneously.`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ' : 'Reason for Deletion'} *
              </label>
              <input
                type="text"
                required
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুল এন্ট্রি / দ্বৈত রেকর্ড' : 'e.g. Duplicate entry, wrong amount'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalExpense(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete & Reverse'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
