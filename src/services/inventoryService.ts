// src/services/inventoryService.ts
import { supabase } from '../lib/supabase';
import { Marketplace } from '../types';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPrice: number;
  sellingPrice: number;
  marketplace: Marketplace;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  supplier?: string;
  location?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string; // PO number, SO number, etc.
  createdAt: string;
  createdBy: string;
}

export interface ReorderSuggestion {
  id: string;
  itemId: string;
  suggestedQuantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  supplier?: string;
  leadTime?: number; // days
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'discrepancy';
  itemId: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: string;
  isRead: boolean;
}

class InventoryService {
  private items: InventoryItem[] = [];
  private movements: StockMovement[] = [];
  private alerts: InventoryAlert[] = [];

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      // Загружаем товары из Supabase
      const { data: items } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (items) {
        this.items = items;
      }

      // Загружаем движения
      const { data: movements } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (movements) {
        this.movements = movements;
      }

      // Загружаем алерты
      const { data: alerts } = await supabase
        .from('inventory_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alerts) {
        this.alerts = alerts;
      }
    } catch (error) {
      console.warn('Failed to load inventory data:', error);
      this.generateMockData();
    }
  }

  private generateMockData() {
    this.items = [
      {
        id: '1',
        sku: 'IPH15-128-BLK',
        name: 'iPhone 15 128GB Black',
        category: 'Electronics',
        currentStock: 5,
        minStock: 10,
        maxStock: 50,
        costPrice: 75000,
        sellingPrice: 89990,
        marketplace: 'wildberries',
        lastUpdated: new Date().toISOString(),
        status: 'low_stock',
        supplier: 'Apple Inc.',
        location: 'A-1-15',
        barcode: '1234567890123',
        weight: 0.171,
        dimensions: { length: 14.8, width: 7.2, height: 0.78 },
      },
      {
        id: '2',
        sku: 'APRO-2ND-GEN',
        name: 'AirPods Pro 2nd Generation',
        category: 'Electronics',
        currentStock: 0,
        minStock: 5,
        maxStock: 30,
        costPrice: 18000,
        sellingPrice: 24990,
        marketplace: 'ozon',
        lastUpdated: new Date().toISOString(),
        status: 'out_of_stock',
        supplier: 'Apple Inc.',
        location: 'A-1-20',
        barcode: '1234567890124',
        weight: 0.056,
        dimensions: { length: 6.0, width: 4.5, height: 2.1 },
      },
      {
        id: '3',
        sku: 'MBP-13-M3',
        name: 'MacBook Pro 13" M3',
        category: 'Electronics',
        currentStock: 25,
        minStock: 3,
        maxStock: 20,
        costPrice: 120000,
        sellingPrice: 149990,
        marketplace: 'ym',
        lastUpdated: new Date().toISOString(),
        status: 'overstock',
        supplier: 'Apple Inc.',
        location: 'A-2-10',
        barcode: '1234567890125',
        weight: 1.4,
        dimensions: { length: 30.4, width: 21.5, height: 1.55 },
      },
      {
        id: '4',
        sku: 'IPAD-AIR-64',
        name: 'iPad Air 64GB WiFi',
        category: 'Electronics',
        currentStock: 12,
        minStock: 8,
        maxStock: 25,
        costPrice: 45000,
        sellingPrice: 59990,
        marketplace: 'wildberries',
        lastUpdated: new Date().toISOString(),
        status: 'in_stock',
        supplier: 'Apple Inc.',
        location: 'A-1-25',
        barcode: '1234567890126',
        weight: 0.461,
        dimensions: { length: 24.8, width: 17.8, height: 0.61 },
      },
    ];

    this.movements = [
      {
        id: '1',
        itemId: '1',
        type: 'out',
        quantity: 3,
        reason: 'Sale - Order #12345',
        reference: 'SO-12345',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'system',
      },
      {
        id: '2',
        itemId: '2',
        type: 'out',
        quantity: 5,
        reason: 'Sale - Order #12346',
        reference: 'SO-12346',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        createdBy: 'system',
      },
      {
        id: '3',
        itemId: '3',
        type: 'in',
        quantity: 10,
        reason: 'Purchase Order',
        reference: 'PO-78901',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        createdBy: 'admin',
      },
    ];

    this.alerts = [
      {
        id: '1',
        type: 'low_stock',
        itemId: '1',
        message: 'iPhone 15 128GB Black - низкий остаток (5 шт.)',
        severity: 'warning',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: 'out_of_stock',
        itemId: '2',
        message: 'AirPods Pro 2nd Generation - товар закончился',
        severity: 'error',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '3',
        type: 'overstock',
        itemId: '3',
        message: 'MacBook Pro 13" M3 - превышение максимального остатка',
        severity: 'info',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ];
  }

  // Получение всех товаров
  async getItems(filters?: {
    marketplace?: Marketplace;
    status?: string;
    category?: string;
  }): Promise<InventoryItem[]> {
    let filtered = [...this.items];

    if (filters?.marketplace) {
      filtered = filtered.filter(item => item.marketplace === filters.marketplace);
    }
    if (filters?.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters?.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    return filtered;
  }

  // Получение товара по ID
  async getItem(id: string): Promise<InventoryItem | null> {
    return this.items.find(item => item.id === id) || null;
  }

  // Обновление остатка
  async updateStock(itemId: string, quantity: number, reason: string, type: 'in' | 'out' | 'adjustment' = 'adjustment'): Promise<void> {
    const item = this.items.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');

    const oldStock = item.currentStock;
    let newStock = oldStock;

    switch (type) {
      case 'in':
        newStock = oldStock + quantity;
        break;
      case 'out':
        newStock = Math.max(0, oldStock - quantity);
        break;
      case 'adjustment':
        newStock = quantity;
        break;
    }

    item.currentStock = newStock;
    item.lastUpdated = new Date().toISOString();

    // Обновляем статус
    if (newStock === 0) {
      item.status = 'out_of_stock';
    } else if (newStock <= item.minStock) {
      item.status = 'low_stock';
    } else if (newStock >= item.maxStock) {
      item.status = 'overstock';
    } else {
      item.status = 'in_stock';
    }

    // Создаем запись о движении
    const movement: StockMovement = {
      id: Date.now().toString(),
      itemId,
      type,
      quantity: Math.abs(newStock - oldStock),
      reason,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user', // В реальном приложении брать из контекста
    };

    this.movements.unshift(movement);

    // Создаем алерт если нужно
    this.checkAndCreateAlerts(item);

    try {
      await supabase
        .from('inventory_items')
        .update({
          current_stock: newStock,
          status: item.status,
          last_updated: item.lastUpdated,
        })
        .eq('id', itemId);

      await supabase
        .from('stock_movements')
        .insert(movement);
    } catch (error) {
      console.warn('Failed to save inventory update:', error);
    }
  }

  // Проверка и создание алертов
  private checkAndCreateAlerts(item: InventoryItem) {
    const existingAlerts = this.alerts.filter(alert => 
      alert.itemId === item.id && !alert.isRead
    );

    // Удаляем старые алерты для этого товара
    this.alerts = this.alerts.filter(alert => 
      !(alert.itemId === item.id && !alert.isRead)
    );

    // Создаем новые алерты если нужно
    if (item.currentStock === 0) {
      this.alerts.unshift({
        id: Date.now().toString(),
        type: 'out_of_stock',
        itemId: item.id,
        message: `${item.name} - товар закончился`,
        severity: 'error',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    } else if (item.currentStock <= item.minStock) {
      this.alerts.unshift({
        id: Date.now().toString(),
        type: 'low_stock',
        itemId: item.id,
        message: `${item.name} - низкий остаток (${item.currentStock} шт.)`,
        severity: 'warning',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    } else if (item.currentStock >= item.maxStock) {
      this.alerts.unshift({
        id: Date.now().toString(),
        type: 'overstock',
        itemId: item.id,
        message: `${item.name} - превышение максимального остатка`,
        severity: 'info',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }
  }

  // Получение движений
  async getMovements(itemId?: string): Promise<StockMovement[]> {
    let filtered = [...this.movements];

    if (itemId) {
      filtered = filtered.filter(movement => movement.itemId === itemId);
    }

    return filtered;
  }

  // Получение алертов
  async getAlerts(): Promise<InventoryAlert[]> {
    return this.alerts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Отметка алерта как прочитанного
  async markAlertAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  // Получение предложений по заказу
  async getReorderSuggestions(): Promise<ReorderSuggestion[]> {
    const suggestions: ReorderSuggestion[] = [];

    for (const item of this.items) {
      if (item.currentStock <= item.minStock) {
        const suggestedQuantity = item.maxStock - item.currentStock;
        const urgency = item.currentStock === 0 ? 'critical' : 
                       item.currentStock <= item.minStock / 2 ? 'high' : 'medium';

        suggestions.push({
          id: Date.now().toString() + Math.random(),
          itemId: item.id,
          suggestedQuantity,
          reason: urgency === 'critical' ? 'Товар закончился' : 'Низкий остаток',
          urgency,
          estimatedCost: suggestedQuantity * item.costPrice,
          supplier: item.supplier,
          leadTime: 7, // дней
        });
      }
    }

    return suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  // Создание нового товара
  async createItem(item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
      status: item.currentStock === 0 ? 'out_of_stock' :
              item.currentStock <= item.minStock ? 'low_stock' :
              item.currentStock >= item.maxStock ? 'overstock' : 'in_stock',
    };

    this.items.push(newItem);

    try {
      await supabase
        .from('inventory_items')
        .insert(newItem);
    } catch (error) {
      console.warn('Failed to save new item:', error);
    }

    return newItem;
  }

  // Обновление товара
  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const item = this.items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');

    Object.assign(item, updates);
    item.lastUpdated = new Date().toISOString();

    // Пересчитываем статус
    if (item.currentStock === 0) {
      item.status = 'out_of_stock';
    } else if (item.currentStock <= item.minStock) {
      item.status = 'low_stock';
    } else if (item.currentStock >= item.maxStock) {
      item.status = 'overstock';
    } else {
      item.status = 'in_stock';
    }

    try {
      await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);
    } catch (error) {
      console.warn('Failed to update item:', error);
    }
  }

  // Получение статистики
  async getInventoryStats(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    overstockItems: number;
    totalMovements: number;
  }> {
    const totalItems = this.items.length;
    const totalValue = this.items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);
    const lowStockItems = this.items.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = this.items.filter(item => item.status === 'out_of_stock').length;
    const overstockItems = this.items.filter(item => item.status === 'overstock').length;
    const totalMovements = this.movements.length;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      overstockItems,
      totalMovements,
    };
  }
}

export const inventoryService = new InventoryService();
