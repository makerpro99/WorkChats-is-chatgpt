import React, { useEffect, useState } from 'react';
import { Megaphone, X, ArrowRight, Trophy, Bell } from 'lucide-react';
import { Announcement } from '../types';

interface PublicAnnouncementBannerProps {
  announcement: Announcement;
  durationSeconds?: number;
  onClose: () => void;
  onViewAll?: () => void;
}

export const PublicAnnouncementBanner: React.FC<PublicAnnouncementBannerProps> = ({
  announcement,
  durationSeconds = 5,
  onClose,
  onViewAll,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setProgress(100);
    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, totalMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setTimeLeft(remainingSec);
      setProgress((remainingMs / totalMs) * 100);

      if (remainingMs <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [announcement.id, durationSeconds, isPaused, onClose]);

  return (
    <div
      role="region"
      aria-label="Annonce publique"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-50 w-full bg-linear-to-r from-zinc-950 via-teal-950 to-zinc-900 text-white shadow-xl border-b border-teal-500/30 transition-all duration-300 animate-in slide-in-from-top-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Badge & Megaphone */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0 flex items-center justify-center animate-pulse">
            <Megaphone className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-400/40 text-[10px] font-black tracking-wider uppercase text-teal-200">
              📢 Annonce Publique
            </span>

            {announcement.winnerMention && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-200">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Gagnant : {announcement.winnerMention}</span>
              </span>
            )}

            <span className="font-extrabold text-white truncate max-w-[200px] sm:max-w-sm">
              {announcement.title}
            </span>

            <span className="text-zinc-400 hidden md:inline truncate max-w-md">
              — {announcement.content}
            </span>
          </div>
        </div>

        {/* Right Actions & Countdown */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {/* 5-second countdown pill */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>Masquage dans {timeLeft}s</span>
          </div>

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-[11px] transition-colors shadow-xs"
            >
              <span>Voir</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Masquer l'annonce"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Second Shrinking Progress Line */}
      <div className="w-full h-0.5 bg-zinc-800/50 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-teal-400 to-emerald-400 transition-all ease-linear"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%`, transitionDuration: '100ms' }}
        />
      </div>
    </div>
  );
};
