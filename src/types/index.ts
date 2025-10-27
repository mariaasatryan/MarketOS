export type Marketplace = 'wildberries' | 'ozon' | 'ym' | 'smm';
export type AppMode = 'MOCK' | 'LIVE';
export type Language = 'ru' | 'en';

export interface MarketplaceInfo {
  id: Marketplace;
  name: string;
  country: string;
  logo: string;
  description?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ByMarketplace<T> {
  wildberries: T;
  ozon: T;
  ym: T;
}

export interface KPIMetrics {
  orders: {
    total: number;
    byMp: ByMarketplace<number>;
  };
  revenue: {
    total: number;
    byMp: ByMarketplace<number>;
  };
  stock: {
    total: number;
    byMp: ByMarketplace<number>;
  };
  conversion?: {
    total: number;
    byMp: ByMarketplace<number>;
  };
  ads?: {
    spend: {
      total: number;
      byMp: ByMarketplace<number>;
    };
    roas: {
      total: number;
      byMp: ByMarketplace<number>;
    };
  };
}

export interface Order {
  id: string;
  marketplace: Marketplace;
  sku: string;
  productName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: Date;
  warehouse?: string;
}

export interface Product {
  id: string;
  marketplace: Marketplace;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface Review {
  id: string;
  marketplace: Marketplace;
  productSku: string;
  productName: string;
  rating: number;
  text: string;
  authorName: string;
  date: Date;
  isAnswered: boolean;
  answer?: string;
}

export interface AdCampaign {
  id: string;
  marketplace: Marketplace;
  name: string;
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  orders: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'supply' | 'shipment' | 'deadline' | 'reminder' | 'custom';
  marketplace?: Marketplace;
  date: string;
  time?: string;
  warehouse?: string;
  status?: string;
  assignee?: string;
  relatedTo?: string;
  meetingLink?: string;
}

export interface MarketplaceAdapter {
  validateToken(): Promise<boolean>;
  getKPIs(dateRange: DateRange): Promise<Partial<KPIMetrics>>;
  getOrders(dateRange: DateRange): Promise<Order[]>;
  getProducts(): Promise<Product[]>;
  getReviews(filters?: any): Promise<Review[]>;
  getAds(dateRange: DateRange): Promise<AdCampaign[]>;
  getShipments(dateRange: DateRange): Promise<CalendarEvent[]>;
}
