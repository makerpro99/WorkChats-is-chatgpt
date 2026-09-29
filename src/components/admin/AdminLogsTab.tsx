import React, { useState } from 'react';
import { Search, Clock, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { ActivityLog } from '../../types';

interface AdminLogsTabProps {
  logs: ActivityLog[];
}

export const AdminLogsTab: React.FC<AdminLogsTabProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      (l.actorName && l.actorName.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.status && l.status.toLowerCase().includes(q))
    );
  });

  const formatLogDate = (dateString?: string) => {
    if (!dateString) return '20 sept., 22:12';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getDate()} ${months[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            Journal d'Audit des Administrateurs
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Traçabilité immuable de toutes les actions de modération et de changement de rôles
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer les actions ou acteurs..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden divide-y divide-zinc-100">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Aucun journal d'audit ne correspond à vos filtres.
          </div>
        ) : (
          filteredLogs.map((log) => {
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

                <div className="text-[11px] text-zinc-400 font-mono whitespace-nowrap flex items-center gap-1.5 self-end sm:self-center">
                  <Clock className="w-3.5 h-3.5 text-zinc-300" />
                  <span>{formatLogDate(log.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
