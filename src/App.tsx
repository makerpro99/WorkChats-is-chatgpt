import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  Bell,
  Search,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  Crown,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  User,
  Team,
  Task,
  Announcement,
  WorkProject,
  AppNotification,
} from './types';
import { api, setToken } from './api';
import { Sidebar, SectionType } from './components/Sidebar';
import { LandingPage } from './views/LandingPage';
import { AuthModal } from './views/AuthModal';
import { AccessGateModal } from './components/AccessGateModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { Logo } from './components/Logo';
import { PublicAnnouncementBanner } from './components/PublicAnnouncementBanner';
import { signInWithGoogle } from './services/googleAuth';

// Views
import { HomeView } from './views/HomeView';
import { UsersView } from './views/UsersView';
import { ChatView } from './views/ChatView';
import { GamesView } from './views/GamesView';
import { TeamsView } from './views/TeamsView';
import { WorkView } from './views/WorkView';
import { TasksView } from './views/TasksView';
import { FriendsView } from './views/FriendsView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { CreatorPanelView } from './views/CreatorPanelView';
import { ModeratorPanelView } from './views/ModeratorPanelView';
import { AdminPanelView } from './views/AdminPanelView';
import { OwnerPanelView } from './views/OwnerPanelView';
import { CallProvider } from './context/CallContext';
import { GlobalCallModal } from './components/call/GlobalCallModal';
import { useLanguage } from './context/LanguageContext';
import { LanguageButton } from './components/LanguageButton';

export default function App() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Authentication UI Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');

  const getSectionFromPath = (path: string): SectionType => {
    const clean = path.toLowerCase().replace(/^\/+/, '').split('/')[0] || '';
    if (clean === 'owner') return 'OWNER_PANEL';
    if (clean === 'creator') return 'CREATOR_PANEL';
    if (clean === 'admin') return 'ADMIN_PANEL';
    if (clean === 'moderator') return 'MODERATOR_PANEL';
    if (clean === 'users') return 'USERS';
    if (clean === 'chat') return 'CHAT';
    if (clean === 'games' || clean === 'game') return 'GAMES';
    if (clean === 'teams') return 'TEAMS';
    if (clean === 'friends') return 'FRIENDS';
    if (clean === 'tasks') return 'TASKS';
    if (clean === 'announcements') return 'ANNOUNCEMENTS';
    if (clean === 'work') return 'WORK';
    if (clean === 'settings') return 'SETTINGS';
    if (clean === 'notifications') return 'NOTIFICATIONS';
    return 'HOME';
  };

  const getPathFromSection = (section: SectionType): string => {
    switch (section) {
      case 'OWNER_PANEL': return '/owner';
      case 'CREATOR_PANEL': return '/creator';
      case 'ADMIN_PANEL': return '/admin';
      case 'MODERATOR_PANEL': return '/moderator';
      case 'USERS': return '/users';
      case 'CHAT': return '/chat';
      case 'GAMES': return '/games';
      case 'TEAMS': return '/teams';
      case 'FRIENDS': return '/friends';
      case 'TASKS': return '/tasks';
      case 'ANNOUNCEMENTS': return '/announcements';
      case 'WORK': return '/work';
      case 'SETTINGS': return '/settings';
      case 'NOTIFICATIONS': return '/notifications';
      default: return '/';
    }
  };

  // Navigation State
  const [currentSection, setCurrentSection] = useState<SectionType>(() => {
    return getSectionFromPath(window.location.pathname);
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync section with browser history / popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentSection(getSectionFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Direct partner selected for Chat
  const [chatInitialPartner, setChatInitialPartner] = useState<User | null>(null);

  // Security Verification Gates
  const [activeGateTarget, setActiveGateTarget] = useState<'MODERATOR' | 'ADMIN' | 'OWNER' | null>(null);
  const [unlockedGates, setUnlockedGates] = useState<{
    moderator: boolean;
    admin: boolean;
    owner: boolean;
  }>({
    moderator: false,
    admin: false,
    owner: false,
  });

  // Global Data
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workProjects, setWorkProjects] = useState<WorkProject[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activePublicAnnouncement, setActivePublicAnnouncement] = useState<Announcement | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Handler when an announcement is published
  const handleAnnouncementPublished = (newAnnouncement: Announcement) => {
    setAnnouncements((prev) => {
      const filtered = prev.filter((a) => a.id !== newAnnouncement.id);
      return [newAnnouncement, ...filtered];
    });
    setActivePublicAnnouncement(newAnnouncement);
    try {
      sessionStorage.setItem('last_seen_announcement_id', newAnnouncement.id);
    } catch {}
  };

  // Fetch initial public announcements on launch
  useEffect(() => {
    api.getAnnouncements().then((res) => {
      if (res && res.announcements && res.announcements.length > 0) {
        setAnnouncements(res.announcements);
        const latest = res.announcements[0];
        try {
          const lastSeen = sessionStorage.getItem('last_seen_announcement_id');
          if (latest && lastSeen !== latest.id) {
            sessionStorage.setItem('last_seen_announcement_id', latest.id);
            setActivePublicAnnouncement(latest);
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // Reporting Modal
  const [reportingModalData, setReportingModalData] = useState<{
    targetType: 'MESSAGE' | 'USER';
    id: string;
    name: string;
    content?: string;
  } | null>(null);

  // Global Quick Search
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // 1. Initial Authentication Check
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await api.getCurrentUser();
        if (res && res.user) {
          const user = res.user;
          let localUnlocked: string[] = [];
          try {
            const raw = localStorage.getItem(`unlocked_panels_${user.id}`);
            if (raw) localUnlocked = JSON.parse(raw);
          } catch {}

          const merged = Array.from(new Set([...(user.unlockedPanels || []), ...localUnlocked]));
          user.unlockedPanels = merged;
          setCurrentUser(user);

          if (user.role === 'OWNER') {
            setUnlockedGates({ moderator: true, admin: true, owner: true });
          } else {
            setUnlockedGates({
              moderator: merged.includes('MODERATOR'),
              admin: merged.includes('ADMIN'),
              owner: merged.includes('OWNER'),
            });
          }
        }
      } catch (err) {
        // Not logged in yet
      } finally {
        setIsCheckingAuth(false);
      }
    };
    verifyAuth();
  }, []);

  // Update unlocked gates when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'OWNER') {
        setUnlockedGates({ moderator: true, admin: true, owner: true });
      } else {
        let localUnlocked: string[] = [];
        try {
          const raw = localStorage.getItem(`unlocked_panels_${currentUser.id}`);
          if (raw) localUnlocked = JSON.parse(raw);
        } catch {}
        const merged = Array.from(new Set([...(currentUser.unlockedPanels || []), ...localUnlocked]));
        setUnlockedGates({
          moderator: merged.includes('MODERATOR'),
          admin: merged.includes('ADMIN'),
          owner: merged.includes('OWNER'),
        });
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  // 2. Fetch User Workspace Data
  const loadWorkspaceData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [
        friendsRes,
        teamsRes,
        tasksRes,
        workRes,
        announcementsRes,
        notificationsRes,
      ] = await Promise.allSettled([
        api.getFriends(),
        api.getTeams(),
        api.getTasks(),
        api.getWorkProjects(),
        api.getAnnouncements(),
        api.getNotifications(),
      ]);

      if (friendsRes.status === 'fulfilled') {
        setFriends(friendsRes.value.friends || []);
        setIncomingRequests(friendsRes.value.incomingRequests || []);
        setSentRequests(friendsRes.value.sentRequests || []);
      }
      if (teamsRes.status === 'fulfilled') {
        setTeams(teamsRes.value.teams || []);
      }
      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value.tasks || []);
      }
      if (workRes.status === 'fulfilled') {
        setWorkProjects(workRes.value.workProjects || []);
      }
      if (announcementsRes.status === 'fulfilled') {
        const fetchedAncs = announcementsRes.value.announcements || [];
        setAnnouncements(fetchedAncs);
        if (fetchedAncs.length > 0) {
          const latest = fetchedAncs[0];
          try {
            const lastSeen = sessionStorage.getItem('last_seen_announcement_id');
            if (latest && lastSeen !== latest.id) {
              sessionStorage.setItem('last_seen_announcement_id', latest.id);
              setActivePublicAnnouncement(latest);
            }
          } catch {}
        }
      }
      if (notificationsRes.status === 'fulfilled') {
        setNotifications(notificationsRes.value.notifications || []);
      }
    } catch (err) {
      console.error('Error synchronizing workspace data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadWorkspaceData();
      const interval = setInterval(loadWorkspaceData, 12000);
      return () => clearInterval(interval);
    }
  }, [currentUser, loadWorkspaceData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setCurrentSection('HOME');
      setUnlockedGates({ moderator: false, admin: false, owner: false });
    }
  };

  // Check if a panel is accessible without entering code
  const isGateUnlocked = (target: 'MODERATOR' | 'ADMIN' | 'OWNER'): boolean => {
    if (!currentUser) return false;
    // 1. If user is OWNER, they can access Owner Panel, Moderator Panel, and Admin Panel without code!
    if (currentUser.role === 'OWNER') return true;

    // 2. If user already entered the code for this panel previously
    if (currentUser.unlockedPanels && currentUser.unlockedPanels.includes(target)) {
      return true;
    }

    if (target === 'MODERATOR' && unlockedGates.moderator) return true;
    if (target === 'ADMIN' && unlockedGates.admin) return true;
    if (target === 'OWNER' && unlockedGates.owner) return true;

    try {
      const raw = localStorage.getItem(`unlocked_panels_${currentUser.id}`);
      if (raw) {
        const list: string[] = JSON.parse(raw);
        if (list.includes(target)) return true;
      }
    } catch {}

    return false;
  };

  // Navigation Handler with URL history synchronization and component-level authorization enforcement
  const handleNavigateSection = (section: SectionType) => {
    setCurrentSection(section);
    const newPath = getPathFromSection(section);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  // Open Chat from anywhere with a specific colleague
  const handleDirectChat = (partner: User) => {
    setChatInitialPartner(partner);
    setCurrentSection('CHAT');
  };

  // Gate verification success callback
  const handleGateVerified = () => {
    if (!currentUser || !activeGateTarget) return;

    const target = activeGateTarget;

    setUnlockedGates((prev) => ({
      ...prev,
      moderator: prev.moderator || target === 'MODERATOR' || target === 'ADMIN' || target === 'OWNER',
      admin: prev.admin || target === 'ADMIN' || target === 'OWNER',
      owner: prev.owner || target === 'OWNER',
    }));

    const currentPanels = new Set<string>(currentUser.unlockedPanels || []);
    currentPanels.add(target);
    if (target === 'OWNER') {
      currentPanels.add('ADMIN');
      currentPanels.add('MODERATOR');
    } else if (target === 'ADMIN') {
      currentPanels.add('MODERATOR');
    }
    const updatedList = Array.from(currentPanels);

    try {
      localStorage.setItem(`unlocked_panels_${currentUser.id}`, JSON.stringify(updatedList));
    } catch {}

    setCurrentUser({
      ...currentUser,
      unlockedPanels: updatedList,
    });

    if (target === 'MODERATOR') {
      setCurrentSection('MODERATOR_PANEL');
    } else if (target === 'ADMIN') {
      setCurrentSection('ADMIN_PANEL');
    } else if (target === 'OWNER') {
      setCurrentSection('OWNER_PANEL');
    }
    setActiveGateTarget(null);
  };

  // Global Quick Search Results
  const searchResults = (() => {
    if (!globalSearchTerm.trim()) return [];
    const q = globalSearchTerm.toLowerCase();
    const results: Array<{ type: string; title: string; subtitle: string; action: () => void }> = [];

    // Search tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
        results.push({
          type: 'Task',
          title: t.title,
          subtitle: `Priority: ${t.priority} • Status: ${t.status}`,
          action: () => {
            setCurrentSection('TASKS');
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    // Search work projects
    workProjects.forEach((w) => {
      const name = w.title || w.name;
      if (name.toLowerCase().includes(q) || (w.description && w.description.toLowerCase().includes(q))) {
        results.push({
          type: 'WORK Project',
          title: name,
          subtitle: `Category: ${w.category} • Progress: ${w.progress}%`,
          action: () => {
            setCurrentSection('WORK');
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    // Search teams
    teams.forEach((tm) => {
      if (tm.name.toLowerCase().includes(q) || (tm.description && tm.description.toLowerCase().includes(q))) {
        results.push({
          type: 'Team',
          title: tm.name,
          subtitle: `${tm.memberCount || tm.members?.length || 0} members`,
          action: () => {
            setCurrentSection('TEAMS');
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    // Search friends
    friends.forEach((f) => {
      if (f.displayName.toLowerCase().includes(q) || f.username.toLowerCase().includes(q)) {
        results.push({
          type: 'Colleague',
          title: f.displayName,
          subtitle: `@${f.username} • ${f.status}`,
          action: () => {
            handleDirectChat(f);
            setGlobalSearchOpen(false);
          },
        });
      }
    });

    return results;
  })();

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
        <div className="text-sm font-bold text-zinc-900 tracking-tight">WorkChat</div>
        <p className="text-xs text-zinc-400 mt-1">Authenticating active session...</p>
      </div>
    );
  }

  // Not logged in: Show Public Landing Page
  if (!currentUser) {
    return (
      <>
        {activePublicAnnouncement && (
          <div className="sticky top-0 z-50">
            <PublicAnnouncementBanner
              announcement={activePublicAnnouncement}
              durationSeconds={5}
              onClose={() => setActivePublicAnnouncement(null)}
              onViewAll={() => {
                setAuthMode('LOGIN');
                setShowAuthModal(true);
              }}
            />
          </div>
        )}
        <LandingPage
          onOpenLogin={() => {
            setAuthMode('LOGIN');
            setShowAuthModal(true);
          }}
          onOpenRegister={() => {
            setAuthMode('REGISTER');
            setShowAuthModal(true);
          }}
          onQuickFreeAccount={async () => {
            try {
              const res = await api.quickRegister();
              if (res && res.token && res.user) {
                setToken(res.token);
                setCurrentUser(res.user);
              }
            } catch (err: any) {
              alert(err.message || 'Impossible de créer un compte gratuit instantané.');
            }
          }}
          onGoogleSignIn={async () => {
            try {
              const { firebaseUser } = await signInWithGoogle();
              const res = await api.googleLogin({
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoUrl: firebaseUser.photoURL || '',
                googleId: firebaseUser.uid,
              });
              if (res && res.token && res.user) {
                setToken(res.token);
                setCurrentUser(res.user);
              }
            } catch (err: any) {
              console.error('Google sign-in error:', err);
            }
          }}
        />
        {showAuthModal && (
          <AuthModal
            initialMode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setShowAuthModal(false);
            }}
          />
        )}
      </>
    );
  }

  // Banned User Banner & Screen
  if (currentUser.isBanned || currentUser.banned || currentUser.status === 'BANNED') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-950 text-red-400 flex items-center justify-center mb-4 border border-red-800">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Suspended</h1>
        <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
          Your WorkChat account (@{currentUser.username}) has been restricted due to a violation of community standards.
          Please contact our security & compliance desk to file an appeal.
        </p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign Out of Account
        </button>
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const isKids = currentUser.experience === 'KIDS';
  const isSelect = currentUser.experience === 'SELECT';

  // Dynamic theme styling per requirement:
  // "if you were at workchat kids the website will be blue and if you were in workchat select the website will be black and if you were in original the website will be at his original coulours and panels…"
  const appContainerThemeClass = isKids
    ? 'min-h-screen bg-sky-100/90 text-blue-950 flex flex-col font-sans'
    : isSelect
    ? 'min-h-screen bg-black text-zinc-100 flex flex-col font-sans'
    : 'min-h-screen bg-zinc-50/60 text-zinc-900 flex flex-col font-sans';

  const headerThemeClass = isKids
    ? 'lg:pl-64 sticky top-0 z-30 bg-sky-50/95 backdrop-blur-md border-b border-sky-200 text-blue-950'
    : isSelect
    ? 'lg:pl-64 sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-white'
    : 'lg:pl-64 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 text-zinc-900';

  return (
    <CallProvider currentUser={currentUser}>
      <div className={appContainerThemeClass}>
      {/* 0. Top Public Announcement Banner across all sections (5s auto-dismiss) */}
      {activePublicAnnouncement && (
        <div className="lg:pl-64 sticky top-0 z-40">
          <PublicAnnouncementBanner
            announcement={activePublicAnnouncement}
            durationSeconds={5}
            onClose={() => setActivePublicAnnouncement(null)}
            onViewAll={() => {
              setActivePublicAnnouncement(null);
              setCurrentSection('ANNOUNCEMENTS');
            }}
          />
        </div>
      )}

      {/* 1. App Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={handleNavigateSection}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadChatCount={0}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Top Header Bar (Desktop & Mobile) */}
      <header className={headerThemeClass}>
        <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Mobile hamburger & Section breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              id="btn-open-sidebar-mobile"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">
                {t('header.workspace', 'Workspace')}
              </span>
              <span className="text-zinc-300 hidden sm:inline">/</span>
              <span className="text-sm font-extrabold capitalize">
                {currentSection.replace('_PANEL', ' Console').toLowerCase()}
              </span>
            </div>
          </div>

          {/* Quick Search, Gmail, Language Switcher & Notification Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-500 rounded-xl text-xs transition-colors border border-transparent hover:border-zinc-200"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t('header.search_placeholder', 'Search workspace...')}</span>
              <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Header Language Selector Button (Supports 40+ world languages + Moroccan Darija 🇲🇦) */}
            <LanguageButton variant="header" />

            {/* Notifications Button */}
            <button
              id="btn-header-notifications"
              onClick={() => setCurrentSection('NOTIFICATIONS')}
              className="relative p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors"
              title={t('header.notifications', 'Notifications')}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
              )}
            </button>

            {/* User Avatar & Status Pill */}
            <button
              onClick={() => setCurrentSection('SETTINGS')}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-lg object-cover border border-zinc-200"
                referrerPolicy="no-referrer"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold leading-tight">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] opacity-70 leading-tight flex items-center gap-1">
                  <span>@{currentUser.username}</span>
                  <span className="text-teal-600 font-semibold">• {currentUser.role}</span>
                  <span
                    className={`font-bold text-[9px] px-1.5 py-0.2 rounded ${
                      currentUser.experience === 'KIDS'
                        ? 'bg-blue-600 text-white'
                        : currentUser.experience === 'SELECT'
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : currentUser.experience === 'RESTRICTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentUser.experience === 'KIDS'
                      ? 'Kids 5-9'
                      : currentUser.experience === 'SELECT'
                      ? 'Select 10-16'
                      : currentUser.experience === 'RESTRICTED'
                      ? 'Restricted 17-19'
                      : 'Original 20+'}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Application Content Area */}
      <main className="lg:pl-64 flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {currentSection === 'HOME' && (
          <HomeView
            currentUser={currentUser}
            onNavigate={handleNavigateSection}
            tasks={tasks}
            announcements={announcements}
            workProjects={workProjects}
            onUserUpdated={(u) => setCurrentUser(u)}
          />
        )}

        {currentSection === 'GAMES' && (
          <GamesView currentUser={currentUser} friends={friends} />
        )}

        {currentSection === 'CHAT' && (
          <ChatView
            currentUser={currentUser}
            friends={friends}
            initialPartner={chatInitialPartner}
            onOpenReportModal={(targetType, id, name, content) =>
              setReportingModalData({ targetType, id, name, content })
            }
          />
        )}

        {currentSection === 'TEAMS' && (
          <TeamsView
            teams={teams}
            currentUser={currentUser}
            onRefreshTeams={loadWorkspaceData}
          />
        )}

        {currentSection === 'WORK' && (
          <WorkView
            workProjects={workProjects}
            currentUser={currentUser}
            onRefresh={loadWorkspaceData}
          />
        )}

        {currentSection === 'TASKS' && (
          <TasksView
            tasks={tasks}
            currentUser={currentUser}
            onRefresh={loadWorkspaceData}
          />
        )}

        {currentSection === 'FRIENDS' && (
          <FriendsView
            friends={friends}
            incomingRequests={incomingRequests}
            sentRequests={sentRequests}
            onRefresh={loadWorkspaceData}
            onOpenChat={handleDirectChat}
          />
        )}

        {currentSection === 'ANNOUNCEMENTS' && (
          <AnnouncementsView
            announcements={announcements}
            currentUser={currentUser}
            onRefresh={loadWorkspaceData}
            onAnnouncementPublished={handleAnnouncementPublished}
          />
        )}

        {currentSection === 'NOTIFICATIONS' && (
          <NotificationsView
            notifications={notifications}
            onRefresh={loadWorkspaceData}
          />
        )}

        {currentSection === 'SETTINGS' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
          />
        )}

        {currentSection === 'USERS' && (
          <UsersView currentUser={currentUser} />
        )}

        {currentSection === 'CREATOR_PANEL' && (
          <CreatorPanelView
            currentUser={currentUser}
            onGoHome={() => handleNavigateSection('HOME')}
            onGoBack={() => handleNavigateSection('HOME')}
          />
        )}

        {currentSection === 'MODERATOR_PANEL' && <ModeratorPanelView currentUser={currentUser} />}

        {currentSection === 'ADMIN_PANEL' && <AdminPanelView currentUser={currentUser} />}

        {currentSection === 'OWNER_PANEL' && (
          <OwnerPanelView
            currentUser={currentUser}
            onAnnouncementPublished={handleAnnouncementPublished}
            onGoHome={() => handleNavigateSection('HOME')}
            onGoBack={() => handleNavigateSection('HOME')}
          />
        )}
      </main>

      {/* 4. Access Verification Gate Modal (Security Enforcement) */}
      {activeGateTarget && (
        <AccessGateModal
          targetRole={activeGateTarget}
          onVerified={handleGateVerified}
          onCancel={() => setActiveGateTarget(null)}
        />
      )}

      {/* 5. Incident Reporting Modal */}
      {reportingModalData && (
        <ReportIncidentModal
          targetType={reportingModalData.targetType}
          targetId={reportingModalData.id}
          targetName={reportingModalData.name}
          targetContent={reportingModalData.content}
          onClose={() => setReportingModalData(null)}
          onSuccess={() => {
            loadWorkspaceData();
          }}
        />
      )}

      {/* 6. Global Quick Search Modal */}
      {globalSearchOpen && (
        <div
          onClick={() => setGlobalSearchOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="p-3.5 border-b border-zinc-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                placeholder="Search tasks, deliverables, teams, colleagues..."
                className="w-full text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden"
              />
              <button
                onClick={() => setGlobalSearchOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  {globalSearchTerm.trim()
                    ? 'No matching workspace items found.'
                    : 'Type a keyword to search across tasks, deliverables, and team channels.'}
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-50 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 uppercase">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-zinc-900">{item.title}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{item.subtitle}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Real-Time Online Audio & Video Call Modal */}
      <GlobalCallModal />
    </div>
  </CallProvider>
  );
}
