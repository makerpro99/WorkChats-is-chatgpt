import React from 'react';
import { Crown, ShieldAlert, ShieldX, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';

interface AdminManageAdminsTabProps {
  users: User[];
  onDemoteAdmin: (userId: string) => void;
  isActionLoading?: boolean;
}

export const AdminManageAdminsTab: React.FC<AdminManageAdminsTabProps> = ({
  users,
  onDemoteAdmin,
  isActionLoading = false,
}) => {
  const adminUsers = users.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER');

  return (
    <div className="space-y-4">
      {/* Header with Purple Crown Icon */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
          <Crown className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            Supervision et Nomination des Administrateurs
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Réservé au Owner : nomination, révocation et contrôle des privilèges d'administration
          </p>
        </div>
      </div>

      {/* Admin Cards List */}
      <div className="space-y-3">
        {adminUsers.map((admin) => {
          const isOwner = admin.role === 'OWNER';

          return (
            <div
              key={admin.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isOwner ? 'border-purple-200 bg-purple-50/15' : 'border-zinc-200/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={admin.avatarUrl}
                  alt={admin.displayName}
                  className={`w-11 h-11 rounded-full object-cover border-2 shrink-0 ${
                    isOwner ? 'border-purple-400' : 'border-amber-400'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 text-sm">
                      {admin.displayName}
                    </span>
                    <span className="text-xs text-zinc-400">
                      @{admin.username}
                    </span>
                    {isOwner ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                        OWNER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 uppercase">
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-zinc-500 mt-1">
                    {isOwner
                      ? "Créateur de l'instance · Droits immuables"
                      : `${admin.grantedPermissions?.length || 13} permissions administratives`}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="self-end sm:self-center">
                {isOwner ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-100/70 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Propriétaire Racine</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDemoteAdmin(admin.id)}
                    disabled={isActionLoading}
                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldX className="w-3.5 h-3.5" />
                    <span>Révoquer l'accès Admin</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
