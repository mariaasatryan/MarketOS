import React, { useState, useEffect } from 'react';
import { autoSyncService, AutoSyncConfig } from '../services/autoSyncService';
import { ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface AutoSyncSettingsProps {
  className?: string;
}

export const AutoSyncSettings: React.FC<AutoSyncSettingsProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<AutoSyncConfig>(autoSyncService.getConfig());
  const [status, setStatus] = useState(autoSyncService.getStatus());

  useEffect(() => {
    const updateStatus = () => {
      setConfig(autoSyncService.getConfig());
      setStatus(autoSyncService.getStatus());
    };

    const interval = setInterval(updateStatus, 1000);
    updateStatus();

    return () => clearInterval(interval);
  }, []);

  const handleToggleEnabled = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    autoSyncService.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const handleIntervalChange = (minutes: number) => {
    const newConfig = { ...config, intervalMinutes: minutes };
    autoSyncService.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Никогда';
    return date.toLocaleString('ru-RU');
  };

  const getNextSyncTime = () => {
    if (!status.nextSync) return 'Неизвестно';
    return status.nextSync.toLocaleString('ru-RU');
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Settings size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Автоматическая синхронизация
        </h3>
      </div>

      <div className="space-y-4">
        {/* Включение/выключение */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Включить автосинхронизацию</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Автоматически синхронизировать данные с маркетплейсами
            </p>
          </div>
          <button
            onClick={handleToggleEnabled}
            className="flex items-center gap-2"
          >
            {config.enabled ? (
              <ToggleRight size={32} className="text-blue-600" />
            ) : (
              <ToggleLeft size={32} className="text-slate-400" />
            )}
          </button>
        </div>

        {/* Интервал синхронизации */}
        {config.enabled && (
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">
              Интервал синхронизации
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 30, 60].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleIntervalChange(minutes)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    config.intervalMinutes === minutes
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {minutes} мин
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Статус */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Статус</p>
              <p className={`font-medium ${status.isRunning ? 'text-green-600' : 'text-yellow-600'}`}>
                {status.isRunning ? 'Активна' : 'Неактивна'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Последняя синхронизация</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {formatTime(status.lastSync)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Следующая синхронизация</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {getNextSyncTime()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Интервал</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {config.intervalMinutes} минут
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoSyncSettings;
