import { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp, TrendingDown, AlertCircle, BarChart3, PieChart, Calculator } from 'lucide-react';

interface ProfitData {
  id: string;
  productName: string;
  sku: string;
  marketplace: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  stock: number;
  lowStock: boolean;
  sales: number;
  avgPrice: number;
  lastSale: string;
}

interface ProfitSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  totalProducts: number;
  profitableProducts: number;
  unprofitableProducts: number;
  lowStockProducts: number;
  topPerformers: Array<{
    name: string;
    profit: number;
    margin: number;
  }>;
  worstPerformers: Array<{
    name: string;
    profit: number;
    margin: number;
  }>;
}

export default function ProfitAnalysis() {
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadProfitData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: ProfitData[] = [
        {
          id: '1',
          productName: 'Смартфон Samsung Galaxy S24',
          sku: 'WB123456789',
          marketplace: 'wildberries',
          revenue: 450000,
          cost: 300000,
          profit: 150000,
          margin: 33.3,
          stock: 45,
          lowStock: false,
          sales: 150,
          avgPrice: 3000,
          lastSale: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          productName: 'Наушники Apple AirPods Pro',
          sku: 'OZ987654321',
          marketplace: 'ozon',
          revenue: 180000,
          cost: 120000,
          profit: 60000,
          margin: 33.3,
          stock: 8,
          lowStock: true,
          sales: 60,
          avgPrice: 3000,
          lastSale: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          productName: 'Планшет iPad Air',
          sku: 'YM456789123',
          marketplace: 'ym',
          revenue: 120000,
          cost: 100000,
          profit: 20000,
          margin: 16.7,
          stock: 12,
          lowStock: false,
          sales: 20,
          avgPrice: 6000,
          lastSale: '2024-01-14T16:45:00Z'
        },
        {
          id: '4',
          productName: 'Часы Apple Watch',
          sku: 'WB789123456',
          marketplace: 'wildberries',
          revenue: 80000,
          cost: 90000,
          profit: -10000,
          margin: -12.5,
          stock: 25,
          lowStock: false,
          sales: 10,
          avgPrice: 8000,
          lastSale: '2024-01-13T14:20:00Z'
        }
      ];
      
      const mockSummary: ProfitSummary = {
        totalRevenue: 830000,
        totalCost: 610000,
        totalProfit: 220000,
        averageMargin: 26.5,
        totalProducts: 4,
        profitableProducts: 3,
        unprofitableProducts: 1,
        lowStockProducts: 1,
        topPerformers: [
          { name: 'Смартфон Samsung Galaxy S24', profit: 150000, margin: 33.3 },
          { name: 'Наушники Apple AirPods Pro', profit: 60000, margin: 33.3 },
          { name: 'Планшет iPad Air', profit: 20000, margin: 16.7 }
        ],
        worstPerformers: [
          { name: 'Часы Apple Watch', profit: -10000, margin: -12.5 }
        ]
      };
      
      setProfitData(mockData);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfitData();
  }, []);

  const filteredData = profitData.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarketplace = marketplaceFilter === 'all' || item.marketplace === marketplaceFilter;
    
    return matchesSearch && matchesMarketplace;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: number;
    let bValue: number;
    
    switch (sortBy) {
      case 'profit':
        aValue = a.profit;
        bValue = b.profit;
        break;
      case 'margin':
        aValue = a.margin;
        bValue = b.margin;
        break;
      case 'revenue':
        aValue = a.revenue;
        bValue = b.revenue;
        break;
      case 'sales':
        aValue = a.sales;
        bValue = b.sales;
        break;
      default:
        aValue = a.profit;
        bValue = b.profit;
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Анализ прибыли и остатков</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Детальный анализ рентабельности товаров</p>
        </div>
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Общая прибыль</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.totalProfit.toLocaleString('ru-RU')} ₽
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {summary.averageMargin.toFixed(1)}% средняя маржа
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Прибыльные товары</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.profitableProducts}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {((summary.profitableProducts / summary.totalProducts) * 100).toFixed(0)}% от общего количества
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Убыточные товары</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.unprofitableProducts}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {((summary.unprofitableProducts / summary.totalProducts) * 100).toFixed(0)}% от общего количества
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Мало на складе</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.lowStockProducts}
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                Требуют пополнения
              </p>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Топ товары по прибыли</h3>
              <div className="space-y-3">
                {summary.topPerformers.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Маржа: {product.margin.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        +{product.profit.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Проблемные товары</h3>
              <div className="space-y-3">
                {summary.worstPerformers.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Маржа: {product.margin.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {product.profit.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Поиск</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по названию или SKU..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Маркетплейс</label>
            <select
              value={marketplaceFilter}
              onChange={(e) => setMarketplaceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Все</option>
              <option value="wildberries">Wildberries</option>
              <option value="ozon">Ozon</option>
              <option value="ym">Яндекс.Маркет</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="profit">По прибыли</option>
              <option value="margin">По марже</option>
              <option value="revenue">По выручке</option>
              <option value="sales">По продажам</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Порядок</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Товар</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Выручка</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Себестоимость</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Прибыль</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Маржа</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Остаток</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Продажи</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Статус</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{item.productName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.sku} • {item.marketplace === 'wildberries' ? 'Wildberries' : 
                            item.marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                    {item.revenue.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                    {item.cost.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${item.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.profit >= 0 ? '+' : ''}{item.profit.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${item.margin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.margin >= 0 ? '+' : ''}{item.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                    {item.stock}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                    {item.sales}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.lowStock && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Мало на складе"></div>
                      )}
                      {item.profit < 0 && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title="Убыточный"></div>
                      )}
                      {item.profit > 0 && !item.lowStock && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Прибыльный"></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedData.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center">
          <Calculator size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Товары не найдены</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Попробуйте изменить фильтры поиска
          </p>
        </div>
      )}
    </div>
  );
}
