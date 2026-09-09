/**
 * Universal Global Search Modal
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Search, X, FileText, Building, Users, Truck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Voucher } from '../../types';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoucher: (voucher: Voucher) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVoucher,
}) => {
  const { language } = useLanguage();
  const { vouchers, expenses, projects, contractors, suppliers, moneyReceived } = useData();
  const [query, setQuery] = useState('');

  const isBn = language === 'bn';

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();

    const matchedVouchers = vouchers.filter(
      v => v.voucherNumber.toLowerCase().includes(q) || v.paidTo.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)
    );

    const matchedExpenses = expenses.filter(
      e => e.paidTo.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.reference && e.reference.toLowerCase().includes(q))
    );

    const matchedProjects = projects.filter(
      p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );

    const matchedContractors = contractors.filter(
      c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.phone.includes(q)
    );

    const matchedSuppliers = suppliers.filter(
      s => s.name.toLowerCase().includes(q) || s.type.toLowerCase().includes(q) || s.phone.includes(q)
    );

    return {
      vouchers: matchedVouchers.slice(0, 5),
      expenses: matchedExpenses.slice(0, 5),
      projects: matchedProjects.slice(0, 3),
      contractors: matchedContractors.slice(0, 3),
      suppliers: matchedSuppliers.slice(0, 3),
    };
  }, [query, vouchers, expenses, projects, contractors, suppliers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-100">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isBn ? 'ভাউচার নং (যেমন CPV-2026-000125), প্রজেক্ট, কন্ট্রাক্টর বা খরচ খুঁজুন...' : 'Search voucher (e.g. CPV-2026-000125), project, contractor, supplier...'}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-hidden font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-md font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>{isBn ? 'যেকোনো ভাউচার, ক্যাশ পেমেন্ট বা প্রজেক্ট রেকর্ড নিমেষেই খুঁজুন।' : 'Quickly find any voucher, cash payment, or project record.'}</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-mono text-[11px]">CPV-2026-000125</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-mono text-[11px]">Tokyo Square</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-mono text-[11px]">Rahman Traders</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-mono text-[11px]">Rafiqul Carpenter</span>
              </div>
            </div>
          ) : (
            <>
              {/* Vouchers Match */}
              {searchResults?.vouchers && searchResults.vouchers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isBn ? 'ভাউচারসমূহ' : 'Vouchers'}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.vouchers.map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectVoucher(v);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 border border-slate-100 cursor-pointer transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              {v.voucherNumber}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{v.paidTo}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">{v.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-slate-900 block">
                            {formatCurrency(v.amount, isBn ? 'bn' : 'en')}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDisplayDate(v.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Match */}
              {searchResults?.projects && searchResults.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isBn ? 'প্রকল্প' : 'Projects'}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.projects.map(p => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <p className="text-[11px] text-slate-500">{p.location}</p>
                        </div>
                        <span className="font-mono font-bold text-slate-700">বাজেট: {formatCurrency(p.budget, isBn ? 'bn' : 'en')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contractors Match */}
              {searchResults?.contractors && searchResults.contractors.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isBn ? 'কন্ট্রাক্টর' : 'Contractors'}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.contractors.map(c => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <p className="text-[11px] text-slate-500">{c.type} • {c.phone}</p>
                        </div>
                        <span className="font-mono text-rose-600 font-bold">বাকি: {formatCurrency(c.dueAmount, isBn ? 'bn' : 'en')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers Match */}
              {searchResults?.suppliers && searchResults.suppliers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isBn ? 'সরবরাহকারী' : 'Suppliers'}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.suppliers.map(s => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <p className="text-[11px] text-slate-500">{s.type} • {s.phone}</p>
                        </div>
                        <span className="font-mono text-amber-700 font-bold">বকেয়া: {formatCurrency(s.currentDue, isBn ? 'bn' : 'en')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
