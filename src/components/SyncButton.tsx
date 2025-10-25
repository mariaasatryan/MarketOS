import React from 'react';
import { getSyncButtonColors } from '../utils/marketplaceColors';

interface SyncButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const SyncButton: React.FC<SyncButtonProps> = ({
  onClick,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  children,
  className = ''
}) => {
  const colors = getSyncButtonColors();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: `bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-md transition-colors ${colors.primary}`,
    secondary: `bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-md transition-colors ${colors.secondary}`,
    outline: `border border-blue-500 text-blue-500 hover:bg-blue-50 font-medium rounded-md transition-colors ${colors.outline}`
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Синхронизация...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default SyncButton;
