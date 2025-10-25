import { MarketplaceAdapter, ProductData, SaleData, FeeData, AdsStatsData, SeoSnapshotData, AlertData } from './marketplaceAdapter';
import { PrismaClient } from '@prisma/client';
import { Marketplace, FeeType, AlertType, AlertSeverity } from '@prisma/client';

export class WildberriesAdapter extends MarketplaceAdapter {
  private apiKey: string;
  private baseUrl = 'https://suppliers-api.wildberries.ru';

  constructor(prisma: PrismaClient, integrationId: string, apiKey: string) {
    super(prisma, integrationId, Marketplace.WB);
    this.apiKey = apiKey;
  }

  async getProducts(): Promise<ProductData[]> {
    try {
      // Мок данные для демонстрации
      return [
        {
          sku: 'WB-001',
          title: 'Смартфон Samsung Galaxy A54',
          category: 'Смартфоны',
          costPrice: 25000,
          price: 35000,
          stock: 15,
          dimensions: { weight: 0.2, length: 15, width: 7, height: 1 }
        },
        {
          sku: 'WB-002',
          title: 'Наушники AirPods Pro',
          category: 'Аксессуары',
          costPrice: 12000,
          price: 18000,
          stock: 8,
          dimensions: { weight: 0.05, length: 5, width: 3, height: 2 }
        }
      ];
    } catch (error) {
      console.error('Error fetching WB products:', error);
      throw error;
    }
  }

  async getSales(fromDate: Date, toDate: Date): Promise<SaleData[]> {
    try {
      // Мок данные для демонстрации
      const sales: SaleData[] = [];
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        // Генерируем случайные продажи
        if (Math.random() > 0.3) {
          sales.push({
            productSku: 'WB-001',
            date,
            qty: Math.floor(Math.random() * 5) + 1,
            revenue: (Math.floor(Math.random() * 5) + 1) * 35000,
            refundQty: Math.random() > 0.9 ? 1 : 0,
            refundAmount: Math.random() > 0.9 ? 35000 : 0
          });
        }
        
        if (Math.random() > 0.4) {
          sales.push({
            productSku: 'WB-002',
            date,
            qty: Math.floor(Math.random() * 3) + 1,
            revenue: (Math.floor(Math.random() * 3) + 1) * 18000,
            refundQty: Math.random() > 0.95 ? 1 : 0,
            refundAmount: Math.random() > 0.95 ? 18000 : 0
          });
        }
      }
      
      return sales;
    } catch (error) {
      console.error('Error fetching WB sales:', error);
      throw error;
    }
  }

  async getFees(fromDate: Date, toDate: Date): Promise<FeeData[]> {
    try {
      // Мок данные для демонстрации
      const fees: FeeData[] = [];
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        // Комиссии WB (обычно 5-15%)
        fees.push({
          productSku: 'WB-001',
          date,
          type: FeeType.COMMISSION,
          amount: 1750, // 5% от 35000
          meta: { rate: 0.05, description: 'Комиссия WB' }
        });
        
        fees.push({
          productSku: 'WB-002',
          date,
          type: FeeType.COMMISSION,
          amount: 900, // 5% от 18000
          meta: { rate: 0.05, description: 'Комиссия WB' }
        });
        
        // Складские расходы (если есть остатки)
        if (Math.random() > 0.7) {
          fees.push({
            productSku: 'WB-001',
            date,
            type: FeeType.STORAGE,
            amount: 50,
            meta: { description: 'Складское хранение' }
          });
        }
      }
      
      return fees;
    } catch (error) {
      console.error('Error fetching WB fees:', error);
      throw error;
    }
  }

  async getAdsStats(fromDate: Date, toDate: Date): Promise<AdsStatsData[]> {
    try {
      // Мок данные для демонстрации
      const adsStats: AdsStatsData[] = [];
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        adsStats.push({
          productSku: 'WB-001',
          date,
          platform: 'WB',
          campaign: 'Samsung Galaxy A54',
          impressions: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 100) + 20,
          spend: Math.floor(Math.random() * 2000) + 500,
          orders: Math.floor(Math.random() * 5) + 1,
          revenue: (Math.floor(Math.random() * 5) + 1) * 35000
        });
        
        adsStats.push({
          productSku: 'WB-002',
          date,
          platform: 'WB',
          campaign: 'AirPods Pro',
          impressions: Math.floor(Math.random() * 800) + 300,
          clicks: Math.floor(Math.random() * 80) + 15,
          spend: Math.floor(Math.random() * 1500) + 300,
          orders: Math.floor(Math.random() * 3) + 1,
          revenue: (Math.floor(Math.random() * 3) + 1) * 18000
        });
      }
      
      return adsStats;
    } catch (error) {
      console.error('Error fetching WB ads stats:', error);
      throw error;
    }
  }

  async getSeoSnapshots(fromDate: Date, toDate: Date): Promise<SeoSnapshotData[]> {
    try {
      // Мок данные для демонстрации
      const seoSnapshots: SeoSnapshotData[] = [];
      const queries = ['смартфон samsung', 'galaxy a54', 'наушники airpods', 'airpods pro'];
      
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        for (const query of queries) {
          seoSnapshots.push({
            productSku: query.includes('samsung') || query.includes('galaxy') ? 'WB-001' : 'WB-002',
            date,
            position: Math.floor(Math.random() * 20) + 1,
            query,
            conversion: Math.random() * 0.1 + 0.02,
            ctr: Math.random() * 0.05 + 0.01
          });
        }
      }
      
      return seoSnapshots;
    } catch (error) {
      console.error('Error fetching WB SEO snapshots:', error);
      throw error;
    }
  }

  async getAlerts(): Promise<AlertData[]> {
    try {
      // Мок данные для демонстрации
      const alerts: AlertData[] = [];
      
      // Проверяем на замороженные товары
      const products = await this.getProducts();
      for (const product of products) {
        if (product.stock > 0 && Math.random() > 0.8) {
          alerts.push({
            productSku: product.sku,
            type: AlertType.DEAD_STOCK,
            severity: AlertSeverity.MEDIUM,
            message: `Товар ${product.title} не продается более 30 дней при наличии остатков`,
            date: new Date(),
            meta: { stock: product.stock, daysWithoutSales: 30 }
          });
        }
      }
      
      // Проверяем на низкий ROAS
      if (Math.random() > 0.7) {
        alerts.push({
          type: AlertType.LOW_ROAS,
          severity: AlertSeverity.HIGH,
          message: 'ROAS рекламных кампаний ниже порогового значения',
          date: new Date(),
          meta: { currentROAS: 2.1, threshold: 3.0 }
        });
      }
      
      // Проверяем на высокие складские расходы
      if (Math.random() > 0.8) {
        alerts.push({
          type: AlertType.HIGH_STORAGE_COST,
          severity: AlertSeverity.MEDIUM,
          message: 'Складские расходы превышают 10% от выручки',
          date: new Date(),
          meta: { storageCost: 15000, revenue: 100000, percentage: 15 }
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error fetching WB alerts:', error);
      throw error;
    }
  }
}
