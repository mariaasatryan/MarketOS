import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import SyncButton from '../components/SyncButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


interface DeadStockData {
  productId: string;
  sku: string;
  title: string;
  stock: number;
  daysSinceLastSale: number;
  sellThrough: number;
  isDeadStock: boolean;
}

interface HiddenLossData {
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

interface AdsPerformanceData {
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

interface SEOData {
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

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  date: string;
  resolved: boolean;
  product?: {
    sku: string;
    title: string;
  };
  integration?: {
    marketplace: string;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Загрузка данных дашборда
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard?from=${dateRange.from}&to=${dateRange.to}`, {
        headers: {
          'x-user-id': 'demo-user-id' // В реальном приложении получать из контекста
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityEmoji = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '🔶';
      case 'LOW': return 'ℹ️';
      default: return '📢';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Ошибка загрузки данных: {error.message}
      </div>
    );
  }

  const { kpi, deadStock, hiddenLosses, ads, seo, alerts } = dashboardData || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Аналитический дашборд</h1>
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SyncButton onClick={() => window.location.reload()}>
            Синхронизировать
          </SyncButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выручка</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(kpi?.revenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Заказы</p>
              <p className="text-2xl font-semibold text-gray-900">{kpi?.orders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Прибыль</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(kpi?.profit || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ROAS</p>
              <p className="text-2xl font-semibold text-gray-900">{(kpi?.roas || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Динамика выручки</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            График динамики выручки (здесь будет Chart.js)
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROAS по товарам</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            График ROAS (здесь будет Chart.js)
          </div>
        </div>
      </div>

      {/* Dead Stock */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Замороженные товары</h3>
        </div>
        <div className="p-6">
          {deadStock?.length > 0 ? (
            <div className="space-y-4">
              {deadStock.map((item: DeadStockData) => (
                <div key={item.productId} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.sku} - {item.title}</p>
                    <p className="text-sm text-gray-600">
                      Остаток: {item.stock} шт. | Дней без продаж: {item.daysSinceLastSale}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Заморожен
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Замороженных товаров не найдено</p>
          )}
        </div>
      </div>

      {/* Hidden Losses */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Скрытые потери</h3>
        </div>
        <div className="p-6">
          {hiddenLosses?.length > 0 ? (
            <div className="space-y-4">
              {hiddenLosses.map((item: HiddenLossData) => (
                <div key={item.productId} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.sku} - {item.title}</p>
                    <p className="text-sm text-gray-600">
                      Склад: {formatCurrency(item.hiddenLosses.storage)} | 
                      Штрафы: {formatCurrency(item.hiddenLosses.penalties)} | 
                      Логистика: {formatCurrency(item.hiddenLosses.logistics)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(item.totalHiddenLoss)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Влияние: {(item.profitImpact * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Скрытых потерь не обнаружено</p>
          )}
        </div>
      </div>

      {/* Ads Performance */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Рекламная эффективность</h3>
        </div>
        <div className="p-6">
          {ads?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Расходы</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Выручка</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ads.map((item: AdsPerformanceData) => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.sku}</div>
                          <div className="text-sm text-gray-500">{item.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.roas.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.cpa)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.spend)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Данных по рекламе нет</p>
          )}
        </div>
      </div>

      {/* SEO Status */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SEO статус</h3>
        </div>
        <div className="p-6">
          {seo?.length > 0 ? (
            <div className="space-y-4">
              {seo.map((item: SEOData) => (
                <div key={item.productId} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.sku} - {item.title}</p>
                    <p className="text-sm text-gray-600">
                      Средняя позиция: {item.avgPosition} | Запросов: {item.totalQueries}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Конверсия: {(item.avgConversion * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      CTR: {(item.avgCtr * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">SEO данных нет</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
        </div>
        <div className="p-6">
          {alerts?.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: Alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getSeverityEmoji(alert.severity)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-500">
                      {alert.product?.sku && `${alert.product.sku} - `}
                      {alert.integration?.marketplace} | 
                      {new Date(alert.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Уведомлений нет</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
