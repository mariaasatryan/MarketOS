// Notification Service for managing different types of notifications
export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'marketplace' | 'inventory' | 'financial' | 'ai';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'marketplace' | 'inventory' | 'financial' | 'ai' | 'marketing';
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  desktop: boolean;
  mobile: boolean;
  email: boolean;
  sound: boolean;
  categories: {
    system: boolean;
    marketplace: boolean;
    inventory: boolean;
    financial: boolean;
    ai: boolean;
    marketing: boolean;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationData[] = [];
  private settings: NotificationSettings;
  private listeners: Array<(notifications: NotificationData[]) => void> = [];

  private constructor() {
    this.settings = this.loadSettings();
    this.loadNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  public async initialize(): Promise<void> {
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }

      // Setup periodic notifications
      this.setupPeriodicNotifications();

    } catch (error) {
      console.error('Notification service initialization failed:', error);
    }
  }

  // Add notification
  public addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): string {
    const id = this.generateId();
    const newNotification: NotificationData = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();

    // Show browser notification if enabled
    if (this.settings.enabled && this.settings.desktop) {
      this.showBrowserNotification(newNotification);
    }

    return id;
  }

  // Get all notifications
  public getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  // Get unread notifications
  public getUnreadNotifications(): NotificationData[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Delete notification
  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Clear all notifications
  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Get notification settings
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Update notification settings
  public updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
  }

  // Subscribe to notification changes
  public subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Show browser notification
  private async showBrowserNotification(notification: NotificationData): Promise<void> {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: this.getNotificationIcon(notification.type),
        badge: '/images/marketos-logo.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        data: {
          notificationId: notification.id,
          actionUrl: notification.actionUrl
        }
      });

      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.priority !== 'critical') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  // Get notification icon based on type
  private getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      info: '/images/icons/info.png',
      success: '/images/icons/success.png',
      warning: '/images/icons/warning.png',
      error: '/images/icons/error.png',
      marketplace: '/images/icons/marketplace.png',
      inventory: '/images/icons/inventory.png',
      financial: '/images/icons/financial.png',
      ai: '/images/icons/ai.png'
    };

    return iconMap[type] || '/images/marketos-logo.png';
  }

  // Setup periodic notifications
  private setupPeriodicNotifications(): void {
    // Check for low stock every hour
    setInterval(() => {
      this.checkLowStockNotifications();
    }, 60 * 60 * 1000);

    // Check for financial alerts every 30 minutes
    setInterval(() => {
      this.checkFinancialNotifications();
    }, 30 * 60 * 1000);

    // Check for marketplace updates every 15 minutes
    setInterval(() => {
      this.checkMarketplaceNotifications();
    }, 15 * 60 * 1000);
  }

  // Check for low stock notifications
  private async checkLowStockNotifications(): Promise<void> {
    // This would integrate with inventory service
    // For now, we'll create a mock notification
    if (Math.random() > 0.8) { // 20% chance
      this.addNotification({
        type: 'inventory',
        title: 'Низкий остаток товара',
        message: 'Товар "iPhone 15 Pro" заканчивается на складе',
        priority: 'high',
        category: 'inventory',
        actionUrl: '/enhanced-inventory',
        actionText: 'Проверить склад'
      });
    }
  }

  // Check for financial notifications
  private async checkFinancialNotifications(): Promise<void> {
    // This would integrate with financial service
    // For now, we'll create a mock notification
    if (Math.random() > 0.9) { // 10% chance
      this.addNotification({
        type: 'financial',
        title: 'Финансовое уведомление',
        message: 'Достигнут месячный план продаж!',
        priority: 'medium',
        category: 'financial',
        actionUrl: '/financial',
        actionText: 'Посмотреть отчет'
      });
    }
  }

  // Check for marketplace notifications
  private async checkMarketplaceNotifications(): Promise<void> {
    // This would integrate with marketplace services
    // For now, we'll create a mock notification
    if (Math.random() > 0.95) { // 5% chance
      this.addNotification({
        type: 'marketplace',
        title: 'Обновление маркетплейса',
        message: 'Wildberries обновил API - проверьте интеграцию',
        priority: 'medium',
        category: 'marketplace',
        actionUrl: '/settings',
        actionText: 'Настройки'
      });
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('marketos-notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    try {
      localStorage.setItem('marketos-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load settings from localStorage
  private loadSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem('marketos-notification-settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }

    // Default settings
    return {
      enabled: true,
      desktop: true,
      mobile: true,
      email: false,
      sound: true,
      categories: {
        system: true,
        marketplace: true,
        inventory: true,
        financial: true,
        ai: true,
        marketing: false
      }
    };
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('marketos-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  // Create specific notification types
  public createInventoryAlert(itemName: string, currentStock: number, minStock: number): string {
    return this.addNotification({
      type: 'inventory',
      title: 'Низкий остаток товара',
      message: `Товар "${itemName}" заканчивается. Остаток: ${currentStock}, минимум: ${minStock}`,
      priority: currentStock === 0 ? 'critical' : 'high',
      category: 'inventory',
      actionUrl: '/enhanced-inventory',
      actionText: 'Проверить склад',
      metadata: { itemName, currentStock, minStock }
    });
  }

  public createFinancialAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): string {
    return this.addNotification({
      type: 'financial',
      title,
      message,
      priority,
      category: 'financial',
      actionUrl: '/financial',
      actionText: 'Посмотреть финансы'
    });
  }

  public createMarketplaceAlert(marketplace: string, message: string): string {
    return this.addNotification({
      type: 'marketplace',
      title: `Обновление ${marketplace}`,
      message,
      priority: 'medium',
      category: 'marketplace',
      actionUrl: '/settings',
      actionText: 'Настройки'
    });
  }

  public createAIInsight(title: string, message: string): string {
    return this.addNotification({
      type: 'ai',
      title: 'ИИ-инсайт',
      message,
      priority: 'medium',
      category: 'ai',
      actionUrl: '/marketai',
      actionText: 'Открыть MarketAI'
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
