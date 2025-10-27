import { marketplaceService } from './marketplaceService';
import { RealMarketplaceService } from './realMarketplaceService';

export interface AutoSyncConfig {
  enabled: boolean;
  intervalMinutes: number;
  lastSync?: Date;
  nextSync?: Date;
}

class AutoSyncService {
  private intervalId: NodeJS.Timeout | null = null;
  private config: AutoSyncConfig = {
    enabled: true,
    intervalMinutes: 5,
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('autoSyncConfig');
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to load auto sync config:', e);
      }
    }
  }

  private saveConfig() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('autoSyncConfig', JSON.stringify(this.config));
  }

  public startAutoSync() {
    if (this.intervalId) {
      this.stopAutoSync();
    }

    if (!this.config.enabled) {
      return;
    }

    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    
    // Выполняем синхронизацию сразу при запуске
    this.performSync();

    // Устанавливаем интервал
    this.intervalId = setInterval(() => {
      this.performSync();
    }, intervalMs);

    console.log(`Автоматическая синхронизация запущена каждые ${this.config.intervalMinutes} минут`);
  }

  public stopAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Автоматическая синхронизация остановлена');
    }
  }

  public async performSync(): Promise<boolean> {
    try {
      console.log('Выполняется автоматическая синхронизация...');
      
      // Получаем список интеграций
      const integrations = await marketplaceService.listIntegrations();
      
      if (integrations.length === 0) {
        console.log('Нет активных интеграций для синхронизации');
        return false;
      }

      // Выполняем синхронизацию с реальными маркетплейсами
      await RealMarketplaceService.getRealKPIData(integrations);
      
      // Обновляем время последней синхронизации
      this.config.lastSync = new Date();
      this.config.nextSync = new Date(Date.now() + this.config.intervalMinutes * 60 * 1000);
      this.saveConfig();

      console.log('Автоматическая синхронизация завершена успешно');
      return true;
    } catch (error) {
      console.error('Ошибка автоматической синхронизации:', error);
      return false;
    }
  }

  public getConfig(): AutoSyncConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AutoSyncConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    if (this.config.enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  public getStatus(): {
    isRunning: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
    intervalMinutes: number;
  } {
    return {
      isRunning: this.intervalId !== null,
      lastSync: this.config.lastSync || null,
      nextSync: this.config.nextSync || null,
      intervalMinutes: this.config.intervalMinutes,
    };
  }

  public destroy() {
    this.stopAutoSync();
  }
}

// Создаем единственный экземпляр сервиса
export const autoSyncService = new AutoSyncService();

// Автоматически запускаем синхронизацию при загрузке модуля
if (typeof window !== 'undefined') {
  // Запускаем только в браузере
  autoSyncService.startAutoSync();
}
