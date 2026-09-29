import React from 'react';
import { UserX, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface AdminBansTabProps {
  bannedUsers: User[];
  onUnbanUser: (userId: string) => void;
  isActionLoading?: boolean;
}

export const AdminBansTab: React.FC<AdminBansTabProps> = ({
  bannedUsers,
  onUnbanUser,
  isActionLoading = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Gestion des Bannissements et Suspensions
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Liste des comptes interdits d'accès avec motifs et options de réactivation immédiate
        </p>
      </div>

      {/* Banned Users Cards */}
      {bannedUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-zinc-200/80 shadow-xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-zinc-900">Aucun compte banni</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tous les membres sont en conformité avec les règles de la communauté et de sécurité.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bannedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-red-300 transition-all"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-red-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 text-sm">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-zinc-400">
                      @{user.username}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 uppercase">
                      BANNED
                    </span>
                  </div>

                  <div className="text-xs text-red-600 font-medium mt-1">
                    Motif : {user.banReason || 'Non respect de la charte de la plateforme'}
                  </div>

                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Date : {user.bannedAt || '20/09/2026'}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onUnbanUser(user.id)}
                disabled={isActionLoading}
                className="px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Débannir l'utilisateur</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
