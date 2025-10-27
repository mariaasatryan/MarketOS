import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Zap, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  MessageSquare,
  ShoppingCart
} from 'lucide-react';
import { AutomationDashboard } from '../components/AutomationDashboard';
import { automationEngine, AutomationTask } from '../services/automationEngine';

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'settings'>('dashboard');
  const [stats, setStats] = useState(automationEngine.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(automationEngine.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const automationModules = [
    {
      id: 'product_sync',
      name: 'Синхронизация товаров',
      description: 'Автоматическая синхронизация остатков и карточек товаров между маркетплейсами',
      icon: Package,
      color: 'blue',
      enabled: true
    },
    {
      id: 'price_optimization',
      name: 'Оптимизация цен',
      description: 'AI-анализ конкурентов и автоматическая установка оптимальных цен',
      icon: DollarSign,
      color: 'green',
      enabled: true
    },
    {
      id: 'analytics',
      name: 'Аналитика',
      description: 'Автоматический сбор и анализ данных о продажах и метриках',
      icon: BarChart3,
      color: 'purple',
      enabled: true
    },
    {
      id: 'advertising',
      name: 'Реклама',
      description: 'Автоматическая оптимизация рекламных кампаний и ставок',
      icon: TrendingUp,
      color: 'orange',
      enabled: false
    },
    {
      id: 'reviews',
      name: 'Отзывы',
      description: 'Автоматический мониторинг и ответы на отзывы покупателей',
      icon: MessageSquare,
      color: 'pink',
      enabled: false
    },
    {
      id: 'orders',
      name: 'Заказы',
      description: 'Автоматическая обработка заказов и отслеживание статусов',
      icon: ShoppingCart,
      color: 'indigo',
      enabled: false
    }
  ];

  const handleCreateTask = (type: AutomationTask['type']) => {
    automationEngine.addTask({
      type,
      priority: 'medium',
      data: { manual: true }
    });
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
      indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Bot className="text-blue-600" size={32} />
            Автоматизация маркетплейсов
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Управление автоматическими процессами для повышения эффективности работы
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {stats.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Успешность
            </div>
          </div>
          
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Play className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stats.running}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Активные задачи
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stats.completed}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Завершено
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Pause className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stats.pending}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Ожидают
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Settings className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stats.failed}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Ошибки
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Панель управления
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Модули автоматизации
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Настройки
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <AutomationDashboard />
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
              Модули автоматизации
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Управляйте различными автоматическими процессами для оптимизации работы с маркетплейсами
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationModules.map((module) => {
              const IconComponent = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(module.color)}`}>
                      <IconComponent size={20} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                        {module.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.enabled 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {module.enabled ? 'Активен' : 'Неактивен'}
                        </span>
                        
                        <button
                          onClick={() => handleCreateTask(module.id as AutomationTask['type'])}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Запустить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
              Настройки автоматизации
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Настройте параметры работы автоматических процессов
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
              Общие настройки
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    Автоматический запуск
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Автоматически запускать задачи по расписанию
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    Уведомления об ошибках
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Получать уведомления о неудачных задачах
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    Логирование
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Сохранять подробные логи выполнения задач
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
