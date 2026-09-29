import React, { useState } from 'react';
import { UserPlus2, Search, Check, X, UserMinus, Loader2, AlertCircle, CheckCircle2, Phone, Video } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { useCall } from '../context/CallContext';

interface FriendsViewProps {
  friends: User[];
  incomingRequests: any[];
  sentRequests: any[];
  onRefresh: () => void;
  onOpenChat: (friend: User) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  friends,
  incomingRequests,
  sentRequests,
  onRefresh,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ADD'>('ALL');
  const [searchTarget, setSearchTarget] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { startCall } = useCall();

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTarget.trim()) return;
    setSearching(true);
    setStatusMsg(null);
    try {
      const res = await api.searchUsers(searchTarget);
      setSearchResults(res.users || []);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to search users.' });
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUsername: string) => {
    setLoadingAction(true);
    setStatusMsg(null);
    try {
      const res = await api.sendFriendRequest({ targetUsername });
      setStatusMsg({
        type: 'success',
        text: res.autoAccepted
          ? `@${targetUsername} has been automatically added to your friends list (Owner privilege)!`
          : res.message || `Friend request sent to @${targetUsername}!`,
      });
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Could not send request.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    setLoadingAction(true);
    setStatusMsg(null);
    try {
      await api.respondFriendRequest(requestId, action);
      setStatusMsg({
        type: 'success',
        text: action === 'ACCEPT' ? 'Friend request accepted!' : 'Friend request declined.',
      });
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Action failed.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this contact from your friends list?')) return;
    setLoadingAction(true);
    try {
      await api.removeFriend(friendId);
      setStatusMsg({ type: 'success', text: 'Friend removed.' });
      onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to remove friend.' });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Colleagues & Friends</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Connect with team members across the organization for 1:1 chat and collaboration.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ALL' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'PENDING' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>Pending</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-600 text-white font-bold">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ADD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ADD' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            + Add Colleague
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: ALL FRIENDS */}
      {activeTab === 'ALL' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {friends.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-400">
              You haven't added any colleagues yet. Click "+ Add Colleague" to connect!
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center justify-between gap-3 hover:border-zinc-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatarUrl}
                      alt={friend.displayName}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200"
                      referrerPolicy="no-referrer"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        friend.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">
                      {friend.displayName}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">@{friend.username}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startCall(friend.id, 'AUDIO')}
                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                    title="Lancer un appel audio"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => startCall(friend.id, 'VIDEO')}
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                    title="Lancer un appel vidéo (active la caméra)"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenChat(friend)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove friend"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PENDING REQUESTS */}
      {activeTab === 'PENDING' && (
        <div className="space-y-6">
          {/* Incoming */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Incoming Friend Requests ({incomingRequests.length})
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs text-zinc-400 bg-white p-4 rounded-xl border border-zinc-200">
                No incoming friend requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-white rounded-xl border border-zinc-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900">@{req.senderUsername}</div>
                      <div className="text-[10px] text-zinc-400">
                        Received {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, 'DECLINE')}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Sent Requests ({sentRequests.length})
            </h3>
            {sentRequests.length === 0 ? (
              <p className="text-xs text-zinc-400 bg-white p-4 rounded-xl border border-zinc-200">
                No outgoing requests awaiting response.
              </p>
            ) : (
              <div className="space-y-2">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-zinc-800">Pending with @{req.targetUsername || req.targetUserId}</span>
                    <span className="text-[10px] text-zinc-400">Awaiting confirmation</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ADD COLLEAGUE */}
      {activeTab === 'ADD' && (
        <div className="max-w-xl bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Search & Connect</h3>
            <p className="text-xs text-zinc-500">
              Look up team members by their unique username or full display name.
            </p>
          </div>

          <form onSubmit={handleSearchUsers} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                placeholder="Enter username (e.g. sarah_lead or alex_dev)"
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchTarget.trim()}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="pt-2 divide-y divide-zinc-100 border-t border-zinc-100">
              {searchResults.map((user) => (
                <div key={user.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">{user.displayName}</div>
                      <div className="text-[11px] text-zinc-400">@{user.username}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendFriendRequest(user.username)}
                    disabled={loadingAction}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <UserPlus2 className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
