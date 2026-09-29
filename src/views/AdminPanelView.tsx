import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User, ActivityLog } from '../types';
import { api } from '../api';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminTabBar, AdminTab } from '../components/admin/AdminTabBar';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminBansTab } from '../components/admin/AdminBansTab';
import { AdminRolesTab } from '../components/admin/AdminRolesTab';
import { AdminInvitationsTab } from '../components/admin/AdminInvitationsTab';
import { AdminLogsTab } from '../components/admin/AdminLogsTab';
import { AdminChatModerationTab } from '../components/admin/AdminChatModerationTab';
import { AdminWorkspacesTab } from '../components/admin/AdminWorkspacesTab';
import { AdminFilesTab } from '../components/admin/AdminFilesTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminManageAdminsTab } from '../components/admin/AdminManageAdminsTab';
import { AdminUserModal } from '../components/admin/AdminUserModal';
import { OwnerFriendsTab } from '../components/owner/OwnerFriendsTab';

interface AdminPanelViewProps {
  currentUser?: User;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Friends data state for Amis du Propriétaire tab
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  // Selected user for modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Global notice / message banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAdminData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setNotice(null);

    try {
      // Fetch overview data
      const res = await api.getAdminOverview();
      const allUsers = res.users || [];
      setUsers(allUsers);
      setBannedUsers(res.bannedUsers || allUsers.filter((u) => u.status === 'BANNED' || u.isBanned));
      setLogs(res.logs || []);

      if (isManualRefresh) {
        setNotice({ type: 'success', text: 'Données administratives synchronisées avec succès.' });
      }
    } catch (err: any) {
      // Fallback to individual endpoints if needed
      try {
        const [usersRes, logsRes] = await Promise.all([
          api.getAdminUsers(),
          api.getAdminLogs(),
        ]);
        const allUsers = usersRes.users || [];
        setUsers(allUsers);
        setBannedUsers(allUsers.filter((u) => u.status === 'BANNED' || u.isBanned));
        setLogs(logsRes.logs || []);
      } catch (innerErr: any) {
        setNotice({ type: 'error', text: innerErr.message || 'Impossible de charger les données du Admin Panel.' });
      }
    } finally {
      // Fetch friends data for Amis du Propriétaire tab
      try {
        const friendsRes = await api.getFriends();
        if (friendsRes.friends) setFriends(friendsRes.friends);
        if (friendsRes.incomingRequests) setIncomingRequests(friendsRes.incomingRequests);
        if (friendsRes.sentRequests) setSentRequests(friendsRes.sentRequests);
      } catch {}

      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFriendsData = async () => {
    try {
      const friendsRes = await api.getFriends();
      if (friendsRes.friends) setFriends(friendsRes.friends);
      if (friendsRes.incomingRequests) setIncomingRequests(friendsRes.incomingRequests);
      if (friendsRes.sentRequests) setSentRequests(friendsRes.sentRequests);
    } catch {}
  };

  const handleSendFriendRequest = async (targetUserId: string, targetUsername: string) => {
    setFriendActionLoading(true);
    try {
      await api.sendFriendRequest({ targetUserId, targetUsername });
      setNotice({
        type: 'success',
        text: `Demande d'ami envoyée avec succès à @${targetUsername} !`,
      });
      await fetchFriendsData();
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.message || "Impossible d'envoyer la demande d'ami.",
      });
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRespondFriendRequest = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    setFriendActionLoading(true);
    try {
      await api.respondFriendRequest(requestId, action);
      setNotice({
        type: 'success',
        text:
          action === 'ACCEPT'
            ? "Demande d'ami acceptée ! L'utilisateur est désormais dans vos amis."
            : "Demande d'ami refusée.",
      });
      await fetchFriendsData();
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.message || "Erreur lors du traitement de la demande d'ami.",
      });
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRemoveFriend = async (targetUserId: string) => {
    setFriendActionLoading(true);
    try {
      await api.removeFriend(targetUserId);
      setNotice({
        type: 'success',
        text: "L'ami a été retiré de la liste avec succès.",
      });
      await fetchFriendsData();
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.message || "Impossible de retirer l'ami.",
      });
    } finally {
      setFriendActionLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleExecuteUserAction = async (userId: string, action: string, data?: any) => {
    setActionLoading(true);
    try {
      const res = await api.adminUserAction(userId, { action, data });
      setNotice({ type: 'success', text: res.message || 'Action administrative appliquée.' });
      await loadAdminData(false);
      if (res.user && selectedUser && selectedUser.id === userId) {
        setSelectedUser(res.user);
      }
      return res;
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || "Échec de l'action administrative." });
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await handleExecuteUserAction(userId, 'unban');
    } catch {
      // Error handled in handleExecuteUserAction
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    try {
      await handleExecuteUserAction(userId, 'give_admin');
    } catch {
      // Error handled in handleExecuteUserAction
    }
  };

  const handleDemoteAdmin = async (userId: string) => {
    try {
      await handleExecuteUserAction(userId, 'demote_admin');
    } catch {
      // Error handled in handleExecuteUserAction
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Admin Header */}
      <AdminHeader
        currentUserRole={currentUser?.role || 'ADMIN'}
        onRefresh={() => loadAdminData(true)}
        isRefreshing={refreshing}
      />

      {/* 2. Admin Tab Bar */}
      <AdminTabBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setNotice(null);
        }}
        usersCount={users.length}
        bansCount={bannedUsers.length}
        logsCount={logs.length}
        pendingFriendRequestsCount={incomingRequests.filter((r) => r.status === 'PENDING').length}
      />

      {/* Feedback banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs font-bold underline opacity-70 hover:opacity-100 ml-4 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-zinc-500">Chargement de la console administrative...</p>
        </div>
      ) : (
        /* Tab Contents */
        <div>
          {activeTab === 'OVERVIEW' && (
            <AdminOverviewTab
              users={users}
              bannedUsers={bannedUsers}
              logs={logs}
              onViewAllLogs={() => setActiveTab('LOGS')}
            />
          )}

          {activeTab === 'USERS' && (
            <AdminUsersTab
              users={users}
              onManageUser={(u) => setSelectedUser(u)}
            />
          )}

          {activeTab === 'FRIENDS' && (
            <OwnerFriendsTab
              currentUser={currentUser || null}
              users={users}
              friends={friends}
              incomingRequests={incomingRequests}
              sentRequests={sentRequests}
              loadingAction={friendActionLoading}
              onSendFriendRequest={handleSendFriendRequest}
              onRespondFriendRequest={handleRespondFriendRequest}
              onRemoveFriend={handleRemoveFriend}
              onRefresh={fetchFriendsData}
            />
          )}

          {activeTab === 'BANS' && (
            <AdminBansTab
              bannedUsers={bannedUsers}
              onUnbanUser={handleUnban}
              isActionLoading={actionLoading}
            />
          )}

          {activeTab === 'ROLES' && (
            <AdminRolesTab
              users={users}
              onPromoteAdmin={handlePromoteAdmin}
              onDemoteAdmin={handleDemoteAdmin}
              onOpenUserDetails={(u) => setSelectedUser(u)}
              isActionLoading={actionLoading}
            />
          )}

          {activeTab === 'INVITATIONS' && (
            <AdminInvitationsTab
              onInvitationSent={() => loadAdminData(false)}
            />
          )}

          {activeTab === 'LOGS' && (
            <AdminLogsTab logs={logs} />
          )}

          {activeTab === 'CHAT' && (
            <AdminChatModerationTab />
          )}

          {activeTab === 'WORKSPACES' && (
            <AdminWorkspacesTab />
          )}

          {activeTab === 'FILES' && (
            <AdminFilesTab />
          )}

          {activeTab === 'SETTINGS' && (
            <AdminSettingsTab />
          )}

          {activeTab === 'MANAGE_ADMINS' && (
            <AdminManageAdminsTab
              users={users}
              onDemoteAdmin={handleDemoteAdmin}
              isActionLoading={actionLoading}
            />
          )}
        </div>
      )}

      {/* Admin User Management Modal */}
      {selectedUser && (
        <AdminUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onExecuteAction={handleExecuteUserAction}
        />
      )}
    </div>
  );
};
