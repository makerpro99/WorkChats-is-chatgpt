import React from 'react';
import {
  Shield,
  Users,
  UserX,
  Key,
  Mail,
  FileText,
  MessageSquare,
  Building,
  Folder,
  Settings,
  Crown,
  UserPlus,
} from 'lucide-react';

export type AdminTab =
  | 'OVERVIEW'
  | 'USERS'
  | 'FRIENDS'
  | 'BANS'
  | 'ROLES'
  | 'INVITATIONS'
  | 'LOGS'
  | 'CHAT'
  | 'WORKSPACES'
  | 'FILES'
  | 'SETTINGS'
  | 'MANAGE_ADMINS';

interface AdminTabBarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  usersCount?: number;
  bansCount?: number;
  logsCount?: number;
  pendingFriendRequestsCount?: number;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
  activeTab,
  onSelectTab,
  usersCount = 6,
  bansCount = 2,
  logsCount = 31,
  pendingFriendRequestsCount,
}) => {
  const tabs: Array<{
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    isSpecial?: boolean;
  }> = [
    { id: 'OVERVIEW', label: 'Aperçu', icon: Shield },
    { id: 'USERS', label: 'Users', icon: Users, badge: usersCount },
    { id: 'FRIENDS', label: 'Amis du Propriétaire', icon: UserPlus, badge: pendingFriendRequestsCount },
    { id: 'BANS', label: 'Bans', icon: UserX, badge: bansCount },
    { id: 'ROLES', label: 'Roles & Permissions', icon: Key },
    { id: 'INVITATIONS', label: 'Invitations', icon: Mail },
    { id: 'LOGS', label: 'Admin Logs', icon: FileText, badge: logsCount },
    { id: 'CHAT', label: 'Chat Moderation', icon: MessageSquare },
    { id: 'WORKSPACES', label: 'Workspaces', icon: Building },
    { id: 'FILES', label: 'Files', icon: Folder },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
    { id: 'MANAGE_ADMINS', label: 'Manage Admins', icon: Crown, isSpecial: true },
  ];

  return (
    <div className="bg-white rounded-2xl p-2 border border-zinc-200/80 shadow-xs overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-blue-600 border-2 border-blue-600 bg-blue-50/30 shadow-2xs'
                  : tab.isSpecial
                  ? 'text-blue-600 hover:bg-blue-50/50 border border-blue-200'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-blue-600' : tab.isSpecial ? 'text-blue-600' : 'text-zinc-500'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-700'
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
