import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Check, X, User, Key, Moon, Sun, LogOut, Globe, Edit3, Store } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService, type MarketplaceIntegration, type MarketplaceCode } from '../services/marketplaceService';
import { marketplacePreferencesService } from '../services/marketplacePreferencesService';
import { MarketplaceSelector } from '../components/MarketplaceSelector';
import { AutoSyncSettings } from '../components/AutoSyncSettings';
import { ThemeSettings } from '../components/ThemeSettings';
import { Marketplace } from '../types';

const mockEmployees = [
  { id: '1', name: 'Иван Петров', email: 'ivan@example.com', role: 'Менеджер', addedAt: '01.09.2024' },
];

const MP_LABEL: Record<MarketplaceCode, string> = {
  wildberries: 'Wildberries',
  ozon: 'Ozon',
  ym: 'Яндекс.Маркет',
};

interface SettingsProps {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

export function Settings({ isEditMode, setIsEditMode }: SettingsProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'integrations' | 'marketplaces' | 'team' | 'profile' | 'appearance' | 'sync'>('integrations');
  
  // Состояния для интеграций
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mp, setMp] = useState<MarketplaceCode>('wildberries');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');

  // Состояния для выбранных маркетплейсов
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);

  const hasClientId = useMemo(() => mp === 'ozon' || mp === 'ym', [mp]);

  // Загрузка выбранных маркетплейсов
  const loadSelectedMarketplaces = async () => {
    setMarketplaceLoading(true);
    try {
      const marketplaces = await marketplacePreferencesService.getUserPreferences();
      setSelectedMarketplaces(marketplaces);
    } catch (e: any) {
      console.error('Ошибка загрузки маркетплейсов:', e);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  // Сохранение выбранных маркетплейсов
  const saveSelectedMarketplaces = async (marketplaces: Marketplace[]) => {
    setMarketplaceLoading(true);
    try {
      await marketplacePreferencesService.saveUserPreferences(marketplaces);
      setSelectedMarketplaces(marketplaces);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setMarketplaceLoading(false);
    }
  };

  // Загрузка интеграций
  const loadIntegrations = async () => {
    setError(null);
    try {
      // Принудительно загружаем интеграции из Supabase
      await marketplaceService.refreshIntegrations();
      const data = await marketplaceService.listIntegrations();
      setIntegrations(data);
      console.log('📦 Интеграции загружены:', data);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  };

  useEffect(() => {
    if (activeTab === 'integrations') {
      loadIntegrations();
    } else if (activeTab === 'marketplaces') {
      loadSelectedMarketplaces();
    }
  }, [activeTab]);

  // Добавление интеграции
  const handleAddIntegration = async () => {
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
      setShowAddModal(false);
      await loadIntegrations();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  // Удаление интеграции
  const handleRemoveIntegration = async (id: string) => {
    if (!confirm('Удалить интеграцию?')) return;
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.removeIntegration(id);
      await loadIntegrations();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  // Проверка подключения
  const handleTestConnection = async (item: MarketplaceIntegration) => {
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

  // Переключение активности
  const handleToggleActive = async (item: MarketplaceIntegration) => {
    setLoading(true);
    setError(null);
    try {
      await marketplaceService.updateIntegration(item.id, { is_active: !item.is_active });
      await loadIntegrations();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('settings.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'integrations'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('settings.integrations')}
          {activeTab === 'integrations' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('marketplaces')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'marketplaces'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Store size={16} />
            Маркетплейсы
          </div>
          {activeTab === 'marketplaces' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'appearance'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('settings.appearance')}
          {activeTab === 'appearance' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'team'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Команда
          {activeTab === 'team' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'profile'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('settings.profile')}
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'sync'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe size={16} />
            Синхронизация
          </div>
          {activeTab === 'sync' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">{t('settings.appearance')}</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('settings.theme')}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <Sun size={24} className={theme === 'light' ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'} />
                    <div className="text-left">
                      <div className={`font-medium ${theme === 'light' ? 'text-blue-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {t('settings.light')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Светлый фон</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <Moon size={24} className={theme === 'dark' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'} />
                    <div className="text-left">
                      <div className={`font-medium ${theme === 'dark' ? 'text-blue-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {t('settings.dark')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Тёмный фон</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('settings.language')}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('ru')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                      language === 'ru'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <Globe size={24} className={language === 'ru' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'} />
                    <div className="text-left">
                      <div className={`font-medium ${language === 'ru' ? 'text-blue-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        Русский
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Russian</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                      language === 'en'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <Globe size={24} className={language === 'en' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'} />
                    <div className="text-left">
                      <div className={`font-medium ${language === 'en' ? 'text-blue-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        English
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Английский</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Редактирование навигации
                </label>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all ${
                    isEditMode
                      ? 'bg-red-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Edit3 size={20} />
                  <span>{isEditMode ? 'Режим редактирования активен' : 'Включить редактирование меню'}</span>
                </button>
                {isEditMode && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Теперь вы можете перетаскивать пункты меню в боковой панели
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <ThemeSettings />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{t('settings.connectedMarketplaces')}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Управление API-токенами для интеграции</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="tech-button px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              {t('settings.addMarketplace')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-500">
                Пока нет подключенных маркетплейсов
              </div>
            ) : (
              integrations.map((integration) => (
                <div key={integration.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{MP_LABEL[integration.marketplace]}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Подключено: {new Date(integration.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    {integration.is_active ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <Check size={12} />
                        Активно
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                        <X size={12} />
                        Неактивно
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <Key size={16} />
                    <span className="font-mono">{integration.api_token.substring(0, 12)}****</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTestConnection(integration)}
                      disabled={loading}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {t('settings.testConnection')}
                    </button>
                    <button 
                      onClick={() => handleToggleActive(integration)}
                      disabled={loading}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {integration.is_active ? 'Выключить' : 'Включить'}
                    </button>
                    <button 
                      onClick={() => handleRemoveIntegration(integration.id)}
                      disabled={loading}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Модальное окно добавления */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Добавить маркетплейс</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Маркетплейс
                    </label>
                    <select
                      value={mp}
                      onChange={(e) => setMp(e.target.value as MarketplaceCode)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="wildberries">Wildberries</option>
                      <option value="ozon">Ozon</option>
                      <option value="ym">Яндекс.Маркет</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      API-ключ
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите API-ключ"
                    />
                  </div>

                  {hasClientId && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Введите Client ID (если требуется)"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setApiKey('');
                      setClientId('');
                    }}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleAddIntegration}
                    disabled={loading || !apiKey.trim()}
                    className="flex-1 tech-button px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Сохранение...' : 'Добавить'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'marketplaces' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                Управление маркетплейсами
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Выберите маркетплейсы, с которыми вы планируете работать. Это поможет настроить интерфейс под ваши потребности.
              </p>
            </div>

            {marketplaceLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <MarketplaceSelector
                key={language}
                selectedMarketplaces={selectedMarketplaces}
                onSelectionChange={saveSelectedMarketplaces}
                title=""
                description=""
                showDescription={false}
                className=""
              />
            )}

            {selectedMarketplaces.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check size={20} />
                  <span className="font-medium">Настройки сохранены</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Выбранные маркетплейсы будут отображаться в интерфейсе приложения
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Команда</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Управление доступом сотрудников</p>
            </div>
            <button
              className="tech-button px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Добавить сотрудника
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Сотрудник</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Добавлен</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {mockEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-800 dark:text-white">{employee.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {employee.addedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">{t('settings.profile')}</h2>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-2xl font-semibold">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{user?.email}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Владелец аккаунта</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 tech-button px-6 py-3 rounded-lg font-medium"
            >
              <LogOut size={20} />
              {t('settings.logout')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="space-y-6">
          <AutoSyncSettings />
        </div>
      )}
    </div>
  );
}
