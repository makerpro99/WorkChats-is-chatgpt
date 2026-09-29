import React from 'react';
import { Folder, HardDrive, ShieldCheck, FileCheck } from 'lucide-react';

export const AdminFilesTab: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Gestion des Fichiers et Stockage
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Audit des pièces jointes téléversées dans les tâches et canaux de discussion
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                Espace de Stockage Actif
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Quotas illimités pour le workspace actuel
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            Sécurisé
          </span>
        </div>

        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-700">Volume consommé : ~14.8 MB / Illimité</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Stockage Chiffré AES-256</span>
        </div>
      </div>
    </div>
  );
};
