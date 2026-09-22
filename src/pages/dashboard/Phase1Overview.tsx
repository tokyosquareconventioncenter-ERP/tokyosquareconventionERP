/**
 * Phase 1 Foundation & System Status Dashboard
 * Displays Phase 1 verification, folder structure, Firebase config requirements, and testing guides.
 */
import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  FolderTree, 
  Database, 
  Languages, 
  CheckCircle2, 
  LogOut, 
  User, 
  Terminal, 
  AlertCircle,
  KeyRound,
  FileCode2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../../components/common/Logo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const Phase1Overview: React.FC = () => {
  const { currentUser, logout, isFirebaseReady } = useAuth();
  const { t, language, formatAmount, formatDateValue } = useLanguage();

  const sampleAmount = 2500000;
  const sampleExpense = 325000;
  const sampleDate = '2026-08-30';

  const roleVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'gold';
      case 'ADMIN': return 'info';
      case 'ACCOUNTANT': return 'success';
      case 'PROJECT_MANAGER': return 'warning';
      case 'SITE_ENGINEER': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* TOP HEADER */}
      <header 
        id="app-header"
        className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo variant="white" size="sm" />

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher variant="dark" />

            {/* User Profile Pill */}
            {currentUser && (
              <div 
                id="user-profile-header-pill"
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 leading-tight">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    {t(`role_${currentUser.role}` as any)}
                  </span>
                </div>
              </div>
            )}

            <Button
              id="header-logout-btn"
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {t('signOut')}
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* PHASE 1 HERO BANNER */}
        <div 
          id="phase1-status-card"
          className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="gold" size="md">
                  PHASE 1 COMPLETE
                </Badge>
                <Badge variant="success" size="md">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'ফাউন্ডেশন প্রস্তুত' : 'Foundation Ready'}
                  </span>
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('phase1Title')}
              </h1>
              <p className="text-sm text-slate-500">
                {t('tagline')} — {t('companyName')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <span className="font-bold block">{language === 'bn' ? 'পরবর্তী নির্দেশনার অপেক্ষা:' : 'Next Action Required:'}</span>
                <span className="font-mono font-semibold text-amber-800">"START PHASE 2"</span>
              </div>
            </div>
          </div>

          {/* User Session Quick Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {language === 'bn' ? 'বর্তমান ব্যবহারকারী' : 'Logged In User'}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                {currentUser?.displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {language === 'bn' ? 'অনুমোদিত রোল' : 'Active Role'}
              </span>
              <div className="mt-1">
                <Badge variant={currentUser ? roleVariant(currentUser.role) : 'default'} size="md">
                  {currentUser ? t(`role_${currentUser.role}` as any) : 'N/A'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Assigned: {currentUser?.assignedProjects?.join(', ') || 'ALL'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {language === 'bn' ? 'দ্বিভাষিক ফরম্যাটিং টেস্ট' : 'Bilingual Format Demo'}
              </span>
              <p className="text-sm font-extrabold text-amber-700 mt-1">
                {formatAmount(sampleAmount)}
              </p>
              <p className="text-xs text-slate-500">
                Date: {formatDateValue(sampleDate)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {language === 'bn' ? 'ফায়ারবেস স্ট্যাটাস' : 'Firebase Status'}
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isFirebaseReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className="text-xs font-bold text-slate-800">
                  {isFirebaseReady ? 'Live Cloud Connected' : 'Config Initialized (Dev Active)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Auth & Firestore architecture ready
              </p>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: WHAT WAS CREATED */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                1. {language === 'bn' ? 'ফেজ ১ এ যা সম্পন্ন হয়েছে' : 'What Was Created in Phase 1'}
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-900">{language === 'bn' ? 'প্রফেশনাল কর্পোরেট থিম ও প্যালেট:' : 'Professional Theme & Color Palette:'}</strong>{' '}
                  {language === 'bn' 
                    ? 'ডিপ নেভি (#0F172A), শ্যাম্পেন গোল্ড (#D97706), লাইট গ্রে ক্যানভাস ও টাইপোগ্রাফি স্কেলিং।' 
                    : 'Deep Navy (#0F172A), Champagne Gold (#D97706), Slate neutrals, and typography scaling.'}
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-900">{language === 'bn' ? 'দ্বিভাষিক অনুবাদ সিস্টেম (i18n):' : 'Bilingual i18n System:'}</strong>{' '}
                  {language === 'bn' 
                    ? 'বাংলা ও ইংরেজির সম্পূর্ণ ডিকশনারি, হেডার সুইচার, সংখ্যা ও টাকার চিহ্ন (৳) অটো-কনভার্টার।' 
                    : 'Complete Bangla & English dictionary, header switcher, and Bengali digit & currency formatter.'}
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-900">{language === 'bn' ? 'রিয়েল লগইন পেজ ও অথেনটিকেশন লেয়ার:' : 'Real Login Page & Auth Layer:'}</strong>{' '}
                  {language === 'bn' 
                    ? 'কোম্পানি ব্র্যান্ডিং, দুই কলামের রেসপন্সিভ লেআউট, পাসওয়ার্ড শো/হাইড, পাসওয়ার্ড রিসেট এবং রোল সিলেক্টর।' 
                    : 'Company branding hero, split-screen responsive layout, reset password modal, and role selector.'}
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-900">{language === 'bn' ? 'ফায়ারবেস ক্লাউড কনফিগারেশন স্ট্রাকচার:' : 'Firebase Cloud Config Architecture:'}</strong>{' '}
                  {language === 'bn' 
                    ? 'Firebase Auth, Firestore এবং পরিবেশ ভ্যারিয়েবল ডিক্লারেশন (.env.example, firebase.ts)।' 
                    : 'Firebase Auth, Firestore SDK setup, and environment variables template in .env.example.'}
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-900">{language === 'bn' ? 'টাইপস্ক্রিপ্ট ডাটা মডেল ও নেটলিফাই রেডি:' : 'TypeScript Data Models & Netlify Ready:'}</strong>{' '}
                  {language === 'bn' 
                    ? 'সকল প্রজেক্ট, খরচ, ভাউচার ও ইউজারের মাস্টার টাইপস্ক্রিপ্ট টাইপস এবং SPA রিফ্রেশ ৪০৪ প্রিভেনশন।' 
                    : 'Complete master TypeScript schemas and Netlify SPA redirect rules (_redirects, netlify.toml).'}
                </div>
              </li>
            </ul>
          </div>

          {/* SECTION 2: FOLDER STRUCTURE */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <FolderTree className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                2. {language === 'bn' ? 'প্রজেক্ট ফোল্ডার স্ট্রাকচার' : 'Project Folder Structure'}
              </h2>
            </div>

            <div className="bg-slate-950 text-slate-300 rounded-lg p-3.5 font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-amber-400 font-bold">src/</div>
              <div className="pl-4">├── <span className="text-sky-300 font-semibold">components/</span> <span className="text-slate-500"># Reusable UI (Logo, Buttons, Inputs, Modals, Badges)</span></div>
              <div className="pl-4">├── <span className="text-sky-300 font-semibold">context/</span> <span className="text-slate-500"># AuthContext, LanguageContext (Bilingual State)</span></div>
              <div className="pl-4">├── <span className="text-sky-300 font-semibold">firebase/</span> <span className="text-slate-500"># Firebase Config & SDK Initializer</span></div>
              <div className="pl-4">├── <span className="text-sky-300 font-semibold">i18n/</span> <span className="text-slate-500"># Bangla & English Translations & Number Formatter</span></div>
              <div className="pl-4">├── <span className="text-sky-300 font-semibold">pages/</span></div>
              <div className="pl-8">├── <span className="text-amber-300">auth/</span> <span className="text-slate-500"># LoginPage.tsx (Split Screen ERP Login)</span></div>
              <div className="pl-8">└── <span className="text-amber-300">dashboard/</span> <span className="text-slate-500"># Phase1Overview.tsx</span></div>
              <div className="pl-4">├── <span className="text-sky-300 font-semibold">services/</span> <span className="text-slate-500"># authService.ts (Firebase Auth & Demo Fallback)</span></div>
              <div className="pl-4">└── <span className="text-sky-300 font-semibold">types/</span> <span className="text-slate-500"># index.ts (Enterprise ERP TypeScript Models)</span></div>
              <div className="text-slate-500 mt-2">.env.example | netlify.toml | metadata.json | index.html</div>
            </div>
          </div>

          {/* SECTION 3: FIREBASE SETUP REQUIREMENTS */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                3. {language === 'bn' ? 'ফায়ারবেস কনফিগারেশন সেটআপ' : 'Firebase Setup Requirements'}
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'লাইভ ফায়ারবেস ক্লাউড কানেকশন সক্রিয় করার জন্য নিচের পরিবেশ ভ্যারিয়েবলগুলো (.env) যোগ করা যাবে:'
                : 'To connect a live Firebase project, configure the following environment variables in .env:'}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 space-y-1">
              <div>VITE_FIREBASE_API_KEY=&lt;YOUR_API_KEY&gt;</div>
              <div>VITE_FIREBASE_AUTH_DOMAIN=&lt;PROJECT_ID&gt;.firebaseapp.com</div>
              <div>VITE_FIREBASE_PROJECT_ID=&lt;PROJECT_ID&gt;</div>
              <div>VITE_FIREBASE_STORAGE_BUCKET=&lt;PROJECT_ID&gt;.appspot.com</div>
              <div>VITE_FIREBASE_MESSAGING_SENDER_ID=&lt;SENDER_ID&gt;</div>
              <div>VITE_FIREBASE_APP_ID=&lt;APP_ID&gt;</div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                {language === 'bn' 
                  ? 'নিরাপত্তা নিশ্চিত করতে ফায়ারস্টোর সিকিউরিটি রুলস (RBAC) এবং ব্লুপ্রিন্ট ফেজ ২-এ ডিফাইন ও ডিপ্লয় করা হবে।' 
                  : 'Firebase Security Rules (RBAC) and Blueprint will be fully enforced and deployed in Phase 2.'}
              </span>
            </div>
          </div>

          {/* SECTION 4: HOW TO TEST */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Terminal className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                4. {language === 'bn' ? 'ফেজ ১ যেভাবে টেস্ট করবেন' : 'How You Can Test Phase 1'}
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800 shrink-0">Step 1</span>
                <span>
                  {language === 'bn'
                    ? 'উপরের হেডার থেকে "বাংলা | English" সুইচারে ক্লিক করে তৎক্ষণাৎ পুরো ইন্টারফেসের ভাষা পরিবর্তন যাচাই করুন।'
                    : 'Click the "বাংলা | English" switcher in the top header to verify real-time translation across all elements.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800 shrink-0">Step 2</span>
                <span>
                  {language === 'bn'
                    ? '"লগআউট" বাটনে ক্লিক করে লগইন স্ক্রিনে ফিরে যান এবং বিভিন্ন রোলের ডেমো বাটন (Super Admin, Accountant, PM, Site Engineer) দিয়ে লগইন টেস্ট করুন।'
                    : 'Click "Sign Out" to return to the Login screen and test instant role switching across Super Admin, Accountant, PM, and Site Engineer.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800 shrink-0">Step 3</span>
                <span>
                  {language === 'bn'
                    ? 'লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" মোডাল এবং ভুল পাসওয়ার্ড দিলে বাংলা/ইংরেজি এরর মেসেজ প্রদর্শিত হচ্ছে কিনা দেখুন।'
                    : 'Test the "Forgot Password" modal and invalid credential error message handling in both languages.'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-300/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{language === 'bn' ? 'পরবর্তী ধাপের জন্য প্রস্তুত' : 'Ready for Next Phase:'}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-amber-300">
                  START PHASE 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
