import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Package, 
  DollarSign, 
  MessageSquare, 
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { automationEngine, AutomationTask, AutomationConfig } from '../services/automationEngine';

interface AutomationDashboardProps {
  className?: string;
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<AutomationConfig>(automationEngine.getConfig());
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [stats, setStats] = useState(automationEngine.getStats());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setTasks(automationEngine.getAllTasks());
      setStats(automationEngine.getStats());
    };

    const interval = setInterval(updateData, 5000);
    updateData();

    return () => clearInterval(interval);
  }, []);

  const handleToggleEngine = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    automationEngine.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const handleConfigChange = (newConfig: Partial<AutomationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    automationEngine.updateConfig(updatedConfig);
    setConfig(updatedConfig);
  };

  const getTaskIcon = (type: AutomationTask['type']) => {
    switch (type) {
      case 'product_sync': return <Package size={16} />;
      case 'price_optimization': return <DollarSign size={16} />;
      case 'analytics': return <BarChart3 size={16} />;
      case 'advertising': return <TrendingUp size={16} />;
      case 'reviews': return <MessageSquare size={16} />;
      case 'orders': return <ShoppingCart size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getTaskTypeName = (type: AutomationTask['type']) => {
    switch (type) {
      case 'product_sync': return 'Синхронизация товаров';
      case 'price_optimization': return 'Оптимизация цен';
      case 'analytics': return 'Аналитика';
      case 'advertising': return 'Реклама';
      case 'reviews': return 'Отзывы';
      case 'orders': return 'Заказы';
      default: return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: AutomationTask['status']) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      case 'running': return <Play size={14} className="text-blue-500" />;
      case 'completed': return <CheckCircle size={14} className="text-green-500" />;
      case 'failed': return <AlertCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} />;
    }
  };

  const getPriorityColor = (priority: AutomationTask['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Автоматизация маркетплейсов
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Управление автоматическими процессами
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleEngine}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              config.enabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400'
            }`}
          >
            {config.enabled ? (
              <>
                <Pause size={16} className="inline mr-2" />
                Остановить
              </>
            ) : (
              <>
                <Play size={16} className="inline mr-2" />
                Запустить
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
            Настройки автоматизации
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Интервал выполнения (минуты)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={config.intervalMinutes}
                onChange={(e) => handleConfigChange({ intervalMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Максимум одновременных задач
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxConcurrentTasks}
                onChange={(e) => handleConfigChange({ maxConcurrentTasks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Попытки повтора
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={config.retryAttempts}
                onChange={(e) => handleConfigChange({ retryAttempts: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Таймаут (минуты)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={config.timeoutMinutes}
                onChange={(e) => handleConfigChange({ timeoutMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Всего задач</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Ожидают</div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.running}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Выполняются</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          <div className="text-sm text-green-600 dark:text-green-400">Завершены</div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
          <div className="text-sm text-red-600 dark:text-red-400">Ошибки</div>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-white">
            История задач
          </h3>
          <button
            onClick={() => automationEngine.clearCompletedTasks()}
            className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Очистить завершенные
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Нет задач для отображения
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getTaskIcon(task.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 dark:text-white">
                      {getTaskTypeName(task.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Создано: {formatTime(task.createdAt)}
                    {task.startedAt && (
                      <span className="ml-2">Запущено: {formatTime(task.startedAt)}</span>
                    )}
                    {task.completedAt && (
                      <span className="ml-2">Завершено: {formatTime(task.completedAt)}</span>
                    )}
                  </div>
                  {task.error && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Ошибка: {task.error}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationDashboard;
