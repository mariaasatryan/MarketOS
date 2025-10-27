import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarketplaceColors, getSyncButtonColors } from '../utils/marketplaceColors';
import MarketplaceBadge from '../components/MarketplaceBadge';
import SyncButton from '../components/SyncButton';

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

const InventoryManagement: React.FC = () => {
  const [thresholdDays, setThresholdDays] = useState(30);
  const [marketplace, setMarketplace] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const { data: deadStockData, isLoading: deadStockLoading } = useQuery({
    queryKey: ['deadStock', thresholdDays, marketplace],
    queryFn: async () => {
      const params = new URLSearchParams({
        thresholdDays: thresholdDays.toString()
      });
      if (marketplace) params.append('marketplace', marketplace);

      const response = await fetch(`/api/analytics/inventory/dead-stock?${params}`, {
        headers: {
          'x-user-id': 'demo-user-id'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dead stock data');
      return response.json();
    }
  });

  const { data: hiddenLossData, isLoading: hiddenLossLoading } = useQuery({
    queryKey: ['hiddenLosses', dateRange, marketplace],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to
      });
      if (marketplace) params.append('marketplace', marketplace);

      const response = await fetch(`/api/analytics/inventory/hidden-losses?${params}`, {
        headers: {
          'x-user-id': 'demo-user-id'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch hidden loss data');
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

  const getDaysColor = (days: number) => {
    if (days > 90) return 'text-red-600 bg-red-100';
    if (days > 60) return 'text-orange-600 bg-orange-100';
    if (days > 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSellThroughColor = (sellThrough: number) => {
    if (sellThrough > 0.8) return 'text-green-600 bg-green-100';
    if (sellThrough > 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление остатками</h1>
        <SyncButton onClick={() => window.location.reload()}>
          Синхронизировать
        </SyncButton>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порог дней для заморозки
            </label>
            <input
              type="number"
              value={thresholdDays}
              onChange={(e) => setThresholdDays(parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Маркетплейс
            </label>
            <select
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option value="WB">Wildberries</option>
              <option value="Ozon">Ozon</option>
              <option value="YaMarket">Яндекс.Маркет</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата с (для скрытых потерь)
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата по (для скрытых потерь)
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Dead Stock */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Замороженные товары</h3>
          <p className="text-sm text-gray-600">
            Товары, которые не продаются более {thresholdDays} дней при наличии остатков
          </p>
        </div>
        <div className="p-6">
          {deadStockLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : deadStockData?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Остаток
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дней без продаж
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Оборачиваемость
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deadStockData.map((item: DeadStockData) => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.sku}</div>
                          <div className="text-sm text-gray-500">{item.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.stock} шт.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDaysColor(item.daysSinceLastSale)}`}>
                          {item.daysSinceLastSale} дней
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSellThroughColor(item.sellThrough)}`}>
                          {(item.sellThrough * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.isDeadStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Заморожен
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Активен
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Снизить цену
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Списать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Замороженных товаров не найдено</p>
          )}
        </div>
      </div>

      {/* Hidden Losses */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Скрытые потери</h3>
          <p className="text-sm text-gray-600">
            Товары с наибольшими скрытыми потерями (складские расходы, штрафы, логистика)
          </p>
        </div>
        <div className="p-6">
          {hiddenLossLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : hiddenLossData?.length > 0 ? (
            <div className="space-y-4">
              {hiddenLossData.map((item: HiddenLossData) => (
                <div key={item.productId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{item.sku} - {item.title}</h4>
                      <p className="text-sm text-gray-600">
                        Общие скрытые потери: {formatCurrency(item.totalHiddenLoss)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(item.totalHiddenLoss)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Влияние на прибыль: {(item.profitImpact * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Складские расходы</p>
                      <p className="text-lg font-semibold text-yellow-800">
                        {formatCurrency(item.hiddenLosses.storage)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Штрафы</p>
                      <p className="text-lg font-semibold text-red-800">
                        {formatCurrency(item.hiddenLosses.penalties)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Логистика</p>
                      <p className="text-lg font-semibold text-blue-800">
                        {formatCurrency(item.hiddenLosses.logistics)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Прочее</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatCurrency(item.hiddenLosses.other)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Скрытых потерь не обнаружено</p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Замороженных товаров</p>
              <p className="text-2xl font-semibold text-gray-900">
                {deadStockData?.filter(item => item.isDeadStock).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общие скрытые потери</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(hiddenLossData?.reduce((sum, item) => sum + item.totalHiddenLoss, 0) || 0)}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Среднее влияние на прибыль</p>
              <p className="text-2xl font-semibold text-gray-900">
                {hiddenLossData?.length > 0 
                  ? (hiddenLossData.reduce((sum, item) => sum + item.profitImpact, 0) / hiddenLossData.length * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InventoryManagement };