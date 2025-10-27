import { useState, useEffect } from 'react';
import { Plus, ExternalLink, RefreshCw, Trash2, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSheet {
  id: string;
  user_id: string;
  name: string;
  url: string;
  preview_embed_url?: string;
  description?: string;
  last_synced?: string;
  created_at: string;
}

export function Sheets() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSheet, setNewSheet] = useState({ name: '', url: '', description: '' });

  useEffect(() => {
    if (user) {
      loadSheets();
    }
  }, [user]);

  const loadSheets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('google_sheets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSheets(data || []);
    } catch (error) {
      console.error('Error loading sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSheet = async () => {
    if (!newSheet.name || !newSheet.url || !user) return;

    try {
      const { data, error } = await supabase
        .from('google_sheets')
        .insert([{
          user_id: user.id,
          name: newSheet.name,
          url: newSheet.url,
          description: newSheet.description || null,
          preview_embed_url: newSheet.url.replace('/edit', '/preview'),
        }])
        .select()
        .single();

      if (error) throw error;
      setSheets([data, ...sheets]);
      setNewSheet({ name: '', url: '', description: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding sheet:', error);
      alert('Ошибка при добавлении таблицы');
    }
  };

  const handleDeleteSheet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('google_sheets')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      setSheets(sheets.filter(sheet => sheet.id !== id));
    } catch (error) {
      console.error('Error deleting sheet:', error);
      alert('Ошибка при удалении таблицы');
    }
  };

  const handleRefresh = async (id: string) => {
    try {
      const { error } = await supabase
        .from('google_sheets')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      await loadSheets();
    } catch (error) {
      console.error('Error refreshing sheet:', error);
    }
  };

  const formatLastSynced = (dateString?: string) => {
    if (!dateString) return 'Не обновлялась';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Таблицы</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Интеграция с Google Sheets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="tech-button px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Добавить таблицу
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex items-center justify-center">
                  <FileSpreadsheet size={64} className="text-green-600 dark:text-green-400 opacity-40" />
                </div>
                <div className="relative text-center p-4">
                  <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg p-4 inline-block">
                    <FileSpreadsheet size={48} className="text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">Google Sheets</div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">{sheet.name}</h3>
                {sheet.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{sheet.description}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Обновлено: {formatLastSynced(sheet.last_synced)}
                </p>

                <div className="space-y-2">
                  <a
                    href={sheet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                  >
                    <ExternalLink size={16} />
                    Открыть в Google Sheets
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRefresh(sheet.id)}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <RefreshCw size={14} />
                      Обновить
                    </button>
                    <button
                      onClick={() => handleDeleteSheet(sheet.id)}
                      className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div
            onClick={() => setShowAddModal(true)}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-center p-8 min-h-[360px] cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Plus size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Добавить таблицу</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Подключите Google Sheets для<br />быстрого доступа и редактирования
            </p>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Добавить таблицу</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Название в системе</label>
                <input
                  type="text"
                  value={newSheet.name}
                  onChange={(e) => setNewSheet({ ...newSheet, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Прайс-лист WB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ссылка на Google Sheets</label>
                <input
                  type="url"
                  value={newSheet.url}
                  onChange={(e) => setNewSheet({ ...newSheet, url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Вставьте URL таблицы из адресной строки браузера</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Описание (опционально)</label>
                <textarea
                  value={newSheet.description}
                  onChange={(e) => setNewSheet({ ...newSheet, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Краткое описание таблицы"
                />
              </div>

              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-red-300">
                  <strong>Совет:</strong> Убедитесь, что доступ к таблице настроен как «Доступна всем, у кого есть ссылка» для корректного отображения предпросмотра.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleAddSheet}
                disabled={!newSheet.name || !newSheet.url}
                className="flex-1 tech-button px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
