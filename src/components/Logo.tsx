import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import logoImage from '/images/marketos-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  const { t } = useI18n();
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="w-10 h-10 flex items-center justify-center">
        <img
          src={`${logoImage}?v=${Date.now()}`}
          alt="MarketOS Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to inline SVG if image fails to load
            console.error('❌ Logo image failed to load:', e);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-600">
                  <path d="M4 16C4 10 8 6 14 6C16 6 17.5 7 18.5 8.5C17.5 7 21 6 23 6C29 6 33 10 33 16C33 22 29 26 23 26C21 26 19.5 25 18.5 23.5C17.5 25 16 26 14 26C8 26 4 22 4 16ZM20 16C20 18 22 20 24 20C26 20 28 18 28 16C28 14 26 12 24 12C22 12 20 14 20 16Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              `;
            }
          }}
          onLoad={() => {
            console.log('✅ Logo image loaded successfully');
          }}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-red-600 leading-tight">
            MarketOS
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {t('app.tagline')}
          </span>
        </div>
      )}
    </div>
  );
}