import { MarketplaceAdapter, ProductData, SaleData, FeeData, AdsStatsData, SeoSnapshotData, AlertData } from './marketplaceAdapter';
import { PrismaClient } from '@prisma/client';
import { Marketplace, FeeType, AlertType, AlertSeverity } from '@prisma/client';

export class YandexMarketAdapter extends MarketplaceAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.partner.market.yandex.ru';

  constructor(prisma: PrismaClient, integrationId: string, apiKey: string) {
    super(prisma, integrationId, Marketplace.YaMarket);
    this.apiKey = apiKey;
  }

  async getProducts(): Promise<ProductData[]> {
    try {
      // Мок данные для демонстрации
      return [
        {
          sku: 'YM-001',
          title: 'Планшет iPad Air 5',
          category: 'Планшеты',
          costPrice: 55000,
          price: 75000,
          stock: 3,
          dimensions: { weight: 0.46, length: 25, width: 17, height: 0.6 }
        },
        {
          sku: 'YM-002',
          title: 'Клавиатура Apple Magic Keyboard',
          category: 'Аксессуары',
          costPrice: 8000,
          price: 12000,
          stock: 7,
          dimensions: { weight: 0.23, length: 28, width: 11, height: 1 }
        }
      ];
    } catch (error) {
      console.error('Error fetching Yandex Market products:', error);
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
        if (Math.random() > 0.5) {
          sales.push({
            productSku: 'YM-001',
            date,
            qty: Math.floor(Math.random() * 2) + 1,
            revenue: (Math.floor(Math.random() * 2) + 1) * 75000,
            refundQty: Math.random() > 0.95 ? 1 : 0,
            refundAmount: Math.random() > 0.95 ? 75000 : 0
          });
        }
        
        if (Math.random() > 0.4) {
          sales.push({
            productSku: 'YM-002',
            date,
            qty: Math.floor(Math.random() * 4) + 1,
            revenue: (Math.floor(Math.random() * 4) + 1) * 12000,
            refundQty: Math.random() > 0.9 ? 1 : 0,
            refundAmount: Math.random() > 0.9 ? 12000 : 0
          });
        }
      }
      
      return sales;
    } catch (error) {
      console.error('Error fetching Yandex Market sales:', error);
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
        
        // Комиссии Яндекс.Маркет (обычно 3-15%)
        fees.push({
          productSku: 'YM-001',
          date,
          type: FeeType.COMMISSION,
          amount: 2250, // 3% от 75000
          meta: { rate: 0.03, description: 'Комиссия Яндекс.Маркет' }
        });
        
        fees.push({
          productSku: 'YM-002',
          date,
          type: FeeType.COMMISSION,
          amount: 360, // 3% от 12000
          meta: { rate: 0.03, description: 'Комиссия Яндекс.Маркет' }
        });
        
        // Рекламные расходы
        if (Math.random() > 0.5) {
          fees.push({
            productSku: 'YM-001',
            date,
            type: FeeType.ADVERTISING,
            amount: 1500,
            meta: { description: 'Реклама в Яндекс.Маркет' }
          });
        }
        
        // Логистические расходы
        if (Math.random() > 0.7) {
          fees.push({
            productSku: 'YM-001',
            date,
            type: FeeType.LOGISTICS,
            amount: 300,
            meta: { description: 'Доставка до покупателя' }
          });
        }
      }
      
      return fees;
    } catch (error) {
      console.error('Error fetching Yandex Market fees:', error);
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
          productSku: 'YM-001',
          date,
          platform: 'YaMarket',
          campaign: 'iPad Air 5',
          impressions: Math.floor(Math.random() * 3000) + 1500,
          clicks: Math.floor(Math.random() * 300) + 100,
          spend: Math.floor(Math.random() * 8000) + 2000,
          orders: Math.floor(Math.random() * 6) + 2,
          revenue: (Math.floor(Math.random() * 6) + 2) * 75000
        });
        
        adsStats.push({
          productSku: 'YM-002',
          date,
          platform: 'YaMarket',
          campaign: 'Apple Magic Keyboard',
          impressions: Math.floor(Math.random() * 2000) + 800,
          clicks: Math.floor(Math.random() * 200) + 50,
          spend: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 8) + 3,
          revenue: (Math.floor(Math.random() * 8) + 3) * 12000
        });
      }
      
      return adsStats;
    } catch (error) {
      console.error('Error fetching Yandex Market ads stats:', error);
      throw error;
    }
  }

  async getSeoSnapshots(fromDate: Date, toDate: Date): Promise<SeoSnapshotData[]> {
    try {
      // Мок данные для демонстрации
      const seoSnapshots: SeoSnapshotData[] = [];
      const queries = ['планшет ipad', 'ipad air 5', 'клавиатура apple', 'magic keyboard'];
      
      const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        for (const query of queries) {
          seoSnapshots.push({
            productSku: query.includes('ipad') ? 'YM-001' : 'YM-002',
            date,
            position: Math.floor(Math.random() * 30) + 1,
            query,
            conversion: Math.random() * 0.12 + 0.03,
            ctr: Math.random() * 0.06 + 0.02
          });
        }
      }
      
      return seoSnapshots;
    } catch (error) {
      console.error('Error fetching Yandex Market SEO snapshots:', error);
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
        if (product.stock > 0 && Math.random() > 0.6) {
          alerts.push({
            productSku: product.sku,
            type: AlertType.DEAD_STOCK,
            severity: AlertSeverity.HIGH,
            message: `Товар ${product.title} не продается более 60 дней при наличии остатков`,
            date: new Date(),
            meta: { stock: product.stock, daysWithoutSales: 60 }
          });
        }
      }
      
      // Проверяем на высокий процент возвратов
      if (Math.random() > 0.7) {
        alerts.push({
          productSku: 'YM-001',
          type: AlertType.HIGH_REFUND_RATE,
          severity: AlertSeverity.MEDIUM,
          message: 'Процент возвратов превышает 5%',
          date: new Date(),
          meta: { 
            refundRate: 7.2,
            threshold: 5.0,
            totalOrders: 25,
            refunds: 2
          }
        });
      }
      
      // Проверяем на конфликты кампаний
      if (Math.random() > 0.5) {
        alerts.push({
          type: AlertType.CAMPAIGN_CONFLICT,
          severity: AlertSeverity.LOW,
          message: 'Обнаружены пересекающиеся ключевые слова в рекламных кампаниях',
          date: new Date(),
          meta: { 
            conflictingKeywords: ['планшет', 'ipad'],
            campaigns: ['iPad Air 5', 'Планшеты Apple']
          }
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error fetching Yandex Market alerts:', error);
      throw error;
    }
  }
}
