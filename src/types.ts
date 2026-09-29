export type UserRole = 'MEMBER' | 'MODERATOR' | 'ADMIN' | 'OWNER' | 'CREATOR';
export type AccountStatus = 'ACTIVE' | 'BANNED' | 'ONLINE' | 'OFFLINE';

export type ReportType = 'MESSAGE' | 'USER' | 'CONTENT';
export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface ModerationReport {
  id: string;
  type: ReportType;
  targetId: string;
  targetName: string;
  targetContent?: string;
  reportedByUserId: string;
  reportedByUsername: string;
  reportedByDisplayName: string;
  reason: string;
  details?: string;
  severity: ReportSeverity;
  status: ReportStatus;
  actionTaken?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type WarningSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'FINAL';
export type WarningCategory = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'POLICY_VIOLATION' | 'OTHER';

export interface UserWarning {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  issuedByUserId: string;
  issuedByUsername: string;
  issuedByName?: string;
  issuedByDisplayName: string;
  severity: WarningSeverity;
  category: WarningCategory;
  reason: string;
  notes?: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetId?: string;
  targetName?: string;
  details?: string;
  timestamp: string;
  createdAt?: string;
}

export interface ReportedMessage {
  id: string;
  messageId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName?: string;
  content: string;
  messageTimestamp: string;
  reportCount: number;
  reportsCount?: number;
  reasons: string[];
  primaryReason?: string;
  reportIds: string[];
  status: 'PENDING' | 'REVIEWED' | 'DELETED';
}

export interface ReportedUserSummary {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  status: AccountStatus;
  reportCount: number;
  reportsCount?: number;
  warningCount: number;
  warningsCount?: number;
  lastReportedReason?: string;
  latestReason?: string;
  isMuted?: boolean;
  mutedUntil?: string;
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  investigatingReports: number;
  resolvedReports: number;
  reportedMessagesCount: number;
  reportedUsersCount: number;
  warningsIssuedCount: number;
  actionsTakenCount: number;
  activeWarnings?: number;
  activeTimeouts?: number;
  bannedUsers?: number;
}

export interface OwnerSettings {
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  enableAIAgent: boolean;
  maxUploadSizeBytes?: number;
  announcementBanner?: string;
}

export interface OwnerStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalTeams: number;
  totalWorkProjects: number;
  totalTasks: number;
  storageUsedBytes: number;
}

export interface User {
  id: string;
  username: string;
  normalizedUsername: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  isBanned?: boolean;
  banned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  grantedPermissions?: string[];
  unlockedPanels?: string[];
  avatarUrl: string;
  bio?: string;
  joinedAt: string;
  lastLoginAt: string;
  subscriptionPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionTier?: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus?: 'active' | 'inactive' | 'canceled';
  subscriptionRenewAt?: string;
  isOnline?: boolean;
  lastActiveAt?: string;
  ageCategory?: '5_9' | '10_16' | '17_19' | '20_PLUS';
  experience?: 'KIDS' | 'SELECT' | 'RESTRICTED' | 'ORIGINAL';
  ageVerifiedAt?: string;
  ageVerificationRef?: string;
  giftedPanels?: string[];
  subscriberCount?: number;
  subscribers?: string[];
  isVerified?: boolean;
  ownerPanel?: boolean;
  creatorPanel?: boolean;
  adminPanel?: boolean;
  moderatorPanel?: boolean;
  tempBannedUntil?: string;
  tempBanReason?: string;
  warningsCount?: number;
}

export interface PublicActivityItem {
  id: string;
  type: 'PROJECT' | 'ANNOUNCEMENT' | 'MILESTONE' | 'CONTRIBUTION';
  title: string;
  description?: string;
  timestamp: string;
  badge?: string;
}

export interface UserAvatarConfig {
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  mouth: string;
  clothes: string;
  clothesColor: string;
  hat?: string;
  accessory?: string;
  shoes?: string;
  badge?: string;
}

export interface ModerationHistoryEntry {
  id: string;
  action: 'KICK' | 'TEMP_BAN' | 'WARN' | 'MUTE';
  targetUserId: string;
  targetUsername: string;
  reason: string;
  duration?: string;
  startTime: string;
  endTime?: string;
  ownerId: string;
  ownerName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export type CallType = 'AUDIO' | 'VIDEO';
export type CallStatus = 'RINGING' | 'ACCEPTED' | 'DECLINED' | 'ENDED' | 'BUSY';

export interface CallParticipant {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  role?: UserRole;
}

export interface CallSession {
  id: string;
  callerId: string;
  caller: CallParticipant;
  receiverId: string;
  receiver: CallParticipant;
  type: CallType;
  status: CallStatus;
  startedAt: string;
  acceptedAt?: string;
  endedAt?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatarUrl: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  teamRole?: 'LEAD' | 'MEMBER';
  role?: 'LEADER' | 'MEMBER' | 'LEAD';
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  createdBy: string;
  createdByName?: string;
  leaderId?: string;
  createdAt: string;
  members: TeamMember[];
  memberCount?: number;
}

export type TaskStatus =
  | 'TO DO'
  | 'IN PROGRESS'
  | 'COMPLETED'
  | 'TO_DO'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'To Do'
  | 'In Progress'
  | 'Completed'
  | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number | string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  assignedToName?: string;
  assigneeUsername?: string;
  assigneeAvatar?: string;
  creatorId: string;
  creatorName: string;
  createdByName?: string;
  creatorAvatar?: string;
  teamId?: string;
  teamName?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementAudience = 'EVERYONE' | 'TEAM' | 'SELECTED' | 'ALL' | 'SELECTED_USERS';

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  userId: string;
  username: string;
  displayName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category?: string;
  winnerMention?: string;
  bannerDuration?: number;
  imageUrl?: string;
  isOfficial?: boolean;
  broadcastBanner?: boolean;
  authorRole?: string;
  creatorId: string;
  creatorName: string;
  authorName?: string;
  creatorAvatar?: string;
  audience: AnnouncementAudience;
  targetTeamId?: string;
  targetTeamName?: string;
  targetUserIds?: string[];
  likes?: string[]; // Array of user IDs who liked
  likesCount?: number;
  comments?: AnnouncementComment[];
  createdAt: string;
}

export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'TEAM_INVITE'
  | 'TASK_ASSIGNED'
  | 'ANNOUNCEMENT'
  | 'CHAT_MESSAGE'
  | 'WORK_SHARED'
  | 'SECURITY_ALERT'
  | 'CALL'
  | 'VOICE_CALL'
  | 'VIDEO_CALL'
  | 'MISSED_VOICE_CALL'
  | 'MISSED_VIDEO_CALL';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  content?: string;
  linkSection?: string;
  linkId?: string;
  read: boolean;
  createdAt: string;
}

export type WorkCategory =
  | 'Study'
  | 'Documents'
  | 'Spreadsheets'
  | 'Design'
  | 'Coding'
  | 'Websites'
  | 'Presentations'
  | 'Writing'
  | 'File Management'
  | 'Research'
  | 'Emails'
  | 'Planning'
  | 'Images'
  | 'Video'
  | 'Audio'
  | 'Other PC Work'
  | 'Data Analysis'
  | 'Graphic Design'
  | 'UI/UX Design'
  | 'Product Management'
  | 'Marketing Campaigns'
  | 'Copywriting'
  | 'Video Editing'
  | 'Audio & Podcasts'
  | 'Customer Support'
  | 'Legal & Compliance';

export type WorkStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type WorkSharingPermission = 'VIEWER' | 'EDITOR' | 'OWNER';

export interface WorkFile {
  id: string;
  name: string;
  size: number | string;
  type: string;
  uploadedBy?: string;
  uploadedAt: string;
  dataUrl?: string;
  url?: string;
}

export interface WorkActivity {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface WorkShare {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  permission: WorkSharingPermission;
}

export interface WebsiteSection {
  id: string;
  type: 'navbar' | 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'footer' | 'custom';
  title?: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  enabled: boolean;
  items?: any[];
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface WebsiteTheme {
  primaryColor: string;
  primaryName: string;
  darkMode: boolean;
  fontFamily: 'sans' | 'serif' | 'mono';
  borderRadius: 'rounded-md' | 'rounded-xl' | 'rounded-2xl' | 'rounded-none';
}

export interface WebsiteData {
  template: 'saas' | 'ecommerce' | 'portfolio' | 'agency' | 'custom';
  siteTitle: string;
  tagline: string;
  theme: WebsiteTheme;
  sections: WebsiteSection[];
  customHtml?: string;
  lastDeployedAt?: string;
}

export interface WorkProject {
  id: string;
  name: string;
  title?: string;
  description: string;
  category: WorkCategory;
  status: WorkStatus;
  progress: number;
  dueDate?: string;
  notes: string;
  ownerId: string;
  ownerName: string;
  ownerUsername?: string;
  registeredForEveryone?: boolean;
  visibility?: 'EVERYONE' | 'TEAM' | 'PRIVATE';
  websiteData?: WebsiteData;
  files: WorkFile[];
  sharedWith: WorkShare[];
  activity: WorkActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  domain?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatar: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  attachments?: ChatAttachment[];
  linkPreviews?: LinkPreview[];
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  actorId?: string;
  actorName?: string;
  actorUsername?: string;
  userName?: string;
  actorRole?: UserRole;
  target?: string;
  targetId?: string;
  targetName?: string;
  status?: 'SUCCESS' | 'FAILED' | string;
  details?: string;
  ipAddress?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  userEmail: string;
  planName: string;
  planId?: string;
  billingCycle?: string;
  amount: number;
  amountCents?: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  paymentMethod: string;
  brand: string;
  cardBrand?: string;
  last4: string;
  cardLast4?: string;
  receiptUrl?: string;
  createdAt: string;
}
