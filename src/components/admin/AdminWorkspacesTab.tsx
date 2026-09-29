import React from 'react';
import { Building, CheckCircle2, FolderGit2, Users } from 'lucide-react';

export const AdminWorkspacesTab: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Supervision des Workspaces
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Gestion de la structure des espaces de travail et des projets associés
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                Workspace Principal : WorkChat Headquarters
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Sections publiques, projets actifs et discussions
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Opérationnel</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-center">
            <div className="text-[11px] text-zinc-400 font-bold uppercase">Projets Actifs</div>
            <div className="text-lg font-extrabold text-zinc-900 mt-0.5">12</div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-center">
            <div className="text-[11px] text-zinc-400 font-bold uppercase">Canaux Publics</div>
            <div className="text-lg font-extrabold text-zinc-900 mt-0.5">8</div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-center">
            <div className="text-[11px] text-zinc-400 font-bold uppercase">Réseau Décentralisé</div>
            <div className="text-lg font-extrabold text-emerald-600 mt-0.5">Actif</div>
          </div>
        </div>
      </div>
    </div>
  );
};
