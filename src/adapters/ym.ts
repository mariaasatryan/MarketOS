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

const YM_API_BASE = 'https://api.partner.market.yandex.ru';

export class YandexMarketAdapter implements MarketplaceAdapter {
  private token: string;
  private campaignId: string;

  constructor(token: string, campaignId?: string) {
    this.token = token;
    this.campaignId = campaignId || '';
  }

  private getHeaders() {
    return {
      'Authorization': `OAuth ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async validateToken(): Promise<boolean> {
    try {
      await apiClient.request({
        url: `${YM_API_BASE}/campaigns`,
        method: 'GET',
        headers: this.getHeaders(),
        timeoutMs: 10000,
      });
      return true;
    } catch (error) {
      console.error('YM token validation failed:', error);
      return false;
    }
  }

  async getKPIs(dateRange: DateRange): Promise<Partial<KPIMetrics>> {
    try {
      const [ordersData, stocksData] = await Promise.all([
        this.getOrders(dateRange),
        this.getStocks(),
      ]);

      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.price * order.quantity, 0);
      const totalStock = stocksData.reduce((sum, stock) => sum + (stock.available || 0), 0);

      return {
        orders: {
          total: totalOrders,
          byMp: { wildberries: 0, ozon: 0, ym: totalOrders }
        },
        revenue: {
          total: totalRevenue,
          byMp: { wildberries: 0, ozon: 0, ym: totalRevenue }
        },
        stock: {
          total: totalStock,
          byMp: { wildberries: 0, ozon: 0, ym: totalStock }
        },
      };
    } catch (error) {
      console.error('YM getKPIs error:', error);
      throw error;
    }
  }

  async getOrders(dateRange: DateRange): Promise<Order[]> {
    try {
      if (!this.campaignId) {
        await this.loadCampaignId();
      }

      const response = await apiClient.request({
        url: `${YM_API_BASE}/campaigns/${this.campaignId}/orders`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          fromDate: dateRange.from.toISOString().split('T')[0],
          toDate: dateRange.to.toISOString().split('T')[0],
          status: 'PROCESSING,DELIVERED,PICKUP',
        },
      });

      const orders = response.data?.orders || [];

      return orders.flatMap((order: any) =>
        (order.items || []).map((item: any) => ({
          id: `${order.id}_${item.offerId}`,
          marketplace: 'ym' as const,
          sku: item.offerId,
          productName: item.offerName,
          quantity: item.count,
          price: item.price || 0,
          status: this.mapOrderStatus(order.status),
          date: new Date(order.creationDate),
          warehouse: order.delivery?.outletName || '',
        }))
      );
    } catch (error) {
      console.error('YM getOrders error:', error);
      return [];
    }
  }

  private async loadCampaignId(): Promise<void> {
    try {
      const response = await apiClient.request({
        url: `${YM_API_BASE}/campaigns`,
        method: 'GET',
        headers: this.getHeaders(),
      });

      const campaigns = response.data?.campaigns || [];
      if (campaigns.length > 0) {
        this.campaignId = campaigns[0].id.toString();
      }
    } catch (error) {
      console.error('YM loadCampaignId error:', error);
    }
  }

  async getStocks(): Promise<any[]> {
    try {
      if (!this.campaignId) {
        await this.loadCampaignId();
      }

      const response = await apiClient.request({
        url: `${YM_API_BASE}/campaigns/${this.campaignId}/offers/stocks`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          limit: 1000,
        },
      });

      return response.data?.result?.offerStocks || [];
    } catch (error) {
      console.error('YM getStocks error:', error);
      return [];
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      if (!this.campaignId) {
        await this.loadCampaignId();
      }

      const [offersList, stocks] = await Promise.all([
        this.getOffersList(),
        this.getStocks(),
      ]);

      const stocksMap = new Map(
        stocks.map((stock: any) => [
          stock.offerId,
          stock.warehouseStocks?.reduce((sum: number, ws: any) => sum + (ws.count || 0), 0) || 0
        ])
      );

      return offersList.map((offer: any) => ({
        id: offer.offerId,
        marketplace: 'ym' as const,
        sku: offer.offerId,
        name: offer.name,
        brand: offer.vendor || '',
        category: offer.category || '',
        price: offer.price || 0,
        stock: stocksMap.get(offer.offerId) || 0,
        image: offer.pictures?.[0] || '',
        rating: 0,
        reviewsCount: 0,
      }));
    } catch (error) {
      console.error('YM getProducts error:', error);
      return [];
    }
  }

  private async getOffersList(): Promise<any[]> {
    try {
      if (!this.campaignId) {
        await this.loadCampaignId();
      }

      const response = await apiClient.request({
        url: `${YM_API_BASE}/campaigns/${this.campaignId}/offers`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          limit: 1000,
        },
      });

      return response.data?.result?.offers || [];
    } catch (error) {
      console.error('YM getOffersList error:', error);
      return [];
    }
  }

  async getReviews(filters?: any): Promise<Review[]> {
    try {
      if (!this.campaignId) {
        await this.loadCampaignId();
      }

      const response = await apiClient.request({
        url: `${YM_API_BASE}/campaigns/${this.campaignId}/reviews`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          limit: filters?.limit || 100,
        },
      });

      const reviews = response.data?.result?.items || [];

      return reviews.map((review: any) => ({
        id: review.id.toString(),
        marketplace: 'ym' as const,
        productSku: review.product?.offerId || '',
        productName: review.product?.name || '',
        rating: review.grade || 0,
        text: review.text || '',
        authorName: review.user?.name || 'Anonymous',
        date: new Date(review.createdAt),
        isAnswered: !!review.comment,
        answer: review.comment || undefined,
      }));
    } catch (error) {
      console.error('YM getReviews error:', error);
      return [];
    }
  }

  async getAds(): Promise<AdCampaign[]> {
    console.warn('Yandex Market does not provide advertising API in Partner API');
    return [];
  }

  async getShipments(dateRange: DateRange): Promise<CalendarEvent[]> {
    try {
      if (!this.campaignId) {
        await this.loadCampaignId();
      }

      const response = await apiClient.request({
        url: `${YM_API_BASE}/campaigns/${this.campaignId}/orders`,
        method: 'GET',
        headers: this.getHeaders(),
        params: {
          fromDate: dateRange.from.toISOString().split('T')[0],
          toDate: dateRange.to.toISOString().split('T')[0],
        },
      });

      const orders = response.data?.orders || [];

      return orders
        .filter((order: any) => order.delivery?.shipmentDate)
        .map((order: any) => ({
          id: order.id.toString(),
          title: `Отгрузка заказа ${order.id}`,
          type: 'shipment' as const,
          marketplace: 'ym' as const,
          date: new Date(order.delivery.shipmentDate).toISOString().split('T')[0],
          warehouse: order.delivery?.outletName || '',
          status: order.status,
        }));
    } catch (error) {
      console.error('YM getShipments error:', error);
      return [];
    }
  }

  private mapOrderStatus(status: string): Order['status'] {
    switch (status) {
      case 'DELIVERED':
        return 'completed';
      case 'CANCELLED':
      case 'CANCELLED_BY_USER':
        return 'cancelled';
      case 'PROCESSING':
      case 'PICKUP':
      case 'DELIVERY':
        return 'processing';
      default:
        return 'pending';
    }
  }
}
