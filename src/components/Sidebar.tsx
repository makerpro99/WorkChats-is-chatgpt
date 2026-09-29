import React from 'react';
import {
  Home,
  MessageSquare,
  Users2,
  UserPlus2,
  CheckSquare2,
  Megaphone,
  Briefcase,
  Bell,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Crown,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageButton } from './LanguageButton';

export type SectionType =
  | 'HOME'
  | 'USERS'
  | 'CHAT'
  | 'TEAMS'
  | 'FRIENDS'
  | 'TASKS'
  | 'ANNOUNCEMENTS'
  | 'WORK'
  | 'NOTIFICATIONS'
  | 'SETTINGS'
  | 'MODERATOR_PANEL'
  | 'ADMIN_PANEL'
  | 'CREATOR_PANEL'
  | 'OWNER_PANEL';

interface SidebarProps {
  currentSection: SectionType;
  onSelectSection: (section: SectionType) => void;
  currentUser: User;
  onLogout: () => void;
  unreadNotificationsCount: number;
  unreadChatCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  currentUser,
  onLogout,
  unreadNotificationsCount,
  unreadChatCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const isKids = currentUser.experience === 'KIDS';
  const isSelect = currentUser.experience === 'SELECT';
  const isRestricted = currentUser.experience === 'RESTRICTED';

  const mainNavItems: Array<{
    id: SectionType;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    { id: 'HOME', label: isKids ? '🎈 Playground Home' : t('nav.home', 'Home'), icon: Home },
    { id: 'USERS', label: isKids ? '👥 Community Users' : 'Users', icon: Users2 },
    { id: 'CHAT', label: isKids ? '💬 Safe Chat' : t('nav.chat', 'Chat'), icon: MessageSquare, badge: unreadChatCount },
    { id: 'TEAMS', label: isKids ? '👥 Safe Teams' : t('nav.teams', 'Teams'), icon: Users2 },
    { id: 'FRIENDS', label: isKids ? '⭐ Friends' : t('nav.friends', 'Friends'), icon: UserPlus2 },
    { id: 'TASKS', label: isKids ? '📝 My Tasks' : t('nav.tasks', 'Tasks'), icon: CheckSquare2 },
    { id: 'ANNOUNCEMENTS', label: isKids ? '📢 Safe News' : t('nav.announcements', 'Announcements'), icon: Megaphone },
    { id: 'WORK', label: isKids ? '📚 Fun Study & Work' : t('nav.work', 'WORK'), icon: Briefcase },
    { id: 'NOTIFICATIONS', label: t('nav.notifications', 'Notifications'), icon: Bell, badge: unreadNotificationsCount },
    { id: 'SETTINGS', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  const handleSelect = (sec: SectionType) => {
    onSelectSection(sec);
    onCloseMobile();
  };

  const sidebarThemeClass = isKids
    ? 'bg-sky-50 border-sky-200 text-blue-950'
    : isSelect
    ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
    : 'bg-white border-zinc-200 text-zinc-900';

  const brandBorderClass = isKids
    ? 'border-sky-200 bg-sky-100/50'
    : isSelect
    ? 'border-zinc-800 bg-zinc-900/50'
    : 'border-zinc-100';

  const navItemClass = (isActive: boolean) => {
    if (isActive) {
      if (isKids) return 'bg-blue-600 text-white shadow-xs';
      if (isSelect) return 'bg-zinc-800 text-white shadow-xs ring-1 ring-zinc-700';
      return 'bg-zinc-900 text-white shadow-xs';
    }
    if (isKids) return 'text-blue-900 hover:text-blue-950 hover:bg-sky-100';
    if (isSelect) return 'text-zinc-400 hover:text-white hover:bg-zinc-900';
    return 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100';
  };

  const footerClass = isKids
    ? 'border-t border-sky-200 bg-sky-100/60'
    : isSelect
    ? 'border-t border-zinc-800 bg-zinc-900/60'
    : 'border-t border-zinc-100 bg-zinc-50/50';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 ${sidebarThemeClass} flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 px-5 flex items-center justify-between border-b ${brandBorderClass}`}>
          <Logo size="md" />
          <button
            id="btn-close-sidebar-mobile"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
            {t('nav.main_workspace', 'Main Workspace')}
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id.toLowerCase()}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${navItemClass(
                  isActive
                )}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* Protected Role-Based Panels Section */}
          <div className="pt-5 mt-4 border-t border-zinc-100 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>{t('nav.management', 'Protected Panels')}</span>
              <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                Role-Based
              </span>
            </div>

            {/* Creator Panel */}
            <button
              id="nav-item-creator-panel"
              onClick={() => handleSelect('CREATOR_PANEL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentSection === 'CREATOR_PANEL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-zinc-700 hover:text-purple-800 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles
                  className={`w-4 h-4 ${
                    currentSection === 'CREATOR_PANEL' ? 'text-white' : 'text-purple-600'
                  }`}
                />
                <span>Creator Panel</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">
                Creator
              </span>
            </button>

            {/* Moderator Panel */}
            <button
              id="nav-item-moderator-panel"
              onClick={() => handleSelect('MODERATOR_PANEL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentSection === 'MODERATOR_PANEL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-700 hover:text-indigo-800 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    currentSection === 'MODERATOR_PANEL' ? 'text-white' : 'text-indigo-600'
                  }`}
                />
                <span>{t('nav.moderator_panel', 'Moderator Panel')}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                Mod
              </span>
            </button>

            {/* Admin Panel */}
            <button
              id="nav-item-admin-panel"
              onClick={() => handleSelect('ADMIN_PANEL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentSection === 'ADMIN_PANEL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-700 hover:text-amber-800 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert
                  className={`w-4 h-4 ${
                    currentSection === 'ADMIN_PANEL' ? 'text-white' : 'text-amber-600'
                  }`}
                />
                <span>{t('nav.admin_panel', 'Admin Panel')}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                Admin
              </span>
            </button>

            {/* Owner Panel */}
            <button
              id="nav-item-owner-panel"
              onClick={() => handleSelect('OWNER_PANEL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentSection === 'OWNER_PANEL'
                  ? 'bg-zinc-950 text-white shadow-xs ring-1 ring-teal-500'
                  : 'text-zinc-700 hover:text-teal-900 hover:bg-teal-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Crown
                  className={`w-4 h-4 ${
                    currentSection === 'OWNER_PANEL' ? 'text-teal-400' : 'text-teal-600'
                  }`}
                />
                <span>{t('nav.owner_panel', 'Owner Panel')}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-600 text-white uppercase">
                Root
              </span>
            </button>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className={`p-3 ${footerClass} space-y-2`}>
          {/* Language Switcher in Sidebar */}
          <LanguageButton variant="sidebar" />

          <button
            type="button"
            onClick={() => {
              onSelectSection('SETTINGS');
              onCloseMobile();
            }}
            title="Click to edit profile & avatar photo"
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-lg object-cover border border-zinc-200 group-hover:opacity-90 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-zinc-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[8px]">
                ✎
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-900 truncate group-hover:text-teal-700 transition-colors flex items-center justify-between">
                <span>{currentUser.displayName}</span>
                <span className="text-[10px] text-zinc-400 font-normal opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
              </div>
              <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                <span>@{currentUser.username}</span>
                <span className="text-zinc-300">•</span>
                <span
                  className={`font-semibold uppercase text-[9px] px-1 rounded ${
                    currentUser.role === 'OWNER'
                      ? 'bg-teal-100 text-teal-800'
                      : currentUser.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800'
                      : currentUser.role === 'MODERATOR'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {currentUser.role}
                </span>
                <span
                  className={`font-bold text-[9px] px-1 rounded ${
                    isKids
                      ? 'bg-pink-100 text-pink-800'
                      : isSelect
                      ? 'bg-purple-100 text-purple-800'
                      : isRestricted
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isKids ? 'Kids (5-9)' : isSelect ? 'Select' : isRestricted ? 'Restricted' : '20+'}
                </span>
              </div>
            </div>
          </button>

          <button
            id="btn-logout-sidebar"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.logout', 'Sign Out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
