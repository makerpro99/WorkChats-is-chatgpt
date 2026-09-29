import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface Forbidden403Props {
  onGoBack?: () => void;
  onGoHome?: () => void;
  panelName?: string;
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  onGoBack,
  onGoHome,
  panelName,
}) => {
  return (
    <div
      id="forbidden-403-container"
      className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200"
    >
      <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-widest mb-3">
        403
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
        Access Denied
      </h1>

      <p className="text-sm text-zinc-600 max-w-md font-normal mb-8 leading-relaxed">
        {panelName
          ? `You don't have permission to access the ${panelName}.`
          : "You don't have permission to access this panel."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onGoBack && (
          <button
            id="btn-403-go-back"
            type="button"
            onClick={onGoBack}
            className="px-5 py-2.5 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
            <span>Go Back</span>
          </button>
        )}

        {onGoHome && (
          <button
            id="btn-403-go-home"
            type="button"
            onClick={onGoHome}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        )}
      </div>
    </div>
  );
};
