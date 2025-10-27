import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Package,
  DollarSign,
  Bot,
  ShoppingCart,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { notificationService, NotificationData } from '../services/notificationService';
import { useI18n } from '../contexts/I18nContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState(notificationService.getSettings());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications());

    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return unsubscribe;
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'inventory':
        return <Package size={20} className="text-blue-600" />;
      case 'financial':
        return <DollarSign size={20} className="text-green-600" />;
      case 'ai':
        return <Bot size={20} className="text-purple-600" />;
      case 'marketplace':
        return <ShoppingCart size={20} className="text-orange-600" />;
      default:
        return <Info size={20} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
  };

  const handleNotificationClick = (notification: NotificationData) => {
    handleMarkAsRead(notification.id);
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleSettingsChange = (key: string, value: boolean) => {
    const newSettings = { ...settings };
    
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      (newSettings as any)[parent][child] = value;
    } else {
      (newSettings as any)[key] = value;
    }
    
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {t('notifications.title')}
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/50">
              <h3 className="font-medium text-slate-800 dark:text-white mb-3">{t('notifications.settings')}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('notifications.enable')}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('notifications.sound')}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sound}
                      onChange={(e) => handleSettingsChange('sound', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('notifications.categories')}</h4>
                  {Object.entries(settings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{category}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handleSettingsChange(`categories.${category}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Check size={14} />
                  {t('notifications.markAllAsRead')}
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  {t('notifications.clearAll')}
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bell size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t('notifications.noNotifications')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {t('notifications.noNotificationsDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-slate-800 dark:text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {notification.timestamp.toLocaleString('ru-RU')}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {notification.actionText && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {notification.actionText}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
