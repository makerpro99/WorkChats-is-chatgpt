import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Crown, Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

interface AccessGateModalProps {
  targetRole: 'MODERATOR' | 'ADMIN' | 'OWNER';
  onVerified: () => void;
  onCancel: () => void;
}

export const AccessGateModal: React.FC<AccessGateModalProps> = ({
  targetRole,
  onVerified,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [accessPin, setAccessPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isOwnerGate = targetRole === 'OWNER';
  const isModGate = targetRole === 'MODERATOR';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isOwnerGate) {
        await api.verifyOwnerGate(accessPin);
      } else if (isModGate) {
        await api.verifyModeratorGate(accessPin);
      } else {
        await api.verifyAdminGate(accessPin);
      }

      setSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 700);
    } catch (err: any) {
      const errMsg = err.message || 'Code invalide.';
      setError(t(errMsg, errMsg === 'Code invalide.' ? 'Code invalide.' : errMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="access-gate-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="access-gate-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header decoration */}
        <div
          className={`h-2.5 w-full ${
            isOwnerGate
              ? 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700'
              : isModGate
              ? 'bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-700'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
          }`}
        />

        <div className="p-6 text-center">
          {/* Icon Badge */}
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-xs ${
              isOwnerGate
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : isModGate
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
            ) : isOwnerGate ? (
              <Crown className="w-8 h-8" />
            ) : isModGate ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <ShieldAlert className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-xl font-bold text-zinc-900 mb-1">
            {isOwnerGate
              ? 'Owner Verification Gate'
              : isModGate
              ? 'Moderator Verification Gate'
              : 'Admin Security Gate'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-6">
            {isOwnerGate
              ? 'Root management privileges required. High-security protocol active.'
              : isModGate
              ? 'Community trust & moderation privileges required. Real backend authorization enforced.'
              : 'Administrative verification required to access moderation and control logs.'}
          </p>

          {error && (
            <div
              id="gate-error-message"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Identity & role authenticated. Entering secure console...</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                <span>{t('Security Access Key', 'Security Access Key')}</span>
                <span className="text-[11px] text-zinc-400 font-normal">{t('Confidential', 'Confidential')}</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="input-gate-security-pin"
                  type={showPassword ? 'text' : 'password'}
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  placeholder={t('Enter security access key', 'Enter security access key')}
                  disabled={loading || success}
                  required
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  id="btn-gate-toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                  title={showPassword ? 'Hide security key' : 'Show security key'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="btn-gate-cancel"
                onClick={onCancel}
                disabled={loading || success}
                className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
              >
                {t('Cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                id="btn-gate-authenticate"
                disabled={loading || success}
                className={`flex-1 py-2.5 px-4 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                  isOwnerGate
                    ? 'bg-teal-700 hover:bg-teal-800 focus:ring-teal-700'
                    : 'bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-900'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('Verifying...', 'Verifying...')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('Unlock Panel', 'Unlock Panel')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
