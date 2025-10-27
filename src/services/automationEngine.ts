import { marketplaceService } from './marketplaceService';
import { RealMarketplaceService } from './realMarketplaceService';

export interface AutomationTask {
  id: string;
  type: 'product_sync' | 'price_optimization' | 'analytics' | 'advertising' | 'reviews' | 'orders';
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  data?: any;
  result?: any;
}

export interface AutomationConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxConcurrentTasks: number;
  retryAttempts: number;
  timeoutMinutes: number;
}

class AutomationEngine {
  private tasks: Map<string, AutomationTask> = new Map();
  private config: AutomationConfig = {
    enabled: true,
    intervalMinutes: 5,
    maxConcurrentTasks: 3,
    retryAttempts: 3,
    timeoutMinutes: 30
  };
  private intervalId: NodeJS.Timeout | null = null;
  private runningTasks: Set<string> = new Set();

  constructor() {
    this.loadConfig();
    this.startEngine();
  }

  private loadConfig() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('automationConfig');
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Failed to load automation config:', e);
      }
    }
  }

  private saveConfig() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('automationConfig', JSON.stringify(this.config));
  }

  public startEngine() {
    if (this.intervalId) {
      this.stopEngine();
    }

    if (!this.config.enabled) {
      return;
    }

    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.processTasks();
    }, intervalMs);

    // Запускаем обработку задач сразу
    this.processTasks();
  }

  public stopEngine() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public updateConfig(newConfig: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    if (newConfig.enabled !== undefined || newConfig.intervalMinutes !== undefined) {
      this.startEngine();
    }
  }

  public getConfig(): AutomationConfig {
    return { ...this.config };
  }

  public addTask(task: Omit<AutomationTask, 'id' | 'createdAt' | 'status'>): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: AutomationTask = {
      ...task,
      id,
      createdAt: new Date(),
      status: 'pending'
    };

    this.tasks.set(id, newTask);
    return id;
  }

  public getTask(id: string): AutomationTask | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(): AutomationTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  public getTasksByType(type: AutomationTask['type']): AutomationTask[] {
    return this.getAllTasks().filter(task => task.type === type);
  }

  public getTasksByStatus(status: AutomationTask['status']): AutomationTask[] {
    return this.getAllTasks().filter(task => task.status === status);
  }

  private async processTasks() {
    if (this.runningTasks.size >= this.config.maxConcurrentTasks) {
      return;
    }

    const pendingTasks = this.getTasksByStatus('pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    for (const task of pendingTasks) {
      if (this.runningTasks.size >= this.config.maxConcurrentTasks) {
        break;
      }

      this.executeTask(task);
    }
  }

  private async executeTask(task: AutomationTask) {
    this.runningTasks.add(task.id);
    
    const updatedTask = {
      ...task,
      status: 'running' as const,
      startedAt: new Date()
    };
    this.tasks.set(task.id, updatedTask);

    try {
      let result;
      
      switch (task.type) {
        case 'product_sync':
          result = await this.executeProductSync(task);
          break;
        case 'price_optimization':
          result = await this.executePriceOptimization(task);
          break;
        case 'analytics':
          result = await this.executeAnalytics(task);
          break;
        case 'advertising':
          result = await this.executeAdvertising(task);
          break;
        case 'reviews':
          result = await this.executeReviews(task);
          break;
        case 'orders':
          result = await this.executeOrders(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const completedTask = {
        ...updatedTask,
        status: 'completed' as const,
        completedAt: new Date(),
        result
      };
      this.tasks.set(task.id, completedTask);

    } catch (error) {
      const failedTask = {
        ...updatedTask,
        status: 'failed' as const,
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      this.tasks.set(task.id, failedTask);
    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  private async executeProductSync(task: AutomationTask): Promise<any> {
    // Синхронизация товаров между маркетплейсами
    const integrations = await marketplaceService.listIntegrations();
    const products = await RealMarketplaceService.getRealProductsData(integrations);
    
    // Здесь будет логика синхронизации
    return {
      syncedProducts: products.length,
      timestamp: new Date().toISOString()
    };
  }

  private async executePriceOptimization(task: AutomationTask): Promise<any> {
    // Оптимизация цен на основе анализа конкурентов
    const integrations = await marketplaceService.listIntegrations();
    
    // Здесь будет логика оптимизации цен
    return {
      optimizedPrices: 0,
      timestamp: new Date().toISOString()
    };
  }

  private async executeAnalytics(task: AutomationTask): Promise<any> {
    // Сбор и анализ данных
    const integrations = await marketplaceService.listIntegrations();
    const kpiData = await RealMarketplaceService.getRealKPIData(integrations);
    
    return {
      analyticsData: kpiData,
      timestamp: new Date().toISOString()
    };
  }

  private async executeAdvertising(task: AutomationTask): Promise<any> {
    // Оптимизация рекламных кампаний
    return {
      optimizedCampaigns: 0,
      timestamp: new Date().toISOString()
    };
  }

  private async executeReviews(task: AutomationTask): Promise<any> {
    // Обработка отзывов
    return {
      processedReviews: 0,
      timestamp: new Date().toISOString()
    };
  }

  private async executeOrders(task: AutomationTask): Promise<any> {
    // Обработка заказов
    return {
      processedOrders: 0,
      timestamp: new Date().toISOString()
    };
  }

  public getStats() {
    const allTasks = this.getAllTasks();
    const stats = {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      running: allTasks.filter(t => t.status === 'running').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      failed: allTasks.filter(t => t.status === 'failed').length,
      successRate: 0
    };

    if (stats.total > 0) {
      stats.successRate = (stats.completed / (stats.completed + stats.failed)) * 100;
    }

    return stats;
  }

  public clearCompletedTasks() {
    const allTasks = this.getAllTasks();
    allTasks.forEach(task => {
      if (task.status === 'completed' || task.status === 'failed') {
        this.tasks.delete(task.id);
      }
    });
  }
}

export const automationEngine = new AutomationEngine();
