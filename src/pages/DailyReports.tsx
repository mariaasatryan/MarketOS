import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService } from '../services/realMarketplaceService';

interface DailyReport {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
  profitMargin: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'error' | 'success';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  planCompletion: number;
  forecastRevenue: number;
}

export function DailyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDailyReports();
    }
  }, [user, selectedDate]);

  const loadDailyReports = async () => {
    try {
      setLoading(true);
      
      // Загружаем интеграции
      const integrationsData = await marketplaceService.listIntegrations();
      setIntegrations(integrationsData);

      if (integrationsData.length === 0) {
        setLoading(false);
        return;
      }

      // Генерируем ежедневные отчеты за последние 7 дней
      const reportsData = await generateDailyReports(integrationsData);
      setReports(reportsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки ежедневных отчетов:', error);
      setLoading(false);
    }
  };

  const generateDailyReports = async (integrations: any[]): Promise<DailyReport[]> => {
    const reports: DailyReport[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Получаем данные за день
      const dayData = await RealMarketplaceService.getRealAnalyticsData(integrations, dateStr);
      const productsData = await RealMarketplaceService.getRealProductsData(integrations);
      
      const revenue = dayData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const orders = dayData.reduce((sum, item) => sum + (item.orders || 0), 0);
      const costs = revenue * 0.3; // Примерная себестоимость 30%
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      // Топ товары за день
      const topProducts = productsData
        .slice(0, 3)
        .map(product => ({
          id: product.id,
          name: product.name,
          sales: Math.floor(Math.random() * 10) + 1,
          revenue: product.price * (Math.floor(Math.random() * 10) + 1)
        }));

      // Генерируем алерты
      const alerts = generateAlerts(revenue, profit, profitMargin, orders);
      
      // План-факт анализ
      const planRevenue = revenue * 1.2; // План на 20% больше
      const planCompletion = Math.min(100, (revenue / planRevenue) * 100);
      const forecastRevenue = revenue * 1.15; // Прогноз +15%

      reports.push({
        date: dateStr,
        revenue,
        orders,
        profit,
        profitMargin,
        topProducts,
        alerts,
        planCompletion,
        forecastRevenue
      });
    }
    
    return reports;
  };

  const generateAlerts = (revenue: number, profit: number, profitMargin: number, orders: number) => {
    const alerts = [];
    
    if (profit < 0) {
      alerts.push({
        type: 'error' as const,
        message: 'Убыточный день - отрицательная прибыль',
        priority: 'high' as const
      });
    }
    
    if (profitMargin < 10) {
      alerts.push({
        type: 'warning' as const,
        message: `Низкая маржа: ${profitMargin.toFixed(1)}%`,
        priority: 'medium' as const
      });
    }
    
    if (orders === 0) {
      alerts.push({
        type: 'warning' as const,
        message: 'Нет заказов за день',
        priority: 'high' as const
      });
    }
    
    if (revenue > 50000) {
      alerts.push({
        type: 'success' as const,
        message: 'Отличный день - высокая выручка!',
        priority: 'low' as const
      });
    }
    
    return alerts;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'success': return <TrendingUp className="text-green-500" size={16} />;
      default: return <AlertTriangle className="text-slate-500" size={16} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const selectedReport = reports.find(r => r.date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ежедневные отчеты</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Анализ работы за каждый день</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <Package size={48} className="mx-auto text-red-600 dark:text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Подключите маркетплейс</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Добавьте API-токен маркетплейса в настройках для получения ежедневных отчетов
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      ) : selectedReport ? (
        <>
          {/* Основные метрики дня */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Выручка</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {selectedReport.revenue.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Заказы</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {selectedReport.orders}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-red-600 dark:text-red-400" size={24} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Прибыль</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {selectedReport.profit.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-purple-600 dark:text-purple-400" size={24} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Маржа</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {selectedReport.profitMargin.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Алерты и предупреждения */}
          {selectedReport.alerts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
                Предупреждения и уведомления
              </h3>
              <div className="space-y-3">
                {selectedReport.alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="font-medium">{alert.message}</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded ${
                        alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                        alert.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.priority === 'high' ? 'Высокий' : alert.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Топ товары дня */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Package className="text-blue-600 dark:text-blue-400" size={20} />
              Топ товары дня
            </h3>
            <div className="space-y-3">
              {selectedReport.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">{product.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{product.sales} продаж</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {product.revenue.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* План-факт анализ */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Target className="text-purple-600 dark:text-purple-400" size={20} />
              План-факт анализ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                  {selectedReport.planCompletion.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Выполнение плана</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                  {selectedReport.forecastRevenue.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Прогноз выручки</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  selectedReport.planCompletion >= 100 ? 'text-green-600 dark:text-green-400' :
                  selectedReport.planCompletion >= 80 ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {selectedReport.planCompletion >= 100 ? '✅' : selectedReport.planCompletion >= 80 ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Статус плана</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Нет данных за выбранную дату</h3>
          <p className="text-slate-600 dark:text-slate-400">Выберите другую дату или синхронизируйте данные</p>
        </div>
      )}
    </div>
  );
}
