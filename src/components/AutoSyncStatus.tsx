import React, { useState, useEffect } from 'react';
import { autoSyncService, AutoSyncConfig } from '../services/autoSyncService';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface AutoSyncStatusProps {
  className?: string;
}

export const AutoSyncStatus: React.FC<AutoSyncStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState(autoSyncService.getStatus());
  const [config, setConfig] = useState<AutoSyncConfig>(autoSyncService.getConfig());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(autoSyncService.getStatus());
      setConfig(autoSyncService.getConfig());
    };

    // Обновляем статус каждые 30 секунд
    const interval = setInterval(updateStatus, 30000);
    
    // Обновляем статус сразу
    updateStatus();

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Неизвестно';
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    if (status.isRunning) {
      return <CheckCircle size={14} className="text-green-500" />;
    }
    return <AlertCircle size={14} className="text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!config.enabled) {
      return 'Автосинхронизация отключена';
    }
    
    if (status.isRunning) {
      return `Автоматическая синхронизация каждые ${config.intervalMinutes} минут`;
    }
    
    return 'Автосинхронизация неактивна';
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {status.lastSync && (
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Последняя: {formatTime(status.lastSync)}
        </span>
      )}
    </div>
  );
};

export default AutoSyncStatus;
