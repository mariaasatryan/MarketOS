import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { autoSyncService } from '../services/autoSyncService';

interface SyncButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  showAutoSyncInfo?: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({
  onClick,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  showAutoSyncInfo = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getButtonClasses = () => {
    const baseClasses = 'sync-button';
    const sizeClasses = {
      sm: 'sync-button-sm',
      md: 'sync-button',
      lg: 'sync-button-lg'
    };
    
    const variantClasses = {
      primary: '',
      secondary: 'sync-button-secondary',
      outline: 'sync-button-outline'
    };

    const loadingClass = isLoading ? 'sync-button-loading' : '';
    
    return [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      loadingClass,
      className
    ].filter(Boolean).join(' ');
  };

  const getSyncInfo = () => {
    const status = autoSyncService.getStatus();
    const config = autoSyncService.getConfig();
    
    const formatTime = (date: Date | null) => {
      if (!date) return 'Неизвестно';
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    return `Автоматическая синхронизация каждые ${config.intervalMinutes} минут\nПоследняя: ${formatTime(status.lastSync)}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={getButtonClasses()}
      >
        {isLoading ? (
          <span className="opacity-0">Синхронизация...</span>
        ) : (
          children
        )}
      </button>
      
      {showAutoSyncInfo && (
        <div className="relative">
          <Info 
            size={16} 
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-help transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          
          {showTooltip && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-lg shadow-lg whitespace-pre-line z-50 min-w-[200px]">
              {getSyncInfo()}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-800 dark:border-b-slate-700"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncButton;
