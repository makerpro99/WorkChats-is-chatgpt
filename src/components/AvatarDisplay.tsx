import React from 'react';
import { UserAvatarConfig } from '../types';

interface AvatarDisplayProps {
  config?: UserAvatarConfig;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  config,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  if (!config) {
    return (
      <img
        src={avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=WorkChat'}
        alt="Avatar"
        className={`${sizeClasses[size]} rounded-xl object-cover border border-zinc-200/80 bg-zinc-100 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Render customizable modular avatar SVG
  const skin = config.skinColor || '#fcd34d';
  const hairColor = config.hairColor || '#451a03';
  const clothesColor = config.clothesColor || '#0284c7';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-2xs ${sizeClasses[size]} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background / Aura */}
        <rect width="100" height="100" fill="#f8fafc" />

        {/* Body & Clothes */}
        <path d="M25 100 L30 75 Q50 68 70 75 L75 100 Z" fill={clothesColor} />
        {config.clothes === 'hoodie' && (
          <path d="M35 75 Q50 85 65 75 L60 100 L40 100 Z" fill="#0f172a" opacity="0.3" />
        )}
        {config.clothes === 'suit' && (
          <>
            <polygon points="45,75 55,75 52,95 48,95" fill="#dc2626" />
            <polygon points="46,75 50,80 54,75" fill="#ffffff" />
          </>
        )}

        {/* Neck */}
        <rect x="42" y="62" width="16" height="14" fill={skin} />

        {/* Head */}
        <circle cx="50" cy="46" r="24" fill={skin} />

        {/* Eyes */}
        {config.eyes === 'happy' ? (
          <>
            <path d="M38 46 Q43 40 48 46" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M52 46 Q57 40 62 46" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : config.eyes === 'wink' ? (
          <>
            <circle cx="43" cy="45" r="3" fill="#0f172a" />
            <path d="M53 45 Q57 41 61 45" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : config.eyes === 'glasses' ? (
          <>
            <circle cx="43" cy="45" r="5" stroke="#0f172a" strokeWidth="2" fill="none" />
            <circle cx="57" cy="45" r="5" stroke="#0f172a" strokeWidth="2" fill="none" />
            <line x1="48" y1="45" x2="52" y2="45" stroke="#0f172a" strokeWidth="2" />
          </>
        ) : (
          <>
            <circle cx="43" cy="45" r="3.2" fill="#0f172a" />
            <circle cx="57" cy="45" r="3.2" fill="#0f172a" />
            <circle cx="44" cy="44" r="1" fill="#ffffff" />
            <circle cx="58" cy="44" r="1" fill="#ffffff" />
          </>
        )}

        {/* Mouth */}
        {config.mouth === 'smile' ? (
          <path d="M42 56 Q50 63 58 56" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : config.mouth === 'laugh' ? (
          <path d="M42 55 Q50 65 58 55 Z" fill="#e11d48" stroke="#0f172a" strokeWidth="1.5" />
        ) : config.mouth === 'cool' ? (
          <line x1="43" y1="58" x2="57" y2="57" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M44 56 Q50 61 56 56" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Hair */}
        {config.hairStyle === 'short' && (
          <path d="M26 42 Q50 18 74 42 Q70 28 50 24 Q30 28 26 42 Z" fill={hairColor} />
        )}
        {config.hairStyle === 'curly' && (
          <path
            d="M26 44 Q22 25 35 22 Q42 16 50 20 Q58 16 65 22 Q78 25 74 44 Q60 30 50 30 Q40 30 26 44 Z"
            fill={hairColor}
          />
        )}
        {config.hairStyle === 'long' && (
          <>
            <path d="M26 42 Q50 18 74 42 Q50 26 26 42 Z" fill={hairColor} />
            <path d="M26 40 L24 75 Q28 78 32 75 L30 45 Z" fill={hairColor} />
            <path d="M74 40 L76 75 Q72 78 68 75 L70 45 Z" fill={hairColor} />
          </>
        )}
        {config.hairStyle === 'spiky' && (
          <polygon
            points="26,42 32,24 38,32 44,18 50,30 56,18 62,32 68,24 74,42 50,28"
            fill={hairColor}
          />
        )}

        {/* Hat */}
        {config.hat === 'cap' && (
          <>
            <path d="M28 34 Q50 20 72 34 Z" fill="#dc2626" />
            <path d="M30 34 L80 34 Q85 36 78 38 L30 38 Z" fill="#b91c1c" />
          </>
        )}
        {config.hat === 'crown' && (
          <polygon
            points="32,32 36,18 43,26 50,14 57,26 64,18 68,32"
            fill="#eab308"
            stroke="#ca8a04"
            strokeWidth="1.5"
          />
        )}
        {config.hat === 'beanie' && (
          <path d="M28 36 Q50 16 72 36 Q50 32 28 36 Z" fill="#047857" />
        )}

        {/* Accessories */}
        {config.accessory === 'headset' && (
          <>
            <path d="M23 48 Q50 12 77 48" stroke="#334155" strokeWidth="4" fill="none" />
            <rect x="20" y="42" width="7" height="12" rx="3" fill="#0f172a" />
            <rect x="73" y="42" width="7" height="12" rx="3" fill="#0f172a" />
            <path d="M25 54 Q35 62 42 58" stroke="#0f172a" strokeWidth="2" fill="none" />
          </>
        )}
      </svg>

      {/* Badge overlay */}
      {config.badge && (
        <span className="absolute bottom-0 right-0 text-[10px] transform translate-x-1 translate-y-1">
          {config.badge}
        </span>
      )}
    </div>
  );
};
