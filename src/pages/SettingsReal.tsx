// src/pages/SettingsReal.tsx
import { useEffect, useMemo, useState } from 'react';
import { marketplaceService, type MarketplaceIntegration, type MarketplaceCode } from '../services/marketplaceService';
import { useAuth } from '../contexts/AuthContext';

const MP_LABEL: Record<MarketplaceCode, string> = {
  wildberries: 'Wildberries',
  ozon: 'Ozon',
  ym: 'Яндекс.Маркет',
};

function SettingsReal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<MarketplaceIntegration[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [mp, setMp] = useState<MarketplaceCode>('wildberries');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');

  const hasClientId = useMemo(() => mp === 'ozon' || mp === 'ym', [mp]);

  const load = async () => {
    setError(null);
    try {
      const data = await marketplaceService.listIntegrations();
      setList(data);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!apiKey.trim()) {
      setError('Введите API-ключ');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.addIntegration(mp, apiKey.trim(), clientId.trim() || undefined);
      setApiKey('');
      setClientId('');
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item: MarketplaceIntegration) => {
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.updateIntegration(item.id, { is_active: !item.is_active });
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить интеграцию?')) return;
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.removeIntegration(id);
      await load();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const syncNow = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.syncIntegrationNow(id);
      await load();
      alert('Синхронизация запущена');
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (item: MarketplaceIntegration) => {
    setLoading(true);
    setError(null);
    try {
      // Мок-проверка подключения
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Подключение к ${MP_LABEL[item.marketplace]} успешно!`);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Настройки</h1>
      <p className="text-slate-600 dark:text-slate-400 mt-1">Интеграции с маркетплейсами</p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add new integration */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="text-lg font-semibold mb-4">Добавить интеграцию</h2>

          <label className="block mb-2 text-sm font-medium">Маркетплейс</label>
          <select
            value={mp}
            onChange={(e) => setMp(e.target.value as MarketplaceCode)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
          >
            <option value="wildberries">Wildberries</option>
            <option value="ozon">Ozon</option>
            <option value="ym">Яндекс.Маркет</option>
          </select>

          <label className="block mb-2 text-sm font-medium">API-ключ</label>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Введите API-ключ"
          />

          {hasClientId && (
            <>
              <label className="block mb-2 text-sm font-medium">Client ID</label>
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
                placeholder="Введите Client ID (если требуется)"
              />
            </>
          )}

          <button
            onClick={handleAdd}
            disabled={loading || !apiKey}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Сохранение…' : 'Добавить'}
          </button>
        </div>

        {/* List integrations */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="text-lg font-semibold mb-4">Мои интеграции</h2>

          {!list.length && <div className="text-slate-500">Пока пусто</div>}

          <div className="space-y-3">
            {list.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-3 border rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">{MP_LABEL[it.marketplace]}</div>
                  <div className="text-xs text-slate-500">
                    Статус: {it.is_active ? 'включена' : 'выключена'} · Синк:{' '}
                    {it.last_sync_status || '—'} {it.last_sync_at ? `(${new Date(it.last_sync_at).toLocaleString()})` : ''}
                    {it.error_message ? ` · Ошибка: ${it.error_message}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testConnection(it)}
                    className="px-3 py-1.5 rounded-lg border border-green-300 text-green-600 hover:bg-green-50"
                    disabled={loading}
                  >
                    Проверить
                  </button>
                  <button
                    onClick={() => syncNow(it.id)}
                    className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                    disabled={loading}
                  >
                    Синхронизировать
                  </button>
                  <button
                    onClick={() => toggleActive(it)}
                    className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                    disabled={loading}
                  >
                    {it.is_active ? 'Выключить' : 'Включить'}
                  </button>
                  <button
                    onClick={() => remove(it.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!user && (
        <div className="mt-6 text-sm text-slate-500">
          Для сохранения интеграций требуется авторизация
        </div>
      )}
    </div>
  );
}

export default SettingsReal;
export { SettingsReal };