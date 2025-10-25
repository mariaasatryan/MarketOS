import { PrismaClient } from '@prisma/client';
import { Marketplace, AlertType, AlertSeverity } from '@prisma/client';

export interface KPIData {
  orders: number;
  revenue: number;
  profit: number;
  stock: number;
  adsSpend: number;
  fees: number;
  roas: number;
  margin: number;
}

export interface PnLData {
  revenue: number;
  cogs: number; // Cost of Goods Sold
  fees: number;
  storage: number;
  logistics: number;
  advertising: number;
  refunds: number;
  profit: number;
  margin: number;
}

export interface DeadStockData {
  productId: string;
  sku: string;
  title: string;
  stock: number;
  daysSinceLastSale: number;
  sellThrough: number;
  isDeadStock: boolean;
}

export interface HiddenLossData {
  productId: string;
  sku: string;
  title: string;
  hiddenLosses: {
    storage: number;
    penalties: number;
    logistics: number;
    other: number;
  };
  totalHiddenLoss: number;
  profitImpact: number;
}

export interface AdsPerformanceData {
  productId: string;
  sku: string;
  title: string;
  roas: number;
  cpa: number;
  spend: number;
  revenue: number;
  orders: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface SEOData {
  productId: string;
  sku: string;
  title: string;
  avgPosition: number;
  totalQueries: number;
  avgConversion: number;
  avgCtr: number;
  topQueries: Array<{
    query: string;
    position: number;
    conversion: number;
    ctr: number;
  }>;
}

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getKPIData(
    userId: string,
    fromDate: Date,
    toDate: Date,
    marketplace?: Marketplace
  ): Promise<KPIData> {
    try {
      const whereClause: any = {
        integration: {
          userId
        },
        date: {
          gte: fromDate,
          lte: toDate
        }
      };

      if (marketplace) {
        whereClause.integration.marketplace = marketplace;
      }

      const [sales, fees, adsStats] = await Promise.all([
        this.prisma.sale.findMany({
          where: whereClause,
          include: { integration: true }
        }),
        this.prisma.fee.findMany({
          where: whereClause,
          include: { integration: true }
        }),
        this.prisma.adsStats.findMany({
          where: whereClause,
          include: { integration: true }
        })
      ]);

      const orders = sales.reduce((sum, sale) => sum + sale.qty, 0);
      const revenue = sales.reduce((sum, sale) => sum + Number(sale.revenue), 0);
      const feesAmount = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
      const adsSpend = adsStats.reduce((sum, ad) => sum + Number(ad.spend), 0);
      const adsRevenue = adsStats.reduce((sum, ad) => sum + Number(ad.revenue), 0);
      
      // Получаем остатки
      const products = await this.prisma.product.findMany({
        where: {
          integration: {
            userId,
            ...(marketplace && { marketplace })
          }
        }
      });
      const stock = products.reduce((sum, product) => sum + product.stock, 0);

      const profit = revenue - feesAmount - adsSpend;
      const roas = adsSpend > 0 ? adsRevenue / adsSpend : 0;
      const margin = revenue > 0 ? profit / revenue : 0;

      return {
        orders,
        revenue,
        profit,
        stock,
        adsSpend,
        fees: feesAmount,
        roas,
        margin
      };
    } catch (error) {
      console.error('Error getting KPI data:', error);
      throw error;
    }
  }

  async getPnLData(
    userId: string,
    fromDate: Date,
    toDate: Date,
    groupBy: 'sku' | 'category' | 'marketplace' = 'sku',
    marketplace?: Marketplace
  ): Promise<Array<{ group: string; data: PnLData }>> {
    try {
      const whereClause: any = {
        integration: {
          userId
        },
        date: {
          gte: fromDate,
          lte: toDate
        }
      };

      if (marketplace) {
        whereClause.integration.marketplace = marketplace;
      }

      const [sales, fees, adsStats] = await Promise.all([
        this.prisma.sale.findMany({
          where: whereClause,
          include: { 
            product: true,
            integration: true 
          }
        }),
        this.prisma.fee.findMany({
          where: whereClause,
          include: { 
            product: true,
            integration: true 
          }
        }),
        this.prisma.adsStats.findMany({
          where: whereClause,
          include: { 
            product: true,
            integration: true 
          }
        })
      ]);

      // Группируем данные
      const groupedData = new Map<string, {
        sales: typeof sales;
        fees: typeof fees;
        adsStats: typeof adsStats;
      }>();

      sales.forEach(sale => {
        const group = this.getGroupKey(sale, groupBy);
        if (!groupedData.has(group)) {
          groupedData.set(group, { sales: [], fees: [], adsStats: [] });
        }
        groupedData.get(group)!.sales.push(sale);
      });

      fees.forEach(fee => {
        const group = this.getGroupKey(fee, groupBy);
        if (!groupedData.has(group)) {
          groupedData.set(group, { sales: [], fees: [], adsStats: [] });
        }
        groupedData.get(group)!.fees.push(fee);
      });

      adsStats.forEach(ad => {
        const group = this.getGroupKey(ad, groupBy);
        if (!groupedData.has(group)) {
          groupedData.set(group, { sales: [], fees: [], adsStats: [] });
        }
        groupedData.get(group)!.adsStats.push(ad);
      });

      // Рассчитываем P&L для каждой группы
      const results: Array<{ group: string; data: PnLData }> = [];

      for (const [group, data] of groupedData) {
        const revenue = data.sales.reduce((sum, sale) => sum + Number(sale.revenue), 0);
        const cogs = data.sales.reduce((sum, sale) => sum + sale.qty * Number(sale.product.costPrice), 0);
        
        const feesAmount = data.fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
        const storage = data.fees
          .filter(fee => fee.type === 'STORAGE')
          .reduce((sum, fee) => sum + Number(fee.amount), 0);
        const logistics = data.fees
          .filter(fee => fee.type === 'LOGISTICS')
          .reduce((sum, fee) => sum + Number(fee.amount), 0);
        const advertising = data.adsStats.reduce((sum, ad) => sum + Number(ad.spend), 0);
        const refunds = data.sales.reduce((sum, sale) => sum + Number(sale.refundAmount), 0);

        const profit = revenue - cogs - feesAmount - advertising - refunds;
        const margin = revenue > 0 ? profit / revenue : 0;

        results.push({
          group,
          data: {
            revenue,
            cogs,
            fees: feesAmount,
            storage,
            logistics,
            advertising,
            refunds,
            profit,
            margin
          }
        });
      }

      return results.sort((a, b) => b.data.profit - a.data.profit);
    } catch (error) {
      console.error('Error getting P&L data:', error);
      throw error;
    }
  }

  private getGroupKey(item: any, groupBy: string): string {
    switch (groupBy) {
      case 'sku':
        return item.product?.sku || 'Unknown';
      case 'category':
        return item.product?.category || 'Unknown';
      case 'marketplace':
        return item.integration?.marketplace || 'Unknown';
      default:
        return 'Unknown';
    }
  }

  async getDeadStockData(
    userId: string,
    thresholdDays: number = 30,
    marketplace?: Marketplace
  ): Promise<DeadStockData[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          integration: {
            userId,
            ...(marketplace && { marketplace })
          },
          stock: { gt: 0 }
        },
        include: {
          integration: true,
          sales: {
            orderBy: { date: 'desc' },
            take: 1
          },
          analytics: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      });

      const deadStockData: DeadStockData[] = [];

      for (const product of products) {
        const lastSale = product.sales[0];
        const analytics = product.analytics[0];
        
        const daysSinceLastSale = lastSale 
          ? Math.floor((Date.now() - lastSale.date.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const isDeadStock = daysSinceLastSale > thresholdDays;
        const sellThrough = analytics?.sellThrough || 0;

        deadStockData.push({
          productId: product.id,
          sku: product.sku,
          title: product.title,
          stock: product.stock,
          daysSinceLastSale,
          sellThrough,
          isDeadStock
        });
      }

      return deadStockData.sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);
    } catch (error) {
      console.error('Error getting dead stock data:', error);
      throw error;
    }
  }

  async getHiddenLossData(
    userId: string,
    fromDate: Date,
    toDate: Date,
    marketplace?: Marketplace
  ): Promise<HiddenLossData[]> {
    try {
      const whereClause: any = {
        integration: {
          userId
        },
        date: {
          gte: fromDate,
          lte: toDate
        }
      };

      if (marketplace) {
        whereClause.integration.marketplace = marketplace;
      }

      const fees = await this.prisma.fee.findMany({
        where: whereClause,
        include: { 
          product: true,
          integration: true 
        }
      });

      const sales = await this.prisma.sale.findMany({
        where: whereClause,
        include: { 
          product: true,
          integration: true 
        }
      });

      // Группируем по продуктам
      const productData = new Map<string, {
        fees: typeof fees;
        sales: typeof sales;
      }>();

      fees.forEach(fee => {
        if (!productData.has(fee.productId)) {
          productData.set(fee.productId, { fees: [], sales: [] });
        }
        productData.get(fee.productId)!.fees.push(fee);
      });

      sales.forEach(sale => {
        if (!productData.has(sale.productId)) {
          productData.set(sale.productId, { fees: [], sales: [] });
        }
        productData.get(sale.productId)!.sales.push(sale);
      });

      const hiddenLossData: HiddenLossData[] = [];

      for (const [productId, data] of productData) {
        const product = data.fees[0]?.product;
        if (!product) continue;

        const storage = data.fees
          .filter(fee => fee.type === 'STORAGE')
          .reduce((sum, fee) => sum + Number(fee.amount), 0);
        
        const penalties = data.fees
          .filter(fee => fee.type === 'PENALTY')
          .reduce((sum, fee) => sum + Number(fee.amount), 0);
        
        const logistics = data.fees
          .filter(fee => fee.type === 'LOGISTICS')
          .reduce((sum, fee) => sum + Number(fee.amount), 0);
        
        const other = data.fees
          .filter(fee => !['STORAGE', 'PENALTY', 'LOGISTICS', 'COMMISSION', 'ADVERTISING'].includes(fee.type))
          .reduce((sum, fee) => sum + Number(fee.amount), 0);

        const totalHiddenLoss = storage + penalties + logistics + other;
        const revenue = data.sales.reduce((sum, sale) => sum + Number(sale.revenue), 0);
        const profitImpact = revenue > 0 ? totalHiddenLoss / revenue : 0;

        hiddenLossData.push({
          productId,
          sku: product.sku,
          title: product.title,
          hiddenLosses: {
            storage,
            penalties,
            logistics,
            other
          },
          totalHiddenLoss,
          profitImpact
        });
      }

      return hiddenLossData.sort((a, b) => b.totalHiddenLoss - a.totalHiddenLoss);
    } catch (error) {
      console.error('Error getting hidden loss data:', error);
      throw error;
    }
  }

  async getAdsPerformanceData(
    userId: string,
    fromDate: Date,
    toDate: Date,
    marketplace?: Marketplace
  ): Promise<AdsPerformanceData[]> {
    try {
      const whereClause: any = {
        integration: {
          userId
        },
        date: {
          gte: fromDate,
          lte: toDate
        }
      };

      if (marketplace) {
        whereClause.integration.marketplace = marketplace;
      }

      const adsStats = await this.prisma.adsStats.findMany({
        where: whereClause,
        include: { 
          product: true,
          integration: true 
        }
      });

      // Группируем по продуктам
      const productData = new Map<string, typeof adsStats>();

      adsStats.forEach(ad => {
        if (!productData.has(ad.productId)) {
          productData.set(ad.productId, []);
        }
        productData.get(ad.productId)!.push(ad);
      });

      const performanceData: AdsPerformanceData[] = [];

      for (const [productId, ads] of productData) {
        const product = ads[0]?.product;
        if (!product) continue;

        const totalSpend = ads.reduce((sum, ad) => sum + Number(ad.spend), 0);
        const totalRevenue = ads.reduce((sum, ad) => sum + Number(ad.revenue), 0);
        const totalOrders = ads.reduce((sum, ad) => sum + ad.orders, 0);
        const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
        const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);

        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const cpa = totalOrders > 0 ? totalSpend / totalOrders : 0;
        const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

        performanceData.push({
          productId,
          sku: product.sku,
          title: product.title,
          roas,
          cpa,
          spend: totalSpend,
          revenue: totalRevenue,
          orders: totalOrders,
          impressions: totalImpressions,
          clicks: totalClicks,
          ctr
        });
      }

      return performanceData.sort((a, b) => b.roas - a.roas);
    } catch (error) {
      console.error('Error getting ads performance data:', error);
      throw error;
    }
  }

  async getSEOData(
    userId: string,
    fromDate: Date,
    toDate: Date,
    marketplace?: Marketplace
  ): Promise<SEOData[]> {
    try {
      const whereClause: any = {
        integration: {
          userId
        },
        date: {
          gte: fromDate,
          lte: toDate
        }
      };

      if (marketplace) {
        whereClause.integration.marketplace = marketplace;
      }

      const seoSnapshots = await this.prisma.seoSnapshot.findMany({
        where: whereClause,
        include: { 
          product: true,
          integration: true 
        }
      });

      // Группируем по продуктам
      const productData = new Map<string, typeof seoSnapshots>();

      seoSnapshots.forEach(snapshot => {
        if (!productData.has(snapshot.productId)) {
          productData.set(snapshot.productId, []);
        }
        productData.get(snapshot.productId)!.push(snapshot);
      });

      const seoData: SEOData[] = [];

      for (const [productId, snapshots] of productData) {
        const product = snapshots[0]?.product;
        if (!product) continue;

        const avgPosition = snapshots.reduce((sum, s) => sum + (s.position || 0), 0) / snapshots.length;
        const totalQueries = new Set(snapshots.map(s => s.query)).size;
        const avgConversion = snapshots.reduce((sum, s) => sum + (s.conversion || 0), 0) / snapshots.length;
        const avgCtr = snapshots.reduce((sum, s) => sum + (s.ctr || 0), 0) / snapshots.length;

        // Топ запросы
        const queryStats = new Map<string, {
          position: number;
          conversion: number;
          ctr: number;
          count: number;
        }>();

        snapshots.forEach(snapshot => {
          const existing = queryStats.get(snapshot.query);
          if (existing) {
            existing.position = (existing.position * existing.count + (snapshot.position || 0)) / (existing.count + 1);
            existing.conversion = (existing.conversion * existing.count + (snapshot.conversion || 0)) / (existing.count + 1);
            existing.ctr = (existing.ctr * existing.count + (snapshot.ctr || 0)) / (existing.count + 1);
            existing.count++;
          } else {
            queryStats.set(snapshot.query, {
              position: snapshot.position || 0,
              conversion: snapshot.conversion || 0,
              ctr: snapshot.ctr || 0,
              count: 1
            });
          }
        });

        const topQueries = Array.from(queryStats.entries())
          .map(([query, stats]) => ({
            query,
            position: Math.round(stats.position),
            conversion: stats.conversion,
            ctr: stats.ctr
          }))
          .sort((a, b) => a.position - b.position)
          .slice(0, 10);

        seoData.push({
          productId,
          sku: product.sku,
          title: product.title,
          avgPosition: Math.round(avgPosition),
          totalQueries,
          avgConversion,
          avgCtr,
          topQueries
        });
      }

      return seoData.sort((a, b) => a.avgPosition - b.avgPosition);
    } catch (error) {
      console.error('Error getting SEO data:', error);
      throw error;
    }
  }

  async generateAlerts(userId: string): Promise<void> {
    try {
      const integrations = await this.prisma.marketplaceIntegration.findMany({
        where: { userId, isActive: true }
      });

      for (const integration of integrations) {
        await this.checkDeadStockAlerts(integration.id);
        await this.checkROASAlerts(integration.id);
        await this.checkStorageCostAlerts(integration.id);
        await this.checkCampaignConflictAlerts(integration.id);
        await this.checkSEOAlerts(integration.id);
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw error;
    }
  }

  private async checkDeadStockAlerts(integrationId: string): Promise<void> {
    const deadStockProducts = await this.prisma.product.findMany({
      where: {
        integrationId,
        stock: { gt: 0 },
        analytics: {
          some: {
            isDeadStock: true
          }
        }
      }
    });

    for (const product of deadStockProducts) {
      await this.prisma.alert.create({
        data: {
          integrationId,
          productId: product.id,
          type: AlertType.DEAD_STOCK,
          severity: AlertSeverity.MEDIUM,
          message: `Товар ${product.title} не продается более 60 дней при наличии остатков`,
          date: new Date(),
          meta: {
            stock: product.stock,
            sku: product.sku
          }
        }
      });
    }
  }

  private async checkROASAlerts(integrationId: string): Promise<void> {
    const lowROASProducts = await this.prisma.productAnalytics.findMany({
      where: {
        product: { integrationId },
        roas: { lt: 3.0 }
      },
      include: { product: true }
    });

    for (const analytics of lowROASProducts) {
      await this.prisma.alert.create({
        data: {
          integrationId,
          productId: analytics.productId,
          type: AlertType.LOW_ROAS,
          severity: AlertSeverity.HIGH,
          message: `ROAS товара ${analytics.product.title} ниже порогового значения`,
          date: new Date(),
          meta: {
            roas: analytics.roas,
            threshold: 3.0,
            sku: analytics.product.sku
          }
        }
      });
    }
  }

  private async checkStorageCostAlerts(integrationId: string): Promise<void> {
    const highStorageProducts = await this.prisma.fee.findMany({
      where: {
        integrationId,
        type: 'STORAGE',
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // последние 7 дней
        }
      },
      include: { product: true }
    });

    const storageByProduct = new Map<string, number>();
    highStorageProducts.forEach(fee => {
      const current = storageByProduct.get(fee.productId) || 0;
      storageByProduct.set(fee.productId, current + Number(fee.amount));
    });

    for (const [productId, storageCost] of storageByProduct) {
      if (storageCost > 1000) { // порог 1000 рублей в неделю
        const product = highStorageProducts.find(f => f.productId === productId)?.product;
        if (product) {
          await this.prisma.alert.create({
            data: {
              integrationId,
              productId,
              type: AlertType.HIGH_STORAGE_COST,
              severity: AlertSeverity.MEDIUM,
              message: `Высокие складские расходы для товара ${product.title}`,
              date: new Date(),
              meta: {
                storageCost,
                sku: product.sku
              }
            }
          });
        }
      }
    }
  }

  private async checkCampaignConflictAlerts(integrationId: string): Promise<void> {
    // Простая проверка на конфликты кампаний
    const campaigns = await this.prisma.adsStats.findMany({
      where: { integrationId },
      select: { campaign: true }
    });

    const campaignNames = campaigns.map(c => c.campaign).filter(Boolean);
    const conflicts = new Set<string>();

    for (let i = 0; i < campaignNames.length; i++) {
      for (let j = i + 1; j < campaignNames.length; j++) {
        if (this.hasKeywordOverlap(campaignNames[i], campaignNames[j])) {
          conflicts.add(`${campaignNames[i]} vs ${campaignNames[j]}`);
        }
      }
    }

    for (const conflict of conflicts) {
      await this.prisma.alert.create({
        data: {
          integrationId,
          type: AlertType.CAMPAIGN_CONFLICT,
          severity: AlertSeverity.LOW,
          message: `Обнаружен конфликт кампаний: ${conflict}`,
          date: new Date(),
          meta: { conflict }
        }
      });
    }
  }

  private hasKeywordOverlap(campaign1: string, campaign2: string): boolean {
    const words1 = campaign1.toLowerCase().split(/\s+/);
    const words2 = campaign2.toLowerCase().split(/\s+/);
    
    return words1.some(word => word.length > 3 && words2.includes(word));
  }

  private async checkSEOAlerts(integrationId: string): Promise<void> {
    const seoSnapshots = await this.prisma.seoSnapshot.findMany({
      where: {
        integrationId,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: { product: true }
    });

    // Группируем по продуктам и запросам
    const productQueryData = new Map<string, Map<string, number[]>>();

    seoSnapshots.forEach(snapshot => {
      const key = `${snapshot.productId}-${snapshot.query}`;
      if (!productQueryData.has(snapshot.productId)) {
        productQueryData.set(snapshot.productId, new Map());
      }
      if (!productQueryData.get(snapshot.productId)!.has(snapshot.query)) {
        productQueryData.get(snapshot.productId)!.set(snapshot.query, []);
      }
      productQueryData.get(snapshot.productId)!.get(snapshot.query)!.push(snapshot.position || 0);
    });

    for (const [productId, queryData] of productQueryData) {
      const product = seoSnapshots.find(s => s.productId === productId)?.product;
      if (!product) continue;

      for (const [query, positions] of queryData) {
        if (positions.length >= 2) {
          const avgPosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
          const recentPosition = positions[positions.length - 1];
          const olderPosition = positions[0];

          if (recentPosition > olderPosition + 10) { // падение на 10+ позиций
            await this.prisma.alert.create({
              data: {
                integrationId,
                productId,
                type: AlertType.SEO_DROP,
                severity: AlertSeverity.MEDIUM,
                message: `Падение позиции в поиске для товара ${product.title} по запросу "${query}"`,
                date: new Date(),
                meta: {
                  query,
                  oldPosition: olderPosition,
                  newPosition: recentPosition,
                  drop: recentPosition - olderPosition,
                  sku: product.sku
                }
              }
            });
          }
        }
      }
    }
  }
}
