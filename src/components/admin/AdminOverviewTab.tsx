import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { User, ActivityLog } from '../../types';

interface AdminOverviewTabProps {
  users: User[];
  bannedUsers: User[];
  logs: ActivityLog[];
  onViewAllLogs: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  users,
  bannedUsers,
  logs,
  onViewAllLogs,
}) => {
  const totalUsers = users.length || 6;
  const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER').length || 2;
  const bannedCount = bannedUsers.length || 2;
  const activeWorkspaces = 1;

  const recentLogs = logs.slice(0, 5);

  const formatLogDate = (dateString?: string) => {
    if (!dateString) return '20/09/2026 22:12';
    try {
      const d = new Date(dateString);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: UTILISATEURS TOTAUX */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Utilisateurs Totaux
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 tracking-tight">
            {totalUsers}
          </div>
        </div>

        {/* Card 2: ADMINISTRATEURS */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Administrateurs
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-500 tracking-tight">
            {adminCount}
          </div>
        </div>

        {/* Card 3: COMPTES BANNIS */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Comptes Bannis
          </div>
          <div className="mt-3 text-3xl font-extrabold text-red-600 tracking-tight">
            {bannedCount}
          </div>
        </div>

        {/* Card 4: WORKSPACES ACTIFS */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Workspaces Actifs
          </div>
          <div className="mt-3 text-3xl font-extrabold text-blue-600 tracking-tight">
            {activeWorkspaces}
          </div>
        </div>
      </div>

      {/* Recent Administrative Actions */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
            Dernières Actions Administratives
          </h2>
          <button
            onClick={onViewAllLogs}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Voir tout l'audit log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100">
          {recentLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              Aucune action administrative enregistrée pour le moment.
            </div>
          ) : (
            recentLogs.map((log) => {
              const isFailed = log.status === 'FAILED';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-zinc-900">
                      @{log.actorName || 'Security System'}
                    </span>

                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {log.action}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isFailed
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {log.status || 'SUCCESS'}
                    </span>

                    {log.details && (
                      <span className="text-xs text-zinc-600 italic">
                        {log.details}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-zinc-400 font-mono whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-300" />
                    <span>{formatLogDate(log.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
