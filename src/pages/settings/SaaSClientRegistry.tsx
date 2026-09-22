/**
 * Central SaaS Client Registry & Subscription Billing Manager
 * For Ababil Software Solutions / Engr. Md. Tanveen Ahmed Tutul
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  ExternalLink, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Copy, 
  MessageSquare, 
  Phone, 
  Mail, 
  Globe, 
  Lock, 
  Unlock, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Download,
  Upload,
  X
} from 'lucide-react';
import { SaaSClientItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const INITIAL_DEFAULT_CLIENTS: SaaSClientItem[] = [
  {
    id: 'client-city-construction',
    clientName: 'City Construction & Developers',
    clientPhone: '01711-000000',
    clientEmail: 'khanmahmud97@gmail.com',
    appUrl: 'https://city-construction-erp.vercel.app/',
    monthlyFee: 300,
    nextBillingDate: '2026-10-30',
    lastPaidDate: '2026-09-20',
    status: 'ACTIVE',
    notes: 'অ্যাডমিন: খান মাহমুদ সাহেব। প্রতি মাসের ২৫-৩০ তারিখের মধ্যে বিকাশে পেমেন্ট পরিশোধ করেন।',
    createdAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'client-tokyo-square',
    clientName: 'Tokyo Square Convention Center (Main Portal)',
    clientPhone: '01672965561',
    clientEmail: 'tokyosquareconventioncenter@gmail.com',
    appUrl: 'https://tokyosquareconvention-erp.vercel.app/',
    monthlyFee: 0,
    nextBillingDate: '2099-12-31',
    lastPaidDate: '2026-09-01',
    status: 'ACTIVE',
    notes: 'মেইন প্রজেক্ট ও ডেভেলপার কোর ডেটাবেস। আজীবন লাইসেন্স সক্রিয়।',
    createdAt: '2026-08-01T00:00:00Z',
  }
];

export const SaaSClientRegistry: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [clients, setClients] = useState<SaaSClientItem[]>(() => {
    try {
      const raw = localStorage.getItem('ababil_saas_clients');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DEFAULT_CLIENTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DUE' | 'SUSPENDED'>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SaaSClientItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    appUrl: '',
    monthlyFee: 300,
    nextBillingDate: '',
    notes: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ababil_saas_clients', JSON.stringify(clients));
    } catch {}
  }, [clients]);

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleOpenAddModal = () => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const dateStr = nextMonth.toISOString().split('T')[0];

    setEditingClient(null);
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      appUrl: 'https://',
      monthlyFee: 300,
      nextBillingDate: dateStr,
      notes: '',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: SaaSClientItem) => {
    setEditingClient(c);
    setFormData({
      clientName: c.clientName,
      clientPhone: c.clientPhone,
      clientEmail: c.clientEmail || '',
      appUrl: c.appUrl,
      monthlyFee: c.monthlyFee,
      nextBillingDate: c.nextBillingDate,
      notes: c.notes || '',
      status: c.status
    });
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.appUrl.trim()) return;

    if (editingClient) {
      // Update
      setClients(prev => prev.map(c => c.id === editingClient.id ? {
        ...c,
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone.trim(),
        clientEmail: formData.clientEmail.trim(),
        appUrl: formData.appUrl.trim(),
        monthlyFee: Number(formData.monthlyFee) || 0,
        nextBillingDate: formData.nextBillingDate,
        notes: formData.notes.trim(),
        status: formData.status
      } : c));
      showNotice(isBn ? 'ক্লায়েন্টের তথ্য সফলভাবে আপডেট করা হয়েছে।' : 'Client info updated successfully.');
    } else {
      // Create
      const newClient: SaaSClientItem = {
        id: `client-${Date.now()}`,
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone.trim(),
        clientEmail: formData.clientEmail.trim(),
        appUrl: formData.appUrl.trim(),
        monthlyFee: Number(formData.monthlyFee) || 0,
        nextBillingDate: formData.nextBillingDate,
        lastPaidDate: new Date().toISOString().split('T')[0],
        notes: formData.notes.trim(),
        status: formData.status,
        createdAt: new Date().toISOString(),
      };
      setClients(prev => [newClient, ...prev]);
      showNotice(isBn ? 'নতুন ক্লায়েন্ট সফলভাবে যুক্ত করা হয়েছে।' : 'New client added successfully.');
    }

    setIsModalOpen(false);
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (window.confirm(isBn ? `আপনি কি নিশ্চিত যে "${name}" ক্লায়েন্টকে তালিকা থেকে মুছে ফেলতে চান?` : `Delete client "${name}"?`)) {
      setClients(prev => prev.filter(c => c.id !== id));
      showNotice(isBn ? 'ক্লায়েন্ট মুছে ফেলা হয়েছে।' : 'Client deleted.');
    }
  };

  const handleRenew30Days = (id: string, clientName: string) => {
    const today = new Date();
    const next30 = new Date();
    next30.setDate(today.getDate() + 30);
    const nextDateStr = next30.toISOString().split('T')[0];

    setClients(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          nextBillingDate: nextDateStr,
          lastPaidDate: today.toISOString().split('T')[0],
          status: 'ACTIVE'
        };
      }
      return c;
    }));

    showNotice(isBn ? `⚡ ${clientName}-এর জন্য +১ মাস (৩০ দিন) মেয়াদ বাড়ানো হয়েছে! পরবর্তী বিল: ${nextDateStr}` : `Renewed for 30 days until ${nextDateStr}`);
  };

  const handleToggleStatus = (id: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleCopyPaymentReminder = (c: SaaSClientItem) => {
    const text = isBn 
      ? `আসসালামু আলাইকুম সম্মানিত গ্রাহক (${c.clientName}),\nআপনার কনস্ট্রাকশন একাউন্টস ও প্রজেক্ট ইআরপি (ERP) সফটওয়্যারের মাসিক সাবস্ক্রিপশন ফি (৳ ${c.monthlyFee}) পরিশোধের পরবর্তী তারিখ: ${c.nextBillingDate}।\n\nসফটওয়্যারের নিরবচ্ছিন্ন সেবা চালু রাখতে অনুগ্রহ করে নিচের বিকাশ নম্বরে ফি জমা দিন:\n📱 বিকাশ (Personal): 01672965561\nধন্যবাদান্তে,\nআবাবিল সফটওয়্যার সলিউশনস (ইঞ্জিনিয়ার মো. তানভীন আহমেদ টুটুল)`
      : `Dear Client (${c.clientName}),\nYour monthly ERP subscription fee (৳ ${c.monthlyFee}) is due on ${c.nextBillingDate}.\n\nPlease send via bKash: 01672965561.\nRegards, Ababil Software Solutions`;

    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 3000);
    showNotice(isBn ? '📋 পেমেন্ট তাগাদা মেসেজ কপি হয়েছে! ক্লায়েন্টকে WhatsApp বা SMS পাঠিয়ে দিন।' : 'Reminder text copied to clipboard!');
  };

  const handleExportClients = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ababil_saas_clients_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Metrics Calculation
  const totalClientsCount = clients.length;
  const activeClients = clients.filter(c => c.status === 'ACTIVE');
  const activeClientsCount = activeClients.length;
  const totalMRR = activeClients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dueSoonClients = clients.filter(c => {
    if (c.status === 'SUSPENDED') return false;
    const diffTime = new Date(c.nextBillingDate).getTime() - new Date(todayStr).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Due within 7 days or overdue
  });

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientPhone.includes(searchQuery) ||
      c.appUrl.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return c.status === 'ACTIVE';
    if (statusFilter === 'SUSPENDED') return c.status === 'SUSPENDED';
    if (statusFilter === 'DUE') {
      const diffTime = new Date(c.nextBillingDate).getTime() - new Date(todayStr).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isBn ? '🏢 সেন্ট্রাল ক্লায়েন্ট রেজিস্ট্রি ও সাবস্ক্রিপশন ট্র্যাকার' : 'Central SaaS Client Registry & Billing Hub'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                SaaS PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn 
                ? 'আপনার আন্ডারে চলমান সকল কনস্ট্রাকশন ক্লায়েন্টের প্রজেক্ট লিংক, মাসিক ৩০০ টাকার বিলিং ও এক-ক্লিকে মেয়াদ নিয়ন্ত্রণ।' 
                : 'Manage all ERP client deployment links, monthly subscription revenues, and 1-click renewals from one central place.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportClients}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Export Client Registry"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>{isBn ? 'ব্যাকআপ ডাউনলোড' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? '+ নতুন ক্লায়েন্ট যোগ করুন' : '+ Add New Client'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Clients */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>{isBn ? 'মোট সক্রিয় ক্লায়েন্ট' : 'Active Client ERPs'}</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{activeClientsCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalClientsCount} {isBn ? 'টি মোট' : 'total'}</span>
          </div>
          <p className="text-[11px] text-blue-400/90 mt-2 font-medium">
            {isBn ? '১০০% স্বয়ংক্রিয় ক্লাউডে সক্রিয়' : 'Running on Live Cloud'}
          </p>
        </div>

        {/* Total MRR */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>{isBn ? 'মাসিক সম্ভাব্য সাবস্ক্রিপশন আয়' : 'Monthly Recurring Income'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">৳ {totalMRR.toLocaleString()}</span>
            <span className="text-xs text-slate-400">/ {isBn ? 'মাস' : 'mo'}</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-2 font-medium">
            {isBn ? 'বিকাশ নম্বর: 01672965561' : 'Direct bKash Payments'}
          </p>
        </div>

        {/* Due / Upcoming Bill Alerts */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>{isBn ? 'আসন্ন / বকেয়া বিল (৭ দিন)' : 'Due / Overdue (7 Days)'}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${dueSoonClients.length > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {dueSoonClients.length}
            </span>
            <span className="text-xs text-slate-400">{isBn ? 'টি ক্লায়েন্ট' : 'clients'}</span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
            {dueSoonClients.length > 0 ? (isBn ? 'তাগাদা মেসেজ পাঠানোর সময় হয়েছে' : 'Payment reminder needed') : (isBn ? 'সব ক্লায়েন্টের মেয়াদ ঠিক আছে' : 'All subscriptions current')}
          </p>
        </div>

        {/* Suspended / Locked */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>{isBn ? 'স্থগিত / লকড সাইট' : 'Suspended Clients'}</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-400">
              {clients.filter(c => c.status === 'SUSPENDED').length}
            </span>
            <span className="text-xs text-slate-400">{isBn ? 'টি' : 'sites'}</span>
          </div>
          <p className="text-[11px] text-rose-400/90 mt-2 font-medium">
            {isBn ? 'ফি অপরিশোধিত থাকায় স্থগিত' : 'Awaiting bKash settlement'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ক্লায়েন্টের নাম, ফোন বা লিংক দিয়ে খুঁজুন...' : 'Search by client name, phone or url...'}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isBn ? 'সকল' : 'All'} ({totalClientsCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ACTIVE' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isBn ? '🟢 সক্রিয়' : 'Active'} ({activeClientsCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'DUE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isBn ? '⏰ বকেয়া / আসন্ন' : 'Due Soon'} ({dueSoonClients.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'SUSPENDED' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isBn ? '🛑 লকড' : 'Suspended'}
          </button>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const isSuspended = client.status === 'SUSPENDED';
          const diffDays = Math.ceil((new Date(client.nextBillingDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays < 0;
          const isDueSoon = diffDays >= 0 && diffDays <= 7;

          return (
            <div 
              key={client.id}
              className={`bg-slate-800/90 border-2 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-all ${
                isSuspended 
                  ? 'border-rose-500/50 bg-rose-950/20' 
                  : isOverdue 
                  ? 'border-amber-500/60 bg-amber-950/20'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {/* Card Top: Header & Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {client.clientName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                        isSuspended 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isSuspended ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{isSuspended ? (isBn ? 'স্থগিত / লকড' : 'SUSPENDED') : (isBn ? 'সক্রিয়' : 'ACTIVE')}</span>
                      </span>

                      {client.monthlyFee > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          ৳ {client.monthlyFee} / {isBn ? 'মাস' : 'mo'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {isBn ? 'মেইন ওনার ফ্রি' : 'Owner Site'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(client)}
                      className="p-2 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border border-slate-700 shadow-2xs"
                      title={isBn ? 'তথ্য এডিট করুন' : 'Edit Info'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id, client.clientName)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition cursor-pointer border border-rose-500/20 shadow-2xs"
                      title={isBn ? 'মুছে ফেলুন' : 'Delete Client'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Direct Live Website Link Button */}
                <div className="mb-4">
                  <a
                    href={client.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3 bg-slate-950/80 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl text-xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-mono text-slate-300 group-hover:text-amber-300 truncate">
                        {client.appUrl}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-bold text-amber-400 group-hover:translate-x-0.5 transition shrink-0">
                      <span>{isBn ? 'সাইট খুলুন' : 'Visit'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </div>

                {/* Client Contact & Billing Dates Box */}
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isBn ? 'মোবাইল / WhatsApp:' : 'Phone:'}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-200">{client.clientPhone || '—'}</span>
                  </div>

                  {client.clientEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isBn ? 'অ্যাডমিন ইমেইল:' : 'Admin Email:'}</span>
                      </span>
                      <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]" title={client.clientEmail}>
                        {client.clientEmail}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBn ? 'পরবর্তী বিলের তারিখ:' : 'Next Expiry Date:'}</span>
                    </span>
                    <span className={`font-mono font-black ${
                      isOverdue 
                        ? 'text-rose-400 animate-pulse' 
                        : isDueSoon 
                        ? 'text-amber-400 font-bold' 
                        : 'text-emerald-400'
                    }`}>
                      {client.nextBillingDate} {isOverdue && (isBn ? '(মেয়াদোত্তীর্ণ)' : '(Overdue)')}
                    </span>
                  </div>

                  {client.notes && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                      💬 {client.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom: Fast Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
                {/* Renew +30 Days Button */}
                <button
                  type="button"
                  onClick={() => handleRenew30Days(client.id, client.clientName)}
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="Renew for +30 Days after payment"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isBn ? '⚡ +১ মাস রিনিউ (টাকা জমা)' : '+30 Days Renew'}</span>
                </button>

                {/* WhatsApp Reminder Copy */}
                <button
                  type="button"
                  onClick={() => handleCopyPaymentReminder(client)}
                  className="py-2 px-3 bg-slate-900 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  title="Copy payment request message for WhatsApp"
                >
                  {copiedId === client.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedId === client.id ? (isBn ? 'কপি হয়েছে' : 'Copied!') : (isBn ? 'মেসেজ কপি' : 'SMS')}</span>
                </button>

                {/* Suspend / Active Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(client.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isSuspended 
                      ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40' 
                      : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/40'
                  }`}
                  title={isSuspended ? (isBn ? 'আনলক করুন' : 'Unlock Access') : (isBn ? 'সাসপেন্ড / লক করুন' : 'Suspend Access')}
                >
                  {isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">{isBn ? 'কোনো ক্লায়েন্ট খুঁজে পাওয়া যায়নি।' : 'No clients found matching filter.'}</p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
          >
            {isBn ? '+ প্রথম ক্লায়েন্ট যুক্ত করুন' : '+ Add First Client'}
          </button>
        </div>
      )}

      {/* ADD / EDIT CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-lg p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">
                  {editingClient ? (isBn ? 'ক্লায়েন্ট তথ্য সম্পাদন' : 'Edit Client Info') : (isBn ? 'নতুন ক্লায়েন্ট যোগ করুন' : 'Add New Client ERP')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isBn ? 'কোম্পানি / ক্লায়েন্টের নাম *' : 'Company / Client Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="যেমন: City Construction & Developers"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isBn ? 'লাইভ সফটওয়্যার ওয়েবসাইট লিংক (URL) *' : 'Live Software Website URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={formData.appUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, appUrl: e.target.value }))}
                  placeholder="https://city-construction-erp.vercel.app/"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isBn ? 'মোবাইল / WhatsApp নম্বর' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="text"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="01711-000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isBn ? 'অ্যাডমিন ইমেইল' : 'Admin Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="khanmahmud97@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isBn ? 'মাসিক সাবস্ক্রিপশন ফি (টাকা) *' : 'Monthly Fee (BDT) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyFee: Number(e.target.value) }))}
                    placeholder="300"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isBn ? 'পরবর্তী বিলের তারিখ *' : 'Next Billing Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isBn ? 'স্ট্যাটাস' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                >
                  <option value="ACTIVE">{isBn ? '🟢 সক্রিয় (Active)' : 'Active'}</option>
                  <option value="SUSPENDED">{isBn ? '🛑 স্থগিত / লকড (Suspended)' : 'Suspended'}</option>
                  <option value="PENDING">{isBn ? '🟡 অপেক্ষমাণ (Pending)' : 'Pending'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isBn ? 'বিশেষ নোট / মন্তব্য' : 'Notes / Remarks'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="যেমন: মালিকের নাম, পেমেন্ট কীভাবে দেয়..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Client'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
