import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { RealMarketplaceService } from '../services/realMarketplaceService';

export function APITest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);

  const testAPI = async () => {
    if (!user) return;
    
    setTesting(true);
    setResults(null);
    
    try {
      console.log('🧪 Начинаем тестирование API...');
      
      // Получаем интеграции
      const integrationsData = await marketplaceService.listIntegrations();
      setIntegrations(integrationsData);
      console.log('📋 Интеграции:', integrationsData);
      
      const testResults: any = {
        integrations: integrationsData,
        tests: []
      };
      
      // Тестируем каждую интеграцию
      for (const integration of integrationsData) {
        if (!integration.is_active) continue;
        
        console.log(`🔍 Тестируем ${integration.marketplace}...`);
        
        const integrationTest = {
          marketplace: integration.marketplace,
          status: 'testing',
          results: {
            tokenValidation: null,
            products: null,
            orders: null,
            analytics: null,
            errors: []
          }
        };
        
        try {
          // Тестируем подключение к API
          if (integration.marketplace === 'wildberries') {
            console.log('🔑 Тестируем WB подключение...');
            const connectionTest = await RealMarketplaceService.testWBConnection(integration.api_token);
            integrationTest.results.tokenValidation = {
              success: connectionTest.success,
              message: connectionTest.message,
              status: connectionTest.status,
              timestamp: connectionTest.timestamp
            };
            console.log('🔑 WB подключение:', connectionTest);
          }
          
          // Тестируем товары
          console.log('📦 Тестируем товары...');
          const products = await RealMarketplaceService.getRealProductsData([integration]);
          integrationTest.results.products = {
            count: products.length,
            data: products.slice(0, 3) // Первые 3 товара для примера
          };
          console.log('📦 Товары получены:', products.length);
          
          // Тестируем аналитику
          console.log('📊 Тестируем аналитику...');
          const analytics = await RealMarketplaceService.getRealAnalyticsData([integration]);
          integrationTest.results.analytics = {
            count: analytics.length,
            data: analytics.slice(0, 3) // Последние 3 дня
          };
          console.log('📊 Аналитика получена:', analytics.length);
          
          integrationTest.status = 'success';
          
        } catch (error: any) {
          console.error(`❌ Ошибка тестирования ${integration.marketplace}:`, error);
          integrationTest.status = 'error';
          integrationTest.results.errors.push({
            type: 'api_error',
            message: error.message,
            details: error
          });
        }
        
        testResults.tests.push(integrationTest);
      }
      
      setResults(testResults);
      console.log('✅ Тестирование завершено:', testResults);
      
    } catch (error) {
      console.error('❌ Ошибка тестирования:', error);
      setResults({
        error: 'Ошибка тестирования API',
        details: error
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'testing': return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      default: return <AlertTriangle className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'testing': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Тестирование API</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Проверка работы интеграций с маркетплейсами</p>
        </div>
        <button
          onClick={testAPI}
          disabled={testing}
          className="flex items-center gap-2 tech-button px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={20} className={testing ? 'animate-spin' : ''} />
          {testing ? 'Тестирование...' : 'Запустить тест'}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Общая информация */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Результаты тестирования
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {results.integrations?.length || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Интеграций</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.tests?.filter((t: any) => t.status === 'success').length || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Успешных</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.tests?.filter((t: any) => t.status === 'error').length || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Ошибок</div>
              </div>
            </div>
          </div>

          {/* Детальные результаты */}
          {results.tests?.map((test: any, index: number) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(test.status)}
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                  {test.marketplace.toUpperCase()}
                </h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                  {test.status === 'success' ? 'Успешно' : 
                   test.status === 'error' ? 'Ошибка' : 
                   test.status === 'testing' ? 'Тестирование' : 'Неизвестно'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Токен */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h5 className="font-medium text-slate-800 dark:text-white mb-2">Токен</h5>
                  <div className="flex items-center gap-2">
                    {test.results.tokenValidation !== null ? (
                      test.results.tokenValidation.success ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : (
                        <XCircle className="text-red-500" size={16} />
                      )
                    ) : (
                      <AlertTriangle className="text-yellow-500" size={16} />
                    )}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {test.results.tokenValidation !== null ? (
                        <div>
                          <div className="font-medium">
                            {test.results.tokenValidation.success ? 'Подключение успешно' : 'Ошибка подключения'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {test.results.tokenValidation.message}
                          </div>
                          {test.results.tokenValidation.status && (
                            <div className="text-xs text-slate-500">
                              Статус: {test.results.tokenValidation.status}
                            </div>
                          )}
                        </div>
                      ) : (
                        'Не тестировался'
                      )}
                    </div>
                  </div>
                </div>

                {/* Товары */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h5 className="font-medium text-slate-800 dark:text-white mb-2">Товары</h5>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {test.results.products ? `${test.results.products.count} товаров` : 'Не получены'}
                  </div>
                </div>

                {/* Аналитика */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h5 className="font-medium text-slate-800 dark:text-white mb-2">Аналитика</h5>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {test.results.analytics ? `${test.results.analytics.count} записей` : 'Не получена'}
                  </div>
                </div>

                {/* Ошибки */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h5 className="font-medium text-slate-800 dark:text-white mb-2">Ошибки</h5>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {test.results.errors.length > 0 ? `${test.results.errors.length} ошибок` : 'Нет ошибок'}
                  </div>
                </div>
              </div>

              {/* Детали ошибок */}
              {test.results.errors.length > 0 && (
                <div className="mt-4">
                  <h6 className="font-medium text-red-600 dark:text-red-400 mb-2">Детали ошибок:</h6>
                  <div className="space-y-2">
                    {test.results.errors.map((error: any, errorIndex: number) => (
                      <div key={errorIndex} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="text-sm text-red-800 dark:text-red-300">
                          <strong>{error.type}:</strong> {error.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!results && !testing && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <RefreshCw className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Готов к тестированию</h3>
          <p className="text-slate-600 dark:text-slate-400">Нажмите кнопку "Запустить тест" для проверки API</p>
        </div>
      )}
    </div>
  );
}
