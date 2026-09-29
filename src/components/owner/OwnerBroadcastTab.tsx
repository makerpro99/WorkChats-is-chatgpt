import React, { useState } from 'react';
import {
  Radio,
  Send,
  Trophy,
  Clock,
  Image as ImageIcon,
  ThumbsUp,
  MessageCircle,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Announcement, User } from '../../types';

interface OwnerBroadcastTabProps {
  currentUser: User | null;
  announcements: Announcement[];
  onBroadcastAnnouncement: (data: {
    title: string;
    content: string;
    winnerMention?: string;
    bannerDuration?: number;
    imageUrl?: string;
  }) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export const OwnerBroadcastTab: React.FC<OwnerBroadcastTabProps> = ({
  currentUser,
  announcements,
  onBroadcastAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [winnerMention, setWinnerMention] = useState('@lucas_dev');
  const [bannerDuration, setBannerDuration] = useState(3);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
  );

  const [broadcasting, setBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setBroadcasting(true);
    setFeedback(null);
    try {
      await onBroadcastAnnouncement({
        title,
        content,
        winnerMention: winnerMention.trim() ? winnerMention.trim() : undefined,
        bannerDuration,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
      });
      setFeedback({ type: 'success', text: 'Annonce officielle diffusée avec succès !' });
      setTitle('');
      setContent('');
      setWinnerMention('');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Échec de la diffusion.' });
    } finally {
      setBroadcasting(false);
    }
  };

  const authorDisplayName = currentUser?.displayName || 'Ceo director';
  const authorAvatarUrl =
    currentUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          Diffusion d'Annonce Officielle
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Publiez une annonce prioritaire affichée sous forme de post YouTube avec mention de gagnant et bandeau
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, YouTube Community Post Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form */}
        <form
          onSubmit={handlePublish}
          className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900">Rédiger l'Annonce</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              Titre de l'annonce *
            </label>
            <input
              type="text"
              placeholder="ex: Grande mise à jour & Félicitations du mois..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              Contenu du message *
            </label>
            <textarea
              rows={4}
              placeholder="Rédigez les détails de l'annonce officielle pour la communauté..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Membre mis à l'honneur / Gagnant (optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="ex: @lucas_dev ou @elena_design"
              value={winnerMention}
              onChange={(e) => setWinnerMention(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Durée du bandeau</span>
              </label>
              <select
                value={bannerDuration}
                onChange={(e) => setBannerDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value={1}>1 jour</option>
                <option value={3}>3 jours (recommandé)</option>
                <option value={7}>7 jours</option>
                <option value={30}>30 jours (Permanent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Image / Bannière URL</span>
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={broadcasting || !title.trim() || !content.trim()}
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-sm disabled:opacity-50"
            >
              {broadcasting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-amber-400" />
              )}
              <span>Diffuser l'Annonce Officielle</span>
            </button>
          </div>
        </form>

        {/* Right Column: YouTube Community Post Style Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
            <span>Aperçu en Direct (Style Post YouTube)</span>
            <span className="text-amber-600 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Format Post Communauté</span>
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 space-y-4">
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={authorAvatarUrl}
                    alt={authorDisplayName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                    <Crown className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900">{authorDisplayName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase tracking-wider">
                      OFFICIEL
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">À l'instant • Post Communauté</div>
                </div>
              </div>

              <span className="text-xs text-zinc-400 font-mono">Bandeau : {bannerDuration}j</span>
            </div>

            {/* Post Title & Content */}
            <div className="space-y-2">
              <h4 className="text-base font-black text-zinc-900 tracking-tight">
                {title || 'Titre de votre annonce officielle'}
              </h4>
              <p className="text-xs text-zinc-700 whitespace-pre-line leading-relaxed">
                {content ||
                  'Le contenu rédigé dans le formulaire apparaîtra ici avec une typographie soignée et un format interactif inspiré des posts communautaires YouTube.'}
              </p>
            </div>

            {/* Highlighted Winner Banner */}
            {winnerMention && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Membre mis à l'honneur
                  </div>
                  <div className="text-xs font-black text-zinc-950 font-mono">
                    {winnerMention}
                  </div>
                </div>
              </div>
            )}

            {/* Post Image */}
            {imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-zinc-100 max-h-64">
                <img
                  src={imageUrl}
                  alt="Bannière d'annonce"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Social Interaction Buttons Mock */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-xs">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-zinc-900 cursor-pointer transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-semibold text-[11px]">124</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-zinc-900 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-semibold text-[11px]">18</span>
                </button>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-zinc-900 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-semibold text-[11px]">Partager</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Past Official Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-200">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Historique des Annonces Diffusées ({announcements.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-xs text-zinc-900">{ann.title}</h5>
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Supprimer l'annonce"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1">{ann.content}</p>

                  {ann.winnerMention && (
                    <div className="mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      🏆 Mis en avant : {ann.winnerMention}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span>Par {ann.authorName || ann.creatorName}</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
