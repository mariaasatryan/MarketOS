import { PrismaClient } from '@prisma/client';
import { Marketplace, FeeType, AlertType, AlertSeverity } from '@prisma/client';

export interface MarketplaceData {
  products: ProductData[];
  sales: SaleData[];
  fees: FeeData[];
  adsStats: AdsStatsData[];
  seoSnapshots: SeoSnapshotData[];
}

export interface ProductData {
  sku: string;
  title: string;
  category?: string;
  costPrice: number;
  price: number;
  stock: number;
  dimensions?: any;
}

export interface SaleData {
  productSku: string;
  date: Date;
  qty: number;
  revenue: number;
  refundQty?: number;
  refundAmount?: number;
}

export interface FeeData {
  productSku: string;
  date: Date;
  type: FeeType;
  amount: number;
  meta?: any;
}

export interface AdsStatsData {
  productSku: string;
  date: Date;
  platform: string;
  campaign?: string;
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  revenue: number;
}

export interface SeoSnapshotData {
  productSku: string;
  date: Date;
  position?: number;
  query: string;
  conversion?: number;
  ctr?: number;
}

export interface AlertData {
  productSku?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  date: Date;
  meta?: any;
}

export abstract class MarketplaceAdapter {
  protected prisma: PrismaClient;
  protected integrationId: string;
  protected marketplace: Marketplace;

  constructor(prisma: PrismaClient, integrationId: string, marketplace: Marketplace) {
    this.prisma = prisma;
    this.integrationId = integrationId;
    this.marketplace = marketplace;
  }

  abstract getProducts(): Promise<ProductData[]>;
  abstract getSales(fromDate: Date, toDate: Date): Promise<SaleData[]>;
  abstract getFees(fromDate: Date, toDate: Date): Promise<FeeData[]>;
  abstract getAdsStats(fromDate: Date, toDate: Date): Promise<AdsStatsData[]>;
  abstract getSeoSnapshots(fromDate: Date, toDate: Date): Promise<SeoSnapshotData[]>;
  abstract getAlerts(): Promise<AlertData[]>;

  async syncData(fromDate: Date, toDate: Date): Promise<void> {
    try {
      console.log(`Starting sync for ${this.marketplace} integration ${this.integrationId}`);
      
      // Получаем данные с маркетплейса
      const [products, sales, fees, adsStats, seoSnapshots, alerts] = await Promise.all([
        this.getProducts(),
        this.getSales(fromDate, toDate),
        this.getFees(fromDate, toDate),
        this.getAdsStats(fromDate, toDate),
        this.getSeoSnapshots(fromDate, toDate),
        this.getAlerts()
      ]);

      // Синхронизируем продукты
      await this.syncProducts(products);
      
      // Синхронизируем продажи
      await this.syncSales(sales);
      
      // Синхронизируем комиссии
      await this.syncFees(fees);
      
      // Синхронизируем рекламную статистику
      await this.syncAdsStats(adsStats);
      
      // Синхронизируем SEO снимки
      await this.syncSeoSnapshots(seoSnapshots);
      
      // Синхронизируем уведомления
      await this.syncAlerts(alerts);

      console.log(`Sync completed for ${this.marketplace} integration ${this.integrationId}`);
    } catch (error) {
      console.error(`Sync failed for ${this.marketplace} integration ${this.integrationId}:`, error);
      throw error;
    }
  }

  private async syncProducts(products: ProductData[]): Promise<void> {
    for (const productData of products) {
      await this.prisma.product.upsert({
        where: {
          integrationId_sku: {
            integrationId: this.integrationId,
            sku: productData.sku
          }
        },
        update: {
          title: productData.title,
          category: productData.category,
          costPrice: productData.costPrice,
          price: productData.price,
          stock: productData.stock,
          dimensions: productData.dimensions,
          updatedAt: new Date()
        },
        create: {
          integrationId: this.integrationId,
          sku: productData.sku,
          title: productData.title,
          category: productData.category,
          costPrice: productData.costPrice,
          price: productData.price,
          stock: productData.stock,
          dimensions: productData.dimensions
        }
      });
    }
  }

  private async syncSales(sales: SaleData[]): Promise<void> {
    for (const saleData of sales) {
      const product = await this.prisma.product.findFirst({
        where: {
          integrationId: this.integrationId,
          sku: saleData.productSku
        }
      });

      if (product) {
        await this.prisma.sale.create({
          data: {
            integrationId: this.integrationId,
            productId: product.id,
            date: saleData.date,
            qty: saleData.qty,
            revenue: saleData.revenue,
            refundQty: saleData.refundQty || 0,
            refundAmount: saleData.refundAmount || 0
          }
        });
      }
    }
  }

  private async syncFees(fees: FeeData[]): Promise<void> {
    for (const feeData of fees) {
      const product = await this.prisma.product.findFirst({
        where: {
          integrationId: this.integrationId,
          sku: feeData.productSku
        }
      });

      if (product) {
        await this.prisma.fee.create({
          data: {
            integrationId: this.integrationId,
            productId: product.id,
            date: feeData.date,
            type: feeData.type,
            amount: feeData.amount,
            meta: feeData.meta
          }
        });
      }
    }
  }

  private async syncAdsStats(adsStats: AdsStatsData[]): Promise<void> {
    for (const adsData of adsStats) {
      const product = await this.prisma.product.findFirst({
        where: {
          integrationId: this.integrationId,
          sku: adsData.productSku
        }
      });

      if (product) {
        await this.prisma.adsStats.create({
          data: {
            integrationId: this.integrationId,
            productId: product.id,
            date: adsData.date,
            platform: adsData.platform,
            campaign: adsData.campaign,
            impressions: adsData.impressions,
            clicks: adsData.clicks,
            spend: adsData.spend,
            orders: adsData.orders,
            revenue: adsData.revenue
          }
        });
      }
    }
  }

  private async syncSeoSnapshots(seoSnapshots: SeoSnapshotData[]): Promise<void> {
    for (const seoData of seoSnapshots) {
      const product = await this.prisma.product.findFirst({
        where: {
          integrationId: this.integrationId,
          sku: seoData.productSku
        }
      });

      if (product) {
        await this.prisma.seoSnapshot.create({
          data: {
            integrationId: this.integrationId,
            productId: product.id,
            date: seoData.date,
            position: seoData.position,
            query: seoData.query,
            conversion: seoData.conversion,
            ctr: seoData.ctr
          }
        });
      }
    }
  }

  private async syncAlerts(alerts: AlertData[]): Promise<void> {
    for (const alertData of alerts) {
      let productId: string | undefined;
      
      if (alertData.productSku) {
        const product = await this.prisma.product.findFirst({
          where: {
            integrationId: this.integrationId,
            sku: alertData.productSku
          }
        });
        productId = product?.id;
      }

      await this.prisma.alert.create({
        data: {
          integrationId: this.integrationId,
          productId,
          type: alertData.type,
          severity: alertData.severity,
          message: alertData.message,
          date: alertData.date,
          meta: alertData.meta
        }
      });
    }
  }
}
