// Environment configuration validation
interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_MODE: 'MOCK' | 'LIVE';
  VITE_API_RETRY_ATTEMPTS: number;
  VITE_API_RETRY_DELAY: number;
  VITE_API_TIMEOUT: number;
  VITE_CACHE_TTL: number;
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;


export function validateEnvironment(): EnvConfig {
  const missingVars: string[] = [];
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default values for demo mode');
  }

  // Return configuration with defaults
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://bgnlqlvysvlwkqhdhlad.supabase.co',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmxxbHZ5c3Zsd2txaGRobGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTY4MDIsImV4cCI6MjA3NTkzMjgwMn0.BkeacY8aAbOLNTkwdZT_CqU5uRhfA9VoGs8ICEqeidU',
    VITE_APP_MODE: (import.meta.env.VITE_APP_MODE as 'MOCK' | 'LIVE') || 'LIVE',
    VITE_API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
    VITE_API_RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
    VITE_API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    VITE_CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000'),
  };
}

export const envConfig = validateEnvironment();
