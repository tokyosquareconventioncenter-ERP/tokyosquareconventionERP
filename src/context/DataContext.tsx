/**
 * Master Data & Accounting Engine Context
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 * Enforces the core rule: "ONE TRANSACTION CREATES ALL RELATED ACCOUNTING RECORDS AUTOMATICALLY"
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Project, 
  Account, 
  AccountTransfer,
  Contractor, 
  Supplier, 
  Expense, 
  MoneyReceived, 
  ProjectAllocation,
  Loan, 
  MonthlyCompanyExpense, 
  Voucher, 
  LedgerEntry, 
  AuditLog, 
  CompanySettings, 
  UserProfile,
  ExpenseType,
  PaymentMethod,
  SourceType,
  MaterialItem
} from '../types';
import { saveCustomUserCredential } from '../services/auth/authService';
import { 
  initialProjects, 
  initialAccounts, 
  initialContractors, 
  initialSuppliers, 
  initialExpenses, 
  initialMoneyReceived, 
  initialLoans, 
  initialMonthlyBills, 
  initialVouchers, 
  initialLedger, 
  initialAuditLogs, 
  initialCompanySettings,
  initialUsers,
  initialMaterials
} from '../services/mockData';
import { convertNumberToWordsBn, convertNumberToWordsEn } from '../utils/numberToWords';
import { useAuth } from './AuthContext';
import { firebaseSyncService, isAutoSyncEnabled } from '../services/firebaseSync';
import { isFirebaseConfigured } from '../firebase/config';

interface DataContextType {
  projects: Project[];
  accounts: Account[];
  contractors: Contractor[];
  suppliers: Supplier[];
  materials: MaterialItem[];
  expenses: Expense[];
  moneyReceived: MoneyReceived[];
  loans: Loan[];
  monthlyBills: MonthlyCompanyExpense[];
  vouchers: Voucher[];
  ledger: LedgerEntry[];
  auditLogs: AuditLog[];
  settings: CompanySettings;
  users: UserProfile[];
  selectedProjectId: string; // 'ALL' or specific project ID
  setSelectedProjectId: (id: string) => void;

  // Actions
  addExpense: (expenseData: {
    date: string;
    projectId: string;
    expenseType: ExpenseType;
    category: string;
    paidTo: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    description: string;
    supplierId?: string;
    contractorId?: string;
    reference?: string;
    attachmentUrl?: string;
  }) => { expense: Expense; voucher: Voucher };

  addMoneyReceived: (data: {
    date: string;
    receivedFrom: string;
    sourceType: SourceType;
    projectId: string;
    amount: number;
    projectAllocations?: ProjectAllocation[];
    paymentMethod: PaymentMethod;
    accountId: string;
    reference?: string;
    description: string;
    attachmentUrl?: string;
  }) => { moneyReceived: MoneyReceived; voucher: Voucher };

  addContractorPayment: (data: {
    date: string;
    projectId: string;
    contractorId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    workDescription: string;
    reference?: string;
  }) => { expense: Expense; voucher: Voucher };

  addMonthlyBill: (data: {
    month: string;
    year?: number;
    expenseName: string;
    category: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    description: string;
    date?: string;
    projectId?: string;
  }) => { bill: MonthlyCompanyExpense; voucher: Voucher };

  addLoan: (data: {
    lenderName: string;
    date?: string;
    amount: number;
    projectId?: string;
    projectName?: string;
    purpose?: string;
    paymentMethod?: PaymentMethod;
    accountId?: string;
    reference?: string;
    phone?: string;
    lenderType?: string;
    status?: string;
  }) => { loan: Loan; voucher?: Voucher };

  repayLoan: (data: {
    loanId: string;
    date: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    description?: string;
    reference?: string;
  }) => { expense: Expense; voucher: Voucher; loan: Loan };

  addAccountTransfer: (data: {
    date: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    projectId?: string;
    description?: string;
    reference?: string;
  }) => { transfer: AccountTransfer; voucher: Voucher };

  addProject: (project: Omit<Project, 'id' | 'spent' | 'materialCost' | 'labourCost' | 'contractorCost' | 'otherCost' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addContractor: (contractor: Omit<Contractor, 'id' | 'totalBill' | 'paidAmount' | 'dueAmount' | 'createdAt'>) => Contractor;
  updateContractor: (id: string, updates: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchase' | 'totalPaid' | 'currentDue' | 'createdAt'>) => Supplier;
  deleteSupplier: (id: string) => void;

  addMaterial: (data: Omit<MaterialItem, 'id' | 'createdAt' | 'createdBy'>) => MaterialItem;
  updateMaterial: (id: string, updates: Partial<MaterialItem>) => void;
  deleteMaterial: (id: string, reason?: string) => void;

  addAccount: (account: Omit<Account, 'id' | 'totalReceived' | 'totalPaid' | 'currentBalance'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  updateExpense: (id: string, updates: Partial<Expense>) => void;
  softDeleteExpense: (expenseId: string, reason: string) => void;
  deleteExpense: (expenseId: string, reason?: string) => void;
  updateMoneyReceived: (id: string, updates: Partial<MoneyReceived>) => void;
  deleteMoneyReceived: (id: string, reason?: string) => void;
  updateVoucher: (id: string, updates: Partial<Voucher>) => void;
  deleteVoucher: (id: string, reason?: string) => void;
  updateLedgerEntry: (id: string, updates: Partial<LedgerEntry>) => void;
  deleteLedgerEntry: (id: string) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string, reason?: string) => void;
  updateMonthlyBill: (id: string, updates: Partial<MonthlyCompanyExpense>) => void;
  deleteMonthlyBill: (id: string, reason?: string) => void;

  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  
  // User Management
  addUser: (user: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>, password?: string) => UserProfile;
  updateUser: (uid: string, updates: Partial<UserProfile>) => void;
  deleteUser: (uid: string) => void;

  // Utilities
  getProjectById: (id: string) => Project | undefined;
  getAccountById: (id: string) => Account | undefined;
  getVoucherByNumber: (num: string) => Voucher | undefined;
  resetToSampleData: () => void;
  clearAllDemoData: () => void;
  getAllDataset: () => {
    projects: Project[];
    accounts: Account[];
    contractors: Contractor[];
    suppliers: Supplier[];
    materials: MaterialItem[];
    expenses: Expense[];
    moneyReceived: MoneyReceived[];
    loans: Loan[];
    monthlyBills: MonthlyCompanyExpense[];
    vouchers: Voucher[];
    ledger: LedgerEntry[];
    auditLogs: AuditLog[];
    settings: CompanySettings;
    users: UserProfile[];
  };
  restoreFullDataset: (data: any) => void;

  // Cloud Sync & Local File Backup
  cloudSyncStatus: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'OFFLINE';
  cloudLastSyncTime: string | null;
  cloudSyncError: string | null;
  syncNowWithCloud: () => Promise<void>;
  pullLatestFromCloud: () => Promise<void>;
  exportLocalBackup: () => void;
  importLocalBackup: (file: File) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_PREFIX = 'skrp_construction_erp_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage`, err);
  }
}

export function parseDateToTimestamp(dateStr?: string | null, fallbackTime?: string | null): number {
  if (!dateStr) {
    if (fallbackTime) {
      const ft = new Date(fallbackTime).getTime();
      if (!isNaN(ft)) return ft;
    }
    return 0;
  }
  const str = String(dateStr).trim();
  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.substring(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0).getTime();
  }
  // DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    const parts = str.split(/[-/]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0).getTime();
  }
  const d = new Date(str).getTime();
  if (!isNaN(d)) return d;
  return 0;
}

export function recalculateLedgerEntries(entries: LedgerEntry[]): LedgerEntry[] {
  if (!Array.isArray(entries)) return [];

  // Sort chronologically (earliest date first, then creation time, then id)
  const sorted = [...entries].sort((a, b) => {
    const timeA = parseDateToTimestamp(a.date, a.createdAt);
    const timeB = parseDateToTimestamp(b.date, b.createdAt);
    if (timeA !== timeB) return timeA - timeB;
    const createCompare = (a.createdAt || '').localeCompare(b.createdAt || '');
    if (createCompare !== 0) return createCompare;
    return (a.id || '').localeCompare(b.id || '');
  });

  let running = 0;
  return sorted.map(entry => {
    const credit = (typeof entry.received === 'number' && !isNaN(entry.received) ? entry.received : (entry.type === 'CREDIT' ? entry.amount : 0)) || 0;
    const debit = (typeof entry.payment === 'number' && !isNaN(entry.payment) ? entry.payment : (entry.type === 'DEBIT' ? entry.amount : 0)) || 0;
    running = running + credit - debit;
    return {
      ...entry,
      received: credit,
      payment: debit,
      balance: running,
      runningBalance: running,
    };
  });
}

function loadProjectsFromStorage(): Project[] {
  const stored: Project[] = loadFromStorage('projects', initialProjects);
  // Remove default dummy projects TS-PRJ-B and JCT-PRJ-C if present
  const cleaned = stored.filter(p => p.id !== 'prj-tokyo-b' && p.id !== 'prj-japan-city');
  const result = cleaned.length === 0 ? initialProjects : cleaned;
  saveToStorage('projects', result);
  return result;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStorage());
  const [accounts, setAccounts] = useState<Account[]>(() => loadFromStorage('accounts', initialAccounts));
  const [contractors, setContractors] = useState<Contractor[]>(() => loadFromStorage('contractors', initialContractors));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('suppliers', initialSuppliers));
  const [materials, setMaterials] = useState<MaterialItem[]>(() => loadFromStorage('materials', initialMaterials));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', initialExpenses));
  const [moneyReceived, setMoneyReceived] = useState<MoneyReceived[]>(() => loadFromStorage('moneyReceived', initialMoneyReceived));
  const [loans, setLoans] = useState<Loan[]>(() => loadFromStorage('loans', initialLoans));
  const [monthlyBills, setMonthlyBills] = useState<MonthlyCompanyExpense[]>(() => loadFromStorage('monthlyBills', initialMonthlyBills));
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const loaded = loadFromStorage('vouchers', initialVouchers);
    return loaded.map(v => ({
      ...v,
      preparedBy: (!v.preparedBy || v.preparedBy.toLowerCase().includes('tokyo square') || v.preparedBy.toLowerCase().includes('super admin') || v.preparedBy.toLowerCase().includes('eleyes') || v.preparedBy.toLowerCase().includes('ilyas'))
        ? 'MD. Tanveen Ahmed'
        : v.preparedBy,
    }));
  });
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const loaded = loadFromStorage('ledger', initialLedger);
    return recalculateLedgerEntries(loaded);
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', initialAuditLogs));
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const loaded = loadFromStorage('settings', initialCompanySettings);
    if (loaded && (loaded.address?.includes('Tokyo Square') || loaded.addressBn?.includes('টোকিও') || loaded.phone === '+880 1711-000000')) {
      return {
        ...loaded,
        address: '21, 22 Durgabari Road, Mymensingh',
        addressBn: '২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ',
        phone: '01672965561',
      };
    }
    return loaded;
  });
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const loaded = loadFromStorage('users', initialUsers);
    try {
      const raw = localStorage.getItem('skrp_deleted_user_ids');
      if (raw) {
        const deletedList: string[] = JSON.parse(raw);
        return loaded.filter((u: UserProfile) => !deletedList.includes(u.uid));
      }
    } catch {}
    return loaded;
  });
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  // Persistence effects
  useEffect(() => saveToStorage('projects', projects), [projects]);
  useEffect(() => saveToStorage('accounts', accounts), [accounts]);
  useEffect(() => saveToStorage('contractors', contractors), [contractors]);
  useEffect(() => saveToStorage('suppliers', suppliers), [suppliers]);
  useEffect(() => saveToStorage('materials', materials), [materials]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('moneyReceived', moneyReceived), [moneyReceived]);
  useEffect(() => saveToStorage('loans', loans), [loans]);
  useEffect(() => saveToStorage('monthlyBills', monthlyBills), [monthlyBills]);
  useEffect(() => saveToStorage('vouchers', vouchers), [vouchers]);
  useEffect(() => saveToStorage('ledger', ledger), [ledger]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('users', users), [users]);

  // Dynamically recalculate and sync account balances based on money received, expenses, and loans
  useEffect(() => {
    if (isSyncingFromCloudRef.current) return;

    setAccounts(prevAccounts => {
      if (!Array.isArray(prevAccounts) || prevAccounts.length === 0) return prevAccounts;

      let hasDifference = false;
      const updatedAccounts = prevAccounts.map(acc => {
        const isCashAccount = acc.type === 'CASH';

        // Find received money assigned to this account ID or matching payment method / account type
        const totalRec = moneyReceived
          .filter(r => {
            if (isCashAccount) {
              return r.accountId === acc.id || r.paymentMethod === 'CASH';
            } else {
              return (r.accountId === acc.id || r.paymentMethod !== 'CASH') && r.paymentMethod !== 'CASH';
            }
          })
          .reduce((sum, r) => sum + (r.amount || 0), 0);

        // ONLY count standalone loans that are NOT already in moneyReceived to prevent double-counting
        const totalLoans = loans
          .filter(l => !moneyReceived.some(r => r.id === l.id.replace('loan-', '') || (l.reference && r.receiptNumber === l.reference)))
          .filter(l => {
            if (isCashAccount) {
              return l.accountId === acc.id || l.paymentMethod === 'CASH';
            } else {
              return (l.accountId === acc.id || l.paymentMethod !== 'CASH') && l.paymentMethod !== 'CASH';
            }
          })
          .reduce((sum, l) => sum + (l.amount || 0), 0);

        const totalSpent = expenses
          .filter(e => !e.isDeleted)
          .filter(e => {
            if (isCashAccount) {
              return e.accountId === acc.id || e.paymentMethod === 'CASH';
            } else {
              return (e.accountId === acc.id || e.paymentMethod !== 'CASH') && e.paymentMethod !== 'CASH';
            }
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        const newReceived = totalRec + totalLoans;
        const newBalance = (acc.openingBalance || 0) + newReceived - totalSpent;

        if (acc.totalReceived !== newReceived || acc.totalPaid !== totalSpent || acc.currentBalance !== newBalance) {
          hasDifference = true;
          return {
            ...acc,
            totalReceived: newReceived,
            totalPaid: totalSpent,
            currentBalance: newBalance,
          };
        }
        return acc;
      });

      return hasDifference ? updatedAccounts : prevAccounts;
    });
  }, [moneyReceived, expenses, loans]);

  // Keep state refs updated to avoid stale closures in cloud sync callbacks
  const projectsRef = useRef(projects);
  const accountsRef = useRef(accounts);
  const contractorsRef = useRef(contractors);
  const suppliersRef = useRef(suppliers);
  const materialsRef = useRef(materials);
  const expensesRef = useRef(expenses);
  const moneyReceivedRef = useRef(moneyReceived);
  const loansRef = useRef(loans);
  const monthlyBillsRef = useRef(monthlyBills);
  const vouchersRef = useRef(vouchers);
  const ledgerRef = useRef(ledger);
  const auditLogsRef = useRef(auditLogs);
  const settingsRef = useRef(settings);
  const usersRef = useRef(users);

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { accountsRef.current = accounts; }, [accounts]);
  useEffect(() => { contractorsRef.current = contractors; }, [contractors]);
  useEffect(() => { suppliersRef.current = suppliers; }, [suppliers]);
  useEffect(() => { materialsRef.current = materials; }, [materials]);
  useEffect(() => { expensesRef.current = expenses; }, [expenses]);
  useEffect(() => { moneyReceivedRef.current = moneyReceived; }, [moneyReceived]);
  useEffect(() => { loansRef.current = loans; }, [loans]);
  useEffect(() => { monthlyBillsRef.current = monthlyBills; }, [monthlyBills]);
  useEffect(() => { vouchersRef.current = vouchers; }, [vouchers]);
  useEffect(() => { ledgerRef.current = ledger; }, [ledger]);
  useEffect(() => { auditLogsRef.current = auditLogs; }, [auditLogs]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { usersRef.current = users; }, [users]);

  // Helper function to merge cloud array with local array by unique ID/UID
  // On initial load: merges offline local entries with cloud dataset
  // After initial load: respects real-time cloud updates and local deletions
  const mergeArraysById = <T extends Record<string, any>>(
    localArr: T[], 
    cloudArr: T[],
    idKey: string = 'id'
  ): { merged: T[]; hasLocalUnsaved: boolean } => {
    const safeLocal = Array.isArray(localArr) ? localArr : [];
    const safeCloud = Array.isArray(cloudArr) ? cloudArr : [];

    // Once initial cloud sync is complete, incoming cloud snapshot is authoritative
    if (isInitialCloudLoadDoneRef.current) {
      return { merged: safeCloud, hasLocalUnsaved: false };
    }

    if (safeCloud.length === 0) {
      return { merged: safeLocal, hasLocalUnsaved: safeLocal.length > 0 };
    }
    if (safeLocal.length === 0) {
      return { merged: safeCloud, hasLocalUnsaved: false };
    }

    const cloudMap = new Map<string, T>();
    safeCloud.forEach(item => {
      const key = item ? (item[idKey] || item.id || item.uid) : null;
      if (key !== null && key !== undefined) cloudMap.set(String(key), item);
    });

    let hasLocalUnsaved = false;
    const merged = [...safeCloud];

    safeLocal.forEach(localItem => {
      const key = localItem ? (localItem[idKey] || localItem.id || localItem.uid) : null;
      if (key !== null && key !== undefined) {
        const keyStr = String(key);
        if (!cloudMap.has(keyStr)) {
          merged.unshift(localItem);
          hasLocalUnsaved = true;
        }
      }
    });

    return { merged, hasLocalUnsaved };
  };

  // Cloud Synchronization Flags & Live Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'CONNECTED' | 'SYNCING' | 'ERROR' | 'OFFLINE'>('SYNCING');
  const [cloudLastSyncTime, setCloudLastSyncTime] = useState<string | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  const isSyncingFromCloudRef = useRef(false);
  const isInitialCloudLoadDoneRef = useRef(false);
  const syncTimeoutRef = useRef<any>(null);

  // Helper to compare array content equality to avoid unnecessary state updates & re-render loops
  const isSameContent = (a: any, b: any) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return JSON.stringify(a) === JSON.stringify(b);
  };

  // 1. Listen to Firestore Cloud Database in Real-Time & Initial Load
  useEffect(() => {
    let isMounted = true;
    if (!isFirebaseConfigured) {
      setCloudSyncStatus('OFFLINE');
      return;
    }

    setCloudSyncStatus('SYNCING');

    const unsubscribe = firebaseSyncService.subscribeToCloudDataset(
      (cloudData, docExists) => {
        if (!isMounted) return;

        isSyncingFromCloudRef.current = true;
        setCloudSyncStatus('CONNECTED');
        setCloudSyncError(null);
        setCloudLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        if (!docExists || !cloudData) {
          // Document does not exist in Firestore yet
          isInitialCloudLoadDoneRef.current = true;
          isSyncingFromCloudRef.current = false;
          
          // Seed cloud if local has data
          firebaseSyncService.uploadAllToCloud({
            projects: projectsRef.current,
            accounts: accountsRef.current,
            contractors: contractorsRef.current,
            suppliers: suppliersRef.current,
            materials: materialsRef.current,
            expenses: expensesRef.current,
            moneyReceived: moneyReceivedRef.current,
            loans: loansRef.current,
            monthlyBills: monthlyBillsRef.current,
            vouchers: vouchersRef.current,
            ledger: ledgerRef.current,
            auditLogs: auditLogsRef.current,
            settings: settingsRef.current,
            users: usersRef.current
          }).catch(err => console.warn('Initial cloud seed notice:', err));
          return;
        }

        try {
          if (Array.isArray(cloudData.projects)) setProjects(cloudData.projects);
          if (Array.isArray(cloudData.accounts)) setAccounts(cloudData.accounts);
          if (Array.isArray(cloudData.contractors)) setContractors(cloudData.contractors);
          if (Array.isArray(cloudData.suppliers)) setSuppliers(cloudData.suppliers);
          if (Array.isArray(cloudData.materials)) setMaterials(cloudData.materials);
          if (Array.isArray(cloudData.expenses)) setExpenses(cloudData.expenses);
          if (Array.isArray(cloudData.moneyReceived)) setMoneyReceived(cloudData.moneyReceived);
          if (Array.isArray(cloudData.loans)) setLoans(cloudData.loans);
          if (Array.isArray(cloudData.monthlyBills)) setMonthlyBills(cloudData.monthlyBills);
          if (Array.isArray(cloudData.vouchers)) setVouchers(cloudData.vouchers);
          if (Array.isArray(cloudData.ledger)) setLedger(recalculateLedgerEntries(cloudData.ledger));
          if (Array.isArray(cloudData.auditLogs)) setAuditLogs(cloudData.auditLogs);
          if (cloudData.settings && typeof cloudData.settings === 'object') {
            setSettings(cloudData.settings);
          }
          if (Array.isArray(cloudData.users)) {
            let deletedList: string[] = [];
            try {
              const raw = localStorage.getItem('skrp_deleted_user_ids');
              if (raw) deletedList = JSON.parse(raw);
            } catch {}
            const filteredCloudUsers = cloudData.users.filter((u: any) => !deletedList.includes(u?.uid || u?.id));
            setUsers(filteredCloudUsers);
          }
        } finally {
          setTimeout(() => {
            isSyncingFromCloudRef.current = false;
          }, 500);
          isInitialCloudLoadDoneRef.current = true;
        }
      },
      (err) => {
        if (!isMounted) return;
        setCloudSyncStatus('ERROR');
        setCloudSyncError(err?.message || 'Firebase Firestore permission or network error');
        isInitialCloudLoadDoneRef.current = true;
      }
    );

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Ultra-Fast Auto-Sync to Firebase when local changes happen (400ms debounce)
  useEffect(() => {
    // CRITICAL: NEVER auto-upload before initial cloud load is complete!
    if (
      !isFirebaseConfigured || 
      isSyncingFromCloudRef.current || 
      !isAutoSyncEnabled() ||
      !isInitialCloudLoadDoneRef.current
    ) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setCloudSyncStatus('SYNCING');
        await firebaseSyncService.uploadAllToCloud({
          projects,
          accounts,
          contractors,
          suppliers,
          materials,
          expenses,
          moneyReceived,
          loans,
          monthlyBills,
          vouchers,
          ledger,
          auditLogs,
          settings,
          users
        });
        setCloudSyncStatus('CONNECTED');
        setCloudSyncError(null);
        setCloudLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err: any) {
        console.warn('Background auto-sync to Firebase notice:', err);
        setCloudSyncStatus('ERROR');
        setCloudSyncError(err?.message || 'Auto-sync failed');
      }
    }, 400);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    projects,
    accounts,
    contractors,
    suppliers,
    materials,
    expenses,
    moneyReceived,
    loans,
    monthlyBills,
    vouchers,
    ledger,
    auditLogs,
    settings,
    users
  ]);

  const logAudit = (action: string, module: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId: currentUser?.uid || 'system',
      userEmail: currentUser?.email || 'system@skrpproperties.com',
      userName: currentUser?.displayName || 'System User',
      action,
      module,
      recordId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const generateVoucherNumber = (): string => {
    const year = new Date().getFullYear();
    const count = vouchers.length + 126; // start smooth sequence
    const padded = String(count).padStart(6, '0');
    return `CPV-${year}-${padded}`;
  };

  const getProjectById = (id: string) => projects.find(p => p.id === id);
  const getAccountById = (id: string) => accounts.find(a => a.id === id);
  const getVoucherByNumber = (num: string) => vouchers.find(v => v.voucherNumber.toLowerCase() === num.toLowerCase());

  // Helper to ensure clean person name for signatures & creation logs
  const resolveCurrentUserName = () => {
    const raw = currentUser?.displayName;
    if (!raw) return 'MD. Tanveen Ahmed';
    if (
      raw.toLowerCase().includes('tokyo square') || 
      raw.toLowerCase().includes('super admin') ||
      raw.toLowerCase().includes('eleyes') ||
      raw.toLowerCase().includes('ilyas')
    ) {
      return 'MD. Tanveen Ahmed';
    }
    return raw;
  };

  // 1. ADD EXPENSE (The Core Transaction Pipeline)
  const addExpense = (data: {
    date: string;
    projectId: string;
    expenseType: ExpenseType;
    category: string;
    paidTo: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    description: string;
    supplierId?: string;
    contractorId?: string;
    reference?: string;
    attachmentUrl?: string;
  }) => {
    const expenseId = 'exp-' + Date.now();
    const voucherId = 'vch-' + Date.now();
    const voucherNumber = generateVoucherNumber();
    const project = getProjectById(data.projectId);
    const account = getAccountById(data.accountId);
    const projectName = project ? project.name : 'General Company Account';
    const accountName = account ? account.name : 'Cash';
    const currentUserName = resolveCurrentUserName();

    const matchedSupplier = data.supplierId 
      ? suppliers.find(s => s.id === data.supplierId)
      : suppliers.find(s => s.name && s.name.trim().toLowerCase() === (data.paidTo || '').trim().toLowerCase());

    const matchedContractor = data.contractorId 
      ? contractors.find(c => c.id === data.contractorId)
      : contractors.find(c => c.name && c.name.trim().toLowerCase() === (data.paidTo || '').trim().toLowerCase());

    // Step A: Create Expense Entity
    const newExpense: Expense = {
      id: expenseId,
      date: data.date,
      projectId: data.projectId,
      projectName,
      expenseType: data.expenseType,
      category: data.category,
      paidTo: data.paidTo,
      supplierId: matchedSupplier?.id,
      supplierName: matchedSupplier?.name,
      contractorId: matchedContractor?.id,
      contractorName: matchedContractor?.name,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      accountName,
      description: data.description,
      reference: data.reference,
      attachmentUrl: data.attachmentUrl,
      voucherId,
      voucherNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Step B: Automatically Create Cash Payment Voucher
    const newVoucher: Voucher = {
      id: voucherId,
      voucherNumber,
      date: data.date,
      projectId: data.projectId,
      projectName,
      paidTo: data.paidTo,
      category: data.category,
      description: data.description,
      amount: data.amount,
      amountInWordsBn: convertNumberToWordsBn(data.amount),
      amountInWordsEn: convertNumberToWordsEn(data.amount),
      paymentMethod: data.paymentMethod,
      preparedBy: currentUserName,
      receivedBy: data.paidTo,
      authorizedBy: 'Eng. S.M. Khalilur Rahman (MD)',
      macSign: 'Approved (M.A.C)',
      drSign: 'Verified (D.R.)',
      dmdSign: 'Passed (D.M.D)',
      attachmentUrl: data.attachmentUrl,
      transactionId: expenseId,
      transactionType: 'EXPENSE',
      status: 'ACTIVE',
      printCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Step C: Update Account Balance (Deduct Expense)
    setAccounts(prev => prev.map(acc => {
      if (acc.id === data.accountId) {
        return {
          ...acc,
          totalPaid: acc.totalPaid + data.amount,
          currentBalance: acc.currentBalance - data.amount,
        };
      }
      return acc;
    }));

    // Step D: Update Project Spent Breakdown
    if (data.projectId && data.projectId !== 'company') {
      setProjects(prev => prev.map(p => {
        if (p.id === data.projectId) {
          const materialAdd = data.expenseType === 'MATERIAL' ? data.amount : 0;
          const labourAdd = data.expenseType === 'LABOUR' ? data.amount : 0;
          const contractorAdd = data.expenseType === 'CONTRACTOR' ? data.amount : 0;
          const otherAdd = (!['MATERIAL', 'LABOUR', 'CONTRACTOR'].includes(data.expenseType)) ? data.amount : 0;

          return {
            ...p,
            spent: p.spent + data.amount,
            materialCost: p.materialCost + materialAdd,
            labourCost: p.labourCost + labourAdd,
            contractorCost: p.contractorCost + contractorAdd,
            otherCost: p.otherCost + otherAdd,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      }));
    }

    // Step E: Update Supplier or Contractor Due if linked
    if (matchedSupplier) {
      setSuppliers(prev => prev.map(s => {
        if (s.id === matchedSupplier.id) {
          const newTotalPaid = s.totalPaid + data.amount;
          return {
            ...s,
            totalPaid: newTotalPaid,
            currentDue: Math.max(0, (s.totalPurchase || 0) + (s.openingDue || 0) - newTotalPaid),
          };
        }
        return s;
      }));
    }

    if (matchedContractor) {
      setContractors(prev => prev.map(c => {
        if (c.id === matchedContractor.id) {
          const newPaid = c.paidAmount + data.amount;
          const totalContractOrBill = (c.contractAmount && c.contractAmount > 0) ? c.contractAmount : (c.totalBill || 0);
          return {
            ...c,
            paidAmount: newPaid,
            dueAmount: Math.max(0, totalContractOrBill - newPaid),
          };
        }
        return c;
      }));
    }

    // Step F: Auto Create General Ledger Entry
    const lastBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const newLedgerEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      date: data.date,
      voucherNo: voucherNumber,
      transactionId: expenseId,
      transactionType: 'EXPENSE',
      description: data.description,
      projectId: data.projectId,
      projectName,
      category: data.category,
      received: 0,
      payment: data.amount,
      balance: lastBalance - data.amount,
      person: data.paidTo,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      accountName,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Step G: If material expense, record in Materials register
    if (data.expenseType === 'MATERIAL') {
      const supplier = data.supplierId ? suppliers.find(s => s.id === data.supplierId) : undefined;
      const newMat: MaterialItem = {
        id: 'mat-' + Date.now(),
        date: data.date,
        projectId: data.projectId,
        projectName,
        materialName: data.category || 'Construction Material',
        category: data.category,
        supplierId: data.supplierId,
        supplierName: supplier?.name || data.paidTo,
        quantity: 1,
        unit: 'Lot',
        rate: data.amount,
        unitRate: data.amount,
        totalAmount: data.amount,
        totalCost: data.amount,
        challanNumber: data.reference,
        paymentStatus: 'PAID',
        expenseId,
        voucherId: newVoucher.id,
        voucherNumber,
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      };
      setMaterials(prev => [newMat, ...prev]);
    }

    setExpenses(prev => [newExpense, ...prev]);
    setVouchers(prev => [newVoucher, ...prev]);
    setLedger(prev => recalculateLedgerEntries([...prev, newLedgerEntry]));

    logAudit(
      'CREATE_EXPENSE',
      'Expenses',
      expenseId,
      `Recorded expense of ৳${data.amount.toLocaleString()} for ${projectName}. Created Voucher ${voucherNumber}.`
    );

    return { expense: newExpense, voucher: newVoucher };
  };

  // 2. ADD MONEY RECEIVED
  const addMoneyReceived = (data: {
    date: string;
    receivedFrom: string;
    sourceType: SourceType;
    projectId: string;
    amount: number;
    projectAllocations?: ProjectAllocation[];
    paymentMethod: PaymentMethod;
    accountId: string;
    reference?: string;
    description: string;
    attachmentUrl?: string;
  }) => {
    const recId = 'rec-' + Date.now();
    const receiptNumber = `MR-${new Date().getFullYear()}-${String(moneyReceived.length + 10).padStart(5, '0')}`;
    const project = getProjectById(data.projectId);
    const account = getAccountById(data.accountId);
    const projectName = project ? project.name : (data.projectAllocations && data.projectAllocations.length > 1 ? 'Multiple Projects' : 'General Fund');
    const accountName = account ? account.name : 'Cash';
    const currentUserName = resolveCurrentUserName();

    // Enrich project allocations with project names if missing
    const enrichedAllocations = data.projectAllocations?.map(alloc => {
      const p = getProjectById(alloc.projectId);
      return {
        ...alloc,
        projectName: p ? p.name : alloc.projectName || 'General Fund',
      };
    });

    const newRec: MoneyReceived = {
      id: recId,
      receiptNumber,
      date: data.date,
      receivedFrom: data.receivedFrom,
      sourceType: data.sourceType,
      projectId: data.projectId,
      projectName,
      amount: data.amount,
      projectAllocations: enrichedAllocations,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      accountName,
      reference: data.reference,
      attachmentUrl: data.attachmentUrl,
      description: data.description,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Format descriptive notes for allocations if multiple projects
    let allocationNote = '';
    if (enrichedAllocations && enrichedAllocations.length > 1) {
      allocationNote = ' [' + enrichedAllocations.map(a => `${a.projectName}: ৳${a.amount.toLocaleString()}`).join(', ') + ']';
    }

    const fullDescription = data.description 
      ? `${data.description}${allocationNote}`
      : `Received from ${data.receivedFrom} (${data.sourceType})${allocationNote}`;

    // Also create Money Receipt Voucher
    const newVoucher: Voucher = {
      id: 'vch-' + recId,
      voucherNumber: receiptNumber,
      date: data.date,
      projectId: data.projectId,
      projectName,
      paidTo: data.receivedFrom,
      category: `Money Received (${data.sourceType})`,
      description: fullDescription,
      amount: data.amount,
      amountInWordsBn: convertNumberToWordsBn(data.amount),
      amountInWordsEn: convertNumberToWordsEn(data.amount),
      paymentMethod: data.paymentMethod,
      preparedBy: currentUserName,
      receivedBy: data.receivedFrom,
      authorizedBy: 'Eng. S.M. Khalilur Rahman (MD)',
      accountName,
      reference: data.reference,
      attachmentUrl: data.attachmentUrl,
      transactionId: recId,
      transactionType: data.sourceType === 'Share Voucher / Partner' ? 'SHARE_VOUCHER' : 'MONEY_RECEIVED',
      status: 'ACTIVE',
      printCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Update Account Balance (Add Received)
    setAccounts(prev => prev.map(acc => {
      if (acc.id === data.accountId) {
        return {
          ...acc,
          totalReceived: acc.totalReceived + data.amount,
          currentBalance: acc.currentBalance + data.amount,
        };
      }
      return acc;
    }));

    // Auto Ledger Entry
    const lastBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const newLedgerEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      date: data.date,
      voucherNo: receiptNumber,
      transactionId: recId,
      transactionType: 'MONEY_RECEIVED',
      description: fullDescription,
      projectId: data.projectId,
      projectName,
      projectAllocations: enrichedAllocations,
      category: 'Money Received - ' + data.sourceType,
      received: data.amount,
      payment: 0,
      balance: lastBalance + data.amount,
      person: data.receivedFrom,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      accountName,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    setMoneyReceived(prev => [newRec, ...prev]);
    setVouchers(prev => [newVoucher, ...prev]);
    setLedger(prev => recalculateLedgerEntries([...prev, newLedgerEntry]));

    // Auto record into Loans & Borrowings Register if sourceType is Loan
    const isLoanSource = data.sourceType === 'Loan' || 
      String(data.sourceType).toLowerCase().includes('loan') || 
      String(data.sourceType).includes('ঋণ') || 
      String(data.sourceType).includes('কর্জ');

    if (isLoanSource) {
      const newLoanItem: Loan = {
        id: 'loan-' + recId,
        lenderName: data.receivedFrom,
        date: data.date,
        amount: data.amount,
        projectId: data.projectId,
        projectName,
        purpose: data.description || `Loan received via Money Receipt (${receiptNumber})`,
        paymentMethod: data.paymentMethod,
        repaymentAmount: 0,
        repaidAmount: 0,
        outstandingAmount: data.amount,
        status: 'ACTIVE',
        reference: data.reference || receiptNumber,
        createdAt: new Date().toISOString(),
        createdBy: currentUserName,
      };
      setLoans(prev => [newLoanItem, ...prev]);
    }

    logAudit(
      'RECEIVE_MONEY',
      'MoneyReceived',
      recId,
      `Received ৳${data.amount.toLocaleString()} from ${data.receivedFrom} (${data.sourceType}) into ${accountName}.`
    );

    return { moneyReceived: newRec, voucher: newVoucher };
  };

  // 3. CONTRACTOR PAYMENT
  const addContractorPayment = (data: {
    date: string;
    projectId: string;
    contractorId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    workDescription: string;
    reference?: string;
  }) => {
    const contractor = contractors.find(c => c.id === data.contractorId);
    const contractorName = contractor ? contractor.name : 'Contractor';

    return addExpense({
      date: data.date,
      projectId: data.projectId,
      expenseType: 'CONTRACTOR',
      category: `Contractor Payment (${contractor?.type || 'General'})`,
      paidTo: contractorName,
      contractorId: data.contractorId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      description: data.workDescription,
      reference: data.reference,
    });
  };

  // 4. MONTHLY BILL
  const addMonthlyBill = (data: {
    month: string;
    year?: number;
    expenseName: string;
    category: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    description: string;
    date?: string;
    projectId?: string;
  }) => {
    const billId = 'bill-' + Date.now();
    const effectiveDate = data.date || new Date().toISOString().split('T')[0];
    const effectiveProjectId = data.projectId || 'company';
    const project = getProjectById(effectiveProjectId);
    const projectName = project ? project.name : (effectiveProjectId === 'company' ? 'Company Head Office / General' : 'General Company Account');
    const billYear = data.year || new Date().getFullYear();

    const result = addExpense({
      date: effectiveDate,
      projectId: effectiveProjectId,
      expenseType: data.category === 'SALARY' ? 'SALARY' : (data.category === 'CONVEYANCE' ? 'CONVEYANCE' : 'FOOD'),
      category: data.category || 'Monthly Bill',
      paidTo: data.expenseName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      description: `${data.expenseName} - ${data.month}: ${data.description}`,
    });

    const newBill: MonthlyCompanyExpense = {
      id: billId,
      month: data.month,
      year: billYear,
      expenseName: data.expenseName,
      category: data.category || 'Monthly Bill',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      description: data.description,
      date: effectiveDate,
      projectId: effectiveProjectId,
      projectName,
      expenseId: result.expense.id,
      voucherId: result.voucher.id,
      voucherNumber: result.voucher.voucherNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.displayName || 'MD. Ilyas',
    };

    setMonthlyBills(prev => [newBill, ...prev]);
    return { bill: newBill, voucher: result.voucher };
  };

  // 5. LOAN RECEIVE
  const addLoan = (data: {
    lenderName: string;
    date?: string;
    amount: number;
    projectId?: string;
    projectName?: string;
    purpose?: string;
    paymentMethod?: PaymentMethod;
    accountId?: string;
    reference?: string;
    phone?: string;
    lenderType?: string;
    status?: string;
  }) => {
    const loanId = 'loan-' + Date.now();
    const currentUserName = resolveCurrentUserName();
    const project = data.projectId ? getProjectById(data.projectId) : undefined;
    const paymentMethod = data.paymentMethod || 'CASH';

    // Auto-resolve account if missing
    let targetAccountId = data.accountId;
    if (!targetAccountId) {
      if (paymentMethod === 'CASH') {
        targetAccountId = accounts.find(a => a.type === 'CASH')?.id || accounts[0]?.id || 'acc-cash-01';
      } else if (paymentMethod === 'MOBILE_BANKING') {
        targetAccountId = accounts.find(a => a.type === 'MOBILE_BANKING')?.id || accounts.find(a => a.type === 'BANK')?.id || accounts[0]?.id;
      } else {
        targetAccountId = accounts.find(a => a.type === 'BANK')?.id || accounts.find(a => a.type === 'CASH')?.id || accounts[0]?.id;
      }
    }

    const targetAccount = getAccountById(targetAccountId) || accounts[0];
    const accountName = targetAccount?.name || (paymentMethod === 'CASH' ? 'Cash in Hand' : 'Bank Account');
    const loanDate = data.date || new Date().toISOString().split('T')[0];
    const receiptNumber = `MR-${new Date().getFullYear()}-${String(moneyReceived.length + loans.length + 1).padStart(5, '0')}`;
    const voucherNumber = `V-${new Date().getFullYear()}-${String(vouchers.length + 1).padStart(5, '0')}`;

    const newLoan: Loan = {
      id: loanId,
      lenderName: data.lenderName,
      date: loanDate,
      amount: data.amount,
      projectId: data.projectId || (project ? project.id : undefined),
      projectName: project ? project.name : data.projectName,
      purpose: data.purpose || 'Project financial & bridge support',
      paymentMethod,
      repaymentAmount: 0,
      repaidAmount: 0,
      outstandingAmount: data.amount,
      status: (data.status as any) || 'ACTIVE',
      reference: data.reference || receiptNumber,
      phone: data.phone,
      lenderType: data.lenderType || 'INDIVIDUAL',
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Voucher for Money Receipt
    const newVoucher: Voucher = {
      id: 'vouch-mr-' + Date.now(),
      voucherNumber,
      date: loanDate,
      projectId: data.projectId || '',
      projectName: project ? project.name : (data.projectName || 'General / Corporate'),
      paidTo: data.lenderName,
      category: 'Loan Received',
      description: `Loan / Borrowed funds received from ${data.lenderName} (${data.purpose || 'Project funding'})`,
      amount: data.amount,
      amountInWordsBn: convertNumberToWordsBn(data.amount),
      amountInWordsEn: convertNumberToWordsEn(data.amount),
      paymentMethod,
      preparedBy: currentUserName,
      receivedBy: data.lenderName,
      authorizedBy: 'Eng. S.M. Khalilur Rahman (MD)',
      accountName,
      reference: data.reference || receiptNumber,
      transactionId: loanId,
      transactionType: 'MONEY_RECEIVED',
      status: 'ACTIVE',
      printCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Receiving loan adds to cash/bank
    setAccounts(prev => prev.map(acc => {
      if (acc.id === targetAccountId) {
        return {
          ...acc,
          totalReceived: acc.totalReceived + data.amount,
          currentBalance: acc.currentBalance + data.amount,
        };
      }
      return acc;
    }));

    // Auto Ledger
    const lastBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const newLedgerEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      date: loanDate,
      voucherNo: voucherNumber,
      transactionId: loanId,
      transactionType: 'LOAN_RECEIVED',
      description: `Loan received from ${data.lenderName}: ${data.purpose || 'Project funding'}`,
      projectId: data.projectId,
      projectName: project?.name,
      category: 'Loan Received',
      received: data.amount,
      payment: 0,
      balance: lastBalance + data.amount,
      person: data.lenderName,
      paymentMethod,
      accountId: targetAccountId,
      accountName,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    setLoans(prev => [newLoan, ...prev]);
    setVouchers(prev => [newVoucher, ...prev]);
    setLedger(prev => recalculateLedgerEntries([...prev, newLedgerEntry]));

    logAudit('CREATE_LOAN', 'Loans', loanId, `Recorded new loan ৳${data.amount.toLocaleString()} from ${data.lenderName} into ${accountName}.`);

    return { loan: newLoan, voucher: newVoucher };
  };

  // 6. REPAY LOAN
  const repayLoan = (data: {
    loanId: string;
    date: string;
    amount: number;
    paymentMethod: PaymentMethod;
    accountId: string;
    description?: string;
    reference?: string;
  }) => {
    const loan = loans.find(l => l.id === data.loanId);
    if (!loan) throw new Error('Loan record not found');

    const paymentMethod = data.paymentMethod || 'CASH';
    let targetAccountId = data.accountId;
    if (!targetAccountId) {
      if (paymentMethod === 'CASH') {
        targetAccountId = accounts.find(a => a.type === 'CASH')?.id || accounts[0]?.id || 'acc-cash-01';
      } else {
        targetAccountId = accounts.find(a => a.type === 'BANK')?.id || accounts[0]?.id;
      }
    }

    // 1. Create Expense voucher for cash/bank deduction
    const result = addExpense({
      date: data.date || new Date().toISOString().split('T')[0],
      projectId: loan.projectId || 'prj-company',
      expenseType: 'OTHER',
      category: 'Loan Repayment (ঋণ পরিশোধ)',
      paidTo: loan.lenderName,
      amount: data.amount,
      paymentMethod,
      accountId: targetAccountId,
      description: data.description || `Loan repayment to ${loan.lenderName} (${loan.purpose || 'Borrowing settlement'})`,
      reference: data.reference || `REPAY-${loan.lenderName}`,
    });

    // 2. Update loan record repaidAmount, repaymentAmount, outstandingAmount, and status
    const currentRepaid = loan.repaymentAmount || (loan as any).repaidAmount || 0;
    const newRepaid = currentRepaid + data.amount;
    const newOutstanding = Math.max(0, loan.amount - newRepaid);
    const newStatus = newOutstanding === 0 ? 'FULLY_PAID' : 'ACTIVE';

    const updatedLoan: Loan = {
      ...loan,
      repaymentAmount: newRepaid,
      repaidAmount: newRepaid,
      outstandingAmount: newOutstanding,
      status: newStatus as any,
    };

    setLoans(prev => prev.map(l => l.id === data.loanId ? updatedLoan : l));
    logAudit('REPAY_LOAN', 'Loans', data.loanId, `Repaid ৳${data.amount.toLocaleString()} to ${loan.lenderName}. Remaining due: ৳${newOutstanding.toLocaleString()}`);

    return { expense: result.expense, voucher: result.voucher, loan: updatedLoan };
  };

  // 7. INTERNAL ACCOUNT TRANSFER (BANK TO CASH / CASH TO BANK / CONTRA)
  const addAccountTransfer = (data: {
    date: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    projectId?: string;
    description?: string;
    reference?: string;
  }) => {
    if (!data.fromAccountId || !data.toAccountId) {
      throw new Error('Both Source and Destination accounts are required');
    }
    if (data.fromAccountId === data.toAccountId) {
      throw new Error('Source and Destination accounts cannot be the same');
    }
    if (data.amount <= 0) {
      throw new Error('Transfer amount must be greater than zero');
    }

    const fromAcc = accounts.find(a => a.id === data.fromAccountId);
    const toAcc = accounts.find(a => a.id === data.toAccountId);
    const fromName = fromAcc ? fromAcc.name : 'Source Account';
    const toName = toAcc ? toAcc.name : 'Destination Account';

    const isFromCash = fromAcc?.type === 'CASH';
    const isToCash = toAcc?.type === 'CASH';

    let transferType: 'BANK_TO_CASH' | 'CASH_TO_BANK' | 'BANK_TO_BANK' | 'CASH_TO_CASH' = 'BANK_TO_CASH';
    if (!isFromCash && isToCash) transferType = 'BANK_TO_CASH';
    else if (isFromCash && !isToCash) transferType = 'CASH_TO_BANK';
    else if (!isFromCash && !isToCash) transferType = 'BANK_TO_BANK';
    else transferType = 'CASH_TO_CASH';

    const project = data.projectId ? projects.find(p => p.id === data.projectId) : undefined;
    const projectName = project ? project.name : (data.projectId === 'prj-company' ? 'Corporate Office' : undefined);

    const currentUserName = currentUser?.displayName || 'MD. Tanveen Ahmed';
    const transferDate = data.date || new Date().toISOString().split('T')[0];

    // Generate unique transfer voucher number: CTV-YYYY-XXXXXX (Contra Transfer Voucher)
    const existingTransferVouchers = vouchers.filter(v => v.voucherNumber && v.voucherNumber.startsWith('CTV-'));
    const voucherNumber = `CTV-${new Date(transferDate).getFullYear()}-${String(existingTransferVouchers.length + 1).padStart(6, '0')}`;

    const transferId = 'xfer-' + Date.now();

    const transferRecord: AccountTransfer = {
      id: transferId,
      date: transferDate,
      fromAccountId: data.fromAccountId,
      fromAccountName: fromName,
      toAccountId: data.toAccountId,
      toAccountName: toName,
      amount: data.amount,
      transferType,
      projectId: data.projectId,
      projectName,
      description: data.description || (transferType === 'BANK_TO_CASH' ? `ব্যাংক থেকে সাইট খরচের জন্য নগদ উত্তোলন (${fromName} ➔ ${toName})` : `তহবিল স্থানান্তর (${fromName} ➔ ${toName})`),
      reference: data.reference,
      voucherNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // 1. Create a Debit Expense on FromAccount (Transferred Out)
    const expenseRec: Expense = {
      id: 'exp-xfer-' + transferId,
      date: transferDate,
      projectId: data.projectId || '',
      projectName: projectName || 'General / Internal Transfer',
      expenseType: 'OTHER',
      category: 'Fund Transfer Out (তহবিল স্থানান্তর)',
      paidTo: toName,
      amount: data.amount,
      paymentMethod: isFromCash ? 'CASH' : 'BANK',
      accountId: data.fromAccountId,
      accountName: fromName,
      description: data.description || `Transfer to ${toName} (Contra Voucher: ${voucherNumber})`,
      reference: data.reference || voucherNumber,
      voucherId: 'vouch-ctv-' + transferId,
      voucherNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // 2. Create a Credit Money Received on ToAccount (Transferred In)
    const receiveRec: MoneyReceived = {
      id: 'rec-xfer-' + transferId,
      receiptNumber: voucherNumber,
      date: transferDate,
      receivedFrom: fromName,
      sourceType: 'Company Fund',
      projectId: data.projectId || '',
      projectName: projectName || 'General / Internal Transfer',
      amount: data.amount,
      paymentMethod: isToCash ? 'CASH' : 'BANK',
      accountId: data.toAccountId,
      accountName: toName,
      description: data.description || `Transfer received from ${fromName} (Contra Voucher: ${voucherNumber})`,
      reference: data.reference || voucherNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // 3. Create Contra Transfer Voucher
    const newVoucher: Voucher = {
      id: 'vouch-ctv-' + transferId,
      voucherNumber,
      date: transferDate,
      projectId: data.projectId || '',
      projectName: projectName || 'Internal Fund Transfer',
      paidTo: toName,
      category: transferType === 'BANK_TO_CASH' ? 'Bank to Cash Withdrawal' : 'Internal Fund Transfer',
      description: data.description || `Internal transfer of ৳${data.amount.toLocaleString()} from ${fromName} to ${toName}`,
      amount: data.amount,
      amountInWordsBn: convertNumberToWordsBn(data.amount),
      amountInWordsEn: convertNumberToWordsEn(data.amount),
      paymentMethod: isFromCash ? 'CASH' : 'BANK',
      preparedBy: currentUserName,
      receivedBy: toName,
      authorizedBy: 'Eng. S.M. Khalilur Rahman (MD)',
      accountName: `${fromName} ➔ ${toName}`,
      reference: data.reference || voucherNumber,
      transactionId: transferId,
      transactionType: 'TRANSFER',
      status: 'ACTIVE',
      printCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // 4. Create Ledger Entries (Debit FromAccount, Credit ToAccount)
    const lastBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const ledgerDebit: LedgerEntry = {
      id: 'led-out-' + Date.now(),
      date: transferDate,
      voucherNo: voucherNumber,
      transactionId: transferId,
      transactionType: 'TRANSFER_OUT',
      description: `[Transfer Out] ৳${data.amount.toLocaleString()} transferred to ${toName}`,
      projectId: data.projectId,
      projectName,
      category: 'Fund Transfer Out',
      received: 0,
      payment: data.amount,
      balance: lastBalance - data.amount,
      person: toName,
      paymentMethod: isFromCash ? 'CASH' : 'BANK',
      accountId: data.fromAccountId,
      accountName: fromName,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    const ledgerCredit: LedgerEntry = {
      id: 'led-in-' + (Date.now() + 1),
      date: transferDate,
      voucherNo: voucherNumber,
      transactionId: transferId,
      transactionType: 'TRANSFER_IN',
      description: `[Transfer In] ৳${data.amount.toLocaleString()} received from ${fromName}`,
      projectId: data.projectId,
      projectName,
      category: 'Fund Transfer In',
      received: data.amount,
      payment: 0,
      balance: lastBalance,
      person: fromName,
      paymentMethod: isToCash ? 'CASH' : 'BANK',
      accountId: data.toAccountId,
      accountName: toName,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };

    // Update state
    setExpenses(prev => [expenseRec, ...prev]);
    setMoneyReceived(prev => [receiveRec, ...prev]);
    setVouchers(prev => [newVoucher, ...prev]);
    setLedger(prev => recalculateLedgerEntries([...prev, ledgerDebit, ledgerCredit]));

    logAudit('FUND_TRANSFER', 'Accounts', transferId, `Transferred ৳${data.amount.toLocaleString()} from ${fromName} to ${toName}. Voucher: ${voucherNumber}`);

    return { transfer: transferRecord, voucher: newVoucher };
  };

  // UNIFIED CASCADING DELETE EXPENSE
  // Automatically and cleanly removes from:
  // 1. Account balance (restores Cash or Bank balance)
  // 2. Project cost (reverts Project spent & breakdowns)
  // 3. Contractor balance (if contractor expense)
  // 4. Supplier balance (if supplier expense)
  // 5. Voucher register (removes corresponding CPV/Voucher)
  // 6. General Ledger (removes corresponding Ledger entry)
  // 7. Materials register (removes corresponding material purchase record)
  // 8. Monthly bills (if linked)
  // 9. Expenses list
  const deleteExpense = (expenseId: string, reason: string = 'User deleted expense') => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    // 1. Reverse account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === expense.accountId) {
        return {
          ...acc,
          totalPaid: Math.max(0, acc.totalPaid - expense.amount),
          currentBalance: acc.currentBalance + expense.amount,
        };
      }
      return acc;
    }));

    // 2. Reverse project spent
    if (expense.projectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === expense.projectId) {
          const materialSub = expense.expenseType === 'MATERIAL' ? expense.amount : 0;
          const labourSub = expense.expenseType === 'LABOUR' ? expense.amount : 0;
          const contractorSub = expense.expenseType === 'CONTRACTOR' ? expense.amount : 0;
          const otherSub = (!['MATERIAL', 'LABOUR', 'CONTRACTOR'].includes(expense.expenseType)) ? expense.amount : 0;

          return {
            ...p,
            spent: Math.max(0, p.spent - expense.amount),
            materialCost: Math.max(0, p.materialCost - materialSub),
            labourCost: Math.max(0, p.labourCost - labourSub),
            contractorCost: Math.max(0, p.contractorCost - contractorSub),
            otherCost: Math.max(0, p.otherCost - otherSub),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      }));
    }

    // 3. Reverse contractor due if linked
    const targetContractor = expense.contractorId 
      ? contractors.find(c => c.id === expense.contractorId)
      : contractors.find(c => c.name && c.name.trim().toLowerCase() === (expense.paidTo || '').trim().toLowerCase());

    if (targetContractor) {
      setContractors(prev => prev.map(c => {
        if (c.id === targetContractor.id) {
          const newPaid = Math.max(0, c.paidAmount - expense.amount);
          const totalContract = c.contractAmount || c.totalBill || (c.paidAmount + c.dueAmount);
          return {
            ...c,
            paidAmount: newPaid,
            dueAmount: Math.max(0, totalContract - newPaid),
          };
        }
        return c;
      }));
    }

    // 4. Reverse supplier due if linked
    const targetSupplier = expense.supplierId
      ? suppliers.find(s => s.id === expense.supplierId)
      : suppliers.find(s => s.name && s.name.trim().toLowerCase() === (expense.paidTo || '').trim().toLowerCase());

    if (targetSupplier) {
      setSuppliers(prev => prev.map(s => {
        if (s.id === targetSupplier.id) {
          const newTotalPaid = Math.max(0, s.totalPaid - expense.amount);
          return {
            ...s,
            totalPaid: newTotalPaid,
            currentDue: Math.max(0, (s.totalPurchase || 0) + (s.openingDue || 0) - newTotalPaid),
          };
        }
        return s;
      }));
    }

    // 5. Cascade delete corresponding Voucher from vouchers register
    setVouchers(prev => prev.filter(v => 
      v.id !== expense.voucherId && 
      v.expenseId !== expenseId && 
      v.transactionId !== expenseId &&
      !(expense.voucherNumber && v.voucherNumber === expense.voucherNumber)
    ));

    // 6. Cascade delete corresponding Ledger entry from General Ledger & recalculate balances
    setLedger(prev => {
      const remaining = prev.filter(l => 
        l.transactionId !== expenseId && 
        !(expense.voucherNumber && l.voucherNo === expense.voucherNumber)
      );
      return recalculateLedgerEntries(remaining);
    });

    // 7. Cascade delete corresponding Material item from Materials register
    setMaterials(prev => prev.filter(m => 
      m.expenseId !== expenseId && 
      m.voucherId !== expense.voucherId && 
      !(expense.voucherNumber && m.voucherNumber === expense.voucherNumber)
    ));

    // 8. Cascade delete corresponding Monthly Bill if linked
    setMonthlyBills(prev => prev.filter(b => 
      b.voucherId !== expense.voucherId && 
      !(expense.voucherNumber && b.voucherNumber === expense.voucherNumber)
    ));

    // 9. Remove completely from expenses list
    setExpenses(prev => prev.filter(e => e.id !== expenseId));

    logAudit(
      'DELETE_EXPENSE', 
      'Expenses', 
      expenseId, 
      `Clean cascaded deletion of expense ৳${expense.amount.toLocaleString()} (Voucher: ${expense.voucherNumber}). Automatically removed from Vouchers, General Ledger, Materials, and restored Cash/Bank balance. Reason: ${reason}`
    );
  };

  // SOFT DELETE EXPENSE (Calls unified deleteExpense for clean cascading across all modules)
  const softDeleteExpense = (expenseId: string, reason: string) => {
    deleteExpense(expenseId, reason);
  };

  // DELETE MONEY RECEIVED (Reverses account balance, removes voucher, removes ledger entry)
  const deleteMoneyReceived = (id: string, reason: string = 'User deleted transaction') => {
    const item = moneyReceived.find(r => r.id === id);
    if (!item) return;

    // Reverse account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === item.accountId) {
        return {
          ...acc,
          totalReceived: Math.max(0, acc.totalReceived - item.amount),
          currentBalance: acc.currentBalance - item.amount,
        };
      }
      return acc;
    }));

    // Cascade delete voucher
    setVouchers(prev => prev.filter(v => 
      v.id !== item.voucherId && 
      v.transactionId !== id && 
      !(item.voucherNumber && v.voucherNumber === item.voucherNumber)
    ));

    // Cascade delete ledger & recalculate running balance
    setLedger(prev => {
      const remaining = prev.filter(l => 
        l.transactionId !== id && 
        !(item.voucherNumber && l.voucherNo === item.voucherNumber)
      );
      return recalculateLedgerEntries(remaining);
    });

    // Cascade delete linked loan from Loan register if exists
    setLoans(prev => prev.filter(l => 
      l.id !== 'loan-' + id && 
      l.id !== id && 
      !(item.receiptNumber && l.reference === item.receiptNumber)
    ));

    setMoneyReceived(prev => prev.filter(r => r.id !== id));

    logAudit('DELETE_MONEY_RECEIVED', 'MoneyReceived', id, `Deleted money received ৳${item.amount.toLocaleString()} from ${item.receivedFrom}. Reason: ${reason}`);
  };

  // DELETE VOUCHER (Clean Cascading)
  const deleteVoucher = (voucherId: string, reason: string = 'User deleted voucher') => {
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) return;

    // If linked to an expense, trigger unified cascading delete
    if (voucher.expenseId || voucher.transactionType === 'EXPENSE') {
      const targetExpense = expenses.find(e => e.id === voucher.expenseId || e.voucherId === voucherId || (voucher.voucherNumber && e.voucherNumber === voucher.voucherNumber));
      if (targetExpense) {
        deleteExpense(targetExpense.id, reason);
        return;
      }
    }

    // If linked to money received
    if (voucher.transactionType === 'MONEY_RECEIVED') {
      const targetRec = moneyReceived.find(r => r.id === voucher.transactionId || r.voucherId === voucherId || (voucher.voucherNumber && r.voucherNumber === voucher.voucherNumber));
      if (targetRec) {
        deleteMoneyReceived(targetRec.id, reason);
        return;
      }
    }

    // If linked to monthly bill
    if (voucher.transactionType === 'MONTHLY_BILL') {
      const targetBill = monthlyBills.find(b => b.id === voucher.transactionId || b.voucherId === voucherId || (voucher.voucherNumber && b.voucherNumber === voucher.voucherNumber));
      if (targetBill) {
        deleteMonthlyBill(targetBill.id, reason);
        return;
      }
    }

    // Remove from ledger & recalculate running balances
    setLedger(prev => recalculateLedgerEntries(prev.filter(l => l.voucherNo !== voucher.voucherNumber && l.transactionId !== voucher.id)));

    // Remove from vouchers
    setVouchers(prev => prev.filter(v => v.id !== voucherId));
    logAudit('DELETE_VOUCHER', 'Vouchers', voucherId, `Deleted voucher ${voucher.voucherNumber} (৳${voucher.amount.toLocaleString()}). Reason: ${reason}`);
  };

  // DELETE LEDGER ENTRY (Clean Cascading)
  const deleteLedgerEntry = (id: string) => {
    const entry = ledger.find(l => l.id === id);
    if (!entry) return;

    if ((entry.transactionType === 'EXPENSE' || entry.transactionId?.startsWith('exp-')) && entry.transactionId) {
      const expense = expenses.find(e => e.id === entry.transactionId || (entry.voucherNo && e.voucherNumber === entry.voucherNo));
      if (expense) {
        deleteExpense(expense.id, 'Deleted from General Ledger');
        return;
      }
    }

    if ((entry.transactionType === 'RECEIPT' || entry.transactionType === 'MONEY_RECEIVED' || entry.transactionId?.startsWith('rec-')) && entry.transactionId) {
      const receipt = moneyReceived.find(r => r.id === entry.transactionId || (entry.voucherNo && r.receiptNumber === entry.voucherNo));
      if (receipt) {
        deleteMoneyReceived(receipt.id, 'Deleted from General Ledger');
        return;
      }
    }

    if ((entry.transactionType === 'MONTHLY_BILL' || entry.transactionId?.startsWith('bill-')) && entry.transactionId) {
      const bill = monthlyBills.find(b => b.id === entry.transactionId || (entry.voucherNo && b.voucherNumber === entry.voucherNo));
      if (bill) {
        deleteMonthlyBill(bill.id, 'Deleted from General Ledger');
        return;
      }
    }

    if ((entry.transactionType === 'LOAN_RECEIVED' || entry.transactionId?.startsWith('loan-')) && entry.transactionId) {
      const loan = loans.find(l => l.id === entry.transactionId);
      if (loan) {
        deleteLoan(loan.id, 'Deleted from General Ledger');
        return;
      }
    }

    // If standalone ledger entry with account ID, reverse account balances
    if (entry.accountId) {
      const rec = (typeof entry.received === 'number' && !isNaN(entry.received)) ? entry.received : (entry.type === 'CREDIT' ? entry.amount : 0) || 0;
      const pay = (typeof entry.payment === 'number' && !isNaN(entry.payment)) ? entry.payment : (entry.type === 'DEBIT' ? entry.amount : 0) || 0;
      setAccounts(prev => prev.map(acc => {
        if (acc.id === entry.accountId) {
          return {
            ...acc,
            totalReceived: Math.max(0, acc.totalReceived - rec),
            totalPaid: Math.max(0, acc.totalPaid - pay),
            currentBalance: acc.currentBalance - rec + pay,
          };
        }
        return acc;
      }));
    }

    if (entry.voucherNo) {
      setVouchers(prev => prev.filter(v => v.voucherNumber !== entry.voucherNo && v.id !== entry.voucherNo));
    }

    setLedger(prev => recalculateLedgerEntries(prev.filter(l => l.id !== id)));
    logAudit('DELETE_LEDGER_ENTRY', 'Ledger', id, `Deleted ledger entry ID: ${id}`);
  };

  // DELETE LOAN
  const deleteLoan = (id: string, reason: string = 'User deleted loan') => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    setLoans(prev => prev.filter(l => l.id !== id));
    setLedger(prev => recalculateLedgerEntries(prev.filter(l => l.transactionId !== id)));

    logAudit('DELETE_LOAN', 'Loans', id, `Deleted loan ৳${loan.amount.toLocaleString()} from ${loan.lenderName}. Reason: ${reason}`);
  };

  // DELETE SUPPLIER
  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE_SUPPLIER', 'Suppliers', id, `Deleted supplier ID: ${id}`);
  };

  // DELETE CONTRACTOR
  const deleteContractor = (id: string) => {
    setContractors(prev => prev.filter(c => c.id !== id));
    logAudit('DELETE_CONTRACTOR', 'Contractors', id, `Deleted contractor ID: ${id}`);
  };

  // UPDATE CONTRACTOR
  const updateContractor = (id: string, updates: Partial<Contractor>) => {
    setContractors(prev => prev.map(c => {
      if (c.id === id) {
        const updatedContractAmount = updates.contractAmount !== undefined ? updates.contractAmount : c.contractAmount;
        const updatedPaidAmount = updates.paidAmount !== undefined ? updates.paidAmount : c.paidAmount;
        const updatedDueAmount = updates.dueAmount !== undefined 
          ? updates.dueAmount 
          : Math.max(0, updatedContractAmount - updatedPaidAmount);

        return {
          ...c,
          ...updates,
          contractAmount: updatedContractAmount,
          paidAmount: updatedPaidAmount,
          dueAmount: updatedDueAmount,
        };
      }
      return c;
    }));
    logAudit('UPDATE_CONTRACTOR', 'Contractors', id, `Updated contractor ID: ${id} (${updates.name || 'details'})`);
  };

  // ADD MATERIAL
  const addMaterial = (data: Omit<MaterialItem, 'id' | 'createdAt' | 'createdBy'>) => {
    const currentUserName = resolveCurrentUserName();
    const newMat: MaterialItem = {
      ...data,
      id: 'mat-' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
    };
    setMaterials(prev => [newMat, ...prev]);

    // Update supplier totalPurchase & currentDue if linked
    const targetSup = data.supplierId 
      ? suppliers.find(s => s.id === data.supplierId)
      : suppliers.find(s => s.name && s.name.trim().toLowerCase() === (data.supplierName || '').trim().toLowerCase());

    if (targetSup) {
      const matCost = data.totalAmount || data.totalCost || ((data.quantity || 0) * (data.rate || data.unitRate || 0));
      setSuppliers(prev => prev.map(s => {
        if (s.id === targetSup.id) {
          const newPurchases = (s.totalPurchase || 0) + matCost;
          return {
            ...s,
            totalPurchase: newPurchases,
            currentDue: Math.max(0, newPurchases + (s.openingDue || 0) - (s.totalPaid || 0)),
          };
        }
        return s;
      }));
    }

    logAudit('ADD_MATERIAL', 'Materials', newMat.id, `Recorded material purchase: ${data.materialName} (${data.quantity} ${data.unit})`);
    return newMat;
  };

  // UPDATE MATERIAL
  const updateMaterial = (id: string, updates: Partial<MaterialItem>) => {
    const existing = materials.find(m => m.id === id);
    if (!existing) return;

    const newQuantity = updates.quantity !== undefined ? updates.quantity : existing.quantity;
    const newRate = updates.unitRate !== undefined ? updates.unitRate : (updates.rate !== undefined ? updates.rate : (existing.unitRate || existing.rate || 0));
    const calculatedAmount = (updates.totalAmount !== undefined || updates.totalCost !== undefined)
      ? (updates.totalAmount || updates.totalCost || 0)
      : (newQuantity * newRate);
    const newAmount = calculatedAmount > 0 ? calculatedAmount : (existing.totalAmount || existing.totalCost || 0);

    const newProjectId = updates.projectId !== undefined ? updates.projectId : existing.projectId;
    const project = newProjectId ? projects.find(p => p.id === newProjectId) : undefined;
    const newProjectName = project ? project.name : (updates.projectName || existing.projectName);

    const updatedMat: MaterialItem = {
      ...existing,
      ...updates,
      projectId: newProjectId,
      projectName: newProjectName,
      quantity: newQuantity,
      rate: newRate,
      unitRate: newRate,
      totalAmount: newAmount,
      totalCost: newAmount,
    };

    setMaterials(prev => prev.map(m => m.id === id ? updatedMat : m));

    // If linked to an Expense, cascade update to Expense, Voucher, Ledger, and Account balances
    if (existing.expenseId) {
      updateExpense(existing.expenseId, {
        date: updates.date || existing.date,
        amount: newAmount,
        paidTo: updates.supplierName || existing.supplierName,
        projectId: newProjectId,
        projectName: newProjectName,
        description: updates.materialName 
          ? `${updates.materialName} (${newQuantity} ${updates.unit || existing.unit}) - ${updates.supplierName || existing.supplierName || ''}`
          : undefined,
        reference: updates.challanNumber !== undefined ? updates.challanNumber : undefined,
      });
    }

    logAudit('UPDATE_MATERIAL', 'Materials', id, `Updated material item ${updatedMat.materialName} (Qty: ${updatedMat.quantity} ${updatedMat.unit}, Total: ৳${newAmount.toLocaleString()})`);
  };

  // DELETE MATERIAL (Clean Cascading)
  const deleteMaterial = (id: string, reason: string = 'User deleted material record') => {
    const item = materials.find(m => m.id === id);
    if (!item) return;

    if (item.expenseId) {
      deleteExpense(item.expenseId, reason);
      return;
    }
    setMaterials(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE_MATERIAL', 'Materials', id, `Deleted material item ${item.materialName}. Reason: ${reason}`);
  };

  // DELETE MONTHLY BILL (Clean Cascading)
  const deleteMonthlyBill = (id: string, reason: string = 'User deleted bill') => {
    const bill = monthlyBills.find(b => b.id === id);
    if (!bill) return;

    // Reverse account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === bill.accountId) {
        return {
          ...acc,
          totalPaid: Math.max(0, acc.totalPaid - bill.amount),
          currentBalance: acc.currentBalance + bill.amount,
        };
      }
      return acc;
    }));

    // Cascade delete voucher
    setVouchers(prev => prev.filter(v => 
      v.id !== bill.voucherId && 
      v.transactionId !== id && 
      !(bill.voucherNumber && v.voucherNumber === bill.voucherNumber)
    ));

    // Cascade delete ledger
    setLedger(prev => prev.filter(l => 
      l.transactionId !== id && 
      !(bill.voucherNumber && l.voucherNo === bill.voucherNumber)
    ));

    // Remove from expenses if an expense record was created for it
    setExpenses(prev => prev.filter(e => 
      e.voucherId !== bill.voucherId && 
      !(bill.voucherNumber && e.voucherNumber === bill.voucherNumber)
    ));

    setMonthlyBills(prev => prev.filter(b => b.id !== id));
    logAudit('DELETE_MONTHLY_BILL', 'MonthlyBills', id, `Deleted monthly bill ${bill.expenseName} (৳${bill.amount.toLocaleString()}). Reason: ${reason}`);
  };

  // UPDATE EXPENSE (Clean Cascading Update)
  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const existing = expenses.find(e => e.id === id);
    if (!existing) return;

    const oldAmount = existing.amount;
    const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
    const oldAccountId = existing.accountId;
    const newAccountId = updates.accountId || oldAccountId;
    const oldProjectId = existing.projectId;
    const newProjectId = updates.projectId !== undefined ? updates.projectId : oldProjectId;
    const oldType = existing.expenseType;
    const newType = updates.expenseType || oldType;

    // 1. Account balances adjustment
    if (oldAmount !== newAmount || oldAccountId !== newAccountId) {
      setAccounts(prev => prev.map(acc => {
        let currentBalance = acc.currentBalance;
        let totalPaid = acc.totalPaid;
        if (acc.id === oldAccountId) {
          totalPaid = Math.max(0, totalPaid - oldAmount);
          currentBalance = currentBalance + oldAmount;
        }
        if (acc.id === newAccountId) {
          totalPaid = totalPaid + newAmount;
          currentBalance = currentBalance - newAmount;
        }
        return { ...acc, currentBalance, totalPaid };
      }));
    }

    // 2. Project costs adjustment
    if (oldAmount !== newAmount || oldProjectId !== newProjectId || oldType !== newType) {
      setProjects(prev => prev.map(p => {
        let updated = { ...p };
        if (p.id === oldProjectId) {
          const matOld = oldType === 'MATERIAL' ? oldAmount : 0;
          const labOld = oldType === 'LABOUR' ? oldAmount : 0;
          const cntOld = oldType === 'CONTRACTOR' ? oldAmount : 0;
          const othOld = (!['MATERIAL', 'LABOUR', 'CONTRACTOR'].includes(oldType)) ? oldAmount : 0;
          updated.spent = Math.max(0, updated.spent - oldAmount);
          updated.materialCost = Math.max(0, updated.materialCost - matOld);
          updated.labourCost = Math.max(0, updated.labourCost - labOld);
          updated.contractorCost = Math.max(0, updated.contractorCost - cntOld);
          updated.otherCost = Math.max(0, updated.otherCost - othOld);
        }
        if (p.id === newProjectId) {
          const matNew = newType === 'MATERIAL' ? newAmount : 0;
          const labNew = newType === 'LABOUR' ? newAmount : 0;
          const cntNew = newType === 'CONTRACTOR' ? newAmount : 0;
          const othNew = (!['MATERIAL', 'LABOUR', 'CONTRACTOR'].includes(newType)) ? newAmount : 0;
          updated.spent = updated.spent + newAmount;
          updated.materialCost = updated.materialCost + matNew;
          updated.labourCost = updated.labourCost + labNew;
          updated.contractorCost = updated.contractorCost + cntNew;
          updated.otherCost = updated.otherCost + othNew;
        }
        return updated;
      }));
    }

    const project = newProjectId ? projects.find(p => p.id === newProjectId) : undefined;
    const projectName = project ? project.name : updates.projectName || existing.projectName;
    const account = accounts.find(a => a.id === newAccountId);
    const accountName = account ? account.name : updates.accountName || existing.accountName;

    const updatedExpense: Expense = {
      ...existing,
      ...updates,
      amount: newAmount,
      projectId: newProjectId,
      projectName,
      accountId: newAccountId,
      accountName,
      updatedAt: new Date().toISOString(),
    };

    setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));

    // Sync associated voucher
    setVouchers(prev => prev.map(v => {
      if (v.id === existing.voucherId || v.expenseId === id || v.transactionId === id || (existing.voucherNumber && v.voucherNumber === existing.voucherNumber)) {
        return {
          ...v,
          date: updates.date || v.date,
          paidTo: updates.paidTo || v.paidTo,
          category: updates.category || v.category,
          description: updates.description || v.description,
          amount: newAmount,
          amountInWordsBn: convertNumberToWordsBn(newAmount),
          amountInWordsEn: convertNumberToWordsEn(newAmount),
          paymentMethod: updates.paymentMethod || v.paymentMethod,
          reference: updates.reference !== undefined ? updates.reference : v.reference,
          projectId: newProjectId,
          projectName,
          accountName,
        };
      }
      return v;
    }));

    // Sync associated ledger & recalculate
    setLedger(prev => {
      const updated = prev.map(l => {
        if (l.transactionId === id || (existing.voucherNumber && l.voucherNo === existing.voucherNumber)) {
          return {
            ...l,
            date: updates.date || l.date,
            description: updates.description || l.description,
            payment: newAmount,
            amount: newAmount,
            person: updates.paidTo || l.person,
            category: updates.category || l.category,
            projectId: newProjectId,
            projectName,
            paymentMethod: updates.paymentMethod || l.paymentMethod,
            accountId: newAccountId,
            accountName,
          };
        }
        return l;
      });
      return recalculateLedgerEntries(updated);
    });

    // Sync material item if linked
    setMaterials(prev => prev.map(m => {
      if (m.expenseId === id || (existing.voucherNumber && m.voucherNumber === existing.voucherNumber)) {
        return {
          ...m,
          date: updates.date || m.date,
          projectId: newProjectId || m.projectId,
          projectName: projectName || m.projectName,
          supplierName: updates.paidTo || m.supplierName,
          totalAmount: newAmount,
          totalCost: newAmount,
        };
      }
      return m;
    }));

    logAudit('UPDATE_EXPENSE', 'Expenses', id, `Updated expense details for Voucher ${existing.voucherNumber || id} (৳${newAmount.toLocaleString()})`);
  };

  // UPDATE MONEY RECEIVED
  const updateMoneyReceived = (id: string, updates: Partial<MoneyReceived>) => {
    const existing = moneyReceived.find(r => r.id === id);
    if (!existing) return;

    const oldAmount = existing.amount;
    const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
    const oldAccountId = existing.accountId;
    const newAccountId = updates.accountId || oldAccountId;
    const oldProjectId = existing.projectId;
    const newProjectId = updates.projectId !== undefined ? updates.projectId : oldProjectId;

    if (oldAmount !== newAmount || oldAccountId !== newAccountId) {
      setAccounts(prev => prev.map(acc => {
        let currentBalance = acc.currentBalance;
        let totalReceived = acc.totalReceived;
        if (acc.id === oldAccountId) {
          totalReceived = Math.max(0, totalReceived - oldAmount);
          currentBalance = currentBalance - oldAmount;
        }
        if (acc.id === newAccountId) {
          totalReceived = totalReceived + newAmount;
          currentBalance = currentBalance + newAmount;
        }
        return { ...acc, currentBalance, totalReceived };
      }));
    }

    const project = newProjectId ? projects.find(p => p.id === newProjectId) : undefined;
    const projectName = project ? project.name : updates.projectName || existing.projectName;
    const account = accounts.find(a => a.id === newAccountId);
    const accountName = account ? account.name : updates.accountName || existing.accountName;

    const updatedRec: MoneyReceived = {
      ...existing,
      ...updates,
      amount: newAmount,
      projectId: newProjectId,
      projectName,
      accountId: newAccountId,
      accountName,
    };

    setMoneyReceived(prev => prev.map(r => r.id === id ? updatedRec : r));

    // Sync associated voucher
    setVouchers(prev => prev.map(v => {
      if (v.id === existing.voucherId || v.transactionId === id || (existing.receiptNumber && v.voucherNumber === existing.receiptNumber)) {
        return {
          ...v,
          date: updates.date || v.date,
          paidTo: updates.receivedFrom || v.paidTo,
          receivedBy: updates.receivedFrom || v.receivedBy,
          category: updates.sourceType ? `Money Received (${updates.sourceType})` : v.category,
          description: updates.description || v.description,
          amount: newAmount,
          amountInWordsBn: convertNumberToWordsBn(newAmount),
          amountInWordsEn: convertNumberToWordsEn(newAmount),
          paymentMethod: updates.paymentMethod || v.paymentMethod,
          reference: updates.reference !== undefined ? updates.reference : v.reference,
          projectId: newProjectId,
          projectName,
          accountName,
        };
      }
      return v;
    }));

    // Sync ledger & recalculate
    setLedger(prev => {
      const updated = prev.map(l => {
        if (l.transactionId === id || (existing.receiptNumber && l.voucherNo === existing.receiptNumber)) {
          return {
            ...l,
            date: updates.date || l.date,
            description: updates.description || l.description,
            received: newAmount,
            amount: newAmount,
            person: updates.receivedFrom || l.person,
            category: updates.sourceType ? `Money Received - ${updates.sourceType}` : l.category,
            projectId: newProjectId,
            projectName,
            paymentMethod: updates.paymentMethod || l.paymentMethod,
            accountId: newAccountId,
            accountName,
          };
        }
        return l;
      });
      return recalculateLedgerEntries(updated);
    });

    logAudit('UPDATE_MONEY_RECEIVED', 'MoneyReceived', id, `Updated money received receipt ${existing.receiptNumber} from ${updates.receivedFrom || existing.receivedFrom}`);
  };

  // UPDATE VOUCHER
  const updateVoucher = (id: string, updates: Partial<Voucher>) => {
    const existing = vouchers.find(v => v.id === id);
    if (!existing) return;

    const newAmount = updates.amount !== undefined ? updates.amount : existing.amount;

    const updatedVoucher: Voucher = {
      ...existing,
      ...updates,
      amount: newAmount,
      amountInWordsBn: updates.amountInWordsBn || convertNumberToWordsBn(newAmount),
      amountInWordsEn: updates.amountInWordsEn || convertNumberToWordsEn(newAmount),
    };

    setVouchers(prev => prev.map(v => v.id === id ? updatedVoucher : v));

    // Cascade update to linked Expense or MoneyReceived
    if (existing.expenseId || existing.transactionType === 'EXPENSE') {
      const expId = existing.expenseId || existing.transactionId;
      const linkedExp = expenses.find(e => e.id === expId || (existing.voucherNumber && e.voucherNumber === existing.voucherNumber));
      if (linkedExp) {
        updateExpense(linkedExp.id, {
          date: updates.date,
          paidTo: updates.paidTo,
          category: updates.category,
          description: updates.description,
          amount: updates.amount,
          paymentMethod: updates.paymentMethod,
          reference: updates.reference,
        });
      }
    } else if (existing.transactionType === 'MONEY_RECEIVED' || existing.transactionType === 'SHARE_VOUCHER') {
      const recId = existing.transactionId;
      const linkedRec = moneyReceived.find(r => r.id === recId || (existing.voucherNumber && r.receiptNumber === existing.voucherNumber));
      if (linkedRec) {
        updateMoneyReceived(linkedRec.id, {
          date: updates.date,
          receivedFrom: updates.paidTo,
          description: updates.description,
          amount: updates.amount,
          paymentMethod: updates.paymentMethod,
          reference: updates.reference,
        });
      }
    }

    logAudit('UPDATE_VOUCHER', 'Vouchers', id, `Updated voucher ${existing.voucherNumber}`);
  };

  // UPDATE LEDGER ENTRY (Clean Cascading Update)
  const updateLedgerEntry = (id: string, updates: Partial<LedgerEntry>) => {
    const existing = ledger.find(l => l.id === id);
    if (!existing) return;

    const oldDate = existing.date;
    const newDate = updates.date || oldDate;
    const oldDebit = (typeof existing.payment === 'number' && !isNaN(existing.payment)) ? existing.payment : ((existing.type === 'DEBIT' ? existing.amount : 0) || 0);
    const oldCredit = (typeof existing.received === 'number' && !isNaN(existing.received)) ? existing.received : ((existing.type === 'CREDIT' ? existing.amount : 0) || 0);
    const newDebit = updates.payment !== undefined ? (typeof updates.payment === 'number' ? updates.payment : 0) : oldDebit;
    const newCredit = updates.received !== undefined ? (typeof updates.received === 'number' ? updates.received : 0) : oldCredit;
    const oldAccountId = existing.accountId;
    const newAccountId = updates.accountId || oldAccountId;

    // 1. Account balances adjustment if amounts or account changed
    if (oldDebit !== newDebit || oldCredit !== newCredit || oldAccountId !== newAccountId) {
      setAccounts(prev => prev.map(acc => {
        let currentBalance = acc.currentBalance;
        let totalPaid = acc.totalPaid;
        let totalReceived = acc.totalReceived;

        if (acc.id === oldAccountId) {
          totalPaid = Math.max(0, totalPaid - oldDebit);
          totalReceived = Math.max(0, totalReceived - oldCredit);
          currentBalance = currentBalance + oldDebit - oldCredit;
        }
        if (acc.id === newAccountId) {
          totalPaid = totalPaid + newDebit;
          totalReceived = totalReceived + newCredit;
          currentBalance = currentBalance - newDebit + newCredit;
        }
        return { ...acc, currentBalance, totalPaid, totalReceived };
      }));
    }

    // 2. Cascade to linked Expense if exists
    if (existing.transactionType === 'EXPENSE' || (existing.transactionId && existing.transactionId.startsWith('exp-'))) {
      const exp = expenses.find(e => e.id === existing.transactionId || (existing.voucherNo && e.voucherNumber === existing.voucherNo));
      if (exp) {
        setExpenses(prev => prev.map(e => e.id === exp.id ? {
          ...e,
          date: newDate,
          amount: newDebit > 0 ? newDebit : e.amount,
          paidTo: updates.person || e.paidTo,
          category: updates.category || e.category,
          description: updates.description || e.description,
          accountId: newAccountId || e.accountId,
          accountName: updates.accountName || e.accountName,
          projectId: updates.projectId !== undefined ? updates.projectId : e.projectId,
          projectName: updates.projectName || e.projectName,
          paymentMethod: updates.paymentMethod || e.paymentMethod,
        } : e));
      }
    }

    // 3. Cascade to linked Money Received if exists
    if (existing.transactionType === 'MONEY_RECEIVED' || existing.transactionType === 'RECEIPT' || (existing.transactionId && existing.transactionId.startsWith('rec-'))) {
      const rec = moneyReceived.find(r => r.id === existing.transactionId || (existing.voucherNo && r.receiptNumber === existing.voucherNo));
      if (rec) {
        setMoneyReceived(prev => prev.map(r => r.id === rec.id ? {
          ...r,
          date: newDate,
          amount: newCredit > 0 ? newCredit : r.amount,
          receivedFrom: updates.person || r.receivedFrom,
          description: updates.description || r.description,
          accountId: newAccountId || r.accountId,
          accountName: updates.accountName || r.accountName,
          projectId: updates.projectId !== undefined ? updates.projectId : r.projectId,
          projectName: updates.projectName || r.projectName,
          paymentMethod: updates.paymentMethod || r.paymentMethod,
        } : r));
      }
    }

    // 4. Cascade to linked Monthly Bill if exists
    if (existing.transactionType === 'MONTHLY_BILL' || (existing.transactionId && existing.transactionId.startsWith('bill-'))) {
      const bill = monthlyBills.find(b => b.id === existing.transactionId || (existing.voucherNo && b.voucherNumber === existing.voucherNo));
      if (bill) {
        setMonthlyBills(prev => prev.map(b => b.id === bill.id ? {
          ...b,
          amount: newDebit > 0 ? newDebit : b.amount,
          expenseName: updates.person || b.expenseName,
          category: updates.category || b.category,
          description: updates.description || b.description,
          accountId: newAccountId || b.accountId,
          paymentMethod: updates.paymentMethod || b.paymentMethod,
        } : b));
      }
    }

    // 5. Cascade to linked Voucher if exists
    if (existing.voucherNo) {
      setVouchers(prev => prev.map(v => {
        if (v.voucherNumber === existing.voucherNo || v.transactionId === existing.transactionId) {
          const amt = newDebit > 0 ? newDebit : (newCredit > 0 ? newCredit : v.amount);
          return {
            ...v,
            date: newDate,
            amount: amt,
            amountInWordsBn: convertNumberToWordsBn(amt),
            amountInWordsEn: convertNumberToWordsEn(amt),
            paidTo: updates.person || v.paidTo,
            category: updates.category || v.category,
            description: updates.description || v.description,
            paymentMethod: updates.paymentMethod || v.paymentMethod,
            projectId: updates.projectId !== undefined ? updates.projectId : v.projectId,
            projectName: updates.projectName || v.projectName,
          };
        }
        return v;
      }));
    }

    // 6. Update ledger entry and recalculate
    setLedger(prev => {
      const updated = prev.map(l => l.id === id ? {
        ...l,
        ...updates,
        date: newDate,
        payment: newDebit,
        received: newCredit,
        amount: newDebit > 0 ? newDebit : newCredit,
        type: newDebit > 0 ? 'DEBIT' : 'CREDIT',
      } : l);
      return recalculateLedgerEntries(updated);
    });

    logAudit('UPDATE_LEDGER_ENTRY', 'Ledger', id, `Updated ledger entry ID: ${id}`);
  };

  // UPDATE LOAN
  const updateLoan = (id: string, updates: Partial<Loan>) => {
    const existing = loans.find(l => l.id === id);
    if (!existing) return;

    const newAmount = updates.amount !== undefined ? updates.amount : existing.amount;
    const newRepaid = updates.repaidAmount !== undefined 
      ? updates.repaidAmount 
      : (updates.repaymentAmount !== undefined ? updates.repaymentAmount : (existing.repaymentAmount || (existing as any).repaidAmount || 0));
    const newOutstanding = Math.max(0, newAmount - newRepaid);
    const newStatus = updates.status || (newOutstanding === 0 ? 'FULLY_PAID' : 'ACTIVE');

    const updatedLoan: Loan = {
      ...existing,
      ...updates,
      amount: newAmount,
      repaymentAmount: newRepaid,
      outstandingAmount: newOutstanding,
      status: newStatus as any,
    };
    (updatedLoan as any).repaidAmount = newRepaid;

    setLoans(prev => prev.map(l => l.id === id ? updatedLoan : l));

    // Sync linked ledger if found
    setLedger(prev => {
      const updated = prev.map(l => {
        if (l.transactionId === id) {
          return {
            ...l,
            person: updates.lenderName || l.person,
            description: updates.purpose ? `Loan from ${updates.lenderName || l.person}: ${updates.purpose}` : l.description,
            received: newAmount,
            amount: newAmount,
            date: updates.date || l.date,
          };
        }
        return l;
      });
      return recalculateLedgerEntries(updated);
    });

    logAudit('UPDATE_LOAN', 'Loans', id, `Updated loan for ${updatedLoan.lenderName} (Amount: ৳${newAmount.toLocaleString()})`);
  };

  // UPDATE MONTHLY BILL
  const updateMonthlyBill = (id: string, updates: Partial<MonthlyCompanyExpense>) => {
    const existing = monthlyBills.find(b => b.id === id);
    if (!existing) return;

    const oldAmount = existing.amount;
    const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
    const oldAccountId = existing.accountId;
    const newAccountId = updates.accountId || oldAccountId;

    if (oldAmount !== newAmount || oldAccountId !== newAccountId) {
      setAccounts(prev => prev.map(acc => {
        let currentBalance = acc.currentBalance;
        let totalPaid = acc.totalPaid;
        if (acc.id === oldAccountId) {
          totalPaid = Math.max(0, totalPaid - oldAmount);
          currentBalance = currentBalance + oldAmount;
        }
        if (acc.id === newAccountId) {
          totalPaid = totalPaid + newAmount;
          currentBalance = currentBalance - newAmount;
        }
        return { ...acc, currentBalance, totalPaid };
      }));
    }

    const updatedBill: MonthlyCompanyExpense = {
      ...existing,
      ...updates,
      amount: newAmount,
      accountId: newAccountId,
    };

    setMonthlyBills(prev => prev.map(b => b.id === id ? updatedBill : b));

    // Sync voucher
    setVouchers(prev => prev.map(v => {
      if (v.id === existing.voucherId || v.transactionId === id || (existing.voucherNumber && v.voucherNumber === existing.voucherNumber)) {
        return {
          ...v,
          paidTo: updates.expenseName || v.paidTo,
          category: updates.category || v.category,
          description: updates.description || v.description,
          amount: newAmount,
          amountInWordsBn: convertNumberToWordsBn(newAmount),
          amountInWordsEn: convertNumberToWordsEn(newAmount),
          paymentMethod: updates.paymentMethod || v.paymentMethod,
        };
      }
      return v;
    }));

    // Sync ledger
    setLedger(prev => {
      const updated = prev.map(l => {
        if (l.transactionId === id || (existing.voucherNumber && l.voucherNo === existing.voucherNumber)) {
          return {
            ...l,
            description: updates.description || l.description,
            payment: newAmount,
            amount: newAmount,
            person: updates.expenseName || l.person,
            category: updates.category || l.category,
            paymentMethod: updates.paymentMethod || l.paymentMethod,
          };
        }
        return l;
      });
      return recalculateLedgerEntries(updated);
    });

    logAudit('UPDATE_MONTHLY_BILL', 'MonthlyBills', id, `Updated monthly bill ${updatedBill.expenseName} (৳${newAmount.toLocaleString()})`);
  };

  const addProject = (pData: Omit<Project, 'id' | 'spent' | 'materialCost' | 'labourCost' | 'contractorCost' | 'otherCost' | 'createdAt' | 'updatedAt'>) => {
    const newP: Project = {
      ...pData,
      id: 'prj-' + Date.now(),
      spent: 0,
      materialCost: 0,
      labourCost: 0,
      contractorCost: 0,
      otherCost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newP]);
    logAudit('CREATE_PROJECT', 'Projects', newP.id, `Created project: ${newP.name}`);
    return newP;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    
    // Sync project name across related collections if name changed
    if (updates.name) {
      const newName = updates.name;
      setExpenses(prev => prev.map(e => e.projectId === id ? { ...e, projectName: newName } : e));
      setVouchers(prev => prev.map(v => v.projectId === id ? { ...v, projectName: newName } : v));
      setLedger(prev => prev.map(l => l.projectId === id ? { ...l, projectName: newName } : l));
      setMaterials(prev => prev.map(m => m.projectId === id ? { ...m, projectName: newName } : m));
      setContractors(prev => prev.map(c => c.projectId === id ? { ...c, projectName: newName } : c));
      setMoneyReceived(prev => prev.map(r => r.projectId === id ? { ...r, projectName: newName } : r));
    }

    logAudit('UPDATE_PROJECT', 'Projects', id, `Updated project ID: ${id} (${updates.name || 'details'})`);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE_PROJECT', 'Projects', id, `Deleted project ID: ${id}`);
  };

  const addContractor = (cData: Omit<Contractor, 'id' | 'totalBill' | 'paidAmount' | 'dueAmount' | 'createdAt'>) => {
    const newC: Contractor = {
      ...cData,
      id: 'cnt-' + Date.now(),
      totalBill: 0,
      paidAmount: 0,
      dueAmount: cData.contractAmount,
      createdAt: new Date().toISOString(),
    };
    setContractors(prev => [...prev, newC]);
    logAudit('CREATE_CONTRACTOR', 'Contractors', newC.id, `Added contractor: ${newC.name}`);
    return newC;
  };

  const addSupplier = (sData: Omit<Supplier, 'id' | 'totalPurchase' | 'totalPaid' | 'currentDue' | 'createdAt'>) => {
    const newS: Supplier = {
      ...sData,
      id: 'sup-' + Date.now(),
      totalPurchase: 0,
      totalPaid: 0,
      currentDue: sData.openingDue || 0,
      createdAt: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, newS]);
    logAudit('CREATE_SUPPLIER', 'Suppliers', newS.id, `Added supplier: ${newS.name}`);
    return newS;
  };

  const addAccount = (aData: Omit<Account, 'id' | 'totalReceived' | 'totalPaid' | 'currentBalance'>) => {
    const newA: Account = {
      ...aData,
      id: 'acc-' + Date.now(),
      totalReceived: 0,
      totalPaid: 0,
      currentBalance: aData.openingBalance || 0,
    };
    setAccounts(prev => [...prev, newA]);
    logAudit('CREATE_ACCOUNT', 'Accounts', newA.id, `Added account: ${newA.name}`);
    return newA;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    logAudit('UPDATE_ACCOUNT', 'Accounts', id, `Updated account: ${id}`);
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    logAudit('DELETE_ACCOUNT', 'Accounts', id, `Deleted account ID: ${id}`);
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveToStorage('settings', updated);
      return updated;
    });
    logAudit('UPDATE_SETTINGS', 'Settings', 'company-settings', 'Updated ERP company settings');
  };

  const addUser = (userData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>, password?: string) => {
    const newUser: UserProfile = {
      ...userData,
      uid: 'usr-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    saveCustomUserCredential(newUser, password || 'password123');
    logAudit('CREATE_USER', 'Users', newUser.uid, `Created user: ${newUser.displayName} (${newUser.role})`);
    return newUser;
  };

  const updateUser = (uid: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u));
    logAudit('UPDATE_USER', 'Users', uid, `Updated user: ${uid}`);
  };

  const deleteUser = (uid: string) => {
    // 1. Mark in deleted user ids list
    try {
      const raw = localStorage.getItem('skrp_deleted_user_ids');
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(uid)) {
        list.push(uid);
        localStorage.setItem('skrp_deleted_user_ids', JSON.stringify(list));
      }
      // Also remove custom user credentials if present
      const rawCreds = localStorage.getItem('skrp_custom_user_credentials');
      if (rawCreds) {
        const creds = JSON.parse(rawCreds);
        Object.keys(creds).forEach(email => {
          if (creds[email]?.profile?.uid === uid) {
            delete creds[email];
          }
        });
        localStorage.setItem('skrp_custom_user_credentials', JSON.stringify(creds));
      }
    } catch (e) {
      console.error('Error recording deleted user:', e);
    }

    // 2. Update local state and storage
    const nextUsers = usersRef.current.filter(u => u.uid !== uid);
    setUsers(nextUsers);
    saveToStorage('users', nextUsers);

    // 3. Immediately push the updated users list to cloud so it's not restored
    firebaseSyncService.uploadAllToCloud({
      projects: projectsRef.current,
      accounts: accountsRef.current,
      contractors: contractorsRef.current,
      suppliers: suppliersRef.current,
      materials: materialsRef.current,
      expenses: expensesRef.current,
      moneyReceived: moneyReceivedRef.current,
      loans: loansRef.current,
      monthlyBills: monthlyBillsRef.current,
      vouchers: vouchersRef.current,
      ledger: ledgerRef.current,
      auditLogs: auditLogsRef.current,
      settings: settingsRef.current,
      users: nextUsers
    }).catch(err => console.warn('Cloud sync after user delete:', err));

    logAudit('DELETE_USER', 'Users', uid, `Deleted user ID: ${uid}`);
  };

  const clearAllDemoData = () => {
    setExpenses([]);
    setMoneyReceived([]);
    setLoans([]);
    setMonthlyBills([]);
    setVouchers([]);
    setLedger([]);
    setContractors([]);
    setSuppliers([]);
    setMaterials([]);
    
    // Reset balances in accounts to 0
    const resetAccounts = accounts.map(a => ({
      ...a,
      totalReceived: 0,
      totalPaid: 0,
      currentBalance: 0,
      openingBalance: 0,
    }));
    setAccounts(resetAccounts);
    saveToStorage('accounts', resetAccounts);

    // Reset spend in projects to 0
    const resetProjects = projects.map(p => ({
      ...p,
      spent: 0,
      materialCost: 0,
      labourCost: 0,
      contractorCost: 0,
      otherCost: 0,
      updatedAt: new Date().toISOString(),
    }));
    setProjects(resetProjects);
    saveToStorage('projects', resetProjects);

    // Explicitly persist empty arrays so initial sample data does NOT re-hydrate on page refresh
    const emptyKeys = [
      'expenses', 
      'moneyReceived', 
      'loans', 
      'monthlyBills', 
      'vouchers', 
      'ledger', 
      'contractors', 
      'suppliers',
      'materials'
    ];
    emptyKeys.forEach(k => saveToStorage(k, []));

    logAudit('CLEAR_DEMO_DATA', 'System', 'all', 'Cleared all demo transactions, vouchers, contractors, suppliers, materials, expenses, and ledger entries.');
  };

  const resetToSampleData = () => {
    setProjects(initialProjects);
    setAccounts(initialAccounts);
    setContractors(initialContractors);
    setSuppliers(initialSuppliers);
    setMaterials(initialMaterials);
    setExpenses(initialExpenses);
    setMoneyReceived(initialMoneyReceived);
    setLoans(initialLoans);
    setMonthlyBills(initialMonthlyBills);
    setVouchers(initialVouchers);
    setLedger(initialLedger);
    setAuditLogs(initialAuditLogs);
    setSettings(initialCompanySettings);
    setUsers(initialUsers);
    localStorage.clear();
    logAudit('RESET_DATABASE', 'System', 'all', 'Reset database to initial construction sample dataset.');
  };

  const getAllDataset = () => {
    return {
      projects,
      accounts,
      contractors,
      suppliers,
      materials,
      expenses,
      moneyReceived,
      loans,
      monthlyBills,
      vouchers,
      ledger,
      auditLogs,
      settings,
      users
    };
  };

  const restoreFullDataset = (data: any) => {
    if (!data) return;
    if (Array.isArray(data.projects)) setProjects(data.projects);
    if (Array.isArray(data.accounts)) setAccounts(data.accounts);
    if (Array.isArray(data.contractors)) setContractors(data.contractors);
    if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
    if (Array.isArray(data.materials)) setMaterials(data.materials);
    if (Array.isArray(data.expenses)) setExpenses(data.expenses);
    if (Array.isArray(data.moneyReceived)) setMoneyReceived(data.moneyReceived);
    if (Array.isArray(data.loans)) setLoans(data.loans);
    if (Array.isArray(data.monthlyBills)) setMonthlyBills(data.monthlyBills);
    if (Array.isArray(data.vouchers)) setVouchers(data.vouchers);
    if (Array.isArray(data.ledger)) setLedger(data.ledger);
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
    if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
    if (Array.isArray(data.users)) setUsers(data.users);

    logAudit('RESTORE_DATASET', 'System', 'all', 'Full dataset restored from cloud/backup.');
  };

  const syncNowWithCloud = async () => {
    setCloudSyncStatus('SYNCING');
    try {
      await firebaseSyncService.uploadAllToCloud({
        projects,
        accounts,
        contractors,
        suppliers,
        materials,
        expenses,
        moneyReceived,
        loans,
        monthlyBills,
        vouchers,
        ledger,
        auditLogs,
        settings,
        users
      });
      setCloudSyncStatus('CONNECTED');
      setCloudLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCloudSyncError(null);
    } catch (e: any) {
      setCloudSyncStatus('ERROR');
      setCloudSyncError(e?.message || 'Sync failed');
      throw e;
    }
  };

  const pullLatestFromCloud = async () => {
    setCloudSyncStatus('SYNCING');
    try {
      const data = await firebaseSyncService.downloadAllFromCloud();
      if (data) {
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.accounts)) setAccounts(data.accounts);
        if (Array.isArray(data.contractors)) setContractors(data.contractors);
        if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
        if (Array.isArray(data.materials)) setMaterials(data.materials);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.moneyReceived)) setMoneyReceived(data.moneyReceived);
        if (Array.isArray(data.loans)) setLoans(data.loans);
        if (Array.isArray(data.monthlyBills)) setMonthlyBills(data.monthlyBills);
        if (Array.isArray(data.vouchers)) setVouchers(data.vouchers);
        if (Array.isArray(data.ledger)) setLedger(recalculateLedgerEntries(data.ledger));
        if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
        if (Array.isArray(data.users)) setUsers(data.users);
      }
      setCloudSyncStatus('CONNECTED');
      setCloudLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCloudSyncError(null);
    } catch (e: any) {
      setCloudSyncStatus('ERROR');
      setCloudSyncError(e?.message || 'Download failed');
      throw e;
    }
  };

  const exportLocalBackup = () => {
    firebaseSyncService.exportJsonBackup({
      projects,
      accounts,
      contractors,
      suppliers,
      materials,
      expenses,
      moneyReceived,
      loans,
      monthlyBills,
      vouchers,
      ledger,
      auditLogs,
      settings,
      users
    });
  };

  const importLocalBackup = async (file: File) => {
    const data = await firebaseSyncService.importJsonBackup(file);
    if (data) {
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (Array.isArray(data.contractors)) setContractors(data.contractors);
      if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (Array.isArray(data.materials)) setMaterials(data.materials);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (Array.isArray(data.moneyReceived)) setMoneyReceived(data.moneyReceived);
      if (Array.isArray(data.loans)) setLoans(data.loans);
      if (Array.isArray(data.monthlyBills)) setMonthlyBills(data.monthlyBills);
      if (Array.isArray(data.vouchers)) setVouchers(data.vouchers);
      if (Array.isArray(data.ledger)) setLedger(recalculateLedgerEntries(data.ledger));
      if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      if (Array.isArray(data.users)) setUsers(data.users);

      await syncNowWithCloud();
    }
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        accounts,
        contractors,
        suppliers,
        materials,
        expenses,
        moneyReceived,
        loans,
        monthlyBills,
        vouchers,
        ledger,
        auditLogs,
        settings,
        users,
        selectedProjectId,
        setSelectedProjectId,
        addExpense,
        updateExpense,
        addMoneyReceived,
        updateMoneyReceived,
        addContractorPayment,
        addMonthlyBill,
        updateMonthlyBill,
        addLoan,
        updateLoan,
        repayLoan,
        addAccountTransfer,
        addProject,
        updateProject,
        deleteProject,
        addContractor,
        updateContractor,
        deleteContractor,
        addSupplier,
        deleteSupplier,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addAccount,
        updateAccount,
        deleteAccount,
        softDeleteExpense,
        deleteExpense,
        deleteMoneyReceived,
        updateVoucher,
        deleteVoucher,
        updateLedgerEntry,
        deleteLedgerEntry,
        deleteLoan,
        deleteMonthlyBill,
        updateSettings,
        addUser,
        updateUser,
        deleteUser,
        getProjectById,
        getAccountById,
        getVoucherByNumber,
        resetToSampleData,
        clearAllDemoData,
        getAllDataset,
        restoreFullDataset,
        cloudSyncStatus,
        cloudLastSyncTime,
        cloudSyncError,
        syncNowWithCloud,
        pullLatestFromCloud,
        exportLocalBackup,
        importLocalBackup,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
