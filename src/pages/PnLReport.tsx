import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarketplaceColors, getSyncButtonColors } from '../utils/marketplaceColors';
import MarketplaceBadge from '../components/MarketplaceBadge';
import SyncButton from '../components/SyncButton';

interface PnLData {
  group: string;
  data: {
    revenue: number;
    cogs: number;
    fees: number;
    storage: number;
    logistics: number;
    advertising: number;
    refunds: number;
    profit: number;
    margin: number;
  };
}

const PnLReport: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [groupBy, setGroupBy] = useState<'sku' | 'category' | 'marketplace'>('sku');
  const [marketplace, setMarketplace] = useState<string>('');

  const { data: pnlData, isLoading, error } = useQuery({
    queryKey: ['pnl', dateRange, groupBy, marketplace],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
        groupBy
      });
      if (marketplace) params.append('marketplace', marketplace);

      const response = await fetch(`/api/analytics/pnl?${params}`, {
        headers: {
          'x-user-id': 'demo-user-id'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch P&L data');
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

  const exportToCSV = () => {
    if (!pnlData) return;

    const headers = [
      'Группа',
      'Выручка',
      'Себестоимость',
      'Комиссии',
      'Складские расходы',
      'Логистика',
      'Реклама',
      'Возвраты',
      'Прибыль',
      'Маржа (%)'
    ];

    const rows = pnlData.map((item: PnLData) => [
      item.group,
      item.data.revenue,
      item.data.cogs,
      item.data.fees,
      item.data.storage,
      item.data.logistics,
      item.data.advertising,
      item.data.refunds,
      item.data.profit,
      (item.data.margin * 100).toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pnl_report_${dateRange.from}_${dateRange.to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">P&L Отчет</h1>
        <div className="flex space-x-4">
          <SyncButton onClick={() => window.location.reload()}>
            Синхронизировать
          </SyncButton>
          <button
            onClick={exportToCSV}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Экспорт в CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата с
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
              Дата по
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Группировка
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'sku' | 'category' | 'marketplace')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sku">По SKU</option>
              <option value="category">По категории</option>
              <option value="marketplace">По маркетплейсу</option>
            </select>
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
        </div>
      </div>

      {/* P&L Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">P&L Отчет</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {groupBy === 'sku' ? 'SKU' : groupBy === 'category' ? 'Категория' : 'Маркетплейс'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Выручка
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Себестоимость
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Комиссии
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Склад
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Логистика
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Реклама
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Возвраты
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Прибыль
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Маржа
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pnlData?.map((item: PnLData, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.group}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.cogs)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.fees)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.storage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.logistics)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.advertising)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.data.refunds)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    item.data.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(item.data.profit)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    item.data.margin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(item.data.margin * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {pnlData && pnlData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Сводка</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(pnlData.reduce((sum, item) => sum + item.data.revenue, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Общая прибыль</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(pnlData.reduce((sum, item) => sum + item.data.profit, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Средняя маржа</p>
              <p className="text-2xl font-bold text-gray-900">
                {(
                  pnlData.reduce((sum, item) => sum + item.data.margin, 0) / pnlData.length * 100
                ).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PnLReport;
