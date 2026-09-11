/**
 * Contractors Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Building, 
  CreditCard, 
  CheckCircle2, 
  X,
  Hammer,
  Trash2,
  AlertCircle,
  Pencil,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../i18n/formatters';
import { Contractor } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const DEFAULT_CONTRACTOR_TYPES = [
  { id: 'MASON', nameBn: 'Civil & Mason / রাজমিস্ত্রি ও ঢালাই', nameEn: 'Civil & Masonry' },
  { id: 'ROD_BINDER', nameBn: 'Rod Binder / রড মিস্ত্রি ও বাইন্ডিং', nameEn: 'Rod Binding' },
  { id: 'CARPENTER', nameBn: 'Carpenter & Shuttering / কাঠমিস্ত্রি ও শাটারিং', nameEn: 'Carpenter & Shuttering' },
  { id: 'TILES', nameBn: 'Tiles & Marble / টাইলস ও মার্বেল মিস্ত্রি', nameEn: 'Tiles & Marble' },
  { id: 'ELECTRICIAN', nameBn: 'Electrician / বৈদ্যুতিক ওয়্যারিং ও মিস্ত্রি', nameEn: 'Electrical & Wiring' },
  { id: 'PLUMBER', nameBn: 'Plumber & Sanitary / প্লাম্বার ও পাইপ ফিটিংস', nameEn: 'Plumbing & Sanitary' },
  { id: 'PAINTER', nameBn: 'Painter & Putty / রঙ মিস্ত্রি ও পুটিং', nameEn: 'Painting & Finishing' },
  { id: 'GRILL_WELDING', nameBn: 'Grill & Fabrication / গ্রিল, গেট ও ওয়েল্ডিং', nameEn: 'Grill & Fabrication' },
  { id: 'ALUMINIUM_GLASS', nameBn: 'Aluminium & Glass / থাই গ্লাস ও অ্যালুমিনিয়াম', nameEn: 'Aluminium & Thai Glass' },
  { id: 'PILING', nameBn: 'Piling & Boring / পাইলিং ও বোরিং ঠিকাদার', nameEn: 'Piling & Boring' },
  { id: 'EARTH_EXCAVATION', nameBn: 'Earthwork & Excavation / মাটি কাটা ও ভরাট', nameEn: 'Earthwork & Excavation' },
  { id: 'FALSE_CEILING', nameBn: 'Gypsum & False Ceiling / জিপসাম ও ফলস সিলিং', nameEn: 'Gypsum & False Ceiling' },
  { id: 'WATERPROOFING', nameBn: 'Waterproofing / ওয়াটারপ্রুফিং ও ছাদ ড্যাম্প প্রুফ', nameEn: 'Waterproofing & Insulation' },
  { id: 'HVAC_AC', nameBn: 'HVAC & AC Technician / এসি ও সেন্ট্রাল ডাক্ট', nameEn: 'HVAC & AC' },
  { id: 'LIFT_ELEVATOR', nameBn: 'Elevator & Lift / লিফট ইনস্টলেশন', nameEn: 'Elevator & Lift Installation' },
  { id: 'INTERIOR_DECOR', nameBn: 'Interior Decorator / ইন্টেরিয়র ডিজাইন ও ডেকোরেশন', nameEn: 'Interior Decorator' },
  { id: 'FIRE_FIGHTING', nameBn: 'Fire Safety & Hydrant / ফায়ার সেফটি সিস্টেম', nameEn: 'Fire Fighting System' },
  { id: 'CIVIL_CONTRACTOR', nameBn: 'Main Civil Contractor / মূল সিভিল ঠিকাদার', nameEn: 'Main Civil Contractor' },
  { id: 'STEEL_SHED', nameBn: 'Steel Shed & Truss / স্টিল শেড ও ট্রাস', nameEn: 'Steel Shed & Truss' },
  { id: 'LANDSCAPING', nameBn: 'Landscaping & Gardening / ল্যান্ডস্কেপিং ও গার্ডেন', nameEn: 'Landscaping & Gardening' },
  { id: 'SECURITY_CCTV', nameBn: 'CCTV & Security / সিসিটিভি ও সিকিউরিটি সিস্টেম', nameEn: 'CCTV & Security Systems' },
  { id: 'OTHER', nameBn: 'Other Trade / অন্যান্য কাজ', nameEn: 'Other Trade' },
];

export const getContractorTypeLabel = (typeKey: string, isBn: boolean) => {
  const match = DEFAULT_CONTRACTOR_TYPES.find(t => t.id === typeKey);
  if (match) return isBn ? match.nameBn : match.nameEn;
  return typeKey;
};

interface ContractorsViewProps {
  onOpenNewContractorPayment: () => void;
}

export const ContractorsView: React.FC<ContractorsViewProps> = ({ onOpenNewContractorPayment }) => {
  const { language } = useLanguage();
  const { contractors, projects, expenses, addContractor, updateContractor, deleteContractor, selectedProjectId = 'ALL' } = useData();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId || 'ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalContractor, setDeleteModalContractor] = useState<Contractor | null>(null);

  // Sync with global header project selector
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Custom Contractor Trade Types handling & persistence
  const [customContractorTypes, setCustomContractorTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('skrp_custom_contractor_types');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Add Modal custom type state
  const [isAddCustomTypeMode, setIsAddCustomTypeMode] = useState(false);
  const [addCustomTypeInput, setAddCustomTypeInput] = useState('');

  // Edit Modal custom type state
  const [isEditCustomTypeMode, setIsEditCustomTypeMode] = useState(false);
  const [editCustomTypeInput, setEditCustomTypeInput] = useState('');

  // Edit Modal State
  const [editModalContractor, setEditModalContractor] = useState<Contractor | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('MASON');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editContractAmount, setEditContractAmount] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Completed' | 'Suspended'>('Active');

  const isBn = language === 'bn';

  const handleDeleteConfirm = () => {
    if (!deleteModalContractor) return;
    deleteContractor(deleteModalContractor.id);
    setDeleteModalContractor(null);
  };

  const openEditModal = (c: Contractor) => {
    setEditModalContractor(c);
    setEditName(c.name);

    // Check if contractor type is a standard one
    const isStandard = DEFAULT_CONTRACTOR_TYPES.some(t => t.id === c.type);
    if (isStandard) {
      setEditType(c.type);
      setIsEditCustomTypeMode(false);
      setEditCustomTypeInput('');
    } else {
      setEditType('__CUSTOM__');
      setIsEditCustomTypeMode(true);
      setEditCustomTypeInput(c.type || '');
    }

    setEditPhone(c.phone || '');
    setEditAddress(c.address || '');
    setEditProjectId(c.projectId || (projects[0]?.id || ''));
    setEditContractAmount(c.contractAmount > 0 ? c.contractAmount.toString() : '');
    setEditStatus(c.status || 'Active');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalContractor) return;
    const project = projects.find(p => p.id === editProjectId);
    const parsedContractAmount = parseFloat(editContractAmount) || 0;

    let finalType = editType;
    if (isEditCustomTypeMode && editCustomTypeInput.trim()) {
      finalType = editCustomTypeInput.trim();
      if (!customContractorTypes.some(t => t.toLowerCase() === finalType.toLowerCase())) {
        const updated = [...customContractorTypes, finalType];
        setCustomContractorTypes(updated);
        try {
          localStorage.setItem('skrp_custom_contractor_types', JSON.stringify(updated));
        } catch {}
      }
    }

    updateContractor(editModalContractor.id, {
      name: editName,
      type: finalType,
      phone: editPhone,
      address: editAddress,
      projectId: editProjectId,
      projectName: project?.name || editModalContractor.projectName,
      contractAmount: parsedContractAmount,
      status: editStatus,
    });
    setEditModalContractor(null);
    setIsEditCustomTypeMode(false);
    setEditCustomTypeInput('');
  };

  // State for Ledger and Bill modals
  const [ledgerModalContractor, setLedgerModalContractor] = useState<Contractor | null>(null);
  const [billModalContractor, setBillModalContractor] = useState<Contractor | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [billDescription, setBillDescription] = useState('');

  const { ledger, settings } = useData();

  const handleAddBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billModalContractor) return;
    const amount = parseFloat(billAmount) || 0;
    if (amount <= 0) return;

    const newContractAmount = (billModalContractor.contractAmount || 0) + amount;
    const newTotalBill = (billModalContractor.totalBill || 0) + amount;
    const newDue = Math.max(0, newContractAmount - (billModalContractor.paidAmount || 0));

    updateContractor(billModalContractor.id, {
      contractAmount: newContractAmount,
      totalBill: newTotalBill,
      dueAmount: newDue,
    });

    setBillModalContractor(null);
    setBillAmount('');
    setBillDescription('');
  };
  const [name, setName] = useState('');
  const [type, setType] = useState('MASON');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [contractAmount, setContractAmount] = useState('');

  // Helper function to dynamically compute financial metrics for a contractor
  const getContractorMetrics = (c: Contractor) => {
    const cExpenses = expenses.filter(e => 
      !e.isDeleted && 
      (e.contractorId === c.id || 
       (e.paidTo && e.paidTo.trim().toLowerCase() === c.name.trim().toLowerCase()))
    );
    const paidAmount = cExpenses.reduce((sum, e) => sum + e.amount, 0);
    const contractAmount = (c.contractAmount && c.contractAmount > 0) ? c.contractAmount : (c.totalBill || 0);
    const dueAmount = Math.max(0, contractAmount - paidAmount);
    const percentPaid = contractAmount > 0 ? Math.min(100, Math.round((paidAmount / contractAmount) * 100)) : 0;
    return { paidAmount, contractAmount, dueAmount, percentPaid };
  };

  const filtered = contractors.filter(c => {
    if (filterProject !== 'ALL' && c.projectId && c.projectId !== filterProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.projectName && c.projectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalContract = filtered.reduce((sum, c) => sum + getContractorMetrics(c).contractAmount, 0);
  const totalPaid = filtered.reduce((sum, c) => sum + getContractorMetrics(c).paidAmount, 0);
  const totalDue = filtered.reduce((sum, c) => sum + getContractorMetrics(c).dueAmount, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === projectId);

    let finalType = type;
    if (isAddCustomTypeMode && addCustomTypeInput.trim()) {
      finalType = addCustomTypeInput.trim();
      if (!customContractorTypes.some(t => t.toLowerCase() === finalType.toLowerCase())) {
        const updated = [...customContractorTypes, finalType];
        setCustomContractorTypes(updated);
        try {
          localStorage.setItem('skrp_custom_contractor_types', JSON.stringify(updated));
        } catch {}
      }
    }

    addContractor({
      name,
      type: finalType,
      phone,
      address,
      projectId,
      projectName: project?.name,
      contractAmount: parseFloat(contractAmount) || 0,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    setContractAmount('');
    setIsAddCustomTypeMode(false);
    setAddCustomTypeInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Main Contractors Page - Hidden during print if Ledger Modal is Open */}
      <div className={ledgerModalContractor ? 'print:hidden space-y-6' : 'space-y-6'}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>{isBn ? 'কন্ট্রাক্টর ব্যবস্থাপনা ও চুক্তি' : 'Contractors & Sub-Contractor Management'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBn 
              ? 'কার্পেন্টার, ইলেক্ট্রিশিয়ান, পেইন্টার, প্লাম্বার, রড বাইন্ডার ও টাইলস মিস্ত্রিদের চুক্তি, বিল ও বকেয়া হিসাব' 
              : 'Contract agreement amounts, running bills, paid installments, and outstanding balances'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewContractorPayment}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isBn ? 'পেমেন্ট করুন' : 'Pay Contractor'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? '+ নতুন কন্ট্রাক্টর' : '+ Add Contractor'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">{isBn ? 'মোট চুক্তি মূল্য' : 'Total Contracts'}</span>
            <h3 className="text-xl font-mono font-black text-slate-100 mt-0.5">
              {formatCurrency(totalContract, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Hammer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">{isBn ? 'পরিশোধিত টাকা' : 'Total Paid'}</span>
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
            <span className="text-xs text-slate-400 block font-medium">{isBn ? 'মোট বকেয়া পাওনা' : 'Total Due Amount'}</span>
            <h3 className="text-xl font-mono font-black text-rose-400 mt-0.5">
              {formatCurrency(totalDue, isBn ? 'bn' : 'en')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            ৳
          </div>
        </div>
      </div>

      {/* Search & Project Filter Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex items-center gap-2 w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'কন্ট্রাক্টরের নাম, কাজের ধরণ (Carpenter, Electrician) বা ফোন দিয়ে খুঁজুন...' : 'Search by name, trade type, phone...'}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border border-slate-700 bg-slate-900 rounded-xl px-3 py-1.5 outline-hidden font-medium text-slate-200 cursor-pointer w-full md:w-56"
          >
            <option value="ALL">{isBn ? 'সকল প্রজেক্টের কন্ট্রাক্টর' : 'All Projects'}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Contractors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((contractor) => {
          const metrics = getContractorMetrics(contractor);

          return (
            <div 
              key={contractor.id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-600 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[11px]">
                      {getContractorTypeLabel(contractor.type, isBn)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {contractor.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-100 mt-1">
                    {contractor.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{contractor.phone}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
                    {contractor.projectName}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(contractor)}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition cursor-pointer"
                    title={isBn ? 'কন্ট্রাক্টরের তথ্য সংশোধন / এডিট' : 'Edit Contractor'}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalContractor(contractor)}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                    title={isBn ? 'কন্ট্রাক্টর মুছে ফেলুন' : 'Delete Contractor'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">
                    {isBn ? 'পরিশোধ সম্পন্ন' : 'Paid'}: <span className="font-mono text-emerald-400">{metrics.percentPaid}%</span>
                  </span>
                  <span className="text-rose-400 font-mono font-bold">
                    {isBn ? 'বাকি' : 'Due'}: ৳{metrics.dueAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics.percentPaid}%` }} />
                </div>
              </div>

              {/* Financial Box */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-700/60">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isBn ? 'চুক্তি / বিল' : 'Contract/Bill'}</span>
                  <span className="font-bold text-slate-200 font-mono">৳{metrics.contractAmount.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isBn ? 'পরিশোধিত' : 'Paid'}</span>
                  <span className="font-bold text-emerald-400 font-mono">৳{metrics.paidAmount.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">{isBn ? 'বকেয়া' : 'Due'}</span>
                  <span className="font-bold text-rose-400 font-mono">৳{metrics.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLedgerModalContractor(contractor)}
                  className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>{isBn ? 'খতিয়ান' : 'Ledger'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillModalContractor(contractor);
                    setBillAmount('');
                    setBillDescription('');
                  }}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBn ? '+ রানিং বিল' : '+ Add Bill'}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenNewContractorPayment}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পেমেন্ট' : 'Pay'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Contractor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {isBn ? 'নতুন কন্ট্রাক্টর নিবন্ধন' : 'Register New Contractor'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'কন্ট্রাক্টরের নাম' : 'Contractor Name'} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rafiqul Islam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-3">
                {/* Trade Type Selection with Custom Input Toggle */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                      {isBn ? 'কাজের ধরণ / ট্রেড' : 'Trade / Work Type'} *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddCustomTypeMode(!isAddCustomTypeMode);
                        if (!isAddCustomTypeMode) {
                          setAddCustomTypeInput('');
                        }
                      }}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition cursor-pointer"
                    >
                      {isAddCustomTypeMode ? (
                        <span>📋 {isBn ? 'ড্রপডাউন তালিকা দেখুন' : 'Select from List'}</span>
                      ) : (
                        <span>✍️ {isBn ? 'হাতে লিখুন (Custom)' : 'Type Custom Trade'}</span>
                      )}
                    </button>
                  </div>

                  {isAddCustomTypeMode ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        value={addCustomTypeInput}
                        onChange={(e) => setAddCustomTypeInput(e.target.value)}
                        placeholder={isBn ? 'যেমন: সুইমিং পুল স্পেশালিস্ট / সাউন্ডপ্রুফিং / ল্যান্ডস্কেপ...' : 'e.g. Swimming Pool Specialist, Soundproofing, Landscape...'}
                        className="w-full px-3 py-2 border-2 border-indigo-500 bg-white rounded-lg text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                        autoFocus
                      />
                      <p className="text-[11px] text-indigo-800 font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{isBn ? 'এই ট্রেডটি স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে এবং পরবর্তীতে ড্রপডাউন তালিকায় পাওয়া যাবে।' : 'This custom trade type will be saved and reused in future dropdowns.'}</span>
                      </p>
                    </div>
                  ) : (
                    <select
                      value={type}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsAddCustomTypeMode(true);
                          setAddCustomTypeInput('');
                        } else {
                          setType(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <optgroup label={isBn ? 'সাধারণ কনস্ট্রাকশন কাজের ধরণ' : 'Standard Construction Trades'}>
                        {DEFAULT_CONTRACTOR_TYPES.map(t => (
                          <option key={t.id} value={t.id}>
                            {isBn ? t.nameBn : t.nameEn}
                          </option>
                        ))}
                      </optgroup>

                      {customContractorTypes.length > 0 && (
                        <optgroup label={isBn ? '✨ আপনার সেভ করা কাজের ধরণসমূহ' : '✨ Saved Custom Trade Types'}>
                          {customContractorTypes.map(ct => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <option value="__CUSTOM__">
                        ✍️ {isBn ? '+ নতুন কাজের ধরণ নিজে হাতে লিখুন...' : '+ Type custom work type...'}
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'} *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নিযুক্ত প্রকল্প' : 'Project'} *</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">{isBn ? 'মোট চুক্তি মূল্য (টাকা)' : 'Contract Amount (BDT)'}</label>
                    <span className="text-[11px] text-slate-500 font-normal">({isBn ? 'ঐচ্ছিক' : 'Optional'})</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={contractAmount}
                    onChange={(e) => setContractAmount(e.target.value)}
                    placeholder={isBn ? 'যেমন: ৩০০০০০ (ঐচ্ছিক / ফাঁকা রাখা যাবে)' : 'e.g. 300000 (Optional)'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ঠিকানা / নোট' : 'Address / Notes'}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mohammadpur, Dhaka"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Contractor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contractor Modal */}
      {deleteModalContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'কন্ট্রাক্টর ডিলিট নিশ্চিতকরণ' : 'Confirm Contractor Deletion'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? `আপনি কি নিশ্চিত যে কন্ট্রাক্টর "${deleteModalContractor.name}" এর চুক্তি ও প্রোফাইল মুছে ফেলতে চান?`
                : `Are you sure you want to delete contractor "${deleteModalContractor.name}"?`}
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalContractor(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete Contractor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contractor Modal */}
      {editModalContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
                  <Pencil className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {isBn ? 'কন্ট্রাক্টর তথ্য সংশোধন' : 'Edit Contractor Profile'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'কন্ট্রাক্টরের নাম, কাজের ধরণ, চুক্তি মূল্য ও প্রজেক্ট পরিবর্তন করুন' : 'Update contractor details, contract value or project'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEditModalContractor(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'কন্ট্রাক্টরের নাম' : 'Contractor Name'} *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Rafiqul Islam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-3">
                {/* Trade Type Selection with Custom Input Toggle for Edit Modal */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                      {isBn ? 'কাজের ধরণ / ট্রেড' : 'Trade / Work Type'} *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditCustomTypeMode(!isEditCustomTypeMode);
                        if (!isEditCustomTypeMode) {
                          setEditCustomTypeInput('');
                        }
                      }}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition cursor-pointer"
                    >
                      {isEditCustomTypeMode ? (
                        <span>📋 {isBn ? 'ড্রপডাউন তালিকা দেখুন' : 'Select from List'}</span>
                      ) : (
                        <span>✍️ {isBn ? 'হাতে লিখুন (Custom)' : 'Type Custom Trade'}</span>
                      )}
                    </button>
                  </div>

                  {isEditCustomTypeMode ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        value={editCustomTypeInput}
                        onChange={(e) => setEditCustomTypeInput(e.target.value)}
                        placeholder={isBn ? 'যেমন: সুইমিং পুল স্পেশালিস্ট / সাউন্ডপ্রুফিং / ল্যান্ডস্কেপ...' : 'e.g. Swimming Pool Specialist, Soundproofing, Landscape...'}
                        className="w-full px-3 py-2 border-2 border-indigo-500 bg-white rounded-lg text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                        autoFocus
                      />
                      <p className="text-[11px] text-indigo-800 font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{isBn ? 'এই ট্রেডটি স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে এবং পরবর্তীতে ড্রপডাউন তালিকায় পাওয়া যাবে।' : 'This custom trade type will be saved and reused in future dropdowns.'}</span>
                      </p>
                    </div>
                  ) : (
                    <select
                      value={editType}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsEditCustomTypeMode(true);
                          setEditCustomTypeInput('');
                        } else {
                          setEditType(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <optgroup label={isBn ? 'সাধারণ কনস্ট্রাকশন কাজের ধরণ' : 'Standard Construction Trades'}>
                        {DEFAULT_CONTRACTOR_TYPES.map(t => (
                          <option key={t.id} value={t.id}>
                            {isBn ? t.nameBn : t.nameEn}
                          </option>
                        ))}
                      </optgroup>

                      {customContractorTypes.length > 0 && (
                        <optgroup label={isBn ? '✨ আপনার সেভ করা কাজের ধরণসমূহ' : '✨ Saved Custom Trade Types'}>
                          {customContractorTypes.map(ct => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <option value="__CUSTOM__">
                        ✍️ {isBn ? '+ নতুন কাজের ধরণ নিজে হাতে লিখুন...' : '+ Type custom work type...'}
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+880 17..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নিযুক্ত প্রকল্প' : 'Project'} *</label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">{isBn ? 'মোট চুক্তি মূল্য (টাকা)' : 'Contract Amount (BDT)'}</label>
                    <span className="text-[11px] text-slate-500 font-normal">({isBn ? 'ঐচ্ছিক' : 'Optional'})</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editContractAmount}
                    onChange={(e) => setEditContractAmount(e.target.value)}
                    placeholder={isBn ? 'যেমন: ৩০০০০০ (ঐচ্ছিক / ফাঁকা রাখা যাবে)' : 'e.g. 300000 (Optional)'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'কাজের অবস্থা (Status)' : 'Status'}</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Active">{isBn ? 'চলমান (Active)' : 'Active'}</option>
                    <option value="Completed">{isBn ? 'সমাপ্ত (Completed)' : 'Completed'}</option>
                    <option value="Suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ঠিকানা / নোট' : 'Address / Notes'}</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Mohammadpur, Dhaka"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalContractor(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm cursor-pointer transition"
                >
                  {isBn ? 'সংরক্ষণ ও আপডেট' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div> {/* End of Main Contractors Page Wrapper */}

      {/* Contractor Ledger Statement Modal */}
      {ledgerModalContractor && (
        <div 
          id="contractor-ledger-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block printable-modal"
        >
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl p-6 space-y-5 my-8 print:border-none print:shadow-none print:max-w-none print:w-full print:m-0 print:p-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <span>{isBn ? 'কন্ট্রাক্টর খতিয়ান ও লেনদেন হিসাব বিবরণী' : 'Contractor Ledger Statement'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ledgerModalContractor.name} ({getContractorTypeLabel(ledgerModalContractor.type, isBn)}) • {ledgerModalContractor.projectName || 'General Project'}
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <span>🖨️ {isBn ? 'প্রিন্ট স্টেটমেন্ট' : 'Print Statement'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerModalContractor(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Container */}
            <div id="printable-contractor-ledger" className="space-y-4">
              {/* Header Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'কন্ট্রাক্টরের নাম:' : 'Contractor Name:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{ledgerModalContractor.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'ফোন নম্বর:' : 'Phone:'}</span>
                  <span className="font-bold text-slate-900">{ledgerModalContractor.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'কাজের ধরণ:' : 'Trade:'}</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{getContractorTypeLabel(ledgerModalContractor.type, isBn)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'প্রজেক্ট:' : 'Project:'}</span>
                  <span className="font-bold text-slate-900">{ledgerModalContractor.projectName || '—'}</span>
                </div>
              </div>

              {/* Summary Bar */}
              {(() => {
                const modalMetrics = getContractorMetrics(ledgerModalContractor);
                return (
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                      <span className="text-blue-600 font-medium block text-[11px]">{isBn ? 'মোট চুক্তি / রানিং বিল' : 'Total Contract/Bills'}</span>
                      <span className="text-base font-black text-blue-900 font-mono mt-0.5 block">৳{modalMetrics.contractAmount.toLocaleString()}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                      <span className="text-emerald-600 font-medium block text-[11px]">{isBn ? 'মোট পরিশোধিত টাকা' : 'Total Paid'}</span>
                      <span className="text-base font-black text-emerald-900 font-mono mt-0.5 block">৳{modalMetrics.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                      <span className="text-rose-600 font-medium block text-[11px]">{isBn ? 'বর্তমান বকেয়া' : 'Current Due Balance'}</span>
                      <span className="text-base font-black text-rose-900 font-mono mt-0.5 block">৳{modalMetrics.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Transactions Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
                  {isBn ? 'পেমেন্ট ও লেজার লেনদেন ইতিহাস' : 'Payment & Ledger History'}
                </h4>
                {(() => {
                  const contractorExpenses = expenses.filter(e => 
                    !e.isDeleted && 
                    (e.contractorId === ledgerModalContractor.id || 
                     (e.paidTo && e.paidTo.trim().toLowerCase() === ledgerModalContractor.name.trim().toLowerCase()))
                  );

                  if (contractorExpenses.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        {isBn ? 'এই কন্ট্রাক্টরের জন্য এখনো কোনো পেমেন্ট লেনদেন রেকর্ড করা হয়নি।' : 'No payment transaction records found for this contractor yet.'}
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
                            <th className="p-2.5">{isBn ? 'বিবরণ / কাজ' : 'Description'}</th>
                            <th className="p-2.5">{isBn ? 'পেমেন্ট মেথড' : 'Method'}</th>
                            <th className="p-2.5 text-right">{isBn ? 'টাকা প্রদান (Debit)' : 'Paid (Debit)'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                          {contractorExpenses.map((exp, idx) => {
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
                onClick={() => setLedgerModalContractor(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Running Bill Modal */}
      {billModalContractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <span>{isBn ? 'রানিং কাজ বিল সংযোজন' : 'Add Contractor Running Bill'}</span>
              </h3>
              <button onClick={() => setBillModalContractor(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {billModalContractor.name} ({billModalContractor.type}) — {isBn ? 'নতুন কাজের পরিমাণ বা রানিং বিল যুক্ত করলে তার মোট চুক্তিমূল্য ও বকেয়া স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।' : 'Adding a running bill increases total contract value and balance due.'}
            </p>

            <form onSubmit={handleAddBillSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'বিল / কাজের পরিমাণ (টাকা)' : 'Bill Amount (TK)'} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'কাজের বিবরণ / রানিং বিল নং' : 'Bill Work Description'}</label>
                <input
                  type="text"
                  value={billDescription}
                  onChange={(e) => setBillDescription(e.target.value)}
                  placeholder="e.g. 1st Floor Slab Casting Bill"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBillModalContractor(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm cursor-pointer transition"
                >
                  {isBn ? '+ বিল যোগ করুন' : '+ Submit Running Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
