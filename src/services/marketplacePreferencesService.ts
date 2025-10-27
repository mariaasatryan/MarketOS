import { supabase } from '../lib/supabase';
import { Marketplace } from '../types';

export interface MarketplacePreference {
  id: string;
  user_id: string;
  marketplace: Marketplace;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
}

class MarketplacePreferencesService {
  // Получение предпочтений пользователя
  async getUserPreferences(): Promise<Marketplace[]> {
    try {
      const { data, error } = await supabase
        .from('user_marketplace_preferences')
        .select('marketplace')
        .eq('is_selected', true);

      if (error) throw error;

      return data?.map(item => item.marketplace) || [];
    } catch (error) {
      console.error('Ошибка загрузки предпочтений маркетплейсов:', error);
      // Fallback на localStorage для демонстрации
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('user_marketplace_preferences');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    }
  }

  // Сохранение предпочтений пользователя
  async saveUserPreferences(marketplaces: Marketplace[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      // Удаляем старые предпочтения
      await supabase
        .from('user_marketplace_preferences')
        .delete()
        .eq('user_id', user.id);

      // Добавляем новые предпочтения
      if (marketplaces.length > 0) {
        const preferences = marketplaces.map(marketplace => ({
          user_id: user.id,
          marketplace,
          is_selected: true
        }));

        const { error } = await supabase
          .from('user_marketplace_preferences')
          .insert(preferences);

        if (error) throw error;
      }

      // Также сохраняем в localStorage для демонстрации
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_marketplace_preferences', JSON.stringify(marketplaces));
      }
    } catch (error) {
      console.error('Ошибка сохранения предпочтений маркетплейсов:', error);
      // Fallback на localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_marketplace_preferences', JSON.stringify(marketplaces));
      }
      throw error;
    }
  }

  // Обновление предпочтений при регистрации
  async setInitialPreferences(marketplaces: Marketplace[], userId?: string): Promise<void> {
    try {
      let user;
      
      if (userId) {
        user = { id: userId };
      } else {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        user = currentUser;
      }
      
      if (!user) {
        // Если пользователь не авторизован, просто сохраняем в localStorage
        localStorage.setItem('user_marketplace_preferences', JSON.stringify(marketplaces));
        return;
      }

      if (marketplaces.length > 0) {
        const preferences = marketplaces.map(marketplace => ({
          user_id: user.id,
          marketplace,
          is_selected: true
        }));

        const { error } = await supabase
          .from('user_marketplace_preferences')
          .insert(preferences);

        if (error) throw error;
      }

      // Также сохраняем в localStorage
      localStorage.setItem('user_marketplace_preferences', JSON.stringify(marketplaces));
    } catch (error) {
      console.error('Ошибка установки начальных предпочтений:', error);
      // Fallback на localStorage
      localStorage.setItem('user_marketplace_preferences', JSON.stringify(marketplaces));
    }
  }

  // Получение всех доступных маркетплейсов с их статусом
  async getAllMarketplacesWithStatus(): Promise<{ marketplace: Marketplace; is_selected: boolean }[]> {
    try {
      const { data, error } = await supabase
        .from('user_marketplace_preferences')
        .select('marketplace, is_selected');

      if (error) throw error;

      const allMarketplaces: Marketplace[] = ['wildberries', 'ozon', 'ym', 'smm'];
      
      return allMarketplaces.map(marketplace => {
        const preference = data?.find(p => p.marketplace === marketplace);
        return {
          marketplace,
          is_selected: preference?.is_selected || false
        };
      });
    } catch (error) {
      console.error('Ошибка загрузки статуса маркетплейсов:', error);
      // Fallback на localStorage
      const saved = localStorage.getItem('user_marketplace_preferences');
      const selected = saved ? JSON.parse(saved) : [];
      
      const allMarketplaces: Marketplace[] = ['wildberries', 'ozon', 'ym', 'smm'];
      return allMarketplaces.map(marketplace => ({
        marketplace,
        is_selected: selected.includes(marketplace)
      }));
    }
  }
}

export const marketplacePreferencesService = new MarketplacePreferencesService();
