import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  UserX,
  Clock,
  Trash2,
  CheckCircle2,
  FileText,
  Search,
  Loader2,
  Filter,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  ModerationStats,
  ModerationReport,
  ModerationLog,
  ReportedMessage,
  ReportedUserSummary,
  UserWarning,
  User,
} from '../types';
import { api } from '../api';
import { OwnerFriendsTab } from '../components/owner/OwnerFriendsTab';
import { PanelSecurityCodeCard } from '../components/PanelSecurityCodeCard';

interface ModeratorPanelViewProps {
  currentUser?: User;
}

export const ModeratorPanelView: React.FC<ModeratorPanelViewProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'OVERVIEW' | 'REPORTS' | 'MESSAGES' | 'USERS' | 'WARNINGS' | 'LOGS' | 'FRIENDS' | 'SECURITY_CODE'
  >('OVERVIEW');

  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [reportedMessages, setReportedMessages] = useState<ReportedMessage[]>([]);
  const [reportedUsers, setReportedUsers] = useState<ReportedUserSummary[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);

  // Friends state for Amis du Propriétaire tab
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resolution modal state
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [resolutionAction, setResolutionAction] = useState('Reviewed and addressed');
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');

  // Issue Warning Modal
  const [targetUserToWarn, setTargetUserToWarn] = useState<ReportedUserSummary | null>(null);
  const [warnSeverity, setWarnSeverity] = useState('LOW');
  const [warnCategory, setWarnCategory] = useState('MISCONDUCT');
  const [warnReason, setWarnReason] = useState('');
  const [warnNotes, setWarnNotes] = useState('');

  // Timeout Modal
  const [targetUserToTimeout, setTargetUserToTimeout] = useState<ReportedUserSummary | null>(null);
  const [timeoutHours, setTimeoutHours] = useState(24);
  const [timeoutReason, setTimeoutReason] = useState('Temporary cooling off period');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'OVERVIEW') {
        const res = await api.getModeratorOverview();
        setStats(res.stats);
        setReports(res.recentReports || []);
        setLogs(res.recentLogs || []);
      } else if (activeSubTab === 'REPORTS') {
        const res = await api.getModeratorReports();
        setReports(res.reports || []);
      } else if (activeSubTab === 'MESSAGES') {
        const res = await api.getReportedMessages();
        setReportedMessages(res.messages || []);
      } else if (activeSubTab === 'USERS') {
        const res = await api.getReportedUsers();
        setReportedUsers(res.users || []);
      } else if (activeSubTab === 'WARNINGS') {
        const res = await api.getModeratorWarnings();
        setWarnings(res.warnings || []);
      } else if (activeSubTab === 'LOGS') {
        const res = await api.getModeratorLogs();
        setLogs(res.logs || []);
      } else if (activeSubTab === 'FRIENDS') {
        await loadFriendsData();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to load moderation data.' });
    } finally {
      setLoading(false);
    }
  };

  const loadFriendsData = async () => {
    try {
      const [friendsRes, usersRes] = await Promise.all([
        api.getFriends(),
        api.getAllUsers(),
      ]);
      setFriends(friendsRes.friends || []);
      setIncomingRequests(friendsRes.incomingRequests || []);
      setSentRequests(friendsRes.sentRequests || []);
      setAllUsers(usersRes.users || []);
    } catch {}
  };

  const handleSendFriendRequest = async (targetUserId: string, targetUsername: string) => {
    setFriendActionLoading(true);
    try {
      await api.sendFriendRequest({ targetUserId, targetUsername });
      setActionMsg({ type: 'success', text: `Demande d'ami envoyée à @${targetUsername}.` });
      await loadFriendsData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || "Erreur lors de l'envoi de la demande." });
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRespondFriendRequest = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    setFriendActionLoading(true);
    try {
      await api.respondFriendRequest(requestId, action);
      setActionMsg({
        type: 'success',
        text: action === 'ACCEPT' ? "Demande d'ami acceptée !" : "Demande d'ami refusée.",
      });
      await loadFriendsData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Erreur lors du traitement de la demande.' });
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleRemoveFriend = async (targetId: string) => {
    if (!window.confirm('Voulez-vous vraiment retirer cet ami ?')) return;
    setFriendActionLoading(true);
    try {
      await api.removeFriend(targetId);
      setActionMsg({ type: 'success', text: 'Ami retiré avec succès.' });
      await loadFriendsData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || "Erreur lors de la suppression de l'ami." });
    } finally {
      setFriendActionLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await api.resolveReport(selectedReport.id, {
        status: resolutionStatus,
        actionTaken: resolutionAction,
      });
      setActionMsg({ type: 'success', text: `Report #${selectedReport.id} marked as ${resolutionStatus}.` });
      setSelectedReport(null);
      loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to resolve report.' });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message from the platform?')) return;
    try {
      await api.deleteModeratedMessage(messageId, 'Violated community standards');
      setActionMsg({ type: 'success', text: 'Message deleted and removed from view.' });
      loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to delete message.' });
    }
  };

  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserToWarn) return;
    try {
      await api.issueUserWarning(targetUserToWarn.userId, {
        severity: warnSeverity,
        category: warnCategory,
        reason: warnReason,
        notes: warnNotes,
      });
      setActionMsg({ type: 'success', text: `Official warning issued to @${targetUserToWarn.username}.` });
      setTargetUserToWarn(null);
      setWarnReason('');
      setWarnNotes('');
      loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to issue warning.' });
    }
  };

  const handleTimeoutUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserToTimeout) return;
    try {
      await api.timeoutUser(targetUserToTimeout.userId, {
        durationHours: Number(timeoutHours),
        reason: timeoutReason,
      });
      setActionMsg({
        type: 'success',
        text: `Muted @${targetUserToTimeout.username} for ${timeoutHours} hours.`,
      });
      setTargetUserToTimeout(null);
      loadData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to mute user.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-indigo-950 text-white relative overflow-hidden shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-800 text-indigo-200 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Moderator Governance Console</h1>
            <p className="text-xs text-indigo-300">
              Community standards enforcement, report resolution, and member safety tools.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl overflow-x-auto text-xs font-semibold scrollbar-none">
        {(
          [
            { id: 'OVERVIEW', label: 'Overview & Stats' },
            { id: 'REPORTS', label: 'Reports Queue' },
            { id: 'MESSAGES', label: 'Reported Messages' },
            { id: 'USERS', label: 'Reported Members' },
            { id: 'WARNINGS', label: 'Issued Warnings' },
            { id: 'LOGS', label: 'Action Audit Logs' },
            { id: 'FRIENDS', label: '👑 Amis du Propriétaire' },
            { id: 'SECURITY_CODE', label: '🔑 Code d\'accès' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActionMsg(null);
              setActiveSubTab(tab.id);
            }}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* 1. OVERVIEW */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                <div className="text-[11px] text-zinc-400 font-semibold">Total Reports</div>
                <div className="text-xl font-extrabold text-zinc-900 mt-1">{stats.totalReports}</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                <div className="text-[11px] text-amber-600 font-semibold">Pending Review</div>
                <div className="text-xl font-extrabold text-amber-600 mt-1">{stats.pendingReports}</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                <div className="text-[11px] text-emerald-600 font-semibold">Resolved Reports</div>
                <div className="text-xl font-extrabold text-emerald-600 mt-1">{stats.resolvedReports}</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                <div className="text-[11px] text-zinc-400 font-semibold">Total Warnings</div>
                <div className="text-xl font-extrabold text-zinc-900 mt-1">{stats.activeWarnings}</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                <div className="text-[11px] text-zinc-400 font-semibold">Muted Members</div>
                <div className="text-xl font-extrabold text-zinc-900 mt-1">{stats.activeTimeouts}</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-zinc-200">
                <div className="text-[11px] text-red-600 font-semibold">Banned Users</div>
                <div className="text-xl font-extrabold text-red-600 mt-1">{stats.bannedUsers}</div>
              </div>
            </div>
          )}

          {/* Quick Reports & Recent Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Recent Incident Reports
              </h3>
              {reports.slice(0, 4).map((r) => (
                <div key={r.id} className="p-3 bg-zinc-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-zinc-900">
                      [{r.type}] {r.targetName}
                    </div>
                    <div className="text-[11px] text-zinc-500">Reason: {r.reason}</div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Recent Mod Audit Trail
              </h3>
              {logs.slice(0, 4).map((l) => (
                <div key={l.id} className="p-3 bg-zinc-50 rounded-xl text-xs space-y-0.5">
                  <div className="flex items-center justify-between font-semibold text-zinc-900">
                    <span>{l.action}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {new Date(l.createdAt || l.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">{l.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. REPORTS QUEUE */}
      {activeSubTab === 'REPORTS' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Platform Reports Queue</h3>
            <span className="text-xs text-zinc-400">{reports.length} total reports</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {reports.map((r) => (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">#{r.id}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                      {r.type}
                    </span>
                    <span className="font-semibold text-zinc-800">{r.targetName}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        r.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-zinc-600">
                    <strong>Reason:</strong> {r.reason} {r.details && `• ${r.details}`}
                  </p>
                  {r.targetContent && (
                    <p className="p-2 bg-zinc-50 rounded-lg text-zinc-500 font-mono text-[11px]">
                      "{r.targetContent}"
                    </p>
                  )}
                  <div className="text-[10px] text-zinc-400">
                    Reported by @{r.reportedByUsername || r.reportedByDisplayName} on {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(r)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REPORTED MESSAGES */}
      {activeSubTab === 'MESSAGES' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Flagged Direct Messages</h3>
            <span className="text-xs text-zinc-400">{reportedMessages.length} flagged</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {reportedMessages.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">No reported messages.</p>
            ) : (
              reportedMessages.map((m) => (
                <div key={m.messageId} className="py-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">From @{m.senderName}</span>
                      <span className="text-zinc-400">→ To @{m.recipientName}</span>
                      <span className="px-1.5 py-0.2 bg-red-100 text-red-700 font-bold rounded text-[10px]">
                        {m.reportsCount} Reports
                      </span>
                    </div>
                    <p className="p-2.5 bg-zinc-50 rounded-xl text-zinc-800 font-mono text-xs">
                      "{m.content}"
                    </p>
                    <div className="text-[10px] text-zinc-400">
                      Primary flag reason: <strong>{m.primaryReason}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMessage(m.messageId)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Message</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. REPORTED USERS */}
      {activeSubTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Reported Members Management</h3>
            <span className="text-xs text-zinc-400">{reportedUsers.length} members flagged</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {reportedUsers.map((u) => (
              <div key={u.userId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{u.displayName}</span>
                    <span className="text-zinc-400">(@{u.username})</span>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                      {u.reportsCount} Reports
                    </span>
                    <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-700 font-bold rounded text-[10px]">
                      {u.warningsCount} Warnings
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Latest Incident Reason: <strong>{u.latestReason}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setTargetUserToWarn(u)}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Issue Warning
                  </button>
                  <button
                    onClick={() => setTargetUserToTimeout(u)}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Timeout / Mute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. WARNINGS */}
      {activeSubTab === 'WARNINGS' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Official User Warnings</h3>
            <span className="text-xs text-zinc-400">{warnings.length} recorded</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {warnings.map((w) => (
              <div key={w.id} className="py-3.5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">User #{w.userId}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        w.severity === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : w.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {w.severity} Severity
                    </span>
                    <span className="text-[10px] text-zinc-400">{w.category}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-zinc-700"><strong>Reason:</strong> {w.reason}</p>
                {w.notes && <p className="text-zinc-400 text-[11px]">Notes: {w.notes}</p>}
                <div className="text-[10px] text-zinc-400">Issued by {w.issuedByName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. LOGS */}
      {activeSubTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Immutable Moderator Audit Logs</h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-zinc-50 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-900">{log.action}</div>
                  <div className="text-zinc-500">{log.details}</div>
                  <div className="text-[10px] text-zinc-400">Actor: {log.actorName}</div>
                </div>
                <span className="text-[10px] text-zinc-400">
                  {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. AMIS DU PROPRIETAIRE */}
      {activeSubTab === 'FRIENDS' && (
        <OwnerFriendsTab
          currentUser={currentUser || null}
          users={allUsers}
          friends={friends}
          incomingRequests={incomingRequests}
          sentRequests={sentRequests}
          loadingAction={friendActionLoading}
          onSendFriendRequest={handleSendFriendRequest}
          onRespondFriendRequest={handleRespondFriendRequest}
          onRemoveFriend={handleRemoveFriend}
          onRefresh={loadFriendsData}
        />
      )}

      {/* 8. PANEL SECURITY CODE */}
      {activeSubTab === 'SECURITY_CODE' && (
        <div className="max-w-xl">
          <PanelSecurityCodeCard
            panel="MODERATOR"
            title="Code de Sécurité du Panel Modérateur"
            description="Modifiez le code d'accès requis pour déverrouiller la console de modération."
          />
        </div>
      )}

      {/* Resolve Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Resolve Incident #{selectedReport.id}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Target: {selectedReport.targetName} • Reason: {selectedReport.reason}
            </p>

            <form onSubmit={handleResolveReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium"
                >
                  <option value="RESOLVED">Resolved (Action Taken)</option>
                  <option value="DISMISSED">Dismissed (No Action Required)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Action Notes</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  placeholder="Describe resolution taken..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warn User Modal */}
      {targetUserToWarn && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Issue Official Warning to @{targetUserToWarn.username}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Warnings are logged in the user's audit profile and visible across consoles.
            </p>

            <form onSubmit={handleIssueWarning} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Severity</label>
                  <select
                    value={warnSeverity}
                    onChange={(e) => setWarnSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                  <select
                    value={warnCategory}
                    onChange={(e) => setWarnCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  >
                    <option value="MISCONDUCT">Misconduct</option>
                    <option value="SPAM">Spam</option>
                    <option value="HARASSMENT">Harassment</option>
                    <option value="INAPPROPRIATE">Inappropriate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={warnReason}
                  onChange={(e) => setWarnReason(e.target.value)}
                  placeholder="e.g. Unprofessional communication in team channel"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={warnNotes}
                  onChange={(e) => setWarnNotes(e.target.value)}
                  placeholder="Optional context for moderation team"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserToWarn(null)}
                  className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
                >
                  Send Official Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeout Modal */}
      {targetUserToTimeout && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Timeout / Mute @{targetUserToTimeout.username}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Restricts user messaging capabilities for a specific duration.
            </p>

            <form onSubmit={handleTimeoutUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={timeoutHours}
                  onChange={(e) => setTimeoutHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={timeoutReason}
                  onChange={(e) => setTimeoutReason(e.target.value)}
                  placeholder="e.g. Repeated spamming after warning"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserToTimeout(null)}
                  className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl"
                >
                  Apply Timeout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
