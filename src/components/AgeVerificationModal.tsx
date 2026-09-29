import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AgeVerificationStep } from './AgeVerificationStep';
import { User } from '../types';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (user: User) => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold text-zinc-900">Vérification de l’Âge</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <AgeVerificationStep
            onVerified={(user) => {
              onVerified(user);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
