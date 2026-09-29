import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageButtonProps {
  variant?: 'header' | 'sidebar' | 'compact' | 'landing';
  className?: string;
}

export const LanguageButton: React.FC<LanguageButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { currentLanguage, openLanguageModal, t } = useLanguage();

  if (variant === 'landing') {
    return (
      <button
        id="btn-language-selector-landing"
        type="button"
        onClick={openLanguageModal}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all ${className}`}
        title={t('header.choose_language', 'Choose Language')}
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-bold">
          {currentLanguage.moroccan ? '🇲🇦 الدارجة' : currentLanguage.nativeName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        id="btn-language-selector-sidebar"
        type="button"
        onClick={openLanguageModal}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-zinc-100 ${className}`}
        title={t('header.choose_language', 'Choose Language')}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="truncate">{t('header.language', 'Language')}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 font-semibold text-zinc-800">
          <span>{currentLanguage.flag}</span>
          <span className="text-[11px] truncate max-w-[80px]">
            {currentLanguage.moroccan ? 'Darija' : currentLanguage.code.toUpperCase()}
          </span>
        </div>
      </button>
    );
  }

  // Header / default variant
  return (
    <button
      id="btn-language-selector-header"
      type="button"
      onClick={openLanguageModal}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs font-semibold transition-colors border border-transparent hover:border-zinc-200 ${className}`}
      title={t('header.choose_language', 'Choose Language (Morocco / World)')}
    >
      <span className="text-base leading-none">{currentLanguage.flag}</span>
      <span className="hidden sm:inline font-bold text-zinc-800">
        {currentLanguage.moroccan ? 'الدارجة 🇲🇦' : currentLanguage.nativeName}
      </span>
      <ChevronDown className="w-3 h-3 text-zinc-400" />
    </button>
  );
};
