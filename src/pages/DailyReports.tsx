import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, Download, RefreshCw, BarChart3, PieChart, Target } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';

interface DailyReport {
  id: string;
  date: string;
  marketplace: string;
  orders: number;
  revenue: number;
  profit: number;
  conversion: number;
  avgOrderValue: number;
  stock: number;
  lowStockItems: number;
  newProducts: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  metrics: {
    views: number;
    clicks: number;
    ctr: number;
    cpc: number;
  };
}

export function DailyReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Имитация загрузки отчётов
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: DailyReport[] = [
        {
          id: '1',
          date: '2024-01-15',
          marketplace: 'wildberries',
          orders: 45,
          revenue: 125000,
          profit: 25000,
          conversion: 3.2,
          avgOrderValue: 2778,
          stock: 1200,
          lowStockItems: 8,
          newProducts: 3,
          topProducts: [
            { name: 'Товар A', sales: 15, revenue: 45000 },
            { name: 'Товар B', sales: 12, revenue: 36000 },
            { name: 'Товар C', sales: 8, revenue: 24000 }
          ],
          metrics: {
            views: 15000,
            clicks: 480,
            ctr: 3.2,
            cpc: 12.5
          }
        },
        {
          id: '2',
          date: '2024-01-14',
          marketplace: 'ozon',
          orders: 32,
          revenue: 89000,
          profit: 17800,
          conversion: 2.8,
          avgOrderValue: 2781,
          stock: 950,
          lowStockItems: 5,
          newProducts: 2,
          topProducts: [
            { name: 'Товар D', sales: 10, revenue: 30000 },
            { name: 'Товар E', sales: 8, revenue: 24000 },
            { name: 'Товар F', sales: 6, revenue: 18000 }
          ],
          metrics: {
            views: 12000,
            clicks: 336,
            ctr: 2.8,
            cpc: 15.2
          }
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Ошибка загрузки отчётов:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Имитация генерации отчёта
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadReports();
    } catch (error) {
      console.error('Ошибка генерации отчёта:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const exportReport = (report: DailyReport) => {
    const data = {
      date: report.date,
      marketplace: report.marketplace,
      orders: report.orders,
      revenue: report.revenue,
      profit: report.profit,
      conversion: report.conversion,
      avgOrderValue: report.avgOrderValue,
      stock: report.stock,
      lowStockItems: report.lowStockItems,
      newProducts: report.newProducts,
      topProducts: report.topProducts,
      metrics: report.metrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${report.date}-${report.marketplace}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const dateMatch = report.date === selectedDate;
    const marketplaceMatch = selectedMarketplace === 'all' || report.marketplace === selectedMarketplace;
    return dateMatch && marketplaceMatch;
  });

  const currentReport = filteredReports[0];

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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ежедневные отчёты</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Анализ продаж и метрик по дням</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            disabled={isGeneratingReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGeneratingReport ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Генерирую...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Обновить
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Дата</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Маркетплейс</label>
            <select
              value={selectedMarketplace}
              onChange={(e) => setSelectedMarketplace(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Все</option>
              <option value="wildberries">Wildberries</option>
              <option value="ozon">Ozon</option>
              <option value="ym">Яндекс.Маркет</option>
            </select>
          </div>
        </div>
      </div>

      {currentReport ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Выручка</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.revenue.toLocaleString('ru-RU')} ₽
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +12% к вчера
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Заказы</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.orders}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                +8% к вчера
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Конверсия</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.conversion}%
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                +0.3% к вчера
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Target size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Средний чек</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.avgOrderValue.toLocaleString('ru-RU')} ₽
              </h3>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                +5% к вчера
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Топ товары</h3>
                <BarChart3 size={20} className="text-slate-600 dark:text-slate-400" />
              </div>
              <div className="space-y-3">
                {currentReport.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{product.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{product.sales} продаж</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {product.revenue.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Метрики</h3>
                <PieChart size={20} className="text-slate-600 dark:text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Просмотры</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {currentReport.metrics.views.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Клики</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {currentReport.metrics.clicks.toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">CTR</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {currentReport.metrics.ctr}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">CPC</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {currentReport.metrics.cpc} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Alert */}
          {currentReport.lowStockItems > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Внимание: мало товаров на складе</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {currentReport.lowStockItems} товаров требуют пополнения
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={() => exportReport(currentReport)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Экспортировать отчёт
            </button>
          </div>
        </>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center">
          <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Нет данных за выбранную дату</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Выберите другую дату или сгенерируйте новый отчёт
          </p>
        </div>
      )}
    </div>
  );
}