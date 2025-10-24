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
          {/* MarketOS Logo Icon - stylized cloud/infinity shape */}
          <path
            d="M8 12C8 8.68629 10.6863 6 14 6C16.5 6 18.5 7.5 19.5 9.5C20.5 7.5 22.5 6 25 6C28.3137 6 31 8.68629 31 12C31 15.3137 28.3137 18 25 18H14C10.6863 18 8 15.3137 8 12Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 20C12 16.6863 14.6863 14 18 14C20.5 14 22.5 15.5 23.5 17.5C24.5 15.5 26.5 14 29 14C32.3137 14 35 16.6863 35 20C35 23.3137 32.3137 26 29 26H18C14.6863 26 12 23.3137 12 20Z"
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
