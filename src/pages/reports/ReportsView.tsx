/**
 * Comprehensive Reports & Financial Statements Center
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  BarChart3, 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  Users, 
  Truck, 
  Receipt, 
  FileSpreadsheet, 
  Filter, 
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { useTheme } from '../../context/ThemeContext';

type ReportType = 
  | 'DAILY_EXPENSE_SHEET'
  | 'PROJECT_COST_SUMMARY'
  | 'CONTRACTOR_BALANCE'
  | 'SUPPLIER_LEDGER'
  | 'MONTHLY_BILL_REPORT'
  | 'INCOME_EXPENSE_SUMMARY';

export const ReportsView: React.FC = () => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const { 
    expenses, 
    moneyReceived, 
    projects, 
    contractors, 
    suppliers, 
    monthlyBills, 
    accounts = [],
    selectedProjectId = 'ALL',
    settings,
    deleteExpense,
    deleteMonthlyBill
  } = useData();

  const [activeReport, setActiveReport] = useState<ReportType>('DAILY_EXPENSE_SHEET');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId || 'ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL'); // 'ALL' or 'YYYY-MM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeZeroExpenseProjects, setIncludeZeroExpenseProjects] = useState<boolean>(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'EXPENSE' | 'BILL';
    id: string;
    title: string;
    amount: number;
    voucherNumber?: string;
  } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Sync with global header project selector
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const isBn = language === 'bn';

  // Derived available months from expenses
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

  const getMonthYearLabel = (ymStr: string) => {
    if (ymStr === 'ALL') return isBn ? 'সকল মাস ও বছর' : 'All Months & Years';
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

  // KPI Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = expenses
    .filter(e => !e.isDeleted && e.date === todayStr)
    .reduce((s, e) => s + e.amount, 0);

  const totalCashInHand = accounts.reduce((s, a) => s + (a.currentBalance || 0), 0);

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    if (deleteConfirmItem.type === 'EXPENSE') {
      deleteExpense(deleteConfirmItem.id, deleteReason || 'Deleted from Reports');
    } else if (deleteConfirmItem.type === 'BILL') {
      deleteMonthlyBill(deleteConfirmItem.id, deleteReason || 'Deleted from Reports');
    }
    setDeleteConfirmItem(null);
    setDeleteReason('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition print:hidden ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <BarChart3 className="w-6 h-6 text-cyan-500" />
            <span>{isBn ? 'হিসাব ও অডিট রিপোর্ট সেন্টার' : 'Reports & Financial Statements'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'দৈনিক খরচ শিট, প্রকল্পভিত্তিক খরচ বিশ্লেষণ, কন্ট্রাক্টর ও সাপ্লায়ার বকেয়া লেজার' 
              : 'Daily Expense Sheet, Project Costing, Contractor Balances, and Supplier Statements'}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{isBn ? 'রিপোর্ট প্রিন্ট / PDF' : 'Print / Save PDF'}</span>
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setActiveReport('DAILY_EXPENSE_SHEET')}
          className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center border cursor-pointer ${
            activeReport === 'DAILY_EXPENSE_SHEET'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isBn ? 'দৈনিক খরচ শিট' : 'Daily Expenses'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('PROJECT_COST_SUMMARY')}
          className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center border cursor-pointer ${
            activeReport === 'PROJECT_COST_SUMMARY'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isBn ? 'প্রকল্প খরচ সারাংশ' : 'Project Summary'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('CONTRACTOR_BALANCE')}
          className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center border cursor-pointer ${
            activeReport === 'CONTRACTOR_BALANCE'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isBn ? 'কন্ট্রাক্টর ব্যালেন্স' : 'Contractor Dues'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('SUPPLIER_LEDGER')}
          className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center border cursor-pointer ${
            activeReport === 'SUPPLIER_LEDGER'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{isBn ? 'সাপ্লায়ার লেজার' : 'Supplier Ledger'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('MONTHLY_BILL_REPORT')}
          className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center border cursor-pointer ${
            activeReport === 'MONTHLY_BILL_REPORT'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{isBn ? 'মাসিক বিল রিপোর্ট' : 'Monthly Bills'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('INCOME_EXPENSE_SUMMARY')}
          className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center border cursor-pointer ${
            activeReport === 'INCOME_EXPENSE_SUMMARY'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isBn ? 'আয়-ব্যয় বিবরণী' : 'Income vs Expense'}</span>
        </button>
      </div>

      {/* Printable Report Paper Layout */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 font-sans print:shadow-none print:border-none print:p-0">
        
        {/* Printable Company Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            {isBn ? (settings?.companyNameBn || settings?.companyName || 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ') : (settings?.companyName || 'S.M. Khalilur Rahman Properties Ltd.')}
          </h2>
          <p className="text-xs font-semibold text-slate-700">
            {isBn 
              ? (settings?.addressBn || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ') 
              : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
            {settings?.phone && ` • ${isBn ? 'ফোন:' : 'Phone:'} ${settings.phone}`}
            {settings?.email && ` • ${isBn ? 'ইমেইল:' : 'Email:'} ${settings.email}`}
          </p>
          <div className="mt-2 inline-block px-4 py-1 bg-slate-900 text-amber-400 font-bold text-xs rounded-full uppercase tracking-wider">
            {activeReport === 'DAILY_EXPENSE_SHEET' && (isBn ? 'দৈনিক খরচ বিবরণী শিট (Daily Expense Sheet)' : 'Daily Expense Sheet')}
            {activeReport === 'PROJECT_COST_SUMMARY' && (isBn ? 'প্রকল্পভিত্তিক মোট খরচ বিশ্লেষণ (Project Wise Cost Summary)' : 'Project Wise Cost Summary')}
            {activeReport === 'CONTRACTOR_BALANCE' && (isBn ? 'কন্ট্রাক্টর চুক্তি ও বকেয়া বিবরণী (Contractor Balance Sheet)' : 'Contractor Balance Sheet')}
            {activeReport === 'SUPPLIER_LEDGER' && (isBn ? 'সরবরাহকারী ক্রয় ও বকেয়া খতিয়ান (Supplier Purchase Ledger)' : 'Supplier Purchase Ledger')}
            {activeReport === 'MONTHLY_BILL_REPORT' && (isBn ? 'মাসিক কোম্পানি ও স্টাফ খরচ (Monthly Overhead & Staff Bills)' : 'Monthly Overhead & Staff Bills')}
            {activeReport === 'INCOME_EXPENSE_SUMMARY' && (isBn ? 'সার্বিক আয়-ব্যয় তুলনামূলক বিবরণী (Income vs Expenditure Summary)' : 'Income vs Expenditure Summary')}
          </div>
          <div className="text-[11px] text-slate-700 font-mono mt-1">
            Generated on: {formatDisplayDate(new Date().toISOString())}
          </div>
        </div>

        {/* Dynamic Report Content Based on activeReport */}
        {activeReport === 'DAILY_EXPENSE_SHEET' && (() => {
          const validExpenses = expenses.filter(e => {
            if (e.isDeleted) return false;
            if (filterProject !== 'ALL' && e.projectId !== filterProject) return false;
            if (filterMonth !== 'ALL' && e.date && !e.date.startsWith(filterMonth)) return false;
            if (startDate && e.date < startDate) return false;
            if (endDate && e.date > endDate) return false;
            return true;
          });

          const selectedMonthTotal = validExpenses.reduce((s, e) => s + e.amount, 0);

          // Group by Month (YYYY-MM)
          const groupedMap: { [key: string]: typeof validExpenses } = {};
          validExpenses.forEach(e => {
            const ym = e.date ? e.date.substring(0, 7) : 'Other';
            if (!groupedMap[ym]) groupedMap[ym] = [];
            groupedMap[ym].push(e);
          });
          const monthKeys = Object.keys(groupedMap).sort().reverse();

          return (
            <div className="space-y-6">
              
              {/* Controls Bar for Daily Expense Sheet */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  
                  {/* Month Filter */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>{isBn ? 'মাস সিলেক্ট:' : 'Select Month:'}</span>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 outline-none font-bold cursor-pointer text-xs"
                    >
                      <option value="ALL">{isBn ? 'সকল মাস ও বছর' : 'All Months'}</option>
                      {availableMonths.map(ym => (
                        <option key={ym} value={ym}>
                          {getMonthYearLabel(ym)} {ym === availableMonths[0] ? (isBn ? ' (রানিং)' : ' (Current)') : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Filter */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 className="w-4 h-4 text-cyan-600" />
                    <span>{isBn ? 'প্রকল্প:' : 'Project:'}</span>
                    <select
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 outline-none font-bold cursor-pointer text-xs"
                    >
                      <option value="ALL">{isBn ? 'সকল প্রকল্প' : 'All Projects'}</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="text-xs font-bold text-slate-600">
                  {isBn ? 'মোট রেকর্ড:' : 'Total Records:'} <span className="text-slate-900 font-black">{validExpenses.length} টি</span>
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-bold block">{isBn ? 'আজকের মোট খরচ' : "Today's Expense"}</span>
                  <span className="text-base sm:text-lg font-mono font-black text-rose-600 block mt-0.5">
                    ৳{todayExpense.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-bold block">{isBn ? 'নির্বাচিত মাসের খরচ' : 'Month Total Expense'}</span>
                  <span className="text-base sm:text-lg font-mono font-black text-rose-600 block mt-0.5">
                    ৳{selectedMonthTotal.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-bold block">{isBn ? 'হাতে নগদ/ব্যাংক গচ্ছিত' : 'Cash/Bank in Hand'}</span>
                  <span className="text-base sm:text-lg font-mono font-black text-emerald-700 block mt-0.5">
                    ৳{totalCashInHand.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 font-bold block">{isBn ? 'মোট খরচ ভাউচার সংখ্যা' : 'Total Expense Vouchers'}</span>
                  <span className="text-base sm:text-lg font-mono font-black text-blue-700 block mt-0.5">
                    {validExpenses.length} {isBn ? 'টি' : 'entries'}
                  </span>
                </div>
              </div>

              {/* Expense Table Grouped by Month */}
              {monthKeys.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium border border-slate-200 rounded-xl">
                  {isBn ? 'নির্ধারিত ফিল্টারে কোনো খরচ রেকর্ড পাওয়া যায়নি।' : 'No expense records found for selected filters.'}
                </div>
              ) : (
                monthKeys.map(ym => {
                  const monthExpList = groupedMap[ym];
                  const monthTotal = monthExpList.reduce((s, e) => s + e.amount, 0);

                  return (
                    <div key={ym} className="border border-slate-300 rounded-xl overflow-hidden shadow-xs space-y-0">
                      
                      {/* Month Header */}
                      <div className="bg-slate-900 text-amber-400 px-4 py-2 flex items-center justify-between font-bold text-xs">
                        <span>📌 {getMonthYearLabel(ym)} {isBn ? '- দৈনিক খরচ বিবরণী' : 'Daily Expense Sheet'}</span>
                        <span className="font-mono text-white">
                          {isBn ? 'মাসিক মোট:' : 'Month Total:'} ৳{monthTotal.toLocaleString()}
                        </span>
                      </div>

                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2 border-r border-slate-300">Voucher No</th>
                            <th className="p-2 border-r border-slate-300">Date</th>
                            <th className="p-2 border-r border-slate-300">Project</th>
                            <th className="p-2 border-r border-slate-300">Paid To</th>
                            <th className="p-2 border-r border-slate-300">Category & Particulars</th>
                            <th className="p-2 text-right border-r border-slate-300">Amount (BDT)</th>
                            <th className="p-2 text-center print:hidden w-20">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {monthExpList.map((e) => (
                            <tr key={e.id} className="hover:bg-slate-50">
                              <td className="p-2 font-mono font-bold text-slate-800 border-r border-slate-200">{e.voucherNumber}</td>
                              <td className="p-2 whitespace-nowrap border-r border-slate-200">{formatDisplayDate(e.date)}</td>
                              <td className="p-2 border-r border-slate-200">{e.projectName}</td>
                              <td className="p-2 font-semibold border-r border-slate-200">{e.paidTo}</td>
                              <td className="p-2 border-r border-slate-200">
                                <span className="font-semibold text-slate-800">[{e.category}]</span> {e.description}
                              </td>
                              <td className="p-2 text-right font-mono font-bold border-r border-slate-200 text-rose-700">৳{e.amount.toLocaleString()}</td>
                              <td className="p-2 text-center print:hidden">
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmItem({
                                    type: 'EXPENSE',
                                    id: e.id,
                                    title: `${e.paidTo} (${e.category})`,
                                    amount: e.amount,
                                    voucherNumber: e.voucherNumber
                                  })}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-bold inline-flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                                  title={isBn ? 'এই খরচটি মুছে ফেলুন' : 'Delete this expense'}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                          <tr>
                            <td colSpan={5} className="p-2 text-right uppercase">{getMonthYearLabel(ym)} Total Expenditure:</td>
                            <td className="p-2 text-right font-mono font-black text-xs text-rose-800 border-r border-slate-300">
                              ৳{monthTotal.toLocaleString()}
                            </td>
                            <td className="p-2 print:hidden"></td>
                          </tr>
                        </tfoot>
                      </table>

                    </div>
                  );
                })
              )}

              {/* Overall Total Summary Footer */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between font-black text-sm">
                <span>{isBn ? 'সার্বিক সর্বমোট খরচ (Total Expenses in Selection):' : 'Grand Total Expenditure:'}</span>
                <span className="font-mono text-amber-400 text-base">৳{selectedMonthTotal.toLocaleString()}</span>
              </div>

            </div>
          );
        })()}

        {activeReport === 'PROJECT_COST_SUMMARY' && (() => {
          const visibleProjects = projects.filter(p => filterProject === 'ALL' || p.id === filterProject);
          
          const projectsWithRealCosts = visibleProjects.map(p => {
            const projectExpenses = expenses.filter(e => !e.isDeleted && e.projectId === p.id);
            const materialCost = projectExpenses
              .filter(e => e.expenseType === 'MATERIAL' || e.category?.toLowerCase().includes('material') || e.category?.toLowerCase().includes('নির্মাণ'))
              .reduce((s, e) => s + e.amount, 0);
            const labourCost = projectExpenses
              .filter(e => e.expenseType === 'LABOUR' || e.category?.toLowerCase().includes('labour') || e.category?.toLowerCase().includes('লেবার') || e.category?.toLowerCase().includes('শ্রমিক'))
              .reduce((s, e) => s + e.amount, 0);
            const contractorCost = projectExpenses
              .filter(e => e.expenseType === 'CONTRACTOR' || e.category?.toLowerCase().includes('contractor') || e.category?.toLowerCase().includes('কন্ট্রাক্টর'))
              .reduce((s, e) => s + e.amount, 0);
            const totalSpent = projectExpenses.reduce((s, e) => s + e.amount, 0);
            const percent = p.budget > 0 ? Math.min(100, Math.round((totalSpent / p.budget) * 100)) : 0;
            return {
              ...p,
              materialCost,
              labourCost,
              contractorCost,
              totalSpent,
              percent,
              expenseCount: projectExpenses.length,
            };
          });

          // Projects that actually have expenditure records
          const projectsWithExpenses = projectsWithRealCosts.filter(p => p.totalSpent > 0);
          const displayedProjects = includeZeroExpenseProjects ? projectsWithRealCosts : projectsWithExpenses;

          const grandBudget = displayedProjects.reduce((s, p) => s + (p.budget || 0), 0);
          const grandMaterial = displayedProjects.reduce((s, p) => s + p.materialCost, 0);
          const grandLabour = displayedProjects.reduce((s, p) => s + p.labourCost, 0);
          const grandContractor = displayedProjects.reduce((s, p) => s + p.contractorCost, 0);
          const grandTotalSpent = displayedProjects.reduce((s, p) => s + p.totalSpent, 0);
          const grandPercent = grandBudget > 0 ? Math.round((grandTotalSpent / grandBudget) * 100) : 0;

          // If there is zero expenditure across all projects and zero-expense toggle is off
          if (projectsWithExpenses.length === 0 && !includeZeroExpenseProjects) {
            return (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">
                      {isBn ? 'বর্তমানে কোনো প্রকল্পে খরচের এন্ট্রি নেই (মোট খরচ ৳০.০০)' : 'No Project Cost Data (Total Spent: ৳0.00)'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                      {isBn 
                        ? 'সিস্টেমে কোনো ব্যয় বা খরচ এন্ট্রি নেই (সবকিছু শূন্য)। দৈনিক খরচ বা ভাউচার থেকে প্রজেক্টের খরচ যোগ করলে এখানে স্বয়ংক্রিয়ভাবে বিস্তারিত বিশ্লেষণ প্রদর্শিত হবে।'
                        : 'There are currently no recorded expenses in the system (all project expenditures are zero). When expenses or payment vouchers are logged, detailed project cost summaries will appear here automatically.'}
                    </p>
                  </div>

                  {projectsWithRealCosts.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIncludeZeroExpenseProjects(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <span>{isBn ? 'শূন্য ব্যয়ের প্রকল্প বাজেট তালিকা দেখতে ক্লিক করুন' : 'Click to inspect project budget list with zero expense'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden pb-1">
                <span className="text-xs text-slate-600 font-medium">
                  {isBn 
                    ? `ব্যয় থাকা সক্রিয় প্রকল্প: ${projectsWithExpenses.length} টি (প্রদর্শন: ${displayedProjects.length} টি)`
                    : `Active projects with costs: ${projectsWithExpenses.length} (showing ${displayedProjects.length})`}
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition">
                  <input 
                    type="checkbox"
                    checked={includeZeroExpenseProjects}
                    onChange={(e) => setIncludeZeroExpenseProjects(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-medium">{isBn ? 'শূন্য ব্যয়ের প্রকল্পও তালিকায় অন্তর্ভুক্ত করুন' : 'Include zero-expense projects'}</span>
                </label>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-r border-slate-300">{isBn ? 'কোড' : 'Code'}</th>
                    <th className="p-2 border-r border-slate-300">{isBn ? 'প্রকল্পের নাম' : 'Project Name'}</th>
                    <th className="p-2 border-r border-slate-300 text-right">{isBn ? 'বাজেট' : 'Budget'}</th>
                    <th className="p-2 border-r border-slate-300 text-right">{isBn ? 'ম্যাটেরিয়ালস' : 'Materials'}</th>
                    <th className="p-2 border-r border-slate-300 text-right">{isBn ? 'লেবার / মজুরি' : 'Labour'}</th>
                    <th className="p-2 border-r border-slate-300 text-right">{isBn ? 'কন্ট্রাক্টর' : 'Contractors'}</th>
                    <th className="p-2 border-r border-slate-300 text-right">{isBn ? 'সর্বমোট খরচ' : 'Total Spent'}</th>
                    <th className="p-2 text-right">{isBn ? 'ব্যয়িত %' : 'Consumed %'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 font-sans">
                        {isBn ? 'কোনো ব্যয়িত প্রকল্প পাওয়া যায়নি।' : 'No expenditure recorded for any project.'}
                      </td>
                    </tr>
                  ) : (
                    displayedProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold border-r border-slate-200">{p.code}</td>
                        <td className="p-2 font-bold border-r border-slate-200">
                          {p.name}
                          <span className="block text-[10px] font-normal text-slate-500">
                            {isBn ? `বাস্তব খরচ এন্ট্রি: ${p.expenseCount} টি` : `Live Expense Entries: ${p.expenseCount}`}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">৳{p.budget.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">৳{p.materialCost.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">৳{p.labourCost.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">৳{p.contractorCost.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200">৳{p.totalSpent.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${p.percent > 90 ? 'bg-rose-100 text-rose-800' : p.percent > 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {p.percent}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={2} className="p-2 text-right uppercase">{isBn ? 'সর্বমোট (Grand Total):' : 'Grand Total:'}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-300">৳{grandBudget.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-300">৳{grandMaterial.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-300">৳{grandLabour.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-300">৳{grandContractor.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-black text-slate-950 border-r border-slate-300">৳{grandTotalSpent.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-black">{grandPercent}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        {activeReport === 'CONTRACTOR_BALANCE' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">Contractor</th>
                  <th className="p-2 border-r border-slate-300">Trade</th>
                  <th className="p-2 border-r border-slate-300">Project</th>
                  <th className="p-2 border-r border-slate-300 text-right">Contract Value</th>
                  <th className="p-2 border-r border-slate-300 text-right">Paid Amount</th>
                  <th className="p-2 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold border-r border-slate-200">{c.name}</td>
                    <td className="p-2 border-r border-slate-200">{c.type}</td>
                    <td className="p-2 border-r border-slate-200">{c.projectName}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-200">৳{c.contractAmount.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-700 border-r border-slate-200">৳{c.paidAmount.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-black text-rose-700">৳{c.dueAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colSpan={3} className="p-2 uppercase text-right">Totals:</td>
                  <td className="p-2 text-right font-mono">৳{contractors.reduce((s, c) => s + c.contractAmount, 0).toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-emerald-700">৳{contractors.reduce((s, c) => s + c.paidAmount, 0).toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-rose-700">৳{contractors.reduce((s, c) => s + c.dueAmount, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === 'SUPPLIER_LEDGER' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">Supplier Name</th>
                  <th className="p-2 border-r border-slate-300">Item Supplied</th>
                  <th className="p-2 border-r border-slate-300">Phone</th>
                  <th className="p-2 border-r border-slate-300 text-right">Total Purchases</th>
                  <th className="p-2 border-r border-slate-300 text-right">Total Paid</th>
                  <th className="p-2 text-right">Current Payable Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold border-r border-slate-200">{s.name}</td>
                    <td className="p-2 border-r border-slate-200">{s.type}</td>
                    <td className="p-2 border-r border-slate-200">{s.phone}</td>
                    <td className="p-2 text-right font-mono border-r border-slate-200">৳{s.totalPurchase.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-700 border-r border-slate-200">৳{s.totalPaid.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-black text-amber-800">৳{s.currentDue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'MONTHLY_BILL_REPORT' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">Voucher No</th>
                  <th className="p-2 border-r border-slate-300">Month</th>
                  <th className="p-2 border-r border-slate-300">Expense Category</th>
                  <th className="p-2 border-r border-slate-300">Description</th>
                  <th className="p-2 text-right border-r border-slate-300">Amount (BDT)</th>
                  <th className="p-2 text-center print:hidden w-20">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold border-r border-slate-200">{b.voucherNumber}</td>
                    <td className="p-2 font-semibold border-r border-slate-200">{b.month}</td>
                    <td className="p-2 font-bold border-r border-slate-200">{b.expenseName}</td>
                    <td className="p-2 border-r border-slate-200">{b.description}</td>
                    <td className="p-2 text-right font-mono font-bold border-r border-slate-200">৳{b.amount.toLocaleString()}</td>
                    <td className="p-2 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem({
                          type: 'BILL',
                          id: b.id,
                          title: `${b.expenseName} (${b.month})`,
                          amount: b.amount,
                          voucherNumber: b.voucherNumber
                        })}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-bold inline-flex items-center gap-1 transition active:scale-95 shadow-2xs"
                        title={isBn ? 'এই মাসিক বিলটি মুছে ফেলুন' : 'Delete this bill'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colSpan={4} className="p-2 text-right uppercase">Total Monthly Bills:</td>
                  <td className="p-2 text-right font-mono font-black text-sm border-r border-slate-300">
                    ৳{monthlyBills.reduce((s, b) => s + b.amount, 0).toLocaleString()}
                  </td>
                  <td className="p-2 print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === 'INCOME_EXPENSE_SUMMARY' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-emerald-300 bg-emerald-50/50 p-4 rounded-xl">
                <span className="text-xs uppercase font-bold text-emerald-800 block">Total Receipts (Money In)</span>
                <span className="text-xl font-mono font-black text-emerald-700">
                  ৳{moneyReceived.reduce((s, r) => s + r.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="border border-rose-300 bg-rose-50/50 p-4 rounded-xl">
                <span className="text-xs uppercase font-bold text-rose-800 block">Total Payments (Money Out)</span>
                <span className="text-xl font-mono font-black text-rose-700">
                  ৳{expenses.filter(e => !e.isDeleted).reduce((s, e) => s + e.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Official Signatures Row */}
        <div className="grid grid-cols-3 gap-8 pt-16 mt-12 border-t border-slate-300 text-center text-xs text-slate-800">
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold">Prepared By (হিসাবরক্ষক)</div>
            <div className="text-[10px] text-slate-700">Accounts Executive</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold">Checked By (যাচাইকারী)</div>
            <div className="text-[10px] text-slate-700">Audit / Manager</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold">Approved By (অনুমোদনকারী)</div>
            <div className="text-[10px] text-slate-700">Managing Director</div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg">
                {isBn ? 'লেনদেন মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Record Deletion'}
              </h3>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-1">
              {deleteConfirmItem.voucherNumber && (
                <p><span className="font-bold text-slate-700">{isBn ? 'ভাউচার নং:' : 'Voucher No:'}</span> {deleteConfirmItem.voucherNumber}</p>
              )}
              <p><span className="font-bold text-slate-700">{isBn ? 'বিবরণ:' : 'Title:'}</span> {deleteConfirmItem.title}</p>
              <p><span className="font-bold text-slate-700">{isBn ? 'টাকার পরিমাণ:' : 'Amount:'}</span> <span className="font-mono font-black text-rose-700">৳{deleteConfirmItem.amount.toLocaleString()}</span></p>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? 'সতর্কতা: এটি মুছে ফেললে ভাউচার রেজিস্টার, জেনারেল লেজার, ক্যাশ/ব্যাংক ব্যালেন্স এবং সংশ্লিষ্ট খতিয়ান থেকে একসাথেই স্বয়ংক্রিয়ভাবে মুছে যাবে।'
                : 'Warning: Deleting this item will cleanly cascade and remove it from Vouchers, General Ledger, Cash/Bank balance, and related registers simultaneously.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ (ঐচ্ছিক)' : 'Reason for Deletion (Optional)'}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুল এন্ট্রি / দ্বৈত রেকর্ড' : 'e.g. Mistake in entry, duplicate'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => { setDeleteConfirmItem(null); setDeleteReason(''); }}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete Everywhere'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
