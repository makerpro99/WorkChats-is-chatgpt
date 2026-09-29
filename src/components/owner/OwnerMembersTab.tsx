import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Shield,
  ShieldCheck,
  Crown,
  Ban,
  UserCheck,
  Settings2,
  ExternalLink,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface OwnerMembersTabProps {
  users: User[];
  onOpenUserModal: (user: User) => void;
  onExecuteQuickAction: (userId: string, action: string, data?: any) => Promise<any>;
}

export const OwnerMembersTab: React.FC<OwnerMembersTabProps> = ({
  users,
  onOpenUserModal,
  onExecuteQuickAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MEMBER' | 'ADMIN' | 'OWNER' | 'BANNED'>('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (roleFilter === 'BANNED') {
        return u.status === 'BANNED' || u.isBanned;
      }
      if (roleFilter === 'ALL') return true;
      return u.role === roleFilter;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Annuaire des Membres</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Contrôle total sur chaque utilisateur : rôles, bannissements, modifications
          </p>
        </div>
        <div className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 self-start sm:self-center">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou pseudo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'MEMBER', label: 'Membres' },
            { id: 'ADMIN', label: 'Admins' },
            { id: 'OWNER', label: 'Propriétaires' },
            { id: 'BANNED', label: 'Bannis' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === f.id
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Utilisateur</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Rôle</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Forfait</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Aucun utilisateur trouvé correspondant aux filtres.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBanned = user.status === 'BANNED' || user.isBanned;
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-2xl object-cover ring-1 ring-zinc-200 bg-zinc-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <span>{user.displayName}</span>
                              {user.role === 'OWNER' && (
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'OWNER'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : user.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {user.role === 'OWNER' && <Crown className="w-3 h-3" />}
                          {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isBanned
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isBanned ? 'bg-red-600' : 'bg-emerald-600'
                            }`}
                          />
                          <span>{isBanned ? 'BANNI' : 'ACTIF'}</span>
                        </span>
                      </td>

                      {/* Subscription Plan */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.subscriptionPlan === 'ENTERPRISE'
                              ? 'bg-purple-100 text-purple-800'
                              : user.subscriptionPlan === 'PRO'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {user.subscriptionPlan || 'FREE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isBanned ? (
                            <button
                              onClick={() => onExecuteQuickAction(user.id, 'unban')}
                              title="Débannir immédiatement"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Débannir
                            </button>
                          ) : (
                            user.role === 'MEMBER' && (
                              <button
                                onClick={() => onExecuteQuickAction(user.id, 'give_admin')}
                                title="Promouvoir Administrateur"
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                              >
                                + Admin
                              </button>
                            )
                          )}

                          <button
                            onClick={() => onOpenUserModal(user)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Gérer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
