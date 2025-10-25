import React from 'react';
import { getMarketplaceColors } from '../utils/marketplaceColors';
import MarketplaceBadge from './MarketplaceBadge';

interface MarketplaceStatsProps {
  stats: Array<{
    marketplace: string;
    orders: number;
    revenue: number;
    profit: number;
    roas: number;
  }>;
}

export const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const colors = getMarketplaceColors(stat.marketplace);
        
        return (
          <div key={index} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${colors.border}`}>
            <div className="flex items-center justify-between mb-4">
              <MarketplaceBadge marketplace={stat.marketplace} />
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Заказы</span>
                <span className="font-semibold text-gray-900">{stat.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Выручка</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stat.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Прибыль</span>
                <span className={`font-semibold ${stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stat.profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ROAS</span>
                <span className="font-semibold text-gray-900">{stat.roas.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketplaceStats;
