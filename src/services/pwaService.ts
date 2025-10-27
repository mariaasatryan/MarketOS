// PWA Service for handling offline functionality and notifications
export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatusChange();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatusChange();
    });

    // Service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  // Initialize PWA features
  public async initialize(): Promise<void> {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);
      }

      // Request notification permission
      await this.requestNotificationPermission();

      // Setup IndexedDB for offline storage
      await this.setupOfflineStorage();

    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }

  // Notification management
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      if (this.registration) {
        await this.registration.showNotification(title, {
          icon: '/images/marketos-logo.png',
          badge: '/images/marketos-logo.png',
          ...options
        });
      } else {
        new Notification(title, {
          icon: '/images/marketos-logo.png',
          ...options
        });
      }
    }
  }

  // Offline storage management
  private async setupOfflineStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MarketOSOffline', 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores for offline data
        if (!db.objectStoreNames.contains('pendingActions')) {
          const pendingStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
          cacheStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }
      };
    });
  }

  // Store data for offline use
  public async storeOfflineData(key: string, data: any, type: string = 'general'): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MarketOSOffline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cachedData'], 'readwrite');
        const store = transaction.objectStore('cachedData');

        const offlineData = {
          key,
          data,
          type,
          timestamp: Date.now()
        };

        const addRequest = store.put(offlineData);

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve offline data
  public async getOfflineData(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MarketOSOffline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cachedData'], 'readonly');
        const store = transaction.objectStore('cachedData');
        const getRequest = store.get(key);

        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };

        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Queue action for offline processing
  public async queueOfflineAction(action: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MarketOSOffline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['pendingActions'], 'readwrite');
        const store = transaction.objectStore('pendingActions');

        const pendingAction = {
          ...action,
          timestamp: Date.now()
        };

        const addRequest = store.add(pendingAction);

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Handle online status change
  private handleOnlineStatusChange(): void {
    console.log('App is online');
    
    // Trigger background sync
    if (this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.registration.sync.register('background-sync');
    }

    // Show online notification
    this.showNotification('Соединение восстановлено', {
      body: 'Приложение снова работает в онлайн режиме',
      tag: 'online-status'
    });
  }

  // Handle offline status change
  private handleOfflineStatusChange(): void {
    console.log('App is offline');
    
    // Show offline notification
    this.showNotification('Работа в офлайн режиме', {
      body: 'Некоторые функции могут быть ограничены',
      tag: 'offline-status'
    });
  }

  // Check if app is online
  public isAppOnline(): boolean {
    return this.isOnline;
  }

  // Install prompt management
  public async showInstallPrompt(): Promise<boolean> {
    if ('BeforeInstallPromptEvent' in window) {
      const deferredPrompt = (window as any).deferredPrompt;
      
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          return true;
        } else {
          console.log('User dismissed the install prompt');
          return false;
        }
      }
    }
    
    return false;
  }

  // Check if app is installed
  public isAppInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Get app installation status
  public getInstallStatus(): {
    canInstall: boolean;
    isInstalled: boolean;
    isInstallable: boolean;
  } {
    return {
      canInstall: 'BeforeInstallPromptEvent' in window,
      isInstalled: this.isAppInstalled(),
      isInstallable: 'serviceWorker' in navigator && 'PushManager' in window
    };
  }

  // Cache management
  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Update service worker
  public async updateServiceWorker(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  // Get service worker registration
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();
