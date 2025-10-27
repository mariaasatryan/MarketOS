import type { AppMode } from '../types';
import { envConfig } from '../utils/env';

const getEnv = (key: string, defaultValue: string = ''): string => {
  return envConfig[key as keyof typeof envConfig] || defaultValue;
};

export const config = {
  app: {
    mode: (getEnv('VITE_APP_MODE', 'MOCK') as AppMode),
  },
  api: {
    retryAttempts: parseInt(getEnv('VITE_API_RETRY_ATTEMPTS', '3')),
    retryDelay: parseInt(getEnv('VITE_API_RETRY_DELAY', '1000')),
    timeout: parseInt(getEnv('VITE_API_TIMEOUT', '30000')),
    cacheTTL: parseInt(getEnv('VITE_CACHE_TTL', '300000')),
  },
  features: {
    calendarAutoReminderWB: getEnv('VITE_FEATURE_CALENDAR_AUTO_REMINDER', 'true') === 'true',
    sheetsPreview: getEnv('VITE_FEATURE_SHEETS_PREVIEW', 'true') === 'true',
    adsModule: getEnv('VITE_FEATURE_ADS_MODULE', 'true') === 'true',
    aiAssistant: getEnv('VITE_FEATURE_AI_ASSISTANT', 'false') === 'true',
  },
  marketplaces: {
    wildberries: {
      token: getEnv('WB_API_TOKEN'),
    },
    ozon: {
      clientId: getEnv('OZON_API_CLIENT_ID'),
      apiKey: getEnv('OZON_API_KEY'),
    },
    ym: {
      token: getEnv('YM_API_TOKEN'),
      campaignId: getEnv('YM_CAMPAIGN_ID'),
    },
  },
  google: {
    clientId: getEnv('VITE_GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: getEnv('VITE_GOOGLE_OAUTH_CLIENT_SECRET'),
    redirectUri: getEnv('VITE_GOOGLE_REDIRECT_URI', typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : '/auth/google/callback'),
  },
  ai: {
    apiKey: getEnv('VITE_AI_API_KEY'),
    provider: getEnv('VITE_AI_PROVIDER', 'openai'),
    model: getEnv('VITE_AI_MODEL', 'gpt-4'),
  },
};
