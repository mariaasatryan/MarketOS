import React, { useState } from 'react';
import { SyncButton } from '../components/SyncButton';

export const TestButtons: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
        Тест новых кнопок синхронизации
      </h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Primary кнопки
          </h2>
          <div className="flex gap-4 items-center">
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

        <div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Secondary кнопки
          </h2>
          <div className="flex gap-4 items-center">
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

        <div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Outline кнопки
          </h2>
          <div className="flex gap-4 items-center">
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

      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Инструкции для тестирования:
        </h3>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Наведите курсор на кнопки - они должны подниматься и показывать градиент</li>
          <li>• Нажмите на кнопку - должна появиться анимация загрузки</li>
          <li>• Градиент должен плавно переливаться каждые 4 секунды</li>
          <li>• Кнопки должны иметь современные тени</li>
        </ul>
      </div>
    </div>
  );
};

export default TestButtons;
