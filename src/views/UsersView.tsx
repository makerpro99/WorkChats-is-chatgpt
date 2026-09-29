import React, { useState, useEffect } from 'react';
import {
  Users2,
  Search,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Loader2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { UserProfileModal } from '../components/UserProfileModal';

interface UsersViewProps {
  currentUser: User;
}

export const UsersView: React.FC<UsersViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUsersList();
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load community users.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscribe = async (e: React.MouseEvent, targetUser: User) => {
    e.stopPropagation();
    if (subscribingId || targetUser.id === currentUser.id) return;

    setSubscribingId(targetUser.id);
    const wasSubscribed = targetUser.subscribers?.includes(currentUser.id);
    const prevCount = targetUser.subscriberCount ?? 0;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUser.id) {
          const nextSubs = wasSubscribed
            ? (u.subscribers || []).filter((id) => id !== currentUser.id)
            : [...(u.subscribers || []), currentUser.id];
          const nextCount = wasSubscribed ? Math.max(0, prevCount - 1) : prevCount + 1;
          return {
            ...u,
            subscribers: nextSubs,
            subscriberCount: nextCount,
            isVerified: nextCount >= 1000000 || u.isVerified,
          };
        }
        return u;
      })
    );

    try {
      const res = await api.toggleSubscribe(targetUser.id);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUser.id) {
            return {
              ...u,
              subscriberCount: res.subscriberCount,
              isVerified: res.isVerified,
              subscribers: res.subscribed
                ? Array.from(new Set([...(u.subscribers || []), currentUser.id]))
                : (u.subscribers || []).filter((id) => id !== currentUser.id),
            };
          }
          return u;
        })
      );
    } catch (err) {
      // Revert if error
      loadUsers();
    } finally {
      setSubscribingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  });

  const formatSubscribers = (count?: number) => {
    const c = count || 0;
    if (c >= 1000000) {
      return (c / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (c >= 1000) {
      return (c / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return c.toLocaleString();
  };

  const totalVerifiedCount = users.filter((u) => (u.subscriberCount || 0) >= 1000000 || u.isVerified).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Profile Modal when a card is clicked */}
      <UserProfileModal
        userId={selectedUserId}
        currentUser={currentUser}
        onClose={() => setSelectedUserId(null)}
        onSubscriptionChanged={(targetId, isSubscribed, newCount) => {
          setUsers((prev) =>
            prev.map((u) => {
              if (u.id === targetId) {
                return {
                  ...u,
                  subscriberCount: newCount,
                  isVerified: newCount >= 1000000 || u.isVerified,
                  subscribers: isSubscribed
                    ? Array.from(new Set([...(u.subscribers || []), currentUser.id]))
                    : (u.subscribers || []).filter((id) => id !== currentUser.id),
                };
              }
              return u;
            })
          );
        }}
      />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-36 -top-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-3 backdrop-blur-xs">
            <Users2 className="w-3.5 h-3.5 text-teal-400" />
            <span>WorkChat Community Members</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Explore WorkChat Users
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mb-6">
            Discover creators, team collaborators, and coworkers. Subscribe to follow their public contributions, or click any profile to learn more.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-300">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-white font-extrabold">{users.length}</span> Active Members
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 backdrop-blur-xs border border-teal-400/30 text-teal-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>
                <strong className="text-white">{totalVerifiedCount}</strong> Verified Creators (1M+ Subs)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            id="input-search-users"
            type="text"
            placeholder="Search users by name, username, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-zinc-500 font-medium px-2 shrink-0">
          Showing <strong className="text-zinc-800">{filteredUsers.length}</strong> users
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-zinc-400 bg-white rounded-3xl border border-zinc-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-xs font-semibold">Loading WorkChat users...</span>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200/80 text-zinc-400 space-y-2">
          <Users2 className="w-10 h-10 mx-auto text-zinc-300" />
          <p className="text-sm font-semibold text-zinc-700">No users found</p>
          <p className="text-xs text-zinc-400">Try searching for a different name or username.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const isSubscribed = Boolean(u.subscribers?.includes(currentUser.id));
            const isMe = u.id === currentUser.id;
            const subCount = u.subscriberCount || 0;
            const isVerified = subCount >= 1000000 || u.isVerified;

            return (
              <div
                key={u.id}
                id={`user-card-${u.username}`}
                onClick={() => setSelectedUserId(u.id)}
                className="p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 text-left cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 bg-zinc-50 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    {isVerified && (
                      <span
                        title="Verified Creator (1,000,000+ Subscribers)"
                        className="absolute -bottom-1 -right-1 p-0.5 bg-teal-500 text-white rounded-full ring-2 ring-white shadow-sm flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-white text-teal-600" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-zinc-900 truncate group-hover:text-teal-700 transition-colors">
                        {u.displayName}
                      </span>
                      {isVerified && (
                        <span title="Verified Creator (1,000,000+ Subscribers)">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-100 shrink-0" />
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-500 truncate">
                      @{u.username}
                    </div>

                    <div className="mt-1 text-[11px] font-semibold text-zinc-600 flex items-center gap-1">
                      <Users2 className="w-3 h-3 text-zinc-400" />
                      <span>{formatSubscribers(subCount)} subscribers</span>
                    </div>
                  </div>
                </div>

                {u.bio && (
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {u.bio}
                  </p>
                )}

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Joined {new Date(u.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                  </span>

                  {!isMe ? (
                    <button
                      type="button"
                      id={`btn-subscribe-${u.username}`}
                      onClick={(e) => handleToggleSubscribe(e, u)}
                      disabled={subscribingId === u.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isSubscribed
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/10'
                      }`}
                    >
                      {subscribingId === u.id ? (
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
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500">
                      You
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
