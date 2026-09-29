import React from 'react';
import { Shield, RotateCw } from 'lucide-react';

interface AdminHeaderProps {
  currentUserRole: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUserRole,
  onRefresh,
  isRefreshing = false,
}) => {
  const isOwner = currentUserRole === 'OWNER';

  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        {/* Amber Shield Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
          <Shield className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Admin Panel</h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-amber-300 text-amber-800 bg-amber-50/50">
              Strict RBAC
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isOwner
                  ? 'text-purple-700 bg-purple-100 border border-purple-200'
                  : 'text-amber-800 bg-amber-100 border border-amber-200'
              }`}
            >
              {isOwner ? 'OWNER ACTIVE' : 'ADMIN ACTIVE'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Gouvernance des utilisateurs, modération des accès, audit logs et permissions
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Rafraîchir les données"
        className="w-10 h-10 rounded-full border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 flex items-center justify-center transition-colors shadow-xs disabled:opacity-50"
      >
        <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-900' : ''}`} />
      </button>
    </div>
  );
};
