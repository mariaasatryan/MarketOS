import { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, 
  BarChart3, PieChart, Download, Upload, RefreshCw, Search, Filter, 
  Calendar, Target, DollarSign, ShoppingCart, Eye, Star, Users, 
  Activity, Zap, Brain, Lightbulb, Settings, Bell
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  marketplace: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  cost: number;
  price: number;
  margin: number;
  salesVelocity: number;
  turnoverRate: number;
  lastSale: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  forecast: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
  recommendations: string[];
}

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'slow_moving' | 'fast_moving' | 'price_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  itemId: string;
  itemName: string;
  createdAt: string;
  resolved: boolean;
}

interface InventoryAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockedItems: number;
  slowMovingItems: number;
  fastMovingItems: number;
  averageTurnover: number;
  totalSales: number;
  totalRevenue: number;
  averageMargin: number;
}

export default function EnhancedInventoryManagement() {
  const { t } = useI18n();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadInventoryData();
    loadAlerts();
    loadAnalytics();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: InventoryItem[] = [
        {
          id: '1',
          name: 'Смартфон Samsung Galaxy S24',
          sku: 'WB123456789',
          marketplace: 'wildberries',
          category: 'Электроника',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          reservedStock: 5,
          availableStock: 40,
          cost: 60000,
          price: 89990,
          margin: 33.3,
          salesVelocity: 15,
          turnoverRate: 2.1,
          lastSale: '2024-01-15T10:30:00Z',
          status: 'in_stock',
          forecast: {
            nextWeek: 30,
            nextMonth: 25,
            nextQuarter: 20
          },
          recommendations: [
            'Увеличить заказ на следующую неделю',
            'Рассмотреть снижение цены для ускорения продаж'
          ]
        },
        {
          id: '2',
          name: 'Наушники Apple AirPods Pro',
          sku: 'OZ987654321',
          marketplace: 'ozon',
          category: 'Аудио',
          currentStock: 8,
          minStock: 15,
          maxStock: 50,
          reservedStock: 2,
          availableStock: 6,
          cost: 15000,
          price: 24990,
          margin: 40.0,
          salesVelocity: 8,
          turnoverRate: 1.8,
          lastSale: '2024-01-15T09:15:00Z',
          status: 'low_stock',
          forecast: {
            nextWeek: 0,
            nextMonth: 0,
            nextQuarter: 0
          },
          recommendations: [
            'СРОЧНО: Пополнить склад',
            'Увеличить минимальный уровень запасов'
          ]
        },
        {
          id: '3',
          name: 'Планшет iPad Air',
          sku: 'YM456789123',
          marketplace: 'ym',
          category: 'Планшеты',
          currentStock: 0,
          minStock: 10,
          maxStock: 30,
          reservedStock: 0,
          availableStock: 0,
          cost: 40000,
          price: 59990,
          margin: 33.3,
          salesVelocity: 5,
          turnoverRate: 1.2,
          lastSale: '2024-01-14T16:45:00Z',
          status: 'out_of_stock',
          forecast: {
            nextWeek: 0,
            nextMonth: 0,
            nextQuarter: 0
          },
          recommendations: [
            'КРИТИЧНО: Немедленно заказать товар',
            'Рассмотреть альтернативных поставщиков'
          ]
        },
        {
          id: '4',
          name: 'Часы Apple Watch',
          sku: 'WB789123456',
          marketplace: 'wildberries',
          category: 'Аксессуары',
          currentStock: 120,
          minStock: 20,
          maxStock: 50,
          reservedStock: 10,
          availableStock: 110,
          cost: 25000,
          price: 39990,
          margin: 37.5,
          salesVelocity: 3,
          turnoverRate: 0.8,
          lastSale: '2024-01-13T14:20:00Z',
          status: 'overstocked',
          forecast: {
            nextWeek: 117,
            nextMonth: 105,
            nextQuarter: 90
          },
          recommendations: [
            'Снизить цену для ускорения продаж',
            'Рассмотреть возврат части товара поставщику'
          ]
        }
      ];
      
      setInventory(mockData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    const mockAlerts: InventoryAlert[] = [
      {
        id: '1',
        type: 'low_stock',
        severity: 'high',
        title: 'Критически низкий остаток',
        description: 'Наушники Apple AirPods Pro - осталось 8 штук при минимуме 15',
        itemId: '2',
        itemName: 'Наушники Apple AirPods Pro',
        createdAt: '2024-01-15T08:00:00Z',
        resolved: false
      },
      {
        id: '2',
        type: 'out_of_stock',
        severity: 'critical',
        title: 'Товар закончился',
        description: 'Планшет iPad Air полностью отсутствует на складе',
        itemId: '3',
        itemName: 'Планшет iPad Air',
        createdAt: '2024-01-15T07:30:00Z',
        resolved: false
      },
      {
        id: '3',
        type: 'overstock',
        severity: 'medium',
        title: 'Избыток товара',
        description: 'Часы Apple Watch - 120 штук при максимуме 50',
        itemId: '4',
        itemName: 'Часы Apple Watch',
        createdAt: '2024-01-15T06:00:00Z',
        resolved: false
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadAnalytics = async () => {
    const mockAnalytics: InventoryAnalytics = {
      totalItems: 4,
      totalValue: 15750000,
      lowStockItems: 1,
      outOfStockItems: 1,
      overstockedItems: 1,
      slowMovingItems: 1,
      fastMovingItems: 1,
      averageTurnover: 1.5,
      totalSales: 31,
      totalRevenue: 1240000,
      averageMargin: 36.0
    };
    setAnalytics(mockAnalytics);
  };

  const updateInventory = async () => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadInventoryData();
      await loadAlerts();
      await loadAnalytics();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'low_stock':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'out_of_stock':
        return <XCircle size={20} className="text-red-600" />;
      case 'overstocked':
        return <TrendingUp size={20} className="text-blue-600" />;
      default:
        return <Package size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'low_stock':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'out_of_stock':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'overstocked':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'В наличии';
      case 'low_stock':
        return 'Мало на складе';
      case 'out_of_stock':
        return 'Нет в наличии';
      case 'overstocked':
        return 'Избыток';
      default:
        return 'Неизвестно';
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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesMarketplace = marketplaceFilter === 'all' || item.marketplace === marketplaceFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesMarketplace && matchesCategory;
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('inventory.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={updateInventory}
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

      {analytics && (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Всего товаров</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {analytics.totalItems}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                На сумму {analytics.totalValue.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Проблемы</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {analytics.lowStockItems + analytics.outOfStockItems}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {analytics.lowStockItems} мало, {analytics.outOfStockItems} нет
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Продажи</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {analytics.totalSales}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                На {analytics.totalRevenue.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Оборачиваемость</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {analytics.averageTurnover.toFixed(1)}
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Средняя маржа {analytics.averageMargin}%
              </p>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Активные уведомления</h3>
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
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(alert.createdAt).toLocaleString('ru-RU')}
                      </div>
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
                placeholder="Поиск по названию или SKU..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Все</option>
              <option value="in_stock">В наличии</option>
              <option value="low_stock">Мало на складе</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="overstocked">Избыток</option>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Категория</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Все</option>
              <option value="Электроника">Электроника</option>
              <option value="Аудио">Аудио</option>
              <option value="Планшеты">Планшеты</option>
              <option value="Аксессуары">Аксессуары</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Товар</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Остаток</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Прогноз</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Продажи</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Оборачиваемость</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Статус</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.sku} • {item.marketplace === 'wildberries' ? 'Wildberries' : 
                            item.marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'} • {item.category}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{item.currentStock}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        мин: {item.minStock}, макс: {item.maxStock}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Неделя: {item.forecast.nextWeek}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Месяц: {item.forecast.nextMonth}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{item.salesVelocity}/день</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Последняя: {new Date(item.lastSale).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{item.turnoverRate}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Маржа: {item.margin}%
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {getStatusText(item.status)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors">
                        <Settings size={16} />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-700 transition-colors">
                        <TrendingUp size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center">
          <Package size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Товары не найдены</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Попробуйте изменить фильтры поиска
          </p>
        </div>
      )}
    </div>
  );
}