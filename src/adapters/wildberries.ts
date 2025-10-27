import type {
  MarketplaceAdapter,
  KPIMetrics,
  Order,
  Product,
  Review,
  AdCampaign,
  DateRange,
  CalendarEvent
} from '../types';
import { apiClient } from '../services/apiClient';

const WB_API_BASE = 'https://suppliers-api.wildberries.ru';
const WB_STATS_API = 'https://statistics-api.wildberries.ru';
const WB_ADV_API = 'https://advert-api.wildberries.ru';

export class WildberriesAdapter implements MarketplaceAdapter {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async validateToken(): Promise<boolean> {
    try {
      await apiClient.request({
        url: `${WB_API_BASE}/api/v3/supplies`,
        method: 'GET',
        headers: this.getHeaders(),
        timeoutMs: 10000,
      });
      return true;
    } catch (error) {
      console.error('WB token validation failed:', error);
      return false;
    }
  }

  async getKPIs(dateRange: DateRange): Promise<Partial<KPIMetrics>> {
    try {
      const [ordersData, salesData, stocksData] = await Promise.all([
        this.getOrders(dateRange),
        this.getSalesStats(dateRange),
        this.getStocks(),
      ]);

      const totalOrders = ordersData.length;
      const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.finishedPrice || 0), 0);
      const totalStock = stocksData.reduce((sum, stock) => sum + stock.quantity, 0);

      return {
        orders: {
          total: totalOrders,
          byMp: { wildberries: totalOrders, ozon: 0, ym: 0 }
        },
        revenue: {
          total: totalRevenue,
          byMp: { wildberries: totalRevenue, ozon: 0, ym: 0 }
        },
        stock: {
          total: totalStock,
          byMp: { wildberries: totalStock, ozon: 0, ym: 0 }
        },
      };
    } catch (error) {
      console.error('WB getKPIs error:', error);
      throw error;
    }
  }

  async getOrders(dateRange: DateRange): Promise<Order[]> {
    try {
      // Используем правильный эндпоинт для заказов согласно документации WB
      const response = await apiClient.request({
        url: `${WB_API_BASE}/api/v3/orders`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          dateFrom: dateRange.from.toISOString().split('T')[0],
          dateTo: dateRange.to.toISOString().split('T')[0],
          status: 'new', // new, confirm, cancel, complete
        },
      });

      return response.data.map((order: any) => ({
        id: order.id || order.orderId,
        marketplace: 'wildberries' as const,
        sku: order.article || order.sku || '',
        productName: order.name || order.productName || '',
        quantity: order.quantity || 1,
        price: order.price || order.totalPrice || 0,
        status: this.mapOrderStatus(order.status),
        date: new Date(order.createdAt || order.date),
        warehouse: order.warehouse || order.warehouseName || '',
      }));
    } catch (error) {
      console.error('WB getOrders error:', error);
      return [];
    }
  }

  private async getSalesStats(dateRange: DateRange): Promise<any[]> {
    try {
      const response = await apiClient.request({
        url: `${WB_STATS_API}/api/v1/supplier/sales`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          dateFrom: dateRange.from.toISOString().split('T')[0],
          dateTo: dateRange.to.toISOString().split('T')[0],
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('WB getSalesStats error:', error);
      return [];
    }
  }

  async getStocks(): Promise<any[]> {
    try {
      // Согласно документации WB API - используем правильный эндпоинт для остатков
      const response = await apiClient.request({
        url: `${WB_API_BASE}/api/v3/stocks`,
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.data?.stocks || response.data || [];
    } catch (error) {
      console.error('WB getStocks error:', error);
      return [];
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      // Согласно документации WB API - используем правильный эндпоинт для товаров
      const response = await apiClient.request({
        url: `${WB_API_BASE}/api/v3/cards`,
        method: 'GET',
        headers: this.getHeaders(),
      });

      const products = response.data?.cards || response.data || [];
      
      return products.map((product: any) => ({
        id: product.nmID?.toString() || product.id,
        marketplace: 'wildberries' as const,
        sku: product.nmID?.toString() || product.supplierArticle || '',
        name: product.imt_name || product.name || 'Unknown Product',
        brand: product.brand || '',
        category: product.category || '',
        price: product.price || 0,
        stock: 0, // Остатки получаем отдельно через getStocks
        image: product.photos?.[0]?.big || '',
        rating: 0,
        reviewsCount: 0,
      }));
    } catch (error) {
      console.error('WB getProducts error:', error);
      return [];
    }
  }

  async getReviews(filters?: any): Promise<Review[]> {
    try {
      const response = await apiClient.request({
        url: `${WB_API_BASE}/api/v1/feedbacks`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          isAnswered: filters?.isAnswered !== undefined ? filters.isAnswered : false,
          take: filters?.limit || 100,
          skip: filters?.offset || 0,
        },
      });

      const feedbacks = response.data?.feedbacks || response.data?.data?.feedbacks || [];

      return feedbacks.map((review: any) => ({
        id: review.id,
        marketplace: 'wildberries' as const,
        productSku: review.nmId?.toString() || '',
        productName: review.productDetails?.productName || '',
        rating: review.productValuation || 0,
        text: review.text || '',
        authorName: review.userName || 'Anonymous',
        date: new Date(review.createdDate),
        isAnswered: !!review.answer,
        answer: review.answer?.text || undefined,
      }));
    } catch (error) {
      console.error('WB getReviews error:', error);
      return [];
    }
  }

  async getAds(): Promise<AdCampaign[]> {
    try {
      const response = await apiClient.request({
        url: `${WB_ADV_API}/adv/v1/promotion/count`,
        method: 'GET',
        headers: this.getHeaders(),
      });

      const campaigns = response.data?.adverts || response.data || [];

      return campaigns.map((campaign: any) => ({
        id: campaign.advertId?.toString() || campaign.id?.toString(),
        marketplace: 'wildberries' as const,
        name: campaign.name || `Campaign ${campaign.advertId}`,
        status: this.mapCampaignStatus(campaign.status),
        budget: campaign.budget || 0,
        spent: campaign.dailySpent || 0,
        impressions: campaign.views || 0,
        clicks: campaign.clicks || 0,
        orders: campaign.orders || 0,
        ctr: campaign.clicks && campaign.views ? (campaign.clicks / campaign.views) * 100 : 0,
        cpc: campaign.clicks ? (campaign.dailySpent || 0) / campaign.clicks : 0,
        roas: campaign.orders && campaign.dailySpent ? campaign.orders / campaign.dailySpent : 0,
      }));
    } catch (error) {
      console.error('WB getAds error:', error);
      return [];
    }
  }

  async getShipments(dateRange: DateRange): Promise<CalendarEvent[]> {
    try {
      const response = await apiClient.request({
        url: `${WB_API_BASE}/api/v3/supplies`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          limit: 100,
          next: 0,
        },
      });

      const supplies = response.data?.supplies || [];

      return supplies
        .filter((supply: any) => {
          const supplyDate = new Date(supply.createdAt || supply.closedAt);
          return supplyDate >= dateRange.from && supplyDate <= dateRange.to;
        })
        .map((supply: any) => ({
          id: supply.id,
          title: `Поставка ${supply.name || supply.id}`,
          type: 'supply' as const,
          marketplace: 'wildberries' as const,
          date: new Date(supply.closedAt || supply.createdAt).toISOString().split('T')[0],
          warehouse: supply.warehouseName || '',
          status: supply.isLarge ? 'large' : 'standard',
        }));
    } catch (error) {
      console.error('WB getShipments error:', error);
      return [];
    }
  }

  private mapOrderStatus(orderType: string): Order['status'] {
    switch (orderType) {
      case 'Клиентский':
      case 'Продажа':
        return 'completed';
      case 'Возврат':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private mapCampaignStatus(status: number): AdCampaign['status'] {
    switch (status) {
      case 9:
        return 'active';
      case 11:
        return 'paused';
      case 7:
        return 'ended';
      default:
        return 'paused';
    }
  }
}
