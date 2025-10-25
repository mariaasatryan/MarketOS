import React from 'react';
import { getMarketplaceColors } from '../utils/marketplaceColors';

interface MarketplaceBadgeProps {
  marketplace: string;
  className?: string;
}

export const MarketplaceBadge: React.FC<MarketplaceBadgeProps> = ({ 
  marketplace, 
  className = '' 
}) => {
  const colors = getMarketplaceColors(marketplace);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} ${className}`}>
      {marketplace}
    </span>
  );
};

export default MarketplaceBadge;
