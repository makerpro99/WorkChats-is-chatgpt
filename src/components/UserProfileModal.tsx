import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Users2,
  Calendar,
  Briefcase,
  Megaphone,
  UserCheck,
  UserPlus,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { User, PublicActivityItem } from '../types';
import { api } from '../api';

interface UserProfileModalProps {
  userId: string | null;
  currentUser: User;
  onClose: () => void;
  onSubscriptionChanged?: (targetUserId: string, isSubscribed: boolean, newCount: number) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  currentUser,
  onClose,
  onSubscriptionChanged,
}) => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [publicActivity, setPublicActivity] = useState<PublicActivityItem[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionsCount, setSubscriptionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUserPublicProfile(userId);
      if (res && res.user) {
        setProfileUser(res.user);
        const subCount = res.user.subscriberCount ?? (res.user.subscribers?.length || 0);
        setSubscriberCount(subCount);
        setIsSubscribed(Boolean(res.isSubscribed || res.user.subscribers?.includes(currentUser.id)));
        setSubscriptionsCount(res.subscriptionsCount || 0);
        setPublicActivity(res.publicActivity || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!profileUser || subscribing) return;
    setSubscribing(true);
    const prevSubscribed = isSubscribed;
    const prevCount = subscriberCount;

    // Optimistic update
    const nextSubscribed = !prevSubscribed;
    const nextCount = nextSubscribed ? prevCount + 1 : Math.max(0, prevCount - 1);
    setIsSubscribed(nextSubscribed);
    setSubscriberCount(nextCount);

    try {
      const res = await api.toggleSubscribe(profileUser.id);
      setIsSubscribed(res.subscribed);
      setSubscriberCount(res.subscriberCount);
      if (profileUser) {
        profileUser.isVerified = res.isVerified;
        profileUser.subscriberCount = res.subscriberCount;
      }
      if (onSubscriptionChanged) {
        onSubscriptionChanged(profileUser.id, res.subscribed, res.subscriberCount);
      }
    } catch (err: any) {
      // Revert on error
      setIsSubscribed(prevSubscribed);
      setSubscriberCount(prevCount);
    } finally {
      setSubscribing(false);
    }
  };

  if (!userId) return null;

  const isVerified = subscriberCount >= 1000000 || profileUser?.isVerified;
  const isMe = currentUser.id === userId;

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toLocaleString();
  };

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="user-profile-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden my-8"
      >
        {/* Banner Cover */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-teal-600 via-indigo-600 to-sky-600 relative p-4 flex justify-end items-start">
          <button
            type="button"
            id="btn-close-user-profile"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <span className="text-xs font-medium">Loading user profile...</span>
          </div>
        ) : error || !profileUser ? (
          <div className="p-8 text-center text-zinc-600 space-y-4">
            <p className="text-sm">{error || 'User not found.'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar & Header Action */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-14 mb-4 gap-3">
              <div className="relative inline-block">
                <img
                  src={profileUser.avatarUrl}
                  alt={profileUser.displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                  referrerPolicy="no-referrer"
                />
                {isVerified && (
                  <span
                    title="Verified Creator (1,000,000+ Subscribers)"
                    className="absolute -bottom-1 -right-1 p-1 bg-teal-500 text-white rounded-full ring-2 ring-white shadow-sm flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-white text-teal-600" />
                  </span>
                )}
              </div>

              {!isMe && (
                <button
                  type="button"
                  id="btn-profile-subscribe"
                  onClick={handleToggleSubscribe}
                  disabled={subscribing}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isSubscribed
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'
                  }`}
                >
                  {subscribing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSubscribed ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Profile Identity */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                  {profileUser.displayName}
                </h2>
                {isVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold"
                    title="1,000,000+ Subscribers Verified"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Verified</span>
                  </span>
                )}
                {profileUser.role && profileUser.role !== 'MEMBER' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {profileUser.role}
                  </span>
                )}
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                @{profileUser.username}
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio ? (
              <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-100 p-3 rounded-2xl mb-5">
                {profileUser.bio}
              </p>
            ) : (
              <p className="text-xs text-zinc-400 italic mb-5">
                No bio provided yet.
              </p>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-center mb-6">
              <div>
                <div className="text-base font-extrabold text-zinc-900">
                  {formatSubscribers(subscriberCount)}
                </div>
                <div className="text-[11px] text-zinc-500 font-medium flex items-center justify-center gap-1">
                  <span>Subscribers</span>
                </div>
              </div>

              <div>
                <div className="text-base font-extrabold text-zinc-900">
                  {subscriptionsCount}
                </div>
                <div className="text-[11px] text-zinc-500 font-medium">
                  Subscriptions
                </div>
              </div>

              <div>
                <div className="text-base font-extrabold text-teal-700">
                  {publicActivity.length}
                </div>
                <div className="text-[11px] text-zinc-500 font-medium">
                  Public Posts
                </div>
              </div>
            </div>

            {/* Public Activity Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Public WorkChat Activity</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  Publicly visible only
                </span>
              </div>

              {publicActivity.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs">
                  No public activity posted by this user yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {publicActivity.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {item.type === 'PROJECT' ? (
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                          ) : item.type === 'ANNOUNCEMENT' ? (
                            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          )}
                          <span className="text-xs font-bold text-zinc-800">
                            {item.title}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-zinc-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {new Date(item.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
