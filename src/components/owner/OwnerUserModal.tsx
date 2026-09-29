import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Key,
  CreditCard,
  UserCheck,
  UserMinus,
  Ban,
  Clock,
  Edit3,
  Copy,
  Check,
  Save,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../../types';

interface OwnerUserModalProps {
  user: User;
  onClose: () => void;
  onExecuteAction: (userId: string, action: string, data?: any) => Promise<any>;
}

export const OwnerUserModal: React.FC<OwnerUserModalProps> = ({
  user,
  onClose,
  onExecuteAction,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ACTIONS' | 'PROFILE' | 'PERMISSIONS'>('ACTIONS');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password reset state
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Profile edit state
  const [editDisplayName, setEditDisplayName] = useState(user.displayName);
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl);

  // Ban reason input state
  const [banReasonInput, setBanReasonInput] = useState('');
  const [showBanConfirm, setShowBanConfirm] = useState(false);

  // Suspension hours
  const [suspendHours, setSuspendHours] = useState(24);

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>(
    user.subscriptionPlan || 'FREE'
  );

  // Permissions state
  const [permissions, setPermissions] = useState<string[]>(
    user.grantedPermissions || [
      'create_work_projects',
      'invite_members',
      'access_ai_agent',
    ]
  );

  const isBanned = user.status === 'BANNED' || user.isBanned;

  const handleAction = async (action: string, data?: any) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await onExecuteAction(user.id, action, data);
      if (res?.generatedPassword) {
        setGeneratedPassword(res.generatedPassword);
      }
      setFeedback({ type: 'success', text: res?.message || 'Action exécutée avec succès.' });
      if (action === 'ban') {
        setShowBanConfirm(false);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || "Erreur lors de l'exécution." });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const togglePermission = (perm: string) => {
    const next = permissions.includes(perm)
      ? permissions.filter((p) => p !== perm)
      : [...permissions, perm];
    setPermissions(next);
  };

  const savePermissions = () => {
    handleAction('update_permissions', { permissions });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 bg-zinc-800 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{user.displayName}</h3>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    user.role === 'OWNER'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : user.role === 'ADMIN'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {user.role}
                </span>

                {isBanned && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                    BANNI
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                @{user.username} • {user.email}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Inscrit le {new Date(user.joinedAt).toLocaleDateString('fr-FR')} • Dernier accès : {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 'Récent'}
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveSubTab('ACTIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'ACTIONS'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Actions Principales
            </button>
            <button
              onClick={() => setActiveSubTab('PROFILE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'PROFILE'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Édition Profil
            </button>
            <button
              onClick={() => setActiveSubTab('PERMISSIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'PERMISSIONS'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Permissions Spécifiques
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-150 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: ACTIONS */}
          {activeSubTab === 'ACTIONS' && (
            <div className="space-y-6">
              {/* Section 1: Informations sur le Bannissement (If Banned) */}
              {isBanned && (
                <div className="p-5 rounded-2xl bg-red-50/80 border border-red-200/90 text-red-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                      <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
                      <span>Compte Banni — Détails de Restriction</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-200 text-red-900 uppercase">
                      Restriction Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-red-100">
                      <div className="text-zinc-500 text-[10px] font-semibold uppercase">Raison du ban</div>
                      <div className="font-semibold text-red-900 mt-0.5">
                        {user.banReason || 'Non respect de la charte de la plateforme'}
                      </div>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-red-100">
                      <div className="text-zinc-500 text-[10px] font-semibold uppercase">Date du ban</div>
                      <div className="font-semibold text-zinc-800 mt-0.5">
                        {user.bannedAt || '20/09/2026 22:10:48'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Banni par : <strong className="text-zinc-700">{user.bannedBy || '6662'}</strong>
                    </span>
                    <button
                      onClick={() => handleAction('unban')}
                      disabled={loading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>Débannir immédiatement</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Section 2: Gestion des Rôles */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Gestion des Rôles
                  </div>
                  <div className="text-xs text-zinc-500">
                    Rôle actuel : <strong className="text-zinc-800">{user.role}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {user.role === 'MEMBER' && (
                    <button
                      onClick={() => handleAction('give_admin')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-blue-200 hover:bg-blue-50/80 text-blue-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div>Promouvoir Administrateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Donne accès au panel admin</div>
                      </div>
                    </button>
                  )}

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => handleAction('demote_admin')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <UserMinus className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div>
                        <div>Rétrograder Membre Simple</div>
                        <div className="text-[10px] font-normal text-zinc-500">Retire les privilèges admin</div>
                      </div>
                    </button>
                  )}

                  {user.role !== 'OWNER' && (
                    <button
                      onClick={() => handleAction('give_owner')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-amber-200 hover:bg-amber-50/80 text-amber-800 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div>Accorder Statut Propriétaire</div>
                        <div className="text-[10px] font-normal text-zinc-500">Privilèges Root absolus</div>
                      </div>
                    </button>
                  )}

                  {user.role === 'OWNER' && (
                    <button
                      onClick={() => handleAction('demote_owner')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <UserMinus className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div>
                        <div>Rétrograder Administrateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Retire le statut Root</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2.5: Cadeaux de Panels Spécifiques (Gift Moderator & Admin Panels) */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cadeaux de Panels (Gift Panels)</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Les utilisateurs n'ont aucun panel par défaut sauf farouk123. Offrez un panel individuellement.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {(user.unlockedPanels?.includes('MODERATOR') || user.giftedPanels?.includes('MODERATOR')) && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-indigo-100 text-indigo-700">
                        Mod Offert
                      </span>
                    )}
                    {(user.unlockedPanels?.includes('ADMIN') || user.giftedPanels?.includes('ADMIN')) && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800">
                        Admin Offert
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Gift / Revoke Creator Panel */}
                  {user.creatorPanel || user.unlockedPanels?.includes('CREATOR') || user.giftedPanels?.includes('CREATOR') ? (
                    <button
                      onClick={() => handleAction('revoke_creator_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div>Retirer le Panel Créateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Révoquer le Creator Panel</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('gift_creator_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-purple-200 hover:bg-purple-50/80 text-purple-800 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div>🎁 Offrir le Creator Panel</div>
                        <div className="text-[10px] font-normal text-zinc-500">Débloque Analytics, Revenue & Monétisation</div>
                      </div>
                    </button>
                  )}

                  {/* Gift / Revoke Owner Panel */}
                  {user.ownerPanel || user.unlockedPanels?.includes('OWNER') || user.giftedPanels?.includes('OWNER') ? (
                    <button
                      onClick={() => handleAction('revoke_owner_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div>Retirer le Panel Propriétaire</div>
                        <div className="text-[10px] font-normal text-zinc-500">Révoquer l'accès Owner Panel</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('gift_owner_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-teal-200 hover:bg-teal-50/80 text-teal-800 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <Crown className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <div>🎁 Offrir le Panel Propriétaire</div>
                        <div className="text-[10px] font-normal text-zinc-500">Débloque la console Owner (/owner)</div>
                      </div>
                    </button>
                  )}

                  {/* Gift / Revoke Moderator Panel */}
                  {user.unlockedPanels?.includes('MODERATOR') || user.giftedPanels?.includes('MODERATOR') ? (
                    <button
                      onClick={() => handleAction('revoke_moderator_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div>Retirer le Panel Modérateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Révoquer le cadeau Modérateur</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('gift_moderator_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50/80 text-indigo-800 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div>🎁 Offrir le Panel Modérateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Débloque la console modérateur</div>
                      </div>
                    </button>
                  )}

                  {/* Gift / Revoke Admin Panel */}
                  {user.unlockedPanels?.includes('ADMIN') || user.giftedPanels?.includes('ADMIN') ? (
                    <button
                      onClick={() => handleAction('revoke_admin_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div>Retirer le Panel Administrateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Révoquer le cadeau Admin</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('gift_admin_panel')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-white border border-amber-200 hover:bg-amber-50/80 text-amber-800 text-xs font-bold transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div>🎁 Offrir le Panel Administrateur</div>
                        <div className="text-[10px] font-normal text-zinc-500">Débloque la console admin</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2.8: Abonnés & Badge de Vérification 1M+ */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Cadeaux d'Abonnés & Badge Vérifié (1,000,000+ Subs)</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Offrez des abonnés pour tester l'éligibilité au badge officiel vérifié (1M+ abonnés).
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {(user.subscriberCount ?? 0).toLocaleString()} abonnés {user.isVerified || (user.subscriberCount ?? 0) >= 1000000 ? '✓ Vérifié' : ''}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction('gift_subscribers', { amount: 100000 })}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>🎁 +100,000 Abonnés</span>
                  </button>
                  <button
                    onClick={() => handleAction('gift_subscribers', { amount: 1000000 })}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>👑 Débloquer 1M+ Abonnés & Badge Vérifié</span>
                  </button>
                  <button
                    onClick={() => handleAction('toggle_verification')}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                  >
                    <span>Inverser Badge Vérifié</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Privilège Forfait Owner (0€) */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      <span>Privilège Forfait Owner (0€)</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Attribuer ou modifier un abonnement sans passer par Stripe
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-200 text-zinc-700 uppercase">
                    Actuel : {user.subscriptionPlan || 'FREE'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as any)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="FREE">Plan Gratuit (Free)</option>
                    <option value="PRO">Plan Pro (Workspace Illimité)</option>
                    <option value="ENTERPRISE">Plan Entreprise (Support VIP)</option>
                  </select>

                  <button
                    onClick={() => handleAction('grant_plan', { plan: selectedPlan })}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Attribuer Forfait 0€</span>
                  </button>
                </div>
              </div>

              {/* Section 4: Mot de Passe & Sécurité */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Réinitialisation de Mot de Passe</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  Génère un nouveau mot de passe sécurisé pour l'utilisateur sans connaître son ancien mot de passe.
                </p>

                {generatedPassword ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-amber-800 uppercase">Nouveau mot de passe généré :</div>
                      <div className="font-mono text-sm font-bold text-zinc-900 mt-0.5 select-all">
                        {generatedPassword}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPass ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAction('reset_password')}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Key className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Générer un nouveau mot de passe</span>
                  </button>
                )}
              </div>

              {/* Section 5: Suspension & Bannissement */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Suspension & Sanctions</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <select
                    value={suspendHours}
                    onChange={(e) => setSuspendHours(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-zinc-800"
                  >
                    <option value={24}>Suspendre 24 heures</option>
                    <option value={48}>Suspendre 48 heures</option>
                    <option value={168}>Suspendre 7 jours</option>
                  </select>

                  <button
                    onClick={() => handleAction('suspend', { durationHours: suspendHours })}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Appliquer Suspension
                  </button>

                  {!isBanned && (
                    <button
                      onClick={() => setShowBanConfirm(!showBanConfirm)}
                      className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Ban className="w-3.5 h-3.5 text-red-600" />
                      <span>Bannir le compte...</span>
                    </button>
                  )}
                </div>

                {showBanConfirm && !isBanned && (
                  <div className="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 space-y-2.5 animate-in fade-in duration-100">
                    <div className="text-xs font-bold text-red-900">Confirmation du Bannissement :</div>
                    <input
                      type="text"
                      placeholder="Motif du bannissement (ex: Comportement inapproprié)..."
                      value={banReasonInput}
                      onChange={(e) => setBanReasonInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-red-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowBanConfirm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-red-100"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleAction('ban', { reason: banReasonInput })}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirmer le Ban
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeSubTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Modification Manuelle des Informations
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    URL de l'Avatar
                  </label>
                  <input
                    type="text"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <button
                onClick={() =>
                  handleAction('update_profile', {
                    displayName: editDisplayName,
                    avatarUrl: editAvatarUrl,
                  })
                }
                disabled={loading}
                className="mt-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer le Profil</span>
              </button>
            </div>
          )}

          {/* TAB 3: PERMISSIONS */}
          {activeSubTab === 'PERMISSIONS' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Permissions Spécifiques Accordées
              </div>

              <p className="text-xs text-zinc-500">
                Activez ou désactivez des droits spécifiques individuellement pour cet utilisateur.
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'create_work_projects',
                    label: 'Créer des projets et documents Work',
                    desc: 'Autorise la création de projets collaboratifs',
                  },
                  {
                    id: 'invite_members',
                    label: 'Inviter de nouveaux membres',
                    desc: 'Permet d’envoyer des invitations par email ou lien',
                  },
                  {
                    id: 'access_ai_agent',
                    label: 'Accès prioritaire à l’Agent IA Gemini',
                    desc: 'Requêtes illimitées avec le modèle Google GenAI',
                  },
                  {
                    id: 'delete_public_messages',
                    label: 'Supprimer des messages publics',
                    desc: 'Pouvoir modérer ponctuellement un canal',
                  },
                  {
                    id: 'bypass_rate_limits',
                    label: 'Ignorer les limitations de débit (Rate Limit)',
                    desc: 'Pas de restriction sur la fréquence des messages',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100/60 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(item.id)}
                      onChange={() => togglePermission(item.id)}
                      className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">{item.label}</div>
                      <div className="text-[11px] text-zinc-500">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={savePermissions}
                disabled={loading}
                className="mt-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Mettre à jour les Permissions</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-zinc-500 font-mono text-[11px]">ID : {user.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-semibold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
