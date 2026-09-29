import React from 'react';
import {
  MessageSquare,
  CheckSquare2,
  Users2,
  Briefcase,
  Bot,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  UserPlus,
  LayoutDashboard,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { LanguageButton } from '../components/LanguageButton';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onQuickFreeAccount: () => void;
  onGoogleSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onQuickFreeAccount,
  onGoogleSignIn,
}) => {
  const [quickLoading, setQuickLoading] = React.useState(false);

  const handleInstantFree = async () => {
    setQuickLoading(true);
    try {
      await onQuickFreeAccount();
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <header className="h-20 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-30 px-6 lg:px-12 flex items-center justify-between">
        <Logo size="lg" />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageButton variant="landing" />

          {onGoogleSignIn && (
            <div className="hidden sm:block">
              <GoogleSignInButton onClick={onGoogleSignIn} label="Google" />
            </div>
          )}

          <a
            href="#how-it-works"
            className="hidden md:inline-flex px-3 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            How It Works
          </a>
          <button
            id="btn-landing-login"
            onClick={onOpenLogin}
            className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            Connexion
          </button>
          <button
            id="btn-landing-signup"
            onClick={onOpenRegister}
            className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-all"
          >
            Inscription standard
          </button>
          <button
            id="btn-landing-instant-free"
            onClick={handleInstantFree}
            disabled={quickLoading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
            title="Connexion automatique immédiate sans saisir de mot de passe ou email"
          >
            <Sparkles className="w-4 h-4" />
            <span>{quickLoading ? 'Connexion en cours...' : 'Free Account (Sans mot de passe)'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 text-center max-w-5xl mx-auto">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 mb-8">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>WorkChat 2.0 • Espace de collaboration d'entreprise unifié</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 max-w-3xl leading-[1.15] mb-6">
          Travaillez ensemble. Restez connectés.{' '}
          <span className="text-teal-600 underline decoration-teal-300 decoration-wavy decoration-2">
            Passez à l'action.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl font-normal leading-relaxed mb-10">
          Un espace haute performance combinant messagerie instantanée directe, appels vocaux & vidéo HD, équipes, tâches structurées, annonces officielles et gestion de projets professionnels.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-16">
          <button
            id="btn-hero-free-account"
            onClick={handleInstantFree}
            disabled={quickLoading}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            title="Cliquez pour vous connecter automatiquement avec un compte membre sans rien taper"
          >
            <Sparkles className="w-5 h-5" />
            <span>{quickLoading ? 'Connexion automatique...' : 'Free Account (Sans mot de passe)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="btn-hero-sign-in"
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl shadow-xs transition-colors"
          >
            Se connecter
          </button>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left pt-6 border-t border-zinc-100">
          <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Messagerie Directe & Appels HD</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Discussions en temps réel, notifications immédiates, appels vidéo et appels vocaux originaux directement intégrés au chat.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Centre de Productivité WORK</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Catégories complètes : Code, Sites Web, Documents, Tableurs et Présentations avec suivi de fichiers et permissions granulaires.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mb-4">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Équipes & Annonces Interactives</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Canaux d'équipe, annonces avec import d'images depuis votre appareil, likes en un clic (+1 j'aime) et commentaires des utilisateurs.
            </p>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="w-full pt-16 mt-4 border-t border-zinc-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple, Rapide & Efficace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Get started with WorkChat in 4 simple steps and transform your team collaboration today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  1
                </div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-teal-700 transition-colors">
                Create Your Account
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Users create their WorkChat account with their username and email, or jump in instantly with one click.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  2
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-teal-700 transition-colors">
                Join WorkChat
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                After signing in, users can access their workspace, communicate with other members, manage friends, announcements, and tasks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  3
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-teal-700 transition-colors">
                Work Together
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Users can create and manage tasks, communicate with their team, add friends, and collaborate inside WorkChat.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  4
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-teal-700 transition-colors">
                Achieve & Scale
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Track deliverables with WORK Studio, launch HD audio & video calls, and leverage built-in Gemini AI agents to accelerate productivity.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Production Payments Guarantee */}
        <div className="mt-12 p-5 rounded-2xl bg-zinc-50 border border-zinc-200 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-teal-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Role-Enforced Security & Production Payments</div>
              <div className="text-[11px] text-zinc-500">
                Full server-side authorization, Owner root protection, zero plaintext passwords, and clean Stripe production checkout.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 shrink-0">
            <CreditCard className="w-4 h-4 text-zinc-400" />
            <span>PCI-DSS Compliant</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-100 text-center text-xs text-zinc-400">
        WorkChat Platform © 2026. Built with precision for professional collaborative teams.
      </footer>
    </div>
  );
};
