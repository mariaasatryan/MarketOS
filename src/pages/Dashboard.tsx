import { useEffect, useState } from 'react';
import { Package, TrendingUp, ShoppingCart, DollarSign, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService, type RealKPIData } from '../services/realMarketplaceService';

type Stats = RealKPIData;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем интеграции
      const integrationsData = await marketplaceService.listIntegrations();
      setIntegrations(integrationsData);

      // Получаем реальные данные через API маркетплейсов
      const realStats = await RealMarketplaceService.getRealKPIData(integrationsData);
      setStats(realStats);

    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      // Имитируем синхронизацию данных
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Обновляем данные после синхронизации
      await loadData();
      
      // Обновляем статус интеграций
      const integrationsData = await marketplaceService.listIntegrations();
      setIntegrations(integrationsData);
      
    } catch (e: any) {
      setError(e.message || 'Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Ошибка загрузки данных</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Обзорная панель</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Основные метрики ваших маркетплейсов</p>
        </div>
        {integrations.length > 0 && (
          <button
            onClick={handleSyncData}
            disabled={syncing}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Синхронизация...' : 'Синхронизировать'}
          </button>
        )}
      </div>

      {integrations.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
          <Package size={48} className="mx-auto text-red-600 dark:text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Подключите маркетплейс</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Добавьте API-токен маркетплейса в настройках для синхронизации данных
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<Package size={24} />}
              title="Всего товаров"
              value={stats?.totalProducts || 0}
              color="blue"
            />
            <StatCard
              icon={<ShoppingCart size={24} />}
              title="Заказы"
              value={stats?.totalOrders || 0}
              color="green"
            />
            <StatCard
              icon={<DollarSign size={24} />}
              title="Выручка"
              value={`${(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽`}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              title="Средний чек"
              value={`${Math.round(stats?.avgOrderValue || 0).toLocaleString('ru-RU')} ₽`}
              color="orange"
            />
            <StatCard
              icon={<Package size={24} />}
              title="Остатки"
              value={stats?.totalStock || 0}
              color="cyan"
            />
            <StatCard
              icon={<AlertCircle size={24} />}
              title="Мало на складе"
              value={stats?.lowStock || 0}
              color="red"
            />
          </div>

          {/* Детализация по маркетплейсам */}
          {stats && stats.totalProducts > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Детализация по маркетплейсам</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.byMarketplace.wildberries.products > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Wildberries</h3>
                    <div className="space-y-1 text-sm">
                      <div>Товары: {stats.byMarketplace.wildberries.products}</div>
                      <div>Заказы: {stats.byMarketplace.wildberries.orders}</div>
                      <div>Выручка: {stats.byMarketplace.wildberries.revenue.toLocaleString('ru-RU')} ₽</div>
                      <div>Остатки: {stats.byMarketplace.wildberries.stock}</div>
                    </div>
                  </div>
                )}
                {stats.byMarketplace.ozon.products > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Ozon</h3>
                    <div className="space-y-1 text-sm">
                      <div>Товары: {stats.byMarketplace.ozon.products}</div>
                      <div>Заказы: {stats.byMarketplace.ozon.orders}</div>
                      <div>Выручка: {stats.byMarketplace.ozon.revenue.toLocaleString('ru-RU')} ₽</div>
                      <div>Остатки: {stats.byMarketplace.ozon.stock}</div>
                    </div>
                  </div>
                )}
                {stats.byMarketplace.ym.products > 0 && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Яндекс.Маркет</h3>
                    <div className="space-y-1 text-sm">
                      <div>Товары: {stats.byMarketplace.ym.products}</div>
                      <div>Заказы: {stats.byMarketplace.ym.orders}</div>
                      <div>Выручка: {stats.byMarketplace.ym.revenue.toLocaleString('ru-RU')} ₽</div>
                      <div>Остатки: {stats.byMarketplace.ym.stock}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Подключенные маркетплейсы</h2>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-red-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white">
                        {integration.marketplace === 'wildberries' ? 'Wildberries' :
                         integration.marketplace === 'ozon' ? 'Ozon' : 'Яндекс Маркет'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {integration.last_sync_at
                          ? `Синхронизировано: ${new Date(integration.last_sync_at).toLocaleString('ru-RU')}`
                          : 'Ожидает синхронизации'}
                      </p>
                    </div>
                  </div>
                  {integration.last_sync_status === 'success' ? (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">Активен</span>
                  ) : integration.last_sync_status === 'error' ? (
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">Ошибка</span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Не проверен</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-red-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}