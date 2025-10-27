import React from 'react';
import { SyncButton } from './SyncButton';

export const ButtonShowcase: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Демонстрация кнопок синхронизации
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Primary кнопки */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Primary</h3>
          <div className="space-y-3">
            <SyncButton onClick={handleClick} isLoading={loading} size="sm" variant="primary">
              Маленькая
            </SyncButton>
            <SyncButton onClick={handleClick} isLoading={loading} size="md" variant="primary">
              Средняя
            </SyncButton>
            <SyncButton onClick={handleClick} isLoading={loading} size="lg" variant="primary">
              Большая
            </SyncButton>
          </div>
        </div>

        {/* Secondary кнопки */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Secondary</h3>
          <div className="space-y-3">
            <SyncButton onClick={handleClick} isLoading={loading} size="sm" variant="secondary">
              Маленькая
            </SyncButton>
            <SyncButton onClick={handleClick} isLoading={loading} size="md" variant="secondary">
              Средняя
            </SyncButton>
            <SyncButton onClick={handleClick} isLoading={loading} size="lg" variant="secondary">
              Большая
            </SyncButton>
          </div>
        </div>

        {/* Outline кнопки */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Outline</h3>
          <div className="space-y-3">
            <SyncButton onClick={handleClick} isLoading={loading} size="sm" variant="outline">
              Маленькая
            </SyncButton>
            <SyncButton onClick={handleClick} isLoading={loading} size="md" variant="outline">
              Средняя
            </SyncButton>
            <SyncButton onClick={handleClick} isLoading={loading} size="lg" variant="outline">
              Большая
            </SyncButton>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Особенности новых кнопок:
        </h4>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Плавные градиентные переходы (4 секунды)</li>
          <li>• Современные тени и эффекты hover</li>
          <li>• Плавная анимация загрузки</li>
          <li>• Поддержка темной темы</li>
          <li>• Три размера: sm, md, lg</li>
          <li>• Три варианта: primary, secondary, outline</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonShowcase;
