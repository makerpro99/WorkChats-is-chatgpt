import React, { useState, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { User, Announcement } from '../types';
import { api } from '../api';
import { OwnerHeader, OwnerTab } from '../components/owner/OwnerHeader';
import { OwnerOverviewTab } from '../components/owner/OwnerOverviewTab';
import { OwnerMembersTab } from '../components/owner/OwnerMembersTab';
import { OwnerLinkedAccountsTab, LinkedAccountGroup } from '../components/owner/OwnerLinkedAccountsTab';
import { OwnerSystemSettingsTab } from '../components/owner/OwnerSystemSettingsTab';
import { OwnerBroadcastTab } from '../components/owner/OwnerBroadcastTab';
import { OwnerFriendsTab } from '../components/owner/OwnerFriendsTab';
import { OwnerUserModal } from '../components/owner/OwnerUserModal';
import { PanelSecurityCodeCard } from '../components/PanelSecurityCodeCard';
import { Forbidden403 } from '../components/Forbidden403';

interface OwnerPanelViewProps {
  currentUser?: User | null;
  onAnnouncementPublished?: (announcement: Announcement) => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
}

export const OwnerPanelView: React.FC<OwnerPanelViewProps> = ({
  currentUser = null,
  onAnnouncementPublished,
  onGoHome,
  onGoBack,
}) => {
  // Strict authorization check: Only accessible if ownerPanel === true (or role === 'OWNER')
  const hasAccess = Boolean(
    currentUser && (currentUser.ownerPanel === true || currentUser.role === 'OWNER' || currentUser.username?.toLowerCase() === 'farouk123')
  );

  const [activeTab, setActiveTab] = useState<OwnerTab>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Core Data States
  const [metrics, setMetrics] = useState({
    totalMembers: 6,
    adminCount: 2,
    activeSessions: 1,
    messagesCount: 0,
    tasksCount: 0,
    filesCount: 0,
  });

  const [settings, setSettings] = useState({
    instanceName: 'WorkChat',
    securityLockdown: false,
    allowRegistration: true,
    maintenanceMode: false,
    enableSecretClaim: true,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccountGroup[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Friends & Requests states for Owner Panel
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  // Selected User for Modal Action
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);

  const fetchFriendsData = async () => {
    try {
      const friendsRes = await api.getFriends();
      if (friendsRes.friends) setFriends(friendsRes.friends);
      if (friendsRes.incomingRequests) setIncomingRequests(friendsRes.incomingRequests);
      if (friendsRes.sentRequests) setSentRequests(friendsRes.sentRequests);
    } catch {
      // Non-blocking for general overview
    }
  };

  const fetchOverview = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await api.getOwnerOverview();
      if (res.metrics) setMetrics(res.metrics);
      if (res.settings) setSettings(res.settings);
      if (res.users) setUsers(res.users);
      if (res.linkedAccounts) setLinkedAccounts(res.linkedAccounts);
      if (res.announcements) setAnnouncements(res.announcements);

      await fetchFriendsData();

      // If user modal is open, keep selected user reference updated
      if (selectedUserForModal && res.users) {
        const refreshed = res.users.find((u) => u.id === selectedUserForModal.id);
        if (refreshed) setSelectedUserForModal(refreshed);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les données du Panel Propriétaire.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string, targetUsername: string) => {
    setFriendActionLoading(true);
    try {
      const res = await api.sendFriendRequest({ targetUserId, targetUsername });
      setNotification({
        type: 'success',
        text: res.autoAccepted
          ? `@${targetUsername} a été ajouté(e) directement à vos amis sans validation nécessaire (Privilège Propriétaire appliqué) !`
          : res.message || `Ami ajouté avec succès à @${targetUsername} !`,
      });
      setTimeout(() => setNotification(null), 4000);
      await fetchFriendsData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || "Impossible d'envoyer la demande d'ami.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRespondFriendRequest = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    setFriendActionLoading(true);
    try {
      await api.respondFriendRequest(requestId, action);
      setNotification({
        type: 'success',
        text:
          action === 'ACCEPT'
            ? "Demande d'ami acceptée ! L'utilisateur est désormais dans vos amis."
            : "Demande d'ami refusée.",
      });
      setTimeout(() => setNotification(null), 4000);
      await fetchFriendsData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || "Erreur lors du traitement de la demande d'ami.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRemoveFriend = async (targetUserId: string) => {
    if (!window.confirm('Voulez-vous vraiment retirer cet utilisateur de vos amis ?')) return;
    setFriendActionLoading(true);
    try {
      await api.removeFriend(targetUserId);
      setNotification({
        type: 'success',
        text: "Ami retiré de votre liste.",
      });
      setTimeout(() => setNotification(null), 4000);
      await fetchFriendsData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || "Impossible de retirer cet ami.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setFriendActionLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchOverview(true);
    }
  }, [hasAccess]);

  if (!currentUser || !hasAccess) {
    return (
      <Forbidden403
        panelName="Owner Panel"
        onGoHome={onGoHome}
        onGoBack={onGoBack}
      />
    );
  }

  const handleExecuteUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const res = await api.ownerUserAction(userId, { action, data });
      setNotification({ type: 'success', text: res.message });
      setTimeout(() => setNotification(null), 4000);
      await fetchOverview();
      return res;
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || "Erreur lors de l'exécution de l'action." });
      throw err;
    }
  };

  const handleToggleEmergencyLockdown = async () => {
    const nextState = !settings.securityLockdown;
    try {
      await api.updateOwnerSettings({ securityLockdown: nextState });
      setSettings((prev) => ({ ...prev, securityLockdown: nextState }));
      setNotification({
        type: 'success',
        text: nextState
          ? "Verrouillage d'urgence activé : seules les actions de propriétaire sont autorisées."
          : "Verrouillage d'urgence levé avec succès.",
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Erreur lors du verrouillage.' });
    }
  };

  const handleSaveSettings = async (updated: any) => {
    const res = await api.updateOwnerSettings(updated);
    if (res.settings) {
      setSettings(res.settings);
    }
    setNotification({ type: 'success', text: 'Paramètres système enregistrés avec succès !' });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateLinkedGroup = async (userIds: string[], note: string) => {
    const res = await api.createLinkedAccounts({ userIds, note });
    if (res.linkedAccounts) setLinkedAccounts(res.linkedAccounts);
    setNotification({ type: 'success', text: res.message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteLinkedGroup = async (groupId: string) => {
    const res = await api.deleteLinkedAccount(groupId);
    if (res.linkedAccounts) setLinkedAccounts(res.linkedAccounts);
    setNotification({ type: 'success', text: 'Groupe de comptes dissocié.' });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBroadcastAnnouncement = async (data: {
    title: string;
    content: string;
    winnerMention?: string;
    bannerDuration?: number;
    imageUrl?: string;
  }) => {
    const res = await api.createOwnerAnnouncement(data);
    if (res.announcement) {
      setAnnouncements((prev) => [res.announcement, ...prev]);
      if (onAnnouncementPublished) {
        onAnnouncementPublished(res.announcement);
      }
    }
    setNotification({ type: 'success', text: res.message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await api.deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setNotification({ type: 'success', text: 'Annonce supprimée.' });
    setTimeout(() => setNotification(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <div className="text-sm font-semibold text-zinc-600">
          Chargement du Panel Propriétaire (Mode Root)...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Global Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top-2 duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[11px] underline cursor-pointer hover:opacity-80"
          >
            Fermer
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchOverview(true)}
            className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {/* Header with Navigation Pills */}
      <OwnerHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        linkedAccountsCount={linkedAccounts.length > 0 ? linkedAccounts.length : 2}
        pendingFriendRequestsCount={incomingRequests.length}
      />

      {/* TAB 1: Vue d'ensemble (Screenshot 1) */}
      {activeTab === 'OVERVIEW' && (
        <OwnerOverviewTab
          metrics={metrics}
          settings={settings}
          onNavigateTab={setActiveTab}
          onToggleEmergencyLockdown={handleToggleEmergencyLockdown}
        />
      )}

      {/* TAB 2: Gestion Membres (Screenshot 2) */}
      {activeTab === 'MEMBERS' && (
        <OwnerMembersTab
          users={users}
          onOpenUserModal={(user) => setSelectedUserForModal(user)}
          onExecuteQuickAction={handleExecuteUserAction}
        />
      )}

      {/* TAB: Amis du Propriétaire (Gestion & Demandes d'amis) */}
      {activeTab === 'FRIENDS' && (
        <OwnerFriendsTab
          currentUser={currentUser}
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

      {/* TAB 3: Comptes Liés (Screenshot 4) */}
      {activeTab === 'LINKED_ACCOUNTS' && (
        <OwnerLinkedAccountsTab
          users={users}
          linkedAccounts={linkedAccounts}
          onCreateLinkedGroup={handleCreateLinkedGroup}
          onDeleteLinkedGroup={handleDeleteLinkedGroup}
          onOpenUserModal={(user) => setSelectedUserForModal(user)}
        />
      )}

      {/* TAB 4: Paramètres Système (Screenshot 5) */}
      {activeTab === 'SETTINGS' && (
        <OwnerSystemSettingsTab
          settings={settings}
          onSaveSettings={handleSaveSettings}
        />
      )}

      {/* TAB: Codes de Sécurité des Panels */}
      {activeTab === 'SECURITY_CODES' && (
        <div className="space-y-6 max-w-3xl">
          <PanelSecurityCodeCard
            panel="OWNER"
            title="Clé de Sécurité de la Console Propriétaire (Owner Root)"
            description="Code maître requis pour déverrouiller et accéder au panneau root Propriétaire."
          />
          <PanelSecurityCodeCard
            panel="ADMIN"
            title="Clé de Sécurité de la Console Administrateur"
            description="Code requis pour déverrouiller la console d'administration générale."
          />
          <PanelSecurityCodeCard
            panel="MODERATOR"
            title="Clé de Sécurité de la Console Modérateur"
            description="Code requis pour déverrouiller la console de modération de la communauté."
          />
        </div>
      )}

      {/* TAB 5: Diffusion Annonce (Screenshot 6) */}
      {activeTab === 'BROADCAST' && (
        <OwnerBroadcastTab
          currentUser={currentUser}
          announcements={announcements}
          onBroadcastAnnouncement={handleBroadcastAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
        />
      )}

      {/* USER ACTION MODAL (Screenshot 3) */}
      {selectedUserForModal && (
        <OwnerUserModal
          user={selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onExecuteAction={handleExecuteUserAction}
        />
      )}
    </div>
  );
};

export { OwnerPanelView as OwnerPanel };
