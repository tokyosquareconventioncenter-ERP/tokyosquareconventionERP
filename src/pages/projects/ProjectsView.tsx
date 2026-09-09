/**
 * Projects Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Clock, 
  X,
  FileText,
  Percent,
  Trash2,
  Pencil
} from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../i18n/formatters';
import { Project, ProjectStatus } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const ProjectsView: React.FC = () => {
  const { language } = useLanguage();
  const { projects, addProject, updateProject, deleteProject, expenses, moneyReceived } = useData();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Edit Project Form State
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editExpectedEndDate, setEditExpectedEndDate] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('Running');
  const [editDescription, setEditDescription] = useState('');
  const [editProjectManager, setEditProjectManager] = useState('');

  const openEditProjectModal = (p: Project) => {
    setProjectToEdit(p);
    setEditName(p.name || '');
    setEditCode(p.code || '');
    setEditClient(p.client || 'S.M. Khalilur Rahman Properties Ltd.');
    setEditLocation(p.location || '');
    setEditStartDate(p.startDate || '');
    setEditExpectedEndDate(p.expectedEndDate || '');
    setEditBudget(p.budget ? String(p.budget) : '');
    setEditStatus(p.status || 'Running');
    setEditDescription(p.description || '');
    setEditProjectManager(p.projectManager || '');
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;
    const parsedBudget = parseFloat(editBudget) || 0;
    updateProject(projectToEdit.id, {
      name: editName,
      code: editCode || projectToEdit.code,
      client: editClient,
      location: editLocation,
      startDate: editStartDate,
      expectedEndDate: editExpectedEndDate,
      budget: parsedBudget,
      status: editStatus,
      description: editDescription,
      projectManager: editProjectManager,
    });
    setProjectToEdit(null);
  };

  // New Project Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('S.M. Khalilur Rahman Properties Ltd.');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Running');
  const [description, setDescription] = useState('');
  const [projectManager, setProjectManager] = useState('');

  const isBn = language === 'bn';

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budget) || 0;
    addProject({
      name,
      code: code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      client: client || 'S.M. Khalilur Rahman Properties Ltd.',
      location,
      startDate,
      expectedEndDate: expectedEndDate || startDate,
      budget: parsedBudget,
      status,
      description,
      projectManager,
    });
    setIsCreateModalOpen(false);
    // Reset Form
    setName('');
    setCode('');
    setLocation('');
    setBudget('');
    setDescription('');
    setProjectManager('');
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
            <Building2 className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{isBn ? 'নির্মাণ প্রকল্পসমূহ' : 'Construction Projects'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn ? 'টোকিও স্কয়ার প্রজেক্ট এ, প্রজেক্ট বি এবং সকল নির্মাণ সাইটের হিসাব ও বাজেট ট্র্যাকিং' : 'Budget, spent, material & contractor management across all construction sites'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isBn ? 'নতুন প্রকল্প যোগ করুন' : 'Add New Project'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 text-xs transition ${
        isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
      }`}>
        <Search className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isBn ? 'প্রকল্পের নাম, কোড বা লোকেশন দিয়ে খুঁজুন...' : 'Search by project name, code or location...'}
          className={`w-full bg-transparent outline-hidden font-medium ${
            isDark ? 'text-slate-100 placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const projectExpenses = expenses.filter(e => !e.isDeleted && e.projectId === project.id);
          const liveSpent = projectExpenses.reduce((s, e) => s + e.amount, 0);
          const liveMaterialCost = projectExpenses
            .filter(e => e.expenseType === 'MATERIAL' || e.category?.toLowerCase().includes('material') || e.category?.toLowerCase().includes('নির্মাণ'))
            .reduce((s, e) => s + e.amount, 0);
          const liveLabourCost = projectExpenses
            .filter(e => e.expenseType === 'LABOUR' || e.category?.toLowerCase().includes('labour') || e.category?.toLowerCase().includes('লেবার') || e.category?.toLowerCase().includes('শ্রমিক'))
            .reduce((s, e) => s + e.amount, 0);
          const liveContractorCost = projectExpenses
            .filter(e => e.expenseType === 'CONTRACTOR' || e.category?.toLowerCase().includes('contractor') || e.category?.toLowerCase().includes('কন্ট্রাক্টর'))
            .reduce((s, e) => s + e.amount, 0);
          const liveOtherCost = Math.max(0, liveSpent - (liveMaterialCost + liveLabourCost + liveContractorCost));
          const percentSpent = project.budget > 0 ? Math.min(100, Math.round((liveSpent / project.budget) * 100)) : 0;

          // Live Project Funds Received (Including Multi-Project Splits)
          const liveFundsReceived = moneyReceived.reduce((sum, r) => {
            if (r.projectAllocations && r.projectAllocations.length > 0) {
              const alloc = r.projectAllocations.find(a => a.projectId === project.id);
              return sum + (alloc ? alloc.amount : 0);
            }
            return sum + (r.projectId === project.id ? (r.amount || 0) : 0);
          }, 0);
          const projectNetBalance = liveFundsReceived - liveSpent;

          return (
            <div
              key={project.id}
              className={`border rounded-2xl p-6 shadow-sm transition flex flex-col justify-between ${
                isDark 
                  ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                      isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {project.code}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-mono mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatDisplayDate(project.startDate)} - {formatDisplayDate(project.expectedEndDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditProjectModal(project)}
                      title={isBn ? 'প্রকল্প সংশোধন / এডিট' : 'Edit Project'}
                      className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        isDark 
                          ? 'text-blue-400 hover:text-white hover:bg-blue-600/30' 
                          : 'text-blue-600 hover:text-white hover:bg-blue-600'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{isBn ? 'এডিট' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectToDelete(project)}
                      title={isBn ? 'প্রকল্প মুছুন' : 'Delete Project'}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className={`text-lg font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {project.name}
                </h2>
                
                <div className={`flex items-center gap-1.5 text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{project.location}</span>
                </div>

                {project.projectManager && (
                  <div className={`flex items-center gap-1.5 text-xs mt-1 font-medium ${
                    isDark ? 'text-amber-400/90' : 'text-amber-700 font-semibold'
                  }`}>
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>{isBn ? `প্রজেক্ট ইন-চার্জ: ${project.projectManager}` : `In-Charge: ${project.projectManager}`}</span>
                  </div>
                )}

                {project.description && (
                  <p className={`text-xs mt-3 line-clamp-2 leading-relaxed p-2.5 rounded-lg border ${
                    isDark 
                      ? 'text-slate-400 bg-slate-900/40 border-slate-800' 
                      : 'text-slate-600 bg-slate-50 border-slate-200'
                  }`}>
                    {project.description}
                  </p>
                )}
              </div>

              {/* Progress & Financials */}
              <div className={`mt-6 pt-4 border-t space-y-3 ${isDark ? 'border-slate-700/70' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {project.budget > 0 ? (
                      <>
                        {isBn ? 'ব্যয়কৃত বাজেট' : 'Budget Consumed'}: <span className={`font-mono ${isDark ? 'text-amber-400' : 'text-amber-600 font-bold'}`}>{percentSpent}%</span>
                      </>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isBn ? 'বাজেট: ঐচ্ছিক (নির্ধারিত নেই)' : 'Budget: Optional (Open)'}
                      </span>
                    )}
                  </span>
                  <span className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-800 font-bold'}`}>
                    {project.budget > 0 
                      ? `${formatCurrency(liveSpent, isBn ? 'bn' : 'en')} / ${formatCurrency(project.budget, isBn ? 'bn' : 'en')}`
                      : `${isBn ? 'মোট খরচ: ' : 'Total Cost: '}${formatCurrency(liveSpent, isBn ? 'bn' : 'en')}`
                    }
                  </span>
                </div>

                {project.budget > 0 ? (
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentSpent > 90 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentSpent}%` }}
                    />
                  </div>
                ) : (
                  <div className={`text-[11px] font-medium py-1 px-2.5 rounded-lg border flex items-center justify-between ${
                    isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span>{isBn ? 'উন্মুক্ত বাজেট প্রকল্প (কোনো বাধ্যতামূলক সীমা নেই)' : 'Flexible Budget Project (No ceiling)'}</span>
                    <span className="font-mono font-bold text-amber-600">{formatCurrency(liveSpent, isBn ? 'bn' : 'en')}</span>
                  </div>
                )}

                {/* Fund Received & Net Balance Ribbon */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-700/60' 
                    : 'bg-emerald-50/80 border-emerald-200/80'
                }`}>
                  <div>
                    <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-400' : 'text-emerald-800'}`}>
                      {isBn ? 'মোট প্রাপ্ত ফান্ড (জমা)' : 'Total Fund Received'}
                    </span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(liveFundsReceived, isBn ? 'bn' : 'en')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] uppercase font-bold block ${
                      projectNetBalance < 0 
                        ? 'text-rose-600' 
                        : isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {isBn ? 'অবশিষ্ট ফান্ড ব্যালেন্স' : 'Net Remaining Balance'}
                    </span>
                    <span className={`font-mono font-black text-sm ${
                      projectNetBalance < 0 
                        ? 'text-rose-600' 
                        : isDark ? 'text-amber-400' : 'text-amber-700'
                    }`}>
                      {formatCurrency(projectNetBalance, isBn ? 'bn' : 'en')}
                    </span>
                  </div>
                </div>

                {/* Breakdown Tiles */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'ম্যাটেরিয়াল' : 'Material'}</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>৳{(liveMaterialCost / 1000).toFixed(0)}k</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'লেবার' : 'Labour'}</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>৳{(liveLabourCost / 1000).toFixed(0)}k</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'কন্ট্রাক্টর' : 'Contractor'}</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>৳{(liveContractorCost / 1000).toFixed(0)}k</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'অন্যান্য' : 'Other'}</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>৳{(liveOtherCost / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{isBn ? 'নতুন নির্মাণ প্রকল্প যোগ করুন' : 'Add New Construction Project'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'প্রকল্পের নাম' : 'Project Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tokyo Square Tower C"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'প্রকল্প কোড' : 'Project Code'} *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. TS-PRJ-C"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'লোকেশনের ঠিকানা' : 'Site Location'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Mohammadpur, Dhaka"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'মোট বাজেট (টাকা) — (ঐচ্ছিক)' : 'Total Budget (BDT) — (Optional)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={isBn ? 'ঐচ্ছিক (ইচ্ছা হলে দিন, না হলে ফাঁকা রাখুন)' : 'Optional (e.g. 5000000 or leave blank)'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isBn ? 'বাজেট দেওয়া বাধ্যতামূলক নয়। ইচ্ছা হলে দিতে পারেন, না দিলে ফাঁকা থাকবে।' : 'Budget is completely optional. Leave blank if not determined.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'সমাপ্তির সম্ভাব্য তারিখ' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'প্রজেক্ট ইন-চার্জ' : 'Project Manager'}
                  </label>
                  <input
                    type="text"
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                    placeholder="Engr. Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isBn ? 'বিবরণ' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project specifications and features..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {projectToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`rounded-2xl shadow-2xl border w-full max-w-2xl overflow-hidden my-6 transition ${
            isDark ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {isBn ? 'নির্মাণ প্রকল্প সংশোধন / এডিট' : 'Edit Construction Project'}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {projectToEdit.name} ({projectToEdit.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProjectToEdit(null)}
                className={`p-1.5 rounded-lg transition ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'প্রকল্পের নাম' : 'Project Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'প্রজেক্ট কোড / আইডি' : 'Project Code'}
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'অবস্থান / লোকেশন' : 'Location'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'ক্লায়েন্ট / মালিক' : 'Client / Owner'}
                  </label>
                  <input
                    type="text"
                    value={editClient}
                    onChange={(e) => setEditClient(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'দায়িত্বপ্রাপ্ত ম্যানেজার / ইনচার্জ' : 'Project Manager / In-Charge'}
                  </label>
                  <input
                    type="text"
                    value={editProjectManager}
                    onChange={(e) => setEditProjectManager(e.target.value)}
                    placeholder={isBn ? 'যেমন: Engr. Farhan' : 'e.g. Engr. Farhan'}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'প্রকল্পের অবস্থা / স্ট্যাটাস' : 'Project Status'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold outline-hidden transition cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  >
                    <option value="Running">{isBn ? 'চলমান (Running)' : 'Running'}</option>
                    <option value="Upcoming">{isBn ? 'আসন্ন (Upcoming)' : 'Upcoming'}</option>
                    <option value="Completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
                    <option value="On Hold">{isBn ? 'স্থগিত (On Hold)' : 'On Hold'}</option>
                    <option value="Closed">{isBn ? 'বন্ধ (Closed)' : 'Closed'}</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'সম্ভাব্য সমাপ্তি তারিখ' : 'Expected End Date'}
                  </label>
                  <input
                    type="date"
                    value={editExpectedEndDate}
                    onChange={(e) => setEditExpectedEndDate(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'মোট প্রজেক্ট বাজেট (টাকা) — (ঐচ্ছিক)' : 'Total Budget (BDT) — (Optional)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    placeholder={isBn ? 'ঐচ্ছিক (০ বা ফাঁকা রাখতে পারেন)' : 'Optional (leave blank or 0 if none)'}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isBn ? 'বাজেট দেওয়া সম্পূর্ণ ঐচ্ছিক। বাজেট নির্দিষ্ট না করতে চাইলে ০ বা ফাঁকা রাখতে পারেন।' : 'Setting a budget is completely optional. You can set 0 or leave blank.'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isBn ? 'প্রকল্পের বিবরণ / নোট' : 'Description / Remarks'}
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-medium outline-hidden transition ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setProjectToEdit(null)}
                  className={`px-5 py-2.5 border rounded-xl font-bold transition cursor-pointer ${
                    isDark 
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  <span>{isBn ? 'তথ্য আপডেট করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>{isBn ? 'প্রকল্প মুছে ফেলা নিশ্চিত করুন' : 'Confirm Delete Project'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <p className="font-bold text-rose-900">
                  {projectToDelete.name} ({projectToDelete.code})
                </p>
                <p className="text-xs text-rose-700">
                  {isBn 
                    ? 'আপনি কি নিশ্চিত যে এই প্রকল্পটি সিস্টেম থেকে স্থায়ীভাবে মুছে ফেলতে চান?' 
                    : 'Are you sure you want to permanently remove this project from the system?'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProject(projectToDelete.id);
                    setProjectToDelete(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition"
                >
                  {isBn ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
