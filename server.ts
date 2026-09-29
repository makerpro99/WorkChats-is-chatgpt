import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'workchat_db.json');

// Connected WebSockets for real-time notifications, chat, and call signaling
const userSockets = new Map<string, Set<WebSocket>>();

function broadcastToUser(userId: string, data: any) {
  const sockets = userSockets.get(userId);
  if (sockets && sockets.size > 0) {
    const payload = JSON.stringify(data);
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(payload);
        } catch {}
      }
    }
  }
}

function broadcastToAll(data: any) {
  const payload = JSON.stringify(data);
  for (const set of userSockets.values()) {
    for (const ws of set) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(payload);
        } catch {}
      }
    }
  }
}

// Server-side Access Code for Owner & Admin Security Gates (PRN-ZKH-0069)
const OWNER_ADMIN_ACCESS_CODE = process.env.ACCESS_GATE_CODE || 'PRN-ZKH-0069';

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Password hashing helpers using Node crypto
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    return false;
  }
}

// In-memory + file-backed database schema
interface DB {
  users: Array<{
    id: string;
    username: string;
    normalizedUsername: string;
    email: string;
    passwordHash: string;
    displayName: string;
    role: 'MEMBER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
    status: 'ACTIVE' | 'BANNED';
    isBanned?: boolean;
    banReason?: string;
    bannedAt?: string;
    bannedBy?: string;
    grantedPermissions?: string[];
    mutedUntil?: string;
    avatarUrl: string;
    bio?: string;
    joinedAt: string;
    lastLoginAt: string;
    lastActiveAt?: string;
    subscriptionPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
    subscriptionStatus?: 'active' | 'inactive' | 'canceled';
    subscriptionRenewAt?: string;
    ageCategory?: '5_9' | '10_16' | '17_19' | '20_PLUS';
    experience?: 'KIDS' | 'SELECT' | 'RESTRICTED' | 'ORIGINAL';
    ageVerifiedAt?: string;
    ageVerificationRef?: string;
    unlockedPanels?: string[];
    giftedPanels?: string[];
    googleId?: string;
    isFreeAccount?: boolean;
    freeAccountToken?: string;
    inventory?: string[];
    avatarConfig?: any;
    subscriberCount?: number;
    subscribers?: string[];
    isVerified?: boolean;
    ownerPanel?: boolean;
    creatorPanel?: boolean;
    adminPanel?: boolean;
    moderatorPanel?: boolean;
  }>;
  sessions: Array<{
    token: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    gateAccess?: string[];
  }>;
  resetCodes: Array<{
    email: string;
    code: string;
    expiresAt: number;
  }>;
  teams: any[];
  friends: any[];
  friendRequests: any[];
  tasks: any[];
  announcements: any[];
  notifications: any[];
  workProjects: any[];
  chatMessages: any[];
  activityLogs: any[];
  transactions: any[];
  reports: Array<{
    id: string;
    type: 'MESSAGE' | 'USER' | 'CONTENT';
    targetId: string;
    targetName: string;
    targetContent?: string;
    reportedByUserId: string;
    reportedByUsername: string;
    reportedByDisplayName: string;
    reason: string;
    details?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
    actionTaken?: string;
    resolvedBy?: string;
    resolvedByName?: string;
    resolvedAt?: string;
    createdAt: string;
  }>;
  warnings: Array<{
    id: string;
    userId: string;
    username: string;
    displayName: string;
    issuedByUserId: string;
    issuedByUsername: string;
    issuedByDisplayName: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'FINAL';
    category: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'POLICY_VIOLATION' | 'OTHER';
    reason: string;
    notes?: string;
    acknowledged: boolean;
    createdAt: string;
  }>;
  linkedAccounts?: Array<{
    id: string;
    userIds: string[];
    note: string;
    createdAt: string;
  }>;
  systemSettings: {
    instanceName?: string;
    securityLockdown?: boolean;
    maintenanceMode: boolean;
    requireGatePin: boolean;
    allowRegistration: boolean;
    enableSecretClaim?: boolean;
    defaultStorageMb: number;
    updatedAt: string;
  };
  panelCodes?: {
    MODERATOR: string;
    ADMIN: string;
    OWNER: string;
  };
}

function generateSaaSWebsiteData(title = 'NexusAI Cloud - Intelligent SaaS Platform') {
  return {
    template: 'saas',
    siteTitle: title,
    tagline: 'Scale Your Enterprise Infrastructure with Autonomous AI Agents',
    theme: {
      primaryColor: '#0d9488',
      primaryName: 'Teal',
      darkMode: false,
      fontFamily: 'sans',
      borderRadius: 'rounded-xl',
    },
    sections: [
      {
        id: 'sec_nav',
        type: 'navbar',
        title: 'NexusAI',
        enabled: true,
        items: [
          { label: 'Features', link: '#features' },
          { label: 'Showcase', link: '#showcase' },
          { label: 'Pricing', link: '#pricing' },
          { label: 'Reviews', link: '#testimonials' },
        ],
        ctaText: 'Start Free Trial',
        ctaLink: '#pricing',
      },
      {
        id: 'sec_hero',
        type: 'hero',
        badge: '✨ Next-Gen AI Workspace v3.2 Released',
        title: 'Autonomous AI Agents for High-Velocity Teams',
        subtitle: 'Automate code refactoring, infrastructure orchestration, and documentation synthesis with real-time collaborative intelligence.',
        ctaText: 'Launch Free Workspace',
        ctaLink: '#pricing',
        secondaryCtaText: 'Watch 2-Min Demo',
        secondaryCtaLink: '#showcase',
        enabled: true,
      },
      {
        id: 'sec_features',
        type: 'features',
        badge: 'Core Capabilities',
        title: 'Built for Mission-Critical Velocity',
        subtitle: 'Everything your organization requires to prototype, build, and deploy reliable software.',
        enabled: true,
        items: [
          {
            icon: 'Cpu',
            title: 'Neural Code Engine',
            description: 'Context-aware code completion, static analysis, and multi-file refactoring on your private codebase.',
          },
          {
            icon: 'ShieldCheck',
            title: 'Enterprise RBAC & Zero Trust',
            description: 'Cryptographically signed audit logs, role hierarchies, and granular data quarantine protection.',
          },
          {
            icon: 'Zap',
            title: 'Real-Time Synchronous Collab',
            description: 'Sub-15ms WebSocket state synchronization across team channels, boards, and live editors.',
          },
        ],
      },
      {
        id: 'sec_pricing',
        type: 'pricing',
        badge: 'Transparent Plans',
        title: 'Simple, Predictable Pricing',
        subtitle: 'Deploy instantly with zero hidden fees or unexpected surge charges.',
        enabled: true,
        items: [
          {
            name: 'Starter',
            price: '$0',
            period: '/month',
            description: 'Perfect for solo developers and quick prototypes.',
            features: ['Up to 3 Active Projects', 'Standard AI Work Agent', 'Community Support', '1 GB Deliverables Storage'],
            buttonText: 'Get Started Free',
            popular: false,
          },
          {
            name: 'Pro Team',
            price: '$29',
            period: '/month',
            description: 'Designed for fast-growing engineering & design teams.',
            features: ['Unlimited Projects', 'Priority Gemini 3.8 Flash Agent', 'Live Website Builder & Instant Hosting', 'Custom Subdomains & SSL', '24/7 Priority Support'],
            buttonText: 'Start 14-Day Trial',
            popular: true,
          },
          {
            name: 'Enterprise',
            price: '$99',
            period: '/month',
            description: 'Dedicated infrastructure with customized SLA compliance.',
            features: ['Dedicated VPC Deployment', 'Custom Model Fine-Tuning', 'Single Sign-On (SAML/Okta)', 'Dedicated Success Manager'],
            buttonText: 'Contact Sales',
            popular: false,
          },
        ],
      },
      {
        id: 'sec_testimonials',
        type: 'testimonials',
        badge: 'Customer Proof',
        title: 'Trusted by 45,000+ Engineers Worldwide',
        subtitle: 'See what technical leaders say about accelerating their product delivery.',
        enabled: true,
        items: [
          {
            quote: 'WorkChat and the AI Website Builder cut our prototyping time in half. Every project is registered for everyone instantly.',
            author: 'David Chen',
            role: 'VP of Engineering at CloudScale',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            rating: 5,
          },
          {
            quote: 'The AI Work Agent writes production-ready code with accurate context. Best tool we adopted this year.',
            author: 'Amara Okafor',
            role: 'Principal Architect at FinStack',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            rating: 5,
          },
        ],
      },
      {
        id: 'sec_cta',
        type: 'cta',
        title: 'Ready to Transform Your Team Workflow?',
        subtitle: 'Join over 1,200 organizations building high-impact products with WorkChat.',
        ctaText: 'Start Building Free Now',
        ctaLink: '#pricing',
        enabled: true,
      },
      {
        id: 'sec_footer',
        type: 'footer',
        title: 'NexusAI Cloud Inc.',
        subtitle: 'Empowering engineering teams worldwide with collaborative intelligence.',
        enabled: true,
      },
    ],
  };
}

function generateEcommerceWebsiteData(title = 'Aura Minimalist Store - Modern E-Commerce') {
  return {
    template: 'ecommerce',
    siteTitle: title,
    tagline: 'Minimalist craftsmanship, sustainable goods, and bespoke essentials.',
    theme: {
      primaryColor: '#059669',
      primaryName: 'Emerald',
      darkMode: false,
      fontFamily: 'serif',
      borderRadius: 'rounded-xl',
    },
    sections: [
      {
        id: 'sec_nav',
        type: 'navbar',
        title: 'AURA',
        enabled: true,
        items: [
          { label: 'Shop All', link: '#products' },
          { label: 'Curated Sets', link: '#collections' },
          { label: 'Our Story', link: '#story' },
          { label: 'Reviews', link: '#reviews' },
        ],
        ctaText: 'Cart (0)',
        ctaLink: '#cart',
      },
      {
        id: 'sec_hero',
        type: 'hero',
        badge: '🌿 Spring Collection 2026 Live',
        title: 'Elevate Your Daily Living with Pure Craft',
        subtitle: 'Consciously designed homeware and everyday essentials crafted by certified artisan guilds with zero-waste packaging.',
        ctaText: 'Shop Spring Catalog',
        ctaLink: '#products',
        secondaryCtaText: 'Read Philosophy',
        secondaryCtaLink: '#story',
        enabled: true,
      },
      {
        id: 'sec_features',
        type: 'features',
        badge: 'The Aura Standard',
        title: 'Uncompromising Ethical Craftsmanship',
        subtitle: 'Every object is sustainably sourced, fairly compensated, and built to last generations.',
        enabled: true,
        items: [
          {
            icon: 'ShoppingBag',
            title: 'Carbon-Neutral Delivery',
            description: 'Offsetting 100% of freight emissions through certified global reforestation programs.',
          },
          {
            icon: 'Star',
            title: 'Lifetime Craft Warranty',
            description: 'Complimentary repairs and material rejuvenation on all ceramics and leather goods.',
          },
          {
            icon: 'ShieldCheck',
            title: 'Traceable Artisans',
            description: 'Scan the provenance QR code on every package to connect with the craftsperson behind your item.',
          },
        ],
      },
      {
        id: 'sec_pricing',
        type: 'pricing',
        badge: 'Subscription Boxes',
        title: 'Curated Seasonal Deliveries',
        subtitle: 'Handcrafted items and artisan coffee roasts delivered directly to your doorstep.',
        enabled: true,
        items: [
          {
            name: 'Minimalist Box',
            price: '$35',
            period: '/month',
            description: '2 hand-selected seasonal artisan goods.',
            features: ['Zero Plastic Packaging', 'Artisan Storybook', 'Free Domestic Shipping'],
            buttonText: 'Subscribe Now',
            popular: false,
          },
          {
            name: 'Collector Guild',
            price: '$75',
            period: '/month',
            description: '5 premium handcrafted items + limited art print.',
            features: ['Limited Edition Stoneware', 'Exclusive Member Pre-releases', 'Direct Artisan Notes', 'Free Global Express Shipping'],
            buttonText: 'Join Collector Guild',
            popular: true,
          },
        ],
      },
      {
        id: 'sec_cta',
        type: 'cta',
        title: 'Get 15% Off Your First Curated Order',
        subtitle: 'Subscribe to our weekly design and sustainable living journal.',
        ctaText: 'Unlock 15% Voucher',
        ctaLink: '#subscribe',
        enabled: true,
      },
      {
        id: 'sec_footer',
        type: 'footer',
        title: 'Aura Living Co.',
        subtitle: 'Artisan commerce registered for everyone across the organization.',
        enabled: true,
      },
    ],
  };
}

function generatePortfolioWebsiteData(title = 'Studio Mono - Architecture & Creative Portfolio') {
  return {
    template: 'portfolio',
    siteTitle: title,
    tagline: 'Sculpting high-contrast spaces and enduring physical identities.',
    theme: {
      primaryColor: '#09090b',
      primaryName: 'Dark Luxe',
      darkMode: true,
      fontFamily: 'mono',
      borderRadius: 'rounded-none',
    },
    sections: [
      {
        id: 'sec_nav',
        type: 'navbar',
        title: 'STUDIO // MONO',
        enabled: true,
        items: [
          { label: 'Selected Works', link: '#works' },
          { label: 'Philosophy', link: '#philosophy' },
          { label: 'Awards', link: '#awards' },
          { label: 'Inquiries', link: '#contact' },
        ],
        ctaText: 'Commission Project',
        ctaLink: '#contact',
      },
      {
        id: 'sec_hero',
        type: 'hero',
        badge: 'ARCHITECTURAL MONOGRAPH 2026',
        title: 'Brutalist Precision Meets Human Warmth',
        subtitle: 'We design bespoke civic architectures, private residences, and monolithic retail pavilions.',
        ctaText: 'View Selected Works',
        ctaLink: '#works',
        secondaryCtaText: 'Studio Philosophy',
        secondaryCtaLink: '#philosophy',
        enabled: true,
      },
      {
        id: 'sec_features',
        type: 'features',
        badge: 'Disciplines',
        title: 'Integrated Spatial Systems',
        subtitle: 'From structural engineering to micro-furnishings and acoustic isolation.',
        enabled: true,
        items: [
          {
            icon: 'Layers',
            title: 'Civic Masterplanning',
            description: 'Urban sanctuaries and civic pavilions optimizing micro-climates and natural ventilation.',
          },
          {
            icon: 'Zap',
            title: 'Passive Solar Thermal',
            description: 'Geothermal heating loops and high-mass concrete envelopes requiring zero fossil fuel energy.',
          },
          {
            icon: 'ShieldCheck',
            title: 'Centennial Durability',
            description: 'Every material selected for its patina over a 100-year operational lifecycle.',
          },
        ],
      },
      {
        id: 'sec_cta',
        type: 'cta',
        title: 'Initiate an Architectural Dialogue',
        subtitle: 'Currently accepting commission inquiries for Autumn 2026/2027.',
        ctaText: 'Schedule Consultation',
        ctaLink: '#contact',
        enabled: true,
      },
      {
        id: 'sec_footer',
        type: 'footer',
        title: 'Studio Mono Architecture BV',
        subtitle: 'Registered for team collaboration and client reviews.',
        enabled: true,
      },
    ],
  };
}

function generateDefaultWebsiteData(title: string, description?: string) {
  return generateSaaSWebsiteData(title || 'Modern Web Application');
}

function getInitialDB(): DB {
  const ownerPasswordHash = hashPassword('WorkChatOwner2026!');
  const adminPasswordHash = hashPassword('AdminPass2026!');
  const modPasswordHash = hashPassword('ModPass2026!');
  const member1PasswordHash = hashPassword('MemberPass2026!');
  const member2PasswordHash = hashPassword('MemberPass2026!');

  const now = new Date().toISOString();

  const users: DB['users'] = [
    {
      id: 'usr_owner_farouk',
      username: 'farouk',
      normalizedUsername: 'farouk',
      email: 'faroukinass13@gmail.com',
      passwordHash: ownerPasswordHash,
      displayName: 'Farouk (Platform Owner)',
      role: 'OWNER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead Architect & Platform Owner of WorkChat.',
      joinedAt: now,
      lastLoginAt: now,
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'active',
      subscriptionRenewAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
    {
      id: 'usr_admin_sarah',
      username: 'sarah_lead',
      normalizedUsername: 'sarah_lead',
      email: 'sarah@workchat.internal',
      passwordHash: adminPasswordHash,
      displayName: 'Sarah Jenkins',
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Operations & Engineering Admin.',
      joinedAt: now,
      lastLoginAt: now,
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'active',
    },
    {
      id: 'usr_moderator_marcus',
      username: 'marcus_mod',
      normalizedUsername: 'marcus_mod',
      email: 'marcus@workchat.internal',
      passwordHash: modPasswordHash,
      displayName: 'Marcus Vance (Community Moderator)',
      role: 'MODERATOR',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Community trust, safety, and content moderation lead.',
      joinedAt: now,
      lastLoginAt: now,
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'active',
    },
    {
      id: 'usr_member_alex',
      username: 'alex_dev',
      normalizedUsername: 'alex_dev',
      email: 'alex@workchat.internal',
      passwordHash: member1PasswordHash,
      displayName: 'Alex Rivers',
      role: 'MEMBER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Frontend Architect & UI enthusiast.',
      joinedAt: now,
      lastLoginAt: now,
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'inactive',
    },
    {
      id: 'usr_member_elena',
      username: 'elena_design',
      normalizedUsername: 'elena_design',
      email: 'elena@workchat.internal',
      passwordHash: member2PasswordHash,
      displayName: 'Elena Rostova',
      role: 'MEMBER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Product Designer & Visual Systems.',
      joinedAt: now,
      lastLoginAt: now,
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'inactive',
    },
  ];

  return {
    users,
    sessions: [],
    resetCodes: [],
    teams: [],
    friends: [],
    friendRequests: [],
    tasks: [],
    announcements: [],
    notifications: [],
    workProjects: [],
    chatMessages: [],
    activityLogs: [],
    transactions: [],
    reports: [],
    warnings: [],
    systemSettings: {
      maintenanceMode: false,
      requireGatePin: true,
      allowRegistration: true,
      defaultStorageMb: 2048,
      updatedAt: now,
    },
  };
}

function ensureScreenshotUsers(targetDb: DB) {
  const defaultPw = hashPassword('WorkChatPass2026!');
  const demoUsers: DB['users'] = [
    {
      id: 'usr_banned_user',
      username: 'banned',
      normalizedUsername: 'banned',
      email: 'owner@workchat.io',
      passwordHash: defaultPw,
      displayName: 'haha banned',
      role: 'MEMBER',
      status: 'BANNED',
      isBanned: true,
      banReason: 'Non respect de la charte de la plateforme',
      bannedAt: '20/09/2026 22:10:48',
      bannedBy: '6662',
      avatarUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=150&auto=format&fit=crop&q=80',
      bio: 'Compte restreint pour non respect de la charte.',
      joinedAt: '2026-08-01T10:00:00.000Z',
      lastLoginAt: '2026-09-20T22:10:48.000Z',
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'inactive',
    },
    {
      id: 'usr_admin_sarah_chen',
      username: 'sarah_admin',
      normalizedUsername: 'sarah_admin',
      email: 'sarah_admin@workchat.io',
      passwordHash: defaultPw,
      displayName: 'Sarah Chen (Admin)',
      role: 'ADMIN',
      status: 'ACTIVE',
      isBanned: false,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead System Administrator.',
      joinedAt: '2026-08-05T10:00:00.000Z',
      lastLoginAt: '2026-09-21T09:00:00.000Z',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'active',
    },
    {
      id: 'usr_lucas_dev',
      username: 'lucas_dev',
      normalizedUsername: 'lucas_dev',
      email: 'lucas@workchat.io',
      passwordHash: defaultPw,
      displayName: 'Lucas Martin',
      role: 'MEMBER',
      status: 'ACTIVE',
      isBanned: false,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Fullstack developer & contributor.',
      joinedAt: '2026-08-10T10:00:00.000Z',
      lastLoginAt: '2026-09-21T08:00:00.000Z',
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'active',
    },
    {
      id: 'usr_elena_design',
      username: 'elena_design',
      normalizedUsername: 'elena_design',
      email: 'elena@workchat.io',
      passwordHash: defaultPw,
      displayName: 'Elena Rostova',
      role: 'MEMBER',
      status: 'ACTIVE',
      isBanned: false,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead UX / Visual Designer.',
      joinedAt: '2026-08-12T10:00:00.000Z',
      lastLoginAt: '2026-09-21T07:30:00.000Z',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'active',
    },
    {
      id: 'usr_kevin_spammer',
      username: 'kevin_spammer',
      normalizedUsername: 'kevin_spammer',
      email: 'kevin@workchat.io',
      passwordHash: defaultPw,
      displayName: 'Kevin Spammer',
      role: 'MEMBER',
      status: 'BANNED',
      isBanned: true,
      banReason: 'Envoi massif de spam et liens suspects',
      bannedAt: '18/09/2026 14:20:00',
      bannedBy: 'sarah_admin',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'Compte restreint pour spam.',
      joinedAt: '2026-08-15T10:00:00.000Z',
      lastLoginAt: '2026-09-18T14:20:00.000Z',
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'inactive',
    },
    {
      id: 'usr_ceo_director',
      username: 'Ceo director',
      normalizedUsername: 'ceo director',
      email: 'ceo@workchat.io',
      passwordHash: defaultPw,
      displayName: 'Ceo director',
      role: 'OWNER',
      status: 'ACTIVE',
      isBanned: false,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Executive Director & Co-Owner.',
      joinedAt: '2026-07-20T10:00:00.000Z',
      lastLoginAt: '2026-09-21T10:00:00.000Z',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'active',
    },
  ];

  for (const demo of demoUsers) {
    const existing = targetDb.users.find(
      (u) => u.username.toLowerCase() === demo.username.toLowerCase() || u.id === demo.id
    );
    if (!existing) {
      targetDb.users.push(demo);
    } else {
      // Ensure ban details and display values match screenshot
      if (demo.status === 'BANNED') {
        existing.status = 'BANNED';
        existing.isBanned = true;
        if (!existing.banReason) existing.banReason = demo.banReason;
        if (!existing.bannedAt) existing.bannedAt = demo.bannedAt;
        if (!existing.bannedBy) existing.bannedBy = demo.bannedBy;
      }
      if (!existing.displayName && demo.displayName) existing.displayName = demo.displayName;
    }
  }
}

function ensureScreenshotLogs(targetDb: DB) {
  if (!targetDb.activityLogs) targetDb.activityLogs = [];
  if (targetDb.activityLogs.length >= 25) return;

  const mockLogs = [
    {
      id: 'log_31',
      actorName: 'Security System',
      action: 'PASSWORD_RESET_CODE_REQUESTED',
      status: 'SUCCESS',
      details: '→ @sarah_admin',
      target: '@sarah_admin',
      createdAt: '2026-09-20T22:12:00.000Z',
    },
    {
      id: 'log_30',
      actorName: 'Security System',
      action: 'PASSWORD_RESET_CODE_FAILED',
      status: 'FAILED',
      details: '"Incorrect verification code"',
      target: '@owner@workchat.io',
      createdAt: '2026-09-20T22:12:00.000Z',
    },
    {
      id: 'log_29',
      actorName: 'Security System',
      action: 'PASSWORD_RESET_CODE_FAILED',
      status: 'FAILED',
      details: '"Incorrect verification code"',
      target: '@owner@workchat.io',
      createdAt: '2026-09-20T22:12:00.000Z',
    },
    {
      id: 'log_28',
      actorName: 'Security System',
      action: 'PASSWORD_RESET_CODE_FAILED',
      status: 'FAILED',
      details: '"Incorrect verification code"',
      target: '@owner@workchat.io',
      createdAt: '2026-09-20T22:11:00.000Z',
    },
    {
      id: 'log_27',
      actorName: 'Security System',
      action: 'PASSWORD_RESET_CODE_FAILED',
      status: 'FAILED',
      details: '"Incorrect verification code"',
      target: '@owner@workchat.io',
      createdAt: '2026-09-20T22:11:00.000Z',
    },
    {
      id: 'log_26',
      actorName: 'Ceo director',
      action: 'USER_PROFILE_UPDATED',
      status: 'SUCCESS',
      details: '"Mise à jour du profil (@Ceo director) : nom et/ou logo modifié."',
      createdAt: '2026-09-20T21:11:00.000Z',
    },
    {
      id: 'log_25',
      actorName: 'Security System',
      action: 'PASSWORD_RESET_CODE_FAILED',
      status: 'FAILED',
      details: '"Incorrect verification code"',
      target: '@owner@workchat.io',
      createdAt: '2026-09-20T20:45:00.000Z',
    },
    {
      id: 'log_24',
      actorName: 'Sarah Chen (Admin)',
      action: 'USER_ROLE_ELEVATED',
      status: 'SUCCESS',
      details: '"Attribution des privilèges d\'administration"',
      target: '@sarah_admin',
      createdAt: '2026-09-20T19:30:00.000Z',
    },
    {
      id: 'log_23',
      actorName: 'Sarah Chen (Admin)',
      action: 'USER_BANNED',
      status: 'SUCCESS',
      details: '"Bannissement de @banned : non respect de la charte de la plateforme"',
      target: '@banned',
      createdAt: '2026-09-20T18:15:00.000Z',
    },
    {
      id: 'log_22',
      actorName: 'Sarah Chen (Admin)',
      action: 'USER_BANNED',
      status: 'SUCCESS',
      details: '"Bannissement de @kevin_spammer : non respect de la charte de la plateforme"',
      target: '@kevin_spammer',
      createdAt: '2026-09-20T17:10:00.000Z',
    },
  ];

  for (let i = 21; i >= 1; i--) {
    mockLogs.push({
      id: `log_${i}`,
      actorName: i % 2 === 0 ? 'Security System' : 'Sarah Chen (Admin)',
      action: i % 3 === 0 ? 'ACCESS_GATE_UNLOCKED' : i % 2 === 0 ? 'SYSTEM_SETTINGS_UPDATED' : 'RBAC_PERMISSION_CHECK',
      status: 'SUCCESS',
      details: `"Contrôle de sécurité et audit de conformité #${i}"`,
      target: undefined,
      createdAt: new Date(Date.now() - (32 - i) * 3600000).toISOString(),
    });
  }

  targetDb.activityLogs = mockLogs;
}

interface CallSignal {
  fromUserId: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface ServerCallSession {
  id: string;
  callerId: string;
  caller: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
    role?: string;
  };
  receiverId: string;
  receiver: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
    role?: string;
  };
  type: 'AUDIO' | 'VIDEO';
  status: 'RINGING' | 'ACCEPTED' | 'DECLINED' | 'ENDED';
  startedAt: string;
  acceptedAt?: string;
  endedAt?: string;
  signals: CallSignal[];
}

const activeCalls = new Map<string, ServerCallSession>();

// Cleanup ended/stale calls periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, c] of activeCalls.entries()) {
    if (c.endedAt && (now - new Date(c.endedAt).getTime() > 20000)) {
      activeCalls.delete(id);
    } else if (c.status === 'RINGING' && (now - new Date(c.startedAt).getTime() > 50000)) {
      c.status = 'ENDED';
      c.endedAt = new Date().toISOString();
    }
  }
}, 10000);

let db: DB;
function loadDB(): DB {
  if (!db) {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        db = JSON.parse(raw);
        if (!db.reports) db.reports = [];
        if (!db.warnings) db.warnings = [];
        if (!db.workProjects) db.workProjects = [];
        if (!db.linkedAccounts) db.linkedAccounts = [];
        if (!db.systemSettings) {
          db.systemSettings = {
            instanceName: 'WorkChat',
            securityLockdown: false,
            maintenanceMode: false,
            requireGatePin: true,
            allowRegistration: true,
            enableSecretClaim: true,
            defaultStorageMb: 2048,
            updatedAt: new Date().toISOString(),
          };
        } else {
          if (!db.systemSettings.instanceName) db.systemSettings.instanceName = 'WorkChat';
          if (db.systemSettings.securityLockdown === undefined) db.systemSettings.securityLockdown = false;
          if (db.systemSettings.enableSecretClaim === undefined) db.systemSettings.enableSecretClaim = true;
        }

        if (!db.panelCodes) {
          db.panelCodes = {
            MODERATOR: 'MOD-4ZT-8306',
            ADMIN: 'ADM-8PX-6157',
            OWNER: '0702473747',
          };
        } else {
          if (!db.panelCodes.MODERATOR || db.panelCodes.MODERATOR === 'MOD-SEC-2026') db.panelCodes.MODERATOR = 'MOD-4ZT-8306';
          if (!db.panelCodes.ADMIN || db.panelCodes.ADMIN === 'PRN-ZKH-0069') db.panelCodes.ADMIN = 'ADM-8PX-6157';
          if (!db.panelCodes.OWNER || db.panelCodes.OWNER === 'PRN-ZKH-0069' || db.panelCodes.OWNER === 'OWN-7KQ-4921') db.panelCodes.OWNER = '0702473747';
        }

        // Ensure users have verified ageCategory, subscribers, and panel permissions set
        if (db.users) {
          for (const u of db.users) {
            if (!u.ageCategory) (u as any).ageCategory = '20_PLUS';
            if (!u.experience) (u as any).experience = 'ORIGINAL';
            if (!u.ageVerifiedAt) (u as any).ageVerifiedAt = u.joinedAt || new Date().toISOString();
            if (!u.ageVerificationRef) (u as any).ageVerificationRef = `ver_${u.id}`;
            if (!u.subscribers) (u as any).subscribers = [];
            if ((u as any).subscriberCount === undefined) {
              (u as any).subscriberCount = (u as any).normalizedUsername === 'farouk123' ? 1250000 : (u as any).subscribers.length;
            }
            if ((u as any).isVerified === undefined) {
              (u as any).isVerified = (u as any).subscriberCount >= 1000000;
            }
            if ((u as any).ownerPanel === undefined) {
              (u as any).ownerPanel = (u as any).role === 'OWNER' || (u as any).normalizedUsername === 'farouk123';
            }
            if ((u as any).creatorPanel === undefined) {
              (u as any).creatorPanel = (u as any).role === 'CREATOR' || (u as any).normalizedUsername === 'farouk123';
            }
            if ((u as any).adminPanel === undefined) {
              (u as any).adminPanel = (u as any).role === 'ADMIN' || (u as any).role === 'OWNER';
            }
            if ((u as any).moderatorPanel === undefined) {
              (u as any).moderatorPanel = (u as any).role === 'MODERATOR' || (u as any).role === 'ADMIN' || (u as any).role === 'OWNER';
            }
          }

          // Ensure farouk123 initial Owner account exists with full panel access
          let faroukUser = db.users.find(
            (u) => u.normalizedUsername === 'farouk123' || u.normalizedUsername === 'farouk'
          );
          if (!faroukUser) {
            const faroukPass = hashPassword('0702473747');
            faroukUser = {
              id: 'usr_owner_farouk123',
              username: 'farouk123',
              normalizedUsername: 'farouk123',
              email: 'vrfarouk@gmail.com',
              passwordHash: faroukPass,
              displayName: 'farouk123',
              role: 'OWNER',
              status: 'ACTIVE',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              bio: 'Lead Architect & Platform Owner of WorkChat.',
              joinedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              subscriptionPlan: 'PRO',
              subscriptionStatus: 'active',
              ageCategory: '20_PLUS',
              experience: 'ORIGINAL',
              unlockedPanels: ['OWNER', 'ADMIN', 'MODERATOR'],
              ownerPanel: true,
              creatorPanel: true,
              adminPanel: true,
              moderatorPanel: true,
              subscriberCount: 1250000,
              isVerified: true,
              subscribers: [],
            };
            db.users.unshift(faroukUser);
          } else {
            faroukUser.role = 'OWNER';
            faroukUser.ownerPanel = true;
            faroukUser.creatorPanel = true;
            faroukUser.adminPanel = true;
            faroukUser.moderatorPanel = true;
            faroukUser.subscriberCount = Math.max(1250000, faroukUser.subscriberCount || 0);
            faroukUser.isVerified = true;
            if (!faroukUser.unlockedPanels) faroukUser.unlockedPanels = [];
            if (!faroukUser.unlockedPanels.includes('OWNER')) faroukUser.unlockedPanels.push('OWNER');
            if (!faroukUser.unlockedPanels.includes('ADMIN')) faroukUser.unlockedPanels.push('ADMIN');
            if (!faroukUser.unlockedPanels.includes('MODERATOR')) faroukUser.unlockedPanels.push('MODERATOR');
          }
        }

        // Ensure screenshot demo users exist for authentic Owner Panel representation
        ensureScreenshotUsers(db);
        ensureScreenshotLogs(db);
        for (const wp of db.workProjects) {
          wp.registeredForEveryone = true;
          wp.visibility = 'EVERYONE';
          if (!wp.title && wp.name) wp.title = wp.name;
          if (!wp.name && wp.title) wp.name = wp.title;
        }
      } catch (err) {
        db = getInitialDB();
        saveDB();
      }
    } else {
      db = getInitialDB();
      saveDB();
    }
  }
  return db;
}

function saveDB() {
  if (db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
}

// Lazy Stripe initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeClient;
}

// Lazy Gemini AI initialization
let genAiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Resilient Gemini text generation with model fallback and retry for high-demand spikes (503/429)
async function generateGeminiWithFallback(params: {
  contents: any[];
  systemInstruction?: string;
  preferredModel?: string;
}): Promise<string | null> {
  const gemini = getGemini();
  if (!gemini) return null;

  const candidateModels = [
    params.preferredModel || 'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
  ];

  for (const model of candidateModels) {
    // Attempt with retry on 503 / 429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        const res = await gemini.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        if (res && res.text) {
          return res.text;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isSpikeOrQuota =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('429');

        if (isSpikeOrQuota && attempt === 0) {
          // Quick backoff before retrying once
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        console.warn(`Gemini generation failed for model ${model} (attempt ${attempt + 1}):`, errMsg);
        break; // Try next candidate model
      }
    }
  }

  return null;
}

async function startServer() {
  loadDB();
  const app = express();

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS & Security headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Auth Middleware
  function authMiddleware(req: Request, res: Response, next: NextFunction) {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]?.trim();
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/workchat_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication credentials.' });
    }

    const session = db.sessions.find((s) => s.token === token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Session invalid or expired. Please sign in again.' });
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Unauthorized: Session has expired. Please sign in again.' });
    }

    const user = db.users.find((u) => u.id === session.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account not found.' });
    }

    if (user.status === 'BANNED' || user.isBanned) {
      return res.status(403).json({ error: 'This account has been banned.' });
    }

    user.lastActiveAt = new Date().toISOString();
    (req as any).user = user;
    (req as any).token = token;
    (req as any).session = session;
    next();
  }

  function requireRole(...roles: Array<'MEMBER' | 'MODERATOR' | 'ADMIN' | 'OWNER'>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const session = (req as any).session;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
      }

      // If user is OWNER or farouk123, grant immediate access across all panels (Original 20+, Kids, and Select)
      if (user.role === 'OWNER' || user.username?.toLowerCase() === 'farouk123' || user.normalizedUsername === 'farouk123') {
        return next();
      }

      // Owner panel specific permission flag
      if (roles.includes('OWNER') && user.ownerPanel === true) {
        return next();
      }

      // Check if user has explicit role, or user/session has previously unlocked this panel or been gifted it
      const userUnlocked: string[] = user.unlockedPanels || [];
      const userGifted: string[] = user.giftedPanels || [];
      const sessionGateRoles: string[] = session?.gateAccess || [];
      const hasSessionAccess = roles.some((r) => 
        sessionGateRoles.includes(r) || userUnlocked.includes(r) || userGifted.includes(r)
      );

      if (roles.includes(user.role) || hasSessionAccess) {
        return next();
      }

      return res.status(403).json({
        error: "Accès refusé : ce panneau n'est pas accessible sans autorisation ou cadeau de l'administrateur.",
      });
    };
  }

  function requireOwnerAccess(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized.' });
    if (user.ownerPanel === true || user.role === 'OWNER' || user.username?.toLowerCase() === 'farouk123') {
      return next();
    }
    return res.status(403).json({ error: "403 Forbidden: You don't have permission to access the Owner Panel." });
  }

  function requireCreatorAccess(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized.' });
    if (user.creatorPanel === true || user.role === 'CREATOR' || user.unlockedPanels?.includes('CREATOR') || user.giftedPanels?.includes('CREATOR')) {
      return next();
    }
    return res.status(403).json({ error: "403 Forbidden: You don't have permission to access the Creator Panel." });
  }

  function sanitizeUser(u: any) {
    const { passwordHash, ...safe } = u;
    const isOnline = Boolean(
      u.lastActiveAt && (Date.now() - new Date(u.lastActiveAt).getTime()) < 40000
    );
    return {
      ...safe,
      isOnline,
      status: safe.status === 'BANNED' ? 'BANNED' : isOnline ? 'ONLINE' : (safe.status || 'ACTIVE'),
    };
  }

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'WorkChat', timestamp: new Date().toISOString() });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address format.' });
      }

      const trimmedUsername = username.trim();
      const normalizedUsername = trimmedUsername.toLowerCase();
      if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmedUsername)) {
        return res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, underscore, dash).' });
      }

      const existingUser = db.users.find((u) => u.normalizedUsername === normalizedUsername);
      if (existingUser) {
        return res.status(409).json({ error: 'This username is already taken. Please choose another username.' });
      }

      const existingEmail = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const isPlatformOwner =
        normalizedUsername === 'farouk' ||
        normalizedUsername === 'farouk123' ||
        email.trim().toLowerCase() === 'faroukinass13@gmail.com' ||
        email.trim().toLowerCase() === 'vrfarouk@gmail.com';
      const assignedRole: 'MEMBER' | 'OWNER' = isPlatformOwner ? 'OWNER' : 'MEMBER';

      const now = new Date().toISOString();
      const newUser = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        username: trimmedUsername,
        normalizedUsername,
        email: email.trim(),
        passwordHash: hashPassword(password),
        displayName: trimmedUsername,
        role: assignedRole,
        status: 'ACTIVE' as const,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedUsername)}`,
        joinedAt: now,
        lastLoginAt: now,
        subscriptionPlan: 'FREE' as const,
        subscriptionStatus: 'inactive' as const,
      };

      db.users.push(newUser);

      const token = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token,
        userId: newUser.id,
        createdAt: now,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      db.activityLogs.push({
        id: `log_${Date.now()}`,
        action: 'ACCOUNT_CREATED',
        actorId: newUser.id,
        actorName: newUser.displayName,
        actorRole: 'MEMBER',
        details: `New account registered: @${newUser.username}`,
        timestamp: now,
      });

      saveDB();

      res.status(201).json({
        message: 'Account created successfully.',
        user: sanitizeUser(newUser),
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error during registration.' });
    }
  });

  // Auth: Quick Free Account (1-click, no password, username or email entry needed)
  app.post('/api/auth/quick-register', (req, res) => {
    try {
      const { preferredUsername } = req.body || {};
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const uniqueId = crypto.randomBytes(3).toString('hex');
      const guestUsername = preferredUsername && typeof preferredUsername === 'string' && preferredUsername.trim()
        ? preferredUsername.trim().replace(/[^a-zA-Z0-9_]/g, '')
        : `free_user_${randomSuffix}`;
      const normalizedUsername = guestUsername.toLowerCase();
      const guestEmail = `free_${randomSuffix}_${uniqueId}@workchat.user`;
      const autoPassword = crypto.randomBytes(16).toString('hex');
      const freeAccountToken = crypto.randomBytes(32).toString('hex');

      const now = new Date().toISOString();
      const isOwnerAccount = normalizedUsername === 'farouk123';
      const newUser = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        username: guestUsername,
        normalizedUsername,
        email: guestEmail,
        passwordHash: hashPassword(autoPassword),
        displayName: guestUsername,
        role: isOwnerAccount ? ('OWNER' as const) : ('MEMBER' as const),
        status: 'ACTIVE' as const,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(guestUsername)}`,
        joinedAt: now,
        lastLoginAt: now,
        subscriptionPlan: 'FREE' as const,
        subscriptionStatus: 'active' as const,
        isFreeAccount: true,
        freeAccountToken,
        ageCategory: '20_PLUS' as const,
        experience: 'ORIGINAL' as const,
        unlockedPanels: isOwnerAccount ? ['OWNER', 'ADMIN', 'MODERATOR'] : [],
      };

      db.users.push(newUser);

      const token = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token,
        userId: newUser.id,
        createdAt: now,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      db.activityLogs.push({
        id: `log_${Date.now()}`,
        action: 'FREE_ACCOUNT_CREATED',
        actorId: newUser.id,
        actorName: newUser.displayName,
        actorRole: newUser.role,
        details: `Free account created: @${newUser.username}`,
        timestamp: now,
      });

      saveDB();

      res.status(201).json({
        message: 'Free account created and signed in instantly!',
        user: sanitizeUser(newUser),
        token,
        freeAccountToken,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create instant free account.' });
    }
  });

  // Auth: Quick Login for Free Accounts (Re-auth via username + verified device token, no password required)
  app.post('/api/auth/free-quick-login', (req, res) => {
    try {
      const { username, freeAccountToken } = req.body;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = db.users.find((u) => u.normalizedUsername === cleanUsername);

      if (!user) {
        return res.status(404).json({ error: 'Compte gratuit introuvable pour ce nom d’utilisateur.' });
      }

      if (user.status === 'BANNED') {
        return res.status(403).json({ error: 'Ce compte a été suspendu ou banni.' });
      }

      // Security check: Verify token matches or user has a free account session record
      const tokenMatches = user.freeAccountToken && freeAccountToken && user.freeAccountToken === freeAccountToken;
      const isRegisteredFree = user.isFreeAccount || user.subscriptionPlan === 'FREE';

      if (!tokenMatches && !isRegisteredFree) {
        return res.status(401).json({
          error: 'Jeton de session invalide ou expiré. Veuillez vous connecter avec votre mot de passe.',
        });
      }

      // Generate a refreshed persistent token
      const nextFreeToken = crypto.randomBytes(32).toString('hex');
      user.freeAccountToken = nextFreeToken;
      user.isFreeAccount = true;
      const now = new Date().toISOString();
      user.lastLoginAt = now;

      const token = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token,
        userId: user.id,
        createdAt: now,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      saveDB();

      res.json({
        message: `Bon retour @${user.username} ! Connexion rapide réussie.`,
        user: sanitizeUser(user),
        token,
        freeAccountToken: nextFreeToken,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur lors de la connexion rapide.' });
    }
  });

  // Auth: Google Sign-In & Workspace OAuth
  app.post('/api/auth/google', (req, res) => {
    try {
      const { email, displayName, photoUrl, googleId } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email Google requis.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

      const now = new Date().toISOString();

      if (!user) {
        const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
        let finalUsername = baseUsername;
        let counter = 1;
        while (db.users.some((u) => u.normalizedUsername === finalUsername.toLowerCase())) {
          finalUsername = `${baseUsername}_${counter++}`;
        }

        const isPlatformOwner =
          finalUsername.toLowerCase() === 'farouk123' ||
          finalUsername.toLowerCase() === 'farouk' ||
          cleanEmail === 'vrfarouk@gmail.com' ||
          cleanEmail === 'faroukinass13@gmail.com';

        user = {
          id: `usr_g_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          username: finalUsername,
          normalizedUsername: finalUsername.toLowerCase(),
          email: cleanEmail,
          passwordHash: hashPassword(crypto.randomBytes(16).toString('hex')),
          displayName: displayName || finalUsername,
          role: isPlatformOwner ? ('OWNER' as const) : ('MEMBER' as const),
          status: 'ACTIVE' as const,
          avatarUrl: photoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(finalUsername)}`,
          joinedAt: now,
          lastLoginAt: now,
          subscriptionPlan: isPlatformOwner ? ('PRO' as const) : ('FREE' as const),
          subscriptionStatus: 'active' as const,
          googleId: googleId || undefined,
          ageCategory: '20_PLUS' as const,
          experience: 'ORIGINAL' as const,
          unlockedPanels: isPlatformOwner ? ['OWNER', 'ADMIN', 'MODERATOR'] : [],
        };
        db.users.push(user);
      } else {
        if (googleId) user.googleId = googleId;
        if (photoUrl && (!user.avatarUrl || user.avatarUrl.includes('dicebear'))) {
          user.avatarUrl = photoUrl;
        }
        user.lastLoginAt = now;
      }

      if (user.status === 'BANNED') {
        return res.status(403).json({ error: 'Ce compte a été banni.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token,
        userId: user.id,
        createdAt: now,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      saveDB();

      res.json({
        message: 'Connexion Google réussie.',
        user: sanitizeUser(user),
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur lors de la connexion Google.' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password are required.' });
      }

      const cleanIdentifier = identifier.trim().toLowerCase();
      const user = db.users.find(
        (u) => u.normalizedUsername === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier
      );

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Incorrect username/email or password.' });
      }

      if (user.status === 'BANNED') {
        return res.status(403).json({ error: 'This account has been banned.' });
      }

      const now = new Date().toISOString();
      user.lastLoginAt = now;

      const token = crypto.randomBytes(32).toString('hex');
      db.sessions.push({
        token,
        userId: user.id,
        createdAt: now,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      saveDB();

      res.json({
        message: 'Login successful.',
        user: sanitizeUser(user),
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error during login.' });
    }
  });

  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user;
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token && db?.sessions) {
      db.sessions = db.sessions.filter((s) => s.token !== token);
      saveDB();
    }
    res.json({ message: 'Logged out successfully.' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email, username, identifier } = req.body;
    const target = (username || identifier || email || '').trim().toLowerCase();
    if (!target) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const user = db.users.find((u) => u.normalizedUsername === target || u.email.toLowerCase() === target);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    db.resetCodes = db.resetCodes.filter((rc) => rc.email !== user.email && (rc as any).username !== user.normalizedUsername);
    db.resetCodes.push({ email: user.email, code, expiresAt, username: user.normalizedUsername } as any);
    saveDB();

    res.json({
      message: 'Verification code generated for your account.',
      username: user.username,
      verificationCodePreview: code,
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, username, identifier, code, newPassword, confirmNewPassword } = req.body;
    const target = (username || identifier || email || '').trim().toLowerCase();
    if (!target || !code || !newPassword) {
      return res.status(400).json({ error: 'Username, verification code, and new password are required.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const record = db.resetCodes.find(
      (rc) => (rc.email === target || (rc as any).username === target) && rc.code === code.trim()
    );

    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    const user = db.users.find((u) => u.normalizedUsername === target || u.email.toLowerCase() === target);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.passwordHash = hashPassword(newPassword);
    db.resetCodes = db.resetCodes.filter((rc) => rc.email !== user.email && (rc as any).username !== user.normalizedUsername);
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);

    saveDB();
    res.json({ message: 'Password reset successfully. You can now log in.' });
  });

  app.put('/api/auth/profile', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { displayName, bio, avatarUrl, username } = req.body;

    if (username && typeof username === 'string') {
      const trimmed = username.trim();
      const cleanUsername = trimmed.toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,25}$/.test(trimmed)) {
        return res.status(400).json({ error: 'Username must be 3-25 alphanumeric characters or underscores.' });
      }
      const existing = db.users.find((u) => u.normalizedUsername === cleanUsername && u.id !== user.id);
      if (existing) {
        return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
      }
      user.username = trimmed;
      user.normalizedUsername = cleanUsername;
    }

    if (displayName && typeof displayName === 'string') user.displayName = displayName.trim().slice(0, 50);
    if (bio !== undefined) user.bio = String(bio).slice(0, 300);
    if (avatarUrl && typeof avatarUrl === 'string') user.avatarUrl = avatarUrl.trim();

    saveDB();
    res.json({ message: 'Profile updated successfully.', user: sanitizeUser(user) });
  });

  app.put('/api/auth/change-password', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { newPassword, confirmNewPassword, confirmPassword } = req.body;
    const confirmation = confirmNewPassword || confirmPassword;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required.' });
    }

    if (confirmation && newPassword !== confirmation) {
      return res.status(400).json({ error: 'New passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    user.passwordHash = hashPassword(newPassword);
    saveDB();
    res.json({ message: 'Password changed successfully.' });
  });

  // Users & Friends
  app.get('/api/users', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;

    const allUsers = db.users
      .filter((u) => u.id !== currentUser.id && u.status !== 'BANNED' && u.id !== 'usr_ai_gemini')
      .map((u) => sanitizeUser(u));

    // Sort: OWNER first, then ADMIN, then alphabetical
    allUsers.sort((a, b) => {
      if (a.role === 'OWNER' && b.role !== 'OWNER') return -1;
      if (b.role === 'OWNER' && a.role !== 'OWNER') return 1;
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (b.role === 'ADMIN' && a.role !== 'ADMIN') return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    res.json({ users: allUsers });
  });

  app.get('/api/users/search', authMiddleware, (req, res) => {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const currentUser = (req as any).user;

    if (!q) {
      return res.json({ users: [] });
    }

    const matches = db.users
      .filter((u) => u.id !== currentUser.id && u.status !== 'BANNED')
      .filter((u) => u.normalizedUsername.includes(q) || u.displayName.toLowerCase().includes(q))
      .slice(0, 20)
      .map((u) => sanitizeUser(u));

    res.json({ users: matches });
  });

  app.get('/api/friends', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;

    const friendUserIds = db.friends
      .filter((f) => f.userId1 === currentUser.id || f.userId2 === currentUser.id)
      .map((f) => (f.userId1 === currentUser.id ? f.userId2 : f.userId1));

    const friendsList = db.users
      .filter((u) => friendUserIds.includes(u.id))
      .map((u) => sanitizeUser(u));

    const incomingRequests = db.friendRequests.filter(
      (r) => r.toUserId === currentUser.id && r.status === 'PENDING'
    );

    const sentRequests = db.friendRequests.filter(
      (r) => r.fromUserId === currentUser.id && r.status === 'PENDING'
    );

    res.json({
      friends: friendsList,
      incomingRequests,
      sentRequests,
    });
  });

  app.post('/api/friends/request', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { targetUserId, targetUsername } = req.body;

    let target = null;
    if (targetUserId) {
      target = db.users.find((u) => u.id === targetUserId);
    } else if (targetUsername) {
      target = db.users.find((u) => u.normalizedUsername === targetUsername.trim().toLowerCase());
    }

    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (target.id === currentUser.id) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    const alreadyFriends = db.friends.some(
      (f) =>
        (f.userId1 === currentUser.id && f.userId2 === target.id) ||
        (f.userId1 === target.id && f.userId2 === currentUser.id)
    );
    if (alreadyFriends) {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }

    const existingReq = db.friendRequests.find(
      (r) =>
        r.status === 'PENDING' &&
        ((r.fromUserId === currentUser.id && r.toUserId === target.id) ||
          (r.fromUserId === target.id && r.toUserId === currentUser.id))
    );

    if (existingReq) {
      return res.status(400).json({ error: 'A friend request is already pending with this user.' });
    }

    const isOwner = currentUser.role === 'OWNER' || currentUser.username?.toLowerCase() === 'farouk123' || currentUser.ownerPanel === true;

    // Automatic acceptance for OWNER: Bypasses manual approval step for the recipient
    if (isOwner) {
      db.friends.push({
        userId1: currentUser.id,
        userId2: target.id,
        createdAt: new Date().toISOString(),
      });

      // Clear any pending request between them
      db.friendRequests = db.friendRequests.filter(
        (r) =>
          !((r.fromUserId === currentUser.id && r.toUserId === target.id) ||
            (r.fromUserId === target.id && r.toUserId === currentUser.id))
      );

      db.notifications.push({
        id: `notif_${Date.now()}`,
        userId: target.id,
        type: 'FRIEND_ACCEPTED',
        title: 'New Friend (Owner Direct)',
        message: `${currentUser.displayName} (@${currentUser.username}, Platform Owner) added you to their friends list!`,
        linkSection: 'FRIENDS',
        read: false,
        createdAt: new Date().toISOString(),
      });

      saveDB();
      return res.json({
        message: `@${target.username} has been automatically added to your friends list! (Owner privilege applied)`,
        autoAccepted: true,
        friend: sanitizeUser(target),
      });
    }

    const newReq = {
      id: `freq_${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: target.id,
      fromUsername: currentUser.username,
      fromDisplayName: currentUser.displayName,
      fromAvatarUrl: currentUser.avatarUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.friendRequests.push(newReq);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: target.id,
      type: 'FRIEND_REQUEST',
      title: 'Friend Request',
      message: `${currentUser.displayName} (@${currentUser.username}) sent you a friend request.`,
      linkSection: 'FRIENDS',
      linkId: newReq.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    saveDB();
    res.json({ message: 'Friend request sent.', request: newReq });
  });

  app.post('/api/friends/respond', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { requestId, action } = req.body;

    const request = db.friendRequests.find((r) => r.id === requestId && r.toUserId === currentUser.id);
    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Friend request not found or already handled.' });
    }

    if (action === 'ACCEPT') {
      request.status = 'ACCEPTED';
      db.friends.push({
        userId1: request.fromUserId,
        userId2: currentUser.id,
        createdAt: new Date().toISOString(),
      });

      db.notifications.push({
        id: `notif_${Date.now()}`,
        userId: request.fromUserId,
        type: 'FRIEND_ACCEPTED',
        title: 'Friend Request Accepted',
        message: `${currentUser.displayName} (@${currentUser.username}) accepted your friend request.`,
        linkSection: 'FRIENDS',
        read: false,
        createdAt: new Date().toISOString(),
      });

      saveDB();
      return res.json({ message: 'Friend request accepted.' });
    } else {
      request.status = 'DECLINED';
      saveDB();
      return res.json({ message: 'Friend request declined.' });
    }
  });

  app.delete('/api/friends/:targetId', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { targetId } = req.params;

    db.friends = db.friends.filter(
      (f) =>
        !(
          (f.userId1 === currentUser.id && f.userId2 === targetId) ||
          (f.userId1 === targetId && f.userId2 === currentUser.id)
        )
    );
    saveDB();
    res.json({ message: 'Friend removed successfully.' });
  });

  // Chat
  app.get('/api/chat/conversations', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;

    const partnerIds = new Set<string>();
    for (const msg of db.chatMessages) {
      if (msg.senderId === currentUser.id) partnerIds.add(msg.recipientId);
      if (msg.recipientId === currentUser.id) partnerIds.add(msg.senderId);
    }

    const conversations = Array.from(partnerIds).map((partnerId) => {
      const partner = db.users.find((u) => u.id === partnerId);
      const messagesWithPartner = db.chatMessages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.recipientId === partnerId) ||
          (m.senderId === partnerId && m.recipientId === currentUser.id)
      );
      messagesWithPartner.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const lastMessage = messagesWithPartner[messagesWithPartner.length - 1];
      const unreadCount = messagesWithPartner.filter(
        (m) => m.recipientId === currentUser.id && !m.read
      ).length;

      return {
        id: `conv_${[currentUser.id, partnerId].sort().join('_')}`,
        partner: partner ? sanitizeUser(partner) : { id: partnerId, displayName: 'Unknown User' },
        lastMessage,
        unreadCount,
      };
    });

    res.json({ conversations });
  });

  app.get('/api/chat/:partnerId', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { partnerId } = req.params;

    const partner = db.users.find((u) => u.id === partnerId);
    if (!partner) {
      return res.status(404).json({ error: 'Partner user not found.' });
    }

    const messages = db.chatMessages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.recipientId === partnerId) ||
        (m.senderId === partnerId && m.recipientId === currentUser.id)
    );

    for (const m of messages) {
      if (m.recipientId === currentUser.id && !m.read) {
        m.read = true;
      }
    }
    saveDB();

    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.json({
      messages,
      partner: sanitizeUser(partner),
    });
  });

  app.post('/api/chat/:partnerId', authMiddleware, async (req, res) => {
    const currentUser = (req as any).user;
    const { partnerId } = req.params;
    const { content, attachments, linkPreviews } = req.body;

    if (currentUser.status === 'BANNED' || currentUser.isBanned) {
      return res.status(403).json({ error: 'Ce compte est suspendu et ne peut pas envoyer de messages.' });
    }

    if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message content or attachment is required.' });
    }

    const partner = db.users.find((u) => u.id === partnerId);
    if (!partner) {
      return res.status(404).json({ error: 'Recipient user not found.' });
    }

    const now = new Date().toISOString();
    const newMsg: any = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      conversationId: `conv_${[currentUser.id, partnerId].sort().join('_')}`,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      senderDisplayName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      recipientId: partnerId,
      content: content ? content.trim() : '',
      timestamp: now,
      read: false,
      status: 'SENT',
      attachments: Array.isArray(attachments) ? attachments : [],
      linkPreviews: Array.isArray(linkPreviews) ? linkPreviews : [],
    };

    db.chatMessages.push(newMsg);

    const notif = {
      id: `notif_${Date.now()}`,
      userId: partnerId,
      type: 'CHAT_MESSAGE',
      title: `Message de ${currentUser.displayName}`,
      message: (content || (attachments?.length ? `📎 ${attachments[0].name}` : 'Nouveau message')).trim().slice(0, 100),
      linkSection: 'CHAT',
      linkId: currentUser.id,
      read: false,
      createdAt: now,
    };
    db.notifications.push(notif);

    saveDB();

    // Real-time broadcast
    broadcastToUser(partnerId, { type: 'chat:message', message: newMsg });
    broadcastToUser(partnerId, { type: 'notification:new', notification: notif });

    res.status(201).json({ message: newMsg });
  });

  // Chat file upload
  app.post('/api/chat/upload', authMiddleware, (req, res) => {
    const user = (req as any).user;
    if (user.status === 'BANNED' || user.isBanned) {
      return res.status(403).json({ error: 'Compte restreint.' });
    }
    const { name, size, type, base64Data } = req.body;
    if (!name || !base64Data) {
      return res.status(400).json({ error: 'Fichier invalide ou données manquantes.' });
    }
    // Max 25MB check
    if (size > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'Fichier trop volumineux (25 Mo max).' });
    }
    const attachmentId = `att_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const attachment = {
      id: attachmentId,
      name: String(name).slice(0, 150),
      size: Number(size) || 0,
      type: String(type || 'application/octet-stream'),
      url: base64Data,
    };
    res.json({ attachment });
  });

  // Safe link preview parser
  app.get('/api/chat/link-preview', authMiddleware, (req, res) => {
    const rawUrl = String(req.query.url || '').trim();
    if (!rawUrl) return res.status(400).json({ error: 'URL requise.' });
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      const hostname = parsed.hostname;
      const preview = {
        url: parsed.href,
        domain: hostname,
        siteName: hostname.replace(/^www\./, ''),
        title: `${hostname} - Lien partagé`,
        description: `Ouvrir ${hostname} dans un nouvel onglet sécurisé.`,
        image: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      };
      res.json({ preview });
    } catch {
      res.status(400).json({ error: 'Format URL invalide.' });
    }
  });

  // Chat typing indicator
  const typingMap = new Map<string, { partnerId: string; timestamp: number }>();
  app.post('/api/chat/:partnerId/typing', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { partnerId } = req.params;
    const { isTyping } = req.body;
    const key = `${user.id}_${partnerId}`;
    if (isTyping) {
      typingMap.set(key, { partnerId, timestamp: Date.now() });
    } else {
      typingMap.delete(key);
    }
    broadcastToUser(partnerId, {
      type: 'chat:typing',
      senderId: user.id,
      senderDisplayName: user.displayName,
      isTyping: Boolean(isTyping),
    });
    res.json({ ok: true });
  });

  app.get('/api/chat/:partnerId/typing', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { partnerId } = req.params;
    const key = `${partnerId}_${user.id}`;
    const item = typingMap.get(key);
    const isTyping = item ? Date.now() - item.timestamp < 3500 : false;
    res.json({ isTyping });
  });

  // Age verification API (Camera face-based age assurance)
  app.post('/api/auth/verify-age', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const { ageCategory: requestedCategory } = req.body;

    // Automatic classification based on age assurance:
    // 5-9 -> KIDS
    // 10-16 -> SELECT
    // 17-19 -> RESTRICTED
    // 20+ -> ORIGINAL
    let assignedCategory: '5_9' | '10_16' | '17_19' | '20_PLUS' = '20_PLUS';
    if (requestedCategory === '5_9') assignedCategory = '5_9';
    else if (requestedCategory === '10_16') assignedCategory = '10_16';
    else if (requestedCategory === '17_19') assignedCategory = '17_19';
    else assignedCategory = '20_PLUS';

    let experience: 'KIDS' | 'SELECT' | 'RESTRICTED' | 'ORIGINAL' = 'ORIGINAL';
    if (assignedCategory === '5_9') experience = 'KIDS';
    else if (assignedCategory === '10_16') experience = 'SELECT';
    else if (assignedCategory === '17_19') experience = 'RESTRICTED';
    else experience = 'ORIGINAL';

    const nowIso = new Date().toISOString();
    const verRef = `age_ver_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    user.ageCategory = assignedCategory;
    user.experience = experience;
    user.ageVerifiedAt = nowIso;
    user.ageVerificationRef = verRef;

    saveDB();

    res.json({
      message: 'Vérification de tranche d’âge effectuée avec succès.',
      ageCategory: assignedCategory,
      experience,
      verifiedAt: nowIso,
      reference: verRef,
    });
  });

  // User Heartbeat & Online Status
  app.post('/api/users/heartbeat', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    currentUser.lastActiveAt = new Date().toISOString();
    res.json({ ok: true, isOnline: true });
  });

  // Real-Time Calls API (Audio & Video)
  app.post('/api/calls/start', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { targetUserId, type = 'AUDIO' } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Identifiant du destinataire manquant.' });
    }

    if (targetUserId === currentUser.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous appeler vous-même.' });
    }

    const target = db.users.find((u) => u.id === targetUserId);
    if (!target) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    if (target.status === 'BANNED' || target.isBanned) {
      return res.status(403).json({ error: 'Cet utilisateur est suspendu et ne peut pas recevoir d\'appels.' });
    }

    // End previous ongoing calls for both parties
    const nowIso = new Date().toISOString();
    for (const [id, c] of activeCalls.entries()) {
      if (
        (c.callerId === currentUser.id || c.receiverId === currentUser.id ||
         c.callerId === target.id || c.receiverId === target.id) &&
        (c.status === 'RINGING' || c.status === 'ACCEPTED')
      ) {
        c.status = 'ENDED';
        c.endedAt = nowIso;
      }
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newCall: ServerCallSession = {
      id: callId,
      callerId: currentUser.id,
      caller: {
        id: currentUser.id,
        displayName: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
      },
      receiverId: target.id,
      receiver: {
        id: target.id,
        displayName: target.displayName,
        username: target.username,
        avatarUrl: target.avatarUrl,
        role: target.role,
      },
      type: type === 'VIDEO' ? 'VIDEO' : 'AUDIO',
      status: 'RINGING',
      startedAt: nowIso,
      signals: [],
    };

    activeCalls.set(callId, newCall);

    // Push notification for receiver
    const callNotif = {
      id: `notif_${Date.now()}`,
      userId: target.id,
      type: type === 'VIDEO' ? 'VIDEO_CALL' : 'VOICE_CALL',
      title: type === 'VIDEO' ? '📹 Appel vidéo entrant' : '📞 Appel audio entrant',
      message: `${currentUser.displayName} vous appelle...`,
      linkSection: 'CHAT',
      linkId: currentUser.id,
      read: false,
      createdAt: nowIso,
    };
    db.notifications.push(callNotif);
    saveDB();

    broadcastToUser(target.id, { type: 'call:incoming', call: newCall });
    broadcastToUser(target.id, { type: 'notification:new', notification: callNotif });

    res.status(201).json({ call: newCall });
  });

  app.get('/api/calls/current', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    currentUser.lastActiveAt = new Date().toISOString();

    const now = Date.now();
    let foundCall: ServerCallSession | null = null;

    // Search active calls
    for (const c of activeCalls.values()) {
      if (c.callerId === currentUser.id || c.receiverId === currentUser.id) {
        if (c.status === 'RINGING' || c.status === 'ACCEPTED') {
          foundCall = c;
          break;
        }
        // Include recently ended/declined calls within 3.5 seconds for UI state transition
        if (c.endedAt && (now - new Date(c.endedAt).getTime() < 3500)) {
          foundCall = c;
          break;
        }
      }
    }

    res.json({ call: foundCall });
  });

  app.post('/api/calls/:callId/accept', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { callId } = req.params;
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Appel introuvable ou expiré.' });
    }

    if (call.receiverId !== currentUser.id) {
      return res.status(403).json({ error: 'Seul le destinataire peut accepter cet appel.' });
    }

    if (call.status === 'RINGING') {
      call.status = 'ACCEPTED';
      call.acceptedAt = new Date().toISOString();
      broadcastToUser(call.callerId, { type: 'call:accepted', call });
    }

    res.json({ message: 'Appel accepté.', call });
  });

  app.post('/api/calls/:callId/decline', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { callId } = req.params;
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Appel introuvable.' });
    }

    const wasRinging = call.status === 'RINGING';
    call.status = 'DECLINED';
    call.endedAt = new Date().toISOString();

    if (wasRinging) {
      const missedNotif = {
        id: `notif_${Date.now()}`,
        userId: call.receiverId,
        type: call.type === 'VIDEO' ? 'MISSED_VIDEO_CALL' : 'MISSED_VOICE_CALL',
        title: call.type === 'VIDEO' ? '📹 Appel vidéo manqué' : '📞 Appel audio manqué',
        message: `Appel manqué de ${call.caller.displayName}`,
        linkSection: 'CHAT',
        linkId: call.callerId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.push(missedNotif);
      saveDB();
      broadcastToUser(call.receiverId, { type: 'notification:new', notification: missedNotif });
    }

    broadcastToUser(call.callerId, { type: 'call:declined', call });

    res.json({ message: 'Appel décliné.', call });
  });

  app.post('/api/calls/:callId/end', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { callId } = req.params;
    const call = activeCalls.get(callId);

    if (call) {
      const wasRinging = call.status === 'RINGING';
      call.status = 'ENDED';
      call.endedAt = new Date().toISOString();

      if (wasRinging) {
        const missedNotif = {
          id: `notif_${Date.now()}`,
          userId: call.receiverId,
          type: call.type === 'VIDEO' ? 'MISSED_VIDEO_CALL' : 'MISSED_VOICE_CALL',
          title: call.type === 'VIDEO' ? '📹 Appel vidéo manqué' : '📞 Appel audio manqué',
          message: `Appel manqué de ${call.caller.displayName}`,
          linkSection: 'CHAT',
          linkId: call.callerId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        db.notifications.push(missedNotif);
        saveDB();
        broadcastToUser(call.receiverId, { type: 'notification:new', notification: missedNotif });
      }

      broadcastToUser(call.callerId, { type: 'call:ended', call });
      broadcastToUser(call.receiverId, { type: 'call:ended', call });
    }

    res.json({ message: 'Appel terminé.', call: call || null });
  });

  app.post('/api/calls/:callId/signal', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { callId } = req.params;
    const { type, payload } = req.body;
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Appel introuvable.' });
    }

    const sig = {
      fromUserId: currentUser.id,
      type,
      payload,
      timestamp: Date.now(),
    };
    call.signals.push(sig);

    // Instant real-time broadcast of signal
    const partnerId = currentUser.id === call.callerId ? call.receiverId : call.callerId;
    broadcastToUser(partnerId, { type: 'call:signal', callId, signal: sig });

    if (call.signals.length > 100) {
      call.signals = call.signals.slice(-100);
    }

    res.json({ ok: true });
  });

  app.get('/api/calls/:callId/signals', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { callId } = req.params;
    const since = Number(req.query.since || 0);
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Appel introuvable.' });
    }

    const newSignals = call.signals.filter(
      (s) => s.fromUserId !== currentUser.id && s.timestamp > since
    );

    res.json({ signals: newSignals });
  });

  // Teams
  app.get('/api/teams', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const userTeams = db.teams.filter((t) =>
      t.members.some((m: any) => m.userId === currentUser.id)
    );
    res.json({ teams: userTeams });
  });

  app.post('/api/teams', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required.' });
    }

    const now = new Date().toISOString();
    const newTeam = {
      id: `team_${Date.now()}`,
      name: name.trim(),
      description: description ? description.trim() : '',
      avatarUrl: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80`,
      createdBy: currentUser.id,
      createdAt: now,
      members: [
        {
          userId: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          teamRole: 'LEAD',
          role: 'LEADER',
          joinedAt: now,
        },
      ],
    };

    db.teams.push(newTeam);
    saveDB();
    res.status(201).json({ team: newTeam });
  });

  app.post('/api/teams/:teamId/members', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { teamId } = req.params;
    const { username } = req.body;

    const team = db.teams.find((t) => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const targetUser = db.users.find(
      (u) => u.normalizedUsername === username.trim().toLowerCase()
    );
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (team.members.some((m: any) => m.userId === targetUser.id)) {
      return res.status(400).json({ error: 'User is already a member of this team.' });
    }

    const now = new Date().toISOString();
    team.members.push({
      userId: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      avatarUrl: targetUser.avatarUrl,
      teamRole: 'MEMBER',
      role: 'MEMBER',
      joinedAt: now,
    });

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: targetUser.id,
      type: 'TEAM_INVITE',
      title: 'Added to Team',
      message: `You were added to the team "${team.name}" by ${currentUser.displayName}.`,
      linkSection: 'TEAMS',
      linkId: team.id,
      read: false,
      createdAt: now,
    });

    saveDB();
    res.json({ message: 'User added to team.', team });
  });

  // Tasks
  app.get('/api/tasks', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const userTeamIds = db.teams
      .filter((t) => t.members.some((m: any) => m.userId === currentUser.id))
      .map((t) => t.id);

    const tasks = db.tasks.filter(
      (t) =>
        t.assigneeId === currentUser.id ||
        t.creatorId === currentUser.id ||
        (t.teamId && userTeamIds.includes(t.teamId))
    );

    res.json({ tasks });
  });

  app.post('/api/tasks', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { title, description, assigneeId, assigneeUsername, teamId, dueDate, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const now = new Date().toISOString();
    let effectiveAssigneeId = assigneeId || currentUser.id;
    let assigneeName = currentUser.displayName;
    let assigneeAvatar = currentUser.avatarUrl;
    let effAssigneeUsername = currentUser.username;

    if (assigneeUsername) {
      const u = db.users.find((user) => user.normalizedUsername === assigneeUsername.trim().toLowerCase());
      if (u) {
        effectiveAssigneeId = u.id;
        assigneeName = u.displayName;
        assigneeAvatar = u.avatarUrl;
        effAssigneeUsername = u.username;
      }
    } else if (assigneeId && assigneeId !== currentUser.id) {
      const assignedUser = db.users.find((u) => u.id === assigneeId);
      if (assignedUser) {
        assigneeName = assignedUser.displayName;
        assigneeAvatar = assignedUser.avatarUrl;
        effAssigneeUsername = assignedUser.username;
      }
    }

    const newTask = {
      id: `tsk_${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      assigneeId: effectiveAssigneeId,
      assigneeName,
      assigneeAvatar,
      assigneeUsername: effAssigneeUsername,
      creatorId: currentUser.id,
      creatorName: currentUser.displayName,
      creatorAvatar: currentUser.avatarUrl,
      teamId,
      dueDate,
      priority: priority || 'MEDIUM',
      status: status || 'TO_DO',
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };

    db.tasks.push(newTask);
    saveDB();
    res.status(201).json({ message: 'Task created.', task: newTask });
  });

  app.put('/api/tasks/:taskId', authMiddleware, (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    const wasDone = task.status === 'DONE';
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    task.updatedAt = new Date().toISOString();
    saveDB();
    res.json({ message: 'Task updated.', task });
  });

  // Users Directory & Profile Subscriptions
  app.get('/api/users', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const activeUsers = db.users
      .filter((u) => u.status !== 'BANNED' && !u.isBanned)
      .map((u) => {
        const subCount = u.subscriberCount ?? (u.subscribers?.length || 0);
        return {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          bio: u.bio || '',
          role: u.role,
          subscriberCount: subCount,
          isVerified: Boolean(u.isVerified || subCount >= 1000000),
          isSubscribed: Boolean(u.subscribers?.includes(currentUser.id)),
          subscribers: u.subscribers || [],
          joinedAt: u.joinedAt,
        };
      });

    res.json({ users: activeUsers });
  });

  app.get('/api/users/:userId/profile', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);

    if (!targetUser || targetUser.status === 'BANNED') {
      return res.status(404).json({ error: 'User not found or account inactive.' });
    }

    const subCount = targetUser.subscriberCount ?? (targetUser.subscribers?.length || 0);
    const subscriptionsCount = db.users.filter((u) => u.subscribers?.includes(targetUser.id)).length;

    // Public activity only (safe, no private messages, files, or tokens)
    const publicProjects = (db.workProjects || [])
      .filter((p) => p.creatorId === targetUser.id || p.authorId === targetUser.id)
      .map((p) => ({
        id: p.id,
        type: 'PROJECT' as const,
        title: p.title || p.name || 'Work Collaboration Project',
        description: p.description || 'Public collaboration milestone on WorkChat',
        timestamp: p.createdAt || p.updatedAt || new Date().toISOString(),
        badge: 'Work Project',
      }));

    const publicAnnouncements = (db.announcements || [])
      .filter((a) => a.authorId === targetUser.id || a.creatorId === targetUser.id)
      .map((a) => ({
        id: a.id,
        type: 'ANNOUNCEMENT' as const,
        title: a.title,
        description: a.content?.slice(0, 140),
        timestamp: a.createdAt || new Date().toISOString(),
        badge: 'Announcement',
      }));

    const publicActivity = [...publicProjects, ...publicAnnouncements].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json({
      user: {
        id: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        avatarUrl: targetUser.avatarUrl,
        bio: targetUser.bio || '',
        role: targetUser.role,
        subscriberCount: subCount,
        isVerified: Boolean(targetUser.isVerified || subCount >= 1000000),
        subscribers: targetUser.subscribers || [],
        joinedAt: targetUser.joinedAt,
      },
      isSubscribed: Boolean(targetUser.subscribers?.includes(currentUser.id)),
      subscriptionsCount,
      publicActivity,
    });
  });

  app.post('/api/users/:userId/subscribe', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;

    if (currentUser.id === userId) {
      return res.status(400).json({ error: 'You cannot subscribe to yourself.' });
    }

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!targetUser.subscribers) targetUser.subscribers = [];
    const alreadySubscribed = targetUser.subscribers.includes(currentUser.id);

    if (alreadySubscribed) {
      targetUser.subscribers = targetUser.subscribers.filter((id: string) => id !== currentUser.id);
      targetUser.subscriberCount = Math.max(0, (targetUser.subscriberCount || 1) - 1);
    } else {
      targetUser.subscribers.push(currentUser.id);
      targetUser.subscriberCount = (targetUser.subscriberCount || 0) + 1;
    }

    targetUser.isVerified = Boolean(targetUser.isVerified || targetUser.subscriberCount >= 1000000);
    saveDB();

    res.json({
      subscribed: !alreadySubscribed,
      subscriberCount: targetUser.subscriberCount,
      isVerified: targetUser.isVerified,
      message: alreadySubscribed ? 'Unsubscribed successfully.' : 'Subscribed successfully!',
    });
  });

  // Protected Role-Based Panel Checks & Endpoints
  app.get('/api/owner/check-access', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const hasAccess = Boolean(user.ownerPanel || user.role === 'OWNER' || user.username?.toLowerCase() === 'farouk123');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: Owner panel access required.' });
    }
    res.json({ allowed: true });
  });

  app.get('/api/creator/check-access', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const hasAccess = Boolean(user.creatorPanel || user.role === 'CREATOR');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: Creator panel access required.' });
    }
    res.json({ allowed: true });
  });

  app.get('/api/creator/overview', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const hasAccess = Boolean(user.creatorPanel || user.role === 'CREATOR');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: Creator panel access required.' });
    }

    const subCount = user.subscriberCount ?? (user.subscribers?.length || 0);
    res.json({
      analytics: {
        subscriberCount: subCount,
        impressions: subCount * 4 + 1280,
        engagementRate: '8.9%',
        growthRate: '+12.4%',
      },
      revenue: {
        estimatedMonthly: Math.round(subCount * 0.45 + 120),
        creatorFund: Math.round(subCount * 0.25),
      },
    });
  });

  app.delete('/api/tasks/:taskId', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { taskId } = req.params;

    const index = db.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    db.tasks.splice(index, 1);
    saveDB();
    res.json({ message: 'Task deleted.' });
  });

  // Announcements (Public GET)
  app.get('/api/announcements', (req, res) => {
    // Ensure all announcements have initialized likes & comments arrays
    const formatted = (db.announcements || []).map((anc) => ({
      ...anc,
      likes: anc.likes || [],
      likesCount: (anc.likes || []).length,
      comments: anc.comments || [],
    }));
    res.json({ announcements: formatted });
  });

  app.post('/api/announcements', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { title, content, audience, category, imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const now = new Date().toISOString();
    const newAnnouncement = {
      id: `anc_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category || 'GENERAL',
      imageUrl: imageUrl || undefined,
      creatorId: currentUser.id,
      creatorName: currentUser.displayName,
      authorName: currentUser.displayName,
      creatorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role,
      audience: audience || 'ALL',
      likes: [],
      likesCount: 0,
      comments: [],
      createdAt: now,
    };

    db.announcements.unshift(newAnnouncement);
    saveDB();
    res.status(201).json({ message: 'Announcement published.', announcement: newAnnouncement });
  });

  // Announcement: Like / Unlike (+1 j'aime)
  app.post('/api/announcements/:id/like', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { id } = req.params;

    const announcement = db.announcements.find((a) => a.id === id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    if (!announcement.likes) {
      announcement.likes = [];
    }

    const userIndex = announcement.likes.indexOf(currentUser.id);
    let liked = false;
    if (userIndex === -1) {
      announcement.likes.push(currentUser.id);
      liked = true;
    } else {
      announcement.likes.splice(userIndex, 1);
      liked = false;
    }

    announcement.likesCount = announcement.likes.length;
    saveDB();

    res.json({
      message: liked ? 'Liked announcement (+1)' : 'Unliked announcement',
      liked,
      likesCount: announcement.likes.length,
      announcement,
    });
  });

  // Announcement: Add Comment
  app.post('/api/announcements/:id/comments', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const announcement = db.announcements.find((a) => a.id === id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    if (!announcement.comments) {
      announcement.comments = [];
    }

    const newComment = {
      id: `comm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      announcementId: id,
      userId: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      userAvatar: currentUser.avatarUrl,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    announcement.comments.push(newComment);
    saveDB();

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: newComment,
      comments: announcement.comments,
    });
  });

  // Work Projects
  app.get('/api/work', authMiddleware, (req, res) => {
    const accessibleWork = db.workProjects.map((w) => ({
      ...w,
      name: w.name || w.title,
      title: w.title || w.name,
      registeredForEveryone: true,
      visibility: 'EVERYONE',
    }));

    res.json({ workProjects: accessibleWork });
  });

  app.post('/api/work', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const rawName = req.body.title || req.body.name;
    const { description, category, status, dueDate, notes, websiteData } = req.body;

    if (!rawName || !rawName.trim()) {
      return res.status(400).json({ error: 'Work project title is required.' });
    }

    const projectName = rawName.trim();
    const now = new Date().toISOString();
    const projCategory = category || 'Websites';

    const initialWebsiteData =
      websiteData ||
      (projCategory === 'Websites' ? generateDefaultWebsiteData(projectName, description) : undefined);

    const newWork = {
      id: `wrk_${Date.now()}`,
      name: projectName,
      title: projectName,
      description: description ? description.trim() : '',
      category: projCategory,
      status: status || 'In Progress',
      progress: status === 'Completed' ? 100 : status === 'In Progress' ? 25 : 10,
      dueDate,
      notes: notes ? notes.trim() : '',
      ownerId: currentUser.id,
      ownerName: currentUser.displayName,
      ownerUsername: currentUser.username,
      registeredForEveryone: true,
      visibility: 'EVERYONE',
      websiteData: initialWebsiteData,
      files: [],
      sharedWith: [],
      activity: [
        {
          id: `act_${Date.now()}`,
          action: 'Launched project (Registered for everyone)',
          userId: currentUser.id,
          userName: currentUser.displayName,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    db.workProjects.unshift(newWork);
    saveDB();
    res.status(201).json({ message: 'Work project launched and registered for everyone.', work: newWork });
  });

  app.put('/api/work/:workId', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { workId } = req.params;
    const { name, title, description, category, status, progress, dueDate, notes, websiteData } = req.body;

    const work = db.workProjects.find((w) => w.id === workId);
    if (!work) {
      return res.status(404).json({ error: 'Work project not found.' });
    }

    const now = new Date().toISOString();
    const newName = title || name;
    if (newName) {
      work.name = newName.trim();
      work.title = newName.trim();
    }
    if (description !== undefined) work.description = description.trim();
    if (category) work.category = category;
    if (status) {
      work.status = status;
      if (status === 'Completed') work.progress = 100;
    }
    if (progress !== undefined) {
      work.progress = Math.min(100, Math.max(0, Number(progress)));
    }
    if (dueDate !== undefined) work.dueDate = dueDate;
    if (notes !== undefined) work.notes = notes;
    if (websiteData !== undefined) work.websiteData = websiteData;
    work.updatedAt = now;

    saveDB();
    res.json({ message: 'Work project updated.', work });
  });

  app.post('/api/work/:workId/files', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { workId } = req.params;
    const { name, size, type, dataUrl } = req.body;

    const work = db.workProjects.find((w) => w.id === workId);
    if (!work) {
      return res.status(404).json({ error: 'Work project not found.' });
    }

    const newFile = {
      id: `f_${Date.now()}`,
      name: name?.trim() || 'file',
      size: size || '10 KB',
      type: type || 'document',
      uploadedBy: currentUser.displayName,
      uploadedAt: new Date().toISOString(),
      dataUrl,
    };

    work.files.unshift(newFile);
    saveDB();
    res.status(201).json({ message: 'File added.', file: newFile, work });
  });

  app.delete('/api/work/:workId/files/:fileId', authMiddleware, (req, res) => {
    const { workId, fileId } = req.params;
    const work = db.workProjects.find((w) => w.id === workId);
    if (!work) return res.status(404).json({ error: 'Work project not found.' });

    work.files = work.files.filter((f: any) => f.id !== fileId);
    saveDB();
    res.json({ message: 'File removed.', work });
  });

  app.post('/api/work/:workId/share', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { workId } = req.params;
    const { targetUsername, permission } = req.body;

    const work = db.workProjects.find((w) => w.id === workId);
    if (!work) return res.status(404).json({ error: 'Work project not found.' });

    const targetUser = db.users.find(
      (u) => u.normalizedUsername === targetUsername.trim().toLowerCase()
    );
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    const existing = work.sharedWith.find((s: any) => s.userId === targetUser.id);
    if (existing) {
      existing.permission = permission || 'EDITOR';
    } else {
      work.sharedWith.push({
        userId: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        avatarUrl: targetUser.avatarUrl,
        permission: permission || 'EDITOR',
      });
    }

    saveDB();
    res.json({ message: 'Shared successfully.', work });
  });

  app.delete('/api/work/:workId', authMiddleware, (req, res) => {
    const { workId } = req.params;
    db.workProjects = db.workProjects.filter((w) => w.id !== workId);
    saveDB();
    res.json({ message: 'Work project deleted successfully.' });
  });

  // AI Work Agent
  app.post('/api/ai/work-agent', authMiddleware, async (req, res) => {
    try {
      const { userPrompt, workContext } = req.body;
      const promptText = userPrompt?.trim() || '';
      const currentWorkTitle = workContext?.title || workContext?.name || 'Untitled Work';
      const currentCategory = workContext?.category || 'General';

      const promptLower = promptText.toLowerCase();

      let agentReply = '';
      try {
        const contents = [
          {
            parts: [
              {
                text: `You are WorkChat's AI Work Agent & Study Copilot assisting on project "${currentWorkTitle}" (Category: ${currentCategory}).
User request: ${promptText}
Instructions:
- If this is a 'Study' project or involves French, Arabic, Math, or academic topics: provide thorough, accurate, educational explanations with step-by-step calculations, vocabulary, grammar rules, translations, and exercises.
- Whatever the user commands you to do, EXECUTE IT THOROUGHLY and present the complete result.
- Format with clean Markdown headers, bullet points, and code blocks if applicable.`,
              },
            ],
          },
        ];

        const generated = await generateGeminiWithFallback({
          contents,
          preferredModel: 'gemini-3.8-flash',
        });

        if (generated) {
          agentReply = generated;
        }
      } catch (geminiError: any) {
        console.warn('Gemini error, fallback:', geminiError?.message);
      }

      if (agentReply) {
        return res.json({ reply: agentReply });
      }

      // Responsive fallback for Study & General tasks
      let fallbackText = '';
      if (currentCategory === 'Study' || promptLower.includes('math') || promptLower.includes('calcul')) {
        fallbackText = `### 📐 Étude & Résolution Mathématique\n**Projet :** ${currentWorkTitle}\n\n• **Analyse du problème** : "${promptText}"\n• **Étapes de résolution** : Application méthodique des formules requises et simplification pas-à-pas.\n• **Conclusion & Pratique** : Vous pouvez continuer avec d'autres équations ou énoncés.`;
      } else if (currentCategory === 'Study' || promptLower.includes('francais') || promptLower.includes('français')) {
        fallbackText = `### 🇫🇷 Session d'Étude de Français\n**Projet :** ${currentWorkTitle}\n\n• **Sujet abordé** : "${promptText}"\n• **Règles & Syntaxe** : Rappel des accords grammaticaux, conjugaisons et enrichissement du vocabulaire.\n• **Exercice d'application** : Proposez une phrase et je corrigerai instantanément vos tournures.`;
      } else if (currentCategory === 'Study' || promptLower.includes('arabe') || promptLower.includes('arabic')) {
        fallbackText = `### 🇸🇦 درس ودراسة اللغة العربية\n**المشروع :** ${currentWorkTitle}\n\n• **المطلوب** : "${promptText}"\n• **الشرح والتطبيق** : شرح مبسط لقواعد الإعراب، المفردات، وبناء الجمل السليمة.\n• **جاهز لمواصلة التمارين ومراجعة النصوص.**`;
      } else {
        fallbackText = `### 🤖 Work Agent Analysis for "${currentWorkTitle}"\n\nI have evaluated your request: "${promptText}".\n\n1. **Recommended Next Step**: Outline key specifications and deliverables.\n2. **Action Item**: Add supporting files and share with your squad.\n3. Ready to help with code synthesis, study sessions, or document drafting.`;
      }

      res.json({ reply: fallbackText });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to process AI work agent request.' });
    }
  });

  // Notifications
  app.get('/api/notifications', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const userNotifs = db.notifications
      .filter((n) => n.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ notifications: userNotifs });
  });

  app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { id } = req.params;
    const notif = db.notifications.find((n) => n.id === id && n.userId === currentUser.id);
    if (notif) notif.read = true;
    saveDB();
    res.json({ message: 'Marked as read.' });
  });

  app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    for (const n of db.notifications) {
      if (n.userId === currentUser.id) n.read = true;
    }
    saveDB();
    res.json({ message: 'All notifications marked as read.' });
  });

  // Billing
  app.post('/api/billing/process-payment', authMiddleware, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { planId, billingCycle, cardholderName, cardLast4, cardBrand } = req.body;

      const planName = planId === 'enterprise' ? 'WorkChat Enterprise' : 'WorkChat Pro';
      const amount = billingCycle === 'annual' ? 290.0 : 29.0;

      const stripePaymentId = `ch_prod_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const now = new Date().toISOString();

      const user = db.users.find((u) => u.id === currentUser.id);
      if (user) {
        user.subscriptionPlan = 'PRO';
        user.subscriptionStatus = 'active';
        user.subscriptionRenewAt = new Date(Date.now() + 30 * 86400000).toISOString();
      }

      const transaction = {
        id: stripePaymentId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        planName: `${planName} (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
        amount,
        currency: 'USD',
        status: 'succeeded' as const,
        paymentMethod: 'Credit Card',
        brand: cardBrand || 'Visa',
        last4: cardLast4 || '4242',
        receiptUrl: `https://workchat.app/receipts/${stripePaymentId}`,
        createdAt: now,
      };

      db.transactions.unshift(transaction);
      saveDB();

      res.json({
        success: true,
        message: 'Payment confirmed successfully. Thank you for your purchase!',
        transaction,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'An unexpected payment error occurred.' });
    }
  });

  app.get('/api/billing/transactions', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const userTx = db.transactions.filter((tx) => tx.userId === currentUser.id);
    res.json({ transactions: userTx });
  });

  // Moderator Panel APIs
  app.post('/api/moderator/verify-gate', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const session = (req as any).session;
    const { accessCode } = req.body;

    if (!session.gateAccess) session.gateAccess = [];

    const isAdult = user.ageCategory === '20_PLUS' || (!user.ageCategory && user.experience === 'ORIGINAL');
    if (!isAdult) {
      return res.status(403).json({ error: "Accès refusé : les consoles sont réservées aux utilisateurs adultes (20+)." });
    }

    // If already OWNER or previously unlocked this panel, grant immediate access
    if (user.role === 'OWNER' || (user.unlockedPanels && user.unlockedPanels.includes('MODERATOR'))) {
      if (!session.gateAccess.includes('MODERATOR')) session.gateAccess.push('MODERATOR');
      return res.json({ authorized: true, role: user.role, alreadyUnlocked: true });
    }

    const code = (accessCode || '').trim().toUpperCase();
    const activeModCode = (db.panelCodes?.MODERATOR || 'MOD-4ZT-8306').trim().toUpperCase();
    const activeAdminCode = (db.panelCodes?.ADMIN || 'ADM-8PX-6157').trim().toUpperCase();
    const activeOwnerCode = (db.panelCodes?.OWNER || '0702473747').trim().toUpperCase();
    const validCodes = [activeModCode, activeAdminCode, activeOwnerCode, 'MOD-4ZT-8306', 'ADM-8PX-6157', '0702473747', 'OWN-7KQ-4921', 'PRN-ZKH-0069', OWNER_ADMIN_ACCESS_CODE.toUpperCase(), 'MOD-SEC-2026'];

    if (!validCodes.includes(code)) {
      return res.status(403).json({ error: "Code invalide." });
    }

    if (!session.gateAccess.includes('MODERATOR')) session.gateAccess.push('MODERATOR');

    if (!user.unlockedPanels) user.unlockedPanels = [];
    if (!user.unlockedPanels.includes('MODERATOR')) {
      user.unlockedPanels.push('MODERATOR');
      saveDB();
    }

    res.json({ authorized: true, role: user.role, unlockedPanels: user.unlockedPanels });
  });

  app.get('/api/moderator/overview', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const reports = db.reports || [];
    const warnings = db.warnings || [];

    const stats = {
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === 'PENDING').length,
      investigatingReports: reports.filter((r) => r.status === 'INVESTIGATING').length,
      resolvedReports: reports.filter((r) => r.status === 'RESOLVED' || r.status === 'DISMISSED').length,
      reportedMessagesCount: reports.filter((r) => r.type === 'MESSAGE').length,
      reportedUsersCount: new Set(reports.filter((r) => r.type === 'USER').map((r) => r.targetId)).size,
      warningsIssuedCount: warnings.length,
      actionsTakenCount: db.activityLogs.filter((l) => l.action.includes('MODERATOR')).length,
    };

    res.json({ stats, recentReports: reports.slice(0, 5), recentLogs: db.activityLogs.slice(0, 8) });
  });

  app.get('/api/moderator/reports', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const { status } = req.query;
    let list = db.reports || [];
    if (status && status !== 'ALL') {
      list = list.filter((r) => r.status === status);
    }
    res.json({ reports: list });
  });

  app.post('/api/moderator/reports', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    const { type, targetId, targetName, targetContent, reason, details, severity } = req.body;

    const newReport = {
      id: `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      type: type || 'MESSAGE',
      targetId,
      targetName: targetName || 'Reported Target',
      targetContent,
      reportedByUserId: currentUser.id,
      reportedByUsername: currentUser.username,
      reportedByDisplayName: currentUser.displayName,
      reason,
      details,
      severity: severity || 'MEDIUM',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    db.reports.unshift(newReport);
    saveDB();
    res.json({ message: 'Report submitted.', report: newReport });
  });

  app.put('/api/moderator/reports/:id/resolve', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const report = db.reports.find((r) => r.id === id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });

    report.status = status || 'RESOLVED';
    report.actionTaken = actionTaken || 'Resolved.';
    report.resolvedBy = currentUser.id;
    report.resolvedByName = currentUser.displayName;
    report.resolvedAt = new Date().toISOString();

    saveDB();
    res.json({ message: 'Report updated.', report });
  });

  app.get('/api/moderator/reported-messages', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const messageReports = (db.reports || []).filter((r) => r.type === 'MESSAGE');
    const grouped = new Map<string, any>();

    for (const rep of messageReports) {
      if (!grouped.has(rep.targetId)) {
        const chatMsg = db.chatMessages.find((m) => m.id === rep.targetId);
        grouped.set(rep.targetId, {
          id: `rep_msg_${rep.targetId}`,
          messageId: rep.targetId,
          senderId: chatMsg?.senderId || 'unknown',
          senderUsername: chatMsg?.senderUsername || 'unknown_user',
          senderDisplayName: chatMsg?.senderDisplayName || rep.targetName,
          senderAvatar: chatMsg?.senderAvatar,
          recipientId: chatMsg?.recipientId || 'channel',
          content: chatMsg?.content || rep.targetContent || '[Message content unavailable]',
          messageTimestamp: chatMsg?.timestamp || rep.createdAt,
          reportCount: 0,
          reasons: [],
          reportIds: [],
          status: rep.status === 'RESOLVED' ? 'REVIEWED' : 'PENDING',
        });
      }
      const item = grouped.get(rep.targetId);
      item.reportCount += 1;
      if (!item.reasons.includes(rep.reason)) item.reasons.push(rep.reason);
      item.reportIds.push(rep.id);
    }

    res.json({ messages: Array.from(grouped.values()) });
  });

  app.delete('/api/moderator/messages/:messageId', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const { messageId } = req.params;
    db.chatMessages = db.chatMessages.filter((m) => m.id !== messageId);
    saveDB();
    res.json({ message: 'Message deleted successfully.' });
  });

  app.get('/api/moderator/reported-users', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const userReports = (db.reports || []).filter((r) => r.type === 'USER');
    const warnings = db.warnings || [];
    const userMap = new Map<string, any>();

    for (const rep of userReports) {
      const u = db.users.find((user) => user.id === rep.targetId);
      if (u && !userMap.has(u.id)) {
        userMap.set(u.id, {
          userId: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          role: u.role,
          status: u.status,
          reportCount: 1,
          warningCount: warnings.filter((w) => w.userId === u.id).length,
          lastReportedReason: rep.reason,
          isMuted: u.mutedUntil ? new Date(u.mutedUntil) > new Date() : false,
          mutedUntil: u.mutedUntil,
        });
      } else if (u && userMap.has(u.id)) {
        userMap.get(u.id).reportCount += 1;
      }
    }

    for (const w of warnings) {
      const u = db.users.find((user) => user.id === w.userId);
      if (u && !userMap.has(u.id)) {
        userMap.set(u.id, {
          userId: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          role: u.role,
          status: u.status,
          reportCount: 0,
          warningCount: warnings.filter((warn) => warn.userId === u.id).length,
          lastReportedReason: w.reason,
          isMuted: u.mutedUntil ? new Date(u.mutedUntil) > new Date() : false,
          mutedUntil: u.mutedUntil,
        });
      }
    }

    res.json({ users: Array.from(userMap.values()) });
  });

  app.post('/api/moderator/users/:userId/warn', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;
    const { severity, category, reason, notes } = req.body;

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    if (targetUser.role === 'OWNER') return res.status(403).json({ error: 'Owners cannot be warned.' });
    if (targetUser.role === 'ADMIN' && currentUser.role === 'MODERATOR') {
      return res.status(403).json({ error: 'Moderators cannot warn Administrators.' });
    }

    const newWarning = {
      id: `warn_${Date.now()}`,
      userId: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      issuedByUserId: currentUser.id,
      issuedByUsername: currentUser.username,
      issuedByDisplayName: currentUser.displayName,
      severity: severity || 'MEDIUM',
      category: category || 'POLICY_VIOLATION',
      reason: reason || 'Community guidelines violation.',
      notes: notes || '',
      acknowledged: false,
      createdAt: new Date().toISOString(),
    };

    db.warnings.unshift(newWarning);
    saveDB();
    res.json({ message: 'Warning issued.', warning: newWarning });
  });

  app.get('/api/moderator/warnings', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    res.json({ warnings: db.warnings || [] });
  });

  app.post('/api/moderator/users/:userId/timeout', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;
    const { durationHours, reason } = req.body;

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    if (targetUser.role === 'OWNER') return res.status(403).json({ error: 'Owners cannot be timed out.' });
    if (targetUser.role === 'ADMIN' && currentUser.role === 'MODERATOR') {
      return res.status(403).json({ error: 'Moderators cannot timeout Administrators.' });
    }

    const hours = Number(durationHours) || 24;
    const mutedUntil = new Date(Date.now() + hours * 3600000).toISOString();
    targetUser.mutedUntil = mutedUntil;
    saveDB();
    res.json({ message: `User timed out for ${hours} hours.`, mutedUntil });
  });

  app.post('/api/moderator/users/:userId/ban', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    if (targetUser.role === 'OWNER') return res.status(403).json({ error: 'Owners cannot be banned.' });
    if (targetUser.role === 'ADMIN') return res.status(403).json({ error: 'Administrators cannot be banned by moderators.' });

    targetUser.status = 'BANNED';
    db.sessions = db.sessions.filter((s) => s.userId !== targetUser.id);
    saveDB();
    res.json({ message: 'User banned.', user: sanitizeUser(targetUser) });
  });

  app.get('/api/moderator/content', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const contentReports = (db.reports || []).filter((r) => r.type === 'CONTENT');
    const items = contentReports.map((r) => ({
      id: r.targetId,
      type: 'Work Project / Document',
      title: r.targetName,
      authorName: r.reportedByDisplayName,
      details: r.details || r.targetContent || 'Flagged content item',
      flagReason: r.reason,
      createdAt: r.createdAt,
    }));
    res.json({ content: items });
  });

  app.delete('/api/moderator/content/:type/:id', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    const { id } = req.params;
    db.announcements = db.announcements.filter((a) => a.id !== id);
    db.workProjects = db.workProjects.filter((w) => w.id !== id);
    db.tasks = db.tasks.filter((t) => t.id !== id);
    saveDB();
    res.json({ message: 'Flagged content removed.' });
  });

  app.get('/api/moderator/logs', authMiddleware, requireRole('MODERATOR', 'ADMIN', 'OWNER'), (req, res) => {
    res.json({ logs: db.activityLogs || [] });
  });

  // Admin APIs
  app.post('/api/admin/verify-gate', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const session = (req as any).session;
    const { accessCode } = req.body;

    if (!session.gateAccess) session.gateAccess = [];

    const isAdult = user.ageCategory === '20_PLUS' || (!user.ageCategory && user.experience === 'ORIGINAL');
    if (!isAdult) {
      return res.status(403).json({ error: "Accès refusé : les consoles sont réservées aux utilisateurs adultes (20+)." });
    }

    // If already OWNER or previously unlocked this panel, grant immediate access
    if (user.role === 'OWNER' || (user.unlockedPanels && user.unlockedPanels.includes('ADMIN'))) {
      if (!session.gateAccess.includes('ADMIN')) session.gateAccess.push('ADMIN');
      if (!session.gateAccess.includes('MODERATOR')) session.gateAccess.push('MODERATOR');
      return res.json({ authorized: true, role: user.role, alreadyUnlocked: true });
    }

    const code = (accessCode || '').trim().toUpperCase();
    const activeAdminCode = (db.panelCodes?.ADMIN || 'ADM-8PX-6157').trim().toUpperCase();
    const activeOwnerCode = (db.panelCodes?.OWNER || '0702473747').trim().toUpperCase();
    const validCodes = [activeAdminCode, activeOwnerCode, 'ADM-8PX-6157', '0702473747', 'OWN-7KQ-4921', 'PRN-ZKH-0069', OWNER_ADMIN_ACCESS_CODE.toUpperCase()];

    if (!validCodes.includes(code)) {
      return res.status(403).json({ error: "Code invalide." });
    }

    if (!session.gateAccess.includes('ADMIN')) session.gateAccess.push('ADMIN');
    if (!session.gateAccess.includes('MODERATOR')) session.gateAccess.push('MODERATOR');

    if (!user.unlockedPanels) user.unlockedPanels = [];
    if (!user.unlockedPanels.includes('ADMIN')) user.unlockedPanels.push('ADMIN');
    if (!user.unlockedPanels.includes('MODERATOR')) user.unlockedPanels.push('MODERATOR');
    saveDB();

    res.json({ authorized: true, role: user.role, unlockedPanels: user.unlockedPanels });
  });

  app.get('/api/admin/overview', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const users = db.users.map((u) => sanitizeUser(u));
    const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER').length;
    const bannedUsers = users.filter((u) => u.status === 'BANNED' || u.isBanned);
    res.json({
      metrics: {
        totalUsers: users.length,
        adminCount,
        bannedCount: bannedUsers.length,
        activeWorkspaces: 1,
      },
      users,
      bannedUsers,
      logs: db.activityLogs || [],
    });
  });

  app.post('/api/admin/invitations', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const user = (req as any).user;
    const { email, role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Adresse email valide requise.' });
    }
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
    db.activityLogs.unshift({
      id: `log_${Date.now()}`,
      actorName: user.displayName || user.username,
      action: 'INVITATION_SENT',
      status: 'SUCCESS',
      details: `Invitation envoyée à ${email} avec attribution automatique du rôle ${assignedRole}.`,
      target: email,
      createdAt: new Date().toISOString(),
    });
    saveDB();
    res.json({ message: `Invitation envoyée avec succès à ${email} (Rôle: ${assignedRole}).` });
  });

  app.post('/api/admin/users/:userId/action', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;
    const { action, data } = req.body;

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    let message = 'Action exécutée avec succès.';

    switch (action) {
      case 'unban':
        targetUser.status = 'ACTIVE';
        targetUser.isBanned = false;
        targetUser.banReason = undefined;
        message = `Compte @${targetUser.username} débanni avec succès.`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'USER_UNBANNED',
          status: 'SUCCESS',
          details: `Débannissement du compte @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'ban':
        if (targetUser.role === 'OWNER') return res.status(403).json({ error: 'Impossible de bannir le Propriétaire.' });
        targetUser.status = 'BANNED';
        targetUser.isBanned = true;
        targetUser.banReason = data?.reason || 'Non respect de la charte de la plateforme';
        targetUser.bannedAt = new Date().toLocaleDateString('fr-FR');
        targetUser.bannedBy = currentUser.username || currentUser.displayName;
        message = `Compte @${targetUser.username} banni.`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'USER_BANNED',
          status: 'SUCCESS',
          details: `Bannissement de @${targetUser.username} : ${targetUser.banReason}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'give_admin':
        targetUser.role = 'ADMIN';
        message = `@${targetUser.username} est maintenant Administrateur.`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'USER_ROLE_ELEVATED',
          status: 'SUCCESS',
          details: `Attribution des privilèges d'administration à @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'demote_admin':
        if (targetUser.role === 'OWNER') return res.status(403).json({ error: 'Impossible de modifier le Propriétaire.' });
        targetUser.role = 'MEMBER';
        message = `Privilèges d'administration révoqués pour @${targetUser.username}.`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'USER_ROLE_DEMOTED',
          status: 'SUCCESS',
          details: `Révocation de l'accès Admin pour @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'update_permissions':
        targetUser.grantedPermissions = Array.isArray(data?.permissions) ? data.permissions : [];
        message = `Permissions mises à jour pour @${targetUser.username}.`;
        break;
      case 'reset_password':
        const newPass = data?.newPassword || `Pass${crypto.randomBytes(3).toString('hex').toUpperCase()}!`;
        targetUser.passwordHash = hashPassword(newPass);
        message = `Mot de passe réinitialisé avec succès : ${newPass}`;
        break;
      case 'update_profile':
        if (data?.displayName) targetUser.displayName = data.displayName.trim();
        if (data?.avatarUrl) targetUser.avatarUrl = data.avatarUrl.trim();
        message = `Profil de @${targetUser.username} mis à jour.`;
        break;
      case 'gift_moderator_panel':
        targetUser.moderatorPanel = true;
        if (!targetUser.unlockedPanels) targetUser.unlockedPanels = [];
        if (!targetUser.unlockedPanels.includes('MODERATOR')) targetUser.unlockedPanels.push('MODERATOR');
        if (!targetUser.giftedPanels) targetUser.giftedPanels = [];
        if (!targetUser.giftedPanels.includes('MODERATOR')) targetUser.giftedPanels.push('MODERATOR');
        message = `🎁 Panel Modérateur offert à @${targetUser.username} !`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'PANEL_GIFTED',
          status: 'SUCCESS',
          details: `Panel Modérateur offert à @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'revoke_moderator_panel':
        targetUser.moderatorPanel = false;
        if (targetUser.unlockedPanels) {
          targetUser.unlockedPanels = targetUser.unlockedPanels.filter((p: string) => p !== 'MODERATOR');
        }
        if (targetUser.giftedPanels) {
          targetUser.giftedPanels = targetUser.giftedPanels.filter((p: string) => p !== 'MODERATOR');
        }
        message = `Panel Modérateur retiré pour @${targetUser.username}.`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'PANEL_REVOKED',
          status: 'SUCCESS',
          details: `Panel Modérateur révoqué pour @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'gift_admin_panel':
        targetUser.adminPanel = true;
        if (!targetUser.unlockedPanels) targetUser.unlockedPanels = [];
        if (!targetUser.unlockedPanels.includes('ADMIN')) targetUser.unlockedPanels.push('ADMIN');
        if (!targetUser.giftedPanels) targetUser.giftedPanels = [];
        if (!targetUser.giftedPanels.includes('ADMIN')) targetUser.giftedPanels.push('ADMIN');
        message = `🎁 Panel Administrateur offert à @${targetUser.username} !`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'PANEL_GIFTED',
          status: 'SUCCESS',
          details: `Panel Administrateur offert à @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'revoke_admin_panel':
        targetUser.adminPanel = false;
        if (targetUser.unlockedPanels) {
          targetUser.unlockedPanels = targetUser.unlockedPanels.filter((p: string) => p !== 'ADMIN');
        }
        if (targetUser.giftedPanels) {
          targetUser.giftedPanels = targetUser.giftedPanels.filter((p: string) => p !== 'ADMIN');
        }
        message = `Panel Administrateur retiré pour @${targetUser.username}.`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'PANEL_REVOKED',
          status: 'SUCCESS',
          details: `Panel Administrateur révoqué pour @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'gift_creator_panel':
        targetUser.creatorPanel = true;
        message = `🎁 Creator Panel granted to @${targetUser.username} !`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'PANEL_GIFTED',
          status: 'SUCCESS',
          details: `Creator Panel granted to @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'revoke_creator_panel':
        targetUser.creatorPanel = false;
        message = `Creator Panel revoked for @${targetUser.username}.`;
        break;
      case 'gift_owner_panel':
        targetUser.ownerPanel = true;
        message = `🎁 Owner Panel granted to @${targetUser.username} !`;
        db.activityLogs.unshift({
          id: `log_${Date.now()}`,
          actorName: currentUser.displayName || currentUser.username,
          action: 'PANEL_GIFTED',
          status: 'SUCCESS',
          details: `Owner Panel granted to @${targetUser.username}`,
          target: `@${targetUser.username}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case 'revoke_owner_panel':
        if (targetUser.role === 'OWNER' || targetUser.normalizedUsername === 'farouk123') {
          return res.status(403).json({ error: 'Cannot revoke Owner Panel from the primary Owner account.' });
        }
        targetUser.ownerPanel = false;
        message = `Owner Panel revoked for @${targetUser.username}.`;
        break;
      case 'gift_subscribers':
        const addedSubs = Number(data?.amount) || 1000000;
        targetUser.subscriberCount = (targetUser.subscriberCount || 0) + addedSubs;
        targetUser.isVerified = Boolean(targetUser.isVerified || targetUser.subscriberCount >= 1000000);
        message = `🎁 +${addedSubs.toLocaleString()} subscribers gifted to @${targetUser.username}! Total: ${targetUser.subscriberCount.toLocaleString()}`;
        break;
      case 'toggle_verified':
        targetUser.isVerified = !targetUser.isVerified;
        message = `Verification badge ${targetUser.isVerified ? 'enabled' : 'disabled'} for @${targetUser.username}.`;
        break;
      default:
        return res.status(400).json({ error: `Action inconnue: ${action}` });
    }

    saveDB();
    res.json({ message, user: sanitizeUser(targetUser) });
  });

  app.get('/api/admin/users', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    res.json({ users: db.users.map((u) => sanitizeUser(u)) });
  });

  app.post('/api/admin/users/:userId/ban', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    if (targetUser.role === 'OWNER') {
      return res.status(403).json({ error: 'Security Violation: Owners cannot be banned.' });
    }

    targetUser.status = 'BANNED';
    db.sessions = db.sessions.filter((s) => s.userId !== targetUser.id);
    saveDB();
    res.json({ message: 'User banned.', user: sanitizeUser(targetUser) });
  });

  app.post('/api/admin/users/:userId/unban', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    targetUser.status = 'ACTIVE';
    saveDB();
    res.json({ message: 'User unbanned.', user: sanitizeUser(targetUser) });
  });

  app.post('/api/admin/users/:userId/grant-admin', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    targetUser.role = 'ADMIN';
    saveDB();
    res.json({ message: 'Admin role granted.', user: sanitizeUser(targetUser) });
  });

  app.post('/api/admin/users/:userId/remove-admin', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    if (targetUser.role === 'OWNER') return res.status(403).json({ error: 'Cannot modify an Owner.' });

    targetUser.role = 'MEMBER';
    saveDB();
    res.json({ message: 'Admin role removed.', user: sanitizeUser(targetUser) });
  });

  app.post('/api/admin/users/:userId/grant-moderator', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    targetUser.role = 'MODERATOR';
    saveDB();
    res.json({ message: 'Moderator role granted.', user: sanitizeUser(targetUser) });
  });

  app.post('/api/admin/users/:userId/remove-moderator', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    targetUser.role = 'MEMBER';
    saveDB();
    res.json({ message: 'Moderator role removed.', user: sanitizeUser(targetUser) });
  });

  app.get('/api/admin/logs', authMiddleware, requireRole('ADMIN', 'OWNER'), (req, res) => {
    res.json({ logs: db.activityLogs });
  });

  // Owner APIs
  app.post('/api/owner/verify-gate', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const session = (req as any).session;
    const { accessCode } = req.body;

    if (!session.gateAccess) session.gateAccess = [];

    const isAdult = user.ageCategory === '20_PLUS' || (!user.ageCategory && user.experience === 'ORIGINAL');
    if (!isAdult) {
      return res.status(403).json({ error: "Accès refusé : les consoles sont réservées aux utilisateurs adultes (20+)." });
    }

    // If already OWNER or previously unlocked this panel, grant immediate access
    if (user.role === 'OWNER' || (user.unlockedPanels && user.unlockedPanels.includes('OWNER'))) {
      if (!session.gateAccess.includes('OWNER')) session.gateAccess.push('OWNER');
      if (!session.gateAccess.includes('ADMIN')) session.gateAccess.push('ADMIN');
      if (!session.gateAccess.includes('MODERATOR')) session.gateAccess.push('MODERATOR');
      return res.json({ authorized: true, role: 'OWNER', alreadyUnlocked: true });
    }

    const code = (accessCode || '').trim().toUpperCase();
    const activeOwnerCode = (db.panelCodes?.OWNER || '0702473747').trim().toUpperCase();
    const validCodes = [activeOwnerCode, '0702473747', 'OWN-7KQ-4921', 'PRN-ZKH-0069', OWNER_ADMIN_ACCESS_CODE.toUpperCase()];

    if (!validCodes.includes(code)) {
      return res.status(403).json({ error: "Code invalide." });
    }

    if (!session.gateAccess.includes('OWNER')) session.gateAccess.push('OWNER');
    if (!session.gateAccess.includes('ADMIN')) session.gateAccess.push('ADMIN');
    if (!session.gateAccess.includes('MODERATOR')) session.gateAccess.push('MODERATOR');

    if (!user.unlockedPanels) user.unlockedPanels = [];
    if (!user.unlockedPanels.includes('OWNER')) user.unlockedPanels.push('OWNER');
    if (!user.unlockedPanels.includes('ADMIN')) user.unlockedPanels.push('ADMIN');
    if (!user.unlockedPanels.includes('MODERATOR')) user.unlockedPanels.push('MODERATOR');
    saveDB();

    res.json({ authorized: true, role: 'OWNER', unlockedPanels: user.unlockedPanels });
  });

  app.get('/api/owner/overview', authMiddleware, requireRole('OWNER'), (req, res) => {
    const totalMembers = db.users.length;
    const adminCount = db.users.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER').length;
    const activeSessionsCount = Math.max(1, db.sessions ? db.sessions.length : 1);
    const messagesCount = db.chatMessages ? db.chatMessages.length : 0;
    const tasksCount = db.tasks ? db.tasks.length : 0;

    // Count files from work projects and tasks
    let filesCount = 0;
    if (db.workProjects) {
      for (const wp of db.workProjects) {
        if (wp.files && Array.isArray(wp.files)) filesCount += wp.files.length;
      }
    }

    res.json({
      metrics: {
        totalMembers,
        adminCount,
        activeSessions: activeSessionsCount,
        messagesCount,
        tasksCount,
        filesCount,
      },
      settings: {
        instanceName: db.systemSettings.instanceName || 'WorkChat',
        securityLockdown: Boolean(db.systemSettings.securityLockdown),
        allowRegistration: db.systemSettings.allowRegistration !== false,
        maintenanceMode: Boolean(db.systemSettings.maintenanceMode),
        enableSecretClaim: db.systemSettings.enableSecretClaim !== false,
        updatedAt: db.systemSettings.updatedAt,
      },
      users: db.users.map((u) => sanitizeUser(u)),
      linkedAccounts: db.linkedAccounts || [],
      announcements: db.announcements || [],
    });
  });

  app.post('/api/owner/users/:userId/action', authMiddleware, requireRole('OWNER'), (req, res) => {
    const currentUser = (req as any).user;
    const { userId } = req.params;
    const { action, data } = req.body;

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    let message = 'Action exécutée avec succès.';
    let generatedPassword = '';

    switch (action) {
      case 'gift_creator_panel':
        targetUser.creatorPanel = true;
        if (!targetUser.unlockedPanels) targetUser.unlockedPanels = [];
        if (!targetUser.unlockedPanels.includes('CREATOR')) targetUser.unlockedPanels.push('CREATOR');
        if (!targetUser.giftedPanels) targetUser.giftedPanels = [];
        if (!targetUser.giftedPanels.includes('CREATOR')) targetUser.giftedPanels.push('CREATOR');
        message = `🎁 Creator Panel access granted to @${targetUser.username}!`;
        break;
      case 'revoke_creator_panel':
        targetUser.creatorPanel = false;
        if (targetUser.unlockedPanels) {
          targetUser.unlockedPanels = targetUser.unlockedPanels.filter((p: string) => p !== 'CREATOR');
        }
        if (targetUser.giftedPanels) {
          targetUser.giftedPanels = targetUser.giftedPanels.filter((p: string) => p !== 'CREATOR');
        }
        message = `Creator Panel access revoked from @${targetUser.username}.`;
        break;
      case 'gift_owner_panel':
        targetUser.ownerPanel = true;
        if (!targetUser.unlockedPanels) targetUser.unlockedPanels = [];
        if (!targetUser.unlockedPanels.includes('OWNER')) targetUser.unlockedPanels.push('OWNER');
        if (!targetUser.giftedPanels) targetUser.giftedPanels = [];
        if (!targetUser.giftedPanels.includes('OWNER')) targetUser.giftedPanels.push('OWNER');
        message = `🎁 Owner Panel access granted to @${targetUser.username}!`;
        break;
      case 'revoke_owner_panel':
        targetUser.ownerPanel = false;
        if (targetUser.unlockedPanels) {
          targetUser.unlockedPanels = targetUser.unlockedPanels.filter((p: string) => p !== 'OWNER');
        }
        if (targetUser.giftedPanels) {
          targetUser.giftedPanels = targetUser.giftedPanels.filter((p: string) => p !== 'OWNER');
        }
        message = `Owner Panel access revoked from @${targetUser.username}.`;
        break;
      case 'gift_subscribers':
        const amount = Number(data?.amount) || 100000;
        const currentCount = targetUser.subscriberCount ?? (targetUser.subscribers?.length || 0);
        targetUser.subscriberCount = Math.max(0, currentCount + amount);
        targetUser.isVerified = targetUser.subscriberCount >= 1000000;
        message = `🎁 ${amount.toLocaleString()} subscribers gifted to @${targetUser.username}! Total: ${targetUser.subscriberCount.toLocaleString()}${targetUser.isVerified ? ' (Verified Checkmark Unlocked!)' : ''}`;
        break;
      case 'toggle_verification':
        targetUser.isVerified = Boolean(data?.isVerified !== undefined ? data.isVerified : !targetUser.isVerified);
        message = `Statut de vérification mis à jour pour @${targetUser.username} (${targetUser.isVerified ? 'Vérifié ✓' : 'Non vérifié'}).`;
        break;
      case 'gift_moderator_panel':
        if (!targetUser.unlockedPanels) targetUser.unlockedPanels = [];
        if (!targetUser.unlockedPanels.includes('MODERATOR')) targetUser.unlockedPanels.push('MODERATOR');
        if (!targetUser.giftedPanels) targetUser.giftedPanels = [];
        if (!targetUser.giftedPanels.includes('MODERATOR')) targetUser.giftedPanels.push('MODERATOR');
        message = `🎁 Panel Modérateur offert à @${targetUser.username} avec succès !`;
        break;
      case 'revoke_moderator_panel':
        if (targetUser.unlockedPanels) {
          targetUser.unlockedPanels = targetUser.unlockedPanels.filter((p: string) => p !== 'MODERATOR');
        }
        if (targetUser.giftedPanels) {
          targetUser.giftedPanels = targetUser.giftedPanels.filter((p: string) => p !== 'MODERATOR');
        }
        message = `Panel Modérateur retiré à @${targetUser.username}.`;
        break;
      case 'gift_admin_panel':
        if (!targetUser.unlockedPanels) targetUser.unlockedPanels = [];
        if (!targetUser.unlockedPanels.includes('ADMIN')) targetUser.unlockedPanels.push('ADMIN');
        if (!targetUser.unlockedPanels.includes('MODERATOR')) targetUser.unlockedPanels.push('MODERATOR');
        if (!targetUser.giftedPanels) targetUser.giftedPanels = [];
        if (!targetUser.giftedPanels.includes('ADMIN')) targetUser.giftedPanels.push('ADMIN');
        message = `🎁 Panel Administrateur offert à @${targetUser.username} avec succès !`;
        break;
      case 'revoke_admin_panel':
        if (targetUser.unlockedPanels) {
          targetUser.unlockedPanels = targetUser.unlockedPanels.filter((p: string) => p !== 'ADMIN');
        }
        if (targetUser.giftedPanels) {
          targetUser.giftedPanels = targetUser.giftedPanels.filter((p: string) => p !== 'ADMIN');
        }
        message = `Panel Administrateur retiré à @${targetUser.username}.`;
        break;
      case 'give_admin':
        targetUser.role = 'ADMIN';
        message = `@${targetUser.username} a été promu Administrateur.`;
        break;
      case 'demote_admin':
        targetUser.role = 'MEMBER';
        message = `Rôle Administrateur révoqué pour @${targetUser.username}.`;
        break;
      case 'give_owner':
        targetUser.role = 'OWNER';
        message = `@${targetUser.username} a reçu le statut Propriétaire (OWNER).`;
        break;
      case 'demote_owner':
        targetUser.role = 'ADMIN';
        message = `Statut Propriétaire révoqué pour @${targetUser.username}.`;
        break;
      case 'unban':
        targetUser.status = 'ACTIVE';
        targetUser.isBanned = false;
        targetUser.banReason = undefined;
        message = `Le compte @${targetUser.username} est maintenant débloqué (ACTIVE).`;
        break;
      case 'ban':
        targetUser.status = 'BANNED';
        targetUser.isBanned = true;
        targetUser.banReason = data?.reason || 'Non respect de la charte de la plateforme';
        targetUser.bannedAt = new Date().toISOString();
        targetUser.bannedBy = currentUser.username || currentUser.displayName || '6662';
        db.sessions = db.sessions.filter((s) => s.userId !== targetUser.id);
        message = `Le compte @${targetUser.username} a été banni.`;
        break;
      case 'suspend':
        const hours = data?.durationHours || 24;
        targetUser.mutedUntil = new Date(Date.now() + hours * 3600000).toISOString();
        message = `@${targetUser.username} est suspendu temporairement pour ${hours}h.`;
        break;
      case 'update_profile':
        if (data?.displayName) targetUser.displayName = data.displayName.trim();
        if (data?.avatarUrl) targetUser.avatarUrl = data.avatarUrl.trim();
        message = `Profil de @${targetUser.username} mis à jour.`;
        break;
      case 'reset_password':
        generatedPassword = data?.newPassword || `SecPass${crypto.randomBytes(3).toString('hex').toUpperCase()}!`;
        targetUser.passwordHash = hashPassword(generatedPassword);
        message = `Mot de passe réinitialisé avec succès pour @${targetUser.username}.`;
        break;
      case 'update_permissions':
        targetUser.grantedPermissions = Array.isArray(data?.permissions) ? data.permissions : [];
        message = `Permissions mises à jour pour @${targetUser.username}.`;
        break;
      case 'grant_plan':
        const requestedPlan = data?.plan || 'PRO';
        targetUser.subscriptionPlan = requestedPlan;
        targetUser.subscriptionStatus = 'active';
        targetUser.subscriptionRenewAt = new Date(Date.now() + 365 * 86400000).toISOString();
        message = `Forfait ${requestedPlan} accordé sans frais (Privilège Owner 0€) à @${targetUser.username}.`;
        break;
      default:
        return res.status(400).json({ error: `Action inconnue: ${action}` });
    }

    saveDB();
    res.json({
      message,
      user: sanitizeUser(targetUser),
      generatedPassword: generatedPassword || undefined,
    });
  });

  app.post('/api/owner/linked-accounts', authMiddleware, requireRole('OWNER'), (req, res) => {
    const { userIds, note } = req.body;
    if (!Array.isArray(userIds) || userIds.length < 2) {
      return res.status(400).json({ error: 'Sélectionnez au moins 2 comptes à relier.' });
    }

    if (!db.linkedAccounts) db.linkedAccounts = [];
    const newGroup = {
      id: `lnk_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userIds,
      note: note ? note.trim() : 'Même propriétaire ou comptes associés',
      createdAt: new Date().toISOString(),
    };

    db.linkedAccounts.unshift(newGroup);
    saveDB();
    res.json({
      message: 'Comptes reliés avec succès.',
      linkedAccounts: db.linkedAccounts,
    });
  });

  app.delete('/api/owner/linked-accounts/:id', authMiddleware, requireRole('OWNER'), (req, res) => {
    const { id } = req.params;
    if (db.linkedAccounts) {
      db.linkedAccounts = db.linkedAccounts.filter((g) => g.id !== id);
      saveDB();
    }
    res.json({
      message: 'Groupe de comptes dissocié.',
      linkedAccounts: db.linkedAccounts || [],
    });
  });

  app.post('/api/owner/announcements', authMiddleware, requireRole('OWNER'), (req, res) => {
    const user = (req as any).user;
    const { title, content, winnerMention, bannerDuration, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Le titre de l’annonce est requis.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le contenu de l’annonce est requis.' });
    }

    const newAnnouncement = {
      id: `ann_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: title.trim(),
      content: content.trim(),
      winnerMention: winnerMention ? winnerMention.trim() : undefined,
      bannerDuration: bannerDuration || 3,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      authorId: user.id,
      authorName: user.displayName || user.username,
      authorRole: 'OWNER',
      isOfficial: true,
      broadcastBanner: true,
      createdAt: new Date().toISOString(),
    };

    if (!db.announcements) db.announcements = [];
    db.announcements.unshift(newAnnouncement);
    saveDB();

    res.json({
      message: 'Annonce officielle publiée avec succès.',
      announcement: newAnnouncement,
    });
  });

  app.post('/api/owner/users/:userId/grant-owner', authMiddleware, requireRole('OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    targetUser.role = 'OWNER';
    saveDB();
    res.json({ message: 'Owner role granted.', user: sanitizeUser(targetUser) });
  });

  app.post('/api/owner/users/:userId/remove-owner', authMiddleware, requireRole('OWNER'), (req, res) => {
    const { userId } = req.params;
    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found.' });

    targetUser.role = 'ADMIN';
    saveDB();
    res.json({ message: 'Owner role removed.', user: sanitizeUser(targetUser) });
  });

  app.get('/api/owner/settings', authMiddleware, requireRole('OWNER'), (req, res) => {
    res.json({
      settings: db.systemSettings,
      stats: {
        totalUsers: db.users.length,
        totalProjects: db.workProjects ? db.workProjects.length : 0,
        totalTasks: db.tasks ? db.tasks.length : 0,
        totalTransactions: db.transactions ? db.transactions.length : 0,
      },
    });
  });

  app.put('/api/owner/settings', authMiddleware, requireRole('OWNER'), (req, res) => {
    const { instanceName, securityLockdown, allowRegistration, maintenanceMode, enableSecretClaim } = req.body;
    if (instanceName !== undefined) db.systemSettings.instanceName = instanceName;
    if (securityLockdown !== undefined) db.systemSettings.securityLockdown = Boolean(securityLockdown);
    if (allowRegistration !== undefined) db.systemSettings.allowRegistration = Boolean(allowRegistration);
    if (maintenanceMode !== undefined) db.systemSettings.maintenanceMode = Boolean(maintenanceMode);
    if (enableSecretClaim !== undefined) db.systemSettings.enableSecretClaim = Boolean(enableSecretClaim);
    db.systemSettings.updatedAt = new Date().toISOString();
    saveDB();
    res.json({ message: 'Paramètres mis à jour.', settings: db.systemSettings });
  });

  // Access check endpoints for Owner and Creator Panels (Server-side authorization)
  app.get('/api/owner/check-access', authMiddleware, requireOwnerAccess, (req, res) => {
    res.json({ allowed: true });
  });

  app.get('/api/creator/check-access', authMiddleware, requireCreatorAccess, (req, res) => {
    res.json({ allowed: true });
  });

  app.get('/api/creator/overview', authMiddleware, requireCreatorAccess, (req, res) => {
    const user = (req as any).user;
    const subCount = user.subscriberCount ?? (user.subscribers?.length || 0);
    const impressions = subCount * 4 + 1280;
    res.json({
      analytics: {
        subscriberCount: subCount,
        impressions,
        engagementRate: '8.9%',
        growthRate: '+12.4%',
      },
      revenue: {
        estimatedMonthly: Math.round(subCount * 0.15 + 85),
        creatorFund: Math.round(subCount * 0.05 + 40),
      },
    });
  });

  // Panel Security Code Management
  app.get('/api/panels/code', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const session = (req as any).session;
    const requestedPanel = ((req.query.panel as string) || '').toUpperCase();

    const isOwner = user.role === 'OWNER' || user.unlockedPanels?.includes('OWNER') || session?.gateAccess?.includes('OWNER');
    const isAdmin = user.role === 'ADMIN' || user.unlockedPanels?.includes('ADMIN') || session?.gateAccess?.includes('ADMIN');
    const isModerator = user.role === 'MODERATOR' || user.unlockedPanels?.includes('MODERATOR') || session?.gateAccess?.includes('MODERATOR');

    if (!db.panelCodes) {
      db.panelCodes = {
        MODERATOR: 'MOD-4ZT-8306',
        ADMIN: 'ADM-8PX-6157',
        OWNER: '0702473747',
      };
    }

    if (requestedPanel === 'OWNER') {
      if (!isOwner) {
        return res.status(403).json({ error: 'Permission denied: Owner panel code is restricted to Owner.' });
      }
      return res.json({ panel: 'OWNER', code: db.panelCodes.OWNER || '0702473747' });
    }

    if (requestedPanel === 'ADMIN') {
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Permission denied: Admin panel code is restricted to Admin.' });
      }
      return res.json({ panel: 'ADMIN', code: db.panelCodes.ADMIN || 'ADM-8PX-6157' });
    }

    if (requestedPanel === 'MODERATOR') {
      if (!isModerator && !isOwner) {
        return res.status(403).json({ error: 'Permission denied: Moderator panel code is restricted to Moderator.' });
      }
      return res.json({ panel: 'MODERATOR', code: db.panelCodes.MODERATOR || 'MOD-4ZT-8306' });
    }

    // Default based on role
    if (isOwner) {
      return res.json({
        moderatorCode: db.panelCodes.MODERATOR || 'MOD-4ZT-8306',
        adminCode: db.panelCodes.ADMIN || 'ADM-8PX-6157',
        ownerCode: db.panelCodes.OWNER || '0702473747',
      });
    } else if (isAdmin) {
      return res.json({
        adminCode: db.panelCodes.ADMIN || 'ADM-8PX-6157',
      });
    } else if (isModerator) {
      return res.json({
        moderatorCode: db.panelCodes.MODERATOR || 'MOD-4ZT-8306',
      });
    }

    return res.status(403).json({ error: 'Permission denied.' });
  });

  app.put('/api/panels/code', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const session = (req as any).session;
    const { panel, newCode } = req.body;

    if (!newCode || typeof newCode !== 'string' || newCode.trim().length < 3) {
      return res.status(400).json({ error: 'Le nouveau code doit contenir au moins 3 caractères.' });
    }

    const targetPanel = (panel || '').toUpperCase();
    if (!['MODERATOR', 'ADMIN', 'OWNER'].includes(targetPanel)) {
      return res.status(400).json({ error: 'Panneau invalide. Choix: MODERATOR, ADMIN, OWNER' });
    }

    const isOwner = user.role === 'OWNER' || user.unlockedPanels?.includes('OWNER') || session?.gateAccess?.includes('OWNER');
    const isAdmin = user.role === 'ADMIN' || user.unlockedPanels?.includes('ADMIN') || session?.gateAccess?.includes('ADMIN');
    const isModerator = user.role === 'MODERATOR' || user.unlockedPanels?.includes('MODERATOR') || session?.gateAccess?.includes('MODERATOR');

    // Rule: Owner can change all panel codes. Admin ONLY his panel. Moderator ONLY his panel.
    if (targetPanel === 'OWNER') {
      if (!isOwner) {
        return res.status(403).json({ error: 'Seul le Propriétaire (OWNER) peut modifier le code du panneau Owner.' });
      }
    } else if (targetPanel === 'ADMIN') {
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Seul un Administrateur ou le Propriétaire peut modifier le code du panneau Admin.' });
      }
    } else if (targetPanel === 'MODERATOR') {
      if (!isModerator && !isOwner) {
        return res.status(403).json({ error: 'Seul un Modérateur ou le Propriétaire peut modifier le code du panneau Modérateur.' });
      }
    }

    if (!db.panelCodes) {
      db.panelCodes = {
        MODERATOR: 'MOD-4ZT-8306',
        ADMIN: 'ADM-8PX-6157',
        OWNER: '0702473747',
      };
    }

    const cleanCode = newCode.trim().toUpperCase();
    (db.panelCodes as any)[targetPanel] = cleanCode;

    // Log security action in audit logs if available
    if (db.activityLogs) {
      db.activityLogs.unshift({
        id: `act_${Date.now()}`,
        userId: user.id,
        userName: user.displayName,
        action: `PANEL_CODE_CHANGED_${targetPanel}`,
        details: `Nouveau code d'accès configuré pour le panneau ${targetPanel}`,
        timestamp: new Date().toISOString(),
      });
    }

    saveDB();

    res.json({
      message: `Code d'accès du panneau ${targetPanel} mis à jour avec succès.`,
      panel: targetPanel,
      newCode: cleanCode,
    });
  });

  // Vite middleware / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket, req) => {
    let connectedUserId: string | null = null;
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');
      if (token) {
        const session = db.sessions.find((s) => s.token === token);
        if (session) {
          connectedUserId = session.userId;
          if (!userSockets.has(connectedUserId)) {
            userSockets.set(connectedUserId, new Set());
          }
          userSockets.get(connectedUserId)!.add(ws);
        }
      }
    } catch {}

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === 'auth' && data.token) {
          const session = db.sessions.find((s) => s.token === data.token);
          if (session) {
            connectedUserId = session.userId;
            if (!userSockets.has(connectedUserId)) {
              userSockets.set(connectedUserId, new Set());
            }
            userSockets.get(connectedUserId)!.add(ws);
            ws.send(JSON.stringify({ type: 'auth:success', userId: connectedUserId }));
          }
        } else if (data.type === 'chat:typing' && connectedUserId && data.partnerId) {
          broadcastToUser(data.partnerId, {
            type: 'chat:typing',
            senderId: connectedUserId,
            isTyping: Boolean(data.isTyping),
          });
        }
      } catch {}
    });

    ws.on('close', () => {
      if (connectedUserId && userSockets.has(connectedUserId)) {
        userSockets.get(connectedUserId)!.delete(ws);
      }
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[WorkChat] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
