import React from 'react';
import {
  Users,
  ShieldAlert,
  Activity,
  MessageSquare,
  ShieldPlus,
  Radio,
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { OwnerTab } from './OwnerHeader';

interface OwnerOverviewTabProps {
  metrics: {
    totalMembers: number;
    adminCount: number;
    activeSessions: number;
    messagesCount: number;
    tasksCount: number;
    filesCount: number;
  };
  settings: {
    instanceName: string;
    securityLockdown: boolean;
    allowRegistration: boolean;
    maintenanceMode: boolean;
    enableSecretClaim: boolean;
  };
  onNavigateTab: (tab: OwnerTab) => void;
  onToggleEmergencyLockdown: () => void;
}

export const OwnerOverviewTab: React.FC<OwnerOverviewTabProps> = ({
  metrics,
  settings,
  onNavigateTab,
  onToggleEmergencyLockdown,
}) => {
  const handleExportDatabase = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      instance: settings.instanceName,
      metrics,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workchat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Membres Totaux */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Membres Totaux
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {metrics.totalMembers}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Comptes enregistrés</p>
          </div>
        </div>

        {/* Card 2: Administrateurs */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Administrateurs
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {metrics.adminCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Accès élevé</p>
          </div>
        </div>

        {/* Card 3: Sessions Actives */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Sessions Actives
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <span>{metrics.activeSessions}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            </div>
            <p className="text-xs text-zinc-500 mt-1">En direct</p>
          </div>
        </div>

        {/* Card 4: Messages Envoyés */}
        <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Messages Envoyés
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {metrics.messagesCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Historique global</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Actions Rapides (Left) & État de l'Instance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Actions Rapides Propriétaire */}
        <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-zinc-900">Actions Rapides Propriétaire</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-5">
              Raccourcis vers les opérations critiques de l'instance
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Action 1: Accorder Statut Admin */}
              <button
                onClick={() => onNavigateTab('MEMBERS')}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 transition-all text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <ShieldPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                    Accorder Statut Admin
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Promouvoir un membre fiable
                  </div>
                </div>
              </button>

              {/* Action 2: Diffusion Globale */}
              <button
                onClick={() => onNavigateTab('BROADCAST')}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 transition-all text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
                  <Radio className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                    Diffusion Globale
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Envoyer une annonce YouTube style
                  </div>
                </div>
              </button>

              {/* Action 3: Verrouillage d'Urgence */}
              <button
                onClick={onToggleEmergencyLockdown}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer group ${
                  settings.securityLockdown
                    ? 'border-red-300 bg-red-50/70 hover:bg-red-100/60'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${
                    settings.securityLockdown
                      ? 'bg-red-600 text-white border-red-700'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}
                >
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div
                    className={`text-xs font-bold transition-colors ${
                      settings.securityLockdown ? 'text-red-700' : 'text-zinc-900 group-hover:text-red-600'
                    }`}
                  >
                    {settings.securityLockdown ? 'Désactiver Verrouillage' : "Verrouillage d'Urgence"}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {settings.securityLockdown ? 'Instance actuellement verrouillée' : 'Geler toutes les actions membres'}
                  </div>
                </div>
              </button>

              {/* Action 4: Gestion des Données */}
              <button
                onClick={handleExportDatabase}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 transition-all text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Database className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                    <span>Gestion des Données</span>
                    <Download className="w-3 h-3 text-zinc-400" />
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Sauvegarde & export base
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Privilèges Root niveau 0</span>
            <span className="font-mono">PRN-ZKH-0069</span>
          </div>
        </div>

        {/* Right Card: État de l'Instance */}
        <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-zinc-900">État de l'Instance</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-5">
              Indicateurs de santé et intégrité système en temps réel
            </p>

            <div className="space-y-3.5">
              {/* Row 1: Base de données */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Base de données</div>
                    <div className="text-[11px] text-zinc-500">Moteur JSON Persistant & ACID local</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Connectée</span>
                </div>
              </div>

              {/* Row 2: Mode Maintenance */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      settings.maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Mode Maintenance</div>
                    <div className="text-[11px] text-zinc-500">
                      {settings.maintenanceMode ? 'Accès restreint aux administrateurs' : 'Accès public normal'}
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    settings.maintenanceMode
                      ? 'bg-amber-100 border-amber-200 text-amber-800'
                      : 'bg-emerald-100/70 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {settings.maintenanceMode ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Actif</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Désactivé</span>
                    </>
                  )}
                </div>
              </div>

              {/* Row 3: Inscriptions */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      settings.allowRegistration ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Inscriptions</div>
                    <div className="text-[11px] text-zinc-500">Création de nouveaux comptes utilisateurs</div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    settings.allowRegistration
                      ? 'bg-emerald-100/70 border-emerald-200 text-emerald-800'
                      : 'bg-red-100 border-red-200 text-red-800'
                  }`}
                >
                  {settings.allowRegistration ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Ouvertes</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-red-600" />
                      <span>Fermées</span>
                    </>
                  )}
                </div>
              </div>

              {/* Row 4: Accès Propriétaire */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Accès Propriétaire</div>
                    <div className="text-[11px] text-zinc-500">Gate de sécurité avec code PIN chiffré</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Protégé</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Dernière vérification système</span>
            <span>À l'instant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
