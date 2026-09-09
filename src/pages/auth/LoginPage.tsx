/**
 * Clean & Secure Construction ERP Login Screen
 * S.M. Khalilur Rahman Properties Ltd.
 */
import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../../components/common/Logo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const { t, language } = useLanguage();

  const isBn = language === 'bn';

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন' : 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const errCode = err?.code || err?.message || '';
      if (errCode.includes('user-not-found')) {
        setErrorMessage(isBn ? 'এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি' : 'User account not found');
      } else if (errCode.includes('wrong-password') || errCode.includes('invalid-credential')) {
        setErrorMessage(isBn ? 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন' : 'Invalid password. Please try again');
      } else if (errCode.includes('too-many-requests')) {
        setErrorMessage(isBn ? 'অতিরিক্ত চেষ্টার কারণে সাময়িক বন্ধ। কিছুক্ষণ পর চেষ্টা করুন' : 'Too many attempts. Please try again later');
      } else {
        setErrorMessage(isBn ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়' : 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.message === 'UNAUTHORIZED_GOOGLE_ACCOUNT') {
        setErrorMessage(
          isBn 
            ? '⛔ এই গুগল অ্যাকাউন্টটি অনুমোদিত নয়! শুধুমাত্র অনুমোদিত অ্যাডমিন ও স্টাফ লগইন করতে পারবেন। দয়া করে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।' 
            : '⛔ This Google account is not authorized. Please contact the Super Admin.'
        );
      } else {
        setErrorMessage(isBn ? 'গুগল সাইন-ইন সম্পন্ন করা যায়নি' : 'Google sign-in failed. Please try again');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetSuccessMessage(null);
    try {
      await resetPassword(resetEmail.trim());
      setResetSuccessMessage(isBn ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে' : 'Password reset link sent to your email');
    } catch {
      setResetSuccessMessage(isBn ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে' : 'Password reset link sent to your email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo variant="white" size="md" />
        <LanguageSwitcher variant="dark" />
      </header>

      {/* Main Centered Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div 
          id="login-form-wrapper"
          className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 space-y-6"
        >
          {/* Form Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {isBn ? 'কনস্ট্রাকশন ইআরপি লগইন' : 'Construction ERP Login'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isBn 
                ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে একাউন্টে প্রবেশ করুন' 
                : 'Sign in with your authorized email and password'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div 
              id="login-error-banner"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-shake"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email-input"
              type="email"
              label={isBn ? 'ইমেইল এড্রেস' : 'Email Address'}
              placeholder={isBn ? 'যেমন: tokyosquareconventioncenter@gmail.com' : 'e.g. tokyosquareconventioncenter@gmail.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <div className="space-y-1">
              <Input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                label={isBn ? 'পাসওয়ার্ড' : 'Password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium">
                <input
                  id="remember-me-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>{isBn ? 'স্মরণে রাখুন' : 'Remember me'}</span>
              </label>

              <button
                id="forgot-password-btn"
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccessMessage(null);
                  setIsResetModalOpen(true);
                }}
                className="font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              >
                {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </button>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="gold"
              size="lg"
              className="w-full shadow-md cursor-pointer"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {loading 
                ? (isBn ? 'লগইন হচ্ছে...' : 'Signing In...') 
                : (isBn ? 'লগইন করুন' : 'Sign In')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'অথবা' : 'OR'}
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>
              {googleLoading 
                ? (isBn ? 'গুগল যাচাই হচ্ছে...' : 'Connecting Google...') 
                : (isBn ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google')}
            </span>
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'সুরক্ষিত ক্লাউড সার্ভার এনক্রিপ্টেড' : 'Secure Cloud Encrypted System'}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} S.M. Khalilur Rahman Properties Ltd. All rights reserved.</p>
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
      >
        <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isBn 
              ? 'আপনার একাউন্টের ইমেইল এড্রেস লিখুন। আমরা আপনাকে একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়ে দেব।' 
              : 'Enter your registered email address to receive password reset instructions.'}
          </p>

          {resetSuccessMessage ? (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              {resetSuccessMessage}
            </div>
          ) : (
            <Input
              type="email"
              label={isBn ? 'ইমেইল এড্রেস' : 'Email Address'}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="user@example.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </Button>
            {!resetSuccessMessage && (
              <Button
                type="submit"
                variant="gold"
                size="sm"
                isLoading={resetLoading}
              >
                {isBn ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
