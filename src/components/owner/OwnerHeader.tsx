import React from 'react';
import {
  Crown,
  LayoutDashboard,
  Users,
  Link2,
  Settings,
  Radio,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export type OwnerTab = 'OVERVIEW' | 'MEMBERS' | 'FRIENDS' | 'LINKED_ACCOUNTS' | 'SETTINGS' | 'BROADCAST' | 'SECURITY_CODES';

interface OwnerHeaderProps {
  activeTab: OwnerTab;
  onTabChange: (tab: OwnerTab) => void;
  linkedAccountsCount: number;
  pendingFriendRequestsCount?: number;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  activeTab,
  onTabChange,
  linkedAccountsCount,
  pendingFriendRequestsCount = 0,
}) => {
  const tabs = [
    {
      id: 'OVERVIEW' as OwnerTab,
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
    },
    {
      id: 'MEMBERS' as OwnerTab,
      label: 'Gestion Membres',
      icon: Users,
    },
    {
      id: 'FRIENDS' as OwnerTab,
      label: 'Amis du Propriétaire',
      icon: UserPlus,
      badge: pendingFriendRequestsCount > 0 ? pendingFriendRequestsCount : undefined,
    },
    {
      id: 'LINKED_ACCOUNTS' as OwnerTab,
      label: 'Comptes Liés',
      icon: Link2,
      badge: linkedAccountsCount > 0 ? linkedAccountsCount : undefined,
    },
    {
      id: 'SECURITY_CODES' as OwnerTab,
      label: 'Codes de Sécurité',
      icon: ShieldCheck,
    },
    {
      id: 'SETTINGS' as OwnerTab,
      label: 'Paramètres Système',
      icon: Settings,
    },
    {
      id: 'BROADCAST' as OwnerTab,
      label: 'Diffusion Annonce',
      icon: Radio,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Panel Propriétaire</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ROOT
              </span>
            </div>
            <p className="text-sm text-zinc-400 font-medium">
              Contrôle absolu sur l'instance et la communauté
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MODE PROPRIÉTAIRE ACTIF</span>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100/90 rounded-2xl border border-zinc-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-300 text-zinc-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
