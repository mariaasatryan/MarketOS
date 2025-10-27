import { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, BarChart3, PieChart } from 'lucide-react';

interface PlanFactData {
  id: string;
  period: string;
  marketplace: string;
  metric: string;
  planned: number;
  actual: number;
  deviation: number;
  deviationPercent: number;
  status: 'achieved' | 'exceeded' | 'not_achieved';
}

interface PlanFactReport {
  id: string;
  date: string;
  marketplace: string;
  totalPlanned: number;
  totalActual: number;
  totalDeviation: number;
  metrics: PlanFactData[];
  summary: {
    achieved: number;
    exceeded: number;
    notAchieved: number;
    totalMetrics: number;
  };
}

export default function PlanFactAnalysis() {
  const [reports, setReports] = useState<PlanFactReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');

  const loadReports = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: PlanFactReport[] = [
        {
          id: '1',
          date: '2024-01-15',
          marketplace: 'wildberries',
          totalPlanned: 500000,
          totalActual: 520000,
          totalDeviation: 20000,
          metrics: [
            {
              id: '1',
              period: '2024-01-15',
              marketplace: 'wildberries',
              metric: 'Выручка',
              planned: 500000,
              actual: 520000,
              deviation: 20000,
              deviationPercent: 4,
              status: 'exceeded'
            },
            {
              id: '2',
              period: '2024-01-15',
              marketplace: 'wildberries',
              metric: 'Заказы',
              planned: 200,
              actual: 195,
              deviation: -5,
              deviationPercent: -2.5,
              status: 'not_achieved'
            },
            {
              id: '3',
              period: '2024-01-15',
              marketplace: 'wildberries',
              metric: 'Конверсия',
              planned: 3.0,
              actual: 3.2,
              deviation: 0.2,
              deviationPercent: 6.7,
              status: 'exceeded'
            },
            {
              id: '4',
              period: '2024-01-15',
              marketplace: 'wildberries',
              metric: 'Средний чек',
              planned: 2500,
              actual: 2667,
              deviation: 167,
              deviationPercent: 6.7,
              status: 'exceeded'
            }
          ],
          summary: {
            achieved: 0,
            exceeded: 3,
            notAchieved: 1,
            totalMetrics: 4
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

  useEffect(() => {
    loadReports();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'exceeded':
        return <TrendingUp size={20} className="text-blue-600" />;
      case 'not_achieved':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertTriangle size={20} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'exceeded':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'not_achieved':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'Достигнуто';
      case 'exceeded':
        return 'Превышено';
      case 'not_achieved':
        return 'Не достигнуто';
      default:
        return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentReport = reports[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">План-факт анализ</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Сравнение плановых и фактических показателей</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </select>
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Все маркетплейсы</option>
            <option value="wildberries">Wildberries</option>
            <option value="ozon">Ozon</option>
            <option value="ym">Яндекс.Маркет</option>
          </select>
        </div>
      </div>

      {currentReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Target size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">План</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.totalPlanned.toLocaleString('ru-RU')} ₽
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Факт</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.totalActual.toLocaleString('ru-RU')} ₽
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Отклонение</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {currentReport.totalDeviation > 0 ? '+' : ''}{currentReport.totalDeviation.toLocaleString('ru-RU')} ₽
              </h3>
              <p className={`text-sm mt-1 ${currentReport.totalDeviation > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {currentReport.totalDeviation > 0 ? '+' : ''}{((currentReport.totalDeviation / currentReport.totalPlanned) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Выполнение</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {((currentReport.summary.achieved + currentReport.summary.exceeded) / currentReport.summary.totalMetrics * 100).toFixed(0)}%
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {currentReport.summary.achieved + currentReport.summary.exceeded} из {currentReport.summary.totalMetrics}
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Обзор выполнения</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">Достигнуто</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{currentReport.summary.achieved} метрик</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">Превышено</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{currentReport.summary.exceeded} метрик</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle size={24} className="text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">Не достигнуто</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{currentReport.summary.notAchieved} метрик</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Детализация по метрикам</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Метрика</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">План</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Факт</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Отклонение</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.metrics.map((metric) => (
                    <tr key={metric.id} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{metric.metric}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        {typeof metric.planned === 'number' && metric.planned > 1000 
                          ? metric.planned.toLocaleString('ru-RU') 
                          : metric.planned}
                        {metric.metric === 'Выручка' ? ' ₽' : metric.metric === 'Конверсия' ? '%' : ''}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                        {typeof metric.actual === 'number' && metric.actual > 1000 
                          ? metric.actual.toLocaleString('ru-RU') 
                          : metric.actual}
                        {metric.metric === 'Выручка' ? ' ₽' : metric.metric === 'Конверсия' ? '%' : ''}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${metric.deviation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {metric.deviation >= 0 ? '+' : ''}{typeof metric.deviation === 'number' && metric.deviation > 1000 
                            ? metric.deviation.toLocaleString('ru-RU') 
                            : metric.deviation}
                          {metric.metric === 'Выручка' ? ' ₽' : metric.metric === 'Конверсия' ? '%' : ''}
                        </span>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {metric.deviationPercent >= 0 ? '+' : ''}{metric.deviationPercent.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metric.status)}`}>
                          {getStatusIcon(metric.status)}
                          {getStatusText(metric.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Рекомендации</h3>
            <div className="space-y-3">
              {currentReport.summary.notAchieved > 0 && (
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Требуется внимание</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {currentReport.summary.notAchieved} метрик не достигнуты. Рекомендуется пересмотреть стратегию.
                    </p>
                  </div>
                </div>
              )}
              {currentReport.summary.exceeded > 0 && (
                <div className="flex items-start gap-3">
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Отличные результаты</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {currentReport.summary.exceeded} метрик превышены. Можно увеличить планы на следующий период.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
