/**
 * Company Brand Logo Component
 * S.M. Khalilur Rahman Properties Ltd.
 */
import React from 'react';
import { Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import buildingLogoImg from '../../assets/images/skrp_building_logo_1788342210019.jpg';

interface LogoProps {
  variant?: 'full' | 'compact' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', size = 'md' }) => {
  const { t } = useLanguage();
  let logoUrl = buildingLogoImg;
  try {
    const dataContext = useData();
    if (dataContext?.settings?.logoUrl) {
      logoUrl = dataContext.settings.logoUrl;
    }
  } catch {
    // If used outside DataContext, fallback to default
  }

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-black',
  };

  const isWhite = variant === 'white';

  return (
    <div id="company-logo-container" className={`flex items-center gap-3 ${className}`}>
      {/* Luxury Architectural Crest Image or Custom Project Logo */}
      <div 
        id="company-logo-crest"
        className={`relative ${iconSizes[size]} rounded-xl overflow-hidden flex items-center justify-center font-bold tracking-wider shadow-md transition-transform border border-amber-500/40 bg-slate-900 shrink-0`}
      >
        <img 
          src={logoUrl} 
          alt="Company & Project Logo" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {variant !== 'compact' && (
        <div className="flex flex-col">
          <span 
            id="company-logo-title"
            className={`${titleSizes[size]} tracking-tight leading-tight ${isWhite ? 'text-white' : 'text-slate-900'}`}
          >
            {t('companyName')}
          </span>
          <span 
            id="company-logo-subtitle"
            className={`text-xs font-semibold uppercase tracking-wider ${
              isWhite ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            {t('erpTitle')}
          </span>
        </div>
      )}
    </div>
  );
};

