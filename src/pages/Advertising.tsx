import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Campaign {
  id: string;
  user_id: string;
  marketplace_id?: string;
  name: string;
  budget: number;
  spent: number;
  ctr: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

export function Advertising() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', budget: '' });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.budget || !user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          user_id: user.id,
          name: newCampaign.name,
          budget: parseFloat(newCampaign.budget),
          spent: 0,
          ctr: 0,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      setCampaigns([data, ...campaigns]);
      setNewCampaign({ name: '', budget: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Ошибка при создании кампании');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Удалить кампанию?')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Ошибка при удалении кампании');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'paused':
        return 'На паузе';
      case 'completed':
        return 'Завершена';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Реклама</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Управление рекламными кампаниями</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="tech-button px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Создать кампанию
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Общий бюджет</span>
            <TrendingUp className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalBudget.toLocaleString('ru-RU')} ₽</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Потрачено</span>
            <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalSpent.toLocaleString('ru-RU')} ₽</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 dark:text-slate-400 text-sm">Активных кампаний</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{activeCampaigns}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Plus className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Нет рекламных кампаний</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Создайте первую кампанию для отслеживания рекламы</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="tech-button px-6 py-2 rounded-lg font-medium"
          >
            Создать кампанию
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Бюджет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Потрачено
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 dark:text-white">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {Number(campaign.budget || 0).toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-400">
                      {Number(campaign.spent || 0).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {((Number(campaign.spent || 0) / Number(campaign.budget || 1)) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {Number(campaign.ctr || 0).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        {campaign.status === 'active' ? 'Пауза' : 'Запустить'}
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Создать кампанию</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Название кампании
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Осенняя распродажа"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Бюджет (₽)
                </label>
                <input
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name || !newCampaign.budget}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
