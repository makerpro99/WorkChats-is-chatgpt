import React from 'react';
import { Settings, UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PanelSecurityCodeCard } from '../PanelSecurityCodeCard';

export const AdminSettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Paramètres Généraux & Sécurité
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Configuration de la plateforme, contrôle des accès et politique des comptes
        </p>
      </div>

      {/* Admin Panel Access Code Card */}
      <PanelSecurityCodeCard
        panel="ADMIN"
        title="Code de Sécurité du Panel Admin"
        description="Modifiez le code d'accès requis pour déverrouiller la console d'administration."
      />

      {/* Setting 1: Inscriptions Publiques */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">
              Inscriptions Publiques
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Autoriser de nouveaux visiteurs à créer un compte (statut automatique MEMBER)
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Activé</span>
        </span>
      </div>

      {/* Setting 2: Attribution Automatique des Rôles */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">
              Attribution Automatique des Rôles
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tout nouvel utilisateur enregistré reçoit obligatoirement le rôle MEMBER
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
          Strict Serveur
        </span>
      </div>
    </div>
  );
};
