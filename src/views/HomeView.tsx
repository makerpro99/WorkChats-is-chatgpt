import React, { useState } from 'react';
import {
  MessageSquare,
  Users2,
  CheckSquare2,
  Megaphone,
  Briefcase,
  Bot,
  CreditCard,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Camera,
} from 'lucide-react';
import { User, Task, Announcement, WorkProject } from '../types';
import { SectionType } from '../components/Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { AgeVerificationModal } from '../components/AgeVerificationModal';

interface HomeViewProps {
  currentUser: User;
  onNavigate: (section: SectionType) => void;
  tasks: Task[];
  announcements: Announcement[];
  workProjects: WorkProject[];
  onUserUpdated?: (user: User) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onNavigate,
  tasks,
  announcements,
  workProjects,
  onUserUpdated,
}) => {
  const { t } = useLanguage();
  const [showAgeModal, setShowAgeModal] = useState(false);
  const pendingTasks = tasks.filter((t) => t.status !== 'DONE');
  const latestAnnouncement = announcements[0];

  const experienceLabel =
    currentUser.experience === 'KIDS'
      ? 'WorkChat Kids 🎈 (Thème Bleu)'
      : currentUser.experience === 'SELECT'
      ? 'WorkChat Select ⚡ (Thème Noir)'
      : 'Original WorkChat 20+ (Thème Standard)';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onVerified={(updatedUser) => {
          if (onUserUpdated) onUserUpdated(updatedUser);
        }}
      />

      {/* Age Verification Notice / Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-teal-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900">Vérification de l'Âge (Caméra 3 Poses)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                {experienceLabel}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Caméra 3 angles (Face, Gauche, Droite) avec garantie de suppression immédiate des photos.
            </p>
          </div>
        </div>

        <button
          id="btn-home-age-verification"
          type="button"
          onClick={() => setShowAgeModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Vérifier mon âge (Caméra)</span>
        </button>
      </div>

      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 text-white relative overflow-hidden shadow-lg">
        {/* Decorative blur spots */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-52 h-52 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('home.welcome_back', 'Welcome back,')} {currentUser.displayName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {t('home.hero_title', 'Work together. Stay organized. Get things done.')}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mb-6">
            {t('home.hero_desc', 'Jump back into your team channels, track ongoing tasks, or collaborate on your PC work projects with your teammates.')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-home-open-chat"
              onClick={() => onNavigate('CHAT')}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('home.open_chat', 'Open Direct Chat')}</span>
            </button>
            <button
              id="btn-home-open-work"
              onClick={() => onNavigate('WORK')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Briefcase className="w-4 h-4 text-teal-300" />
              <span>{t('home.browse_work', 'Browse WORK Studio')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          onClick={() => onNavigate('CHAT')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-zinc-900">{t('nav.chat', 'Chat')}</div>
          <div className="text-[11px] text-zinc-400">{t('home.chat_subtitle', 'Direct Messages')}</div>
        </button>

        <button
          onClick={() => onNavigate('TEAMS')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Users2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-zinc-900">{t('nav.teams', 'Teams')}</div>
          <div className="text-[11px] text-zinc-400">{t('home.teams_subtitle', 'Collaborative spaces')}</div>
        </button>

        <button
          onClick={() => onNavigate('TASKS')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <CheckSquare2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-zinc-900">{t('nav.tasks', 'Tasks')}</div>
          <div className="text-[11px] text-zinc-400">{pendingTasks.length} {t('home.tasks_subtitle', 'pending')}</div>
        </button>

        <button
          onClick={() => onNavigate('ANNOUNCEMENTS')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-zinc-900">{t('nav.announcements', 'Announcements')}</div>
          <div className="text-[11px] text-zinc-400">{t('home.announce_subtitle', 'Company broadcast')}</div>
        </button>

        <button
          onClick={() => onNavigate('WORK')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-zinc-900">{t('nav.work', 'WORK')}</div>
          <div className="text-[11px] text-zinc-400">{t('home.work_subtitle', '15 PC Categories')}</div>
        </button>

        <button
          onClick={() => onNavigate('SETTINGS')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-zinc-900">{t('settings.tab_billing', 'Billing')}</div>
          <div className="text-[11px] text-zinc-400">{t('home.billing_subtitle', 'Stripe Checkout')}</div>
        </button>
      </div>

      {/* Main Grid: Active Work & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Projects (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-zinc-700" />
              <h2 className="text-sm font-bold text-zinc-900">{t('home.recent_deliverables', 'Ongoing WORK Deliverables')}</h2>
            </div>
            <button
              onClick={() => onNavigate('WORK')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              <span>{t('home.view_all', 'View All')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {workProjects.slice(0, 3).map((work) => (
              <div
                key={work.id}
                onClick={() => onNavigate('WORK')}
                className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">{work.title || work.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                      {work.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                      {work.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-1">{work.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-700">{work.progress || 0}%</span>
                    <div className="w-20 h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-1">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${work.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {work.files?.length || 0} {t('home.files', 'files')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Priority Announcement & Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-zinc-700" />
              <h2 className="text-sm font-bold text-zinc-900">{t('home.latest_announcement', 'Latest Announcement')}</h2>
            </div>
            <button
              onClick={() => onNavigate('ANNOUNCEMENTS')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
            >
              {t('home.view_all', 'All')}
            </button>
          </div>

          {latestAnnouncement ? (
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-800">
                  {latestAnnouncement.category}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">{latestAnnouncement.title}</h3>
              <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                {latestAnnouncement.content}
              </p>
              <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>By {latestAnnouncement.authorName}</span>
                <span className="text-teal-700 font-medium">Broadcasted</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-400">
              {t('home.no_announcements', 'No announcements published yet.')}
            </div>
          )}

          {/* Quick Task Summary */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-zinc-900">{t('home.assigned_tasks', 'Assigned Tasks')}</h3>
              </div>
              <span className="text-xs font-semibold text-zinc-400">
                {pendingTasks.length} {t('home.tasks_open', 'open')}
              </span>
            </div>

            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onNavigate('TASKS')}
                  className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="text-xs font-medium text-zinc-800 truncate max-w-[180px]">
                    {task.title}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      task.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
