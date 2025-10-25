import { MarketplaceAdapter, ProductData, SaleData, FeeData, AdsStatsData, SeoSnapshotData, AlertData } from './marketplaceAdapter';
import { PrismaClient } from '@prisma/client';
import { Marketplace, FeeType, AlertType, AlertSeverity } from '@prisma/client';

export class OzonAdapter extends MarketplaceAdapter {
  private apiKey: string;
  private baseUrl = 'https://api-seller.ozon.ru';

  constructor(prisma: PrismaClient, integrationId: string, apiKey: string) {
    super(prisma, integrationId, Marketplace.Ozon);
    this.apiKey = apiKey;
  }

  async getProducts(): Promise<ProductData[]> {
    try {
      // Мок данные для демонстрации
      return [
        {
          sku: 'OZ-001',
          title: 'Ноутбук ASUS VivoBook 15',
          category: 'Ноутбуки',
          costPrice: 45000,
          price: 65000,
          stock: 5,
          dimensions: { weight: 2.1, length: 35, width: 23, height: 2 }
        },
        {
          sku: 'OZ-002',
          title: 'Мышь Logitech MX Master 3',
          category: 'Периферия',
          costPrice: 3500,
          price: 5500,
          stock: 12,
          dimensions: { weight: 0.14, length: 12, width: 8, height: 5 }
        }
      ];
    } catch (error) {
      console.error('Error fetching Ozon products:', error);
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
        if (Math.random() > 0.4) {
          sales.push({
            productSku: 'OZ-001',
            date,
            qty: Math.floor(Math.random() * 3) + 1,
            revenue: (Math.floor(Math.random() * 3) + 1) * 65000,
            refundQty: Math.random() > 0.9 ? 1 : 0,
            refundAmount: Math.random() > 0.9 ? 65000 : 0
          });
        }
        
        if (Math.random() > 0.3) {
          sales.push({
            productSku: 'OZ-002',
            date,
            qty: Math.floor(Math.random() * 8) + 1,
            revenue: (Math.floor(Math.random() * 8) + 1) * 5500,
            refundQty: Math.random() > 0.95 ? 1 : 0,
            refundAmount: Math.random() > 0.95 ? 5500 : 0
          });
        }
      }
      
      return sales;
    } catch (error) {
      console.error('Error fetching Ozon sales:', error);
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
        
        // Комиссии Ozon (обычно 5-20%)
        fees.push({
          productSku: 'OZ-001',
          date,
          type: FeeType.COMMISSION,
          amount: 3250, // 5% от 65000
          meta: { rate: 0.05, description: 'Комиссия Ozon' }
        });
        
        fees.push({
          productSku: 'OZ-002',
          date,
          type: FeeType.COMMISSION,
          amount: 275, // 5% от 5500
          meta: { rate: 0.05, description: 'Комиссия Ozon' }
        });
        
        // Логистические расходы
        if (Math.random() > 0.6) {
          fees.push({
            productSku: 'OZ-001',
            date,
            type: FeeType.LOGISTICS,
            amount: 200,
            meta: { description: 'Доставка до покупателя' }
          });
        }
        
        // Складские расходы
        if (Math.random() > 0.8) {
          fees.push({
            productSku: 'OZ-001',
            date,
            type: FeeType.STORAGE,
            amount: 100,
            meta: { description: 'Складское хранение' }
          });
        }
      }
      
      return fees;
    } catch (error) {
      console.error('Error fetching Ozon fees:', error);
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
          productSku: 'OZ-001',
          date,
          platform: 'Ozon',
          campaign: 'ASUS VivoBook 15',
          impressions: Math.floor(Math.random() * 2000) + 1000,
          clicks: Math.floor(Math.random() * 200) + 50,
          spend: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 8) + 2,
          revenue: (Math.floor(Math.random() * 8) + 2) * 65000
        });
        
        adsStats.push({
          productSku: 'OZ-002',
          date,
          platform: 'Ozon',
          campaign: 'Logitech MX Master 3',
          impressions: Math.floor(Math.random() * 1500) + 500,
          clicks: Math.floor(Math.random() * 150) + 30,
          spend: Math.floor(Math.random() * 3000) + 500,
          orders: Math.floor(Math.random() * 10) + 3,
          revenue: (Math.floor(Math.random() * 10) + 3) * 5500
        });
      }
      
      return adsStats;
    } catch (error) {
      console.error('Error fetching Ozon ads stats:', error);
      throw error;
    }
  }

  async getSeoSnapshots(fromDate: Date, toDate: Date): Promise<SeoSnapshotData[]> {
    try {
      // Мок данные для демонстрации
      const seoSnapshots: SeoSnapshotData[] = [];
      const queries = ['ноутбук asus', 'vivoBook 15', 'мышь logitech', 'mx master 3'];
      
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        for (const query of queries) {
          seoSnapshots.push({
            productSku: query.includes('asus') || query.includes('vivoBook') ? 'OZ-001' : 'OZ-002',
            date,
            position: Math.floor(Math.random() * 25) + 1,
            query,
            conversion: Math.random() * 0.08 + 0.02,
            ctr: Math.random() * 0.04 + 0.01
          });
        }
      }
      
      return seoSnapshots;
    } catch (error) {
      console.error('Error fetching Ozon SEO snapshots:', error);
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
        if (product.stock > 0 && Math.random() > 0.7) {
          alerts.push({
            productSku: product.sku,
            type: AlertType.DEAD_STOCK,
            severity: AlertSeverity.MEDIUM,
            message: `Товар ${product.title} не продается более 45 дней при наличии остатков`,
            date: new Date(),
            meta: { stock: product.stock, daysWithoutSales: 45 }
          });
        }
      }
      
      // Проверяем на конфликты кампаний
      if (Math.random() > 0.6) {
        alerts.push({
          type: AlertType.CAMPAIGN_CONFLICT,
          severity: AlertSeverity.LOW,
          message: 'Обнаружены пересекающиеся ключевые слова в рекламных кампаниях',
          date: new Date(),
          meta: { 
            conflictingKeywords: ['ноутбук', 'asus'],
            campaigns: ['ASUS VivoBook 15', 'Ноутбуки ASUS']
          }
        });
      }
      
      // Проверяем на падение SEO позиций
      if (Math.random() > 0.8) {
        alerts.push({
          productSku: 'OZ-001',
          type: AlertType.SEO_DROP,
          severity: AlertSeverity.MEDIUM,
          message: 'Позиция в поиске упала с 5 на 15 место',
          date: new Date(),
          meta: { 
            query: 'ноутбук asus',
            oldPosition: 5,
            newPosition: 15,
            drop: 10
          }
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error fetching Ozon alerts:', error);
      throw error;
    }
  }
}
