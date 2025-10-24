import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService } from '../services/realMarketplaceService';

interface SalesData {
  date: string;
  total_sales: number;
  total_orders: number;
}

export function Analytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Загружаем интеграции
      const integrationsData = await marketplaceService.listIntegrations();
      setIntegrations(integrationsData);

      // Получаем реальные данные аналитики через API маркетплейсов
      const realAnalyticsData = await RealMarketplaceService.getRealAnalyticsData(integrationsData);
      
      // Форматируем данные для отображения
      const formattedSales = realAnalyticsData.map(item => ({
        date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        total_sales: item.revenue,
        total_orders: item.orders,
      }));

      setSalesData(formattedSales);

      // Получаем реальные данные товаров через API маркетплейсов
      const realProductsData = await RealMarketplaceService.getRealProductsData(integrationsData);
      const topProducts = realProductsData.slice(0, 5).map(product => ({
        id: product.id,
        title: product.name,
        price: product.price,
        stock: product.stock,
      }));
      setTopProducts(topProducts);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      // Имитируем синхронизацию данных
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadAnalytics();
    } catch (e: any) {
      console.error('Error syncing analytics:', e);
    } finally {
      setSyncing(false);
    }
  };

  const totalSales = salesData.reduce((sum, d) => sum + d.total_sales, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.total_orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const maxSales = Math.max(...salesData.map((d) => d.total_sales), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Аналитика</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Анализ продаж и товаров</p>
        </div>
        <div className="flex gap-2">
          {integrations.length > 0 && (
            <button
              onClick={handleSyncData}
              disabled={syncing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Синхронизация...' : 'Синхронизировать'}
            </button>
          )}
          <button
            onClick={() => setPeriod('7d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === '7d'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            7 дней
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === '30d'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            30 дней
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === '90d'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            90 дней
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Общие продажи</p>
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <DollarSign size={20} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {totalSales.toLocaleString('ru-RU')} ₽
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">За выбранный период</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Заказы</p>
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <ShoppingCart size={20} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{totalOrders}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Всего заказов</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Средний чек</p>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <DollarSign size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {avgOrderValue.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">На один заказ</p>
            </div>
          </div>

          {salesData.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">График продаж</h2>
              <div className="space-y-4">
                {salesData.map((data, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-slate-600 dark:text-slate-400">{data.date}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-red-600 dark:bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.total_sales / maxSales) * 100}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {data.total_sales.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Заказов: {data.total_orders}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <Package className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Нет данных о продажах</h3>
              <p className="text-slate-600 dark:text-slate-400">Данные появятся после синхронизации с маркетплейсами</p>
            </div>
          )}

          {topProducts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Топ товары</h2>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 dark:text-white">{product.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Цена: {Number(product.price || 0).toLocaleString('ru-RU')} ₽ •
                        Остаток: {product.stock || 0} шт
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
