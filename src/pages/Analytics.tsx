import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BarChart3,
  TrendingDown,
  Activity,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
  Lightbulb
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService } from '../services/realMarketplaceService';
import SyncButton from '../components/SyncButton';
import { QuickExportButton } from '../components/DataExportModal';

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
  planCompletion: number;
}

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
    daily: Array<{ date: string; value: number }>;
    monthly: Array<{ month: string; value: number }>;
  };
  sales: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
    daily: Array<{ date: string; value: number }>;
  };
  customers: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
    segments: Array<{ segment: string; count: number; percentage: number }>;
  };
  products: {
    total: number;
    active: number;
    topPerforming: Array<{ name: string; sales: number; revenue: number }>;
  };
  marketplaces: {
    wildberries: { revenue: number; sales: number; growth: number };
    ozon: { revenue: number; sales: number; growth: number };
    ym: { revenue: number; sales: number; growth: number };
  };
  insights: Array<{
    id: string;
    type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
}

export function Analytics() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityAnalysis[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    planCompletion: 0
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const totalSales = salesData.reduce((sum, item) => sum + item.total_sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.total_orders, 0);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const integrations = await marketplaceService.listIntegrations();
      if (integrations.length === 0) {
        setError('Нет подключенных маркетплейсов');
        return;
      }

      const realData = await RealMarketplaceService.getRealAnalyticsData(integrations);
      setSalesData(realData);

      const profitabilityAnalysis = await analyzeProfitability();
      setProfitabilityData(profitabilityAnalysis);

      const metrics = calculateFinancialMetrics(realData, profitabilityAnalysis);
      setFinancialMetrics(metrics);

      // Загружаем продвинутые данные
      await loadAdvancedAnalytics();

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadAdvancedAnalytics = async () => {
    // Моковые данные для продвинутой аналитики
    const mockData: AnalyticsData = {
      revenue: {
        total: 2450000,
        growth: 12.5,
        trend: 'up',
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          value: Math.floor(Math.random() * 50000) + 50000
        })),
        monthly: [
          { month: 'Янв', value: 1800000 },
          { month: 'Фев', value: 1950000 },
          { month: 'Мар', value: 2100000 },
          { month: 'Апр', value: 2200000 },
          { month: 'Май', value: 2350000 },
          { month: 'Июн', value: 2450000 }
        ]
      },
      sales: {
        total: 1847,
        growth: 8.3,
        trend: 'up',
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          value: Math.floor(Math.random() * 100) + 50
        }))
      },
      customers: {
        total: 12450,
        growth: 15.2,
        trend: 'up',
        segments: [
          { segment: 'Новые клиенты', count: 3200, percentage: 25.7 },
          { segment: 'Постоянные клиенты', count: 6800, percentage: 54.6 },
          { segment: 'VIP клиенты', count: 2450, percentage: 19.7 }
        ]
      },
      products: {
        total: 156,
        active: 142,
        topPerforming: [
          { name: 'iPhone 15 Pro', sales: 234, revenue: 2340000 },
          { name: 'Samsung Galaxy S24', sales: 189, revenue: 1890000 },
          { name: 'AirPods Pro', sales: 156, revenue: 312000 },
          { name: 'MacBook Air M3', sales: 98, revenue: 1470000 },
          { name: 'iPad Pro', sales: 87, revenue: 870000 }
        ]
      },
      marketplaces: {
        wildberries: { revenue: 1200000, sales: 920, growth: 10.5 },
        ozon: { revenue: 850000, sales: 650, growth: 15.2 },
        ym: { revenue: 400000, sales: 277, growth: 8.7 }
      },
      insights: [
        {
          id: '1',
          type: 'opportunity',
          title: 'Рост спроса на премиум сегмент',
          description: 'Анализ показывает рост спроса на товары премиум сегмента на 25% за последний месяц',
          impact: 'high',
          confidence: 0.87
        },
        {
          id: '2',
          type: 'threat',
          title: 'Снижение конверсии на Ozon',
          description: 'Конверсия на Ozon снизилась на 8% по сравнению с прошлым месяцем',
          impact: 'medium',
          confidence: 0.92
        },
        {
          id: '3',
          type: 'trend',
          title: 'Увеличение среднего чека',
          description: 'Средний чек вырос на 15% благодаря успешным кросс-продажам',
          impact: 'high',
          confidence: 0.95
        }
      ]
    };
    setAnalyticsData(mockData);
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadAnalyticsData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  const analyzeProfitability = async (): Promise<ProfitabilityAnalysis[]> => {
    return [
      {
        productId: '1',
        productName: 'iPhone 15 Pro',
        revenue: 2340000,
        costs: 1800000,
        profit: 540000,
        profitMargin: 23.1,
        isLossMaking: false,
        turnoverRate: 2.3,
        status: 'profitable'
      },
      {
        productId: '2',
        productName: 'Samsung Galaxy S24',
        revenue: 1890000,
        costs: 1500000,
        profit: 390000,
        profitMargin: 20.6,
        isLossMaking: false,
        turnoverRate: 1.8,
        status: 'profitable'
      }
    ];
  };

  const calculateFinancialMetrics = (analyticsData: any[], profitabilityData: ProfitabilityAnalysis[]): FinancialMetrics => {
    const totalRevenue = analyticsData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalCosts = profitabilityData.reduce((sum, item) => sum + item.costs, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const planCompletion = 85.2; // Моковое значение

    return {
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
      planCompletion
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight size={16} className="text-green-600" />;
      case 'down':
        return <ArrowDownRight size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'threat':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'trend':
        return <Activity size={20} className="text-blue-600" />;
      case 'recommendation':
        return <Lightbulb size={20} className="text-yellow-600" />;
      default:
        return <Brain size={20} className="text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'threat':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'trend':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'recommendation':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('analytics.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <QuickExportButton dataType="analytics" />
          <SyncButton
            onClick={handleSyncData}
            isLoading={syncing}
            variant="primary"
          >
            {syncing ? 'Синхронизация...' : 'Синхронизировать'}
          </SyncButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
        <div className="flex">
          {[
            { id: 'basic', label: 'Базовая аналитика', icon: BarChart3 },
            { id: 'advanced', label: 'Продвинутая аналитика', icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'basic' ? (
          <div className="space-y-6">
            {/* Date Range */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Период:</span>
              </div>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              <span className="text-slate-500">—</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Financial Metrics */}
            {financialMetrics.netProfit > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Расходы</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {financialMetrics.totalCosts.toLocaleString('ru-RU')} ₽
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
              </div>
            )}

            {/* Basic Analytics Cards */}
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
                  <p className="text-sm text-slate-600 dark:text-slate-400">Количество заказов</p>
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <ShoppingCart size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {totalOrders.toLocaleString('ru-RU')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">За выбранный период</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Средний чек</p>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <Package size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {totalOrders > 0 ? (totalSales / totalOrders).toLocaleString('ru-RU') : 0} ₽
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">За выбранный период</p>
              </div>
            </div>

            {/* Profitability Analysis */}
            {profitabilityData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Анализ прибыльности товаров</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Товар</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Выручка</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Расходы</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Прибыль</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Маржа</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitabilityData.map((item) => (
                        <tr key={item.productId} className="border-b border-slate-100 dark:border-slate-700/50">
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{item.productName}</td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                            {item.revenue.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                            {item.costs.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${
                            item.profit > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.profit.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${
                            item.profitMargin > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.profitMargin.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'profitable' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              item.status === 'loss' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              item.status === 'low_turnover' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {item.status === 'profitable' ? 'Прибыльный' :
                               item.status === 'loss' ? 'Убыточный' :
                               item.status === 'low_turnover' ? 'Низкий оборот' : 'Заморожен'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'advanced' ? (
          <div className="space-y-6">
            {analyticsData && (
              <>
                {/* Advanced Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(analyticsData.revenue.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(analyticsData.revenue.trend)}`}>
                          +{analyticsData.revenue.growth}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {analyticsData.revenue.total.toLocaleString('ru-RU')} ₽
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Выручка за месяц
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ShoppingCart size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(analyticsData.sales.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(analyticsData.sales.trend)}`}>
                          +{analyticsData.sales.growth}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {analyticsData.sales.total.toLocaleString('ru-RU')}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Продажи за месяц
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Users size={24} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(analyticsData.customers.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(analyticsData.customers.trend)}`}>
                          +{analyticsData.customers.growth}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {analyticsData.customers.total.toLocaleString('ru-RU')}
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Клиенты за месяц
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {analyticsData.products.active}/{analyticsData.products.total}
                    </h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Активные товары
                    </p>
                  </div>
                </div>

                {/* Top Performing Products */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Топ товары по продажам</h2>
                  <div className="space-y-4">
                    {analyticsData.products.topPerforming.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800 dark:text-white">{product.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{product.sales} продаж</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {product.revenue.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">выручка</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketplace Performance */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Производительность по маркетплейсам</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(analyticsData.marketplaces).map(([marketplace, data]) => (
                      <div key={marketplace} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2 capitalize">
                          {marketplace === 'wildberries' ? 'Wildberries' :
                           marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Выручка:</span>
                            <span className="font-medium text-slate-800 dark:text-white">
                              {data.revenue.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Продажи:</span>
                            <span className="font-medium text-slate-800 dark:text-white">{data.sales}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Рост:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">+{data.growth}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">ИИ-Инсайты</h2>
                  <div className="space-y-4">
                    {analyticsData.insights.map((insight) => (
                      <div key={insight.id} className={`rounded-xl p-6 border ${getInsightColor(insight.type)}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{insight.title}</h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                                {insight.impact === 'high' ? 'Высокий' : 
                                 insight.impact === 'medium' ? 'Средний' : 'Низкий'} приоритет
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">
                                Уверенность: {Math.round(insight.confidence * 100)}%
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">Ошибка загрузки данных</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}