import React, { useState } from 'react';
import { Flag, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { api } from '../api';

interface ReportIncidentModalProps {
  targetType: 'MESSAGE' | 'USER';
  targetId: string;
  targetName: string;
  targetContent?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  targetType,
  targetId,
  targetName,
  targetContent,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('HARASSMENT');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.reportItem({
        type: targetType,
        targetId,
        targetName,
        targetContent,
        reason,
        details,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Report {targetType === 'MESSAGE' ? 'Message' : 'Colleague'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 mb-4">
          Reports are directly routed to the Moderator & Admin team queues for review and action.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Incident report submitted to moderation console.</span>
          </div>
        )}

        {targetContent && (
          <div className="p-2.5 mb-3.5 bg-zinc-50 rounded-xl text-xs font-mono text-zinc-700 border border-zinc-200/70">
            "{targetContent}"
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Violation Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
            >
              <option value="HARASSMENT">Harassment or Bullying</option>
              <option value="SPAM">Spam or Unsolicited Promotion</option>
              <option value="INAPPROPRIATE">Inappropriate Content</option>
              <option value="SECURITY">Security / Data Breach Concern</option>
              <option value="OTHER">Other Community Standard Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Incident Context / Explanation
            </label>
            <textarea
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide details to help our moderation team review this effectively."
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
