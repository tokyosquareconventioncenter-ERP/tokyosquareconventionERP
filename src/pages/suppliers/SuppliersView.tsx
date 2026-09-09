/**
 * Suppliers & Vendor Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  X,
  Package,
  Trash2,
  AlertCircle,
  Building,
  Check,
  Printer,
  FileText,
  Calendar,
  Wallet,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../i18n/formatters';
import { Supplier, Voucher, PaymentMethod } from '../../types';

interface SuppliersViewProps {
  onOpenQuickPayment?: (supplier?: Supplier) => void;
  onSelectVoucher?: (voucher: Voucher) => void;
}

const DEFAULT_SUPPLIER_TYPES = [
  { id: 'CEMENT', nameBn: 'Cement / সিমেন্ট', nameEn: 'Cement' },
  { id: 'ROD', nameBn: 'Rod / স্টিল রড', nameEn: 'Steel Rod' },
  { id: 'BRICK', nameBn: 'Brick / ইট', nameEn: 'Bricks' },
  { id: 'SAND', nameBn: 'Sand / বালু', nameEn: 'Sand' },
  { id: 'STONE', nameBn: 'Stone / পাথর', nameEn: 'Stone' },
  { id: 'SANITARY', nameBn: 'Sanitary & Tiles / স্যানিটারি ও টাইলস', nameEn: 'Sanitary & Tiles' },
  { id: 'HARDWARE', nameBn: 'Hardware & Tools / হার্ডওয়্যার ও ফিটিংস', nameEn: 'Hardware & Tools' },
  { id: 'PAINT', nameBn: 'Paint & Colors / রঙ ও পুটিং', nameEn: 'Paint & Putty' },
  { id: 'GLASS', nameBn: 'Glass & Aluminium / থাই গ্লাস ও অ্যালুমিনিয়াম', nameEn: 'Glass & Aluminium' },
  { id: 'ELECTRICAL', nameBn: 'Electrical & Cables / ইলেকট্রিক ও কেবল', nameEn: 'Electrical & Cables' },
  { id: 'READYMIX', nameBn: 'Ready Mix / রেডি মিক্স কংক্রিট', nameEn: 'Ready Mix Concrete' },
  { id: 'PILING', nameBn: 'Piling & Foundation / পাইলিং ও বোরিং', nameEn: 'Piling & Foundation' },
  { id: 'WOOD', nameBn: 'Timber & Shuttering / কাঠ ও শাটারিং বোর্ড', nameEn: 'Timber & Shuttering' },
];

export const SuppliersView: React.FC<SuppliersViewProps> = ({ onSelectVoucher }) => {
  const { language } = useLanguage();
  const { 
    suppliers, 
    expenses, 
    materials, 
    accounts,
    projects,
    selectedProjectId = 'ALL',
    addSupplier, 
    deleteSupplier,
    addExpense 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalSupplier, setDeleteModalSupplier] = useState<Supplier | null>(null);
  const [ledgerModalSupplier, setLedgerModalSupplier] = useState<Supplier | null>(null);

  // Quick Payment Modal State
  const [paymentModalSupplier, setPaymentModalSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentProjectId, setPaymentProjectId] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentSuccessVoucher, setPaymentSuccessVoucher] = useState<Voucher | null>(null);

  const isBn = language === 'bn';

  // Custom Product Types handling & persistence
  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('skrp_custom_supplier_types');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCustomTypeMode, setIsCustomTypeMode] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');

  // Add Supplier Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('CEMENT');
  const [openingDue, setOpeningDue] = useState('');
  const [notes, setNotes] = useState('');

  const handleDeleteConfirm = () => {
    if (!deleteModalSupplier) return;
    deleteSupplier(deleteModalSupplier.id);
    setDeleteModalSupplier(null);
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const totalPurchases = filtered.reduce((sum, s) => sum + s.totalPurchase, 0);
  const totalPaid = filtered.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalDue = filtered.reduce((sum, s) => sum + s.currentDue, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine the product type
    let finalType = type;
    if (isCustomTypeMode && customTypeInput.trim()) {
      finalType = customTypeInput.trim();
      // Save newly typed custom type into persistent storage
      if (!customTypes.some(t => t.toLowerCase() === finalType.toLowerCase())) {
        const updated = [...customTypes, finalType];
        setCustomTypes(updated);
        try {
          localStorage.setItem('skrp_custom_supplier_types', JSON.stringify(updated));
        } catch {}
      }
    }

    addSupplier({
      name,
      phone,
      address,
      type: finalType,
      openingDue: parseFloat(openingDue) || 0,
      notes,
    });

    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    setOpeningDue('');
    setNotes('');
    setIsCustomTypeMode(false);
    setCustomTypeInput('');
  };

  // Open Payment Modal for a specific supplier
  const handleOpenPayment = (supplier: Supplier) => {
    setPaymentModalSupplier(supplier);
    setPaymentAmount(supplier.currentDue > 0 ? supplier.currentDue.toString() : '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    
    // Choose sensible default project
    const defaultProjId = (selectedProjectId && selectedProjectId !== 'ALL') 
      ? selectedProjectId 
      : (projects[0]?.id || 'company');
    setPaymentProjectId(defaultProjId);

    // Choose default account (cash or bank)
    const defaultAccId = accounts[0]?.id || '';
    setPaymentAccountId(defaultAccId);
    setPaymentMethod('CASH');
    setPaymentRef('');
    setPaymentDescription(
      isBn 
        ? `সরবরাহকারী ${supplier.name} কে ${supplier.type} ক্রয়ের বিপরীতে বিল পরিশোধ।` 
        : `Payment to supplier ${supplier.name} for ${supplier.type}.`
    );
    setPaymentSuccessVoucher(null);
  };

  // Submit Payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalSupplier) return;

    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) return;

    const createdVoucher = addExpense({
      date: paymentDate,
      projectId: paymentProjectId || 'company',
      expenseType: 'MATERIAL',
      category: `সরবরাহকারী বিল পরিশোধ (${paymentModalSupplier.type || 'Material'})`,
      paidTo: paymentModalSupplier.name,
      supplierId: paymentModalSupplier.id,
      amount: amountNum,
      paymentMethod,
      accountId: paymentAccountId,
      description: paymentDescription || `সরবরাহকারী ${paymentModalSupplier.name} কে মালামাল ক্রয়ের বিল পরিশোধ।`,
      reference: paymentRef,
    });

    if (createdVoucher) {
      setPaymentSuccessVoucher(createdVoucher);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Main Suppliers Page - Hidden during print if Ledger Modal is Open */}
      <div className={ledgerModalSupplier ? 'print:hidden space-y-6' : 'space-y-6'}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            <span>{isBn ? 'সরবরাহকারী (সাপ্লায়ার) ও ভেন্ডর তালিকা' : 'Material Suppliers & Vendors'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBn 
              ? 'সিমেন্ট, রড, ইট, বালু, পাথর ও সকল ভেন্ডরদের ক্রয় হিসাব, পেমেন্ট ও বকেয়া খতিয়ান' 
              : 'Procurement ledger, deliveries, payments and outstanding supplier dues'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCustomTypeMode(false);
            setCustomTypeInput('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isBn ? '+ নতুন সরবরাহকারী' : '+ Add Supplier'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">{isBn ? 'মোট ক্রয় মূল্য' : 'Total Purchases'}</span>
            <h3 className="text-xl font-mono font-black text-slate-100 mt-0.5">
              {formatCurrency(totalPurchases, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">{isBn ? 'মোট পরিশোধিত' : 'Total Paid'}</span>
            <h3 className="text-xl font-mono font-black text-emerald-400 mt-0.5">
              {formatCurrency(totalPaid, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">{isBn ? 'মোট সরবরাহকারী বকেয়া' : 'Total Current Due'}</span>
            <h3 className="text-xl font-mono font-black text-amber-400 mt-0.5">
              {formatCurrency(totalDue, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            ৳
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isBn ? 'সরবরাহকারীর নাম, পণ্য (Cement, Rod, ইট ইত্যাদি) বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search supplier name, product type, phone...'}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 outline-hidden font-medium"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((supplier) => (
          <div 
            key={supplier.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-600 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                  {supplier.type}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    বকেয়া: <span className="font-bold text-amber-400">৳{supplier.currentDue.toLocaleString()}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteModalSupplier(supplier)}
                    className="p-1 rounded bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                    title={isBn ? 'সরবরাহকারী মুছে ফেলুন' : 'Delete Supplier'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-100 mt-2">
                {supplier.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono">{supplier.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{supplier.address}</span>
              </div>

              {supplier.notes && (
                <p className="text-[11px] text-slate-400 mt-2 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                  {supplier.notes}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-700/60">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">{isBn ? 'মোট ক্রয়' : 'Purchase'}</span>
                <span className="font-bold text-slate-200 font-mono">৳{(supplier.totalPurchase / 1000).toFixed(0)}k</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">{isBn ? 'পরিশোধিত' : 'Paid'}</span>
                <span className="font-bold text-emerald-400 font-mono">৳{(supplier.totalPaid / 1000).toFixed(0)}k</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">{isBn ? 'বর্তমান বাকি' : 'Due'}</span>
                <span className="font-bold text-amber-400 font-mono">৳{(supplier.currentDue / 1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Action Buttons: 1. পেমেন্ট করুন, 2. খতিয়ান */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenPayment(supplier)}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                title={isBn ? 'সরবরাহকারীকে পেমেন্ট করুন ও ভাউচার তৈরি করুন' : 'Make Payment to Supplier'}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>{isBn ? 'পেমেন্ট করুন' : 'Pay Supplier'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerModalSupplier(supplier)}
                className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-amber-500/30"
                title={isBn ? 'খতিয়ান ও ভাউচার বিবরণী' : 'View Ledger'}
              >
                <Building className="w-3.5 h-3.5 shrink-0" />
                <span>{isBn ? 'খতিয়ান স্টেটমেন্ট' : 'Ledger'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>{isBn ? 'নতুন সরবরাহকারী যোগ করুন' : 'Add Material Supplier'}</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs sm:text-sm font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'প্রতিষ্ঠানের নাম' : 'Supplier / Company Name'} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBn ? 'যেমন: মেঘনা স্টিল এন্টারপ্রাইজ / স্কয়ার সিমেন্ট' : 'e.g. Meghna Steel Enterprise'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Product Type (Material Type) with Custom Input Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-slate-800">
                    {isBn ? 'পণ্য ধরণ' : 'Material / Product Type'} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTypeMode(!isCustomTypeMode);
                      if (!isCustomTypeMode) {
                        setCustomTypeInput('');
                      }
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-100/70 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 transition cursor-pointer"
                  >
                    {isCustomTypeMode ? (
                      <span>📋 {isBn ? 'ড্রপডাউন তালিকা দেখুন' : 'Select from List'}</span>
                    ) : (
                      <span>✍️ {isBn ? 'হাতে লিখুন (Custom)' : 'Type Custom'}</span>
                    )}
                  </button>
                </div>

                {isCustomTypeMode ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={customTypeInput}
                      onChange={(e) => setCustomTypeInput(e.target.value)}
                      placeholder={isBn ? 'যেমন: কাঠ ও শাটারিং বোর্ড / থাই গ্লাস / রঙ ও পুটিং...' : 'e.g. Wood, Glass, Paint, Marble...'}
                      className="w-full px-3 py-2 border-2 border-amber-500 bg-amber-50/40 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      autoFocus
                    />
                    <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{isBn ? 'এই পণ্য ধরণটি স্থায়ীভাবে সেভ থাকবে এবং পরবর্তীতে ড্রপডাউন তালিকায় পাওয়া যাবে।' : 'This custom product type will be saved and reused in future dropdowns.'}</span>
                    </p>
                  </div>
                ) : (
                  <select
                    value={type}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomTypeMode(true);
                        setCustomTypeInput('');
                      } else {
                        setType(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <optgroup label={isBn ? 'সাধারণ নির্মাণ সামগ্রী' : 'Standard Building Materials'}>
                      {DEFAULT_SUPPLIER_TYPES.map(t => (
                        <option key={t.id} value={t.id}>
                          {isBn ? t.nameBn : t.nameEn}
                        </option>
                      ))}
                    </optgroup>

                    {customTypes.length > 0 && (
                      <optgroup label={isBn ? '✨ আপনার সেভ করা পণ্যসমূহ' : '✨ Saved Custom Product Types'}>
                        {customTypes.map(ct => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <option value="__CUSTOM__">
                      ✍️ {isBn ? '+ নতুন পণ্য নিজে হাতে লিখুন...' : '+ Type custom product name...'}
                    </option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল নম্বর' : 'Phone'} *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01711-000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ঠিকানা' : 'Address'} *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isBn ? 'যেমন: গাবতলী, ঢাকা / ময়মনসিংহ' : 'e.g. Mymensingh, Dhaka'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পূর্বের বকেয়া (যদি থাকে)' : 'Opening Due (BDT)'}</label>
                  <input
                    type="number"
                    value={openingDue}
                    onChange={(e) => setOpeningDue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নোট / মন্তব্য' : 'Notes'}</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isBn ? 'ব্র্যান্ড বা ডেলিভারি শর্ত...' : 'Delivery conditions...'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer hover:bg-slate-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm cursor-pointer active:scale-95"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Supplier Modal */}
      {deleteModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'সরবরাহকারী ডিলিট নিশ্চিতকরণ' : 'Confirm Supplier Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে সরবরাহকারী "${deleteModalSupplier.name}" এর তথ্য মুছে ফেলতে চান?` 
                : `Are you sure you want to delete supplier "${deleteModalSupplier.name}"?`}
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalSupplier(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Supplier Payment Modal */}
      {paymentModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900">
                      {isBn ? 'সরবরাহকারী বিল পরিশোধ (Payment)' : 'Supplier Bill Payment'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {paymentModalSupplier.name} ({paymentModalSupplier.type}) • {paymentModalSupplier.phone}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setPaymentModalSupplier(null);
                  setPaymentSuccessVoucher(null);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success state with Voucher View */}
            {paymentSuccessVoucher ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-black text-base text-emerald-950">
                    {isBn ? 'পেমেন্ট সফলভাবে সম্পন্ন ও ভাউচার তৈরি হয়েছে!' : 'Payment Recorded Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">
                    {isBn ? 'ভাউচার নং:' : 'Voucher No:'} <strong>{paymentSuccessVoucher.voucherNumber}</strong> | ৳{paymentSuccessVoucher.amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {onSelectVoucher && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectVoucher(paymentSuccessVoucher);
                        setPaymentModalSupplier(null);
                        setPaymentSuccessVoucher(null);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ভাউচার প্রিন্ট করুন' : 'Print Voucher'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentModalSupplier(null);
                      setPaymentSuccessVoucher(null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isBn ? 'সম্পন্ন / বন্ধ করুন' : 'Done / Close'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs sm:text-sm">
                
                {/* Current Due Highlight Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-amber-700 font-bold block">
                      {isBn ? 'বর্তমান নিট বকেয়া' : 'Current Net Due'}
                    </span>
                    <span className="text-lg font-black text-amber-900 font-mono">
                      ৳{paymentModalSupplier.currentDue.toLocaleString()}
                    </span>
                  </div>

                  {paymentModalSupplier.currentDue > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(paymentModalSupplier.currentDue.toString())}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition shadow-xs cursor-pointer"
                    >
                      {isBn ? 'সম্পূর্ণ বকেয়া লিখুন' : 'Pay Full Due'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Payment Amount */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'পরিশোধের পরিমাণ (টাকা)' : 'Payment Amount (BDT)'} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-mono font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      autoFocus
                    />
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'পরিশোধের তারিখ' : 'Payment Date'} *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Project Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'প্রকল্পের খাত' : 'Project'} *
                    </label>
                    <select
                      value={paymentProjectId}
                      onChange={(e) => setPaymentProjectId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="company">{isBn ? 'হেড অফিস / সাধারণ কোম্পানি খাত' : 'Head Office / Company'}</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Account */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'যে একাউন্ট থেকে টাকা যাবে' : 'Paid From Account'} *
                    </label>
                    <select
                      value={paymentAccountId}
                      onChange={(e) => setPaymentAccountId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.accountType}) — ৳{acc.currentBalance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Method */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="CASH">ক্যাশ (Cash)</option>
                      <option value="BANK">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                      <option value="CHEQUE">চেক (Cheque)</option>
                      <option value="MOBILE_BANKING">মোবাইল ব্যাংকিং (bKash/Nagad)</option>
                    </select>
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'চেক নং / চালান / মেমো রেফারেন্স' : 'Cheque / Ref No.'}
                    </label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder={isBn ? 'যেমন: CHQ-981203 / চালান ১২৫' : 'e.g. CHQ-981203 / Memo'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'বিবরণ / নোট' : 'Description'}
                  </label>
                  <input
                    type="text"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    placeholder={isBn ? 'যেমন: মেসার্স স্কয়ার সিমেন্ট এর এপ্রিল ২০২৬ বিল পরিশোধ' : 'Payment description...'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPaymentModalSupplier(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isBn ? 'পেমেন্ট সম্পন্ন করুন' : 'Confirm Payment'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      </div>

      {/* Supplier Ledger & Statement Modal */}
      {ledgerModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  {isBn ? 'সরবরাহকারী ক্রয় ও পেমেন্ট খতিয়ান' : 'Supplier Procurement & Payment Ledger'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ledgerModalSupplier.name} ({ledgerModalSupplier.type}) • {ledgerModalSupplier.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => handleOpenPayment(ledgerModalSupplier)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  title={isBn ? 'সরাসরি পেমেন্ট এন্ট্রি করুন' : 'Make Payment'}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পেমেন্ট করুন' : 'Make Payment'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <span>🖨️ {isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print Statement'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerModalSupplier(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Container */}
            <div id="printable-supplier-ledger" className="space-y-4">
              {/* Header Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'সরবরাহকারী প্রতিষ্ঠান:' : 'Supplier Name:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{ledgerModalSupplier.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                  <span className="font-bold text-slate-900 font-mono">{ledgerModalSupplier.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'পণ্য / ব্র্যান্ড:' : 'Product Type:'}</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{ledgerModalSupplier.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'ঠিকানা:' : 'Address:'}</span>
                  <span className="font-bold text-slate-900">{ledgerModalSupplier.address || '—'}</span>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 font-medium block text-[10px]">{isBn ? 'পূর্বের বকেয়া' : 'Opening Due'}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">৳{(ledgerModalSupplier.openingDue || 0).toLocaleString()}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <span className="text-blue-600 font-medium block text-[10px]">{isBn ? 'মোট মালামাল ক্রয়' : 'Total Purchases'}</span>
                  <span className="text-sm font-black text-blue-900 font-mono mt-0.5 block">৳{(ledgerModalSupplier.totalPurchase || 0).toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-emerald-600 font-medium block text-[10px]">{isBn ? 'মোট পরিশোধ' : 'Total Paid'}</span>
                  <span className="text-sm font-black text-emerald-900 font-mono mt-0.5 block">৳{(ledgerModalSupplier.totalPaid || 0).toLocaleString()}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <span className="text-amber-700 font-medium block text-[10px]">{isBn ? 'বর্তমান নিট বাকি' : 'Net Current Due'}</span>
                  <span className="text-sm font-black text-amber-900 font-mono mt-0.5 block">৳{(ledgerModalSupplier.currentDue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Section 1: Materials Deliveries */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
                  📦 {isBn ? 'মালামাল রিসিভ ও চালান ইতিহাস (Materials Purchased)' : 'Materials Purchased & Challan History'}
                </h4>
                {(() => {
                  const supMaterials = materials.filter(m => 
                    m.supplierId === ledgerModalSupplier.id ||
                    (m.supplierName && m.supplierName.trim().toLowerCase() === ledgerModalSupplier.name.trim().toLowerCase())
                  );

                  if (supMaterials.length === 0) {
                    return (
                      <div className="text-center py-4 text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        {isBn ? 'এই সরবরাহকারীর জন্য মালামাল ক্রয়ের আলাদা চালান তথ্য নেই।' : 'No separate material delivery records found.'}
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl mb-4">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="p-2">#</th>
                            <th className="p-2">{isBn ? 'তারিখ' : 'Date'}</th>
                            <th className="p-2">{isBn ? 'চালান নম্বর' : 'Challan No'}</th>
                            <th className="p-2">{isBn ? 'পণ্যের নাম' : 'Item Name'}</th>
                            <th className="p-2">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                            <th className="p-2 text-right">{isBn ? 'দর (Rate)' : 'Rate'}</th>
                            <th className="p-2 text-right">{isBn ? 'মোট টাকা (Bill)' : 'Total Bill'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                          {supMaterials.map((m, idx) => {
                            const cost = m.totalAmount || m.totalCost || ((m.quantity || 0) * (m.rate || m.unitRate || 0));
                            return (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                                <td className="p-2 font-mono whitespace-nowrap">{m.date}</td>
                                <td className="p-2 font-mono font-bold text-slate-700">{m.challanNumber || '—'}</td>
                                <td className="p-2">{m.materialName}</td>
                                <td className="p-2 font-bold">{m.quantity} {m.unit}</td>
                                <td className="p-2 text-right font-mono">৳{(m.rate || m.unitRate || 0).toLocaleString()}</td>
                                <td className="p-2 text-right font-mono font-bold text-blue-900">৳{cost.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Section 2: Payments Ledger */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    💳 {isBn ? 'টাকা পরিশোধ লেনদেন ইতিহাস (Payments Ledger)' : 'Payment Transactions Ledger'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(ledgerModalSupplier)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer print:hidden"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন পেমেন্ট এন্ট্রি' : 'New Payment'}</span>
                  </button>
                </div>

                {(() => {
                  const supExpenses = expenses.filter(e => 
                    !e.isDeleted && 
                    (e.supplierId === ledgerModalSupplier.id || 
                     (e.paidTo && e.paidTo.trim().toLowerCase() === ledgerModalSupplier.name.trim().toLowerCase()))
                  );

                  if (supExpenses.length === 0) {
                    return (
                      <div className="text-center py-6 text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        {isBn ? 'এই সরবরাহকারীকে এখনো কোনো পেমেন্ট রেকর্ড করা হয়নি।' : 'No payment transaction records found for this supplier yet.'}
                      </div>
                    );
                  }

                  let runningPaidSum = 0;

                  return (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="p-2.5">#</th>
                            <th className="p-2.5">{isBn ? 'তারিখ' : 'Date'}</th>
                            <th className="p-2.5">{isBn ? 'ভাউচার নং' : 'Voucher'}</th>
                            <th className="p-2.5">{isBn ? 'বিবরণ' : 'Description'}</th>
                            <th className="p-2.5">{isBn ? 'মেথড' : 'Method'}</th>
                            <th className="p-2.5 text-right">{isBn ? 'টাকা প্রদান (Paid)' : 'Paid Amount'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                          {supExpenses.map((exp, idx) => {
                            runningPaidSum += exp.amount;
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50">
                                <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                                <td className="p-2.5 font-mono whitespace-nowrap">{exp.date}</td>
                                <td className="p-2.5 font-mono font-bold text-amber-700">{exp.voucherNumber || exp.voucherId || '—'}</td>
                                <td className="p-2.5 max-w-xs truncate">{exp.description || exp.category}</td>
                                <td className="p-2.5">{exp.paymentMethod}</td>
                                <td className="p-2.5 text-right font-mono font-bold text-emerald-700">৳{exp.amount.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200">
                            <td colSpan={5} className="p-2.5 text-right">{isBn ? 'সর্বমোট প্রদানকৃত টাকা:' : 'Total Paid:'}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-800 text-sm">৳{runningPaidSum.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setLedgerModalSupplier(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
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
