import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Users,
  Search,
  Check,
  X,
  Clock,
  Send,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Phone,
  Video,
} from 'lucide-react';
import { User } from '../../types';
import { useCall } from '../../context/CallContext';

interface FriendRequestItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatarUrl: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

interface OwnerFriendsTabProps {
  currentUser: User | null;
  users: User[];
  friends: User[];
  incomingRequests: FriendRequestItem[];
  sentRequests: FriendRequestItem[];
  loadingAction: boolean;
  onSendFriendRequest: (targetUserId: string, targetUsername: string) => Promise<void>;
  onRespondFriendRequest: (requestId: string, action: 'ACCEPT' | 'DECLINE') => Promise<void>;
  onRemoveFriend: (targetUserId: string) => Promise<void>;
  onRefresh: () => void;
}

export const OwnerFriendsTab: React.FC<OwnerFriendsTabProps> = ({
  currentUser,
  users,
  friends,
  incomingRequests,
  sentRequests,
  loadingAction,
  onSendFriendRequest,
  onRespondFriendRequest,
  onRemoveFriend,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'ALL_USERS' | 'REQUESTS' | 'MY_FRIENDS'>('ALL_USERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const { startCall } = useCall();

  // Filter out the owner themselves
  const eligibleUsers = useMemo(() => {
    return users.filter((u) => u.id !== currentUser?.id && u.id !== 'usr_ai_gemini');
  }, [users, currentUser]);

  // Set of friend IDs
  const friendIdSet = useMemo(() => {
    return new Set(friends.map((f) => f.id));
  }, [friends]);

  // Set of sent pending request user IDs
  const sentPendingTargetUserIds = useMemo(() => {
    return new Set(
      sentRequests
        .filter((r) => r.status === 'PENDING')
        .map((r) => r.toUserId)
    );
  }, [sentRequests]);

  // Set of incoming pending request sender IDs
  const incomingPendingSenderUserIds = useMemo(() => {
    return new Set(
      incomingRequests
        .filter((r) => r.status === 'PENDING')
        .map((r) => r.fromUserId)
    );
  }, [incomingRequests]);

  // Filtered users according to search query
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return eligibleUsers;
    return eligibleUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [eligibleUsers, searchQuery]);

  const handleSend = async (user: User) => {
    setSendingId(user.id);
    try {
      await onSendFriendRequest(user.id, user.username);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">
              Gestion des Amis Propriétaire
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {friends.length} Ami{friends.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Découvrez tous les utilisateurs du réseau, envoyez des demandes d'amis directes, et acceptez ou refusez les demandes reçues.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 self-start sm:self-center">
          <button
            onClick={() => setSubTab('ALL_USERS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'ALL_USERS'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Tous les utilisateurs</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-zinc-700 text-white">
              {eligibleUsers.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('REQUESTS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              subTab === 'REQUESTS'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Demandes</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-zinc-950 font-black animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('MY_FRIENDS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'MY_FRIENDS'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mes Amis</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-zinc-200 text-zinc-700">
              {friends.length}
            </span>
          </button>

          <button
            onClick={onRefresh}
            title="Rafraîchir"
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ALL USERS WITH SEND FRIEND REQUEST BUTTON */}
      {subTab === 'ALL_USERS' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="p-4 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher parmi tous les utilisateurs par nom, @pseudo ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-zinc-400 hover:text-zinc-700 p-1"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
                Aucun utilisateur ne correspond à votre recherche.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isFriend = friendIdSet.has(user.id);
                const hasSentPending = sentPendingTargetUserIds.has(user.id);
                const hasIncomingPending = incomingPendingSenderUserIds.has(user.id);
                const isProcessing = sendingId === user.id || loadingAction;

                return (
                  <div
                    key={user.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-2xl object-cover ring-1 ring-zinc-200 bg-zinc-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-zinc-900 truncate">
                            {user.displayName}
                          </h3>
                          {user.role === 'OWNER' && (
                            <span className="p-0.5 rounded bg-amber-100 text-amber-800">
                              <Crown className="w-3 h-3" />
                            </span>
                          )}
                          {user.role === 'ADMIN' && (
                            <span className="p-0.5 rounded bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">@{user.username}</p>
                        {user.bio && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1">{user.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status & Action */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {user.role}
                      </span>

                      {/* Action Button */}
                      {isFriend ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Ami</span>
                        </div>
                      ) : hasSentPending ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Demande envoyée</span>
                        </div>
                      ) : hasIncomingPending ? (
                        <button
                          onClick={() => setSubTab('REQUESTS')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>Répondre à la demande</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-owner-send-request-${user.id}`}
                          onClick={() => handleSend(user)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>Send Request</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PENDING INCOMING & SENT REQUESTS */}
      {subTab === 'REQUESTS' && (
        <div className="space-y-6">
          {/* Incoming requests (WHO TO ACCEPT / DECLINE) */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-amber-50/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Demandes d'amis reçues (À accepter ou refuser)</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Consultez les utilisateurs qui souhaitent devenir amis avec le propriétaire.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                {incomingRequests.length} en attente
              </span>
            </div>

            <div className="p-5">
              {incomingRequests.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs">
                  Aucune demande d'ami en attente de réponse.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.fromAvatarUrl}
                          alt={req.fromDisplayName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-zinc-900">
                            {req.fromDisplayName}
                          </div>
                          <div className="text-[11px] text-zinc-400">@{req.fromUsername}</div>
                          <div className="text-[10px] text-zinc-400">
                            Reçue le {new Date(req.createdAt).toLocaleDateString()} à{' '}
                            {new Date(req.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onRespondFriendRequest(req.id, 'ACCEPT')}
                          disabled={loadingAction}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => onRespondFriendRequest(req.id, 'DECLINE')}
                          disabled={loadingAction}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold border border-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sent Requests */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-zinc-500" />
                  <span>Demandes envoyées en attente</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Demandes que vous avez envoyées à d'autres membres du réseau.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-zinc-200 text-zinc-700 text-xs font-bold">
                {sentRequests.length} envoyée{sentRequests.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-5">
              {sentRequests.length === 0 ? (
                <div className="py-6 text-center text-zinc-400 text-xs">
                  Aucune demande envoyée en attente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {sentRequests.map((req) => {
                    const targetUser = users.find((u) => u.id === req.toUserId);
                    return (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={
                              targetUser?.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-200"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-zinc-900 truncate">
                              {targetUser?.displayName || 'Utilisateur'}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              @{targetUser?.username || 'member'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          En attente
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MY FRIENDS LIST */}
      {subTab === 'MY_FRIENDS' && (
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Liste des Amis Confirmés du Propriétaire
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ces membres peuvent échanger en messagerie directe et lancer des appels audio & vidéo avec vous.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold">
              {friends.length} ami{friends.length > 1 ? 's' : ''} actif{friends.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-5">
            {friends.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs">
                Vous n'avez pas encore d'amis dans votre liste. Rendez-vous dans l'onglet "Tous les utilisateurs" pour envoyer vos premières demandes !
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={friend.avatarUrl}
                        alt={friend.displayName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 truncate">
                          {friend.displayName}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">@{friend.username}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                          {friend.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startCall(friend.id, 'AUDIO')}
                        title="Lancer un appel audio"
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startCall(friend.id, 'VIDEO')}
                        title="Lancer un appel vidéo (active la caméra)"
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveFriend(friend.id)}
                        disabled={loadingAction}
                        title="Retirer de la liste d'amis"
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
