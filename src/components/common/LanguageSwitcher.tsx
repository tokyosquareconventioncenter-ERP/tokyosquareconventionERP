/**
 * Language Switcher Component
 * Supports বাংলা & English toggling with visual active state
 */
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark' | 'minimal';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'light',
  className = '' 
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      id="language-switcher-wrapper"
      className={`inline-flex items-center rounded-lg p-1 text-xs font-semibold shadow-xs border transition-colors ${
        variant === 'dark'
          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
          : variant === 'minimal'
          ? 'bg-transparent border-transparent'
          : 'bg-white border-slate-200 text-slate-700'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 px-1.5 text-slate-400">
        <Languages className="w-3.5 h-3.5" />
      </div>

      <button
        id="lang-btn-bn"
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded-md transition-all duration-150 ${
          language === 'bn'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        বাংলা
      </button>

      <span className="text-slate-300 px-0.5">|</span>

      <button
        id="lang-btn-en"
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md transition-all duration-150 ${
          language === 'en'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        English
      </button>
    </div>
  );
};
