import React from 'react';
import { Shield, ShieldAlert, Crown, UserCheck, Key, Settings } from 'lucide-react';
import { User } from '../../types';

interface AdminRolesTabProps {
  users: User[];
  onPromoteAdmin: (userId: string) => void;
  onDemoteAdmin: (userId: string) => void;
  onOpenUserDetails: (user: User) => void;
  isActionLoading?: boolean;
}

export const AdminRolesTab: React.FC<AdminRolesTabProps> = ({
  users,
  onPromoteAdmin,
  onDemoteAdmin,
  onOpenUserDetails,
  isActionLoading = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Rôles et Matrice des Permissions (RBAC)
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Attribution des privilèges, distinction stricte entre MEMBER et ADMIN, et autorisations granulaires
        </p>
      </div>

      {/* 3 Role Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MEMBER */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs">
                M
              </span>
              <h3 className="font-bold text-zinc-900 text-sm">Rôle MEMBER</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Rôle par défaut attribué à la création de tout nouveau compte. Accès aux projets, tâches, chat et fichiers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Permissions :</span>
            <span className="font-semibold text-zinc-700">Défaut utilisateur</span>
          </div>
        </div>

        {/* ADMIN */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between bg-amber-50/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              </span>
              <h3 className="font-bold text-zinc-900 text-sm">Rôle ADMIN</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Administrateur nommé avec accès au Admin Panel et droits de modération configurables.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Permissions :</span>
            <span className="font-bold text-amber-700">Modération & Gestion</span>
          </div>
        </div>

        {/* OWNER */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-xs flex flex-col justify-between bg-purple-50/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                <Crown className="w-4 h-4 text-purple-700" />
              </span>
              <h3 className="font-bold text-zinc-900 text-sm">Rôle OWNER</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Propriétaire de l'instance avec tous les droits immuables et autorité exclusive sur la sécurité.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Permissions :</span>
            <span className="font-bold text-purple-700">Accès Absolu</span>
          </div>
        </div>
      </div>

      {/* Role Management List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Changer le Rôle d'un Membre</h3>
        </div>

        <div className="divide-y divide-zinc-100">
          {users.map((user) => {
            const isOwner = user.role === 'OWNER';
            const isAdmin = user.role === 'ADMIN';

            return (
              <div
                key={user.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors"
              >
                {/* Left: User Info & Current Role */}
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-semibold text-zinc-900 text-xs leading-tight">
                      {user.displayName}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      @{user.username}
                    </div>
                  </div>

                  <div className="ml-3">
                    <span className="text-[11px] text-zinc-400 mr-1.5">Actuel :</span>
                    {isOwner ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        OWNER
                      </span>
                    ) : isAdmin ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                        MEMBER
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isOwner && (
                    <>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => onDemoteAdmin(user.id)}
                          disabled={isActionLoading}
                          className="px-3.5 py-1.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Passer en MEMBER
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPromoteAdmin(user.id)}
                          disabled={isActionLoading}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                        >
                          Nommer ADMIN
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenUserDetails(user)}
                    className="px-3.5 py-1.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Détails & Droits
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
