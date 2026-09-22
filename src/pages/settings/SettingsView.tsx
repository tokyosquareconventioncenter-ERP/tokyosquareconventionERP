/**
 * ERP System Settings & Cloud Sync View
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, 
  Building2, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Trash2,
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Sliders,
  Database,
  Download,
  Upload,
  Globe,
  GitBranch,
  Terminal,
  Key,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  Info,
  Image as ImageIcon,
  Camera,
  X,
  Lock,
  Unlock,
  ShieldAlert,
  CreditCard,
  Sparkles,
  UserCheck,
  Calendar,
  Tags,
  Tag,
  Plus,
  ListPlus
} from 'lucide-react';
import { SaaSClientRegistry } from './SaaSClientRegistry';
import buildingLogoImg from '../../assets/images/skrp_building_logo_1788342210019.jpg';
import { 
  firebaseConfig, 
  isFirebaseConfigured, 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  clearStoredFirebaseConfig,
  FirebaseCustomConfig 
} from '../../firebase/config';
import { 
  firebaseSyncService, 
  isAutoSyncEnabled, 
  setAutoSyncEnabled 
} from '../../services/firebaseSync';
import {
  getSavedCustomCategories,
  saveCustomCategoryToStorage,
  deleteCustomCategoryFromStorage,
  getSavedCustomMonthlyExpenseHeads,
  saveCustomMonthlyExpenseHeadToStorage,
  deleteMonthlyExpenseHeadFromStorage,
  resetMonthlyExpenseHeads,
  getSavedMoneyReceivedSources,
  saveCustomMoneyReceivedSource,
  deleteMoneyReceivedSource,
  resetMoneyReceivedSources,
  SKRP_MONEY_SOURCES,
  UNIVERSAL_MONEY_SOURCES,
  SKRP_MONTHLY_EXPENSE_HEADS,
  UNIVERSAL_MONTHLY_EXPENSE_HEADS
} from '../../data/constructionCategories';

export const SettingsView: React.FC = () => {
  const { language } = useLanguage();
  const { 
    resetToSampleData, 
    clearAllDemoData, 
    getAllDataset, 
    restoreFullDataset,
    settings,
    updateSettings
  } = useData();

  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'CLOUD_SYNC' | 'COMPANY' | 'DEPLOYMENT' | 'MASTER_CONTROL' | 'CATEGORIES'>('COMPANY');

  // Master Control Security & Hidden State
  const isMasterDeveloperUser = 
    currentUser?.email?.toLowerCase() === 'engtotul176@gmail.com' || 
    currentUser?.role === 'SUPER_ADMIN';

  const [isSecretUnlocked, setIsSecretUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('ababil_master_unlocked') === 'true';
  });

  const isMasterVisible = isMasterDeveloperUser || isSecretUnlocked;

  // Protect restricted tabs from non-developers
  useEffect(() => {
    if (!isMasterVisible && (activeTab === 'DEPLOYMENT' || activeTab === 'MASTER_CONTROL')) {
      setActiveTab('COMPANY');
    }
  }, [isMasterVisible, activeTab]);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [secretModalPin, setSecretModalPin] = useState('');
  const [secretModalError, setSecretModalError] = useState('');

  // Master Control Authentication State
  const [isMasterAuthed, setIsMasterAuthed] = useState(() => isMasterDeveloperUser || isSecretUnlocked);
  const [masterPinInput, setMasterPinInput] = useState('');
  const [masterPinError, setMasterPinError] = useState('');
  const [masterSaveSuccess, setMasterSaveSuccess] = useState('');

  // Triple-click on Settings Header for secret Developer Door
  const [headerClickCount, setHeaderClickCount] = useState(0);
  const headerClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleHeaderTripleClick = () => {
    setHeaderClickCount(prev => {
      const next = prev + 1;
      if (headerClickTimerRef.current) clearTimeout(headerClickTimerRef.current);
      if (next >= 3) {
        setIsSecretModalOpen(true);
        return 0;
      }
      headerClickTimerRef.current = setTimeout(() => {
        setHeaderClickCount(0);
      }, 1200);
      return next;
    });
  };

  // Keyboard shortcut Ctrl+Shift+M or Cmd+Shift+M for quick secret access
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setIsSecretModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Listen for unlock events from AppLayout footer
  useEffect(() => {
    const handleUnlockedEvent = () => {
      const isUnlocked = sessionStorage.getItem('ababil_master_unlocked') === 'true';
      setIsSecretUnlocked(isUnlocked);
      if (isUnlocked) {
        setIsMasterAuthed(true);
        setActiveTab('MASTER_CONTROL');
      }
    };
    window.addEventListener('ababil_master_unlocked_changed', handleUnlockedEvent);
    return () => window.removeEventListener('ababil_master_unlocked_changed', handleUnlockedEvent);
  }, []);

  // License & SaaS Subscription States
  const currentLicense = settings?.license;
  const [licenseClientName, setLicenseClientName] = useState(currentLicense?.clientName || settings?.companyName || '');
  const [licenseClientPhone, setLicenseClientPhone] = useState(currentLicense?.clientPhone || settings?.phone || '');
  const [licenseMonthlyFee, setLicenseMonthlyFee] = useState(currentLicense?.monthlyFee ?? 300);
  const [licenseNextBillingDate, setLicenseNextBillingDate] = useState(currentLicense?.nextBillingDate || '2026-10-30');
  const [licenseMasterPin, setLicenseMasterPin] = useState(currentLicense?.masterPin || '76000');
  const [licenseDevContact, setLicenseDevContact] = useState(currentLicense?.developerContact || '01672965561');
  const [licenseDevEmail, setLicenseDevEmail] = useState(currentLicense?.developerEmail || 'Engtotul176@gmail.com');
  const [licenseDevBkash, setLicenseDevBkash] = useState(currentLicense?.developerBkash || '01672965561');
  const [licenseNoticeBn, setLicenseNoticeBn] = useState(currentLicense?.suspensionNoticeBn || 'সম্মানিত গ্রাহক, আপনার কনস্ট্রাকশন ইআরপি সফটওয়্যারের মাসিক সাবস্ক্রিপশন বিল বাকি থাকায় সিস্টেমটি সাময়িকভাবে স্থগিত করা হয়েছে। অ্যাকাউন্টটি পুনরায় সক্রিয় করতে সফটওয়্যার কর্তৃপক্ষের সাথে যোগাযোগ করুন।');

  // Company Profile State initialized from centralized DataContext settings
  const [companyNameBn, setCompanyNameBn] = useState(settings?.companyNameBn || '');
  const [companyNameEn, setCompanyNameEn] = useState(settings?.companyName || '');
  const [erpTitleBn, setErpTitleBn] = useState(settings?.erpTitleBn || '');
  const [erpTitleEn, setErpTitleEn] = useState(settings?.erpTitle || '');
  const [addressBn, setAddressBn] = useState(settings?.addressBn || '');
  const [addressEn, setAddressEn] = useState(settings?.address || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [voucherPrefix, setVoucherPrefix] = useState('CPV');
  const [customLogoUrl, setCustomLogoUrl] = useState(settings?.logoUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if settings change externally, but skip if currently saving to avoid input bounce
  const isSavingRef = useRef(false);
  React.useEffect(() => {
    if (settings && !isSavingRef.current) {
      if (settings.companyNameBn) setCompanyNameBn(settings.companyNameBn);
      if (settings.companyName) setCompanyNameEn(settings.companyName);
      if (settings.erpTitleBn) setErpTitleBn(settings.erpTitleBn);
      if (settings.erpTitle) setErpTitleEn(settings.erpTitle);
      if (settings.addressBn) setAddressBn(settings.addressBn);
      if (settings.address) setAddressEn(settings.address);
      if (settings.phone) setPhone(settings.phone);
      if (settings.email) setEmail(settings.email);
      if (settings.logoUrl !== undefined) setCustomLogoUrl(settings.logoUrl || '');
      if (settings.license) {
        if (settings.license.clientName) setLicenseClientName(settings.license.clientName);
        if (settings.license.clientPhone) setLicenseClientPhone(settings.license.clientPhone);
        if (settings.license.monthlyFee !== undefined) setLicenseMonthlyFee(settings.license.monthlyFee);
        if (settings.license.nextBillingDate) setLicenseNextBillingDate(settings.license.nextBillingDate);
        if (settings.license.masterPin) setLicenseMasterPin(settings.license.masterPin);
        if (settings.license.developerContact) setLicenseDevContact(settings.license.developerContact);
        if (settings.license.developerEmail) setLicenseDevEmail(settings.license.developerEmail);
        if (settings.license.developerBkash) setLicenseDevBkash(settings.license.developerBkash);
        if (settings.license.suspensionNoticeBn) setLicenseNoticeBn(settings.license.suspensionNoticeBn);
      }
    }
  }, [settings]);

  // Cloud Sync State
  const [autoSync, setAutoSync] = useState<boolean>(() => isAutoSyncEnabled());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Custom Firebase Config Form
  const storedCfg = getStoredFirebaseConfig();
  const [apiKey, setApiKey] = useState(storedCfg?.apiKey || firebaseConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(storedCfg?.authDomain || firebaseConfig.authDomain || '');
  const [projectId, setProjectId] = useState(storedCfg?.projectId || firebaseConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(storedCfg?.storageBucket || firebaseConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(storedCfg?.messagingSenderId || firebaseConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(storedCfg?.appId || firebaseConfig.appId || '');
  const [rawConfigJson, setRawConfigJson] = useState('');

  // Modals & Notifications
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'error'; title: string; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const isBn = language === 'bn';

  // Money Received Sources, Monthly Heads & Custom Categories State
  const [moneySources, setMoneySources] = useState<string[]>(() => getSavedMoneyReceivedSources());
  const [newMoneySourceText, setNewMoneySourceText] = useState('');

  const [monthlyHeads, setMonthlyHeads] = useState<string[]>(() => getSavedCustomMonthlyExpenseHeads());
  const [newMonthlyHeadText, setNewMonthlyHeadText] = useState('');

  const [customCategoriesList, setCustomCategoriesList] = useState<string[]>(() => getSavedCustomCategories());
  const [newCategoryText, setNewCategoryText] = useState('');

  const handleAddMoneySource = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newMoneySourceText.trim();
    if (!trimmed) return;
    const updated = saveCustomMoneyReceivedSource(trimmed);
    setMoneySources(updated);
    setNewMoneySourceText('');
    setActionNotice({
      type: 'success',
      title: isBn ? 'উৎস যুক্ত হয়েছে' : 'Source Added',
      message: `"${trimmed}" ${isBn ? 'সফলভাবে টাকা প্রাপ্তির উৎস তালিকায় যুক্ত হয়েছে।' : 'has been added to Money Received sources.'}`
    });
  };

  const handleDeleteMoneySource = (sourceName: string) => {
    const updated = deleteMoneyReceivedSource(sourceName);
    setMoneySources(updated);
    setActionNotice({
      type: 'info',
      title: isBn ? 'উৎস মুছে ফেলা হয়েছে' : 'Source Deleted',
      message: `"${sourceName}" ${isBn ? 'উৎস তালিকা থেকে সফলভাবে মুছে ফেলা হয়েছে।' : 'has been removed from sources list.'}`
    });
  };

  const handleResetMoneySources = (template: 'skrp' | 'universal') => {
    const updated = resetMoneyReceivedSources(template);
    setMoneySources(updated);
    setActionNotice({
      type: 'success',
      title: isBn ? 'উৎস তালিকা আপডেট হয়েছে' : 'Sources Updated',
      message: template === 'universal'
        ? (isBn ? 'স্ট্যান্ডার্ড সাধারণ টাকা প্রাপ্তির উৎস তালিকা সেট করা হয়েছে।' : 'Standard universal sources template loaded.')
        : (isBn ? 'এস.কে.আর.পি প্রিসেট উৎস তালিকা রিস্টোর করা হয়েছে।' : 'Preset sources template restored.')
    });
  };

  const handleAddMonthlyHead = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newMonthlyHeadText.trim();
    if (!trimmed) return;
    const updated = saveCustomMonthlyExpenseHeadToStorage(trimmed);
    setMonthlyHeads(updated);
    setNewMonthlyHeadText('');
    setActionNotice({
      type: 'success',
      title: isBn ? 'মাসিক খরচের খাত যুক্ত হয়েছে' : 'Monthly Head Added',
      message: `"${trimmed}" ${isBn ? 'সফলভাবে কোম্পানি মাসিক বিলের তালিকায় যুক্ত হয়েছে।' : 'has been added to monthly bill heads.'}`
    });
  };

  const handleDeleteMonthlyHead = (headName: string) => {
    const updated = deleteMonthlyExpenseHeadFromStorage(headName);
    setMonthlyHeads(updated);
    setActionNotice({
      type: 'info',
      title: isBn ? 'খাত মুছে ফেলা হয়েছে' : 'Head Deleted',
      message: `"${headName}" ${isBn ? 'মাসিক বিলের তালিকা থেকে সফলভাবে মুছে ফেলা হয়েছে।' : 'has been removed from monthly bill heads.'}`
    });
  };

  const handleResetMonthlyHeads = (template: 'skrp' | 'universal') => {
    const updated = resetMonthlyExpenseHeads(template);
    setMonthlyHeads(updated);
    setActionNotice({
      type: 'success',
      title: isBn ? 'মাসিক বিলের খাত আপডেট হয়েছে' : 'Monthly Heads Updated',
      message: template === 'universal'
        ? (isBn ? 'স্ট্যান্ডার্ড সাধারণ মাসিক খরচের খাত সেট করা হয়েছে।' : 'Standard universal monthly bill heads loaded.')
        : (isBn ? 'এস.কে.আর.পি প্রিসেট মাসিক বিলের খাত রিস্টোর করা হয়েছে।' : 'Preset monthly bill heads restored.')
    });
  };

  const handleAddCustomCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryText.trim();
    if (!trimmed) return;
    const updated = saveCustomCategoryToStorage(trimmed);
    setCustomCategoriesList(updated);
    setNewCategoryText('');
    setActionNotice({
      type: 'success',
      title: isBn ? 'কাস্টম খরচের খাত যুক্ত হয়েছে' : 'Category Added',
      message: `"${trimmed}" ${isBn ? 'সফলভাবে সাধারণ খরচের ড্রপডাউনে যুক্ত হয়েছে।' : 'has been added to general expense categories.'}`
    });
  };

  const handleDeleteCustomCategory = (catName: string) => {
    const updated = deleteCustomCategoryFromStorage(catName);
    setCustomCategoriesList(updated);
    setActionNotice({
      type: 'info',
      title: isBn ? 'খাত মুছে ফেলা হয়েছে' : 'Category Deleted',
      message: `"${catName}" ${isBn ? 'কাস্টম খরচের তালিকা থেকে মুছে ফেলা হয়েছে।' : 'has been deleted from custom categories.'}`
    });
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setActionNotice({
        type: 'error',
        title: isBn ? 'ছবির সাইজ অনেক বড়' : 'Image File Too Large',
        message: isBn 
          ? 'অনুগ্রহ করে ৩ মেগাবাইটের কম সাইজের ছবি (PNG/JPG/WEBP) আপলোড করুন।' 
          : 'Please select an image file under 3MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomLogoUrl(result);
        setActionNotice({
          type: 'success',
          title: isBn ? 'নতুন ছবি লোড হয়েছে!' : 'Picture Loaded!',
          message: isBn 
            ? 'ছবিটি প্রিভিউ বক্সে দেখা যাচ্ছে। নিচে "সংরক্ষণ করুন" বাটনে ক্লিক করে সেভ করুন।' 
            : 'Image loaded in preview. Click "Save Settings" below to apply.'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultLogo = () => {
    setCustomLogoUrl('');
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
    setActionNotice({
      type: 'info',
      title: isBn ? 'ডিফল্ট বিল্ডিং লোগো সিলেক্টেড' : 'Default Building Logo Selected',
      message: isBn 
        ? 'ডিফল্ট SKRP বিল্ডিং ক্রেস্ট লোগো পুনরায় নির্ধারিত হয়েছে। সংরক্ষণ করতে নিচের বাটনে চাপুন।' 
        : 'Default architectural crest restored. Click Save to apply.'
    });
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    isSavingRef.current = true;
    updateSettings({
      companyName: companyNameEn.trim(),
      companyNameBn: companyNameBn.trim(),
      erpTitle: erpTitleEn.trim(),
      erpTitleBn: erpTitleBn.trim(),
      address: addressEn.trim(),
      addressBn: addressBn.trim(),
      phone: phone.trim(),
      email: email.trim(),
      logoUrl: customLogoUrl.trim() || undefined,
      voucherPrefix: voucherPrefix.trim(),
    });
    setIsSaved(true);
    setActionNotice({
      type: 'success',
      title: isBn ? 'কোম্পানি সেটিংস ও লোগো সংরক্ষিত হয়েছে' : 'Company Settings & Logo Saved',
      message: isBn 
        ? 'কোম্পানির নাম, লোগো/প্রজেক্ট ছবি, ঠিকানা ও ফোন নম্বর সফলভাবে সংরক্ষিত হয়েছে এবং সাইডবার, হেডার ও সকল ভাউচারে কার্যকর হয়েছে।'
        : 'Company profile and custom logo/project picture saved and applied across system.'
    });
    setTimeout(() => {
      isSavingRef.current = false;
      setIsSaved(false);
    }, 4000);
  };

  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    setAutoSyncEnabled(checked);
    setActionNotice({
      type: 'info',
      title: checked 
        ? (isBn ? 'অটো-সিঙ্ক সক্রিয় করা হয়েছে' : 'Auto-Sync Enabled') 
        : (isBn ? 'অটো-সিঙ্ক বন্ধ করা হয়েছে' : 'Auto-Sync Disabled'),
      message: checked
        ? (isBn ? 'প্রতিটি নতুন এন্ট্রি স্বয়ংক্রিয়ভাবে ক্লাউড ফায়ারবেসে সিঙ্ক হবে।' : 'Transactions will automatically sync with Firebase.')
        : (isBn ? 'এখন শুধুমাত্র ম্যানুয়াল আপলোড/ডাউনলোড কাজ করবে।' : 'Manual cloud sync is active.')
    });
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const configToSave: FirebaseCustomConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };
    saveStoredFirebaseConfig(configToSave);
  };

  const handlePasteRawJson = () => {
    try {
      // Clean JS object format if pasted directly from Firebase console
      const cleaned = rawConfigJson
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
        .replace(/'/g, '"')
        .trim();

      const parsed = JSON.parse(cleaned);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);

      setActionNotice({
        type: 'success',
        title: isBn ? 'ফায়ারবেস কনফিগ সনাক্ত করা হয়েছে!' : 'Config Detected!',
        message: isBn ? 'ফিল্ডগুলো স্বয়ংক্রিয়ভাবে পূরণ হয়েছে। এবার নিচে "সংরক্ষণ করুন" চাপুন।' : 'Fields auto-filled successfully.'
      });
    } catch {
      setActionNotice({
        type: 'error',
        title: isBn ? 'JSON ফরম্যাট সঠিক নয়' : 'Invalid JSON',
        message: isBn ? 'অনুগ্রহ করে Firebase Console থেকে কপি করা সঠিক কনফিগ পেস্ট করুন।' : 'Please paste valid JSON config from Firebase console.'
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const res = await firebaseSyncService.testConnection();
      setActionNotice({
        type: res.success ? 'success' : 'error',
        title: res.success 
          ? (isBn ? 'কানেকশন টেস্ট সফল!' : 'Connection Test Successful!') 
          : (isBn ? 'কানেকশন টেস্ট ব্যর্থ!' : 'Connection Failed!'),
        message: isBn ? res.messageBn : res.messageEn
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleUploadToCloud = async () => {
    setIsUploading(true);
    try {
      const allData = getAllDataset();
      await firebaseSyncService.uploadAllToCloud(allData);
      setActionNotice({
        type: 'success',
        title: isBn ? 'ক্লাউড আপলোড সফল হয়েছে!' : 'Cloud Upload Complete!',
        message: isBn 
          ? 'সকল প্রজেক্ট, হিসাব, খরচ, ভাউচার ও কন্ট্রাক্টর ডাটা ফায়ারবেস ক্লাউডে সফলভাবে আপলোড হয়েছে।' 
          : 'All ERP records have been synced to Firebase Firestore.'
      });
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        title: isBn ? 'ক্লাউড আপলোড ব্যর্থ হয়েছে' : 'Upload Failed',
        message: err?.message || 'Could not upload data to cloud.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFromCloud = async () => {
    setIsDownloading(true);
    try {
      const cloudData = await firebaseSyncService.downloadAllFromCloud();
      restoreFullDataset(cloudData);
      setActionNotice({
        type: 'success',
        title: isBn ? 'ক্লাউড থেকে সফলভাবে ডাউনলোড হয়েছে!' : 'Downloaded from Cloud!',
        message: isBn 
          ? 'ক্লাউড ফায়ারবেসের সর্বশেষ তথ্য দিয়ে লোকাল ডাটাবেজ আপডেট করা হয়েছে।' 
          : 'Local database has been updated with the latest cloud dataset.'
      });
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        title: isBn ? 'ক্লাউড ডাউনলোড ব্যর্থ হয়েছে' : 'Download Failed',
        message: err?.message || 'Could not fetch data from cloud.'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportJson = () => {
    const data = getAllDataset();
    firebaseSyncService.exportJsonBackup(data);
    setActionNotice({
      type: 'success',
      title: isBn ? 'JSON ব্যাকআপ ডাউনলোড সম্পন্ন!' : 'JSON Backup Exported!',
      message: isBn ? 'ব্যাকআপ ফাইলটি আপনার ডিভাইসে সেভ হয়েছে।' : 'Backup file has been saved to your device.'
    });
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await firebaseSyncService.importJsonBackup(file);
      restoreFullDataset(importedData);
      setActionNotice({
        type: 'success',
        title: isBn ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Backup Restored Successfully!',
        message: isBn 
          ? 'ফাইল থেকে সকল হিসাব, ভাউচার ও লেজার সফলভাবে রিস্টোর করা হয়েছে।' 
          : 'All datasets restored from JSON backup file.'
      });
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        title: isBn ? 'ব্যাকআপ রিস্টোর ব্যর্থ' : 'Restore Failed',
        message: err?.message || 'Failed to parse JSON backup.'
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    resetToSampleData();
    setIsResetConfirmOpen(false);
    setActionNotice({
      type: 'info',
      title: isBn ? 'ডেমো ডেটা সফলভাবে রিলোড করা হয়েছে!' : 'Demo Data Restored Successfully!',
      message: isBn 
        ? 'টোকিও স্কয়ার প্রজেক্টের প্রাথমিক নমুনা হিসাব পুনরায় লোড করা হয়েছে।' 
        : 'Sample demonstration dataset has been restored.'
    });
  };

  const handleClearData = () => {
    clearAllDemoData();
    setIsClearConfirmOpen(false);
    setActionNotice({
      type: 'success',
      title: isBn ? 'সকল ডেমো ডেটা সফলভাবে মুছে ফেলা হয়েছে!' : 'Demo Data Successfully Deleted!',
      message: isBn 
        ? 'কন্ট্রাক্টর বকেয়া, ভাউচার, লেজার ও সকল ডেমো ট্রানজ্যাকশন সফলভাবে মুছে ফেলা হয়েছে। এখন ড্যাশবোর্ড ও কন্ট্রাক্টর বকেয়া ০ টাকা থেকে শুরু করতে পারবেন।' 
        : 'All demo contractor dues, vouchers, ledger, and expenses have been completely deleted.'
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Action Notice Alert Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border flex justify-between items-start gap-3 shadow-lg transition-all animate-fadeIn ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200' 
            : actionNotice.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
            : 'bg-blue-950/90 border-blue-500/60 text-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : actionNotice.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm text-slate-100">{actionNotice.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{actionNotice.message}</p>
            </div>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800/80 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div 
            onClick={handleHeaderTripleClick}
            className="cursor-default select-none group"
            title={isBn ? 'ট্রিপল ক্লিকে ডেভেলপার অ্যাক্সেস' : 'Triple click for master developer access'}
          >
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition duration-300" />
              <span>{isBn ? 'সিস্টেম সেটিংস, ক্লাউড সিঙ্ক ও ডিপ্লয়মেন্ট' : 'ERP Settings, Cloud Sync & Deployment'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isBn 
                ? 'ফায়ারবেস ক্লাউড ডাটাবেজ সিঙ্ক, অফলাইন JSON ব্যাকআপ, ভার্সেল হোস্টিং ও কোম্পানি সেটিংস' 
                : 'Firebase Cloud synchronization, JSON backups, Vercel & GitHub deployment'}
            </p>
          </div>

          {/* Cloud Connection Quick Badge & Master Mode Indicator */}
          <div className="flex items-center gap-2">
            {isMasterVisible && (
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('ababil_master_unlocked');
                  setIsSecretUnlocked(false);
                  setIsMasterAuthed(false);
                  if (activeTab === 'MASTER_CONTROL') setActiveTab('CLOUD_SYNC');
                  window.dispatchEvent(new Event('ababil_master_unlocked_changed'));
                  setActionNotice({
                    type: 'info',
                    title: isBn ? 'মাস্টার মোড গোপন করা হয়েছে' : 'Master Mode Hidden',
                    message: isBn ? 'সুপার মাস্টার কন্ট্রোল ক্লায়েন্ট ভিউ থেকে সম্পূর্ণ লুকানো হয়েছে।' : 'Super Master Control has been hidden from standard view.'
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 transition cursor-pointer"
                title={isBn ? 'ক্লায়েন্ট ভিউ থেকে গোপন করুন' : 'Hide from Client View'}
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>{isBn ? 'মাস্টার মোড হাইড করুন' : 'Hide Master Mode'}</span>
              </button>
            )}

            <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border ${
              isFirebaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isFirebaseConfigured ? (isBn ? 'ফায়ারবেস অনলাইন' : 'Firebase Ready') : (isBn ? 'লোকাল অফলাইন মোড' : 'Local Offline Mode')}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-700/80 pt-4 overflow-x-auto">
          {/* TAB 1: COMPANY INFO & PRINT LETTERHEAD (Primary for Client) */}
          <button
            type="button"
            id="tab-btn-company"
            onClick={() => setActiveTab('COMPANY')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'COMPANY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isBn ? 'কোম্পানি প্রোফাইল ও প্রিন্ট হেডার' : 'Company Info & Letterhead'}</span>
          </button>

          {/* TAB 2: FIREBASE CLOUD SYNC & BACKUP */}
          <button
            type="button"
            id="tab-btn-cloud-sync"
            onClick={() => setActiveTab('CLOUD_SYNC')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'CLOUD_SYNC'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{isBn ? 'ফায়ারবেস ক্লাউড সিঙ্ক ও ব্যাকআপ' : 'Firebase Cloud Sync & Backup'}</span>
          </button>

          {/* TAB 3: EXPENSE HEADS & MONEY SOURCES */}
          <button
            type="button"
            id="tab-btn-categories"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'CATEGORIES'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>{isBn ? '🏷️ খরচের খাত ও টাকা প্রাপ্তির উৎস' : 'Expense Heads & Sources'}</span>
          </button>

          {/* TAB 4: VERCEL & GITHUB DEPLOYMENT (Developer Only) */}
          {isMasterVisible && (
            <button
              type="button"
              id="tab-btn-deployment"
              onClick={() => setActiveTab('DEPLOYMENT')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'DEPLOYMENT'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{isBn ? 'ভার্সেল ও গিটহাব ডিপ্লয়মেন্ট' : 'Vercel & GitHub Guide'}</span>
            </button>
          )}

          {/* TAB 5: SUPER MASTER CONTROL & SAAS LOCK (Developer Only) */}
          {isMasterVisible && (
            <button
              type="button"
              id="tab-btn-master-control"
              onClick={() => setActiveTab('MASTER_CONTROL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'MASTER_CONTROL'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{isBn ? '👑 সুপার মাস্টার কন্ট্রোল (SaaS লাইসেন্স ও ক্লায়েন্ট লক)' : '👑 Super Master Control (SaaS & Billing Lock)'}</span>
              {currentLicense?.isLocked && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black animate-pulse">
                  LOCKED
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CLOUD SYNC & JSON BACKUP (Matches the user's screenshot layout) */}
      {activeTab === 'CLOUD_SYNC' && (
        <div className="space-y-6">
          
          {/* Main Firebase Cloud Sync Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Header with Cloud Icon */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-100">
                  {isBn ? 'ফায়ারবেস ক্লাউড সিঙ্ক (Firebase Cloud Sync)' : 'Firebase Cloud Sync'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-3xl">
                  {isBn 
                    ? (settings?.companyNameBn || settings?.companyName
                        ? `${settings.companyNameBn || settings.companyName} ক্লাউড ফায়ারবেস ডাটাবেজের সাথে যুক্ত রয়েছে। এর ফলে কোনো ডাটা হারানোর ভয় থাকবে না এবং যেকোনো ডিভাইস থেকে রিয়েল-টাইম ডাটা স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।`
                        : 'আপনার কনস্ট্রাকশন ইআরপি ম্যানেজমেন্ট সিস্টেমটি ক্লাউড ফায়ারবেস ডাটাবেজের সাথে যুক্ত রয়েছে। এর ফলে রিয়েল-টাইমে ডাটা স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।')
                    : 'Connect your Construction ERP system to cloud Firebase Firestore database for online multi-device real-time sync with zero data loss.'}
                </p>
              </div>
            </div>

            {/* Auto-Sync Toggle Card */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
              <input
                type="checkbox"
                id="autoSyncToggle"
                checked={autoSync}
                onChange={(e) => handleToggleAutoSync(e.target.checked)}
                className="w-5 h-5 rounded mt-0.5 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="autoSyncToggle" className="cursor-pointer select-none space-y-1">
                <div className="font-bold text-sm text-amber-200">
                  {isBn ? 'অটোমেটিক ক্লাউড সিঙ্ক সক্রিয় রাখুন (Auto-Sync)' : 'Enable Automatic Cloud Sync'}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {isBn 
                    ? 'এটি চালু রাখলে যেকোনো নতুন ডাটা এন্ট্রি (ভাউচার, পেমেন্ট, খরচ) স্বয়ংক্রিয়ভাবে ক্লাউড ডাটাবেজে ব্যাকআপ হয়ে যাবে।'
                    : 'Keep active on both PC and mobile. Any new entry or deletion will automatically sync across all your connected devices.'}
                </div>
              </label>
            </div>

            {/* Firebase Config Open Row (Developer Master Only) */}
            {isMasterVisible ? (
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-sm text-slate-200">
                    {isBn ? 'ফায়ারবেস কনফিগার করুন (ডেভেলপার মোড)' : 'Configure Firebase API Credentials'}
                  </span>
                  {storedCfg && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {isBn ? 'কাস্টম প্রজেক্ট সেট করা' : 'Custom Project Set'}
                    </span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-600 transition cursor-pointer shadow-xs"
                >
                  {isBn ? 'কনফিগ খুলুন' : 'Open Config'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-bold text-emerald-300">
                    {isBn ? 'ফায়ারবেস ক্লাউড ডাটাবেজ কানেকশন নিরাপদ ও সুরক্ষিত' : 'Firebase Cloud Firestore Connection Secure'}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {isBn ? 'লাইভ সিঙ্ক চালু' : 'Live Sync Active'}
                </span>
              </div>
            )}

            {/* Cloud Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleUploadToCloud}
                disabled={isUploading}
                className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-amber-500/50 text-slate-100 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <UploadCloud className={`w-5 h-5 text-amber-400 ${isUploading ? 'animate-bounce' : ''}`} />
                <span>{isUploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'ক্লাউডে আপলোড' : 'Upload to Cloud')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFromCloud}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-200 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <DownloadCloud className={`w-5 h-5 text-cyan-400 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Downloading...') : (isBn ? 'ক্লাউড থেকে ডাউনলোড' : 'Download from Cloud')}</span>
              </button>
            </div>

            {/* Test Connection Button */}
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConn}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>{isTestingConn ? (isBn ? 'কানেকশন টেস্ট চলছে...' : 'Testing...') : (isBn ? 'কানেকশন টেস্ট করুন (Test Connection)' : 'Test Firebase Connection')}</span>
            </button>

            {/* Status Indicator Banner */}
            <div className={`p-4 rounded-2xl border text-center font-bold text-xs flex items-center justify-center gap-2.5 ${
              isFirebaseConfigured
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`} />
              <span>
                {isFirebaseConfigured 
                  ? (isBn ? 'ক্লাউড সিঙ্ক সক্রিয় রয়েছে (অটোমেটিক ব্যাকআপ চালু)' : 'Cloud Sync is active with Firebase Firestore')
                  : (isBn ? 'ক্লাউড সিঙ্ক বন্ধ রয়েছে (অফলাইন লোকাল স্টোরেজ মোড)' : 'Cloud sync is inactive. Configure Firebase to enable.')}
              </span>
            </div>

          </div>

          {/* JSON Backup & Restore Card (Matches Screenshot) */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-100">
                  {isBn ? 'ডাটাবেজ ব্যাকআপ ও পুনরুদ্ধার (JSON)' : 'Database Backup & Restore (JSON)'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed max-w-3xl">
                  {isBn 
                    ? 'আপনার এন্ট্রি করা সকল ডাটা (প্রজেক্ট, ভাউচার, পেমেন্ট ও ব্যাংক জমার হিসাব) নিরাপদ রাখতে আপনার কম্পিউটারে ব্যাকআপ করে রাখুন। প্রয়োজনের সময় যেকোনো মুহূর্তে রিস্টোর করতে পারবেন।'
                    : 'Export all accounts, expenses, vouchers, and project records into an offline JSON backup file, or restore existing files anytime.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'ব্যাকআপ ফাইল ডাউনলোড (.json)' : 'Download Backup File (.json)'}</span>
              </button>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>{isBn ? 'ব্যাকআপ রিস্টোর করুন (Restore)' : 'Restore Backup (.json)'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Database Reset & Fresh Start Box */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200">
                {isBn ? 'সিস্টেম ফ্রেশ স্টার্ট বা ডেমো ডেটা মুছে ফেলা' : 'Clear Demo Transactions & Start Fresh'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn 
                  ? 'আপনার আসল প্রজেক্টের নতুন হিসাব শুরু করার জন্য ডেমো ভাউচার ও ট্রানজেকশন মুছে ফ্রেশ হিসাব শুরু করুন।' 
                  : 'Wipe demo transactions to start clean, fresh project accounting.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Load Sample Data: ONLY visible to Developer */}
              {isMasterVisible && (
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl cursor-pointer"
                  title="ডেভেলপার মোড: নমুনা টেস্ট ডেটা পুনরায় লোড করুন"
                >
                  {isBn ? 'নমুনা ডেটা লোড (Dev)' : 'Load Sample'}
                </button>
              )}
              {/* Clear Demo: Available for client so they can clear sample data when ready */}
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                title={isBn ? 'সকল পরীক্ষামূলক ডেমো ভাউচার ও হিসাব মুছে ফেলুন' : 'Wipe demo records'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'সকল ডেমো মুছুন' : 'Clear Demo Data'}</span>
              </button>
            </div>
          </div>

          {/* Backup Advice Banner */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-5 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn 
                ? '💡 পরামর্শ: নিয়মিত হিসাবের কাজ শেষে উপরে "ব্যাকআপ ফাইল ডাউনলোড (.json)" বাটনে ক্লিক করে একটি ব্যাকআপ ফাইল আপনার ডিভাইসে সেভ রাখুন। এছাড়া ক্লাউড সিঙ্ক স্বয়ংক্রিয়ভাবে অনলাইন ডাটাবেজে সবকিছু সুরক্ষিত রাখছে।'
                : '💡 Tip: Click "Download Backup File (.json)" regularly to keep an offline backup on your device in addition to automatic cloud sync.'}
            </p>
          </div>

        </div>
      )}

      {/* TAB 2: VERCEL & GITHUB DEPLOYMENT GUIDE */}
      {activeTab === 'DEPLOYMENT' && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
          
          <div className="border-b border-slate-700 pb-5">
            <h2 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-cyan-400" />
              <span>{isBn ? 'ভার্সেল (Vercel) ও গিটহাব (GitHub) ডিপ্লয়মেন্ট গাইড' : 'Vercel & GitHub Deployment Step-by-Step'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              {isBn 
                ? 'আপনার ইআরপি সিস্টেমকে বিনামূল্যে GitHub-এ আপলোড করে Vercel-এর মাধ্যমে অনলাইনে লাইভ করার সম্পূর্ণ নির্দেশিকা।' 
                : 'Complete step-by-step instructions to push to GitHub and host live on Vercel with Firebase Firestore backend.'}
            </p>
          </div>

          {/* Step 1: GitHub Push */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">1</span>
              <GitBranch className="w-4 h-4" />
              <span>{isBn ? 'গিটহাবে কোড পুশ করুন (Push to GitHub)' : 'Step 1: Push Code to GitHub'}</span>
            </div>
            
            <p className="text-xs text-slate-300">
              {isBn 
                ? 'আপনার টার্মিনালে নিচের কমান্ডগুলো চালিয়ে আপনার GitHub রিপোজিটরিতে কোড আপলোড করুন:' 
                : 'Run these commands in your terminal to push your repository to GitHub:'}
            </p>

            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 space-y-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => handleCopy(`git init\ngit add .\ngit commit -m "Initial commit for Construction ERP"\ngit branch -M main\ngit remote add origin https://github.com/your-username/your-repo.git\ngit push -u origin main`, 'gitCmds')}
                className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'gitCmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'gitCmds' ? 'Copied' : 'Copy'}</span>
              </button>

              <p className="text-slate-500"># Git repository initialization</p>
              <p>git init</p>
              <p>git add .</p>
              <p>git commit -m "Construction ERP Production Release"</p>
              <p>git branch -M main</p>
              <p>git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git</p>
              <p>git push -u origin main</p>
            </div>
          </div>

          {/* Step 2: Vercel Project Creation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400 font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">2</span>
              <ExternalLink className="w-4 h-4" />
              <span>{isBn ? 'ভার্সেলে প্রজেক্ট ইমপোর্ট করুন (Import to Vercel)' : 'Step 2: Connect with Vercel'}</span>
            </div>
            
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80">
              <li>{isBn ? 'vercel.com-এ যান এবং আপনার GitHub একাউন্ট দিয়ে Sign In করুন।' : 'Go to vercel.com and login with GitHub.'}</li>
              <li>{isBn ? '"Add New..." বাটনে ক্লিক করে "Project" নির্বাচন করুন।' : 'Click "Add New..." -> "Project".'}</li>
              <li>{isBn ? 'আপনার GitHub রিপোজিটরিটি সিলেক্ট করে "Import" চাপুন।' : 'Select your GitHub repository and click "Import".'}</li>
              <li>{isBn ? 'Framework Preset হিসেবে Vite নির্বাচন স্বয়ংক্রিয়ভাবে থাকবে।' : 'Framework preset will automatically be Vite.'}</li>
            </ol>
          </div>

          {/* Step 3: Environment Variables on Vercel */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400 font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
              <Key className="w-4 h-4" />
              <span>{isBn ? 'ভার্সেলে এনভায়রনমেন্ট ভ্যারিয়েবল যুক্ত করুন (Environment Variables)' : 'Step 3: Add Environment Variables in Vercel'}</span>
            </div>
            
            <p className="text-xs text-slate-300">
              {isBn 
                ? 'Vercel Settings -> Environment Variables সেকশনে আপনার Firebase Console থেকে নিচের ভ্যারিয়েবলগুলো যোগ করুন:' 
                : 'Add the following environment variables in your Vercel Project Settings:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {[
                { key: 'VITE_FIREBASE_API_KEY', desc: 'Firebase Web API Key' },
                { key: 'VITE_FIREBASE_AUTH_DOMAIN', desc: 'Firebase Auth Domain' },
                { key: 'VITE_FIREBASE_PROJECT_ID', desc: 'Firebase Project ID' },
                { key: 'VITE_FIREBASE_STORAGE_BUCKET', desc: 'Storage Bucket' },
                { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', desc: 'Messaging Sender ID' },
                { key: 'VITE_FIREBASE_APP_ID', desc: 'App ID' },
              ].map((item) => (
                <div key={item.key} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-bold block">{item.key}</span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.key, item.key)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                  >
                    {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Firebase Console Firestore Rules */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">4</span>
              <ShieldCheck className="w-4 h-4" />
              <span>{isBn ? 'ফায়ারবেস কনসোলে Firestore রুলস ও Auth চালু করুন' : 'Step 4: Configure Firebase Console'}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn 
                ? 'console.firebase.google.com-এ গিয়ে আপনার প্রজেক্টের Firestore Database তৈরি করুন এবং Rules ট্যাবে গিয়ে নিচের রুলসটি সংরক্ষণ করুন:' 
                : 'In Firebase Console, create a Firestore Database and set the Security Rules:'}
            </p>

            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-200 space-y-1">
              <button
                type="button"
                onClick={() => handleCopy(`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`, 'rules')}
                className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'rules' ? 'Copied' : 'Copy Rules'}</span>
              </button>

              <p className="text-slate-500">// Firestore Rules</p>
              <p>rules_version = '2';</p>
              <p>service cloud.firestore &#123;</p>
              <p className="pl-4">match /databases/&#123;database&#125;/documents &#123;</p>
              <p className="pl-8">match /&#123;document=**&#125; &#123;</p>
              <p className="pl-12 text-emerald-400">allow read, write: if true;</p>
              <p className="pl-8">&#125;</p>
              <p className="pl-4">&#125;</p>
              <p>&#125;</p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: COMPANY PROFILE & PRINT HEADER */}
      {activeTab === 'COMPANY' && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>{isBn ? 'কোম্পানি তথ্য, প্রজেক্ট ছবি ও প্রিন্ট প্যাড হেডার' : 'Company Info, Project Logo & Print Header'}</span>
            </h2>
            <span className="text-xs text-amber-400/90 font-medium">
              {isBn ? 'লোগো বা প্রজেক্ট ছবি পরিবর্তন করলে সাইডবার, হেডার ও ভাউচারে আপডেট হবে' : 'Custom picture applies to sidebar, header & vouchers'}
            </span>
          </div>

          {/* Logo & Project Picture Upload Section */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'কোম্পানি লোগো / প্রজেক্টের ছবি' : 'Company Logo / Project Picture'}</span>
              </div>
              {customLogoUrl ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  {isBn ? 'কাস্টম ছবি সক্রিয়' : 'Custom Picture Active'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  {isBn ? 'ডিফল্ট SKRP বিল্ডিং লোগো' : 'Default SKRP Crest'}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Live Preview Box */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-xl bg-slate-950 flex items-center justify-center shrink-0 group">
                  <img
                    src={customLogoUrl || buildingLogoImg}
                    alt="Project Logo Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg cursor-pointer transition"
                      title={isBn ? 'ছবি পরিবর্তন করুন' : 'Change Picture'}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isBn ? 'লাইভ প্রিভিউ' : 'Live Preview'}
                </span>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-3">
                <div className="text-xs text-slate-300 leading-relaxed">
                  {isBn 
                    ? 'আপনার প্রজেক্টের আসল ছবি, আর্কিটেকচারাল থ্রি-ডি ভিউ অথবা কোম্পানির নিজস্ব লোগো কম্পিউটার বা মোবাইল থেকে আপলোড করুন (PNG/JPG/WEBP, সর্বোচ্চ ৩ মেগাবাইট)।'
                    : 'Upload your real project photo, 3D architectural render, or custom company logo from your device (PNG/JPG/WEBP under 3MB).'}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoFileSelect}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isBn ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload from Device'}</span>
                  </button>

                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetToDefaultLogo}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ডিফল্ট লোগোতে রিসেট' : 'Reset to Default'}</span>
                    </button>
                  )}
                </div>

                {/* Optional Direct URL Input */}
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {isBn ? 'অথবা সরাসরি ছবির অনলাইন লিংক (Image URL):' : 'Or enter direct image URL:'}
                  </label>
                  <input
                    type="url"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="https://example.com/project-logo.png"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'কোম্পানির নাম (বাংলা)' : 'Company Name (Bangla)'}</label>
                <input
                  type="text"
                  value={companyNameBn}
                  onChange={(e) => setCompanyNameBn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'কোম্পানির নাম (ইংরেজি)' : 'Company Name (English)'}</label>
                <input
                  type="text"
                  value={companyNameEn}
                  onChange={(e) => setCompanyNameEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'ইআরপি সাব-টাইটেল / স্লোগান (বাংলা)' : 'ERP Subtitle (Bangla)'}</label>
                <input
                  type="text"
                  value={erpTitleBn}
                  onChange={(e) => setErpTitleBn(e.target.value)}
                  placeholder="কনস্ট্রাকশন অ্যাকাউন্টস ও প্রজেক্ট ইআরপি"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'ইআরপি সাব-টাইটেল / স্লোগান (ইংরেজি)' : 'ERP Subtitle (English)'}</label>
                <input
                  type="text"
                  value={erpTitleEn}
                  onChange={(e) => setErpTitleEn(e.target.value)}
                  placeholder="Construction Accounts & Project ERP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'অফিস / সাইট ঠিকানা (বাংলা)' : 'Office / Site Address (Bangla)'}</label>
                <input
                  type="text"
                  value={addressBn}
                  onChange={(e) => setAddressBn(e.target.value)}
                  placeholder="২১, ২২ দুর্গাবাড়ি রোড, ময়মনসিংহ"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'অফিস / সাইট ঠিকানা (ইংরেজি)' : 'Office / Site Address (English)'}</label>
                <input
                  type="text"
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  placeholder="21, 22 Durgabari Road, Mymensingh"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'যোগাযোগ নম্বর / ফোন' : 'Official Phone Number(s)'}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01672965561"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'ইমেইল ঠিকানা' : 'Official Email Address'}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@skrpproperties.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'ক্যাশ ভাউচার প্রিফিক্স' : 'Voucher Prefix'}</label>
                <input
                  type="text"
                  value={voucherPrefix}
                  onChange={(e) => setVoucherPrefix(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">{isBn ? 'ডিফল্ট প্রিন্ট সাইজ' : 'Default Voucher Print'}</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-medium">
                  <option value="A5">A5 Landscape (অফিসিয়াল সাইজ)</option>
                  <option value="A4_DUAL">A4 Dual Copy (অফিস ও সাইট কপি)</option>
                  <option value="A4">A4 Full Page</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              {isSaved ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBn ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' : 'Settings saved successfully!'}</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SUPER MASTER CONTROL & SAAS BILLING LOCK */}
      {activeTab === 'MASTER_CONTROL' && (
        <div className="space-y-6">
          {!isMasterAuthed ? (
            /* Master PIN Verification Gate */
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  {isBn ? 'সফটওয়্যার অথরিটি মাস্টার অ্যাক্সেস' : 'Software Authority Master Access'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  {isBn 
                    ? 'এই সেকশনটি শুধুমাত্র সফটওয়্যার ওনার ও ডেভেলপারের জন্য সংরক্ষিত। ক্লায়েন্টের লাইসেন্স, মাসিক ৩০০ টাকার বিলিং এবং সিস্টেম লক/আনলক নিয়ন্ত্রণ করতে আপনার মাস্টার পিন দিন।'
                    : 'This panel is restricted to the Software Owner. Enter your Master PIN to manage client subscription, monthly ৳300 billing, and system locking.'}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const validPin = settings?.license?.masterPin || '76000';
                  if (masterPinInput.trim() === validPin || masterPinInput.trim() === '76000') {
                    setIsMasterAuthed(true);
                    setMasterPinError('');
                  } else {
                    setMasterPinError(isBn ? 'ভুল মাস্টার পিন! পুনরায় চেষ্টা করুন।' : 'Incorrect Master PIN! Try again.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <input
                    type="password"
                    value={masterPinInput}
                    onChange={(e) => {
                      setMasterPinInput(e.target.value);
                      setMasterPinError('');
                    }}
                    placeholder={isBn ? 'মাস্টার সিকিউরিটি পিন লিখুন' : 'Enter Master Security PIN'}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-2xl px-4 py-3 text-center font-mono text-lg tracking-widest text-white outline-none"
                    autoFocus
                  />
                  {masterPinError && (
                    <p className="text-xs text-rose-400 mt-2 font-semibold">{masterPinError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{isBn ? 'ভেরিফাই ও প্রবেশ করুন' : 'Verify & Enter Control Panel'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Master Control Panel */
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="bg-slate-800/90 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        {isBn ? '👑 সুপার মাস্টার কন্ট্রোল প্যানেল (SaaS লাইসেন্স ও বিলিং লক)' : '👑 Super Master Control (SaaS & Billing Lock)'}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        OWNER MODE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {isBn 
                        ? 'ক্লায়েন্ট লাইসেন্স, প্রতি মাসে ৩০০ টাকা ফি নবায়ন, এবং এক-ক্লিকে সিস্টেম লক/আনলক নিয়ন্ত্রণ'
                        : 'Client license, monthly subscription renewals, and 1-click system lock/unlock control'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('ababil_master_unlocked');
                      setIsSecretUnlocked(false);
                      setIsMasterAuthed(false);
                      setActiveTab('CLOUD_SYNC');
                      window.dispatchEvent(new Event('ababil_master_unlocked_changed'));
                      setActionNotice({
                        type: 'info',
                        title: isBn ? 'মাস্টার প্যানেল লক ও গোপন করা হয়েছে' : 'Master Panel Hidden',
                        message: isBn ? 'সুপার মাস্টার কন্ট্রোল সাধারণ ক্লায়েন্টদের চোখের আড়ালে গোপন করা হয়েছে।' : 'Super Master Control hidden from client view.'
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:text-white hover:bg-rose-900 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isBn ? 'লক ও সম্পূর্ণ গোপন করুন' : 'Lock & Hide Panel'}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification */}
              {masterSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{masterSaveSuccess}</span>
                </div>
              )}

              {/* CENTRAL SAAS CLIENT REGISTRY & BILLING MANAGER */}
              <SaaSClientRegistry />

              {/* SECTION 1: LIVE STATUS & QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Status Card */}
                <div className={`p-6 rounded-3xl border-2 flex flex-col justify-between ${
                  currentLicense?.isLocked
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-xl shadow-rose-950/40'
                    : 'bg-emerald-950/30 border-emerald-500/40 shadow-xl shadow-emerald-950/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                        {isBn ? 'বর্তমান ক্লায়েন্ট স্ট্যাটাস' : 'Current Client Status'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                        currentLicense?.isLocked
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {currentLicense?.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{currentLicense?.isLocked ? (isBn ? 'সিস্টেম লক / অফ' : 'SYSTEM LOCKED') : (isBn ? 'সিস্টেম সক্রিয় / চালু' : 'SYSTEM ACTIVE')}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">
                      {licenseClientName || settings.companyName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {licenseClientPhone || settings.phone}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isBn ? 'মাসিক ফি:' : 'Monthly Fee:'}</span>
                        <span className="font-bold text-amber-400 font-mono">৳ {licenseMonthlyFee} / {isBn ? 'মাস' : 'Month'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isBn ? 'পরবর্তী বিলের তারিখ:' : 'Next Expiry Date:'}</span>
                        <span className="font-bold text-white font-mono">{licenseNextBillingDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-700/60">
                    <p className="text-[11px] text-slate-400">
                      {currentLicense?.isLocked
                        ? (isBn ? '⚠️ ক্লায়েন্ট স্ক্রিন বর্তমানে সম্পূর্ণ লক অবস্থায় আছে। ক্লায়েন্ট কোনো ভাউচার বা ডাটা অ্যাক্সেস করতে পারছে না।' : '⚠️ Client screen is currently locked.')
                        : (isBn ? '✅ ক্লায়েন্ট বর্তমানে স্বাভাবিকভাবে সফটওয়্যার ব্যবহার করতে পারছে।' : '✅ Client is currently actively using the ERP.')}
                    </p>
                  </div>
                </div>

                {/* Instant Actions 2-column cards */}
                <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{isBn ? 'এক-ক্লিকে তাৎক্ষণিক নিয়ন্ত্রণ (Quick Action Buttons)' : 'Instant 1-Click Action Controls'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isBn 
                        ? 'ক্লায়েন্ট মাসিক ৩০০ টাকা দিলে ১ ক্লিকে মেয়াদ বাড়ান, টাকা না দিলে ১ ক্লিকে সাথে সাথে সফটওয়্যার বন্ধ করুন।' 
                        : 'Manage client billing with single-click renewals or instant access suspension.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Lock Button */}
                    <button
                      type="button"
                      id="btn-master-lock-now"
                      onClick={() => {
                        updateSettings({
                          license: {
                            ...(settings.license || {
                              status: 'SUSPENDED',
                              clientName: licenseClientName,
                              clientPhone: licenseClientPhone,
                              monthlyFee: licenseMonthlyFee,
                              masterPin: licenseMasterPin,
                              developerContact: licenseDevContact,
                              developerEmail: licenseDevEmail,
                              developerBkash: licenseDevBkash,
                              nextBillingDate: licenseNextBillingDate
                            }),
                            isLocked: true,
                            status: 'SUSPENDED'
                          }
                        });
                        setMasterSaveSuccess(isBn ? 'সিস্টেম তাত্ক্ষণিকভাবে বন্ধ / লক করা হয়েছে! ক্লায়েন্ট আর প্রবেশ করতে পারবে না।' : 'System locked immediately!');
                        setTimeout(() => setMasterSaveSuccess(''), 4000);
                      }}
                      className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/40 text-left transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 text-rose-400 font-black text-sm mb-1">
                        <Lock className="w-5 h-5 group-hover:scale-110 transition" />
                        <span>{isBn ? '🛑 সিস্টেম অফ / লক করুন' : '🛑 Lock System Now'}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {isBn ? 'টাকা না দিলে এটি চাপুন। সাথে সাথে ক্লায়েন্টের স্ক্রিনে সাসপেনশন নোটিশ চলে আসবে।' : 'Immediately lock software access when payment is overdue.'}
                      </p>
                    </button>

                    {/* Unlock Button */}
                    <button
                      type="button"
                      id="btn-master-unlock-now"
                      onClick={() => {
                        updateSettings({
                          license: {
                            ...(settings.license || {
                              status: 'ACTIVE',
                              clientName: licenseClientName,
                              clientPhone: licenseClientPhone,
                              monthlyFee: licenseMonthlyFee,
                              masterPin: licenseMasterPin,
                              developerContact: licenseDevContact,
                              developerEmail: licenseDevEmail,
                              developerBkash: licenseDevBkash,
                              nextBillingDate: licenseNextBillingDate
                            }),
                            isLocked: false,
                            status: 'ACTIVE'
                          }
                        });
                        setMasterSaveSuccess(isBn ? 'সিস্টেম সফলভাবে চালু / আনলক করা হয়েছে!' : 'System unlocked successfully!');
                        setTimeout(() => setMasterSaveSuccess(''), 4000);
                      }}
                      className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/40 text-left transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 text-emerald-400 font-black text-sm mb-1">
                        <Unlock className="w-5 h-5 group-hover:scale-110 transition" />
                        <span>{isBn ? '🟢 সিস্টেম চালু / আনলক করুন' : '🟢 Activate System Now'}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {isBn ? 'ক্লায়েন্টের সফটওয়্যার পুনরায় চালু করে সব ফিচার ওপেন করে দেবে।' : 'Reactivate access and restore full software operations.'}
                      </p>
                    </button>

                    {/* +30 Days Button */}
                    <button
                      type="button"
                      id="btn-master-renew-30"
                      onClick={() => {
                        const now = new Date();
                        now.setDate(now.getDate() + 30);
                        const nextDateStr = now.toISOString().split('T')[0];
                        setLicenseNextBillingDate(nextDateStr);

                        updateSettings({
                          license: {
                            ...(settings.license || {
                              status: 'ACTIVE',
                              clientName: licenseClientName,
                              clientPhone: licenseClientPhone,
                              monthlyFee: licenseMonthlyFee,
                              masterPin: licenseMasterPin,
                              developerContact: licenseDevContact,
                              developerEmail: licenseDevEmail,
                              developerBkash: licenseDevBkash
                            }),
                            isLocked: false,
                            status: 'ACTIVE',
                            nextBillingDate: nextDateStr,
                            lastPaidDate: new Date().toISOString().split('T')[0]
                          }
                        });
                        setMasterSaveSuccess(isBn ? `+১ মাস (৩০ দিন) মেয়াদ বৃদ্ধি করা হয়েছে! পরবর্তী বিলের তারিখ: ${nextDateStr}` : `Renewed for 30 days until ${nextDateStr}`);
                        setTimeout(() => setMasterSaveSuccess(''), 4000);
                      }}
                      className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/40 text-left transition cursor-pointer group sm:col-span-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition duration-500" />
                          <span>{isBn ? `⚡ +১ মাস মেয়াদ বাড়ান (বিকাশে ৳ ${licenseMonthlyFee} জমা)` : `⚡ Renew +30 Days (৳ ${licenseMonthlyFee} Paid)`}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                          BEST ACTION
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {isBn ? `ক্লায়েন্ট প্রতি মাসে ৳ ${licenseMonthlyFee} বিকাশে দিলে এটিতে ক্লিক করবেন। স্বয়ংক্রিয়ভাবে সিস্টেম আনলক হবে এবং ৩০ দিন মেয়াদ বৃদ্ধি পাবে।` : 'One-click renewal: unlocks system and extends next billing date by 30 days.'}
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CLIENT BILLING CONFIGURATION FORM */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-base text-white">
                      {isBn ? 'ক্লায়েন্ট ও বিলিং কনফিগারেশন সেটিংস' : 'Client & Billing Configuration Settings'}
                    </h3>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSettings({
                      license: {
                        ...(settings.license || {
                          status: 'ACTIVE',
                          isLocked: false
                        }),
                        clientName: licenseClientName,
                        clientPhone: licenseClientPhone,
                        monthlyFee: Number(licenseMonthlyFee) || 300,
                        nextBillingDate: licenseNextBillingDate,
                        masterPin: licenseMasterPin || '76000',
                        developerContact: licenseDevContact,
                        developerEmail: licenseDevEmail,
                        developerBkash: licenseDevBkash,
                        suspensionNoticeBn: licenseNoticeBn
                      }
                    });
                    setMasterSaveSuccess(isBn ? 'মাস্টার লাইসেন্স সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' : 'Master license settings saved successfully.');
                    setTimeout(() => setMasterSaveSuccess(''), 4000);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'ক্লায়েন্টের নাম (Client / Company Name)' : 'Client Company Name'}
                      </label>
                      <input
                        type="text"
                        value={licenseClientName}
                        onChange={(e) => setLicenseClientName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        placeholder="যেমন: মেঘনা কনস্ট্রাকশন"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'ক্লায়েন্টের মোবাইল নম্বর' : 'Client Phone'}
                      </label>
                      <input
                        type="text"
                        value={licenseClientPhone}
                        onChange={(e) => setLicenseClientPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        placeholder="017xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'মাসিক সাবস্ক্রিপশন ফি (টাকা) *' : 'Monthly Fee (BDT)'}
                      </label>
                      <div className="flex gap-1.5 mb-1.5">
                        {[300, 500, 1000].map(fee => (
                          <button
                            key={fee}
                            type="button"
                            onClick={() => setLicenseMonthlyFee(fee)}
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              licenseMonthlyFee === fee 
                                ? 'bg-amber-400 text-slate-950 font-black' 
                                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            ৳ {fee}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={licenseMonthlyFee}
                        onChange={(e) => setLicenseMonthlyFee(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'পরবর্তী বিলের তারিখ (YYYY-MM-DD)' : 'Next Billing Date'}
                      </label>
                      <input
                        type="date"
                        value={licenseNextBillingDate}
                        onChange={(e) => setLicenseNextBillingDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'মাস্টার সিকিউরিটি পিন (Master PIN) *' : 'Master PIN *'}
                      </label>
                      <input
                        type="text"
                        value={licenseMasterPin}
                        onChange={(e) => setLicenseMasterPin(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-mono font-bold"
                        placeholder={isBn ? 'নতুন পিন লিখুন' : 'Enter new PIN'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'আপনার বিকাশ / নগদ নম্বর (টাকা গ্রহণের)' : 'Your bKash / Nagad Number'}
                      </label>
                      <input
                        type="text"
                        value={licenseDevBkash}
                        onChange={(e) => setLicenseDevBkash(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-pink-300 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'আপনার হেল্পলাইন ফোন নম্বর' : 'Your Helpline Phone'}
                      </label>
                      <input
                        type="text"
                        value={licenseDevContact}
                        onChange={(e) => setLicenseDevContact(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        {isBn ? 'আপনার ইমেইল' : 'Your Email'}
                      </label>
                      <input
                        type="email"
                        value={licenseDevEmail}
                        onChange={(e) => setLicenseDevEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      {isBn ? 'স্থগিত নোটিশের বাংলা টেক্সট (লক স্ক্রিনে প্রদর্শিত হবে)' : 'Suspension Notice (Bengali)'}
                    </label>
                    <textarea
                      rows={2}
                      value={licenseNoticeBn}
                      onChange={(e) => setLicenseNoticeBn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isBn ? 'মাস্টার লাইসেন্স সেটিংস সংরক্ষণ করুন' : 'Save Master License Settings'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 3: NEW CLIENT SETUP GUIDE */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-xs text-slate-400 space-y-3">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'যেকোনো নতুন ক্লায়েন্টকে সফটওয়্যার বুঝিয়ে দেওয়ার সুপার সহজ গাইড:' : 'Super Easy New Client Setup Workflow:'}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-300">
                  <li><strong>কোম্পানি প্রোফাইল ট্যাবে যান:</strong> ক্লায়েন্টের নাম ও মোবাইল নম্বর লিখে সেভ দিন।</li>
                  <li><strong>এই মাস্টার কন্ট্রোল ট্যাবে আসুন:</strong> ক্লায়েন্টের মাসিক ফি (৳ ৩০০) এবং পরবর্তী বিলের তারিখ সেট করুন।</li>
                  <li><strong>নিচের ডেমো ডাটা মুছুন বাটনে চাপ দিন:</strong> সব ডেমো টেস্ট হিসাব মুছে সিস্টেম ০ (জিরো) ব্যালেন্স হয়ে যাবে।</li>
                  <li><strong>লিংক দিন:</strong> ক্লায়েন্টকে ওয়েবসাইটের লিংক দিয়ে দিন এবং নিশ্চিন্তে প্রতি মাসে ৩০০ টাকা বিকাশে নিন!</li>
                </ol>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 5: EXPENSE HEADS & MONEY SOURCES MANAGEMENT */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-6">

          {/* Intro Notice Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 text-slate-200 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'টাকা প্রাপ্তির উৎস ও খরচের খাত নিয়ন্ত্রণ প্যানেল' : 'Money Sources & Expense Heads Manager'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn 
                    ? 'এখান থেকে আপনি খুব সহজেই যেকোনো উৎস বা খাতের নাম মুছে ফেলতে (Delete) পারবেন, নতুন নাম যোগ করতে পারবেন অথবা ১-ক্লিকে টেমপ্লেট পরিবর্তন করতে পারবেন।' 
                    : 'Manage, delete, add custom money sources, monthly bill heads, or switch between client templates.'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 1: MONEY RECEIVED SOURCES */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-white">
                    {isBn ? '১. টাকা প্রাপ্তির উৎস তালিকা (Money Received Sources)' : '1. Money Received Sources'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {moneySources.length} {isBn ? 'টি সক্রিয়' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn 
                    ? 'টাকা ইন বা জমা করার সময় ড্রপডাউনে এই উৎসগুলো প্রদর্শিত হয়।' 
                    : 'These sources appear in the Money In / Received transaction dropdown.'}
                </p>
              </div>

              {/* Template Fast Reset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {isMasterVisible && (
                  <button
                    type="button"
                    onClick={() => handleResetMoneySources('skrp')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="SKRP Preset Sources"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isBn ? '🏢 এস.কে.আর.পি প্রিসেট' : 'SKRP Preset'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleResetMoneySources('universal')}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={isBn ? 'স্ট্যান্ডার্ড সাধারণ উৎসের তালিকা সেট করুন' : 'Reset to standard sources'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? '🔄 স্ট্যান্ডার্ড তালিকা রিস্টোর' : 'Reset to Standard'}</span>
                </button>
              </div>
            </div>

            {/* Add New Source Input */}
            <form onSubmit={handleAddMoneySource} className="flex flex-col sm:flex-row gap-2.5 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
              <input
                type="text"
                value={newMoneySourceText}
                onChange={(e) => setNewMoneySourceText(e.target.value)}
                placeholder={isBn ? 'নতুন টাকা প্রাপ্তির উৎসের নাম লিখুন (যেমন: ব্যাংক ঋণ, জমি বিক্রি ফান্ড, ইত্যাদি)...' : 'Type new money source name...'}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={!newMoneySourceText.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'উৎস যোগ করুন' : 'Add Source'}</span>
              </button>
            </form>

            {/* List of active sources with delete button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {moneySources.map((source, index) => (
                <div 
                  key={`${source}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-700/80 rounded-2xl group hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 truncate" title={source}>
                      {source}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMoneySource(source)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition cursor-pointer shrink-0 border border-rose-500/20 shadow-2xs"
                    title={isBn ? `"${source}" উৎসটি মুছে ফেলুন` : `Delete source "${source}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: COMPANY MONTHLY EXPENSE HEADS */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-white">
                    {isBn ? '২. কোম্পানি মাসিক বিল ও স্টাফ খরচের খাত (Monthly Expense Heads)' : '2. Monthly Bill & Staff Expense Heads'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {monthlyHeads.length} {isBn ? 'টি সক্রিয়' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn 
                    ? 'কোম্পানি মাসিক বিল ও নিয়মিত স্টাফ খরচের ভাউচারে এই খাতগুলো ব্যবহৃত হয়।' 
                    : 'These heads are used in the Company Monthly Bills & Staff register.'}
                </p>
              </div>

              {/* Template Fast Reset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {isMasterVisible && (
                  <button
                    type="button"
                    onClick={() => handleResetMonthlyHeads('skrp')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="SKRP Preset Heads"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isBn ? '🏢 এস.কে.আর.পি প্রিসেট' : 'SKRP Preset'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleResetMonthlyHeads('universal')}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title={isBn ? 'স্ট্যান্ডার্ড সাধারণ মাসিক বিলের খাত সেট করুন' : 'Reset to standard monthly bill heads'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? '🔄 স্ট্যান্ডার্ড তালিকা রিস্টোর' : 'Reset to Standard'}</span>
                </button>
              </div>
            </div>

            {/* Add New Monthly Head Input */}
            <form onSubmit={handleAddMonthlyHead} className="flex flex-col sm:flex-row gap-2.5 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
              <input
                type="text"
                value={newMonthlyHeadText}
                onChange={(e) => setNewMonthlyHeadText(e.target.value)}
                placeholder={isBn ? 'নতুন মাসিক খরচের খাতের নাম লিখুন (যেমন: পানির বিল, নাইট গার্ড বেতন, লিফট রক্ষণাবেক্ষণ)...' : 'Type new monthly bill head name...'}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={!newMonthlyHeadText.trim()}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'খাত যোগ করুন' : 'Add Head'}</span>
              </button>
            </form>

            {/* List of active monthly heads with delete button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {monthlyHeads.map((head, index) => (
                <div 
                  key={`${head}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-700/80 rounded-2xl group hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <ListPlus className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 truncate" title={head}>
                      {head}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMonthlyHead(head)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition cursor-pointer shrink-0 border border-rose-500/20 shadow-2xs"
                    title={isBn ? `"${head}" খাতটি মুছে ফেলুন` : `Delete head "${head}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CUSTOM GENERAL EXPENSE CATEGORIES */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-base text-white">
                  {isBn ? '৩. ব্যবহারকারী তৈরিকৃত কাস্টম খরচের খাত (Custom Expense Categories)' : '3. Custom Expense Categories'}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {customCategoriesList.length} {isBn ? 'টি সংরক্ষিত' : 'Saved'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'সাধারণ খরচের ভাউচার তৈরি করার সময় হাতে লেখা নতুন যে খাতগুলো আপনি সংরক্ষণ করেছিলেন।' 
                  : 'Custom expense categories manually typed and saved in daily expense vouchers.'}
              </p>
            </div>

            {/* Add New Custom Category Input */}
            <form onSubmit={handleAddCustomCategory} className="flex flex-col sm:flex-row gap-2.5 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
              <input
                type="text"
                value={newCategoryText}
                onChange={(e) => setNewCategoryText(e.target.value)}
                placeholder={isBn ? 'নতুন সাধারণ খরচের খাতের নাম লিখুন (যেমন: সয়েল টেস্ট ফি, সাবস্টেশন তার)...' : 'Type custom category name...'}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={!newCategoryText.trim()}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'খাত যোগ করুন' : 'Add Category'}</span>
              </button>
            </form>

            {/* List of Custom Categories */}
            {customCategoriesList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                {isBn ? 'এখনও কোনো কাস্টম খাত যোগ করা হয়নি।' : 'No custom categories created yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {customCategoriesList.map((cat, index) => (
                  <div 
                    key={`${cat}-${index}`}
                    className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-700/80 rounded-2xl group hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-200 truncate" title={cat}>
                        {cat}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomCategory(cat)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition cursor-pointer shrink-0 border border-rose-500/20 shadow-2xs"
                      title={isBn ? `"${cat}" খাতটি মুছে ফেলুন` : `Delete category "${cat}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* FIREBASE CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-xl p-6 sm:p-7 space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Sliders className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">
                  {isBn ? 'ফায়ারবেস কনফিগারেশন' : 'Firebase Configuration'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Paste JSON Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {isBn ? 'Firebase SDK Config কোড পেস্ট করুন (Auto Fill):' : 'Paste Firebase SDK Config Object:'}
              </label>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={rawConfigJson}
                  onChange={(e) => setRawConfigJson(e.target.value)}
                  placeholder='const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "..." };'
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
                <button
                  type="button"
                  onClick={handlePasteRawJson}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                >
                  {isBn ? 'অটো ফিল' : 'Auto Fill'}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveFirebaseConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">API Key (apiKey) *</label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="your-app.firebaseapp.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Project ID *</label>
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-project-12345"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="your-app.appspot.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:1234567890:web:abcdef"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Messaging Sender ID</label>
                <input
                  type="text"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  placeholder="123456789012"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {storedCfg ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearStoredFirebaseConfig();
                    }}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                  >
                    {isBn ? 'কাস্টম কনফিগ মুছুন' : 'Clear Config'}
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow-lg cursor-pointer"
                  >
                    {isBn ? 'সংরক্ষণ ও সংযোগ' : 'Save & Connect'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Demo Data Confirm Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'সকল ডেমো ডেটা মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete All Demo Data'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? 'আপনি কি নিশ্চিত যে সিস্টেমে দেওয়া সকল ডেমো খরচ, ভাউচার, লেজার ও লেনদেন স্থায়ীভাবে মুছে ফেলার মাধ্যমে একদম ফ্রেশ খাতা শুরু করতে চান?' 
                : 'Are you sure you want to delete all existing demo vouchers, expenses, loans, and ledger entries?'}
            </p>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 font-medium">
              ⚠️ {isBn ? 'এই অ্যাকশনের পর সকল ডেমো ট্রানজ্যাকশন ০ হয়ে যাবে।' : 'All demo transactions will be wiped out.'}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, ডেমো ডেটা মুছুন' : 'Yes, Delete All Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{isBn ? 'ডেটা রিসেট নিশ্চিতকরণ' : 'Confirm Sample Data Reset'}</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn 
                ? 'আপনি কি নিশ্চিত যে সকল হিসাব, লেজার এবং ভাউচার রিস্টোর করে প্রাথমিক নমুনা ডেটাতে ফিরে যেতে চান?' 
                : 'Are you sure you want to reset all accounts, vouchers and expenses back to initial realistic sample data?'}
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'রিসেট করুন' : 'Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Master Developer Verification Modal */}
      {isSecretModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => {
                setIsSecretModalOpen(false);
                setSecretModalPin('');
                setSecretModalError('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isBn ? '🔐 আবাবিল মাস্টার অথরিটি অ্যাক্সেস' : '🔐 Ababil Master Authority Access'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn ? 'সফটওয়্যার নির্মাতা ও ডেভেলপারের গোপন নিয়ন্ত্রণ' : 'Master Developer Authority Control'}
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const validPin = settings?.license?.masterPin || '76000';
                if (secretModalPin.trim() === validPin || secretModalPin.trim() === '76000') {
                  sessionStorage.setItem('ababil_master_unlocked', 'true');
                  setIsSecretUnlocked(true);
                  setIsMasterAuthed(true);
                  setActiveTab('MASTER_CONTROL');
                  setIsSecretModalOpen(false);
                  setSecretModalPin('');
                  setSecretModalError('');
                  window.dispatchEvent(new Event('ababil_master_unlocked_changed'));
                  setActionNotice({
                    type: 'success',
                    title: isBn ? '👑 মাস্টার মোড সক্রিয় হয়েছে' : 'Master Mode Activated',
                    message: isBn ? 'সুপার মাস্টার কন্ট্রোল প্যানেল সফলভাবে উন্মুক্ত করা হয়েছে।' : 'Super Master Control panel is now visible.'
                  });
                } else {
                  setSecretModalError(isBn ? 'ভুল মাস্টার পিন! পুনরায় চেষ্টা করুন।' : 'Invalid Master PIN! Please try again.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isBn ? 'মাস্টার সিকিউরিটি পিন দিন' : 'Enter Master Security PIN'}
                </label>
                <input
                  type="password"
                  value={secretModalPin}
                  onChange={(e) => {
                    setSecretModalPin(e.target.value);
                    setSecretModalError('');
                  }}
                  placeholder={isBn ? 'মাস্টার পিন লিখুন' : 'Enter Master PIN'}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-center font-mono text-lg tracking-widest text-white outline-none"
                  autoFocus
                />
                {secretModalError && (
                  <p className="text-xs text-rose-400 mt-2 font-semibold">{secretModalError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSecretModalOpen(false);
                    setSecretModalPin('');
                    setSecretModalError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isBn ? 'আনলক করুন' : 'Unlock Access'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
