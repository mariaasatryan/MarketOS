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

const OZON_API_BASE = 'https://api-seller.ozon.ru';
const OZON_V2_API_BASE = 'https://api-seller.ozon.ru/v2';
const OZON_V3_API_BASE = 'https://api-seller.ozon.ru/v3';

export class OzonAdapter implements MarketplaceAdapter {
  private clientId: string;
  private apiKey: string;

  constructor(clientId: string, apiKey: string) {
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Client-Id': this.clientId,
      'Api-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async validateToken(): Promise<boolean> {
    try {
      await apiClient.request({
        url: `${OZON_API_BASE}/v1/product/list`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          filter: {},
          limit: 1,
        },
        timeoutMs: 10000,
      });
      return true;
    } catch (error) {
      console.error('Ozon token validation failed:', error);
      return false;
    }
  }

  async getKPIs(dateRange: DateRange): Promise<Partial<KPIMetrics>> {
    try {
      const [ordersData, productsData] = await Promise.all([
        this.getOrders(dateRange),
        this.getProducts(),
      ]);

      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.price * order.quantity, 0);
      const totalStock = productsData.reduce((sum, product) => sum + product.stock, 0);

      return {
        orders: {
          total: totalOrders,
          byMp: { wildberries: 0, ozon: totalOrders, ym: 0 }
        },
        revenue: {
          total: totalRevenue,
          byMp: { wildberries: 0, ozon: totalRevenue, ym: 0 }
        },
        stock: {
          total: totalStock,
          byMp: { wildberries: 0, ozon: totalStock, ym: 0 }
        },
      };
    } catch (error) {
      console.error('Ozon getKPIs error:', error);
      throw error;
    }
  }

  async getOrders(dateRange: DateRange): Promise<Order[]> {
    try {
      const response = await apiClient.request({
        url: `${OZON_V3_API_BASE}/posting/fbs/list`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          filter: {
            since: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            status: '',
          },
          dir: 'ASC',
          limit: 1000,
          offset: 0,
          with: {
            analytics_data: true,
            financial_data: true,
          },
        },
      });

      const postings = response.data?.result || [];

      return postings.flatMap((posting: unknown) => {
        const postingData = posting as { posting_number?: string; products?: unknown[] };
        return (postingData.products || []).map((product: unknown) => {
          const productData = product as { sku?: string; name?: string; quantity?: number };
          return {
            id: `${postingData.posting_number}_${productData.sku}`,
            marketplace: 'ozon' as const,
            sku: productData.sku,
            productName: productData.name,
            quantity: productData.quantity,
            price: productData.price || 0,
            status: this.mapOrderStatus(postingData.status),
            date: new Date(postingData.created_at || postingData.in_process_at),
            warehouse: postingData.warehouse_name || '',
          };
        });
      });
    } catch (error) {
      console.error('Ozon getOrders error:', error);
      return [];
    }
  }

  async getStocks(): Promise<any[]> {
    try {
      const response = await apiClient.request({
        url: `${OZON_V3_API_BASE}/product/info/stocks`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          filter: {},
          limit: 1000,
        },
      });

      return response.data?.result?.items || [];
    } catch (error) {
      console.error('Ozon getStocks error:', error);
      return [];
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const [productList, stocks] = await Promise.all([
        this.getProductList(),
        this.getStocks(),
      ]);

      const stocksMap = new Map(
        stocks.map((stock: any) => [
          stock.product_id,
          stock.stocks?.reduce((sum: number, s: any) => sum + (s.present || 0), 0) || 0
        ])
      );

      return productList.map((product: any) => ({
        id: product.product_id.toString(),
        marketplace: 'ozon' as const,
        sku: product.offer_id,
        name: product.name,
        brand: product.brand || '',
        category: product.category_name || '',
        price: product.price || 0,
        stock: stocksMap.get(product.product_id) || 0,
        image: product.primary_image || '',
        rating: product.rating || 0,
        reviewsCount: product.reviews_count || 0,
      }));
    } catch (error) {
      console.error('Ozon getProducts error:', error);
      return [];
    }
  }

  private async getProductList(): Promise<any[]> {
    try {
      const response = await apiClient.request({
        url: `${OZON_V2_API_BASE}/product/list`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          filter: {
            visibility: 'ALL',
          },
          limit: 1000,
        },
      });

      return response.data?.result?.items || [];
    } catch (error) {
      console.error('Ozon getProductList error:', error);
      return [];
    }
  }

  async getReviews(filters?: any): Promise<Review[]> {
    try {
      const response = await apiClient.request({
        url: `${OZON_API_BASE}/v1/review/list`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          filter: {
            is_answered: filters?.isAnswered,
          },
          limit: filters?.limit || 100,
          offset: filters?.offset || 0,
        },
      });

      const reviews = response.data?.result?.reviews || [];

      return reviews.map((review: any) => ({
        id: review.id.toString(),
        marketplace: 'ozon' as const,
        productSku: review.product_id?.toString() || '',
        productName: review.product_name || '',
        rating: review.rating || 0,
        text: review.text || '',
        authorName: review.author_name || 'Anonymous',
        date: new Date(review.created_at),
        isAnswered: !!review.reply,
        answer: review.reply?.text || undefined,
      }));
    } catch (error) {
      console.error('Ozon getReviews error:', error);
      return [];
    }
  }

  async getAds(dateRange: DateRange): Promise<AdCampaign[]> {
    try {
      const response = await apiClient.request({
        url: `${OZON_API_BASE}/v1/promotion/list`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          date_from: dateRange.from.toISOString().split('T')[0],
          date_to: dateRange.to.toISOString().split('T')[0],
        },
      });

      const campaigns = response.data?.result || [];

      return campaigns.map((campaign: any) => ({
        id: campaign.id?.toString() || campaign.action_id?.toString(),
        marketplace: 'ozon' as const,
        name: campaign.title || campaign.name || `Campaign ${campaign.id}`,
        status: this.mapCampaignStatus(campaign.status),
        budget: campaign.budget || 0,
        spent: campaign.expense || 0,
        impressions: campaign.views || 0,
        clicks: campaign.clicks || 0,
        orders: campaign.orders_count || 0,
        ctr: campaign.clicks && campaign.views ? (campaign.clicks / campaign.views) * 100 : 0,
        cpc: campaign.clicks ? (campaign.expense || 0) / campaign.clicks : 0,
        roas: campaign.orders_count && campaign.expense
          ? campaign.orders_count / campaign.expense
          : 0,
      }));
    } catch (error) {
      console.error('Ozon getAds error:', error);
      return [];
    }
  }

  async getShipments(dateRange: DateRange): Promise<CalendarEvent[]> {
    try {
      const response = await apiClient.request({
        url: `${OZON_V3_API_BASE}/posting/fbs/list`,
        method: 'POST',
        headers: this.getHeaders(),
        data: {
          filter: {
            since: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          },
          dir: 'ASC',
          limit: 1000,
        },
      });

      const postings = response.data?.result || [];

      return postings
        .filter((posting: any) => posting.shipment_date)
        .map((posting: any) => ({
          id: posting.posting_number,
          title: `Отгрузка ${posting.posting_number}`,
          type: 'shipment' as const,
          marketplace: 'ozon' as const,
          date: new Date(posting.shipment_date).toISOString().split('T')[0],
          warehouse: posting.warehouse_name || '',
          status: posting.status,
        }));
    } catch (error) {
      console.error('Ozon getShipments error:', error);
      return [];
    }
  }

  private mapOrderStatus(status: string): Order['status'] {
    switch (status) {
      case 'delivered':
      case 'delivered_to_customer':
        return 'completed';
      case 'cancelled':
      case 'cancelled_by_seller':
      case 'cancelled_by_customer':
        return 'cancelled';
      case 'awaiting_packaging':
      case 'awaiting_deliver':
      case 'delivering':
        return 'processing';
      default:
        return 'pending';
    }
  }

  private mapCampaignStatus(status: string): AdCampaign['status'] {
    switch (status) {
      case 'CAMPAIGN_STATE_RUNNING':
      case 'active':
        return 'active';
      case 'CAMPAIGN_STATE_STOPPED':
      case 'paused':
        return 'paused';
      case 'CAMPAIGN_STATE_FINISHED':
      case 'finished':
        return 'ended';
      default:
        return 'paused';
    }
  }
}
