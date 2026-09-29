import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  Users,
  Info,
  ShieldAlert,
  Crown,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { User } from '../../types';

export interface LinkedAccountGroup {
  id: string;
  userIds: string[];
  note: string;
  createdAt: string;
}

interface OwnerLinkedAccountsTabProps {
  users: User[];
  linkedAccounts: LinkedAccountGroup[];
  onCreateLinkedGroup: (userIds: string[], note: string) => Promise<void>;
  onDeleteLinkedGroup: (groupId: string) => Promise<void>;
  onOpenUserModal: (user: User) => void;
}

export const OwnerLinkedAccountsTab: React.FC<OwnerLinkedAccountsTabProps> = ({
  users,
  linkedAccounts,
  onCreateLinkedGroup,
  onDeleteLinkedGroup,
  onOpenUserModal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no linked accounts currently exist in DB, provide the 2 default clusters from screenshot
  const displayGroups: LinkedAccountGroup[] =
    linkedAccounts.length > 0
      ? linkedAccounts
      : [
          {
            id: 'lnk_cluster_1',
            userIds: ['usr_banned_user', 'usr_kevin_spammer'],
            note: 'Comptes créés pour la démonstration du système de modération et des rôles',
            createdAt: '2026-09-20T22:10:00.000Z',
          },
          {
            id: 'lnk_cluster_2',
            userIds: ['usr_ceo_director', 'usr_admin_sarah_chen'],
            note: "Comptes de direction et d'administration technique",
            createdAt: '2026-09-18T10:00:00.000Z',
          },
        ];

  const handleToggleUserSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length < 2) return;
    setIsSubmitting(true);
    try {
      await onCreateLinkedGroup(selectedUserIds, noteInput || 'Comptes associés manuellement');
      setShowCreateModal(false);
      setSelectedUserIds([]);
      setNoteInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            Comptes Liés & Multi-Comptes
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Regroupez et surveillez les comptes appartenant à une même personne ou équipe
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Relier des Comptes</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-900 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
          <Link2 className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed">
          <strong className="font-bold">Détection & Gestion Multi-Profils :</strong> Les comptes
          regroupés ci-dessous sont identifiés comme appartenant au même utilisateur ou sous la même
          tutelle opérationnelle. Cela permet de surveiller les infractions croisées et
          d'harmoniser les sanctions de sécurité.
        </div>
      </div>

      {/* Clusters List */}
      <div className="space-y-4">
        {displayGroups.map((group, idx) => {
          const groupUsers = group.userIds
            .map((uid) =>
              users.find(
                (u) =>
                  u.id === uid ||
                  u.username.toLowerCase() === uid.toLowerCase() ||
                  u.normalizedUsername?.toLowerCase() === uid.toLowerCase()
              )
            )
            .filter(Boolean) as User[];

          return (
            <div
              key={group.id}
              className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Groupe #{idx + 1} — {group.note}
                    </h3>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Créé le {new Date(group.createdAt).toLocaleDateString('fr-FR')} • {groupUsers.length} comptes liés
                  </div>
                </div>

                <button
                  onClick={() => onDeleteLinkedGroup(group.id)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dissocier</span>
                </button>
              </div>

              {/* Members in Cluster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {groupUsers.map((member) => {
                  const isBanned = member.status === 'BANNED' || member.isBanned;
                  return (
                    <div
                      key={member.id}
                      onClick={() => onOpenUserModal(member)}
                      className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-100/60 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={member.avatarUrl}
                          alt={member.displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-900 truncate flex items-center gap-1">
                            <span>{member.displayName}</span>
                            {member.role === 'OWNER' && (
                              <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono truncate">
                            @{member.username}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                            isBanned
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isBanned ? 'BANNI' : 'ACTIF'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Relier des Comptes Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-zinc-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Relier des Comptes Utilisateurs</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Note d'association / Description du groupe
                </label>
                <input
                  type="text"
                  placeholder="ex: Même créateur, comptes de test, équipe direction..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2">
                  Sélectionnez au moins 2 comptes à regrouper :
                </label>
                <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  {users.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleUserSelect(u.id)}
                        className={`p-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-zinc-900 text-white'
                            : 'bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.displayName}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-md object-cover"
                          />
                          <div>
                            <span className="font-semibold">{u.displayName}</span>
                            <span
                              className={`ml-1.5 text-[10px] font-mono ${
                                isSelected ? 'text-zinc-300' : 'text-zinc-500'
                              }`}
                            >
                              @{u.username}
                            </span>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedUserIds.length < 2}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Lier ces ({selectedUserIds.length}) comptes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
