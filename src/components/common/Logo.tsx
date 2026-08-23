import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon-only' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'full',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-[0.2em]',
    xl: 'text-sm tracking-[0.25em]',
  };

  // SVG Pin Logo with Car inside using the brand gradient #FF8A00 to #E8380D
  const PinIcon = (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${iconSizes[size]}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ridebhai-pin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#E8380D" />
          </linearGradient>
          <filter id="inner-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
            <feFlood floodColor="#FFE3B3" floodOpacity="0.5" />
            <feComposite in2="shadowDiff" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* Location Pin Silhouette */}
        <path
          d="M50 2C24.59 2 4 22.59 4 48c0 31.8 41.5 67.2 43.3 68.7a4.2 4.2 0 0 0 5.4 0C54.5 115.2 96 79.8 96 48 96 22.59 75.41 2 50 2z"
          fill="url(#ridebhai-pin-grad)"
        />

        {/* Inner car silhouette in crisp white */}
        <g transform="translate(24, 25) scale(0.52)">
          {/* Car Body */}
          <path
            d="M85.4 34.6L74.8 14.2C72.7 10.3 68.6 8 64.2 8H35.8c-4.4 0-8.5 2.3-10.6 6.2L14.6 34.6C8.5 36.8 4 42.6 4 49.5V76c0 3.3 2.7 6 6 6h6c3.3 0 6-2.7 6-6v-4h56v4c0 3.3 2.7 6 6 6h6c3.3 0 6-2.7 6-6V49.5c0-6.9-4.5-12.7-10.6-14.9z"
            fill="#FAF6EE"
          />
          {/* Front Windshield cutout in pin color */}
          <path
            d="M26.2 32l6.7-14.8c1.1-2.4 3.4-3.9 6-3.9h22.2c2.6 0 4.9 1.5 6 3.9L73.8 32H26.2z"
            fill="url(#ridebhai-pin-grad)"
          />
          {/* Left Headlight */}
          <circle cx="23" cy="52" r="5.5" fill="#FFE3A8" />
          {/* Right Headlight */}
          <circle cx="77" cy="52" r="5.5" fill="#FFE3A8" />
          {/* Grille accent line */}
          <rect x="36" y="52" width="28" height="3.5" rx="1.75" fill="url(#ridebhai-pin-grad)" />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{PinIcon}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {PinIcon}
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <span className={`font-display font-extrabold tracking-tight ${titleSizes[size]} text-[#F15A24]`}>
            Ride<span className="text-[#1C1C1C]">bhai</span>
          </span>
        </div>
        {showTagline && (
          <span className={`font-semibold text-[#1C1C1C] opacity-80 uppercase ${taglineSizes[size]}`}>
            Your Travel Buddy
          </span>
        )}
      </div>
    </div>
  );
};
