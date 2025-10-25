import { Marketplace } from '../types';

export interface MarketplaceInfo {
  name: string;
  commission: {
    min: number;
    max: number;
    description: string;
  };
  logistics: {
    models: string[];
    recommendations: string[];
  };
  advertising: {
    tools: string[];
    budget: string;
    tips: string[];
  };
  optimization: {
    seo: string[];
    cards: string[];
    reviews: string[];
  };
  features: string[];
  requirements: string[];
}

export const marketplaceKnowledge: Record<Marketplace, MarketplaceInfo> = {
  wildberries: {
    name: 'Wildberries',
    commission: {
      min: 5,
      max: 15,
      description: 'Комиссия зависит от категории товара. Детские товары - 5%, электроника - 15%'
    },
    logistics: {
      models: ['FBO (Fulfillment by Ozon)', 'FBS (Fulfillment by Seller)'],
      recommendations: [
        'Начните с FBO для быстрого старта',
        'FBS подходит для больших объемов',
        'Используйте WB Express для срочных заказов'
      ]
    },
    advertising: {
      tools: ['WB Boost', 'Баннерная реклама', 'Продвижение в поиске'],
      budget: '10-15% от оборота',
      tips: [
        'Используйте WB Boost для новых товаров',
        'Анализируйте конкурентов через WB Analytics',
        'Оптимизируйте под поисковые запросы'
      ]
    },
    optimization: {
      seo: [
        'Используйте ключевые слова в названии',
        'Заполняйте все атрибуты товара',
        'Добавляйте синонимы и связанные товары'
      ],
      cards: [
        'Минимум 5-7 качественных фото',
        'Подробное описание с характеристиками',
        'Видео обзоры увеличивают конверсию'
      ],
      reviews: [
        'Отвечайте на все отзывы в течение 24 часов',
        'Просите довольных клиентов оставлять отзывы',
        'Решайте проблемы в негативных отзывах'
      ]
    },
    features: [
      'WB Analytics для детальной аналитики',
      'Автоматическое управление остатками',
      'Интеграция с 1С и другими системами',
      'Мобильное приложение для селлеров'
    ],
    requirements: [
      'Регистрация ИП или ООО',
      'Сертификаты на товары',
      'Декларации соответствия',
      'Фото товаров высокого качества'
    ]
  },
  ozon: {
    name: 'Ozon',
    commission: {
      min: 8,
      max: 20,
      description: 'Комиссия 8-20% плюс логистические услуги. Зависит от категории и объема продаж'
    },
    logistics: {
      models: ['Ozon Express', 'Собственная логистика', 'Партнерские службы'],
      recommendations: [
        'Ozon Express для быстрой доставки',
        'Используйте собственные склады для экономии',
        'Настройте автоматическую синхронизацию остатков'
      ]
    },
    advertising: {
      tools: ['Ozon Premium', 'Баннерная реклама', 'Рекомендации товаров'],
      budget: '12-18% от оборота',
      tips: [
        'Подключите Ozon Premium для дополнительных возможностей',
        'Используйте рекомендательную систему',
        'Настройте автоматические скидки'
      ]
    },
    optimization: {
      seo: [
        'Оптимизируйте под поиск Ozon',
        'Используйте теги и категории',
        'Добавляйте связанные товары'
      ],
      cards: [
        '360° фото товаров',
        'Подробные характеристики',
        'Сравнительные таблицы'
      ],
      reviews: [
        'Модерация отзывов строже чем на WB',
        'Фокусируйтесь на качестве товара',
        'Используйте видео-отзывы'
      ]
    },
    features: [
      'Ozon Premium с расширенной аналитикой',
      'Автоматическое управление ценами',
      'Интеграция с популярными CMS',
      'Программа лояльности для покупателей'
    ],
    requirements: [
      'Регистрация бизнеса',
      'Сертификаты и декларации',
      'Страховка товаров',
      'Соответствие стандартам Ozon'
    ]
  },
  ym: {
    name: 'Яндекс.Маркет',
    commission: {
      min: 5,
      max: 12,
      description: 'Комиссия 5-12% плюс расходы на рекламу. Одна из самых низких комиссий'
    },
    logistics: {
      models: ['Яндекс.Доставка', 'Партнерские службы', 'Самовывоз'],
      recommendations: [
        'Яндекс.Доставка для быстрой доставки',
        'Интегрируйтесь с Яндекс.Метрикой',
        'Используйте рекомендательную систему'
      ]
    },
    advertising: {
      tools: ['Яндекс.Директ', 'Рекомендации товаров', 'Баннерная реклама'],
      budget: '8-12% от оборота',
      tips: [
        'Настройте Яндекс.Директ для привлечения трафика',
        'Используйте умные рекомендации',
        'Анализируйте поведение покупателей'
      ]
    },
    optimization: {
      seo: [
        'Оптимизируйте под поиск Яндекса',
        'Используйте семантическое ядро',
        'Работайте с региональными запросами'
      ],
      cards: [
        'Адаптивные изображения',
        'Подробные описания',
        'Сравнительные характеристики'
      ],
      reviews: [
        'Интеграция с Яндекс.Отзывами',
        'Используйте Яндекс.Метрику для анализа',
        'Работайте с рейтингами товаров'
      ]
    },
    features: [
      'Интеграция с экосистемой Яндекса',
      'Яндекс.Метрика для аналитики',
      'Умные рекомендации товаров',
      'Геотаргетинг и региональная аналитика'
    ],
    requirements: [
      'Регистрация в системе Яндекса',
      'Верификация бизнеса',
      'Соответствие требованиям Яндекса',
      'Качественные фото и описания'
    ]
  },
  smm: {
    name: 'SMM',
    commission: { min: 0, max: 0, description: 'Не применимо' },
    logistics: { models: [], recommendations: [] },
    advertising: { tools: [], budget: '', tips: [] },
    optimization: { seo: [], cards: [], reviews: [] },
    features: [],
    requirements: []
  }
};

export class MarketplaceKnowledgeService {
  /**
   * Получает информацию о маркетплейсе
   */
  getMarketplaceInfo(marketplace: Marketplace): MarketplaceInfo {
    return marketplaceKnowledge[marketplace];
  }

  /**
   * Получает рекомендации по оптимизации для нескольких маркетплейсов
   */
  getOptimizationTips(marketplaces: Marketplace[]): string[] {
    const allTips: string[] = [];
    
    marketplaces.forEach(mp => {
      const info = this.getMarketplaceInfo(mp);
      allTips.push(...info.optimization.seo);
      allTips.push(...info.optimization.cards);
      allTips.push(...info.optimization.reviews);
    });

    // Убираем дубликаты
    return [...new Set(allTips)];
  }

  /**
   * Получает информацию о комиссиях
   */
  getCommissionInfo(marketplaces: Marketplace[]): string {
    const commissionInfo = marketplaces.map(mp => {
      const info = this.getMarketplaceInfo(mp);
      return `${info.name}: ${info.commission.min}-${info.commission.max}% - ${info.commission.description}`;
    });

    return commissionInfo.join('\n');
  }

  /**
   * Получает рекомендации по рекламе
   */
  getAdvertisingTips(marketplaces: Marketplace[]): string[] {
    const allTips: string[] = [];
    
    marketplaces.forEach(mp => {
      const info = this.getMarketplaceInfo(mp);
      allTips.push(...info.advertising.tips);
    });

    return [...new Set(allTips)];
  }

  /**
   * Получает логистические рекомендации
   */
  getLogisticsTips(marketplaces: Marketplace[]): string[] {
    const allTips: string[] = [];
    
    marketplaces.forEach(mp => {
      const info = this.getMarketplaceInfo(mp);
      allTips.push(...info.logistics.recommendations);
    });

    return [...new Set(allTips)];
  }

  /**
   * Поиск по базе знаний
   */
  searchKnowledge(query: string, marketplaces: Marketplace[]): string[] {
    const results: string[] = [];
    const lowerQuery = query.toLowerCase();

    marketplaces.forEach(mp => {
      const info = this.getMarketplaceInfo(mp);
      
      // Поиск по всем полям
      const searchFields = [
        ...info.features,
        ...info.requirements,
        ...info.optimization.seo,
        ...info.optimization.cards,
        ...info.optimization.reviews,
        ...info.advertising.tips,
        ...info.logistics.recommendations
      ];

      searchFields.forEach(field => {
        if (field.toLowerCase().includes(lowerQuery)) {
          results.push(`${info.name}: ${field}`);
        }
      });
    });

    return results;
  }
}

export const marketplaceKnowledgeService = new MarketplaceKnowledgeService();
