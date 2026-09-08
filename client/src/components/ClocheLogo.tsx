import React from 'react';

interface ClocheLogoProps {
  className?: string;
  size?: number;
}

export const ClocheLogo: React.FC<ClocheLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* 3 Steam lines rising */}
      <path d="M7 4c.5-1 1.5-1 2 0s1.5 1 2 0" strokeWidth="1.75" />
      <path d="M11 2.5c.5-1 1.5-1 2 0s1.5 1 2 0" strokeWidth="1.75" />
      <path d="M15 4c.5-1 1.5-1 2 0s1.5 1 2 0" strokeWidth="1.75" />

      {/* Cloche Dome & Handle */}
      <circle cx="12" cy="7" r="1" fill="currentColor" />
      <path d="M4 16c0-4.418 3.582-8 8-8s8 3.582 8 8" />
      
      {/* Serving Tray Base */}
      <path d="M2 17h20" strokeWidth="2.5" />
      <path d="M4 19h16" strokeWidth="1.5" />
    </svg>
  );
};
