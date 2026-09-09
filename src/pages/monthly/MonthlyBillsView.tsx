/**
 * Monthly Company Expenses & Staff Payroll View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  Printer, 
  FileText, 
  CheckCircle2, 
  DollarSign,
  Coffee,
  Zap,
  Car,
  UserCheck,
  Trash2,
  AlertCircle,
  Pencil,
  X,
  Filter,
  Building2,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { MonthlyBill, Voucher, PaymentMethod } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MonthlyBillsViewProps {
  onOpenNewMonthlyBill: () => void;
  onSelectVoucher: (v: Voucher) => void;
}

export const MonthlyBillsView: React.FC<MonthlyBillsViewProps> = ({
  onOpenNewMonthlyBill,
  onSelectVoucher,
}) => {
  const { language } = useLanguage();
  const { monthlyBills, vouchers, accounts, projects, selectedProjectId, setSelectedProjectId, updateMonthlyBill, deleteMonthlyBill } = useData();
  const { isDark } = useTheme();

  const isBn = language === 'bn';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(selectedProjectId || 'ALL');

  const [deleteModalBill, setDeleteModalBill] = useState<MonthlyBill | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Edit Monthly Bill State
  const [editModalBill, setEditModalBill] = useState<MonthlyBill | null>(null);
  const [editExpenseName, setEditExpenseName] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editDescription, setEditDescription] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('CASH');
  const [editAccountId, setEditAccountId] = useState('');
  const [editProjectId, setEditProjectId] = useState('company');
  const [editDate, setEditDate] = useState('');

  // Collect distinct months from actual data + current and neighboring months
  const existingMonths = Array.from(new Set(monthlyBills.map(b => b.month.trim()).filter(Boolean)));
  const defaultMonthsList = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 
    'May 2026', 'June 2026', 'July 2026', 'August 2026', 
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];
  const allAvailableMonths = Array.from(new Set([...existingMonths, ...defaultMonthsList]));

  const openEditModal = (bill: MonthlyBill) => {
    setEditModalBill(bill);
    setEditExpenseName(bill.expenseName);
    setEditMonth(bill.month);
    setEditAmount(bill.amount);
    setEditDescription(bill.description);
    setEditPaymentMethod(bill.paymentMethod);
    setEditAccountId(bill.accountId || accounts[0]?.id || '');
    setEditProjectId(bill.projectId || 'company');
    setEditDate(bill.date ? bill.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBill || typeof editAmount !== 'number' || editAmount <= 0) return;

    const matchedProject = projects.find(p => p.id === editProjectId);
    const projectName = editProjectId === 'company' 
      ? (isBn ? 'কোম্পানি হেড অফিস' : 'Company Head Office') 
      : (matchedProject?.name || 'সাধারণ');

    updateMonthlyBill(editModalBill.id, {
      expenseName: editExpenseName,
      month: editMonth,
      amount: editAmount,
      description: editDescription,
      paymentMethod: editPaymentMethod,
      accountId: editAccountId,
      projectId: editProjectId,
      projectName,
      date: editDate,
    });

    setEditModalBill(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalBill) return;
    deleteMonthlyBill(deleteModalBill.id, deleteReason || 'User requested deletion');
    setDeleteModalBill(null);
    setDeleteReason('');
  };

  // Filter logic: Month, Project, Search
  const filtered = monthlyBills.filter(b => {
    // Project filter
    if (selectedProjectFilter !== 'ALL') {
      if (selectedProjectFilter === 'company') {
        if (b.projectId && b.projectId !== 'company') return false;
      } else {
        if (b.projectId !== selectedProjectFilter) return false;
      }
    }

    // Month filter
    if (selectedMonthFilter !== 'ALL') {
      if (b.month.toLowerCase().trim() !== selectedMonthFilter.toLowerCase().trim()) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.expenseName.toLowerCase().includes(q);
      const matchMonth = b.month.toLowerCase().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchProj = (b.projectName || '').toLowerCase().includes(q);
      const matchVoucher = (b.voucherNumber || '').toLowerCase().includes(q);
      if (!matchName && !matchMonth && !matchDesc && !matchProj && !matchVoucher) return false;
    }

    return true;
  });

  const totalMonthlyBills = filtered.reduce((sum, b) => sum + b.amount, 0);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('salary')) return <UserCheck className="w-4 h-4 text-emerald-400" />;
    if (lower.includes('conveyance')) return <Car className="w-4 h-4 text-amber-400" />;
    if (lower.includes('food')) return <Coffee className="w-4 h-4 text-orange-400" />;
    if (lower.includes('electricity') || lower.includes('desco')) return <Zap className="w-4 h-4 text-yellow-400" />;
    return <Receipt className="w-4 h-4 text-blue-400" />;
  };

  const resetFilters = () => {
    setSelectedMonthFilter('ALL');
    setSelectedProjectFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <Receipt className="w-6 h-6 text-orange-500" />
            <span>{isBn ? 'কোম্পানি মাসিক বিল ও স্টাফ খরচ' : 'Monthly Company Bills & Staff Payroll'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'MD. eleyes, Tutul, ফুড বিল, সাইট বিদ্যুৎ বিল, সকল প্রজেক্ট ও অফিস রক্ষণাবেক্ষণ খরচ' 
              : 'MD. eleyes, Tutul, Food Bill, Site Electricity, all project staff & operational expenses'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewMonthlyBill}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isBn ? '+ নতুন মাসিক বিল এন্ট্রি' : '+ Record Monthly Bill'}</span>
        </button>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className={`border rounded-2xl p-4 shadow-xs transition ${
        isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'খাতের নাম, স্টাফ, বিবরণ বা ভাউচার খুঁজুন...' : 'Search expense head, staff, description...'}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-hidden transition ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 focus:border-orange-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Project Filter */}
            <div className="flex items-center gap-1.5">
              <Building2 className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border outline-hidden cursor-pointer transition ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-orange-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-orange-500'
                }`}
              >
                <option value="ALL">{isBn ? '🌐 সকল প্রকল্প ও হেড অফিস' : '🌐 All Projects & Office'}</option>
                <option value="company">{isBn ? '🏢 কোম্পানি হেড অফিস' : '🏢 Company Head Office'}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>🏗️ {p.name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Month Filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border outline-hidden cursor-pointer transition ${
                  selectedMonthFilter !== 'ALL'
                    ? (isDark ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-orange-50 border-orange-300 text-orange-800')
                    : (isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900')
                }`}
              >
                <option value="ALL">{isBn ? '📅 সকল মাস (All Months)' : '📅 All Months'}</option>
                {allAvailableMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(selectedMonthFilter !== 'ALL' || selectedProjectFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  isDark 
                    ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700' 
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBn ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total filtered monthly bills */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedMonthFilter === 'ALL' 
                ? (isBn ? 'মোট মাসিক খরচ (সর্বমোট)' : 'Total Monthly Expenses (All)') 
                : (isBn ? `${selectedMonthFilter}-এর খরচ` : `Expenses for ${selectedMonthFilter}`)}
            </span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              {formatCurrency(totalMonthlyBills, isBn ? 'bn' : 'en')}
            </h3>
            <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filtered.length} {isBn ? 'টি বিল এন্ট্রি' : 'bill entries'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700'
          }`}>
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Interactive Active Month Selector */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex-1 pr-2">
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? 'সক্রিয় ফিল্টারকৃত মাস' : 'Active Billing Month'}
            </span>
            <div className="mt-1">
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className={`w-full text-sm font-bold rounded-lg px-2 py-1 border outline-hidden cursor-pointer transition ${
                  selectedMonthFilter !== 'ALL'
                    ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-50 text-amber-900 border-amber-300')
                    : (isDark ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200')
                }`}
              >
                <option value="ALL">{isBn ? '🌐 সকল মাস একত্রে (All Months)' : '🌐 All Months Combined'}</option>
                {allAvailableMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? '💡 ড্রপডাউন থেকে যেকোনো মাস বেছে নিন' : '💡 Select any month from the list'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}>
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Project & Voucher Linkage */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBn ? 'প্রকল্প ফিল্টার ও স্ট্যাটাস' : 'Project Scope'}
            </span>
            <h3 className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {selectedProjectFilter === 'ALL'
                ? (isBn ? '🌐 সকল প্রজেক্ট ও হেড অফিস' : 'All Projects & Office')
                : (selectedProjectFilter === 'company'
                    ? (isBn ? '🏢 কোম্পানি হেড অফিস' : 'Company Head Office')
                    : `🏗️ ${projects.find(p => p.id === selectedProjectFilter)?.name || ''}`)}
            </h3>
            <span className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'লেজার ও ভাউচার সমন্বিত' : 'Synced with Ledger'}</span>
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Table */}
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
                <th className="py-3 px-4">{isBn ? 'তারিখ ও মাস' : 'Date & Month'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রকল্প / হেড' : 'Project / Head'}</th>
                <th className="py-3 px-4">{isBn ? 'খরচের খাত / নাম' : 'Bill / Expense Head'}</th>
                <th className="py-3 px-4">{isBn ? 'বিবরণ' : 'Description'}</th>
                <th className="py-3 px-4">{isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Mode'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                <th className="py-3 px-4 text-center">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    {isBn ? 'কোনো মাসিক বিল পাওয়া যায়নি।' : 'No monthly bills found for this filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((bill) => {
                  const linkedVoucher = vouchers.find(v => v.id === bill.voucherId || v.voucherNumber === bill.voucherNumber);
                  const isHeadOffice = bill.projectId === 'company' || !bill.projectId;
                  const displayProjectName = isHeadOffice
                    ? (isBn ? 'কোম্পানি হেড অফিস' : 'Company Head Office')
                    : (bill.projectName || projects.find(p => p.id === bill.projectId)?.name || 'প্রকল্প');

                  return (
                    <tr 
                      key={bill.id}
                      className={`transition cursor-pointer ${
                        isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => linkedVoucher && onSelectVoucher(linkedVoucher)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-[11px] ${
                          isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-700 bg-amber-50 border border-amber-200'
                        }`}>
                          {bill.voucherNumber || 'CPV-BILL'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {bill.month}
                        </span>
                        {bill.date && (
                          <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatDisplayDate(bill.date)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isHeadOffice
                            ? (isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200')
                            : (isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-800 border border-amber-200')
                        }`}>
                          {isHeadOffice ? '🏢' : '🏗️'} {displayProjectName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(bill.expenseName)}
                          <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{bill.expenseName}</span>
                        </div>
                      </td>

                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {bill.description}
                      </td>

                      <td className={`py-3.5 px-4 uppercase text-[10px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {bill.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-mono font-black text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                          {formatCurrency(bill.amount, isBn ? 'bn' : 'en')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (linkedVoucher) onSelectVoucher(linkedVoucher);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition text-xs shadow-xs cursor-pointer"
                            title={isBn ? 'ভাউচার প্রিন্ট' : 'Print Voucher'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(bill);
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDark 
                                ? 'bg-slate-700/80 hover:bg-blue-600 text-blue-300 hover:text-white' 
                                : 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200'
                            }`}
                            title={isBn ? 'মাসিক বিল সংশোধন / এডিট' : 'Edit Monthly Bill'}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModalBill(bill);
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDark 
                                ? 'bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white' 
                                : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200'
                            }`}
                            title={isBn ? 'মাসিক বিল বা বেতন এন্ট্রি মুছে ফেলুন' : 'Delete Monthly Bill'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Edit Monthly Bill Modal */}
      {editModalBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-orange-600" />
                <span>{isBn ? 'কোম্পানি মাসিক বিল ও স্টাফ খরচ সংশোধন' : 'Edit Monthly Bill / Expense'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditModalBill(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              
              {/* Project Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'প্রকল্প বা হেড অফিস নির্বাচন করুন *' : 'Select Project or Head Office *'}
                </label>
                <select
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-hidden focus:border-orange-600"
                >
                  <option value="company">🏢 {isBn ? 'কোম্পানি হেড অফিস / সাধারণ' : 'Company Head Office / General'}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>🏗️ {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Expense Head */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'খরচের খাত বা স্টাফের নাম *' : 'Expense Head / Staff Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editExpenseName}
                  onChange={(e) => setEditExpenseName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-orange-600"
                />
              </div>

              {/* Date & Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'তারিখ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => {
                      const newD = e.target.value;
                      setEditDate(newD);
                      if (newD) {
                        try {
                          const parsed = new Date(newD);
                          if (!isNaN(parsed.getTime())) {
                            setEditMonth(parsed.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
                          }
                        } catch {}
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-orange-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'মাস / বিলিং পিরিয়ড *' : 'Billing Month *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editMonth}
                    onChange={(e) => setEditMonth(e.target.value)}
                    placeholder="e.g. September 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-orange-600"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'টাকার পরিমাণ (৳) *' : 'Amount (Tk) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-orange-600 focus:outline-hidden focus:border-orange-600"
                />
              </div>

              {/* Payment Mode & Account */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Mode'}
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-orange-600"
                  >
                    <option value="CASH">{isBn ? 'ক্যাশ' : 'Cash'}</option>
                    <option value="BANK_CHEQUE">{isBn ? 'ব্যাংক চেক' : 'Bank Cheque'}</option>
                    <option value="BANK_TRANSFER">{isBn ? 'অনলাইন ট্রান্সফার' : 'Bank Transfer'}</option>
                    <option value="BKASH">{isBn ? 'বিকাশ / নগদ' : 'bKash / Nagad'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'যে অ্যাকাউন্ট থেকে দেওয়া হয়েছে' : 'Payment Account'}
                  </label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-orange-600"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (৳{acc.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'বিবরণ / নোট' : 'Description / Remarks'}
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-orange-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalBill(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'মাসিক বিল / বেতন এন্ট্রি মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Bill Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে "${deleteModalBill.expenseName}" (৳${deleteModalBill.amount.toLocaleString()}) বিল এন্ট্রিটি মুছে ফেলতে চান? এটি সংশ্লিষ্ট ডেবিট ভাউচার এবং ক্যাশ লেজার থেকেও রিভার্স করা হবে।`
                : `Are you sure you want to delete monthly bill "${deleteModalBill.expenseName}" (৳${deleteModalBill.amount.toLocaleString()})?`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ' : 'Reason for Deletion'}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুল অংকে বিল এন্ট্রি করা হয়েছিল' : 'e.g. Incorrect entry'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalBill(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
