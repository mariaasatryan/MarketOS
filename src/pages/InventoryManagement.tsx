import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, RotateCcw, Target, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService } from '../services/realMarketplaceService';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  turnoverRate: number;
  daysInStock: number;
  status: 'normal' | 'low_stock' | 'overstock' | 'frozen' | 'out_of_stock';
  revenue: number;
  cost: number;
  profit: number;
  lastSaleDate: string;
}

export function InventoryManagement() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'overstock' | 'frozen' | 'out_of_stock'>('all');

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      
      const integrationsData = await marketplaceService.listIntegrations();
      setIntegrations(integrationsData);

      if (integrationsData.length === 0) {
        setLoading(false);
        return;
      }

      const inventoryData = await generateInventoryAnalysis(integrationsData);
      setInventory(inventoryData);
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки остатков:', error);
      setLoading(false);
    }
  };

  const generateInventoryAnalysis = async (integrations: any[]): Promise<InventoryItem[]> => {
    const productsData = await RealMarketplaceService.getRealProductsData(integrations);
    
    return productsData.map(product => {
      const currentStock = product.stock || 0;
      const minStock = Math.max(5, Math.floor(currentStock * 0.2)); // Минимум 20% от текущего
      const maxStock = Math.floor(currentStock * 1.5); // Максимум 150% от текущего
      const turnoverRate = Math.random() * 0.5; // Случайная оборачиваемость 0-0.5
      const daysInStock = Math.floor(Math.random() * 90) + 1; // 1-90 дней
      const revenue = (product.price || 0) * Math.floor(Math.random() * 20); // Случайная выручка
      const cost = (product.price || 0) * 0.3; // Себестоимость 30%
      const profit = revenue - cost;
      const lastSaleDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let status: 'normal' | 'low_stock' | 'overstock' | 'frozen' | 'out_of_stock' = 'normal';
      
      if (currentStock === 0) {
        status = 'out_of_stock';
      } else if (currentStock < minStock) {
        status = 'low_stock';
      } else if (currentStock > maxStock) {
        status = 'overstock';
      } else if (turnoverRate < 0.05 && daysInStock > 30) {
        status = 'frozen';
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku || `SKU-${product.id.slice(-6)}`,
        currentStock,
        minStock,
        maxStock,
        turnoverRate,
        daysInStock,
        status,
        revenue,
        cost,
        profit,
        lastSaleDate
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'low_stock': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'overstock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'frozen': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out_of_stock': return <AlertTriangle className="text-red-600" size={16} />;
      case 'low_stock': return <TrendingDown className="text-orange-600" size={16} />;
      case 'overstock': return <TrendingUp className="text-yellow-600" size={16} />;
      case 'frozen': return <RotateCcw className="text-blue-600" size={16} />;
      default: return <Package className="text-green-600" size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'out_of_stock': return 'Нет в наличии';
      case 'low_stock': return 'Мало остатков';
      case 'overstock': return 'Переизбыток';
      case 'frozen': return 'Заморожен';
      default: return 'Норма';
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getInventoryStats = () => {
    const total = inventory.length;
    const outOfStock = inventory.filter(item => item.status === 'out_of_stock').length;
    const lowStock = inventory.filter(item => item.status === 'low_stock').length;
    const overstock = inventory.filter(item => item.status === 'overstock').length;
    const frozen = inventory.filter(item => item.status === 'frozen').length;
    const normal = inventory.filter(item => item.status === 'normal').length;

    return { total, outOfStock, lowStock, overstock, frozen, normal };
  };

  const stats = getInventoryStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Управление остатками</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Контроль и оптимизация складских остатков</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Все товары</option>
            <option value="out_of_stock">Нет в наличии</option>
            <option value="low_stock">Мало остатков</option>
            <option value="overstock">Переизбыток</option>
            <option value="frozen">Заморожены</option>
          </select>
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <Package size={48} className="mx-auto text-red-600 dark:text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Подключите маркетплейс</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Добавьте API-токен маркетплейса в настройках для управления остатками
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Статистика остатков */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Всего товаров</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.outOfStock}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Нет в наличии</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStock}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Мало остатков</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.overstock}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Переизбыток</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.frozen}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Заморожены</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.normal}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Норма</div>
            </div>
          </div>

          {/* Список товаров */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Товары ({filteredInventory.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredInventory.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Package className="text-slate-600 dark:text-slate-400" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{item.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">SKU: {item.sku}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">{item.currentStock}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Остаток</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          {item.turnoverRate.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Оборачиваемость</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">{item.daysInStock}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Дней на складе</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          {item.profit.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Прибыль</div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(item.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {getStatusLabel(item.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Дополнительная информация */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Минимум:</span>
                      <span className="ml-2 font-medium text-slate-800 dark:text-white">{item.minStock}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Максимум:</span>
                      <span className="ml-2 font-medium text-slate-800 dark:text-white">{item.maxStock}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Последняя продажа:</span>
                      <span className="ml-2 font-medium text-slate-800 dark:text-white">
                        {new Date(item.lastSaleDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Выручка:</span>
                      <span className="ml-2 font-medium text-slate-800 dark:text-white">
                        {item.revenue.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
