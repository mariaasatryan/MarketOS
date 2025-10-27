import { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Star, Eye, ShoppingCart, TrendingUp, Filter, Download } from 'lucide-react';

interface ProductAudit {
  id: string;
  name: string;
  sku: string;
  marketplace: string;
  status: 'good' | 'warning' | 'error';
  score: number;
  issues: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  metrics: {
    views: number;
    clicks: number;
    orders: number;
    conversion: number;
    rating: number;
    reviews: number;
  };
  lastUpdated: string;
}

interface AuditSummary {
  totalProducts: number;
  goodProducts: number;
  warningProducts: number;
  errorProducts: number;
  averageScore: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
}

export default function ProductAudit() {
  const [audits, setAudits] = useState<ProductAudit[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [isAuditing, setIsAuditing] = useState(false);

  const loadAudits = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAudits: ProductAudit[] = [
        {
          id: '1',
          name: 'Смартфон Samsung Galaxy S24',
          sku: 'WB123456789',
          marketplace: 'wildberries',
          status: 'good',
          score: 85,
          issues: [
            {
              type: 'info',
              message: 'Можно добавить больше ключевых слов в описание',
              suggestion: 'Добавьте слова: "новый", "2024", "премиум"'
            }
          ],
          metrics: {
            views: 15000,
            clicks: 480,
            orders: 45,
            conversion: 3.0,
            rating: 4.8,
            reviews: 234
          },
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Наушники Apple AirPods Pro',
          sku: 'OZ987654321',
          marketplace: 'ozon',
          status: 'warning',
          score: 65,
          issues: [
            {
              type: 'warning',
              message: 'Низкая конверсия по сравнению с конкурентами',
              suggestion: 'Улучшите качество фотографий и добавьте видео'
            },
            {
              type: 'info',
              message: 'Можно оптимизировать заголовок',
              suggestion: 'Добавьте бренд в начало заголовка'
            }
          ],
          metrics: {
            views: 8000,
            clicks: 200,
            orders: 12,
            conversion: 1.5,
            rating: 4.6,
            reviews: 89
          },
          lastUpdated: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          name: 'Планшет iPad Air',
          sku: 'YM456789123',
          marketplace: 'ym',
          status: 'error',
          score: 35,
          issues: [
            {
              type: 'critical',
              message: 'Отсутствуют фотографии товара',
              suggestion: 'Добавьте минимум 5 качественных фотографий'
            },
            {
              type: 'critical',
              message: 'Неполное описание товара',
              suggestion: 'Добавьте подробное описание с характеристиками'
            },
            {
              type: 'warning',
              message: 'Низкий рейтинг товара',
              suggestion: 'Проанализируйте отзывы и улучшите качество'
            }
          ],
          metrics: {
            views: 3000,
            clicks: 60,
            orders: 2,
            conversion: 0.7,
            rating: 3.2,
            reviews: 12
          },
          lastUpdated: '2024-01-15T08:45:00Z'
        }
      ];
      
      const mockSummary: AuditSummary = {
        totalProducts: 3,
        goodProducts: 1,
        warningProducts: 1,
        errorProducts: 1,
        averageScore: 62,
        criticalIssues: 2,
        warningIssues: 2,
        infoIssues: 2
      };
      
      setAudits(mockAudits);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Ошибка загрузки аудитов:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      // Имитация запуска аудита
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadAudits();
    } catch (error) {
      console.error('Ошибка запуска аудита:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <AlertTriangle size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'Хорошо';
      case 'warning':
        return 'Требует внимания';
      case 'error':
        return 'Критические ошибки';
      default:
        return 'Неизвестно';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle size={16} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'info':
        return <CheckCircle size={16} className="text-blue-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    const matchesMarketplace = marketplaceFilter === 'all' || audit.marketplace === marketplaceFilter;
    
    return matchesSearch && matchesStatus && matchesMarketplace;
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Аудит карточек товаров</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Анализ качества и оптимизация карточек</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runAudit}
            disabled={isAuditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isAuditing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Аудирую...
              </>
            ) : (
              <>
                <Search size={16} />
                Запустить аудит
              </>
            )}
          </button>
        </div>
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Search size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Всего товаров</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.totalProducts}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Хорошие</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.goodProducts}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {((summary.goodProducts / summary.totalProducts) * 100).toFixed(0)}%
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Требуют внимания</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.warningProducts}
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                {((summary.warningProducts / summary.totalProducts) * 100).toFixed(0)}%
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Критические</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {summary.errorProducts}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {((summary.errorProducts / summary.totalProducts) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Issues Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Обзор проблем</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle size={24} className="text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">Критические</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{summary.criticalIssues} проблем</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-300">Предупреждения</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">{summary.warningIssues} проблем</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle size={24} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">Рекомендации</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{summary.infoIssues} предложений</p>
                </div>
              </div>
            </div>
          </div>
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
              <option value="good">Хорошие</option>
              <option value="warning">Требуют внимания</option>
              <option value="error">Критические</option>
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
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredAudits.map((audit) => (
          <div key={audit.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{audit.name}</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(audit.status)}`}>
                    {getStatusIcon(audit.status)}
                    {getStatusText(audit.status)}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  SKU: {audit.sku} • {audit.marketplace === 'wildberries' ? 'Wildberries' : 
                      audit.marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    {audit.metrics.views.toLocaleString('ru-RU')}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart size={16} />
                    {audit.metrics.orders}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} />
                    {audit.metrics.conversion}%
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} />
                    {audit.metrics.rating}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                  {audit.score}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">баллов</div>
              </div>
            </div>

            {/* Issues */}
            {audit.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700 dark:text-slate-300">Проблемы и рекомендации:</h4>
                {audit.issues.map((issue, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
                    <div className="flex items-start gap-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 dark:text-white mb-1">{issue.message}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{issue.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAudits.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 text-center">
          <Search size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Товары не найдены</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Попробуйте изменить фильтры или запустить новый аудит
          </p>
        </div>
      )}
    </div>
  );
}
