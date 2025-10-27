import { useState } from 'react';
import { Check } from 'lucide-react';
import { Marketplace } from '../types';
import { MARKETPLACE_INFO } from '../constants';
import { useI18n } from '../contexts/I18nContext';

interface MarketplaceSelectorProps {
  selectedMarketplaces: Marketplace[];
  onSelectionChange: (marketplaces: Marketplace[]) => void;
  title?: string;
  description?: string;
  showDescription?: boolean;
  className?: string;
}

export function MarketplaceSelector({
  selectedMarketplaces,
  onSelectionChange,
  title = "Выберите маркетплейсы",
  description = "Отметьте маркетплейсы, с которыми вы планируете работать",
  showDescription = true,
  className = ""
}: MarketplaceSelectorProps) {
  const { t, language } = useI18n();
  const [hoveredMarketplace, setHoveredMarketplace] = useState<Marketplace | null>(null);

  // Отладочная информация
  console.log('MarketplaceSelector: Current language:', language);

  const getMarketplaceName = (marketplaceId: Marketplace) => {
    switch (marketplaceId) {
      case 'wildberries':
        return t('marketplaces.wildberries');
      case 'ozon':
        return t('marketplaces.ozon');
      case 'ym':
        return t('marketplaces.yandexMarket');
      case 'smm':
        return t('marketplaces.sberMegamarket');
      default:
        return marketplaceId;
    }
  };

  const getCountryName = () => {
    return t('marketplaces.russia');
  };

  const handleMarketplaceToggle = (marketplaceId: Marketplace) => {
    if (selectedMarketplaces.includes(marketplaceId)) {
      onSelectionChange(selectedMarketplaces.filter(id => id !== marketplaceId));
    } else {
      onSelectionChange([...selectedMarketplaces, marketplaceId]);
    }
  };

  const marketplaceList = Object.values(MARKETPLACE_INFO);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
        {showDescription && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>

      <div className="space-y-3">
        {marketplaceList.map((marketplace) => {
          const isSelected = selectedMarketplaces.includes(marketplace.id);
          const isHovered = hoveredMarketplace === marketplace.id;
          
          return (
            <div
              key={marketplace.id}
              className={`
                relative border rounded-xl p-4 cursor-pointer transition-all duration-200 w-full
                ${isSelected 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600'
                }
                ${isHovered ? 'shadow-md' : 'hover:shadow-sm'}
              `}
              onClick={() => handleMarketplaceToggle(marketplace.id)}
              onMouseEnter={() => setHoveredMarketplace(marketplace.id)}
              onMouseLeave={() => setHoveredMarketplace(null)}
            >
              {/* Checkbox */}
              <div className="absolute top-3 right-3">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected 
                    ? 'border-red-500 bg-red-500' 
                    : 'border-slate-300 dark:border-slate-600'
                  }
                `}>
                  {isSelected && <Check size={16} className="text-white" />}
                </div>
              </div>

              {/* Marketplace Info */}
              <div className="pr-8">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={marketplace.logo} 
                      alt={marketplace.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback если изображение не загрузилось
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="w-6 h-6 bg-slate-400 dark:bg-slate-500 rounded hidden">
                      <div className="w-full h-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-base">
                      {getMarketplaceName(marketplace.id)} <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">({getCountryName()})</span>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMarketplaces.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('marketplaces.selectedCount')}: <span className="font-semibold text-slate-800 dark:text-white">
              {selectedMarketplaces.length}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
