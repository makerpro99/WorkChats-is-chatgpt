import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check, Globe, Sparkles } from 'lucide-react';
import { useLanguage, LanguageInfo } from '../context/LanguageContext';

export const LanguageSelectorModal: React.FC = () => {
  const {
    currentLanguage,
    allLanguages,
    setLanguage,
    closeLanguageModal,
    isLanguageModalOpen,
    t,
  } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'MOROCCO' | 'POPULAR' | 'MENA' | 'EUROPE' | 'ASIA_AMER'>('ALL');

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLanguageModalOpen) {
        closeLanguageModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLanguageModalOpen, closeLanguageModal]);

  // Reset search when opening
  useEffect(() => {
    if (isLanguageModalOpen) {
      setSearchTerm('');
      setSelectedFilter('ALL');
    }
  }, [isLanguageModalOpen]);

  // Filtered languages with instant search
  const filteredLanguages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allLanguages.filter((item) => {
      // 1. Category Filter
      if (selectedFilter === 'MOROCCO' && !item.moroccan) return false;
      if (selectedFilter === 'POPULAR' && !item.popular) return false;
      if (selectedFilter === 'MENA' && item.region !== 'MENA & Africa') return false;
      if (selectedFilter === 'EUROPE' && item.region !== 'Europe') return false;
      if (selectedFilter === 'ASIA_AMER' && item.region !== 'Asia & Pacific' && item.region !== 'Americas') return false;

      // 2. Search Term Filter
      if (!term) return true;

      const matchName = item.name.toLowerCase().includes(term);
      const matchNative = item.nativeName.toLowerCase().includes(term);
      const matchCode = item.code.toLowerCase().includes(term);
      const matchRegion = item.region.toLowerCase().includes(term);
      
      // Special aliases for Moroccan search
      const isMoroccoSearch =
        term.includes('maroc') ||
        term.includes('moroc') ||
        term.includes('darija') ||
        term.includes('مغرب') ||
        term.includes('دارجة') ||
        term.includes('berber') ||
        term.includes('amazigh');

      if (isMoroccoSearch && item.moroccan) {
        return true;
      }

      return matchName || matchNative || matchCode || matchRegion;
    });
  }, [allLanguages, searchTerm, selectedFilter]);

  if (!isLanguageModalOpen) return null;

  const handleSelectLanguage = (lang: LanguageInfo) => {
    setLanguage(lang.code);
    closeLanguageModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                  {t('lang.title', 'Choose Interface Language')}
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  40+ Languages
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('lang.subtitle', 'Search across world languages including Moroccan Darija (الدارجة المغربية).')}
              </p>
            </div>
          </div>

          <button
            onClick={closeLanguageModal}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-zinc-100 bg-zinc-50/70">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('lang.search_placeholder', 'Search language (e.g. Morocco, Darija, Français, Español, العربية)...')}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 p-0.5 text-zinc-400 hover:text-zinc-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedFilter === 'ALL'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
              }`}
            >
              {t('lang.all', 'All Languages')} ({allLanguages.length})
            </button>

            <button
              onClick={() => setSelectedFilter('MOROCCO')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'MOROCCO'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
              }`}
            >
              <span>🇲🇦</span>
              <span>Maroc / المغرب (Darija)</span>
            </button>

            <button
              onClick={() => setSelectedFilter('POPULAR')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                selectedFilter === 'POPULAR'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t('lang.featured', 'Popular')}</span>
            </button>

            <button
              onClick={() => setSelectedFilter('MENA')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedFilter === 'MENA'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
              }`}
            >
              MENA & Africa
            </button>

            <button
              onClick={() => setSelectedFilter('EUROPE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedFilter === 'EUROPE'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
              }`}
            >
              Europe
            </button>

            <button
              onClick={() => setSelectedFilter('ASIA_AMER')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedFilter === 'ASIA_AMER'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
              }`}
            >
              Asia & Americas
            </button>
          </div>
        </div>

        {/* Scrollable List of Languages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center">
              <Globe className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-700">
                {t('lang.no_results', 'No languages found matching')} "{searchTerm}"
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Try searching for "Morocco", "Darija", "Arabic", "French", or "English".
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('ALL');
                }}
                className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredLanguages.map((item) => {
                const isCurrent = currentLanguage.code === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelectLanguage(item)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isCurrent
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : item.moroccan
                        ? 'bg-red-50/40 hover:bg-red-50 border-red-200/80 text-zinc-900 hover:border-red-300'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 leading-none">{item.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold truncate ${
                              isCurrent ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.moroccan && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isCurrent
                                  ? 'bg-red-500 text-white'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              🇲🇦 Maroc
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs mt-0.5 font-medium ${
                            isCurrent
                              ? 'text-zinc-300'
                              : item.moroccan
                              ? 'text-red-700 font-bold'
                              : 'text-zinc-500'
                          }`}
                        >
                          {item.nativeName}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-700">
                          {item.code}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>{t('lang.current', 'Active')}:</span>
            <span className="font-bold text-zinc-800 flex items-center gap-1.5">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
            </span>
          </div>

          <button
            onClick={closeLanguageModal}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors"
          >
            {t('lang.select_button', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
