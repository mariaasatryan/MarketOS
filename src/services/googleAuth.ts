import { supabase } from '../lib/supabase';
import { envConfig } from '../utils/env';

const GOOGLE_CLIENT_ID = envConfig.VITE_GOOGLE_OAUTH_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = envConfig.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;

const GOOGLE_AUTH_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export interface GoogleAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

export class GoogleAuthService {
  static initiateOAuth(): void {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', GOOGLE_AUTH_SCOPES);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    window.location.href = authUrl.toString();
  }

  static async handleOAuthCallback(code: string): Promise<GoogleAuthTokens> {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const data = await tokenResponse.json();

      const tokens: GoogleAuthTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000),
      };

      await this.saveTokens(tokens);

      return tokens;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  static async saveTokens(tokens: GoogleAuthTokens): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('google_integrations')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_at.toISOString(),
        calendar_sync_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  }

  static async getTokens(): Promise<GoogleAuthTokens | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) return null;

    const tokens: GoogleAuthTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(data.token_expires_at),
    };

    if (this.isTokenExpired(tokens)) {
      return await this.refreshAccessToken(tokens.refresh_token);
    }

    return tokens;
  }

  static isTokenExpired(tokens: GoogleAuthTokens): boolean {
    return tokens.expires_at.getTime() < Date.now() + 5 * 60 * 1000;
  }

  static async refreshAccessToken(refreshToken: string): Promise<GoogleAuthTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();

      const tokens: GoogleAuthTokens = {
        access_token: data.access_token,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + data.expires_in * 1000),
      };

      await this.saveTokens(tokens);

      return tokens;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  static async disconnectGoogle(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('google_integrations')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }

  static async isConnected(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }
}
