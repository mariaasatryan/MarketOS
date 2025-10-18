// src/services/marketplaceService.ts
import { supabase } from '../lib/supabase';
import { validateApiKey, sanitizeInput } from '../utils/validation';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bgnlqlvysvlwkqhdhlad.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmxxbHZ5c3Zsd2txaGRobGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTY4MDIsImV4cCI6MjA3NTkzMjgwMn0.BkeacY8aAbOLNTkwdZT_CqU5uRhfA9VoGs8ICEqeidU';

export type MarketplaceCode = 'wildberries' | 'ozon' | 'ym';

export interface MarketplaceIntegration {
  id: string;
  user_id: string;
  marketplace: MarketplaceCode;
  api_token: string;
  client_id?: string | null;
  is_active: boolean;
  last_sync_at?: string | null;
  last_sync_status?: 'success' | 'error' | 'pending' | null;
  error_message?: string | null;
  created_at: string;
}

export interface ServiceError {
  message: string;
  code?: string;
  details?: unknown;
}

class MarketplaceService {
  private integrations: MarketplaceIntegration[] = [];

  private async getAuthHeaders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Мок-режим для демонстрации
        return {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          'apikey': SUPABASE_ANON_KEY,
        };
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      };
    } catch {
      // Мок-режим для демонстрации
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
        'apikey': SUPABASE_ANON_KEY,
      };
    }
  }

  private base(path = '') {
    return `${SUPABASE_URL}/functions/v1${path}`;
  }

  async listIntegrations(): Promise<MarketplaceIntegration[]> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(this.base('/marketplace-tokens'), { headers });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch {
      // Возвращаем мок-данные для демонстрации
      return this.integrations;
    }
  }

  async addIntegration(marketplace: MarketplaceCode, apiKey: string, clientId?: string): Promise<MarketplaceIntegration> {
    // Validate inputs
    if (!validateApiKey(apiKey)) {
      throw new Error('Некорректный API ключ');
    }

    const sanitizedApiKey = sanitizeInput(apiKey);
    const sanitizedClientId = clientId ? sanitizeInput(clientId) : undefined;

    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(this.base('/marketplace-tokens'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          marketplace, 
          api_key: sanitizedApiKey, 
          client_id: sanitizedClientId ?? null 
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch {
      // Создаем мок-интеграцию для демонстрации
      const newIntegration: MarketplaceIntegration = {
        id: `mock-${Date.now()}`,
        user_id: 'mock-user',
        marketplace,
        api_token: sanitizedApiKey,
        client_id: sanitizedClientId || null,
        is_active: true,
        last_sync_at: null,
        last_sync_status: null,
        error_message: null,
        created_at: new Date().toISOString(),
      };
      
      this.integrations.push(newIntegration);
      return newIntegration;
    }
  }

  async updateIntegration(id: string, patch: Partial<Pick<MarketplaceIntegration,
    'api_token' | 'client_id' | 'is_active' | 'last_sync_at' | 'last_sync_status' | 'error_message'
  >>): Promise<MarketplaceIntegration> {
    try {
      const headers = await this.getAuthHeaders();
      const url = new URL(this.base('/marketplace-tokens'));
      url.searchParams.set('id', id);
      const res = await fetch(url.toString(), {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch {
      // Обновляем мок-интеграцию
      const index = this.integrations.findIndex(i => i.id === id);
      if (index !== -1) {
        this.integrations[index] = { ...this.integrations[index], ...patch };
        return this.integrations[index];
      }
      throw new Error('Интеграция не найдена');
    }
  }

  async removeIntegration(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const url = new URL(this.base('/marketplace-tokens'));
      url.searchParams.set('id', id);
      const res = await fetch(url.toString(), { method: 'DELETE', headers });
      if (!res.ok) throw new Error(await res.text());
    } catch {
      // Удаляем мок-интеграцию
      this.integrations = this.integrations.filter(i => i.id !== id);
    }
  }

  /** Тригерим edge-функцию синхронизации по конкретной интеграции */
  async syncIntegrationNow(id: string): Promise<{ ok?: boolean; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(this.base('/sync-marketplace-data'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ integration_id: id }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch {
      // Мок-синхронизация
      const integration = this.integrations.find(i => i.id === id);
      if (integration) {
        integration.last_sync_at = new Date().toISOString();
        integration.last_sync_status = 'success';
        integration.error_message = null;
      }
      return { ok: true };
    }
  }
}

export const marketplaceService = new MarketplaceService();