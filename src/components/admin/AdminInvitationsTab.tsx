import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../api';

interface AdminInvitationsTabProps {
  onInvitationSent?: () => void;
}

export const AdminInvitationsTab: React.FC<AdminInvitationsTabProps> = ({
  onInvitationSent,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Veuillez renseigner une adresse email valide.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await api.sendAdminInvitation({ email, role });
      setMessage({ type: 'success', text: res.message || 'Invitation envoyée avec succès !' });
      setEmail('');
      if (onInvitationSent) onInvitationSent();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Échec de l'envoi de l'invitation." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Gestion des Invitations d'Équipe
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Envoyez des invitations par email avec attribution automatique du rôle MEMBER ou ADMIN
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">
          Inviter un nouveau collaborateur
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Adresse email du collaborateur *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborateur@entreprise.com"
              required
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Rôle attribué à l'arrivée
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'MEMBER' | 'ADMIN')}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="MEMBER">MEMBER (Recommandé par défaut)</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer l'invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
