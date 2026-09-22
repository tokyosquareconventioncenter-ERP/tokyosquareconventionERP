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
  Sparkles,
  Edit2,
  Eye
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { Supplier, Voucher, PaymentMethod, Expense, MaterialItem } from '../../types';

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
    vouchers = [],
    settings,
    selectedProjectId = 'ALL',
    addSupplier, 
    updateSupplier,
    deleteSupplier,
    addExpense,
    updateExpense,
    deleteExpense,
    updateMaterial,
    deleteMaterial
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalSupplier, setDeleteModalSupplier] = useState<Supplier | null>(null);
  const [ledgerModalSupplier, setLedgerModalSupplier] = useState<Supplier | null>(null);
  const [editModalSupplier, setEditModalSupplier] = useState<Supplier | null>(null);
  const [isMasterPrintOpen, setIsMasterPrintOpen] = useState(false);

  // Edit Supplier Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editType, setEditType] = useState('CEMENT');
  const [editOpeningDue, setEditOpeningDue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isEditCustomTypeMode, setIsEditCustomTypeMode] = useState(false);
  const [editCustomTypeInput, setEditCustomTypeInput] = useState('');

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

  // Edit/Delete Payment in Ledger State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpAmount, setEditExpAmount] = useState('');
  const [editExpMethod, setEditExpMethod] = useState<PaymentMethod>('CASH');
  const [editExpAccountId, setEditExpAccountId] = useState('');
  const [editExpDesc, setEditExpDesc] = useState('');
  const [editExpRef, setEditExpRef] = useState('');
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Edit/Delete Material in Ledger State
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [editMatDate, setEditMatDate] = useState('');
  const [editMatName, setEditMatName] = useState('');
  const [editMatChallan, setEditMatChallan] = useState('');
  const [editMatQty, setEditMatQty] = useState('');
  const [editMatUnit, setEditMatUnit] = useState('ব্যাগ');
  const [editMatRate, setEditMatRate] = useState('');
  const [editMatTotal, setEditMatTotal] = useState('');
  const [deletingMaterial, setDeletingMaterial] = useState<MaterialItem | null>(null);

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

  const handleOpenEdit = (supplier: Supplier) => {
    setEditModalSupplier(supplier);
    setEditName(supplier.name || '');
    setEditPhone(supplier.phone || '');
    setEditAddress(supplier.address || '');
    setEditOpeningDue((supplier.openingDue || 0).toString());
    setEditNotes(supplier.notes || '');

    const isPredefined = DEFAULT_SUPPLIER_TYPES.some(t => t.id === supplier.type || t.nameBn === supplier.type || t.nameEn === supplier.type);
    if (isPredefined) {
      setEditType(supplier.type);
      setIsEditCustomTypeMode(false);
      setEditCustomTypeInput('');
    } else {
      setEditType('CUSTOM');
      setIsEditCustomTypeMode(true);
      setEditCustomTypeInput(supplier.type || '');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalSupplier) return;

    let finalType = editType;
    if (isEditCustomTypeMode && editCustomTypeInput.trim()) {
      finalType = editCustomTypeInput.trim();
      if (!customTypes.some(t => t.toLowerCase() === finalType.toLowerCase())) {
        const updated = [...customTypes, finalType];
        setCustomTypes(updated);
        try {
          localStorage.setItem('skrp_custom_supplier_types', JSON.stringify(updated));
        } catch {}
      }
    }

    const newOpening = parseFloat(editOpeningDue) || 0;
    updateSupplier(editModalSupplier.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      type: finalType,
      openingDue: newOpening,
      notes: editNotes.trim(),
    });

    if (ledgerModalSupplier && ledgerModalSupplier.id === editModalSupplier.id) {
      setLedgerModalSupplier(prev => prev ? {
        ...prev,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        type: finalType,
        openingDue: newOpening,
        notes: editNotes.trim(),
        currentDue: Math.max(0, (newOpening + prev.totalPurchase) - prev.totalPaid)
      } : null);
    }

    setEditModalSupplier(null);
  };

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

  // Open Edit Expense Modal
  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setEditExpDate(exp.date || new Date().toISOString().split('T')[0]);
    setEditExpAmount(exp.amount.toString());
    setEditExpMethod(exp.paymentMethod || 'CASH');
    setEditExpAccountId(exp.accountId || (accounts[0]?.id || ''));
    setEditExpDesc(exp.description || '');
    setEditExpRef(exp.reference || '');
  };

  // Submit Edit Expense
  const handleUpdateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const amountNum = parseFloat(editExpAmount);
    if (!amountNum || amountNum <= 0) return;

    updateExpense(editingExpense.id, {
      date: editExpDate,
      amount: amountNum,
      paymentMethod: editExpMethod,
      accountId: editExpAccountId,
      description: editExpDesc,
      reference: editExpRef,
    });
    setEditingExpense(null);
  };

  // Confirm Delete Expense
  const handleDeleteExpenseConfirm = () => {
    if (!deletingExpense) return;
    deleteExpense(deletingExpense.id, 'সরবরাহকারী খতিয়ান থেকে ভুল পেমেন্ট সংশোধন/বাতিল');
    setDeletingExpense(null);
  };

  // Open Edit Material Modal
  const handleOpenEditMaterial = (m: MaterialItem) => {
    setEditingMaterial(m);
    setEditMatDate(m.date || new Date().toISOString().split('T')[0]);
    setEditMatName(m.materialName || '');
    setEditMatChallan(m.challanNumber || '');
    setEditMatQty(m.quantity?.toString() || '');
    setEditMatUnit(m.unit || 'ব্যাগ');
    setEditMatRate((m.rate || m.unitRate || 0).toString());
    setEditMatTotal((m.totalAmount || m.totalCost || 0).toString());
  };

  // Submit Edit Material
  const handleUpdateMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    const qty = parseFloat(editMatQty) || 0;
    const rate = parseFloat(editMatRate) || 0;
    const total = parseFloat(editMatTotal) || (qty * rate);

    updateMaterial(editingMaterial.id, {
      date: editMatDate,
      materialName: editMatName,
      challanNumber: editMatChallan,
      quantity: qty,
      unit: editMatUnit,
      rate: rate,
      unitRate: rate,
      totalAmount: total,
      totalCost: total,
    });
    setEditingMaterial(null);
  };

  // Confirm Delete Material
  const handleDeleteMaterialConfirm = () => {
    if (!deletingMaterial) return;
    deleteMaterial(deletingMaterial.id, 'সরবরাহকারী খতিয়ান থেকে ভুল মালামাল চালান সংশোধন/বাতিল');
    setDeletingMaterial(null);
  };

  // Keep live reference of ledger supplier so numbers update dynamically
  const activeLedgerSupplier = ledgerModalSupplier 
    ? (suppliers.find(s => s.id === ledgerModalSupplier.id) || ledgerModalSupplier) 
    : null;

  return (
    <div className="space-y-6">
      
      {/* Main Suppliers Page - Hidden during print if Ledger Modal or Master Print is Open */}
      <div className={(ledgerModalSupplier || isMasterPrintOpen) ? 'print:hidden space-y-6' : 'space-y-6'}>
      
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsMasterPrintOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/90 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs sm:text-sm border border-slate-600 shadow-sm transition active:scale-95 cursor-pointer"
            title={isBn ? 'সকল সরবরাহকারী ও ভেন্ডরের বিস্তারিত হিসাব শিট প্রিন্ট করুন' : 'Print Master Supplier Register'}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print Statement'}</span>
          </button>

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
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-mono mr-1">
                    বকেয়া: <span className="font-bold text-amber-400">৳{supplier.currentDue.toLocaleString()}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(supplier)}
                    className="p-1 rounded bg-slate-700/60 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition cursor-pointer"
                    title={isBn ? 'সরবরাহকারীর তথ্য ও খাত সম্পাদনা করুন' : 'Edit Supplier'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
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

      {/* Edit Supplier Modal */}
      {editModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {isBn ? 'সরবরাহকারী তথ্য ও ক্যাটাগরি সম্পাদনা' : 'Edit Supplier Information'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editModalSupplier.name} ({editModalSupplier.type})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditModalSupplier(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'সরবরাহকারী / প্রতিষ্ঠানের নাম' : 'Supplier / Vendor Name'} *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={isBn ? 'যেমন: মেসার্স স্কয়ার সিমেন্ট ট্রেডার্স' : 'e.g. M/S Square Cement Traders'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Product Category Selection */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-700">
                    {isBn ? 'সরবরাহকৃত প্রধান পণ্য / খাত' : 'Material / Product Type'} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditCustomTypeMode(!isEditCustomTypeMode);
                      if (!isEditCustomTypeMode) {
                        setEditCustomTypeInput('');
                      }
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-800 underline cursor-pointer"
                  >
                    {isEditCustomTypeMode 
                      ? (isBn ? '← ড্রপডাউন তালিকা থেকে নির্বাচন' : '← Select from List') 
                      : (isBn ? '+ নতুন কাস্টম পণ্য যুক্ত করুন' : '+ Add Custom Product Type')}
                  </button>
                </div>

                {!isEditCustomTypeMode ? (
                  <select
                    value={editType}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsEditCustomTypeMode(true);
                      } else {
                        setEditType(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
                  >
                    <optgroup label={isBn ? 'সাধারণ নির্মাণ সামগ্রী' : 'Standard Materials'}>
                      {DEFAULT_SUPPLIER_TYPES.map(t => (
                        <option key={t.id} value={t.id}>
                          {isBn ? t.nameBn : t.nameEn}
                        </option>
                      ))}
                    </optgroup>
                    {customTypes.length > 0 && (
                      <optgroup label={isBn ? 'কাস্টম যোগকৃত খাত' : 'Custom Categories'}>
                        {customTypes.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="CUSTOM">+ {isBn ? 'নতুন কাস্টম খাত লিখুন...' : 'Type New Custom Category...'}</option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={editCustomTypeInput}
                      onChange={(e) => setEditCustomTypeInput(e.target.value)}
                      placeholder={isBn ? 'যেমন: Fire Fighting, Glass Railing, Generator ইত্যাদি' : 'e.g. Fire Fighting, Glass Railing'}
                      className="w-full px-3 py-2 border-2 border-amber-500 bg-amber-50/40 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      autoFocus
                    />
                    <p className="text-[11px] text-amber-700">
                      {isBn ? '💡 এই নতুন খাতটি সংরক্ষিত হবে এবং ভবিষ্যতেও নির্বাচন করতে পারবেন।' : '💡 This new product category will be saved.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল নম্বর' : 'Phone'} *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="01711-000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ঠিকানা' : 'Address'} *</label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder={isBn ? 'যেমন: গাবতলী, ঢাকা / ময়মনসিংহ' : 'e.g. Mymensingh, Dhaka'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পূর্বের বকেয়া (টাকা)' : 'Opening Due (BDT)'}</label>
                  <input
                    type="number"
                    value={editOpeningDue}
                    onChange={(e) => setEditOpeningDue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নোট / মন্তব্য' : 'Notes'}</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={isBn ? 'ব্র্যান্ড বা ডেলিভারি শর্ত...' : 'Delivery conditions...'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalSupplier(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer hover:bg-slate-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm cursor-pointer active:scale-95"
                >
                  {isBn ? 'তথ্য আপডেট করুন' : 'Update Supplier'}
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
      {activeLedgerSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
            
            {/* Modal Header */}
            <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-200 print:hidden">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>{isBn ? 'সরবরাহকারী ক্রয় ও পেমেন্ট খতিয়ান' : 'Supplier Procurement & Payment Ledger'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-slate-800">{activeLedgerSupplier.name}</span> ({activeLedgerSupplier.type}) • <span className="font-mono">{activeLedgerSupplier.phone}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(activeLedgerSupplier)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title={isBn ? 'সরবরাহকারীর মূল তথ্য ও পূর্বের বকেয়া এডিট করুন' : 'Edit Supplier Info'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'তথ্য এডিট' : 'Edit'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPayment(activeLedgerSupplier)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title={isBn ? 'সরাসরি পেমেন্ট এন্ট্রি করুন' : 'Make Payment'}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পেমেন্ট করুন' : 'Pay'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerModalSupplier(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Container */}
            <div id="printable-supplier-ledger" className="space-y-4">
              {/* Company Pad Header on Print */}
              <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h1 className="text-2xl font-black font-serif text-slate-950 tracking-tight">
                  {isBn ? (settings?.companyNameBn || settings?.companyName || 'কনস্ট্রাকশন অ্যাকাউন্টস ও প্রজেক্ট ইআরপি') : (settings?.companyName || settings?.companyNameBn || 'CONSTRUCTION ACCOUNTS & PROJECT ERP')}
                </h1>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  {isBn ? (settings?.addressBn || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ') : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
                </p>
                <div className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded">
                  {isBn ? 'সরবরাহকারী ক্রয় ও পেমেন্ট খতিয়ান স্টেটমেন্ট' : 'SUPPLIER PROCUREMENT & PAYMENT LEDGER'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {isBn ? 'প্রিন্ট তারিখ:' : 'Printed on:'} {new Date().toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Header Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'সরবরাহকারী প্রতিষ্ঠান:' : 'Supplier Name:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{activeLedgerSupplier.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                  <span className="font-bold text-slate-900 font-mono">{activeLedgerSupplier.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'পণ্য / ব্র্যান্ড:' : 'Product Type:'}</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">{activeLedgerSupplier.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'ঠিকানা:' : 'Address:'}</span>
                  <span className="font-bold text-slate-900">{activeLedgerSupplier.address || '—'}</span>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 font-medium block text-[10px]">{isBn ? 'পূর্বের বকেয়া' : 'Opening Due'}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">৳{(activeLedgerSupplier.openingDue || 0).toLocaleString()}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <span className="text-blue-600 font-medium block text-[10px]">{isBn ? 'মোট মালামাল ক্রয়' : 'Total Purchases'}</span>
                  <span className="text-sm font-black text-blue-900 font-mono mt-0.5 block">৳{(activeLedgerSupplier.totalPurchase || 0).toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-emerald-600 font-medium block text-[10px]">{isBn ? 'মোট পরিশোধ' : 'Total Paid'}</span>
                  <span className="text-sm font-black text-emerald-900 font-mono mt-0.5 block">৳{(activeLedgerSupplier.totalPaid || 0).toLocaleString()}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <span className="text-amber-700 font-medium block text-[10px]">{isBn ? 'বর্তমান নিট বাকি' : 'Net Current Due'}</span>
                  <span className="text-sm font-black text-amber-900 font-mono mt-0.5 block">৳{(activeLedgerSupplier.currentDue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Section 1: Materials Deliveries */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>📦 {isBn ? 'মালামাল রিসিভ ও চালান ইতিহাস (Materials Purchased)' : 'Materials Purchased & Challan History'}</span>
                </h4>
                {(() => {
                  const supMaterials = materials.filter(m => 
                    m.supplierId === activeLedgerSupplier.id ||
                    (m.supplierName && m.supplierName.trim().toLowerCase() === activeLedgerSupplier.name.trim().toLowerCase())
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
                            <th className="p-2 text-center print:hidden">{isBn ? 'অ্যাকশন' : 'Action'}</th>
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
                                <td className="p-2 text-center whitespace-nowrap print:hidden">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditMaterial(m)}
                                      className="p-1 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition cursor-pointer"
                                      title={isBn ? 'চালান বা মালামালের তথ্য সম্পাদনা করুন' : 'Edit Delivery'}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingMaterial(m)}
                                      className="p-1 rounded-md bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                                      title={isBn ? 'চালান এন্ট্রি মুছে ফেলুন' : 'Delete Delivery'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
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
                    onClick={() => handleOpenPayment(activeLedgerSupplier)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 cursor-pointer print:hidden"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন পেমেন্ট এন্ট্রি' : 'New Payment'}</span>
                  </button>
                </div>

                {(() => {
                  const supExpenses = expenses.filter(e => 
                    !e.isDeleted && 
                    (e.supplierId === activeLedgerSupplier.id || 
                     (e.paidTo && e.paidTo.trim().toLowerCase() === activeLedgerSupplier.name.trim().toLowerCase()))
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
                            <th className="p-2.5 text-center print:hidden">{isBn ? 'অ্যাকশন (সংশোধন)' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                          {supExpenses.map((exp, idx) => {
                            runningPaidSum += exp.amount;
                            const matchingVoucher = vouchers.find(v => 
                              v.id === exp.voucherId || 
                              v.transactionId === exp.id || 
                              (exp.voucherNumber && v.voucherNumber === exp.voucherNumber)
                            );

                            return (
                              <tr key={exp.id} className="hover:bg-slate-50">
                                <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                                <td className="p-2.5 font-mono whitespace-nowrap">{exp.date}</td>
                                <td className="p-2.5 font-mono font-bold text-amber-700">{exp.voucherNumber || exp.voucherId || '—'}</td>
                                <td className="p-2.5 max-w-xs truncate">{exp.description || exp.category}</td>
                                <td className="p-2.5">{exp.paymentMethod}</td>
                                <td className="p-2.5 text-right font-mono font-bold text-emerald-700">৳{exp.amount.toLocaleString()}</td>
                                <td className="p-2.5 text-center whitespace-nowrap print:hidden">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {matchingVoucher && onSelectVoucher && (
                                      <button
                                        type="button"
                                        onClick={() => onSelectVoucher(matchingVoucher)}
                                        className="p-1 rounded-md bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                                        title={isBn ? 'ভাউচার রসিদ দেখুন ও প্রিন্ট করুন' : 'View Voucher'}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditExpense(exp)}
                                      className="p-1 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition cursor-pointer"
                                      title={isBn ? 'পেমেন্ট ভাউচার সম্পাদনা বা ভুল সংশোধন করুন' : 'Edit Payment'}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingExpense(exp)}
                                      className="p-1 rounded-md bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                                      title={isBn ? 'ভুল পেমেন্ট মুছে ফেলুন ও বকেয়া ফিরিয়ে আনুন' : 'Delete Payment'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200">
                            <td colSpan={5} className="p-2.5 text-right">{isBn ? 'সর্বমোট প্রদানকৃত টাকা:' : 'Total Paid:'}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-800 text-sm">৳{runningPaidSum.toLocaleString()}</td>
                            <td className="p-2.5 print:hidden"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Signatures on Print */}
              <div className="hidden print:grid grid-cols-4 gap-4 pt-12 text-center text-xs">
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'প্রস্তুতকারী' : 'Prepared By'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'হিসাব শাখা' : 'Accounts'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'নিরীক্ষক' : 'Auditor'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                  </div>
                </div>
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

      {/* Master Print Register Modal for All Suppliers */}
      {isMasterPrintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl p-4 sm:p-6 space-y-4 max-h-[95vh] overflow-y-auto font-sans print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {isBn ? 'সকল সরবরাহকারী ও ভেন্ডর খতিয়ান প্রিন্ট' : 'All Suppliers & Vendors Master Statement'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'সকল সরবরাহকারীদের মোট ক্রয়, পরিশোধ ও বকেয়ার পূর্ণাঙ্গ সারসংক্ষেপ ও প্রিন্ট কপি' : 'Consolidated master register of procurement, payments and dues'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? 'প্রিন্ট করুন' : 'Print Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMasterPrintOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div id="printable-all-suppliers" className="space-y-4">
              {/* Company Pad Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 tracking-tight">
                  {isBn ? (settings?.companyNameBn || settings?.companyName || 'কনস্ট্রাকশন অ্যাকাউন্টস ও প্রজেক্ট ইআরপি') : (settings?.companyName || settings?.companyNameBn || 'CONSTRUCTION ACCOUNTS & PROJECT ERP')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                  {isBn ? (settings?.addressBn || '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ') : (settings?.address || '21, 22 Durgabari Road, Mymensingh')}
                </p>
                <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded">
                  {isBn ? 'সকল সরবরাহকারী ও ভেন্ডর ক্রয় ও বকেয়া খতিয়ান রেজিস্টার' : 'SUPPLIERS & VENDORS MASTER DUES & PAYMENT REGISTER'}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-1">
                  <span>{isBn ? 'মোট সরবরাহকারী:' : 'Total Suppliers:'} {filtered.length} {isBn ? 'জন/প্রতিষ্ঠান' : ''}</span>
                  <span>{isBn ? 'মুদ্রণের তারিখ:' : 'Print Date:'} {new Date().toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 font-medium block text-[10px]">{isBn ? 'মোট প্রতিষ্ঠান' : 'Total Vendors'}</span>
                  <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">{filtered.length}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <span className="text-blue-600 font-medium block text-[10px]">{isBn ? 'মোট মালামাল ক্রয়' : 'Total Purchases'}</span>
                  <span className="text-sm font-black text-blue-900 font-mono mt-0.5 block">৳{totalPurchases.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-emerald-600 font-medium block text-[10px]">{isBn ? 'মোট পরিশোধ' : 'Total Paid'}</span>
                  <span className="text-sm font-black text-emerald-900 font-mono mt-0.5 block">৳{totalPaid.toLocaleString()}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <span className="text-amber-700 font-medium block text-[10px]">{isBn ? 'বর্তমান সর্বমোট বকেয়া' : 'Total Outstanding'}</span>
                  <span className="text-sm font-black text-amber-900 font-mono mt-0.5 block">৳{totalDue.toLocaleString()}</span>
                </div>
              </div>

              {/* Master Table */}
              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2">{isBn ? 'সরবরাহকারী / প্রতিষ্ঠান' : 'Supplier Name'}</th>
                      <th className="p-2">{isBn ? 'পণ্য / ব্র্যান্ড' : 'Product Type'}</th>
                      <th className="p-2">{isBn ? 'যোগাযোগ ও ঠিকানা' : 'Contact & Address'}</th>
                      <th className="p-2 text-right">{isBn ? 'মোট ক্রয়' : 'Purchases'}</th>
                      <th className="p-2 text-right">{isBn ? 'পরিশোধিত' : 'Paid'}</th>
                      <th className="p-2 text-right">{isBn ? 'বর্তমান বকেয়া' : 'Net Due'}</th>
                      <th className="p-2 text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                    {filtered.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2">
                          <span className="font-bold text-slate-900 block">{s.name}</span>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold">
                            {s.type}
                          </span>
                        </td>
                        <td className="p-2 text-[11px]">
                          <span className="font-mono text-slate-700 block">{s.phone || '—'}</span>
                          <span className="text-slate-500 block truncate max-w-[160px]">{s.address || '—'}</span>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-blue-900">৳{s.totalPurchase.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-700">৳{s.totalPaid.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold text-amber-900">৳{s.currentDue.toLocaleString()}</td>
                        <td className="p-2 text-center">
                          {s.currentDue > 0 ? (
                            <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold">
                              {isBn ? 'বকেয়া' : 'Due'}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                              {isBn ? 'পরিশোধিত' : 'Clear'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={4} className="p-2 text-right">{isBn ? 'সর্বমোট (Grand Total):' : 'Grand Total:'}</td>
                      <td className="p-2 text-right font-mono text-blue-900 text-sm">৳{totalPurchases.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-emerald-800 text-sm">৳{totalPaid.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-amber-950 text-sm">৳{totalDue.toLocaleString()}</td>
                      <td className="p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures on Print */}
              <div className="hidden print:grid grid-cols-4 gap-4 pt-16 text-center text-xs">
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'প্রস্তুতকারী' : 'Prepared By'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'হিসাব শাখা' : 'Accounts Officer'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'নিরীক্ষক' : 'Auditor'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-36 border-t border-slate-900 pt-1 font-bold text-slate-900">
                    {isBn ? 'ব্যবস্থাপনা পরিচালক' : 'Managing Director'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setIsMasterPrintOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment (Expense) Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {isBn ? 'পেমেন্ট ভাউচার সংশোধন ও এডিট' : 'Edit Payment Voucher'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {editingExpense.voucherNumber || editingExpense.id} • {editingExpense.paidTo}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingExpense(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpenseSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="1"
                    value={editExpAmount}
                    onChange={(e) => setEditExpAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'} *</label>
                  <select
                    value={editExpMethod}
                    onChange={(e) => setEditExpMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="CASH">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                    <option value="BANK_TRANSFER">{isBn ? 'ব্যাংক ট্রান্সফার (Bank Transfer)' : 'Bank Transfer'}</option>
                    <option value="CHEQUE">{isBn ? 'চেক (Cheque)' : 'Cheque'}</option>
                    <option value="MOBILE_BANKING">{isBn ? 'মোবাইল ব্যাংকিং (Bkash/Nagad)' : 'Mobile Banking'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পরিশোধের অ্যাকাউন্ট' : 'Account'} *</label>
                  <select
                    value={editExpAccountId}
                    onChange={(e) => setEditExpAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountNumber || acc.type}) - ব্যালেন্স: ৳{acc.currentBalance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'রেফারেন্স / চেক নং / ট্রানজ্যাকশন আইডি' : 'Reference / Cheque No'}</label>
                <input
                  type="text"
                  value={editExpRef}
                  onChange={(e) => setEditExpRef(e.target.value)}
                  placeholder={isBn ? 'যেমন: CQ-991204 / TrxID' : 'e.g. CQ-991204'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পেমেন্ট বিবরণ / মন্তব্য' : 'Description / Notes'}</label>
                <input
                  type="text"
                  value={editExpDesc}
                  onChange={(e) => setEditExpDesc(e.target.value)}
                  placeholder={isBn ? 'মালামালের বিল বাবদ পরিশোধ...' : 'Payment purpose...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer hover:bg-slate-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm cursor-pointer active:scale-95"
                >
                  {isBn ? 'ভাউচার আপডেট করুন' : 'Update Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg">{isBn ? 'ভুল পেমেন্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Payment'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে ভাউচার নং ${deletingExpense.voucherNumber || deletingExpense.id}-এর ৳${deletingExpense.amount.toLocaleString()} টাকার পেমেন্ট এন্ট্রি মুছে ফেলতে চান? এটি মুছে ফেললে সরবরাহকারীর বকেয়া পুনরায় সমন্বয় হবে এবং ব্যাংক/ক্যাশ ব্যালেন্সে টাকা সমন্বয় হবে।` 
                : `Are you sure you want to delete payment voucher ${deletingExpense.voucherNumber || deletingExpense.id} of ৳${deletingExpense.amount.toLocaleString()}? This will reverse the account balance and update supplier dues.`}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer hover:bg-slate-100 text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteExpenseConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-sm cursor-pointer active:scale-95 text-xs"
              >
                {isBn ? 'হ্যাঁ, পেমেন্ট মুছে ফেলুন' : 'Yes, Delete Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Item Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {isBn ? 'চালান ও মালামাল ডেলিভারি এডিট' : 'Edit Material Delivery'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {editingMaterial.materialName} • {editingMaterial.challanNumber || 'No Challan'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingMaterial(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMaterialSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={editMatDate}
                    onChange={(e) => setEditMatDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'চালান নম্বর' : 'Challan No'}</label>
                  <input
                    type="text"
                    value={editMatChallan}
                    onChange={(e) => setEditMatChallan(e.target.value)}
                    placeholder="CH-00129"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মালামাল / পণ্যের নাম' : 'Material Name'} *</label>
                <input
                  type="text"
                  required
                  value={editMatName}
                  onChange={(e) => setEditMatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'পরিমাণ' : 'Quantity'} *</label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={editMatQty}
                    onChange={(e) => {
                      const newQty = e.target.value;
                      setEditMatQty(newQty);
                      const q = parseFloat(newQty) || 0;
                      const r = parseFloat(editMatRate) || 0;
                      if (q && r) setEditMatTotal((q * r).toString());
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'একক (Unit)' : 'Unit'}</label>
                  <input
                    type="text"
                    value={editMatUnit}
                    onChange={(e) => setEditMatUnit(e.target.value)}
                    placeholder="ব্যাগ / টন / সিএফটি"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'দর (Rate)' : 'Rate'}</label>
                  <input
                    type="number"
                    step="any"
                    value={editMatRate}
                    onChange={(e) => {
                      const newRate = e.target.value;
                      setEditMatRate(newRate);
                      const q = parseFloat(editMatQty) || 0;
                      const r = parseFloat(newRate) || 0;
                      if (q && r) setEditMatTotal((q * r).toString());
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মোট বিল (Total Amount)' : 'Total Bill'} *</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={editMatTotal}
                  onChange={(e) => setEditMatTotal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer hover:bg-slate-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm cursor-pointer active:scale-95"
                >
                  {isBn ? 'চালান আপডেট করুন' : 'Update Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Material Confirmation Modal */}
      {deletingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg">{isBn ? 'মালামাল চালান মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Material'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে "${deletingMaterial.materialName}"-এর চালান এন্ট্রি (৳${(deletingMaterial.totalAmount || deletingMaterial.totalCost || 0).toLocaleString()}) মুছে ফেলতে চান? এটি মুছে ফেললে সরবরাহকারীর মোট ক্রয় ও বকেয়া হিসাব থেকে এই টাকা বাদ যাবে।` 
                : `Are you sure you want to delete material delivery "${deletingMaterial.materialName}" of ৳${(deletingMaterial.totalAmount || deletingMaterial.totalCost || 0).toLocaleString()}? This will update the supplier purchase and due balances.`}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeletingMaterial(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer hover:bg-slate-100 text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteMaterialConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-sm cursor-pointer active:scale-95 text-xs"
              >
                {isBn ? 'হ্যাঁ, চালান মুছে ফেলুন' : 'Yes, Delete Material'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
