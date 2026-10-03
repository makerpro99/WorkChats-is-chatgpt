import {
  User,
  AppNotification,
  Task,
  WorkProject,
  Team,
  Announcement,
  ChatMessage,
  ActivityLog,
  TransactionRecord,
  ModerationReport,
  UserWarning,
  ModerationLog,
  ReportedMessage,
  ReportedUserSummary,
  ModerationStats,
  CallSession,
  PublicActivityItem,
} from './types';

const API_BASE = '/api';

export function getToken(): string | null {
  const local = localStorage.getItem('workchat_token');
  if (local) return local;
  const match = document.cookie.match(/workchat_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string) {
  localStorage.setItem('workchat_token', token);
  document.cookie = `workchat_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
}

export function removeToken() {
  localStorage.removeItem('workchat_token');
  document.cookie = 'workchat_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<{ message: string; user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  quickRegister: (body?: { preferredUsername?: string }) => request<{ message: string; user: User; token: string; freeAccountToken?: string }>('/auth/quick-register', { method: 'POST', body: JSON.stringify(body || {}) }),
  freeQuickLogin: (body: { username: string; freeAccountToken?: string }) => request<{ message: string; user: User; token: string; freeAccountToken?: string }>('/auth/free-quick-login', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (body: { email: string; displayName?: string; photoUrl?: string; googleId?: string }) => request<{ message: string; user: User; token: string }>('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ message: string; user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ user: User }>('/auth/me'),
  getCurrentUser: () => request<{ user: User }>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) => request<{ message: string; email: string; verificationCodePreview?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body: any) => request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body: any) => request<{ message: string; user: User }>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body: any) => request<{ message: string }>('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),

  // Friends & Users
  getAllUsers: () => request<{ users: User[] }>('/users'),
  searchUsers: (q: string) => request<{ users: User[] }>(`/users/search?q=${encodeURIComponent(q)}`),
  getFriends: () => request<{ friends: User[]; incomingRequests: any[]; sentRequests: any[] }>('/friends'),
  sendFriendRequest: (body: { targetUserId?: string; targetUsername?: string }) => request<{ message: string; request?: any; autoAccepted?: boolean; friend?: User }>('/friends/request', { method: 'POST', body: JSON.stringify(body) }),
  respondFriendRequest: (requestId: string, action: 'ACCEPT' | 'DECLINE') => request<{ message: string }>('/friends/respond', { method: 'POST', body: JSON.stringify({ requestId, action }) }),
  removeFriend: (targetId: string) => request<{ message: string }>(`/friends/${targetId}`, { method: 'DELETE' }),

  // Chat
  getConversations: () => request<{ conversations: any[] }>('/chat/conversations'),
  getChatMessages: (partnerId: string) => request<{ messages: ChatMessage[]; partner: User | null }>(`/chat/${partnerId}`),
  sendMessage: (
    partnerId: string,
    content: string,
    attachments?: Array<{ id: string; name: string; size: number; type: string; url: string }>,
    linkPreviews?: Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }>
  ) =>
    request<{ message: ChatMessage; replyMessage?: ChatMessage }>(`/chat/${partnerId}`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments, linkPreviews }),
    }),
  uploadChatAttachment: (body: { name: string; size: number; type: string; base64Data: string }) =>
    request<{ attachment: { id: string; name: string; size: number; type: string; url: string } }>('/chat/upload', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  parseLinkPreview: (url: string) =>
    request<{ preview: { url: string; title?: string; description?: string; image?: string; siteName?: string } }>(
      `/chat/link-preview?url=${encodeURIComponent(url)}`
    ),
  verifyAge: (body?: { livenessProof?: boolean; ageCategory?: string; providerRef?: string }) =>
    request<{
      ageCategory: '5_9' | '10_16' | '17_19' | '20_PLUS';
      experience: 'KIDS' | 'SELECT' | 'RESTRICTED' | 'ORIGINAL';
      verifiedAt: string;
      reference: string;
    }>('/auth/verify-age', {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  sendTypingIndicator: (partnerId: string, isTyping: boolean) =>
    request<{ ok: boolean }>(`/chat/${partnerId}/typing`, {
      method: 'POST',
      body: JSON.stringify({ isTyping }),
    }),
  getTypingStatus: (partnerId: string) =>
    request<{ isTyping: boolean }>(`/chat/${partnerId}/typing`),

  // Teams
  getTeams: () => request<{ teams: Team[] }>('/teams'),
  createTeam: (name: string, description: string) => request<{ team: Team }>('/teams', { method: 'POST', body: JSON.stringify({ name, description }) }),
  addTeamMember: (teamId: string, username: string) => request<{ message: string; team: Team }>(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ username }) }),

  // Tasks
  getTasks: () => request<{ tasks: Task[] }>('/tasks'),
  createTask: (body: any) => request<{ message: string; task: Task }>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (taskId: string, body: any) => request<{ message: string; task: Task }>(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (taskId: string) => request<{ message: string }>(`/tasks/${taskId}`, { method: 'DELETE' }),

  // Announcements
  getAnnouncements: () => request<{ announcements: Announcement[] }>('/announcements'),
  createAnnouncement: (body: any) => request<{ message: string; announcement: Announcement }>('/announcements', { method: 'POST', body: JSON.stringify(body) }),
  likeAnnouncement: (announcementId: string) => request<{ message: string; announcement: Announcement; liked: boolean; likesCount: number }>(`/announcements/${announcementId}/like`, { method: 'POST' }),
  addAnnouncementComment: (announcementId: string, content: string) => request<{ message: string; comment: any; comments: any[] }>(`/announcements/${announcementId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Work
  getWorkProjects: () => request<{ workProjects: WorkProject[] }>('/work'),
  createWork: (body: any) => request<{ message: string; work: WorkProject }>('/work', { method: 'POST', body: JSON.stringify(body) }),
  updateWork: (workId: string, body: any) => request<{ message: string; work: WorkProject }>(`/work/${workId}`, { method: 'PUT', body: JSON.stringify(body) }),
  addWorkFile: (workId: string, file: any) => request<{ message: string; file: any; work: WorkProject }>(`/work/${workId}/files`, { method: 'POST', body: JSON.stringify(file) }),
  removeWorkFile: (workId: string, fileId: string) => request<{ message: string; work: WorkProject }>(`/work/${workId}/files/${fileId}`, { method: 'DELETE' }),
  shareWork: (workId: string, body: { targetUsername: string; permission: string }) => request<{ message: string; work: WorkProject }>(`/work/${workId}/share`, { method: 'POST', body: JSON.stringify(body) }),
  deleteWork: (workId: string) => request<{ message: string }>(`/work/${workId}`, { method: 'DELETE' }),

  // AI Work Agent
  askWorkAgent: (body: { userPrompt: string; workContext: any; conversationHistory?: any[] }) => request<{ reply: string }>('/ai/work-agent', { method: 'POST', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request<{ notifications: AppNotification[] }>('/notifications'),
  markNotificationRead: (id: string) => request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<{ message: string }>('/notifications/read-all', { method: 'PUT' }),

  // Billing (Stripe Real Production Payment Mode)
  processPayment: (body: {
    planId: string;
    billingCycle: 'monthly' | 'annual';
    cardholderName: string;
    cardLast4: string;
    cardBrand: string;
    paymentToken?: string;
  }) => request<{ success: boolean; message: string; transaction: TransactionRecord; user: User }>('/billing/process-payment', { method: 'POST', body: JSON.stringify(body) }),
  getTransactions: () => request<{ transactions: TransactionRecord[] }>('/billing/transactions'),

  // Moderator Panel
  verifyModeratorGate: (accessCode?: string) => request<{ authorized: boolean; role: string }>('/moderator/verify-gate', { method: 'POST', body: JSON.stringify({ accessCode }) }),
  getModeratorOverview: () => request<{ stats: ModerationStats; recentReports: ModerationReport[]; recentLogs: ModerationLog[] }>('/moderator/overview'),
  getModeratorReports: (filter?: string) => request<{ reports: ModerationReport[] }>(`/moderator/reports${filter ? `?status=${filter}` : ''}`),
  createReport: (body: { type: 'MESSAGE' | 'USER' | 'CONTENT'; targetId: string; targetName: string; targetContent?: string; reason: string; details?: string; severity?: string }) =>
    request<{ message: string; report: ModerationReport }>('/moderator/reports', { method: 'POST', body: JSON.stringify(body) }),
  reportItem: (body: { type: 'MESSAGE' | 'USER' | 'CONTENT'; targetId: string; targetName: string; targetContent?: string; reason: string; details?: string; severity?: string }) =>
    request<{ message: string; report: ModerationReport }>('/moderator/reports', { method: 'POST', body: JSON.stringify(body) }),
  resolveReport: (reportId: string, body: { status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING'; actionTaken: string }) =>
    request<{ message: string; report: ModerationReport }>(`/moderator/reports/${reportId}/resolve`, { method: 'PUT', body: JSON.stringify(body) }),
  getReportedMessages: () => request<{ messages: ReportedMessage[] }>('/moderator/reported-messages'),
  deleteModeratedMessage: (messageId: string, reason?: string) =>
    request<{ message: string }>(`/moderator/messages/${messageId}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
  getReportedUsers: () => request<{ users: ReportedUserSummary[] }>('/moderator/reported-users'),
  issueUserWarning: (userId: string, body: { severity: string; category: string; reason: string; notes?: string }) =>
    request<{ message: string; warning: UserWarning }>(`/moderator/users/${userId}/warn`, { method: 'POST', body: JSON.stringify(body) }),
  getModeratorWarnings: () => request<{ warnings: UserWarning[] }>('/moderator/warnings'),
  timeoutUser: (userId: string, body: { durationHours: number; reason: string }) =>
    request<{ message: string; mutedUntil: string }>(`/moderator/users/${userId}/timeout`, { method: 'POST', body: JSON.stringify(body) }),
  banMemberByModerator: (userId: string, reason: string) =>
    request<{ message: string; user: User }>(`/moderator/users/${userId}/ban`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getModeratedContent: () => request<{ content: Array<{ id: string; type: string; title: string; authorName: string; details: string; flagReason: string; createdAt: string }> }>('/moderator/content'),
  removeModeratedContent: (type: string, id: string, reason?: string) =>
    request<{ message: string }>(`/moderator/content/${type}/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
  getModeratorLogs: () => request<{ logs: ModerationLog[] }>('/moderator/logs'),

  // Admin
  verifyAdminGate: (accessCode?: string) => request<{ authorized: boolean; role: string }>('/admin/verify-gate', { method: 'POST', body: JSON.stringify({ accessCode }) }),
  getAdminOverview: () => request<{
    metrics: {
      totalUsers: number;
      adminCount: number;
      bannedCount: number;
      activeWorkspaces: number;
    };
    users: User[];
    bannedUsers: User[];
    logs: ActivityLog[];
  }>('/admin/overview'),
  sendAdminInvitation: (body: { email: string; role: string }) =>
    request<{ message: string }>('/admin/invitations', { method: 'POST', body: JSON.stringify(body) }),
  adminUserAction: (userId: string, body: { action: string; data?: any }) =>
    request<{ message: string; user?: User }>(`/admin/users/${userId}/action`, { method: 'POST', body: JSON.stringify(body) }),
  getAdminUsers: () => request<{ users: User[] }>('/admin/users'),
  banUser: (userId: string, reason?: string) => request<{ message: string; user: User }>(`/admin/users/${userId}/ban`, { method: 'POST', body: JSON.stringify({ reason }) }),
  unbanUser: (userId: string) => request<{ message: string; user: User }>(`/admin/users/${userId}/unban`, { method: 'POST' }),
  grantAdmin: (userId: string) => request<{ message: string; user: User }>(`/admin/users/${userId}/grant-admin`, { method: 'POST' }),
  removeAdmin: (userId: string) => request<{ message: string; user: User }>(`/admin/users/${userId}/remove-admin`, { method: 'POST' }),
  grantModerator: (userId: string) => request<{ message: string; user: User }>(`/admin/users/${userId}/grant-moderator`, { method: 'POST' }),
  removeModerator: (userId: string) => request<{ message: string; user: User }>(`/admin/users/${userId}/remove-moderator`, { method: 'POST' }),
  getAdminLogs: () => request<{ logs: ActivityLog[] }>('/admin/logs'),

  // Owner
  verifyOwnerGate: (accessCode?: string) => request<{ authorized: boolean; role: string }>('/owner/verify-gate', { method: 'POST', body: JSON.stringify({ accessCode }) }),
  getOwnerOverview: () => request<{
    metrics: {
      totalMembers: number;
      adminCount: number;
      activeSessions: number;
      messagesCount: number;
      tasksCount: number;
      filesCount: number;
    };
    settings: {
      instanceName: string;
      securityLockdown: boolean;
      allowRegistration: boolean;
      maintenanceMode: boolean;
      enableSecretClaim: boolean;
      updatedAt?: string;
    };
    users: User[];
    linkedAccounts: Array<{ id: string; userIds: string[]; note: string; createdAt: string }>;
    announcements: Announcement[];
  }>('/owner/overview'),
  grantOwner: (userId: string) => request<{ message: string; user: User }>(`/owner/users/${userId}/grant-owner`, { method: 'POST' }),
  removeOwner: (userId: string) => request<{ message: string; user: User }>(`/owner/users/${userId}/remove-owner`, { method: 'POST' }),
  getOwnerSettings: () => request<{ settings: any; stats: any }>('/owner/settings'),
  getOwnerData: () => request<{ settings: any; stats: any }>('/owner/settings'),
  updateOwnerSettings: (body: any) => request<{ message: string; settings: any }>('/owner/settings', { method: 'PUT', body: JSON.stringify(body) }),
  ownerUserAction: (userId: string, body: { action: string; data?: any }) =>
    request<{ message: string; user?: User; generatedPassword?: string }>(`/owner/users/${userId}/action`, { method: 'POST', body: JSON.stringify(body) }),
  createLinkedAccounts: (body: { userIds: string[]; note?: string }) =>
    request<{ message: string; linkedAccounts: any[] }>('/owner/linked-accounts', { method: 'POST', body: JSON.stringify(body) }),
  deleteLinkedAccount: (id: string) =>
    request<{ message: string; linkedAccounts: any[] }>(`/owner/linked-accounts/${id}`, { method: 'DELETE' }),
  createOwnerAnnouncement: (body: { title: string; content: string; winnerMention?: string; bannerDuration?: number; imageUrl?: string }) =>
    request<{ message: string; announcement: Announcement }>('/owner/announcements', { method: 'POST', body: JSON.stringify(body) }),
  deleteAnnouncement: (id: string) =>
    request<{ message: string }>(`/moderator/content/announcement/${id}`, { method: 'DELETE' }),

  // Heartbeat & Online Presence
  sendHeartbeat: () =>
    request<{ ok: boolean; isOnline: boolean }>('/users/heartbeat', { method: 'POST' }),

  // Real-Time Audio & Video Calls
  startCall: (targetUserId: string, type: 'AUDIO' | 'VIDEO') =>
    request<{ call: CallSession }>('/calls/start', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, type }),
    }),
  getCurrentCall: () =>
    request<{ call: CallSession | null }>('/calls/current'),
  acceptCall: (callId: string) =>
    request<{ message: string; call: CallSession }>(`/calls/${callId}/accept`, {
      method: 'POST',
    }),
  declineCall: (callId: string) =>
    request<{ message: string; call: CallSession }>(`/calls/${callId}/decline`, {
      method: 'POST',
    }),
  endCall: (callId: string) =>
    request<{ message: string; call: CallSession | null }>(`/calls/${callId}/end`, {
      method: 'POST',
    }),
  sendCallSignal: (callId: string, type: string, payload: any) =>
    request<{ ok: boolean }>(`/calls/${callId}/signal`, {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    }),
  getCallSignals: (callId: string, since?: number) =>
    request<{ signals: Array<{ fromUserId: string; type: string; payload: any; timestamp: number }> }>(
      `/calls/${callId}/signals?since=${since || 0}`
    ),

  // Panel Security Codes
  getPanelCode: (panel: 'MODERATOR' | 'ADMIN' | 'OWNER') =>
    request<{ panel: string; code: string }>(`/panels/code?panel=${panel}`),
  updatePanelCode: (panel: 'MODERATOR' | 'ADMIN' | 'OWNER', newCode: string) =>
    request<{ message: string; panel: string; newCode: string }>('/panels/code', {
      method: 'PUT',
      body: JSON.stringify({ panel, newCode }),
    }),

  // Users Directory & Profile Subscriptions
  getUsersList: () =>
    request<{ users: User[] }>('/users'),

  getUserPublicProfile: (userId: string) =>
    request<{
      user: User;
      isSubscribed: boolean;
      subscriptionsCount: number;
      publicActivity: PublicActivityItem[];
    }>(`/users/${userId}/profile`),

  toggleSubscribe: (userId: string) =>
    request<{
      subscribed: boolean;
      subscriberCount: number;
      isVerified: boolean;
      message: string;
    }>(`/users/${userId}/subscribe`, {
      method: 'POST',
    }),

  // Protected Panels Authorization & Data
  checkOwnerAccess: () =>
    request<{ allowed: boolean }>('/owner/check-access'),

  checkCreatorAccess: () =>
    request<{ allowed: boolean }>('/creator/check-access'),

  getCreatorOverview: () =>
    request<{
      analytics: {
        subscriberCount: number;
        impressions: number;
        engagementRate: string;
        growthRate: string;
      };
      revenue: {
        estimatedMonthly: number;
        creatorFund: number;
      };
    }>('/creator/overview'),

  giftUserPanel: (userId: string, body: { action: string; data?: any }) =>
    request<{ message: string; user: User }>(`/owner/users/${userId}/action`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  // Games
  createGame: (body: { gameType: 'TICTACTOE'; opponentId: string }) =>
    request<{ game: any }>('/games', { method: 'POST', body: JSON.stringify(body) }),
  joinGame: (gameId: string) =>
    request<{ game: any }>('/games/' + encodeURIComponent(gameId) + '/join', { method: 'POST' }),
  getGame: (gameId: string) =>
    request<{ game: any }>('/games/' + encodeURIComponent(gameId)),
  gameMove: (gameId: string, index: number) =>
    request<{ game: any }>('/games/' + encodeURIComponent(gameId) + '/move', { method: 'POST', body: JSON.stringify({ index }) }),
  gameChat: (gameId: string, content: string) =>
    request<{ game: any }>('/games/' + encodeURIComponent(gameId) + '/chat', { method: 'POST', body: JSON.stringify({ content }) }),

};
