import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl' },
    xl: { icon: 'w-14 h-14', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern WorkChat Brand Emblem: Refined gradient squircle with stylized W chat symbol */}
      <div className={`${currentSize.icon} relative flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 128 128"
          className="w-full h-full drop-shadow-sm hover:scale-105 transition-transform duration-200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich multi-stop teal gradient */}
            <linearGradient id="wc-brand-grad" x1="12" y1="12" x2="116" y2="116" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="45%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>

            {/* Inner glow / stroke gradient */}
            <linearGradient id="wc-border-glow" x1="16" y1="16" x2="112" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.1" />
            </linearGradient>

            {/* Glyph fill gradient */}
            <linearGradient id="wc-glyph-grad" x1="30" y1="36" x2="98" y2="92" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdfa" />
            </linearGradient>

            {/* Shadow filter */}
            <filter id="wc-icon-shadow" x="-8%" y="-8%" width="124%" height="124%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#0f766e" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* Squircle Badge Container */}
          <rect
            x="10"
            y="10"
            width="108"
            height="108"
            rx="28"
            fill="url(#wc-brand-grad)"
            filter="url(#wc-icon-shadow)"
          />
          <rect
            x="10"
            y="10"
            width="108"
            height="108"
            rx="28"
            stroke="url(#wc-border-glow)"
            strokeWidth="2"
          />

          {/* Conversational Speech Bubble Tail Accent in bottom-left */}
          <path
            d="M 28 88 C 22 96, 19 104, 20 106 C 22 107, 30 104, 38 98 Z"
            fill="#0f766e"
            opacity="0.9"
          />

          {/* Primary Stylized 'W' Collaboration Ribbon */}
          <path
            d="M 32 46 
               L 46 80 
               C 47.5 83.5, 52 83.5, 53.5 80 
               L 64 54 
               C 65 51.5, 68 51.5, 69 54 
               L 79.5 80 
               C 81 83.5, 85.5 83.5, 87 80 
               L 100 46"
            stroke="url(#wc-glyph-grad)"
            strokeWidth="10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upward Energy / Arrow Accents at tips of W */}
          <path
            d="M 26 50 L 32 44 L 38 50"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d="M 94 50 L 100 44 L 106 50"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Active Presence Spark / Notification Node */}
          <circle cx="94" cy="30" r="5.5" fill="#fef08a" />
          <circle cx="94" cy="30" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-extrabold tracking-tight text-zinc-900 ${currentSize.text} flex items-center`}>
            Work<span className="text-teal-600 ml-0.5">Chat</span>
          </span>
        </div>
      )}
    </div>
  );
};
