import React from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminChatModerationTab: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Modération du Chat en Direct
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Surveillance et gestion des discussions publiques d'équipe
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                Filtre anti-spam et contenu inapproprié
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Surveillance automatique des messages et signalements instantanés
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Actif</span>
          </span>
        </div>

        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs text-zinc-600 leading-relaxed">
          Toutes les suppressions de messages par un modérateur ou un administrateur sont automatiquement consignées dans l'audit log et conservées pour traçabilité immuable.
        </div>
      </div>
    </div>
  );
};
