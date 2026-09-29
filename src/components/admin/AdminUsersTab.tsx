import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, Crown, UserCheck } from 'lucide-react';
import { User } from '../../types';

interface AdminUsersTabProps {
  users: User[];
  onManageUser: (user: User) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onManageUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q));

    const matchesRole =
      roleFilter === 'ALL' ? true : u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'BANNED'
        ? u.status === 'BANNED' || u.isBanned
        : u.status !== 'BANNED' && !u.isBanned;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getPermissionsCountText = (u: User) => {
    if (u.role === 'OWNER') return 'Tous les droits (Owner)';
    if (u.role === 'ADMIN') {
      const count = u.grantedPermissions?.length || 13;
      return `${count} permissions`;
    }
    const count = u.grantedPermissions?.length || 0;
    return `${count} permissions`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '20/09/2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden space-y-4">
      {/* Search & Filters */}
      <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, username ou email..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="OWNER">OWNER</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BANNED">BANNED</option>
          </select>

          {/* Filter button */}
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrer</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
            <tr>
              <th className="py-3 px-6">Utilisateur</th>
              <th className="py-3 px-4">Rôle</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4">Permissions</th>
              <th className="py-3 px-4">Dernière Activité</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">
                  Aucun utilisateur ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isBanned = u.status === 'BANNED' || u.isBanned;

                return (
                  <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-zinc-900 leading-tight">
                            {u.displayName}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            @{u.username} {u.email && `· ${u.email}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {u.role === 'OWNER' ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                          <Crown className="w-3 h-3 text-purple-600" />
                          <span>OWNER</span>
                        </span>
                      ) : u.role === 'ADMIN' ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>ADMIN</span>
                        </span>
                      ) : u.role === 'MODERATOR' ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span>MODERATOR</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 inline-flex items-center gap-1">
                          <span>MEMBER</span>
                        </span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-4">
                      {isBanned ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          BANNED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    {/* Permissions */}
                    <td className="py-3.5 px-4 text-xs text-zinc-600">
                      {getPermissionsCountText(u)}
                    </td>

                    {/* Dernière Activité */}
                    <td className="py-3.5 px-4 text-xs text-zinc-500 font-mono">
                      {formatDate(u.lastLoginAt || u.joinedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onManageUser(u)}
                        className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
