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
          {/* MarketOS Logo Icon - точная копия оригинального логотипа */}
          <path
            d="M8 14C8 10 10 8 14 8C16 8 17.5 9 18.5 10.5C19.5 9 21 8 23 8C27 8 29 10 29 14C29 18 27 20 23 20C21 20 19.5 19 18.5 17.5C17.5 19 16 20 14 20C10 20 8 18 8 14Z"
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
