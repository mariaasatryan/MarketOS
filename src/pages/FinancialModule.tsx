import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, 
  Calculator, Target, AlertCircle, CheckCircle, XCircle, 
  Calendar, Download, Upload, RefreshCw, Search, Filter,
  Activity, Zap, Brain, Lightbulb, Settings, Bell,
  CreditCard, Wallet, Banknote, Coins, Receipt, FileText
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense' | 'refund' | 'commission';
  amount: number;
  description: string;
  marketplace: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  totalTransactions: number;
  averageTransactionValue: number;
  monthlyGrowth: number;
  quarterlyGrowth: number;
  yearlyGrowth: number;
}

interface FinancialForecast {
  period: string;
  predictedRevenue: number;
  predictedExpenses: number;
  predictedProfit: number;
  confidence: number;
  factors: string[];
}

interface FinancialAlert {
  id: string;
  type: 'low_profit' | 'high_expenses' | 'unusual_transaction' | 'budget_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  amount?: number;
  threshold?: number;
  createdAt: string;
  resolved: boolean;
}

export default function FinancialModule() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadFinancialData();
    loadForecasts();
    loadAlerts();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransactions: FinancialTransaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 450000,
          description: 'Продажа Samsung Galaxy S24',
          marketplace: 'wildberries',
          category: 'Электроника',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          reference: 'WB-123456789'
        },
        {
          id: '2',
          type: 'expense',
          amount: 300000,
          description: 'Закупка Samsung Galaxy S24',
          marketplace: 'wildberries',
          category: 'Закупка',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          reference: 'WB-123456789'
        },
        {
          id: '3',
          type: 'commission',
          amount: 45000,
          description: 'Комиссия Wildberries',
          marketplace: 'wildberries',
          category: 'Комиссии',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          reference: 'WB-123456789'
        },
        {
          id: '4',
          type: 'income',
          amount: 180000,
          description: 'Продажа Apple AirPods Pro',
          marketplace: 'ozon',
          category: 'Аудио',
          date: '2024-01-15T09:15:00Z',
          status: 'completed',
          reference: 'OZ-987654321'
        },
        {
          id: '5',
          type: 'expense',
          amount: 120000,
          description: 'Закупка Apple AirPods Pro',
          marketplace: 'ozon',
          category: 'Закупка',
          date: '2024-01-15T09:15:00Z',
          status: 'completed',
          reference: 'OZ-987654321'
        },
        {
          id: '6',
          type: 'commission',
          amount: 18000,
          description: 'Комиссия Ozon',
          marketplace: 'ozon',
          category: 'Комиссии',
          date: '2024-01-15T09:15:00Z',
          status: 'completed',
          reference: 'OZ-987654321'
        },
        {
          id: '7',
          type: 'income',
          amount: 120000,
          description: 'Продажа iPad Air',
          marketplace: 'ym',
          category: 'Планшеты',
          date: '2024-01-14T16:45:00Z',
          status: 'completed',
          reference: 'YM-456789123'
        },
        {
          id: '8',
          type: 'expense',
          amount: 80000,
          description: 'Закупка iPad Air',
          marketplace: 'ym',
          category: 'Закупка',
          date: '2024-01-14T16:45:00Z',
          status: 'completed',
          reference: 'YM-456789123'
        },
        {
          id: '9',
          type: 'commission',
          amount: 12000,
          description: 'Комиссия Яндекс.Маркет',
          marketplace: 'ym',
          category: 'Комиссии',
          date: '2024-01-14T16:45:00Z',
          status: 'completed',
          reference: 'YM-456789123'
        }
      ];
      
      setTransactions(mockTransactions);
      
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 750000,
        totalExpenses: 500000,
        netProfit: 250000,
        grossMargin: 33.3,
        netMargin: 33.3,
        totalTransactions: 9,
        averageTransactionValue: 83333,
        monthlyGrowth: 15.2,
        quarterlyGrowth: 8.7,
        yearlyGrowth: 25.4
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadForecasts = async () => {
    const mockForecasts: FinancialForecast[] = [
      {
        period: 'Следующий месяц',
        predictedRevenue: 900000,
        predictedExpenses: 600000,
        predictedProfit: 300000,
        confidence: 0.85,
        factors: ['Сезонный рост продаж', 'Новые товары', 'Увеличение рекламы']
      },
      {
        period: 'Следующий квартал',
        predictedRevenue: 2800000,
        predictedExpenses: 1900000,
        predictedProfit: 900000,
        confidence: 0.78,
        factors: ['Расширение ассортимента', 'Новые маркетплейсы', 'Оптимизация цен']
      },
      {
        period: 'Следующий год',
        predictedRevenue: 12000000,
        predictedExpenses: 8000000,
        predictedProfit: 4000000,
        confidence: 0.65,
        factors: ['Масштабирование бизнеса', 'Автоматизация процессов', 'Новые рынки']
      }
    ];
    setForecasts(mockForecasts);
  };

  const loadAlerts = async () => {
    const mockAlerts: FinancialAlert[] = [
      {
        id: '1',
        type: 'high_expenses',
        severity: 'medium',
        title: 'Высокие расходы на комиссии',
        description: 'Комиссии маркетплейсов составляют 10% от выручки, что выше среднего показателя 8%',
        amount: 75000,
        threshold: 60000,
        createdAt: '2024-01-15T08:00:00Z',
        resolved: false
      },
      {
        id: '2',
        type: 'low_profit',
        severity: 'high',
        title: 'Низкая маржинальность',
        description: 'Чистая маржа составляет 33%, что ниже целевого показателя 40%',
        amount: 250000,
        threshold: 300000,
        createdAt: '2024-01-15T07:30:00Z',
        resolved: false
      },
      {
        id: '3',
        type: 'unusual_transaction',
        severity: 'low',
        title: 'Необычная транзакция',
        description: 'Обнаружена транзакция на сумму 450,000 ₽, что превышает средний размер в 2 раза',
        amount: 450000,
        createdAt: '2024-01-15T06:00:00Z',
        resolved: false
      }
    ];
    setAlerts(mockAlerts);
  };

  const updateFinancialData = async () => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadFinancialData();
      await loadForecasts();
      await loadAlerts();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'expense':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'refund':
        return <RefreshCw size={16} className="text-blue-600" />;
      case 'commission':
        return <CreditCard size={16} className="text-purple-600" />;
      default:
        return <DollarSign size={16} className="text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'commission':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesMarketplace = marketplaceFilter === 'all' || transaction.marketplace === marketplaceFilter;
    
    return matchesSearch && matchesType && matchesMarketplace;
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('financial.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('financial.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download size={16} />
            Экспорт
          </button>
          <button
            onClick={updateFinancialData}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Обновляю...
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

      {metrics && (
        <>
          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Выручка</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {metrics.totalRevenue.toLocaleString('ru-RU')} ₽
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +{metrics.monthlyGrowth}% к прошлому месяцу
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Расходы</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {metrics.totalExpenses.toLocaleString('ru-RU')} ₽
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}% от выручки
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Прибыль</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {metrics.netProfit.toLocaleString('ru-RU')} ₽
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Маржа: {metrics.netMargin}%
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Транзакции</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {metrics.totalTransactions}
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Средний чек: {metrics.averageTransactionValue.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Рост по периодам</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Месячный</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{metrics.monthlyGrowth}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Квартальный</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{metrics.quarterlyGrowth}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Годовой</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{metrics.yearlyGrowth}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Прогнозы</h3>
              <div className="space-y-3">
                {forecasts.map((forecast, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{forecast.period}</span>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {forecast.predictedProfit.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Уверенность: {Math.round(forecast.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Рекомендации</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  Оптимизировать расходы на комиссии
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  Увеличить средний чек
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  Диверсифицировать источники дохода
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Финансовые уведомления</h3>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm">
                  {alerts.filter(alert => !alert.resolved).length}
                </span>
              </div>
              <div className="space-y-3">
                {alerts.filter(alert => !alert.resolved).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                      {alert.severity === 'critical' ? <XCircle size={16} /> :
                       alert.severity === 'high' ? <AlertTriangle size={16} /> :
                       alert.severity === 'medium' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800 dark:text-white">{alert.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity === 'critical' ? 'Критично' :
                           alert.severity === 'high' ? 'Высокий' :
                           alert.severity === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{alert.description}</p>
                      {alert.amount && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Сумма: {alert.amount.toLocaleString('ru-RU')} ₽
                          {alert.threshold && (
                            <span> (порог: {alert.threshold.toLocaleString('ru-RU')} ₽)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Решить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Поиск</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по описанию или номеру..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Тип</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Все</option>
              <option value="income">Доходы</option>
              <option value="expense">Расходы</option>
              <option value="commission">Комиссии</option>
              <option value="refund">Возвраты</option>
            </select>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Период</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="7">7 дней</option>
              <option value="30">30 дней</option>
              <option value="90">90 дней</option>
              <option value="365">Год</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Транзакция</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Сумма</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Маркетплейс</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Категория</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Дата</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'income' || transaction.type === 'refund' ? '+' : '-'}
                      {transaction.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {transaction.marketplace === 'wildberries' ? 'Wildberries' : 
                     transaction.marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {transaction.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(transaction.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Завершено' :
                       transaction.status === 'pending' ? 'Ожидает' : 'Ошибка'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center">
          <Receipt size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Транзакции не найдены</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Попробуйте изменить фильтры поиска
          </p>
        </div>
      )}
    </div>
  );
}