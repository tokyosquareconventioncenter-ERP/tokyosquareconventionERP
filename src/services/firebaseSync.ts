/**
 * Firebase Firestore Cloud Synchronization & JSON Backup Service
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseConfigured, firebaseConfig } from '../firebase/config';
import { 
  Project, 
  Account, 
  Contractor, 
  Supplier, 
  Expense, 
  MoneyReceived, 
  Loan, 
  MonthlyCompanyExpense, 
  Voucher, 
  LedgerEntry, 
  AuditLog, 
  CompanySettings, 
  UserProfile,
  MaterialItem
} from '../types';

export interface FullERPBackupPayload {
  version: string;
  exportedAt: string;
  company: string;
  data: {
    projects: Project[];
    accounts: Account[];
    contractors: Contractor[];
    suppliers: Supplier[];
    materials?: MaterialItem[];
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
}

const COLLECTION_NAME = 'skrp_erp_data';
const MAIN_DOC_ID = 'master_dataset';
const AUTO_SYNC_KEY = 'skrp_auto_sync_enabled';

/**
 * Helper to recursively sanitize objects for Firestore (removes undefined values, converts NaN, etc.)
 */
function sanitizeForFirestore<T>(val: T): T {
  if (val === undefined) {
    return null as any;
  }
  if (val === null || typeof val !== 'object') {
    if (typeof val === 'number' && isNaN(val)) {
      return 0 as any;
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as any;
  }
  const cleanObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      cleanObj[k] = sanitizeForFirestore(v);
    }
  }
  return cleanObj as T;
}

export const isAutoSyncEnabled = (): boolean => {
  try {
    const val = localStorage.getItem(AUTO_SYNC_KEY);
    if (val === null) return true; // Default to TRUE for seamless multi-device sync
    return val === 'true';
  } catch {
    return true;
  }
};

export const setAutoSyncEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem(AUTO_SYNC_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving auto sync status:', e);
  }
};

export const firebaseSyncService = {
  /**
   * Test connection to Firebase Firestore
   */
  async testConnection(): Promise<{ success: boolean; messageBn: string; messageEn: string }> {
    if (!isFirebaseConfigured || !db) {
      return {
        success: false,
        messageBn: 'ফায়ারবেস কনফিগারেশন সেট করা হয়নি। অনুগ্রহ করে প্রথমে "ফায়ারবেস কনফিগার করুন" বাটনে ক্লিক করে API Key ও Project ID দিন।',
        messageEn: 'Firebase configuration is missing. Please configure Firebase API credentials first.'
      };
    }

    try {
      const pingPromise = (async () => {
        const pingRef = doc(db!, COLLECTION_NAME, 'connection_ping');
        await setDoc(pingRef, {
          status: 'CONNECTED',
          testedAt: new Date().toISOString(),
          projectId: firebaseConfig.projectId,
          serverTime: serverTimestamp()
        }, { merge: true });
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Check network or Firestore rules.')), 10000)
      );

      await Promise.race([pingPromise, timeoutPromise]);

      return {
        success: true,
        messageBn: `ক্লাউড ফায়ারবেসের সাথে সফলভাবে সংযুক্ত হয়েছে! (প্রজেক্ট: ${firebaseConfig.projectId})`,
        messageEn: `Successfully connected to Firebase Firestore! (Project: ${firebaseConfig.projectId})`
      };
    } catch (err: any) {
      console.error('Firebase test connection error:', err);
      let errorDetail = err?.message || 'Unknown network or permission error';
      if (err?.code === 'permission-denied') {
        errorDetail = 'Firestore Security Rules-এ অনুমতি দেওয়া নেই। দয়া করে Firebase Console-এ rules allow read, write করুন।';
      }
      return {
        success: false,
        messageBn: `কানেকশন ব্যর্থ হয়েছে: ${errorDetail}`,
        messageEn: `Connection failed: ${errorDetail}`
      };
    }
  },

  /**
   * Upload all local ERP dataset to Firebase Firestore
   */
  async uploadAllToCloud(data: FullERPBackupPayload['data']): Promise<{ success: boolean; message: string }> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured. Please configure Firebase credentials in settings.');
    }

    try {
      const mainDocRef = doc(db, COLLECTION_NAME, MAIN_DOC_ID);
      
      const payload: FullERPBackupPayload = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        company: 'S.M. Khalilur Rahman Properties Ltd.',
        data: {
          projects: data.projects || [],
          accounts: data.accounts || [],
          contractors: data.contractors || [],
          suppliers: data.suppliers || [],
          materials: data.materials || [],
          expenses: data.expenses || [],
          moneyReceived: data.moneyReceived || [],
          loans: data.loans || [],
          monthlyBills: data.monthlyBills || [],
          vouchers: data.vouchers || [],
          ledger: data.ledger || [],
          auditLogs: data.auditLogs || [],
          settings: data.settings,
          users: data.users || []
        }
      };

      const sanitizedPayload = sanitizeForFirestore(payload);

      const uploadPromise = setDoc(mainDocRef, {
        ...sanitizedPayload,
        updatedAtServer: serverTimestamp()
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timed out. Check network or Firestore rules.')), 12000)
      );

      await Promise.race([uploadPromise, timeoutPromise]);

      return {
        success: true,
        message: 'সকল ডাটা সফলভাবে ক্লাউড ফায়ারবেসে আপলোড ও সিনক্রোনাইজ হয়েছে।'
      };
    } catch (err: any) {
      console.error('Error uploading to Firebase:', err);
      throw new Error(err?.message || 'Failed to upload dataset to Firebase Firestore');
    }
  },

  /**
   * Listen to real-time changes on the master dataset in Firestore
   */
  subscribeToCloudDataset(
    onDataReceived: (data: FullERPBackupPayload['data'] | null, exists: boolean) => void,
    onError?: (err: any) => void
  ): Unsubscribe | null {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const mainDocRef = doc(db, COLLECTION_NAME, MAIN_DOC_ID);
      const unsubscribe = onSnapshot(mainDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data() as FullERPBackupPayload;
          if (docData && docData.data) {
            onDataReceived(docData.data, true);
          } else {
            onDataReceived(null, true);
          }
        } else {
          // Document does not exist in Firestore yet
          onDataReceived(null, false);
        }
      }, (error) => {
        console.warn('Firebase real-time sync subscription error:', error);
        if (onError) onError(error);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('Could not initialize Firebase real-time listener:', e);
      if (onError) onError(e);
      return null;
    }
  },

  /**
   * Download and restore dataset from Firebase Firestore
   */
  async downloadAllFromCloud(): Promise<FullERPBackupPayload['data']> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase is not configured. Please setup Firebase API keys first.');
    }

    try {
      const mainDocRef = doc(db, COLLECTION_NAME, MAIN_DOC_ID);
      const snapshot = await getDoc(mainDocRef);

      if (!snapshot.exists()) {
        throw new Error('ফায়ারবেস ক্লাউডে কোনো ডাটা পাওয়া যায়নি। অনুগ্রহ করে প্রথমে "ক্লাউডে আপলোড" করুন।');
      }

      const docData = snapshot.data() as FullERPBackupPayload;
      if (!docData || !docData.data) {
        throw new Error('ক্লাউড ডাটার ফরম্যাট সঠিক নয়।');
      }

      return docData.data;
    } catch (err: any) {
      console.error('Error downloading from Firebase:', err);
      throw err;
    }
  },

  /**
   * Export JSON Backup file to local PC/Mobile storage
   */
  exportJsonBackup(data: FullERPBackupPayload['data']) {
    const payload: FullERPBackupPayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      company: 'S.M. Khalilur Rahman Properties Ltd.',
      data
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `SKRP_ERP_Backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Import and parse JSON Backup file
   */
  async importJsonBackup(file: File): Promise<FullERPBackupPayload['data']> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as FullERPBackupPayload;

          if (!parsed || (!parsed.data && !Array.isArray((parsed as any).projects))) {
            throw new Error('Invalid JSON backup file structure.');
          }

          // Handle if it's wrapped in `data` or direct root
          const dataset = parsed.data || (parsed as any);
          resolve(dataset);
        } catch (err) {
          reject(new Error('ফাইলটি সঠিক JSON ব্যাকআপ ফাইল নয় বা ফাইলটি নষ্ট হয়েছে।'));
        }
      };
      reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
      reader.readAsText(file);
    });
  }
};
