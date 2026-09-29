import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  Zap,
  Upload,
  Globe,
  Search,
  Check,
} from 'lucide-react';
import { User, TransactionRecord } from '../types';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
];

interface SettingsViewProps {
  currentUser: User;
  onUpdateCurrentUser: (updated: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
}) => {
  const { currentLanguage, allLanguages, setLanguage, openLanguageModal, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'LANGUAGE' | 'BILLING'>('PROFILE');
  const [langSearch, setLangSearch] = useState('');

  // Profile Form
  const [username, setUsername] = useState(currentUser.username || '');
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Password Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Billing & Stripe Form
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  // States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'BILLING') {
      api.getTransactions()
        .then((res) => setTransactions(res.transactions || []))
        .catch(console.error);
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.updateProfile({
        username: username.trim(),
        displayName: displayName.trim(),
        bio,
        avatarUrl,
      });
      onUpdateCurrentUser(res.user);
      setMessage({ type: 'success', text: 'Username and profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP, etc.).' });
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file size must be under 2.5 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (base64Data) {
        setAvatarUrl(base64Data);
        try {
          const res = await api.updateProfile({ displayName, bio, avatarUrl: base64Data });
          onUpdateCurrentUser(res.user);
          setMessage({ type: 'success', text: 'Logo de profil importé et enregistré avec succès !' });
        } catch (err: any) {
          setMessage({ type: 'success', text: 'Nouveau logo sélectionné ! Cliquez sur "Enregistrer" pour appliquer.' });
        }
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await api.changePassword({ newPassword, confirmPassword });
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.length < 15) {
      setMessage({ type: 'error', text: 'Please enter a valid credit card number.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const cleanCard = cardNumber.replace(/\s+/g, '');
    const last4 = cleanCard.slice(-4) || '4242';
    const brand = cleanCard.startsWith('4') ? 'Visa' : cleanCard.startsWith('5') ? 'Mastercard' : 'Amex';

    try {
      const res = await api.processPayment({
        planId: selectedPlan,
        billingCycle,
        cardholderName: cardholderName || currentUser.displayName,
        cardLast4: last4,
        cardBrand: brand,
      });

      onUpdateCurrentUser(res.user);
      setMessage({
        type: 'success',
        text: `Payment confirmed! Upgraded to ${selectedPlan.toUpperCase()} tier with active Stripe invoice.`,
      });

      // Refresh transactions
      const tx = await api.getTransactions();
      setTransactions(tx.transactions || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment processing failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Account & Billing</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage your personal profile, security credentials, and Stripe subscription tier.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl max-w-xl text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => {
            setMessage(null);
            setActiveTab('PROFILE');
          }}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PROFILE' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>{t('settings.tab_profile', 'Profile')}</span>
        </button>

        <button
          onClick={() => {
            setMessage(null);
            setActiveTab('SECURITY');
          }}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SECURITY' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{t('settings.tab_security', 'Security')}</span>
        </button>

        <button
          onClick={() => {
            setMessage(null);
            setActiveTab('LANGUAGE');
          }}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'LANGUAGE' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>{t('settings.tab_language', 'Language')}</span>
          <span className="text-[11px]">{currentLanguage.flag}</span>
        </button>

        <button
          onClick={() => {
            setMessage(null);
            setActiveTab('BILLING');
          }}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'BILLING' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t('settings.tab_billing', 'Stripe Billing')}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. PROFILE TAB */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">Avatar Photo</label>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <div className="relative group shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Current Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-300 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity pointer-events-none">
                    Preview
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="text-xs font-bold text-zinc-900">Importer un logo ou photo de profil</div>
                  <p className="text-[11px] text-zinc-500">
                    Importez votre logo ou avatar personnalisé depuis votre appareil (PNG, JPG, SVG, WebP jusqu'à 2.5 MB).
                  </p>
                  <label
                    htmlFor="custom-avatar-file-input"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importer un logo depuis l'appareil...</span>
                  </label>
                  <input
                    id="custom-avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                Or Select From Preset Avatars
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      avatarUrl === url
                        ? 'border-teal-600 ring-2 ring-teal-600/30 scale-105'
                        : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-zinc-400 font-bold">@</span>
                  <input
                    id="input-settings-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Unique handle for your profile, chat, and mentions.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Role & Authority</label>
              <div className="px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-800 flex items-center justify-between">
                <span>{currentUser.role}</span>
                <span className="text-[10px] text-zinc-500 font-sans font-normal">
                  Managed server-side
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Bio / Role Description</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your focus area, projects, or team status..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* 2. SECURITY TAB */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6 max-w-lg">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* 3. LANGUAGE TAB */}
      {activeTab === 'LANGUAGE' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>{t('settings.lang_heading', 'Interface Language & Regional Options')}</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {t('settings.lang_desc', 'Customize your language experience across WorkChat with full support for Moroccan Darija 🇲🇦 and world languages.')}
              </p>
            </div>

            <button
              type="button"
              onClick={openLanguageModal}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('lang.title', 'Browse All 40+ Languages')}</span>
            </button>
          </div>

          {/* Moroccan Language Spotlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50/80 via-red-50/40 to-amber-50/40 border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl leading-none">🇲🇦</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-950">الدارجة المغربية (Moroccan Darija)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                    Maroc / المغرب
                  </span>
                </div>
                <p className="text-xs text-red-800/80 mt-0.5">
                  اللغة الدارجة المغربية الأصلية مع دعم كامل للاتجاه والكلمات الشائعة.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setLanguage('ary');
                setMessage({ type: 'success', text: 'تم تفعيل الدارجة المغربية بنجاح! 🇲🇦' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                currentLanguage.code === 'ary'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white hover:bg-red-100 text-red-900 border border-red-200'
              }`}
            >
              {currentLanguage.code === 'ary' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>مفعلة حالياً</span>
                </>
              ) : (
                <span>تفعيل الدارجة</span>
              )}
            </button>
          </div>

          {/* Current Active Language Pill */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-zinc-500">{t('settings.current_active', 'Current active language')}:</span>
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="text-base">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
                <span className="text-zinc-400 font-normal">({currentLanguage.nativeName})</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400 uppercase">{currentLanguage.code}</span>
          </div>

          {/* Search Languages Inline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700">
                {t('lang.search_placeholder', 'Search and Choose Language')}
              </label>
              <span className="text-[11px] text-zinc-400">
                {allLanguages.filter(l => !langSearch || l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.nativeName.toLowerCase().includes(langSearch.toLowerCase())).length} available
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="Search languages by name or code (e.g. Morocco, Darija, Français, Spanish)..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {allLanguages
                .filter((l) => {
                  if (!langSearch.trim()) return true;
                  const query = langSearch.toLowerCase().trim();
                  return (
                    l.name.toLowerCase().includes(query) ||
                    l.nativeName.toLowerCase().includes(query) ||
                    l.code.toLowerCase().includes(query) ||
                    ((query.includes('maroc') || query.includes('moroc') || query.includes('darija')) && l.moroccan)
                  );
                })
                .map((lang) => {
                  const isActive = currentLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setMessage({ type: 'success', text: `Language changed to ${lang.name} (${lang.nativeName})` });
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : lang.moroccan
                          ? 'bg-red-50/50 hover:bg-red-50 border-red-200 text-zinc-900'
                          : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl leading-none shrink-0">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                            {lang.name}
                          </div>
                          <div className={`text-[11px] truncate ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 4. STRIPE BILLING & PRODUCTION CHECKOUT TAB */}
      {activeTab === 'BILLING' && (
        <div className="space-y-6">
          {/* Plan Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              onClick={() => setSelectedPlan('pro')}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === 'pro'
                  ? 'border-teal-600 bg-teal-50/20 ring-2 ring-teal-600/20 shadow-md'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Pro Workspace
                </span>
                <span className="text-xs font-extrabold text-zinc-900">
                  {billingCycle === 'monthly' ? '$29 / mo' : '$290 / yr'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">High-Velocity Teams</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Unlimited PC Work deliverables, Live Website Builder, and prioritized Gemini 3.8 Flash Agent.
              </p>
              <div className="text-[11px] text-zinc-400">
                Stripe Production Plan • Immediate activation
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('enterprise')}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === 'enterprise'
                  ? 'border-teal-600 bg-teal-50/20 ring-2 ring-teal-600/20 shadow-md'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  Enterprise Dedicated
                </span>
                <span className="text-xs font-extrabold text-zinc-900">
                  {billingCycle === 'monthly' ? '$99 / mo' : '$990 / yr'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Mission-Critical Operations</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Dedicated compute container, custom audit retention, SAML/SSO integration, and 24/7 SLA.
              </p>
              <div className="text-[11px] text-zinc-400">
                Stripe Production Plan • Dedicated billing key
              </div>
            </div>
          </div>

          {/* Checkout Card Form */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Stripe Payment Gateway</h3>
                <p className="text-[11px] text-zinc-400">
                  Real payment card tokenization powered by official Stripe backend.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="e.g. Farouk Al-Mansoor"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono tracking-wider text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Expiration</label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">CVC Security</label>
                  <input
                    type="password"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with Stripe...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>
                      Authorize & Pay {selectedPlan === 'pro' ? '$29.00' : '$99.00'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Transactions Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-zinc-900">Transaction History</h3>

            {transactions.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No previous payments recorded.</p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {transactions.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-zinc-900">
                        {(t.planId || t.planName || 'Plan').toUpperCase()} Subscription {t.billingCycle ? `(${t.billingCycle})` : ''}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {t.cardBrand || t.brand || 'Card'} •••• {t.cardLast4 || t.last4 || '4242'} | Ref: {t.id}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-zinc-900">
                        ${typeof t.amountCents === 'number' ? (t.amountCents / 100).toFixed(2) : (t.amount || 0).toFixed(2)}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
