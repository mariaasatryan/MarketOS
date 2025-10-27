// Environment configuration validation
interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_MODE: 'MOCK' | 'LIVE';
  VITE_API_RETRY_ATTEMPTS: number;
  VITE_API_RETRY_DELAY: number;
  VITE_API_TIMEOUT: number;
  VITE_CACHE_TTL: number;
  VITE_GOOGLE_OAUTH_CLIENT_ID: string;
  VITE_GOOGLE_REDIRECT_URI: string;
  VITE_GOOGLE_OAUTH_CLIENT_SECRET: string;
  VITE_FEATURE_CALENDAR_AUTO_REMINDER: string;
  VITE_FEATURE_SHEETS_PREVIEW: string;
  VITE_FEATURE_ADS_MODULE: string;
  VITE_FEATURE_AI_ASSISTANT: string;
  WB_API_TOKEN: string;
  OZON_API_CLIENT_ID: string;
  OZON_API_KEY: string;
  YM_API_TOKEN: string;
  YM_CAMPAIGN_ID: string;
  VITE_AI_API_KEY: string;
  VITE_AI_PROVIDER: string;
  VITE_AI_MODEL: string;
}

// const requiredEnvVars = [
//   'VITE_SUPABASE_URL',
//   'VITE_SUPABASE_ANON_KEY',
// ] as const;


export function validateEnvironment(): EnvConfig {
  // Always use default values for production
  const config: EnvConfig = {
    VITE_SUPABASE_URL: 'https://bgnlqlvysvlwkqhdhlad.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmxxbHZ5c3Zsd2txaGRobGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTY4MDIsImV4cCI6MjA3NTkzMjgwMn0.BkeacY8aAbOLNTkwdZT_CqU5uRhfA9VoGs8ICEqeidU',
    VITE_APP_MODE: 'LIVE',
    VITE_API_RETRY_ATTEMPTS: 3,
    VITE_API_RETRY_DELAY: 1000,
    VITE_API_TIMEOUT: 30000,
    VITE_CACHE_TTL: 300000,
    VITE_GOOGLE_OAUTH_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',
    VITE_GOOGLE_REDIRECT_URI: 'https://mariaasatryan.github.io/MarketOS/',
    VITE_GOOGLE_OAUTH_CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET',
    VITE_FEATURE_CALENDAR_AUTO_REMINDER: 'true',
    VITE_FEATURE_SHEETS_PREVIEW: 'true',
    VITE_FEATURE_ADS_MODULE: 'true',
    VITE_FEATURE_AI_ASSISTANT: 'false',
    WB_API_TOKEN: '',
    OZON_API_CLIENT_ID: '',
    OZON_API_KEY: '',
    YM_API_TOKEN: '',
    YM_CAMPAIGN_ID: '',
    VITE_AI_API_KEY: '',
    VITE_AI_PROVIDER: 'openai',
    VITE_AI_MODEL: 'gpt-4',
  };

  // Debug: Log environment variables
  console.log('🔧 Environment variables debug:');
  console.log('VITE_GOOGLE_OAUTH_CLIENT_ID from import.meta.env:', import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);
  console.log('VITE_GOOGLE_REDIRECT_URI from import.meta.env:', import.meta.env.VITE_GOOGLE_REDIRECT_URI);
  console.log('All import.meta.env:', import.meta.env);

  // Override with environment variables if available
  if (import.meta.env.VITE_SUPABASE_URL) {
    config.VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  }
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    config.VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  if (import.meta.env.VITE_APP_MODE) {
    config.VITE_APP_MODE = import.meta.env.VITE_APP_MODE as 'MOCK' | 'LIVE';
  }
  if (import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID) {
    config.VITE_GOOGLE_OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
  }
  if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    config.VITE_GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  }
  if (import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET) {
    config.VITE_GOOGLE_OAUTH_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET;
  }

  console.log('🔧 Final config:');
  console.log('VITE_GOOGLE_OAUTH_CLIENT_ID:', config.VITE_GOOGLE_OAUTH_CLIENT_ID);
  console.log('VITE_GOOGLE_REDIRECT_URI:', config.VITE_GOOGLE_REDIRECT_URI);

  return config;
}

export const envConfig = validateEnvironment();
