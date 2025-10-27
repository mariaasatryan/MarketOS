// Application constants
export const APP_NAME = 'MarketOS';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
  CACHE_TTL: 300000,
} as const;

// Marketplace Types
export const MARKETPLACE_TYPES = {
  WILDBERRIES: 'wildberries',
  OZON: 'ozon',
  YANDEX_MARKET: 'ym',
  SBER_MEGAMARKET: 'smm',
} as const;

// Marketplace Information
export const MARKETPLACE_INFO = {
  wildberries: {
    id: 'wildberries' as const,
    name: 'Wildberries',
    country: 'Россия',
    logo: '/images/marketplaces/wildberries.svg',
    description: 'Крупнейший маркетплейс России'
  },
  ozon: {
    id: 'ozon' as const,
    name: 'Ozon',
    country: 'Россия',
    logo: '/images/marketplaces/ozon.svg',
    description: 'Один из ведущих маркетплейсов России'
  },
  ym: {
    id: 'ym' as const,
    name: 'Яндекс.Маркет',
    country: 'Россия',
    logo: '/images/marketplaces/yandex-market.svg',
    description: 'Маркетплейс от Яндекса'
  },
  smm: {
    id: 'smm' as const,
    name: 'СберМегаМаркет',
    country: 'Россия',
    logo: '/images/marketplaces/sber-megamarket.svg',
    description: 'Маркетплейс от Сбера'
  }
} as const;

// Event Types
export const EVENT_TYPES = {
  SUPPLY: 'supply',
  SHIPMENT: 'shipment',
  REMINDER: 'reminder',
  MEETING: 'meeting',
  DEADLINE: 'deadline',
  PAYMENT: 'payment',
  INVENTORY: 'inventory',
  MARKETING: 'marketing',
  CUSTOM: 'custom',
} as const;

// File Types
export const FILE_TYPES = {
  FOLDER: 'folder',
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  IMAGE: 'image',
  VIDEO: 'video',
} as const;

// UI Constants
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  VALIDATION_ERROR: 'Проверьте правильность введенных данных.',
  UNAUTHORIZED: 'Необходима авторизация.',
  FORBIDDEN: 'Недостаточно прав для выполнения операции.',
  NOT_FOUND: 'Запрашиваемый ресурс не найден.',
  SERVER_ERROR: 'Внутренняя ошибка сервера.',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Данные успешно сохранены.',
  DELETED: 'Элемент успешно удален.',
  UPDATED: 'Данные успешно обновлены.',
  CREATED: 'Элемент успешно создан.',
} as const;
