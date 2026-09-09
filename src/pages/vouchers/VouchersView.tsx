/**
 * Cash Payment Voucher (CPV) Register View & Master Report Print
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  FileText, 
  Search, 
  Printer, 
  Eye, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Download,
  Filter,
  Trash2,
  AlertCircle,
  X,
  Receipt,
  Pencil
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { Voucher } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface VouchersViewProps {
  onSelectVoucher: (v: Voucher) => void;
}

export const VouchersView: React.FC<VouchersViewProps> = ({ onSelectVoucher }) => {
  const { language } = useLanguage();
  const { vouchers, projects, selectedProjectId, deleteVoucher, updateVoucher, settings } = useData();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId || 'ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [deleteModalVoucher, setDeleteModalVoucher] = useState<Voucher | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isRegisterPrintModalOpen, setIsRegisterPrintModalOpen] = useState(false);

  // Sync with global header project selector
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Edit Voucher State
  const [editModalVoucher, setEditModalVoucher] = useState<Voucher | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editPaidTo, setEditPaidTo] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<any>('CASH');
  const [editDescription, setEditDescription] = useState('');
  const [editReference, setEditReference] = useState('');

  const isBn = language === 'bn';

  const openEditModal = (v: Voucher) => {
    setEditModalVoucher(v);
    setEditDate(v.date);
    setEditProjectId(v.projectId || '');
    setEditPaidTo(v.paidTo);
    setEditCategory(v.category);
    setEditAmount(v.amount);
    setEditPaymentMethod(v.paymentMethod || 'CASH');
    setEditDescription(v.description);
    setEditReference(v.reference || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalVoucher || typeof editAmount !== 'number' || editAmount <= 0) return;

    updateVoucher(editModalVoucher.id, {
      date: editDate,
      projectId: editProjectId || undefined,
      paidTo: editPaidTo,
      category: editCategory,
      amount: editAmount,
      paymentMethod: editPaymentMethod,
      description: editDescription,
      reference: editReference,
    });

    setEditModalVoucher(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalVoucher) return;
    deleteVoucher(deleteModalVoucher.id, deleteReason || 'User requested deletion');
    setDeleteModalVoucher(null);
    setDeleteReason('');
  };

  // Dynamic available months derived from actual vouchers (supports all past & future dates)
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    vouchers.forEach((v) => {
      if (v.date) {
        const ym = v.date.substring(0, 7);
        if (ym.length === 7) set.add(ym);
      }
    });
    return Array.from(set).sort().reverse();
  }, [vouchers]);

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
    return vouchers
      .filter((v) => {
        if (filterProject !== 'ALL' && v.projectId !== filterProject) return false;
        if (filterMonth !== 'ALL' && v.date && !v.date.startsWith(filterMonth)) return false;
        if (filterType !== 'ALL') {
          if (filterType === 'RECEIPT' && v.transactionType !== 'MONEY_RECEIVED' && !v.voucherNumber.startsWith('MR-')) return false;
          if (filterType === 'EXPENSE' && (v.transactionType === 'MONEY_RECEIVED' || v.voucherNumber.startsWith('MR-'))) return false;
          if (filterType === 'MONTHLY' && v.transactionType !== 'MONTHLY_BILL') return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            v.voucherNumber.toLowerCase().includes(q) ||
            v.paidTo.toLowerCase().includes(q) ||
            v.description.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q) ||
            (v.projectName && v.projectName.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });
  }, [vouchers, filterProject, filterMonth, filterType, searchQuery]);

  const totalAmount = filtered.reduce((sum, v) => sum + v.amount, 0);

  const selectedProjectObj = projects.find(p => p.id === filterProject);
  const selectedProjectName = filterProject === 'ALL' 
    ? (isBn ? 'সকল প্রকল্প (All Projects)' : 'All Projects') 
    : (selectedProjectObj?.name || filterProject);

  // Format clean prepared by name to prevent company/super admin account name appearing
  const cleanPreparedBy = (name?: string) => {
    if (!name) return 'MD. Tanveen Ahmed';
    if (
      name.toLowerCase().includes('tokyo square') || 
      name.toLowerCase().includes('super admin') ||
      name.toLowerCase().includes('eleyes') ||
      name.toLowerCase().includes('ilyas')
    ) {
      return 'MD. Tanveen Ahmed';
    }
    return name;
  };

  return (
    <div className="space-y-6">
      
      {/* Main Vouchers Page - Hidden during print if Register Print Modal is Open */}
      <div className={isRegisterPrintModalOpen ? 'print:hidden space-y-6' : 'space-y-6'}>
      
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <FileText className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{isBn ? 'ভাউচার ও রশিদ রেজিস্টার' : 'Voucher & Receipt Register'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'সকল সিস্টেম এন্ট্রি ভাউচার, টাকা প্রাপ্তির রশিদ ও মাসিক ব্যয়ের পূর্ণাঙ্গ রেজিস্টার এবং অফিসিয়াল প্রিন্ট রিপোর্ট' 
              : 'Master registry of all generated Cash Payment Vouchers, Money Receipts, and printable statements'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsRegisterPrintModalOpen(true)}
            id="print-register-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? '🖨️ ভাউচার রেজিস্টার প্রিন্ট' : '🖨️ Print Register Statement'}</span>
          </button>

          <span className={`px-3 py-2 rounded-xl font-mono font-bold text-xs border ${
            isDark ? 'bg-slate-900 text-amber-300 border-slate-700' : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            {isBn ? `মোট: ${filtered.length} টি (${formatCurrency(totalAmount, 'bn')})` : `Total: ${filtered.length} (${formatCurrency(totalAmount, 'en')})`}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs transition ${
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
            placeholder={isBn ? 'ভাউচার নং (যেমন CPV-2026-000125 / MR-2026), প্রাপক বা খাত দিয়ে খুঁজুন...' : 'Search by voucher no, payee, head...'}
            className="w-full bg-transparent placeholder-slate-400 outline-hidden font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Month & Year Filter */}
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 transition ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Calendar className={`w-4 h-4 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={`bg-transparent outline-hidden font-medium text-xs cursor-pointer ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <option value="ALL" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{isBn ? '🗓️ সকল মাস ও বছর' : '🗓️ All Months & Years'}</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 transition ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className={`bg-transparent outline-hidden font-medium text-xs cursor-pointer ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <option value="ALL" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{isBn ? 'সকল প্রকল্প' : 'All Projects'}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 transition ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Filter className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`bg-transparent outline-hidden font-medium text-xs cursor-pointer ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <option value="ALL" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{isBn ? 'সকল প্রকার' : 'All Types'}</option>
              <option value="EXPENSE" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{isBn ? 'ক্যাশ পেমেন্ট / খরচ' : 'Expense / Payment'}</option>
              <option value="RECEIPT" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{isBn ? 'টাকা প্রাপ্তির রশিদ' : 'Money Received'}</option>
              <option value="MONTHLY" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{isBn ? 'মাসিক বিল ও বেতন' : 'Monthly Bills'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xs transition ${
        isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase text-[10px] tracking-wider ${
                isDark ? 'border-slate-700 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}>
                <th className="py-3 px-4">{isBn ? 'ভাউচার / রশিদ নং' : 'Voucher / Receipt No'}</th>
                <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রকল্প' : 'Project'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রাপক / প্রদানকারী' : 'Paid To / From'}</th>
                <th className="py-3 px-4">{isBn ? 'খাত ও বিবরণ' : 'Head & Description'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রস্তুতকারী' : 'Prepared By'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                <th className="py-3 px-4 text-center">{isBn ? 'প্রিন্ট ও অ্যাকশন' : 'Print / Action'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {isBn ? 'কোন ভাউচার পাওয়া যায়নি।' : 'No vouchers found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((voucher) => {
                  const isRec = voucher.transactionType === 'MONEY_RECEIVED' || voucher.voucherNumber.startsWith('MR-');
                  return (
                    <tr 
                      key={voucher.id} 
                      className={`transition cursor-pointer ${
                        isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => onSelectVoucher(voucher)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-[11px] border ${
                          isRec 
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {voucher.voucherNumber}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatDisplayDate(voucher.date, isBn ? 'bn' : 'en')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold block truncate max-w-[150px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {voucher.projectName || 'General Fund'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {voucher.paidTo}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {voucher.category}
                        </span>
                        <p className={`text-[11px] truncate max-w-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {voucher.description}
                        </p>
                      </td>
                      <td className={`py-3.5 px-4 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {cleanPreparedBy(voucher.preparedBy)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-mono font-black text-sm ${
                          isRec 
                            ? 'text-emerald-500' 
                            : isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {formatCurrency(voucher.amount, isBn ? 'bn' : 'en')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectVoucher(voucher)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition text-xs shadow-xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isBn ? 'রশিদ / প্রিন্ট' : 'Print'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(voucher)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isDark 
                                ? 'bg-slate-700/80 hover:bg-blue-600 text-blue-300 hover:text-white' 
                                : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200'
                            }`}
                            title={isBn ? 'ভাউচার এডিট / সংশোধন' : 'Edit Voucher'}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModalVoucher(voucher)}
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                            title={isBn ? 'ভাউচার মুছে ফেলুন' : 'Delete Voucher'}
                          >
                            <Trash2 className="w-4 h-4" />
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

      </div> {/* End of Main Vouchers Page Wrapper */}

      {/* Full Voucher Register Statement Print Modal */}
      {isRegisterPrintModalOpen && (
        <div 
          id="voucher-register-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block printable-modal"
        >
          <div className="bg-white text-slate-950 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none print:overflow-visible print:block">
            
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {isBn ? 'ভাউচার রেজিস্টার স্টেটমেন্ট প্রিন্ট প্রিভিউ' : 'Voucher Register Statement Preview'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print Statement'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterPrintModalOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Body */}
            <div className="p-6 sm:p-8 overflow-y-auto print:p-4 text-slate-950">
              
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
                  {isBn ? (settings?.companyNameBn || 'এস. এম. খলিলুর রহমান প্রপার্টিজ লিঃ') : (settings?.companyName || 'S.M. KHALILUR RAHMAN PROPERTIES LTD.')}
                </h1>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {isBn ? (settings?.addressBn || 'প্লট ১৪, জাপান গার্ডেন সিটি রোড, মোহাম্মদপুর, ঢাকা-১২০৭') : (settings?.address || 'Plot 14, Japan Garden City Road, Mohammadpur, Dhaka-1207')}
                </p>
                <p className="text-[11px] text-slate-600">
                  Phone: {settings?.phone || '01819-216503, 01711-536979'} | Email: {settings?.email || 'contact@skrpproperties.com'}
                </p>
                
                <div className="inline-block mt-3 px-5 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-black tracking-wider uppercase rounded-md">
                  {isBn ? 'ক্যাশ পেমেন্ট ও ভাউচার রেজিস্টার রিপোর্ট' : 'MASTER VOUCHER & PAYMENT REGISTER REPORT'}
                </div>
              </div>

              {/* Statement Summary Info */}
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
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'মোট ভাউচার সংখ্যা:' : 'Total Vouchers:'}</span>
                  <span className="font-bold text-slate-950">{filtered.length} {isBn ? 'টি' : 'records'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-bold">{isBn ? 'সর্বমোট টাকা:' : 'Total Amount:'}</span>
                  <span className="font-black text-slate-950 text-sm">{formatCurrency(totalAmount, isBn ? 'bn' : 'en')}</span>
                </div>
              </div>

              {/* Table */}
              <div className="border-2 border-slate-800 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 border-b-2 border-slate-800 text-slate-950 font-black text-[11px] uppercase">
                      <th className="py-2.5 px-3 border-r border-slate-400 text-center w-10">{isBn ? 'ক্র.' : 'Sl'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'ভাউচার নং' : 'Voucher No'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'প্রকল্প' : 'Project'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'প্রাপক / প্রদানকারী' : 'Paid To / Received From'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'হিসাবের খাত ও বিবরণ' : 'Head & Description'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-400">{isBn ? 'প্রস্তুতকারী' : 'Prepared By'}</th>
                      <th className="py-2.5 px-3 text-right">{isBn ? 'পরিমাণ (৳)' : 'Amount (Tk)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-slate-300 text-[11px]">
                    {filtered.map((v, idx) => (
                      <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-950">{v.voucherNumber}</td>
                        <td className="py-2 px-3 border-r border-slate-300 whitespace-nowrap">{formatDisplayDate(v.date, isBn ? 'bn' : 'en')}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-medium">{v.projectName || 'General'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold text-slate-950">{v.paidTo}</td>
                        <td className="py-2 px-3 border-r border-slate-300">
                          <span className="font-bold text-slate-900 block">{v.category}</span>
                          <span className="text-slate-600 block text-[10px]">{v.description}</span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-700 font-medium">
                          {cleanPreparedBy(v.preparedBy)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                          {formatCurrency(v.amount, isBn ? 'bn' : 'en')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 font-black border-t-2 border-slate-800 text-xs">
                      <td colSpan={7} className="py-3 px-3 text-right border-r border-slate-400">
                        {isBn ? 'সর্বমোট টাকার পরিমাণ (Grand Total):' : 'Grand Total Amount:'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-sm text-slate-950">
                        {formatCurrency(totalAmount, isBn ? 'bn' : 'en')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Official Signatures with manual hand signature space */}
              <div className="grid grid-cols-4 gap-4 pt-10 text-center text-xs">
                <div className="flex flex-col items-center justify-end">
                  <div className="h-8 mb-1 flex items-end justify-center text-[11px] font-bold text-slate-900">
                    MD. Tanveen Ahmed
                  </div>
                  <div className="w-full border-t-2 border-slate-900 pt-1 font-bold text-slate-950">
                    {isBn ? 'প্রস্তুতকারী (হিসাব বিভাগ)' : 'Prepared By (Accounts)'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {isBn ? 'স্বাক্ষর ও তারিখ' : 'Signature & Date'}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="h-8 mb-1 flex items-end justify-center text-[11px] font-bold text-slate-700">
                    {/* Space for hand signature */}
                  </div>
                  <div className="w-full border-t-2 border-slate-900 pt-1 font-bold text-slate-950">
                    {isBn ? 'যাচাইকারী / নিরীক্ষক' : 'Verified / Internal Auditor'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {isBn ? 'স্বাক্ষর ও তারিখ' : 'Signature & Date'}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="h-8 mb-1 flex items-end justify-center text-[11px] font-bold text-slate-700">
                    {/* Space for hand signature */}
                  </div>
                  <div className="w-full border-t-2 border-slate-900 pt-1 font-bold text-slate-950">
                    {isBn ? 'প্রকল্প ব্যবস্থাপক / পিএম' : 'Project Manager / Verified'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {isBn ? 'স্বাক্ষর ও তারিখ' : 'Signature & Date'}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="h-8 mb-1 flex items-end justify-center text-[11px] font-bold text-slate-700">
                    {/* Space for hand signature */}
                  </div>
                  <div className="w-full border-t-2 border-slate-900 pt-1 font-bold text-slate-950">
                    {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {isBn ? 'অনুমোদন ও সিল' : 'Approved & Seal'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Voucher Modal */}
      {editModalVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {isBn ? 'ভাউচার / রসিদ তথ্য সংশোধন' : 'Edit Voucher / Receipt'}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-mono">
                    {editModalVoucher.voucherNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalVoucher(null)}
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
                    {isBn ? 'প্রকল্প (Project)' : 'Project'}
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="">{isBn ? 'হেড অফিস / সাধারণ তহবিল' : 'Head Office / General'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'প্রাপক / ব্যক্তি (Paid To / Received From)' : 'Person / Paid To'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPaidTo}
                    onChange={(e) => setEditPaidTo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'পরিমাণ (৳)' : 'Amount (৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-sm outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'খাত / ক্যাটাগরি' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-hidden font-medium cursor-pointer"
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK">BANK</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="MOBILE_BANKING">MOBILE BANKING</option>
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
                  placeholder="e.g. Bill #102"
                />
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
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalVoucher(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition font-semibold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Voucher Modal */}
      {deleteModalVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'ভাউচার মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Voucher Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে ভাউচার নং ${deleteModalVoucher.voucherNumber} (৳${deleteModalVoucher.amount.toLocaleString()}) মুছে ফেলতে চান? এটি সংশ্লিষ্ট হিসাব রিভার্স করবে।`
                : `Are you sure you want to delete Voucher ${deleteModalVoucher.voucherNumber} (৳${deleteModalVoucher.amount.toLocaleString()})?`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ' : 'Reason for Deletion'}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুল ভাউচার জেনারেট হয়েছে' : 'e.g. Wrong voucher created'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalVoucher(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
