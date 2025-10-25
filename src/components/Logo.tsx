import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="w-8 h-8 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-red-600"
        >
          {/* MarketOS Logo Icon - облако слева + символ бесконечности справа */}
          <path
            d="M4 16C4 10 8 6 14 6C16 6 17.5 7 18.5 8.5C19.5 7 21 6 23 6C29 6 33 10 33 16C33 22 29 26 23 26C21 26 19.5 25 18.5 23.5C17.5 25 16 26 14 26C8 26 4 22 4 16ZM20 16C20 18 22 20 24 20C26 20 28 18 28 16C28 14 26 12 24 12C22 12 20 14 20 16Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-red-600 leading-tight">
            MarketOS
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Виртуальный менеджер
          </span>
        </div>
      )}
    </div>
  );
}
