/**
 * Materials & Inventory Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Layers, 
  Plus, 
  Search, 
  Truck, 
  Calendar, 
  Building2, 
  FileText,
  PackageCheck,
  Trash2,
  AlertCircle,
  Pencil,
  X
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { MaterialPurchase } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MaterialsViewProps {
  onOpenNewMaterialExpense: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({ onOpenNewMaterialExpense }) => {
  const { language } = useLanguage();
  const { 
    materials = [], 
    projects = [], 
    suppliers = [],
    selectedProjectId = 'ALL', 
    updateMaterial,
    deleteMaterial, 
    softDeleteExpense 
  } = useData();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId);
  const [deleteModalItem, setDeleteModalItem] = useState<MaterialPurchase | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Edit Modal State
  const [editModalItem, setEditModalItem] = useState<MaterialPurchase | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editMaterialName, setEditMaterialName] = useState('');
  const [editCategory, setEditCategory] = useState('Cement');
  const [editSupplierName, setEditSupplierName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('Bag');
  const [editRate, setEditRate] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editChallanNumber, setEditChallanNumber] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'PAID' | 'DUE' | 'PARTIAL'>('PAID');

  const isBn = language === 'bn';

  const openEditModal = (item: MaterialPurchase) => {
    setEditModalItem(item);
    setEditDate(item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditProjectId(item.projectId || (projects[0]?.id || ''));
    setEditMaterialName(item.materialName || '');
    setEditCategory(item.category || 'Cement');
    setEditSupplierName(item.supplierName || '');
    setEditQuantity(item.quantity ? String(item.quantity) : '');
    setEditUnit(item.unit || 'Bag');
    const rateVal = item.unitRate || item.rate || 0;
    setEditRate(rateVal > 0 ? String(rateVal) : '');
    const totalVal = item.totalCost || item.totalAmount || (item.quantity * rateVal) || 0;
    setEditTotalAmount(totalVal > 0 ? String(totalVal) : '');
    setEditChallanNumber(item.challanNumber || '');
    setEditPaymentStatus(item.paymentStatus || 'PAID');
  };

  const handleQtyRateChange = (qtyStr: string, rateStr: string) => {
    setEditQuantity(qtyStr);
    setEditRate(rateStr);
    const q = parseFloat(qtyStr) || 0;
    const r = parseFloat(rateStr) || 0;
    if (q > 0 && r > 0) {
      setEditTotalAmount(String(q * r));
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem) return;

    const project = projects.find(p => p.id === editProjectId);
    const qty = parseFloat(editQuantity) || 0;
    const rate = parseFloat(editRate) || 0;
    const total = parseFloat(editTotalAmount) || (qty * rate);

    if (updateMaterial) {
      updateMaterial(editModalItem.id, {
        date: editDate,
        projectId: editProjectId,
        projectName: project?.name || editModalItem.projectName,
        materialName: editMaterialName,
        category: editCategory,
        supplierName: editSupplierName,
        quantity: qty,
        unit: editUnit,
        rate: rate,
        unitRate: rate,
        totalAmount: total,
        totalCost: total,
        challanNumber: editChallanNumber,
        paymentStatus: editPaymentStatus,
      });
    }

    setEditModalItem(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalItem) return;
    if (deleteMaterial) {
      deleteMaterial(deleteModalItem.id, deleteReason || 'User requested deletion');
    } else if (deleteModalItem.expenseId) {
      softDeleteExpense(deleteModalItem.expenseId, deleteReason || 'User requested deletion');
    }
    setDeleteModalItem(null);
    setDeleteReason('');
  };

  const safeMaterials = Array.isArray(materials) ? materials : [];
  const filtered = safeMaterials.filter(m => {
    if (filterProject !== 'ALL' && m.projectId !== filterProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        (m.materialName && m.materialName.toLowerCase().includes(q)) ||
        (m.supplierName && m.supplierName.toLowerCase().includes(q)) ||
        (m.challanNumber && m.challanNumber.toLowerCase().includes(q)) ||
        (m.voucherNumber && m.voucherNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalMaterialCost = filtered.reduce((sum, m) => sum + (m.totalCost || m.totalAmount || 0), 0);

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
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>{isBn ? 'নির্মাণ কাঁচামাল ও মালামাল সরবরাহ' : 'Construction Materials & Delivery'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'সিমেন্ট (ব্যাগ), রড (টন), ইট (হাজার), বালু (সিএফটি) ইত্যাদি সাইটে রিসিভ এবং খরচ হিসাব' 
              : 'Materials procurement tracking with exact quantity, unit rates, and challan numbers'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewMaterialExpense}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isBn ? '+ কাঁচামাল এন্ট্রি' : '+ Record Material'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট কাঁচামাল খরচ' : 'Total Material Cost'}</span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {formatCurrency(totalMaterialCost, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট চালান রেকর্ড' : 'Challan Records'}</span>
            <h3 className={`text-xl font-mono font-black mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {filtered.length} {isBn ? 'টি' : 'records'}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className={`border rounded-2xl p-4 flex items-center justify-between transition ${
          isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div>
            <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'স্বয়ংক্রিয় ভাউচারিং' : 'Auto Voucher Link'}</span>
            <h3 className={`text-sm font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Active CPV Integrated
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
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
            placeholder={isBn ? 'ম্যাটেরিয়াল নাম, সাপ্লায়ার বা চালান নং দিয়ে খুঁজুন...' : 'Search material name, supplier or challan...'}
            className="w-full bg-transparent placeholder-slate-400 outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`border rounded-xl px-3 py-2 outline-hidden font-medium w-full md:w-48 cursor-pointer transition ${
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
                <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4">{isBn ? 'প্রকল্প' : 'Project'}</th>
                <th className="py-3 px-4">{isBn ? 'কাঁচামাল' : 'Material'}</th>
                <th className="py-3 px-4">{isBn ? 'সরবরাহকারী' : 'Supplier'}</th>
                <th className="py-3 px-4">{isBn ? 'পরিমাণ ও একক' : 'Quantity'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'দর (টাকা)' : 'Unit Rate'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'মোট মূল্য' : 'Total (BDT)'}</th>
                <th className="py-3 px-4">{isBn ? 'চালান নং' : 'Challan'}</th>
                <th className="py-3 px-4 text-center">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
              {filtered.map((item) => (
                <tr key={item.id} className={`transition ${
                  isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                }`}>
                  <td className={`py-3.5 px-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {formatDisplayDate(item.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-semibold block truncate max-w-[150px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.projectName}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {item.materialName}
                  </td>
                  <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.supplierName}
                  </td>
                  <td className={`py-3.5 px-4 font-mono font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    ৳{(item.unitRate || item.rate || 0).toLocaleString()}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono font-black whitespace-nowrap ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {formatCurrency(item.totalCost || item.totalAmount || 0, isBn ? 'bn' : 'en')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {item.challanNumber || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isDark 
                            ? 'bg-slate-700/60 hover:bg-amber-500 hover:text-slate-950 text-slate-300' 
                            : 'bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-700 border border-amber-200'
                        }`}
                        title={isBn ? 'কাঁচামাল তথ্য সংশোধন / এডিট' : 'Edit Material Record'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModalItem(item)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isDark 
                            ? 'bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white' 
                            : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200'
                        }`}
                        title={isBn ? 'কাঁচামাল এন্ট্রি মুছে ফেলুন' : 'Delete Material Entry'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Material Modal */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 font-sans my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
                  <Pencil className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {isBn ? 'নির্মাণ কাঁচামাল তথ্য সংশোধন' : 'Edit Material Record'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'কাঁচামালের পরিমাণ, দর, সরবরাহকারী ও চালান সংশোধন করুন' : 'Update quantity, unit rate, supplier and challan details'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEditModalItem(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নিযুক্ত প্রকল্প' : 'Project'} *</label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'কাঁচামালের নাম / বিবরণ' : 'Material Name'} *</label>
                  <input
                    type="text"
                    required
                    value={editMaterialName}
                    onChange={(e) => setEditMaterialName(e.target.value)}
                    placeholder={isBn ? 'যেমন: BSRM ১৬ মিমি রড, শাহ সিমেন্ট' : 'e.g. BSRM 16mm Rod, Holcim Cement'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ক্যাটাগরি' : 'Category'} *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Cement">Cement / সিমেন্ট</option>
                    <option value="Steel">Steel & Rod / রড ও লোহা</option>
                    <option value="Bricks">Bricks / ইট</option>
                    <option value="Sand">Sand / বালু</option>
                    <option value="Stone">Stone & Chips / পাথর ও খোয়া</option>
                    <option value="Tiles">Tiles / টাইলস</option>
                    <option value="Plumbing">Plumbing & Sanitary / প্লাম্বিং</option>
                    <option value="Electrical">Electrical / বৈদ্যুতিক</option>
                    <option value="Paint">Paint / রং</option>
                    <option value="Wood">Wood & Board / কাঠ ও বোর্ড</option>
                    <option value="Other">Other Trade / অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'সরবরাহকারী / দোকান' : 'Supplier / Vendor'}</label>
                  <input
                    type="text"
                    list="supplier-suggestions"
                    value={editSupplierName}
                    onChange={(e) => setEditSupplierName(e.target.value)}
                    placeholder={isBn ? 'যেমন: মেসার্স রহিম ট্রেডার্স' : 'e.g. M/S Rahim Traders'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <datalist id="supplier-suggestions">
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'চালান নম্বর' : 'Challan Number'}</label>
                  <input
                    type="text"
                    value={editChallanNumber}
                    onChange={(e) => setEditChallanNumber(e.target.value)}
                    placeholder="CH-2026-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পরিমাণ' : 'Quantity'} *</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editQuantity}
                    onChange={(e) => handleQtyRateChange(e.target.value, editRate)}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'একক' : 'Unit'} *</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Bag">Bag (ব্যাগ)</option>
                    <option value="Ton">Ton (টন)</option>
                    <option value="CFT">CFT (ঘনফুট)</option>
                    <option value="Pcs">Pcs (পিস)</option>
                    <option value="Kg">Kg (কেজি)</option>
                    <option value="Sft">Sft (বর্গফুট)</option>
                    <option value="Truck">Truck (ট্রাক)</option>
                    <option value="Trip">Trip (ট্রিপ)</option>
                    <option value="Ltr">Ltr (লিটার)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'দর / রেট (৳)' : 'Unit Rate (৳)'}</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editRate}
                    onChange={(e) => handleQtyRateChange(editQuantity, e.target.value)}
                    placeholder="550"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">{isBn ? 'মোট খরচ / মূল্য (টাকা)' : 'Total Cost (BDT)'} *</label>
                    <span className="text-[10px] text-amber-700 font-semibold">{isBn ? 'স্বয়ংক্রিয় হিসাব' : 'Auto'}</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg text-sm font-mono font-black text-amber-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পরিশোধের অবস্থা' : 'Payment Status'}</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="PAID">{isBn ? 'পরিশোধিত (PAID)' : 'Paid'}</option>
                    <option value="DUE">{isBn ? 'বাকি (DUE)' : 'Due / Payable'}</option>
                    <option value="PARTIAL">{isBn ? 'আংশিক (PARTIAL)' : 'Partial'}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm cursor-pointer transition active:scale-95"
                >
                  {isBn ? 'সংরক্ষণ ও আপডেট' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'কাঁচামাল এন্ট্রি মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে "${deleteModalItem.materialName}" (৳${(deleteModalItem.totalCost || deleteModalItem.totalAmount || 0).toLocaleString()}) ক্রয় রেকর্ডটি মুছে ফেলতে চান?`
                : `Are you sure you want to delete material entry "${deleteModalItem.materialName}" (৳${(deleteModalItem.totalCost || deleteModalItem.totalAmount || 0).toLocaleString()})?`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'মুছে ফেলার কারণ' : 'Reason for Deletion'}
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={isBn ? 'যেমন: চালানে ভুল ছিল / দ্বৈত এন্ট্রি' : 'e.g. Incorrect challan amount'}
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
                {isBn ? 'মুছে ফেলুন' : 'Delete Material'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
