import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  UserPlus,
  KeyRound,
  Server,
  HardDrive,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

interface OwnerSystemSettingsTabProps {
  settings: {
    instanceName: string;
    securityLockdown: boolean;
    allowRegistration: boolean;
    maintenanceMode: boolean;
    enableSecretClaim: boolean;
  };
  onSaveSettings: (updated: any) => Promise<void>;
}

export const OwnerSystemSettingsTab: React.FC<OwnerSystemSettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState({
    instanceName: settings.instanceName || 'WorkChat',
    securityLockdown: Boolean(settings.securityLockdown),
    allowRegistration: settings.allowRegistration !== false,
    maintenanceMode: Boolean(settings.maintenanceMode),
    enableSecretClaim: settings.enableSecretClaim !== false,
    defaultStorageMb: 2048,
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSaveSettings(form);
      setFeedback({ type: 'success', text: 'Paramètres système enregistrés avec succès !' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          Paramètres Globaux du Système
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Contrôlez les règles fondamentales et la sécurité de l'application
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

      {/* Card 1: Sécurité & Accès */}
      <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Sécurité & Accès Global</h3>
            <p className="text-[11px] text-zinc-500">
              Flags de contrôle opérationnel et de restriction d'accès
            </p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 space-y-2">
          {/* Toggle 1: Verrouillage d'urgence */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Verrouillage de Sécurité d'Urgence</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Bloque immédiatement l'écriture et les créations pour tous les utilisateurs non-propriétaires.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, securityLockdown: !p.securityLockdown }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.securityLockdown ? 'bg-red-600' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  form.securityLockdown ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Mode Maintenance */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Mode Maintenance</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Seuls les propriétaires et administrateurs peuvent naviguer sur la plateforme.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.maintenanceMode ? 'bg-amber-600' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  form.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Inscriptions */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inscriptions Publiques</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Autoriser de nouveaux utilisateurs à créer un compte depuis la page d'accueil.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, allowRegistration: !p.allowRegistration }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.allowRegistration ? 'bg-emerald-600' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  form.allowRegistration ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Code Secret */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Revendication de Rôle par Code Secret</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Permettre l'utilisation du code d'accès gate pour s'élever au rôle propriétaire.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, enableSecretClaim: !p.enableSecretClaim }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.enableSecretClaim ? 'bg-zinc-900' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  form.enableSecretClaim ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card 2: Identité de la Plateforme */}
      <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Identité & Capacités de l'Instance</h3>
            <p className="text-[11px] text-zinc-500">
              Paramètres visuels et quotas généraux appliqués aux membres
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              Nom de l'instance
            </label>
            <input
              type="text"
              value={form.instanceName}
              onChange={(e) => setForm((p) => ({ ...p, instanceName: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              Quota de stockage par défaut (Mo)
            </label>
            <input
              type="number"
              value={form.defaultStorageMb}
              onChange={(e) => setForm((p) => ({ ...p, defaultStorageMb: Number(e.target.value) }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-400" />}
          <span>Enregistrer les modifications</span>
        </button>
      </div>
    </form>
  );
};
