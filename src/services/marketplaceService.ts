// src/services/marketplaceService.ts
import { supabase } from '../lib/supabase';
import { envConfig } from '../utils/env';
import { validateApiKey, sanitizeInput } from '../utils/validation';

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

  constructor() {
    // Загружаем интеграции при инициализации
    this.initializeIntegrations();
  }

  private async initializeIntegrations() {
    await this.loadIntegrationsFromStorage();
  }

  private async loadIntegrationsFromStorage() {
    try {
      // Сначала пытаемся загрузить из Supabase
      await this.loadIntegrationsFromSupabase();
      
      // Если в Supabase нет данных, загружаем из localStorage
      if (this.integrations.length === 0) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('marketplace_integrations') : null;
        if (stored) {
          this.integrations = JSON.parse(stored);
          console.log('📦 Загружены интеграции из localStorage:', this.integrations);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки интеграций:', error);
      this.integrations = [];
    }
  }

  private async loadIntegrationsFromSupabase() {
    try {
      console.log('📦 Загрузка интеграций из Supabase...');
      
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Пользователь не авторизован, пропускаем загрузку из Supabase');
        return;
      }

      // Загружаем интеграции пользователя
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Ошибка загрузки интеграций из Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        this.integrations = data;
        console.log('✅ Интеграции загружены из Supabase:', this.integrations);
      } else {
        console.log('📦 Нет интеграций в Supabase');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки из Supabase:', error);
    }
  }

  private async saveIntegrationsToStorage() {
    try {
      // Сохраняем в localStorage для быстрого доступа
      if (typeof window !== 'undefined') {
        localStorage.setItem('marketplace_integrations', JSON.stringify(this.integrations));
      }
      console.log('💾 Интеграции сохранены в localStorage:', this.integrations);
      
      // Сохраняем в Supabase для постоянного хранения
      await this.saveIntegrationsToSupabase();
    } catch (error) {
      console.error('❌ Ошибка сохранения интеграций:', error);
    }
  }

  private async saveIntegrationsToSupabase() {
    try {
      console.log('💾 Сохранение интеграций в Supabase...');
      
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Пользователь не авторизован, пропускаем сохранение в Supabase');
        return;
      }

      // Удаляем старые интеграции пользователя
      const { error: deleteError } = await supabase
        .from('marketplace_integrations')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Ошибка удаления старых интеграций:', deleteError);
      }

      // Добавляем новые интеграции
      if (this.integrations.length > 0) {
        const integrationsToSave = this.integrations.map(integration => ({
          ...integration,
          user_id: user.id,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('marketplace_integrations')
          .insert(integrationsToSave);

        if (insertError) {
          console.error('❌ Ошибка сохранения интеграций в Supabase:', insertError);
        } else {
          console.log('✅ Интеграции сохранены в Supabase');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения в Supabase:', error);
    }
  }

  private async getAuthHeaders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Мок-режим для демонстрации
        return {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          'apikey': envConfig.VITE_SUPABASE_ANON_KEY,
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
    return `${envConfig.VITE_SUPABASE_URL}/functions/v1${path}`;
  }

  async listIntegrations(): Promise<MarketplaceIntegration[]> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(this.base('/marketplace-tokens'), { headers });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch {
      // Загружаем интеграции из Supabase, если они есть
      await this.loadIntegrationsFromSupabase();
      return this.integrations;
    }
  }

  // Метод для принудительной загрузки интеграций из Supabase
  async refreshIntegrations(): Promise<void> {
    console.log('🔄 Принудительная загрузка интеграций из Supabase...');
    await this.loadIntegrationsFromSupabase();
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
      // Сохраняем в localStorage и Supabase
      await this.saveIntegrationsToStorage();
      console.log('✅ Интеграция добавлена и сохранена:', newIntegration);
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