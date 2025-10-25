import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService } from '../services/realMarketplaceService';
import { getMarketplaceColors, getSyncButtonColors } from '../utils/marketplaceColors';
import SyncButton from '../components/SyncButton';

interface SalesData {
  date: string;
  total_sales: number;
  total_orders: number;
}

interface ProfitabilityAnalysis {
  productId: string;
  productName: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  isLossMaking: boolean;
  turnoverRate: number;
  status: 'profitable' | 'loss' | 'low_turnover' | 'frozen';
}

interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  forecastRevenue: number;
  planCompletion: number;
}

export function Analytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<ProfitabilityAnalysis[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

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

      // Анализ прибыльности товаров (функция Sirena AI)
      const profitabilityData = await analyzeProfitability(realProductsData, realAnalyticsData);
      setProfitabilityAnalysis(profitabilityData);

      // Финансовые метрики
      const financialData = calculateFinancialMetrics(realAnalyticsData, profitabilityData);
      setFinancialMetrics(financialData);

      // Предупреждения и алерты
      const alertsData = generateAlerts(profitabilityData, financialData);
      setAlerts(alertsData);
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
          <SyncButton
            onClick={handleSyncData}
            isLoading={syncing}
            variant="primary"
          >
            {syncing ? 'Синхронизация...' : 'Синхронизировать'}
          </SyncButton>
          <button
            onClick={() => setPeriod('7d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            7 дней
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            30 дней
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            90 дней
          </button>
        </div>
      </div>

      {/* Предупреждения и алерты (Sirena AI функционал) */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
            <h3 className="font-semibold text-orange-800 dark:text-orange-300">Предупреждения</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="text-sm text-orange-700 dark:text-orange-300">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Финансовые метрики (Sirena AI функционал) */}
      {financialMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Выручка</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {financialMetrics.totalRevenue.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Прибыль</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {financialMetrics.netProfit.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Маржа</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {financialMetrics.profitMargin.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">План</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {financialMetrics.planCompletion.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

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
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
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
                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
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
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
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

  // Функции анализа прибыльности (Sirena AI функционал)
  const analyzeProfitability = async (products: any[], analyticsData: any[]): Promise<ProfitabilityAnalysis[]> => {
    return products.map(product => {
      const productAnalytics = analyticsData.find(item => item.productId === product.id) || {};
      const revenue = productAnalytics.revenue || 0;
      const costs = product.price * 0.3; // Примерная себестоимость 30% от цены
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const isLossMaking = profit < 0;
      const turnoverRate = productAnalytics.turnoverRate || 0;
      
      let status: 'profitable' | 'loss' | 'low_turnover' | 'frozen' = 'profitable';
      if (isLossMaking) status = 'loss';
      else if (turnoverRate < 0.1) status = 'low_turnover';
      else if (product.stock > 100 && turnoverRate < 0.05) status = 'frozen';

      return {
        productId: product.id,
        productName: product.title,
        revenue,
        costs,
        profit,
        profitMargin,
        isLossMaking,
        turnoverRate,
        status
      };
    });
  };

  const calculateFinancialMetrics = (analyticsData: any[], profitabilityData: ProfitabilityAnalysis[]): FinancialMetrics => {
    const totalRevenue = analyticsData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalCosts = profitabilityData.reduce((sum, item) => sum + item.costs, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const forecastRevenue = totalRevenue * 1.15; // Прогноз +15%
    const planCompletion = Math.min(100, (totalRevenue / (totalRevenue * 1.2)) * 100); // План на 20% больше

    return {
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
      forecastRevenue,
      planCompletion
    };
  };

  const generateAlerts = (profitabilityData: ProfitabilityAnalysis[], financialData: FinancialMetrics): string[] => {
    const alerts: string[] = [];
    
    // Убыточные товары
    const lossMakingProducts = profitabilityData.filter(item => item.isLossMaking);
    if (lossMakingProducts.length > 0) {
      alerts.push(`⚠️ ${lossMakingProducts.length} товаров приносят убытки`);
    }

    // Замороженные позиции
    const frozenProducts = profitabilityData.filter(item => item.status === 'frozen');
    if (frozenProducts.length > 0) {
      alerts.push(`🧊 ${frozenProducts.length} товаров заморожены (низкая оборачиваемость)`);
    }

    // Низкая прибыльность
    if (financialData.profitMargin < 10) {
      alerts.push(`📉 Низкая прибыльность: ${financialData.profitMargin.toFixed(1)}%`);
    }

    // План не выполняется
    if (financialData.planCompletion < 80) {
      alerts.push(`📊 План выполнен на ${financialData.planCompletion.toFixed(1)}%`);
    }

    return alerts;
  };
}
