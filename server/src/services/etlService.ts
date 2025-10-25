import { PrismaClient } from '@prisma/client';
import { MarketplaceAdapter } from '../adapters/marketplaceAdapter';
import { WildberriesAdapter } from '../adapters/wildberriesAdapter';
import { OzonAdapter } from '../adapters/ozonAdapter';
import { YandexMarketAdapter } from '../adapters/yandexMarketAdapter';
import { Marketplace } from '@prisma/client';

export class ETLService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async syncAllIntegrations(): Promise<void> {
    try {
      console.log('Starting sync for all integrations...');
      
      const integrations = await this.prisma.marketplaceIntegration.findMany({
        where: { isActive: true },
        include: { User: true }
      });

      const syncPromises = integrations.map(integration => 
        this.syncIntegration(integration.id)
      );

      await Promise.allSettled(syncPromises);
      
      console.log('Sync completed for all integrations');
    } catch (error) {
      console.error('Error syncing all integrations:', error);
      throw error;
    }
  }

  async syncIntegration(integrationId: string): Promise<void> {
    try {
      const integration = await this.prisma.marketplaceIntegration.findUnique({
        where: { id: integrationId },
        include: { User: true }
      });

      if (!integration) {
        throw new Error(`Integration ${integrationId} not found`);
      }

      if (!integration.isActive) {
        console.log(`Integration ${integrationId} is inactive, skipping sync`);
        return;
      }

      console.log(`Starting sync for integration ${integrationId} (${integration.marketplace})`);

      const adapter = this.createAdapter(integration);
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const toDate = new Date();

      await adapter.syncData(fromDate, toDate);

      // Обновляем агрегированные данные
      await this.updateAggregatedData(integrationId);

      console.log(`Sync completed for integration ${integrationId}`);
    } catch (error) {
      console.error(`Error syncing integration ${integrationId}:`, error);
      throw error;
    }
  }

  private createAdapter(integration: any): MarketplaceAdapter {
    const settings = integration.settings as any;
    const apiKey = settings?.apiKey;

    if (!apiKey) {
      throw new Error(`API key not found for integration ${integration.id}`);
    }

    switch (integration.marketplace) {
      case Marketplace.WB:
        return new WildberriesAdapter(this.prisma, integration.id, apiKey);
      case Marketplace.Ozon:
        return new OzonAdapter(this.prisma, integration.id, apiKey);
      case Marketplace.YaMarket:
        return new YandexMarketAdapter(this.prisma, integration.id, apiKey);
      default:
        throw new Error(`Unsupported marketplace: ${integration.marketplace}`);
    }
  }

  private async updateAggregatedData(integrationId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Получаем данные за сегодня
      const [sales, fees, adsStats] = await Promise.all([
        this.prisma.sale.findMany({
          where: {
            integrationId,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }),
        this.prisma.fee.findMany({
          where: {
            integrationId,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }),
        this.prisma.adsStats.findMany({
          where: {
            integrationId,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      // Рассчитываем KPI
      const orders = sales.reduce((sum, sale) => sum + sale.qty, 0);
      const revenue = sales.reduce((sum, sale) => sum + Number(sale.revenue), 0);
      const feesAmount = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
      const adsSpend = adsStats.reduce((sum, ad) => sum + Number(ad.spend), 0);
      
      // Получаем остатки
      const products = await this.prisma.product.findMany({
        where: { integrationId }
      });
      const stock = products.reduce((sum, product) => sum + product.stock, 0);

      // Рассчитываем прибыль (упрощенная формула)
      const profit = revenue - feesAmount - adsSpend;

      // Обновляем или создаем запись DailyKPI
      await this.prisma.dailyKPI.upsert({
        where: {
          integrationId_date: {
            integrationId,
            date: today
          }
        },
        update: {
          orders,
          revenue,
          profit,
          stock,
          adsSpend,
          fees: feesAmount
        },
        create: {
          integrationId,
          date: today,
          orders,
          revenue,
          profit,
          stock,
          adsSpend,
          fees: feesAmount
        }
      });

      // Обновляем аналитику по продуктам
      await this.updateProductAnalytics(integrationId);

    } catch (error) {
      console.error(`Error updating aggregated data for integration ${integrationId}:`, error);
      throw error;
    }
  }

  private async updateProductAnalytics(integrationId: string): Promise<void> {
    try {
      const products = await this.prisma.product.findMany({
        where: { integrationId }
      });

      for (const product of products) {
        // Получаем продажи за последние 30 дней
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sales = await this.prisma.sale.findMany({
          where: {
            productId: product.id,
            date: { gte: thirtyDaysAgo }
          }
        });

        // Рассчитываем оборачиваемость
        const totalSales = sales.reduce((sum, sale) => sum + sale.qty, 0);
        const sellThrough = product.stock > 0 ? totalSales / (product.stock + totalSales) : 0;

        // Рассчитываем дни покрытия
        const avgDailySales = totalSales / 30;
        const daysOfCover = avgDailySales > 0 ? product.stock / avgDailySales : 0;

        // Определяем замороженный товар (более 60 дней без продаж при наличии остатков)
        const lastSale = sales.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        const daysSinceLastSale = lastSale 
          ? Math.floor((Date.now() - lastSale.date.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        const isDeadStock = product.stock > 0 && daysSinceLastSale > 60;

        // Рассчитываем ROAS и CPA
        const adsStats = await this.prisma.adsStats.findMany({
          where: {
            productId: product.id,
            date: { gte: thirtyDaysAgo }
          }
        });

        const totalSpend = adsStats.reduce((sum, ad) => sum + Number(ad.spend), 0);
        const totalRevenue = adsStats.reduce((sum, ad) => sum + Number(ad.revenue), 0);
        const totalOrders = adsStats.reduce((sum, ad) => sum + ad.orders, 0);

        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const cpa = totalOrders > 0 ? totalSpend / totalOrders : 0;

        // Рассчитываем маржу
        const totalRevenueFromSales = sales.reduce((sum, sale) => sum + Number(sale.revenue), 0);
        const totalCost = sales.reduce((sum, sale) => sum + sale.qty * Number(product.costPrice), 0);
        const margin = totalRevenueFromSales > 0 ? (totalRevenueFromSales - totalCost) / totalRevenueFromSales : 0;

        // Создаем или обновляем запись аналитики
        await this.prisma.productAnalytics.upsert({
          where: {
            productId_date: {
              productId: product.id,
              date: new Date()
            }
          },
          update: {
            daysOfCover: Math.round(daysOfCover),
            sellThrough,
            isDeadStock,
            roas,
            cpa,
            margin
          },
          create: {
            productId: product.id,
            date: new Date(),
            daysOfCover: Math.round(daysOfCover),
            sellThrough,
            isDeadStock,
            roas,
            cpa,
            margin
          }
        });
      }
    } catch (error) {
      console.error(`Error updating product analytics for integration ${integrationId}:`, error);
      throw error;
    }
  }

  async createIntegration(
    userId: string,
    marketplace: Marketplace,
    name: string,
    apiKey: string,
    settings?: any
  ): Promise<string> {
    try {
      const integration = await this.prisma.marketplaceIntegration.create({
        data: {
          userId,
          marketplace,
          name,
          settings: {
            apiKey,
            ...settings
          }
        }
      });

      return integration.id;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  async updateIntegration(
    integrationId: string,
    updates: {
      name?: string;
      isActive?: boolean;
      settings?: any;
    }
  ): Promise<void> {
    try {
      await this.prisma.marketplaceIntegration.update({
        where: { id: integrationId },
        data: updates
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.marketplaceIntegration.delete({
        where: { id: integrationId }
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }
}
