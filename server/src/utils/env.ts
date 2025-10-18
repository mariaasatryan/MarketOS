export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  ENCRYPTION_KEY_BASE64: process.env.ENCRYPTION_KEY_BASE64!,
  APP_MODE: process.env.APP_MODE ?? 'MOCK',
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
  GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? '',
  GOOGLE_WEBHOOK_SECRET: process.env.GOOGLE_WEBHOOK_SECRET ?? 'secret',
  OZON_API_BASE: process.env.OZON_API_BASE ?? 'https://api-seller.ozon.ru'
};