import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Key,
  UserCheck,
  UserX,
  Ban,
  Clock,
  Edit3,
  Copy,
  Check,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { User } from '../../types';

interface AdminUserModalProps {
  user: User;
  onClose: () => void;
  onExecuteAction: (userId: string, action: string, data?: any) => Promise<any>;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
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

  // Permissions state
  const [permissions, setPermissions] = useState<string[]>(
    user.grantedPermissions || [
      'create_work_projects',
      'invite_members',
      'access_ai_agent',
    ]
  );

  const isBanned = user.status === 'BANNED' || user.isBanned;
  const isOwner = user.role === 'OWNER';
  const isAdmin = user.role === 'ADMIN';

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

  const handleTogglePermission = (permKey: string) => {
    if (permissions.includes(permKey)) {
      setPermissions(permissions.filter((p) => p !== permKey));
    } else {
      setPermissions([...permissions, permKey]);
    }
  };

  const handleSavePermissions = () => {
    handleAction('update_permissions', { permissions });
  };

  const handleSaveProfile = () => {
    handleAction('update_profile', {
      displayName: editDisplayName,
      avatarUrl: editAvatarUrl,
    });
  };

  const copyPasswordToClipboard = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const availablePermissions = [
    { key: 'create_work_projects', label: 'Création de Work Projects', desc: 'Permet de créer et d’assigner des projets de travail' },
    { key: 'invite_members', label: 'Invitation de Nouveaux Membres', desc: 'Génération de liens d’invitation pour l’équipe' },
    { key: 'manage_board_tasks', label: 'Gestion des Tâches et Tableaux', desc: 'Déplacement, édition et archivage des tâches' },
    { key: 'access_ai_agent', label: 'Accès Agent IA & Commandes', desc: 'Utilisation illimitée du copilote de productivité' },
    { key: 'upload_high_res_files', label: 'Téléversement Haute Capacité', desc: 'Autorisation de transfert de fichiers jusqu’à 50 Mo' },
    { key: 'moderate_chat_rooms', label: 'Modération des Salons de Discussion', desc: 'Suppression et épinglage de messages' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-zinc-900 text-base">{user.displayName}</h3>
                <span className="text-xs text-zinc-400 font-mono">@{user.username}</span>
                {isOwner ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    OWNER
                  </span>
                ) : isAdmin ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    ADMIN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    MEMBER
                  </span>
                )}
                {isBanned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                    BANNED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Identifiant : <span className="font-mono text-zinc-600">{user.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="px-6 border-b border-zinc-100 bg-zinc-50/50 flex gap-2">
          <button
            onClick={() => setActiveSubTab('ACTIONS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'ACTIONS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Actions Administratives
          </button>
          <button
            onClick={() => setActiveSubTab('PROFILE')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'PROFILE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Édition Profil
          </button>
          <button
            onClick={() => setActiveSubTab('PERMISSIONS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'PERMISSIONS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Permissions RBAC
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeSubTab === 'ACTIONS' && (
            <div className="space-y-6">
              {/* Role Elevation */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                      Élévation de Rôle
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Statut d'administration de la plateforme
                    </p>
                  </div>
                  {isAdmin ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      ADMINISTRATEUR ACTIF
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-md">
                      MEMBRE STANDARD
                    </span>
                  )}
                </div>

                {!isOwner ? (
                  <div className="flex gap-2 pt-1">
                    {isAdmin ? (
                      <button
                        onClick={() => handleAction('demote_admin')}
                        disabled={loading}
                        className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Rétrograder au rôle MEMBER
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('give_admin')}
                        disabled={loading}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Nommer Administrateur</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-purple-700 italic">
                    Le compte Propriétaire (Root Owner) ne peut pas être modifié.
                  </div>
                )}
              </div>

              {/* Ban / Suspension */}
              {!isOwner && (
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
                  <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                    Modération & Sanctions
                  </h4>

                  {isBanned ? (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-3">
                      <div>
                        <div className="text-xs font-bold text-red-700">Compte actuellement banni</div>
                        <div className="text-[11px] text-red-600 mt-0.5">
                          Motif : {user.banReason || 'Non spécifié'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAction('unban')}
                        disabled={loading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Débannir
                      </button>
                    </div>
                  ) : (
                    <div>
                      {!showBanConfirm ? (
                        <button
                          onClick={() => setShowBanConfirm(true)}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Bannir définitivement ce compte</span>
                        </button>
                      ) : (
                        <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 space-y-3">
                          <div className="text-xs font-bold text-red-800">
                            Confirmation du bannissement
                          </div>
                          <input
                            type="text"
                            value={banReasonInput}
                            onChange={(e) => setBanReasonInput(e.target.value)}
                            placeholder="Motif du bannissement (ex: Spam, non-respect de la charte)..."
                            className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction('ban', { reason: banReasonInput })}
                              disabled={loading}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Confirmer le ban
                            </button>
                            <button
                              onClick={() => setShowBanConfirm(false)}
                              className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-semibold rounded-lg"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Password Reset */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                      Sécurité du Compte
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Générer un mot de passe temporaire pour le membre
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('reset_password')}
                    disabled={loading}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Réinitialiser Mot de Passe</span>
                  </button>
                </div>

                {generatedPassword && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-amber-800">
                        Nouveau mot de passe généré :
                      </div>
                      <div className="font-mono text-sm font-bold text-zinc-900 mt-0.5">
                        {generatedPassword}
                      </div>
                    </div>
                    <button
                      onClick={copyPasswordToClipboard}
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-zinc-800 hover:bg-amber-100 flex items-center gap-1"
                    >
                      {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPass ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'PROFILE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  URL de l'avatar
                </label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          )}

          {activeSubTab === 'PERMISSIONS' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-500">
                Activez ou désactivez les permissions individuelles attribuées à ce membre :
              </div>

              <div className="space-y-2">
                {availablePermissions.map((perm) => {
                  const isChecked = permissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="p-3 rounded-xl border border-zinc-200 flex items-start gap-3 hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{perm.label}</div>
                        <div className="text-[11px] text-zinc-500">{perm.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleSavePermissions}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Mettre à jour les permissions</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
