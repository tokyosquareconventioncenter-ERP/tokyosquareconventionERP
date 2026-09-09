/**
 * Cash & Bank Accounts Management View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { 
  Wallet, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CheckCircle2,
  Trash2,
  X,
  Building,
  DollarSign,
  Pencil,
  ArrowLeftRight
} from 'lucide-react';
import { formatCurrency } from '../../i18n/formatters';
import { AccountType, Account } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { TransactionModalTab } from '../../components/transactions/NewTransactionModal';

interface AccountsViewProps {
  onOpenNewTransaction: (tab?: TransactionModalTab) => void;
  onOpenTransfer?: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onOpenNewTransaction, onOpenTransfer }) => {
  const { language } = useLanguage();
  const { accounts, ledger, addAccount, updateAccount, deleteAccount } = useData();
  const { isDark } = useTheme();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('BANK');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  
  // Edit Account State
  const [editModalAccount, setEditModalAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AccountType>('BANK');
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editBalance, setEditBalance] = useState<number | ''>('');

  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isBn = language === 'bn';

  const totalLiquid = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const openEditModal = (account: Account) => {
    setEditModalAccount(account);
    setEditName(account.name);
    setEditType(account.type);
    setEditBankName(account.bankName || '');
    setEditAccountNumber(account.accountNumber || '');
    setEditBalance(account.currentBalance);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalAccount || !editName.trim()) return;

    updateAccount(editModalAccount.id, {
      name: editName.trim(),
      type: editType,
      bankName: editType === 'BANK' ? editBankName.trim() : undefined,
      accountNumber: editType === 'BANK' ? editAccountNumber.trim() : undefined,
      currentBalance: typeof editBalance === 'number' ? editBalance : editModalAccount.currentBalance,
    });

    setNotice(isBn 
      ? `অ্যাকাউন্ট "${editName}" সফলভাবে সংশোধন করা হয়েছে!` 
      : `Account "${editName}" updated successfully!`);

    setEditModalAccount(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    const newAcc = addAccount({
      name: accountName.trim(),
      type: accountType,
      bankName: accountType === 'BANK' ? (bankName.trim() || 'City Bank Ltd.') : undefined,
      accountNumber: accountType === 'BANK' ? accountNumber.trim() : undefined,
      openingBalance: typeof openingBalance === 'number' ? openingBalance : 0,
    });

    setIsAddModalOpen(false);
    setAccountName('');
    setAccountType('BANK');
    setBankName('');
    setAccountNumber('');
    setOpeningBalance('');

    setNotice(isBn 
      ? `অ্যাকাউন্ট "${newAcc.name}" নতুন যুক্ত করা হয়েছে!` 
      : `Account "${newAcc.name}" created successfully!`);
  };

  const handleDeleteConfirm = () => {
    if (accountToDelete) {
      const target = accounts.find(a => a.id === accountToDelete);
      deleteAccount(accountToDelete);
      setAccountToDelete(null);
      setNotice(isBn 
        ? `অ্যাকাউন্ট "${target?.name || ''}" মুছে ফেলা হয়েছে।` 
        : `Account "${target?.name || ''}" has been deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Notice */}
      {notice && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 p-4 rounded-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{notice}</span>
          </div>
          <button 
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-2xl p-5 shadow-xs transition ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}>
            <Wallet className="w-6 h-6 text-teal-500" />
            <span>{isBn ? 'ক্যাশ ও ব্যাংক অ্যাকাউন্টস' : 'Cash & Bank Accounts'}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isBn 
              ? 'সাইট ক্যাশ ইন হ্যান্ড, সিটি ব্যাংক কর্পোরেট একাউন্ট এবং মোট তারল্য স্থিতি' 
              : 'Site Cash in Hand, City Bank Corporate accounts and live liquidity balances'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenTransfer ? onOpenTransfer() : onOpenNewTransaction('TRANSFER')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{isBn ? 'ব্যাংক ⇄ ক্যাশ স্থানান্তর' : 'Bank ⇄ Cash Transfer'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? '+ ব্যাংক/ক্যাশ যোগ করুন' : '+ Add Bank / Cash Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTransaction('EXPENSE')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? 'নতুন লেনদেন এন্ট্রি' : 'New Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Main Liquidity Hero Card */}
      <div className={`border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
        isDark 
          ? 'bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border-teal-500/30' 
          : 'bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-white border-teal-200'
      }`}>
        <div>
          <span className={`text-xs uppercase tracking-wider font-bold ${
            isDark ? 'text-teal-300' : 'text-teal-800'
          }`}>
            {isBn ? 'কোম্পানির সর্বমোট বর্তমান ক্যাশ ও ব্যাংক স্থিতি' : 'Total Company Liquidity (Cash + Bank)'}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            {formatCurrency(totalLiquid, isBn ? 'bn' : 'en')}
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isBn ? 'সবগুলো সক্রিয় অ্যাকাউন্ট থেকে প্রাপ্ত লাইভ মোট ব্যালেন্স' : 'Aggregated live balance across all active financial accounts'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border transition ${
            isDark 
              ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' 
              : 'bg-teal-100 border-teal-200 text-teal-700'
          }`}>
            <Landmark className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => {
          const isCash = account.type === 'CASH';
          const accountLedger = ledger.filter(l => l.accountId === account.id);
          const totalCredits = accountLedger.filter(l => l.type === 'CREDIT').reduce((s, l) => s + l.amount, 0);
          const totalDebits = accountLedger.filter(l => l.type === 'DEBIT').reduce((s, l) => s + l.amount, 0);

          return (
            <div 
              key={account.id}
              className={`border rounded-2xl p-6 shadow-xs space-y-5 transition relative group ${
                isDark 
                  ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isCash 
                      ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      : isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isCash ? <Wallet className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${
                      isDark ? 'text-amber-400' : 'text-amber-700'
                    }`}>
                      {isCash ? (isBn ? 'ক্যাশ ইন হ্যান্ড' : 'Physical Cash') : (isBn ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account')}
                    </span>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{account.name}</h3>
                    {account.bankName && (
                      <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{account.bankName}</p>
                    )}
                    {account.accountNumber && (
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>A/C: {account.accountNumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Active
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(account)}
                      title={isBn ? 'অ্যাকাউন্ট সংশোধন / এডিট' : 'Edit Account'}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isDark 
                          ? 'text-slate-400 hover:text-teal-400 hover:bg-slate-700/60' 
                          : 'text-slate-500 hover:text-teal-700 hover:bg-slate-100'
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountToDelete(account.id)}
                      title={isBn ? 'অ্যাকাউন্ট ডিলিট করুন' : 'Delete Account'}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isDark 
                          ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/40' 
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Balance Box */}
              <div className={`border rounded-xl p-4 flex justify-between items-center transition ${
                isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{isBn ? 'বর্তমান স্থিতি (ব্যালেন্স)' : 'Current Balance'}</span>
                <span className={`text-2xl font-mono font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {formatCurrency(account.currentBalance, isBn ? 'bn' : 'en')}
                </span>
              </div>

              {/* In/Out Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট জমা' : 'Total In'}</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>৳{totalCredits.toLocaleString()}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-700'
                  }`}>
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isBn ? 'মোট খরচ' : 'Total Out'}</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>৳{totalDebits.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Account Modal */}
      {editModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-teal-600" />
                <span>{isBn ? 'ব্যাংক/ক্যাশ অ্যাকাউন্ট সংশোধন' : 'Edit Financial Account'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditModalAccount(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'অ্যাকাউন্টের ধরন (Type)' : 'Account Type'} *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditType('BANK')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 cursor-pointer ${
                      editType === 'BANK'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    <span>{isBn ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditType('CASH')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 cursor-pointer ${
                      editType === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isBn ? 'ক্যাশ ইন হ্যান্ড' : 'Cash in Hand'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'অ্যাকাউন্টের নাম' : 'Account Name'} *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-teal-600"
                />
              </div>

              {editType === 'BANK' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ব্যাংকের নাম' : 'Bank Name'}</label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ব্যাংক হিসাব নম্বর' : 'Account Number'}</label>
                    <input
                      type="text"
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'বর্তমান ব্যালেন্স (৳)' : 'Current Balance (৳)'} *</label>
                <input
                  type="number"
                  required
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-600 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalAccount(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {isBn ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" />
                <span>{isBn ? 'নতুন ব্যাংক/ক্যাশ অ্যাকাউন্ট যোগ করুন' : 'Add Bank or Cash Account'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'অ্যাকাউন্টের ধরন (Type)' : 'Account Type'} *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('BANK')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                      accountType === 'BANK'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    <span>{isBn ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('CASH')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                      accountType === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isBn ? 'ক্যাশ ইন হ্যান্ড' : 'Cash in Hand'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'অ্যাকাউন্টের নাম' : 'Account Name'} *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={accountType === 'BANK' ? "e.g. সিটি ব্যাংক - প্রজেক্ট কর্পোরেট A/C" : "e.g. সাইট অফিস ক্যাশ ইন হ্যান্ড"}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-teal-600"
                />
              </div>

              {accountType === 'BANK' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ব্যাংকের নাম' : 'Bank Name'}</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. The City Bank Ltd. / DBBL / Dutch-Bangla"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ব্যাংক হিসাব নম্বর (Account Number)' : 'Account Number'}</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 1102938475001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-teal-600"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'প্রারম্ভিক ব্যালেন্স (৳)' : 'Opening Balance (৳)'}</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-sm"
                >
                  {isBn ? 'অ্যাকাউন্ট যুক্ত করুন' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-lg text-rose-600">{isBn ? 'অ্যাকাউন্ট মুছে ফেলবেন?' : 'Delete Financial Account'}</h3>
            <p className="text-xs text-slate-600">
              {isBn 
                ? 'আপনি কি নিশ্চিত যে এই ব্যাংক/ক্যাশ অ্যাকাউন্টটি ডিলিট করতে চান?' 
                : 'Are you sure you want to delete this bank or cash account?'}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                {isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
