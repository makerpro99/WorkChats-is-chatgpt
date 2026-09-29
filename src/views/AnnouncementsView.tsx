import React, { useState, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Upload,
  X,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { Announcement, AnnouncementComment, User } from '../types';
import { api } from '../api';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentUser: User;
  onRefresh: () => void;
  onAnnouncementPublished?: (announcement: Announcement) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  currentUser,
  onRefresh,
  onAnnouncementPublished,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'GENERAL' | 'PRODUCT' | 'POLICY' | 'MAINTENANCE' | 'SECURITY'>('GENERAL');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comments toggled per announcement
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Like loading state
  const [likingId, setLikingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPost = currentUser.role === 'OWNER' || currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';

  // Handle image import from computer or device
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, GIF, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSelectedImage = () => {
    setImageUrl('');
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.createAnnouncement({
        title,
        content,
        category,
        imageUrl: imageUrl || undefined,
      });
      setTitle('');
      setContent('');
      setImageUrl('');
      setImageFileName('');
      setShowCreateModal(false);
      if (res && res.announcement && onAnnouncementPublished) {
        onAnnouncementPublished(res.announcement);
      }
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Échec de publication de l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  // Like toggle (+1 j'aime)
  const handleToggleLike = async (announcementId: string) => {
    if (likingId) return;
    setLikingId(announcementId);
    try {
      await api.likeAnnouncement(announcementId);
      onRefresh();
    } catch (err: any) {
      console.error('Like error:', err);
    } finally {
      setLikingId(null);
    }
  };

  // Toggle comments section
  const toggleComments = (announcementId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [announcementId]: !prev[announcementId],
    }));
  };

  // Submit comment
  const handleAddComment = async (announcementId: string) => {
    const text = (commentInputs[announcementId] || '').trim();
    if (!text || submittingComment[announcementId]) return;

    setSubmittingComment((prev) => ({ ...prev, [announcementId]: true }));
    try {
      await api.addAnnouncementComment(announcementId, text);
      setCommentInputs((prev) => ({ ...prev, [announcementId]: '' }));
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Impossible d’ajouter le commentaire.');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Annonces & Mises à Jour</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Informations officielles, notes de version, alertes sécurité et discussions d'équipe.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publier une annonce</span>
          </button>
        )}
      </div>

      <div className="space-y-5">
        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-400">
            Aucune annonce n'a été diffusée pour l'instant.
          </div>
        ) : (
          announcements.map((item) => {
            const likesList = item.likes || [];
            const hasLiked = likesList.includes(currentUser.id);
            const likesCount = item.likesCount ?? likesList.length;
            const commentsList = item.comments || [];
            const areCommentsOpen = !!openComments[item.id];
            const currentCommentInput = commentInputs[item.id] || '';
            const isSubmitting = !!submittingComment[item.id];

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4 transition-all hover:border-zinc-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase tracking-wider">
                      {item.category || 'GÉNÉRAL'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-zinc-900">{item.title}</h2>
                  <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {/* Attached Image (if uploaded from device/computer) */}
                {item.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 max-h-96 bg-zinc-50 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-auto max-h-96 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Author Info */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    {item.creatorAvatar ? (
                      <img
                        src={item.creatorAvatar}
                        alt={item.creatorName || item.authorName}
                        className="w-5 h-5 rounded-full object-cover border border-zinc-200"
                      />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>
                      Diffusé par <strong>{item.authorName || item.creatorName}</strong>
                    </span>
                  </div>
                  <span className="text-teal-700 font-semibold text-[10px] uppercase">Avis Officiel</span>
                </div>

                {/* Action Bar: Like (+1 j'aime) & Comments */}
                <div className="pt-3 border-t border-zinc-100 flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    id={`btn-like-announcement-${item.id}`}
                    onClick={() => handleToggleLike(item.id)}
                    disabled={likingId === item.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      hasLiked
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    }`}
                    title={hasLiked ? 'Je retire mon j’aime' : 'Ajouter +1 j’aime'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        hasLiked ? 'fill-rose-600 text-rose-600' : 'text-zinc-500'
                      }`}
                    />
                    <span>
                      {likesCount > 0 ? `${likesCount} J'aime` : "J'aime"}
                    </span>
                    {hasLiked && <span className="text-[10px] font-bold text-rose-500">+1</span>}
                  </button>

                  {/* Comments Button */}
                  <button
                    id={`btn-comments-announcement-${item.id}`}
                    onClick={() => toggleComments(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      {commentsList.length > 0
                        ? `${commentsList.length} Commentaire${commentsList.length > 1 ? 's' : ''}`
                        : 'Commentaires'}
                    </span>
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {areCommentsOpen && (
                  <div className="pt-3 mt-2 border-t border-zinc-100 space-y-3 bg-zinc-50/70 p-3.5 rounded-xl animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                      <span>Commentaires des utilisateurs ({commentsList.length})</span>
                    </div>

                    {/* Comments List */}
                    {commentsList.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic py-1">
                        Aucun commentaire pour le moment. Soyez le premier à réagir !
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {commentsList.map((comm) => (
                          <div
                            key={comm.id}
                            className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-2xs space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {comm.userAvatar ? (
                                  <img
                                    src={comm.userAvatar}
                                    alt={comm.displayName}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-600">
                                    {comm.displayName?.charAt(0) || 'U'}
                                  </div>
                                )}
                                <span className="font-bold text-zinc-900">{comm.displayName}</span>
                                <span className="text-[10px] text-zinc-400">(@{comm.username})</span>
                              </div>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(comm.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-zinc-700 pl-5 text-[11px] whitespace-pre-wrap">
                              {comm.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={currentCommentInput}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(item.id);
                          }
                        }}
                        placeholder="Écrivez un commentaire..."
                        className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                      />
                      <button
                        onClick={() => handleAddComment(item.id)}
                        disabled={isSubmitting || !currentCommentInput.trim()}
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Envoyer</span>
                            <Send className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal to publish announcement with Image upload from device/computer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 mb-1">Nouvelle Annonce</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Publiez un message officiel pour tous les membres avec image depuis votre appareil.
            </p>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Titre de l'annonce</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Nouvelle mise à jour déployée..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
                >
                  <option value="GENERAL">Général</option>
                  <option value="PRODUCT">Produit</option>
                  <option value="POLICY">Politique interne</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SECURITY">Sécurité</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Détails du message</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Exprimez les détails de l'annonce..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              {/* Import image from computer or mobile device */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                  <span>Image d'illustration (Ordinateur ou Appareil)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Optionnel</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 p-2">
                    <img
                      src={imageUrl}
                      alt="Aperçu annonce"
                      className="max-h-48 w-full object-contain rounded-lg"
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                        {imageFileName || 'Image sélectionnée'}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveSelectedImage}
                        className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-zinc-50/50 hover:bg-zinc-50 transition-colors text-zinc-600"
                  >
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-semibold">Importer une image depuis votre appareil</span>
                    <span className="text-[10px] text-zinc-400">PNG, JPG, WebP ou GIF (max 5 Mo)</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
