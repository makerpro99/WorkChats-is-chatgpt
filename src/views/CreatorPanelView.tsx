import React, { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  DollarSign,
  Settings,
  TrendingUp,
  Users2,
  Eye,
  Heart,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { User } from '../types';
import { Forbidden403 } from '../components/Forbidden403';

interface CreatorPanelViewProps {
  currentUser: User;
  onGoHome?: () => void;
  onGoBack?: () => void;
}

type CreatorSubSection = 'ANALYTICS' | 'REVENUE' | 'MONETIZATION_SETTINGS';

export const CreatorPanelView: React.FC<CreatorPanelViewProps> = ({
  currentUser,
  onGoHome,
  onGoBack,
}) => {
  // Strict authorization check: Only accessible if creatorPanel === true (or role === 'CREATOR')
  const hasAccess = Boolean(currentUser.creatorPanel || currentUser.role === 'CREATOR');

  if (!hasAccess) {
    return (
      <Forbidden403
        panelName="Creator Panel"
        onGoHome={onGoHome}
        onGoBack={onGoBack}
      />
    );
  }

  const [activeTab, setActiveTab] = useState<CreatorSubSection>('ANALYTICS');
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [subscriberPerks, setSubscriberPerks] = useState('Exclusive safe posts, custom badge, and direct channel shoutouts');
  const [savedNotice, setSavedNotice] = useState(false);

  const subscriberCount = currentUser.subscriberCount ?? (currentUser.subscribers?.length || 0);
  const isVerified = subscriberCount >= 1000000 || currentUser.isVerified;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div id="creator-panel-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white relative overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold mb-3 backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Verified Creator Studio</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <span>Creator Panel</span>
            {isVerified && (
              <span className="p-1 rounded-full bg-teal-500 text-white" title="Verified Creator Badge">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mb-6">
            Track your WorkChat audience engagement, analyze public impressions, and configure community monetization.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Total Subscribers:</span>{' '}
              <strong className="text-white font-extrabold">{subscriberCount.toLocaleString()}</strong>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Status:</span>{' '}
              <strong className={isVerified ? 'text-teal-400 font-extrabold' : 'text-zinc-300'}>
                {isVerified ? 'Verified Creator (1M+ Subs)' : 'Active Creator'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2">
        <button
          type="button"
          id="btn-creator-tab-analytics"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ANALYTICS'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          type="button"
          id="btn-creator-tab-revenue"
          onClick={() => setActiveTab('REVENUE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'REVENUE'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Revenue</span>
        </button>

        <button
          type="button"
          id="btn-creator-tab-settings"
          onClick={() => setActiveTab('MONETIZATION_SETTINGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'MONETIZATION_SETTINGS'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Monetization Settings</span>
        </button>
      </div>

      {/* 1. ANALYTICS SUB-SECTION */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold">Subscribers</span>
                <Users2 className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold text-zinc-900">
                {subscriberCount.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% this month</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold">Profile Impressions</span>
                <Eye className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-zinc-900">
                {(subscriberCount * 4 + 1280).toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>High reach rate</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold">Engagement Rate</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-zinc-900">
                8.9%
              </div>
              <div className="text-[11px] text-zinc-400">
                Above platform avg (4.5%)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold">Verification Tier</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-zinc-900 flex items-center gap-1.5">
                <span>{isVerified ? 'Elite Tier' : 'Growing Tier'}</span>
              </div>
              <div className="text-[11px] text-zinc-500">
                {isVerified ? 'Verified Checkmark Active' : `${Math.max(0, 1000000 - subscriberCount).toLocaleString()} subs until Checkmark`}
              </div>
            </div>
          </div>

          {/* Traffic Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Public Discovery Breakdown</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                  <span>WorkChat Community Directory</span>
                  <span>64%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '64%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                  <span>Project & Work Contributions</span>
                  <span>26%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                  <span>Direct Profile Links</span>
                  <span>10%</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REVENUE SUB-SECTION */}
      {activeTab === 'REVENUE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="text-xs font-bold text-zinc-500">Estimated Monthly Revenue</div>
              <div className="text-3xl font-extrabold text-zinc-900">
                ${Math.round(subscriberCount * 0.45 + 120).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18% vs last month</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="text-xs font-bold text-zinc-500">Creator Pool Share</div>
              <div className="text-3xl font-extrabold text-indigo-700">
                ${Math.round(subscriberCount * 0.25).toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400">Based on public verified engagement</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <div className="text-xs font-bold text-zinc-500">Next Payout Schedule</div>
              <div className="text-xl font-extrabold text-zinc-900">1st of Next Month</div>
              <div className="text-[11px] text-zinc-500 font-medium">Automatic direct deposit</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>Recent Creator Transactions</span>
            </h3>

            <div className="divide-y divide-zinc-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900">Community Subscription Share</div>
                  <div className="text-[11px] text-zinc-400">Monthly supporter distribution</div>
                </div>
                <span className="font-extrabold text-emerald-600">+$240.00</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900">Creator Growth Reward</div>
                  <div className="text-[11px] text-zinc-400">WorkChat Partner Program bonus</div>
                </div>
                <span className="font-extrabold text-emerald-600">+$150.00</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900">Project Deliverable Milestone</div>
                  <div className="text-[11px] text-zinc-400">Approved open collaboration contribution</div>
                </div>
                <span className="font-extrabold text-emerald-600">+$85.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MONETIZATION SETTINGS SUB-SECTION */}
      {activeTab === 'MONETIZATION_SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-2xs space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900">Monetization Settings</h3>
            <p className="text-xs text-zinc-500 mt-1">Configure community perks and optional creator support.</p>
          </div>

          {savedNotice && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Monetization preferences saved successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div>
                <div className="text-xs font-bold text-zinc-900">Enable Community Support</div>
                <div className="text-[11px] text-zinc-500">Allow followers to sponsor and support your public work.</div>
              </div>
              <input
                type="checkbox"
                checked={tipsEnabled}
                onChange={(e) => setTipsEnabled(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Subscriber Perks Description
              </label>
              <textarea
                rows={3}
                value={subscriberPerks}
                onChange={(e) => setSubscriberPerks(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
              />
              <span className="text-[11px] text-zinc-400">Shown to users before subscribing on your profile.</span>
            </div>
          </div>

          <button
            type="submit"
            id="btn-save-creator-settings"
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Monetization Settings
          </button>
        </form>
      )}
    </div>
  );
};

export { CreatorPanelView as CreatorPanel };
