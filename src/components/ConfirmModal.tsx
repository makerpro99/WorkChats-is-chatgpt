import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      id="confirm-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="confirm-modal"
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 p-5 text-center animate-in zoom-in-95 duration-150"
      >
        <div
          className={`w-12 h-12 mx-auto mb-3.5 rounded-xl flex items-center justify-center ${
            isDestructive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-zinc-900 mb-1.5">{title}</h3>
        <p className="text-xs text-zinc-500 leading-relaxed mb-5">{message}</p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-confirm-modal-cancel"
            onClick={onCancel}
            className="flex-1 py-2 px-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            id="btn-confirm-modal-submit"
            onClick={onConfirm}
            className={`flex-1 py-2 px-3.5 text-xs font-semibold rounded-xl text-white transition-colors shadow-xs ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
