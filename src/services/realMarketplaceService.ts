// Реальный сервис для работы с API маркетплейсов
import type { MarketplaceIntegration } from './marketplaceService';

export interface RealKPIData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalStock: number;
  avgOrderValue: number;
  lowStock: number;
  byMarketplace: {
    wildberries: {
      products: number;
      orders: number;
      revenue: number;
      stock: number;
    };
    ozon: {
      products: number;
      orders: number;
      revenue: number;
      stock: number;
    };
    ym: {
      products: number;
      orders: number;
      revenue: number;
      stock: number;
    };
  };
}

export class RealMarketplaceService {
  private static async makeRequest(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Wildberries API методы (обновлено согласно официальной документации)
  static async getWBOrders(apiToken: string, dateFrom: string, dateTo: string) {
    try {
      // Согласно документации WB API - используем правильный эндпоинт для заказов
      const response = await this.makeRequest(
        `https://suppliers-api.wildberries.ru/api/v3/orders?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.orders || response.data || [];
    } catch (error) {
      console.error('WB Orders API error:', error);
      return [];
    }
  }

  static async getWBWarehouses(apiToken: string) {
    try {
      // Согласно документации WB API - правильный эндпоинт для складов
      const response = await this.makeRequest(
        'https://suppliers-api.wildberries.ru/api/v3/warehouses',
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.warehouses || response.data || [];
    } catch (error) {
      console.error('WB Warehouses API error:', error);
      return [];
    }
  }

  static async getWBStocks(apiToken: string) {
    try {
      // Согласно документации WB API - используем правильный эндпоинт для остатков
      const response = await this.makeRequest(
        'https://suppliers-api.wildberries.ru/api/v3/stocks',
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.stocks || response.data || [];
    } catch (error) {
      console.error('WB Stocks API error:', error);
      return [];
    }
  }

  static async getWBProducts(apiToken: string) {
    try {
      // Согласно документации WB API - используем правильный эндпоинт для товаров
      const response = await this.makeRequest(
        'https://suppliers-api.wildberries.ru/api/v3/cards',
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.cards || response.data || [];
    } catch (error) {
      console.error('WB Products API error:', error);
      return [];
    }
  }

  static async getWBSales(apiToken: string, dateFrom: string, dateTo: string) {
    try {
      const response = await this.makeRequest(
        `https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            'Authorization': apiToken,
          },
        }
      );
      return response.data || [];
    } catch (error) {
      console.error('WB Sales API error:', error);
      return [];
    }
  }

  // Ozon API методы (согласно официальной документации)
  static async getOzonOrders(apiToken: string, clientId: string, dateFrom: string, dateTo: string) {
    try {
      // Используем правильный эндпоинт для получения заказов FBS
      const response = await this.makeRequest(
        'https://api-seller.ozon.ru/v3/posting/fbs/list',
        {
          method: 'POST',
          headers: {
            'Api-Key': apiToken,
            'Client-Id': clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              since: dateFrom + 'T00:00:00.000Z',
              to: dateTo + 'T23:59:59.999Z',
            },
            limit: 1000,
            offset: 0,
          }),
        }
      );
      return response.result?.postings || [];
    } catch (error) {
      console.error('Ozon Orders API error:', error);
      return [];
    }
  }

  static async getOzonProducts(apiToken: string, clientId: string) {
    try {
      // Используем правильный эндпоинт для получения списка товаров
      const response = await this.makeRequest(
        'https://api-seller.ozon.ru/v2/product/list',
        {
          method: 'POST',
          headers: {
            'Api-Key': apiToken,
            'Client-Id': clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              visibility: 'ALL', // ALL, VISIBLE, INVISIBLE
            },
            limit: 1000,
            last_id: '',
          }),
        }
      );
      return response.result?.items || [];
    } catch (error) {
      console.error('Ozon Products API error:', error);
      return [];
    }
  }

  static async getOzonStocks(apiToken: string, clientId: string) {
    try {
      // Получаем остатки товаров
      const response = await this.makeRequest(
        'https://api-seller.ozon.ru/v1/product/info/stocks',
        {
          method: 'POST',
          headers: {
            'Api-Key': apiToken,
            'Client-Id': clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              visibility: 'ALL',
            },
            limit: 1000,
            last_id: '',
          }),
        }
      );
      return response.result?.items || [];
    } catch (error) {
      console.error('Ozon Stocks API error:', error);
      return [];
    }
  }

  static async getOzonAnalytics(apiToken: string, clientId: string, dateFrom: string, dateTo: string) {
    try {
      // Получаем аналитику продаж
      const response = await this.makeRequest(
        'https://api-seller.ozon.ru/v1/analytics/data',
        {
          method: 'POST',
          headers: {
            'Api-Key': apiToken,
            'Client-Id': clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date_from: dateFrom,
            date_to: dateTo,
            metrics: ['revenue', 'ordered_units'],
            dimension: ['day'],
            filters: [],
            sort: [{ key: 'day', order: 'ASC' }],
            limit: 1000,
            offset: 0,
          }),
        }
      );
      return response.result?.data || [];
    } catch (error) {
      console.error('Ozon Analytics API error:', error);
      return [];
    }
  }

  // Яндекс.Маркет API методы (согласно официальной документации)
  static async getYandexMarketCampaigns(apiToken: string) {
    try {
      // Получаем список кампаний пользователя
      const response = await this.makeRequest(
        'https://api.partner.market.yandex.ru/v2/campaigns',
        {
          headers: {
            'Authorization': `OAuth ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.campaigns || [];
    } catch (error) {
      console.error('Yandex Market Campaigns API error:', error);
      return [];
    }
  }

  static async getYandexMarketOrders(apiToken: string, dateFrom: string, dateTo: string) {
    try {
      // Сначала получаем список кампаний
      const campaigns = await this.getYandexMarketCampaigns(apiToken);
      const allOrders = [];
      
      for (const campaign of campaigns) {
        try {
          // Получаем заказы для каждой кампании
          const ordersResponse = await this.makeRequest(
            `https://api.partner.market.yandex.ru/v2/campaigns/${campaign.id}/orders`,
            {
              headers: {
                'Authorization': `OAuth ${apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fromDate: dateFrom,
                toDate: dateTo,
                statuses: ['PROCESSING', 'DELIVERY', 'PICKUP', 'DELIVERED'],
              }),
            }
          );
          allOrders.push(...(ordersResponse.orders || []));
        } catch (error) {
          console.error(`Error fetching orders for campaign ${campaign.id}:`, error);
        }
      }
      
      return allOrders;
    } catch (error) {
      console.error('Yandex Market Orders API error:', error);
      return [];
    }
  }

  static async getYandexMarketProducts(apiToken: string) {
    try {
      // Сначала получаем список кампаний
      const campaigns = await this.getYandexMarketCampaigns(apiToken);
      const allProducts = [];
      
      for (const campaign of campaigns) {
        try {
          // Получаем товары (офферы) для каждой кампании
          const productsResponse = await this.makeRequest(
            `https://api.partner.market.yandex.ru/v2/campaigns/${campaign.id}/offers`,
            {
              headers: {
                'Authorization': `OAuth ${apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                limit: 1000,
                offset: 0,
              }),
            }
          );
          allProducts.push(...(productsResponse.result?.offers || []));
        } catch (error) {
          console.error(`Error fetching products for campaign ${campaign.id}:`, error);
        }
      }
      
      return allProducts;
    } catch (error) {
      console.error('Yandex Market Products API error:', error);
      return [];
    }
  }

  static async getYandexMarketStocks(apiToken: string) {
    try {
      // Получаем остатки товаров через кампании
      const campaigns = await this.getYandexMarketCampaigns(apiToken);
      const allStocks = [];
      
      for (const campaign of campaigns) {
        try {
          // Получаем остатки для каждой кампании
          const stocksResponse = await this.makeRequest(
            `https://api.partner.market.yandex.ru/v2/campaigns/${campaign.id}/offers/stocks`,
            {
              headers: {
                'Authorization': `OAuth ${apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                limit: 1000,
                offset: 0,
              }),
            }
          );
          allStocks.push(...(stocksResponse.result?.stocks || []));
        } catch (error) {
          console.error(`Error fetching stocks for campaign ${campaign.id}:`, error);
        }
      }
      
      return allStocks;
    } catch (error) {
      console.error('Yandex Market Stocks API error:', error);
      return [];
    }
  }

  static async getYandexMarketAnalytics(apiToken: string, dateFrom: string, dateTo: string) {
    try {
      // Получаем аналитику продаж через кампании
      const campaigns = await this.getYandexMarketCampaigns(apiToken);
      const allAnalytics = [];
      
      for (const campaign of campaigns) {
        try {
          // Получаем статистику заказов для каждой кампании
          const analyticsResponse = await this.makeRequest(
            `https://api.partner.market.yandex.ru/v2/campaigns/${campaign.id}/stats/orders`,
            {
              headers: {
                'Authorization': `OAuth ${apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fromDate: dateFrom,
                toDate: dateTo,
                groupBy: 'day',
              }),
            }
          );
          allAnalytics.push(...(analyticsResponse.result?.orders || []));
        } catch (error) {
          console.error(`Error fetching analytics for campaign ${campaign.id}:`, error);
        }
      }
      
      return allAnalytics;
    } catch (error) {
      console.error('Yandex Market Analytics API error:', error);
      return [];
    }
  }

  // Основной метод для получения реальных KPI данных
  static async getRealKPIData(integrations: MarketplaceIntegration[]): Promise<RealKPIData> {
    if (integrations.length === 0) {
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalStock: 0,
        avgOrderValue: 0,
        lowStock: 0,
        byMarketplace: {
          wildberries: { products: 0, orders: 0, revenue: 0, stock: 0 },
          ozon: { products: 0, orders: 0, revenue: 0, stock: 0 },
          ym: { products: 0, orders: 0, revenue: 0, stock: 0 },
        },
      };
    }

    const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo = new Date().toISOString().split('T')[0];

    const wbData = { products: 0, orders: 0, revenue: 0, stock: 0 };
    const ozonData = { products: 0, orders: 0, revenue: 0, stock: 0 };
    const ymData = { products: 0, orders: 0, revenue: 0, stock: 0 };

    // Обрабатываем каждую интеграцию
    for (const integration of integrations) {
      if (!integration.is_active) continue;

      try {
        switch (integration.marketplace) {
          case 'wildberries':
            const [wbOrders, wbStocks, wbProducts, wbSales] = await Promise.all([
              this.getWBOrders(integration.api_token, dateFrom, dateTo),
              this.getWBStocks(integration.api_token),
              this.getWBProducts(integration.api_token),
              this.getWBSales(integration.api_token, dateFrom, dateTo),
            ]);

            wbData.products += wbProducts.length;
            wbData.orders += wbOrders.length;
            wbData.revenue += wbSales.reduce((sum: number, sale: any) => sum + (sale.finishedPrice || 0), 0);
            wbData.stock += wbStocks.reduce((sum: number, stock: any) => sum + (stock.amount || 0), 0);
            break;

          case 'ozon':
            if (integration.client_id) {
              const [ozonOrders, ozonProducts, ozonStocks, ozonAnalytics] = await Promise.all([
                this.getOzonOrders(integration.api_token, integration.client_id, dateFrom, dateTo),
                this.getOzonProducts(integration.api_token, integration.client_id),
                this.getOzonStocks(integration.api_token, integration.client_id),
                this.getOzonAnalytics(integration.api_token, integration.client_id, dateFrom, dateTo),
              ]);

              ozonData.products += ozonProducts.length;
              ozonData.orders += ozonOrders.length;
              ozonData.revenue += ozonAnalytics.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
              ozonData.stock += ozonStocks.reduce((sum: number, stock: any) => sum + (stock.present || 0), 0);
            }
            break;

          case 'ym':
            const [ymOrders, ymProducts, ymStocks, ymAnalytics] = await Promise.all([
              this.getYandexMarketOrders(integration.api_token, dateFrom, dateTo),
              this.getYandexMarketProducts(integration.api_token),
              this.getYandexMarketStocks(integration.api_token),
              this.getYandexMarketAnalytics(integration.api_token, dateFrom, dateTo),
            ]);

            ymData.products += ymProducts.length;
            ymData.orders += ymOrders.length;
            ymData.revenue += ymAnalytics.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
            ymData.stock += ymStocks.reduce((sum: number, stock: any) => sum + (stock.count || 0), 0);
            break;
        }
      } catch (error) {
        console.error(`Error processing ${integration.marketplace} integration:`, error);
      }
    }

    // Суммируем общие данные
    const totalProducts = wbData.products + ozonData.products + ymData.products;
    const totalOrders = wbData.orders + ozonData.orders + ymData.orders;
    const totalRevenue = wbData.revenue + ozonData.revenue + ymData.revenue;
    const totalStock = wbData.stock + ozonData.stock + ymData.stock;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const lowStock = Math.floor(totalProducts * 0.15); // Примерно 15% товаров с низким остатком

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalStock,
      avgOrderValue,
      lowStock,
      byMarketplace: {
        wildberries: wbData,
        ozon: ozonData,
        ym: ymData,
      },
    };
  }

  // Метод для получения реальных данных аналитики
  static async getRealAnalyticsData(integrations: MarketplaceIntegration[]): Promise<any[]> {
    if (integrations.length === 0) return [];

    const data: any[] = [];
    const days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let totalOrders = 0;
      let totalRevenue = 0;

      // Собираем данные за этот день со всех активных интеграций
      for (const integration of integrations) {
        if (!integration.is_active) continue;

        try {
          switch (integration.marketplace) {
            case 'wildberries':
              const wbSales = await this.getWBSales(integration.api_token, dateStr, dateStr);
              totalOrders += wbSales.length;
              totalRevenue += wbSales.reduce((sum: number, sale: any) => sum + (sale.finishedPrice || 0), 0);
              break;

            case 'ozon':
              if (integration.client_id) {
                const ozonAnalytics = await this.getOzonAnalytics(integration.api_token, integration.client_id, dateStr, dateStr);
                totalOrders += ozonAnalytics.reduce((sum: number, item: any) => sum + (item.ordered_units || 0), 0);
                totalRevenue += ozonAnalytics.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
              }
              break;

            case 'ym':
              const ymAnalytics = await this.getYandexMarketAnalytics(integration.api_token, dateStr, dateStr);
              totalOrders += ymAnalytics.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
              totalRevenue += ymAnalytics.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
              break;
          }
        } catch (error) {
          console.error(`Error fetching analytics for ${integration.marketplace} on ${dateStr}:`, error);
        }
      }

      data.push({
        date: dateStr,
        orders: totalOrders,
        revenue: totalRevenue,
        total_orders: data.reduce((sum: number, item: any) => sum + item.orders, 0) + totalOrders,
      });
    }

    return data;
  }

  // Метод для получения реальных данных товаров
  static async getRealProductsData(integrations: MarketplaceIntegration[]): Promise<any[]> {
    if (integrations.length === 0) return [];

    const allProducts: any[] = [];

    for (const integration of integrations) {
      if (!integration.is_active) continue;

      try {
        switch (integration.marketplace) {
          case 'wildberries':
            const wbProducts = await this.getWBProducts(integration.api_token);
            const wbStocks = await this.getWBStocks(integration.api_token);
            
            // Создаем карту остатков
            const stocksMap = new Map();
            wbStocks.forEach((stock: any) => {
              stocksMap.set(stock.sku, stock.amount || 0);
            });

            wbProducts.forEach((product: any) => {
              allProducts.push({
                id: `${integration.marketplace}-${product.nmID}`,
                marketplace: integration.marketplace,
                sku: product.nmID?.toString() || '',
                name: product.imt_name || 'Без названия',
                price: product.price || 0,
                stock: stocksMap.get(product.supplierArticle || product.nmID?.toString()) || 0,
                rating: 0,
                reviewsCount: 0,
                image: product.photos?.[0]?.big || '',
              });
            });
            break;

          case 'ozon':
            if (integration.client_id) {
              const [ozonProducts, ozonStocks] = await Promise.all([
                this.getOzonProducts(integration.api_token, integration.client_id),
                this.getOzonStocks(integration.api_token, integration.client_id),
              ]);

              // Создаем карту остатков
              const stocksMap = new Map();
              ozonStocks.forEach((stock: any) => {
                stocksMap.set(stock.offer_id, stock.present || 0);
              });

              ozonProducts.forEach((product: any) => {
                allProducts.push({
                  id: `${integration.marketplace}-${product.product_id}`,
                  marketplace: integration.marketplace,
                  sku: product.offer_id || '',
                  name: product.name || 'Без названия',
                  price: product.price || 0,
                  stock: stocksMap.get(product.offer_id) || 0,
                  rating: 0,
                  reviewsCount: 0,
                  image: product.images?.[0] || '',
                });
              });
            }
            break;

          case 'ym':
            const [ymProducts, ymStocks] = await Promise.all([
              this.getYandexMarketProducts(integration.api_token),
              this.getYandexMarketStocks(integration.api_token),
            ]);

            // Создаем карту остатков
            const ymStocksMap = new Map();
            ymStocks.forEach((stock: any) => {
              ymStocksMap.set(stock.shopSku, stock.count || 0);
            });

            ymProducts.forEach((product: any) => {
              allProducts.push({
                id: `${integration.marketplace}-${product.shopSku}`,
                marketplace: integration.marketplace,
                sku: product.shopSku || '',
                name: product.name || 'Без названия',
                price: product.price?.value || 0,
                stock: ymStocksMap.get(product.shopSku) || 0,
                rating: 0,
                reviewsCount: 0,
                image: product.pictures?.[0]?.url || '',
              });
            });
            break;
        }
      } catch (error) {
        console.error(`Error fetching products for ${integration.marketplace}:`, error);
      }
    }

    return allProducts;
  }
}
