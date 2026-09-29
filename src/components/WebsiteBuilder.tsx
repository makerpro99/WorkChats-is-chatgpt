import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Sliders,
  Code2,
  Bot,
  Sparkles,
  Send,
  Loader2,
  Save,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Palette,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Globe,
  ExternalLink,
  ShieldCheck,
  Zap,
  Star,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  X,
} from 'lucide-react';
import { WorkProject, User, WebsiteData, WebsiteSection, WebsiteTheme } from '../types';
import { api } from '../api';

const COLOR_PALETTES = [
  { id: '#0d9488', name: 'Teal', bgClass: 'bg-teal-600', textClass: 'text-teal-600' },
  { id: '#4f46e5', name: 'Indigo', bgClass: 'bg-indigo-600', textClass: 'text-indigo-600' },
  { id: '#059669', name: 'Emerald', bgClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
  { id: '#7c3aed', name: 'Violet', bgClass: 'bg-violet-600', textClass: 'text-violet-600' },
  { id: '#e11d48', name: 'Rose', bgClass: 'bg-rose-600', textClass: 'text-rose-600' },
  { id: '#d97706', name: 'Amber', bgClass: 'bg-amber-600', textClass: 'text-amber-600' },
  { id: '#1e293b', name: 'Slate', bgClass: 'bg-slate-800', textClass: 'text-slate-800' },
  { id: '#09090b', name: 'Dark Luxe', bgClass: 'bg-zinc-950', textClass: 'text-zinc-950' },
];

export function getDefaultWebsiteData(title: string, description: string): WebsiteData {
  return {
    template: 'saas',
    siteTitle: title || 'Modern Web Application',
    tagline: description || 'High-performance digital experience crafted with autonomous intelligence.',
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
        title: title ? title.split(' ')[0] : 'WorkCraft',
        enabled: true,
        items: [
          { label: 'Features', link: '#features' },
          { label: 'Product', link: '#showcase' },
          { label: 'Pricing', link: '#pricing' },
          { label: 'Testimonials', link: '#testimonials' },
        ],
        ctaText: 'Get Started Free',
        ctaLink: '#pricing',
      },
      {
        id: 'sec_hero',
        type: 'hero',
        badge: '✨ Production-Ready v2.4 Live',
        title: title || 'Intelligent Solutions for Modern Teams',
        subtitle:
          description ||
          'Streamline development, automate high-throughput workflows, and build beautiful digital products with integrated AI assistance.',
        ctaText: 'Launch Free Workspace',
        ctaLink: '#pricing',
        secondaryCtaText: 'Explore Interactive Demo',
        secondaryCtaLink: '#showcase',
        enabled: true,
      },
      {
        id: 'sec_features',
        type: 'features',
        badge: 'Built for Performance',
        title: 'Everything You Need to Scale',
        subtitle: 'Enterprise-grade architecture crafted for high-velocity teams and product creators.',
        enabled: true,
        items: [
          {
            icon: 'Zap',
            title: 'Sub-Millisecond Engine',
            description: 'Ultra-low latency rendering, reactive state synchronization, and instant asset distribution.',
          },
          {
            icon: 'ShieldCheck',
            title: 'Enterprise Security & RBAC',
            description: 'Role-based access hierarchy, tamper-proof activity logs, and zero-trust credential insulation.',
          },
          {
            icon: 'Bot',
            title: 'Autonomous AI Copilot',
            description: 'Gemini-powered natural language editing, dynamic code synthesis, and automated design adjustments.',
          },
        ],
      },
      {
        id: 'sec_pricing',
        type: 'pricing',
        badge: 'Transparent Value',
        title: 'Simple, Predictable Plans',
        subtitle: 'Select the plan tailored to your team size. Cancel or upgrade at any time with zero friction.',
        enabled: true,
        items: [
          {
            name: 'Starter',
            price: '$0',
            period: '/month',
            description: 'Ideal for independent developers and quick prototypes.',
            features: ['Up to 3 Active Projects', 'Standard AI Work Agent', 'Community Support', '1 GB Deliverables Storage'],
            buttonText: 'Get Started Free',
            popular: false,
          },
          {
            name: 'Pro Studio',
            price: '$29',
            period: '/month',
            description: 'Engineered for high-performing engineering and design groups.',
            features: [
              'Unlimited Work Projects',
              'Advanced Gemini 3.8 Flash Agent',
              'Full Interactive Website Builder',
              'Custom Domain & Instant Hosting',
              '24/7 Priority Support',
            ],
            buttonText: 'Start 14-Day Free Trial',
            popular: true,
          },
          {
            name: 'Enterprise',
            price: '$99',
            period: '/month',
            description: 'Dedicated infrastructure with customized SLA compliance.',
            features: [
              'Dedicated VPC Deployment',
              'Custom LLM Model Fine-Tuning',
              'Single Sign-On (SAML/Okta)',
              'Dedicated Account Success Lead',
            ],
            buttonText: 'Contact Sales',
            popular: false,
          },
        ],
      },
      {
        id: 'sec_testimonials',
        type: 'testimonials',
        badge: 'Client Satisfaction',
        title: 'Loved by Thousands of Teams',
        subtitle: 'Real feedback from developers, designers, and founders using our platform daily.',
        enabled: true,
        items: [
          {
            quote:
              'The combination of an intuitive visual builder and an active AI agent changed how our team prototypes web applications.',
            author: 'Sarah Jenkins',
            role: 'Head of Operations at CloudScale',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
            rating: 5,
          },
          {
            quote:
              'Being able to launch a project that is immediately registered for everyone in our company saves hours of sync meetings.',
            author: 'Alex Rivers',
            role: 'Lead UI Architect',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            rating: 5,
          },
        ],
      },
      {
        id: 'sec_cta',
        type: 'cta',
        title: 'Start Building Your Next Digital Experience',
        subtitle: 'Deploy modern, responsive web experiences with live AI collaboration today.',
        ctaText: 'Claim Your Free Access',
        ctaLink: '#pricing',
        enabled: true,
      },
      {
        id: 'sec_footer',
        type: 'footer',
        title: title || 'WorkChat Web Studio',
        subtitle: 'Registered organization-wide for collaborative creation and seamless preview.',
        enabled: true,
      },
    ],
  };
}

interface WebsiteBuilderProps {
  work: WorkProject;
  currentUser: User;
  onBack: () => void;
  onUpdateWork: (updated: WorkProject) => void;
}

export const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({
  work,
  currentUser,
  onBack,
  onUpdateWork,
}) => {
  const [data, setData] = useState<WebsiteData>(() => {
    if (work.websiteData && work.websiteData.sections && work.websiteData.sections.length > 0) {
      return work.websiteData;
    }
    return getDefaultWebsiteData(work.title || work.name, work.description);
  });

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'BUILDER' | 'CODE'>('PREVIEW');
  const [showAiAgent, setShowAiAgent] = useState<boolean>(true);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [pricingAnnual, setPricingAnnual] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('sec_hero');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{
      id: string;
      sender: 'USER' | 'AGENT';
      text: string;
      suggestedAction?: {
        label: string;
        apply: () => void;
      };
      timestamp: string;
    }>
  >([
    {
      id: 'welcome_1',
      sender: 'AGENT',
      text: `Hello ${currentUser.displayName}! I am your AI Website Agent for "${work.title || work.name}".\n\nI can adjust colors, rewrite headlines, generate new sections (pricing tables, testimonials, feature cards), or switch between templates. How can I help enhance this website?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    if (work.websiteData && work.websiteData.sections) {
      setData(work.websiteData);
    }
  }, [work.websiteData]);

  const handleSaveWebsite = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateWork(work.id, {
        websiteData: data,
        progress: Math.max(work.progress || 0, 85),
      });
      onUpdateWork(res.work);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save website data');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (id: string, updates: Partial<WebsiteSection>) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec)),
    }));
  };

  const toggleSectionEnabled = (id: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
      ),
    }));
  };

  const updateTheme = (updates: Partial<WebsiteTheme>) => {
    setData((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
    }));
  };

  const applyTemplate = (templateType: 'saas' | 'ecommerce' | 'portfolio') => {
    if (templateType === 'saas') {
      setData(getDefaultWebsiteData(work.title || work.name, work.description));
    } else if (templateType === 'ecommerce') {
      setData({
        template: 'ecommerce',
        siteTitle: 'Aura Boutique & Digital Commerce',
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
              { label: 'Curated Collections', link: '#collections' },
              { label: 'Our Story', link: '#story' },
              { label: 'Reviews', link: '#reviews' },
            ],
            ctaText: 'Cart (0)',
            ctaLink: '#cart',
          },
          {
            id: 'sec_hero',
            type: 'hero',
            badge: '🌿 Spring Edition Available Now',
            title: 'Elevate Your Space with Timeless Living',
            subtitle: 'Consciously designed everyday items crafted by artisan guilds with zero-waste packaging.',
            ctaText: 'Explore Spring Catalog',
            ctaLink: '#products',
            secondaryCtaText: 'Read Philosophy',
            secondaryCtaLink: '#story',
            enabled: true,
          },
          {
            id: 'sec_features',
            type: 'features',
            badge: 'The Aura Promise',
            title: 'Uncompromising Ethical Craftsmanship',
            subtitle: 'Every object is sustainably sourced, fairly compensated, and built to last generations.',
            enabled: true,
            items: [
              {
                icon: 'ShoppingBag',
                title: 'Carbon-Neutral Shipping',
                description: 'Offsetting 100% of freight emissions through certified global reforestation trusts.',
              },
              {
                icon: 'Star',
                title: 'Lifetime Craft Warranty',
                description: 'Complimentary repairs and material rejuvenation on all leatherware and ceramic goods.',
              },
              {
                icon: 'ShieldCheck',
                title: 'Traceable Artisans',
                description: 'Scan the provenance QR code on every package to see the craftsperson behind your item.',
              },
            ],
          },
          {
            id: 'sec_pricing',
            type: 'pricing',
            badge: 'Curated Sets',
            title: 'Seasonal Subscription Boxes',
            subtitle: 'Receive handcrafted goods and seasonal coffee roasts delivered to your door.',
            enabled: true,
            items: [
              {
                name: 'Minimalist Tier',
                price: '$35',
                period: '/month',
                description: '2 hand-selected seasonal artisan goods.',
                features: ['Zero Plastic Packaging', 'Digital Guidebook', 'Free Domestic Shipping'],
                buttonText: 'Subscribe Now',
                popular: false,
              },
              {
                name: 'Collector Box',
                price: '$75',
                period: '/month',
                description: '5 premium handcrafted items + limited art print.',
                features: [
                  'Limited Edition Ceramics',
                  'Exclusive Member Pre-releases',
                  'Direct Artisan Interview Notes',
                  'Free Global Shipping',
                ],
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
      });
    } else if (templateType === 'portfolio') {
      setData({
        template: 'portfolio',
        siteTitle: 'Studio Mono - Creative Architecture & Systems',
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
      });
    }
  };

  const handleAskAi = async (overridePrompt?: string) => {
    const prompt = overridePrompt || aiPrompt.trim();
    if (!prompt || aiLoading) return;

    setAiPrompt('');
    const userMsgId = `msg_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAiMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'USER',
        text: prompt,
        timestamp,
      },
    ]);

    setAiLoading(true);

    try {
      const lowerPrompt = prompt.toLowerCase();

      const res = await api.askWorkAgent({
        userPrompt: `The user is in the Live Website Builder working on "${data.siteTitle}". User request: "${prompt}".
Provide clear design guidance, advice on typography/copy/structure, and suggest concrete enhancements.`,
        workContext: {
          title: data.siteTitle,
          category: 'Websites',
          description: data.tagline,
          status: work.status,
          notes: `Theme: ${data.theme.primaryName}, Dark Mode: ${data.theme.darkMode}, Active Sections: ${data.sections.filter((s) => s.enabled).map((s) => s.type).join(', ')}`,
        },
      });

      let aiReplyText = res.reply || 'I have analyzed your website structure.';
      let actionObj: { label: string; apply: () => void } | undefined = undefined;

      if (lowerPrompt.includes('dark') || lowerPrompt.includes('night') || lowerPrompt.includes('luxe')) {
        actionObj = {
          label: 'Apply Dark Mode Theme',
          apply: () => {
            updateTheme({ darkMode: true, primaryColor: '#09090b', primaryName: 'Dark Luxe' });
          },
        };
      } else if (lowerPrompt.includes('emerald') || lowerPrompt.includes('green')) {
        actionObj = {
          label: 'Apply Emerald Palette',
          apply: () => {
            updateTheme({ primaryColor: '#059669', primaryName: 'Emerald' });
          },
        };
      } else if (lowerPrompt.includes('pricing') || lowerPrompt.includes('tier') || lowerPrompt.includes('plan')) {
        actionObj = {
          label: 'Add & Enable Pricing Section',
          apply: () => {
            const hasPricing = data.sections.some((s) => s.type === 'pricing');
            if (hasPricing) {
              updateSection('sec_pricing', { enabled: true });
            }
          },
        };
      } else if (lowerPrompt.includes('headline') || lowerPrompt.includes('hero') || lowerPrompt.includes('copy')) {
        actionObj = {
          label: 'Apply High-Converting Hero Copy',
          apply: () => {
            updateSection('sec_hero', {
              badge: '🔥 #1 Rated Platform for High-Velocity Teams',
              title: 'Build, Launch & Scale Websites at Impossible Speed',
              subtitle:
                'Turn product ideas into high-converting web applications with native team collaboration and autonomous AI assistance.',
              ctaText: 'Start Building Free — No Card Needed',
            });
          },
        };
      } else if (lowerPrompt.includes('review') || lowerPrompt.includes('testimonial')) {
        actionObj = {
          label: 'Enable 5-Star Testimonials',
          apply: () => {
            const hasTest = data.sections.some((s) => s.type === 'testimonials');
            if (hasTest) {
              updateSection('sec_testimonials', { enabled: true });
            }
          },
        };
      }

      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'AGENT',
          text: aiReplyText,
          suggestedAction: actionObj,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'AGENT',
          text: `I encountered an issue generating advice: ${err.message || 'Please check your connection'}. You can still customize all colors, sections, and copy directly using the visual inspector.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const generateExportHtml = () => {
    const primaryHex = data.theme.primaryColor;
    const isDark = data.theme.darkMode;
    const fontClass =
      data.theme.fontFamily === 'serif'
        ? 'font-serif'
        : data.theme.fontFamily === 'mono'
        ? 'font-mono'
        : 'font-sans';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.siteTitle}</title>
  <meta name="description" content="${data.tagline}">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root { --primary: ${primaryHex}; }
  </style>
</head>
<body class="${fontClass} ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'} antialiased min-h-screen">
  <header class="border-b ${isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-200 bg-white/80'} sticky top-0 z-50 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="font-bold text-lg tracking-tight">${data.sections.find((s) => s.type === 'navbar')?.title || data.siteTitle}</div>
      <nav class="hidden md:flex items-center gap-6 text-sm text-zinc-500">
        <a href="#features" class="hover:text-zinc-900 transition-colors">Features</a>
        <a href="#pricing" class="hover:text-zinc-900 transition-colors">Pricing</a>
        <a href="#testimonials" class="hover:text-zinc-900 transition-colors">Reviews</a>
      </nav>
      <a href="#pricing" style="background-color: ${primaryHex};" class="text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity">
        Get Started
      </a>
    </div>
  </header>

  <main>
    <section class="py-20 md:py-32 px-6 text-center max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}">
        ${data.sections.find((s) => s.type === 'hero')?.badge || 'Live Release'}
      </div>
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
        ${data.sections.find((s) => s.type === 'hero')?.title || data.siteTitle}
      </h1>
      <p class="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        ${data.sections.find((s) => s.type === 'hero')?.subtitle || data.tagline}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#pricing" style="background-color: ${primaryHex};" class="w-full sm:w-auto px-6 py-3.5 text-white rounded-xl font-bold text-sm shadow-md hover:opacity-95 transition-all">
          ${data.sections.find((s) => s.type === 'hero')?.ctaText || 'Get Started Now'}
        </a>
      </div>
    </section>
  </main>

  <footer class="border-t ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'} py-12 px-6 text-center text-xs text-zinc-500">
    <p>© 2026 ${data.siteTitle}. All rights reserved.</p>
  </footer>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateExportHtml());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([generateExportHtml()], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${(data.siteTitle || 'website').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const heroSection = data.sections.find((s) => s.type === 'hero');
  const navSection = data.sections.find((s) => s.type === 'navbar');
  const featuresSection = data.sections.find((s) => s.type === 'features');
  const pricingSection = data.sections.find((s) => s.type === 'pricing');
  const testimonialsSection = data.sections.find((s) => s.type === 'testimonials');
  const ctaSection = data.sections.find((s) => s.type === 'cta');
  const footerSection = data.sections.find((s) => s.type === 'footer');

  return (
    <div
      className={`flex flex-col bg-zinc-100 ${
        fullScreen ? 'fixed inset-0 z-50 overflow-hidden' : 'rounded-2xl border border-zinc-200 shadow-xs'
      }`}
      style={{ height: fullScreen ? '100vh' : 'calc(100vh - 120px)' }}
    >
      {/* TOP HEADER TOOLBAR */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 line-clamp-1">{work.title || work.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
                <Globe className="w-3 h-3" />
                <span>Registered for Everyone</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Live Website Builder & AI Agent Workspace
            </p>
          </div>
        </div>

        {/* Center: Viewport Controls */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 text-xs">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              viewport === 'desktop' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              viewport === 'tablet' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              viewport === 'mobile' ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Mode switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'PREVIEW' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('BUILDER')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'BUILDER' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>
            <button
              onClick={() => setActiveTab('CODE')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'CODE' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
          </div>

          <button
            onClick={() => setShowAiAgent(!showAiAgent)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              showAiAgent
                ? 'bg-teal-600 text-white hover:bg-teal-700 ring-2 ring-teal-600/30'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showAiAgent ? 'AI Agent Active' : 'Open AI Agent'}</span>
          </button>

          <button
            onClick={handleSaveWebsite}
            disabled={isSaving}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-teal-400" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {saveSuccess ? 'Saved & Registered!' : 'Save & Publish'}
            </span>
          </button>

          <button
            onClick={() => setFullScreen(!fullScreen)}
            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
            title={fullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT / CENTER */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-100/70 relative">
          {/* Quick Template Picker Bar */}
          <div className="bg-white border-b border-zinc-200/80 px-6 py-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-zinc-400 font-semibold text-[11px] whitespace-nowrap">Templates:</span>
              <button
                onClick={() => applyTemplate('saas')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  data.template === 'saas'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                🚀 AI SaaS Cloud
              </button>
              <button
                onClick={() => applyTemplate('ecommerce')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  data.template === 'ecommerce'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                🛍️ Modern Commerce
              </button>
              <button
                onClick={() => applyTemplate('portfolio')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  data.template === 'portfolio'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                📐 Studio Portfolio
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 text-[11px] font-semibold hidden md:inline">Palette:</span>
                <div className="flex items-center gap-1">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => updateTheme({ primaryColor: pal.id, primaryName: pal.name })}
                      className={`w-4 h-4 rounded-full ${pal.bgClass} transition-transform ${
                        data.theme.primaryColor === pal.id ? 'ring-2 ring-offset-1 ring-zinc-900 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={pal.name}
                    />
                  ))}
                </div>
              </div>

              <div className="h-3 w-px bg-zinc-200 mx-1" />

              <button
                onClick={() => updateTheme({ darkMode: !data.theme.darkMode })}
                className="text-[11px] px-2 py-0.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-semibold text-zinc-700"
              >
                {data.theme.darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>
          </div>

          {/* TAB 1: VISUAL PREVIEW CANVAS */}
          {activeTab === 'PREVIEW' && (
            <div className="flex-1 p-4 md:p-8 flex justify-center items-start overflow-y-auto">
              <div
                className={`transition-all duration-300 bg-white shadow-xl rounded-2xl border border-zinc-200 overflow-hidden flex flex-col ${
                  viewport === 'mobile'
                    ? 'w-[375px] my-4 ring-8 ring-zinc-900/10'
                    : viewport === 'tablet'
                    ? 'w-[768px] my-4 ring-8 ring-zinc-900/10'
                    : 'w-full max-w-5xl my-2'
                }`}
                style={{
                  minHeight: '600px',
                  backgroundColor: data.theme.darkMode ? '#09090b' : '#ffffff',
                  color: data.theme.darkMode ? '#f4f4f5' : '#18181b',
                  fontFamily:
                    data.theme.fontFamily === 'serif'
                      ? 'serif'
                      : data.theme.fontFamily === 'mono'
                      ? 'monospace'
                      : 'inherit',
                }}
              >
                {(viewport === 'mobile' || viewport === 'tablet') && (
                  <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-500 select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="bg-white px-3 py-0.5 rounded-md border border-zinc-200 text-zinc-600 font-mono text-[10px] truncate max-w-[200px]">
                      https://workchat.app/sites/{work.id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-zinc-400">{viewport.toUpperCase()}</div>
                  </div>
                )}

                {/* 1. NAVBAR */}
                {navSection && navSection.enabled && (
                  <header
                    className={`sticky top-0 z-20 px-6 py-4 border-b backdrop-blur-md flex items-center justify-between ${
                      data.theme.darkMode
                        ? 'border-zinc-800/80 bg-zinc-950/80 text-white'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-900'
                    }`}
                  >
                    <div className="font-extrabold text-base tracking-tight flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: data.theme.primaryColor }}
                      >
                        {navSection.title ? navSection.title.charAt(0) : 'W'}
                      </div>
                      <span>{navSection.title || data.siteTitle}</span>
                    </div>

                    <nav className="hidden sm:flex items-center gap-6 text-xs font-semibold text-zinc-500">
                      {navSection.items?.map((item: any, idx: number) => (
                        <a
                          key={idx}
                          href={item.link || '#'}
                          className="hover:text-zinc-900 transition-colors"
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>

                    <div>
                      <button
                        style={{ backgroundColor: data.theme.primaryColor }}
                        className="text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                      >
                        {navSection.ctaText || 'Get Started'}
                      </button>
                    </div>
                  </header>
                )}

                {/* 2. HERO SECTION */}
                {heroSection && heroSection.enabled && (
                  <section className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto space-y-6">
                    {heroSection.badge && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border border-zinc-200/80 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                        <span>{heroSection.badge}</span>
                      </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                      {heroSection.title}
                    </h1>

                    <p className="text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                      {heroSection.subtitle}
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        style={{ backgroundColor: data.theme.primaryColor }}
                        className="w-full sm:w-auto px-6 py-3 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>{heroSection.ctaText || 'Launch Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {heroSection.secondaryCtaText && (
                        <button className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold border border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                          {heroSection.secondaryCtaText}
                        </button>
                      )}
                    </div>

                    <div className="mt-12 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-inner">
                      <div className="flex items-center justify-between mb-4 border-b border-zinc-200/60 dark:border-zinc-800 pb-3 text-left">
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            Live Environment Preview
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            High throughput • Auto-scaling active
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ● Online
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                          <div className="text-[10px] text-zinc-400">Total Deployments</div>
                          <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">1,482</div>
                          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ 24% this week</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                          <div className="text-[10px] text-zinc-400">Response Speed</div>
                          <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">14ms</div>
                          <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Global Edge CDN</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                          <div className="text-[10px] text-zinc-400">Team Collaboration</div>
                          <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">Real-Time</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">Registered for everyone</div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 3. FEATURES */}
                {featuresSection && featuresSection.enabled && (
                  <section id="features" className="px-6 py-16 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                      {featuresSection.badge && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2">
                          {featuresSection.badge}
                        </div>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                        {featuresSection.title}
                      </h2>
                      <p className="text-xs md:text-sm text-zinc-500 max-w-xl mx-auto">
                        {featuresSection.subtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                      {featuresSection.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 transition-all hover:shadow-xs text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4"
                            style={{ backgroundColor: data.theme.primaryColor }}
                          >
                            {idx === 0 ? <Zap className="w-5 h-5" /> : idx === 1 ? <ShieldCheck className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                          </div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. PRICING */}
                {pricingSection && pricingSection.enabled && (
                  <section id="pricing" className="px-6 py-16 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="max-w-4xl mx-auto text-center mb-8">
                      {pricingSection.badge && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2">
                          {pricingSection.badge}
                        </div>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                        {pricingSection.title}
                      </h2>
                      <p className="text-xs md:text-sm text-zinc-500 max-w-xl mx-auto mb-6">
                        {pricingSection.subtitle}
                      </p>

                      <div className="inline-flex items-center gap-2 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold">
                        <button
                          onClick={() => setPricingAnnual(false)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            !pricingAnnual ? 'bg-zinc-900 text-white' : 'text-zinc-500'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setPricingAnnual(true)}
                          className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                            pricingAnnual ? 'bg-zinc-900 text-white' : 'text-zinc-500'
                          }`}
                        >
                          <span>Annual</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                            Save 20%
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
                      {pricingSection.items?.map((plan: any, idx: number) => {
                        const rawPrice = parseInt(plan.price.replace(/[^0-9]/g, ''), 10) || 0;
                        const displayPrice = pricingAnnual && rawPrice > 0 ? `$${Math.round(rawPrice * 0.8)}` : plan.price;

                        return (
                          <div
                            key={idx}
                            className={`p-6 rounded-2xl border flex flex-col justify-between text-left transition-all ${
                              plan.popular
                                ? 'bg-white dark:bg-zinc-900 border-2 shadow-md relative'
                                : 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800'
                            }`}
                            style={{ borderColor: plan.popular ? data.theme.primaryColor : undefined }}
                          >
                            {plan.popular && (
                              <div
                                style={{ backgroundColor: data.theme.primaryColor }}
                                className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider"
                              >
                                Most Popular
                              </div>
                            )}

                            <div>
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                                {plan.name}
                              </h3>
                              <p className="text-[11px] text-zinc-500 mb-4">{plan.description}</p>

                              <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                                  {displayPrice}
                                </span>
                                <span className="text-xs text-zinc-400">{plan.period}</span>
                              </div>

                              <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                                {plan.features?.map((feat: string, fIdx: number) => (
                                  <li key={fIdx} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              style={{
                                backgroundColor: plan.popular ? data.theme.primaryColor : undefined,
                              }}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                                plan.popular
                                  ? 'text-white hover:opacity-95 shadow-sm'
                                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-900 dark:text-white'
                              }`}
                            >
                              {plan.buttonText || 'Select Plan'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 5. TESTIMONIALS */}
                {testimonialsSection && testimonialsSection.enabled && (
                  <section id="testimonials" className="px-6 py-16 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="max-w-4xl mx-auto text-center mb-10">
                      {testimonialsSection.badge && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2">
                          {testimonialsSection.badge}
                        </div>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                        {testimonialsSection.title}
                      </h2>
                      <p className="text-xs md:text-sm text-zinc-500 max-w-xl mx-auto">
                        {testimonialsSection.subtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {testimonialsSection.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left space-y-4"
                        >
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                            "{item.quote}"
                          </p>
                          <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <img
                              src={item.avatar}
                              alt={item.author}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-zinc-900 dark:text-white">
                                {item.author}
                              </div>
                              <div className="text-[10px] text-zinc-400">{item.role}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 6. CALL TO ACTION */}
                {ctaSection && ctaSection.enabled && (
                  <section
                    className="px-6 py-14 text-center text-white"
                    style={{ backgroundColor: data.theme.primaryColor }}
                  >
                    <div className="max-w-2xl mx-auto space-y-4">
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        {ctaSection.title}
                      </h2>
                      <p className="text-xs md:text-sm text-white/80 max-w-lg mx-auto">
                        {ctaSection.subtitle}
                      </p>
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                        <input
                          type="email"
                          placeholder="Enter work email..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/20 placeholder-white/60 text-white text-xs border border-white/30 focus:outline-hidden focus:bg-white/30"
                        />
                        <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 transition-colors shrink-0">
                          {ctaSection.ctaText || 'Get Started'}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* 7. FOOTER */}
                {footerSection && footerSection.enabled && (
                  <footer
                    className={`px-6 py-10 border-t text-center text-xs ${
                      data.theme.darkMode
                        ? 'border-zinc-800 bg-zinc-950 text-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <div className="font-bold text-zinc-900 dark:text-zinc-200 mb-1">
                      {footerSection.title}
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-4">{footerSection.subtitle}</p>
                    <div className="text-[10px] text-zinc-400">
                      © 2026 {footerSection.title}. Built with WorkChat Live Website Builder.
                    </div>
                  </footer>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS & VISUAL BUILDER */}
          {activeTab === 'BUILDER' && (
            <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto">
              <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Brand & Theme Appearance
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-400">Active Theme: {data.theme.primaryName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data.theme.primaryColor}
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-zinc-200 p-0.5 cursor-pointer"
                      />
                      <span className="font-mono text-xs">{data.theme.primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Typography</label>
                    <select
                      value={data.theme.fontFamily}
                      onChange={(e) => updateTheme({ fontFamily: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800"
                    >
                      <option value="sans">Modern Sans-Serif</option>
                      <option value="serif">Editorial Serif</option>
                      <option value="mono">Technical Monospace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1">Color Mode</label>
                    <button
                      onClick={() => updateTheme({ darkMode: !data.theme.darkMode })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 text-left flex items-center justify-between"
                    >
                      <span>{data.theme.darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                      <span className="text-[10px] text-zinc-400">Click to toggle</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Website Layout Sections
                  </h3>
                  <span className="text-xs text-zinc-400">Toggle or edit content</span>
                </div>

                {data.sections.map((sec) => {
                  const isExpanded = expandedSection === sec.id;

                  return (
                    <div
                      key={sec.id}
                      className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden transition-all"
                    >
                      <div className="p-4 flex items-center justify-between gap-3 bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSectionEnabled(sec.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                              sec.enabled
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : 'border-zinc-300 bg-white text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <div>
                            <span className="text-xs font-bold text-zinc-900 capitalize">
                              {sec.type} Section
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-2">
                              {sec.enabled ? 'Enabled' : 'Hidden'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-5 border-t border-zinc-100 space-y-3 text-xs">
                          {sec.title !== undefined && (
                            <div>
                              <label className="block text-zinc-600 font-semibold mb-1">Title / Headline</label>
                              <input
                                type="text"
                                value={sec.title}
                                onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                              />
                            </div>
                          )}

                          {sec.subtitle !== undefined && (
                            <div>
                              <label className="block text-zinc-600 font-semibold mb-1">
                                Subtitle / Description
                              </label>
                              <textarea
                                rows={2}
                                value={sec.subtitle}
                                onChange={(e) => updateSection(sec.id, { subtitle: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 resize-none"
                              />
                            </div>
                          )}

                          {sec.badge !== undefined && (
                            <div>
                              <label className="block text-zinc-600 font-semibold mb-1">Badge Tag</label>
                              <input
                                type="text"
                                value={sec.badge}
                                onChange={(e) => updateSection(sec.id, { badge: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                              />
                            </div>
                          )}

                          {sec.ctaText !== undefined && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-zinc-600 font-semibold mb-1">
                                  Primary Button Text
                                </label>
                                <input
                                  type="text"
                                  value={sec.ctaText}
                                  onChange={(e) => updateSection(sec.id, { ctaText: e.target.value })}
                                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
                                />
                              </div>
                              <div>
                                <label className="block text-zinc-600 font-semibold mb-1">
                                  Button Target Link
                                </label>
                                <input
                                  type="text"
                                  value={sec.ctaLink || '#'}
                                  onChange={(e) => updateSection(sec.id, { ctaLink: e.target.value })}
                                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CODE */}
          {activeTab === 'CODE' && (
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Production HTML / Tailwind Export
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Directly export or copy clean, standalone, responsive HTML markup.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={handleDownloadHtml}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download index.html</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-zinc-900 rounded-2xl p-4 overflow-hidden flex flex-col border border-zinc-800 shadow-inner">
                <textarea
                  readOnly
                  value={generateExportHtml()}
                  className="flex-1 w-full bg-transparent text-teal-300 font-mono text-xs leading-relaxed focus:outline-hidden resize-none overflow-y-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: AI WEBSITE AGENT */}
        {showAiAgent && (
          <div className="w-80 md:w-96 bg-white border-l border-zinc-200 flex flex-col h-full shrink-0 shadow-lg">
            <div className="p-4 bg-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>AI Website Agent</span>
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-teal-300">Working on {data.siteTitle}</p>
                </div>
              </div>

              <button
                onClick={() => setShowAiAgent(false)}
                className="p-1 text-teal-300 hover:text-white rounded-lg hover:bg-teal-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none shrink-0">
              <button
                onClick={() => handleAskAi('Optimize headline and hero for high conversion rates')}
                className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 whitespace-nowrap font-medium"
              >
                ⚡ Boost Conversion
              </button>
              <button
                onClick={() => handleAskAi('Switch to dark luxury theme with modern styling')}
                className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 whitespace-nowrap font-medium"
              >
                🌙 Dark Luxury
              </button>
              <button
                onClick={() => handleAskAi('Add pricing table with monthly and annual options')}
                className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 whitespace-nowrap font-medium"
              >
                💳 Pricing Tiers
              </button>
              <button
                onClick={() => handleAskAi('Add customer testimonials with 5-star reviews')}
                className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 whitespace-nowrap font-medium"
              >
                ⭐ Testimonials
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/40 text-xs">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                      msg.sender === 'USER'
                        ? 'bg-zinc-900 text-white rounded-br-xs'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}

                    {msg.suggestedAction && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-100">
                        <button
                          onClick={() => {
                            msg.suggestedAction?.apply();
                            alert('Action applied to Website Builder!');
                          }}
                          className="w-full py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-teal-200"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>{msg.suggestedAction.label}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 p-2 bg-white rounded-xl border border-zinc-200 max-w-[80%]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>AI Agent is generating website updates...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="p-3 border-t border-zinc-200 bg-white flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask agent: 'Change to emerald', 'Add FAQ'..."
                className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || aiLoading}
                className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
                title="Send instruction to AI Agent"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
