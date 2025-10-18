// Сервис для генерации мок-данных маркетплейсов
import type { MarketplaceIntegration } from './marketplaceService';

export interface MockKPIData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalStock: number;
  avgOrderValue: number;
  lowStock: number;
  byMarketplace: {
    wildberries: {
      products: number;
      orders: number;
      revenue: number;
      stock: number;
    };
    ozon: {
      products: number;
      orders: number;
      revenue: number;
      stock: number;
    };
    ym: {
      products: number;
      orders: number;
      revenue: number;
      stock: number;
    };
  };
}

export class MockDataService {
  private static generateRandomData(baseValue: number, variance: number = 0.3): number {
    const min = Math.max(0, baseValue * (1 - variance));
    const max = baseValue * (1 + variance);
    return Math.floor(Math.random() * (max - min) + min);
  }

  private static generateMarketplaceData(_integration: MarketplaceIntegration, baseMultiplier: number = 1): any {
    const baseProducts = this.generateRandomData(50 * baseMultiplier);
    const baseOrders = this.generateRandomData(120 * baseMultiplier);
    const baseRevenue = this.generateRandomData(250000 * baseMultiplier);
    const baseStock = this.generateRandomData(300 * baseMultiplier);

    return {
      products: baseProducts,
      orders: baseOrders,
      revenue: baseRevenue,
      stock: baseStock,
      avgOrderValue: baseOrders > 0 ? Math.round(baseRevenue / baseOrders) : 0,
      lowStock: Math.floor(baseProducts * 0.15), // 15% товаров с низким остатком
    };
  }

  static async generateKPIData(integrations: MarketplaceIntegration[]): Promise<MockKPIData> {
    // Если нет интеграций, возвращаем нулевые данные
    if (integrations.length === 0) {
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalStock: 0,
        avgOrderValue: 0,
        lowStock: 0,
        byMarketplace: {
          wildberries: { products: 0, orders: 0, revenue: 0, stock: 0 },
          ozon: { products: 0, orders: 0, revenue: 0, stock: 0 },
          ym: { products: 0, orders: 0, revenue: 0, stock: 0 },
        },
      };
    }

    // Генерируем данные для каждого маркетплейса
    const wbData = integrations.find(i => i.marketplace === 'wildberries' && i.is_active)
      ? this.generateMarketplaceData(integrations.find(i => i.marketplace === 'wildberries')!, 1.2) // WB обычно больше
      : { products: 0, orders: 0, revenue: 0, stock: 0, avgOrderValue: 0, lowStock: 0 };

    const ozonData = integrations.find(i => i.marketplace === 'ozon' && i.is_active)
      ? this.generateMarketplaceData(integrations.find(i => i.marketplace === 'ozon')!, 0.8)
      : { products: 0, orders: 0, revenue: 0, stock: 0, avgOrderValue: 0, lowStock: 0 };

    const ymData = integrations.find(i => i.marketplace === 'ym' && i.is_active)
      ? this.generateMarketplaceData(integrations.find(i => i.marketplace === 'ym')!, 0.6)
      : { products: 0, orders: 0, revenue: 0, stock: 0, avgOrderValue: 0, lowStock: 0 };

    // Суммируем общие данные
    const totalProducts = wbData.products + ozonData.products + ymData.products;
    const totalOrders = wbData.orders + ozonData.orders + ymData.orders;
    const totalRevenue = wbData.revenue + ozonData.revenue + ymData.revenue;
    const totalStock = wbData.stock + ozonData.stock + ymData.stock;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const lowStock = wbData.lowStock + ozonData.lowStock + ymData.lowStock;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalStock,
      avgOrderValue,
      lowStock,
      byMarketplace: {
        wildberries: {
          products: wbData.products,
          orders: wbData.orders,
          revenue: wbData.revenue,
          stock: wbData.stock,
        },
        ozon: {
          products: ozonData.products,
          orders: ozonData.orders,
          revenue: ozonData.revenue,
          stock: ozonData.stock,
        },
        ym: {
          products: ymData.products,
          orders: ymData.orders,
          revenue: ymData.revenue,
          stock: ymData.stock,
        },
      },
    };
  }

  static async generateAnalyticsData(integrations: MarketplaceIntegration[]): Promise<any[]> {
    if (integrations.length === 0) return [];

    const days = 30;
    const data: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const activeIntegrations = integrations.filter(i => i.is_active);
      const baseOrders = activeIntegrations.length * 5; // Базовое количество заказов
      const baseRevenue = activeIntegrations.length * 15000; // Базовая выручка

      data.push({
        date: date.toISOString().split('T')[0],
        orders: this.generateRandomData(baseOrders, 0.5),
        revenue: this.generateRandomData(baseRevenue, 0.4),
        total_orders: data.reduce((sum: number, item: any) => sum + item.orders, 0) + this.generateRandomData(baseOrders, 0.5),
      });
    }

    return data;
  }

  static async generateProductsData(integrations: MarketplaceIntegration[]): Promise<any[]> {
    if (integrations.length === 0) return [];

    const products = [];
    const activeIntegrations = integrations.filter(i => i.is_active);

    for (const integration of activeIntegrations) {
      const productCount = this.generateRandomData(25, 0.3);
      
      for (let i = 0; i < productCount; i++) {
        products.push({
          id: `${integration.marketplace}-${i}`,
          marketplace: integration.marketplace,
          sku: `${integration.marketplace.toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
          name: `Товар ${i + 1} - ${integration.marketplace === 'wildberries' ? 'Wildberries' : 
                integration.marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'}`,
          price: this.generateRandomData(2500, 0.4),
          stock: this.generateRandomData(50, 0.6),
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
          reviewsCount: this.generateRandomData(25, 0.5),
          image: `https://via.placeholder.com/150x150?text=${integration.marketplace.toUpperCase()}`,
        });
      }
    }

    return products;
  }
}
